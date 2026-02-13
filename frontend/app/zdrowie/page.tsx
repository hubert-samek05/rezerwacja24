'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  Globe,
  CheckCircle,
  ArrowRight,
  Bell,
  Clock,
  Star,
  Shield,
  Stethoscope,
  Heart,
  Activity,
  Phone,
  MessageSquare
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function ZdrowieLandingPage() {
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    const isEu = hostname.includes('bookings24.eu')
    setAppUrl(isEu ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - identyczna jak na stronie głównej */}
      <MainNavigation />

      {/* Hero - prosty, bez przesady */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm mb-6">
                <Stethoscope className="w-4 h-4" />
                Dla gabinetów medycznych
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Pacjenci umawiają się online. Ty masz więcej czasu na leczenie.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Koniec z telefonami w trakcie wizyt. Pacjenci sami wybierają termin, 
                dostają przypomnienie SMS, a Ty widzisz wszystko w kalendarzu.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg">
                  Wypróbuj 7 dni za darmo
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#jak-dziala" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg">
                  Zobacz jak to działa
                </a>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Bez karty</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> RODO</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 0% prowizji</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 sm:p-8">
                {/* Mockup kalendarza */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">Poniedziałek, 17 lutego</span>
                    <span className="text-sm text-gray-500">Dr Anna Kowalska</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '9:00', patient: 'Jan Nowak', type: 'Kontrola', status: 'confirmed' },
                      { time: '9:30', patient: 'Maria Wiśniewska', type: 'Konsultacja', status: 'confirmed' },
                      { time: '10:00', patient: '', type: 'Wolny termin', status: 'free' },
                      { time: '10:30', patient: 'Piotr Zieliński', type: 'Badanie', status: 'pending' },
                    ].map((slot, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${
                        slot.status === 'free' ? 'bg-green-50 border border-green-200' :
                        slot.status === 'pending' ? 'bg-teal-50 border border-amber-200' :
                        'bg-gray-50'
                      }`}>
                        <span className="text-sm font-medium text-gray-600 w-12">{slot.time}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{slot.patient || 'Dostępny'}</p>
                          <p className="text-xs text-gray-500">{slot.type}</p>
                        </div>
                        {slot.status === 'pending' && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Do potwierdzenia</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Powiadomienie */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">SMS wysłany</p>
                    <p className="text-sm font-medium">Przypomnienie o wizycie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dla kogo - konkretne specjalizacje */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Używają nas lekarze różnych specjalizacji
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              'Lekarze pierwszego kontaktu',
              'Fizjoterapeuci',
              'Psycholodzy i psychiatrzy',
              'Stomatolodzy',
              'Dietetycy',
              'Logopedzi',
              'Rehabilitanci',
              'Osteopaci',
            ].map((spec, i) => (
              <div key={i} className="bg-white rounded-lg p-4 text-center border hover:border-red-200 transition-colors">
                <span className="text-gray-700">{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jak to działa - krok po kroku */}
      <section id="jak-dziala" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
            Jak to wygląda w praktyce?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Pacjent wchodzi na Twoją stronę, wybiera termin i gotowe. Ty dostajesz powiadomienie.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Pacjent wchodzi na stronę</h3>
              <p className="text-gray-600 text-sm">
                Udostępniasz link do rezerwacji na swojej stronie, w Google Maps, czy w social mediach.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Wybiera termin</h3>
              <p className="text-gray-600 text-sm">
                Widzi dostępne godziny, wybiera tę która mu pasuje. Może to zrobić o 23:00 w niedzielę.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Oboje dostajecie SMS</h3>
              <p className="text-gray-600 text-sm">
                Ty wiesz o nowej wizycie, pacjent dostaje przypomnienie dzień przed. Mniej nieobecności.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Konkretne korzyści */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">-70%</div>
              <p className="text-teal-100">mniej nieobecności dzięki przypomnieniom SMS</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">5h</div>
              <p className="text-teal-100">tygodniowo oszczędzasz na odbieraniu telefonów</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <p className="text-teal-100">pacjenci mogą się umawiać nawet w nocy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Opinia */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-teal-400 fill-teal-400" />)}
          </div>
          <blockquote className="text-xl text-gray-700 mb-6">
            "Odkąd mam system rezerwacji online, nie muszę przerywać wizyt żeby odbierać telefon. 
            Pacjenci umawiają się sami, a ja mam spokój. Polecam każdemu lekarzowi."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Dr Magdalena Nowak</p>
              <p className="text-sm text-gray-500">Fizjoterapeuta, Warszawa</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Sprawdź sam przez 7 dni
          </h2>
          <p className="text-gray-400 mb-8">
            Bez karty kredytowej. Bez zobowiązań. Po prostu załóż konto i zobacz czy Ci pasuje.
          </p>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-lg">
            Załóż darmowe konto
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/"><Image src="/logo.png" alt="Rezerwacja24" width={120} height={36} className="h-7 w-auto" /></Link>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Prywatność</Link>
              <Link href="/terms" className="hover:text-gray-700">Regulamin</Link>
              <Link href="/contact" className="hover:text-gray-700">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
