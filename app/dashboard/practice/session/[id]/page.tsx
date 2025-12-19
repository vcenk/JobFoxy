'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Square,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Loader2,
  Volume2,
  Pause,
  Play,
  X,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { AudioVisualizer } from '@/components/practice/AudioVisualizer'

// --- Types ---

type SessionState = 'loading' | 'question' | 'ai-speaking' | 'thinking' | 'recording' | 'processing' | 'feedback' | 'complete'

interface Question {
  id: string
  question_text: string
  question_type: string
  category: string
  tips?: string[]
  sequence_number: number
}

interface Session {
  id: string
  user_id: string
  resume_id: string | null
  job_description_id: string | null
  session_type: string
  difficulty_level: string
  status: string
  total_questions: number
}

interface STARScore {
  has_situation: boolean
  has_task: boolean
  has_action: boolean
  has_result: boolean
}

interface Feedback {
  transcript: string
  overall_score: number
  clarity_score: number
  relevance_score: number
  impact_score: number
  star: STARScore
  strengths: string[]
  improvements: string[]
  ideal_answer?: string
}

// --- Main Component ---

export default function PracticeSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [state, setState] = useState<SessionState>('loading')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timer, setTimer] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)

  // Audio state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load session and questions
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`/api/practice/session/${sessionId}`)
        const data = await response.json()

        if (data.success && data.session && data.questions) {
          setSession(data.session)
          setQuestions(data.questions.sort((a: Question, b: Question) => a.sequence_number - b.sequence_number))
          setState('question')
        } else {
          setError(data.error || 'Failed to load practice session')
          setState('complete')
        }
      } catch (err) {
        console.error('Failed to load session:', err)
        setError('Failed to load practice session')
        setState('complete')
      }
    }

    if (sessionId && sessionId !== 'undefined') {
      loadSession()
    } else {
      setError('Invalid session ID')
      setState('complete')
    }
  }, [sessionId])

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // --- TTS: Read Question Aloud ---

  const speakQuestion = async (text: string) => {
    try {
      setState('ai-speaking')
      setError(null)

      const response = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setState('thinking')
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setError('Failed to play audio')
        setState('thinking')
      }

      await audio.play()
    } catch (err) {
      console.error('TTS Error:', err)
      setError('Failed to read question aloud')
      setState('thinking')
    }
  }

  // --- Recording Handlers ---

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setState('recording')
      setTimer(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Failed to access microphone. Please grant permission.')
    }
  }

  const pauseRecording = () => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
  }

  const restartRecording = async () => {
    stopRecording(false)
    audioChunksRef.current = []
    setTimer(0)
    await startRecording()
  }

  const stopRecording = (submit: boolean = true): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current

      if (!mediaRecorder) {
        resolve(null)
        return
      }

      if (submit) {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          resolve(audioBlob)

          // Clean up
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop())
          }
        }
      } else {
        // Just stop without returning blob
        resolve(null)
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }

      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    })
  }

  const handleSubmitAnswer = async () => {
    try {
      setState('processing')
      setError(null)

      const audioBlob = await stopRecording(true)

      if (!audioBlob) {
        throw new Error('No audio recorded')
      }

      // Upload audio to STT API
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const sttResponse = await fetch('/api/audio/stt', {
        method: 'POST',
        body: formData,
      })

      const sttData = await sttResponse.json()

      if (!sttData.success || !sttData.transcript) {
        throw new Error(sttData.error || 'Failed to transcribe audio')
      }

      // Score the answer
      const scoreResponse = await fetch('/api/practice/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceQuestionId: currentQuestion.id,
          practiceSessionId: session?.id,
          transcript: sttData.transcript,
          audioDurationSeconds: sttData.duration || timer,
        }),
      })

      const scoreData = await scoreResponse.json()

      if (!scoreData.success) {
        throw new Error(scoreData.error || 'Failed to score answer')
      }

      // Set feedback and show it
      setCurrentFeedback(scoreData.score)
      setState('feedback')
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to submit answer')
      setState('recording')
      setIsRecording(false)
    }
  }

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Complete session
      completeSession()
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setCurrentFeedback(null)
      setState('question')
    }
  }

  const completeSession = async () => {
    try {
      await fetch(`/api/practice/session/${sessionId}/complete`, {
        method: 'POST',
      })
      router.push(`/dashboard/practice/summary?session=${sessionId}`)
    } catch (err) {
      console.error('Failed to complete session:', err)
      router.push('/dashboard/practice')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // --- Render States ---

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (error && state === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Error</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Link
            href="/dashboard/practice"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="glass-panel px-6 py-4 mb-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/practice')}
              className="glass-panel px-3 py-2 hover:bg-white/10 transition-all rounded-xl"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Practice Session</h1>
              <p className="text-sm text-white/60">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-8 h-1.5 rounded-full transition-all ${
                  idx < currentQuestionIndex
                    ? 'bg-green-500'
                    : idx === currentQuestionIndex
                    ? 'bg-purple-500'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Focus Mode */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Question State */}
            {state === 'question' && currentQuestion && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                    {currentQuestion.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
                    {currentQuestion.question_text}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => speakQuestion(currentQuestion.question_text)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
                  >
                    <Volume2 className="w-5 h-5" />
                    Hear Question
                  </button>
                  <button
                    onClick={startRecording}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 glow-button text-white rounded-xl font-medium"
                  >
                    <Mic className="w-5 h-5" />
                    Start Answer
                  </button>
                </div>

                {currentQuestion.tips && currentQuestion.tips.length > 0 && (
                  <div className="glass-panel p-6 text-left max-w-2xl mx-auto">
                    <p className="text-sm font-medium text-purple-300 mb-3">💡 Tips</p>
                    <ul className="space-y-2">
                      {currentQuestion.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-white/70 flex gap-2">
                          <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI Speaking State */}
            {state === 'ai-speaking' && (
              <motion.div
                key="ai-speaking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-8"
              >
                <div className="w-full h-64">
                  <AudioVisualizer mode="ai-speaking" className="rounded-2xl" />
                </div>
                <p className="text-xl text-purple-300 font-medium">AI is reading the question...</p>
              </motion.div>
            )}

            {/* Thinking State */}
            {state === 'thinking' && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-8"
              >
                <h3 className="text-2xl font-bold text-white">Take a moment to think...</h3>
                <p className="text-white/60">When you're ready, click below to start recording</p>
                <button
                  onClick={startRecording}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 glow-button text-white rounded-xl font-medium text-lg"
                >
                  <Mic className="w-6 h-6" />
                  I'm Ready - Start Recording
                </button>
              </motion.div>
            )}

            {/* Recording State */}
            {state === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8"
              >
                <div className="w-full h-64">
                  <AudioVisualizer
                    mode="user-recording"
                    stream={audioStreamRef.current}
                    className="rounded-2xl"
                  />
                </div>

                <div className="text-center space-y-4">
                  <div className="text-5xl font-mono font-bold text-white">{formatTime(timer)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                    <span className="text-white/60">{isPaused ? 'Paused' : 'Recording'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all"
                    >
                      <Play className="w-5 h-5" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={restartRecording}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Restart
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={timer < 3}
                    className="inline-flex items-center gap-2 px-8 py-3 glow-button text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Square className="w-5 h-5" />
                    Done - Submit Answer
                  </button>
                </div>

                {timer < 3 && (
                  <p className="text-sm text-white/50 text-center">
                    Record for at least 3 seconds to submit
                  </p>
                )}
              </motion.div>
            )}

            {/* Processing State */}
            {state === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-8"
              >
                <div className="w-full h-64">
                  <AudioVisualizer mode="processing" className="rounded-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Analyzing your answer...</h3>
                  <p className="text-white/60">Our AI is evaluating your response using the STAR framework</p>
                </div>
              </motion.div>
            )}

            {/* Feedback State */}
            {state === 'feedback' && currentFeedback && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Overall Score */}
                <div className="glass-panel p-8 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
                    <span className="text-4xl font-bold text-white">
                      {Math.round(currentFeedback.overall_score)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Answer Score</h3>
                  <div className="flex gap-4 justify-center text-sm">
                    <div>
                      <span className="text-white/50">Clarity:</span>
                      <span className="text-white font-medium ml-2">{currentFeedback.clarity_score}/100</span>
                    </div>
                    <div>
                      <span className="text-white/50">Relevance:</span>
                      <span className="text-white font-medium ml-2">{currentFeedback.relevance_score}/100</span>
                    </div>
                    <div>
                      <span className="text-white/50">Impact:</span>
                      <span className="text-white font-medium ml-2">{currentFeedback.impact_score}/100</span>
                    </div>
                  </div>
                </div>

                {/* STAR Framework */}
                <div className="glass-panel p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    STAR Framework Analysis
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'has_situation', label: 'Situation', emoji: '📍' },
                      { key: 'has_task', label: 'Task', emoji: '🎯' },
                      { key: 'has_action', label: 'Action', emoji: '⚡' },
                      { key: 'has_result', label: 'Result', emoji: '🏆' },
                    ].map(({ key, label, emoji }) => (
                      <div
                        key={key}
                        className={`p-4 rounded-xl text-center ${
                          currentFeedback.star[key as keyof STARScore]
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-red-500/20 border border-red-500/30'
                        }`}
                      >
                        <div className="text-2xl mb-2">{emoji}</div>
                        <div className="font-medium text-white text-sm">{label}</div>
                        {currentFeedback.star[key as keyof STARScore] ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mt-2" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transcript */}
                <div className="glass-panel p-6">
                  <h4 className="text-lg font-bold text-white mb-3">Your Answer</h4>
                  <p className="text-white/70 leading-relaxed">{currentFeedback.transcript}</p>
                </div>

                {/* Strengths and Improvements */}
                <div className="grid md:grid-cols-2 gap-6">
                  {currentFeedback.strengths && currentFeedback.strengths.length > 0 && (
                    <div className="glass-panel p-6">
                      <h4 className="text-lg font-bold text-green-400 mb-3">✅ Strengths</h4>
                      <ul className="space-y-2">
                        {currentFeedback.strengths.map((strength, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentFeedback.improvements && currentFeedback.improvements.length > 0 && (
                    <div className="glass-panel p-6">
                      <h4 className="text-lg font-bold text-yellow-400 mb-3">💡 Improvements</h4>
                      <ul className="space-y-2">
                        {currentFeedback.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex gap-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Ideal Answer */}
                {currentFeedback.ideal_answer && (
                  <div className="glass-panel p-6 bg-purple-500/10 border border-purple-500/20">
                    <h4 className="text-lg font-bold text-purple-300 mb-3">✨ Example Answer</h4>
                    <p className="text-white/70 leading-relaxed">{currentFeedback.ideal_answer}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-center pt-4">
                  <button
                    onClick={() => {
                      setCurrentFeedback(null)
                      setState('question')
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-8 py-3 glow-button text-white rounded-xl font-medium"
                  >
                    {isLastQuestion ? (
                      <>
                        Complete Session
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && state !== 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-4 bg-red-500/10 border border-red-500/30 mt-6"
            >
              <p className="text-red-300 text-sm text-center">{error}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
