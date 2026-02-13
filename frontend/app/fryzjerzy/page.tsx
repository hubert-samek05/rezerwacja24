'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Globe,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Bell,
  CreditCard,
  Clock,
  Star,
  Zap,
  Shield,
  Package,
  Gift,
  RefreshCcw,
  Facebook,
  Instagram,
  Scissors,
  User,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainNavigation from '@/components/MainNavigation'

export default function FryzjerzyLandingPage() {
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    const isEu = hostname.includes('bookings24.eu')
    setAppUrl(isEu ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  // Kolory dla fryzjerów - teal (spójne z resztą strony)
  const colors = {
    primary: 'teal',
    gradient: 'from-teal-950/60 via-teal-900/40 to-teal-900/20',
    gradientMobile: 'from-gray-900/70 via-teal-900/50 to-teal-900/40',
    badge: 'bg-teal-900/80 border-teal-400/30',
    badgeText: 'text-teal-300',
    highlight: 'text-teal-300',
    button: 'bg-teal-600 hover:bg-teal-700',
    buttonText: 'text-teal-900',
    accent: 'text-teal-600',
    accentBg: 'bg-teal-100',
    accentHover: 'hover:text-teal-700',
    border: 'border-teal-100 hover:border-teal-300',
    testimonialBg: 'bg-teal-900',
    testimonialCard: 'bg-teal-800/80 border-teal-700/50',
    ctaBg: 'bg-teal-900',
    statColor: 'text-teal-600',
    checkColor: 'text-teal-400',
    sectionBg: 'from-teal-50 to-white',
  }
  
  return (
    <div className="min-h-screen">
      <MainNavigation />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2074&q=80')" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-teal-900/80 to-teal-900/60"></div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-28 sm:pb-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center sm:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800/80 backdrop-blur-sm border border-teal-400/30 rounded-full mb-6">
                <Scissors className="w-4 h-4 text-indigo-300" />
                <span className="text-sm text-white font-medium">System rezerwacji dla fryzjerów</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-5 sm:mb-6">
                Twój salon fryzjerski
                <span className="block text-indigo-300 mt-1 sm:mt-2">zawsze pełny klientów</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto sm:mx-0">
                Rezerwacje online 24/7 dla salonów fryzjerskich i barber shopów. 
                Klienci umawiają się sami, Ty skupiasz się na strzyżeniu.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <a 
                  href={`${appUrl}/register`} 
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-teal-900 font-semibold rounded-lg hover:bg-teal-50 transition-colors text-base sm:text-lg"
                >
                  Załóż konto za darmo
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link 
                  href="#funkcje" 
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-white font-medium rounded-lg border-2 border-white/30 hover:bg-white/10 transition-colors text-base sm:text-lg"
                >
                  Zobacz funkcje
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-sm sm:text-base text-white/70 justify-center sm:justify-start">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span>7 dni za darmo</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span>Bez karty kredytowej</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span>0% prowizji</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 hidden sm:block">
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-16">
            {[
              { value: '300+', label: 'salonów fryzjerskich' },
              { value: '40k+', label: 'rezerwacji' },
              { value: '99.9%', label: 'dostępności' },
              { value: '24/7', label: 'rezerwacje online' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-600">{stat.value}</span>
                <span className="text-sm sm:text-base text-gray-500 max-w-[80px] leading-tight">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dla kogo */}
      <section className="py-24 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              Dla fryzjerów
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Idealny dla Twojego salonu
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Niezależnie czy prowadzisz salon fryzjerski, barber shop czy studio stylizacji - nasz system jest stworzony dla Ciebie.
            </p>
          </div>
          
          {/* Industries grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Scissors, name: 'Salony fryzjerskie' },
              { icon: User, name: 'Barber shopy' },
              { icon: Sparkles, name: 'Stylizacja włosów' },
              { icon: Star, name: 'Koloryzacja' },
              { icon: Users, name: 'Salony męskie' },
              { icon: Sparkles, name: 'Salony damskie' },
              { icon: User, name: 'Fryzjerzy mobilni' },
              { icon: Star, name: 'I wiele innych...' },
            ].map((industry, i) => {
              const IconComponent = industry.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-teal-100 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{industry.name}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funkcje" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
                Funkcje dla fryzjerów
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Wszystko czego potrzebuje Twój salon
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Kompleksowy system rezerwacji stworzony z myślą o fryzjerach.
              </p>
              <ul className="space-y-3">
                {[
                  'Rezerwacje online 24/7 - klienci umawiają się sami',
                  'Automatyczne przypomnienia SMS i email',
                  'Kalendarz dla wielu fryzjerów',
                  'Własna strona rezerwacyjna z Twoim logo',
                  'Baza klientów z historią wizyt',
                  'Raporty i statystyki przychodów',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-indigo-300/20 rounded-3xl blur-2xl"></div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 lg:translate-x-12">
                  <Image
                    src="/screenshots/dashboard-preview.png"
                    alt="Panel zarządzania salonem fryzjerskim"
                    width={1536}
                    height={1024}
                    className="w-full h-auto"
                    quality={90}
                    priority
                  />
                  <div className="hidden lg:block absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent"></div>
                </div>
                
                <div className="absolute -bottom-4 left-4 lg:-left-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Szybki dostęp</p>
                      <p className="text-xs text-gray-500">do wszystkich funkcji</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Calendar, title: 'Kalendarz online', description: 'Przejrzysty kalendarz z widokiem dnia, tygodnia i miesiąca. Zarządzaj wizytami jednym kliknięciem.' },
              { icon: Bell, title: 'Przypomnienia SMS', description: 'Automatyczne przypomnienia o wizytach. Zmniejsz liczbę nieobecności nawet o 70%.' },
              { icon: Users, title: 'Baza klientów', description: 'Pełna historia wizyt, preferencje i notatki. Buduj relacje z klientami.' },
              { icon: Globe, title: 'Własna strona', description: 'Profesjonalna strona rezerwacyjna z Twoim logo i kolorami. Bez dodatkowych kosztów.' },
              { icon: BarChart3, title: 'Raporty i analityka', description: 'Śledź przychody, popularność usług i efektywność pracowników.' },
              { icon: CreditCard, title: 'Płatności online', description: 'Przyjmuj przedpłaty i płatności online. Bezpiecznie i wygodnie.' },
              { icon: Package, title: 'Pakiety usług', description: 'Twórz pakiety i karnety. Zwiększ lojalność klientów.' },
              { icon: Gift, title: 'Promocje i rabaty', description: 'Twórz promocje sezonowe i rabaty dla stałych klientów.' },
              { icon: Shield, title: 'Bezpieczeństwo', description: 'Dane Twoich klientów są bezpieczne. Zgodność z RODO.' },
            ].map((feature: any, i) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="group p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 hover:border-indigo-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 bg-teal-100 group-hover:bg-teal-600">
                      <IconComponent className="w-6 h-6 transition-colors duration-300 text-teal-700 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-14 text-center">
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-600/20"
            >
              Wypróbuj wszystkie funkcje za darmo
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              Korzyści
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Co zyskasz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Więcej czasu na klientów, mniej na administrację
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Oszczędność czasu',
                description: 'Koniec z odbieraniem telefonów i ręcznym zapisywaniem wizyt. Klienci umawiają się sami.',
                stat: '5h',
                statLabel: 'tygodniowo'
              },
              {
                icon: Users,
                title: 'Więcej klientów',
                description: 'Klienci mogą rezerwować o każdej porze - nawet w nocy. Nie tracisz rezerwacji.',
                stat: '+30%',
                statLabel: 'rezerwacji'
              },
              {
                icon: Bell,
                title: 'Mniej nieobecności',
                description: 'Automatyczne przypomnienia SMS zmniejszają liczbę nieobecności.',
                stat: '-70%',
                statLabel: 'nieobecności'
              },
              {
                icon: Globe,
                title: 'Dostępność 24/7',
                description: 'Twoi klienci mogą rezerwować z telefonu, tabletu lub komputera - kiedy chcą.',
                stat: '24/7',
                statLabel: 'online'
              },
              {
                icon: BarChart3,
                title: 'Pełna kontrola',
                description: 'Zarządzaj kalendarzem, klientami i przychodami z jednego miejsca.',
                stat: '100%',
                statLabel: 'kontroli'
              },
              {
                icon: Star,
                title: 'Profesjonalny wizerunek',
                description: 'Własna strona rezerwacyjna z Twoim logo. Wyróżnij się na tle konkurencji.',
                stat: 'PRO',
                statLabel: 'wizerunek'
              },
            ].map((benefit, i) => {
              const IconComponent = benefit.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 group-hover:bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-teal-700 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1.5">{benefit.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-3">{benefit.description}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-teal-600">{benefit.stat}</span>
                        <span className="text-xs text-gray-400">{benefit.statLabel}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="jak-to-dziala" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              Jak to działa
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Zacznij w 3 prostych krokach
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Konfiguracja zajmuje tylko kilka minut
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {[
              {
                num: '1',
                title: 'Załóż konto',
                description: 'Zarejestruj się za darmo i dodaj swoje usługi oraz fryzjerów.',
                details: ['Rejestracja w 2 minuty', 'Dodaj usługi i ceny', 'Ustaw godziny pracy']
              },
              {
                num: '2',
                title: 'Udostępnij link',
                description: 'Podziel się linkiem do rezerwacji z klientami - na stronie, w social media.',
                details: ['Własna strona rezerwacji', 'Widget na Twoją stronę', 'Link do social media']
              },
              {
                num: '3',
                title: 'Przyjmuj rezerwacje',
                description: 'Klienci rezerwują online, Ty dostajesz powiadomienia i zarządzasz kalendarzem.',
                details: ['Powiadomienia email i SMS', 'Automatyczne przypomnienia', 'Synchronizacja z Google Calendar']
              },
            ].map((step, i) => {
              const StepIcon = i === 0 ? Users : i === 1 ? Globe : Zap
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent z-0" style={{width: 'calc(100% - 8rem)', left: 'calc(50% + 4rem)'}}></div>
                  )}
                  
                  <div className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                    <div className="absolute -top-4 left-8 px-3 py-1 bg-teal-600 text-white text-sm font-bold rounded-full">
                      Krok {step.num}
                    </div>
                    
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 mt-2">
                      <StepIcon className="w-8 h-8 text-teal-700" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          <div className="text-center mt-16">
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-teal-600/20"
            >
              Zacznij teraz - za darmo
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="mt-4 text-gray-500">7 dni za darmo, bez karty kredytowej</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Co mówią właściciele salonów?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Od kiedy mam Rezerwacja24, nie muszę odbierać telefonów w trakcie strzyżenia. Klienci umawiają się sami, a ja mam spokój.',
                author: 'Marcin Kowalski',
                role: 'Barber Shop "Gentleman"'
              },
              {
                quote: 'Przypomnienia SMS to strzał w dziesiątkę! Praktycznie nie mam już nieobecności. Polecam każdemu salonowi.',
                author: 'Anna Nowak',
                role: 'Salon fryzjerski "Style"'
              },
              {
                quote: 'Profesjonalna strona rezerwacji z moim logo robi wrażenie na klientach. Czuję się jak duża firma!',
                author: 'Piotr Wiśniewski',
                role: 'Salon męski "Classic Cut"'
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-teal-800/80 backdrop-blur rounded-2xl p-8 border border-teal-700/50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-teal-400 fill-teal-400" />
                  ))}
                </div>
                <p className="text-white/90 text-lg mb-6">"{item.quote}"</p>
                <div>
                  <p className="font-bold text-white">{item.author}</p>
                  <p className="text-indigo-300">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="cennik" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              Cennik
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Wybierz plan dla swojego salonu
            </h2>
            <p className="text-xl text-gray-600">
              7 dni za darmo. Bez karty kredytowej. Anuluj kiedy chcesz.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Starter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Starter</h3>
                <p className="text-sm text-gray-500 mb-4">Dla początkujących salonów</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">12,99</span>
                  <span className="text-gray-500">zł/mies.</span>
                </div>
                <p className="text-sm text-teal-600 mt-2 font-medium">7 dni za darmo</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">100 rezerwacji miesięcznie</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">1 fryzjer</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">Własna strona rezerwacji</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">Kalendarz online</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">0% prowizji</span>
                </div>
              </div>
              
              <a 
                href={`${appUrl}/register?plan=starter`}
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl text-center transition-colors"
              >
                Rozpocznij za darmo
              </a>
            </div>

            {/* Standard - Highlighted */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-2 border-teal-500 relative transform md:scale-105 z-10">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-teal-600 text-white text-sm font-bold rounded-full">
                  Najpopularniejszy
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Standard</h3>
                <p className="text-sm text-gray-500 mb-4">Dla rozwijających się salonów</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-teal-600">29,99</span>
                  <span className="text-gray-500">zł/mies.</span>
                </div>
                <p className="text-sm text-teal-600 mt-2 font-medium">7 dni za darmo</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Bez limitu rezerwacji</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">Do 5 fryzjerów</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">100 SMS miesięcznie</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">Analityka i raporty</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">CRM - baza klientów</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">0% prowizji</span>
                </div>
              </div>
              
              <a 
                href={`${appUrl}/register?plan=professional`}
                className="block w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-center transition-colors"
              >
                Rozpocznij za darmo
              </a>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 rounded-2xl shadow-lg p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                <p className="text-sm text-gray-400 mb-4">Dla dużych salonów</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">79,99</span>
                  <span className="text-gray-400">zł/mies.</span>
                </div>
                <p className="text-sm text-teal-400 mt-2 font-medium">7 dni za darmo</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-white font-medium">Bez limitu rezerwacji</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-white font-medium">Bez limitu fryzjerów</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">500 SMS miesięcznie</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">Zaawansowana analityka</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">Priorytetowe wsparcie</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-white font-medium">0% prowizji</span>
                </div>
              </div>
              
              <a 
                href={`${appUrl}/register?plan=business`}
                className="block w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl text-center transition-colors"
              >
                Rozpocznij za darmo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Gotowy na więcej klientów?
          </h2>
          <p className="text-xl text-indigo-200 mb-10">
            Dołącz do setek salonów fryzjerskich, które już korzystają z Rezerwacja24
          </p>
          <a 
            href={`${appUrl}/register`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-teal-900 font-bold rounded-xl text-xl hover:bg-teal-50 transition-colors"
          >
            Załóż konto za darmo
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-bold text-white mb-3">Rezerwacja24</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                System rezerwacji online dla salonów fryzjerskich i barber shopów.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Produkt</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#funkcje" className="hover:text-white transition-colors">Funkcje</Link></li>
                <li><Link href="#jak-to-dziala" className="hover:text-white transition-colors">Jak to działa</Link></li>
                <li><Link href="#cennik" className="hover:text-white transition-colors">Cennik</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Branże</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/fryzjerzy" className="hover:text-white transition-colors">Salony fryzjerskie</Link></li>
                <li><Link href="/beauty" className="hover:text-white transition-colors">Salony kosmetyczne</Link></li>
                <li><Link href="/lekarze" className="hover:text-white transition-colors">Gabinety lekarskie</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Firma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Polityka prywatności</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Regulamin</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2026 Rezerwacja24 - System rezerwacji dla salonów fryzjerskich</p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61583476963744" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-teal-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/rezerwacja24" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-teal-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
