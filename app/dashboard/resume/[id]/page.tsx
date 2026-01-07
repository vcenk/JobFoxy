// app/dashboard/resume/[id]/page.tsx
// Glass Studio Resume Editor

'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ResumeProvider, useResume } from '@/contexts/ResumeContext'
import { SectionNavigator } from '@/components/resume/studio/SectionNavigator'
import { ResumeCanvas } from '@/components/resume/studio/ResumeCanvas'
import { Inspector } from '@/components/resume/studio/Inspector'
import { useAutoSave } from '@/hooks/useAutoSave'
import { ArrowLeft, Download, Eye, Check, Loader2, X, Sparkles, LayoutDashboard, Wand, FileEdit, ScanSearch, FileText } from 'lucide-react'
import { JobAnalysisView, JobAnalysisViewRef } from '@/components/resume/analysis/JobAnalysisView'
import { CoverLetterView, CoverLetterViewRef } from '@/components/resume/analysis/CoverLetterView'
import { plainTextToJSON } from '@/lib/utils/richTextHelpers'
import { ExportDropdown } from '@/components/ui/ExportDropdown'
import { exportResumeToDocx } from '@/lib/utils/docxExport'


interface ResumeEditorContentProps {
  params: { id: string }
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
  const [resumeId, setResumeId] = useState<string>(params.id)
  const [loading, setLoading] = useState(true)
  const [resumeTitle, setResumeTitle] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [hasAnalysisResults, setHasAnalysisResults] = useState(false)
  const [hasCoverLetter, setHasCoverLetter] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const coverLetterRef = useRef<CoverLetterViewRef>(null)
  const jobAnalysisRef = useRef<JobAnalysisViewRef>(null)

  const [viewMode, setViewMode] = useState<'builder' | 'job-analysis' | 'cover-letter'>('builder');

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

          // Check if analysis results exist
          if (data.resume.analysis_results) {
            setHasAnalysisResults(true)
          }

          // Check if cover letter exists for this resume
          const coverLetterResponse = await fetch(`/api/cover-letter/list?resumeId=${resumeId}`)
          const coverLetterData = await coverLetterResponse.json()
          // Fix: API returns data wrapped in 'data' object
          const coverLetters = coverLetterData.data?.coverLetters || coverLetterData.coverLetters || []
          if (coverLetterData.success && coverLetters.length > 0) {
            setHasCoverLetter(true)
          }

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

              // Load designer settings with proper deep merge for nested objects
              if (content._settings.designer) {
                // Deep merge nested pageNumbers to preserve defaults
                const designerFromDB = content._settings.designer
                if (designerFromDB.pageNumbers) {
                  // Ensure we don't lose the alignment property
                  updateDesignerSettings({
                    ...designerFromDB,
                    pageNumbers: {
                      enabled: designerFromDB.pageNumbers.enabled ?? false,
                      alignment: designerFromDB.pageNumbers.alignment ?? 'center',
                    }
                  })
                } else {
                  updateDesignerSettings(designerFromDB)
                }
              }

              // Remove _settings from resumeData before setting
              const { _settings, ...resumeContent } = content

              // Convert legacy string summary to JSONContent if needed
              if (resumeContent.summary && typeof resumeContent.summary === 'string') {
                resumeContent.summary = plainTextToJSON(resumeContent.summary)
              }

              // Convert legacy string bullets to JSONContent if needed
              if (resumeContent.experience && Array.isArray(resumeContent.experience)) {
                resumeContent.experience = resumeContent.experience.map((exp: any) => ({
                  ...exp,
                  bullets: exp.bullets?.map((bullet: any) =>
                    typeof bullet === 'string' ? plainTextToJSON(bullet) : bullet
                  ) || []
                }))
              }

