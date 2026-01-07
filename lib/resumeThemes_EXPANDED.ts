// lib/resumeThemes.ts
// Expanded Resume Template Library - 40+ Professional Templates
// Inspired by Teal and industry-leading resume platforms

export interface ResumeTheme {
  id: string
  name: string
  value: string | null // null for JobFoxy default
  description: string
  category: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional' | 'bold' | 'executive' | 'tech'
  features: string[]
  previewImage: string
  color: string
  npm?: string
  bestFor?: string[] // New: Recommended job types
  atsScore?: number // New: ATS compatibility score (1-10)
}

export const RESUME_THEMES: ResumeTheme[] = [
  // ===== JOBFOXY DEFAULT =====
  {
    id: 'jobfoxy',
    name: 'JobFoxy Classic',
    value: null,
    description: 'Our custom builder with full design control',
    category: 'modern',
    features: ['Live editing', 'Custom sections', 'Full customization', 'Multi-column'],
    previewImage: '/themes/jobfoxy-preview.svg',
    color: '#6C47FF',
    bestFor: ['All Industries'],
    atsScore: 10,
  },

  // ===== MODERN CATEGORY (12 templates) =====
  {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    value: 'modern-sidebar',
    description: 'Sleek two-column layout with vibrant accent sidebar',
    category: 'modern',
    features: ['Sidebar Layout', 'Colorful', 'Modern', 'ATS-Friendly'],
    previewImage: '/templates/modern-sidebar.svg',
    color: '#8B5CF6',
    bestFor: ['Tech', 'Design', 'Marketing'],
    atsScore: 9,
  },
  {
    id: 'two-tone',
    name: 'Two-Tone',
    value: 'two-tone',
    description: 'Modern design with contrasting two-color scheme',
    category: 'modern',
    features: ['Two-Color', 'Contrast', 'Modern', 'Visual'],
    previewImage: '/templates/two-tone.svg',
    color: '#10B981',
    bestFor: ['Tech', 'Startup', 'Design'],
    atsScore: 8,
  },
  {
    id: 'grid-layout',
    name: 'Grid Layout',
    value: 'grid-layout',
    description: 'Modern grid-based design with flexible section positioning',
    category: 'modern',
    features: ['Grid', 'Modern', 'Flexible', 'Visual'],
    previewImage: '/templates/grid-layout.svg',
    color: '#8B5CF6',
    bestFor: ['Creative', 'Design', 'UX/UI'],
    atsScore: 7,
    npm: 'premium',
  },
  {
    id: 'startup',
    name: 'Startup',
    value: 'startup',
    description: 'Modern, energetic design for startup culture and fast-paced roles',
    category: 'modern',
    features: ['Startup', 'Modern', 'Energetic', 'Fast-Paced'],
    previewImage: '/templates/startup.svg',
    color: '#10B981',
    bestFor: ['Startup', 'Entrepreneurship', 'Innovation'],
    atsScore: 8,
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    value: 'tech-modern',
    description: 'Clean modern design optimized for tech professionals',
    category: 'tech',
    features: ['Tech', 'Developer', 'Modern', 'Clean'],
    previewImage: '/templates/tech-modern.svg',
    color: '#0EA5E9',
    bestFor: ['Software Engineering', 'Data Science', 'IT'],
    atsScore: 9,
  },
  // NEW MODERN TEMPLATES
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    value: 'glassmorphism',
    description: 'Ultra-modern design with frosted glass effect and transparency',
    category: 'modern',
    features: ['Glassmorphism', 'Transparent', 'Trendy', 'Modern'],
    previewImage: '/templates/glassmorphism.svg',
    color: '#3B82F6',
    bestFor: ['Design', 'UX/UI', 'Digital Media'],
    atsScore: 6,
    npm: 'premium',
  },
  {
    id: 'neo-brutalism',
    name: 'Neo Brutalism',
    value: 'neo-brutalism',
    description: 'Bold, geometric design with strong borders and vibrant colors',
    category: 'modern',
    features: ['Bold', 'Geometric', 'Vibrant', 'Unique'],
    previewImage: '/templates/neo-brutalism.svg',
    color: '#F97316',
    bestFor: ['Creative', 'Design', 'Brand Strategy'],
    atsScore: 5,
    npm: 'premium',
  },
  {
    id: 'gradient-flow',
    name: 'Gradient Flow',
    value: 'gradient-flow',
    description: 'Smooth gradient transitions and flowing modern design',
    category: 'modern',
    features: ['Gradient', 'Flowing', 'Colorful', 'Modern'],
    previewImage: '/templates/gradient-flow.svg',
    color: '#A78BFA',
    bestFor: ['Marketing', 'Design', 'Creative'],
    atsScore: 7,
    npm: 'premium',
  },
  {
    id: 'asymmetric-modern',
    name: 'Asymmetric Modern',
    value: 'asymmetric-modern',
    description: 'Dynamic asymmetric layout with modern styling',
    category: 'modern',
    features: ['Asymmetric', 'Dynamic', 'Modern', 'Unique'],
    previewImage: '/templates/asymmetric-modern.svg',
    color: '#EC4899',
    bestFor: ['Creative', 'UX/UI', 'Product Design'],
    atsScore: 6,
  },
  {
    id: 'carbon',
    name: 'Carbon',
    value: 'carbon',
    description: 'Dark modern theme with sleek carbon fiber aesthetics',
    category: 'modern',
    features: ['Dark Theme', 'Sleek', 'Modern', 'Premium'],
    previewImage: '/templates/carbon.svg',
    color: '#1F2937',
    bestFor: ['Tech', 'Engineering', 'Gaming'],
    atsScore: 7,
    npm: 'premium',
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    value: 'split-screen',
    description: 'Equal split design with distinct left and right sections',
    category: 'modern',
    features: ['Split Layout', 'Balanced', 'Modern', 'Clear'],
    previewImage: '/templates/split-screen.svg',
    color: '#6366F1',
    bestFor: ['Business', 'Consulting', 'Finance'],
    atsScore: 8,
  },
  {
    id: 'infographic',
    name: 'Infographic',
    value: 'infographic',
    description: 'Visual-heavy design with charts, icons, and graphics',
    category: 'modern',
    features: ['Visual', 'Icons', 'Charts', 'Infographic'],
    previewImage: '/templates/infographic.svg',
    color: '#14B8A6',
    bestFor: ['Data Science', 'Analytics', 'Marketing'],
    atsScore: 6,
    npm: 'premium',
  },

  // ===== CLASSIC CATEGORY (9 templates) =====
  {
    id: 'classic-linear',
    name: 'Classic Linear',
    value: 'classic-linear',
    description: 'Traditional single-column format, professional and timeless',
    category: 'classic',
    features: ['Single Column', 'Traditional', 'Professional', 'ATS-Friendly'],
    previewImage: '/templates/classic-linear.svg',
    color: '#1F2937',
    bestFor: ['All Industries', 'Traditional Fields'],
    atsScore: 10,
  },
  {
    id: 'professional-executive',
    name: 'Professional Executive',
    value: 'professional-executive',
    description: 'Sophisticated design for executive-level positions',
    category: 'executive',
    features: ['Executive', 'Sophisticated', 'Professional', 'Senior'],
    previewImage: '/templates/professional-executive.svg',
    color: '#3B82F6',
    bestFor: ['Executive', 'C-Suite', 'Senior Management'],
    atsScore: 9,
    npm: 'premium',
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    value: 'elegant-serif',
    description: 'Classic serif design for traditional and academic fields',
    category: 'classic',
    features: ['Serif', 'Elegant', 'Traditional', 'Academic'],
    previewImage: '/templates/elegant-serif.svg',
    color: '#2D3748',
    bestFor: ['Academic', 'Law', 'Publishing'],
    atsScore: 9,
  },
  {
    id: 'academic',
    name: 'Academic',
    value: 'academic',
    description: 'Traditional CV format for academic and research positions',
    category: 'classic',
    features: ['Academic', 'CV', 'Research', 'Traditional'],
    previewImage: '/templates/academic.svg',
    color: '#000000',
    bestFor: ['Academia', 'Research', 'Education'],
    atsScore: 10,
  },
  // NEW CLASSIC TEMPLATES
  {
    id: 'traditional-times',
    name: 'Traditional Times',
    value: 'traditional-times',
    description: 'Timeless design with Times New Roman and classic layout',
    category: 'classic',
    features: ['Traditional', 'Serif', 'Classic', 'Formal'],
    previewImage: '/templates/traditional-times.svg',
    color: '#1E293B',
    bestFor: ['Law', 'Government', 'Academia'],
    atsScore: 10,
  },
  {
    id: 'corporate-classic',
    name: 'Corporate Classic',
    value: 'corporate-classic',
    description: 'Conservative corporate design for traditional industries',
    category: 'classic',
    features: ['Corporate', 'Conservative', 'Professional', 'Traditional'],
    previewImage: '/templates/corporate-classic.svg',
    color: '#1F2937',
    bestFor: ['Banking', 'Finance', 'Insurance'],
    atsScore: 10,
  },
  {
    id: 'harvard-classic',
    name: 'Harvard Classic',
    value: 'harvard-classic',
    description: 'Ivy League-inspired format with academic elegance',
    category: 'classic',
    features: ['Academic', 'Elegant', 'Classic', 'Prestigious'],
    previewImage: '/templates/harvard-classic.svg',
    color: '#991B1B',
    bestFor: ['Education', 'Research', 'Consulting'],
    atsScore: 10,
  },
  {
    id: 'federal',
    name: 'Federal',
    value: 'federal',
    description: 'Government-compliant format for federal applications',
    category: 'classic',
    features: ['Government', 'Compliant', 'Detailed', 'Formal'],
    previewImage: '/templates/federal.svg',
    color: '#1E40AF',
    bestFor: ['Government', 'Public Sector', 'Non-Profit'],
    atsScore: 10,
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    value: 'lawyer',
    description: 'Professional legal resume with formal structure',
    category: 'classic',
    features: ['Legal', 'Formal', 'Professional', 'Detailed'],
    previewImage: '/templates/lawyer.svg',
    color: '#0F172A',
    bestFor: ['Legal', 'Law Firms', 'Judiciary'],
    atsScore: 10,
  },

  // ===== MINIMAL CATEGORY (7 templates) =====
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    value: 'minimal-clean',
    description: 'Ultra-minimal design with generous whitespace',
    category: 'minimal',
    features: ['Minimal', 'Clean', 'Typography-Focused', 'Whitespace'],
    previewImage: '/templates/minimal-clean.svg',
    color: '#6B7280',
    bestFor: ['Design', 'Architecture', 'Consulting'],
    atsScore: 9,
  },
  {
    id: 'compact-dense',
    name: 'Compact Dense',
    value: 'compact-dense',
    description: 'Space-efficient layout for maximizing content on one page',
    category: 'minimal',
    features: ['Compact', 'Dense', 'Space-Efficient', 'One-Page'],
    previewImage: '/templates/compact-dense.svg',
    color: '#6B7280',
    bestFor: ['Experienced Professionals', 'Career Changers'],
    atsScore: 8,
  },
  // NEW MINIMAL TEMPLATES
  {
    id: 'swiss-minimal',
    name: 'Swiss Minimal',
    value: 'swiss-minimal',
    description: 'Swiss design principles with perfect typography and spacing',
    category: 'minimal',
    features: ['Swiss Design', 'Typography', 'Grid', 'Clean'],
    previewImage: '/templates/swiss-minimal.svg',
    color: '#374151',
    bestFor: ['Design', 'Architecture', 'UX'],
    atsScore: 9,
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    value: 'monochrome',
    description: 'Pure black and white minimal aesthetic',
    category: 'minimal',
    features: ['Monochrome', 'Simple', 'Clean', 'Classic'],
    previewImage: '/templates/monochrome.svg',
    color: '#000000',
    bestFor: ['All Industries', 'Traditional Fields'],
    atsScore: 10,
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    value: 'scandinavian',
    description: 'Nordic-inspired minimalism with functional beauty',
    category: 'minimal',
    features: ['Nordic', 'Minimal', 'Functional', 'Clean'],
    previewImage: '/templates/scandinavian.svg',
    color: '#94A3B8',
    bestFor: ['Design', 'Product', 'Sustainability'],
    atsScore: 9,
  },
  {
    id: 'zen',
    name: 'Zen',
    value: 'zen',
    description: 'Calm, balanced design with maximum whitespace',
    category: 'minimal',
    features: ['Calm', 'Balanced', 'Whitespace', 'Simple'],
    previewImage: '/templates/zen.svg',
    color: '#D1D5DB',
    bestFor: ['Wellness', 'Consulting', 'Coaching'],
    atsScore: 8,
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    value: 'typewriter',
    description: 'Monospace font with minimalist structure',
    category: 'minimal',
    features: ['Monospace', 'Minimal', 'Developer', 'Technical'],
    previewImage: '/templates/typewriter.svg',
    color: '#64748B',
    bestFor: ['Developers', 'Tech', 'Engineering'],
    atsScore: 8,
  },

  // ===== CREATIVE CATEGORY (7 templates) =====
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    value: 'creative-bold',
    description: 'Bold colors and modern design for creative professionals',
    category: 'creative',
    features: ['Colorful', 'Bold', 'Creative', 'Modern'],
    previewImage: '/templates/creative-bold.svg',
    color: '#EC4899',
    bestFor: ['Design', 'Marketing', 'Creative'],
    atsScore: 7,
    npm: 'premium',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    value: 'timeline',
    description: 'Visual timeline design emphasizing career progression',
    category: 'creative',
    features: ['Timeline', 'Visual', 'Career-Progression', 'Creative'],
    previewImage: '/templates/timeline.svg',
    color: '#6366F1',
    bestFor: ['Creative', 'Design', 'Marketing'],
    atsScore: 6,
    npm: 'premium',
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    value: 'creative-portfolio',
    description: 'Bold and artistic design for designers, artists, and creatives',
    category: 'creative',
    features: ['Creative', 'Portfolio', 'Artistic', 'Designer'],
    previewImage: '/templates/creative-portfolio.svg',
    color: '#F59E0B',
    bestFor: ['Design', 'Art', 'Photography'],
    atsScore: 5,
    npm: 'premium',
  },
  // NEW CREATIVE TEMPLATES
  {
    id: 'magazine',
    name: 'Magazine',
    value: 'magazine',
    description: 'Editorial magazine-style layout with visual impact',
    category: 'creative',
    features: ['Magazine', 'Editorial', 'Visual', 'Bold'],
    previewImage: '/templates/magazine.svg',
    color: '#DC2626',
    bestFor: ['Journalism', 'Media', 'Publishing'],
    atsScore: 6,
    npm: 'premium',
  },
  {
    id: 'artistic',
    name: 'Artistic',
    value: 'artistic',
    description: 'Freeform artistic design for maximum creativity',
    category: 'creative',
    features: ['Artistic', 'Freeform', 'Unique', 'Creative'],
    previewImage: '/templates/artistic.svg',
    color: '#C026D3',
    bestFor: ['Art', 'Design', 'Illustration'],
    atsScore: 4,
    npm: 'premium',
  },
  {
    id: 'video-editor',
    name: 'Video Editor',
    value: 'video-editor',
    description: 'Dynamic design for video and multimedia professionals',
    category: 'creative',
    features: ['Video', 'Multimedia', 'Dynamic', 'Modern'],
    previewImage: '/templates/video-editor.svg',
    color: '#7C3AED',
    bestFor: ['Video Editing', 'Media Production', 'Film'],
    atsScore: 6,
    npm: 'premium',
  },
  {
    id: 'game-designer',
    name: 'Game Designer',
    value: 'game-designer',
    description: 'Playful design for game designers and developers',
    category: 'creative',
    features: ['Gaming', 'Playful', 'Bold', 'Colorful'],
    previewImage: '/templates/game-designer.svg',
    color: '#FB923C',
    bestFor: ['Game Design', 'Gaming', 'Interactive Media'],
    atsScore: 5,
    npm: 'premium',
  },

  // ===== PROFESSIONAL CATEGORY (6 templates) =====
  {
    id: 'consultant-pro',
    name: 'Consultant Pro',
    value: 'consultant-pro',
    description: 'Professional design optimized for consultants and business roles',
    category: 'professional',
    features: ['Consultant', 'Business', 'Professional', 'Corporate'],
    previewImage: '/templates/consultant-pro.svg',
    color: '#3B82F6',
    bestFor: ['Consulting', 'Business', 'Strategy'],
    atsScore: 9,
    npm: 'premium',
  },
  // NEW PROFESSIONAL TEMPLATES
  {
    id: 'investment-banker',
    name: 'Investment Banker',
    value: 'investment-banker',
    description: 'Elite design for finance and banking professionals',
    category: 'professional',
    features: ['Finance', 'Banking', 'Elite', 'Professional'],
    previewImage: '/templates/investment-banker.svg',
    color: '#1E40AF',
    bestFor: ['Investment Banking', 'Private Equity', 'Finance'],
    atsScore: 10,
    npm: 'premium',
  },
  {
    id: 'management-consulting',
    name: 'Management Consulting',
    value: 'management-consulting',
    description: 'McKinsey-inspired format for top consulting firms',
    category: 'professional',
    features: ['Consulting', 'McKinsey', 'Elite', 'Professional'],
    previewImage: '/templates/management-consulting.svg',
    color: '#0F172A',
    bestFor: ['Management Consulting', 'Strategy', 'MBB'],
    atsScore: 10,
    npm: 'premium',
  },
  {
    id: 'healthcare-pro',
    name: 'Healthcare Professional',
    value: 'healthcare-pro',
    description: 'Clean professional design for healthcare workers',
    category: 'professional',
    features: ['Healthcare', 'Medical', 'Professional', 'Clean'],
    previewImage: '/templates/healthcare-pro.svg',
    color: '#059669',
    bestFor: ['Healthcare', 'Medical', 'Nursing'],
    atsScore: 9,
  },
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    value: 'sales-executive',
    description: 'Results-focused design highlighting achievements',
    category: 'professional',
    features: ['Sales', 'Results', 'Metrics', 'Professional'],
    previewImage: '/templates/sales-executive.svg',
    color: '#EAB308',
    bestFor: ['Sales', 'Business Development', 'Account Management'],
    atsScore: 9,
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    value: 'project-manager',
    description: 'Structured design emphasizing project leadership',
    category: 'professional',
    features: ['Project Management', 'Leadership', 'Structured', 'Professional'],
    previewImage: '/templates/project-manager.svg',
    color: '#0891B2',
    bestFor: ['Project Management', 'Program Management', 'Agile'],
    atsScore: 9,
  },

  // ===== TECH CATEGORY (5 templates) =====
  // NEW TECH TEMPLATES
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    value: 'software-engineer',
    description: 'Code-focused design for software developers',
    category: 'tech',
    features: ['Developer', 'Code', 'Technical', 'Clean'],
    previewImage: '/templates/software-engineer.svg',
    color: '#2563EB',
    bestFor: ['Software Engineering', 'Development', 'Programming'],
    atsScore: 10,
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    value: 'data-scientist',
    description: 'Analytics-focused design with visual data elements',
    category: 'tech',
    features: ['Data', 'Analytics', 'Scientific', 'Technical'],
    previewImage: '/templates/data-scientist.svg',
    color: '#7C3AED',
    bestFor: ['Data Science', 'ML/AI', 'Analytics'],
    atsScore: 9,
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    value: 'devops-engineer',
    description: 'System-focused design for DevOps and infrastructure roles',
    category: 'tech',
    features: ['DevOps', 'Infrastructure', 'Technical', 'Modern'],
    previewImage: '/templates/devops-engineer.svg',
    color: '#0891B2',
    bestFor: ['DevOps', 'SRE', 'Cloud Engineering'],
    atsScore: 9,
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    value: 'cybersecurity',
    description: 'Secure, professional design for security professionals',
    category: 'tech',
    features: ['Security', 'Professional', 'Technical', 'Clean'],
    previewImage: '/templates/cybersecurity.svg',
    color: '#DC2626',
    bestFor: ['Cybersecurity', 'InfoSec', 'Security Engineering'],
    atsScore: 10,
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    value: 'product-manager',
    description: 'Strategic design emphasizing product leadership',
    category: 'tech',
    features: ['Product', 'Strategy', 'Leadership', 'Modern'],
    previewImage: '/templates/product-manager.svg',
    color: '#F59E0B',
    bestFor: ['Product Management', 'Product Strategy', 'Tech'],
    atsScore: 9,
  },
]

