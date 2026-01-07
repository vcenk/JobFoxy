'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Download, ExternalLink, Star } from 'lucide-react'
import type { ParsedResume } from '@/lib/types/resume'

interface ResumePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  example: {
    id: string
    slug: string
    job_title: string
    industry: string
    experience_level: string
    content: ParsedResume
    ats_score: number
    quality_score: number
    meta_title: string
  } | null
}

export default function ResumePreviewModal({
  isOpen,
  onClose,
  example,
}: ResumePreviewModalProps) {
  if (!example) return null

  const { content } = example

  // Helper to render rich text content
  const renderRichText = (richText: any): string => {
    if (!richText) return ''
    if (typeof richText === 'string') return richText
    if (richText.content) {
      return richText.content
        .map((node: any) => {
          if (node.type === 'paragraph') {
            return node.content?.map((n: any) => n.text || '').join('') || ''
          }
          return node.text || ''
        })
        .join('\n')
    }
    return ''
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl glass-panel p-8 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <Dialog.Title className="text-2xl font-bold text-white mb-2">
                      {example.job_title}
                    </Dialog.Title>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 capitalize">
                        {example.experience_level}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 capitalize">
                        {example.industry.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">Quality:</span>
                        <span className={`font-bold ${
                          example.quality_score >= 85 ? 'text-green-400' :
                          example.quality_score >= 70 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {example.quality_score}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">ATS:</span>
                        <span className="text-white font-bold">{example.ats_score}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Resume Preview Content */}
                <div className="bg-white rounded-lg p-8 text-gray-900 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {/* Contact Information */}
                  {content.contact && (
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {content.contact.name || `${content.contact.firstName || ''} ${content.contact.lastName || ''}`.trim()}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {content.contact.email && <span>{content.contact.email}</span>}
                        {content.contact.phone && <span>{content.contact.phone}</span>}
                        {content.contact.location && <span>{content.contact.location}</span>}
                        {content.contact.linkedin && (
                          <a href={content.contact.linkedin} className="text-blue-600 hover:underline">
                            LinkedIn
                          </a>
                        )}
                        {content.contact.github && (
                          <a href={content.contact.github} className="text-blue-600 hover:underline">
                            GitHub
                          </a>
                        )}
                        {content.contact.portfolio && (
                          <a href={content.contact.portfolio} className="text-blue-600 hover:underline">
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Target Title */}
                  {content.targetTitle && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Target Position</h3>
                      <p className="text-gray-900">{content.targetTitle}</p>
                    </div>
                  )}

                  {/* Summary */}
                  {content.summary && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b-2 border-gray-300 pb-1">
                        Professional Summary
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{renderRichText(content.summary)}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {content.experience && content.experience.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b-2 border-gray-300 pb-1">
                        Professional Experience
                      </h3>
                      <div className="space-y-4">
                        {content.experience.map((exp, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                                <p className="text-gray-700">{exp.company}</p>
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                {exp.location && <p>{exp.location}</p>}
                                <p>
                                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                </p>
                              </div>
                            </div>
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                                {exp.bullets.map((bullet, bidx) => (
                                  <li key={bidx}>{renderRichText(bullet)}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {content.education && content.education.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b-2 border-gray-300 pb-1">
                        Education
                      </h3>
                      <div className="space-y-3">
                        {content.education.map((edu, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                {edu.field && <p className="text-gray-700">{edu.field}</p>}
                                <p className="text-gray-700">{edu.institution}</p>
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                {edu.graduationDate && <p>{edu.graduationDate}</p>}
                                {edu.gpa && <p>GPA: {edu.gpa}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {content.skills && (content.skills.technical || content.skills.soft || content.skills.other) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b-2 border-gray-300 pb-1">
                        Skills
                      </h3>
                      {content.skills.technical && content.skills.technical.length > 0 && (
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700">Technical: </span>
                          <span className="text-gray-700">{content.skills.technical.join(', ')}</span>
                        </div>
                      )}
                      {content.skills.soft && content.skills.soft.length > 0 && (
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700">Soft Skills: </span>
                          <span className="text-gray-700">{content.skills.soft.join(', ')}</span>
                        </div>
                      )}
                      {content.skills.other && content.skills.other.length > 0 && (
                        <div>
                          <span className="font-semibold text-gray-700">Other: </span>
                          <span className="text-gray-700">{content.skills.other.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Certifications */}
                  {content.certifications && content.certifications.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b-2 border-gray-300 pb-1">
                        Certifications
                      </h3>
                      <ul className="space-y-2">
                        {content.certifications.map((cert, idx) => (
                          <li key={idx} className="text-gray-700">
                            <span className="font-semibold">{cert.name}</span>
                            {cert.issuer && <span> - {cert.issuer}</span>}
                            {cert.date && <span className="text-gray-600"> ({cert.date})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Projects */}
                  {content.projects && content.projects.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b-2 border-gray-300 pb-1">
                        Projects
                      </h3>
                      <div className="space-y-3">
                        {content.projects.map((project, idx) => (
                          <div key={idx}>
                            <h4 className="font-semibold text-gray-900">{project.name}</h4>
                            <p className="text-gray-700">{project.description}</p>
                            {project.technologies && project.technologies.length > 0 && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Technologies:</span> {project.technologies.join(', ')}
                              </p>
                            )}
                            {project.link && (
                              <a
                                href={project.link}
                                className="text-sm text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60">
                    Slug: <span className="text-white/80 font-mono">{example.slug}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`/resume/examples/${example.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Public Page
                    </a>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors text-purple-300">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
