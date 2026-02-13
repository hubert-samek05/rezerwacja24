'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Users,
  CreditCard,
  Bell,
  BarChart3,
  Globe,
  Smartphone,
  Shield,
  Gift,
  Package,
  Ticket,
  RefreshCcw,
  ArrowRight,
  Zap,
  Clock,
} from 'lucide-react'
import MainNavigation from '@/components/MainNavigation'

const features = [
  {
    id: 'kalendarz',
    icon: Calendar,
    title: 'Kalendarz rezerwacji',
    description: 'Zarządzaj wizytami w jednym miejscu',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop',
    stat: '5h oszczędności/tydzień',
  },
  {
    id: 'crm',
    icon: Users,
    title: 'Baza klientów',
    description: 'Historia wizyt i preferencje',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    stat: '+40% powrotów',
  },
  {
    id: 'platnosci',
    icon: CreditCard,
    title: 'Płatności online',
    description: 'Stripe, Przelewy24, PayU',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    stat: '-80% nieobecności',
  },
  {
    id: 'powiadomienia',
    icon: Bell,
    title: 'Powiadomienia SMS',
    description: 'Automatyczne przypomnienia',
    image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&h=300&fit=crop',
    stat: '99% dostarczalności',
  },
  {
    id: 'analityka',
    icon: BarChart3,
    title: 'Raporty i statystyki',
    description: 'Decyzje oparte na danych',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    stat: '+25% przychodów',
  },
  {
    id: 'strona-rezerwacji',
    icon: Globe,
    title: 'Strona rezerwacji',
    description: 'Własna subdomena 24/7',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    stat: '24/7 dostępność',
  },
  {
    id: 'widget',
    icon: Smartphone,
    title: 'Widget WWW',
    description: 'Rezerwacje na Twojej stronie',
    image: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=400&h=300&fit=crop',
    stat: '+20% konwersji',
  },
  {
    id: 'google-calendar',
    icon: RefreshCcw,
    title: 'Google Calendar',
    description: 'Dwukierunkowa synchronizacja',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
    stat: '0 konfliktów',
  },
  {
    id: 'promocje',
    icon: Gift,
    title: 'Promocje i kupony',
    description: 'Kody rabatowe i oferty',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop',
    stat: '+35% nowych klientów',
  },
  {
    id: 'pakiety',
    icon: Package,
    title: 'Pakiety usług',
    description: 'Zestawy w lepszej cenie',
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=300&fit=crop',
    stat: '+45% wartości',
  },
  {
    id: 'karnety',
    icon: Ticket,
    title: 'Karnety',
    description: 'Stały przychód i lojalność',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    stat: '+60% retencji',
  },
  {
    id: 'bezpieczenstwo',
    icon: Shield,
    title: 'Bezpieczeństwo',
    description: 'RODO, 2FA, szyfrowanie',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop',
    stat: '100% zgodności',
  },
]

// Podziel funkcje na dwa rzędy dla carousel
const row1 = features.slice(0, 6)
const row2 = features.slice(6, 12)

