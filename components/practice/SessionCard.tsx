// components/practice/SessionCard.tsx
// Session card component for practice history

'use client'

import { motion } from 'framer-motion'
import { Play, Eye, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface SessionCardProps {
  session: {
    id: string
    title: string
    question_category: string
    status: string
    average_score: number | null
    total_questions: number
    completed_questions: number
    created_at: string
    started_at?: string
    completed_at?: string
  }
  onDelete?: (id: string) => void
  viewMode?: 'grid' | 'list'
}

export function SessionCard({ session, onDelete, viewMode = 'grid' }: SessionCardProps) {
  const getStatusInfo = () => {
    if (session.status === 'completed') {
      return {
        label: 'Completed',
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: CheckCircle2,
      }
    }
    return {
      label: 'In Progress',
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      icon: AlertCircle,
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    return 'bg-red-500/20 text-red-300 border-red-500/30'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-4 hover:bg-white/5 transition-all group"
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Session Name */}
          <div className="col-span-3">
            <h3 className="text-white font-medium">{session.title}</h3>
            <p className="text-xs text-white/50 capitalize">{session.question_category}</p>
          </div>

          {/* Questions */}
          <div className="col-span-2 text-center">
            <p className="text-white/70">
              {session.completed_questions} / {session.total_questions}
            </p>
          </div>

          {/* Score */}
          <div className="col-span-2">
            {session.average_score !== null ? (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreBadgeColor(
                  session.average_score
                )}`}
              >
                <span className="font-bold">{Math.round(session.average_score)}</span>
              </div>
            ) : (
              <span className="text-white/50 text-sm">N/A</span>
            )}
          </div>

          {/* Duration */}
          <div className="col-span-2">
            {session.started_at && session.completed_at ? (
              <p className="text-white/70 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)}m
              </p>
            ) : (
              <span className="text-white/50 text-sm">-</span>
            )}
          </div>

          {/* Date */}
          <div className="col-span-2">
            <p className="text-white/70 text-sm">{formatDate(session.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex gap-2 justify-end">
            <Link
              href={`/dashboard/practice/session/${session.id}`}
              className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-all"
            >
              {session.status === 'completed' ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(session.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-panel p-6 relative overflow-hidden group"
    >
      {/* Background gradient on hover */}
      {session.average_score !== null && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(
            session.average_score
          )} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{session.title}</h3>
            <p className="text-sm text-white/50 capitalize">{session.question_category}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Questions</span>
            <span className="text-white font-medium">
              {session.completed_questions} / {session.total_questions}
            </span>
          </div>

          {session.average_score !== null && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/60">Score</span>
                <span className="text-white font-bold">{Math.round(session.average_score)}/100</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getScoreColor(session.average_score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${session.average_score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Date</span>
            <span className="text-white/70">{formatDate(session.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/practice/session/${session.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all"
          >
            {session.status === 'completed' ? (
              <>
                <Eye className="w-4 h-4" />
                View Report
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Continue
              </>
            )}
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(session.id)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
