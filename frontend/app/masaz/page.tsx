'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, CheckCircle, ArrowRight, Bell, CreditCard, Star, Heart } from 'lucide-react'

export default function MasazPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop" alt="Gabinet masażu" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-900/40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/80 border border-emerald-400/30 rounded-full mb-6">
              <Heart className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-300 font-medium">Dla gabinetów masażu</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">System rezerwacji dla gabinetów masażu</h1>
            <p className="text-xl text-emerald-100 mb-8">Profesjonalne zarządzanie rezerwacjami dla masażystów, fizjoterapeutów i gabinetów odnowy biologicznej</p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">
                Wypróbuj za darmo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="https://demo.rezerwacja24.pl" target="_blank" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors">
                Zobacz demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '80%', label: 'mniej nieobecności' },
              { value: '3h', label: 'oszczędności dziennie' },
              { value: '24/7', label: 'rezerwacje online' },
              { value: '300+', label: 'gabinetów masażu' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-emerald-600 mb-1">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Dlaczego gabinety masażu wybierają Rezerwacja24?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: 'Kalendarz online', description: 'Klienci rezerwują masaże 24/7 przez internet' },
              { icon: Bell, title: 'Przypomnienia SMS', description: 'Automatyczne przypomnienia zmniejszają nieobecności' },
              { icon: CreditCard, title: 'Płatności online', description: 'Przedpłaty za masaże zwiększają pewność rezerwacji' },
              { icon: Users, title: 'Baza klientów', description: 'Historia masaży, preferencje i notatki' },
            ].map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="text-center p-6 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Wszystko czego potrzebuje gabinet masażu</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Rezerwacje online 24/7', 'Przypomnienia SMS', 'Kalendarz dla wielu masażystów', 'Płatności online',
                  'Pakiety masaży i karnety', 'Promocje i kupony', 'Google Calendar sync', 'Własna strona rezerwacji',
                  'Widget na stronę WWW', 'Analityka i raporty', 'CRM i baza klientów', 'Zgodność z RODO',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <Image src="/screenshots/dashboard-preview.png" alt="Dashboard" width={600} height={400} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-emerald-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}
          </div>
          <blockquote className="text-2xl text-white mb-8">"System jest prosty i intuicyjny. Moi klienci chwalą łatwość rezerwacji, a ja mam więcej czasu na masaże zamiast odbierania telefonów."</blockquote>
          <p className="font-bold text-white">Tomasz Kowalski</p>
          <p className="text-emerald-300">Właściciel gabinetu masażu</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Gotowy aby usprawnić swój gabinet?</h2>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-lg">
            Rozpocznij darmowy okres próbny <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-gray-500">7 dni za darmo • Bez karty kredytowej</p>
        </div>
      </section>
    </div>
  )
}
