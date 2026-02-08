'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { employeesApi, Employee } from '@/lib/api/employees'
import toast from 'react-hot-toast'

const PRESET_COLORS = ['#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

interface EmployeeModalProps {
  isOpen: boolean
  employee: Employee | null // null = dodawanie, obiekt = edycja
  onClose: () => void
  onSaved: () => void
}

export default function EmployeeModal({ isOpen, employee, onClose, onSaved }: EmployeeModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setFormData({
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          email: employee.email || '',
          phone: employee.phone || '',
          title: employee.title || '',
          bio: employee.bio || '',
          color: employee.color || PRESET_COLORS[0],
          isActive: employee.isActive !== false,
        })
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          title: '',
          bio: '',
          color: PRESET_COLORS[0],
          isActive: true,
        })
      }
    }
  }, [isOpen, employee])

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
        color: formData.color,
        isActive: formData.isActive,
      }
      
      if (employee) {
        await employeesApi.update(employee.id, data)
        toast.success('Pracownik zaktualizowany')
      } else {
        await employeesApi.create(data)
        toast.success('Pracownik dodany')
      }
      onSaved()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Wystąpił błąd')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container" onClick={onClose}>
        <div className="modal-content modal-content-lg" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              {employee ? 'Edytuj pracownika' : 'Nowy pracownik'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
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

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
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

            {/* Title */}
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

            {/* Bio */}
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">Opis</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                placeholder="Krótki opis..."
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Kolor w kalendarzu</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({...formData, color})}
                    className={`w-7 h-7 rounded-lg transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Aktywny</p>
                <p className="text-xs text-[var(--text-muted)]">Widoczny w kalendarzu</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className={`w-11 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </form>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t border-[var(--border-color)]">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">
              Anuluj
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Zapisywanie...' : (employee ? 'Zapisz' : 'Dodaj')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
