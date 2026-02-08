'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Briefcase, DollarSign, FileText } from 'lucide-react'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

export default function NewBookingPage() {
  const { t, language } = useDashboardTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    employeeId: '',
    date: '',
    time: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // TODO: Implement booking creation with API
    console.log('Creating booking:', formData)
    
    // Redirect to bookings list
    router.push('/dashboard/bookings')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nowa Rezerwacja</h1>
        <p className="text-neutral-gray/70">Utwórz nową rezerwację dla klienta</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="glass-card p-6 space-y-6">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-neutral-gray mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Klient
            </label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="input-glass"
            >
              <option value="">Wybierz klienta</option>
              {/* TODO: Load customers from API */}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-neutral-gray mb-2">
              <Briefcase className="inline w-4 h-4 mr-2" />
              Usługa
            </label>
            <select
              required
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="input-glass"
            >
              <option value="">Wybierz usługę</option>
              {/* TODO: Load services from API */}
            </select>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-neutral-gray mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Pracownik
            </label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="input-glass"
            >
              <option value="">Wybierz pracownika</option>
              {/* TODO: Load employees from API */}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-gray mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Data
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-glass"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-neutral-gray mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Godzina
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="input-glass"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-gray mb-2">
              <FileText className="inline w-4 h-4 mr-2" />
              Notatki
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-glass"
              rows={4}
              placeholder="Dodatkowe informacje..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn-neon flex-1"
            >
              Utwórz Rezerwację
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
