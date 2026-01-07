// app/api/elevenlabs/preview/route.ts
// Generate voice preview for selected ElevenLabs voice

import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/clients/elevenlabsClient'
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/utils/apiHelpers'

/**
 * POST /api/elevenlabs/preview
 *
 * Generate a voice preview sample for the selected voice
 *
 * Request body:
 * - voice_id: string (ElevenLabs voice ID)
 * - text?: string (optional custom text, defaults to sample)
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    const body = await req.json()
    const { voice_id, text } = body

    if (!voice_id) {
      return badRequestResponse('voice_id is required')
    }

    // Default preview text
    const previewText = text || "Hello! I'm excited to be interviewing you today. Let's have a great conversation about your experience and qualifications for this role."

    // Generate audio
    const audioBuffer = await textToSpeech({
      voice_id,
      text: previewText,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    })

    // Convert ArrayBuffer to Buffer for response
    const buffer = Buffer.from(audioBuffer)

    // Return audio as MP3
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[ElevenLabs Preview Error]:', error)
    return serverErrorResponse('Failed to generate voice preview')
  }
}
