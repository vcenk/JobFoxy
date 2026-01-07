// components/resume/studio/ResumeCanvas.tsx
// Simplified Resume Canvas using Section Registry with Drag & Drop

'use client'

import React, { useEffect, useState } from 'react'
import { useResume } from '@/contexts/ResumeContext'
import { SECTION_REGISTRY } from '@/lib/sectionRegistry'
import { ResumePaper } from './ResumePaper'
import { SectionDivider } from '../renderers'
import { isRichTextEmpty } from '@/lib/utils/richTextHelpers'
import { ModernTemplate } from './templates/ModernTemplate'
import { TemplateById } from '../templates/TemplateRenderer'
import { getTemplateConfig } from '@/lib/templates/templateConfigs'
import { getTemplate } from '../templates'
import { Reorder } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { ZoomControls } from './ZoomControls'

// Import section components to trigger registration
import '@/components/resume/sections'

export const ResumeCanvas = () => {
  const {
    activeSection,
    sectionOrder,
    setSectionOrder,
    sectionSettings,
    selectedJsonResumeTheme,
    renderedThemeHtml,
    isThemeLoading,
    resumeData,
    setIsThemeLoading,
    setRenderedThemeHtml,
    designerSettings,
    selectedTemplate,
  } = useResume()

  // Get the selected ATS-friendly template
  const atsTemplate = getTemplate(selectedTemplate)

  // Zoom state
  const [zoom, setZoom] = useState(100)

  // Scroll to section on click
  useEffect(() => {
    const el = document.querySelector(`[data-resume-section="${activeSection}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeSection])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault()
          setZoom((prev) => Math.min(200, prev + 10))
        } else if (e.key === '-') {
          e.preventDefault()
          setZoom((prev) => Math.max(50, prev - 10))
        } else if (e.key === '0') {
          e.preventDefault()
          setZoom(100)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch JSON Resume theme if selected (and not native)
  useEffect(() => {
    const fetchThemedResume = async () => {
      if (selectedJsonResumeTheme && selectedJsonResumeTheme !== 'jobfoxy-modern' && resumeData) {
        setIsThemeLoading(true)
        setRenderedThemeHtml(null)

        try {
          const response = await fetch('/api/resume/render-theme', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resumeData, themeName: selectedJsonResumeTheme }),
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
          }

          const html = await response.text()
          setRenderedThemeHtml(html)
        } catch (error) {
          console.error('Failed to render JSON Resume theme:', error)
          setRenderedThemeHtml(`
            <div style="padding: 20px; color: red; text-align: center;">
              Error loading theme: ${selectedJsonResumeTheme}. Please check console for details.
            </div>
          `)
        } finally {
          setIsThemeLoading(false)
        }
      } else if (!selectedJsonResumeTheme) {
        setRenderedThemeHtml(null)
      }
    }

    fetchThemedResume()
  }, [resumeData, selectedJsonResumeTheme, setIsThemeLoading, setRenderedThemeHtml])

  // Render ATS-friendly custom template if selected
  if (atsTemplate && atsTemplate.component && selectedTemplate !== 'classic') {
    const TemplateComponent = atsTemplate.component
    return (
      <>
        <div className="flex-1 h-full overflow-y-auto p-8 flex items-start justify-center bg-gray-900/50 relative">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <TemplateComponent resumeData={resumeData} />
          </div>
        </div>
        <ZoomControls zoom={zoom} onZoomChange={setZoom} />
      </>
    )
  }

  // Check if selected theme is a config-based template
  if (selectedJsonResumeTheme) {
    const templateConfig = getTemplateConfig(selectedJsonResumeTheme)

    if (templateConfig) {
      // Use new scalable template system
      return (
        <>
          <div className="flex-1 h-full overflow-y-auto p-8 flex items-start justify-center bg-gray-900/50 relative">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <TemplateById
                templateId={selectedJsonResumeTheme}
                resumeData={resumeData}
                designerSettings={designerSettings}
                sectionSettings={sectionSettings}
                sectionOrder={sectionOrder}
                activeSection={activeSection}
                onSectionClick={() => {}}
              />
            </div>
          </div>
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </>
      )
    }
  }

  // Legacy: Native React Template (Modern) - kept for backwards compatibility
  if (selectedJsonResumeTheme === 'jobfoxy-modern') {
    return (
      <>
        <div className="flex-1 h-full overflow-y-auto p-8 flex items-start justify-center bg-gray-900/50 relative">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <ModernTemplate />
          </div>
        </div>
        <ZoomControls zoom={zoom} onZoomChange={setZoom} />
      </>
    )
  }

  // Render JSON Resume theme if selected
  if (selectedJsonResumeTheme) {
    return (
      <>
        <div className="flex-1 h-full overflow-y-auto p-8 flex items-start justify-center bg-gray-900/50 relative">
          {isThemeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-lg z-10">
              Loading {selectedJsonResumeTheme} theme...
            </div>
          )}
          {renderedThemeHtml && (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <iframe
                id="resume-theme-iframe"
                title="JSON Resume Theme Preview"
                srcDoc={renderedThemeHtml}
                className="resume-paper w-[8.5in] shadow-2xl bg-white border-none"
                style={{
                  width: '8.5in',
                  height: '11in',
                  overflow: 'hidden',
                  border: 'none'
                }}
                scrolling="no"
              />
            </div>
          )}
          {!isThemeLoading && !renderedThemeHtml && selectedJsonResumeTheme && (
            <div className="text-gray-400 text-lg">Failed to load theme.</div>
          )}
        </div>
        <ZoomControls zoom={zoom} onZoomChange={setZoom} />
      </>
    )
  }

  // Render JobFoxy custom resume builder
  const headerSections = ['contact', 'targetTitle']
  const sidebarSections = [
    'education',
    'skills',
    'projects',
    'certifications',
    'awards',
    'volunteer',
    'publications',
    'languages',
  ]

  // Filter sections based on visibility and registration
  const visibleSections = sectionOrder.filter(sectionId => {
    const isVisible = sectionSettings[sectionId]?.visible !== false
    const isRegistered = !!SECTION_REGISTRY[sectionId]
    return isVisible && isRegistered
  })

  // Check if a section has content
  const sectionHasContent = (sectionId: string): boolean => {
    const data = resumeData as any

    switch (sectionId) {
      case 'contact':
        return !!(data.contact && (data.contact.firstName || data.contact.lastName || data.contact.email))
      case 'targetTitle':
        return !!(data.targetTitle)
      case 'summary':
        // Use isRichTextEmpty helper to properly validate Tiptap content
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

  // Filter sections that have actual content
  const sectionsWithContent = visibleSections.filter(sectionHasContent)

  const headerContent = sectionsWithContent.filter(id => headerSections.includes(id))
  const mainColContent: typeof sectionsWithContent = []
  const sideColContent: typeof sectionsWithContent = []

  if (designerSettings.columns === 2) {
    sectionsWithContent.forEach(id => {
      if (headerSections.includes(id)) return
      if (sidebarSections.includes(id)) {
        sideColContent.push(id)
      } else {
        mainColContent.push(id)
      }
    })
  }

  const renderSection = (sectionId: string, isDraggable: boolean = true) => {
    const SectionComponent = SECTION_REGISTRY[sectionId as keyof typeof SECTION_REGISTRY]
    if (!SectionComponent) return null

    return (
      <div className="group relative">
        {/* Drag Handle - Only show on hover */}
        {isDraggable && (
          <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
            <GripVertical className="w-5 h-5 text-gray-400 hover:text-purple-500" />
          </div>
        )}

        <SectionComponent
          isActive={activeSection === sectionId}
          onClick={() => {}}
        />
      </div>
    )
  }

  // Check if there's content after header sections
  const hasBodyContent = sectionsWithContent.some(id => !headerSections.includes(id))

  // For drag & drop, we need to reorder the full list
  const bodySections = sectionsWithContent.filter(id => !headerSections.includes(id))

  return (
    <>
      <div className="flex-1 h-full overflow-y-auto p-8 flex items-start justify-center bg-gray-900/50">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          <ResumePaper>
        {/* Render header sections (non-draggable) */}
        {headerContent.map((sectionId, index) => (
          <React.Fragment key={sectionId}>
            {renderSection(sectionId, false)}
            {index < headerContent.length - 1 && <SectionDivider />}
          </React.Fragment>
        ))}

        {/* Only show divider if there's header content AND body content */}
        {headerContent.length > 0 && hasBodyContent && <SectionDivider />}

        {/* Render main content with drag & drop reordering */}
        {designerSettings.columns === 2 ? (
          <div className="flex space-x-8">
            {/* Main Column - Draggable */}
            <Reorder.Group
              axis="y"
              values={mainColContent}
              onReorder={(newOrder) => {
                // Merge with header and sidebar sections
                const newSectionOrder = [
                  ...headerSections.filter(id => sectionsWithContent.includes(id as any)),
                  ...newOrder,
                  ...sideColContent,
                ]
                // Only keep sections that are in the original sectionOrder
                const finalOrder = sectionOrder.map(id =>
                  newSectionOrder.includes(id) ? id : id
                ).filter((id, idx, arr) => arr.indexOf(id) === idx && newSectionOrder.includes(id))

                setSectionOrder([
                  ...headerSections,
                  ...finalOrder.filter(id => !headerSections.includes(id) && !sidebarSections.includes(id)),
                  ...sidebarSections,
                ] as any)
              }}
              className="w-2/3"
            >
              {mainColContent.map((sectionId, index) => (
                <Reorder.Item key={sectionId} value={sectionId} className="mb-6">
                  {renderSection(sectionId)}
                  {index < mainColContent.length - 1 && <SectionDivider />}
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {/* Sidebar Column - Draggable */}
            <Reorder.Group
              axis="y"
              values={sideColContent}
              onReorder={(newOrder) => {
                // Merge with header and main sections
                const newSectionOrder = [
                  ...headerSections.filter(id => sectionsWithContent.includes(id as any)),
                  ...mainColContent,
                  ...newOrder,
                ]
                const finalOrder = sectionOrder.map(id =>
                  newSectionOrder.includes(id) ? id : id
                ).filter((id, idx, arr) => arr.indexOf(id) === idx && newSectionOrder.includes(id))

                setSectionOrder([
                  ...headerSections,
                  ...mainColContent,
                  ...finalOrder.filter(id => sidebarSections.includes(id)),
                ] as any)
              }}
              className="w-1/3"
            >
              {sideColContent.map((sectionId, index) => (
                <Reorder.Item key={sectionId} value={sectionId} className="mb-6">
                  {renderSection(sectionId)}
                  {index < sideColContent.length - 1 && <SectionDivider />}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        ) : (
          /* Single Column - Draggable */
          <Reorder.Group
            axis="y"
            values={bodySections}
            onReorder={(newOrder) => {
              setSectionOrder([
                ...headerSections,
                ...newOrder,
              ] as any)
            }}
          >
            {bodySections.map((sectionId, index) => (
              <Reorder.Item key={sectionId} value={sectionId}>
                {renderSection(sectionId)}
                {index < bodySections.length - 1 && <SectionDivider />}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
          </ResumePaper>
        </div>
      </div>
      <ZoomControls zoom={zoom} onZoomChange={setZoom} />
    </>
  )
}
