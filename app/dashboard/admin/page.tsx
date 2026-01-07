'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import {
  Users,
  FileText,
  Mail,
  Mic,
  Video,
  Briefcase,
  BookOpen,
  TrendingUp,
  Activity,
  Shield,
  Loader2,
  Crown,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Settings,
  Coins,
  ToggleLeft,
  Database,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface UserData {
  id: string
  email: string
  full_name: string | null
  created_at: string
  subscription_status: string
  subscription_tier: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  resume_builds_this_month: number
  job_analyses_this_month: number
  audio_practice_sessions_this_month: number
  mock_interviews_this_month: number
  monthly_video_credits: number
  purchased_video_credits: number
  last_login_at: string | null
}

interface Analytics {
  totals: {
    users: number
    resumes: number
    coverLetters: number
    practiceSessions: number
    mockInterviews: number
    jobDescriptions: number
    starStories: number
    swotAnalyses: number
  }
  subscriptions: {
    free: number
    active: number
    trialing: number
    canceled: number
    past_due: number
  }
  practices: {
    completed: number
    in_progress: number
    abandoned: number
    avgScore: number
  }
  mocks: {
    completed: number
    in_progress: number
    planned: number
    abandoned: number
    avgScore: number
  }
  recentActivity: {
    users: any[]
    resumes: any[]
  }
  allUsers: UserData[]
}