export default function FunkcjePage() {
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    setAppUrl(hostname.includes('bookings24.eu') ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - identyczna jak na stronie głównej */}
      <MainNavigation />

      {/* Hero - elegancki, minimalistyczny */}
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-5">
                Funkcje systemu
              </h1>
              
              <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-6 sm:mb-8">
                Wszystko czego potrzebujesz do zarządzania rezerwacjami. 
                Kliknij w funkcję, aby poznać szczegóły.
              </p>
              
              <a 
                href={`${appUrl}/register`} 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
              >
                Wypróbuj za darmo
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infinite Carousel - jak na stronie głównej */}
      <section id="funkcje" className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full mb-4">
              Pełna lista funkcji
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              Poznaj wszystkie możliwości
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Kliknij w dowolną funkcję, aby dowiedzieć się więcej
            </p>
          </div>
          
          {/* Infinite Carousel */}
          <div className="relative">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            {/* Row 1 - scroll left */}
            <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6 animate-scroll-left">
              {[...row1, ...row1].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <Link
                    key={i}
                    href={`/funkcje/${feature.id}`}
                    className="flex-shrink-0 w-56 sm:w-72 group"
                  >
                    <div className="relative h-36 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-700">
                          {feature.stat.split(' ')[0]}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-white">{feature.title}</h3>
                            <p className="text-xs text-white/70 hidden sm:block">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            
            {/* Row 2 - scroll right */}
            <div className="flex gap-4 sm:gap-6 animate-scroll-right">
              {[...row2, ...row2].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <Link
                    key={i}
                    href={`/funkcje/${feature.id}`}
                    className="flex-shrink-0 w-56 sm:w-72 group"
                  >
                    <div className="relative h-36 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-700">
                          {feature.stat.split(' ')[0]}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-white">{feature.title}</h3>
                            <p className="text-xs text-white/70 hidden sm:block">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* CTA pod carousel */}
          <div className="text-center mt-10 sm:mt-14">
            <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
              Wszystkie funkcje dostępne w każdym planie. Bez ukrytych kosztów.
            </p>
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
            >
              Wypróbuj za darmo
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid - interaktywny, kreatywny */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Wszystkie funkcje w jednym miejscu
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Najedź na funkcję, aby zobaczyć więcej
            </p>
          </div>
          
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              const isLarge = i === 0 || i === 5 // Kalendarz i Strona rezerwacji większe
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className={isLarge ? 'col-span-2 row-span-2' : ''}
                >
                  <Link
                    href={`/funkcje/${feature.id}`}
                    className={`group relative block h-full overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:border-teal-400 hover:shadow-2xl transition-all duration-300 ${isLarge ? 'min-h-[200px] sm:min-h-[280px]' : 'min-h-[120px] sm:min-h-[140px]'}`}
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Content */}
                    <div className="relative h-full p-4 sm:p-5 flex flex-col">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-300 ${isLarge ? 'bg-teal-100 group-hover:bg-white/20' : 'bg-gray-100 group-hover:bg-white/20'}`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${isLarge ? 'text-teal-600' : 'text-gray-600'} group-hover:text-white`} />
                      </div>
                      
                      <h3 className={`font-bold mb-1 transition-colors duration-300 group-hover:text-white ${isLarge ? 'text-lg sm:text-xl text-gray-900' : 'text-sm sm:text-base text-gray-900'}`}>
                        {feature.title}
                      </h3>
                      
                      {isLarge && (
                        <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors duration-300 mb-3">
                          {feature.description}
                        </p>
                      )}
                      
                      <div className="mt-auto">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold transition-colors duration-300 ${isLarge ? 'bg-teal-100 text-teal-700 group-hover:bg-white/20 group-hover:text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-white/20 group-hover:text-white'}`}>
                          {feature.stat.split(' ')[0]}
                        </span>
                      </div>
                      
                      {/* Arrow on hover */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '5000+', label: 'firm korzysta', icon: Users },
              { value: '500k+', label: 'rezerwacji/mies.', icon: Calendar },
              { value: '99.9%', label: 'dostępności', icon: Zap },
              { value: '24/7', label: 'wsparcie', icon: Clock },
            ].map((stat, i) => {
              const StatIcon = stat.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <StatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Gotowy, żeby zacząć?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Dołącz do tysięcy firm, które już korzystają z Rezerwacja24. 
            Wypróbuj wszystkie funkcje za darmo przez 7 dni.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-base sm:text-lg shadow-lg shadow-teal-600/20"
            >
              Załóż darmowe konto
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base sm:text-lg"
            >
              Porozmawiaj z nami
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <Link href="/">
              <Image src="/logo-white.png" alt="Rezerwacja24" width={150} height={45} className="h-8 sm:h-10 w-auto" />
            </Link>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Prywatność</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Regulamin</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link>
              <Link href="/help" className="hover:text-white transition-colors">Pomoc</Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800 text-center text-xs sm:text-sm text-slate-500">
            © {new Date().getFullYear()} Rezerwacja24. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  )
}
