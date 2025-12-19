// components/practice/AudioVisualizer.tsx
// Interactive audio visualizer for practice sessions

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface AudioVisualizerProps {
  mode: 'ai-speaking' | 'user-recording' | 'processing' | 'idle'
  stream?: MediaStream | null
  className?: string
}

export function AudioVisualizer({ mode, stream, className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const [isActive, setIsActive] = useState(false)

  // Setup audio analysis for user recording
  useEffect(() => {
    if (mode === 'user-recording' && stream) {
      try {
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        analyserRef.current = analyser
        setIsActive(true)

        return () => {
          source.disconnect()
          audioContext.close()
          setIsActive(false)
        }
      } catch (error) {
        console.error('Failed to setup audio analyzer:', error)
      }
    } else {
      setIsActive(false)
    }
  }, [mode, stream])

  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (mode === 'user-recording' && analyserRef.current && isActive) {
        // User recording - frequency bars
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)

        const barCount = 64
        const barWidth = width / barCount
        const step = Math.floor(bufferLength / barCount)

        for (let i = 0; i < barCount; i++) {
          const dataIndex = i * step
          const barHeight = (dataArray[dataIndex] / 255) * height * 0.8
          const x = i * barWidth
          const y = height - barHeight

          // Gradient for bars
          const gradient = ctx.createLinearGradient(0, y, 0, height)
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)') // Green
          gradient.addColorStop(1, 'rgba(5, 150, 105, 0.6)') // Darker green

          ctx.fillStyle = gradient
          ctx.fillRect(x, y, barWidth - 2, barHeight)
        }
      } else if (mode === 'ai-speaking') {
        // AI speaking - smooth waveform
        const time = Date.now() / 1000
        const centerY = height / 2

        ctx.beginPath()
        ctx.moveTo(0, centerY)

        for (let x = 0; x < width; x++) {
          const y =
            centerY +
            Math.sin((x / width) * Math.PI * 4 + time * 2) * 20 * Math.sin(time * 3) +
            Math.sin((x / width) * Math.PI * 2 + time) * 10

          ctx.lineTo(x, y)
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.6)') // Purple
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.6)') // Blue

        ctx.strokeStyle = gradient
        ctx.lineWidth = 3
        ctx.stroke()

        // Add glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = 'rgba(139, 92, 246, 0.5)'
        ctx.stroke()
      } else if (mode === 'processing') {
        // Processing - rotating ring
        const time = Date.now() / 1000
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 4

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time * 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          const size = 4 + Math.sin(time * 4 + i) * 2

          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(139, 92, 246, ${0.5 + Math.sin(time * 3 + i) * 0.3})`
          ctx.fill()
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mode, isActive])

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full h-full ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </motion.div>
  )
}
