'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, ArrowRight, Bell, Star, MessageCircle, Video } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function KonsultacjeLandingPage() {
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    setAppUrl(hostname.includes('bookings24.eu') ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - identyczna jak na stronie głównej */}
      <MainNavigation />

      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm mb-6">
                <MessageCircle className="w-4 h-4" />
                Dla konsultantów i coachów
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Klienci umawiają konsultacje. Ty pomagasz.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Zamiast pisać maile w tę i z powrotem o terminie, wysyłasz link. 
                Klient wybiera kiedy może, Ty dostajesz powiadomienie.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg">
                  Wypróbuj za darmo <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 7 dni za darmo</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Bez prowizji</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-purple-50 rounded-2xl p-6">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">Poniedziałek, 24.02</span>
                </div>
                <div className="space-y-2">
                  {[
                    { time: '10:00', client: 'Anna M.', type: 'Coaching kariery', mode: 'Online' },
                    { time: '12:00', client: 'Piotr K.', type: 'Konsultacja biznesowa', mode: 'Stacjonarnie' },
                    { time: '14:00', client: 'Wolny termin', type: '', mode: '' },
                    { time: '16:00', client: 'Marta W.', type: 'Mentoring', mode: 'Online' },
                  ].map((slot, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${slot.client === 'Wolny termin' ? 'bg-green-50 border border-green-200 border-dashed' : 'bg-teal-50'}`}>
                      <span className="text-sm font-mono text-gray-600 w-12">{slot.time}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${slot.client === 'Wolny termin' ? 'text-green-700' : 'text-gray-900'}`}>{slot.client}</p>
                        {slot.type && <p className="text-xs text-gray-500">{slot.type}</p>}
                      </div>
                      {slot.mode === 'Online' && <Video className="w-4 h-4 text-teal-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-gray-600">
            {['Coachowie', 'Mentorzy', 'Konsultanci biznesowi', 'Doradcy finansowi', 'Psycholodzy', 'Terapeuci'].map((item, i) => (
              <span key={i} className="text-sm">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl text-white mb-6">
            "Jako coach ciągle miałem problem z umawianiem klientów. Teraz wysyłam link 
            i klient sam wybiera termin. Oszczędzam godziny tygodniowo na mailach."
          </blockquote>
          <p className="font-medium text-white">Michał Adamski</p>
          <p className="text-sm text-teal-100">Business Coach</p>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Sprawdź jak to działa</h2>
          <p className="text-gray-400 mb-8">7 dni za darmo. Bez karty kredytowej.</p>
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
