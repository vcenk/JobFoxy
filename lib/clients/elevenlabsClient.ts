// lib/clients/elevenlabsClient.ts
// ElevenLabs Text-to-Speech Client for Realistic Voice Generation

import { env } from '../config/env'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  description?: string
  labels?: {
    accent?: string
    age?: string
    gender?: string
    use_case?: string
  }
  preview_url?: string
}

export interface TTSConfig {
  voice_id: string
  text: string
  model_id?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
    style?: number
    use_speaker_boost?: boolean
  }
  output_format?: string
}

/**
 * Generate speech from text using ElevenLabs TTS
 * Returns audio as ArrayBuffer
 */
export async function textToSpeech(config: TTSConfig): Promise<ArrayBuffer> {
  const {
    voice_id,
    text,
    model_id = 'eleven_turbo_v2_5', // Fast model for conversations
    voice_settings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    },
    output_format = 'mp3_44100_128'
  } = config

  try {
    console.log('[ElevenLabs] Generating speech...')
    console.log('[ElevenLabs] Voice ID:', voice_id)
    console.log('[ElevenLabs] Text length:', text.length, 'characters')
    console.log('[ElevenLabs] Model:', model_id)

    const url = `${ELEVENLABS_API_URL}/text-to-speech/${voice_id}/stream`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': env.elevenlabs.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings,
        output_format,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ElevenLabs TTS Error]:', response.status, errorText)
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${errorText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('[ElevenLabs] ✅ Audio generated:', arrayBuffer.byteLength, 'bytes')

    return arrayBuffer
  } catch (error: any) {
    console.error('[ElevenLabs TTS Error]:', error)
    throw new Error(`Failed to generate speech: ${error.message}`)
  }
}

/**
 * Get list of available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  try {
    console.log('[ElevenLabs] Fetching available voices...')

    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': env.elevenlabs.apiKey,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ElevenLabs Voices Error]:', response.status, errorText)
      throw new Error(`Failed to fetch voices: ${response.status}`)
    }

    const data = await response.json()
    const voices = data.voices || []

    console.log('[ElevenLabs] ✅ Found', voices.length, 'voices')

    return voices
  } catch (error: any) {
    console.error('[ElevenLabs Voices Error]:', error)
    throw new Error(`Failed to get voices: ${error.message}`)
  }
}

/**
 * Get details for a specific voice
 */
export async function getVoiceDetails(voiceId: string): Promise<ElevenLabsVoice> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': env.elevenlabs.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voice details: ${response.status}`)
    }

    const voice = await response.json()
    return voice
  } catch (error: any) {
    console.error('[ElevenLabs Voice Details Error]:', error)
    throw new Error(`Failed to get voice details: ${error.message}`)
  }
}

/**
 * Estimate audio duration based on text length
 * Average speaking rate: ~150 words per minute
 */
export function estimateAudioDuration(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0).length
  const minutes = words / 150
  return Math.ceil(minutes * 60 * 1000) // Return milliseconds
}

/**
 * Format text with ElevenLabs audio tags for natural speech
 *
 * Available tags:
 * [pause] - Natural pause
 * [thoughtful] - Sound contemplative
 * [awe] - Express surprise/interest
 * [dramatic tone] - Emphasize importance
 * [rushed] - Faster tempo
 * [drawn out] - Slower tempo
 */
export function formatTextWithAudioTags(text: string, options?: {
  addPauses?: boolean
  addFillers?: boolean
  addEmphasis?: boolean
}): string {
  let formatted = text

  if (options?.addPauses) {
    // Add pauses after certain punctuation
    formatted = formatted
      .replace(/\.\s+/g, '. [pause] ')
      .replace(/\?\s+/g, '? [pause] ')
      .replace(/!\s+/g, '! [pause] ')
  }

  if (options?.addFillers) {
    // Add natural filler words at sentence beginnings
    const fillers = ['Um,', 'Well,', 'So,', 'Alright,']
    const sentences = formatted.split(/(?<=[.!?])\s+/)

    formatted = sentences.map((sentence, index) => {
      // Randomly add fillers (30% chance)
      if (index > 0 && Math.random() < 0.3) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)]
        return `${filler} ${sentence}`
      }
      return sentence
    }).join(' ')
  }

  if (options?.addEmphasis) {
    // Add emphasis tags to important words (capital words, numbers)
    formatted = formatted.replace(/\b([A-Z][a-z]+|[0-9]+)\b/g, '[dramatic tone]$1')
  }

  return formatted
}

/**
 * Create backchanneling audio (short acknowledgments)
 */
