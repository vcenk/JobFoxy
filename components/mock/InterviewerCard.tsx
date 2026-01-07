// components/mock/InterviewerCard.tsx
// Professional interviewer card with photo, name, and speaking indicator

'use client'

import Image from 'next/image'
import { User } from 'lucide-react'
import AudioWaveform from './AudioWaveform'

interface InterviewerCardProps {
    name: string
    title: string
    companyName?: string
    photoUrl?: string
    gender: 'male' | 'female' | 'neutral'
    isSpeaking: boolean
    isThinking: boolean
    isReady: boolean
    audioLevel?: number
}

export default function InterviewerCard({
    name,
    title,
    companyName,
    photoUrl,
    gender,
    isSpeaking,
    isThinking,
    isReady,
    audioLevel = 0
}: InterviewerCardProps) {
    // Determine ring state
    const getRingClasses = () => {
        if (isSpeaking) {
            return 'ring-4 ring-purple-500 shadow-[0_0_40px_rgba(139,92,246,0.5)]'
        }
        if (isThinking) {
            return 'ring-2 ring-purple-400/50 animate-pulse'
        }
        if (isReady) {
            return 'ring-2 ring-gray-600'
        }
        return 'ring-2 ring-gray-700'
    }

    // Gradient based on gender
    const gradientClasses = gender === 'female'
        ? 'from-pink-500/20 to-purple-500/20'
        : 'from-purple-500/20 to-blue-500/20'

    return (
        <div className="flex flex-col items-center justify-center p-8">
            {/* Interviewer Photo Container */}
            <div className="relative mb-8">
                {/* Speaking Ring Glow Effect */}
                {isSpeaking && (
                    <div className="absolute -inset-4 rounded-full bg-purple-500/20 blur-2xl animate-pulse" />
                )}

                {/* Photo Circle */}
                <div
                    className={`
            relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden
            transition-all duration-300
            ${getRingClasses()}
          `}
                >
                    {photoUrl ? (
                        <Image
                            src={photoUrl}
                            alt={name}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        // Fallback gradient avatar
                        <div className={`w-full h-full bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
                            <User className="w-28 h-28 text-white/60" />
                        </div>
                    )}
                </div>

                {/* Thinking Indicator */}
                {isThinking && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1a1a2e] px-4 py-1.5 rounded-full border border-purple-500/30">
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Audio Waveform */}
            <div className="w-80 md:w-96 mb-6">
                <AudioWaveform
                    isActive={isSpeaking}
                    audioLevel={audioLevel}
                    color="purple"
                    barCount={32}
                />
            </div>

            {/* Status Text Below Waveform */}
            {isReady && !isSpeaking && !isThinking && (
                <p className="text-gray-400 text-sm mb-4 animate-pulse">Your turn...</p>
            )}

            {/* Name & Title */}
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{name}</h2>
                <p className="text-gray-400 text-lg">
                    {title}
                    {companyName && (
                        <span className="text-purple-400"> at {companyName}</span>
                    )}
                </p>
            </div>
        </div>
    )
}
