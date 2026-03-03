'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search,
  Calendar,
  Users,
  CreditCard,
  Bell,
  Smartphone,
  Shield,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  PlayCircle,
  FileText,
  Zap,
  ChevronRight
} from 'lucide-react'

const popularTopics = [
  {
    icon: Calendar,
    title: 'Jak zarezerwować wizytę?',
    description: 'Krok po kroku przez proces rezerwacji online',
    link: '/support/rezerwacje'
  },
  {
    icon: Users,
    title: 'Zarządzanie kontem',
    description: 'Edycja profilu, zmiana hasła, ustawienia',
    link: '/support/konto-i-profil'
  },
  {
    icon: Bell,
    title: 'Powiadomienia i przypomnienia',
    description: 'SMS, e-mail i powiadomienia push',
    link: '/support/powiadomienia'
  },
  {
    icon: CreditCard,
    title: 'Płatności i zwroty',
    description: 'Metody płatności, faktury, polityka zwrotów',
    link: '/support/platnosci'
  }
]

const helpCategories = [
  {
    icon: BookOpen,
    title: 'Pierwsze kroki',
    description: 'Rozpocznij korzystanie z Rezerwacja24',
    articles: 3,
    color: 'from-teal-500 to-emerald-500',
    slug: 'pierwsze-kroki'
  },
  {
    icon: Calendar,
    title: 'Rezerwacje',
    description: 'Tworzenie, edycja i anulowanie wizyt',
    articles: 3,
    color: 'from-blue-500 to-indigo-500',
    slug: 'rezerwacje'
  },
  {
    icon: Users,
    title: 'Konto i profil',
    description: 'Zarządzanie danymi osobowymi',
    articles: 3,
    color: 'from-violet-500 to-purple-500',
    slug: 'konto-i-profil'
  },
  {
    icon: CreditCard,
    title: 'Płatności',
    description: 'Metody płatności i rozliczenia',
    articles: 3,
    color: 'from-amber-500 to-orange-500',
    slug: 'platnosci'
  },
  {
    icon: Bell,
    title: 'Powiadomienia',
    description: 'Ustawienia przypomnień',
    articles: 2,
    color: 'from-pink-500 to-rose-500',
    slug: 'powiadomienia'
  },
  {
    icon: Shield,
    title: 'Bezpieczeństwo',
    description: 'Prywatność i ochrona danych',
    articles: 2,
    color: 'from-slate-500 to-gray-600',
    slug: 'bezpieczenstwo'
  }
]