              setResumeData(resumeContent)
            } else {
              // Convert legacy string summary to JSONContent if needed
              if (content.summary && typeof content.summary === 'string') {
                content.summary = plainTextToJSON(content.summary)
              }

              // Convert legacy string bullets to JSONContent if needed
              if (content.experience && Array.isArray(content.experience)) {
                content.experience = content.experience.map((exp: any) => ({
                  ...exp,
                  bullets: exp.bullets?.map((bullet: any) =>
                    typeof bullet === 'string' ? plainTextToJSON(bullet) : bullet
                  ) || []
                }))
              }

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
  const handleExportPDF = async () => {
    if (viewMode === 'cover-letter' && coverLetterRef.current) {
      await coverLetterRef.current.handleDownload()
    } else if (viewMode === 'job-analysis' && jobAnalysisRef.current) {
      await jobAnalysisRef.current.handleExportReport()
    } else {
      const resumePaper = document.getElementById('resume-paper')
      if (resumePaper) {
        try {
          setIsExporting(true)
          const { jsPDF } = await import('jspdf')
          const html2canvas = (await import('html2canvas')).default

          // --- Smart PDF Generation ---
          // 1. Create a clone to manipulate for printing without affecting UI
          const clone = resumePaper.cloneNode(true) as HTMLElement
          clone.style.backgroundImage = 'none'
          clone.style.boxShadow = 'none'
          
          // Create a hidden container for the clone to ensure consistent rendering
          const container = document.createElement('div')
          container.style.position = 'fixed' // Use fixed to ensure it's rendered but hidden
          container.style.top = '-10000px'
          container.style.left = '0'
          container.style.width = resumePaper.style.width || '210mm'
          container.style.zIndex = '-1000'
          container.appendChild(clone)
          document.body.appendChild(container)

          // 2. Page sizing based on designer settings
          const PAGE_DIMENSIONS = {
            letter: { heightPx: 1056, pdfFormat: 'letter' as const },
            a4: { heightPx: 1123, pdfFormat: 'a4' as const },
          }
          const pageMeta = PAGE_DIMENSIONS[designerSettings.paperSize] || PAGE_DIMENSIONS.letter
          const computedStyles = window.getComputedStyle(resumePaper)
          const pageHeightPx =
            Number.parseFloat(computedStyles.minHeight || '') ||
            Number.parseFloat(computedStyles.height || '') ||
            pageMeta.heightPx
          const topMarginPx = designerSettings.margins
          const bottomMarginPx = designerSettings.pageNumbers.enabled
            ? designerSettings.margins + 30
            : designerSettings.margins
          const contentHeightPx = Math.max(1, pageHeightPx - topMarginPx - bottomMarginPx)

          // 3. Logic to handle page breaks
          // We iterate through all significant child elements and insert spacers if they cross the page line.
          
          // Helper to get all relevant printable elements (sections, items within sections)
          // We target the main layout containers and their children
          // Adjust selector based on your DOM structure. Assuming sections have class 'resume-section' or generic structure.
          // Since structure varies (grid vs list), we'll walk the DOM tree of the clone.
          
          const getAllElements = (root: HTMLElement) => {
            // Get all block-level elements that shouldn't be split if possible
            // We prioritize sections, then list items, then paragraphs
            return Array.from(root.querySelectorAll('div[data-reorder-item-id], .resume-section, li, p, h1, h2, h3, h4, h5, h6')) as HTMLElement[]
          }

          const elements = getAllElements(clone)
          
          let currentY = 0 // Relative Y position on the "current page"
          let accumulatedHeight = 0 // Total height processed so far

          // We need to wait for images/fonts to likely load, but since we cloned, it should be fast.
          // Ideally we use a slight timeout or image load check, but we'll proceed.

          // Find the "resume-paper" inner container which has the padding
          // If we can't find specific sections, we might just be iterating blindly.
          
          // Better approach: Iterate direct children of the layout columns/containers
          // But 'elements' flat list might be easier if we check their offsetTop.
          
          // Let's just iterate through the high-level sections first.
          // The Reorder.Group items usually wrap the sections.
          const topLevelSections = Array.from(
            clone.querySelectorAll('.resume-section-wrapper')
          ) as HTMLElement[]
          
          if (topLevelSections.length > 0) {
             const getOffsetTop = (el: HTMLElement, root: HTMLElement) => {
               let offsetTop = 0
               let node: HTMLElement | null = el
               while (node && node !== root) {
                 offsetTop += node.offsetTop
                 node = node.offsetParent as HTMLElement
               }
               return offsetTop
             }

             topLevelSections.forEach(section => {
               const rect = section.getBoundingClientRect()
               const elHeight = rect.height
               const offsetTop = getOffsetTop(section, clone)

               if (elHeight > contentHeightPx) {
                 return
               }

               const currentPage = Math.floor(offsetTop / pageHeightPx) + 1
               const pageLimit = (currentPage * pageHeightPx) - bottomMarginPx

               if (offsetTop + elHeight > pageLimit) {
                 const nextPageStart = (currentPage * pageHeightPx) + topMarginPx
                 const pushBy = nextPageStart - offsetTop

                 if (pushBy > 0) {
                   section.style.marginTop = `${pushBy}px`
                 }
               }
             })
          }

          // 4. Capture
          const canvas = await html2canvas(clone, {
            scale: 2, // High res for print
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            // Ensure we capture the full extended height
            windowWidth: container.scrollWidth,
            windowHeight: container.scrollHeight
          })
          
          // Clean up
          document.body.removeChild(container)
          
          const imgData = canvas.toDataURL('image/png')
          
          // Initialize PDF
          const pdf = new jsPDF('p', 'mm', pageMeta.pdfFormat)
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = pdf.internal.pageSize.getHeight()
          
          const imgWidth = canvas.width
          const imgHeight = canvas.height
          
          // Calculate rendered height
          const imgFinalHeight = (imgHeight * pdfWidth) / imgWidth
          
          let heightLeft = imgFinalHeight
          let position = 0
          
          // Add first page
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgFinalHeight)
          heightLeft -= pdfHeight
          
          // Add subsequent pages
          while (heightLeft > 0) {
            position = heightLeft - imgFinalHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgFinalHeight)
            heightLeft -= pdfHeight
          }
          
          pdf.save(`${resumeTitle || 'Resume'}.pdf`)
        } catch (error) {
          console.error('PDF generation failed:', error)
          // Fallback
          window.print()
        } finally {
          setIsExporting(false)
        }
      } else {
        window.print()
      }
    }
  }

  const handleExportDOCX = async () => {
    if (viewMode === 'cover-letter' && coverLetterRef.current) {
        await coverLetterRef.current.handleExportDOCX()
    } else if (viewMode === 'job-analysis' && jobAnalysisRef.current) {
        await jobAnalysisRef.current.handleExportDOCX()
    } else {
        setIsExporting(true)
        try {
            // Need to cast resumeData to ParsedResume, or ensure it matches
            await exportResumeToDocx(resumeData as any, resumeTitle || 'Resume', designerSettings)
        } catch (error) {
            console.error('DOCX Export Error:', error)
            alert('Failed to export DOCX')
        } finally {
            setIsExporting(false)
        }
    }
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
                  className="text-lg font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 px-2 py-0.5 rounded hover:bg-white/10 transition-all"
                  style={{ 
                    width: resumeTitle ? `${Math.min(Math.max(resumeTitle.length + 2, 12), 40)}ch` : '15ch',
                    maxWidth: 'calc(100vw - 450px)' 
                  }}
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

              {/* Resume-JD Analysis Button */}
              <button
                onClick={() => setViewMode('job-analysis')}
                className={`
                  px-3 py-2 sm:px-4 rounded-xl border border-white/10 transition-all flex items-center gap-1 sm:gap-2 relative
                  ${viewMode === 'job-analysis'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : hasAnalysisResults
                    ? 'glass-panel border-green-500/30 bg-green-500/5 hover:bg-green-500/10 text-white'
                    : 'glass-panel hover:bg-white/15 text-white/80 hover:text-white'}
                `}
              >
                <ScanSearch className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium min-w-0 truncate hidden sm:inline">Resume-JD Analysis</span>
                {hasAnalysisResults && viewMode !== 'job-analysis' && (
                  <span className="absolute -top-2 -right-2 flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg animate-pulse">
                    <Check className="w-3 h-3" />
                    <span className="hidden sm:inline">Ready</span>
                  </span>
                )}
              </button>

              {/* Cover Letter Button */}
              <button
                onClick={() => setViewMode('cover-letter')}
                className={`
                  px-3 py-2 sm:px-4 rounded-xl border border-white/10 transition-all flex items-center gap-1 sm:gap-2 relative
                  ${viewMode === 'cover-letter'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : hasCoverLetter
                    ? 'glass-panel border-green-500/30 bg-green-500/5 hover:bg-green-500/10 text-white'
                    : 'glass-panel hover:bg-white/15 text-white/80 hover:text-white'}
                `}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium min-w-0 truncate hidden sm:inline">Cover Letter</span>
                {hasCoverLetter && viewMode !== 'cover-letter' && (
                  <span className="absolute -top-2 -right-2 flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg animate-pulse">
                    <Check className="w-3 h-3" />
                    <span className="hidden sm:inline">Ready</span>
                  </span>
                )}
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

              <ExportDropdown 
                onExportPDF={handleExportPDF}
                onExportDOCX={handleExportDOCX}
                isExporting={isExporting}
                variant="outline"
                label="Export"
              />

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
              {resumeId && (
                <JobAnalysisView
                  ref={jobAnalysisRef}
                  resumeId={resumeId}
                  onSwitchToBuilder={() => setViewMode('builder')}
                />
              )}
            </div>
          ) : (
            <div className="w-full bg-black/30 backdrop-blur-xl overflow-y-auto">
              {resumeId && (
                <CoverLetterView
                  ref={coverLetterRef}
                  resumeId={resumeId}
                  onCoverLetterGenerated={() => setHasCoverLetter(true)}
                />
              )}
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
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Hide everything except the canvas */
          .glass-panel,
          nav,
          button,
          header,
          aside,
          .no-print {
            display: none !important;
          }

          /* Show only the resume paper */
          #resume-paper, .resume-paper {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0.5in !important;
            box-shadow: none !important;
            background: white !important;
          }

          /* For JSON Resume themes */
          #resume-theme-iframe {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            border: none !important;
          }

          /* Hide scrollbars and other UI elements */
          .overflow-y-auto, .overflow-x-auto {
            overflow: visible !important;
          }

          /* Ensure proper pagination */
          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
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
