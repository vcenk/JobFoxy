'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Trophy,
    Target,
    TrendingUp,
    CheckCircle,
    Clock,
    ChevronRight,
    Sparkles,
    Award,
    AlertTriangle,
    FileText,
    Lightbulb,
    Share2,
    Download,
    Loader2,
    Star,
    Gauge,
    MessageCircle,
    Zap
} from 'lucide-react'
import Link from 'next/link'

// Filler words to detect
const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'well', 'I mean', 'kind of', 'sort of']

// Helper: Calculate words per minute
const calculateWPM = (transcript: string, durationSeconds: number): number => {
    if (!transcript || durationSeconds <= 0) return 0
    const wordCount = transcript.trim().split(/\s+/).length
    return Math.round((wordCount / durationSeconds) * 60)
}

// Helper: Count filler words
const countFillerWords = (transcript: string): { count: number; words: Record<string, number> } => {
    if (!transcript) return { count: 0, words: {} }
    const lowerTranscript = transcript.toLowerCase()
    const foundWords: Record<string, number> = {}
    let totalCount = 0

    FILLER_WORDS.forEach(filler => {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi')
        const matches = lowerTranscript.match(regex)
        if (matches && matches.length > 0) {
            foundWords[filler] = matches.length
            totalCount += matches.length
        }
    })

    return { count: totalCount, words: foundWords }
}

// Helper: Get WPM status
const getWPMStatus = (wpm: number): { label: string; color: string; advice: string } => {
    if (wpm < 100) return { label: 'Too Slow', color: 'text-orange-400', advice: 'Try to speak a bit faster to maintain engagement.' }
    if (wpm <= 150) return { label: 'Ideal', color: 'text-emerald-400', advice: 'Perfect pace! Easy to follow and professional.' }
    if (wpm <= 180) return { label: 'Slightly Fast', color: 'text-yellow-400', advice: 'Consider adding brief pauses for emphasis.' }
    return { label: 'Too Fast', color: 'text-red-400', advice: 'Slow down. Rushed speech can hurt comprehension.' }
}

interface PracticeAnswer {
    id: string
    transcript: string
    overall_score: number
    star_analysis: {
        situation: boolean
        task: boolean
        action: boolean
        result: boolean
    }
    summary: string
    strengths: string[]
    improvements: string[]
    duration_seconds: number
}

interface PracticeQuestion {
    id: string
    question_text: string
    question_category: string
    difficulty: string
    practice_answers: PracticeAnswer[]
}

interface SessionData {
    id: string
    title: string
    question_category: string
    average_score: number
    completed_questions: number
    total_questions: number
    started_at: string
    completed_at: string
    practice_questions: PracticeQuestion[]
}

