// components/resume/analysis/HeroScoresSection.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Target, Sparkles, HelpCircle, ChevronRight, ChevronDown, X } from 'lucide-react'
import { useState } from 'react'

interface ScoreRingProps {
    score: number
    color: string
    glowColor: string
    label: string
    description: string
    explanation?: string
    delay?: number
    isExpanded?: boolean
    onClick?: () => void
}

const ScoreRing = ({ score, color, glowColor, label, description, explanation, delay = 0, isExpanded, onClick }: ScoreRingProps) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <div className="flex flex-col items-center gap-2 relative">
            <button
                onClick={onClick}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center group cursor-pointer transition-all duration-300 ${isExpanded ? 'scale-110 ring-2 ring-white/30 rounded-full' : 'hover:scale-105'
                    }`}
            >
                {/* Glow Effect */}
                <div
                    className={`absolute inset-0 rounded-full blur-xl transition-opacity ${isExpanded ? 'opacity-60' : 'opacity-30 group-hover:opacity-50'
                        }`}
                    style={{ backgroundColor: glowColor }}
                />

                {/* Background Circle */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-white/10"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, delay, ease: "easeOut" }}
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={color}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
                    />
                </svg>

                {/* Center Content */}
                <div className="flex flex-col items-center z-10">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: delay + 0.5 }}
                        className="text-2xl sm:text-3xl font-bold text-white"
                    >
                        {score}%
                    </motion.span>
                </div>
            </button>

            {/* Label with info icon */}
            <div className="flex items-center gap-1.5 relative">
                <span className={`text-sm font-medium transition-colors ${isExpanded ? 'text-white' : 'text-white/80'}`}>
                    {label}
                </span>
                <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                </button>

                {/* Tooltip */}
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 w-48 text-center"
                    >
                        <p className="text-xs text-white/70">{description}</p>
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-l border-t border-white/10 rotate-45" />
                    </motion.div>
                )}
            </div>

            {/* Expanded indicator */}
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                >
                    <ChevronDown className="w-4 h-4 text-white/50" />
                </motion.div>
            )}
        </div>
    )
}

// Get verdict based on average score
function getVerdict(avgScore: number): { label: string; stars: number; colorClass: string } {
    if (avgScore >= 85) return { label: 'Excellent Match', stars: 5, colorClass: 'from-green-500 to-emerald-400' }
    if (avgScore >= 70) return { label: 'Strong Candidate', stars: 4, colorClass: 'from-blue-500 to-cyan-400' }
    if (avgScore >= 55) return { label: 'Moderate Fit', stars: 3, colorClass: 'from-amber-500 to-yellow-400' }
    return { label: 'Needs Improvement', stars: 2, colorClass: 'from-orange-500 to-red-400' }
}

interface HeroScoresSectionProps {
    atsScore: number
    matchScore: number
    skillsScore: number
    coachingSummary?: string
    topPriority?: string
    jobTitle?: string
    company?: string
    atsExplanation?: string
    matchExplanation?: string
    skillsExplanation?: string
    onScoreClick?: (scoreType: 'ats' | 'match' | 'skills') => void
    onTopPriorityClick?: () => void
}

export function HeroScoresSection({
    atsScore,
    matchScore,
    skillsScore,
    coachingSummary,
    topPriority,
    jobTitle,
    company,
    atsExplanation,
    matchExplanation,
    skillsExplanation,
    onScoreClick,
    onTopPriorityClick
}: HeroScoresSectionProps) {
    const [expandedScore, setExpandedScore] = useState<'ats' | 'match' | 'skills' | null>(null)
    const avgScore = Math.round((atsScore + matchScore + skillsScore) / 3)
    const verdict = getVerdict(avgScore)

    // Generate summary if not provided
    const displaySummary = coachingSummary || generateDefaultSummary(atsScore, matchScore, skillsScore)

    const handleScoreClick = (scoreType: 'ats' | 'match' | 'skills') => {
        if (expandedScore === scoreType) {
            setExpandedScore(null)
        } else {
            setExpandedScore(scoreType)
        }
        onScoreClick?.(scoreType)
    }

    const getExpandedExplanation = () => {
        switch (expandedScore) {
            case 'ats': return atsExplanation || 'Your ATS score reflects how well your resume will parse through automated tracking systems. Higher scores mean better compatibility with ATS filters.'
            case 'match': return matchExplanation || 'Job match shows how closely your experience and keywords align with the job requirements. Focus on mirroring the language used in the job description.'
            case 'skills': return skillsExplanation || 'Skills fit measures coverage of both technical and soft skills mentioned in the job posting. Consider adding missing skills to your resume.'
            default: return ''
        }
    }

    const getExpandedTitle = () => {
        switch (expandedScore) {
            case 'ats': return 'ATS Compatibility'
            case 'match': return 'Job Match Analysis'
            case 'skills': return 'Skills Fit Breakdown'
            default: return ''
        }
    }

    const getExpandedColor = () => {
        switch (expandedScore) {
            case 'ats': return 'border-green-500/30 bg-green-500/5'
            case 'match': return 'border-blue-500/30 bg-blue-500/5'
            case 'skills': return 'border-purple-500/30 bg-purple-500/5'
            default: return ''
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-xl"
        >
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8">
                {/* Main Content: Left-Right Split */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

                    {/* LEFT: Score Rings */}
                    <div className="flex flex-col items-center lg:items-start">
                        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                            <ScoreRing
                                score={atsScore}
                                color="#22C55E"
                                glowColor="#22C55E"
                                label="ATS Score"
                                description="How well your resume parses through automated screening systems"
                                isExpanded={expandedScore === 'ats'}
                                delay={0.1}
                                onClick={() => handleScoreClick('ats')}
                            />
                            <ScoreRing
                                score={matchScore}
                                color="#3B82F6"
                                glowColor="#3B82F6"
                                label="Job Match"
                                description="How closely your experience aligns with job requirements"
                                isExpanded={expandedScore === 'match'}
                                delay={0.2}
                                onClick={() => handleScoreClick('match')}
                            />
                            <ScoreRing
                                score={skillsScore}
                                color="#A855F7"
                                glowColor="#A855F7"
                                label="Skills Fit"
                                description="Coverage of required technical and soft skills"
                                isExpanded={expandedScore === 'skills'}
                                delay={0.3}
                                onClick={() => handleScoreClick('skills')}
                            />
                        </div>

                        {/* Click to explore hint */}
                        <p className="text-xs text-white/30 mt-4 text-center lg:text-left">
                            Click a score to see details
                        </p>
                    </div>

                    {/* RIGHT: Verdict, Summary & Top Priority in grid */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Verdict Badge + Stars */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center sm:items-start gap-3"
                        >
                            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${verdict.colorClass} shadow-lg`}>
                                <span className="text-lg font-bold text-white">{verdict.label}</span>
                            </div>

                            {/* Star Rating */}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.span
                                        key={star}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + star * 0.1 }}
                                        className={`text-xl ${star <= verdict.stars ? 'text-yellow-400' : 'text-white/20'}`}
                                    >
                                        ★
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Summary + Top Priority Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Summary Text - Takes 2 columns */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="lg:col-span-2"
                            >
                                <p className="text-sm text-white/70 leading-relaxed">
                                    {displaySummary}
                                </p>
                            </motion.div>

                            {/* Top Priority Callout - Compact */}
                            {topPriority && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    onClick={onTopPriorityClick}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors text-left group"
                                >
                                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 flex-shrink-0">
                                        <Target className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300">Top Priority</span>
                                        <p className="text-xs text-white/80 mt-0.5 line-clamp-2">{topPriority}</p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0 mt-1" />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Score Explanation Panel */}
                <AnimatePresence>
                    {expandedScore && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className={`mt-6 p-4 rounded-xl border ${getExpandedColor()}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white mb-2">{getExpandedTitle()}</h4>
                                        <p className="text-sm text-white/70 leading-relaxed">
                                            {getExpandedExplanation()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setExpandedScore(null)}
                                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Job Context Bar */}
                {jobTitle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-sm text-white/40"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Analysis for:</span>
                        <span className="font-medium text-white/60">{jobTitle}</span>
                        {company && (
                            <>
                                <span>at</span>
                                <span className="font-medium text-white/60">{company}</span>
                            </>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

// Helper function to generate default summary
function generateDefaultSummary(ats: number, match: number, skills: number): string {
    const avg = (ats + match + skills) / 3

    if (avg >= 85) {
        return "Your resume is excellently tailored for this role. You have strong keyword alignment and skill coverage. Minor refinements could push you even higher."
    } else if (avg >= 70) {
        return "Your resume is well-aligned with this role. Focus on adding a few missing keywords and quantifying more achievements to strengthen your application."
    } else if (avg >= 55) {
        return "Your resume has potential but needs optimization. Consider adding key skills from the job description and restructuring your experience section."
    } else {
        return "Your resume needs significant improvements to match this role. Focus on tailoring your skills and experience to better align with the job requirements."
    }
}
