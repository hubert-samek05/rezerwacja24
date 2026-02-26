'use client'

import { useState, useEffect } from 'react'
import { 
  Globe, 
  Eye, 
  EyeOff, 
  Loader2, 
  Check, 
  AlertCircle,
  ExternalLink,
  Building2,
  Tag,
  FileText,
  Image as ImageIcon,
  Star,
  TrendingUp,
  Sparkles,
  Flower2,
  Heart,
  Dumbbell,
  Pen,
  GraduationCap,
  PawPrint,
  Car,
  Home,
  Camera,
  PartyPopper,
  Scale,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId, getTenantConfig } from '@/lib/tenant'
import { MARKETPLACE_CATEGORIES, type Category, type Subcategory } from '@/lib/marketplace-categories'

// Mapowanie ikon
const iconMap: Record<string, any> = {
  Sparkles, Flower2, Heart, Dumbbell, Pen, GraduationCap, 
  PawPrint, Car, Home, Camera, PartyPopper, Scale
}

interface MarketplaceProfile {
  exists: boolean
  isPublished: boolean
  title: string
  description: string
  shortDesc: string
  category: string
  subcategory: string | null
  tags: string[]
  coverImage: string | null
  gallery: string[]
  viewCount?: number
  bookingCount?: number
  reviewCount?: number
  averageRating?: number
  slug?: string
}

