// components/resume/renderers/BaseSection.tsx
// Base wrapper for all resume sections

'use client'

import React, { ReactNode } from 'react'
import { useResume } from '@/contexts/ResumeContext'
import type { ResumeSectionKey } from '@/lib/sectionRegistry'

interface BaseSectionProps {
  sectionKey: ResumeSectionKey
  isActive: boolean
  onClick: () => void
  children: ReactNode
}

export const BaseSection: React.FC<BaseSectionProps> = ({
  sectionKey,
  isActive,
  onClick,
  children,
}) => {
  const { sectionSettings } = useResume()

  const getSectionClassName = () => {
    const baseClasses = 'print-avoid-break cursor-pointer transition-all p-2 rounded-lg print:p-0 print:rounded-none print:cursor-default'
    if (isActive) {
      return `${baseClasses} opacity-100 ring-2 ring-purple-500 print:ring-0 print:shadow-none print:opacity-100`
    }
    return `${baseClasses} opacity-90 hover:opacity-100 print:opacity-100`
  }

  return (
    <div
      data-resume-section={sectionKey}
      onClick={onClick}
      className={getSectionClassName()}
      style={{
        textAlign: sectionSettings[sectionKey]?.textAlign || 'left',
      }}
    >
      {children}
    </div>
  )
}
