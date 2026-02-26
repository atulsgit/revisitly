import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { businessId, businessName, name, email, phone, service, referral } = await req.json()

    if (!businessId || !name || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Step 1 — upsert global customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .upsert(
        { name, email, phone: phone || null },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (customerError) throw customerError

    // Step 2 — upsert business relationship
    const { data: bcData, error: bcError } = await supabase
      .from('business_customers')
      .upsert(
        {
          customer_id: customerData.id,
          business_id: businessId,
          last_visit: new Date().toISOString().split('T')[0],
          notes: [service && `Service: ${service}`, referral && `Referral: ${referral}`]
            .filter(Boolean).join(' | ') || null,
          service: service || null,
          referral: referral || null,
        },
        { onConflict: 'customer_id,business_id' }
      )
      .select()
      .single()

    if (bcError) throw bcError

    // Get business details
    const { data: business } = await supabase
      .from('businesses')
      .select('google_review_url')
      .eq('id', businessId)
      .single()

    const reviewUrl = business?.google_review_url || '#'

    // Send follow-up email immediately
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `Thanks for visiting ${businessName}! 🌟`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: #0a0a0f; padding: 32px; text-align: center;">
              <h1 style="color: #00e5a0; font-size: 1.6rem; margin: 0;">${businessName}</h1>
            </div>
            <div style="padding: 36px 32px;">
              <h2 style="color: #1a1a2e; font-size: 1.3rem; margin-bottom: 12px;">Hi ${name}! 👋</h2>
              <p style="color: #555; line-height: 1.7; margin-bottom: 16px;">
                Thank you so much for visiting us${service ? ` for your ${service}` : ''}! We truly appreciate your support and hope you had a wonderful experience.
              </p>
              <p style="color: #555; line-height: 1.7; margin-bottom: 28px;">
                If you enjoyed your visit, we'd love it if you could spare 30 seconds to leave us a Google review!
              </p>
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${reviewUrl}" style="background: #00e5a0; color: #000; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 1rem; display: inline-block;">
                  ⭐ Leave a Google Review
                </a>
              </div>
              <p style="color: #555;">Warm regards,<br/><strong>${businessName}</strong></p>
            </div>
            <div style="background: #f5f5f5; padding: 20px 32px; text-align: center;">
              <p style="color: #999; font-size: 0.78rem; margin: 0;">
                You checked in at ${businessName} today.<br/>
                <a href="#" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Update business_customers with follow-up sent
    await supabase
      .from('business_customers')
      .update({
        followup_sent: true,
        followup_sent_at: new Date().toISOString(),
        review_requested: true,
        review_sent_at: new Date().toISOString(),
      })
      .eq('id', bcData.id)

    // Log the email
    await supabase.from('email_log').insert({
      customer_id: bcData.id,
      business_id: businessId,
      type: 'checkin_thankyou',
      status: 'sent',
    })

    return Response.json({ success: true })

  } catch (err) {
    console.error('Check-in error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}