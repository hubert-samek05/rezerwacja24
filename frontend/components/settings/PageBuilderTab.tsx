'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Layout, Eye, EyeOff, GripVertical, Settings, Palette, Type, 
  Image, Info, Sparkles, ImageIcon, MessageSquare, Users, HelpCircle, 
  Mail, Megaphone, DollarSign, Star, MousePointer, Check, ChevronRight,
  Monitor, Smartphone, RotateCcw, Save, Loader2
} from 'lucide-react'
import { CompanyData, PageSettings } from '@/lib/company'
import { 
  templates, 
  defaultSections, 
  sectionNames, 
  PageSection, 
  SectionType,
  TemplateId,
  PageBuilderConfig,
  getDefaultPageBuilderConfig
} from '@/lib/page-builder'

interface PageBuilderTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

const sectionIconMap: Record<SectionType, any> = {
  'hero': Image,
  'about': Info,
  'services': Sparkles,
  'gallery': ImageIcon,
  'testimonials': MessageSquare,
  'team': Users,
  'faq': HelpCircle,
  'contact': Mail,
  'promo-banner': Megaphone,
  'pricing': DollarSign,
  'features': Star,
  'cta': MousePointer
}

export default function PageBuilderTab({ companyData, setCompanyData, onSave, isLoading }: PageBuilderTabProps) {
  const pageSettings = companyData.pageSettings || {}
  const pageBuilder = pageSettings.pageBuilder || getDefaultPageBuilderConfig('fresh')
  
  const [activeView, setActiveView] = useState<'templates' | 'sections' | 'styles'>('templates')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [editingSection, setEditingSection] = useState<string | null>(null)

  const updatePageBuilder = (updates: Partial<PageBuilderConfig>) => {
    setCompanyData({
      ...companyData,
      pageSettings: {
        ...pageSettings,
        pageBuilder: { ...pageBuilder, ...updates }
      }
    })
  }

  const updateSection = (sectionId: string, updates: Partial<PageSection>) => {
    const newSections = pageBuilder.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    )
    updatePageBuilder({ sections: newSections })
  }

  const toggleSection = (sectionId: string) => {
    const section = pageBuilder.sections.find(s => s.id === sectionId)
    if (section) {
      updateSection(sectionId, { enabled: !section.enabled })
    }
  }

  const reorderSections = (newOrder: PageSection[]) => {
    const reorderedSections = newOrder.map((section, index) => ({
      ...section,
      order: index
    }))
    updatePageBuilder({ sections: reorderedSections })
  }

  const selectTemplate = (templateId: TemplateId) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      updatePageBuilder({ templateId })
      // Aktualizuj też kolory w głównych ustawieniach
      setCompanyData({
        ...companyData,
        pageSettings: {
          ...pageSettings,
          primaryColor: template.defaultColors.primary,
          accentColor: template.defaultColors.accent,
          buttonStyle: template.defaultButtonStyle,
          cardStyle: template.defaultCardStyle === 'glass' ? 'shadow' : template.defaultCardStyle,
          pageBuilder: { ...pageBuilder, templateId }
        }
      })
    }
  }

  const resetToDefault = () => {
    if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia? Wszystkie zmiany zostaną utracone.')) {
      updatePageBuilder(getDefaultPageBuilderConfig(pageBuilder.templateId))
    }
  }

  const selectedTemplate = templates.find(t => t.id === pageBuilder.templateId) || templates[1]

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Edytor strony</h2>
          <p className="text-sm text-slate-500">Dostosuj wygląd swojej strony rezerwacyjnej</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Resetuj
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz zmiany
          </button>
        </div>
      </div>

      {/* Zakładki */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        {[
          { id: 'templates', label: 'Szablony', icon: Layout },
          { id: 'sections', label: 'Sekcje', icon: GripVertical },
          { id: 'styles', label: 'Style', icon: Palette },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Zawartość */}
      <AnimatePresence mode="wait">
        {activeView === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-600">Wybierz szablon, który najlepiej pasuje do Twojej marki:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template.id)}
                  className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    pageBuilder.templateId === template.id
                      ? 'border-teal-500 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Preview */}
                  <div 
                    className="h-40 relative"
                    style={{ background: `linear-gradient(135deg, ${template.defaultColors.primary}, ${template.defaultColors.background})` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div 
                          className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: template.defaultColors.accent }}
                        >
                          <Layout className="w-6 h-6" style={{ color: template.defaultColors.text }} />
                        </div>
                        <div className="text-sm font-medium" style={{ color: template.defaultColors.text }}>
                          {template.name}
                        </div>
                      </div>
                    </div>
                    {pageBuilder.templateId === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-slate-800">{template.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'sections' && (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-600">Przeciągnij sekcje aby zmienić ich kolejność. Kliknij aby włączyć/wyłączyć.</p>
            
            <Reorder.Group 
              axis="y" 
              values={pageBuilder.sections} 
              onReorder={reorderSections}
              className="space-y-2"
            >
              {pageBuilder.sections.map(section => {
                const Icon = sectionIconMap[section.type] || Info
                const isLocked = section.type === 'services' // Usługi zawsze włączone
                
                return (
                  <Reorder.Item
                    key={section.id}
                    value={section}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      section.enabled
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      section.enabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{sectionNames[section.type]}</div>
                      <div className="text-xs text-slate-500">
                        {section.enabled ? 'Widoczna' : 'Ukryta'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setEditingSection(section.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => !isLocked && toggleSection(section.id)}
                      disabled={isLocked}
                      className={`p-2 rounded-lg transition-colors ${
                        isLocked 
                          ? 'text-slate-300 cursor-not-allowed' 
                          : section.enabled 
                            ? 'text-teal-600 hover:bg-teal-50' 
                            : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>

            {/* Info o stopce */}
            <div className="p-4 bg-slate-100 rounded-xl text-sm text-slate-600">
              <strong>Stopka:</strong> "Powered by Rezerwacja24.pl" - ta sekcja jest stała i nie może być edytowana ani usunięta.
            </div>
          </motion.div>
        )}

        {activeView === 'styles' && (
          <motion.div
            key="styles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Kolory */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-teal-600" />
                Kolory
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kolor główny</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pageSettings.primaryColor || '#0F6048'}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        pageSettings: { ...pageSettings, primaryColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={pageSettings.primaryColor || '#0F6048'}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        pageSettings: { ...pageSettings, primaryColor: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kolor akcentu</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pageSettings.accentColor || '#41FFBC'}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        pageSettings: { ...pageSettings, accentColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={pageSettings.accentColor || '#41FFBC'}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        pageSettings: { ...pageSettings, accentColor: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Styl przycisków */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Styl przycisków</h3>
              <div className="flex gap-3">
                {[
                  { id: 'rounded', label: 'Zaokrąglone', preview: 'rounded-lg' },
                  { id: 'pill', label: 'Pigułka', preview: 'rounded-full' },
                  { id: 'square', label: 'Kwadratowe', preview: 'rounded-none' },
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => setCompanyData({
                      ...companyData,
                      pageSettings: { ...pageSettings, buttonStyle: style.id as any }
                    })}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      pageSettings.buttonStyle === style.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div 
                      className={`w-full h-8 bg-teal-600 ${style.preview} mb-2`}
                    />
                    <div className="text-sm font-medium text-slate-700">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Styl kart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Styl kart usług</h3>
              <div className="flex gap-3">
                {[
                  { id: 'shadow', label: 'Z cieniem', className: 'shadow-lg' },
                  { id: 'border', label: 'Z ramką', className: 'border-2 border-slate-200' },
                  { id: 'flat', label: 'Płaskie', className: 'bg-slate-100' },
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => setCompanyData({
                      ...companyData,
                      pageSettings: { ...pageSettings, cardStyle: style.id as any }
                    })}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      pageSettings.cardStyle === style.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-full h-16 bg-white rounded-lg ${style.className} mb-2`} />
                    <div className="text-sm font-medium text-slate-700">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animacje */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Animacje</h3>
                  <p className="text-sm text-slate-500">Włącz płynne animacje przy przewijaniu</p>
                </div>
                <button
                  onClick={() => updatePageBuilder({
                    globalStyles: {
                      ...pageBuilder.globalStyles,
                      animations: !pageBuilder.globalStyles?.animations
                    }
                  })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    pageBuilder.globalStyles?.animations !== false ? 'bg-teal-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    pageBuilder.globalStyles?.animations !== false ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
