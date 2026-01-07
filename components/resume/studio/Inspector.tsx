// components/resume/studio/Inspector.tsx
// Right Panel: Stacked Glass Inspector with Tabs

'use client'

import React from 'react'
import { useResume } from '@/contexts/ResumeContext'
import {
  ContactForm,
  SummaryForm,
  WorkForm,
  EducationForm,
  SkillsForm,
  TargetTitleForm,
  ProjectForm,
  CertificationForm,
  AwardForm,
  VolunteerForm,
  PublicationForm,
  LanguageForm,
} from '@/components/resume/forms'
import { GlassCard, GlassCardSection } from '@/components/ui/glass-card'
import { Palette, Layout, Grid } from 'lucide-react'
import { getAllTemplates } from '@/components/resume/templates'
import { useState } from 'react'

const FORM_COMPONENTS = {
  contact: ContactForm,
  targetTitle: TargetTitleForm,
  summary: SummaryForm,
  experience: WorkForm,
  education: EducationForm,
  skills: SkillsForm,
  projects: ProjectForm,
  certifications: CertificationForm,
  awards: AwardForm,
  volunteer: VolunteerForm,
  publications: PublicationForm,
  languages: LanguageForm,
}

// Themes are now imported from lib/resumeThemes.ts

export const Inspector = ({ triggerSave }: { triggerSave: (dataOverride?: any) => void }) => {
  const {
    inspectorTab,
    setInspectorTab,
    activeSection,
    designerSettings,
    updateDesignerSettings,
    sectionSettings,
    updateSectionSettings,
    selectedTemplate,
    setSelectedTemplate
  } = useResume()

  const availableTemplates = getAllTemplates()

  const tabs = [
    { id: 'content', label: 'Content', icon: Grid },
    { id: 'designer', label: 'Designer', icon: Palette },
    { id: 'templates', label: 'Templates', icon: Layout },
  ] as const

  return (
    <div className="w-[450px] h-full bg-black/30 backdrop-blur-xl border-l border-white/10 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 p-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setInspectorTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl
                transition-all duration-200 text-sm font-semibold
                ${
                  inspectorTab === tab.id
                    ? 'bg-purple-500/30 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {inspectorTab === 'content' && (
          <div className="space-y-4">
            {/* Section Settings Block - Hidden for targetTitle and summary (core text sections) */}
            {!['targetTitle', 'summary'].includes(activeSection) && (
              <GlassCard title="Section Settings">
                <GlassCardSection>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-white/80">Show Section</label>
                      <input
                        type="checkbox"
                        checked={sectionSettings[activeSection]?.visible ?? true}
                        onChange={e => updateSectionSettings(activeSection, { visible: e.target.checked })}
                        className="w-5 h-5 rounded border-white/20 text-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    
                    {/* Hide Custom Title for Contact section as it uses the Name field */}
                    {activeSection !== 'contact' && (
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Custom Title</label>
                        <input
                          type="text"
                          value={sectionSettings[activeSection]?.customTitle || ''}
                          onChange={e => updateSectionSettings(activeSection, { customTitle: e.target.value })}
                          placeholder="Default"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    )}

                    {/* Text Alignment for this section */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Text Alignment</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['left', 'center', 'right', 'justify'] as const).map(align => (
                          <button
                            key={align}
                            onClick={() => updateSectionSettings(activeSection, { textAlign: align })}
                            className={`
                              px-2 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                              ${
                                (sectionSettings[activeSection]?.textAlign || 'left') === align
                                  ? 'bg-purple-500/30 text-white border border-purple-500/50'
                                  : 'bg-white/10 text-white/60 hover:bg-white/15'
                              }
                            `}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* List Style Control (for sections with bullet points) */}
                    {['experience', 'projects', 'certifications', 'volunteer', 'publications'].includes(activeSection) && (
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Bullet Style</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['disc', 'circle', 'square', 'none'].map(style => (
                            <button
                              key={style}
                              onClick={() => updateSectionSettings(activeSection, { listStyle: style as any })}
                              className={`
                                px-2 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                                ${
                                  (sectionSettings[activeSection]?.listStyle || 'disc') === style
                                    ? 'bg-purple-500/30 text-white border border-purple-500/50'
                                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                                }
                              `}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Layout Control (for Skills/Languages) */}
                    {['skills', 'languages', 'awards'].includes(activeSection) && (
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Layout</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['list', 'grid', 'columns'].map(layout => (
                            <button
                              key={layout}
                              onClick={() => updateSectionSettings(activeSection, { layout: layout as any })}
                              className={`
                                px-2 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                                ${
                                  (sectionSettings[activeSection]?.layout || 'list') === layout
                                    ? 'bg-purple-500/30 text-white border border-purple-500/50'
                                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                                }
                              `}
                            >
                              {layout}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCardSection>
              </GlassCard>
            )}

            {/* Form Content */}
            {(() => {
              const FormComponent = FORM_COMPONENTS[activeSection]
              return FormComponent ? <FormComponent triggerSave={triggerSave} /> : <div className="text-white/50 p-4">Select a section</div>
            })()}
          </div>
        )}

        {inspectorTab === 'designer' && (
          <div className="space-y-4">
            <GlassCard title="Layout">
              <GlassCardSection>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Paper Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['letter', 'a4'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => updateDesignerSettings({ paperSize: size })}
                          className={`
                            px-4 py-2 rounded-xl font-medium transition-all capitalize
                            ${
                              designerSettings.paperSize === size
                                ? 'bg-purple-500/30 text-white border border-purple-500/50'
                                : 'bg-white/10 text-white/70 hover:bg-white/15'
                            }
                          `}
                        >
                          {size === 'letter' ? 'Letter (US)' : 'A4 (Intl)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Margins</label>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={designerSettings.margins}
                      onChange={e => updateDesignerSettings({ margins: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-white/50 text-right">{designerSettings.margins}px</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Columns</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2].map(col => (
                        <button
                          key={col}
                          onClick={() => updateDesignerSettings({ columns: col as 1 | 2 })}
                          className={`
                            px-4 py-2 rounded-xl font-medium transition-all
                            ${
                              designerSettings.columns === col
                                ? 'bg-purple-500/30 text-white border border-purple-500/50'
                                : 'bg-white/10 text-white/70 hover:bg-white/15'
                            }
                          `}
                        >
                          {col} Column
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCardSection>
            </GlassCard>

            <GlassCard title="Typography">
              <GlassCardSection>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Font Family</label>
                    <select
                      value={designerSettings.fontFamily}
                      onChange={e => updateDesignerSettings({ fontFamily: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <optgroup label="Modern Sans-Serif" className="bg-gray-900">
                        <option value="inter" className="bg-gray-900 text-white">Inter</option>
                        <option value="sf-pro" className="bg-gray-900 text-white">SF Pro</option>
                        <option value="roboto" className="bg-gray-900 text-white">Roboto</option>
                        <option value="lato" className="bg-gray-900 text-white">Lato</option>
                        <option value="open-sans" className="bg-gray-900 text-white">Open Sans</option>
                        <option value="montserrat" className="bg-gray-900 text-white">Montserrat</option>
                        <option value="raleway" className="bg-gray-900 text-white">Raleway</option>
                        <option value="poppins" className="bg-gray-900 text-white">Poppins</option>
                      </optgroup>
                      <optgroup label="Serif" className="bg-gray-900">
                        <option value="playfair" className="bg-gray-900 text-white">Playfair Display</option>
                        <option value="merriweather" className="bg-gray-900 text-white">Merriweather</option>
                        <option value="georgia" className="bg-gray-900 text-white">Georgia</option>
                        <option value="times" className="bg-gray-900 text-white">Times New Roman</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Line Height</label>
                    <input
                      type="range"
                      min="1.2"
                      max="2"
                      step="0.1"
                      value={designerSettings.lineHeight}
                      onChange={e => updateDesignerSettings({ lineHeight: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-white/50 text-right">{designerSettings.lineHeight}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Name Size</label>
                    <input
                      type="range" min="20" max="48" step="1"
                      value={designerSettings.fontSizeName}
                      onChange={e => updateDesignerSettings({ fontSizeName: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-white/50 text-right">{designerSettings.fontSizeName}pt</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Heading Size</label>
                    <input
                      type="range" min="12" max="24" step="1"
                      value={designerSettings.fontSizeHeadings}
                      onChange={e => updateDesignerSettings({ fontSizeHeadings: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-white/50 text-right">{designerSettings.fontSizeHeadings}pt</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Body Size</label>
                    <input
                      type="range" min="9" max="14" step="0.5"
                      value={designerSettings.fontSizeBody}
                      onChange={e => updateDesignerSettings({ fontSizeBody: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-white/50 text-right">{designerSettings.fontSizeBody}pt</div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-bold text-white/90">Advanced Typography</h4>
                    
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2">Name Weight</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { val: '400', label: 'Reg' },
                          { val: '500', label: 'Med' },
                          { val: '600', label: 'Semi' },
                          { val: '700', label: 'Bold' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            onClick={() => updateDesignerSettings({ fontWeightName: opt.val as any })}
                            className={`
                              px-1 py-1 rounded text-xs font-medium
                              ${designerSettings.fontWeightName === opt.val 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white/10 text-white/60 hover:bg-white/20'}
                            `}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2">Heading Weight</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { val: '400', label: 'Reg' },
                          { val: '500', label: 'Med' },
                          { val: '600', label: 'Semi' },
                          { val: '700', label: 'Bold' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            onClick={() => updateDesignerSettings({ fontWeightHeadings: opt.val as any })}
                            className={`
                              px-1 py-1 rounded text-xs font-medium
                              ${designerSettings.fontWeightHeadings === opt.val 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white/10 text-white/60 hover:bg-white/20'}
                            `}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2">Letter Spacing (Headings)</label>
                      <input
                        type="range" min="0" max="0.3" step="0.01"
                        value={designerSettings.letterSpacing}
                        onChange={e => updateDesignerSettings({ letterSpacing: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/60">Uppercase Headings</label>
                        <input
                          type="checkbox"
                          checked={designerSettings.textTransform === 'uppercase'}
                          onChange={e => updateDesignerSettings({ textTransform: e.target.checked ? 'uppercase' : 'none' })}
                          className="w-4 h-4 rounded border-white/20 text-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/60">Italic Headings</label>
                        <input
                          type="checkbox"
                          checked={designerSettings.fontStyleHeadings === 'italic'}
                          onChange={e => updateDesignerSettings({ fontStyleHeadings: e.target.checked ? 'italic' : 'normal' })}
                          className="w-4 h-4 rounded border-white/20 text-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/60">Underline Headings</label>
                        <input
                          type="checkbox"
                          checked={designerSettings.textDecorationHeadings === 'underline'}
                          onChange={e => updateDesignerSettings({ textDecorationHeadings: e.target.checked ? 'underline' : 'none' })}
                          className="w-4 h-4 rounded border-white/20 text-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCardSection>
            </GlassCard>

            <GlassCard title="Colors">
              <GlassCardSection>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/80">Accent Color</label>
                  
                  {/* Preset Colors Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { name: 'Purple', value: '#6C47FF' },
                      { name: 'Blue', value: '#3B82F6' },
                      { name: 'Sky', value: '#0EA5E9' },
                      { name: 'Emerald', value: '#10B981' },
                      { name: 'Red', value: '#EF4444' },
                      { name: 'Orange', value: '#F97316' },
                      { name: 'Pink', value: '#EC4899' },
                      { name: 'Rose', value: '#F43F5E' },
                      { name: 'Slate', value: '#475569' },
                      { name: 'Black', value: '#000000' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateDesignerSettings({ accentColor: color.value })}
                        className={`
                          w-8 h-8 rounded-full border-2 transition-all
                          ${
                            designerSettings.accentColor === color.value
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-transparent hover:scale-105'
                          }
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>

                  {/* Custom Color Picker */}
                  <div className="flex items-center space-x-3 pt-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={designerSettings.accentColor}
                        onChange={e => updateDesignerSettings({ accentColor: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-white/20 cursor-pointer p-0 overflow-hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={designerSettings.accentColor}
                        onChange={e => updateDesignerSettings({ accentColor: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </GlassCardSection>
            </GlassCard>

            <GlassCard title="Formatting">
              <GlassCardSection>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Date Format</label>
                    <select
                      value={designerSettings.dateFormat}
                      onChange={e => updateDesignerSettings({ dateFormat: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="MM/YYYY" className="bg-gray-900 text-white">MM/YYYY (01/2023)</option>
                      <option value="Month Year" className="bg-gray-900 text-white">Month Year (January 2023)</option>
                      <option value="Mon YYYY" className="bg-gray-900 text-white">Mon YYYY (Jan 2023)</option>
                      <option value="YYYY-MM" className="bg-gray-900 text-white">YYYY-MM (2023-01)</option>
                      <option value="YYYY" className="bg-gray-900 text-white">YYYY (2023)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Divider Style</label>
                    <select
                      value={designerSettings.dividerStyle}
                      onChange={e => updateDesignerSettings({ dividerStyle: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="line">Line</option>
                      <option value="dots">Dots</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </GlassCardSection>
            </GlassCard>

            <GlassCard title="Page Numbers">
              <GlassCardSection>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-white/80">Enable</label>
                    <input
                      type="checkbox"
                      checked={designerSettings.pageNumbers.enabled}
                      onChange={e =>
                        updateDesignerSettings({
                          pageNumbers: { ...designerSettings.pageNumbers, enabled: e.target.checked },
                        })
                      }
                      className="w-5 h-5 rounded border-white/20 text-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  {designerSettings.pageNumbers.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Alignment</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            onClick={() =>
                              updateDesignerSettings({
                                pageNumbers: { ...designerSettings.pageNumbers, alignment: align },
                              })
                            }
                            className={`
                              px-4 py-2 rounded-xl font-medium transition-all capitalize
                              ${
                                designerSettings.pageNumbers.alignment === align
                                  ? 'bg-purple-500/30 text-white border border-purple-500/50'
                                  : 'bg-white/10 text-white/70 hover:bg-white/15'
                              }
                            `}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCardSection>
            </GlassCard>
          </div>
        )}

        {inspectorTab === 'templates' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white mb-1">Resume Templates</h3>
              <p className="text-sm text-white/60">{availableTemplates.length + 1} ATS-friendly templates</p>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* JobFoxy Classic */}
              <button
                onClick={() => setSelectedTemplate('classic')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedTemplate === 'classic'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">JobFoxy Classic</h4>
                  {selectedTemplate === 'classic' && (
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  )}
                </div>
                <p className="text-xs text-white/60 mb-2">Fully customizable</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-white/80">ATS:</span>
                  <span className="font-bold text-green-400">95%</span>
                </div>
              </button>

              {/* New ATS Templates */}
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{template.name}</h4>
                    {selectedTemplate === template.id && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </div>
                  <p className="text-xs text-white/60 mb-2 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-white/80">ATS:</span>
                    <span className={`font-bold ${template.atsScore >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {template.atsScore}%
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Template Info */}
            {selectedTemplate && selectedTemplate !== 'classic' && (
              <GlassCard title="Template Details">
                <GlassCardSection>
                  {(() => {
                    const template = availableTemplates.find(t => t.id === selectedTemplate)
                    if (!template) return null

                    return (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">{template.name}</h4>
                          <p className="text-xs text-white/70">{template.description}</p>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs font-semibold text-white/80 mb-2">Best For:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.bestFor.map((industry, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                                {industry}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs font-semibold text-white/80 mb-2">Features:</p>
                          <ul className="space-y-1">
                            {template.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })()}
                </GlassCardSection>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
