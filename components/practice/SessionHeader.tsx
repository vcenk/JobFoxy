// components/practice/SessionHeader.tsx
'use client'

import { Mic, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SessionHeaderProps {
    title: string
    currentQuestionIndex: number
    totalQuestions: number
    onEndSession: () => void
}

export function SessionHeader({
    title,
    currentQuestionIndex,
    totalQuestions,
    onEndSession
}: SessionHeaderProps) {
    return (
        <div className="flex flex-col px-4 pt-1 mb-6">
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/practice"
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white leading-tight">{title}</h1>
                            <p className="text-white/40 text-xs mt-0.5">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onEndSession}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-medium border border-red-500/20"
                >
                    End Session
                </button>
            </div>
        </div>
    )
}
