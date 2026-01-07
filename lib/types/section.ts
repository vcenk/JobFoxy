// lib/types/section.ts
// Section-related types

export type ResumeSectionKey =
  | 'contact'
  | 'targetTitle'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'volunteer'
  | 'publications'
  | 'languages'

export interface SectionSettings {
  visible: boolean
  customTitle?: string
  listStyle?: 'disc' | 'circle' | 'square' | 'none'
  layout?: 'list' | 'grid' | 'columns'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}

export interface SectionComponentProps {
  isActive: boolean
  onClick: () => void
}