// Get theme by value
export function getThemeByValue(value: string | null): ResumeTheme | undefined {
  return RESUME_THEMES.find(theme => theme.value === value)
}

// Get themes by category
export function getThemesByCategory(category: ResumeTheme['category']): ResumeTheme[] {
  return RESUME_THEMES.filter(theme => theme.category === category)
}

// Get default theme
export function getDefaultTheme(): ResumeTheme {
  return RESUME_THEMES[0] // JobFoxy Default
}

// Get all categories
export function getAllCategories(): ResumeTheme['category'][] {
  return ['modern', 'classic', 'minimal', 'creative', 'professional', 'tech', 'bold', 'executive']
}

// Get category display info
export function getCategoryInfo(category: ResumeTheme['category']) {
  const info = {
    modern: { label: 'Modern', description: 'Contemporary designs with clean lines', icon: '✨' },
    classic: { label: 'Classic', description: 'Timeless traditional formats', icon: '📋' },
    minimal: { label: 'Minimal', description: 'Simple, clean, whitespace-focused', icon: '⚪' },
    creative: { label: 'Creative', description: 'Bold, artistic, unique designs', icon: '🎨' },
    professional: { label: 'Professional', description: 'Corporate and business-focused', icon: '💼' },
    tech: { label: 'Tech', description: 'Optimized for technical roles', icon: '💻' },
    bold: { label: 'Bold', description: 'Eye-catching and standout', icon: '⚡' },
    executive: { label: 'Executive', description: 'Senior leadership and C-suite', icon: '👔' },
  }
  return info[category]
}

