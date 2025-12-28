// components/resume/analysis/PowerWordsSuggestions.tsx
// Display power words suggestions and weak word detection

'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react'

interface PowerWordsAnalysis {
  score: number
  weakWords: string[]
  suggestions: Array<{ weak: string; alternatives: string[] }>
  totalWeakWordsFound: number
  improvementPotential: 'low' | 'medium' | 'high'
}

interface PowerWordsSuggestionsProps {
  analysis: PowerWordsAnalysis
  onApplySuggestion?: (weak: string, replacement: string) => void
}

export const PowerWordsSuggestions: React.FC<PowerWordsSuggestionsProps> = ({
  analysis,
  onApplySuggestion,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Improvement'
    return 'Poor'
  }

  const getPotentialBadge = (potential: string) => {
    const colors = {
      low: 'bg-green-500/20 text-green-300 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
    }
    const labels = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[potential as keyof typeof colors]}`}
      >
        {labels[potential as keyof typeof labels]}
      </span>
    )
  }

  return (
    <GlassCard title="💪 Power Words Analysis">
      {/* Score Overview */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Power Words Score</h3>
          <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}
            <span className="text-sm text-white/60">/100</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">{getScoreLabel(analysis.score)}</span>
          {getPotentialBadge(analysis.improvementPotential)}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
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

      {/* Summary */}
      {analysis.totalWeakWordsFound > 0 ? (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-300 mb-1">
                Found {analysis.totalWeakWordsFound} Weak{' '}
                {analysis.totalWeakWordsFound === 1 ? 'Phrase' : 'Phrases'}
              </h4>
              <p className="text-sm text-yellow-200/80">
                Your resume contains weak phrases that reduce impact and may not perform well in
                ATS systems. Replace them with stronger action verbs to improve your score.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-1">Great Job!</h4>
              <p className="text-sm text-green-200/80">
                No weak phrases detected. Your resume uses strong, impactful language.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weak Words Detected */}
      {analysis.weakWords.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
            Weak Phrases Found
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.weakWords.map((word, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-200"
              >
                "{word}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Power Word Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-purple-400" />
            Suggested Improvements
          </h4>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-red-300 bg-red-500/20 px-2 py-1 rounded">
                        Weak
                      </span>
                      <span className="text-sm text-white/80">"{suggestion.weak}"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-medium text-green-300 bg-green-500/20 px-2 py-1 rounded">
                        Strong Alternatives
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestion.alternatives.map((alt, altIndex) => (
                    <button
                      key={altIndex}
                      onClick={() => onApplySuggestion?.(suggestion.weak, alt)}
                      className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-200 hover:bg-green-500/30 transition-colors"
                      title={`Replace "${suggestion.weak}" with "${alt}"`}
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Pro Tips</h4>
            <ul className="text-sm text-purple-200/80 space-y-1">
              <li>
                • Use strong action verbs at the start of each bullet point (e.g., "Led",
                "Developed", "Achieved")
              </li>
              <li>
                • Avoid passive phrases like "responsible for" or "helped with" - be specific about
                what YOU did
              </li>
              <li>
                • Replace weak words with power words to stand out to both ATS systems and human
                recruiters
              </li>
              <li>
                • Click on any suggested alternative above to see how it could improve your resume
              </li>
            </ul>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
