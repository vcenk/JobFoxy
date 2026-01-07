'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Mic } from 'lucide-react'
import InterviewRoom from '@/components/mock/InterviewRoom'
import { InterviewPhase } from '@/components/mock/PhaseIndicator'
import { getPersonaByVoiceId } from '@/lib/data/interviewerPersonas'
import { useVoiceActivityDetection } from '@/lib/hooks/useVoiceActivityDetection'

interface InterviewSession {
  id: string
  status: string
  current_phase: InterviewPhase
  current_question_index: number
  total_questions: number
  interviewer_name: string
  interviewer_title: string
  interviewer_voice: string
  interviewer_gender: 'male' | 'female' | 'neutral'
  company_name?: string
  job_title?: string
}

export default function LiveInterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  // State
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Microphone state
  const [micEnabled, setMicEnabled] = useState(false)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  // Conversation state
  const [isAIPlaying, setIsAIPlaying] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [isUserRecording, setIsUserRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [aiAudioLevel, setAiAudioLevel] = useState(0)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const conversationHistoryRef = useRef<{ type: 'ai' | 'user', text: string }[]>([])
  const isRecordingRef = useRef(false)
  const sessionRef = useRef<InterviewSession | null>(null)  // Avoid stale closures

  // Refs for gating - these are checked in callbacks
  const canRecordRef = useRef(false)
  const isAIPlayingRef = useRef(false)
  const isProcessingRef = useRef(false)
  const isAIThinkingRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => {
    isAIPlayingRef.current = isAIPlaying
    isProcessingRef.current = isProcessing
    isAIThinkingRef.current = isAIThinking
    sessionRef.current = session  // Keep session ref synced
    // Can record when: not AI playing, not processing, not thinking, not already recording
    canRecordRef.current = !isAIPlaying && !isAIThinking && !isProcessing && !isRecordingRef.current && session?.current_phase !== 'completed'
    console.log('[Gate] canRecord:', canRecordRef.current, { isAIPlaying, isAIThinking, isProcessing, isRecording: isRecordingRef.current, phase: session?.current_phase })
  }, [isAIPlaying, isAIThinking, isProcessing, session])

  // Get interviewer photo
  const getInterviewerPhoto = () => {
    if (!session) return undefined
    const persona = getPersonaByVoiceId(session.interviewer_voice)
    return persona?.photoUrl
  }

  // VAD speech handlers - check canRecordRef before acting
  const handleSpeechStart = useCallback(() => {
    console.log('[VAD] Speech detected, canRecord:', canRecordRef.current)
    if (canRecordRef.current && !isRecordingRef.current) {
      startRecording()
    }
  }, [])

  const handleSpeechEnd = useCallback(() => {
    console.log('[VAD] Silence detected, isRecording:', isRecordingRef.current)
    if (isRecordingRef.current) {
      setIsFinishing(true)
      setTimeout(() => {
        stopRecording()
        setIsFinishing(false)
      }, 300)
    }
  }, [])

  // VAD hook - runs CONTINUOUSLY once stream is available
  const vad = useVoiceActivityDetection({
    stream: micStream,
    onSpeechStart: handleSpeechStart,
    onSpeechEnd: handleSpeechEnd,
    silenceDelay: 2000,
    baseThreshold: 0.015
  })

  // Enable microphone
  const enableMicrophone = useCallback(async () => {
    console.log('[Mic] Enabling microphone...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('[Mic] ✅ Stream obtained, active:', stream.active)
      micStreamRef.current = stream
      setMicStream(stream)
      setMicEnabled(true)

      // Start interview after short delay for VAD to calibrate
      setTimeout(() => {
        console.log('[Interview] Starting after mic enable...')
        startInterview()
      }, 500)
    } catch (err) {
      console.error('[Mic] ❌ Failed:', err)
      setError('Failed to access microphone.')
    }
  }, [])

  // Load session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`/api/mock/${id}`)
        const data = await response.json()
        if (data.success) {
          setSession(data.data)
        } else {
          setError(data.error || 'Failed to load session')
        }
      } catch (err) {
        console.error('Failed to load session:', err)
        setError('An error occurred')
      } finally {
        setLoading(false)
      }
    }
    loadSession()

    return () => {
      if (micStreamRef.current) {
        console.log('[Mic] Cleanup on unmount')
        micStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [id])

  // Start interview
  const startInterview = async () => {
    try {
      setIsAIThinking(true)
      const response = await fetch(`/api/mock/${id}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'welcome' })
      })
      const data = await response.json()
      if (data.success) {
        conversationHistoryRef.current.push({ type: 'ai', text: data.data.text })
        setIsAIThinking(false)
        await playAudio(data.data.audio)
        if (data.data.phase !== session?.current_phase) {
          setSession(prev => prev ? { ...prev, current_phase: data.data.phase } : null)
        }
      }
    } catch (err) {
      console.error('Failed to start interview:', err)
    } finally {
      setIsAIThinking(false)
    }
  }

  // Play AI audio
  const playAudio = async (audioBase64: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Reset VAD speaking state before AI plays
        vad.resetSpeaking()

        const byteCharacters = atob(audioBase64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(audioBlob)

        if (!audioRef.current) {
          audioRef.current = new Audio()
        }
        audioRef.current.src = audioUrl

        let animationInterval: NodeJS.Timeout | null = null

        audioRef.current.onplay = () => {
          console.log('[Audio] AI speaking started')
          setIsAIPlaying(true)
          animationInterval = setInterval(() => {
            setAiAudioLevel(0.3 + Math.random() * 0.5)
          }, 100)
        }

        audioRef.current.onended = () => {
          console.log('[Audio] AI speaking ended')
          setIsAIPlaying(false)
          setAiAudioLevel(0)
          if (animationInterval) clearInterval(animationInterval)
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        audioRef.current.onerror = (err) => {
          setIsAIPlaying(false)
          setAiAudioLevel(0)
          if (animationInterval) clearInterval(animationInterval)
          reject(err)
        }

        audioRef.current.play()
      } catch (err) {
        console.error('Failed to play audio:', err)
        reject(err)
      }
    })
  }

  // Start recording - uses shared stream
  const startRecording = () => {
    if (isRecordingRef.current || !micStreamRef.current) {
      console.log('[Recording] Skip - already recording or no stream')
      return
    }

    console.log('[Recording] Starting...')
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(micStreamRef.current, { mimeType })
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const totalSize = audioChunksRef.current.reduce((acc, b) => acc + b.size, 0)
        console.log('[Recording] Stopped, size:', totalSize)

        if (totalSize > 1000) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          await transcribeAndRespond(audioBlob)
        } else {
          console.log('[Recording] Too small, ignoring')
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100)
      isRecordingRef.current = true
      setIsUserRecording(true)
      console.log('[Recording] ✅ Started')
    } catch (err) {
      console.error('[Recording] Failed:', err)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      console.log('[Recording] Stopping...')
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      isRecordingRef.current = false
      setIsUserRecording(false)
    }
  }

  // Transcribe and respond
  const transcribeAndRespond = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)
      console.log('[Transcribe] Sending', audioBlob.size, 'bytes...')

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('sessionId', id)
      formData.append('contextType', session?.current_phase || 'other')

      const transcribeRes = await fetch('/api/mock/transcribe', {
        method: 'POST',
        body: formData
      })
      const transcribeData = await transcribeRes.json()

      if (!transcribeData.success || !transcribeData.data.transcript) {
        console.error('[Transcribe] Failed')
        setIsProcessing(false)
        return
      }

      const userTranscript = transcribeData.data.transcript
      console.log('[Transcribe] ✅', userTranscript)
      conversationHistoryRef.current.push({ type: 'user', text: userTranscript })

      // Get current phase from REF (avoids stale closure in async function)
      const currentPhase = sessionRef.current?.current_phase
      console.log('[Action] Determining action for phase:', currentPhase)

      // Determine next action
      let action = ''
      let requestBody: Record<string, unknown> = {}

      if (currentPhase === 'welcome') {
        action = 'small_talk'
      } else if (currentPhase === 'small_talk') {
        action = 'small_talk_response'
        requestBody.userResponse = userTranscript
      } else if (currentPhase === 'company_intro') {
        action = 'question'
      } else if (currentPhase === 'questions') {
        await analyzeAnswer(userTranscript)
        action = 'answer_response'
      } else if (currentPhase === 'wrap_up') {
        action = 'goodbye'
      }

      console.log('[Action] Determined action:', action || '(none)')

      if (!action) {
        console.warn('[Action] No action for phase:', currentPhase)
        setIsProcessing(false)
        return
      }

      // CRITICAL: Set isAIThinking BEFORE clearing isProcessing
      // This ensures the gate stays closed during the transition
      setIsAIThinking(true)
      setIsProcessing(false)
      console.log('[Action] Calling AI speak API, action:', action)

      const speakRes = await fetch(`/api/mock/${id}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...requestBody })
      })
      const speakData = await speakRes.json()

      if (speakData.success && speakData.data.text) {
        conversationHistoryRef.current.push({ type: 'ai', text: speakData.data.text })
        setIsAIThinking(false)
        await playAudio(speakData.data.audio)

        // Update phase from API response OR handle local transitions
        let newPhase = speakData.data.phase

        // Special case: after 'small_talk' action, transition to 'small_talk' phase locally
        // so the next user response triggers 'small_talk_response'
        if (action === 'small_talk' && currentPhase === 'welcome') {
          newPhase = 'small_talk'
          console.log('[Phase] Local transition: welcome → small_talk')
        }

        if (newPhase) {
          setSession(prev => prev ? {
            ...prev,
            current_phase: newPhase,
            current_question_index: speakData.data.metadata?.currentQuestionIndex || prev.current_question_index
          } : null)
          console.log('[Phase] Updated to:', newPhase)
        }

        // Handle automatic next actions (like company_intro → question)
        const nextAction = speakData.data.nextAction
        console.log('[NextAction]:', nextAction)

        if (nextAction === 'company_intro') {
          // Automatically call company intro
          console.log('[Auto] Triggering company_intro...')
          setIsAIThinking(true)
          const introRes = await fetch(`/api/mock/${id}/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'company_intro' })
          })
          const introData = await introRes.json()
          if (introData.success && introData.data.audio) {
            conversationHistoryRef.current.push({ type: 'ai', text: introData.data.text })
            setIsAIThinking(false)
            await playAudio(introData.data.audio)
            if (introData.data.phase) {
              setSession(prev => prev ? { ...prev, current_phase: introData.data.phase } : null)
            }
            // Then automatically ask first question
            if (introData.data.nextAction === 'question') {
              console.log('[Auto] Triggering first question...')
              setIsAIThinking(true)
              const qRes = await fetch(`/api/mock/${id}/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'question' })
              })
              const qData = await qRes.json()
              if (qData.success && qData.data.audio) {
                conversationHistoryRef.current.push({ type: 'ai', text: qData.data.text })
                setIsAIThinking(false)
                await playAudio(qData.data.audio)
              }
            }
          }
        } else if (nextAction === 'question') {
          // Auto-ask next question
          console.log('[Auto] Triggering next question...')
          setIsAIThinking(true)
          const qRes = await fetch(`/api/mock/${id}/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'question' })
          })
          const qData = await qRes.json()
          if (qData.success && qData.data.audio) {
            conversationHistoryRef.current.push({ type: 'ai', text: qData.data.text })
            setIsAIThinking(false)
            await playAudio(qData.data.audio)
          }
        }

        if (nextAction === 'generate_report') {
          await completeInterview()
        }
      }
    } catch (err) {
      console.error('Failed to process:', err)
    } finally {
      setIsProcessing(false)
      setIsAIThinking(false)
    }
  }

  const analyzeAnswer = async (userAnswer: string) => {
    try {
      await fetch(`/api/mock/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIndex: session?.current_question_index,
          userAnswer
        })
      })
    } catch (err) {
      console.error('Failed to analyze:', err)
    }
  }

  const completeInterview = async () => {
    try {
      const response = await fetch(`/api/mock/${id}/complete`, { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        router.push(`/dashboard/mock/${id}/report`)
      }
    } catch (err) {
      console.error('Failed to complete:', err)
    }
  }

  const handleEndInterview = async () => {
    if (!window.confirm('End interview early?')) return

    try {
      if (isRecordingRef.current) stopRecording()
      setIsAIThinking(true)

      const response = await fetch(`/api/mock/${id}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'goodbye', earlyEnd: true })
      })
      const data = await response.json()

      if (data.success && data.data.audio) {
        setIsAIThinking(false)
        await playAudio(data.data.audio)
      }
      await completeInterview()
    } catch (err) {
      console.error('Failed to end:', err)
      router.push(`/dashboard/mock/${id}/report`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !session) {
    return (
      <div className="fixed inset-0 bg-[#0f0f1a] flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/dashboard/mock')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // Enable mic screen
  if (!micEnabled) {
    return (
      <div className="fixed inset-0 bg-[#0f0f1a] flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Ready?</h2>
          <p className="text-gray-400 mb-6">
            Click to enable your microphone and start the interview.
          </p>
          <button
            onClick={enableMicrophone}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl"
          >
            <Mic className="w-5 h-5 inline mr-2" />
            Start Interview
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <InterviewRoom
        interviewerName={session.interviewer_name}
        interviewerTitle={session.interviewer_title}
        interviewerGender={session.interviewer_gender}
        interviewerPhoto={getInterviewerPhoto()}
        companyName={session.company_name}
        isAISpeaking={isAIPlaying}
        isAIThinking={isAIThinking}
        isUserRecording={isUserRecording}
        isProcessing={isProcessing}
        isFinishing={isFinishing}
        aiAudioLevel={aiAudioLevel}
        userAudioLevel={vad.audioLevel}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onEndInterview={handleEndInterview}
      />

      {/* Debug overlay */}
      <div className="fixed bottom-4 left-4 bg-black/80 rounded-lg p-3 text-xs font-mono text-gray-300 z-50">
        <p>VAD: {vad.isActive ? '🟢' : '🔴'} | Speaking: {vad.isSpeaking ? '🎤' : '—'}</p>
        <p>Level: {vad.audioLevel.toFixed(3)} | Thresh: {vad.threshold.toFixed(3)}</p>
        <p>AI: {isAIPlaying ? '🔊' : '—'} | Rec: {isUserRecording ? '🔴' : '—'} | Proc: {isProcessing ? '⏳' : '—'}</p>
        <p>CanRec: {canRecordRef.current ? '✅' : '❌'}</p>
      </div>
    </>
  )
}
