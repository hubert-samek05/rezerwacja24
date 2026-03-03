'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock,
  MessageCircle,
  CheckCircle,
  Headphones,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import MainNavigation from '@/components/MainNavigation'

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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <MainNavigation />

      {/* Hero Banner */}
      <section className="relative pt-16 sm:pt-20">
        <div className="relative h-[280px] sm:h-[340px] lg:h-[400px] overflow-hidden">
          {/* Background Image */}
          <Image
            src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?q=80&w=2073&auto=format&fit=crop"
            alt="Kontakt"
            fill
            className="object-cover scale-105"
            priority
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-teal-900/70" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900/50 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-teal-500/20">
                  Jesteśmy tu dla Ciebie
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                  Skontaktuj się z nami
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed">
                  Masz pytania? Potrzebujesz pomocy? Napisz, zadzwoń lub porozmawiaj na czacie — odpowiadamy szybko.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="relative -mt-12 sm:-mt-16 z-10 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <a 
              href="tel:+48506785959"
              className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center sm:mb-4 shadow-lg shadow-teal-500/25 flex-shrink-0">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 sm:flex-none">
                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1">Zadzwoń do nas</h3>
                <p className="text-teal-600 font-medium text-sm sm:text-base">+48 506 785 959</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Pon-Pt: 9:00 - 17:00</p>
              </div>
            </a>

            <a 
              href="mailto:kontakt@rezerwacja24.pl"
              className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center sm:mb-4 shadow-lg shadow-blue-500/25 flex-shrink-0">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 sm:flex-none">
                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1">Napisz email</h3>
                <p className="text-blue-600 font-medium text-sm sm:text-base break-all sm:break-normal">kontakt@rezerwacja24.pl</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Odpowiadamy w 24h</p>
              </div>
            </a>

            <div 
              onClick={() => {
                // @ts-ignore
                if (window.smartsupp) window.smartsupp('chat:open')
              }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group cursor-pointer flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center sm:mb-4 shadow-lg shadow-violet-500/25 flex-shrink-0">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 sm:flex-none">
                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1">Czat na żywo</h3>
                <p className="text-violet-600 font-medium text-sm sm:text-base">Rozpocznij rozmowę</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Szybka pomoc online</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-12">
            
            {/* Left - Form */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Dziękujemy!</h2>
                    <p className="text-gray-600 mb-8">
                      Twoja wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Wyślij kolejną wiadomość
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Wyślij wiadomość</h2>
                    <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">Wypełnij formularz, a my odpowiemy najszybciej jak to możliwe.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imię i nazwisko *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Jan Kowalski"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="jan@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefon
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="+48 123 456 789"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temat *
                          </label>
                          <select
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          >
                            <option value="">Wybierz temat</option>
                            <option value="general">Pytanie ogólne</option>
                            <option value="technical">Wsparcie techniczne</option>
                            <option value="billing">Płatności i faktury</option>
                            <option value="partnership">Współpraca</option>
                            <option value="demo">Prezentacja systemu</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wiadomość *
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                          placeholder="Opisz swoje pytanie lub problem..."
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          required 
                          id="privacy"
                          className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="privacy" className="text-sm text-gray-500">
                          Wyrażam zgodę na przetwarzanie danych osobowych zgodnie z{' '}
                          <Link href="/privacy" className="text-teal-600 hover:underline">
                            Polityką Prywatności
                          </Link>.
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            </div>

            {/* Right - Info */}
            <div className="lg:col-span-2 order-1 lg:order-2 space-y-4 sm:space-y-6">
              {/* Company Info */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Dane firmy</h3>
                <div className="space-y-4 text-sm">
                  <p className="font-medium text-gray-900">Akademia Rozwoju EDUCRAFT</p>
                  <p className="text-gray-600">Hubert Samek</p>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>ul. Lipowa 3d<br />30-702 Kraków</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-1 text-gray-600">
                    <p>NIP: 5130303581</p>
                    <p>REGON: 542003444</p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Godziny pracy</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pon - Pt</span>
                    <span className="font-medium text-gray-900">9:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sob - Nd</span>
                    <span className="text-gray-400">Zamknięte</span>
                  </div>
                </div>
              </div>

              {/* Help Center Link */}
              <Link 
                href="/support"
                className="block bg-teal-50 rounded-2xl p-5 sm:p-6 hover:bg-teal-100 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Headphones className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Centrum pomocy</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Znajdź odpowiedzi na najczęściej zadawane pytania.
                </p>
                <span className="text-sm font-medium text-teal-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Przejdź do pomocy
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png"
                alt="Rezerwacja24" 
                width={120} 
                height={35} 
                className="h-7 w-auto"
              />
              <span className="text-gray-400 text-sm">© 2024</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-teal-600 transition-colors">Prywatność</Link>
              <Link href="/terms" className="hover:text-teal-600 transition-colors">Regulamin</Link>
              <Link href="/support" className="hover:text-teal-600 transition-colors">Pomoc</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
