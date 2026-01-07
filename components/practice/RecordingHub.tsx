// components/practice/RecordingHub.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, StopCircle, Volume2, RefreshCcw, Loader2, Play, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AudioVisualizer } from './AudioVisualizer'

interface RecordingHubProps {
    sessionPhase: 'intro' | 'ai_greeting' | 'speaking_question' | 'user_answering' | 'processing_answer' | 'session_finished'
    countdown: number
    aiSpeaking: boolean
    currentQuestion: any
    isRecording: boolean
    isSendingAnswer: boolean
    isRegeneratingQuestion: boolean
    audioStream: MediaStream | null
    // NEW: User context for personalized greeting
    userName?: string
    sessionTrack?: string
    jobTitle?: string
    companyName?: string
    totalQuestions?: number
    // NEW: Adaptive difficulty
    currentDifficulty?: 'easy' | 'medium' | 'hard'
    difficultyJustChanged?: boolean
    onStartInterview: () => void
    onToggleRecording: () => void
    onRegenerateQuestion: () => void
    onReturnToDashboard: () => void
}

export function RecordingHub({
    sessionPhase,
    countdown,
    aiSpeaking,
    currentQuestion,
    isRecording,
    isSendingAnswer,
    isRegeneratingQuestion,
    audioStream,
    userName,
    sessionTrack,
    jobTitle,
    companyName,
    totalQuestions,
    currentDifficulty = 'medium',
    difficultyJustChanged = false,
    onStartInterview,
    onToggleRecording,
    onRegenerateQuestion,
    onReturnToDashboard
}: RecordingHubProps) {
    // Difficulty display config
    const difficultyConfig = {
        easy: { label: 'Easy Mode', color: 'bg-emerald-500', textColor: 'text-emerald-400', icon: TrendingDown },
        medium: { label: 'Standard', color: 'bg-blue-500', textColor: 'text-blue-400', icon: Minus },
        hard: { label: 'Challenge', color: 'bg-orange-500', textColor: 'text-orange-400', icon: TrendingUp }
    }
    // Use the question's actual difficulty from DB, fallback to adaptive difficulty state
    const displayDifficulty = (currentQuestion?.difficulty as 'easy' | 'medium' | 'hard') || currentDifficulty
    const diffConfig = difficultyConfig[displayDifficulty] || difficultyConfig.medium
    const DiffIcon = diffConfig.icon

    return (
        <div className="flex flex-col h-full bg-white/5 border border-white/5 rounded-2xl glass-panel relative overflow-hidden">
            {/* Dynamic Background Glow */}
            <div className={`absolute inset-0 transition-all duration-1000 opacity-20 pointer-events-none ${isRecording ? 'bg-red-500/20' : aiSpeaking ? 'bg-purple-500/20' : 'bg-transparent'
                }`} />

            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">

                {/* Phase: Intro */}
                {sessionPhase === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-lg"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
                            <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white">Ready to begin{userName ? `, ${userName}` : ''}?</h3>
                        <p className="text-white/40 mb-8 leading-relaxed">
                            We've tailored a custom set of {sessionTrack || 'interview'} questions{jobTitle ? ` for the ${jobTitle}${companyName ? ` role at ${companyName}` : ' role'}` : ' based on your resume'}. Click start when you're in a quiet place.
                        </p>
                        <button
                            onClick={onStartInterview}
                            className="px-8 py-4 bg-white text-black hover:bg-white/90 rounded-2xl text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            Start Interview
                        </button>
                    </motion.div>
                )}

                {/* Phase: AI Greeting (NEW) */}
                {sessionPhase === 'ai_greeting' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center max-w-xl"
                    >
                        {/* AI Avatar with Speaking Animation */}
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ${aiSpeaking ? 'animate-pulse' : ''}`} />
                            <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center">
                                <Volume2 className={`w-12 h-12 text-purple-400 ${aiSpeaking ? 'animate-bounce' : ''}`} />
                            </div>
                            {/* Speaking Rings */}
                            {aiSpeaking && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 animate-ping" />
                                    <div className="absolute -inset-4 rounded-full border border-purple-500/20 animate-pulse" />
                                </>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-white">
                            {aiSpeaking ? 'Foxy is speaking...' : 'Welcome to your interview!'}
                        </h3>
                        <p className="text-white/40 mb-6 leading-relaxed text-sm">
                            {aiSpeaking
                                ? 'Listen carefully as I explain what we\'ll cover today.'
                                : `${totalQuestions || 5} ${sessionTrack || 'behavioral'} questions tailored just for you.`
                            }
                        </p>

                        {/* Context Cards */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {sessionTrack && (
                                <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300 uppercase tracking-wider">
                                    {sessionTrack} Track
                                </span>
                            )}
                            {jobTitle && (
                                <span className="px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full text-xs font-bold text-pink-300">
                                    {jobTitle}{companyName ? ` @ ${companyName}` : ''}
                                </span>
                            )}
                            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/50">
                                {totalQuestions || 5} Questions
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Phase: Countdown */}
                {sessionPhase === 'speaking_question' && countdown > 0 && (
                    <motion.div
                        key="countdown"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="text-center"
                    >
                        <p className="text-8xl font-black text-white mb-4">{countdown}</p>
                        <p className="text-white/40 uppercase tracking-widest font-bold">Question Starting...</p>
                    </motion.div>
                )}

                {/* Phase: AI Speaking or User Answering */}
                {(sessionPhase === 'speaking_question' || sessionPhase === 'user_answering') && currentQuestion && (
                    <div className="w-full max-w-2xl flex flex-col items-center">

                        {/* AI Status */}
                        <AnimatePresence>
                            {aiSpeaking && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-8"
                                >
                                    <Volume2 className="w-4 h-4 animate-pulse" />
                                    AI Interviewer Speaking
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* The Question */}
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                    {currentQuestion.question_category}
                                </span>
                                {/* Animated Difficulty Badge */}
                                <motion.span
                                    key={displayDifficulty}
                                    initial={difficultyJustChanged ? { scale: 1.3, opacity: 0 } : false}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${difficultyJustChanged
                                        ? `${diffConfig.color} text-white shadow-lg`
                                        : `bg-white/5 border border-white/10 ${diffConfig.textColor}`
                                        }`}
                                >
                                    <DiffIcon className="w-3 h-3" />
                                    {diffConfig.label}
                                </motion.span>
                            </div>
                            <h2 className="text-3xl font-bold text-white leading-tight mb-4 px-4">
                                "{currentQuestion.question_text}"
                            </h2>

                            {!isRecording && !isSendingAnswer && !aiSpeaking && (
                                <button
                                    onClick={onRegenerateQuestion}
                                    disabled={isRegeneratingQuestion}
                                    className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors"
                                >
                                    <RefreshCcw className={`w-3 h-3 ${isRegeneratingQuestion ? 'animate-spin' : ''}`} />
                                    Regenerate Question
                                </button>
                            )}
                        </motion.div>

                        {/* Visualizer Stage */}
                        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                            {/* Decorative Rings */}
                            <div className={`absolute inset-0 rounded-full border border-white/5 transition-all duration-700 ${isRecording ? 'scale-125 opacity-20' : 'scale-100 opacity-100'}`} />
                            <div className={`absolute inset-4 rounded-full border border-white/5 transition-all delay-75 duration-700 ${isRecording ? 'scale-125 opacity-10' : 'scale-100 opacity-100'}`} />

                            <div className="w-full h-full relative z-10 flex items-center justify-center">
                                {isRecording ? (
                                    <AudioVisualizer mode="user-recording" stream={audioStream} className="w-full h-full" />
                                ) : aiSpeaking ? (
                                    <AudioVisualizer mode="ai-speaking" className="w-full h-full" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Mic className="w-12 h-12 text-white/10" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={onToggleRecording}
                                disabled={aiSpeaking || isSendingAnswer}
                                className={`
                    w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                    ${isRecording
                                        ? 'bg-red-500 hover:bg-red-600 ring-8 ring-red-500/20 scale-110'
                                        : 'bg-white text-black hover:scale-110 active:scale-95'}
                    ${(aiSpeaking || isSendingAnswer) ? 'opacity-20 cursor-not-allowed grayscale' : 'opacity-100'}
                  `}
                            >
                                {isRecording ? (
                                    <StopCircle className="w-8 h-8 fill-current" />
                                ) : isSendingAnswer ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : (
                                    <Mic className="w-8 h-8 fill-current" />
                                )}
                            </button>

                            <div className="h-6 flex items-center">
                                <AnimatePresence mode="wait">
                                    {isRecording && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 font-bold text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            REC... Click to end answer
                                        </motion.p>
                                    )}
                                    {!isRecording && !aiSpeaking && !isSendingAnswer && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/40 text-sm font-medium">
                                            Click to start your answer
                                        </motion.p>
                                    )}
                                    {isSendingAnswer && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-purple-400 text-sm font-bold">
                                            AI is analyzing your response...
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}

                {/* Phase: Session Finished */}
                {sessionPhase === 'session_finished' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white">Interview Complete!</h3>
                        <p className="text-white/40 mb-8 max-w-md mx-auto">
                            Great job! Your full analysis report is being generated. You can find detailed feedback and STAR recommendations in your dashboard.
                        </p>
                        <button
                            onClick={onReturnToDashboard}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-lg font-bold transition-all shadow-xl shadow-purple-500/20"
                        >
                            View Full Report
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
