// app/api/elevenlabs/voices/route.ts
// Get available ElevenLabs voices for mock interview configuration

import { NextRequest, NextResponse } from 'next/server'
import { ALL_PERSONAS, FEMALE_PERSONAS, MALE_PERSONAS } from '@/lib/data/interviewerPersonas'

/**
 * GET /api/elevenlabs/voices
 *
 * Returns list of available interviewer voices/personas for mock interviews
 * These are pre-configured personas mapped to ElevenLabs voice IDs
 */
export async function GET(req: NextRequest) {
  try {
    // Return our curated interviewer personas
    // These are already mapped to specific ElevenLabs voice IDs

    const voices = ALL_PERSONAS.map(persona => ({
      voice_id: persona.voice_id,
      name: persona.name,
      gender: persona.gender,
      category: persona.best_for[0] || 'general',
      description: `${persona.personality} - ${persona.voice_characteristics}`,
      labels: {
        accent: persona.voice_characteristics.includes('British') ? 'british' : 'american',
        age: persona.age_range,
        gender: persona.gender,
        use_case: 'interview'
      },
      personality: persona.personality,
      age_range: persona.age_range,
      best_for: persona.best_for,
      default_title: persona.default_title
    }))

    // Return categorized voices
    return NextResponse.json({
      success: true,
      data: {
        all: voices,
        female: voices.filter(v => v.gender === 'female'),
        male: voices.filter(v => v.gender === 'male'),
        total: voices.length
      }
    })
  } catch (error: any) {
    console.error('[ElevenLabs Voices API Error]:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch voices'
    }, { status: 500 })
  }
}