export default function MarketplaceTab() {
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Formularz
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [tagsInput, setTagsInput] = useState('')
  const [coverImage, setCoverImage] = useState('')
  
  // UI state
  const [step, setStep] = useState<'category' | 'subcategory' | 'details'>('category')
  
  const [baseUrl, setBaseUrl] = useState('rezerwacja24.pl')

  useEffect(() => {
    const hostname = window.location.hostname
    const isEu = hostname.includes('bookings24.eu')
    setBaseUrl(isEu ? 'bookings24.eu' : 'rezerwacja24.pl')
    
    fetchProfile()
  }, [])

  const fetchWithTenant = async (url: string, options: RequestInit = {}) => {
    const config = getTenantConfig()
    const token = localStorage.getItem('token')
    
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
      },
    })
  }

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const API_URL = getApiUrl()
      
      const response = await fetchWithTenant(`${API_URL}/api/marketplace/my-profile`)
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać profilu')
      }
      
      const data = await response.json()
      setProfile(data)
      
      // Wypełnij formularz danymi
      setTitle(data.title || '')
      setDescription(data.description || '')
      setShortDesc(data.shortDesc || '')
      setSelectedCategory(data.category || '')
      setSelectedSubcategory(data.subcategory || '')
      setTagsInput((data.tags || []).join(', '))
      setCoverImage(data.coverImage || '')
      
      // Ustaw odpowiedni krok
      if (data.exists && data.category) {
        setStep('details')
      }
    } catch (err: any) {
      console.error('Error fetching marketplace profile:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedCategory) {
      toast.error('Wybierz kategorię firmy')
      return
    }
    
    setIsSaving(true)
    
    try {
      const API_URL = getApiUrl()
      
      const tags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)
      
      const response = await fetchWithTenant(`${API_URL}/api/marketplace/publish`, {
        method: 'POST',
        body: JSON.stringify({
          title: title || undefined,
          description,
          shortDesc,
          category: selectedCategory,
          subcategory: selectedSubcategory || undefined,
          tags,
          coverImage: coverImage || undefined,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Błąd publikacji')
      }
      
      toast.success('Profil został opublikowany!')
      fetchProfile()
    } catch (err: any) {
      console.error('Error publishing profile:', err)
      toast.error(err.message || 'Nie udało się opublikować profilu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnpublish = async () => {
    if (!confirm('Czy na pewno chcesz ukryć profil z katalogu firm?')) {
      return
    }
    
    setIsSaving(true)
    
    try {
      const API_URL = getApiUrl()
      
      const response = await fetchWithTenant(`${API_URL}/api/marketplace/unpublish`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Błąd ukrywania profilu')
      }
      
      toast.success('Profil został ukryty z katalogu')
      fetchProfile()
    } catch (err: any) {
      console.error('Error unpublishing profile:', err)
      toast.error(err.message || 'Nie udało się ukryć profilu')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedCategoryData = MARKETPLACE_CATEGORIES.find(c => c.id === selectedCategory)

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[var(--text-primary)] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Profil w katalogu firm</h2>
        <p className="text-[var(--text-muted)] mt-1">
          Opublikuj swoją firmę w katalogu, aby klienci mogli Cię znaleźć
        </p>
      </div>

      {/* Status Card */}
      <div className={`mb-8 p-6 rounded-2xl border-2 ${
        profile?.isPublished 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              profile?.isPublished 
                ? 'bg-green-100 dark:bg-green-900/50' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {profile?.isPublished ? (
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <EyeOff className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                {profile?.isPublished ? 'Profil jest widoczny' : 'Profil jest ukryty'}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {profile?.isPublished 
                  ? 'Klienci mogą znaleźć Twoją firmę w katalogu' 
                  : 'Twoja firma nie jest widoczna w katalogu'}
              </p>
            </div>
          </div>
          
          {profile?.isPublished && profile?.slug && (
            <a
              href={`https://${baseUrl}/firmy`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Zobacz w katalogu</span>
            </a>
          )}
        </div>

        {/* Stats */}
        {profile?.isPublished && profile.exists && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--text-primary)]">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {profile.viewCount || 0}
              </div>
              <p className="text-xs text-[var(--text-muted)]">Wyświetlenia</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--text-primary)]">
                <Building2 className="w-5 h-5 text-blue-500" />
                {profile.bookingCount || 0}
              </div>
              <p className="text-xs text-[var(--text-muted)]">Rezerwacje</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--text-primary)]">
                <Star className="w-5 h-5 text-yellow-500" />
                {Number(profile.averageRating || 0).toFixed(1)}
              </div>
              <p className="text-xs text-[var(--text-muted)]">Średnia ocena</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {profile.reviewCount || 0}
              </div>
              <p className="text-xs text-[var(--text-muted)]">Opinii</p>
            </div>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setStep('category')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            step === 'category' 
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
              : selectedCategory 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
          }`}
        >
          {selectedCategory ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">1</span>}
          Kategoria
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => selectedCategory && setStep('subcategory')}
          disabled={!selectedCategory}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            step === 'subcategory' 
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
              : selectedSubcategory 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
          } ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {selectedSubcategory ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">2</span>}
          Podkategoria
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => selectedCategory && setStep('details')}
          disabled={!selectedCategory}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            step === 'details' 
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
          } ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">3</span>
          Szczegóły
        </button>
      </div>

      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">Wybierz kategorię</h3>
              <p className="text-sm text-[var(--text-muted)]">W jakiej branży działa Twoja firma?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MARKETPLACE_CATEGORIES.map((category) => {
              const IconComponent = iconMap[category.icon] || Building2
              const isSelected = selectedCategory === category.id
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setSelectedSubcategory('')
                    setStep('subcategory')
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 text-teal-700'
                      : 'bg-white border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 text-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-left">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Subcategory Selection */}
      {step === 'subcategory' && selectedCategoryData && (
        <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep('category')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-[var(--text-muted)]" />
            </button>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedCategoryData.color} flex items-center justify-center`}>
              {(() => {
                const IconComponent = iconMap[selectedCategoryData.icon] || Building2
                return <IconComponent className="w-5 h-5 text-white" />
              })()}
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">{selectedCategoryData.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">Wybierz podkategorię (opcjonalnie)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {selectedCategoryData.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  selectedSubcategory === sub.id
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{sub.name}</span>
                  {selectedSubcategory === sub.id && <Check className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('details')}
              className="flex-1 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium hover:opacity-90 transition-all"
            >
              {selectedSubcategory ? 'Dalej' : 'Pomiń i przejdź dalej'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details Form */}
      {step === 'details' && (
        <div className="bg-[var(--bg-primary)] rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep('subcategory')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-[var(--text-muted)]" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">Szczegóły profilu</h3>
              <p className="text-sm text-[var(--text-muted)]">
                {selectedCategoryData?.name}
                {selectedSubcategory && ` → ${selectedCategoryData?.subcategories.find(s => s.id === selectedSubcategory)?.name}`}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Nazwa wyświetlana
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pozostaw puste, aby użyć nazwy firmy"
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Krótki opis (do 150 znaków)
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value.slice(0, 150))}
              placeholder="Np. Profesjonalny salon fryzjerski w centrum miasta"
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">{shortDesc.length}/150 znaków</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Pełny opis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Opisz swoją firmę, oferowane usługi, doświadczenie..."
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Tagi (oddzielone przecinkami)
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="np. strzyżenie, koloryzacja, balayage"
                className="w-full pl-11 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Zdjęcie okładkowe (URL)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-11 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Możesz użyć zdjęcia z galerii firmy lub zewnętrznego linku
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {step === 'details' && (
        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-4 justify-end">
          {profile?.isPublished && (
            <button
              onClick={handleUnpublish}
              disabled={isSaving}
              className="px-6 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-full font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              <span>Ukryj z katalogu</span>
            </button>
          )}
          
          <button
            onClick={handlePublish}
            disabled={isSaving || !selectedCategory}
            className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{profile?.isPublished ? 'Zapisz zmiany' : 'Opublikuj profil'}</span>
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Jak to działa?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>Twój profil pojawi się w katalogu firm na stronie głównej</li>
              <li>Klienci klikając na Twoją firmę zostaną przekierowani do Twojej subdomeny</li>
              <li>Możesz w każdej chwili ukryć profil z katalogu</li>
              <li>Statystyki wyświetleń i rezerwacji są aktualizowane automatycznie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
