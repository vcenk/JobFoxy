// components/resume/templates/MinimalTemplate.tsx
// ATS Score: 98% - Maximum compatibility with Applicant Tracking Systems
// Single-column layout, semantic HTML, standard headings
// Fully compatible with Designer settings - respects fonts, colors, margins, and all customizations!

'use client'

import { ParsedResume } from '@/lib/types/resume'
import { isValidTiptapJSON, jsonToPlainText } from '@/lib/utils/richTextHelpers'
import { ResumePaper } from '../studio/ResumePaper'
import { useResume } from '@/contexts/ResumeContext'

interface MinimalTemplateProps {
  resumeData: ParsedResume
}

// Helper to safely convert rich text or string to plain text
function toPlainText(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (isValidTiptapJSON(value)) return jsonToPlainText(value)
  if (typeof value === 'object' && value.content) return jsonToPlainText(value)
  return String(value)
}

export function MinimalTemplate({ resumeData }: MinimalTemplateProps) {
  const { contact, targetTitle, summary, experience, education, skills, certifications, projects, awards } = resumeData
  const { designerSettings } = useResume()

  return (
    <ResumePaper>
      {/* CONTACT HEADER */}
      <header className="mb-6 text-center pb-4" style={{ borderBottom: `2px solid ${designerSettings.accentColor}` }}>
        <h1
          className="mb-2 tracking-wide"
          style={{
            fontSize: `${designerSettings.fontSizeName}pt`,
            fontWeight: designerSettings.fontWeightName,
            textTransform: designerSettings.textTransform,
          }}
        >
          {contact.firstName} {contact.lastName}
        </h1>
        {targetTitle && (
          <p className="text-base font-semibold mb-2" style={{ color: '#374151' }}>
            {targetTitle}
          </p>
        )}
        <div className="text-sm text-gray-600">
          {contact.email && <span>{contact.email}</span>}
          {contact.email && contact.phone && <span> | </span>}
          {contact.phone && <span>{contact.phone}</span>}
          {(contact.email || contact.phone) && (contact.city || contact.state) && <span> | </span>}
          {contact.city && contact.state && <span>{contact.city}, {contact.state}</span>}
        </div>
        {contact.linkedin && (
          <div className="text-sm text-gray-600 mt-1">
            {contact.linkedin}
          </div>
        )}
      </header>

      {/* PROFESSIONAL SUMMARY */}
      {summary && toPlainText(summary) && (
        <section className="mb-6">
          <h2
            className="pb-1 mb-3 tracking-wide"
            style={{
              fontSize: `${designerSettings.fontSizeHeadings}pt`,
              fontWeight: designerSettings.fontWeightHeadings,
              textTransform: designerSettings.textTransform,
              borderBottom: `2px solid ${designerSettings.accentColor}`,
              letterSpacing: designerSettings.letterSpacing,
            }}
          >
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-gray-800">
            {toPlainText(summary)}
          </p>
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {experience && experience.length > 0 && (
        <section className="mb-6">
          <h2
            className="pb-1 mb-3 tracking-wide"
            style={{
              fontSize: `${designerSettings.fontSizeHeadings}pt`,
              fontWeight: designerSettings.fontWeightHeadings,
              textTransform: designerSettings.textTransform,
              borderBottom: `2px solid ${designerSettings.accentColor}`,
              letterSpacing: designerSettings.letterSpacing,
            }}
          >
            Work Experience
          </h2>
          {experience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-bold">
                  {job.position}
                </h3>
                <p className="text-sm text-gray-600">
                  {job.startDate} - {job.endDate || 'Present'}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {job.company}
                {job.location && <span className="font-normal"> | {job.location}</span>}
              </p>
              {job.bullets && job.bullets.length > 0 && (
                <ul className="list-disc ml-5 space-y-1">
                  {job.bullets.map((bullet, i) => (
                    <li key={i} className="text-sm text-gray-800 leading-relaxed">
                      {toPlainText(bullet)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {education && education.length > 0 && (
        <section className="mb-6">
          <h2
            className="pb-1 mb-3 tracking-wide"
            style={{
              fontSize: `${designerSettings.fontSizeHeadings}pt`,
              fontWeight: designerSettings.fontWeightHeadings,
              textTransform: designerSettings.textTransform,
              borderBottom: `2px solid ${designerSettings.accentColor}`,
              letterSpacing: designerSettings.letterSpacing,
            }}
          >
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-bold">
                  {edu.degree}
                  {edu.field && <span className="font-normal"> in {edu.field}</span>}
                </h3>
                <p className="text-sm text-gray-600">
                  {edu.graduationDate || 'Present'}
                </p>
              </div>
              <p className="text-sm text-gray-700">
                {edu.institution}
              </p>
              {edu.gpa && (
                <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* SKILLS */}
      {skills && (skills.technical?.length > 0 || skills.soft?.length > 0 || skills.other?.length > 0) && (
        <section className="mb-6">
          <h2
            className="pb-1 mb-3 tracking-wide"
            style={{
              fontSize: `${designerSettings.fontSizeHeadings}pt`,
              fontWeight: designerSettings.fontWeightHeadings,
              textTransform: designerSettings.textTransform,
              borderBottom: `2px solid ${designerSettings.accentColor}`,
              letterSpacing: designerSettings.letterSpacing,
            }}
          >
            Skills
          </h2>
          {skills.technical && skills.technical.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-bold mb-1">Technical Skills:</p>
              <p className="text-sm text-gray-800">
                {skills.technical.join(' • ')}
              </p>
            </div>
          )}
          {skills.soft && skills.soft.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-bold mb-1">Core Competencies:</p>
              <p className="text-sm text-gray-800">
                {skills.soft.join(' • ')}
              </p>
            </div>
          )}
          {skills.other && skills.other.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-1">Additional Skills:</p>
              <p className="text-sm text-gray-800">
                {skills.other.join(' • ')}
              </p>
            </div>
          )}
        </section>
      )}

      {/* CERTIFICATIONS */}
      {certifications && certifications.length > 0 && (
        <section className="mb-6">
          <h2
            className="pb-1 mb-3 tracking-wide"
            style={{
              fontSize: `${designerSettings.fontSizeHeadings}pt`,
              fontWeight: designerSettings.fontWeightHeadings,
              textTransform: designerSettings.textTransform,
              borderBottom: `2px solid ${designerSettings.accentColor}`,
              letterSpacing: designerSettings.letterSpacing,
            }}
          >
            Certifications
          </h2>
          <ul className="space-y-1">
            {certifications.map((cert, index) => (
              <li key={index} className="text-sm text-gray-800">
                <span className="font-semibold">{cert.name}</span>
                {cert.issuer && <span> - {cert.issuer}</span>}
                {cert.date && <span> ({cert.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PROJECTS */}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <h2
            className="pb-1 mb-3 tracking-wide"
            style={{
              fontSize: `${designerSettings.fontSizeHeadings}pt`,
              fontWeight: designerSettings.fontWeightHeadings,
              textTransform: designerSettings.textTransform,
              borderBottom: `2px solid ${designerSettings.accentColor}`,
              letterSpacing: designerSettings.letterSpacing,
            }}
          >
            Projects
          </h2>
          {projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h3 className="text-base font-bold mb-1">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-800 mb-1">{toPlainText(project.description)}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-semibold">Technologies:</span> {project.technologies.join(', ')}
                </p>
              )}
              {project.link && (
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Link:</span> {project.link}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* AWARDS */}
      {awards && awards.length > 0 && (
        <section className="mb-6">
          <h2
            className="pb-1 mb-3 tracking-wide"
            style={{
              fontSize: `${designerSettings.fontSizeHeadings}pt`,
              fontWeight: designerSettings.fontWeightHeadings,
              textTransform: designerSettings.textTransform,
              borderBottom: `2px solid ${designerSettings.accentColor}`,
              letterSpacing: designerSettings.letterSpacing,
            }}
          >
            Awards & Honors
          </h2>
          <ul className="space-y-1">
            {awards.map((award, index) => (
              <li key={index} className="text-sm text-gray-800">
                <span className="font-semibold">{award.title}</span>
                {award.awarder && <span> - {award.awarder}</span>}
                {award.date && <span> ({award.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </ResumePaper>
  )
}

// Template metadata for ATS scoring and categorization
export const MinimalTemplateConfig = {
  id: 'minimal',
  name: 'Minimal Professional',
  description: 'Clean, single-column layout with maximum ATS compatibility',
  atsScore: 98,
  atsFriendly: true,
  layout: 'single-column',
  category: 'professional',
  bestFor: ['Corporate', 'Finance', 'Healthcare', 'Legal', 'Government'],
  features: [
    'Maximum ATS compatibility (98%)',
    'Clean single-column layout',
    'Standard section headings',
    'Professional serif-free design',
    'Easy to scan and read'
  ],
  fontFamily: 'Arial, sans-serif',
  preview: '/templates/minimal-preview.png'
}
