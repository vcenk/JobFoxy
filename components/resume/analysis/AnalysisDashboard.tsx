// components/resume/analysis/AnalysisDashboard.tsx
'use client'

import { FitnessRings } from './FitnessRings'
import { InsightCard } from './InsightCard'
import { PowerWordsSuggestions } from './PowerWordsSuggestions'
import { QuantificationScore } from './QuantificationScore'
import { KeywordCoverage } from './KeywordCoverage'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const SkillsRadarChart = dynamic(() => import('./RadarChart'), { ssr: false })

import { ATSWarning } from '@/lib/types/analysis'
import { AlertTriangle, CheckCircle2, AlertCircle, Info, Sparkles, Loader2, ArrowRight, Target, TrendingUp, Zap } from 'lucide-react'

// Define the shape of data we expect from the analysis engine
export interface AnalysisData {
  ats_score: number
  jd_match_score: number
  skills_fit_score: number

  // NEW: Detailed coaching explanations
  ats_score_explanation?: string
  job_match_explanation?: string
  skills_fit_explanation?: string
  keyword_strategy?: string
  ats_health_check?: string
  skills_breakdown_coaching?: {
    technical?: string
    tools?: string
    domain?: string
    communication?: string
    soft_skills?: string
  }
  strength_highlights?: (string | { title: string; source: string; insight: string })[]
  coaching_summary?: string | { title: string; source: string; insight: string }
  bullet_improvements?: Array<{
    before: string
    after: string
    reason: string
  }> 

  // Enhanced keyword data
  resume_keywords?: string[]
  jd_keywords?: string[]
  matched_keywords?: string[]
  missing_keywords?: string[]

  // ATS warnings and good practices
  ats_warnings?: ATSWarning[]
  ats_good_practices?: string[]

  // Phase 1: Power Words Analysis
  power_words?: {
    score: number
    weakWords: string[]
    suggestions: Array<{ weak: string; alternatives: string[] }>
    totalWeakWordsFound: number
    improvementPotential: 'low' | 'medium' | 'high'
  }

  // Phase 1: Quantification Analysis
  quantification?: {
    hasMetrics: boolean
    score: number
    metricTypes: string[]
    suggestions: string[]
  }

  // Phase 1: Industry Keyword Coverage
  keyword_coverage?: {
    coverage: number
    matched: string[]
    missing: string[]
    mustHaveMissing: string[]
    industry: string | null
    suggestions: string[]
  } | null

  // Legacy fields (keeping for backward compatibility)
  keyword_analysis: {
    missing: string[]
    present: string[]
  }
  weaknesses: string[]
  strengths: string[]
  formatting_issues: string[]
  skills_radar_data: Array<{ subject: string; A: number; fullMark: number }>
  missing_skills?: string[]
}

interface AnalysisDashboardProps {
  data: AnalysisData | null
  onFixIssue: (issueType: string) => void
  onOptimizeResume?: () => void
  isOptimizing?: boolean
}

// Helper to safely render coaching text (handles both string and object formats)
const renderCoachingText = (text: string | { title: string; source: string; insight: string } | undefined) => {
  if (!text) return null

  // Handle object format
  if (typeof text === 'object' && text !== null) {
    return (
      <div className="space-y-2">
        {text.title && <div className="font-semibold text-white/90 text-sm">{text.title}</div>}
        {text.source && <div className="text-white/60 text-xs italic">{text.source}</div>}
        {text.insight && <div className="text-white/70 text-sm leading-relaxed">{text.insight}</div>}
      </div>
    )
  }

  // Handle string format
  return formatTextWithBullets(text)
}

