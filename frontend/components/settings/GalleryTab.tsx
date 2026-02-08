'use client'

import { useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, GripVertical } from 'lucide-react'
import { CompanyData } from '@/lib/company'
import toast from 'react-hot-toast'

interface GalleryTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

export default function GalleryTab({ companyData, setCompanyData, onSave, isLoading }: GalleryTabProps) {
  const [uploading, setUploading] = useState(false)
  
  const gallery: string[] = companyData.gallery || []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Plik ${file.name} jest za duży (max 5MB)`)
        continue
      }

      try {
        const reader = new FileReader()
        const result = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        newImages.push(result)
      } catch (err) {
        toast.error(`Błąd wczytywania ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      setCompanyData({
        ...companyData,
        gallery: [...gallery, ...newImages]
      })
      toast.success(`Dodano ${newImages.length} zdjęć`)
    }

    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index)
    setCompanyData({
      ...companyData,
      gallery: newGallery
    })
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= gallery.length) return
    const newGallery = [...gallery]
    const [removed] = newGallery.splice(from, 1)
    newGallery.splice(to, 0, removed)
    setCompanyData({
      ...companyData,
      gallery: newGallery
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Galeria zdjęć</h2>
        <p className="text-[var(--text-muted)] mt-1">
          Dodaj zdjęcia swojej firmy, które będą wyświetlane na stronie rezerwacji
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Upload area */}
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--text-muted)] transition-colors bg-[var(--bg-primary)]">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-[var(--text-muted)] animate-spin" />
          ) : (
            <>
              <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">
                <span className="font-medium text-[var(--text-primary)]">Kliknij aby przesłać</span> lub przeciągnij zdjęcia
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG (max 5MB każde, do 20 zdjęć)</p>
            </>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple
            onChange={handleImageUpload}
            disabled={uploading || gallery.length >= 20}
          />
        </label>

        {/* Gallery grid */}
        {gallery.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Zdjęcia ({gallery.length}/20)
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Przeciągnij aby zmienić kolejność
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <div 
                  key={index} 
                  className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)]"
                >
                  <img 
                    src={image} 
                    alt={`Zdjęcie ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {/* Move buttons */}
                    <div className="flex flex-col gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          title="Przesuń w lewo"
                        >
                          <GripVertical className="w-4 h-4 text-white rotate-90" />
                        </button>
                      )}
                    </div>
                    
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                      title="Usuń zdjęcie"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  {/* Index badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {gallery.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Brak zdjęć w galerii</p>
            <p className="text-sm mt-1">Dodaj zdjęcia swojej firmy, usług lub zespołu</p>
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
