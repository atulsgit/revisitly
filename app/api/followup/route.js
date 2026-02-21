import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { customerId, customerName, customerEmail, businessName } = await req.json()

    // Send the follow-up email
    const { error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Change to your domain once verified
      to: customerEmail,
      subject: `Thank you for visiting ${businessName}! ⭐`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'DM Sans', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: #0a0a0f; padding: 32px; text-align: center;">
              <h1 style="color: #00e5a0; font-size: 1.6rem; margin: 0; letter-spacing: -0.5px;">
                ${businessName}
              </h1>
            </div>

            <!-- Body -->
            <div style="padding: 36px 32px;">
              <h2 style="color: #1a1a2e; font-size: 1.3rem; margin-bottom: 12px;">
                Hi ${customerName}! 👋
              </h2>
              <p style="color: #555; line-height: 1.7; margin-bottom: 20px;">
                Thank you so much for visiting us! We truly appreciate your support and hope you had a wonderful experience.
              </p>
              <p style="color: #555; line-height: 1.7; margin-bottom: 28px;">
                If you enjoyed your visit, we'd love it if you could take 30 seconds to leave us a Google review. It means the world to a small business like ours!
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK" 
                   style="background: #00e5a0; color: #000; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 1rem; display: inline-block;">
                  ⭐ Leave a Google Review
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

            <!-- Footer -->
            <div style="background: #f5f5f5; padding: 20px 32px; text-align: center;">
              <p style="color: #999; font-size: 0.78rem; margin: 0;">
                You're receiving this because you recently visited ${businessName}.<br/>
                <a href="#" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (emailError) throw emailError

    // Update customer record in database
    const { error: dbError } = await supabase
      .from('customers')
      .update({
        followup_sent: true,
        followup_sent_at: new Date().toISOString(),
        review_requested: true,
        review_sent_at: new Date().toISOString(),
      })
      .eq('id', customerId)

    if (dbError) throw dbError

    // Log the email
    await supabase.from('email_log').insert({
      customer_id: customerId,
      type: 'thankyou',
      status: 'sent',
    })

    return Response.json({ success: true })

  } catch (err) {
    console.error('Follow-up error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}