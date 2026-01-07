// lib/types/resume.ts
import { JSONContent } from '@tiptap/core'

// Type alias for rich text fields (stored as Tiptap JSON)
export type RichText = JSONContent

export interface ParsedResume {
  contact: {
    name?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    github?: string
    portfolio?: string
  }
  targetTitle?: string  // Job title/position being targeted
  summary?: RichText  // Changed from string to RichText (JSON format)
  experience: Array<{
    company: string
    position: string
    location?: string
    startDate?: string
    endDate?: string
    current?: boolean
    bullets: RichText[]  // Changed from string[] to RichText[]
  }>
  education: Array<{
    institution: string
    degree: string
    field?: string
    graduationDate?: string
    gpa?: string
  }>
  skills: {
    technical?: string[]
    soft?: string[]
    other?: string[]
  }
  languages?: Array<{
    language: string
    fluency?: string
  }>
  certifications?: Array<{
    name: string
    issuer?: string
    date?: string
  }>
  projects?: Array<{
    name: string
    description: string
    technologies?: string[]
    link?: string
  }>
  awards?: Array<{
    title: string
    date?: string
    issuer?: string
    description?: string
  }>
  volunteer?: Array<{
    organization: string
    role: string
    startDate?: string
    endDate?: string
    current?: boolean
    description?: string
  }>
  publications?: Array<{
    title: string
    publisher?: string
    date?: string
    link?: string
    description?: string
  }>
}
