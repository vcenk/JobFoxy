// components/resume/studio/templates/ModernTemplate.tsx
'use client'

import React from 'react'
import { useResume } from '@/contexts/ResumeContext'
import { SECTION_REGISTRY } from '@/lib/sectionRegistry'
import { ResumePaper } from '../ResumePaper'
import { isRichTextEmpty } from '@/lib/utils/richTextHelpers'

// Define which sections go in the sidebar vs main content
const SIDEBAR_SECTIONS = ['contact', 'skills', 'education', 'languages', 'certifications', 'awards']
const MAIN_SECTIONS = ['targetTitle', 'summary', 'experience', 'projects', 'volunteer', 'publications']

export const ModernTemplate = () => {
  const {
    activeSection,
    sectionOrder,
    sectionSettings,
    resumeData,
    designerSettings,
  } = useResume()

  // Filter visible sections
  const visibleSections = sectionOrder.filter(sectionId => {
    const isVisible = sectionSettings[sectionId]?.visible !== false
    const isRegistered = !!SECTION_REGISTRY[sectionId]
    
    // Check for content
    const data = resumeData as any
    let hasContent = false
    
    switch (sectionId) {
      case 'contact': hasContent = !!(data.contact?.firstName || data.contact?.lastName || data.contact?.email); break;
      case 'targetTitle': hasContent = !!data.targetTitle; break;
      case 'summary': hasContent = !isRichTextEmpty(data.summary); break;
      case 'experience': hasContent = !!(data.experience?.length > 0); break;
      case 'education': hasContent = !!(data.education?.length > 0); break;
      case 'skills': hasContent = !!(data.skills?.technical?.length > 0 || data.skills?.soft?.length > 0); break;
      case 'projects': hasContent = !!(data.projects?.length > 0); break;
      case 'certifications': hasContent = !!(data.certifications?.length > 0); break;
      case 'awards': hasContent = !!(data.awards?.length > 0); break;
      case 'volunteer': hasContent = !!(data.volunteer?.length > 0); break;
      case 'publications': hasContent = !!(data.publications?.length > 0); break;
      case 'languages': hasContent = !!(data.languages?.length > 0); break;
      default: hasContent = false;
    }
    
    return isVisible && isRegistered && hasContent
  })

  const sidebarContent = visibleSections.filter(id => SIDEBAR_SECTIONS.includes(id))
  const mainContent = visibleSections.filter(id => MAIN_SECTIONS.includes(id))

  const renderSection = (sectionId: string, isSidebar: boolean) => {
    const SectionComponent = SECTION_REGISTRY[sectionId as keyof typeof SECTION_REGISTRY]
    if (!SectionComponent) return null

    return (
      <div key={sectionId} className={`mb-6 ${isSidebar ? 'text-white/90' : 'text-gray-800'}`}>
        <SectionComponent
          isActive={activeSection === sectionId}
          onClick={() => {}}
        />
      </div>
    )
  }

  // Define sidebar width and color based on designer settings
  const sidebarWidth = '35%'
  const sidebarColor = designerSettings.accentColor || '#2c3e50'

  return (
    <ResumePaper>
      <div className="flex min-h-full absolute inset-0">
        {/* Left Sidebar */}
        <div 
          className="h-full p-8 pt-12"
          style={{ 
            width: sidebarWidth, 
            backgroundColor: sidebarColor,
            color: 'white'
          }}
        >
          {/* Avatar / Name Placeholder could go here */}
          
          <div className="space-y-6">
            {sidebarContent.map(sectionId => renderSection(sectionId, true))}
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="h-full p-8 pt-12 flex-1 bg-white"
          style={{ paddingLeft: '2rem' }}
        >
           <div className="space-y-6">
            {mainContent.map(sectionId => renderSection(sectionId, false))}
          </div>
        </div>
      </div>
      
      {/* Overrides for sidebar styling */}
      <style jsx global>{`
        /* Sidebar specific overrides */
        .text-white\/90 h2, 
        .text-white\/90 h3, 
        .text-white\/90 h4,
        .text-white\/90 p,
        .text-white\/90 span,
        .text-white\/90 li {
          color: white !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        
        .text-white\/90 .text-gray-600,
        .text-white\/90 .text-gray-500,
        .text-white\/90 .text-gray-900 {
           color: rgba(255,255,255,0.9) !important;
        }

        /* Make sidebar headings standout */
        .text-white\/90 h2 {
           border-bottom: 1px solid rgba(255,255,255,0.3);
           padding-bottom: 0.5rem;
           margin-bottom: 1rem;
        }
      `}</style>
    </ResumePaper>
  )
}