// Helper to render text with bullets if detected
const formatTextWithBullets = (text: string) => {
  if (!text) return null

  // Split by newlines
  const lines = text.split('\n').filter(line => line.trim().length > 0)

  // Check if it looks like a list (starts with dash, bullet, or asterisk)
  // or if we just want to treat every line as a potential bullet if it's long enough text block
  const isList = lines.some(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'))

  if (isList) {
    return (
      <ul className="space-y-2">
        {lines.map((line, i) => {
          // Remove the bullet character if present to avoid double bullets
          const content = line.replace(/^[-•*]\s*/, '').trim()
          return (
            <li key={i} className="flex gap-2.5 items-start text-white/70 text-sm leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
              <span>{content}</span>
            </li>
          )
        })}
      </ul>
    )
  }

  // If no explicit bullets, still render paragraphs nicely
  return (
    <div className="space-y-3 text-white/70 text-sm leading-relaxed">
      {lines.map((line, i) => <p key={i}>{line}</p>)}
    </div>
  )
}

export function AnalysisDashboard({ data, onFixIssue, onOptimizeResume, isOptimizing }: AnalysisDashboardProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/40 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-white/20" />
        <p>Running analysis...</p>
      </div>
    )
  }

  // Generate Quick Wins from analysis data
  const generateQuickWins = () => {
    const wins: Array<{ icon: string; title: string; action: string; impact: 'high' | 'medium' }> = []

    // Priority 1: Critical ATS issues
    const criticalWarnings = data.ats_warnings?.filter(w => w.severity === 'critical') || []
    if (criticalWarnings.length > 0) {
      wins.push({
        icon: '🚨',
        title: 'Fix Critical ATS Issue',
        action: criticalWarnings[0].recommendation,
        impact: 'high'
      })
    }

    // Priority 2: Missing keywords
    const missingCount = data.missing_keywords?.length || 0
    if (missingCount > 3) {
      const topKeywords = data.missing_keywords?.slice(0, 3).join(', ') || ''
      wins.push({
        icon: '🔑',
        title: 'Add Key Missing Keywords',
        action: `Include these important keywords: ${topKeywords}`,
        impact: 'high'
      })
    }

    // Priority 3: Low scores - suggest improvements
    if (data.ats_score < 75) {
      const atsWarnings = data.ats_warnings?.filter(w => w.severity === 'warning').slice(0, 1) || []
      if (atsWarnings.length > 0) {
        wins.push({
          icon: '⚡',
          title: 'Improve ATS Score',
          action: atsWarnings[0].recommendation,
          impact: 'medium'
        })
      }
    } else if (data.jd_match_score && data.jd_match_score < 75) {
      wins.push({
        icon: '🎯',
        title: 'Boost Job Match',
        action: 'Align your experience bullets more closely with job requirements',
        impact: 'high'
      })
    } else if (data.skills_fit_score < 75) {
      const missingSkills = data.missing_skills?.slice(0, 2).join(', ') || 'key skills'
      wins.push({
        icon: '⚡',
        title: 'Highlight More Skills',
        action: `Add or emphasize: ${missingSkills}`,
        impact: 'medium'
      })
    }

    // Limit to top 3
    return wins.slice(0, 3)
  }

  // Generate Progress Roadmap
  const generateProgressRoadmap = () => {
    const currentScore = data.ats_score || 0
    let targetScore = 90
    let currentTier = 'Needs Work'
    let nextTier = 'Excellent'

    if (currentScore >= 90) {
      targetScore = 100
      currentTier = 'Excellent'
      nextTier = 'Perfect'
    } else if (currentScore >= 75) {
      targetScore = 90
      currentTier = 'Good'
      nextTier = 'Excellent'
    } else if (currentScore >= 60) {
      targetScore = 75
      currentTier = 'Fair'
      nextTier = 'Good'
    } else {
      targetScore = 60
      currentTier = 'Needs Work'
      nextTier = 'Fair'
    }

    const pointsNeeded = targetScore - currentScore
    const progress = ((currentScore % 15) / 15) * 100 // Progress within current tier

    // Generate specific steps to reach next tier
    const steps: Array<{ text: string; completed: boolean }> = []

    // Add steps based on what's missing
    if (data.ats_warnings && data.ats_warnings.filter(w => w.severity === 'critical').length > 0) {
      steps.push({ text: 'Fix all critical ATS issues', completed: false })
    }

    if (data.missing_keywords && data.missing_keywords.length > 3) {
      steps.push({ text: `Add ${Math.min(5, data.missing_keywords.length)} missing keywords`, completed: false })
    }

    if (data.ats_warnings && data.ats_warnings.filter(w => w.severity === 'warning').length > 2) {
      steps.push({ text: 'Resolve formatting warnings', completed: false })
    }

    if (data.skills_fit_score < 70) {
      steps.push({ text: 'Improve skills section', completed: false })
    }

    // Fill with generic suggestions if we don't have enough specific ones
    if (steps.length < 3) {
      if (currentScore < 90) {
        steps.push({ text: 'Quantify achievements with metrics', completed: false })
      }
      if (currentScore < 75) {
        steps.push({ text: 'Use stronger action verbs', completed: false })
      }
    }

    return {
      currentScore,
      targetScore,
      pointsNeeded,
      currentTier,
      nextTier,
      progress,
      steps: steps.slice(0, 3)
    }
  }

  const quickWins = generateQuickWins()
  const roadmap = generateProgressRoadmap()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20 max-w-5xl mx-auto"
    >
      {/* SECTION A: Hero Rings */}
      <motion.div variants={item} className="flex justify-center py-6">
        <FitnessRings
          atsScore={data.ats_score}
          matchScore={data.jd_match_score || 0}
          skillsScore={data.skills_fit_score}
        />
      </motion.div>

      {/* TWO COLUMN LAYOUT FOR TOP METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Wins Section */}
        {quickWins.length > 0 && (
          <motion.div variants={item} className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gray-900/40 backdrop-blur-xl">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quick Wins</h3>
                  <p className="text-sm text-white/50">High impact changes to make now</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {quickWins.map((win, index) => (
                  <div
                    key={index}
                    className="group flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 transition-all duration-300"
                  >
                    <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{win.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white/90 text-sm group-hover:text-amber-200 transition-colors">{win.title}</h4>
                        {win.impact === 'high' && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-[10px] uppercase tracking-wider rounded-full font-bold">
                            High Impact
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{win.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Roadmap */}
        {roadmap.pointsNeeded > 0 && roadmap.currentScore < 90 && (
          <motion.div variants={item} className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gray-900/40 backdrop-blur-xl">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="p-6 relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Roadmap</h3>
                    <p className="text-sm text-white/50">Next level: {roadmap.nextTier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                    {roadmap.pointsNeeded}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Points Needed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-medium text-white/60 mb-2">
                  <span>{roadmap.currentTier}</span>
                  <span className="text-purple-300">Goal: {roadmap.targetScore}%</span>
                </div>
                <div className="relative h-2.5 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                    style={{ width: `${(roadmap.currentScore / roadmap.targetScore) * 100}%` }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="mt-auto">
                <div className="space-y-2">
                  {roadmap.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${ 
                        step.completed 
                          ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                          : 'border-white/20 text-transparent'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-white/70">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Optimize Button */}
      {onOptimizeResume && (
        <motion.div variants={item}>
          <button
            onClick={onOptimizeResume}
            disabled={isOptimizing}
            className="w-full group relative overflow-hidden rounded-2xl p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative bg-gray-900 rounded-2xl px-6 py-5 flex items-center justify-between transition-all group-hover:bg-gray-900/90">
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  {isOptimizing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-100 transition-colors">
                    {isOptimizing ? 'Optimizing Resume...' : 'AI Optimize Resume'}
                  </h3>
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                    {isOptimizing
                      ? 'Applying expert improvements to content...'
                      : 'Auto-fix formatting, keywords, and impact.'
                    }
                  </p>
                </div>
              </div>
              
              {!isOptimizing && (
                <div className="hidden sm:flex items-center gap-2 pl-6 border-l border-white/10">
                  <span className="text-sm font-semibold text-white/90">Start</span>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          </button>
        </motion.div>
      )}

      {/* SECTION B: Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Keyword Matching */}
        <motion.div variants={item}>
          <InsightCard
            title="Keyword Analysis"
            description={
              (data.matched_keywords?.length || 0) === 0 && (data.missing_keywords?.length || 0) === 0
                ? 'Review strategy section'
                : `${data.matched_keywords?.length || 0} matched · ${data.missing_keywords?.length || 0} missing`
            }
            type={(data.missing_keywords?.length || 0) > 3 ? 'warning' : 'success'}
          >
            <div className="space-y-4">
              {/* Matched Keywords */}
              {data.matched_keywords && data.matched_keywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                     <span className="text-xs text-white/80 font-medium">Matched ({data.matched_keywords.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.matched_keywords.slice(0, 8).map(kw => (
                      <span key={kw} className="px-2.5 py-1 bg-green-500/10 text-green-300 text-xs rounded-md border border-green-500/20 shadow-sm">
                        {kw}
                      </span>
                    ))}
                    {data.matched_keywords.length > 8 && (
                      <span className="px-2 py-1 text-white/30 text-xs italic">+{data.matched_keywords.length - 8} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {data.missing_keywords && data.missing_keywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                     <span className="text-xs text-white/80 font-medium">Missing ({data.missing_keywords.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_keywords.slice(0, 8).map(kw => (
                      <span key={kw} className="px-2.5 py-1 bg-red-500/10 text-red-300 text-xs rounded-md border border-red-500/20 shadow-sm">
                        {kw}
                      </span>
                    ))}
                    {data.missing_keywords.length > 8 && (
                      <span className="px-2 py-1 text-white/30 text-xs italic">+{data.missing_keywords.length - 8} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </InsightCard>
        </motion.div>

        {/* ATS Health Check */}
        <motion.div variants={item}>
          <InsightCard
            title="ATS Health Check"
            description={
              (() => {
                const score = data.ats_score || 0
                const totalIssues = data.ats_warnings?.length || 0
                if (score >= 90) return `Excellent Compatibility`
                return `${totalIssues} Potential Issue${totalIssues !== 1 ? 's' : ''}`
              })()
            }
            type={
              data.ats_warnings && data.ats_warnings.some(w => w.severity === 'critical')
                ? 'error'
                : (data.ats_score || 0) >= 75
                  ? 'success'
                  : 'warning'
            }
          >
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {/* Critical Warnings */}
              {data.ats_warnings?.filter(w => w.severity === 'critical').map((warning, i) => (
                <div key={i} className="flex gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-red-200 font-semibold mb-1">{warning.issue}</div>
                    <div className="text-[11px] text-white/60 leading-relaxed">{warning.recommendation}</div>
                  </div>
                </div>
              ))}

              {/* Regular Warnings */}
              {data.ats_warnings?.filter(w => w.severity === 'warning').slice(0, 3).map((warning, i) => (
                <div key={i} className="flex gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-amber-200 font-semibold mb-1">{warning.issue}</div>
                    <div className="text-[11px] text-white/60 leading-relaxed">{warning.recommendation}</div>
                  </div>
                </div>
              ))}

               {/* Good Practices */}
               {data.ats_good_practices && data.ats_good_practices.length > 0 && (
                <div className="pt-2">
                   <div className="text-[10px] uppercase tracking-wider text-green-500/80 font-bold mb-2">Good Practices</div>
                  {data.ats_good_practices.slice(0, 2).map((practice, i) => (
                    <div key={i} className="flex gap-2 items-start mb-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-white/50">{practice}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InsightCard>
        </motion.div>

        {/* Skills Gap - Full Width on Mobile, Half on Desktop */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-1">
          <InsightCard
            title="Skills Profile"
            description="Hard vs Soft skills balance"
            type="info"
          >
             <div className="flex justify-center -my-4">
                <SkillsRadarChart data={data.skills_radar_data} />
             </div>
          </InsightCard>
        </motion.div>

        {/* Summary Card */}
        {data.coaching_summary && (
           <motion.div variants={item} className="md:col-span-2 lg:col-span-1">
             <div className="h-full bg-gray-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💼</span>
                  <h3 className="font-bold text-white">Coach's Summary</h3>
                </div>
                {/* Updated to use helper function that handles both formats */}
                {renderCoachingText(data.coaching_summary)}
             </div>
           </motion.div>
        )}

      </div>

      {/* SECTION C: Detailed Analysis (Accordion Style Visuals) */}
      {(data.ats_score_explanation || data.job_match_explanation || data.skills_fit_explanation) && (
        <motion.div variants={item} className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-white px-1">Detailed Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* ATS Score Coaching */}
            {data.ats_score_explanation && (
              <div className="bg-gray-900/40 p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-colors">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-lg">🤖</span>
                  ATS Parsing Logic
                </h3>
                {/* Updated to use helper function */}
                {formatTextWithBullets(data.ats_score_explanation)}
              </div>
            )}

            {/* Job Match Coaching */}
            {data.job_match_explanation && (
              <div className="bg-gray-900/40 p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-colors">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-lg">🎯</span>
                  Job Description Match
                </h3>
                {/* Updated to use helper function */}
                {formatTextWithBullets(data.job_match_explanation)}
              </div>
            )}

            {/* Keyword Strategy */}
            {data.keyword_strategy && (
              <div className="bg-gray-900/40 p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors md:col-span-2">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-lg">🔑</span>
                  Strategic Keyword Usage
                </h3>
                {/* Updated to use helper function */}
                {formatTextWithBullets(data.keyword_strategy)}
              </div>
            )}
          </div>

          {/* Skills Breakdown Coaching */}
          {data.skills_breakdown_coaching && (
            <div className="bg-gray-900/40 p-6 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Skills Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.skills_breakdown_coaching.technical && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-400">Technical Skills</div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      {formatTextWithBullets(data.skills_breakdown_coaching.technical)}
                    </div>
                  </div>
                )}
                {data.skills_breakdown_coaching.tools && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Tools</div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      {formatTextWithBullets(data.skills_breakdown_coaching.tools)}
                    </div>
                  </div>
                )}
                {data.skills_breakdown_coaching.domain && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-green-400">Domain</div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      {formatTextWithBullets(data.skills_breakdown_coaching.domain)}
                    </div>
                  </div>
                )}
                {data.skills_breakdown_coaching.soft_skills && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-pink-400">Soft Skills</div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      {formatTextWithBullets(data.skills_breakdown_coaching.soft_skills)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Before/After Bullet Improvements */}
          {data.bullet_improvements && data.bullet_improvements.length > 0 && (
            <div className="bg-gray-900/40 p-6 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg text-blue-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">Impact Improvements</h3>
                   <p className="text-sm text-white/50">Transforming responsibilities into achievements</p>
                </div>
              </div>

              <div className="space-y-8">
                {data.bullet_improvements.map((improvement, index) => (
                  <div key={index} className="relative grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">

                    {/* Arrow for Desktop */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-800 border border-white/10 items-center justify-center z-10 shadow-xl">
                      <ArrowRight className="w-4 h-4 text-white/50" />
                    </div>

                    {/* Before Card */}
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">Before</span>
                      </div>
                      <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-sm text-white/70 flex-1 leading-relaxed">
                        "{improvement.before}"
                      </div>
                    </div>

                    {/* After Card */}
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3 md:justify-end">
                         <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Better</span>
                      </div>
                      <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 text-sm text-white/90 font-medium flex-1 shadow-[0_0_15px_rgba(34,197,94,0.05)] leading-relaxed">
                        "{improvement.after}"
                      </div>
                    </div>

                    {/* Reason Footer */}
                    <div className="md:col-span-2 mt-2 pt-3 border-t border-white/5 flex gap-3">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-200/70 leading-relaxed">
                          {formatTextWithBullets(improvement.reason)}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* SECTION D: Phase 1 - Power Words & ATS Optimization */}
      {(data.power_words || data.quantification || data.keyword_coverage) && (
        <motion.div variants={item} className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-white px-1">Content Optimization</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Power Words Analysis */}
            {data.power_words && (
              <motion.div variants={item}>
                <PowerWordsSuggestions analysis={data.power_words} />
              </motion.div>
            )}

            {/* Quantification Score */}
            {data.quantification && (
              <motion.div variants={item}>
                <QuantificationScore analysis={data.quantification} />
              </motion.div>
            )}

            {/* Keyword Coverage - Full Width */}
            {data.keyword_coverage && (
              <motion.div variants={item} className="lg:col-span-2">
                <KeywordCoverage analysis={data.keyword_coverage} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
