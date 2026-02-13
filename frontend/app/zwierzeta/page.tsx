'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  CheckCircle,
  ArrowRight,
  Bell,
  Menu,
  X,
  Star,
  PawPrint
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function ZwierzetaLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    const isEu = hostname.includes('bookings24.eu')
    setAppUrl(isEu ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Rezerwacja24" width={180} height={54} className="h-9 w-auto" priority />
            </Link>
            <div className="hidden lg:flex items-center gap-4">
              <a href={`${appUrl}/login`} className="text-sm font-medium text-gray-600">Zaloguj się</a>
              <a href={`${appUrl}/register`} className="px-5 py-2.5 bg-teal-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm">
                Załóż konto
              </a>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-amber-700 rounded-full text-sm mb-6">
                <PawPrint className="w-4 h-4" />
                Dla usług dla zwierząt
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Właściciele umawiają pupile online. Ty zajmujesz się zwierzakami.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Koniec z telefonami w trakcie strzyżenia psa. Właściciele sami wybierają termin, 
                dostają przypomnienie, a Ty masz wszystko w kalendarzu.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-amber-600 text-white font-medium rounded-lg">
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
              <div className="bg-gradient-to-br from-teal-50 to-yellow-50 rounded-2xl p-6">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">Piątek, 21.02</span>
                    <span className="text-sm text-gray-500">Grooming</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '9:00', pet: 'Burek (golden)', service: 'Kąpiel + strzyżenie', owner: 'Kowalska' },
                      { time: '11:00', pet: 'Mruczek (pers)', service: 'Rozczesywanie', owner: 'Nowak' },
                      { time: '13:00', pet: 'Wolny termin', service: '', owner: '' },
                      { time: '15:00', pet: 'Luna (york)', service: 'Strzyżenie', owner: 'Wiśniewska' },
                    ].map((slot, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                        slot.pet === 'Wolny termin' ? 'bg-green-50 border border-green-200 border-dashed' : 'bg-teal-50'
                      }`}>
                        <span className="text-sm font-mono text-gray-600 w-12">{slot.time}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${slot.pet === 'Wolny termin' ? 'text-green-700' : 'text-gray-900'}`}>
                            {slot.pet}
                          </p>
                          {slot.service && <p className="text-xs text-gray-500">{slot.service}</p>}
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
            {['Groomerzy', 'Weterynarze', 'Petsitterzy', 'Hotele dla zwierząt', 'Szkolenie psów', 'Behawiorysci'].map((item, i) => (
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
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rezerwacje 24/7</h3>
              <p className="text-gray-600 text-sm">
                Właściciele mogą umówić pupila nawet wieczorem, kiedy Ty już nie pracujesz.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Przypomnienia SMS</h3>
              <p className="text-gray-600 text-sm">
                Dzień przed wizytą właściciel dostaje SMS. Mniej zapomnianych wizyt.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kartoteka zwierzaków</h3>
              <p className="text-gray-600 text-sm">
                Historia wizyt, notatki o zwierzaku, preferencje właściciela - wszystko w jednym miejscu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opinia */}
      <section className="py-16 bg-teal-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl text-white mb-6">
            "Prowadzę salon groomerski i ciągle miałam problem z telefonami w trakcie strzyżenia. 
            Teraz klienci umawiają się sami przez internet, a ja mam spokój i czyste ręce."
          </blockquote>
          <p className="font-medium text-white">Karolina Pawłowska</p>
          <p className="text-sm text-amber-100">Groomer, Poznań</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Sprawdź jak to działa
          </h2>
          <p className="text-gray-400 mb-8">
            7 dni za darmo, bez karty kredytowej.
          </p>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-amber-600 text-white font-medium rounded-lg text-lg">
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