export async function createBackchannel(type: 'acknowledgment' | 'encouragement' | 'thinking', voiceId: string): Promise<ArrayBuffer> {
  const phrases = {
    acknowledgment: ['Mhm', 'Uh-huh', 'I see', 'Okay', 'Got it', 'Right'],
    encouragement: ['Interesting', 'Great', 'Nice', 'That makes sense', 'Good point'],
    thinking: ['Hmm [pause]', 'Let me think [pause]', 'Well [pause]', 'Alright [pause]']
  }

  const phrase = phrases[type][Math.floor(Math.random() * phrases[type].length)]

  return textToSpeech({
    voice_id: voiceId,
    text: phrase,
    model_id: 'eleven_turbo_v2_5', // Fast model
    voice_settings: {
      stability: 0.6,
      similarity_boost: 0.7,
      style: 0.3, // Less expressive for short responses
      use_speaker_boost: false
    }
  })
}

/**
 * Prepare interviewer speech with natural conversational pauses
 * Removes placeholder tags and relies on punctuation for natural flow
 */
export function prepareInterviewerSpeech(text: string, context: {
  isQuestion?: boolean
  isTransition?: boolean
  isBackchannel?: boolean
}): string {
  let prepared = text

  // CRITICAL: Remove all placeholder audio tags that ElevenLabs doesn't support
  // These tags were being read as literal text instead of interpreted
  prepared = prepared.replace(/\s*\[pause\]\s*/g, ' ')
  prepared = prepared.replace(/\s*\[thoughtful\]\s*/g, ' ')
  prepared = prepared.replace(/\s*\[awe\]\s*/g, ' ')
  prepared = prepared.replace(/\s*\[dramatic tone\]\s*/g, ' ')
  prepared = prepared.replace(/\s*\[rushed\]\s*/g, ' ')
  prepared = prepared.replace(/\s*\[drawn out\]\s*/g, ' ')

  // Clean up extra spaces
  prepared = prepared.replace(/\s+/g, ' ').trim()

  // Use punctuation for natural pauses instead of tags
  if (context.isQuestion) {
    // Add a brief pause before questions using a period
    prepared = `. ${prepared}`
  }

  if (context.isTransition) {
    // Transitions get ellipsis for thinking pauses
    const transitions = ['Alright...', 'Okay...', 'So...', 'Well...']
    const transition = transitions[Math.floor(Math.random() * transitions.length)]
    prepared = `${transition} ${prepared}`
  }

  if (context.isBackchannel) {
    // Backchannels are short, keep them simple
    return prepared
  }

  // Add natural pacing with proper punctuation
  // Replace period-space-capital with period-ellipsis for better pacing
  prepared = prepared.replace(/\.\s+([A-Z])/g, '... $1')

  return prepared
}

/**
 * Check if ElevenLabs API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user`, {
      method: 'GET',
      headers: {
        'xi-api-key': env.elevenlabs.apiKey,
      },
    })

    return response.ok
  } catch (error) {
    console.error('[ElevenLabs Health Check Failed]:', error)
    return false
  }
}

/**
 * Get user's subscription info (quota, characters remaining)
 */
export async function getSubscriptionInfo(): Promise<{
  character_count: number
  character_limit: number
  can_extend_character_limit: boolean
  allowed_to_extend_character_limit: boolean
  next_character_count_reset_unix: number
  voice_limit: number
  max_voice_add_edits: number
  voice_add_edit_counter: number
  professional_voice_limit: number
  can_extend_voice_limit: boolean
  can_use_instant_voice_cloning: boolean
  can_use_professional_voice_cloning: boolean
  currency: string
  status: string
  next_invoice: any
  has_open_invoices: boolean
}> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
      method: 'GET',
      headers: {
        'xi-api-key': env.elevenlabs.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('[ElevenLabs Subscription Error]:', error)
    throw new Error(`Failed to get subscription info: ${error.message}`)
  }
}

/**
 * Pre-generate common backchanneling phrases for faster response
 * Call this during initialization to cache audio
 */
export async function preloadBackchannels(voiceId: string): Promise<Map<string, ArrayBuffer>> {
  const backchannels = new Map<string, ArrayBuffer>()

  const phrases = [
    'Mhm',
    'I see',
    'Okay',
    'Got it',
    'Interesting',
    'Right',
    'That makes sense'
  ]

  console.log('[ElevenLabs] Preloading backchannels for voice:', voiceId)

  for (const phrase of phrases) {
    try {
      const audio = await textToSpeech({
        voice_id: voiceId,
        text: phrase,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.7,
          style: 0.3,
          use_speaker_boost: false
        }
      })
      backchannels.set(phrase, audio)
    } catch (error) {
      console.warn(`[ElevenLabs] Failed to preload "${phrase}":`, error)
    }
  }

  console.log('[ElevenLabs] ✅ Preloaded', backchannels.size, 'backchannels')
  return backchannels
}
