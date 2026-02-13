'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  CheckCircle,
  ArrowRight,
  Bell,
  Star,
  GraduationCap,
  Clock,
  Users
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function EdukacjaLandingPage() {
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
                <GraduationCap className="w-4 h-4" />
                Dla korepetytorów i szkół
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Uczniowie zapisują się na lekcje. Ty uczysz.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Zamiast pisać z każdym uczniem osobno o terminie, wysyłasz link do kalendarza. 
                Wybierają kiedy mogą, Ty widzisz wszystko w jednym miejscu.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg">
                  Wypróbuj za darmo
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 7 dni za darmo</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Bez prowizji</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-2xl p-6">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">Czwartek, 20.02</span>
                    <span className="text-sm text-gray-500">Matematyka</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '15:00', student: 'Kasia (kl. 8)', topic: 'Równania' },
                      { time: '16:00', student: 'Bartek (liceum)', topic: 'Funkcje' },
                      { time: '17:00', student: 'Wolny termin', topic: '' },
                      { time: '18:00', student: 'Ola (matura)', topic: 'Powtórka' },
                    ].map((slot, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                        slot.student === 'Wolny termin' ? 'bg-green-50 border border-green-200 border-dashed' : 'bg-teal-50'
                      }`}>
                        <span className="text-sm font-mono text-gray-600 w-12">{slot.time}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${slot.student === 'Wolny termin' ? 'text-green-700' : 'text-gray-900'}`}>
                            {slot.student}
                          </p>
                          {slot.topic && <p className="text-xs text-gray-500">{slot.topic}</p>}
                        </div>
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
            {['Korepetytorzy', 'Szkoły językowe', 'Lektorzy', 'Kursy online', 'Szkoły muzyczne', 'Instruktorzy'].map((item, i) => (
              <span key={i} className="text-sm">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Jak to działa */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Jak to wygląda?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Uczeń (lub rodzic) wchodzi na Twój link, widzi wolne terminy i wybiera ten który mu pasuje.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Wysyłasz link</h3>
              <p className="text-gray-600 text-sm">Na Messengerze, WhatsAppie, mailem - gdzie chcesz</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Uczeń wybiera termin</h3>
              <p className="text-gray-600 text-sm">Widzi tylko te godziny, które masz wolne</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Oboje dostajecie potwierdzenie</h3>
              <p className="text-gray-600 text-sm">I przypomnienie SMS dzień przed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Opinia */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl text-white mb-6">
            "Uczę angielskiego online i stacjonarnie. Wcześniej ciągle pisałam z uczniami o terminach. 
            Teraz wysyłam link i mam spokój. Polecam każdemu korepetytorowi."
          </blockquote>
          <p className="font-medium text-white">Agnieszka Lewandowska</p>
          <p className="text-sm text-teal-100">Lektorka języka angielskiego</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Zacznij przyjmować zapisy online
          </h2>
          <p className="text-gray-400 mb-8">
            Konfiguracja zajmuje kilka minut. Pierwsze 7 dni za darmo.
          </p>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-lg">
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
