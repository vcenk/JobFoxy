// components/resume/analysis/QuantificationScore.tsx
// Display quantification analysis and metrics usage

'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { TrendingUp, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react'

interface QuantificationAnalysis {
  hasMetrics: boolean
  score: number
  metricTypes: string[]
  suggestions: string[]
}

interface QuantificationScoreProps {
  analysis: QuantificationAnalysis
}

export const QuantificationScore: React.FC<QuantificationScoreProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Outstanding'
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const metricIcons: Record<string, string> = {
    Percentages: '📈',
    'Dollar amounts': '💰',
    'Large numbers': '🔢',
    'Scale indicators': '📊',
    Rankings: '🏆',
  }

  return (
    <GlassCard title="📊 Quantification Score">
      {/* Score Overview */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Metrics Usage Score</h3>
          <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}
            <span className="text-sm text-white/60">/100</span>
          </span>
        </div>
        <div className="text-sm text-white/70 mb-3">{getScoreGrade(analysis.score)}</div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              analysis.score >= 80
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : analysis.score >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Metrics Status */}
      {analysis.hasMetrics ? (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-1">
                Great! Quantified Achievements Detected
              </h4>
              <p className="text-sm text-green-200/80">
                Your resume includes measurable results, which helps recruiters understand your
                impact. Keep adding specific numbers to strengthen your story.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-300 mb-1">
                No Quantified Achievements Found
              </h4>
              <p className="text-sm text-red-200/80">
                Your resume lacks measurable results. Adding numbers, percentages, and metrics will
                significantly improve your resume's impact and ATS performance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Types Found */}
      {analysis.metricTypes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-400" />
            Metric Types Used
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {analysis.metricTypes.map((type, index) => (
              <div
                key={index}
                className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{metricIcons[type] || '✓'}</span>
                  <span className="text-sm text-green-200 font-medium">{type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
            How to Improve
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

      {/* Examples Section */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-300 mb-3">Examples of Strong Bullets</h4>
        <div className="space-y-3">
          <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <div className="flex items-start space-x-2 mb-1">
              <span className="text-red-300 text-xs font-medium">❌ Weak:</span>
              <span className="text-sm text-white/70">"Improved sales performance"</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-300 text-xs font-medium">✅ Strong:</span>
              <span className="text-sm text-white/90">
                "Increased regional sales by 35% ($2.1M) through implementation of data-driven lead
                scoring system"
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <div className="flex items-start space-x-2 mb-1">
              <span className="text-red-300 text-xs font-medium">❌ Weak:</span>
              <span className="text-sm text-white/70">"Managed a team"</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-300 text-xs font-medium">✅ Strong:</span>
              <span className="text-sm text-white/90">
                "Led cross-functional team of 12 engineers, delivering 5 major features ahead of
                schedule"
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <div className="flex items-start space-x-2 mb-1">
              <span className="text-red-300 text-xs font-medium">❌ Weak:</span>
              <span className="text-sm text-white/70">"Reduced processing time"</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-300 text-xs font-medium">✅ Strong:</span>
              <span className="text-sm text-white/90">
                "Reduced invoice processing time from 3 days to 4 hours, saving $120K annually"
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-yellow-300 mb-2">💡 Quantification Tips</h4>
        <ul className="text-sm text-yellow-200/80 space-y-1">
          <li>• Include percentages: "Increased X by Y%"</li>
          <li>• Add dollar amounts: "Generated $X in revenue", "Saved $Y annually"</li>
          <li>• Show time savings: "Reduced processing time from X to Y"</li>
          <li>• Indicate scale: "Managed team of X", "Served X+ customers"</li>
          <li>• Use rankings: "Ranked #1 out of X", "Top X% performer"</li>
        </ul>
      </div>
    </GlassCard>
  )
}
