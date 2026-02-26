import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { businessCustomerId, customerName, customerEmail, businessName, businessId } = await req.json()

    if (!customerEmail || !customerName || !businessName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get business details for review URL
    const { data: business } = await supabase
      .from('businesses')
      .select('google_review_url')
      .eq('id', businessId)
      .single()

    const reviewUrl = business?.google_review_url || '#'

    // Send follow-up email
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: customerEmail,
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
              <h2 style="color: #1a1a2e; font-size: 1.3rem; margin-bottom: 12px;">Hi ${customerName}! 👋</h2>
              <p style="color: #555; line-height: 1.7; margin-bottom: 16px;">
                Thank you so much for visiting us! We truly appreciate your support and hope you had a wonderful experience.
              </p>
              <p style="color: #555; line-height: 1.7; margin-bottom: 28px;">
                If you enjoyed your visit, we'd love it if you could spare 30 seconds to leave us a Google review. It means the world to a small business like ours!
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
                You visited ${businessName} recently.<br/>
                <a href="#" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Update business_customers record
    await supabase
      .from('business_customers')
      .update({
        followup_sent: true,
        followup_sent_at: new Date().toISOString(),
        review_requested: true,
        review_sent_at: new Date().toISOString(),
      })
      .eq('id', businessCustomerId)

    // Log the email
    await supabase.from('email_log').insert({
      customer_id: businessCustomerId,
      business_id: businessId,
      type: 'followup',
      status: 'sent',
    })

    return Response.json({ success: true })

  } catch (err) {
    console.error('Follow-up error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}