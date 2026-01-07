// components/resume/studio/ResumePaper.tsx
// Resume paper container with pagination support

'use client'

import React, { ReactNode } from 'react'
import { useResume } from '@/contexts/ResumeContext'

interface ResumePaperProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export const ResumePaper: React.FC<ResumePaperProps> = ({ children, className, style }) => {
  const { designerSettings, resumeData } = useResume()

  const PAGE_DIMENSIONS = {
    letter: { width: '8.5in', height: '11in', heightPx: 1056 },
    a4: { width: '210mm', height: '297mm', heightPx: 1123 },
  }

  const currentDim = PAGE_DIMENSIONS[designerSettings.paperSize]
  const pageBreakColor = '#e5e7eb'
  const pageBreakThicknessPx = 1
  const pageBreakOffsetPx = currentDim.heightPx - pageBreakThicknessPx

  const PageNumberStyles = () => {
    const { enabled, alignment } = designerSettings.pageNumbers

    const alignmentMap = {
      left: '0',
      center: '50%',
      right: '100%',
    }

    const transformMap = {
      left: 'translateX(0)',
      center: 'translateX(-50%)',
      right: 'translateX(-100%)',
    }

    const pageNumberCss = enabled
      ? `
        @media print {
          @page {
            margin-bottom: 0.75in;
            @bottom-${alignment} {
              content: counter(page);
              font-size: 9pt;
              color: #666;
            }
          }

          .resume-page-footer {
            display: block;
            position: running(footer);
            font-size: 9pt;
            color: #666;
            text-align: ${alignment};
          }
        }

        @media screen {
          .resume-page-footer {
            display: ${enabled ? 'block' : 'none'};
            text-align: ${alignment};
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e0e0e0;
            font-size: 9pt;
            color: #666;
          }
        }
      `
      : `
        @media print {
          .resume-page-footer {
            display: none;
          }
        }
        @media screen {
          .resume-page-footer {
            display: none;
          }
        }
      `

    const css = `
      @media print {
        .print-avoid-break {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        @page {
          size: ${designerSettings.paperSize === 'letter' ? '8.5in 11in' : 'A4'};
        }
      }
      ${pageNumberCss}
    `
    return <style>{css}</style>
  }

  // Get contact name for footer
  const getFooterName = () => {
    if (resumeData?.contact?.firstName && resumeData?.contact?.lastName) {
      return `${resumeData.contact.firstName} ${resumeData.contact.lastName}`
    }
    return 'Resume'
  }

  // Font family mapping using CSS variables from layout
  const getFontFamily = () => {
    const fontMap: Record<string, string> = {
      'inter': 'var(--font-inter), sans-serif',
      'sf-pro': '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      'roboto': 'var(--font-roboto), sans-serif',
      'lato': 'var(--font-lato), sans-serif',
      'open-sans': 'var(--font-open-sans), sans-serif',
      'montserrat': 'var(--font-montserrat), sans-serif',
      'raleway': 'var(--font-raleway), sans-serif',
      'poppins': 'var(--font-poppins), sans-serif',
      'playfair': 'var(--font-playfair), serif',
      'merriweather': 'var(--font-merriweather), serif',
      'georgia': 'Georgia, serif',
      'times': '"Times New Roman", Times, serif',
    }
    return fontMap[designerSettings.fontFamily] || fontMap['inter']
  }

  return (
    <>
      <PageNumberStyles />
      <div
        id="resume-paper"
        className={`resume-paper bg-white shadow-2xl transition-all duration-300 ease-in-out relative ${className || ''}`}
        style={{
          width: currentDim.width,
          minHeight: currentDim.height,
          padding: `${designerSettings.margins}px`,
          paddingBottom: designerSettings.pageNumbers.enabled
            ? `${designerSettings.margins + 30}px`
            : `${designerSettings.margins}px`,
          fontFamily: getFontFamily(),
          lineHeight: designerSettings.lineHeight,
          fontSize: `${designerSettings.fontSizeBody}pt`,
          backgroundImage: `linear-gradient(to bottom, #ffffff 0, #ffffff ${pageBreakOffsetPx}px, ${pageBreakColor} ${pageBreakOffsetPx}px, ${pageBreakColor} ${currentDim.heightPx}px)`,
          backgroundSize: `100% ${currentDim.heightPx}px`,
          backgroundRepeat: 'repeat-y',
          ...style,
        }}
      >
        {children}

        {/* Page footer - visible in print and as preview on screen */}
        {designerSettings.pageNumbers.enabled && (
          <div className="resume-page-footer">
            <span className="page-number">1</span>
          </div>
        )}
      </div>

      {/* Print-specific overrides */}
      <style jsx>{`
        @media print {
          #resume-paper {
            background-image: none !important;
            box-shadow: none !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
          }

          .page-number::after {
            content: counter(page);
          }
        }
      `}</style>
    </>
  )
}
