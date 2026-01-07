// components/resume/templates/TemplateRenderer.tsx
// Universal template renderer - renders any template from config
// This is what makes the system scalable!

'use client'

import React from 'react'
import { TemplateProps } from '@/lib/types/template'
import { SECTION_REGISTRY } from '@/lib/sectionRegistry'
import { ResumeSectionKey } from '@/lib/types/section'
import { isRichTextEmpty } from '@/lib/utils/richTextHelpers'
import {
  TemplateLayout,
  LayoutContainer,
  ZoneContainer,
  SectionContainer,
} from './shared/TemplateLayout'

export const TemplateRenderer: React.FC<TemplateProps> = ({
  config,
  resumeData,
  designerSettings,
  sectionSettings,
  sectionOrder,
  activeSection,
  onSectionClick,
}) => {
  /**
   * Check if a section has content
   */
  const sectionHasContent = (sectionId: ResumeSectionKey): boolean => {
    const data = resumeData as any

    switch (sectionId) {
      case 'contact':
        return !!(data.contact && (data.contact.firstName || data.contact.lastName || data.contact.email))
      case 'targetTitle':
        return !!data.targetTitle
      case 'summary':
        return !isRichTextEmpty(data.summary)
      case 'experience':
        return !!(data.experience && data.experience.length > 0)
      case 'education':
        return !!(data.education && data.education.length > 0)
      case 'skills':
        return !!(data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0 || data.skills.other?.length > 0))
      case 'projects':
        return !!(data.projects && data.projects.length > 0)
      case 'certifications':
        return !!(data.certifications && data.certifications.length > 0)
      case 'awards':
        return !!(data.awards && data.awards.length > 0)
      case 'volunteer':
        return !!(data.volunteer && data.volunteer.length > 0)
      case 'publications':
        return !!(data.publications && data.publications.length > 0)
      case 'languages':
        return !!(data.languages && data.languages.length > 0)
      default:
        return false
    }
  }

  /**
   * Filter sections that are visible and have content
   */
  const getVisibleSections = (sectionIds: ResumeSectionKey[]): ResumeSectionKey[] => {
    return sectionIds.filter(sectionId => {
      const isVisible = sectionSettings[sectionId]?.visible !== false
      const isRegistered = !!SECTION_REGISTRY[sectionId]
      const hasContent = sectionHasContent(sectionId)
      return isVisible && isRegistered && hasContent
    })
  }

  /**
   * Render a single section
   */
  const renderSection = (sectionId: ResumeSectionKey) => {
    const SectionComponent = SECTION_REGISTRY[sectionId]
    if (!SectionComponent) return null

    return (
      <SectionContainer
        key={sectionId}
        config={config}
        data-section-id={sectionId}
      >
        <SectionComponent
          isActive={activeSection === sectionId}
          onClick={() => onSectionClick?.(sectionId)}
        />
      </SectionContainer>
    )
  }

  /**
   * Render header sections (if any)
   */
  const renderHeaderSections = () => {
    if (!config.layout.headerSections || config.layout.headerSections.length === 0) {
      return null
    }

    const visibleHeaders = getVisibleSections(config.layout.headerSections)
    if (visibleHeaders.length === 0) return null

    return (
      <div className="template-header" style={{ marginBottom: config.design.spacing?.sectionGap || '1.5rem' }}>
        {visibleHeaders.map(renderSection)}
      </div>
    )
  }

  /**
   * Render footer sections (if any)
   */
  const renderFooterSections = () => {
    if (!config.layout.footerSections || config.layout.footerSections.length === 0) {
      return null
    }

    const visibleFooters = getVisibleSections(config.layout.footerSections)
    if (visibleFooters.length === 0) return null

    return (
      <div className="template-footer" style={{ marginTop: config.design.spacing?.sectionGap || '1.5rem' }}>
        {visibleFooters.map(renderSection)}
      </div>
    )
  }

  /**
   * Render a zone with its sections
   */
  const renderZone = (zone: typeof config.layout.zones[0]) => {
    const visibleSections = getVisibleSections(zone.sections)
    if (visibleSections.length === 0) return null

    return (
      <ZoneContainer key={zone.id} zone={zone} config={config}>
        {visibleSections.map(renderSection)}
      </ZoneContainer>
    )
  }

  /**
   * Main render
   */
  return (
    <TemplateLayout config={config}>
      {/* Header sections */}
      {renderHeaderSections()}

      {/* Main layout with zones */}
      <LayoutContainer config={config}>
        {config.layout.zones.map(renderZone)}
      </LayoutContainer>

      {/* Footer sections */}
      {renderFooterSections()}
    </TemplateLayout>
  )
}

/**
 * Export convenience component that takes template ID
 */
interface TemplateByIdProps extends Omit<TemplateProps, 'config'> {
  templateId: string
}

export const TemplateById: React.FC<TemplateByIdProps> = ({
  templateId,
  ...props
}) => {
  const { getTemplateConfig } = require('@/lib/templates/templateConfigs')
  const config = getTemplateConfig(templateId)

  if (!config) {
    return (
      <div className="p-8 text-center text-red-500">
        Template not found: {templateId}
      </div>
    )
  }

  return <TemplateRenderer config={config} {...props} />
}
