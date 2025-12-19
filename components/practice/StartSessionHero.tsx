// components/practice/StartSessionHero.tsx
// Hero section for starting new practice sessions

'use client'

import { motion } from 'framer-motion'
import { Mic, Sparkles, Play } from 'lucide-react'
import Link from 'next/link'

interface StartSessionHeroProps {
  canStartSession: boolean
  onStartClick?: () => void
  lastSessionId?: string | null
  sessionsUsed?: number
  sessionsLimit?: number
  isPro?: boolean
}

export function StartSessionHero({
  canStartSession,
  onStartClick,
  lastSessionId,
  sessionsUsed = 0,
  sessionsLimit = 5,
  isPro = false,
}: StartSessionHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 md:p-10 relative overflow-hidden group"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6"
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to ace your next interview?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/70 mb-8"
          >
            Practice with AI-powered feedback and master the STAR method
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {canStartSession ? (
              <Link
                href="/dashboard/practice/new"
                onClick={onStartClick}
                className="group/btn inline-flex items-center justify-center gap-3 px-8 py-4 glow-button text-white text-lg font-semibold rounded-xl transition-all"
              >
                <Sparkles className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                Start New Session
              </Link>
            ) : (
              <div className="space-y-3">
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white/50 text-lg font-semibold rounded-xl cursor-not-allowed"
                >
                  <Sparkles className="w-6 h-6" />
                  Start New Session
                </button>
                <p className="text-sm text-red-400">
                  Monthly limit reached ({sessionsUsed}/{sessionsLimit}).{' '}
                  <Link href="/dashboard/account?tab=billing" className="underline hover:text-red-300">
                    Upgrade to Pro
                  </Link>{' '}
                  for unlimited sessions.
                </p>
              </div>
            )}

            {lastSessionId && (
              <Link
                href={`/dashboard/practice/session/${lastSessionId}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-lg font-semibold rounded-xl transition-all border border-white/20"
              >
                <Play className="w-5 h-5" />
                Resume Last Session
              </Link>
            )}
          </motion.div>

          {/* Free tier indicator */}
          {!isPro && canStartSession && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-white/60 border border-white/10"
            >
              <div className="flex gap-1">
                {Array.from({ length: sessionsLimit }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < sessionsUsed ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <span>
                {sessionsUsed} / {sessionsLimit} sessions used this month
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
