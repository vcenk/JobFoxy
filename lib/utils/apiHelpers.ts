// lib/utils/apiHelpers.ts
// Helper utilities for API routes

import { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { SUBSCRIPTION_TIERS, TIER_LIMITS, CREDIT_COSTS } from '@/lib/config/constants'
import { getLimitsForTier } from '@/lib/utils/subscriptionLimits'


/**
 * Get authenticated user from request (for API routes)
 */
export async function getAuthUser(req: NextRequest): Promise<User | null> {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  } catch (error) {
    console.error('[Auth Error]:', error)
    return null
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 })
}

/**
 * Create bad request response
 */
export function badRequestResponse(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

/**
 * Create server error response
 */
export function serverErrorResponse(message = 'Internal server error') {
  return Response.json({ error: message }, { status: 500 })
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  fields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = fields.filter((field) => {
    const val = body[field]
    return val === undefined || val === null || val === ''
  })

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return { valid: true }
}

/**
 * Check user's subscription tier
 */
export async function checkSubscriptionTier(userId: string): Promise<typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS]> {
  try {
    const { supabaseAdmin } = await import('@/lib/clients/supabaseClient')

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.error('[Tier Check Error]:', error?.message || 'Profile not found')
      return SUBSCRIPTION_TIERS.BASIC // Default to basic on error
    }

    return profile.subscription_tier as typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS]
  } catch (error) {
    console.error('[Tier Check Error]:', error)
    return SUBSCRIPTION_TIERS.BASIC // Default to basic on error
  }
}

/**
 * Increment a usage counter for a user
 */
export async function incrementUsage(
  userId: string,
  counterName: 'resume_builds_this_month' | 'job_analyses_this_month' | 'audio_practice_sessions_this_month' | 'mock_interviews_this_month' // Add other counters here
) {
  try {
    const { supabaseAdmin } = await import('@/lib/clients/supabaseClient')
    const { error } = await supabaseAdmin.rpc('increment_profile_counter', {
      user_id: userId,
      counter_name: counterName
    })

    if (error) {
      console.error(`[Increment Usage Error for ${counterName}]:`, error);
    }
  } catch (error) {
    console.error(`[Increment Usage Error for ${counterName}]:`, error);
  }
}


/**
 * Track usage of a resource for analytics and billing
 */
export async function trackUsage(params: {
  userId: string;
  resourceType: string;
  resourceCount?: number;
  estimatedCostCents?: number;
  sessionId?: string;
  metadata?: any;
}) {
  try {
    const { supabaseAdmin } = await import('@/lib/clients/supabaseClient');
    const {
      userId,
      resourceType,
      resourceCount = 1,
      estimatedCostCents = 0,
      sessionId,
      metadata
    } = params;

    const { error } = await supabaseAdmin
      .from('usage_tracking')
      .insert({
        user_id: userId,
        resource_type: resourceType,
        resource_count: resourceCount,
        estimated_cost_cents: estimatedCostCents,
        session_id: sessionId,
        metadata: metadata
      });

    if (error) {
      console.error('[Track Usage Error]: Failed to insert usage record', error);
    }
  } catch (error) {
    console.error('[Track Usage Error]:', error);
  }
}

/**
 * Check if user has exceeded usage limits for a specific resource type
 */
