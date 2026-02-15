// Page Builder - typy i konfiguracja dla edytora stron

export type TemplateId = 'elegant' | 'fresh' | 'minimal'

export interface Template {
  id: TemplateId
  name: string
  description: string
  preview: string // URL do podglądu
  defaultColors: {
    primary: string
    accent: string
    background: string
    text: string
  }
  defaultHeroStyle: 'banner' | 'split' | 'centered' | 'video'
  defaultCardStyle: 'shadow' | 'border' | 'flat' | 'glass'
  defaultButtonStyle: 'rounded' | 'pill' | 'square'
}

export interface PageSection {
  id: string
  type: SectionType
  enabled: boolean
  order: number
  settings: SectionSettings
}

export type SectionType = 
  | 'hero'
  | 'about'
  | 'services'
  | 'gallery'
  | 'testimonials'
  | 'team'
  | 'faq'
  | 'contact'
  | 'promo-banner'
  | 'pricing'
  | 'features'
  | 'cta'

export interface SectionSettings {
  // Wspólne
  title?: string
  subtitle?: string
  backgroundColor?: string
  padding?: 'small' | 'medium' | 'large'
  
  // Hero
  heroVariant?: 'banner' | 'split' | 'centered' | 'video'
  heroHeight?: 'small' | 'medium' | 'large' | 'full'
  heroOverlay?: boolean
  heroOverlayOpacity?: number
  
  // Gallery
  galleryColumns?: 2 | 3 | 4
  galleryStyle?: 'grid' | 'masonry' | 'carousel'
  
  // Testimonials
  testimonialsLayout?: 'cards' | 'carousel' | 'list'
  
  // FAQ
  faqStyle?: 'accordion' | 'grid'
  faqItems?: Array<{ question: string; answer: string }>
  
  // Promo Banner
  promoText?: string
  promoButtonText?: string
  promoButtonLink?: string
  promoBackground?: string
  
  // Features
  featuresLayout?: 'grid' | 'list' | 'icons'
  featuresItems?: Array<{ icon: string; title: string; description: string }>
  
  // CTA
  ctaText?: string
  ctaButtonText?: string
  ctaStyle?: 'simple' | 'gradient' | 'image'
}

export interface PageBuilderConfig {
  templateId: TemplateId
  sections: PageSection[]
  globalStyles: {
    fontFamily?: string
    borderRadius?: 'none' | 'small' | 'medium' | 'large'
    animations?: boolean
  }
}

// Domyślne szablony
export const templates: Template[] = [
  {
    id: 'elegant',
    name: 'Elegancki',
    description: 'Ciemne kolory, duże zdjęcia, subtelne animacje. Idealny dla salonów beauty i spa.',
    preview: '/templates/elegant-preview.jpg',
    defaultColors: {
      primary: '#1a1a2e',
      accent: '#e94560',
      background: '#16213e',
      text: '#ffffff'
    },
    defaultHeroStyle: 'banner',
    defaultCardStyle: 'glass',
    defaultButtonStyle: 'pill'
  },
  {
    id: 'fresh',
    name: 'Świeży',
    description: 'Jasne kolory, zaokrąglone elementy, nowoczesny design. Świetny dla fitness i wellness.',
    preview: '/templates/fresh-preview.jpg',
    defaultColors: {
      primary: '#00b894',
      accent: '#00cec9',
      background: '#ffffff',
      text: '#2d3436'
    },
    defaultHeroStyle: 'split',
    defaultCardStyle: 'shadow',
    defaultButtonStyle: 'rounded'
  },
  {
    id: 'minimal',
    name: 'Minimalistyczny',
    description: 'Prosty, dużo białej przestrzeni, skupienie na treści. Uniwersalny dla każdej branży.',
    preview: '/templates/minimal-preview.jpg',
    defaultColors: {
      primary: '#2c3e50',
      accent: '#3498db',
      background: '#fafafa',
      text: '#333333'
    },
    defaultHeroStyle: 'centered',
    defaultCardStyle: 'border',
    defaultButtonStyle: 'square'
  }
]

// Domyślne sekcje dla nowej strony
export const defaultSections: PageSection[] = [
  { id: 'hero', type: 'hero', enabled: true, order: 0, settings: { heroVariant: 'banner', heroHeight: 'large' } },
  { id: 'about', type: 'about', enabled: true, order: 1, settings: { padding: 'large' } },
  { id: 'services', type: 'services', enabled: true, order: 2, settings: { padding: 'large' } },
  { id: 'gallery', type: 'gallery', enabled: false, order: 3, settings: { galleryColumns: 3, galleryStyle: 'grid' } },
  { id: 'testimonials', type: 'testimonials', enabled: false, order: 4, settings: { testimonialsLayout: 'cards' } },
  { id: 'team', type: 'team', enabled: false, order: 5, settings: { padding: 'medium' } },
  { id: 'faq', type: 'faq', enabled: false, order: 6, settings: { faqStyle: 'accordion', faqItems: [] } },
  { id: 'contact', type: 'contact', enabled: true, order: 7, settings: { padding: 'large' } },
]

// Nazwy sekcji po polsku
export const sectionNames: Record<SectionType, string> = {
  'hero': 'Baner główny',
  'about': 'O nas',
  'services': 'Usługi',
  'gallery': 'Galeria',
  'testimonials': 'Opinie klientów',
  'team': 'Nasz zespół',
  'faq': 'FAQ',
  'contact': 'Kontakt',
  'promo-banner': 'Banner promocyjny',
  'pricing': 'Cennik',
  'features': 'Cechy / Zalety',
  'cta': 'Wezwanie do działania'
}

// Ikony sekcji
export const sectionIcons: Record<SectionType, string> = {
  'hero': 'Image',
  'about': 'Info',
  'services': 'Sparkles',
  'gallery': 'Images',
  'testimonials': 'MessageSquare',
  'team': 'Users',
  'faq': 'HelpCircle',
  'contact': 'Mail',
  'promo-banner': 'Megaphone',
  'pricing': 'DollarSign',
  'features': 'Star',
  'cta': 'MousePointer'
}

// Funkcja do generowania domyślnej konfiguracji
export function getDefaultPageBuilderConfig(templateId: TemplateId = 'fresh'): PageBuilderConfig {
  return {
    templateId,
    sections: [...defaultSections],
    globalStyles: {
      fontFamily: 'Inter',
      borderRadius: 'medium',
      animations: true
    }
  }
}
