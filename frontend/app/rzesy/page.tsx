'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, CheckCircle, ArrowRight, Bell, CreditCard, Star, Eye } from 'lucide-react'

export default function RzesyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=800&fit=crop" alt="Stylizacja rzęs" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/80 via-purple-900/60 to-purple-900/40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/80 border border-purple-400/30 rounded-full mb-6">
              <Eye className="w-5 h-5 text-purple-300" />
              <span className="text-purple-300 font-medium">Dla stylistek rzęs</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">System rezerwacji dla stylizacji rzęs</h1>
            <p className="text-xl text-purple-100 mb-8">Profesjonalne zarządzanie rezerwacjami dla stylistek rzęs i brwi</p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
                Wypróbuj za darmo <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div><p className="text-4xl font-bold text-purple-600 mb-1">85%</p><p className="text-gray-500">mniej nieobecności</p></div>
            <div><p className="text-4xl font-bold text-purple-600 mb-1">2h</p><p className="text-gray-500">oszczędności dziennie</p></div>
            <div><p className="text-4xl font-bold text-purple-600 mb-1">24/7</p><p className="text-gray-500">rezerwacje online</p></div>
            <div><p className="text-4xl font-bold text-purple-600 mb-1">350+</p><p className="text-gray-500">stylistek rzęs</p></div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Dlaczego stylistki rzęs wybierają Rezerwacja24?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: 'Kalendarz online', desc: 'Klientki rezerwują zabiegi 24/7' },
              { icon: Bell, title: 'Przypomnienia SMS', desc: 'Automatyczne przypomnienia' },
              { icon: CreditCard, title: 'Płatności online', desc: 'Przedpłaty za zabiegi' },
              { icon: Users, title: 'Baza klientek', desc: 'Historia zabiegów i preferencje' },
            ].map((b, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-2xl border hover:border-purple-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><b.icon className="w-7 h-7 text-purple-600" /></div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-purple-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}</div>
          <blockquote className="text-2xl text-white mb-8">"Moje klientki uwielbiają możliwość rezerwacji online. System jest prosty i piękny!"</blockquote>
          <p className="font-bold text-white">Karolina Lash</p>
          <p className="text-purple-300">Właścicielka Lash Studio</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Gotowa aby usprawnić swoje studio?</h2>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-lg">
            Rozpocznij za darmo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
