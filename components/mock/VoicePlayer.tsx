// components/mock/VoicePlayer.tsx
// Handles audio playback and microphone recording

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react'

interface VoicePlayerProps {
  isAIPlaying: boolean
  isUserRecording: boolean
  isProcessing: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  audioLevel?: number
}

export default function VoicePlayer({
  isAIPlaying,
  isUserRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  audioLevel = 0
}: VoicePlayerProps) {
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="bg-[#1E1E2E] rounded-lg p-6">
      {/* AI Speaker Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">AI Interviewer</span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-[#2A2A3C] rounded-lg transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-purple-400" />
            )}
          </button>
        </div>

        <div className="relative h-16 bg-[#2A2A3C] rounded-lg overflow-hidden flex items-center justify-center">
          {isAIPlaying ? (
            <>
              {/* Audio Visualization */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-purple-500 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      opacity: 0.6 + Math.random() * 0.4,
                      animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 flex items-center gap-2 bg-[#1E1E2E]/80 px-4 py-2 rounded-full">
                <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-sm text-purple-400 font-medium">Speaking...</span>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-sm">Waiting to speak...</div>
          )}
        </div>
      </div>

      {/* User Microphone */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Your Response</span>
          {isUserRecording && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Recording
            </span>
          )}
        </div>

        <div className="relative h-16 bg-[#2A2A3C] rounded-lg overflow-hidden flex items-center justify-center">
          {isUserRecording ? (
            <>
              {/* Recording Visualization */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500 rounded-full transition-all duration-100"
                    style={{
                      height: `${(audioLevel || 0) * (50 + Math.random() * 30)}%`,
                      opacity: 0.5 + (audioLevel || 0) * 0.5
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 flex items-center gap-2 bg-[#1E1E2E]/80 px-4 py-2 rounded-full">
                <Mic className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-blue-400 font-medium">Listening...</span>
              </div>
            </>
          ) : isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-sm text-purple-400">Processing...</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Ready to record</div>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        {isUserRecording ? (
          <button
            onClick={onStopRecording}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-all flex items-center justify-center group relative"
          >
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <MicOff className="w-6 h-6 text-white relative z-10" />
          </button>
        ) : (
          <button
            onClick={onStartRecording}
            disabled={isAIPlaying || isProcessing}
            className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center group"
          >
            <Mic className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          {isAIPlaying
            ? 'Listen to the interviewer...'
            : isUserRecording
            ? 'Click the button to stop recording'
            : isProcessing
            ? 'Processing your response...'
            : 'Click the microphone to answer'}
        </p>
      </div>
    </div>
  )
}
