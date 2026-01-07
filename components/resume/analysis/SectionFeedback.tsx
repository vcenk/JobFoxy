// components/resume/analysis/SectionFeedback.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
    FileText,
    Briefcase,
    GraduationCap,
    Code2,
    User,
    Award,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Layers
} from 'lucide-react'

export interface SectionFeedbackItem {
    section: string
    feedback: string
    score: number
    // Enhanced feedback fields
    weakBullets?: Array<{
        original: string
        issue: string
        suggestion?: string
    }>
    suggestedKeywords?: string[]
    improvementTips?: string[]
    exampleImprovement?: {
        before: string
        after: string
    }
}

interface SectionFeedbackProps {
    sections: SectionFeedbackItem[]
    onSectionClick?: (section: SectionFeedbackItem) => void
}

// Get icon for each section type
const sectionIcons: Record<string, React.ElementType> = {
    'Experience': Briefcase,
    'Work Experience': Briefcase,
    'Education': GraduationCap,
    'Skills': Code2,
    'Summary': User,
    'Professional Summary': User,
    'Certifications': Award,
    'Projects': Layers,
    'Contact': FileText,
    'default': FileText,
}

// Get color configuration based on score
const getScoreConfig = (score: number) => {
    if (score >= 85) {
        return {
            gradient: 'from-green-500 to-emerald-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            text: 'text-green-400',
            glow: 'shadow-green-500/20',
            label: 'Excellent',
            ring: 'ring-green-500/20',
        }
    } else if (score >= 70) {
        return {
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            glow: 'shadow-blue-500/20',
            label: 'Good',
            ring: 'ring-blue-500/20',
        }
    } else if (score >= 50) {
        return {
            gradient: 'from-amber-500 to-yellow-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-400',
            glow: 'shadow-amber-500/20',
            label: 'Needs Work',
            ring: 'ring-amber-500/20',
        }
    } else {
        return {
            gradient: 'from-red-500 to-orange-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-400',
            glow: 'shadow-red-500/20',
            label: 'Critical',
            ring: 'ring-red-500/20',
        }
    }
}

// Circular progress component for section scores
const CircularScore = ({ score, size = 48 }: { score: number; size?: number }) => {
    const config = getScoreConfig(score)
    const strokeWidth = 4
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg className="absolute transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="none"
                    className="text-white/10"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke="url(#scoreGradient)"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    strokeDasharray={circumference}
                />
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={config.text} style={{ stopColor: 'currentColor' }} />
                        <stop offset="100%" className={config.text} style={{ stopColor: 'currentColor', opacity: 0.6 }} />
                    </linearGradient>
                </defs>
            </svg>
            {/* Score text */}
            <span className={`text-sm font-bold ${config.text}`}>{score}</span>
        </div>
    )
}

