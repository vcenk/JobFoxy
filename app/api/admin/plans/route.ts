// app/api/admin/plans/route.ts
// Admin endpoint for managing subscription plans

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/utils/apiHelpers'
import { invalidateLimitsCache } from '@/lib/utils/subscriptionLimits'

// GET - Fetch all subscription plans
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return Response.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    // Fetch all subscription plans
    const { data: plans, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[Admin Plans GET Error]:', error)
      return serverErrorResponse('Failed to fetch subscription plans')
    }

    return successResponse({ plans })
  } catch (error) {
    console.error('[Admin Plans GET Error]:', error)
    return serverErrorResponse()
  }
}

// POST - Create new subscription plan
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return Response.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      tier,
      name,
      description,
      price_monthly,
      price_yearly,
      stripe_price_id_monthly,
      stripe_price_id_yearly,
      is_active,
      resume_builds_limit,
      job_analyses_limit,
      audio_practice_limit,
      video_mock_interviews_limit,
      monthly_video_credits,
      features,
      analytics_level,
      display_order,
      badge_text,
      badge_color,
      highlight_features,
    } = body

    // Validate required fields
    if (!tier || !name || price_monthly === undefined) {
      return badRequestResponse('Missing required fields: tier, name, price_monthly')
    }

    // Insert new plan
    const { data: plan, error } = await supabaseAdmin
      .from('subscription_plans')
      .insert({
        tier,
        name,
        description,
        price_monthly,
        price_yearly,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        is_active,
        resume_builds_limit,
        job_analyses_limit,
        audio_practice_limit,
        video_mock_interviews_limit,
        monthly_video_credits,
        features,
        analytics_level,
        display_order,
        badge_text,
        badge_color,
        highlight_features,
      })
      .select()
      .single()

    if (error) {
      console.error('[Admin Plans POST Error]:', error)
      return serverErrorResponse('Failed to create subscription plan')
    }

    // Invalidate limits cache so new plan is reflected immediately
    invalidateLimitsCache()

    return successResponse({ plan }, 201)
  } catch (error) {
    console.error('[Admin Plans POST Error]:', error)
    return serverErrorResponse()
  }
}

// PUT - Update existing subscription plan
export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return Response.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return badRequestResponse('Missing plan ID')
    }

    // Update plan
    const { data: plan, error } = await supabaseAdmin
      .from('subscription_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin Plans PUT Error]:', error)
      return serverErrorResponse('Failed to update subscription plan')
    }

    // Invalidate limits cache so changes are reflected immediately
    invalidateLimitsCache()

    return successResponse({ plan })
  } catch (error) {
    console.error('[Admin Plans PUT Error]:', error)
    return serverErrorResponse()
  }
}

// DELETE - Delete subscription plan
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return Response.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return badRequestResponse('Missing plan ID')
    }

    // Delete plan
    const { error } = await supabaseAdmin
      .from('subscription_plans')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin Plans DELETE Error]:', error)
      return serverErrorResponse('Failed to delete subscription plan')
    }

    return successResponse({ message: 'Plan deleted successfully' })
  } catch (error) {
    console.error('[Admin Plans DELETE Error]:', error)
    return serverErrorResponse()
  }
}