// Search templates
export function searchTemplates(query: string): ResumeTheme[] {
  const lowerQuery = query.toLowerCase()
  return RESUME_THEMES.filter(theme =>
    theme.name.toLowerCase().includes(lowerQuery) ||
    theme.description.toLowerCase().includes(lowerQuery) ||
    theme.features.some(f => f.toLowerCase().includes(lowerQuery)) ||
    theme.bestFor?.some(bf => bf.toLowerCase().includes(lowerQuery))
  )
}

// Get recommended templates for job title
export function getRecommendedTemplates(jobTitle: string): ResumeTheme[] {
  const lowerTitle = jobTitle.toLowerCase()

  // Map job titles to recommended templates
  if (lowerTitle.includes('software') || lowerTitle.includes('developer') || lowerTitle.includes('engineer')) {
    return RESUME_THEMES.filter(t => t.id === 'software-engineer' || t.id === 'tech-modern' || t.id === 'devops-engineer')
  }
  if (lowerTitle.includes('designer') || lowerTitle.includes('ux') || lowerTitle.includes('ui')) {
    return RESUME_THEMES.filter(t => t.id === 'creative-portfolio' || t.id === 'modern-sidebar' || t.id === 'glassmorphism')
  }
  if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
    return RESUME_THEMES.filter(t => t.id === 'professional-executive' || t.id === 'consultant-pro' || t.id === 'project-manager')
  }
  if (lowerTitle.includes('data') || lowerTitle.includes('analyst')) {
    return RESUME_THEMES.filter(t => t.id === 'data-scientist' || t.id === 'infographic' || t.id === 'tech-modern')
  }

  // Default recommendations
  return RESUME_THEMES.slice(0, 6)
}