export default function PostPracticeReport() {
    const { id: sessionId } = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<SessionData | null>(null)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/practice/session/${sessionId}`)
                const data = await res.json()
                if (data.success && data.data?.session) {
                    setSession(data.data.session)
                }
            } catch (err) {
                console.error('Failed to load report:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [sessionId])

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
                <Link href="/dashboard/practice" className="text-purple-400 hover:underline">Return to Dashboard</Link>
            </div>
        )
    }

    const avgScore = Math.round(session.average_score || 0)

    // STAR Stats
    const starCounts = {
        s: 0, t: 0, a: 0, r: 0
    }
    session.practice_questions.forEach(q => {
        const ans = q.practice_answers?.[0]
        if (ans?.star_analysis?.situation) starCounts.s++
        if (ans?.star_analysis?.task) starCounts.t++
        if (ans?.star_analysis?.action) starCounts.a++
        if (ans?.star_analysis?.result) starCounts.r++
    })

    const totalPossible = session.practice_questions.length

    // NEW: Calculate aggregate communication stats
    let totalWords = 0
    let totalDuration = 0
    let totalFillers = 0
    const allFillerWords: Record<string, number> = {}

    session.practice_questions.forEach(q => {
        const ans = q.practice_answers?.[0]
        if (ans?.transcript) {
            totalWords += ans.transcript.trim().split(/\s+/).length
            totalDuration += ans.duration_seconds || 0
            const fillerResult = countFillerWords(ans.transcript)
            totalFillers += fillerResult.count
            Object.entries(fillerResult.words).forEach(([word, count]) => {
                allFillerWords[word] = (allFillerWords[word] || 0) + count
            })
        }
    })

    const avgWPM = totalDuration > 0 ? calculateWPM(totalWords.toString().repeat(totalWords), totalDuration) : 0
    // Recalculate properly
    const actualAvgWPM = totalDuration > 0 ? Math.round((totalWords / totalDuration) * 60) : 0
    const wpmStatus = getWPMStatus(actualAvgWPM)
    const fillerRate = totalWords > 0 ? Math.round((totalFillers / totalWords) * 100) : 0
    const topFillers = Object.entries(allFillerWords).sort((a, b) => b[1] - a[1]).slice(0, 3)

    // Calculate actual duration
    const totalMinutes = Math.floor(totalDuration / 60)
    const totalSeconds = totalDuration % 60

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white pb-20">

            {/* Header / Top Navigation */}
            <div className="max-w-[1400px] mx-auto w-full px-6 pt-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/practice" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Performance Analysis</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">Session ID: {sessionId.slice(0, 8)}</span>
                        </div>
                        <h1 className="text-2xl font-bold">{session.title} Report</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-white/60">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-105 transition-all">
                        Share Achievement
                    </button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT ZONE: Hero Stats (5 columns) */}
                <div className="lg:col-span-5 space-y-8">

                    {/* Main Score Hero */}
                    <section className="glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                            {/* Svg Circle Progress */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96" cy="96" r="88"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-white/5"
                                />
                                <motion.circle
                                    cx="96" cy="96" r="88"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeDasharray={552}
                                    initial={{ strokeDashoffset: 552 }}
                                    animate={{ strokeDashoffset: 552 - (552 * avgScore / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black">{avgScore}</span>
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Score / 100</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Excellent Progress!</h3>
                            <p className="text-white/60 text-sm max-w-[300px] leading-relaxed">
                                You demonstrated strong {session.question_category} skills throughout this session.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-8 mt-10 w-full pt-8 border-t border-white/5">
                            <div className="flex flex-col gap-1 text-center">
                                <span className="text-lg font-bold">{totalMinutes}m {totalSeconds}s</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Duration</span>
                            </div>
                            <div className="flex flex-col gap-1 text-center">
                                <span className="text-lg font-bold">{session.completed_questions}/{session.total_questions}</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Questions</span>
                            </div>
                            <div className="flex flex-col gap-1 text-center">
                                <span className="text-lg font-bold">{totalWords}</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Words Spoken</span>
                            </div>
                        </div>
                    </section>

                    {/* NEW: Communication Insights Section */}
                    <section className="glass-panel p-6 border-l-4 border-l-cyan-500">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-cyan-400" />
                            Communication Insights
                        </h3>

                        <div className="space-y-6">
                            {/* Speaking Pace */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="w-4 h-4 text-white/40" />
                                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Speaking Pace</span>
                                    </div>
                                    <span className={`text-xs font-bold ${wpmStatus.color}`}>{wpmStatus.label}</span>
                                </div>
                                <div className="flex items-end gap-4">
                                    <span className="text-4xl font-black text-white">{actualAvgWPM}</span>
                                    <span className="text-sm text-white/40 mb-1">words/min</span>
                                </div>
                                <p className="text-xs text-white/40 mt-3 leading-relaxed">{wpmStatus.advice}</p>
                                {/* WPM Gauge Bar */}
                                <div className="mt-4 relative h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="absolute inset-y-0 left-[40%] w-[20%] bg-emerald-500/20" /> {/* Ideal zone */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(actualAvgWPM / 2, 100)}%` }}
                                        className={`h-full rounded-full ${actualAvgWPM <= 150 ? 'bg-emerald-500' : actualAvgWPM <= 180 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] text-white/20 mt-1">
                                    <span>80</span>
                                    <span className="text-emerald-400/60">Optimal</span>
                                    <span>200</span>
                                </div>
                            </div>

                            {/* Filler Words */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-white/40" />
                                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Filler Words</span>
                                    </div>
                                    <span className={`text-xs font-bold ${totalFillers <= 5 ? 'text-emerald-400' : totalFillers <= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {totalFillers <= 5 ? 'Excellent' : totalFillers <= 15 ? 'Moderate' : 'High'}
                                    </span>
                                </div>
                                <div className="flex items-end gap-4">
                                    <span className="text-4xl font-black text-white">{totalFillers}</span>
                                    <span className="text-sm text-white/40 mb-1">detected</span>
                                </div>
                                {totalFillers > 0 && topFillers.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {topFillers.map(([word, count]) => (
                                            <span key={word} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                                                "{word}" <span className="text-white/30">×{count}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {totalFillers === 0 && (
                                    <p className="text-xs text-emerald-400/80 mt-3">No filler words detected! Great job staying articulate.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* STAR Coverage Breakdown */}
                    <section className="glass-panel p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-pink-400" />
                            STAR Methodology
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Situation', key: 's', color: 'bg-purple-500', icon: 'S' },
                                { label: 'Task', key: 't', color: 'bg-blue-500', icon: 'T' },
                                { label: 'Action', key: 'a', color: 'bg-emerald-500', icon: 'A' },
                                { label: 'Result', key: 'r', color: 'bg-orange-500', icon: 'R' }
                            ].map(item => {
                                const percentage = Math.round((starCounts[item.key as keyof typeof starCounts] / totalPossible) * 100)
                                return (
                                    <div key={item.key} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center font-bold text-xs shadow-lg`}>
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-bold text-white/80">{percentage}%</span>
                                        </div>
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">{item.label}</p>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full ${item.color}`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* NEW: Coach's Corner - Synthesized Tips */}
                    <section className="glass-panel p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-t-4 border-t-purple-500">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Coach's Corner
                        </h3>
                        <p className="text-xs text-white/40 mb-6">Personalized insights based on your session performance</p>

                        <div className="space-y-4">
                            {/* Tip 1: Based on STAR coverage */}
                            {(() => {
                                const weakestStar = Object.entries(starCounts).sort((a, b) => a[1] - b[1])[0]
                                const starLabels: Record<string, string> = { s: 'Situation', t: 'Task', a: 'Action', r: 'Result' }
                                const starAdvice: Record<string, string> = {
                                    s: 'Start by painting a clear picture of the context. Where were you? What was at stake?',
                                    t: 'Clarify your specific responsibility. What was expected of you personally?',
                                    a: 'Detail YOUR actions step-by-step. Use "I" not "we" to show ownership.',
                                    r: 'Quantify outcomes! Numbers make your impact tangible and memorable.'
                                }
                                const percentage = Math.round((weakestStar[1] / totalPossible) * 100)

                                return percentage < 100 ? (
                                    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 font-bold text-sm">1</div>
                                        <div>
                                            <p className="text-sm font-bold text-white mb-1">Strengthen Your {starLabels[weakestStar[0]]}</p>
                                            <p className="text-xs text-white/50 leading-relaxed">{starAdvice[weakestStar[0]]}</p>
                                        </div>
                                    </div>
                                ) : null
                            })()}

                            {/* Tip 2: Based on WPM */}
                            {actualAvgWPM > 0 && actualAvgWPM !== 150 && (
                                <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 font-bold text-sm">2</div>
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">
                                            {actualAvgWPM < 120 ? 'Pick Up the Pace' : actualAvgWPM > 160 ? 'Slow Down & Breathe' : 'Fine-tune Your Rhythm'}
                                        </p>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            {actualAvgWPM < 120
                                                ? 'Speaking at 120-150 WPM keeps the interviewer engaged. Practice reading aloud to build comfort.'
                                                : actualAvgWPM > 160
                                                    ? 'Insert 2-second pauses after key points. This gives your message time to land and shows confidence.'
                                                    : 'You\'re close to ideal. Focus on varying speed for emphasis—slow down on key achievements.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tip 3: Based on Filler Words */}
                            {totalFillers > 3 && (
                                <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0 text-pink-400 font-bold text-sm">3</div>
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">Eliminate Filler Words</p>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            You used "{topFillers[0]?.[0] || 'um'}" {topFillers[0]?.[1] || totalFillers} times. Replace fillers with a brief pause—silence sounds more confident than "um."
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Praise if everything is good */}
                            {avgScore >= 80 && totalFillers <= 3 && actualAvgWPM >= 120 && actualAvgWPM <= 160 && (
                                <div className="flex gap-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <Trophy className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">Outstanding Performance!</p>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            You're interview-ready. Keep practicing to maintain this level of excellence.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                </div>

                {/* RIGHT ZONE: Question Review (7 columns) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-lg font-bold">Answer Breakdown</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40">Sort by:</span>
                            <select className="bg-transparent text-xs font-bold text-white/80 focus:outline-none border-none">
                                <option>Session Order</option>
                                <option>Performance</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {session.practice_questions.map((q, idx) => {
                            const ans = q.practice_answers?.[0]
                            if (!ans) return null

                            return (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-panel overflow-hidden group hover:border-purple-500/30 transition-all"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-6 mb-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white/60">0{idx + 1}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded uppercase tracking-wider text-white/40">{q.question_category}</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-white leading-snug">{q.question_text}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white">{Math.round(ans.overall_score)}<span className="text-xs text-white/40 font-bold ml-0.5">/100</span></div>
                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} className={`w-2.5 h-2.5 ${star <= Math.round(ans.overall_score / 20) ? 'text-purple-400 fill-purple-400' : 'text-white/10'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-black/20 rounded-xl p-4 border border-white/5 relative">
                                                <span className="absolute -top-2 left-4 px-2 bg-gray-900 text-[9px] font-bold text-white/30 uppercase tracking-widest">Your Answer</span>
                                                <p className="text-sm text-white/60 italic leading-relaxed">"{ans.transcript}"</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Strengths */}
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest pl-1">Key Strengths</span>
                                                    <div className="space-y-1.5">
                                                        {ans.strengths?.map((s, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                                {s}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Improvements */}
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest pl-1">AI Coaching Insights</span>
                                                    <div className="space-y-1.5">
                                                        {ans.improvements?.map((imp, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                                                                <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                                {imp}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* Primary CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent flex justify-center pointer-events-none">
                <div className="flex gap-4 pointer-events-auto">
                    <Link
                        href="/dashboard/practice/new"
                        className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-white/10 flex items-center gap-3"
                    >
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Start Next Session
                    </Link>
                    <Link
                        href="/dashboard/practice"
                        className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center gap-3"
                    >
                        View All History
                    </Link>
                </div>
            </div>

        </div>
    )
}
