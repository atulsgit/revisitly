import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return Response.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.subscription_data?.metadata?.userId
      if (!userId) break

      // Activate the account
      await supabase
        .from('businesses')
        .update({
          plan: 'active',
          stripe_subscription_id: session.subscription,
        })
        .eq('user_id', userId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      if (!userId) break

      const status = sub.status === 'active' ? 'active' : 'inactive'
      await supabase
        .from('businesses')
        .update({ plan: status })
        .eq('user_id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      if (!userId) break

      await supabase
        .from('businesses')
        .update({ plan: 'cancelled' })
        .eq('user_id', userId)
      break
    }
  }

  return Response.json({ received: true })
}