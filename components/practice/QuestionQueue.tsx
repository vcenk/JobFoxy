// components/practice/QuestionQueue.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface PracticeQuestion {
    id: string
    question_text: string
    question_category: string
    difficulty: string
    practice_answers: any[]
}

interface QuestionQueueProps {
    questions: PracticeQuestion[]
    currentQuestionIndex: number
    expandedQuestionId: string | null
    setExpandedQuestionId: (id: string | null) => void
}

export function QuestionQueue({
    questions,
    currentQuestionIndex,
    expandedQuestionId,
    setExpandedQuestionId
}: QuestionQueueProps) {
    return (
        <div className="flex flex-col h-full bg-white/5 border border-white/5 rounded-2xl overflow-hidden glass-panel">
            <div className="p-4 border-b border-white/5 bg-white/5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider opacity-60">Session Progress</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {questions.map((q, qIndex) => {
                    const answer = q.practice_answers?.[0]
                    const isExpanded = expandedQuestionId === q.id
                    const isAnswered = qIndex < currentQuestionIndex
                    const isCurrent = qIndex === currentQuestionIndex

                    return (
                        <div
                            key={q.id}
                            className={`rounded-xl border transition-all duration-300 ${isCurrent
                                    ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                    : isAnswered
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-white/5 border-transparent opacity-40'
                                }`}
                        >
                            <button
                                onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                className="w-full p-4 text-left flex items-start justify-between gap-3 group"
                                disabled={!isAnswered}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest">
                                        <span className={isCurrent ? 'text-purple-400' : isAnswered ? 'text-emerald-400' : 'text-white/40'}>
                                            Q{qIndex + 1}
                                        </span>
                                        {isAnswered && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                                        {isCurrent && (
                                            <span className="flex h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                                        )}
                                    </div>
                                    <p className={`text-sm leading-snug line-clamp-2 ${isCurrent ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                                        {q.question_text}
                                    </p>
                                    {answer && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                                    style={{ width: `${answer.overall_score}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-mono text-emerald-400">{answer.overall_score}</span>
                                        </div>
                                    )}
                                </div>
                                {isAnswered && (
                                    <div className="mt-5 text-white/20 group-hover:text-white/40 transition-colors">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                )}
                            </button>

                            <AnimatePresence>
                                {isExpanded && answer && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-white/5 p-4 bg-black/20 space-y-3"
                                    >
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Your Transcript</p>
                                            <p className="text-xs text-white/70 italic leading-relaxed">"{answer.transcript}"</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Feedback Summary</p>
                                            <p className="text-xs text-white/80 leading-relaxed">{answer.summary}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {['S', 'T', 'A', 'R'].map(token => {
                                                const isHit = answer.star_analysis?.[token.toLowerCase() === 's' ? 'situation' : token.toLowerCase() === 't' ? 'task' : token.toLowerCase() === 'a' ? 'action' : 'result']
                                                return (
                                                    <div
                                                        key={token}
                                                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border ${isHit
                                                                ? 'bg-purple-600 border-purple-400 text-white shadow-sm shadow-purple-500/20'
                                                                : 'bg-white/5 border-white/5 text-white/20'
                                                            }`}
                                                    >
                                                        {token}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
