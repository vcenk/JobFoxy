// components/resume/templates/shared/TemplateLayout.tsx
// Layout building blocks for templates

'use client'

import React from 'react'
import { TemplateConfig, LayoutZone } from '@/lib/types/template'
import { ResumePaper } from '../../studio/ResumePaper'

interface TemplateLayoutProps {
  config: TemplateConfig
  children: React.ReactNode
  className?: string
}

/**
 * Main template wrapper - applies page-level styling
 */
export const TemplateLayout: React.FC<TemplateLayoutProps> = ({
  config,
  children,
  className = '',
}) => {
  const { design } = config

  const pageStyle: React.CSSProperties = {
    fontFamily: design.typography?.bodyFont || 'inherit',
    fontSize: design.typography?.bodySize || '16px',
    lineHeight: design.typography?.lineHeight || 1.5,
    color: design.colors?.text || '#000000',
    backgroundColor: design.colors?.background || '#FFFFFF',
  }

  return (
    <ResumePaper className={className} style={pageStyle}>
      {children}
    </ResumePaper>
  )
}

interface ZoneContainerProps {
  zone: LayoutZone
  config: TemplateConfig
  children: React.ReactNode
}

/**
 * Zone Container - Renders a layout zone (sidebar, main, etc.)
 */
export const ZoneContainer: React.FC<ZoneContainerProps> = ({
  zone,
  config,
  children,
}) => {
  const { design } = config

  // Build zone styles from config
  const zoneStyle: React.CSSProperties = {
    width: zone.width || 'auto',
    padding: zone.padding || design.spacing?.padding?.zone || '1rem',
    backgroundColor: zone.backgroundColor?.replace('var(--accent-color)', design.colors?.accent || '#8B5CF6') || 'transparent',
    textAlign: zone.align || 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: design.spacing?.sectionGap || '1.5rem',
  }

  return (
    <div className="template-zone" style={zoneStyle} data-zone={zone.id}>
      {children}
    </div>
  )
}

interface LayoutContainerProps {
  config: TemplateConfig
  children: React.ReactNode
}

/**
 * Layout Container - Arranges zones based on layout type
 */
export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  config,
  children,
}) => {
  const { layout } = config

  // Build container styles based on layout type
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100%',
  }

  // Adjust flex direction based on layout type
  switch (layout.type) {
    case 'single-column':
      containerStyle.flexDirection = 'column'
      break
    case 'two-column':
    case 'sidebar-left':
    case 'sidebar-right':
      containerStyle.flexDirection = 'row'
      break
    case 'three-column':
      containerStyle.flexDirection = 'row'
      break
    default:
      containerStyle.flexDirection = 'column'
  }

  // Reverse for right sidebar
  if (layout.type === 'sidebar-right') {
    containerStyle.flexDirection = 'row-reverse'
  }

  return (
    <div className="template-layout-container" style={containerStyle}>
      {children}
    </div>
  )
}

interface SectionContainerProps {
  config: TemplateConfig
  isHeader?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Section Container - Wraps individual sections with spacing and styling
 */
export const SectionContainer: React.FC<SectionContainerProps> = ({
  config,
  isHeader = false,
  className = '',
  children,
}) => {
  const { design } = config

  const sectionStyle: React.CSSProperties = {
    marginBottom: isHeader ? '0' : (design.spacing?.itemGap || '1rem'),
  }

  return (
    <div className={`template-section ${className}`} style={sectionStyle}>
      {children}
    </div>
  )
}

interface SectionHeaderProps {
  config: TemplateConfig
  title: string
  icon?: React.ReactNode
}

/**
 * Section Header - Renders section titles with config-based styling
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  config,
  title,
  icon,
}) => {
  const { design } = config

  const headerStyle: React.CSSProperties = {
    fontFamily: design.typography?.headingFont || design.typography?.bodyFont || 'inherit',
    fontSize: design.typography?.headingSize?.h2 || '1.5rem',
    fontWeight: design.typography?.headingWeight || 700,
    color: design.colors?.heading || design.colors?.text || '#000000',
    marginBottom: design.spacing?.itemGap || '1rem',
    textTransform: design.typography?.headingTransform || 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }

  // Apply header style variants
  const wrapperStyle: React.CSSProperties = {}

  if (design.visual?.headerStyle === 'underlined') {
    wrapperStyle.borderBottom = `2px solid ${design.colors?.primary || '#000000'}`
    wrapperStyle.paddingBottom = '0.5rem'
  } else if (design.visual?.headerStyle === 'boxed') {
    wrapperStyle.border = `1px solid ${design.colors?.border || '#E5E7EB'}`
    wrapperStyle.padding = '0.5rem 1rem'
  } else if (design.visual?.headerStyle === 'filled') {
    wrapperStyle.backgroundColor = design.colors?.primary || '#8B5CF6'
    wrapperStyle.color = '#FFFFFF'
    wrapperStyle.padding = '0.5rem 1rem'
    wrapperStyle.borderRadius = design.visual?.borderRadius || '4px'
    headerStyle.color = '#FFFFFF'
  }

  return (
    <div style={wrapperStyle}>
      <h2 style={headerStyle}>
        {icon && design.visual?.iconStyle !== 'none' && <span>{icon}</span>}
        {title}
      </h2>
    </div>
  )
}

interface DividerProps {
  config: TemplateConfig
}

/**
 * Section Divider - Renders dividers between sections
 */
export const Divider: React.FC<DividerProps> = ({ config }) => {
  const { design } = config

  if (design.visual?.dividerStyle === 'none') {
    return null
  }

  const dividerStyle: React.CSSProperties = {
    borderTop: `${design.visual?.dividerThickness || '1px'} ${design.visual?.dividerStyle || 'solid'} ${design.visual?.dividerColor || design.colors?.border || '#E5E7EB'}`,
    margin: `${design.spacing?.sectionGap || '1.5rem'} 0`,
  }

  return <hr style={dividerStyle} />
}
