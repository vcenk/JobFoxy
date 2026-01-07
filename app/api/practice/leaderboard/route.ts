// app/api/practice/leaderboard/route.ts
// Fetch leaderboard data for practice sessions

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/clients/supabaseClient'
import {
    getAuthUser,
    unauthorizedResponse,
    serverErrorResponse,
    successResponse,
} from '@/lib/utils/apiHelpers'

export async function GET(req: NextRequest) {
    const user = await getAuthUser(req)
    if (!user) return unauthorizedResponse()

    try {
        // Get all users with their practice stats
        // Using aggregated session data for privacy
        const { data: leaderboardData, error } = await supabaseAdmin
            .from('practice_sessions')
            .select(`
        user_id,
        status,
        average_score,
        created_at,
        profiles!inner (
          full_name
        )
      `)
            .eq('status', 'completed')
            .not('average_score', 'is', null)

        if (error) {
            console.error('[Leaderboard API] Database error:', error)
            return serverErrorResponse('Failed to fetch leaderboard')
        }

        // Aggregate data by user
        const userStats: Record<string, {
            userId: string
            displayName: string
            totalSessions: number
            averageScore: number
            streak: number
            scores: number[]
            dates: string[]
        }> = {}

        leaderboardData?.forEach((session: any) => {
            const userId = session.user_id
            if (!userStats[userId]) {
                // Create anonymized display name (First name + last initial)
                const fullName = session.profiles?.full_name || 'Anonymous'
                const parts = fullName.split(' ')
                const displayName = parts.length > 1
                    ? `${parts[0]} ${parts[parts.length - 1][0]}.`
                    : parts[0]

                userStats[userId] = {
                    userId,
                    displayName,
                    totalSessions: 0,
                    averageScore: 0,
                    streak: 0,
                    scores: [],
                    dates: []
                }
            }

            userStats[userId].totalSessions++
            if (session.average_score) {
                userStats[userId].scores.push(session.average_score)
            }
            userStats[userId].dates.push(session.created_at)
        })

        // Calculate averages and streaks
        Object.values(userStats).forEach(user => {
            // Average score
            if (user.scores.length > 0) {
                user.averageScore = Math.round(
                    user.scores.reduce((a, b) => a + b, 0) / user.scores.length
                )
            }

            // Calculate streak (consecutive days)
            const sortedDates = [...user.dates]
                .map(d => new Date(d).toDateString())
                .filter((v, i, a) => a.indexOf(v) === i) // unique dates
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

            let streak = 0
            let currentDate = new Date()
            currentDate.setHours(0, 0, 0, 0)

            for (const dateStr of sortedDates) {
                const sessionDate = new Date(dateStr)
                sessionDate.setHours(0, 0, 0, 0)
                const diffDays = Math.floor(
                    (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
                )
                if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
                    streak++
                    currentDate.setDate(currentDate.getDate() - 1)
                } else {
                    break
                }
            }
            user.streak = streak
        })

        // Create leaderboards
        const users = Object.values(userStats)

        const byStreak = [...users]
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 10)
            .map((u, i) => ({ rank: i + 1, ...u, isCurrentUser: u.userId === user.id }))

        const bySessions = [...users]
            .sort((a, b) => b.totalSessions - a.totalSessions)
            .slice(0, 10)
            .map((u, i) => ({ rank: i + 1, ...u, isCurrentUser: u.userId === user.id }))

        const byScore = [...users]
            .filter(u => u.totalSessions >= 3) // Minimum 3 sessions for score leaderboard
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 10)
            .map((u, i) => ({ rank: i + 1, ...u, isCurrentUser: u.userId === user.id }))

        // Find current user's ranks
        const currentUserStreak = users.find(u => u.userId === user.id)
        const currentUserRank = {
            streak: currentUserStreak
                ? users.sort((a, b) => b.streak - a.streak).findIndex(u => u.userId === user.id) + 1
                : null,
            sessions: currentUserStreak
                ? users.sort((a, b) => b.totalSessions - a.totalSessions).findIndex(u => u.userId === user.id) + 1
                : null,
            score: currentUserStreak && currentUserStreak.totalSessions >= 3
                ? users.filter(u => u.totalSessions >= 3).sort((a, b) => b.averageScore - a.averageScore).findIndex(u => u.userId === user.id) + 1
                : null,
        }

        return successResponse({
            leaderboards: {
                streak: byStreak,
                sessions: bySessions,
                score: byScore,
            },
            currentUserRank,
            totalUsers: users.length
        })
    } catch (error) {
        console.error('[Leaderboard API Error]:', error)
        return serverErrorResponse()
    }
}
