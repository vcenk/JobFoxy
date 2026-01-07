// components/resume/analysis/StrengthsWeaknesses.tsx
'use client'

import { motion } from 'framer-motion'
import {
    ThumbsUp,
    AlertTriangle,
    ChevronRight,
    Sparkles,
    Target,
    TrendingUp,
    Shield,
    Zap
} from 'lucide-react'

interface StrengthsWeaknessesProps {
    strengths: string[]
    weaknesses: string[]
    onStrengthClick?: (strength: string) => void
    onWeaknessClick?: (weakness: string) => void
}

// Icons for variety in strengths
const strengthIcons = [Shield, Sparkles, TrendingUp, Zap, Target]

export function StrengthsWeaknesses({
    strengths = [],
    weaknesses = [],
    onStrengthClick,
    onWeaknessClick
}: StrengthsWeaknessesProps) {
    if (strengths.length === 0 && weaknesses.length === 0) {
        return null
    }

    // Limit display to keep it scannable
    const displayStrengths = strengths.slice(0, 5)
    const displayWeaknesses = weaknesses.slice(0, 5)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-xl"
            id="strengths-weaknesses-section"
        >
            {/* Split Ambient Backgrounds */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-green-600/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-amber-600/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-amber-500/20">
                            <Target className="w-6 h-6 text-white/80" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Strengths & Areas to Improve</h3>
                            <p className="text-sm text-white/50">What makes you stand out vs what to work on</p>
                        </div>
                    </div>
                </div>

                {/* Split Panel Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">

                    {/* LEFT: Strengths */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ThumbsUp className="w-5 h-5 text-green-400" />
                            <h4 className="text-sm font-bold text-green-300 uppercase tracking-wider">Your Strengths</h4>
                            <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-300 rounded-full">
                                {displayStrengths.length}
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {displayStrengths.length > 0 ? (
                                displayStrengths.map((strength, index) => {
                                    const IconComponent = strengthIcons[index % strengthIcons.length]

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => onStrengthClick?.(strength)}
                                            className={`
                        group flex items-start gap-3 p-3 rounded-xl
                        bg-green-500/5 border border-green-500/10
                        hover:bg-green-500/10 hover:border-green-500/20
                        transition-all duration-200
                        ${onStrengthClick ? 'cursor-pointer' : ''}
                      `}
                                        >
                                            <div className="p-1.5 rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                                                <IconComponent className="w-3.5 h-3.5" />
                                            </div>
                                            <p className="text-sm text-white/80 leading-relaxed flex-1">{strength}</p>
                                            {onStrengthClick && (
                                                <ChevronRight className="w-4 h-4 text-green-400/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                                            )}
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="text-sm text-white/40 italic p-3">
                                    No specific strengths identified yet
                                </div>
                            )}
                        </div>

                        {/* Encouragement Footer */}
                        {displayStrengths.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-green-500/10">
                                <p className="text-xs text-green-300/70 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    These are your competitive advantages — highlight them in interviews!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Weaknesses / Areas to Improve */}
                    <div className="p-6 bg-white/[0.01]">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Areas to Improve</h4>
                            <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full">
                                {displayWeaknesses.length}
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {displayWeaknesses.length > 0 ? (
                                displayWeaknesses.map((weakness, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onWeaknessClick?.(weakness)}
                                        className={`
                      group flex items-start gap-3 p-3 rounded-xl
                      bg-amber-500/5 border border-amber-500/10
                      hover:bg-amber-500/10 hover:border-amber-500/20
                      transition-all duration-200
                      ${onWeaknessClick ? 'cursor-pointer' : ''}
                    `}
                                    >
                                        <div className="w-5 h-5 rounded-full border-2 border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-amber-400">{index + 1}</span>
                                        </div>
                                        <p className="text-sm text-white/80 leading-relaxed flex-1">{weakness}</p>
                                        {onWeaknessClick && (
                                            <ChevronRight className="w-4 h-4 text-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <ThumbsUp className="w-4 h-4 text-green-400" />
                                    <p className="text-sm text-green-300">No major weaknesses identified!</p>
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        {displayWeaknesses.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-amber-500/10">
                                <p className="text-xs text-amber-300/70 flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    Addressing these can significantly boost your interview success rate
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Stats Bar */}
                <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            {displayStrengths.length} strength{displayStrengths.length !== 1 ? 's' : ''} identified
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            {displayWeaknesses.length} area{displayWeaknesses.length !== 1 ? 's' : ''} to improve
                        </span>
                    </div>
                    {displayStrengths.length >= displayWeaknesses.length && (
                        <span className="text-green-400/80 font-medium">Looking good overall!</span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
