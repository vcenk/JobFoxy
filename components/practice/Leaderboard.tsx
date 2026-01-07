// components/practice/Leaderboard.tsx
// Displays practice leaderboards with multiple ranking categories

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Target, TrendingUp, Crown, Medal, Award, Loader2 } from 'lucide-react'

interface LeaderboardEntry {
    rank: number
    userId: string
    displayName: string
    totalSessions: number
    averageScore: number
    streak: number
    isCurrentUser: boolean
}

interface LeaderboardData {
    leaderboards: {
        streak: LeaderboardEntry[]
        sessions: LeaderboardEntry[]
        score: LeaderboardEntry[]
    }
    currentUserRank: {
        streak: number | null
        sessions: number | null
        score: number | null
    }
    totalUsers: number
}

type LeaderboardType = 'streak' | 'sessions' | 'score'

export function Leaderboard() {
    const [data, setData] = useState<LeaderboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<LeaderboardType>('streak')

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('/api/practice/leaderboard')
            const result = await response.json()
            if (result.success && result.data) {
                setData(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'streak' as const, label: 'Streaks', icon: Flame, color: 'text-orange-400' },
        { id: 'sessions' as const, label: 'Sessions', icon: TrendingUp, color: 'text-emerald-400' },
        { id: 'score' as const, label: 'Top Scores', icon: Target, color: 'text-purple-400' },
    ]

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
        if (rank === 2) return { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-500/20' }
        if (rank === 3) return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-500/20' }
        return null
    }

    const getValue = (entry: LeaderboardEntry, type: LeaderboardType) => {
        switch (type) {
            case 'streak': return `${entry.streak} days`
            case 'sessions': return `${entry.totalSessions} sessions`
            case 'score': return `${entry.averageScore}%`
        }
    }

    if (loading) {
        return (
            <div className="glass-panel p-6 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
        )
    }

    if (!data) return null

    const currentLeaderboard = data.leaderboards[activeTab]
    const currentUserRank = data.currentUserRank[activeTab]

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Leaderboard</h3>
                    <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-full">
                        {data.totalUsers} practitioners
                    </span>
                </div>
                {currentUserRank && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold">
                        Your Rank: #{currentUserRank}
                    </span>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        {currentLeaderboard.length === 0 ? (
                            <p className="text-white/40 text-sm text-center py-8">
                                No data yet. Be the first!
                            </p>
                        ) : (
                            currentLeaderboard.map((entry, index) => {
                                const badge = getRankBadge(entry.rank)
                                return (
                                    <motion.div
                                        key={entry.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${entry.isCurrentUser
                                            ? 'bg-purple-500/20 border border-purple-500/30'
                                            : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Rank */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${badge ? badge.bg : 'bg-white/5'
                                                }`}>
                                                {badge ? (
                                                    <badge.icon className={`w-4 h-4 ${badge.color}`} />
                                                ) : (
                                                    <span className="text-sm font-bold text-white/40">{entry.rank}</span>
                                                )}
                                            </div>

                                            {/* Name */}
                                            <div>
                                                <p className={`text-sm font-medium ${entry.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                                                    {entry.displayName}
                                                    {entry.isCurrentUser && <span className="ml-2 text-[10px] text-purple-400">(You)</span>}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Value */}
                                        <span className={`text-sm font-bold ${entry.isCurrentUser ? 'text-purple-300' : 'text-white/70'
                                            }`}>
                                            {getValue(entry, activeTab)}
                                        </span>
                                    </motion.div>
                                )
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
