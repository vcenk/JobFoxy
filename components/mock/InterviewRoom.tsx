// components/mock/InterviewRoom.tsx
// Main Zoom-style interview room container

'use client'

import { LogOut } from 'lucide-react'
import InterviewerCard from './InterviewerCard'
import MicrophoneControl from './MicrophoneControl'

interface InterviewRoomProps {
    // Interviewer info
    interviewerName: string
    interviewerTitle: string
    interviewerGender: 'male' | 'female' | 'neutral'
    interviewerPhoto?: string
    companyName?: string

    // State
    isAISpeaking: boolean
    isAIThinking: boolean
    isUserRecording: boolean
    isProcessing: boolean
    isFinishing: boolean
    aiAudioLevel?: number
    userAudioLevel?: number

    // Callbacks
    onStartRecording: () => void
    onStopRecording: () => void
    onEndInterview: () => void
}

export default function InterviewRoom({
    interviewerName,
    interviewerTitle,
    interviewerGender,
    interviewerPhoto,
    companyName,
    isAISpeaking,
    isAIThinking,
    isUserRecording,
    isProcessing,
    isFinishing,
    aiAudioLevel = 0,
    userAudioLevel = 0,
    onStartRecording,
    onStopRecording,
    onEndInterview
}: InterviewRoomProps) {
    // Determine mic state
    const getMicState = (): 'disabled' | 'ready' | 'recording' | 'processing' | 'finishing' => {
        if (isProcessing) return 'processing'
        if (isFinishing) return 'finishing'
        if (isUserRecording) return 'recording'
        if (isAISpeaking || isAIThinking) return 'disabled'
        return 'ready'
    }

    // Determine interviewer ready state (waiting for user to speak)
    const isInterviewerReady = !isAISpeaking && !isAIThinking && !isUserRecording && !isProcessing

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a14] via-[#0f0f1a] to-[#1a0a1a] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img
                        src="/JobFoxyDark.svg"
                        alt="JobFoxy"
                        className="h-8 w-auto"
                    />
                </div>

                {/* Company Name (if available) */}
                {companyName && (
                    <div className="text-gray-400 text-sm">
                        Interview with <span className="text-white font-medium">{companyName}</span>
                    </div>
                )}

                {/* End Interview */}
                <button
                    onClick={onEndInterview}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">End Interview</span>
                </button>
            </header>

            {/* Main Content - Centered Interviewer Card */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-xl">
                    {/* Glassmorphism Card */}
                    <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/10 to-pink-900/10 border border-purple-500/20 rounded-3xl overflow-hidden">
                        <InterviewerCard
                            name={interviewerName}
                            title={interviewerTitle}
                            companyName={companyName}
                            photoUrl={interviewerPhoto}
                            gender={interviewerGender}
                            isSpeaking={isAISpeaking}
                            isThinking={isAIThinking}
                            isReady={isInterviewerReady}
                            audioLevel={aiAudioLevel}
                        />
                    </div>
                </div>
            </main>

            {/* Bottom Controls */}
            <footer className="pb-8 pt-4">
                <div className="flex justify-center">
                    <div className="backdrop-blur-xl bg-[#1a1a2e]/80 border border-gray-700/50 rounded-2xl px-8 py-6">
                        <MicrophoneControl
                            state={getMicState()}
                            audioLevel={userAudioLevel}
                            onStartRecording={onStartRecording}
                            onStopRecording={onStopRecording}
                        />
                    </div>
                </div>
            </footer>
        </div>
    )
}
