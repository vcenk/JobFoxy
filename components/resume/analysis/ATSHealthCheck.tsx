// components/resume/analysis/ATSHealthCheck.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
    Shield,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    FileWarning,
    Bug,
    Type,
    Table2,
    Image,
    Link2,
    Info
} from 'lucide-react'
import { ATSWarning } from '@/lib/types/analysis'

interface ATSHealthCheckProps {
    atsScore?: number // The actual ATS score from AI analysis
    healthSummary?: string
    warnings?: ATSWarning[]
    formattingIssues?: string[]
    goodPractices?: string[]
}

// Map formatting issues to icons
const getFormattingIcon = (issue: string) => {
    const lower = issue.toLowerCase()
    if (lower.includes('table')) return Table2
    if (lower.includes('image') || lower.includes('graphic')) return Image
    if (lower.includes('link') || lower.includes('url')) return Link2
    if (lower.includes('font')) return Type
    return FileWarning
}

// Map severity values from analysis type to visual config
const severityConfig = {
    critical: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: AlertTriangle,
        label: 'Critical',
    },
    warning: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        icon: AlertCircle,
        label: 'Warning',
    },
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: Info,
        label: 'Info',
    },
}

export function ATSHealthCheck({ atsScore, healthSummary, warnings = [], formattingIssues = [], goodPractices = [] }: ATSHealthCheckProps) {
    const [expandedWarning, setExpandedWarning] = useState<number | null>(null)
    const [showAllFormatting, setShowAllFormatting] = useState(false)

    // Count by severity
    const criticalCount = warnings.filter(w => w.severity === 'critical').length
    const warningCount = warnings.filter(w => w.severity === 'warning').length
    const infoCount = warnings.filter(w => w.severity === 'info').length
    const totalIssues = warnings.length + formattingIssues.length

    // Use the actual ATS score if provided, otherwise don't show score
    const showScore = typeof atsScore === 'number'

    const getHealthColor = () => {
        const score = atsScore ?? 0
        if (score >= 80) return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' }
        if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
        return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
    }

    const healthColors = getHealthColor()

    if (!healthSummary && warnings.length === 0 && formattingIssues.length === 0 && goodPractices.length === 0) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-3xl border border-slate-500/20 bg-gray-900/60 backdrop-blur-xl"
            id="ats-health-check-section"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-slate-600/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8">
                {/* Header with Health Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${healthColors.bg} ${healthColors.text}`}>
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">ATS Health Check</h3>
                            <p className="text-sm text-white/50">Resume formatting and compatibility</p>
                        </div>
                    </div>

                    {/* ATS Score Badge - Uses actual AI score */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${healthColors.bg} ${healthColors.border} border`}>
                        {showScore ? (
                            <>
                                <div className={`text-2xl font-bold ${healthColors.text}`}>{atsScore}%</div>
                                <div className="text-xs text-white/50">
                                    <div className="font-semibold text-white/70">ATS Score</div>
                                    <div>{totalIssues} issue{totalIssues !== 1 ? 's' : ''} to fix</div>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-medium text-white/70">
                                {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Text */}
                {healthSummary && (
                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-sm text-white/70 leading-relaxed">{healthSummary}</p>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                        <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                        <div className="text-[10px] uppercase tracking-wider text-red-400/70 font-semibold">Critical</div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
                        <div className="text-2xl font-bold text-amber-400">{warningCount}</div>
                        <div className="text-[10px] uppercase tracking-wider text-amber-400/70 font-semibold">Warnings</div>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                        <div className="text-2xl font-bold text-green-400">{goodPractices.length}</div>
                        <div className="text-[10px] uppercase tracking-wider text-green-400/70 font-semibold">Good</div>
                    </div>
                </div>

                {/* ATS Warnings */}
                {warnings.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ATS Compatibility Issues
                        </h4>
                        <div className="space-y-2">
                            {warnings.map((warning, index) => {
                                const config = severityConfig[warning.severity]
                                const IconComponent = config.icon
                                const isExpanded = expandedWarning === index

                                return (
                                    <div key={index} className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}>
                                        <button
                                            onClick={() => setExpandedWarning(isExpanded ? null : index)}
                                            className="w-full p-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                                        >
                                            <IconComponent className={`w-4 h-4 ${config.text} flex-shrink-0`} />
                                            <span className="flex-1 text-sm text-white/80">{warning.issue}</span>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${config.bg} ${config.text} rounded`}>
                                                {config.label}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-3 pb-3 pt-1 border-t border-white/5">
                                                        <div className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className="text-[10px] uppercase text-green-400 font-bold">Recommendation</span>
                                                                <p className="text-sm text-white/70 mt-1">{warning.recommendation}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Formatting Issues */}
                {formattingIssues.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileWarning className="w-4 h-4 text-orange-400" />
                            Formatting Concerns
                        </h4>
                        <div className="space-y-2">
                            {(showAllFormatting ? formattingIssues : formattingIssues.slice(0, 3)).map((issue, index) => {
                                const IconComponent = getFormattingIcon(issue)
                                return (
                                    <div key={index} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3">
                                        <IconComponent className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-white/70">{issue}</span>
                                    </div>
                                )
                            })}
                            {formattingIssues.length > 3 && (
                                <button
                                    onClick={() => setShowAllFormatting(!showAllFormatting)}
                                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    {showAllFormatting ? 'Show less' : `+${formattingIssues.length - 3} more formatting issues`}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Good Practices */}
                {goodPractices.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            What's Working Well
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {goodPractices.slice(0, 6).map((practice, index) => (
                                <div key={index} className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white/70">{practice}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
