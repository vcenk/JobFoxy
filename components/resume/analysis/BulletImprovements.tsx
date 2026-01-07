// components/resume/analysis/BulletImprovements.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    ArrowRight,
    Copy,
    Check,
    Info,
    ChevronDown,
    ChevronUp,
    Wand2
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export interface BulletImprovement {
    before: string
    after: string
    reason: string
}

interface BulletImprovementsProps {
    improvements: BulletImprovement[]
    onApplyImprovement?: (improvement: BulletImprovement, index: number) => void
}

export function BulletImprovements({ improvements, onApplyImprovement }: BulletImprovementsProps) {
    const toast = useToast()
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0) // First one expanded by default
    const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set())

    if (!improvements || improvements.length === 0) {
        return null
    }

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index)
    }

    const handleApply = (improvement: BulletImprovement, index: number) => {
        if (onApplyImprovement) {
            onApplyImprovement(improvement, index)
            // Mark as applied
            setAppliedIndices(prev => new Set(Array.from(prev).concat(index)))
            // Show toast notification
            toast.success('Improvement applied to your resume!')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-3xl border border-blue-500/20 bg-gray-900/60 backdrop-blur-xl"
            id="bullet-improvements-section"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-300">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Impact Improvements</h3>
                            <p className="text-sm text-white/50">Transform responsibilities into achievements</p>
                        </div>
                    </div>

                    {/* Count Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Wand2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-300">{improvements.length} Suggestions</span>
                    </div>
                </div>

                {/* Improvements List */}
                <div className="space-y-4">
                    {improvements.map((improvement, index) => {
                        const isExpanded = expandedIndex === index
                        const isCopied = copiedIndex === index

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                            >
                                {/* Collapsible Header */}
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                                >
                                    {/* Number Badge */}
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {index + 1}
                                    </div>

                                    {/* Preview */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Before:</span>
                                        </div>
                                        <p className="text-sm text-white/70 truncate">{improvement.before}</p>
                                    </div>

                                    {/* Expand Icon */}
                                    <div className={`text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 space-y-4">
                                                {/* Before/After Grid */}
                                                <div className="grid md:grid-cols-2 gap-4 relative">
                                                    {/* Arrow Connector (Desktop) */}
                                                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-800 border border-white/20 items-center justify-center z-10 shadow-xl">
                                                        <ArrowRight className="w-5 h-5 text-white/60" />
                                                    </div>

                                                    {/* Before Card */}
                                                    <div className="relative">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                                                Before
                                                            </span>
                                                        </div>
                                                        <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-sm text-white/70 leading-relaxed min-h-[80px]">
                                                            "{improvement.before}"
                                                        </div>
                                                    </div>

                                                    {/* After Card */}
                                                    <div className="relative">
                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                                                Improved
                                                            </span>

                                                            {/* Copy Button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleCopy(improvement.after, index)
                                                                }}
                                                                className={`
                                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                                  transition-all duration-200
                                  ${isCopied
                                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80'
                                                                    }
                                `}
                                                            >
                                                                {isCopied ? (
                                                                    <>
                                                                        <Check className="w-3 h-3" />
                                                                        <span>Copied!</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="w-3 h-3" />
                                                                        <span>Copy</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20 text-sm text-white/90 font-medium leading-relaxed shadow-[0_0_20px_rgba(34,197,94,0.08)] min-h-[80px]">
                                                            "{improvement.after}"
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Reason Section */}
                                                <div className="flex gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Why this is stronger</span>
                                                        <p className="text-sm text-blue-200/70 leading-relaxed mt-1">
                                                            {improvement.reason}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Apply Button */}
                                                {onApplyImprovement && (
                                                    <button
                                                        onClick={() => handleApply(improvement, index)}
                                                        disabled={appliedIndices.has(index)}
                                                        className={`
                                                            w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                                                            ${appliedIndices.has(index)
                                                                ? 'bg-green-500/20 border border-green-500/30 text-green-300 cursor-default'
                                                                : 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-200 hover:from-blue-600/30 hover:to-purple-600/30 hover:text-white'
                                                            }
                                                        `}
                                                    >
                                                        {appliedIndices.has(index) ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Applied to Resume
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Wand2 className="w-4 h-4" />
                                                                Apply to Resume
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Pro Tip Footer */}
                <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-start gap-3 text-xs text-white/40">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <p>
                            <span className="font-semibold text-white/60">Pro tip:</span> Copy these improved bullets and paste them directly into your resume. Focus on quantifiable results and action verbs.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
