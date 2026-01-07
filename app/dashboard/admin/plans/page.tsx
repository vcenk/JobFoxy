'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import {
  Crown,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Infinity,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface SubscriptionPlan {
  id: string
  tier: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number | null
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  is_active: boolean
  resume_builds_limit: number
  job_analyses_limit: number
  audio_practice_sessions_limit: number
  video_mock_interviews_limit: number
  monthly_video_credits: number
  star_stories_limit: number
  swot_analyses_limit: number
  gap_defenses_limit: number
  intro_pitches_limit: number
  features: string[]
  analytics_level: string
  display_order: number
  badge_text: string | null
  badge_color: string | null
  highlight_features: string[]
  created_at: string
  updated_at: string
}

export default function AdminPlansPage() {
  const { user, profile } = useAuthStore()
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({})

  useEffect(() => {
    if (profile && !profile.is_admin) {
      router.push('/dashboard')
      return
    }

    if (user && profile?.is_admin) {
      fetchPlans()
    }
  }, [user, profile, router])

  const fetchPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/plans')
      const data = await response.json()

      if (response.status === 403) {
        setError('Access denied. Admin only.')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      if (data.success && data.data?.plans) {
        setPlans(data.data.plans)
      } else {
        setError(data.error || 'Failed to load plans')
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      setError('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (plan: SubscriptionPlan) => {
    setEditingId(plan.id)
    setEditForm(plan)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const savePlan = async () => {
    if (!editingId || !editForm) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchPlans()
        setEditingId(null)
        setEditForm({})
      } else {
        setError(data.error || 'Failed to save plan')
      }
    } catch (err) {
      console.error('Failed to save plan:', err)
      setError('Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof SubscriptionPlan, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    if (limit === 0) return 'None'
    return limit.toString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading subscription plans...</p>
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

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-400" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Subscription Plans
              </span>
            </h1>
            <p className="text-white/60 text-lg">
              Manage subscription tiers, limits, and pricing
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan, index) => {
          const isEditing = editingId === plan.id
          const displayPlan = isEditing ? (editForm as SubscriptionPlan) : plan

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={displayPlan.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="text-2xl font-bold text-white bg-white/5 border border-white/10 rounded px-3 py-1 w-full max-w-xs"
                      />
                      <input
                        type="text"
                        value={displayPlan.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="text-white/60 bg-white/5 border border-white/10 rounded px-3 py-1 w-full"
                        placeholder="Plan description"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.tier === 'premium'
                              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300'
                              : plan.tier === 'pro'
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {plan.tier.toUpperCase()}
                        </span>
                        {plan.badge_text && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                            {plan.badge_text}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60">{plan.description}</p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={savePlan}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-white font-medium disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(plan)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors text-white font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-white/60 text-sm mb-2 block">Monthly Price</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={displayPlan.price_monthly}
                      onChange={(e) => updateField('price_monthly', parseFloat(e.target.value))}
                      className="text-2xl font-bold text-white bg-white/5 border border-white/10 rounded px-3 py-1 w-full"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      ${plan.price_monthly.toFixed(2)}
                      <span className="text-sm text-white/60">/month</span>
                    </p>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-white/60 text-sm mb-2 block">Yearly Price</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={displayPlan.price_yearly || ''}
                      onChange={(e) => updateField('price_yearly', e.target.value ? parseFloat(e.target.value) : null)}
                      className="text-2xl font-bold text-white bg-white/5 border border-white/10 rounded px-3 py-1 w-full"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {plan.price_yearly ? (
                        <>
                          ${plan.price_yearly.toFixed(2)}
                          <span className="text-sm text-white/60">/year</span>
                        </>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Core Feature Limits */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-3">Core Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Resume Builds */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">Resume Builds</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.resume_builds_limit}
                        onChange={(e) => updateField('resume_builds_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.resume_builds_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.resume_builds_limit)}
                      </p>
                    )}
                    <p className="text-xs text-white/40 mt-1">-1 = unlimited, 0 = none</p>
                  </div>

                  {/* Job Analyses */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">Job Analyses</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.job_analyses_limit}
                        onChange={(e) => updateField('job_analyses_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.job_analyses_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.job_analyses_limit)}
                      </p>
                    )}
                  </div>

                  {/* Audio Practice Sessions */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">Practice Sessions</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.audio_practice_sessions_limit}
                        onChange={(e) => updateField('audio_practice_sessions_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.audio_practice_sessions_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.audio_practice_sessions_limit)}
                      </p>
                    )}
                  </div>

                  {/* Video Mocks */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">Video Mocks</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.video_mock_interviews_limit}
                        onChange={(e) => updateField('video_mock_interviews_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.video_mock_interviews_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.video_mock_interviews_limit)}
                      </p>
                    )}
                  </div>

                  {/* Monthly Credits */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">Monthly Credits</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.monthly_video_credits}
                        onChange={(e) => updateField('monthly_video_credits', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white">{plan.monthly_video_credits}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coaching Feature Limits */}
              <div>
                <h4 className="text-white font-semibold mb-3">Coaching Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* STAR Stories */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">STAR Stories</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.star_stories_limit}
                        onChange={(e) => updateField('star_stories_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.star_stories_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.star_stories_limit)}
                      </p>
                    )}
                  </div>

                  {/* SWOT Analyses */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">SWOT Analyses</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.swot_analyses_limit}
                        onChange={(e) => updateField('swot_analyses_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.swot_analyses_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.swot_analyses_limit)}
                      </p>
                    )}
                  </div>

                  {/* Gap Defenses */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">Gap Defenses</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.gap_defenses_limit}
                        onChange={(e) => updateField('gap_defenses_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.gap_defenses_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.gap_defenses_limit)}
                      </p>
                    )}
                  </div>

                  {/* Intro Pitches */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white/60 text-xs mb-2 block">Intro Pitches</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayPlan.intro_pitches_limit}
                        onChange={(e) => updateField('intro_pitches_limit', parseInt(e.target.value))}
                        className="text-lg font-bold text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white flex items-center gap-1">
                        {plan.intro_pitches_limit === -1 && <Infinity className="w-4 h-4" />}
                        {formatLimit(plan.intro_pitches_limit)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Analytics Level & Status */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-white/60 text-xs mb-2 block">Analytics Level</label>
                  {isEditing ? (
                    <select
                      value={displayPlan.analytics_level}
                      onChange={(e) => updateField('analytics_level', e.target.value)}
                      className="text-white bg-white/5 border border-white/10 rounded px-2 py-1 w-full"
                    >
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <p className="text-white capitalize">{plan.analytics_level}</p>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <label className="text-white/60 text-xs mb-2 block">Status</label>
                  {isEditing ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={displayPlan.is_active}
                        onChange={(e) => updateField('is_active', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-white">Active</span>
                    </label>
                  ) : (
                    <p
                      className={`${
                        plan.is_active ? 'text-green-400' : 'text-red-400'
                      } flex items-center gap-2`}
                    >
                      {plan.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
