// components/resume/analysis/OptimizeConfirmModal.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Zap, Target, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

interface OptimizeConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    bulletImprovementsCount: number
    missingKeywordsCount: number
    weakWordsCount?: number
    isLoading?: boolean
}

export function OptimizeConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    bulletImprovementsCount,
    missingKeywordsCount,
    weakWordsCount = 0,
    isLoading = false,
}: OptimizeConfirmModalProps) {
    if (!isOpen) return null

    const optimizations = [
        {
            icon: Zap,
            title: 'Strengthen Language',
            description: 'Replace weak words with powerful action verbs',
            count: weakWordsCount > 0 ? `~${weakWordsCount} improvements` : 'Auto-detect',
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
        },
        {
            icon: FileText,
            title: 'Improve Bullets',
            description: 'Rewrite bullet points for maximum impact',
            count: `${bulletImprovementsCount} suggestions`,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: Target,
            title: 'Add Keywords',
            description: 'Inject missing ATS keywords into skills',
            count: `${missingKeywordsCount} keywords`,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: Sparkles,
            title: 'AI Enhancement',
            description: 'Use AI to optimize summary and content',
            count: 'Powered by AI',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Gradient header */}
                            <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 p-6">
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                                <div className="relative flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">AI Resume Optimization</h2>
                                        <p className="text-sm text-white/80">Enhance your resume with AI-powered improvements</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-white/70">
                                    This will automatically rewrite your resume based on the analysis.
                                    The following optimizations will be applied:
                                </p>

                                {/* Optimization list */}
                                <div className="space-y-3">
                                    {optimizations.map((opt, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                                        >
                                            <div className={`p-2 rounded-lg ${opt.bgColor}`}>
                                                <opt.icon className={`w-4 h-4 ${opt.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-white">{opt.title}</div>
                                                <div className="text-xs text-white/50 truncate">{opt.description}</div>
                                            </div>
                                            <div className={`text-xs font-medium ${opt.color}`}>
                                                {opt.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Warning */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-200/80">
                                        Your resume will be updated in-place. You can always undo changes by refreshing without saving.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-3 p-6 pt-0">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Optimizing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Optimize Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