export async function checkUsageLimits(
  userId: string,
  resourceType: 'resume_build' | 'job_analysis' | 'audio_practice' | 'video_mock_interview' | 'mock_interview'
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { supabaseAdmin } = await import('@/lib/clients/supabaseClient')
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, subscription_tier, resume_builds_this_month, job_analyses_this_month, audio_practice_sessions_this_month, monthly_video_credits, purchased_video_credits, mock_interviews_this_month')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.error('[Usage Limit Check Error]: Profile not found or error fetching', error);
      return { allowed: false, reason: 'Profile not found. Please log in again.' };
    }

    // Bypass all limits for admin users
    if (profile.is_admin) {
      return { allowed: true };
    }

    const userTier = profile.subscription_tier as typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

    // Fetch limits from database (with caching)
    const limits = await getLimitsForTier(userTier);

    switch (resourceType) {
      case 'resume_build':
        if (limits.resumeBuilds === Infinity) return { allowed: true };
        if (profile.resume_builds_this_month >= limits.resumeBuilds) {
          return { allowed: false, reason: `Basic tier limit (${limits.resumeBuilds}) reached for resume builds. Upgrade to Pro for unlimited.` };
        }
        break;

      case 'job_analysis':
        if (limits.jobAnalyses === Infinity) return { allowed: true };
        if (profile.job_analyses_this_month >= limits.jobAnalyses) {
          return { allowed: false, reason: `Basic tier limit (${limits.jobAnalyses}) reached for job analyses. Upgrade to Pro for unlimited.` };
        }
        break;

      case 'audio_practice':
        if (limits.audioPractice === Infinity) return { allowed: true };
        if (profile.audio_practice_sessions_this_month >= limits.audioPractice) {
          return { allowed: false, reason: `Basic tier limit (${limits.audioPractice}) reached for audio practice. Upgrade to Pro for unlimited.` };
        }
        break;

      case 'mock_interview':
        // Voice-only mock interviews - simpler limit check (no credit system)
        if (limits.audioPractice === Infinity) return { allowed: true }; // Use same limit as audio practice
        const mockLimit = limits.audioPractice || 5; // Default limit of 5 for Basic tier
        if (profile.mock_interviews_this_month >= mockLimit) {
          return { allowed: false, reason: `Limit (${mockLimit}) reached for mock interviews. Upgrade to Pro for unlimited.` };
        }
        break;

      case 'video_mock_interview':
        // Premium tier gets included sessions first
        if (userTier === SUBSCRIPTION_TIERS.PREMIUM && profile.monthly_video_credits >= CREDIT_COSTS.VIDEO_INTERVIEW_SESSION) {
          return { allowed: true }; // Allowed, will consume monthly credits
        }
        // Pro and Premium (after monthly credits) can use purchased credits
        if ((userTier === SUBSCRIPTION_TIERS.PRO || userTier === SUBSCRIPTION_TIERS.PREMIUM) && profile.purchased_video_credits >= CREDIT_COSTS.VIDEO_INTERVIEW_SESSION) {
          return { allowed: true, reason: 'Will consume purchased credits.' }; // Allowed, will consume purchased credits
        }
        
        // If it's pay-per-use but no credits, or Basic tier
        if (limits.videoMockInterviews === 'pay-per-use' && profile.purchased_video_credits < CREDIT_COSTS.VIDEO_INTERVIEW_SESSION) {
          return { allowed: false, reason: 'Insufficient credits for video mock interview. Please purchase a credit pack.' };
        }
        if (userTier === SUBSCRIPTION_TIERS.BASIC) {
           return { allowed: false, reason: 'Video mock interviews are not available on the Basic tier. Upgrade to Pro or Premium.' };
        }
        // Should not reach here if logic above is exhaustive
        break;
    }

    return { allowed: true }; // If no specific limit hit
  } catch (error) {
    console.error('[Usage Limit Check Error]:', error);
    return { allowed: false, reason: 'An unexpected error occurred while checking limits.' };
  }
}

/**
 * Consume video credits for a mock interview
 * Prioritizes monthly credits, then purchased credits.
 * Returns true if credits were successfully consumed, false otherwise.
 */
export async function consumeVideoCredits(userId: string): Promise<{ success: boolean; reason?: string }> {
  try {
    const { supabaseAdmin } = await import('@/lib/clients/supabaseClient');
    const cost = CREDIT_COSTS.VIDEO_INTERVIEW_SESSION;

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, subscription_tier, monthly_video_credits, purchased_video_credits')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('[Consume Credits Error]: Profile not found or error fetching', fetchError);
      return { success: false, reason: 'Failed to retrieve profile. Please try again.' };
    }

    // Bypass credit consumption for admin users
    if (profile.is_admin) {
      return { success: true };
    }

    let updateData: { monthly_video_credits?: number; purchased_video_credits?: number } = {};
    let newMonthlyCredits = profile.monthly_video_credits;
    let newPurchasedCredits = profile.purchased_video_credits;

    // Prioritize monthly credits
    if (profile.monthly_video_credits >= cost) {
      newMonthlyCredits -= cost;
      updateData.monthly_video_credits = newMonthlyCredits;
    } else if (profile.purchased_video_credits >= cost) {
      // If monthly are insufficient, use purchased
      newPurchasedCredits -= cost;
      updateData.purchased_video_credits = newPurchasedCredits;
    } else {
      return { success: false, reason: 'Insufficient video credits.' };
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('[Consume Credits Error]: Failed to update profile credits', updateError);
      return { success: false, reason: 'Failed to update credit balance.' };
    }

    return { success: true };

  } catch (error) {
    console.error('[Consume Credits Error]:', error);
    return { success: false, reason: 'An unexpected error occurred while consuming credits.' };
  }
}
