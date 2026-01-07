// lib/types/template.ts
// Type definitions for scalable template system

import { ParsedResume } from './resume'
import { DesignerSettings } from './designer'
import { SectionSettings, ResumeSectionKey } from './section'

/**
 * Layout Types - Different ways to arrange resume sections
 */
export type LayoutType =
  | 'single-column'      // Traditional single column
  | 'two-column'         // Two equal columns
  | 'sidebar-left'       // Sidebar on left (30-40% width)
  | 'sidebar-right'      // Sidebar on right (30-40% width)
  | 'three-column'       // Three columns (rare)
  | 'grid'               // CSS Grid layout
  | 'asymmetric'         // Custom asymmetric layout

/**
 * Section Placement - Where sections go in the layout
 */
export interface SectionPlacement {
  sectionId: ResumeSectionKey
  zone: 'header' | 'sidebar' | 'main' | 'footer' | 'column-1' | 'column-2' | 'column-3'
  order?: number // Optional ordering within zone
}

/**
 * Layout Zone Configuration
 */
export interface LayoutZone {
  id: string
  width?: string // CSS width (e.g., '35%', '300px', 'auto')
  backgroundColor?: string // Zone background color
  padding?: string // CSS padding
  align?: 'left' | 'center' | 'right'
  sections: ResumeSectionKey[] // Which sections go here
}

/**
 * Typography Configuration
 */
export interface TypographyConfig {
  headingFont?: string
  bodyFont?: string
  headingSize?: {
    h1?: string
    h2?: string
    h3?: string
  }
  bodySize?: string
  lineHeight?: number
  letterSpacing?: string
  headingWeight?: number
  bodyWeight?: number
  headingTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
}

/**
 * Color Scheme Configuration
 */
export interface ColorScheme {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  text?: string
  heading?: string
  muted?: string
  border?: string
}

/**
 * Spacing Configuration
 */
export interface SpacingConfig {
  sectionGap?: string
  itemGap?: string
  padding?: {
    page?: string
    section?: string
    zone?: string
  }
  margin?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
}

/**
 * Visual Style Configuration
 */
export interface VisualStyle {
  borderRadius?: string
  dividerStyle?: 'none' | 'solid' | 'dashed' | 'dotted'
  dividerColor?: string
  dividerThickness?: string
  shadows?: boolean
  headerStyle?: 'minimal' | 'bold' | 'underlined' | 'boxed' | 'filled'
  bulletStyle?: 'disc' | 'circle' | 'square' | 'dash' | 'arrow'
  iconStyle?: 'none' | 'outline' | 'solid' | 'duotone'
}

/**
 * Template Configuration - Defines a complete template
 * This is what makes templates scalable - they're just config!
 */
export interface TemplateConfig {
  // Metadata
  id: string
  name: string
  description: string
  category: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional' | 'bold'
  tags: string[]
  previewImage: string
  isPremium?: boolean

  // Layout
  layout: {
    type: LayoutType
    zones: LayoutZone[]
    headerSections?: ResumeSectionKey[] // Fixed header sections
    footerSections?: ResumeSectionKey[] // Fixed footer sections
  }

  // Design
  design: {
    colors?: ColorScheme
    typography?: TypographyConfig
    spacing?: SpacingConfig
    visual?: VisualStyle
  }

  // Behavior
  behavior?: {
    sectionOrdering?: 'fixed' | 'draggable' // Can user reorder sections?
    responsiveBreakpoint?: number // Width to switch to mobile layout
    printOptimized?: boolean // Special print styling
    atsOptimized?: boolean // ATS-friendly mode
  }

  // Customization - Which settings can users customize?
  customizable?: {
    colors?: boolean
    fonts?: boolean
    spacing?: boolean
    sectionOrder?: boolean
    layout?: boolean
  }
}

/**
 * Template Props - What every template component receives
 */
export interface TemplateProps {
  config: TemplateConfig
  resumeData: ParsedResume
  designerSettings: DesignerSettings
  sectionSettings: Record<ResumeSectionKey, SectionSettings>
  sectionOrder: ResumeSectionKey[]
  activeSection?: ResumeSectionKey
  onSectionClick?: (section: ResumeSectionKey) => void
}

/**
 * Template Metadata - For template gallery/selection
 */
export interface TemplateMetadata {
  id: string
  name: string
  description: string
  category: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional' | 'bold'
  tags: string[]
  previewImage: string
  isPremium?: boolean
  layoutType: LayoutType
  recommendedFor?: string[] // e.g., ['Tech', 'Creative', 'Executive']
  features?: string[]
  color?: string // Accent color for gallery card
}

/**
 * Template Registry Entry
 */
export interface TemplateRegistryEntry {
  config: TemplateConfig
  metadata: TemplateMetadata
}

/**
 * Section Rendering Options
 */
export interface SectionRenderOptions {
  showDivider?: boolean
  backgroundColor?: string
  textColor?: string
  headingColor?: string
  compact?: boolean
  bordered?: boolean
  shadowed?: boolean
}
