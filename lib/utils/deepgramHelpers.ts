// lib/utils/deepgramHelpers.ts

// Helper function to map user preferences to Deepgram Aura voice model IDs
export function getDeepgramModel(language: string, gender: string, style: string): string {
  // Deepgram Aura Models Mapping
  // Format: aura-[name]-[lang]
  
  // UK English
  if (language === 'en-GB') {
    if (gender === 'male') return 'aura-helios-en' // Calm/Professional Male UK
    return 'aura-athena-en' // Calm/Professional Female UK
  }

  // US English (Default)
  if (gender === 'male') {
    switch (style) {
      case 'conversational': return 'aura-arcas-en'
      case 'calm': return 'aura-perseus-en'
      case 'professional': 
      default: return 'aura-orion-en'
    }
  } else {
    // Female
    switch (style) {
      case 'conversational': return 'aura-luna-en'
      case 'calm': return 'aura-stella-en'
      case 'professional':
      default: return 'aura-asteria-en'
    }
  }
}
