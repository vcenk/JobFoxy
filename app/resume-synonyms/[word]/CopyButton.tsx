// app/resume-synonyms/[word]/CopyButton.tsx
'use client'

import { Copy } from 'lucide-react'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  return (
    <button
      onClick={handleCopy}
      className="group bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-xl p-4 transition-all text-left"
      title={`Click to copy "${text}"`}
    >
      <div className="text-green-200 group-hover:text-green-100 font-medium mb-1">{text}</div>
      <div className="flex items-center text-xs text-white/40 group-hover:text-white/60">
        <Copy className="w-3 h-3 mr-1" />
        <span>Click to copy</span>
      </div>
    </button>
  )
}
