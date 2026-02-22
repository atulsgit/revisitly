import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return Response.json(
        { error: 'No billing account found. Please contact support.' },
        { status: 400 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return Response.json({ url: session.url })

  } catch (err) {
    console.error('Billing portal error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}