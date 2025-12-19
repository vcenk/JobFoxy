// app/dashboard/resume/[id]/page.tsx
// Glass Studio Resume Editor

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ResumeProvider, useResume } from '@/contexts/ResumeContext'
import { SectionNavigator } from '@/components/resume/studio/SectionNavigator'
import { ResumeCanvas } from '@/components/resume/studio/ResumeCanvas'
import { Inspector } from '@/components/resume/studio/Inspector'
import { useAutoSave } from '@/hooks/useAutoSave'
import { ArrowLeft, Download, Eye, Check, Loader2, X, Sparkles, LayoutDashboard, Wand, FileEdit, ScanSearch, FileText } from 'lucide-react'
import { JobAnalysisView } from '@/components/resume/analysis/JobAnalysisView'
import { CoverLetterView } from '@/components/resume/analysis/CoverLetterView'


interface ResumeEditorContentProps {
  params: Promise<{ id: string }> | { id: string }
}

function ResumeEditorContent({ params }: ResumeEditorContentProps) {
  const router = useRouter()
  const {
    resumeData,
    setResumeData,
    sectionSettings,
    designerSettings,
    updateDesignerSettings,
    updateSectionSettings
  } = useResume()
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [resumeTitle, setResumeTitle] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const [viewMode, setViewMode] = useState<'builder' | 'job-analysis' | 'cover-letter'>('builder');

  // Unwrap params (handle both Promise and direct object)
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = params instanceof Promise ? await params : params
      setResumeId(resolved.id)
    }
    resolveParams()
  }, [params])

  // Combine all data for saving
  const fullResumeData = useMemo(() => ({
    ...resumeData,
    _settings: {
      sections: sectionSettings,
      designer: designerSettings
    }
  }), [resumeData, sectionSettings, designerSettings])

  // Auto-save hook with full data
  const { saving, lastSaved, triggerSave } = useAutoSave({
    resumeId: resumeId || '',
    data: fullResumeData,
    enabled: !loading && resumeId !== null,
  })

  // Fetch resume data
  useEffect(() => {
    if (!resumeId) return

    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resume/${resumeId}`)
        const data = await response.json()

        if (data.success && data.resume) {
          setResumeTitle(data.resume.title)
          if (data.resume.content) {
            const content = data.resume.content

            // Extract settings if they exist
            if (content._settings) {
              // Load section settings
              if (content._settings.sections) {
                Object.entries(content._settings.sections).forEach(([key, value]: [string, any]) => {
                  updateSectionSettings(key as any, value)
                })
              }

              // Load designer settings
              if (content._settings.designer) {
                updateDesignerSettings(content._settings.designer)
              }

              // Remove _settings from resumeData before setting
              const { _settings, ...resumeContent } = content
              setResumeData(resumeContent)
            } else {
              setResumeData(content)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch resume:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResume()
  }, [resumeId, setResumeData, updateSectionSettings, updateDesignerSettings])

  // Handle Print / Export PDF
  const handleExportPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Studio Header */}
        <div className="glass-panel p-4 mb-4">
          <div className="flex items-center justify-between">
            {/* Left: Back + Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/resume')}
                className="glass-panel px-3 py-2 hover:bg-white/15 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white/80" />
              </button>

              <div>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={e => {
                    setResumeTitle(e.target.value)
                    triggerSave()
                  }}
                  className="text-2xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 px-2 py-1 rounded hover:bg-white/5"
                  placeholder="Resume Title"
                />
                <div className="flex items-center space-x-2 text-sm text-white/60 px-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      <span>Saved {lastSaved}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">

              {/* Resume Analysis Button */}
              <button
                onClick={() => setViewMode('job-analysis')}
                className={`
                  px-3 py-2 sm:px-4 rounded-xl border border-white/10 transition-all flex items-center gap-1 sm:gap-2
                  ${viewMode === 'job-analysis'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'glass-panel hover:bg-white/15 text-white/80 hover:text-white'}
                `}
              >
                <ScanSearch className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium min-w-0 truncate hidden sm:inline">Resume Analysis</span>
              </button>

              {/* Cover Letter Button */}
              <button
                onClick={() => setViewMode('cover-letter')}
                className={`
                  px-3 py-2 sm:px-4 rounded-xl border border-white/10 transition-all flex items-center gap-1 sm:gap-2
                  ${viewMode === 'cover-letter'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'glass-panel hover:bg-white/15 text-white/80 hover:text-white'}
                `}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium min-w-0 truncate hidden sm:inline">Cover Letter</span>
              </button>

              {/* Back to Editor Button - Show when not in builder mode */}
              {viewMode !== 'builder' && (
                <button
                  onClick={() => setViewMode('builder')}
                  className="glass-panel px-3 py-2 sm:px-4 rounded-xl border border-white/10 hover:bg-white/15 transition-all flex items-center gap-1 sm:gap-2 text-white/80 hover:text-white"
                >
                  <FileEdit className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium min-w-0 truncate hidden sm:inline">Editor</span>
                </button>
              )}

              <button
                onClick={handleExportPDF}
                className="glow-button px-4 py-2 sm:px-6 flex items-center gap-1 sm:gap-2"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium hidden sm:inline min-w-0 truncate">Export PDF</span>
              </button>

              <button
                onClick={() => setShowPreview(true)}
                className="glass-panel px-3 py-2 sm:px-4 hover:bg-white/15 transition-all flex items-center justify-center"
              >
                <Eye className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>
        </div>

        {/* Studio Layout */}
        <div className="flex-1 flex overflow-hidden rounded-2xl relative">
          {viewMode === 'builder' ? (
            <>
              {/* Left: Navigator */}
              <SectionNavigator />

              {/* Center: Canvas */}
              <ResumeCanvas />

              {/* Right: Inspector */}
              <Inspector triggerSave={triggerSave} />
            </>
          ) : viewMode === 'job-analysis' ? (
            <div className="w-full bg-black/30 backdrop-blur-xl overflow-y-auto">
              {resumeId && <JobAnalysisView resumeId={resumeId} />}
            </div>
          ) : (
            <div className="w-full bg-black/30 backdrop-blur-xl overflow-y-auto">
              {resumeId && <CoverLetterView resumeId={resumeId} />}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="relative w-full max-w-4xl h-full flex flex-col">
            {/* Modal Header */}
            <div className="glass-panel p-4 mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Resume Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="glass-panel px-3 py-2 hover:bg-white/15 transition-all"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto bg-gray-900 rounded-2xl p-8">
              <div className="max-w-3xl mx-auto">
                <ResumeCanvas />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Reset body and html for clean print */
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide ALL UI elements - be explicit */
          .glass-panel,
          nav,
          button,
          header,
          aside,
          .no-print,
          [class*="bg-gray-900"],
          [class*="bg-black"],
          [class*="backdrop-blur"] {
            display: none !important;
            visibility: hidden !important;
          }

          /* Reset container backgrounds and show resume */
          .flex-1.h-full.overflow-y-auto {
            display: block !important;
            overflow: visible !important;
            padding: 0 !important;
            background: transparent !important;
          }

          /* Show only the resume paper with proper styling */
          #resume-paper, .resume-paper {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0.5in !important;
            box-shadow: none !important;
            background: white !important;
            border: none !important;
          }

          /* For JSON Resume themes - print iframe content */
          #resume-theme-iframe {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            min-height: 11in !important;
            border: none !important;
            background: white !important;
          }

          /* Hide scrollbars and reset overflow */
          .overflow-y-auto, .overflow-x-auto {
            overflow: visible !important;
            background: transparent !important;
          }

          /* Remove any selection/active styling from sections */
          [data-resume-section] {
            opacity: 1 !important;
            box-shadow: none !important;
            outline: none !important;
            border: none !important;
          }

          /* Remove ring styling from active sections */
          .ring-2, .ring-purple-500,
          [class*="ring-"] {
            --tw-ring-shadow: none !important;
            --tw-ring-color: transparent !important;
            box-shadow: none !important;
          }

          /* Ensure proper pagination */
          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Hide cursor pointer styling */
          .cursor-pointer {
            cursor: default !important;
          }
        }
      `}</style>
    </>
  )
}

// Page wrapper to handle async params and provide ResumeContext
export default function ResumePage({ params }: ResumeEditorContentProps) {
  return (
    <ResumeProvider>
      <ResumeEditorContent params={params} />
    </ResumeProvider>
  )
}