'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import { CompanyData, updateBranding } from '@/lib/company'

interface BrandingTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

export default function BrandingTab({ 
  companyData, 
  setCompanyData, 
  onSave, 
  isLoading 
}: BrandingTabProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(companyData.logo || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(companyData.banner || null)

  // Aktualizuj preview gdy companyData się zmienia
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
        setCompanyData({
          ...companyData,
          logo: result
        })
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
        setCompanyData({
          ...companyData,
          banner: result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setCompanyData({
      ...companyData,
      logo: undefined
    })
  }

  const removeBanner = () => {
    setBannerPreview(null)
    setCompanyData({
      ...companyData,
      banner: undefined
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Branding</h2>
        <p className="text-neutral-gray">
          Dostosuj wygląd swojej strony publicznej - dodaj logo i banner
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Logo firmy
          </label>
          <p className="text-sm text-neutral-gray/70 mb-4">
            Logo będzie wyświetlane na górze strony publicznej. Zalecany rozmiar: 200x200px
          </p>
        </div>

        {logoPreview ? (
          <div className="relative inline-block">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-32 w-auto object-contain"
              />
            </div>
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-accent-neon/50 transition-colors bg-white/5">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-neutral-gray mb-3" />
              <p className="mb-2 text-sm text-neutral-gray">
                <span className="font-semibold">Kliknij aby przesłać</span> lub przeciągnij plik
              </p>
              <p className="text-xs text-neutral-gray/70">PNG, JPG, SVG (MAX. 2MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </label>
        )}
      </div>

      {/* Banner Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Banner tła
          </label>
          <p className="text-sm text-neutral-gray/70 mb-4">
            Banner będzie wyświetlany jako tło strony głównej. Zalecany rozmiar: 1920x1080px
          </p>
        </div>

        {bannerPreview ? (
          <div className="relative inline-block w-full">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-48 object-cover rounded"
              />
            </div>
            <button
              onClick={removeBanner}
              className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-accent-neon/50 transition-colors bg-white/5">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-12 h-12 text-neutral-gray mb-3" />
              <p className="mb-2 text-sm text-neutral-gray">
                <span className="font-semibold">Kliknij aby przesłać</span> lub przeciągnij plik
              </p>
              <p className="text-xs text-neutral-gray/70">PNG, JPG (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleBannerUpload}
            />
          </label>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            window.alert('KLIKNIĘTO PRZYCISK ZAPISZ!')
            onSave()
          }}
          disabled={isLoading}
          className="btn-neon px-8"
        >
          {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>
    </div>
  )
}
