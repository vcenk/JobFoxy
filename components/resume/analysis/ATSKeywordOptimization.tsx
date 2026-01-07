// components/resume/analysis/ATSKeywordOptimization.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Info } from 'lucide-react'
import { useState, useMemo } from 'react'
import {
    ATS_KEYWORDS_BY_INDUSTRY,
    ATSKeywordSet,
    getAvailableIndustries
} from '@/lib/data/atsKeywords'

interface ATSKeywordOptimizationProps {
    resumeText: string
    industry?: string
    onKeywordClick?: (keyword: string) => void
}

interface CategoryCoverage {
    name: string
    keywords: string[]
    matched: string[]          // Full matches (keyword or full form found)
    partial: string[]          // Partial matches (only abbreviation found - needs improvement)
    missing: string[]          // Not found at all
    coverage: number
}

export function ATSKeywordOptimization({
    resumeText,
    industry = 'technology',
    onKeywordClick
}: ATSKeywordOptimizationProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [expandedCategory, setExpandedCategory] = useState<string | null>('mustHave')
    const [selectedIndustry, setSelectedIndustry] = useState(industry)

    // Analyze coverage
    const analysis = useMemo(() => {
        const industryKey = Object.keys(ATS_KEYWORDS_BY_INDUSTRY).find(
            k => k.toLowerCase() === selectedIndustry.toLowerCase().replace(/\s+/g, '')
        ) || 'technology'

        const keywordSet = ATS_KEYWORDS_BY_INDUSTRY[industryKey as keyof typeof ATS_KEYWORDS_BY_INDUSTRY]
        if (!keywordSet) return null

        const resumeLower = resumeText.toLowerCase()

        // Smart keyword matching with 3 states: 'full', 'partial', 'none'
        // - 'full': Complete keyword or full form found (ATS-optimized)
        // - 'partial': Only abbreviation found (should use full form for ATS)
        // - 'none': Keyword not found at all
        const getMatchStatus = (keyword: string): 'full' | 'partial' | 'none' => {
            const kwLower = keyword.toLowerCase()

            // Direct full match
            if (resumeLower.includes(kwLower)) return 'full'

            // Check for formats like "PMP (Project Management Professional)"
            const abbrevMatch = keyword.match(/^([A-Z0-9]+)\s*\(([^)]+)\)/)
            if (abbrevMatch) {
                const abbreviation = abbrevMatch[1].toLowerCase()
                const fullName = abbrevMatch[2].toLowerCase()

                // Check if full name appears
                if (resumeLower.includes(fullName)) return 'full'

                // Check if only abbreviation appears (partial match)
                const abbrevRegex = new RegExp(`\\b${abbreviation}\\b`, 'i')
                if (abbrevRegex.test(resumeText)) return 'partial'
            }

            // Check for full name in parentheses without abbreviation pattern
            const parenMatch = keyword.match(/\(([^)]+)\)/)
            if (parenMatch) {
                const fullName = parenMatch[1].toLowerCase()
                if (resumeLower.includes(fullName)) return 'full'
            }

            return 'none'
        }

        const analyzeCategory = (name: string, keywords: string[]): CategoryCoverage => {
            const matched: string[] = []
            const partial: string[] = []
            const missing: string[] = []

            keywords.forEach(kw => {
                const status = getMatchStatus(kw)
                if (status === 'full') matched.push(kw)
                else if (status === 'partial') partial.push(kw)
                else missing.push(kw)
            })

            // Coverage considers full matches only (partial needs improvement)
            const coverage = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 0
            return { name, keywords, matched, partial, missing, coverage }
        }

        const categories: CategoryCoverage[] = [
            analyzeCategory('Must-Have Keywords', keywordSet.mustHave),
            analyzeCategory('Technical Skills', keywordSet.technical),
            analyzeCategory('Soft Skills', keywordSet.soft),
        ]

        if (keywordSet.certifications?.length) {
            categories.push(analyzeCategory('Certifications', keywordSet.certifications))
        }
        if (keywordSet.methodologies?.length) {
            categories.push(analyzeCategory('Methodologies', keywordSet.methodologies))
        }

        const totalKeywords = categories.reduce((sum, c) => sum + c.keywords.length, 0)
        const totalMatched = categories.reduce((sum, c) => sum + c.matched.length, 0)
        const totalPartial = categories.reduce((sum, c) => sum + c.partial.length, 0)
        const overallCoverage = totalKeywords > 0 ? Math.round((totalMatched / totalKeywords) * 100) : 0

        return { categories, overallCoverage, totalMatched, totalPartial, totalKeywords, industryKey }
    }, [resumeText, selectedIndustry])

    if (!analysis) return null

    const getCoverageColor = (coverage: number) => {
        if (coverage >= 75) return 'text-green-400'
        if (coverage >= 50) return 'text-amber-400'
        return 'text-red-400'
    }

    const getCoverageGradient = (coverage: number) => {
        if (coverage >= 75) return 'from-green-500 to-emerald-500'
        if (coverage >= 50) return 'from-amber-500 to-yellow-500'
        return 'from-red-500 to-orange-500'
    }

    const categoryIcons: Record<string, string> = {
        'Must-Have Keywords': '🎯',
        'Technical Skills': '⚙️',
        'Soft Skills': '🤝',
        'Certifications': '📜',
        'Methodologies': '📋',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="keyword-section"
            className="relative w-full overflow-hidden rounded-3xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-xl"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                            <Target className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white">ATS Keyword Optimization</h3>
                            <p className="text-sm text-white/50">Industry-standard keywords for {analysis.industryKey}</p>
                        </div>
                    </div>

                    {/* Overall Coverage */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${getCoverageColor(analysis.overallCoverage)}`}>
                                    {analysis.overallCoverage}%
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-white/40">Coverage</div>
                            </div>
                            <div className="text-center border-l border-white/10 pl-4">
                                <div className="text-lg font-bold text-white">
                                    {analysis.totalMatched}/{analysis.totalKeywords}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-white/40">Keywords</div>
                            </div>
                        </div>
                        <div className="text-white/40">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/5"
                        >
                            {/* Overall Progress Bar */}
                            <div className="px-6 py-4 bg-white/[0.02]">
                                {/* Explanation Box */}
                                <div className="mb-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-white">What is this?</h4>
                                            <p className="text-xs text-white/60 leading-relaxed">
                                                This analyzes your resume against <strong className="text-purple-300">industry-standard ATS keywords</strong> —
                                                not just the specific job description. Adding these keywords can help your resume
                                                get through Applicant Tracking Systems across multiple job applications in your industry.
                                            </p>
                                            <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    <span className="text-green-300">Matched = ATS-ready</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <span className="text-amber-300">Partial = Use full form</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    <span className="text-red-300">Missing = Consider adding</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${analysis.overallCoverage}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full bg-gradient-to-r ${getCoverageGradient(analysis.overallCoverage)} rounded-full`}
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${getCoverageColor(analysis.overallCoverage)}`}>
                                        {analysis.overallCoverage >= 75 ? 'Strong' : analysis.overallCoverage >= 50 ? 'Moderate' : 'Needs Work'}
                                    </span>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="p-6 space-y-4">
                                {analysis.categories.map((category) => (
                                    <div
                                        key={category.name}
                                        className="rounded-xl border border-white/10 overflow-hidden"
                                    >
                                        {/* Category Header */}
                                        <button
                                            onClick={() => setExpandedCategory(
                                                expandedCategory === category.name ? null : category.name
                                            )}
                                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{categoryIcons[category.name] || '📌'}</span>
                                                <div className="text-left">
                                                    <h4 className="text-sm font-bold text-white">{category.name}</h4>
                                                    <p className="text-xs text-white/50">
                                                        {category.matched.length} matched
                                                        {category.partial.length > 0 && <span className="text-amber-400"> · {category.partial.length} partial</span>}
                                                        {' · '}{category.missing.length} missing
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`text-lg font-bold ${getCoverageColor(category.coverage)}`}>
                                                    {category.coverage}%
                                                </div>
                                                <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${getCoverageGradient(category.coverage)} rounded-full transition-all duration-500`}
                                                        style={{ width: `${category.coverage}%` }}
                                                    />
                                                </div>
                                                {expandedCategory === category.name ? (
                                                    <ChevronUp className="w-4 h-4 text-white/40" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-white/40" />
                                                )}
                                            </div>
                                        </button>

                                        {/* Category Keywords */}
                                        <AnimatePresence>
                                            {expandedCategory === category.name && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 pt-0 space-y-3">
                                                        {/* Matched Keywords */}
                                                        {category.matched.length > 0 && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                                                    <span className="text-xs font-medium text-green-300">
                                                                        Matched ({category.matched.length})
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {category.matched.map(kw => (
                                                                        <span
                                                                            key={kw}
                                                                            className="px-2.5 py-1 bg-green-500/10 text-green-300 text-xs rounded-lg border border-green-500/20"
                                                                        >
                                                                            {kw}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Partial Matches (Abbreviation Only - Needs Full Form) */}
                                                        {category.partial.length > 0 && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                                                    <span className="text-xs font-medium text-amber-300">
                                                                        Needs Full Form ({category.partial.length}) — ATS may not recognize abbreviations
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {category.partial.map(kw => {
                                                                        // Extract the full form from parentheses for tooltip
                                                                        const fullFormMatch = kw.match(/\(([^)]+)\)/)
                                                                        const fullForm = fullFormMatch ? fullFormMatch[1] : kw
                                                                        return (
                                                                            <button
                                                                                key={kw}
                                                                                onClick={() => onKeywordClick?.(kw)}
                                                                                title={`Add "${fullForm}" to your resume for better ATS matching`}
                                                                                className="px-2.5 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-lg border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1"
                                                                            >
                                                                                <span>⚠️</span>
                                                                                <span>{kw}</span>
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                                <p className="text-[10px] text-amber-400/70 mt-2 italic">
                                                                    💡 Tip: Write out the full form (e.g., "Project Management Professional") in addition to abbreviations for better ATS compatibility.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Missing Keywords */}
                                                        {category.missing.length > 0 && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                                                                    <span className="text-xs font-medium text-red-300">
                                                                        Missing ({category.missing.length}) — Click to add
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {category.missing.map(kw => (
                                                                        <button
                                                                            key={kw}
                                                                            onClick={() => onKeywordClick?.(kw)}
                                                                            className="px-2.5 py-1 bg-red-500/10 text-red-300 text-xs rounded-lg border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer flex items-center gap-1"
                                                                        >
                                                                            <span>+</span>
                                                                            <span>{kw}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            {/* Industry Selector */}
                            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-white/50">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Based on industry standards</span>
                                </div>
                                <select
                                    value={selectedIndustry}
                                    onChange={(e) => setSelectedIndustry(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-purple-500/50"
                                >
                                    {getAvailableIndustries().map(ind => (
                                        <option key={ind} value={ind} className="bg-gray-900">
                                            {ind.charAt(0).toUpperCase() + ind.slice(1).replace(/([A-Z])/g, ' $1')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
