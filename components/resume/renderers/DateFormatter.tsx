// components/resume/renderers/DateFormatter.tsx
// Utility component for formatting dates

'use client'

import { useResume } from '@/contexts/ResumeContext'

interface DateFormatterProps {
  dateStr: string | undefined
  current?: boolean
}

export const DateFormatter: React.FC<DateFormatterProps> = ({ dateStr, current }) => {
  const { designerSettings } = useResume()

  if (current) return <>Present</>
  if (!dateStr) return null

  const date = new Date(dateStr)
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
    return <>{dateStr}</>
  }

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const monthPadded = String(month + 1).padStart(2, '0')

  switch (designerSettings.dateFormat) {
    case 'Month Year':
      const monthNameLong = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)
      return <>{`${monthNameLong} ${year}`}</>
    case 'Mon YYYY':
      const monthNameShort = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
      return <>{`${monthNameShort} ${year}`}</>
    case 'YYYY-MM':
      return <>{`${year}-${monthPadded}`}</>
    case 'YYYY':
      return <>{year}</>
    case 'MM/YYYY':
    default:
      return <>{`${monthPadded}/${year}`}</>
  }
}

export const formatDate = (dateStr: string | undefined, dateFormat: 'MM/YYYY' | 'Month Year' | 'Mon YYYY' | 'YYYY-MM' | 'YYYY'): string => {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
    return dateStr
  }

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const monthPadded = String(month + 1).padStart(2, '0')

  switch (dateFormat) {
    case 'Month Year':
      const monthNameLong = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)
      return `${monthNameLong} ${year}`
    case 'Mon YYYY':
      const monthNameShort = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
      return `${monthNameShort} ${year}`
    case 'YYYY-MM':
      return `${year}-${monthPadded}`
    case 'YYYY':
      return `${year}`
    case 'MM/YYYY':
    default:
      return `${monthPadded}/${year}`
  }
}
