'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock,
  MessageSquare,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Tutaj można dodać integrację z API do wysyłania maili
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
      toast.success('Wiadomość została wysłana!')
    } catch (error) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
              <span className="text-lg sm:text-2xl font-bold text-gradient">Rezerwacja24</span>
            </Link>
            
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-emerald-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Powrót</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[var(--text-primary)]">
              Skontaktuj się <span className="text-emerald-500">z nami</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Masz pytania? Chętnie pomożemy. Wypełnij formularz lub skontaktuj się bezpośrednio.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Company Info Card */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Dane kontaktowe</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Email</p>
                      <a href="mailto:kontakt@rezerwacja24.pl" className="text-[var(--text-primary)] hover:text-emerald-500 transition-colors">
                        kontakt@rezerwacja24.pl
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Telefon</p>
                      <a href="tel:+48506785959" className="text-[var(--text-primary)] hover:text-emerald-500 transition-colors">
                        +48 506 785 959
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Adres</p>
                      <p className="text-[var(--text-primary)]">
                        Akademia Rozwoju EDUCRAFT<br />
                        Hubert Samek<br />
                        ul. Lipowa 3d<br />
                        30-702 Kraków
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Godziny pracy</p>
                      <p className="text-[var(--text-primary)]">
                        Pon - Pt: 9:00 - 17:00<br />
                        Sob - Nd: Zamknięte
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details Card */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Dane firmy</h2>
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <p><span className="text-[var(--text-muted)]">Nazwa:</span> Akademia Rozwoju EDUCRAFT Hubert Samek</p>
                  <p><span className="text-[var(--text-muted)]">Marka:</span> Rezerwacja24.pl</p>
                  <p><span className="text-[var(--text-muted)]">NIP:</span> 5130303581</p>
                  <p><span className="text-[var(--text-muted)]">REGON:</span> 542003444</p>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-[var(--bg-card)] border border-emerald-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Czas odpowiedzi</h3>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  Staramy się odpowiadać na wszystkie wiadomości w ciągu 24 godzin roboczych.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-lg">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Dziękujemy za wiadomość!</h2>
                    <p className="text-[var(--text-secondary)] mb-6">
                      Otrzymaliśmy Twoją wiadomość i odpowiemy najszybciej jak to możliwe.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                      }}
                      className="btn-outline-neon"
                    >
                      Wyślij kolejną wiadomość
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Formularz kontaktowy</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Imię i nazwisko *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="Jan Kowalski"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="jan@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Telefon
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="+48 123 456 789"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Temat *
                          </label>
                          <select
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors"
                          >
                            <option value="">Wybierz temat</option>
                            <option value="general">Pytanie ogólne</option>
                            <option value="technical">Wsparcie techniczne</option>
                            <option value="billing">Płatności i faktury</option>
                            <option value="partnership">Współpraca</option>
                            <option value="other">Inne</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Wiadomość *
                        </label>
                        <textarea
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                          placeholder="Opisz swoje pytanie lub problem..."
                        />
                      </div>

                      <div className="text-sm text-[var(--text-muted)]">
                        <p>
                          Wysyłając formularz, wyrażasz zgodę na przetwarzanie danych osobowych zgodnie z naszą{' '}
                          <Link href="/privacy" className="text-emerald-500 hover:underline">
                            Polityką Prywatności
                          </Link>.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-neon w-full sm:w-auto px-8 py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-carbon-black/30 border-t-carbon-black rounded-full animate-spin" />
                            <span>Wysyłanie...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Wyślij wiadomość</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-[var(--text-muted)]">
          <p>&copy; 2024 Rezerwacja24. Wszystkie prawa zastrzeżone.</p>
          <div className="mt-4 space-x-4">
            <Link href="/privacy" className="hover:text-emerald-500 transition-colors">Polityka prywatności</Link>
            <Link href="/terms" className="hover:text-emerald-500 transition-colors">Regulamin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