export function SectionFeedback({ sections, onSectionClick }: SectionFeedbackProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

    if (!sections || sections.length === 0) {
        return null
    }

    // Calculate overall average
    const averageScore = Math.round(
        sections.reduce((acc, s) => acc + s.score, 0) / sections.length
    )
    const avgConfig = getScoreConfig(averageScore)

    // Group sections by performance
    const excellentCount = sections.filter(s => s.score >= 85).length
    const needsWorkCount = sections.filter(s => s.score < 70).length

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-3xl border border-indigo-500/20 bg-gray-900/60 backdrop-blur-xl"
            id="section-feedback-section"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Section-by-Section Feedback</h3>
                            <p className="text-sm text-white/50">How each part of your resume performs</p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                            <div className={`text-2xl font-bold bg-gradient-to-r ${avgConfig.gradient} bg-clip-text text-transparent`}>
                                {averageScore}%
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Average</div>
                        </div>
                        <div className="flex gap-3 border-l border-white/10 pl-4 sm:pl-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-400">{excellentCount}</div>
                                <div className="text-[10px] uppercase tracking-wider text-white/40">Strong</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-amber-400">{needsWorkCount}</div>
                                <div className="text-[10px] uppercase tracking-wider text-white/40">Improve</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sections.map((section, index) => {
                        const config = getScoreConfig(section.score)
                        const IconComponent = sectionIcons[section.section] || sectionIcons['default']
                        const isExpanded = expandedIndex === index

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${config.border} ${config.bg} hover:shadow-lg ${config.glow}`}
                            >
                                {/* Header Button */}
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className="w-full p-4 flex items-center gap-4 text-left transition-colors hover:bg-white/5"
                                >
                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>

                                    {/* Section Name & Status */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-white truncate">{section.section}</h4>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${config.bg} ${config.text}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/40 truncate mt-0.5">
                                            {isExpanded ? 'Click to collapse' : 'Click for detailed feedback'}
                                        </p>
                                    </div>

                                    {/* Score Circle */}
                                    <div className="flex items-center gap-3">
                                        <CircularScore score={section.score} />
                                        <div className={`text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>

                                {/* Expandable Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 border-t border-white/5">
                                                <div className="pt-4">
                                                    {/* Score Bar */}
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                                            <span className="text-white/50">Section Score</span>
                                                            <span className={`font-semibold ${config.text}`}>{section.score}/100</span>
                                                        </div>
                                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${section.score}%` }}
                                                                transition={{ duration: 0.5, delay: 0.1 }}
                                                                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Feedback Text */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            {section.score >= 70 ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <p className="text-sm text-white/70 leading-relaxed">
                                                                {section.feedback}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Weak Bullets to Improve */}
                                                    {section.weakBullets && section.weakBullets.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-white/5">
                                                            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                                                                Bullets to Improve
                                                            </div>
                                                            <div className="space-y-2">
                                                                {section.weakBullets.slice(0, 2).map((bullet, i) => (
                                                                    <div key={i} className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
                                                                        <p className="text-xs text-white/60 italic mb-1">"{bullet.original.substring(0, 80)}..."</p>
                                                                        <p className="text-xs text-amber-300">Issue: {bullet.issue}</p>
                                                                        {bullet.suggestion && (
                                                                            <p className="text-xs text-green-400 mt-1">→ {bullet.suggestion}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Suggested Keywords */}
                                                    {section.suggestedKeywords && section.suggestedKeywords.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-white/5">
                                                            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                                                                Add These Keywords
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {section.suggestedKeywords.slice(0, 5).map((keyword, i) => (
                                                                    <span key={i} className="px-2 py-1 text-xs bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                                                                        {keyword}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Example Improvement */}
                                                    {section.exampleImprovement && (
                                                        <div className="mt-4 pt-3 border-t border-white/5">
                                                            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                                                                Example Improvement
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                                                                    <span className="text-[10px] text-red-400 font-semibold">BEFORE:</span>
                                                                    <p className="text-xs text-white/60 mt-1">{section.exampleImprovement.before}</p>
                                                                </div>
                                                                <div className="p-2 bg-green-500/5 rounded-lg border border-green-500/10">
                                                                    <span className="text-[10px] text-green-400 font-semibold">AFTER:</span>
                                                                    <p className="text-xs text-white/70 mt-1">{section.exampleImprovement.after}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Improvement Tips */}
                                                    {section.improvementTips && section.improvementTips.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-white/5">
                                                            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                                                                Quick Tips
                                                            </div>
                                                            <ul className="space-y-1">
                                                                {section.improvementTips.slice(0, 3).map((tip, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                                                        <span className="text-indigo-400">•</span>
                                                                        {tip}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Action hint */}
                                                    {section.score < 70 && (
                                                        <div className="mt-3 pt-3 border-t border-white/5">
                                                            <div className="flex items-center gap-2 text-xs text-indigo-300">
                                                                <TrendingUp className="w-3.5 h-3.5" />
                                                                <span>Improving this section could boost your overall score</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Bottom Summary */}
                <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            <span>{sections.filter(s => s.score >= 85).length} sections scoring 85+</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                            <span>{sections.filter(s => s.score >= 70 && s.score < 85).length} good sections</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>{sections.filter(s => s.score < 70).length} need improvement</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
