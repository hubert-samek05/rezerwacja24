'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, X, Loader2, LayoutGrid, List, Eye, Palette, Share2, Facebook, Instagram, Globe, Phone, Mail, MapPin } from 'lucide-react'
import { CompanyData, PageSettings } from '@/lib/company'

interface BrandingTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

const defaultPageSettings: PageSettings = {
  servicesLayout: 'grid',
  showServiceImages: true,
  showServicePrices: true,
  showServiceDuration: true,
  showEmployeeSelection: true,
  showOpeningHours: true,
  showSocialMedia: true,
  showDescription: true,
  showAddress: true,
  showPhone: true,
  showEmail: true,
  showTeam: false, // Domyślnie ukryte
  primaryColor: '#0F6048',
  accentColor: '#41FFBC',
  heroStyle: 'banner',
  bookingButtonText: 'Zarezerwuj',
  buttonStyle: 'rounded',
  cardStyle: 'shadow',
}

export default function BrandingTab({ companyData, setCompanyData, onSave, isLoading }: BrandingTabProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(companyData.logo || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(companyData.banner || null)
  const [activeSection, setActiveSection] = useState<'branding' | 'layout' | 'visibility' | 'colors' | 'social'>('branding')

  const pageSettings: PageSettings = { ...defaultPageSettings, ...companyData.pageSettings }

  const updatePageSettings = (updates: Partial<PageSettings>) => {
    setCompanyData({
      ...companyData,
      pageSettings: { ...pageSettings, ...updates }
    })
  }

  const updateSocialMedia = (key: string, value: string) => {
    setCompanyData({
      ...companyData,
      socialMedia: { ...companyData.socialMedia, [key]: value }
    })
  }

  useEffect(() => {
    setLogoPreview(companyData.logo || null)
    setBannerPreview(companyData.banner || null)
  }, [companyData.logo, companyData.banner])

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

  const sections = [
    { id: 'branding' as const, label: 'Logo i banner', icon: ImageIcon },
    { id: 'layout' as const, label: 'Układ strony', icon: LayoutGrid },
    { id: 'visibility' as const, label: 'Widoczność elementów', icon: Eye },
    { id: 'colors' as const, label: 'Kolory i styl', icon: Palette },
    { id: 'social' as const, label: 'Social media', icon: Share2 },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Wygląd i funkcje strony</h2>
        <p className="text-[var(--text-muted)] mt-1">Dostosuj wygląd i zachowanie swojej strony rezerwacji</p>
      </div>

      {/* Nawigacja sekcji - Pill Style */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-[var(--bg-primary)] rounded-2xl w-fit">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeSection === section.id
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {/* Sekcja: Logo i banner */}
        {activeSection === 'branding' && (
          <>
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Logo firmy
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Logo będzie wyświetlane na stronie rezerwacji. Zalecany rozmiar: 200x200px
              </p>

              {logoPreview ? (
                <div className="relative inline-block">
                  <div className="p-6 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                    <img src={logoPreview} alt="Logo" className="h-24 w-auto object-contain" />
                  </div>
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--text-muted)] transition-colors bg-[var(--bg-primary)]">
                  <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-primary)]">Kliknij aby przesłać</span> lub przeciągnij
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, SVG (max 2MB)</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              )}
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Banner tła
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Banner wyświetlany jako tło strony. Zalecany rozmiar: 1920x600px
              </p>

              {bannerPreview ? (
                <div className="relative">
                  <div className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                    <img src={bannerPreview} alt="Banner" className="w-full h-40 object-cover rounded-lg" />
                  </div>
                  <button
                    onClick={removeBanner}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--text-muted)] transition-colors bg-[var(--bg-primary)]">
                  <ImageIcon className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-primary)]">Kliknij aby przesłać</span> lub przeciągnij
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG (max 5MB)</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} />
                </label>
              )}
            </div>

            {/* Styl nagłówka */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Styl nagłówka strony
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Wybierz jak ma wyglądać górna część strony
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'banner', label: 'Z banerem', desc: 'Duży banner z logo' },
                  { value: 'minimal', label: 'Minimalistyczny', desc: 'Tylko logo i nazwa' },
                  { value: 'none', label: 'Bez nagłówka', desc: 'Od razu usługi' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePageSettings({ heroStyle: option.value as 'banner' | 'minimal' | 'none' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      pageSettings.heroStyle === option.value
                        ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                        : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <div className="font-medium text-[var(--text-primary)]">{option.label}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sekcja: Układ strony */}
        {activeSection === 'layout' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Układ listy usług
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Wybierz jak mają być wyświetlane usługi na stronie
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updatePageSettings({ servicesLayout: 'grid' })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    pageSettings.servicesLayout === 'grid'
                      ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-[var(--text-primary)]" />
                  <div className="font-medium text-[var(--text-primary)]">Siatka</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Karty obok siebie</div>
                </button>
                <button
                  type="button"
                  onClick={() => updatePageSettings({ servicesLayout: 'list' })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    pageSettings.servicesLayout === 'list'
                      ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <List className="w-8 h-8 mx-auto mb-2 text-[var(--text-primary)]" />
                  <div className="font-medium text-[var(--text-primary)]">Lista</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Jedna pod drugą</div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Sekcja: Widoczność elementów */}
        {activeSection === 'visibility' && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              Wybierz które elementy mają być widoczne na Twojej stronie rezerwacji
            </p>
            
            {[
              { key: 'showServiceImages', label: 'Zdjęcia usług', desc: 'Pokazuj zdjęcia przy usługach' },
              { key: 'showServicePrices', label: 'Ceny usług', desc: 'Pokazuj ceny na liście usług' },
              { key: 'showServiceDuration', label: 'Czas trwania', desc: 'Pokazuj czas trwania usług' },
              { key: 'showEmployeeSelection', label: 'Wybór specjalisty', desc: 'Pozwól klientom wybrać specjalistę' },
              { key: 'showTeam', label: 'Sekcja Zespół', desc: 'Pokazuj sekcję z pracownikami na stronie' },
              { key: 'showDescription', label: 'Opis firmy', desc: 'Pokazuj opis firmy w nagłówku' },
              { key: 'showSocialMedia', label: 'Media społecznościowe', desc: 'Pokazuj linki do social media' },
              { key: 'showAddress', label: 'Adres', desc: 'Pokazuj adres firmy' },
              { key: 'showPhone', label: 'Telefon', desc: 'Pokazuj numer telefonu' },
              { key: 'showEmail', label: 'Email', desc: 'Pokazuj adres email' },
            ].map(item => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]"
              >
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{item.label}</div>
                  <div className="text-sm text-[var(--text-muted)]">{item.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePageSettings({ [item.key]: !pageSettings[item.key as keyof PageSettings] })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pageSettings[item.key as keyof PageSettings]
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      pageSettings[item.key as keyof PageSettings] ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sekcja: Kolory i tekst */}
        {activeSection === 'colors' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Kolor główny
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Kolor przycisków i akcentów na stronie
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={pageSettings.primaryColor}
                  onChange={(e) => updatePageSettings({ primaryColor: e.target.value })}
                  className="w-16 h-10 rounded-lg cursor-pointer border border-[var(--border-color)]"
                />
                <input
                  type="text"
                  value={pageSettings.primaryColor}
                  onChange={(e) => updatePageSettings({ primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  placeholder="#0F6048"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Kolor akcentu
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Dodatkowy kolor dla wyróżnień
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={pageSettings.accentColor}
                  onChange={(e) => updatePageSettings({ accentColor: e.target.value })}
                  className="w-16 h-10 rounded-lg cursor-pointer border border-[var(--border-color)]"
                />
                <input
                  type="text"
                  value={pageSettings.accentColor}
                  onChange={(e) => updatePageSettings({ accentColor: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  placeholder="#41FFBC"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tekst przycisku rezerwacji
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Tekst wyświetlany na głównym przycisku rezerwacji
              </p>
              <input
                type="text"
                value={pageSettings.bookingButtonText}
                onChange={(e) => updatePageSettings({ bookingButtonText: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                placeholder="Zarezerwuj"
              />
            </div>

            {/* Styl przycisków */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Styl przycisków
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Wybierz kształt przycisków na stronie
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'rounded', label: 'Zaokrąglone', preview: 'rounded-xl' },
                  { value: 'pill', label: 'Pigułka', preview: 'rounded-full' },
                  { value: 'square', label: 'Kwadratowe', preview: 'rounded-md' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePageSettings({ buttonStyle: option.value as 'rounded' | 'pill' | 'square' })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      pageSettings.buttonStyle === option.value
                        ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                        : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <div className={`mx-auto mb-2 w-20 h-8 bg-[var(--text-primary)] ${option.preview}`} />
                    <div className="text-sm font-medium text-[var(--text-primary)]">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Styl kart usług */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Styl kart usług
              </label>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Wybierz wygląd kart z usługami
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'shadow', label: 'Z cieniem', desc: 'Elegancki cień' },
                  { value: 'border', label: 'Z obramowaniem', desc: 'Subtelna ramka' },
                  { value: 'flat', label: 'Płaskie', desc: 'Minimalistyczne' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePageSettings({ cardStyle: option.value as 'shadow' | 'border' | 'flat' })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      pageSettings.cardStyle === option.value
                        ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                        : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <div className="font-medium text-[var(--text-primary)]">{option.label}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sekcja: Social Media */}
        {activeSection === 'social' && (
          <div className="space-y-6">
            <p className="text-sm text-[var(--text-muted)]">
              Dodaj linki do swoich profili w mediach społecznościowych. Będą wyświetlane na stronie rezerwacji.
            </p>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                <Globe className="w-4 h-4" />
                Strona internetowa
              </label>
              <input
                type="url"
                value={companyData.socialMedia?.website || ''}
                onChange={(e) => updateSocialMedia('website', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                placeholder="https://twoja-strona.pl"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </label>
              <input
                type="url"
                value={companyData.socialMedia?.facebook || ''}
                onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                placeholder="https://facebook.com/twoja-firma"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="url"
                value={companyData.socialMedia?.instagram || ''}
                onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                placeholder="https://instagram.com/twoja-firma"
              />
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)]">
                Wskazówka: Upewnij się, że linki zaczynają się od https:// i prowadzą bezpośrednio do Twoich profili.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>
    </div>
  )
}
