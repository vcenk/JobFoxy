// components/resume/analysis/KeywordCoverage.tsx
// Display industry-specific keyword coverage analysis

'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Target, CheckCircle2, AlertCircle, TrendingUp, Search } from 'lucide-react'
import { useState } from 'react'

interface KeywordCoverageAnalysis {
  coverage: number
  matched: string[]
  missing: string[]
  mustHaveMissing: string[]
  industry: string | null
  suggestions: string[]
}

interface KeywordCoverageProps {
  analysis: KeywordCoverageAnalysis | null
  onIndustryChange?: (industry: string) => void
  availableIndustries?: string[]
}

export const KeywordCoverage: React.FC<KeywordCoverageProps> = ({
  analysis,
  onIndustryChange,
  availableIndustries = [
    'technology',
    'finance',
    'marketing',
    'healthcare',
    'sales',
    'operations',
    'human_resources',
    'customer_service',
    'education',
    'engineering',
  ],
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState(analysis?.industry || '')

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry)
    onIndustryChange?.(industry)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Coverage'
    if (score >= 60) return 'Good Coverage'
    if (score >= 40) return 'Fair Coverage'
    return 'Poor Coverage'
  }

  const formatIndustryName = (industry: string) => {
    return industry
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // If no analysis provided or no industry selected, show industry selector
  if (!analysis || !analysis.industry) {
    return (
      <GlassCard title="🎯 ATS Keyword Coverage">
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start space-x-3 mb-4">
            <Search className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">
                Select Your Target Industry
              </h4>
              <p className="text-sm text-blue-200/80 mb-4">
                Choose your industry to analyze keyword coverage and get ATS optimization
                suggestions based on industry-specific requirements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {availableIndustries.map((industry) => (
              <button
                key={industry}
                onClick={() => handleIndustryChange(industry)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-lg text-sm text-white/90 hover:text-blue-300 transition-all text-left"
              >
                {formatIndustryName(industry)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard title="🎯 ATS Keyword Coverage">
      {/* Score Overview */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {formatIndustryName(analysis.industry)} Keywords
            </h3>
            <p className="text-xs text-white/60 mt-1">
              {analysis.matched.length} of{' '}
              {analysis.matched.length + analysis.missing.length} keywords found
            </p>
          </div>
          <span className={`text-3xl font-bold ${getScoreColor(analysis.coverage)}`}>
            {Math.round(analysis.coverage)}
            <span className="text-sm text-white/60">%</span>
          </span>
        </div>
        <div className="text-sm text-white/70 mb-3">{getScoreLabel(analysis.coverage)}</div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              analysis.coverage >= 80
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : analysis.coverage >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${analysis.coverage}%` }}
          />
        </div>

        {/* Change Industry Button */}
        {onIndustryChange && (
          <button
            onClick={() => setSelectedIndustry('')}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Change industry →
          </button>
        )}
      </div>

      {/* Critical Must-Have Keywords Missing */}
      {analysis.mustHaveMissing.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-300 mb-2">
                Critical Keywords Missing
              </h4>
              <p className="text-sm text-red-200/80 mb-3">
                These are essential keywords for {formatIndustryName(analysis.industry)}{' '}
                roles. Adding them will significantly improve your ATS score.
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.mustHaveMissing.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-200 font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matched Keywords */}
      {analysis.matched.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
            Keywords Found ({analysis.matched.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matched.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-200"
              >
                ✓ {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {analysis.missing.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-yellow-400" />
            Missing Keywords ({analysis.missing.length})
          </h4>
          <p className="text-sm text-white/70 mb-3">
            Consider adding these keywords if they're relevant to your experience:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missing.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-sm text-yellow-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
            Optimization Suggestions
          </h4>
          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
              >
                <p className="text-sm text-purple-200">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Tips */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 ATS Keyword Tips</h4>
        <ul className="text-sm text-blue-200/80 space-y-1">
          <li>
            • Use exact keyword matches from job descriptions - ATS systems look for specific
            terms
          </li>
          <li>
            • Include both acronyms and full terms (e.g., "SEO (Search Engine Optimization)")
          </li>
          <li>
            • Place important keywords in your summary, skills section, and work experience
          </li>
          <li>
            • Don't keyword stuff - use them naturally in context of your achievements
          </li>
          <li>
            • Update keywords for each job application based on the specific job description
          </li>
        </ul>
      </div>
    </GlassCard>
  )
}
