import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

// Security — only allow Vercel cron or manual trigger with secret
export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { sent30day: 0, sent60day: 0, errors: [] }

  try {
    // ── 30-DAY RE-ENGAGEMENT ──────────────────────────────
    const { data: customers30 } = await supabase
      .from('customers')
      .select('*, businesses(name, google_review_url)')
      .eq('followup_sent', true)
      .eq('rebook_sent', false)
      .not('email', 'is', null)
      .lte('last_visit', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .gte('last_visit', new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    for (const customer of customers30 || []) {
      try {
        await sendRebookEmail(
          customer,
          customer.businesses?.name,
          customer.businesses?.google_review_url,
          30
        )

        await supabase
          .from('customers')
          .update({
            rebook_sent: true,
            rebook_sent_at: new Date().toISOString(),
          })
          .eq('id', customer.id)

        await supabase.from('email_log').insert({
          customer_id: customer.id,
          business_id: customer.business_id,
          type: 'rebook_30day',
          status: 'sent',
        })

        results.sent30day++
      } catch (err) {
        results.errors.push(`30day - ${customer.email}: ${err.message}`)
      }
    }

    // ── 60-DAY RE-ENGAGEMENT ──────────────────────────────
    const { data: customers60 } = await supabase
      .from('customers')
      .select('*, businesses(name, google_review_url)')
      .eq('rebook_sent', true)
      .eq('followup_sent', true)
      .not('email', 'is', null)
      .lte('last_visit', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .gte('last_visit', new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    for (const customer of customers60 || []) {
      try {
        await sendRebookEmail(
          customer,
          customer.businesses?.name,
          customer.businesses?.google_review_url,
          60
        )

        await supabase.from('email_log').insert({
          customer_id: customer.id,
          business_id: customer.business_id,
          type: 'rebook_60day',
          status: 'sent',
        })

        results.sent60day++
      } catch (err) {
        results.errors.push(`60day - ${customer.email}: ${err.message}`)
      }
    }

    console.log('Cron results:', results)
    await supabase.from('cron_log').insert({
  sent_30day: results.sent30day,
  sent_60day: results.sent60day,
  errors: results.errors.length > 0 ? JSON.stringify(results.errors) : null,
  status: results.errors.length > 0 ? 'partial' : 'success'
})
    return Response.json({ success: true, ...results })

  } catch (err) {
    console.error('Cron error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

async function sendRebookEmail(customer, businessName, reviewUrl, days) {
  const subject = days === 30
    ? `We miss you at ${businessName}! 💛`
    : `It's been a while — come back to ${businessName}! 🌟`

  const offer = days === 30
    ? "We'd love to see you again! Book your next visit and mention this email for a special welcome back treat."
    : "It's been 2 months and we miss you! Come back and enjoy an exclusive returning customer offer — just mention this email when you book."

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: customer.email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <div style="background: #0a0a0f; padding: 32px; text-align: center;">
            <h1 style="color: #00e5a0; font-size: 1.6rem; margin: 0;">${businessName}</h1>
          </div>

          <div style="padding: 36px 32px;">
            <h2 style="color: #1a1a2e; font-size: 1.3rem; margin-bottom: 12px;">
              Hi ${customer.name}! ${days === 30 ? '💛' : '🌟'}
            </h2>
            <p style="color: #555; line-height: 1.7; margin-bottom: 16px;">
              It's been about ${days} days since your last visit and we just wanted to say — we miss you!
            </p>
            <p style="color: #555; line-height: 1.7; margin-bottom: 28px;">
              ${offer}
            </p>

            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${reviewUrl || '#'}"
                style="background: #00e5a0; color: #000; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 1rem; display: inline-block;">
                Book My Next Visit →
              </a>
            </div>

            <p style="color: #555; line-height: 1.7;">
              We look forward to seeing you again soon!
            </p>
            <p style="color: #555; margin-top: 8px;">
              Warm regards,<br/>
              <strong>${businessName}</strong>
            </p>
          </div>

          <div style="background: #f5f5f5; padding: 20px 32px; text-align: center;">
            <p style="color: #999; font-size: 0.78rem; margin: 0;">
              You're receiving this because you previously visited ${businessName}.<br/>
              <a href="#" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}