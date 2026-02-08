'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, CheckCircle, ArrowRight, Bell, CreditCard, Star, Scissors } from 'lucide-react'

export default function BarberPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=800&fit=crop" alt="Barber Shop" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-900/40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-amber-400/30 rounded-full mb-6">
              <Scissors className="w-5 h-5 text-amber-300" />
              <span className="text-amber-300 font-medium">Dla Barber Shopów</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">System rezerwacji dla Barber Shop</h1>
            <p className="text-xl text-slate-200 mb-8">Profesjonalne zarządzanie rezerwacjami dla barberów i męskich salonów fryzjerskich</p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors">
                Wypróbuj za darmo <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '75%', label: 'mniej nieobecności' },
              { value: '2h', label: 'oszczędności dziennie' },
              { value: '24/7', label: 'rezerwacje online' },
              { value: '400+', label: 'barber shopów' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-amber-600 mb-1">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Dlaczego barberzy wybierają Rezerwacja24?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: 'Kalendarz online', description: 'Klienci rezerwują strzyżenie 24/7' },
              { icon: Bell, title: 'Przypomnienia SMS', description: 'Automatyczne przypomnienia o wizytach' },
              { icon: CreditCard, title: 'Płatności online', description: 'Przedpłaty zmniejszają no-shows' },
              { icon: Users, title: 'Baza klientów', description: 'Historia strzyżeń i preferencje' },
            ].map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="text-center p-6 bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Funkcje dla Barber Shop</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Rezerwacje online 24/7', 'Przypomnienia SMS', 'Wielu barberów', 'Płatności online',
                  'Pakiety usług', 'Karnety', 'Google Calendar', 'Własna strona',
                  'Widget na WWW', 'Raporty', 'CRM klientów', 'RODO',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <Image src="/screenshots/dashboard-preview.png" alt="Dashboard" width={600} height={400} className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}
          </div>
          <blockquote className="text-2xl text-white mb-8">"Moi klienci uwielbiają możliwość rezerwacji przez telefon. System jest prosty i działa bez zarzutu."</blockquote>
          <p className="font-bold text-white">Marcin Barber</p>
          <p className="text-amber-300">Właściciel The Gentleman's Barber</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Gotowy aby usprawnić swój barber shop?</h2>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-lg">
            Rozpocznij darmowy okres próbny <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-gray-500">7 dni za darmo • Bez karty kredytowej</p>
        </div>
      </section>
    </div>
  )
}
