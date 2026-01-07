// components/practice/LiveConsole.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Lightbulb, Mic, Sparkles } from 'lucide-react'

interface LiveConsoleProps {
    userTranscript: string
    isRecording: boolean
    isSendingAnswer: boolean
    lastAnswerFeedback: any | null
}

export function LiveConsole({
    userTranscript,
    isRecording,
    isSendingAnswer,
    lastAnswerFeedback
}: LiveConsoleProps) {
    return (
        <div className="flex flex-col h-full bg-white/5 border border-white/5 rounded-2xl overflow-hidden glass-panel">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider opacity-60">Live Console</h2>
                <Terminal className="w-4 h-4 text-white/20" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                {/* Real-time Transcription Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                        <h3 className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Transcript stream</h3>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 min-h-[160px] font-mono scroll-smooth">
                        <AnimatePresence mode="wait">
                            {isRecording && !userTranscript && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-white/20 text-xs italic"
                                >
                                    $ listening for audio...
                                </motion.p>
                            )}

                            {userTranscript && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-emerald-400 text-xs leading-relaxed"
                                >
                                    <span className="text-emerald-500/50 mr-2">$</span>
                                    {userTranscript}
                                    {isSendingAnswer && <span className="inline-block w-2 h-4 bg-emerald-500/50 animate-pulse ml-1 align-middle" />}
                                </motion.div>
                            )}

                            {!isRecording && !isSendingAnswer && !userTranscript && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-white/10 text-xs"
                                >
                                    $ waiting for next answer...
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* AI Mini Insights Section (Quick snippets) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <h3 className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Live Feedback</h3>
                    </div>

                    <AnimatePresence mode="wait">
                        {lastAnswerFeedback ? (
                            <motion.div
                                key={lastAnswerFeedback.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                {/* Score Snippet */}
                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-purple-300 font-bold uppercase">Performance</span>
                                        <span className="text-lg font-bold text-white">{lastAnswerFeedback.overall_score}%</span>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed line-clamp-3">
                                        {lastAnswerFeedback.summary}
                                    </p>
                                </div>

                                {/* Strength Tip */}
                                {lastAnswerFeedback.strengths?.[0] && (
                                    <div className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Lightbulb className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold uppercase mb-0.5">Key Strength</p>
                                            <p className="text-xs text-white/80">{lastAnswerFeedback.strengths[0]}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                                <p className="text-xs text-white/50 italic">Complete a question to see insights</p>
                            </div>
                        )}
                    </AnimatePresence>
                </section>

            </div>

            {/* Bottom Status Bar */}
            <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mic className={`w-3 h-3 ${isRecording ? 'text-red-500 animate-pulse' : 'text-white/20'}`} />
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                        {isRecording ? 'Mic Active' : 'Mic Idle'}
                    </span>
                </div>
                <span className="text-[9px] font-mono text-white/20 uppercase">
                    JobFoxy v1.0.4
                </span>
            </div>
        </div>
    )
}
