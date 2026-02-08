'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Plus, X, Clock } from 'lucide-react'
import Link from 'next/link'
import { employeesApi } from '@/lib/api/employees'
import toast from 'react-hot-toast'
import EmployeeAvailability from '@/components/EmployeeAvailability'

const PRESET_COLORS = [
  '#0F6048', '#41FFBC', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
]

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [newSpecialty, setNewSpecialty] = useState('')
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    specialties: [] as string[],
    color: PRESET_COLORS[0],
    isActive: true,
  })

  useEffect(() => {
    loadData()
  }, [employeeId])

  const loadData = async () => {
    try {
      setLoadingData(true)
      const employeeData = await employeesApi.getOne(employeeId)
      
      setFormData({
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        title: employeeData.title || '',
        bio: employeeData.bio || '',
        specialties: employeeData.specialties || [],
        color: employeeData.color || PRESET_COLORS[0],
        isActive: employeeData.isActive !== false,
      })
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      toast.error('Nie udało się załadować danych pracownika')
      router.push('/dashboard/employees')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }

    try {
      setLoading(true)
      
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        title: formData.title || undefined,
        bio: formData.bio || undefined,
        specialties: formData.specialties,
        color: formData.color,
        isActive: formData.isActive,
      }

      await employeesApi.update(employeeId, data)
      toast.success('Pracownik został zaktualizowany')
      router.push('/dashboard/employees')
    } catch (error: any) {
      console.error('Błąd aktualizacji pracownika:', error)
      toast.error(error.response?.data?.message || 'Nie udało się zaktualizować pracownika')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-neon mx-auto mb-4" />
          <p className="text-neutral-gray">Ładowanie danych pracownika...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/employees"
            className="inline-flex items-center space-x-2 text-neutral-gray hover:text-accent-neon transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Powrót do pracowników</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Edytuj pracownika</h1>
          <p className="text-neutral-gray/70 mt-2">Zaktualizuj informacje o członku zespołu</p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Dane podstawowe</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Imię <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  placeholder="Jan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Nazwisko <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  placeholder="Kowalski"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Stanowisko
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                placeholder="np. Fryzjer, Kosmetolog"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Bio/Opis
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                placeholder="Krótki opis pracownika..."
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Dane kontaktowe</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  placeholder="jan.kowalski@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Specjalizacje</h2>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                placeholder="np. Strzyżenie, Koloryzacja..."
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="px-4 py-2 bg-accent-neon/20 hover:bg-accent-neon/30 text-accent-neon rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj</span>
              </button>
            </div>

            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-primary-green/20 text-accent-neon rounded-full flex items-center space-x-2"
                  >
                    <span>{specialty}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialty(specialty)}
                      className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Kolor w kalendarzu</h2>
            <p className="text-sm text-neutral-gray/70">Wybierz kolor, który będzie reprezentował tego pracownika w kalendarzu</p>
            
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-full border-2 border-white/20"
                style={{ backgroundColor: formData.color }}
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                      formData.color === color ? 'ring-2 ring-accent-neon ring-offset-2 ring-offset-carbon-black' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Status</h2>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
              />
              <label className="text-sm text-neutral-gray">
                Aktywny (pracownik będzie widoczny w systemie)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAvailabilityModal(true)}
              className="px-6 py-2 bg-primary-green/20 hover:bg-primary-green/30 rounded-lg text-accent-neon transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Zarządzaj dostępnością
            </button>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/employees"
                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
              >
                Anuluj
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-neon flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Zapisywanie...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Zapisz zmiany</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Availability Modal */}
        <AnimatePresence>
          {showAvailabilityModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAvailabilityModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Dostępność pracownika</h2>
                  <button
                    onClick={() => setShowAvailabilityModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>
                
                <EmployeeAvailability employeeId={employeeId} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
