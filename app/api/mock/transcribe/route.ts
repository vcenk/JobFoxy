// app/api/mock/transcribe/route.ts
// Transcribe User's Voice Using Deepgram STT

import { NextRequest } from 'next/server'
import { speechToText } from '@/lib/clients/deepgramClient'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
  getAuthUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/utils/apiHelpers'

/**
 * POST /api/mock/transcribe
 *
 * Transcribes user's audio using Deepgram and optionally saves to session
 *
 * Request Body (multipart/form-data):
 * - audio: File (audio blob)
 * - sessionId?: string (optional, saves transcription to session)
 * - contextType?: 'small_talk' | 'answer' | 'question_for_interviewer' | 'other'
 *
 * Response:
 * - transcript: string
 * - metrics: { wpm, filler_count, long_pause_count, confidence, duration }
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorizedResponse()

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const sessionId = formData.get('sessionId') as string | null
    const contextType = formData.get('contextType') as string | null

    if (!audioFile) {
      return badRequestResponse('No audio file provided')
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const mimeType = audioFile.type || 'audio/webm'

    console.log('[Transcribe] Processing audio, size:', buffer.length, 'bytes, type:', mimeType)

    // 1. Transcribe with Deepgram
    const { transcript, words, confidence } = await speechToText({
      audioBuffer: buffer,
      mimeType,
    })

    if (!transcript) {
      return serverErrorResponse('Transcription failed - no text returned')
    }

    console.log('[Transcribe] Transcribed:', transcript.substring(0, 100))

    // 2. Compute Speech Metrics
    const durationSec = words && words.length > 0
      ? (words[words.length - 1].end - words[0].start)
      : 0

    const wpm = durationSec > 0
      ? Math.round((words ? words.length : 0) / (durationSec / 60))
      : 0

    // Count long pauses (> 2 seconds)
    let longPauseCount = 0
    if (words && words.length > 1) {
      for (let i = 1; i < words.length; i++) {
        const gap = words[i].start - words[i - 1].end
        if (gap > 2.0) longPauseCount++
      }
    }

    // Count filler words
    const fillersList = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'kind of', 'sort of']
    let fillerCount = 0
    if (words) {
      words.forEach(w => {
        if (fillersList.includes(w.word.toLowerCase())) fillerCount++
      })
    }

    // Also check for phrases
    const lowerTranscript = transcript.toLowerCase()
    if (lowerTranscript.includes('you know')) fillerCount++
    if (lowerTranscript.includes('kind of')) fillerCount++
    if (lowerTranscript.includes('sort of')) fillerCount++

    const metrics = {
      wpm,
      filler_count: fillerCount,
      long_pause_count: longPauseCount,
      confidence,
      duration_seconds: durationSec,
      word_count: words?.length || 0
    }

    // 3. Save to Session (if sessionId provided)
    if (sessionId) {
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('mock_interview_sessions')
        .select('conversation_history')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (!sessionError && session) {
        // Append transcription to conversation history
        const historyEntry = {
          type: 'user_response',
          contextType: contextType || 'other',
          transcript,
          metrics,
          timestamp: new Date().toISOString()
        }

        await supabaseAdmin
          .from('mock_interview_sessions')
          .update({
            conversation_history: [
              ...(session.conversation_history || []),
              historyEntry
            ]
          })
          .eq('id', sessionId)

        console.log('[Transcribe] Saved to session:', sessionId)
      } else {
        console.warn('[Transcribe] Session not found or access denied:', sessionId)
      }
    }

    return successResponse({
      transcript,
      metrics,
      saved: !!sessionId
    })

  } catch (error) {
    console.error('[Transcribe Error]:', error)
    return serverErrorResponse('Transcription failed')
  }
}
