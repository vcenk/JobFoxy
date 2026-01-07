// components/resume/studio/TemplatePreviewModal.tsx
// Full-screen modal for previewing resume templates in detail

'use client'

import React from 'react'
import { X, Check, Star, Zap } from 'lucide-react'
import type { ResumeTheme } from '@/lib/resumeThemes'
import { getCategoryInfo } from '@/lib/resumeThemes'

interface TemplatePreviewModalProps {
  theme: ResumeTheme
  isSelected: boolean
  onClose: () => void
  onSelect: () => void
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  theme,
  isSelected,
  onClose,
  onSelect,
}) => {
  const categoryInfo = getCategoryInfo(theme.category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex h-full">
          {/* Left: Large Preview */}
          <div className="flex-1 bg-white/5 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div
                className="aspect-[8.5/11] rounded-lg border-2 border-white/10 shadow-2xl overflow-hidden"
                style={{ backgroundColor: `${theme.color}10` }}
              >
                {/* Large SVG Preview */}
                <div className="w-full h-full flex items-center justify-center p-12">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 850 1100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-30"
                  >
                    {/* Document outline */}
                    <rect x="50" y="50" width="750" height="1000" rx="8" stroke={theme.color} strokeWidth="3" />

                    {/* Header section */}
                    <line x1="100" y1="120" x2="500" y2="120" stroke={theme.color} strokeWidth="8" strokeLinecap="round" />
                    <line x1="100" y1="150" x2="400" y2="150" stroke={theme.color} strokeWidth="4" strokeLinecap="round" />
                    <line x1="100" y1="170" x2="350" y2="170" stroke={theme.color} strokeWidth="3" strokeLinecap="round" />

                    {/* Section 1 */}
                    <rect x="100" y="220" width="200" height="5" rx="2" fill={theme.color} opacity="0.5" />
                    <rect x="100" y="245" width="650" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="260" width="620" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="275" width="600" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="290" width="580" height="3" rx="1" fill={theme.color} opacity="0.3" />

                    {/* Section 2 */}
                    <rect x="100" y="340" width="200" height="5" rx="2" fill={theme.color} opacity="0.5" />
                    <rect x="100" y="365" width="650" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="380" width="640" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="395" width="610" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="410" width="590" height="3" rx="1" fill={theme.color} opacity="0.3" />

                    {/* Section 3 */}
                    <rect x="100" y="460" width="200" height="5" rx="2" fill={theme.color} opacity="0.5" />
                    <rect x="100" y="485" width="300" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="500" width="280" height="3" rx="1" fill={theme.color} opacity="0.3" />

                    {/* Section 4 */}
                    <rect x="100" y="550" width="200" height="5" rx="2" fill={theme.color} opacity="0.5" />
                    <rect x="100" y="575" width="650" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="590" width="630" height="3" rx="1" fill={theme.color} opacity="0.3" />
                    <rect x="100" y="605" width="600" height="3" rx="1" fill={theme.color} opacity="0.3" />

                    {/* Accent elements based on category */}
                    {theme.category === 'modern' && (
                      <>
                        <line x1="750" y1="100" x2="750" y2="1000" stroke={theme.color} strokeWidth="8" opacity="0.3" />
                        <circle cx="750" cy="120" r="15" fill={theme.color} opacity="0.5" />
                      </>
                    )}
                    {theme.category === 'creative' && (
                      <>
                        <circle cx="700" cy="120" r="20" fill={theme.color} opacity="0.4" />
                        <circle cx="650" cy="120" r="15" fill={theme.color} opacity="0.3" />
                      </>
                    )}
                    {theme.category === 'minimal' && (
                      <line x1="100" y1="200" x2="750" y2="200" stroke={theme.color} strokeWidth="1" opacity="0.3" />
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details Panel */}
          <div className="w-[400px] bg-black/50 backdrop-blur-xl border-l border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{categoryInfo.icon}</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
                    >
                      {categoryInfo.label}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{theme.name}</h2>
                  <p className="text-sm text-white/70">{theme.description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ATS Score & Best For */}
              {(theme.atsScore || theme.bestFor) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {theme.atsScore && (
                    <div className="glass-panel p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-white/70">ATS Score</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{theme.atsScore}</span>
                        <span className="text-sm text-white/50">/10</span>
                      </div>
                      {/* Score bar */}
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${theme.atsScore * 10}%`,
                            backgroundColor: theme.atsScore >= 8 ? '#10B981' : theme.atsScore >= 6 ? '#F59E0B' : '#EF4444',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {theme.npm && (
                    <div className="glass-panel p-3 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">Premium</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Best For */}
              {theme.bestFor && theme.bestFor.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded-full" />
                    Best For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {theme.bestFor.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full" />
                  Key Features
                </h3>
                <div className="space-y-2">
                  {theme.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-sm text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Description */}
              <div>
                <h3 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-500 rounded-full" />
                  About {categoryInfo.label} Templates
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {categoryInfo.description}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => {
                  onSelect()
                  onClose()
                }}
                className={`
                  w-full py-4 rounded-xl font-semibold text-white transition-all shadow-lg
                  ${
                    isSelected
                      ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                      : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20'
                  }
                `}
              >
                {isSelected ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Currently Selected
                  </span>
                ) : (
                  'Use This Template'
                )}
              </button>

              {isSelected && (
                <button
                  onClick={onClose}
                  className="w-full mt-3 py-3 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  Close Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
