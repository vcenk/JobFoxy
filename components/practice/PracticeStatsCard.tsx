// components/practice/PracticeStatsCard.tsx
// Stats card component for practice dashboard

'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface PracticeStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  gradient: string
  progress?: number // 0-100 for circular progress
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function PracticeStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  progress,
  trend,
}: PracticeStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-panel p-6 relative overflow-hidden group"
    >
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            {progress !== undefined ? (
              <CircularProgress value={progress} size={60} />
            ) : (
              <h3 className="text-3xl font-bold text-white">{value}</h3>
            )}
          </div>
          {subtitle && <p className="text-xs text-white/50 mt-2">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  )
}

// Circular progress component
function CircularProgress({ value, size = 60 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = (val: number) => {
    if (val >= 80) return '#10b981' // green
    if (val >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(value)}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{Math.round(value)}</span>
      </div>
    </div>
  )
}
