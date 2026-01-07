// components/resume/analysis/JDRequirementMatch.tsx
'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, XCircle, Briefcase, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export interface JDRequirement {
    requirement: string
    category: 'experience' | 'skill' | 'education' | 'certification' | 'other'
    importance: 'required' | 'preferred' | 'nice-to-have'
    status: 'matched' | 'partial' | 'missing'
    evidence?: string
}

interface JDRequirementMatchProps {
    requirements: JDRequirement[]
    matchedKeywords?: string[]
    missingKeywords?: string[]
}

const statusConfig = {
    matched: {
        icon: CheckCircle2,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        label: 'Met',
    },
    partial: {
        icon: AlertCircle,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        label: 'Partial',
    },
    missing: {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        label: 'Missing',
    },
}

const importanceConfig = {
    required: { label: 'Required', color: 'text-red-300', bg: 'bg-red-500/20' },
    preferred: { label: 'Preferred', color: 'text-amber-300', bg: 'bg-amber-500/20' },
    'nice-to-have': { label: 'Nice to Have', color: 'text-blue-300', bg: 'bg-blue-500/20' },
}

export function JDRequirementMatch({ requirements, matchedKeywords = [], missingKeywords = [] }: JDRequirementMatchProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    // If no requirements provided, generate them from keywords
    const displayRequirements: JDRequirement[] = requirements.length > 0
        ? requirements
        : generateRequirementsFromKeywords(matchedKeywords, missingKeywords)

    // Split into matched and missing
    const matchedReqs = displayRequirements.filter(r => r.status === 'matched' || r.status === 'partial')
    const missingReqs = displayRequirements.filter(r => r.status === 'missing')

    // Calculate coverage stats
    const totalRequired = displayRequirements.filter(r => r.importance === 'required').length
    const matchedRequired = displayRequirements.filter(r => r.importance === 'required' && r.status === 'matched').length
    const coveragePercent = displayRequirements.length > 0
        ? Math.round((matchedReqs.length / displayRequirements.length) * 100)
        : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-xl"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10">
                {/* Header - Always visible */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white">Job Requirements Match</h3>
                            <p className="text-sm text-white/50">What the job needs vs what you have</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className={`text-xl font-bold ${coveragePercent >= 75 ? 'text-green-400' :
                                        coveragePercent >= 50 ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    {coveragePercent}%
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-white/40">Coverage</div>
                            </div>
                            <div className="text-center border-l border-white/10 pl-6">
                                <div className="text-xl font-bold text-white">
                                    {matchedRequired}/{totalRequired}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-white/40">Required Met</div>
                            </div>
                        </div>
                        <div className="text-white/40">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </button>

                {/* Side-by-Side Content */}
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                            {/* LEFT: Job Requirements */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Job Requires</h4>
                                </div>
                                <div className="space-y-3">
                                    {displayRequirements.map((req, index) => {
                                        const status = statusConfig[req.status]
                                        const importance = importanceConfig[req.importance]
                                        const StatusIcon = status.icon

                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className={`flex items-start gap-3 p-3 rounded-xl ${status.bg} border ${status.border}`}
                                            >
                                                <StatusIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${status.color}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white/90">{req.requirement}</p>
                                                    <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${importance.bg} ${importance.color}`}>
                                                        {importance.label}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                    {displayRequirements.length === 0 && (
                                        <p className="text-sm text-white/40 italic">No requirements extracted yet</p>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: Your Resume Evidence */}
                            <div className="p-6 bg-white/[0.02]">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Your Resume Shows</h4>
                                </div>
                                <div className="space-y-3">
                                    {displayRequirements.map((req, index) => {
                                        const status = statusConfig[req.status]

                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className={`p-3 rounded-xl border ${req.status === 'matched' ? 'bg-green-500/5 border-green-500/20' :
                                                        req.status === 'partial' ? 'bg-amber-500/5 border-amber-500/20' :
                                                            'bg-red-500/5 border-red-500/20'
                                                    }`}
                                            >
                                                {req.evidence ? (
                                                    <p className="text-sm text-white/80 italic">"{req.evidence}"</p>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="w-4 h-4 text-red-400" />
                                                        <p className="text-sm text-red-300">Not found in resume</p>
                                                    </div>
                                                )}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                    {displayRequirements.length === 0 && (
                                        <p className="text-sm text-white/40 italic">Analyze a job description to see matches</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Footer */}
                        <div className="px-6 py-4 border-t border-white/5 flex flex-wrap gap-4 text-xs text-white/40">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                <span>{matchedReqs.filter(r => r.status === 'matched').length} matched</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>{matchedReqs.filter(r => r.status === 'partial').length} partial</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-red-400" />
                                <span>{missingReqs.length} missing</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

// Helper function to generate requirements from keywords when JD requirements aren't available
function generateRequirementsFromKeywords(matched: string[], missing: string[]): JDRequirement[] {
    const requirements: JDRequirement[] = []

    // Add matched keywords as matched requirements
    matched.slice(0, 5).forEach(keyword => {
        requirements.push({
            requirement: `${keyword} proficiency`,
            category: 'skill',
            importance: 'required',
            status: 'matched',
            evidence: `Found "${keyword}" in your resume`,
        })
    })

    // Add missing keywords as missing requirements
    missing.slice(0, 5).forEach(keyword => {
        requirements.push({
            requirement: `${keyword} experience`,
            category: 'skill',
            importance: 'required',
            status: 'missing',
        })
    })

    return requirements
}
