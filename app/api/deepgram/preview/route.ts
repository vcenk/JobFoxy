// app/api/deepgram/preview/route.ts
// Preview Deepgram voice with sample text

import { NextRequest } from 'next/server'
import { env } from '@/lib/config/env'
import { getDeepgramModel } from '@/lib/utils/deepgramHelpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { language = 'en', gender = 'female', style = 'professional' } = body

    const model = getDeepgramModel(language, gender, style)
    const sampleText = getSampleTextForLanguage(language)

    const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.deepgram.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: sampleText }),
    })

    if (!response.ok) {
      throw new Error('Deepgram TTS failed')
    }

    const audioBuffer = await response.arrayBuffer()

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mp3',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('[Voice Preview Error]:', error)
    return Response.json(
      { success: false, error: 'Failed to generate voice preview' },
      { status: 500 }
    )
  }
}

function getSampleTextForLanguage(lang: string): string {
  const samples: Record<string, string> = {
    'en': 'Hello! This is a preview of how I sound during interview practice sessions.',
    'en-GB': 'Hello! This is how I sound with a British accent.',
    'es': 'Hola! Así es como sueno durante las sesiones de práctica.',
    'fr': 'Bonjour! Voici comment je sonne pendant les sessions de pratique.',
    'de': 'Hallo! So klinge ich während der Übungssitzungen.',
    'zh': '你好！这是我在面试练习中的声音。',
    'ja': 'こんにちは！これが面接練習中の私の声です。',
    'ko': '안녕하세요! 면접 연습 중 제 목소리입니다.',
  }

  return samples[lang] || samples['en']
}