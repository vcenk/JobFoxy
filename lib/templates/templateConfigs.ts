// lib/templates/templateConfigs.ts
// Template configurations - Define templates as JSON config
// This is what makes adding hundreds of templates easy!

import { TemplateConfig } from '@/lib/types/template'

/**
 * TEMPLATE LIBRARY
 * Add new templates by creating a new config object below
 * No need to write React components - the renderer handles it!
 */

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  /**
   * 1. MODERN SIDEBAR
   * Sleek design with colored sidebar on the left
   */
  'modern-sidebar': {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    description: 'Sleek two-column layout with vibrant accent sidebar',
    category: 'modern',
    tags: ['sidebar', 'colorful', 'modern', 'two-column'],
    previewImage: '/templates/modern-sidebar.svg',
    isPremium: false,

    layout: {
      type: 'sidebar-left',
      zones: [
        {
          id: 'sidebar',
          width: '35%',
          backgroundColor: 'var(--accent-color)',
          padding: '2rem',
          align: 'left',
          sections: ['contact', 'skills', 'education', 'languages', 'certifications'],
        },
        {
          id: 'main',
          width: '65%',
          padding: '2rem',
          align: 'left',
          sections: ['targetTitle', 'summary', 'experience', 'projects', 'volunteer', 'publications', 'awards'],
        },
      ],
      headerSections: [],
      footerSections: [],
    },

    design: {
      colors: {
        primary: '#8B5CF6',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        text: '#1F2937',
        heading: '#111827',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingSize: {
          h1: '2rem',
          h2: '1.5rem',
          h3: '1.25rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '1.5rem',
        itemGap: '1rem',
        padding: {
          section: '0',
        },
      },
      visual: {
        borderRadius: '0',
        dividerStyle: 'none',
        headerStyle: 'bold',
        bulletStyle: 'disc',
        iconStyle: 'solid',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 2. CLASSIC LINEAR
   * Traditional single-column professional resume
   */
  'classic-linear': {
    id: 'classic-linear',
    name: 'Classic Linear',
    description: 'Traditional single-column format, professional and timeless',
    category: 'classic',
    tags: ['single-column', 'traditional', 'professional', 'ats-friendly'],
    previewImage: '/templates/classic-linear.svg',
    isPremium: false,

    layout: {
      type: 'single-column',
      zones: [
        {
          id: 'header',
          width: '100%',
          padding: '0 0 1.5rem 0',
          sections: ['contact'],
        },
        {
          id: 'main',
          width: '100%',
          sections: ['targetTitle', 'summary', 'experience', 'education', 'skills', 'certifications', 'awards', 'volunteer'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#1F2937',
        text: '#374151',
        heading: '#111827',
        background: '#FFFFFF',
        border: '#E5E7EB',
      },
      typography: {
        headingFont: 'Georgia, serif',
        bodyFont: 'Arial, sans-serif',
        headingSize: {
          h1: '2.25rem',
          h2: '1.5rem',
          h3: '1.125rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 600,
        bodyWeight: 400,
        headingTransform: 'uppercase',
      },
      spacing: {
        sectionGap: '2rem',
        itemGap: '1.25rem',
      },
      visual: {
        dividerStyle: 'solid',
        dividerColor: '#E5E7EB',
        dividerThickness: '1px',
        headerStyle: 'underlined',
        bulletStyle: 'disc',
        iconStyle: 'none',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
      printOptimized: true,
    },

    customizable: {
      colors: false,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 3. MINIMAL CLEAN
   * Ultra-minimal design focused on typography and whitespace
   */
  'minimal-clean': {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Ultra-minimal design with generous whitespace and elegant typography',
    category: 'minimal',
    tags: ['minimal', 'clean', 'typography', 'whitespace'],
    previewImage: '/templates/minimal-clean.svg',
    isPremium: false,

    layout: {
      type: 'single-column',
      zones: [
        {
          id: 'main',
          width: '100%',
          padding: '3rem 4rem',
          sections: ['contact', 'targetTitle', 'summary', 'experience', 'education', 'skills', 'projects'],
        },
      ],
    },

    design: {
      colors: {
        text: '#000000',
        heading: '#000000',
        background: '#FFFFFF',
        muted: '#6B7280',
      },
      typography: {
        headingFont: 'Helvetica Neue, sans-serif',
        bodyFont: 'Helvetica Neue, sans-serif',
        headingSize: {
          h1: '2.5rem',
          h2: '1.25rem',
          h3: '1rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.8,
        letterSpacing: '0.02em',
        headingWeight: 300,
        bodyWeight: 300,
        headingTransform: 'uppercase',
      },
      spacing: {
        sectionGap: '3rem',
        itemGap: '1.5rem',
        margin: {
          top: '3rem',
          bottom: '3rem',
          left: '4rem',
          right: '4rem',
        },
      },
      visual: {
        dividerStyle: 'none',
        headerStyle: 'minimal',
        bulletStyle: 'dash',
        iconStyle: 'none',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
    },

    customizable: {
      colors: false,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 4. CREATIVE BOLD
   * Bold colors and creative layout for designers and creatives
   */
  'creative-bold': {
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'Bold colors and modern design for creative professionals',
    category: 'creative',
    tags: ['creative', 'colorful', 'bold', 'modern'],
    previewImage: '/templates/creative-bold.svg',
    isPremium: true,

    layout: {
      type: 'two-column',
      zones: [
        {
          id: 'column-1',
          width: '40%',
          padding: '2rem',
          sections: ['contact', 'skills', 'education', 'languages'],
        },
        {
          id: 'column-2',
          width: '60%',
          padding: '2rem',
          sections: ['targetTitle', 'summary', 'experience', 'projects', 'awards'],
        },
      ],
      headerSections: [],
    },

    design: {
      colors: {
        primary: '#EC4899',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: '#1F2937',
        heading: '#EC4899',
      },
      typography: {
        headingFont: 'Poppins, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingSize: {
          h1: '2.5rem',
          h2: '1.5rem',
          h3: '1.25rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '2rem',
        itemGap: '1rem',
      },
      visual: {
        borderRadius: '8px',
        headerStyle: 'filled',
        bulletStyle: 'circle',
        iconStyle: 'solid',
        shadows: true,
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: false, // Creative templates may not be ATS-optimized
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 5. PROFESSIONAL EXECUTIVE
   * Sophisticated design for senior positions and executives
   */
  'professional-executive': {
    id: 'professional-executive',
    name: 'Professional Executive',
    description: 'Sophisticated and refined design for executive-level positions',
    category: 'professional',
    tags: ['executive', 'professional', 'sophisticated', 'senior'],
    previewImage: '/templates/professional-executive.svg',
    isPremium: true,

    layout: {
      type: 'single-column',
      zones: [
        {
          id: 'header',
          width: '100%',
          backgroundColor: '#F9FAFB',
          padding: '2rem',
          sections: ['contact', 'targetTitle'],
        },
        {
          id: 'main',
          width: '100%',
          padding: '2rem',
          sections: ['summary', 'experience', 'education', 'skills', 'certifications', 'publications'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#1F2937',
        accent: '#3B82F6',
        background: '#FFFFFF',
        text: '#374151',
        heading: '#111827',
      },
      typography: {
        headingFont: 'Merriweather, serif',
        bodyFont: 'Open Sans, sans-serif',
        headingSize: {
          h1: '2rem',
          h2: '1.5rem',
          h3: '1.125rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.7,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '2.5rem',
        itemGap: '1.5rem',
      },
      visual: {
        dividerStyle: 'solid',
        dividerColor: '#E5E7EB',
        dividerThickness: '2px',
        headerStyle: 'boxed',
        bulletStyle: 'square',
        iconStyle: 'outline',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
      printOptimized: true,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 6. TECH MODERN
   * Clean, modern design optimized for tech professionals
   */
  'tech-modern': {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Clean, modern design optimized for software engineers and tech roles',
    category: 'modern',
    tags: ['tech', 'modern', 'clean', 'developer'],
    previewImage: '/templates/tech-modern.svg',
    isPremium: false,

    layout: {
      type: 'sidebar-left',
      zones: [
        {
          id: 'sidebar',
          width: '30%',
          backgroundColor: '#F3F4F6',
          padding: '2rem 1.5rem',
          sections: ['contact', 'skills', 'education', 'certifications'],
        },
        {
          id: 'main',
          width: '70%',
          padding: '2rem',
          sections: ['targetTitle', 'summary', 'experience', 'projects', 'publications'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#0EA5E9',
        accent: '#0EA5E9',
        background: '#FFFFFF',
        text: '#1F2937',
        heading: '#111827',
      },
      typography: {
        headingFont: 'JetBrains Mono, monospace',
        bodyFont: 'Inter, sans-serif',
        headingSize: {
          h1: '1.75rem',
          h2: '1.25rem',
          h3: '1rem',
        },
        bodySize: '0.9rem',
        lineHeight: 1.6,
        headingWeight: 600,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '1.75rem',
        itemGap: '1rem',
      },
      visual: {
        borderRadius: '4px',
        headerStyle: 'bold',
        bulletStyle: 'dash',
        iconStyle: 'outline',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 7. COMPACT DENSE
   * Space-efficient design for fitting more content on one page
   */
  'compact-dense': {
    id: 'compact-dense',
    name: 'Compact Dense',
    description: 'Space-efficient layout for maximizing content on one page',
    category: 'minimal',
    tags: ['compact', 'dense', 'space-efficient', 'one-page'],
    previewImage: '/templates/compact-dense.svg',
    isPremium: false,

    layout: {
      type: 'single-column',
      zones: [
        {
          id: 'header',
          width: '100%',
          padding: '1rem 0 0.75rem 0',
          sections: ['contact', 'targetTitle'],
        },
        {
          id: 'main',
          width: '100%',
          sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
        },
      ],
    },

    design: {
      colors: {
        text: '#1F2937',
        heading: '#111827',
        background: '#FFFFFF',
      },
      typography: {
        headingFont: 'Arial, sans-serif',
        bodyFont: 'Arial, sans-serif',
        headingSize: {
          h1: '1.5rem',
          h2: '1.125rem',
          h3: '1rem',
        },
        bodySize: '0.85rem',
        lineHeight: 1.4,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '0.75rem',
        itemGap: '0.5rem',
      },
      visual: {
        dividerStyle: 'none',
        headerStyle: 'bold',
        bulletStyle: 'disc',
        iconStyle: 'none',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
      printOptimized: true,
    },

    customizable: {
      colors: false,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 8. TWO-TONE
   * Modern two-color design with visual impact
   */
  'two-tone': {
    id: 'two-tone',
    name: 'Two-Tone',
    description: 'Modern design with contrasting two-color scheme',
    category: 'modern',
    tags: ['two-color', 'contrast', 'modern', 'visual'],
    previewImage: '/templates/two-tone.svg',
    isPremium: false,

    layout: {
      type: 'sidebar-right',
      zones: [
        {
          id: 'main',
          width: '65%',
          padding: '2rem',
          sections: ['targetTitle', 'summary', 'experience', 'projects'],
        },
        {
          id: 'sidebar',
          width: '35%',
          backgroundColor: '#1F2937',
          padding: '2rem',
          sections: ['contact', 'skills', 'education', 'certifications', 'languages'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#1F2937',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#1F2937',
        heading: '#111827',
      },
      typography: {
        headingFont: 'Roboto, sans-serif',
        bodyFont: 'Roboto, sans-serif',
        headingSize: {
          h1: '2rem',
          h2: '1.375rem',
          h3: '1.125rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '1.75rem',
        itemGap: '1rem',
      },
      visual: {
        borderRadius: '0',
        headerStyle: 'bold',
        bulletStyle: 'dash',
        iconStyle: 'solid',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 9. TIMELINE
   * Visual timeline design emphasizing career progression
   */
  'timeline': {
    id: 'timeline',
    name: 'Timeline',
    description: 'Visual timeline design emphasizing career progression',
    category: 'creative',
    tags: ['timeline', 'visual', 'career-progression', 'creative'],
    previewImage: '/templates/timeline.svg',
    isPremium: true,

    layout: {
      type: 'single-column',
      zones: [
        {
          id: 'header',
          width: '100%',
          padding: '2rem',
          backgroundColor: '#F9FAFB',
          sections: ['contact', 'targetTitle'],
        },
        {
          id: 'main',
          width: '100%',
          padding: '2rem 2rem 2rem 3rem',
          sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#6366F1',
        accent: '#6366F1',
        background: '#FFFFFF',
        text: '#374151',
        heading: '#111827',
      },
      typography: {
        headingFont: 'Montserrat, sans-serif',
        bodyFont: 'Open Sans, sans-serif',
        headingSize: {
          h1: '2.25rem',
          h2: '1.5rem',
          h3: '1.125rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '2rem',
        itemGap: '1.25rem',
      },
      visual: {
        headerStyle: 'bold',
        bulletStyle: 'circle',
        iconStyle: 'solid',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: false,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 10. ELEGANT SERIF
   * Classic design with serif typography for traditional industries
   */
  'elegant-serif': {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Classic serif design for traditional and academic fields',
    category: 'classic',
    tags: ['serif', 'elegant', 'traditional', 'academic'],
    previewImage: '/templates/elegant-serif.svg',
    isPremium: false,

    layout: {
      type: 'single-column',
      zones: [
        {
          id: 'main',
          width: '100%',
          padding: '2.5rem 3rem',
          sections: ['contact', 'targetTitle', 'summary', 'experience', 'education', 'publications', 'awards', 'skills'],
        },
      ],
    },

    design: {
      colors: {
        text: '#2D3748',
        heading: '#1A202C',
        background: '#FFFFFF',
        border: '#E2E8F0',
      },
      typography: {
        headingFont: 'Playfair Display, serif',
        bodyFont: 'Lora, serif',
        headingSize: {
          h1: '2.5rem',
          h2: '1.75rem',
          h3: '1.25rem',
        },
        bodySize: '1rem',
        lineHeight: 1.7,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '2.5rem',
        itemGap: '1.5rem',
        margin: {
          top: '2.5rem',
          bottom: '2.5rem',
        },
      },
      visual: {
        dividerStyle: 'solid',
        dividerColor: '#E2E8F0',
        dividerThickness: '1px',
        headerStyle: 'underlined',
        bulletStyle: 'disc',
        iconStyle: 'none',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
      printOptimized: true,
    },

    customizable: {
      colors: false,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 11. GRID LAYOUT
   * Modern grid-based design with flexible positioning
   */
  'grid-layout': {
    id: 'grid-layout',
    name: 'Grid Layout',
    description: 'Modern grid-based design with flexible section positioning',
    category: 'modern',
    tags: ['grid', 'modern', 'flexible', 'visual'],
    previewImage: '/templates/grid-layout.svg',
    isPremium: true,

    layout: {
      type: 'two-column',
      zones: [
        {
          id: 'column-1',
          width: '50%',
          padding: '2rem',
          sections: ['contact', 'targetTitle', 'summary', 'skills'],
        },
        {
          id: 'column-2',
          width: '50%',
          padding: '2rem',
          sections: ['experience', 'education', 'projects', 'certifications'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#8B5CF6',
        accent: '#06B6D4',
        background: '#FFFFFF',
        text: '#1F2937',
        heading: '#111827',
      },
      typography: {
        headingFont: 'Space Grotesk, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingSize: {
          h1: '2rem',
          h2: '1.5rem',
          h3: '1.125rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 600,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '1.5rem',
        itemGap: '1rem',
      },
      visual: {
        borderRadius: '8px',
        headerStyle: 'boxed',
        bulletStyle: 'circle',
        iconStyle: 'outline',
        shadows: true,
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: false,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
      layout: true,
    },
  },

  /**
   * 12. CONSULTANT PRO
   * Professional design for consultants and business professionals
   */
  'consultant-pro': {
    id: 'consultant-pro',
    name: 'Consultant Pro',
    description: 'Professional design optimized for consultants and business roles',
    category: 'professional',
    tags: ['consultant', 'business', 'professional', 'corporate'],
    previewImage: '/templates/consultant-pro.svg',
    isPremium: true,

    layout: {
      type: 'sidebar-left',
      zones: [
        {
          id: 'sidebar',
          width: '32%',
          backgroundColor: '#F8FAFC',
          padding: '2rem 1.5rem',
          sections: ['contact', 'skills', 'certifications', 'languages'],
        },
        {
          id: 'main',
          width: '68%',
          padding: '2rem',
          sections: ['targetTitle', 'summary', 'experience', 'education', 'projects'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#0F172A',
        accent: '#3B82F6',
        background: '#FFFFFF',
        text: '#334155',
        heading: '#0F172A',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingSize: {
          h1: '2rem',
          h2: '1.375rem',
          h3: '1.125rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 600,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '2rem',
        itemGap: '1.25rem',
      },
      visual: {
        borderRadius: '4px',
        headerStyle: 'bold',
        bulletStyle: 'square',
        iconStyle: 'outline',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
      printOptimized: true,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 13. CREATIVE PORTFOLIO
   * Bold creative design for designers and artists
   */
  'creative-portfolio': {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Bold and artistic design for designers, artists, and creatives',
    category: 'creative',
    tags: ['creative', 'portfolio', 'artistic', 'designer'],
    previewImage: '/templates/creative-portfolio.svg',
    isPremium: true,

    layout: {
      type: 'two-column',
      zones: [
        {
          id: 'column-1',
          width: '45%',
          padding: '2.5rem 2rem',
          backgroundColor: '#FEF3C7',
          sections: ['contact', 'summary', 'skills', 'awards'],
        },
        {
          id: 'column-2',
          width: '55%',
          padding: '2.5rem 2rem',
          sections: ['targetTitle', 'experience', 'education', 'projects'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#F59E0B',
        accent: '#EC4899',
        background: '#FFFFFF',
        text: '#1F2937',
        heading: '#92400E',
      },
      typography: {
        headingFont: 'Playfair Display, serif',
        bodyFont: 'Raleway, sans-serif',
        headingSize: {
          h1: '2.5rem',
          h2: '1.75rem',
          h3: '1.25rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '2rem',
        itemGap: '1.25rem',
      },
      visual: {
        borderRadius: '12px',
        headerStyle: 'filled',
        bulletStyle: 'arrow',
        iconStyle: 'duotone',
        shadows: true,
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: false,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
      layout: true,
    },
  },

  /**
   * 14. ACADEMIC
   * Traditional academic CV format for research and academia
   */
  'academic': {
    id: 'academic',
    name: 'Academic',
    description: 'Traditional CV format for academic and research positions',
    category: 'classic',
    tags: ['academic', 'cv', 'research', 'traditional'],
    previewImage: '/templates/academic.svg',
    isPremium: false,

    layout: {
      type: 'single-column',
      zones: [
        {
          id: 'header',
          width: '100%',
          padding: '0 0 1.5rem 0',
          sections: ['contact', 'targetTitle'],
        },
        {
          id: 'main',
          width: '100%',
          sections: ['summary', 'education', 'publications', 'experience', 'awards', 'certifications', 'skills'],
        },
      ],
    },

    design: {
      colors: {
        text: '#000000',
        heading: '#000000',
        background: '#FFFFFF',
        border: '#CCCCCC',
      },
      typography: {
        headingFont: 'Times New Roman, serif',
        bodyFont: 'Times New Roman, serif',
        headingSize: {
          h1: '1.75rem',
          h2: '1.25rem',
          h3: '1.125rem',
        },
        bodySize: '1rem',
        lineHeight: 1.5,
        headingWeight: 700,
        bodyWeight: 400,
        headingTransform: 'uppercase',
      },
      spacing: {
        sectionGap: '1.5rem',
        itemGap: '1rem',
      },
      visual: {
        dividerStyle: 'solid',
        dividerColor: '#CCCCCC',
        dividerThickness: '1px',
        headerStyle: 'underlined',
        bulletStyle: 'disc',
        iconStyle: 'none',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
      printOptimized: true,
    },

    customizable: {
      colors: false,
      fonts: false,
      spacing: true,
      sectionOrder: true,
    },
  },

  /**
   * 15. STARTUP
   * Modern, energetic design for startup and fast-paced environments
   */
  'startup': {
    id: 'startup',
    name: 'Startup',
    description: 'Modern, energetic design for startup culture and fast-paced roles',
    category: 'modern',
    tags: ['startup', 'modern', 'energetic', 'fast-paced'],
    previewImage: '/templates/startup.svg',
    isPremium: false,

    layout: {
      type: 'sidebar-left',
      zones: [
        {
          id: 'sidebar',
          width: '33%',
          backgroundColor: '#18181B',
          padding: '2rem',
          sections: ['contact', 'skills', 'certifications'],
        },
        {
          id: 'main',
          width: '67%',
          padding: '2rem',
          sections: ['targetTitle', 'summary', 'experience', 'projects', 'education'],
        },
      ],
    },

    design: {
      colors: {
        primary: '#10B981',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#18181B',
        heading: '#18181B',
      },
      typography: {
        headingFont: 'Outfit, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingSize: {
          h1: '2.25rem',
          h2: '1.5rem',
          h3: '1.125rem',
        },
        bodySize: '0.95rem',
        lineHeight: 1.6,
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: {
        sectionGap: '1.75rem',
        itemGap: '1rem',
      },
      visual: {
        borderRadius: '6px',
        headerStyle: 'bold',
        bulletStyle: 'dash',
        iconStyle: 'solid',
      },
    },

    behavior: {
      sectionOrdering: 'draggable',
      atsOptimized: true,
    },

    customizable: {
      colors: true,
      fonts: true,
      spacing: true,
      sectionOrder: true,
    },
  },
}

/**
 * Helper function to get template config
 */
export function getTemplateConfig(templateId: string): TemplateConfig | undefined {
  return TEMPLATE_CONFIGS[templateId]
}

/**
 * Helper function to get all template configs
 */
export function getAllTemplateConfigs(): TemplateConfig[] {
  return Object.values(TEMPLATE_CONFIGS)
}

/**
 * Helper function to get templates by category
 */
export function getTemplatesByCategory(category: TemplateConfig['category']): TemplateConfig[] {
  return getAllTemplateConfigs().filter(config => config.category === category)
}

/**
 * Helper function to get free templates
 */
export function getFreeTemplates(): TemplateConfig[] {
  return getAllTemplateConfigs().filter(config => !config.isPremium)
}

/**
 * Helper function to get premium templates
 */
export function getPremiumTemplates(): TemplateConfig[] {
  return getAllTemplateConfigs().filter(config => config.isPremium)
}
