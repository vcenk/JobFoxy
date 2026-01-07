// components/resume/sections/ContactSection.tsx
'use client'

import { useResume } from '@/contexts/ResumeContext'
import { BaseSection } from '../renderers'
import type { SectionComponentProps } from '@/lib/sectionRegistry'

export const ContactSection: React.FC<SectionComponentProps> = ({ isActive, onClick }) => {
  const { resumeData, designerSettings, setActiveSection, setInspectorTab, sectionSettings } = useResume()
  
  // Get alignment from settings, default to center for contact info as it usually looks best
  const alignment = sectionSettings.contact?.textAlign || 'center'

  const handleClick = () => {
    setActiveSection('contact')
    setInspectorTab('content')
    onClick()
  }

  // Helper to join items with separators
  const renderJoinedItems = (items: (string | undefined | null)[]) => {
    return items.filter(Boolean).map((item, index, array) => (
      <span key={index}>
        {item}
        {index < array.length - 1 && <span className="mx-2 text-gray-400">|</span>}
      </span>
    ))
  }

  const contactInfo = [
    resumeData.contact.email,
    resumeData.contact.phone,
    resumeData.contact.location,
    resumeData.contact.linkedin,
    resumeData.contact.github,
    resumeData.contact.portfolio
  ]

  // Construct the name to display
  const displayName = resumeData.contact.name || 
    [resumeData.contact.firstName, resumeData.contact.lastName].filter(Boolean).join(' ') || 
    'Your Name'

  return (
    <BaseSection sectionKey="contact" isActive={isActive} onClick={handleClick}>
      <div style={{ textAlign: alignment }}>
        <h1
          className="text-gray-900 mb-2 leading-tight"
          style={{
            fontSize: `${designerSettings.fontSizeName}pt`,
            fontWeight: designerSettings.fontWeightName,
            letterSpacing: '-0.02em'
          }}
        >
          {displayName}
        </h1>
        
        <div className="text-sm text-gray-600">
          {contactInfo.some(Boolean) && (
            <div className="flex flex-wrap gap-y-1" style={{ justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>
              {renderJoinedItems(contactInfo)}
            </div>
          )}
        </div>
      </div>
    </BaseSection>
  )
}
