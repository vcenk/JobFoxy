// app/api/billing/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/config/env'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import { CREDIT_PACKS, SUBSCRIPTION_TIERS } from '@/lib/config/constants'

const stripe = new Stripe(env.stripe.secretKey)
const webhookSecret = env.stripe.webhookSecret

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Webhook Error]:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId // Note: Changed from supabase_user_id to match create-checkout logic
  const type = session.metadata?.type
  const itemId = session.metadata?.itemId

  if (!userId) return

  if (type === 'payment' && itemId) {
    // Credit Pack Purchase
    const pack = CREDIT_PACKS.find(p => p.id === itemId)
    if (pack) {
      // Atomic increment for purchased credits
      const { error } = await supabaseAdmin.rpc('increment_profile_counter', {
        user_id: userId,
        counter_name: 'purchased_video_credits',
        value: pack.credits // Ensure RPC supports value param, or loop increment
      })

      if (error) {
         // Fallback if RPC doesn't support value param (our previous migration only supported +1)
         // We need to fetch and update manually or update the RPC.
         // Let's assume we do a fetch-update for safety here unless we update the RPC.
         const { data } = await supabaseAdmin.from('profiles').select('purchased_video_credits').eq('id', userId).single()
         const current = data?.purchased_video_credits || 0
         await supabaseAdmin.from('profiles').update({
           purchased_video_credits: current + pack.credits
         }).eq('id', userId)
      }
      
      // Log purchase
      await supabaseAdmin.from('usage_tracking').insert({
        user_id: userId,
        resource_type: 'credit_purchase',
        resource_count: pack.credits,
        estimated_cost_cents: pack.price * 100,
        metadata: { pack_id: pack.id, session_id: session.id }
      })
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId // Ensure metadata is passed to subscription
  if (!userId) return // Sometimes metadata is on customer, check that if null

  const priceId = subscription.items.data[0].price.id
  let tier: typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS] = SUBSCRIPTION_TIERS.BASIC

  // Map Price ID to Tier
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) tier = SUBSCRIPTION_TIERS.PREMIUM
  else if (priceId === process.env.STRIPE_PRICE_PRO) tier = SUBSCRIPTION_TIERS.PRO

  await supabaseAdmin.from('profiles').update({
    subscription_status: subscription.status,
    subscription_tier: tier,
    subscription_price_id: priceId,
    subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
  }).eq('id', userId)
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // We need to find the user by stripe_customer_id if metadata isn't present
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  
  await supabaseAdmin.from('profiles').update({
    subscription_status: 'canceled',
    subscription_tier: SUBSCRIPTION_TIERS.BASIC, // Revert to basic
    subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
  }).eq('stripe_customer_id', customerId)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Reset monthly allowances on successful billing cycle payment
  if (invoice.billing_reason === 'subscription_cycle') {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const priceId = subscription.items.data[0].price.id
    
    // Find user (via customer ID usually reliable)
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    
    if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
      // Reset monthly video credits for Premium users
      await supabaseAdmin.from('profiles').update({
        monthly_video_credits: 20, // Reset to 20
        // Also reset usage counters? Usually handled by cron, but syncing with billing is cleaner for user
        resume_builds_this_month: 0,
        job_analyses_this_month: 0,
        audio_practice_sessions_this_month: 0
      }).eq('stripe_customer_id', customerId)
    } else {
        // Pro users (reset usage, but 0 video credits)
        await supabaseAdmin.from('profiles').update({
        resume_builds_this_month: 0,
        job_analyses_this_month: 0,
        audio_practice_sessions_this_month: 0
      }).eq('stripe_customer_id', customerId)
    }
  }
}