'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  CheckCircle,
  ArrowRight,
  Bell,
  Star,
  Home,
  Wrench,
  MapPin
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function DomLandingPage() {
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    const isEu = hostname.includes('bookings24.eu')
    setAppUrl(isEu ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  return (
    <div className="min-h-screen bg-white">
      <MainNavigation />

      {/* Hero */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm mb-6">
                <Home className="w-4 h-4" />
                Dla fachowców i firm usługowych
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Klienci umawiają wizyty online. Ty robisz swoją robotę.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Hydraulik, elektryk, firma sprzątająca - nieważne. Klient wchodzi na stronę, 
                wybiera termin i adres. Ty dostajesz powiadomienie i jedziesz.
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
                    <span className="font-semibold text-gray-900">Sobota, 22.02</span>
                    <span className="text-sm text-gray-500">Zlecenia</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '9:00', service: 'Naprawa kranu', address: 'ul. Kwiatowa 15', client: 'Nowak' },
                      { time: '11:30', service: 'Montaż gniazdek', address: 'ul. Słoneczna 8', client: 'Kowalski' },
                      { time: '14:00', service: 'Wolny termin', address: '', client: '' },
                      { time: '16:00', service: 'Sprzątanie mieszkania', address: 'ul. Parkowa 22', client: 'Wiśniewska' },
                    ].map((slot, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                        slot.service === 'Wolny termin' ? 'bg-green-50 border border-green-200 border-dashed' : 'bg-teal-50'
                      }`}>
                        <span className="text-sm font-mono text-gray-600 w-12">{slot.time}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${slot.service === 'Wolny termin' ? 'text-green-700' : 'text-gray-900'}`}>
                            {slot.service}
                          </p>
                          {slot.address && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {slot.address}
                            </p>
                          )}
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
            {['Hydraulicy', 'Elektrycy', 'Firmy sprzątające', 'Złote rączki', 'Malarze', 'Firmy remontowe', 'Serwisy AGD'].map((item, i) => (
              <span key={i} className="text-sm">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Korzyści */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kalendarz zleceń</h3>
              <p className="text-gray-600 text-sm">
                Widzisz wszystkie zlecenia na dany dzień. Z adresami, telefonami, opisem.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Przypomnienia</h3>
              <p className="text-gray-600 text-sm">
                Klient dostaje SMS dzień przed. Ty też. Nikt nie zapomina.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adresy klientów</h3>
              <p className="text-gray-600 text-sm">
                Klient podaje adres przy rezerwacji. Masz wszystko w jednym miejscu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opinia */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl text-white mb-6">
            "Jestem hydraulikiem od 20 lat. Zawsze zapisywałem zlecenia w notesie. 
            Teraz mam wszystko w telefonie, klienci umawiają się sami, a ja nie muszę 
            odbierać telefonu jak jestem pod zlewem."
          </blockquote>
          <p className="font-medium text-white">Andrzej Michalski</p>
          <p className="text-sm text-teal-100">Hydraulik, Gdańsk</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Sprawdź czy to coś dla Ciebie
          </h2>
          <p className="text-gray-400 mb-8">
            7 dni za darmo. Bez karty. Bez zobowiązań.
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
