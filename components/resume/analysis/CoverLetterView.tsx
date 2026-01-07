// components/resume/analysis/CoverLetterView.tsx
'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, FileText, AlertCircle, Copy, Check, Download, Sparkles, Info, RefreshCw } from 'lucide-react'
import { ExportDropdown } from '@/components/ui/ExportDropdown'
import { exportCoverLetterToDocx } from '@/lib/utils/docxExport'

export interface CoverLetterViewRef {
  handleDownload: () => Promise<void>
  handleExportDOCX: () => Promise<void>
}

interface CoverLetterViewProps {
  resumeId: string
  onCoverLetterGenerated?: () => void
}

export const CoverLetterView = forwardRef<CoverLetterViewRef, CoverLetterViewProps>(({ resumeId, onCoverLetterGenerated }, ref) => {
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'friendly'>('professional')
  const [generating, setGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [coverLetter, setCoverLetter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loadingJobInfo, setLoadingJobInfo] = useState(true)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [showRefineInput, setShowRefineInput] = useState(false)
  const [refining, setRefining] = useState(false)
  const [existingCoverLetter, setExistingCoverLetter] = useState<any>(null)
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)

  // Load existing cover letter and job info
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[CoverLetterView] Loading data for resume:', resumeId)

        // Load existing cover letters first
        const coverLetterResponse = await fetch(`/api/cover-letter/list?resumeId=${resumeId}`)
        const coverLetterData = await coverLetterResponse.json()

        console.log('[CoverLetterView] API Response:', coverLetterData)
        console.log('[CoverLetterView] Resume ID we are querying:', resumeId)

        let hasExistingCoverLetter = false

        // Fix: The API returns data wrapped in a 'data' object
        const allCoverLetters = coverLetterData.data?.coverLetters || coverLetterData.coverLetters || []
        console.log('[CoverLetterView] Total cover letters found:', allCoverLetters.length)

        // Filter by current tone or default to professional
        const currentTone = tone
        const coverLetterForTone = allCoverLetters.find((cl: any) => cl.tone === currentTone)

        console.log('[CoverLetterView] Looking for tone:', currentTone)
        console.log('[CoverLetterView] Available tones:', allCoverLetters.map((cl: any) => cl.tone))

        if (coverLetterData.success && coverLetterForTone) {
          // Load the cover letter for the current tone
          hasExistingCoverLetter = true

          setExistingCoverLetter(coverLetterForTone)
          setCoverLetter(coverLetterForTone.content)
          setJobTitle(coverLetterForTone.position_title || '')
          setCompany(coverLetterForTone.company_name || '')
          // Don't override tone - it's already set

          console.log('[CoverLetterView] ✅ Loaded cover letter for tone:', currentTone)
          console.log('[CoverLetterView] Cover letter ID:', coverLetterForTone.id)
          console.log('[CoverLetterView] Content length:', coverLetterForTone.content?.length)
        } else if (coverLetterData.success && allCoverLetters.length > 0) {
          // No cover letter for this tone, but others exist
          console.log('[CoverLetterView] No cover letter found for tone:', currentTone)
          console.log('[CoverLetterView] But found', allCoverLetters.length, 'cover letter(s) with other tones')

          // Load job info from any existing cover letter
          const anyLetter = allCoverLetters[0]
          setJobTitle(anyLetter.position_title || '')
          setCompany(anyLetter.company_name || '')
        } else {
          console.log('[CoverLetterView] No existing cover letters found')
        }

        // Load job description from resume
        const response = await fetch(`/api/resume/${resumeId}`)
        const data = await response.json()

        console.log('[CoverLetterView] Resume data:', {
          success: data.success,
          hasResume: !!data.resume,
          jobDescriptionId: data.resume?.job_description_id
        })

        if (data.success && data.resume && data.resume.job_description_id) {
          console.log('[CoverLetterView] Fetching job description:', data.resume.job_description_id)
          const jdResponse = await fetch(`/api/job-description/${data.resume.job_description_id}`)
          const jdData = await jdResponse.json()

          console.log('[CoverLetterView] Job description data:', {
            success: jdData.success,
            hasJobDescription: !!jdData.data?.jobDescription,
            title: jdData.data?.jobDescription?.title,
            company: jdData.data?.jobDescription?.company
          })

          if (jdData.success && jdData.data?.jobDescription) {
            // Only update job title and company if we DON'T have an existing cover letter
            // Always load job description for context
            if (!hasExistingCoverLetter) {
              setJobTitle(jdData.data.jobDescription.title || '')
              setCompany(jdData.data.jobDescription.company || '')
              console.log('[CoverLetterView] Set job info from JD')
            } else {
              console.log('[CoverLetterView] Skipped JD info - using existing cover letter data')
            }
            setJobDescription(jdData.data.jobDescription.description || '')
          } else {
            console.warn('[CoverLetterView] Job description fetch failed:', jdData)
          }
        } else {
          console.log('[CoverLetterView] No job description linked to resume')
        }
      } catch (err) {
        console.error('[CoverLetterView] Failed to load data:', err)
      } finally {
        setLoadingJobInfo(false)
      }
    }

    loadData()
  }, [resumeId])

  // Reload cover letter when tone changes
  useEffect(() => {
    const loadCoverLetterForTone = async () => {
      try {
        const coverLetterResponse = await fetch(`/api/cover-letter/list?resumeId=${resumeId}`)
        const coverLetterData = await coverLetterResponse.json()

        const allCoverLetters = coverLetterData.data?.coverLetters || coverLetterData.coverLetters || []
        const coverLetterForTone = allCoverLetters.find((cl: any) => cl.tone === tone)

        console.log('[CoverLetterView] Tone changed to:', tone)
        console.log('[CoverLetterView] Found cover letter for this tone:', !!coverLetterForTone)

        if (coverLetterForTone) {
          setExistingCoverLetter(coverLetterForTone)
          setCoverLetter(coverLetterForTone.content)
          console.log('[CoverLetterView] ✅ Switched to', tone, 'cover letter')
        } else {
          // Clear current cover letter if no match for this tone
          setCoverLetter(null)
          setExistingCoverLetter(null)
          console.log('[CoverLetterView] No cover letter exists for', tone, 'tone')
        }
      } catch (err) {
        console.error('[CoverLetterView] Failed to load cover letter for tone:', err)
      }
    }

    // Only reload if we already loaded initially
    if (!loadingJobInfo && resumeId) {
      loadCoverLetterForTone()
    }
  }, [tone, resumeId, loadingJobInfo])

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      setError('Please enter a job title.')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description.')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          jobTitle: jobTitle.trim(),
          companyName: company.trim() || null,
          jobDescription: jobDescription.trim(),
          tone,
        }),
      })

      if (!response.ok) {
        let errorMessage = `Generation failed with status ${response.status}`
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError)
        }
        console.error('Cover letter generation error:', errorMessage)
        setError(errorMessage)
        return
      }

      const data = await response.json()
      console.log('Cover letter response:', data)

      if (data.success && data.data?.coverLetter) {
        setCoverLetter(data.data.coverLetter.content)
        setExistingCoverLetter(data.data.coverLetter)
        // Notify parent component that cover letter was generated
        if (onCoverLetterGenerated) {
          onCoverLetterGenerated()
        }
      } else {
        const errorMsg = data.error || 'Generation failed. Please try again.'
        console.error('Generation failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (err: any) {
      console.error('Cover letter generation error:', err)
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!coverLetter) return
    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = async () => {
    if (!coverLetter) return

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 25
      const maxWidth = pageWidth - (margin * 2)
      let yPos = margin

      // Header Block (Left Aligned)
      doc.setFontSize(22)
      doc.setFont('times', 'bold') // Serif font for cover letter
      doc.setTextColor(106, 71, 255) // JobFoxy Purple
      doc.text("Cover Letter", margin, yPos)
      
      yPos += 10
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 10

      // Job Info Block
      doc.setFontSize(11)
      doc.setFont('times', 'normal')
      doc.setTextColor(60, 60, 60)
      
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      doc.text(dateStr, margin, yPos)
      yPos += 10

      if (jobTitle) {
        doc.setFont('times', 'bold')
        doc.text(`Re: ${jobTitle}`, margin, yPos)
        yPos += 5
        doc.setFont('times', 'normal')
      }
      
      if (company) {
        doc.text(company, margin, yPos)
        yPos += 15
      } else {
        yPos += 10
      }

      // Body Content
      const paragraphs = coverLetter.split('\n')
      
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.setFont('times', 'normal')

      paragraphs.forEach(paragraph => {
        const trimmed = paragraph.trim()
        if (!trimmed) {
            yPos += 4
            return
        }

        const lines = doc.splitTextToSize(trimmed, maxWidth)
        
        // alignment: justify only works well if we use text with align option or manual spacing
        // jsPDF's basic text doesn't support full justify easily without plugins. 
        // We'll stick to left align for safety but keep it clean.
        
        lines.forEach((line: string) => {
            if (yPos + 5 > pageHeight - margin - 20) {
                doc.addPage()
                yPos = margin
            }
            doc.text(line, margin, yPos)
            yPos += 5 // Line height
        })
        yPos += 5 // Paragraph spacing
      })

      // Footer
      const footerY = pageHeight - 15
      doc.setDrawColor(240, 240, 240)
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)
      
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal') // Sans-serif for footer
      doc.text('Generated by JobFoxy', pageWidth / 2, footerY, { align: 'center' })

      // Save PDF
      const fileName = `Cover-Letter-${jobTitle?.replace(/\s+/g, '-') || 'Document'}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)

    } catch (err) {
      console.error('PDF Export Error:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDOCX = async () => {
    if (!coverLetter) return
    setIsExporting(true)
    try {
      await exportCoverLetterToDocx(coverLetter, jobTitle || 'Job Application', company || '')
    } catch (err) {
      console.error('DOCX Export Error:', err)
      setError('Failed to generate DOCX. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Expose handles to parent
  useImperativeHandle(ref, () => ({
    handleDownload,
    handleExportDOCX
  }))

  const handleRefine = async () => {
    if (!refinePrompt.trim() || !coverLetter) return

    setRefining(true)
    setError(null)

    try {
      const response = await fetch('/api/cover-letter/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCoverLetter: coverLetter,
          refinePrompt: refinePrompt.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Refinement failed')
      }

      const data = await response.json()

      if (data.success && data.data?.refinedCoverLetter) {
        setCoverLetter(data.data.refinedCoverLetter)
        setRefinePrompt('')
        setShowRefineInput(false)
      }
    } catch (err: any) {
      console.error('Refinement error:', err)
      setError(err.message || 'Failed to refine cover letter. Please try again.')
    } finally {
      setRefining(false)
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString())
      // We'll use this for regenerating specific parts
    }
  }

  const handleRegenerateSelection = async () => {
    if (!selectedText || !coverLetter) return

    setRefining(true)
    setError(null)

    try {
      const response = await fetch('/api/cover-letter/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCoverLetter: coverLetter,
          refinePrompt: `Rewrite this specific part: "${selectedText}". Make it more compelling and professional. Keep the rest of the letter the same.`,
        }),
      })

      if (!response.ok) {
        throw new Error('Regeneration failed')
      }

      const data = await response.json()

      if (data.success && data.data?.refinedCoverLetter) {
        setCoverLetter(data.data.refinedCoverLetter)
        setSelectedText('')
      }
    } catch (err: any) {
      console.error('Regeneration error:', err)
      setError(err.message || 'Failed to regenerate selection. Please try again.')
    } finally {
      setRefining(false)
    }
  }

  if (loadingJobInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading job information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden max-w-[1600px] mx-auto">
      <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6 text-center flex-shrink-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Cover Letter Generator</h2>
          <p className="text-white/60 text-sm sm:text-base">
            Create tailored cover letters for your job applications
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden">
          
          {/* LEFT COLUMN: Input Form */}
          <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Job Info Banner */}
            {jobTitle && jobDescription && (
              <div className="glass-panel p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1">Job Information Loaded</h4>
                    <p className="text-xs text-white/70">
                      Using job description from your resume analysis: <span className="font-medium text-blue-300">{jobTitle}</span>
                      {company && <span className="text-white/50"> at {company}</span>}
                    </p>
                    <p className="text-xs text-white/50 mt-1">You can edit the details below if needed.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Fields */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Company <span className="text-white/40 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['professional', 'enthusiastic', 'friendly'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-3 py-2.5 rounded-xl border transition-all text-sm font-medium ${tone === t
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-black/20 border-white/10 text-white/70 hover:border-white/20'}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div className="flex flex-col flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <div className="glass-panel p-1 rounded-xl border border-white/10 relative group focus-within:border-purple-500/50 transition-colors min-h-[200px]">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-full min-h-[200px] bg-transparent border-none resize-none p-4 text-white placeholder-white/30 focus:outline-none focus:ring-0 text-sm leading-relaxed"
                  />
                  {jobDescription.length > 0 && (
                    <div className="absolute bottom-3 right-3 text-xs text-white/40">
                      {jobDescription.length} chars
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || !jobTitle.trim() || !jobDescription.trim()}
                className={`
                  w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all mt-2
                  ${generating || !jobTitle.trim() || !jobDescription.trim()
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'glow-button text-white hover:scale-[1.01] active:scale-[0.99]'}
                `}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {existingCoverLetter || coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Output Canvas */}
          <div className="w-full lg:w-7/12 xl:w-2/3 flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Preview
              </h3>
              
              {coverLetter && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-lg transition-all text-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <ExportDropdown 
                    onExportPDF={handleDownload}
                    onExportDOCX={handleExportDOCX}
                    isExporting={isExporting}
                    variant="glass"
                  />
                </div>
              )}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-y-auto bg-black/20 rounded-2xl p-4 sm:p-6 border border-white/5 relative">
              {coverLetter ? (
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white text-gray-900 p-8 sm:p-12 shadow-2xl min-h-full rounded-sm mx-auto max-w-[800px]"
                  >
                    <div
                      className="font-serif leading-relaxed whitespace-pre-wrap text-[11pt] sm:text-[12pt] select-text"
                      onMouseUp={handleTextSelection}
                    >
                      {coverLetter}
                    </div>
                  </motion.div>

                  {/* Selection Regenerate Button */}
                  {selectedText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
                    >
                      <div className="glass-panel px-4 py-3 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-xl flex items-center gap-3">
                        <div className="text-white/80 text-sm max-w-[200px] truncate">
                          <span className="font-medium">{selectedText.length}</span> characters selected
                        </div>
                        <button
                          onClick={handleRegenerateSelection}
                          disabled={refining}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2
                            ${refining
                              ? 'bg-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'}
                          `}
                        >
                          {refining ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Rewriting...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              Regenerate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedText('')}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-8 text-center">
                  {generating ? (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex flex-col items-center"
                    >
                      <Loader2 className="w-12 h-12 mb-4 text-purple-500 animate-spin" />
                      <p className="text-lg font-medium text-white/80">Drafting your cover letter...</p>
                      <p className="text-sm mt-2">Analyzing your resume against the job description</p>
                    </motion.div>
                  ) : (
                    <>
                      <FileText className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No Cover Letter Generated Yet</p>
                      <p className="text-sm max-w-xs mx-auto">
                        Fill in the job details on the left and click "Generate" to create a tailored cover letter.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Refine Section (Visible when cover letter exists) */}
            {coverLetter && (
              <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5 flex-shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Refine with AI</h3>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    placeholder="e.g., Make it more enthusiastic, shorter, or emphasize leadership..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  />
                  <button
                    onClick={handleRefine}
                    disabled={refining || !refinePrompt.trim()}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2
                      ${refining || !refinePrompt.trim()
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'}
                    `}
                  >
                    {refining ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
})

CoverLetterView.displayName = 'CoverLetterView'
