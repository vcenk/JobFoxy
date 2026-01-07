import { NextRequest } from 'next/server'
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse, successResponse } from '@/lib/utils/apiHelpers'
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/clients/stripeClient'
import { SUBSCRIPTION_TIERS } from '@/lib/config/constants'

// Map internal IDs to Stripe Price IDs (Environment Variables)
const STRIPE_PRICES = {
  month: {
    [SUBSCRIPTION_TIERS.PRO]: process.env.STRIPE_PRICE_PRO,
    [SUBSCRIPTION_TIERS.PREMIUM]: process.env.STRIPE_PRICE_PREMIUM,
  },
  year: {
    [SUBSCRIPTION_TIERS.PRO]: process.env.STRIPE_PRICE_PRO_YEARLY,
    [SUBSCRIPTION_TIERS.PREMIUM]: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  },
  // Credit Packs (One-time)
  credits: {
    'starter': process.env.STRIPE_PRICE_CREDIT_STARTER,
    'pro': process.env.STRIPE_PRICE_CREDIT_PRO,
    'founders': process.env.STRIPE_PRICE_CREDIT_FOUNDERS,
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return unauthorizedResponse()

    const body = await req.json()
    const { planId, packId, interval = 'month' } = body // interval: 'month' | 'year'

    if (!planId && !packId) {
      return badRequestResponse('Missing planId or packId')
    }

    let priceId: string | undefined

    if (planId) {
      // Subscription
      // @ts-ignore
      priceId = STRIPE_PRICES[interval]?.[planId]
    } else if (packId) {
      // Credit Pack
      // @ts-ignore
      priceId = STRIPE_PRICES.credits[packId]
    }

    if (!priceId) {
      return badRequestResponse('Invalid plan/pack ID or configuration missing')
    }

    // Determine mode based on input
    const mode = planId ? 'subscription' : 'payment'

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer({
      email: user.email!,
      userId: user.id,
    })

    // Create Metadata to track what was bought
    const metadata = {
      userId: user.id,
      type: mode,
      itemId: planId || packId, // 'pro', 'premium', 'starter', etc.
      interval: planId ? interval : undefined
    }

    // Create Checkout Session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account?canceled=true`,
      metadata,
      mode,
    })

    return successResponse({ url: session.url })

  } catch (error: any) {
    console.error('[Create Checkout Error]:', error)
    return serverErrorResponse(error.message)
  }
}
