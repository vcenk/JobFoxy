// components/mock/PhaseIndicator.tsx
// Shows current interview phase with progress

import { MessageCircle, Building2, HelpCircle, CheckCircle } from 'lucide-react'

export type InterviewPhase = 'welcome' | 'small_talk' | 'company_intro' | 'questions' | 'wrap_up' | 'completed'

interface PhaseIndicatorProps {
  currentPhase: InterviewPhase
  currentQuestionIndex?: number
  totalQuestions?: number
}

const PHASES = [
  { id: 'welcome', label: 'Welcome', icon: MessageCircle },
  { id: 'small_talk', label: 'Small Talk', icon: MessageCircle },
  { id: 'company_intro', label: 'Company Intro', icon: Building2 },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'wrap_up', label: 'Wrap-up', icon: CheckCircle },
  { id: 'completed', label: 'Completed', icon: CheckCircle }
] as const

export default function PhaseIndicator({
  currentPhase,
  currentQuestionIndex = 0,
  totalQuestions = 0
}: PhaseIndicatorProps) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase)

  return (
    <div className="bg-[#1E1E2E] rounded-lg p-4">
      {/* Phase Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Interview Progress
          </span>
          <span className="text-sm text-gray-400">
            {currentPhase === 'questions' && totalQuestions > 0
              ? `Question ${currentQuestionIndex + 1}/${totalQuestions}`
              : PHASES.find(p => p.id === currentPhase)?.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-[#2A2A3C] rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / PHASES.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Phase Steps */}
      <div className="flex items-center justify-between">
        {PHASES.map((phase, index) => {
          const Icon = phase.icon
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={phase.id} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isActive ? 'bg-purple-600 text-white scale-110' : ''}
                  ${isCompleted ? 'bg-green-500/20 text-green-400' : ''}
                  ${isFuture ? 'bg-[#2A2A3C] text-gray-500' : ''}
                `}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`
                  text-xs font-medium hidden md:block
                  ${isActive ? 'text-purple-400' : ''}
                  ${isCompleted ? 'text-green-400' : ''}
                  ${isFuture ? 'text-gray-500' : ''}
                `}
              >
                {phase.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
