'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Layout, Eye, EyeOff, GripVertical, Settings, Palette, Type, 
  Image, Info, Sparkles, ImageIcon, MessageSquare, Users, HelpCircle, 
  Mail, Megaphone, DollarSign, Star, MousePointer, Check, ChevronRight,
  Monitor, Smartphone, RotateCcw, Save, Loader2, X, ChevronDown, ChevronUp,
  Sliders, Layers, PaintBucket, Move, Plus, Trash2, ExternalLink, Maximize2,
  Upload
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

// Komponent podglądu szablonu
function TemplatePreview({ template, isSelected, onClick, companyData }: { 
  template: typeof templates[0], 
  isSelected: boolean, 
  onClick: () => void,
  companyData: CompanyData 
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-4 ring-teal-500 shadow-2xl shadow-teal-500/20'
          : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-xl'
      }`}
    >
      {/* Miniatura strony */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {/* Symulacja strony */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: template.defaultColors.background }}
        >
          {/* Hero */}
          <div 
            className="h-1/2 relative"
            style={{ 
              background: template.id === 'elegant' 
                ? `linear-gradient(135deg, ${template.defaultColors.primary} 0%, #000 100%)`
                : template.id === 'fresh'
                ? `linear-gradient(135deg, ${template.defaultColors.primary} 0%, ${template.defaultColors.accent} 100%)`
                : template.defaultColors.primary
            }}
          >
            {/* Logo placeholder */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: template.defaultColors.accent }}
              />
              <div className="w-16 h-2 rounded bg-white/30" />
            </div>
            
            {/* Hero content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <div 
                  className="w-32 h-3 rounded mx-auto mb-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                />
                <div 
                  className="w-24 h-2 rounded mx-auto mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                />
                <div 
                  className="w-16 h-4 rounded-full mx-auto"
                  style={{ backgroundColor: template.defaultColors.accent }}
                />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="h-1/2 p-3">
            {/* Section title */}
            <div 
              className="w-20 h-2 rounded mx-auto mb-3"
              style={{ backgroundColor: template.defaultColors.text, opacity: 0.8 }}
            />
            
            {/* Cards */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map(i => (
                <div 
                  key={i}
                  className={`w-12 h-16 rounded ${
                    template.defaultCardStyle === 'shadow' ? 'shadow-md' :
                    template.defaultCardStyle === 'border' ? 'border border-slate-200' :
                    template.defaultCardStyle === 'glass' ? 'bg-white/50 backdrop-blur' :
                    'bg-slate-100'
                  }`}
                  style={{ 
                    backgroundColor: template.id === 'elegant' ? 'rgba(255,255,255,0.1)' : 'white'
                  }}
                >
                  <div 
                    className="w-full h-6 rounded-t"
                    style={{ backgroundColor: template.defaultColors.accent, opacity: 0.3 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
            >
              <div className="text-center text-white">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Podgląd</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-800">{template.name}</h3>
          {isSelected && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
              Aktywny
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
        
        {/* Color swatches */}
        <div className="flex gap-1 mt-3">
          {Object.values(template.defaultColors).map((color, i) => (
            <div 
              key={i}
              className="w-5 h-5 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Komponent edycji sekcji
function SectionEditor({ section, onUpdate, onClose }: {
  section: PageSection
  onUpdate: (updates: Partial<PageSection>) => void
  onClose: () => void
}) {
  const Icon = sectionIconMap[section.type] || Info
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
    >
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{sectionNames[section.type]}</h3>
            <p className="text-xs text-slate-500">Edytuj ustawienia sekcji</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Tytuł sekcji */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tytuł sekcji</label>
          <input
            type="text"
            value={section.settings.title || ''}
            onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
            placeholder={sectionNames[section.type]}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        {/* Podtytuł */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Podtytuł</label>
          <input
            type="text"
            value={section.settings.subtitle || ''}
            onChange={(e) => onUpdate({ settings: { ...section.settings, subtitle: e.target.value } })}
            placeholder="Opcjonalny podtytuł..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        {/* Padding */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Odstępy</label>
          <div className="flex gap-2">
            {['small', 'medium', 'large'].map(size => (
              <button
                key={size}
                onClick={() => onUpdate({ settings: { ...section.settings, padding: size as any } })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  section.settings.padding === size
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {size === 'small' ? 'Małe' : size === 'medium' ? 'Średnie' : 'Duże'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Specyficzne ustawienia dla Hero */}
        {section.type === 'hero' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Wariant hero</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'banner', label: 'Banner', desc: 'Pełna szerokość' },
                  { id: 'split', label: 'Podzielony', desc: 'Tekst + zdjęcie' },
                  { id: 'centered', label: 'Wyśrodkowany', desc: 'Tekst na środku' },
                  { id: 'video', label: 'Wideo', desc: 'Tło wideo' },
                ].map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => onUpdate({ settings: { ...section.settings, heroVariant: variant.id as any } })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      section.settings.heroVariant === variant.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-sm text-slate-800">{variant.label}</div>
                    <div className="text-xs text-slate-500">{variant.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Wysokość</label>
              <div className="flex gap-2">
                {['small', 'medium', 'large', 'full'].map(size => (
                  <button
                    key={size}
                    onClick={() => onUpdate({ settings: { ...section.settings, heroHeight: size as any } })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      section.settings.heroHeight === size
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'Full'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Specyficzne ustawienia dla Gallery */}
        {section.type === 'gallery' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Układ galerii</label>
            <div className="flex gap-2">
              {[
                { id: 'grid', label: 'Siatka' },
                { id: 'masonry', label: 'Masonry' },
                { id: 'carousel', label: 'Karuzela' },
              ].map(style => (
                <button
                  key={style.id}
                  onClick={() => onUpdate({ settings: { ...section.settings, galleryStyle: style.id as any } })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    section.settings.galleryStyle === style.id
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Komponent podglądu strony na żywo
function LivePreview({ companyData, pageBuilder, previewMode }: {
  companyData: CompanyData
  pageBuilder: PageBuilderConfig
  previewMode: 'desktop' | 'mobile'
}) {
  const template = templates.find(t => t.id === pageBuilder.templateId) || templates[1]
  const pageSettings = companyData.pageSettings || {}
  
  return (
    <div className={`bg-slate-100 rounded-2xl overflow-hidden ${
      previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
    }`}>
      {/* Browser chrome */}
      <div className="bg-slate-200 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-slate-500 truncate">
          {companyData.subdomain}.rezerwacja24.pl
        </div>
      </div>
      
      {/* Page content */}
      <div 
        className="h-[500px] overflow-y-auto"
        style={{ backgroundColor: template.defaultColors.background }}
      >
        {pageBuilder.sections
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map(section => (
            <div key={section.id} className="relative group">
              {/* Section indicator */}
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs bg-black/50 text-white px-2 py-1 rounded">
                  {sectionNames[section.type]}
                </span>
              </div>
              
              {/* Section content */}
              {section.type === 'hero' && (
                <div 
                  className={`relative ${
                    section.settings.heroHeight === 'small' ? 'h-48' :
                    section.settings.heroHeight === 'medium' ? 'h-64' :
                    section.settings.heroHeight === 'large' ? 'h-80' :
                    'h-96'
                  }`}
                  style={{ 
                    background: companyData.banner 
                      ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${companyData.banner}) center/cover`
                      : `linear-gradient(135deg, ${pageSettings.primaryColor || template.defaultColors.primary}, ${pageSettings.accentColor || template.defaultColors.accent})`
                  }}
                >
                  {/* Logo */}
                  {companyData.logo && (
                    <div className="absolute top-4 left-4">
                      <img src={companyData.logo} alt="Logo" className="h-10 w-auto object-contain" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{companyData.businessName}</h1>
                      <p className="text-sm opacity-80 mb-4 line-clamp-2">{companyData.description || 'Opis firmy...'}</p>
                      <button 
                        className={`px-6 py-2 bg-white text-slate-800 font-medium ${
                          pageSettings.buttonStyle === 'pill' ? 'rounded-full' :
                          pageSettings.buttonStyle === 'square' ? 'rounded-none' :
                          'rounded-lg'
                        }`}
                      >
                        {pageSettings.bookingButtonText || 'Zarezerwuj'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {section.type === 'services' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-center mb-6" style={{ color: template.defaultColors.text }}>
                    {section.settings.title || 'Nasze usługi'}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div 
                        key={i}
                        className={`p-4 rounded-xl ${
                          pageSettings.cardStyle === 'shadow' ? 'bg-white shadow-lg' :
                          pageSettings.cardStyle === 'border' ? 'bg-white border border-slate-200' :
                          'bg-slate-100'
                        }`}
                      >
                        <div className="w-full h-16 bg-slate-200 rounded-lg mb-3" />
                        <div className="h-3 bg-slate-300 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-slate-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {section.type === 'about' && (
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold mb-4" style={{ color: template.defaultColors.text }}>
                    {section.settings.title || 'O nas'}
                  </h2>
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded w-5/6 mx-auto" />
                    <div className="h-3 bg-slate-200 rounded w-4/6 mx-auto" />
                  </div>
                </div>
              )}
              
              {section.type === 'contact' && (
                <div className="p-6 bg-slate-800 text-white">
                  <h2 className="text-xl font-bold text-center mb-4">
                    {section.settings.title || 'Kontakt'}
                  </h2>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{companyData.email || 'email@firma.pl'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {section.type === 'gallery' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-center mb-4" style={{ color: template.defaultColors.text }}>
                    {section.settings.title || 'Galeria'}
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square bg-slate-200 rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
              
              {section.type === 'testimonials' && (
                <div className="p-6 bg-slate-50">
                  <h2 className="text-xl font-bold text-center mb-4" style={{ color: template.defaultColors.text }}>
                    {section.settings.title || 'Opinie klientów'}
                  </h2>
                  <div className="flex gap-3 overflow-hidden">
                    {[1, 2].map(i => (
                      <div key={i} className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex gap-1 mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <div className="h-2 bg-slate-200 rounded mb-1" />
                        <div className="h-2 bg-slate-200 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        
        {/* Footer - zawsze widoczny */}
        <div className="p-4 bg-slate-900 text-center">
          <p className="text-xs text-slate-400">Powered by Rezerwacja24.pl</p>
        </div>
      </div>
    </div>
  )
}

export default function PageBuilderTab({ companyData, setCompanyData, onSave, isLoading }: PageBuilderTabProps) {
  const pageSettings = companyData.pageSettings || {}
  const pageBuilder = pageSettings.pageBuilder || getDefaultPageBuilderConfig('fresh')
  
  const [activeView, setActiveView] = useState<'templates' | 'sections' | 'styles' | 'preview'>('templates')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(companyData.logo || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(companyData.banner || null)

  // Aktualizuj podgląd gdy zmienią się dane
  useEffect(() => {
    setLogoPreview(companyData.logo || null)
    setBannerPreview(companyData.banner || null)
  }, [companyData.logo, companyData.banner])

  // Funkcje uploadu
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setCompanyData({ ...companyData, logo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setBannerPreview(result)
        setCompanyData({ ...companyData, banner: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setCompanyData({ ...companyData, logo: undefined })
  }

  const removeBanner = () => {
    setBannerPreview(null)
    setCompanyData({ ...companyData, banner: undefined })
  }

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
    const newSections = pageBuilder.sections.map(s => {
      if (s.id === sectionId) {
        // Merguj settings osobno żeby nie nadpisać całego obiektu
        const newSettings = updates.settings 
          ? { ...s.settings, ...updates.settings }
          : s.settings
        return { ...s, ...updates, settings: newSettings }
      }
      return s
    })
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

  const selectedTemplate = templates.find(t => t.id === pageBuilder.templateId) || templates[1]

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Edytor strony</h2>
          <p className="text-sm text-slate-500">Stwórz profesjonalną stronę rezerwacyjną</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFullPreview(true)}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Pełny podgląd
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-teal-500/25 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz zmiany
          </button>
        </div>
      </div>

      {/* Główny layout - 2 kolumny */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lewa kolumna - edytor */}
        <div className="space-y-4">
          {/* Zakładki */}
          <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl">
            {[
              { id: 'templates', label: 'Szablony', icon: Layout },
              { id: 'sections', label: 'Sekcje', icon: Layers },
              { id: 'styles', label: 'Style', icon: PaintBucket },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeView === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Zawartość zakładek */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeView === 'templates' && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Wybierz szablon</h3>
                    <span className="text-xs text-slate-500">Aktywny: {selectedTemplate.name}</span>
                  </div>
                  
                  <div className="grid gap-4">
                    {templates.map(template => (
                      <TemplatePreview
                        key={template.id}
                        template={template}
                        isSelected={pageBuilder.templateId === template.id}
                        onClick={() => selectTemplate(template.id)}
                        companyData={companyData}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'sections' && (
                <motion.div
                  key="sections"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Zarządzaj sekcjami</h3>
                    <span className="text-xs text-slate-500">Przeciągnij aby zmienić kolejność</span>
                  </div>
                  
                  <Reorder.Group 
                    axis="y" 
                    values={pageBuilder.sections} 
                    onReorder={reorderSections}
                    className="space-y-2"
                  >
                    {pageBuilder.sections.map(section => {
                      const Icon = sectionIconMap[section.type] || Info
                      const isLocked = section.type === 'services'
                      
                      return (
                        <Reorder.Item
                          key={section.id}
                          value={section}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            section.enabled
                              ? 'bg-white border-slate-200 shadow-sm'
                              : 'bg-slate-50 border-slate-100 opacity-60'
                          }`}
                        >
                          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            section.enabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-800 truncate">{sectionNames[section.type]}</div>
                          </div>
                          
                          <button
                            onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              editingSection === section.id 
                                ? 'bg-teal-100 text-teal-600' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => !isLocked && toggleSection(section.id)}
                            disabled={isLocked}
                            className={`p-2 rounded-lg transition-colors ${
                              isLocked 
                                ? 'text-slate-200 cursor-not-allowed' 
                                : section.enabled 
                                  ? 'text-teal-500 hover:bg-teal-50' 
                                  : 'text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </Reorder.Item>
                      )
                    })}
                  </Reorder.Group>
                  
                  {/* Edytor sekcji */}
                  <AnimatePresence>
                    {editingSection && (
                      <SectionEditor
                        section={pageBuilder.sections.find(s => s.id === editingSection)!}
                        onUpdate={(updates) => updateSection(editingSection, updates)}
                        onClose={() => setEditingSection(null)}
                      />
                    )}
                  </AnimatePresence>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    <strong>Uwaga:</strong> Stopka "Powered by Rezerwacja24.pl" jest stała i nie może być edytowana.
                  </div>
                </motion.div>
              )}

              {activeView === 'styles' && (
                <motion.div
                  key="styles"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <h3 className="font-semibold text-slate-800">Dostosuj wygląd</h3>
                  
                  {/* Logo i Banner */}
                  <div className="space-y-4 pb-5 border-b border-slate-200">
                    <label className="text-sm font-medium text-slate-700">Logo i banner</label>
                    
                    {/* Logo */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-500">Logo firmy</span>
                      {logoPreview ? (
                        <div className="relative inline-block">
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <img src={logoPreview} alt="Logo" className="h-16 w-auto object-contain" />
                          </div>
                          <button
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors">
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-sm text-slate-500">Dodaj logo</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                    
                    {/* Banner */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-500">Banner (tło hero)</span>
                      {bannerPreview ? (
                        <div className="relative">
                          <div className="rounded-xl overflow-hidden border border-slate-200">
                            <img src={bannerPreview} alt="Banner" className="w-full h-24 object-cover" />
                          </div>
                          <button
                            onClick={removeBanner}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors">
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-sm text-slate-500">Dodaj banner</span>
                          <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Kolory */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Kolory marki</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <span className="text-xs text-slate-500">Główny</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pageSettings.primaryColor || '#0F6048'}
                            onChange={(e) => setCompanyData({
                              ...companyData,
                              pageSettings: { ...pageSettings, primaryColor: e.target.value }
                            })}
                            className="w-12 h-12 rounded-xl border-2 border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={pageSettings.primaryColor || '#0F6048'}
                            onChange={(e) => setCompanyData({
                              ...companyData,
                              pageSettings: { ...pageSettings, primaryColor: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs text-slate-500">Akcent</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pageSettings.accentColor || '#41FFBC'}
                            onChange={(e) => setCompanyData({
                              ...companyData,
                              pageSettings: { ...pageSettings, accentColor: e.target.value }
                            })}
                            className="w-12 h-12 rounded-xl border-2 border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={pageSettings.accentColor || '#41FFBC'}
                            onChange={(e) => setCompanyData({
                              ...companyData,
                              pageSettings: { ...pageSettings, accentColor: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Styl przycisków */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Styl przycisków</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'rounded', label: 'Zaokrąglone' },
                        { id: 'pill', label: 'Pigułka' },
                        { id: 'square', label: 'Ostre' },
                      ].map(style => (
                        <button
                          key={style.id}
                          onClick={() => setCompanyData({
                            ...companyData,
                            pageSettings: { ...pageSettings, buttonStyle: style.id as any }
                          })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            pageSettings.buttonStyle === style.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div 
                            className={`w-full h-8 mb-2 flex items-center justify-center text-white text-xs font-medium ${
                              style.id === 'pill' ? 'rounded-full' :
                              style.id === 'square' ? 'rounded-none' :
                              'rounded-lg'
                            }`}
                            style={{ backgroundColor: pageSettings.primaryColor || '#0F6048' }}
                          >
                            Przycisk
                          </div>
                          <div className="text-xs font-medium text-slate-600">{style.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Styl kart */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Styl kart</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'shadow', label: 'Cień' },
                        { id: 'border', label: 'Ramka' },
                        { id: 'flat', label: 'Płaskie' },
                      ].map(style => (
                        <button
                          key={style.id}
                          onClick={() => setCompanyData({
                            ...companyData,
                            pageSettings: { ...pageSettings, cardStyle: style.id as any }
                          })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            pageSettings.cardStyle === style.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div 
                            className={`w-full h-12 mb-2 rounded-lg ${
                              style.id === 'shadow' ? 'bg-white shadow-lg' :
                              style.id === 'border' ? 'bg-white border-2 border-slate-200' :
                              'bg-slate-100'
                            }`}
                          />
                          <div className="text-xs font-medium text-slate-600">{style.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Prawa kolumna - podgląd */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Podgląd na żywo</h3>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-md transition-colors ${
                  previewMode === 'desktop' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-md transition-colors ${
                  previewMode === 'mobile' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <LivePreview 
            companyData={companyData} 
            pageBuilder={pageBuilder} 
            previewMode={previewMode}
          />
        </div>
      </div>

      {/* Modal pełnego podglądu */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Pełny podgląd strony</h3>
                <button onClick={() => setShowFullPreview(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                <LivePreview 
                  companyData={companyData} 
                  pageBuilder={pageBuilder} 
                  previewMode="desktop"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
