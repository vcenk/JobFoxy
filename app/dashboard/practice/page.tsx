// app/dashboard/practice/page.tsx
// Practice Dashboard - Command Center for Interview Preparation

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  Target,
  TrendingUp,
  Clock,
  Grid3x3,
  List,
  Filter,
  Loader2,
  Mic,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { PracticeStatsCard } from '@/components/practice/PracticeStatsCard'
import { SessionCard } from '@/components/practice/SessionCard'
import { StartSessionHero } from '@/components/practice/StartSessionHero'

interface PracticeSession {
  id: string
  session_type: string
  difficulty_level: string
  status: string
  overall_score: number | null
  total_questions: number
  questions_answered: number
  created_at: string
  duration_minutes?: number
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'behavioral' | 'technical' | 'leadership'

export default function PracticePage() {
  const { user, profile } = useAuthStore()
  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<FilterType>('all')

  // Fetch sessions on mount
  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/practice/summary')
      const data = await response.json()

      if (data.success && data.sessions) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        streak: 0,
        averageScore: 0,
        totalCompleted: 0,
        sessionsThisMonth: profile?.practice_sessions_this_month || 0,
        trend: 0,
      }
    }

    // Calculate streak (consecutive days practiced)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.created_at)
      sessionDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === streak || (streak === 0 && diffDays === 0)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate average score
    const completedSessions = sessions.filter(
      (s) => s.status === 'completed' && s.overall_score !== null
    )
    const averageScore =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) /
          completedSessions.length
        : 0

    // Calculate trend (last 5 vs previous 5)
    const recentScores = completedSessions.slice(0, 5).map((s) => s.overall_score || 0)
    const previousScores = completedSessions.slice(5, 10).map((s) => s.overall_score || 0)

    const recentAvg = recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 0
    const previousAvg = previousScores.length > 0
      ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length
      : 0

    const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0

    return {
      streak,
      averageScore,
      totalCompleted: completedSessions.length,
      sessionsThisMonth: profile?.practice_sessions_this_month || 0,
      trend,
    }
  }, [sessions, profile])

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (filter === 'all') return sessions

    return sessions.filter((session) => {
      const type = session.session_type.toLowerCase()
      return type.includes(filter)
    })
  }, [sessions, filter])

  // Check if user can start new session
  const canStartSession = () => {
    if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
      return true
    }
    return (profile?.practice_sessions_this_month || 0) < 5
  }

  // Handle session deletion
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this practice session?')) {
      return
    }

    try {
      const response = await fetch(`/api/practice/session/${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId))
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  // Get last incomplete session
  const lastIncompleteSession = sessions.find((s) => s.status !== 'completed')

  const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Stats Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Practice Command Center
          </h1>
          <p className="text-white/60 text-lg">
            Master your interview skills with AI-powered feedback
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PracticeStatsCard
            title="Practice Streak"
            value={stats.streak}
            subtitle={stats.streak === 1 ? '1 day' : `${stats.streak} days`}
            icon={Flame}
            gradient="from-orange-500 to-red-500"
          />

          <PracticeStatsCard
            title="Average Score"
            value={Math.round(stats.averageScore)}
            icon={Target}
            gradient="from-purple-500 to-pink-500"
            progress={stats.averageScore}
            trend={
              stats.trend !== 0
                ? {
                    value: Math.round(stats.trend),
                    isPositive: stats.trend > 0,
                  }
                : undefined
            }
          />

          <PracticeStatsCard
            title="Sessions Completed"
            value={stats.totalCompleted}
            subtitle="Total practice sessions"
            icon={TrendingUp}
            gradient="from-green-500 to-emerald-500"
          />

          {!isPro && (
            <PracticeStatsCard
              title="Monthly Usage"
              value={`${stats.sessionsThisMonth} / 5`}
              subtitle="Free tier limit"
              icon={Clock}
              gradient="from-blue-500 to-cyan-500"
              progress={(stats.sessionsThisMonth / 5) * 100}
            />
          )}

          {isPro && (
            <PracticeStatsCard
              title="Pro Member"
              value="∞"
              subtitle="Unlimited sessions"
              icon={TrendingUp}
              gradient="from-yellow-500 to-orange-500"
            />
          )}
        </div>
      </div>

      {/* Quick Start Hero */}
      <div className="mb-12">
        <StartSessionHero
          canStartSession={canStartSession()}
          lastSessionId={lastIncompleteSession?.id}
          sessionsUsed={stats.sessionsThisMonth}
          sessionsLimit={5}
          isPro={isPro}
        />
      </div>

      {/* Session History */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mic className="w-6 h-6 text-purple-400" />
            My STAR Practices
          </h2>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="glass-panel p-1 flex gap-1">
              {(['all', 'behavioral', 'technical', 'leadership'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    filter === f
                      ? 'bg-purple-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="glass-panel p-1 flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Display */}
        {loading ? (
          <div className="glass-panel p-12 text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading your practice sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-12 text-center"
          >
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'all' ? 'No practice sessions yet' : `No ${filter} sessions found`}
            </h3>
            <p className="text-white/60 mb-6">
              {filter === 'all'
                ? 'Start your first session to improve your interview skills'
                : 'Try selecting a different filter or start a new session'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all"
              >
                Show All Sessions
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            {/* List View Header */}
            {viewMode === 'list' && (
              <div className="glass-panel p-4 mb-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-white/50">
                  <div className="col-span-3">Session</div>
                  <div className="col-span-2 text-center">Questions</div>
                  <div className="col-span-2">Score</div>
                  <div className="col-span-2">Duration</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
              </div>
            )}

            {/* Sessions Grid/List */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-3'
              }
            >
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SessionCard
                    session={session}
                    onDelete={handleDeleteSession}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
