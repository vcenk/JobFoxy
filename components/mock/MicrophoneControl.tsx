// components/mock/MicrophoneControl.tsx
// VAD-enabled microphone control with visual states

'use client'

import { Mic, MicOff, Loader2 } from 'lucide-react'
import AudioWaveform from './AudioWaveform'

type MicState = 'disabled' | 'ready' | 'recording' | 'processing' | 'finishing'

interface MicrophoneControlProps {
    state: MicState
    audioLevel?: number
    onStartRecording: () => void
    onStopRecording: () => void
}

export default function MicrophoneControl({
    state,
    audioLevel = 0,
    onStartRecording,
    onStopRecording
}: MicrophoneControlProps) {
    const isRecording = state === 'recording' || state === 'finishing'
    const isDisabled = state === 'disabled' || state === 'processing'

    const getButtonClasses = () => {
        switch (state) {
            case 'disabled':
                return 'bg-gray-700 cursor-not-allowed'
            case 'ready':
                return 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_30px_rgba(139,92,246,0.4)] cursor-pointer'
            case 'recording':
                return 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer'
            case 'finishing':
                return 'bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer'
            case 'processing':
                return 'bg-purple-700 cursor-not-allowed'
            default:
                return 'bg-gray-700'
        }
    }

    const handleClick = () => {
        if (isDisabled) return

        if (isRecording) {
            onStopRecording()
        } else {
            onStartRecording()
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Recording Indicator */}
            {isRecording && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a2e] rounded-full border border-red-500/30">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-sm font-medium">
                        {state === 'finishing' ? 'Finishing...' : 'Recording'}
                    </span>
                </div>
            )}

            {/* Audio Level Visualization (during recording) */}
            {isRecording && (
                <div className="w-48">
                    <AudioWaveform
                        isActive={true}
                        audioLevel={audioLevel}
                        color="blue"
                        barCount={20}
                    />
                </div>
            )}

            {/* Main Mic Button */}
            <button
                onClick={handleClick}
                disabled={isDisabled}
                className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300
          ${getButtonClasses()}
        `}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {/* Pulse Animation for Ready State */}
                {state === 'ready' && (
                    <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-25" />
                )}

                {/* Pulse Animation for Recording */}
                {state === 'recording' && (
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                )}

                {/* Icon */}
                <div className="relative z-10">
                    {state === 'processing' ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : isRecording ? (
                        <MicOff className="w-8 h-8 text-white" />
                    ) : (
                        <Mic className="w-8 h-8 text-white" />
                    )}
                </div>
            </button>

            {/* Status Text */}
            <p className="text-gray-400 text-sm text-center">
                {state === 'disabled' && 'Wait for the interviewer...'}
                {state === 'ready' && 'Click or start speaking'}
                {state === 'recording' && 'Click to stop or pause to finish'}
                {state === 'finishing' && 'Wrapping up...'}
                {state === 'processing' && 'Processing your answer...'}
            </p>
        </div>
    )
}
