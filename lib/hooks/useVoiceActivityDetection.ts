// lib/hooks/useVoiceActivityDetection.ts
// Voice Activity Detection hook using Web Audio API
// CONTINUOUS detection - never stops once started, just gates callbacks

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VADOptions {
    stream: MediaStream | null
    onSpeechStart?: () => void
    onSpeechEnd?: () => void
    silenceDelay?: number
    baseThreshold?: number
}

interface VADState {
    isActive: boolean      // Whether VAD is running (continuous)
    isSpeaking: boolean    // Whether speech is currently detected
    audioLevel: number
    threshold: number
    error: string | null
}

export function useVoiceActivityDetection(options: VADOptions) {
    const {
        stream,
        onSpeechStart,
        onSpeechEnd,
        silenceDelay = 2000,
        baseThreshold = 0.02
    } = options

    const [state, setState] = useState<VADState>({
        isActive: false,
        isSpeaking: false,
        audioLevel: 0,
        threshold: baseThreshold,
        error: null
    })

    // Audio refs
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    // Detection refs
    const isSpeakingRef = useRef(false)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const thresholdRef = useRef(baseThreshold)
    const smoothedRmsRef = useRef(0)

    // Callback refs (updated each render)
    const onSpeechStartRef = useRef(onSpeechStart)
    const onSpeechEndRef = useRef(onSpeechEnd)

    useEffect(() => {
        onSpeechStartRef.current = onSpeechStart
        onSpeechEndRef.current = onSpeechEnd
    }, [onSpeechStart, onSpeechEnd])

    // Start continuous VAD when stream becomes available
    useEffect(() => {
        if (!stream) return

        let isRunning = true

        const startVAD = async () => {
            try {
                console.log('[VAD] Initializing continuous VAD...')

                // Create AudioContext
                audioContextRef.current = new AudioContext()
                if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume()
                }
                console.log('[VAD] AudioContext state:', audioContextRef.current.state)

                // Setup analyser
                analyserRef.current = audioContextRef.current.createAnalyser()
                analyserRef.current.fftSize = 2048
                analyserRef.current.smoothingTimeConstant = 0.3

                // Connect stream
                sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
                sourceRef.current.connect(analyserRef.current)

                const dataArray = new Float32Array(analyserRef.current.fftSize)

                // Quick calibration (300ms)
                console.log('[VAD] Calibrating noise floor...')
                const samples: number[] = []
                const calStart = Date.now()

                const calibrate = () => {
                    if (!isRunning || !analyserRef.current) return

                    analyserRef.current.getFloatTimeDomainData(dataArray)
                    let sum = 0
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i] * dataArray[i]
                    }
                    samples.push(Math.sqrt(sum / dataArray.length))

                    if (Date.now() - calStart < 300) {
                        requestAnimationFrame(calibrate)
                    } else {
                        const avg = samples.reduce((a, b) => a + b, 0) / samples.length
                        // Lower threshold: just 3x noise floor, minimum baseThreshold
                        thresholdRef.current = Math.max(baseThreshold, avg * 3)
                        console.log('[VAD] ✅ Calibrated: noise=' + avg.toFixed(4) + ', threshold=' + thresholdRef.current.toFixed(4))

                        setState(prev => ({
                            ...prev,
                            isActive: true,
                            threshold: thresholdRef.current
                        }))

                        // Start continuous detection
                        detect()
                    }
                }

                // Main detection loop - NEVER STOPS
                const detect = () => {
                    if (!isRunning || !analyserRef.current) return

                    analyserRef.current.getFloatTimeDomainData(dataArray)

                    let sum = 0
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i] * dataArray[i]
                    }
                    const rawRms = Math.sqrt(sum / dataArray.length)

                    // Smooth RMS
                    smoothedRmsRef.current = 0.3 * smoothedRmsRef.current + 0.7 * rawRms
                    const rms = smoothedRmsRef.current

                    setState(prev => ({ ...prev, audioLevel: rms }))

                    const threshold = thresholdRef.current

                    if (rms > threshold) {
                        // Voice detected
                        if (silenceTimerRef.current) {
                            clearTimeout(silenceTimerRef.current)
                            silenceTimerRef.current = null
                        }

                        if (!isSpeakingRef.current) {
                            console.log('[VAD] 🎤 Speech START (RMS:', rms.toFixed(4), ')')
                            isSpeakingRef.current = true
                            setState(prev => ({ ...prev, isSpeaking: true }))
                            onSpeechStartRef.current?.()
                        }
                    } else {
                        // Silence
                        if (isSpeakingRef.current && !silenceTimerRef.current) {
                            silenceTimerRef.current = setTimeout(() => {
                                if (isSpeakingRef.current) {
                                    console.log('[VAD] 🔇 Speech END')
                                    isSpeakingRef.current = false
                                    setState(prev => ({ ...prev, isSpeaking: false }))
                                    onSpeechEndRef.current?.()
                                }
                                silenceTimerRef.current = null
                            }, silenceDelay)
                        }
                    }

                    animationFrameRef.current = requestAnimationFrame(detect)
                }

                calibrate()

            } catch (err) {
                console.error('[VAD] Error:', err)
                setState(prev => ({
                    ...prev,
                    error: err instanceof Error ? err.message : 'VAD failed'
                }))
            }
        }

        startVAD()

        // Cleanup only on unmount
        return () => {
            console.log('[VAD] Unmounting...')
            isRunning = false
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect()
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close()
            }
        }
    }, [stream, baseThreshold, silenceDelay])

    // Force reset speaking state (for external control)
    const resetSpeaking = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
        }
        isSpeakingRef.current = false
        setState(prev => ({ ...prev, isSpeaking: false }))
    }, [])

    return {
        ...state,
        resetSpeaking
    }
}
