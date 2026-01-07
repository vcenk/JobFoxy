// lib/data/smallTalkTemplates.ts
// Natural Small Talk Templates for Interview Opening

export interface SmallTalkTemplate {
  id: string
  opening: string
  wait_for_user: boolean
  responses: {
    positive: string[]
    neutral: string[]
    negative: string[]
  }
  transition: string
}

// ============================================================================
// SMALL TALK TEMPLATES
// ============================================================================

export const SMALL_TALK_TEMPLATES: SmallTalkTemplate[] = [
  // How are you doing?
  {
    id: 'how_are_you',
    opening: "Hi {name}! How are you doing today?",
    wait_for_user: true,
    responses: {
      positive: [
        "That's great to hear! [pause] Well, thanks for taking the time to chat with me today.",
        "Awesome! [pause] I appreciate you joining me for this conversation.",
        "Wonderful! [pause] I'm glad you're doing well."
      ],
      neutral: [
        "I hear you. [pause] Well, let's make this interview a good part of your day!",
        "Fair enough. [pause] Thanks for making the time anyway.",
        "Gotcha. [pause] Well, hopefully this conversation will be interesting for you."
      ],
      negative: [
        "Oh, I'm sorry to hear that. [pause] Well, hopefully we can turn your day around a bit!",
        "I understand. [pause] Thanks for still making the time to chat despite that.",
        "That's tough. [pause] I appreciate you being here anyway."
      ]
    },
    transition: "So, let's jump in."
  },

  // Day going so far
  {
    id: 'day_going',
    opening: "Hello {name}, good to meet you! [pause] How's your day going so far?",
    wait_for_user: true,
    responses: {
      positive: [
        "That's great! [pause] Love to hear it.",
        "Excellent! [pause] Sounds like you're having a productive day.",
        "Fantastic! [pause] That's the kind of energy I like to see."
      ],
      neutral: [
        "Fair enough. [pause] Pretty standard day then!",
        "I get that. [pause] Some days are just like that.",
        "Sure, [pause] not every day has to be extraordinary."
      ],
      negative: [
        "Oh no, [pause] I hope this conversation can be a highlight at least!",
        "I'm sorry to hear that. [pause] Let's see if we can make this part enjoyable.",
        "That's unfortunate. [pause] Thanks for powering through."
      ]
    },
    transition: "Alright, [pause] let's get started."
  },

  // Location-based
  {
    id: 'location',
    opening: "Hey {name}! Thanks for being here. [pause] Where are you joining from today?",
    wait_for_user: true,
    responses: {
      positive: [
        "Oh nice! [pause] I've heard great things about {location}.",
        "Awesome! [pause] {location} is a great place.",
        "Cool! [pause] I love {location}."
      ],
      neutral: [
        "Gotcha. [pause] Thanks for letting me know.",
        "Okay, great. [pause] Appreciate you sharing that.",
        "Nice. [pause] Good to know where you're based."
      ],
      negative: [
        "Interesting. [pause] Well, I hope the weather treats you better soon!",
        "I see. [pause] Every place has its pros and cons!",
        "Fair enough. [pause] Thanks for sharing anyway."
      ]
    },
    transition: "Alright, [pause] let's dive into the interview."
  },

  // Weekend/week
  {
    id: 'weekend',
    opening: "Hi {name}! [pause] How was your weekend?",
    wait_for_user: true,
    responses: {
      positive: [
        "That sounds amazing! [pause] Glad you got to enjoy it.",
        "Wonderful! [pause] It's always nice to recharge on the weekend.",
        "That's great! [pause] Sounds like you made the most of it."
      ],
      neutral: [
        "Fair enough. [pause] Sometimes the simple weekends are the best!",
        "I hear you. [pause] Rest and relaxation, right?",
        "Sure. [pause] Not every weekend has to be an adventure."
      ],
      negative: [
        "Oh, that's too bad. [pause] Hopefully this week will be better!",
        "I'm sorry to hear that. [pause] Here's to a better week ahead.",
        "That's unfortunate. [pause] Thanks for still showing up today."
      ]
    },
    transition: "Well, [pause] let's get into it."
  },

  // Link/technology check
  {
    id: 'tech_check',
    opening: "Hello {name}! [pause] Did you have any trouble finding the link or joining today?",
    wait_for_user: true,
    responses: {
      positive: [
        "Perfect! [pause] Glad everything worked smoothly.",
        "Excellent! [pause] Technology cooperating is always a good sign.",
        "Great! [pause] That makes things easy for both of us."
      ],
      neutral: [
        "Okay, good. [pause] I appreciate you working through it.",
        "Alright, [pause] glad we're connected now.",
        "Gotcha. [pause] Thanks for persisting."
      ],
      negative: [
        "Oh no, I'm sorry about that! [pause] Well, you made it and that's what matters.",
        "That's frustrating. [pause] Thanks for sticking with it though.",
        "Apologies for the trouble. [pause] Glad you're here now."
      ]
    },
    transition: "Let's begin."
  },

  // Time zone
  {
    id: 'timezone',
    opening: "Hi {name}! [pause] What time is it where you are?",
    wait_for_user: true,
    responses: {
      positive: [
        "Oh, {time}! [pause] That's a good time for a conversation.",
        "Nice! [pause] {time} works well.",
        "Perfect! [pause] Good timing then."
      ],
      neutral: [
        "Gotcha. [pause] Thanks for making the time work.",
        "Okay. [pause] I appreciate you joining at {time}.",
        "I see. [pause] Thanks for adjusting your schedule."
      ],
      negative: [
        "Oh wow, {time}! [pause] I really appreciate you making this work despite the time.",
        "That's early/late! [pause] Thanks so much for being flexible.",
        "Oh my, {time}! [pause] You're dedication is impressive."
      ]
    },
    transition: "Alright, [pause] let's make good use of our time together."
  },

  // Weather (casual)
  {
    id: 'weather',
    opening: "Hey {name}! [pause] How's the weather treating you today?",
    wait_for_user: true,
    responses: {
      positive: [
        "That sounds lovely! [pause] Perfect day for an interview.",
        "Nice! [pause] Good weather always helps with the mood.",
        "Wonderful! [pause] Sounds like a great day."
      ],
      neutral: [
        "Gotcha. [pause] Pretty standard then!",
        "Fair enough. [pause] Just another day!",
        "I see. [pause] Can't complain about normal weather."
      ],
      negative: [
        "Oh no! [pause] Well, hopefully this conversation can be a bright spot in your day.",
        "Yikes! [pause] Sorry to hear that. Stay safe out there!",
        "That's rough. [pause] I hope it clears up soon."
      ]
    },
    transition: "Anyway, [pause] let's focus on the interview."
  },

  // Coffee/beverage
  {
    id: 'beverage',
    opening: "Hi {name}! [pause] Have you had your coffee today?",
    wait_for_user: true,
    responses: {
      positive: [
        "Good call! [pause] Coffee makes everything better.",
        "Smart! [pause] Always good to be caffeinated for these conversations.",
        "Excellent! [pause] Nothing like a good cup to start things off."
      ],
      neutral: [
        "Gotcha. [pause] Some people don't need it!",
        "Fair enough. [pause] Not everyone's a coffee person.",
        "I see. [pause] Whatever works for you!"
      ],
      negative: [
        "Oh no! [pause] Well, I hope you're still feeling sharp anyway!",
        "We'll try to make this energizing even without the caffeine!",
        "Yikes! [pause] Let me know if you need a minute to grab some."
      ]
    },
    transition: "Alright, [pause] let's get started."
  },

  // Remote work setup
  {
    id: 'remote_setup',
    opening: "Hello {name}! [pause] Are you working from home today or in an office?",
    wait_for_user: true,
    responses: {
      positive: [
        "Nice! [pause] {setup} works well for a lot of people.",
        "Great! [pause] Sounds like a good setup.",
        "Perfect! [pause] That's a comfortable way to interview."
      ],
      neutral: [
        "Gotcha. [pause] Whatever works best for you!",
        "Fair enough. [pause] Different setups work for different people.",
        "I see. [pause] Thanks for sharing."
      ],
      negative: [
        "I understand. [pause] Hopefully you have a quiet spot for our chat.",
        "Makes sense. [pause] We'll make this work!",
        "Got it. [pause] Let me know if you need anything."
      ]
    },
    transition: "Let's dive in."
  },

  // Previous interview experience
  {
    id: 'interview_exp',
    opening: "Hi {name}! [pause] Have you been doing a lot of interviews lately?",
    wait_for_user: true,
    responses: {
      positive: [
        "I bet! [pause] Well, hopefully this one stands out as a good one.",
        "That's exciting! [pause] Sounds like you're in demand.",
        "Nice! [pause] It's a good problem to have."
      ],
      neutral: [
        "Fair enough. [pause] This is good practice regardless!",
        "Gotcha. [pause] Well, every interview is good experience.",
        "I see. [pause] Let's make this one count."
      ],
      negative: [
        "No worries! [pause] We'll make this as comfortable as possible.",
        "That's okay! [pause] This is a practice interview, so no pressure.",
        "Totally fine! [pause] Everyone starts somewhere."
      ]
    },
    transition: "Alright, [pause] let's begin."
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get random small talk template
 */
export function getRandomSmallTalk(): SmallTalkTemplate {
  return SMALL_TALK_TEMPLATES[Math.floor(Math.random() * SMALL_TALK_TEMPLATES.length)]
}

/**
 * Get small talk by ID
 */
export function getSmallTalkById(id: string): SmallTalkTemplate | undefined {
  return SMALL_TALK_TEMPLATES.find(t => t.id === id)
}

/**
 * Format small talk opening with user's name
 */
export function formatSmallTalkOpening(template: SmallTalkTemplate, userName: string): string {
  return template.opening.replace(/{name}/g, userName)
}

/**
 * Get appropriate response based on user's sentiment
 * sentiment: 'positive' | 'neutral' | 'negative'
 */
export function getSmallTalkResponse(
  template: SmallTalkTemplate,
  sentiment: 'positive' | 'neutral' | 'negative'
): string {
  const responses = template.responses[sentiment]
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Analyze user response sentiment (simple keyword matching)
 * In production, you could use a sentiment analysis API
 */
export function analyzeSentiment(userResponse: string): 'positive' | 'neutral' | 'negative' {
  const responseLower = userResponse.toLowerCase()

  // Positive keywords
  const positiveWords = [
    'great', 'good', 'excellent', 'awesome', 'wonderful', 'fantastic',
    'amazing', 'perfect', 'nice', 'lovely', 'beautiful', 'happy',
    'excited', 'love', 'best', 'pretty good', 'doing well', 'well', 'fine'
  ]

  // Negative keywords
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'not good', 'not great',
    'tough', 'difficult', 'hard', 'rough', 'challenging', 'struggling',
    'tired', 'exhausted', 'stressed', 'busy', 'overwhelmed', 'sick'
  ]

  // Count positive matches
  const positiveCount = positiveWords.filter(word =>
    responseLower.includes(word)
  ).length

  // Count negative matches
  const negativeCount = negativeWords.filter(word =>
    responseLower.includes(word)
  ).length

  // Determine sentiment
  if (positiveCount > negativeCount) {
    return 'positive'
  } else if (negativeCount > positiveCount) {
    return 'negative'
  } else {
    return 'neutral'
  }
}

/**
 * Get complete small talk exchange
 */
export function generateSmallTalkExchange(userName: string): {
  opening: string
  template: SmallTalkTemplate
} {
  const template = getRandomSmallTalk()
  const opening = formatSmallTalkOpening(template, userName)

  return {
    opening,
    template
  }
}

/**
 * Get transition phrase
 */
export function getTransitionPhrase(template: SmallTalkTemplate): string {
  return template.transition
}

/**
 * Get all small talk IDs (for testing)
 */
export function getAllSmallTalkIds(): string[] {
  return SMALL_TALK_TEMPLATES.map(t => t.id)
}

/**
 * Get weighted random small talk (some are more common than others)
 */
export function getWeightedRandomSmallTalk(): SmallTalkTemplate {
  // More common ones: how_are_you, day_going, location
  const weights = [
    { id: 'how_are_you', weight: 0.25 },
    { id: 'day_going', weight: 0.20 },
    { id: 'location', weight: 0.15 },
    { id: 'weekend', weight: 0.10 },
    { id: 'tech_check', weight: 0.10 },
    { id: 'timezone', weight: 0.05 },
    { id: 'weather', weight: 0.05 },
    { id: 'beverage', weight: 0.05 },
    { id: 'remote_setup', weight: 0.03 },
    { id: 'interview_exp', weight: 0.02 }
  ]

  const random = Math.random()
  let cumulative = 0

  for (const { id, weight } of weights) {
    cumulative += weight
    if (random <= cumulative) {
      return getSmallTalkById(id) || SMALL_TALK_TEMPLATES[0]
    }
  }

  return SMALL_TALK_TEMPLATES[0]
}
