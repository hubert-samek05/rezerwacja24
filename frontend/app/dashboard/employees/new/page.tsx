'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { employeesApi } from '@/lib/api/employees'
import toast from 'react-hot-toast'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

const PRESET_COLORS = ['#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

export default function NewEmployeePage() {
  const { t, language } = useDashboardTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    color: PRESET_COLORS[0],
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }
    try {
      setLoading(true)
      await employeesApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        title: formData.title || undefined,
        bio: formData.bio || undefined,
        color: formData.color,
        isActive: formData.isActive,
      })
      toast.success('Pracownik został dodany')
      router.push('/dashboard/employees')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nie udało się dodać pracownika')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/employees" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Powrót do pracowników</span>
          </Link>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dodaj pracownika</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Wypełnij dane nowego członka zespołu</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
          {/* Basic Info */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)] mb-4">Dane podstawowe</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Imię <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="Jan"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Nazwisko <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="Kowalski"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)] mb-4">Kontakt</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="jan@firma.pl"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Additional */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)] mb-4">Dodatkowe informacje</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Stanowisko</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="np. Fryzjer, Kosmetyczka"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Opis</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                  placeholder="Krótki opis pracownika..."
                />
              </div>
            </div>
          </div>

          {/* Color */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)] mb-4">Kolor w kalendarzu</h2>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`w-8 h-8 rounded-lg transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-[var(--text-primary)]">Status aktywności</h2>
                <p className="text-sm text-[var(--text-muted)]">Nieaktywni pracownicy nie są widoczni w kalendarzu</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.isActive ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${formData.isActive ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-5">
            <Link href="/dashboard/employees" className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm text-center">
              Anuluj
            </Link>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Zapisywanie...' : 'Dodaj pracownika'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