const quickGuides = [
  {
    title: 'Jak założyć konto klienta',
    duration: '2 min',
    type: 'article'
  },
  {
    title: 'Pierwsza rezerwacja - poradnik',
    duration: '3 min',
    type: 'video'
  },
  {
    title: 'Anulowanie i zmiana terminu',
    duration: '2 min',
    type: 'article'
  },
  {
    title: 'Dodawanie ulubionych firm',
    duration: '1 min',
    type: 'article'
  }
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png"
                alt="Rezerwacja24" 
                width={160} 
                height={45} 
                className="h-9 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/logowanie" 
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
              >
                Panel klienta
              </Link>
              <a 
                href="https://biz.rezerwacja24.pl" 
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Dla biznesu
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500" />
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6"
            >
              <HelpCircle className="w-4 h-4" />
              Centrum Pomocy
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              Jak możemy Ci pomóc?
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Znajdź odpowiedzi na pytania, poradniki krok po kroku i skontaktuj się z naszym zespołem wsparcia
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj artykułów, poradników..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl shadow-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all text-lg"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="text-white/80 text-sm">Popularne:</span>
                {['rezerwacja', 'anulowanie', 'płatność', 'konto'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-colors border border-white/20"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Najczęściej zadawane pytania
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTopics.map((topic, index) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={topic.link}
                className="block p-6 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/10 transition-all group"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                  <topic.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {topic.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Help Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Przeglądaj kategorie pomocy
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Wybierz kategorię, aby znaleźć szczegółowe artykuły i poradniki
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/support/${category.slug}`}
                  className="block p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 border border-transparent hover:border-gray-100 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <category.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors flex items-center gap-2">
                        {category.title}
                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {category.description}
                      </p>
                      <span className="text-xs text-teal-600 font-medium">
                        {category.articles} artykułów
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Szybkie poradniki
            </h2>
            <p className="text-gray-500">
              Naucz się podstaw w kilka minut
            </p>
          </div>
          <Link 
            href="/support/poradniki"
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            Zobacz wszystkie
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickGuides.map((guide, index) => (
            <motion.div
              key={guide.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  guide.type === 'video' ? 'bg-rose-50' : 'bg-blue-50'
                }`}>
                  {guide.type === 'video' ? (
                    <PlayCircle className="w-5 h-5 text-rose-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm group-hover:text-teal-600 transition-colors">
                    {guide.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{guide.duration}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* App Preview / Mockup Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 rounded-full text-teal-400 text-sm mb-6">
                <Smartphone className="w-4 h-4" />
                Aplikacja mobilna
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Rezerwuj z dowolnego miejsca
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Pobierz naszą aplikację mobilną i miej dostęp do wszystkich rezerwacji w kieszeni. Otrzymuj powiadomienia, zarządzaj wizytami i odkrywaj nowe miejsca.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Szybkie rezerwacje jednym kliknięciem',
                  'Powiadomienia push o nadchodzących wizytach',
                  'Historia wszystkich rezerwacji',
                  'Ulubione firmy i usługi'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4">
                <a href="#" className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                  <svg className="w-7 h-7 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500 leading-none">Pobierz z</div>
                    <div className="text-sm font-semibold text-gray-900">App Store</div>
                  </div>
                </a>
                <a href="#" className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 512 512">
                    <path fill="#4285F4" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
                    <path fill="#34A853" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/>
                    <path fill="#FBBC04" d="M473.3 256l-86.5-50-67.5 67.5 67.5 67.5 86.5-50c14.7-8.4 14.7-26.6 0-35z"/>
                    <path fill="#EA4335" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500 leading-none">Pobierz z</div>
                    <div className="text-sm font-semibold text-gray-900">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-black/50 border border-gray-700">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-teal-600 flex items-center justify-center">
                      <div className="w-24 h-6 bg-black rounded-full" />
                    </div>
                    
                    {/* App content mockup */}
                    <div className="pt-14 px-4">
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-teal-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-teal-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Twoje rezerwacje</h3>
                        <p className="text-gray-500 text-sm">Nadchodzące wizyty</p>
                      </div>
                      
                      {/* Booking cards */}
                      <div className="space-y-3 mt-4">
                        <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                              15
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Strzyżenie damskie</p>
                              <p className="text-xs text-gray-500">Salon Beauty • 14:00</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-bold">
                              22
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Masaż relaksacyjny</p>
                              <p className="text-xs text-gray-500">SPA Wellness • 16:30</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom nav mockup */}
                      <div className="absolute bottom-4 left-4 right-4 h-16 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-around px-6">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-5 h-5 text-teal-600" />
                          <span className="text-[10px] text-teal-600 mt-1">Rezerwacje</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Search className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] text-gray-400 mt-1">Szukaj</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Star className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] text-gray-400 mt-1">Ulubione</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] text-gray-400 mt-1">Profil</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Potrzebujesz więcej pomocy?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Nasz zespół wsparcia jest dostępny od poniedziałku do piątku w godzinach 9:00-17:00
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.a
            href="mailto:pomoc@rezerwacja24.pl"
            whileHover={{ y: -4 }}
            className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all text-center group"
          >
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 transition-colors">
              <Mail className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">E-mail</h3>
            <p className="text-teal-600 font-medium">pomoc@rezerwacja24.pl</p>
            <p className="text-sm text-gray-400 mt-2">Odpowiadamy w ciągu 24h</p>
          </motion.a>
          
          <motion.a
            href="tel:+48506785959"
            whileHover={{ y: -4 }}
            className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all text-center group"
          >
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 transition-colors">
              <Phone className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
            <p className="text-teal-600 font-medium">+48 506 785 959</p>
            <p className="text-sm text-gray-400 mt-2">Pon-Pt 9:00-17:00</p>
          </motion.a>
          
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all text-center group cursor-pointer"
            onClick={() => {
              // @ts-ignore
              if (window.smartsupp) window.smartsupp('chat:open')
            }}
          >
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 transition-colors">
              <MessageCircle className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Czat na żywo</h3>
            <p className="text-teal-600 font-medium">Rozpocznij rozmowę</p>
            <p className="text-sm text-gray-400 mt-2">Średni czas odpowiedzi: 2 min</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-1">98%</div>
              <div className="text-sm text-gray-500">Zadowolonych klientów</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-1">&lt;2h</div>
              <div className="text-sm text-gray-500">Średni czas odpowiedzi</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-1">50+</div>
              <div className="text-sm text-gray-500">Artykułów pomocy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-1">24/7</div>
              <div className="text-sm text-gray-500">Dostępność systemu</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png"
                alt="Rezerwacja24" 
                width={120} 
                height={35} 
                className="h-7 w-auto"
              />
              <span className="text-gray-400 text-sm">© 2024</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-teal-600 transition-colors">Prywatność</Link>
              <Link href="/terms" className="hover:text-teal-600 transition-colors">Regulamin</Link>
              <Link href="/contact" className="hover:text-teal-600 transition-colors">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
