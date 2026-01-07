// app/api/public/plans/route.ts
// Public endpoint for fetching active subscription plans (no auth required)

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import { successResponse, serverErrorResponse } from '@/lib/utils/apiHelpers'

// Disable caching for this route to always get fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    // Fetch only active subscription plans for public display
    const { data: plans, error } = await supabaseAdmin
      .from('subscription_plans')
      .select(`
        tier,
        name,
        description,
        price_monthly,
        price_yearly,
        is_active,
        analytics_level,
        display_order,
        badge_text,
        highlight_features
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[Public Plans GET Error]:', error)
      return serverErrorResponse('Failed to fetch subscription plans')
    }

    // Add cache control headers to prevent caching
    const response = successResponse({ plans })
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error('[Public Plans GET Error]:', error)
    return serverErrorResponse()
  }
}
