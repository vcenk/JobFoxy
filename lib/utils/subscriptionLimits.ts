// lib/utils/subscriptionLimits.ts
// Dynamic subscription limit fetching from database

import { supabaseAdmin } from '@/lib/clients/supabaseClient'

interface SubscriptionLimits {
  resumeBuilds: number
  jobAnalyses: number
  audioPractice: number
  videoMockInterviews: number | string
  monthlyVideoCredits: number
  starStories: number
  swotAnalyses: number
  gapDefenses: number
  introPitches: number
  analytics: string
}

interface PlanLimits {
  basic: SubscriptionLimits
  pro: SubscriptionLimits
  premium: SubscriptionLimits
}

// In-memory cache for limits (refreshed every 5 minutes)
let cachedLimits: PlanLimits | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch subscription limits from database with caching
 */
export async function getSubscriptionLimits(): Promise<PlanLimits> {
  const now = Date.now()

  // Return cached limits if still valid
  if (cachedLimits && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedLimits
  }

  try {
    const { data: plans, error } = await supabaseAdmin
      .from('subscription_plans')
      .select(`
        tier,
        resume_builds_limit,
        job_analyses_limit,
        audio_practice_sessions_limit,
        video_mock_interviews_limit,
        monthly_video_credits,
        star_stories_limit,
        swot_analyses_limit,
        gap_defenses_limit,
        intro_pitches_limit,
        analytics_level
      `)
      .eq('is_active', true)

    if (error || !plans) {
      console.error('[Subscription Limits] Error fetching from database:', error)
      return getFallbackLimits()
    }

    // Convert array to object keyed by tier
    const limitsMap: any = {}
    plans.forEach((plan) => {
      limitsMap[plan.tier] = {
        resumeBuilds: plan.resume_builds_limit === -1 ? Infinity : plan.resume_builds_limit,
        jobAnalyses: plan.job_analyses_limit === -1 ? Infinity : plan.job_analyses_limit,
        audioPractice: plan.audio_practice_sessions_limit === -1 ? Infinity : plan.audio_practice_sessions_limit,
        videoMockInterviews: plan.video_mock_interviews_limit === 0 ? 'pay-per-use' :
                            plan.video_mock_interviews_limit === -1 ? Infinity :
                            plan.video_mock_interviews_limit,
        monthlyVideoCredits: plan.monthly_video_credits,
        starStories: plan.star_stories_limit === -1 ? Infinity : plan.star_stories_limit,
        swotAnalyses: plan.swot_analyses_limit === -1 ? Infinity : plan.swot_analyses_limit,
        gapDefenses: plan.gap_defenses_limit === -1 ? Infinity : plan.gap_defenses_limit,
        introPitches: plan.intro_pitches_limit === -1 ? Infinity : plan.intro_pitches_limit,
        analytics: plan.analytics_level,
      }
    })

    cachedLimits = limitsMap as PlanLimits
    lastFetchTime = now

    console.log('[Subscription Limits] Refreshed from database')
    return cachedLimits
  } catch (error) {
    console.error('[Subscription Limits] Failed to fetch:', error)
    return getFallbackLimits()
  }
}

/**
 * Get limits for a specific tier
 */
export async function getLimitsForTier(tier: 'basic' | 'pro' | 'premium'): Promise<SubscriptionLimits> {
  const allLimits = await getSubscriptionLimits()
  return allLimits[tier]
}

/**
 * Invalidate cache (call this after updating plans in admin)
 */
export function invalidateLimitsCache() {
  cachedLimits = null
  lastFetchTime = 0
  console.log('[Subscription Limits] Cache invalidated')
}

/**
 * Fallback limits if database fetch fails
 */
function getFallbackLimits(): PlanLimits {
  return {
    basic: {
      resumeBuilds: 1,
      jobAnalyses: 3,
      audioPractice: 1,
      videoMockInterviews: 0,
      monthlyVideoCredits: 0,
      starStories: 1,
      swotAnalyses: 1,
      gapDefenses: 1,
      introPitches: 1,
      analytics: 'basic',
    },
    pro: {
      resumeBuilds: Infinity,
      jobAnalyses: Infinity,
      audioPractice: Infinity,
      videoMockInterviews: 'pay-per-use',
      monthlyVideoCredits: 0,
      starStories: Infinity,
      swotAnalyses: Infinity,
      gapDefenses: Infinity,
      introPitches: Infinity,
      analytics: 'standard',
    },
    premium: {
      resumeBuilds: Infinity,
      jobAnalyses: Infinity,
      audioPractice: Infinity,
      videoMockInterviews: Infinity,
      monthlyVideoCredits: 20,
      starStories: Infinity,
      swotAnalyses: Infinity,
      gapDefenses: Infinity,
      introPitches: Infinity,
      analytics: 'advanced',
    },
  }
}