export default function AdminPage() {
  const { user, profile } = useAuthStore()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // Redirect if not admin
    if (profile && !profile.is_admin) {
      router.push('/dashboard')
      return
    }

    if (user && profile?.is_admin) {
      fetchAnalytics()
    }
  }, [user, profile, router])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()

      if (response.status === 403) {
        setError('Access denied. Admin only.')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      if (data.success && data.data?.analytics) {
        setAnalytics(data.data.analytics)
      } else {
        setError(data.error || 'Failed to load analytics')
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-panel p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  // Filter and search users
  const filteredUsers = (analytics.allUsers || []).filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier

    const matchesStatus = filterStatus === 'all' || user.subscription_status === filterStatus

    return matchesSearch && matchesTier && matchesStatus
  })

  // Export users to CSV
  const exportToCSV = () => {
    const headers = [
      'Email',
      'Name',
      'Subscription Tier',
      'Status',
      'Created At',
      'Last Login',
      'Resumes',
      'Practices',
      'Mocks',
      'Credits',
    ]

    const rows = filteredUsers.map((user) => [
      user.email,
      user.full_name || '',
      user.subscription_tier,
      user.subscription_status || 'free',
      new Date(user.created_at).toLocaleDateString(),
      user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
      user.resume_builds_this_month,
      user.audio_practice_sessions_this_month,
      user.mock_interviews_this_month,
      user.monthly_video_credits + user.purchased_video_credits,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobfoxy-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h1>
            <p className="text-white/60 text-lg">
              System analytics and overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-panel px-4 py-2 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Admin Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Management Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          Management Center
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subscription Plans */}
          <Link href="/dashboard/admin/plans">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-1">Subscription Plans</h3>
              <p className="text-white/60 text-sm">Manage pricing, limits, and features</p>
            </motion.div>
          </Link>

          {/* Credit Packs */}
          <Link href="/dashboard/admin/credit-packs">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Coins className="w-5 h-5 text-green-400" />
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-1">Credit Packs</h3>
              <p className="text-white/60 text-sm">Manage video credit packages</p>
            </motion.div>
          </Link>

          {/* Feature Flags */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4 cursor-pointer group opacity-50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ToggleLeft className="w-5 h-5 text-blue-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-white font-semibold mb-1">Feature Flags</h3>
            <p className="text-white/60 text-sm">Coming soon - Toggle features</p>
          </motion.div>

          {/* Resume Examples */}
          <Link href="/dashboard/admin/examples">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-1">Resume Examples</h3>
              <p className="text-white/60 text-sm">Manage SEO resume library</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.users}</p>
        </motion.div>

        {/* Total Resumes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Resumes Created</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.resumes}</p>
        </motion.div>

        {/* Practice Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Mic className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Practice Sessions</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.practiceSessions}</p>
        </motion.div>

        {/* Mock Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Video className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Mock Interviews</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.mockInterviews}</p>
        </motion.div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Cover Letters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Cover Letters</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.coverLetters}</p>
        </motion.div>

        {/* Job Descriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Job Descriptions</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.jobDescriptions}</p>
        </motion.div>

        {/* STAR Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">STAR Stories</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.starStories}</p>
        </motion.div>

        {/* SWOT Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">SWOT Analyses</h3>
          <p className="text-4xl font-bold text-white">{analytics.totals.swotAnalyses}</p>
        </motion.div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-panel p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Subscriptions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Free</span>
              <span className="text-white font-bold">{analytics.subscriptions.free}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Active</span>
              <span className="text-green-400 font-bold">{analytics.subscriptions.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Trialing</span>
              <span className="text-blue-400 font-bold">{analytics.subscriptions.trialing}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Canceled</span>
              <span className="text-yellow-400 font-bold">{analytics.subscriptions.canceled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Past Due</span>
              <span className="text-red-400 font-bold">{analytics.subscriptions.past_due}</span>
            </div>
          </div>
        </motion.div>

        {/* Practice Sessions Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-panel p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-green-400" />
            Practice Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white/60">Completed</span>
              </div>
              <span className="text-white font-bold">{analytics.practices.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white/60">In Progress</span>
              </div>
              <span className="text-white font-bold">{analytics.practices.in_progress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-white/60">Abandoned</span>
              </div>
              <span className="text-white font-bold">{analytics.practices.abandoned}</span>
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-white/60">Avg Score</span>
                </div>
                <span className="text-purple-400 font-bold text-xl">
                  {analytics.practices.avgScore}/100
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mock Interviews Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="glass-panel p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-orange-400" />
            Mock Interview Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white/60">Completed</span>
              </div>
              <span className="text-white font-bold">{analytics.mocks.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white/60">In Progress</span>
              </div>
              <span className="text-white font-bold">{analytics.mocks.in_progress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-white/60">Planned</span>
              </div>
              <span className="text-white font-bold">{analytics.mocks.planned}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-white/60">Abandoned</span>
              </div>
              <span className="text-white font-bold">{analytics.mocks.abandoned}</span>
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-white/60">Avg Score</span>
                </div>
                <span className="text-orange-400 font-bold text-xl">
                  {analytics.mocks.avgScore}/100
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="glass-panel p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Recent Users
          </h3>
          <div className="space-y-3">
            {analytics.recentActivity.users && analytics.recentActivity.users.length > 0 ? (
              analytics.recentActivity.users.map((user: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.email}</p>
                    <p className="text-xs text-white/40">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.subscription_status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : user.subscription_status === 'trialing'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {user.subscription_status || 'free'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm">No recent users</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Resumes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-panel p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Recent Resumes
          </h3>
          <div className="space-y-3">
            {analytics.recentActivity.resumes && analytics.recentActivity.resumes.length > 0 ? (
              analytics.recentActivity.resumes.map((resume: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{resume.title}</p>
                    <p className="text-xs text-white/40">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm">No recent resumes</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* User Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="glass-panel p-6 mt-8"
      >
        {/* Header with Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              User Management
              <span className="text-sm font-normal text-white/60 ml-2">
                ({filteredUsers.length} users)
              </span>
            </h3>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-white font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Tier Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="canceled">Canceled</option>
                <option value="past_due">Past Due</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Tier</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Joined</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Last Login</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-white/60">Resumes</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-white/60">Practices</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-white/60">Mocks</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-white/60">Credits</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {/* Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/40" />
                      <span className="text-white text-sm">{user.email}</span>
                    </div>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <span className="text-white/80 text-sm">
                      {user.full_name || '-'}
                    </span>
                  </td>

                  {/* Tier */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscription_tier === 'premium'
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300'
                          : user.subscription_tier === 'pro'
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscription_status === 'active'
                          ? 'bg-green-500/20 text-green-300'
                          : user.subscription_status === 'trialing'
                          ? 'bg-blue-500/20 text-blue-300'
                          : user.subscription_status === 'canceled'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : user.subscription_status === 'past_due'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}
                    >
                      {user.subscription_status || 'free'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-white/40" />
                      <span className="text-white/60 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  {/* Last Login */}
                  <td className="py-3 px-4">
                    <span className="text-white/60 text-xs">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </td>

                  {/* Resumes */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-white font-medium text-sm">
                      {user.resume_builds_this_month}
                    </span>
                  </td>

                  {/* Practices */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-white font-medium text-sm">
                      {user.audio_practice_sessions_this_month}
                    </span>
                  </td>

                  {/* Mocks */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-white font-medium text-sm">
                      {user.mock_interviews_this_month}
                    </span>
                  </td>

                  {/* Credits */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CreditCard className="w-3 h-3 text-white/40" />
                      <span className="text-white font-medium text-sm">
                        {user.monthly_video_credits + user.purchased_video_credits}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No users found matching your filters</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
