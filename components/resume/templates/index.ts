// components/resume/templates/index.ts
// Central registry for all resume templates

import { ParsedResume } from '@/lib/types/resume'
import { MinimalTemplate, MinimalTemplateConfig } from './MinimalTemplate'

export interface TemplateConfig {
  id: string
  name: string
  description: string
  atsScore: number
  atsFriendly: boolean
  layout: 'single-column' | 'two-column'
  category: 'professional' | 'modern' | 'creative' | 'minimal'
  bestFor: string[]
  features: string[]
  fontFamily: string
  preview: string
  component: React.ComponentType<{ resumeData: ParsedResume }>
}

// Template registry - add new templates here
export const RESUME_TEMPLATES: Record<string, TemplateConfig> = {
  minimal: {
    ...MinimalTemplateConfig,
    component: MinimalTemplate
  },
  // More templates will be added here
  // modern: { ...ModernTemplateConfig, component: ModernTemplate },
  // professional: { ...ProfessionalTemplateConfig, component: ProfessionalTemplate },
}

// Helper to get template by ID
export function getTemplate(templateId: string | null): TemplateConfig | null {
  if (!templateId) return null
  return RESUME_TEMPLATES[templateId] || null
}

// Helper to get all templates
export function getAllTemplates(): TemplateConfig[] {
  return Object.values(RESUME_TEMPLATES)
}

// Helper to get templates by category
export function getTemplatesByCategory(category: string): TemplateConfig[] {
  return Object.values(RESUME_TEMPLATES).filter(t => t.category === category)
}

// Helper to get ATS-friendly templates (score >= 90)
export function getATSFriendlyTemplates(): TemplateConfig[] {
  return Object.values(RESUME_TEMPLATES).filter(t => t.atsScore >= 90)
}
