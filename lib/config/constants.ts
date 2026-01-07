// lib/config/constants.ts - Application constants

export const APP_NAME = 'Job Foxy'
export const APP_DESCRIPTION = 'AI-Powered Interview Preparation Platform'

// Subscription plans
export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',  // Free
  PRO: 'pro',      // $19/mo
  PREMIUM: 'premium' // $49/mo
} as const

export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.BASIC]: {
    resumeBuilds: 1,
    jobAnalyses: 3,
    audioPractice: 1, // Trial session (e.g. 15 min)
    videoMockInterviews: 0, // No direct access
    monthlyVideoCredits: 0,
    avatars: [], // None
    analytics: 'basic',
    languages: ['english'], // Basic voice only
    voiceGenders: ['default'], // 1 default
    voiceStyles: ['professional'], // 1 professional
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    resumeBuilds: Infinity,
    jobAnalyses: Infinity,
    audioPractice: Infinity,
    videoMockInterviews: 'pay-per-use', // Needs credits
    monthlyVideoCredits: 0,
    avatars: ['standard'], // Standard avatars
    analytics: 'standard',
    languages: ['all'], // All 35+
    voiceGenders: ['all'], // All 3
    voiceStyles: ['professional', 'conversational', 'calm'], // 3 styles
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    resumeBuilds: Infinity,
    jobAnalyses: Infinity,
    audioPractice: Infinity,
    videoMockInterviews: Infinity, // Unlimited, or specific number of included sessions
    monthlyVideoCredits: 20, // 4 sessions * 5 credits
    avatars: ['standard', 'premium'], // All avatars
    analytics: 'advanced',
    languages: ['all'],
    voiceGenders: ['all'],
    voiceStyles: ['all'], // All 6 styles
  }
}

export const CREDIT_COSTS = {
  VIDEO_INTERVIEW_SESSION: 5, // 1 session = 5 credits
}

export const CREDIT_PACKS = [
  { id: 'starter', name: 'Starter Pack', credits: 10, price: 12 },
  { id: 'pro', name: 'Pro Pack', credits: 25, price: 25 },
  { id: 'founders', name: 'Founders Pack', credits: 50, price: 45 },
]

// Interview personas
export const INTERVIEW_PERSONAS = [
  {
    id: 'emma-hr',
    name: 'Emma',
    role: 'Senior Recruiter',
    description: 'Warm and encouraging, focuses on cultural fit',
    avatar: '/images/personas/emma.jpg',
  },
  {
    id: 'james-manager',
    name: 'James',
    role: 'Hiring Manager',
    description: 'Direct and results-oriented, asks behavioral questions',
    avatar: '/images/personas/james.jpg',
  },
  {
    id: 'sato-tech',
    name: 'Sato',
    role: 'Tech Lead',
    description: 'Analytical and detail-focused, technical deep-dives',
    avatar: '/images/personas/sato.jpg',
  },
] as const

// Question categories
export const QUESTION_CATEGORIES = {
  BEHAVIORAL: 'behavioral',
  TECHNICAL: 'technical',
  LEADERSHIP: 'leadership',
  CONFLICT: 'conflict',
  CULTURE_FIT: 'culture-fit',
} as const

// STAR components
export const STAR_COMPONENTS = {
  SITUATION: 'situation',
  TASK: 'task',
  ACTION: 'action',
  RESULT: 'result',
} as const

// File upload limits
export const FILE_LIMITS = {
  RESUME_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_RESUME_TYPES: ['.pdf', '.docx', '.doc'],
  AUDIO_MAX_DURATION: 300, // 5 minutes in seconds
}

// API Rate limits (requests per minute)
export const RATE_LIMITS = {
  RESUME_ANALYSIS: 5,
  MOCK_INTERVIEW: 3,
  PRACTICE_SESSION: 10,
  TTS: 20,
  STT: 20,
}

// UI Constants
export const UI = {
  NAVBAR_HEIGHT: 64,
  SIDEBAR_WIDTH: 280,
  MAX_CONTENT_WIDTH: 1200,
}
