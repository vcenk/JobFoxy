'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  Star,
  Sparkles,
  ChevronRight,
  Zap,
  Eye,
  Download,
  TrendingUp,
  CheckCircle,
  Grid3x3,
  List,
  SlidersHorizontal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ALL_TEMPLATES,
  CATEGORY_INFO,
  getTemplatesByCategory,
  getFreeTemplates,
  getPremiumTemplates,
  getTopTemplates,
  getATSFriendlyTemplates,
  type TemplateCategory,
  type TemplateMetadata,
  type IndustryFocus,
} from '@/lib/templates/templateLibrary'

export default function ResumeTemplatesPage() {
  const router = useRouter()

  // State
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [minATSScore, setMinATSScore] = useState(0)
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryFocus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'popularity' | 'ats-score' | 'name'>('popularity')

  // Only show implemented templates (not mockups/placeholders)
  // Currently only 'modern-1' (Nexus) has a full React implementation
  const IMPLEMENTED_TEMPLATES = useMemo(() => {
    return ALL_TEMPLATES.filter(t => t.id === 'modern-1')
  }, [])

  // Get categories with counts (based on implemented templates only)
  const categories: Array<{ id: TemplateCategory | 'all'; name: string; count: number; description: string }> = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    IMPLEMENTED_TEMPLATES.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
    })

    return [
      { id: 'all', name: 'All Templates', count: IMPLEMENTED_TEMPLATES.length, description: 'Browse all available templates' },
      ...Object.entries(CATEGORY_INFO).map(([id, info]) => ({
        id: id as TemplateCategory,
        name: info.name,
        count: categoryCounts[id] || 0,
        description: info.description,
      })).filter(cat => cat.count > 0), // Only show categories with templates
    ]
  }, [IMPLEMENTED_TEMPLATES])

  const industries: IndustryFocus[] = ['tech', 'business', 'creative', 'healthcare', 'education', 'finance', 'engineering', 'sales', 'marketing', 'legal']

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let templates = IMPLEMENTED_TEMPLATES

    // Category filter
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Premium/Free filter
    if (showPremiumOnly) {
      templates = templates.filter(t => t.isPremium)
    }
    if (showFreeOnly) {
      templates = templates.filter(t => !t.isPremium)
    }

    // ATS Score filter
    if (minATSScore > 0) {
      templates = templates.filter(t => t.atsScore >= minATSScore)
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      templates = templates.filter(t => t.industryFocus?.includes(selectedIndustry))
    }

    // Sort
    templates = [...templates].sort((a, b) => {
      if (sortBy === 'popularity') {
        return (a.popularityRank || 999) - (b.popularityRank || 999)
      } else if (sortBy === 'ats-score') {
        return b.atsScore - a.atsScore
      } else {
        return a.name.localeCompare(b.name)
      }
    })

    return templates
  }, [selectedCategory, searchQuery, showPremiumOnly, showFreeOnly, minATSScore, selectedIndustry, sortBy])

  const topTemplates = useMemo(() => {
    // Only show implemented templates in "Most Popular" section
    return IMPLEMENTED_TEMPLATES.slice(0, 6)
  }, [IMPLEMENTED_TEMPLATES])

  const handleSelectTemplate = (template: TemplateMetadata) => {
    router.push(`/dashboard/resume/new?template=${template.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {IMPLEMENTED_TEMPLATES.length} Professional Template{IMPLEMENTED_TEMPLATES.length !== 1 ? 's' : ''}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Resume Templates
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-3xl mx-auto mb-6">
              Choose from our collection of professionally designed, ATS-friendly resume templates.
              All fully customizable to match your style.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Top Templates */}
      {topTemplates.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Most Popular</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="glass-panel p-4 hover:scale-105 transition-all group"
                >
                  <div className="aspect-[8.5/11] rounded-lg bg-white/5 border border-white/10 mb-3 relative overflow-hidden">
                    <div className="absolute inset-0" style={{ backgroundColor: template.colorScheme.primary + '10' }}>
                      <div className="absolute top-2 left-2 right-2 h-1 rounded" style={{ backgroundColor: template.colorScheme.primary }}></div>
                      <div className="absolute top-6 left-2 right-2 space-y-1">
                        <div className="h-0.5 bg-white/20 rounded w-3/4"></div>
                        <div className="h-0.5 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {template.name}
                  </h3>
                  {template.isPremium && (
                    <div className="inline-flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-yellow-400">PRO</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">({category.count})</span>
                </div>
              </button>
            ))}
          </div>
          {selectedCategory !== 'all' && (
            <p className="text-sm text-white/60 mt-3 ml-1">
              {categories.find(c => c.id === selectedCategory)?.description}
            </p>
          )}
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <span className="text-sm text-white/60">({filteredTemplates.length} results)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value as IndustryFocus | 'all')}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry.charAt(0).toUpperCase() + industry.slice(1)}</option>
              ))}
            </select>

            {/* ATS Score Filter */}
            <select
              value={minATSScore}
              onChange={(e) => setMinATSScore(parseInt(e.target.value))}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="0">All ATS Scores</option>
              <option value="90">ATS Score 90+</option>
              <option value="95">ATS Score 95+</option>
              <option value="98">ATS Score 98+</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="popularity">Most Popular</option>
              <option value="ats-score">Highest ATS Score</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showFreeOnly
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {showFreeOnly && <CheckCircle className="w-3 h-3 inline mr-1" />}
              Free Only
            </button>
            <button
              onClick={() => setShowPremiumOnly(!showPremiumOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showPremiumOnly
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {showPremiumOnly && <CheckCircle className="w-3 h-3 inline mr-1" />}
              <Star className="w-3 h-3 inline mr-1" />
              Premium Only
            </button>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <AnimatePresence mode="wait">
          {filteredTemplates.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-12 text-center"
            >
              <div className="text-white/40 mb-4">
                <Filter className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
              <p className="text-white/60 mb-4">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setShowFreeOnly(false)
                  setShowPremiumOnly(false)
                  setMinATSScore(0)
                  setSelectedIndustry('all')
                }}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className={viewMode === 'grid' ? 'group' : 'glass-panel p-4 flex gap-4'}
                >
                  {viewMode === 'grid' ? (
                    <div className="glass-panel p-5 h-full flex flex-col hover:scale-105 transition-all cursor-pointer">
                      {/* Premium Badge */}
                      {template.isPremium && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            PRO
                          </div>
                        </div>
                      )}

                      {/* Template Preview */}
                      <div
                        className="relative w-full aspect-[8.5/11] rounded-lg mb-4 overflow-hidden border-2 border-white/10 group-hover:border-purple-500/50 transition-colors cursor-pointer"
                        onClick={() => handleSelectTemplate(template)}
                        style={{ backgroundColor: template.colorScheme.background }}
                      >
                        <div className="absolute inset-0 p-3" style={{ backgroundColor: template.colorScheme.primary + '08' }}>
                          <div className="h-2 rounded mb-2" style={{ backgroundColor: template.colorScheme.primary, width: '60%' }}></div>
                          <div className="h-1 rounded mb-1" style={{ backgroundColor: template.colorScheme.text + '40', width: '40%' }}></div>
                          <div className="h-1 rounded mb-4" style={{ backgroundColor: template.colorScheme.text + '40', width: '35%' }}></div>
                          <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="h-1 rounded" style={{ backgroundColor: template.colorScheme.text + '30', width: `${100 - i * 10}%` }}></div>
                            ))}
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                          <button className="px-4 py-2 bg-white text-purple-900 rounded-lg font-medium text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Eye className="w-3 h-3" />
                            Use Template
                          </button>
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-white/60 mb-3 line-clamp-2">
                          {template.description}
                        </p>

                        {/* Metrics */}
                        <div className="flex items-center gap-3 mb-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-green-400" />
                            <span className="text-white/80">ATS {template.atsScore}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-white/60 capitalize">{template.layoutType.replace('-', ' ')}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-white font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3 h-3" />
                        Use Template
                      </button>
                    </div>
                  ) : (
                    // List View
                    <>
                      <div className="w-24 aspect-[8.5/11] rounded border border-white/10 flex-shrink-0" style={{ backgroundColor: template.colorScheme.primary + '20' }}></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{template.name}</h3>
                          {template.isPremium && (
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60 mb-3">{template.description}</p>
                        <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-green-400" />
                            ATS {template.atsScore}
                          </span>
                          <span className="capitalize">{template.layoutType.replace('-', ' ')}</span>
                          <span className="capitalize">{template.category}</span>
                        </div>
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm font-medium inline-flex items-center gap-2"
                        >
                          Use Template
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Why Our Templates?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ATS-Optimized</h3>
              <p className="text-white/60">
                All templates are tested and optimized for Applicant Tracking Systems
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fully Customizable</h3>
              <p className="text-white/60">
                Customize colors, fonts, spacing, and sections to match your brand
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Export to PDF</h3>
              <p className="text-white/60">
                Download your resume as a professional PDF ready to send
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
