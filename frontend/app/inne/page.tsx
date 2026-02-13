'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, ArrowRight, Menu, X, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function InneLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    setAppUrl(hostname.includes('bookings24.eu') ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/"><Image src="/logo.png" alt="Rezerwacja24" width={180} height={54} className="h-9 w-auto" priority /></Link>
            <div className="hidden lg:flex items-center gap-4">
              <a href={`${appUrl}/login`} className="text-sm font-medium text-gray-600">Zaloguj się</a>
              <a href={`${appUrl}/register`} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm">Załóż konto</a>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Dla każdej branży usługowej
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Nie widzisz swojej branży? To nic.
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Nasz system jest uniwersalny. Jeśli przyjmujesz klientów na wizyty - 
              nieważne czy jesteś tatuażystą, astrologiem czy serwisantem rowerów - 
              Rezerwacja24 jest dla Ciebie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg">
                Wypróbuj za darmo <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/branze" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400">
                Zobacz wszystkie branże
              </Link>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 justify-center">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 7 dni za darmo</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Bez prowizji</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Używają nas m.in.:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              'Tatuażyści', 'Serwisy rowerowe', 'Astrolodzy', 'Wróżki',
              'Tłumacze', 'Graficy', 'Copywriterzy', 'Projektanci',
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 text-center border">
                <span className="text-gray-600 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl text-white mb-6">
            "Prowadzę studio tatuażu i myślałem, że systemy rezerwacji są tylko dla salonów beauty. 
            Okazało się, że Rezerwacja24 świetnie działa też u mnie. Klienci umawiają się sami."
          </blockquote>
          <p className="font-medium text-white">Jakub Czarny</p>
          <p className="text-sm text-teal-100">Studio tatuażu, Wrocław</p>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Sprawdź czy to coś dla Ciebie</h2>
          <p className="text-gray-400 mb-8">7 dni za darmo. Bez karty kredytowej. Bez zobowiązań.</p>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-lg">
            Załóż darmowe konto <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

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
