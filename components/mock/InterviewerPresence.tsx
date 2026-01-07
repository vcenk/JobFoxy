// components/mock/InterviewerPresence.tsx
// Visual representation of the AI interviewer

import { User, Sparkles } from 'lucide-react'

interface InterviewerPresenceProps {
  name: string
  title: string
  isActive: boolean
  gender?: 'male' | 'female' | 'neutral'
}

export default function InterviewerPresence({
  name,
  title,
  isActive,
  gender = 'neutral'
}: InterviewerPresenceProps) {
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/20">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div
            className={`
              w-32 h-32 rounded-full bg-gradient-to-br
              ${gender === 'female' ? 'from-pink-500 to-purple-500' : 'from-purple-500 to-blue-500'}
              flex items-center justify-center relative
              transition-all duration-300
              ${isActive ? 'scale-110 shadow-lg shadow-purple-500/50' : 'scale-100'}
            `}
          >
            <User className="w-16 h-16 text-white" />

            {/* Speaking Animation */}
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#1E1E2E] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </>
            )}
          </div>

          {/* Status Indicator */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-300'
                }
              `}
            >
              {isActive ? 'Speaking' : 'Listening'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 space-y-2">
          <h3 className="text-2xl font-bold text-white">{name}</h3>
          <p className="text-purple-400 font-medium">{title}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span>AI Interviewer</span>
          </div>
        </div>

        {/* Speaking Animation Bars */}
        {isActive && (
          <div className="mt-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-purple-400 rounded-full"
                style={{
                  height: `${12 + Math.random() * 20}px`,
                  animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
