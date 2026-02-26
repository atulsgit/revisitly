import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { sent30day: 0, sent60day: 0, errors: [] }

  try {
    // ── 30-DAY RE-ENGAGEMENT ──────────────────────────────
    const { data: customers30 } = await supabase
      .from('business_customers')
      .select('*, customers(name, email), businesses(name, google_review_url, website_url, contact_phone)')
      .eq('followup_sent', true)
      .eq('rebook_sent', false)
      .lte('last_visit', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .gte('last_visit', new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    for (const bc of customers30 || []) {
      if (!bc.customers?.email) continue
      try {
        await sendRebookEmail(
          { name: bc.customers.name, email: bc.customers.email },
          bc.businesses?.name,
          bc.businesses?.google_review_url,
          bc.businesses?.website_url,
          bc.businesses?.contact_phone,
          30
        )

        await supabase
          .from('business_customers')
          .update({ rebook_sent: true, rebook_sent_at: new Date().toISOString() })
          .eq('id', bc.id)

        await supabase.from('email_log').insert({
          customer_id: bc.id,
          business_id: bc.business_id,
          type: 'rebook_30day',
          status: 'sent',
        })

        results.sent30day++
      } catch (err) {
        results.errors.push(`30day - ${bc.customers.email}: ${err.message}`)
      }
    }

    // ── 60-DAY RE-ENGAGEMENT ──────────────────────────────
    const { data: customers60 } = await supabase
      .from('business_customers')
      .select('*, customers(name, email), businesses(name, google_review_url, website_url, contact_phone)')
      .eq('followup_sent', true)
      .eq('rebook_sent', true)
      .lte('last_visit', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .gte('last_visit', new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    for (const bc of customers60 || []) {
      if (!bc.customers?.email) continue
      try {
        await sendRebookEmail(
          { name: bc.customers.name, email: bc.customers.email },
          bc.businesses?.name,
          bc.businesses?.google_review_url,
          bc.businesses?.website_url,
          bc.businesses?.contact_phone,
          60
        )

        await supabase.from('email_log').insert({
          customer_id: bc.id,
          business_id: bc.business_id,
          type: 'rebook_60day',
          status: 'sent',
        })

        results.sent60day++
      } catch (err) {
        results.errors.push(`60day - ${bc.customers.email}: ${err.message}`)
      }
    }

    console.log('Cron results:', results)
    return Response.json({ success: true, ...results })

  } catch (err) {
    console.error('Cron error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

async function sendRebookEmail(customer, businessName, reviewUrl, websiteUrl, contactPhone, days) {

  // Smart fallback chain for CTA
  let ctaUrl = '#'
  let ctaLabel = 'Get In Touch'

  if (websiteUrl) {
    ctaUrl = websiteUrl
    ctaLabel = 'Book My Next Visit →'
  } else if (contactPhone) {
    ctaUrl = `tel:${contactPhone.replace(/\D/g, '')}`
    ctaLabel = '📞 Call Us to Book'
  } else if (reviewUrl) {
    ctaUrl = reviewUrl
    ctaLabel = '⭐ Leave Us a Review'
  }

  const subject = days === 30
    ? `We miss you at ${businessName}! 💛`
    : `It's been a while — come back to ${businessName}! 🌟`

  const headline = days === 30
    ? `We Miss You, ${customer.name}! 💛`
    : `It's Been a While, ${customer.name}! 🌟`

  const bodyText = days === 30
    ? `It's been about a month since your last visit and we just wanted to check in. We'd love to see you again soon!`
    : `It's been 2 months since your last visit! We miss having you and would love to welcome you back.`

  const offerText = days === 30
    ? `As a valued customer, mention this email when you visit and we'll make sure you get a little something special. 🎁`
    : `Come back this month and mention this email — we've got an exclusive returning customer offer waiting for you. 🎁`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: customer.email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 40px 20px;">
        <div style="max-width: 540px; margin: 0 auto;">

          <!-- Header -->
          <div style="background: #0a0a0f; border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
            <h1 style="color: #00e5a0; font-size: 1.5rem; margin: 0; font-weight: 800;">
              ${businessName}
            </h1>
          </div>

          <!-- Body -->
          <div style="background: #ffffff; padding: 40px 36px; border-left: 1px solid #e8e8e8; border-right: 1px solid #e8e8e8;">
            <h2 style="color: #1a1a2e; font-size: 1.4rem; font-weight: 700; margin: 0 0 16px;">
              ${headline}
            </h2>
            <p style="color: #555; line-height: 1.75; margin: 0 0 16px; font-size: 0.95rem;">
              ${bodyText}
            </p>
            <p style="color: #555; line-height: 1.75; margin: 0 0 32px; font-size: 0.95rem;">
              ${offerText}
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${ctaUrl}"
                style="display: inline-block; background: #00e5a0; color: #000000; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 1rem;">
                ${ctaLabel}
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 0 0 24px;" />

            <p style="color: #555; line-height: 1.75; margin: 0 0 8px; font-size: 0.92rem;">
              We look forward to seeing you again soon!
            </p>
            <p style="color: #555; margin: 0; font-size: 0.92rem;">
              Warm regards,<br/>
              <strong style="color: #1a1a2e;">${businessName}</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 0 0 16px 16px; padding: 20px 36px; text-align: center;">
            <p style="color: #aaa; font-size: 0.78rem; margin: 0; line-height: 1.6;">
              You're receiving this because you previously visited <strong>${businessName}</strong>.<br/>
              <a href="#" style="color: #aaa; text-decoration: underline;">Unsubscribe</a>
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  })
}