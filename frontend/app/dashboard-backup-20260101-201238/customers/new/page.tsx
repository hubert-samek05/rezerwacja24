'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users,
  ArrowLeft,
  Save,
  Mail,
  Phone,
  User,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { addCustomer } from '@/lib/storage'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Walidacja
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('Imię i nazwisko są wymagane')
      }
      if (!formData.email.trim() || !formData.phone.trim()) {
        throw new Error('Email i telefon są wymagane')
      }

      // Walidacja email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('Nieprawidłowy format email')
      }

      // Dodaj klienta
      addCustomer({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        isBlocked: false,
        notes: formData.notes.trim(),
        totalVisits: 0,
        totalSpent: 0,
        totalBookings: 0
      })

      // Przekieruj do listy klientów
      router.push('/dashboard/customers')
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas dodawania klienta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-accent-neon" />
              <span className="text-2xl font-bold text-gradient">Rezerwacja24</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-neutral-gray hover:text-accent-neon transition-colors">
                Dashboard
              </Link>
              <div className="w-8 h-8 bg-gradient-accent rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard/customers"
              className="inline-flex items-center text-neutral-gray hover:text-accent-neon transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do listy klientów
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Dodaj nowego klienta</h1>
            <p className="text-neutral-gray/70">Wypełnij formularz, aby dodać klienta do bazy</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 mb-6 border-l-4 border-red-400"
            >
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-8"
          >
            <div className="space-y-6">
              {/* Imię i Nazwisko */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Imię <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon transition-colors"
                      placeholder="Jan"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Nazwisko <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon transition-colors"
                      placeholder="Kowalski"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon transition-colors"
                    placeholder="jan.kowalski@example.com"
                    required
                  />
                </div>
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Telefon <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon transition-colors"
                    placeholder="+48 123 456 789"
                    required
                  />
                </div>
              </div>

              {/* Notatki */}
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Notatki
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon transition-colors resize-none"
                  placeholder="Dodatkowe informacje o kliencie..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-white/10">
              <Link
                href="/dashboard/customers"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-neutral-gray rounded-lg transition-colors"
              >
                Anuluj
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 btn-neon flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Dodawanie...' : 'Dodaj klienta'}</span>
              </button>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  )
}
