'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  CheckCircle,
  ArrowRight,
  Bell,
  Star,
  Car,
  Wrench,
  Clock,
  Phone,
  Globe,
  X
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function MotoryzacjaLandingPage() {
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
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm mb-6">
                <Car className="w-4 h-4" />
                Dla warsztatów i serwisów
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Klienci umawiają się online. Ty naprawiasz auta.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Zamiast odbierać telefony i zapisywać w zeszycie, masz wszystko w jednym miejscu. 
                Klient wybiera termin, Ty dostajesz powiadomienie.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-lg">
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
              <div className="bg-teal-100 rounded-2xl p-6">
                {/* Mockup */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">Wtorek, 18.02</span>
                    <span className="text-sm text-gray-500">Stanowisko 1</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '8:00', car: 'Audi A4 2.0 TDI', service: 'Wymiana oleju + filtry', client: 'Kowalski' },
                      { time: '9:30', car: 'VW Golf VII', service: 'Przegląd + hamulce', client: 'Nowak' },
                      { time: '12:00', car: 'BMW 320d', service: 'Diagnostyka', client: 'Wiśniewski' },
                    ].map((slot, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                        <span className="text-sm font-mono text-teal-600 w-12">{slot.time}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{slot.car}</p>
                          <p className="text-xs text-gray-500">{slot.service} • {slot.client}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 border-dashed rounded-lg">
                      <span className="text-sm font-mono text-teal-600 w-12">14:00</span>
                      <p className="text-sm text-green-700">+ Wolny termin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dla kogo */}
      <section className="py-16 border-y bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              'Warsztaty mechaniczne',
              'Serwisy opon',
              'Auto detailing',
              'Stacje diagnostyczne',
              'Lakiernie',
              'Elektromechanika',
              'Serwisy klimatyzacji',
              'Myjnie ręczne',
            ].map((item, i) => (
              <div key={i} className="text-gray-600 text-sm">{item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem i rozwiązanie */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-4">Bez systemu rezerwacji:</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Telefon dzwoni w trakcie naprawy
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Zapisujesz w zeszycie, potem nie możesz odczytać
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Klient zapomina o terminie, stanowisko stoi puste
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Po godzinach nikt nie może się umówić
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4">Z Rezerwacja24:</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Klienci umawiają się sami przez internet
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Wszystko w kalendarzu, na telefonie i komputerze
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  SMS przypomina dzień przed wizytą
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Rezerwacje 24/7, nawet jak śpisz
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Opinia */}
      <section className="py-16 bg-teal-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-teal-400 fill-teal-400" />)}
          </div>
          <blockquote className="text-xl text-gray-700 mb-6">
            "Prowadzę warsztat od 15 lat. Zawsze zapisywałem w kalendarzu papierowym. 
            Teraz wszystko mam w telefonie, klienci umawiają się sami, a ja mam spokój. 
            Żałuję tylko, że nie zacząłem wcześniej."
          </blockquote>
          <p className="font-medium text-gray-900">Marek Kowalczyk</p>
          <p className="text-sm text-gray-500">Auto Serwis MK, Kraków</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Sprawdź czy to coś dla Ciebie
          </h2>
          <p className="text-teal-400 mb-8">
            7 dni za darmo, bez podawania karty. Jak nie spodoba się - po prostu nie używasz dalej.
          </p>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-teal-100 text-teal-800 font-medium rounded-lg text-lg">
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
