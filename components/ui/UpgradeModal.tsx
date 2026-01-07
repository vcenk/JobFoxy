'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Zap, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  requiredTier?: 'Pro' | 'Premium'
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredTier = 'Pro' }: UpgradeModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    router.push('/dashboard/account?tab=subscription')
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header with decorative gradient */}
            <div className="relative bg-gradient-to-br from-purple-900/50 to-gray-900 p-6 text-center border-b border-white/10">
              <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Upgrade to {requiredTier}</h2>
              <p className="text-sm text-gray-400">Unlock more {featureName}</p>
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Unlimited Resume Builds</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Unlimited AI Analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Access to Premium Voices</span>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
              >
                View Plans & Upgrade
              </button>
              
              <p className="text-center text-xs text-gray-500">
                Starting at just $15/month
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
