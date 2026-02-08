'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle,
  ArrowRight,
  X,
  Clock,
  Users,
  CreditCard,
  Shield,
  Zap,
  Star,
  Phone,
  Mail,
  Building,
  AlertTriangle,
  Gift,
  TrendingDown,
  TrendingUp,
  HeartHandshake,
  Calendar,
  Settings
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function MigracjaZBooksyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Tutaj można dodać wysyłkę do API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Rezerwacja24" 
                width={180} 
                height={54} 
                className="h-9 sm:h-10 w-auto"
                priority
              />
            </Link>
            
            <div className="hidden lg:flex items-center gap-4">
              <a href="https://app.rezerwacja24.pl/login" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                Zaloguj się
              </a>
              <a href="https://app.rezerwacja24.pl/register" className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors text-sm">
                Wypróbuj za darmo
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-teal-700 font-medium mb-4">Alternatywa dla Booksy</p>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                System rezerwacji
                <span className="block text-teal-700 mt-2">bez prowizji</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Szukasz alternatywy dla Booksy? Rezerwacja24 to system rezerwacji bez prowizji. 
                Płacisz tylko stały abonament - od 12,99 zł miesięcznie.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a 
                  href="https://app.rezerwacja24.pl/register" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl transition-colors text-lg"
                >
                  Wypróbuj za darmo
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a 
                  href="#porownanie" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-lg"
                >
                  Zobacz porównanie
                </a>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>0% prowizji na zawsze</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>Od 12,99 zł/mies.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>7 dni za darmo</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Porównanie */}
      <section id="porownanie" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-teal-700 font-medium mb-3">Porównanie</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Dlaczego warto się przenieść?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Booksy */}
            <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Booksy</h3>
                  <p className="text-sm text-red-600">Twoja obecna sytuacja</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Prowizja do 25%</span>
                    <p className="text-sm text-gray-600">Od każdej rezerwacji online</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Abonament + prowizja</span>
                    <p className="text-sm text-gray-600">Płacisz podwójnie</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Klienci "należą" do Booksy</span>
                    <p className="text-sm text-gray-600">Widzą konkurencję obok Ciebie</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Drogi support</span>
                    <p className="text-sm text-gray-600">Długi czas oczekiwania</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-red-100 rounded-xl">
                <p className="text-sm text-red-800">
                  <strong>Przykład:</strong> Przy 100 rezerwacjach miesięcznie po 100 zł, 
                  tracisz nawet <strong>2 500 zł miesięcznie</strong> na prowizjach!
                </p>
              </div>
            </div>
            
            {/* Rezerwacja24 */}
            <div className="bg-teal-50 rounded-2xl p-8 border-2 border-teal-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Rezerwacja24</h3>
                  <p className="text-sm text-teal-600">Twoja nowa rzeczywistość</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">0% prowizji - na zawsze</span>
                    <p className="text-sm text-gray-600">Płacisz tylko stały abonament</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Od 12,99 zł/mies.</span>
                    <p className="text-sm text-gray-600">Bez ukrytych kosztów</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Twoi klienci - Twoja baza</span>
                    <p className="text-sm text-gray-600">Własna strona bez konkurencji</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Polski support 24/7</span>
                    <p className="text-sm text-gray-600">Szybka pomoc po polsku</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-teal-100 rounded-xl">
                <p className="text-sm text-teal-800">
                  <strong>Oszczędność:</strong> Przy tym samym obrocie 
                  <strong> zostawiasz 2 500 zł w swojej kieszeni</strong> każdego miesiąca!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jak zacząć */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Jak przenieść się z Booksy?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Przejście jest proste. Bazę klientów możesz zaimportować z pliku CSV, resztę skonfigurujesz ręcznie.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Załóż konto',
                description: 'Zarejestruj się w Rezerwacja24 - to zajmuje 2 minuty'
              },
              {
                step: '2',
                title: 'Skonfiguruj profil',
                description: 'Dodaj usługi, cennik, godziny pracy i pracowników ręcznie'
              },
              {
                step: '3',
                title: 'Importuj klientów',
                description: 'Wyeksportuj klientów z Booksy (CSV) i zaimportuj w Ustawieniach'
              },
              {
                step: '4',
                title: 'Udostępnij link',
                description: 'Wyślij klientom nowy link do rezerwacji'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 h-full">
                  <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <a 
              href="https://app.rezerwacja24.pl/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl transition-colors"
            >
              Załóż konto za darmo
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Co można zaimportować */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Co możesz przenieść z Booksy?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Można zaimportować */}
            <div className="bg-teal-50 rounded-2xl p-8 border border-teal-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Import z CSV</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Baza klientów</span>
                    <p className="text-sm text-gray-600">Imiona, nazwiska, telefony, emaile</p>
                  </div>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Wyeksportuj klientów z Booksy jako CSV i zaimportuj w Ustawienia → Import z Booksy
              </p>
            </div>
            
            {/* Trzeba dodać ręcznie */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfiguracja ręczna</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Usługi i cennik</span>
                    <p className="text-sm text-gray-600">Dodaj swoje usługi z cenami i czasem trwania</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Godziny pracy</span>
                    <p className="text-sm text-gray-600">Ustaw dni i godziny otwarcia</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Pracownicy</span>
                    <p className="text-sm text-gray-600">Dodaj zespół i przypisz usługi</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">Dane firmy</span>
                    <p className="text-sm text-gray-600">Logo, opis, adres, kontakt</p>
                  </div>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Konfiguracja zajmuje około 15-30 minut. Chętnie pomożemy!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formularz kontaktowy */}
      <section id="formularz" className="py-16 bg-teal-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Potrzebujesz pomocy?
            </h2>
            <p className="text-teal-200">
              Masz pytania? Napisz do nas, chętnie pomożemy.
            </p>
          </div>
          
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Dziękujemy!</h3>
              <p className="text-gray-600 mb-6">
                Otrzymaliśmy Twoje zgłoszenie. Oddzwonimy w ciągu 2 godzin.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-teal-700 font-medium hover:text-teal-800"
              >
                Wróć na stronę główną
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imię i nazwisko *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Anna Kowalska"
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
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="anna@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wiadomość *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="W czym możemy Ci pomóc?"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 px-8 py-4 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Wysyłanie...'
                ) : (
                  <>
                    Wyślij wiadomość
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                Odpowiemy najszybciej jak to możliwe.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Najczęstsze pytania
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'Czy migracja jest naprawdę darmowa?',
                a: 'Tak, migracja jest całkowicie darmowa. Pomagamy przenieść wszystkie dane bez żadnych opłat.'
              },
              {
                q: 'Ile trwa migracja?',
                a: 'Standardowa migracja trwa do 24 godzin. W przypadku bardzo dużych baz (ponad 5000 klientów) może to potrwać do 48 godzin.'
              },
              {
                q: 'Czy stracę jakieś dane?',
                a: 'Nie. Przenosimy wszystkie dane: klientów, historię wizyt, usługi, ceny, notatki. Nic nie zginie.'
              },
              {
                q: 'Czy muszę od razu rezygnować z Booksy?',
                a: 'Nie. Możesz przez jakiś czas korzystać z obu systemów równolegle, żeby się przekonać. Dopiero gdy będziesz gotowa, zrezygnujesz z Booksy.'
              },
              {
                q: 'Co jeśli mam pytania po migracji?',
                a: 'Nasz support jest dostępny 24/7. Pomagamy z każdym problemem - po polsku, szybko i skutecznie.'
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Przestań płacić prowizje
          </h2>
          <p className="text-xl text-teal-200 mb-8">
            Dołącz do setek salonów, które już przeszły z Booksy do Rezerwacja24
          </p>
          <a 
            href="#formularz"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-teal-900 font-bold rounded-xl text-xl hover:bg-teal-50 transition-colors"
          >
            Zamów darmową migrację
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2026 Rezerwacja24</p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Polityka prywatności</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Regulamin</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
