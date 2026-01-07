// app/api/deepgram/voices/route.ts
// Get available Deepgram Nova 3 voices and languages

import { NextRequest } from 'next/server'

// Deepgram Nova 3 supports multiple languages with various accents and styles
// Reference: https://developers.deepgram.com/docs/nova-3
const NOVA_3_LANGUAGES = [
  // English variants
  { code: 'en', name: 'English (US)', region: 'US', accents: ['General American', 'Southern', 'Midwestern'] },
  { code: 'en-GB', name: 'English (UK)', region: 'GB', accents: ['British RP', 'Cockney', 'Scottish'] },
  { code: 'en-AU', name: 'English (Australia)', region: 'AU', accents: ['General Australian'] },
  { code: 'en-NZ', name: 'English (New Zealand)', region: 'NZ', accents: ['General NZ'] },
  { code: 'en-IN', name: 'English (India)', region: 'IN', accents: ['Indian English'] },

  // European languages
  { code: 'es', name: 'Spanish (Spain)', region: 'ES', accents: ['Castilian'] },
  { code: 'es-419', name: 'Spanish (Latin America)', region: 'LATAM', accents: ['Mexican', 'Colombian'] },
  { code: 'fr', name: 'French (France)', region: 'FR', accents: ['Parisian'] },
  { code: 'fr-CA', name: 'French (Canada)', region: 'CA', accents: ['Québécois'] },
  { code: 'de', name: 'German', region: 'DE', accents: ['Standard German'] },
  { code: 'de-CH', name: 'German (Switzerland)', region: 'CH', accents: ['Swiss German'] },
  { code: 'it', name: 'Italian', region: 'IT', accents: ['Standard Italian'] },
  { code: 'pt', name: 'Portuguese (Portugal)', region: 'PT', accents: ['European Portuguese'] },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', region: 'BR', accents: ['Brazilian Portuguese'] },
  { code: 'nl', name: 'Dutch', region: 'NL', accents: ['Standard Dutch'] },
  { code: 'pl', name: 'Polish', region: 'PL', accents: ['Standard Polish'] },
  { code: 'ru', name: 'Russian', region: 'RU', accents: ['Standard Russian'] },
  { code: 'uk', name: 'Ukrainian', region: 'UA', accents: ['Standard Ukrainian'] },
  { code: 'sv', name: 'Swedish', region: 'SE', accents: ['Standard Swedish'] },
  { code: 'da', name: 'Danish', region: 'DK', accents: ['Standard Danish'] },
  { code: 'no', name: 'Norwegian', region: 'NO', accents: ['Bokmål'] },
  { code: 'fi', name: 'Finnish', region: 'FI', accents: ['Standard Finnish'] },

  // Asian languages
  { code: 'zh', name: 'Chinese (Mandarin)', region: 'CN', accents: ['Mandarin'] },
  { code: 'zh-TW', name: 'Chinese (Taiwan)', region: 'TW', accents: ['Taiwanese Mandarin'] },
  { code: 'ja', name: 'Japanese', region: 'JP', accents: ['Standard Japanese'] },
  { code: 'ko', name: 'Korean', region: 'KR', accents: ['Standard Korean'] },
  { code: 'hi', name: 'Hindi', region: 'IN', accents: ['Standard Hindi'] },
  { code: 'id', name: 'Indonesian', region: 'ID', accents: ['Standard Indonesian'] },
  { code: 'th', name: 'Thai', region: 'TH', accents: ['Standard Thai'] },
  { code: 'vi', name: 'Vietnamese', region: 'VN', accents: ['Northern Vietnamese'] },

  // Middle Eastern languages
  { code: 'ar', name: 'Arabic', region: 'SA', accents: ['Modern Standard Arabic'] },
  { code: 'tr', name: 'Turkish', region: 'TR', accents: ['Standard Turkish'] },
  { code: 'he', name: 'Hebrew', region: 'IL', accents: ['Modern Hebrew'] },
]

const VOICE_STYLES = [
  { id: 'professional', name: 'Professional', description: 'Clear, formal, business-appropriate', tier: 'basic' },
  { id: 'conversational', name: 'Conversational', description: 'Natural, friendly, casual', tier: 'standard' },
  { id: 'calm', name: 'Calm', description: 'Soothing, steady, relaxed', tier: 'standard' },
  { id: 'authoritative', name: 'Authoritative', description: 'Confident, commanding, expert', tier: 'premium' },
  { id: 'empathetic', name: 'Empathetic', description: 'Warm, understanding, supportive', tier: 'premium' },
  { id: 'energetic', name: 'Energetic', description: 'Enthusiastic, upbeat, dynamic', tier: 'premium' },
]

const VOICE_GENDERS = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'neutral', name: 'Gender Neutral' },
]

export async function GET(req: NextRequest) {
  try {
    return Response.json({
      success: true,
      model: 'nova-3',
      languages: NOVA_3_LANGUAGES,
      styles: VOICE_STYLES,
      genders: VOICE_GENDERS,
      features: {
        realTimeTranscription: true,
        multiLanguageSupport: true,
        accentVariation: true,
        emotionControl: true,
        speedControl: true,
        pitchControl: true,
      }
    })
  } catch (error) {
    console.error('[Deepgram Voices API Error]:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch voice options' },
      { status: 500 }
    )
  }
}
