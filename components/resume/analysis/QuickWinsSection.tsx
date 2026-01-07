// components/resume/analysis/QuickWinsSection.tsx
'use client'

import { motion } from 'framer-motion'
import { Zap, ArrowRight, AlertTriangle, Key, BarChart3, Sparkles } from 'lucide-react'

export interface QuickWin {
    id: string
    icon: string
    title: string
    action: string
    impact: 'high' | 'medium' | 'low'
    targetSection?: string  // ID of section to scroll to
    aiFixable?: boolean     // Can AI auto-fix this?
}

interface QuickWinsSectionProps {
    wins: QuickWin[]
    onActionClick?: (win: QuickWin) => void
    onAIFix?: (win: QuickWin) => void  // Future: AI auto-fix
}

const impactConfig = {
    high: {
        label: 'High Impact',
        gradient: 'from-orange-500 to-red-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-300'
    },
    medium: {
        label: 'Medium Impact',
        gradient: 'from-amber-500 to-yellow-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-300'
    },
    low: {
        label: 'Quick Fix',
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-300'
    },
}

const iconMap: Record<string, React.ReactNode> = {
    '🚨': <AlertTriangle className="w-5 h-5" />,
    '🔑': <Key className="w-5 h-5" />,
    '📊': <BarChart3 className="w-5 h-5" />,
    '⚡': <Zap className="w-5 h-5" />,
    '🎯': <Sparkles className="w-5 h-5" />,
}

export function QuickWinsSection({ wins, onActionClick, onAIFix }: QuickWinsSectionProps) {
    if (wins.length === 0) return null

    // Ensure we have exactly 3 wins (or fewer)
    const displayWins = wins.slice(0, 3)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-3xl border border-amber-500/20 bg-gray-900/60 backdrop-blur-xl"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-300">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Do These {displayWins.length} Things to Boost Your Score</h3>
                        <p className="text-sm text-white/50">High impact changes you can make right now</p>
                    </div>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {displayWins.map((win, index) => {
                        const impact = impactConfig[win.impact]
                        const IconComponent = iconMap[win.icon] || <Zap className="w-5 h-5" />

                        return (
                            <motion.div
                                key={win.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                  group relative flex flex-col p-5 rounded-2xl border transition-all duration-300
                  ${impact.bg} ${impact.border}
                  hover:border-opacity-60 hover:shadow-lg hover:shadow-amber-500/10
                `}
                            >
                                {/* Priority Number */}
                                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-gray-900 shadow-lg">
                                    {index + 1}
                                </div>

                                {/* Impact Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r ${impact.gradient} text-white`}>
                                        {impact.label}
                                    </span>
                                    <div className={`p-2 rounded-lg ${impact.bg} ${impact.text}`}>
                                        {IconComponent}
                                    </div>
                                </div>

                                {/* Title */}
                                <h4 className="text-base font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                                    {win.title}
                                </h4>

                                {/* Description */}
                                <p className="text-sm text-white/60 leading-relaxed flex-1 mb-4">
                                    {win.action}
                                </p>

                                {/* Action Button */}
                                <button
                                    onClick={() => onActionClick?.(win)}
                                    className={`
                    w-full py-2.5 px-4 rounded-xl font-semibold text-sm
                    flex items-center justify-center gap-2
                    bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                    text-white/80 hover:text-white transition-all duration-300
                    group-hover:border-amber-500/30
                  `}
                                >
                                    <span>Fix Now</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                {/* Future: AI Fix Button */}
                                {win.aiFixable && onAIFix && (
                                    <button
                                        onClick={() => onAIFix(win)}
                                        className="mt-2 w-full py-2 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 hover:text-purple-200 transition-all"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>AI Auto-Fix</span>
                                    </button>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}
