'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  CheckCircle,
  ArrowRight,
  Bell,
  Star,
  Dumbbell,
  Users,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function SportLandingPage() {
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

      {/* Hero */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm mb-6">
                <Dumbbell className="w-4 h-4" />
                Dla trenerów i studiów fitness
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Klienci zapisują się na treningi. Ty trenujesz.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Koniec z "czy jest jeszcze miejsce na 18:00?". Klienci widzą wolne terminy 
                i zapisują się sami. Ty dostajesz powiadomienie i zajmujesz się tym, co lubisz.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg">
                  Wypróbuj 7 dni za darmo
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Bez karty</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Bez prowizji</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-2xl p-6">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">Środa, 19.02</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '7:00', name: 'Trening poranny', spots: '8/10', type: 'grupowy' },
                      { time: '10:00', name: 'Ania K.', spots: '', type: 'indywidualny' },
                      { time: '17:00', name: 'Joga dla początkujących', spots: '12/15', type: 'grupowy' },
                      { time: '18:30', name: 'Crossfit', spots: '6/8', type: 'grupowy' },
                    ].map((slot, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                        slot.type === 'grupowy' ? 'bg-teal-50' : 'bg-teal-50'
                      }`}>
                        <span className="text-sm font-mono text-gray-600 w-12">{slot.time}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{slot.name}</p>
                          {slot.spots && <p className="text-xs text-gray-500">Zapisanych: {slot.spots}</p>}
                        </div>
                        {slot.type === 'grupowy' && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Grupowy</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dla kogo */}
      <section className="py-12 border-y bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-gray-600">
            {['Trenerzy personalni', 'Studia jogi', 'Kluby CrossFit', 'Szkoły tańca', 'Pilates', 'Siłownie', 'Kluby sportowe'].map((item, i) => (
              <span key={i} className="text-sm">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Funkcje */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Co dostajesz?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kalendarz online</h3>
              <p className="text-gray-600 text-sm">
                Treningi indywidualne i grupowe w jednym miejscu. Widzisz kto jest zapisany, ile miejsc zostało.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Przypomnienia SMS</h3>
              <p className="text-gray-600 text-sm">
                Klient dostaje SMS dzień przed treningiem. Mniej osób zapomina, mniej pustych miejsc.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Karnety i pakiety</h3>
              <p className="text-gray-600 text-sm">
                Sprzedawaj pakiety treningów. System sam odlicza wykorzystane wejścia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opinia */}
      <section className="py-16 bg-teal-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl text-white mb-6">
            "Jako trener personalny ciągle miałem problem z umawianiem klientów. 
            Teraz wysyłam im link i sami wybierają kiedy mogą. Oszczędzam masę czasu na pisaniu."
          </blockquote>
          <p className="font-medium text-white">Tomek Mazur</p>
          <p className="text-sm text-teal-100">Trener personalny, Wrocław</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Zacznij przyjmować zapisy online
          </h2>
          <p className="text-gray-400 mb-8">
            Konfiguracja zajmuje 10 minut. Pierwsze 7 dni za darmo.
          </p>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg text-lg">
            Załóż darmowe konto
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t">
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
