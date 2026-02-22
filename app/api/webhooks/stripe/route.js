import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Map Stripe Price IDs to plan names
const PLAN_MAP = {
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID]: 'starter',
  [process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID]: 'growth',
  [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID]: 'pro',
}

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

    // case 'checkout.session.completed': {
    //   const session = event.data.object

    //   // Retrieve full subscription to get price ID
    //   const subscription = await stripe.subscriptions.retrieve(
    //     session.subscription
    //   )

    //   const priceId = subscription.items.data[0].price.id
    //   const planName = PLAN_MAP[priceId] || 'starter'
    //   const userId = subscription.metadata?.userId

    //   if (!userId) break

    //   await supabase
    //     .from('businesses')
    //     .update({
    //       plan: planName,
    //       stripe_subscription_id: session.subscription,
    //     })
    //     .eq('user_id', userId)

    //   break
    // }
// case 'checkout.session.completed': {
//   const session = event.data.object

//   // Retrieve full subscription
//   const subscription = await stripe.subscriptions.retrieve(
//     session.subscription
//   )

//   const priceId = subscription.items.data[0].price.id
//   const planName = PLAN_MAP[priceId] || 'starter'

//   // Try multiple places for userId
//   const userId =
//     session.metadata?.userId ||
//     subscription.metadata?.userId ||
//     null

//   console.log('Webhook userId:', userId)
//   console.log('Webhook planName:', planName)

//   if (!userId) {
//     console.error('No userId found in webhook metadata')
//     break
//   }

//   const { error } = await supabase
//     .from('businesses')
//     .update({
//       plan: planName,
//       stripe_subscription_id: session.subscription,
//     })
//     .eq('user_id', userId)

//   console.log('Supabase update error:', error)
//   break
// }
case 'checkout.session.completed': {
  const session = event.data.object

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription
  )

  const priceId = subscription.items.data[0].price.id
  const planName = PLAN_MAP[priceId] || 'starter'

  // Try userId from metadata first
  let userId =
    session.metadata?.userId ||
    subscription.metadata?.userId ||
    null

  // Fallback — find user by stripe_customer_id
  if (!userId) {
    const { data: biz } = await supabase
      .from('businesses')
      .select('user_id')
      .eq('stripe_customer_id', session.customer)
      .single()
    userId = biz?.user_id
  }

  if (!userId) break

  await supabase
    .from('businesses')
    .update({
      plan: planName,
      stripe_subscription_id: session.subscription,
    })
    .eq('user_id', userId)

  break
}
    case 'customer.subscription.updated': {
      const sub = event.data.object
      const priceId = sub.items.data[0].price.id
      const planName = PLAN_MAP[priceId] || 'starter'
      const userId = sub.metadata?.userId
      if (!userId) break

      await supabase
        .from('businesses')
        .update({ plan: sub.status === 'active' ? planName : 'inactive' })
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