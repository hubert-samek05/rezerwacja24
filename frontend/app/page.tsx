'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Globe,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Bell,
  CreditCard,
  Menu,
  X,
  Clock,
  Star,
  Zap,
  Shield,
  Package,
  Ticket,
  Gift,
  UsersRound,
  Code,
  Lock,
  Palette,
  RefreshCcw,
  Layers,
  Facebook,
  Linkedin,
  Instagram,
  ShieldCheck,
  Server,
  BadgeCheck,
  Eye,
  Minus,
  Sparkles,
  Check,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Sparkle,
  Heart,
  Dumbbell,
  Car,
  User,
  Smartphone,
  Stethoscope,
  GraduationCap,
  PawPrint,
  Home,
  UtensilsCrossed
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import MegaMenu from '@/components/MegaMenu'
import { useLocale } from '@/hooks/useLocale'
import enLanding from '@/locales/en/landing.json'
import deLanding from '@/locales/de/landing.json'
import plLanding from '@/locales/pl/landing.json'
import type { Locale } from '@/hooks/useLocale'

// Landing translations - fallback to English for languages without full translations
const landingTranslations: Record<Locale, typeof enLanding> = {
  en: enLanding,
  de: deLanding,
  pl: plLanding,
  fr: enLanding,
  it: enLanding,
  nl: enLanding,
  es: enLanding,
  sk: enLanding,
  hr: enLanding,
  cs: enLanding,
}

export default function HomePage() {
  const { locale, isInitialized } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState<string | null>(null)
  
  // Stan domeny - domyślnie true (EU) bo ta strona jest dla bookings24.eu
  // Na rezerwacja24.pl middleware przekierowuje do polskiej wersji
  const [isEuDomain, setIsEuDomain] = useState(true)
  const [appUrl, setAppUrl] = useState('https://app.bookings24.eu')
  
  // Wybierz tłumaczenia na podstawie locale (domyślnie polski dla SEO)
  const t = landingTranslations[locale] || plLanding
  
  // Upewnij się że domena jest wykryta po hydration
  useEffect(() => {
    const isEu = window.location.hostname.includes('bookings24.eu')
    setIsEuDomain(isEu)
    setAppUrl(isEu ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="min-h-screen">
      {/* Navigation - biały, prosty, elegancki */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png"
                alt="Rezerwacja24" 
                width={200} 
                height={60} 
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </Link>
            
            {/* Mega Menu */}
            <MegaMenu locale={locale} />
            
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher variant="compact" />
              <a href={`${appUrl}/login`} className="text-sm font-medium text-gray-600 hover:text-teal-800 transition-colors">
                {t.nav.login}
              </a>
              <a href={`${appUrl}/register`} className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-lg transition-colors text-sm">
                {t.nav.tryFree}
              </a>
            </div>
            
            {/* Mobile menu button - prosty */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/20"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[90vw] bg-white shadow-2xl"
              >
                {/* Close button */}
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {/* Content */}
                <div className="pt-20 px-5 pb-8 overflow-y-auto max-h-[calc(100vh-80px)]">
                  {/* Navigation */}
                  <nav className="space-y-1">
                    {/* Funkcje - rozwijane */}
                    <div>
                      <button 
                        onClick={() => setMobileMenuExpanded(mobileMenuExpanded === 'funkcje' ? null : 'funkcje')}
                        className="w-full flex items-center justify-between py-3 px-4 text-base text-gray-800 hover:bg-gray-50 font-semibold rounded-xl transition-colors"
                      >
                        <span>{locale === 'pl' ? 'Funkcje' : 'Features'}</span>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${mobileMenuExpanded === 'funkcje' ? 'rotate-90' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileMenuExpanded === 'funkcje' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="py-2 space-y-1">
                              {[
                                { href: '/funkcje/kalendarz', label: locale === 'pl' ? 'Kalendarz rezerwacji' : 'Booking Calendar', icon: Calendar, color: 'from-teal-500 to-emerald-500' },
                                { href: '/funkcje/crm', label: locale === 'pl' ? 'CRM i baza klientów' : 'CRM & Clients', icon: Users, color: 'from-blue-500 to-indigo-500' },
                                { href: '/funkcje/platnosci', label: locale === 'pl' ? 'Płatności online' : 'Online Payments', icon: CreditCard, color: 'from-violet-500 to-purple-500' },
                                { href: '/funkcje/powiadomienia', label: locale === 'pl' ? 'Powiadomienia SMS' : 'SMS Notifications', icon: Bell, color: 'from-amber-500 to-orange-500' },
                                { href: '/funkcje/analityka', label: locale === 'pl' ? 'Analityka' : 'Analytics', icon: BarChart3, color: 'from-pink-500 to-rose-500' },
                                { href: '/funkcje/wielojezycznosc', label: locale === 'pl' ? 'Wielojęzyczność' : 'Multi-language', icon: Globe, color: 'from-cyan-500 to-teal-500' },
                                { href: '/funkcje/aplikacja', label: locale === 'pl' ? 'Aplikacja mobilna' : 'Mobile App', icon: Smartphone, color: 'from-slate-500 to-gray-600' },
                                { href: '/funkcje/bezpieczenstwo', label: locale === 'pl' ? 'Bezpieczeństwo' : 'Security', icon: Shield, color: 'from-emerald-500 to-green-600' },
                              ].map((item) => {
                                const IconComponent = item.icon
                                return (
                                  <Link 
                                    key={item.href}
                                    href={item.href} 
                                    onClick={() => setMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 py-2.5 px-4 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                  >
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                                      <IconComponent className="w-4 h-4 text-white" />
                                    </div>
                                    {item.label}
                                  </Link>
                                )
                              })}
                              <Link 
                                href="/funkcje"
                                onClick={() => setMobileMenuOpen(false)} 
                                className="block py-2.5 px-4 text-sm text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                {locale === 'pl' ? 'Wszystkie funkcje →' : 'All features →'}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Dla kogo - rozwijane */}
                    <div>
                      <button 
                        onClick={() => setMobileMenuExpanded(mobileMenuExpanded === 'dlakogo' ? null : 'dlakogo')}
                        className="w-full flex items-center justify-between py-3 px-4 text-base text-gray-800 hover:bg-gray-50 font-semibold rounded-xl transition-colors"
                      >
                        <span>{locale === 'pl' ? 'Dla kogo?' : 'For whom?'}</span>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${mobileMenuExpanded === 'dlakogo' ? 'rotate-90' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileMenuExpanded === 'dlakogo' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="py-2 space-y-1">
                              {[
                                { href: '/beauty', label: 'Beauty & SPA', icon: Scissors, color: 'from-pink-500 to-rose-500' },
                                { href: '/zdrowie', label: locale === 'pl' ? 'Zdrowie i medycyna' : 'Health & Medical', icon: Stethoscope, color: 'from-red-500 to-rose-500' },
                                { href: '/motoryzacja', label: locale === 'pl' ? 'Motoryzacja' : 'Automotive', icon: Car, color: 'from-slate-600 to-slate-700' },
                                { href: '/sport', label: locale === 'pl' ? 'Sport i fitness' : 'Sports & Fitness', icon: Dumbbell, color: 'from-orange-500 to-amber-500' },
                                { href: '/edukacja', label: locale === 'pl' ? 'Edukacja' : 'Education', icon: GraduationCap, color: 'from-blue-500 to-indigo-500' },
                                { href: '/zwierzeta', label: locale === 'pl' ? 'Usługi dla zwierząt' : 'Pet Services', icon: PawPrint, color: 'from-amber-500 to-yellow-500' },
                                { href: '/dom', label: locale === 'pl' ? 'Dom i naprawa' : 'Home & Repair', icon: Home, color: 'from-emerald-500 to-teal-500' },
                                { href: '/gastronomia', label: locale === 'pl' ? 'Gastronomia' : 'Gastronomy', icon: UtensilsCrossed, color: 'from-red-500 to-orange-500' },
                              ].map((item) => {
                                const IconComponent = item.icon
                                return (
                                  <Link 
                                    key={item.href}
                                    href={item.href} 
                                    onClick={() => setMobileMenuOpen(false)} 
                                    className="flex items-center gap-3 py-2.5 px-4 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                  >
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                                      <IconComponent className="w-4 h-4 text-white" />
                                    </div>
                                    {item.label}
                                  </Link>
                                )
                              })}
                              <Link 
                                href="/branze"
                                onClick={() => setMobileMenuOpen(false)} 
                                className="block py-2.5 px-4 text-sm text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                {locale === 'pl' ? 'Zobacz wszystkie kategorie →' : 'See all categories →'}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Separator */}
                    <div className="my-3 border-t border-gray-100"></div>
                    
                    {/* Other links - bez ikon */}
                    <a 
                      href="#jak-to-dziala" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                    >
                      {t.nav.howItWorks}
                    </a>
                    <a 
                      href="#cennik" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                    >
                      {t.nav.pricing}
                    </a>
                    <Link 
                      href="/contact" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                    >
                      {t.nav.contact}
                    </Link>
                  </nav>
                  
                  {/* Auth buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                    <a 
                      href={`${appUrl}/login`} 
                      className="block w-full py-3 text-center text-gray-700 hover:text-gray-900 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {t.nav.login}
                    </a>
                    <a 
                      href={`${appUrl}/register`} 
                      className="block w-full py-3 text-center text-white bg-teal-600 hover:bg-teal-700 font-semibold rounded-xl shadow-lg shadow-teal-600/20 transition-colors"
                    >
                      {t.nav.tryFree}
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO - Zdjęcie w tle */}
      <section className="relative min-h-[100svh] flex items-center">
        {/* Background Image - biznes kobieta przy laptopie */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/29485953/pexels-photo-29485953.jpeg?auto=compress&cs=tinysrgb&w=1920&q=90')"
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-teal-950/70 via-teal-900/50 to-teal-900/30 sm:from-teal-950/60 sm:via-teal-900/40 sm:to-teal-900/20"></div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-28 sm:pb-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center sm:text-left"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-5 sm:mb-6">
                {t.hero.title}
                <span className="block text-teal-300 mt-1 sm:mt-2">{t.hero.titleHighlight}</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto sm:mx-0">
                {t.hero.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <a 
                  href={`${appUrl}/register`} 
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-teal-900 font-semibold rounded-lg hover:bg-teal-50 transition-colors text-base sm:text-lg"
                >
                  {t.hero.cta}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link 
                  href="#funkcje" 
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-white font-medium rounded-lg border-2 border-white/30 hover:bg-white/10 transition-colors text-base sm:text-lg"
                >
                  {t.hero.ctaSecondary}
                </Link>
              </div>
              
              {/* Google Play Badge */}
              <div className="flex justify-center sm:justify-start mb-8 sm:mb-10">
                <a 
                  href="https://play.google.com/store/apps/details?id=pl.rezerwacja24.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-105"
                >
                  <Image 
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/pl_badge_web_generic.png"
                    alt={locale === 'pl' ? 'Pobierz z Google Play' : 'Get it on Google Play'}
                    width={200}
                    height={60}
                    className="h-14 sm:h-16 w-auto"
                  />
                </a>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-sm sm:text-base text-white/70 justify-center sm:justify-start">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span>{t.hero.benefit1}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span>{t.hero.benefit2}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span>{t.hero.benefit3}</span>
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

      {/* Trust Badges - Bezpieczeństwo */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 lg:gap-16">
            {[
              { icon: ShieldCheck, label: locale === 'pl' ? 'Zgodność z RODO' : 'GDPR Compliant' },
              { icon: Lock, label: locale === 'pl' ? 'Szyfrowanie SSL' : 'SSL Encryption' },
              { icon: Server, label: locale === 'pl' ? 'Serwery w UE' : 'EU Servers' },
              { icon: BadgeCheck, label: locale === 'pl' ? 'Bezpieczne płatności' : 'Secure Payments' },
              { icon: Shield, label: locale === 'pl' ? 'Kopie zapasowe' : 'Daily Backups' },
            ].map((badge, i) => {
              const IconComponent = badge.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <IconComponent className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funkcje" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          
          {/* Header z podglądem dashboardu */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
                {t.features.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t.features.title}
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                {t.features.subtitle}
              </p>
              <ul className="space-y-3">
                {t.features.list.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Dashboard preview - widoczny na wszystkich urządzeniach */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-teal-300/20 rounded-3xl blur-2xl"></div>
                
                {/* Screenshot container - ucięty po prawej na desktop */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 lg:translate-x-12">
                  <Image
                    src="/screenshots/dashboard-preview.png"
                    alt="Panel zarządzania Rezerwacja24"
                    width={1536}
                    height={1024}
                    className="w-full h-auto"
                    quality={90}
                    priority
                  />
                  {/* Gradient fade na prawej krawędzi - tylko desktop */}
                  <div className="hidden lg:block absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent"></div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-4 left-4 lg:-left-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.features.quickAccess}</p>
                      <p className="text-xs text-gray-500">{t.features.toAllFeatures}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Wszystkie funkcje - siatka 3 kolumny */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.features.allFeatures.map((feature, i) => {
              const IconComponent = featureIcons[feature.icon as keyof typeof featureIcons]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 group-hover:bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                      {IconComponent && <IconComponent className="w-6 h-6 text-teal-700 group-hover:text-white transition-colors duration-300" />}
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

          {/* CTA w sekcji funkcji */}
          <div className="mt-14 text-center">
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-800/20"
            >
              {t.features.tryAllFeatures}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Demo Section - Zobacz na żywo */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100/50 to-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-100/40 to-cyan-100/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative grid lg:grid-cols-2 gap-0">
              {/* Left - Text */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full mb-6 w-fit">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-teal-700 uppercase tracking-wide">
                    {locale === 'pl' ? 'Zobacz na żywo' : 'Live Preview'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
                  {locale === 'pl' ? 'Sprawdź jak wygląda strona rezerwacji' : 'See how the booking page looks'}
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {locale === 'pl' 
                    ? 'Bez rejestracji, bez zobowiązań. Zobacz dokładnie jak Twoi klienci będą rezerwować wizyty.' 
                    : 'No registration, no commitment. See exactly how your clients will book appointments.'}
                </p>
                <div className="space-y-4 mb-10">
                  {[
                    locale === 'pl' ? 'Pełna funkcjonalność rezerwacji' : 'Full booking functionality',
                    locale === 'pl' ? 'Responsywny design na każde urządzenie' : 'Responsive design for any device',
                    locale === 'pl' ? 'Możliwość personalizacji kolorów i logo' : 'Customizable colors and logo'
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.a 
                  href="https://demo.rezerwacja24.pl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-600/25 w-full sm:w-auto text-lg"
                >
                  {locale === 'pl' ? 'Zobacz demo strony rezerwacji' : 'View booking page demo'}
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </motion.div>
              
              {/* Right - Phone Mockup */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative bg-gradient-to-br from-teal-600 to-teal-800 min-h-[400px] lg:min-h-0 flex items-center justify-center p-8 lg:p-12"
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>
                
                <div className="relative w-full max-w-xs">
                  {/* Phone mockup - handcrafted */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl ring-1 ring-white/20">
                      {/* Phone notch */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full z-10"></div>
                      
                      <div className="bg-white rounded-[2rem] overflow-hidden">
                        {/* Booking page header */}
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-6 pt-8">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">Studio Anna</p>
                              <p className="text-teal-200 text-xs">{locale === 'pl' ? 'Salon fryzjerski' : 'Hair Salon'}</p>
                            </div>
                          </div>
                          <p className="text-white/80 text-xs">{locale === 'pl' ? 'Wybierz usługę i termin' : 'Choose service and time'}</p>
                        </div>
                        
                        {/* Services */}
                        <div className="p-4 space-y-2">
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{locale === 'pl' ? 'Usługi' : 'Services'}</p>
                          {[
                            { name: locale === 'pl' ? 'Strzyżenie damskie' : 'Women\'s haircut', price: '80 zł', time: '45 min', selected: true },
                            { name: locale === 'pl' ? 'Koloryzacja' : 'Coloring', price: '150 zł', time: '90 min', selected: false },
                            { name: locale === 'pl' ? 'Modelowanie' : 'Styling', price: '50 zł', time: '30 min', selected: false },
                          ].map((service, i) => (
                            <div key={i} className={`p-3 rounded-xl border-2 transition-all ${service.selected ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-sm font-medium ${service.selected ? 'text-teal-700' : 'text-slate-700'}`}>{service.name}</p>
                                  <p className="text-[10px] text-slate-400">{service.time}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${service.selected ? 'text-teal-600' : 'text-slate-600'}`}>{service.price}</span>
                                  {service.selected && (
                                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Time slots */}
                        <div className="px-4 pb-4">
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-2">{locale === 'pl' ? 'Dostępne terminy' : 'Available times'}</p>
                          <div className="flex gap-2 overflow-hidden">
                            {['10:00', '11:30', '14:00', '15:30'].map((time, i) => (
                              <div key={i} className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 1 ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {time}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Book button */}
                        <div className="px-4 pb-6">
                          <div className="bg-teal-600 text-white text-center py-3 rounded-xl font-semibold text-sm">
                            {locale === 'pl' ? 'Zarezerwuj wizytę' : 'Book appointment'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating badge */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-100"
                    >
                      <p className="text-xs text-gray-500 mb-0.5">{locale === 'pl' ? 'Twoja subdomena' : 'Your subdomain'}</p>
                      <p className="text-sm font-bold text-teal-700">twoja-firma.rezerwacja24.pl</p>
                    </motion.div>
                    
                    {/* Floating notification */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                      animate={{ y: [0, -5, 0] }}
                      className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl px-4 py-2 border border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{locale === 'pl' ? 'Rezerwacja!' : 'Booked!'}</p>
                          <p className="text-[10px] text-gray-500">{locale === 'pl' ? 'Jutro, 14:00' : 'Tomorrow, 2 PM'}</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calendar Preview Section - Dwukolumnowy układ */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-teal-500/20 text-teal-400 text-sm font-semibold rounded-full mb-4">
                {locale === 'pl' ? 'Inteligentny kalendarz' : 'Smart Calendar'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {locale === 'pl' ? 'Wszystkie rezerwacje w jednym miejscu' : 'All bookings in one place'}
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                {locale === 'pl' 
                  ? 'Przejrzysty widok tygodniowy z kolorowymi rezerwacjami. Zarządzaj wieloma pracownikami jednocześnie i nigdy nie przegap żadnej wizyty.' 
                  : 'Clear weekly view with colorful bookings. Manage multiple employees at once and never miss an appointment.'}
              </p>
              
              {/* Features list */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: Calendar, text: locale === 'pl' ? 'Widok dzienny, tygodniowy i miesięczny' : 'Daily, weekly and monthly view' },
                  { icon: Users, text: locale === 'pl' ? 'Filtrowanie po pracownikach' : 'Filter by employees' },
                  { icon: Zap, text: locale === 'pl' ? 'Przeciągnij i upuść rezerwacje' : 'Drag & drop bookings' },
                  { icon: Bell, text: locale === 'pl' ? 'Automatyczne przypomnienia SMS' : 'Automatic SMS reminders' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-slate-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <Link
                href="/funkcje/kalendarz"
                className="inline-flex items-center gap-2 text-teal-400 font-medium hover:text-teal-300 transition-colors"
              >
                {locale === 'pl' ? 'Dowiedz się więcej o kalendarzu' : 'Learn more about calendar'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            
            {/* Right - Calendar mockup - nowoczesny design */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-slate-200/50 via-teal-200/30 to-slate-200/50 rounded-3xl blur-2xl"></div>
              
              {/* Calendar UI Mockup - Modern Design */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{locale === 'pl' ? 'Kalendarz' : 'Calendar'}</p>
                        <p className="text-slate-400 text-xs">app.rezerwacja24.pl</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-3 py-1.5">
                      <ChevronLeft className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white" />
                      <span className="text-white text-sm font-medium px-2">{locale === 'pl' ? 'Luty 2026' : 'Feb 2026'}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white" />
                    </div>
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-1">
                    <span className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-md">{locale === 'pl' ? 'Tydzień' : 'Week'}</span>
                    <span className="px-3 py-1 text-slate-400 text-xs font-medium rounded-md hover:bg-slate-700/50">{locale === 'pl' ? 'Dzień' : 'Day'}</span>
                    <span className="px-3 py-1 text-slate-400 text-xs font-medium rounded-md hover:bg-slate-700/50">{locale === 'pl' ? 'Miesiąc' : 'Month'}</span>
                  </div>
                </div>
                
                {/* Calendar content */}
                <div className="p-4 bg-slate-50/50">
                  {/* Days header */}
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    <div className="text-[10px] text-slate-400"></div>
                    {(locale === 'pl' 
                      ? [{d:'Pn',n:'10'},{d:'Wt',n:'11'},{d:'Śr',n:'12'},{d:'Cz',n:'13'},{d:'Pt',n:'14'},{d:'Sb',n:'15'},{d:'Nd',n:'16'}]
                      : [{d:'Mon',n:'10'},{d:'Tue',n:'11'},{d:'Wed',n:'12'},{d:'Thu',n:'13'},{d:'Fri',n:'14'},{d:'Sat',n:'15'},{d:'Sun',n:'16'}]
                    ).map((day, i) => (
                      <div key={i} className={`text-center py-1.5 rounded-lg ${i === 2 ? 'bg-teal-500 text-white' : 'bg-white text-slate-600'}`}>
                        <p className="text-[10px] font-medium">{day.d}</p>
                        <p className="text-sm font-bold">{day.n}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Time grid with appointments */}
                  <div className="space-y-1">
                    {[
                      { time: '08:00', slots: [null, null, {name:'Maria S.',service:locale==='pl'?'Masaż':'Massage',color:'bg-slate-600',h:2}, null, null, null, null] },
                      { time: '09:00', slots: [{name:'Anna K.',service:locale==='pl'?'Strzyżenie':'Haircut',color:'bg-teal-500',h:1}, null, 'cont', {name:'Tomek P.',service:locale==='pl'?'Konsultacja':'Consult',color:'bg-slate-500',h:1}, null, null, null] },
                      { time: '10:00', slots: [null, {name:'Marek W.',service:locale==='pl'?'Koloryzacja':'Coloring',color:'bg-slate-700',h:2}, null, null, {name:'Ola S.',service:locale==='pl'?'Manicure':'Manicure',color:'bg-teal-600',h:1}, null, null] },
                      { time: '11:00', slots: [{name:'Kasia N.',service:locale==='pl'?'Stylizacja':'Styling',color:'bg-slate-500',h:1}, 'cont', null, {name:'Jan K.',service:locale==='pl'?'Strzyżenie':'Haircut',color:'bg-teal-500',h:1}, null, {name:'Ewa M.',service:locale==='pl'?'Pedicure':'Pedicure',color:'bg-slate-600',h:1}, null] },
                      { time: '12:00', slots: [null, null, {name:'Piotr Z.',service:locale==='pl'?'Masaż':'Massage',color:'bg-slate-700',h:1}, null, {name:'Ania B.',service:locale==='pl'?'Brwi':'Brows',color:'bg-slate-500',h:1}, null, null] },
                      { time: '13:00', slots: [null, {name:'Zofia L.',service:locale==='pl'?'Strzyżenie':'Haircut',color:'bg-teal-500',h:1}, null, null, null, null, null] },
                    ].map((row, rowIdx) => (
                      <div key={rowIdx} className="grid grid-cols-8 gap-2">
                        <div className="text-[10px] text-slate-400 font-medium py-2">{row.time}</div>
                        {row.slots.map((slot, slotIdx) => (
                          <div key={slotIdx} className={`relative ${slot === 'cont' ? '' : 'min-h-[36px]'}`}>
                            {slot && slot !== 'cont' && typeof slot === 'object' && (
                              <div className={`absolute inset-x-0 top-0 ${slot.color} rounded-md p-1.5 shadow-sm`} style={{height: slot.h === 2 ? '76px' : '36px', zIndex: 10}}>
                                <p className="text-[9px] text-white font-semibold truncate">{slot.name}</p>
                                <p className="text-[8px] text-white/70 truncate">{slot.service}</p>
                              </div>
                            )}
                            {!slot && <div className="absolute inset-0 border border-slate-200/50 rounded-md bg-white/50"></div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="bg-white px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                      <span className="text-[10px] text-slate-500">{locale === 'pl' ? 'Potwierdzone' : 'Confirmed'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                      <span className="text-[10px] text-slate-500">{locale === 'pl' ? 'Oczekujące' : 'Pending'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">12 {locale === 'pl' ? 'rezerwacji' : 'bookings'}</span>
                </div>
              </div>
              
              {/* Floating stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{locale === 'pl' ? 'Ten tydzień' : 'This week'}</p>
                    <p className="text-lg font-bold text-slate-800">+24</p>
                    <p className="text-[10px] text-teal-600 font-medium">{locale === 'pl' ? 'rezerwacji' : 'bookings'}</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating notification */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">{locale === 'pl' ? 'Nowa rezerwacja' : 'New booking'}</p>
                    <p className="text-xs font-semibold text-slate-700">Anna K. - 14:00</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dla kogo - Industries Carousel */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              {locale === 'pl' ? 'Branże' : 'Industries'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {locale === 'pl' ? 'Dla kogo jest Rezerwacja24?' : 'Who is Bookings24 for?'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {locale === 'pl' 
                ? 'Nasz system jest dla każdego, kto przyjmuje klientów na wizyty. Sprawdzi się w każdej branży usługowej.' 
                : 'Our system is for everyone who accepts client appointments. It works in any service industry.'}
            </p>
          </div>
          
          {/* Infinite Carousel - All industries */}
          <div className="relative">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            {/* Carousel track - Row 1 */}
            <div className="flex gap-6 mb-6 animate-scroll-left">
              {[
                { title: locale === 'pl' ? 'Salony fryzjerskie' : 'Hair Salons', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop', icon: Scissors },
                { title: locale === 'pl' ? 'Salony kosmetyczne' : 'Beauty Salons', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop', icon: Sparkle },
                { title: locale === 'pl' ? 'Gabinety masażu' : 'Massage Studios', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop', icon: Heart },
                { title: locale === 'pl' ? 'Trenerzy personalni' : 'Personal Trainers', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=200&fit=crop', icon: Dumbbell },
                { title: locale === 'pl' ? 'SPA & Wellness' : 'SPA & Wellness', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&h=200&fit=crop', icon: Sparkles },
                { title: locale === 'pl' ? 'Barber shop' : 'Barber Shops', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=200&fit=crop', icon: Scissors },
                { title: locale === 'pl' ? 'Fizjoterapia' : 'Physiotherapy', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop', icon: Heart },
                { title: locale === 'pl' ? 'Studia jogi' : 'Yoga Studios', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=200&fit=crop', icon: Heart },
                // Duplicate for infinite scroll
                { title: locale === 'pl' ? 'Salony fryzjerskie' : 'Hair Salons', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop', icon: Scissors },
                { title: locale === 'pl' ? 'Salony kosmetyczne' : 'Beauty Salons', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop', icon: Sparkle },
                { title: locale === 'pl' ? 'Gabinety masażu' : 'Massage Studios', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop', icon: Heart },
                { title: locale === 'pl' ? 'Trenerzy personalni' : 'Personal Trainers', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=200&fit=crop', icon: Dumbbell },
              ].map((industry, i) => {
                const IconComponent = industry.icon
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 w-64 group"
                  >
                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={industry.image}
                        alt={industry.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-sm font-bold text-white">{industry.title}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Carousel track - Row 2 (reverse direction) */}
            <div className="flex gap-6 animate-scroll-right">
              {[
                { title: locale === 'pl' ? 'Warsztaty samochodowe' : 'Auto Workshops', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop', icon: Car },
                { title: locale === 'pl' ? 'Studio tatuażu' : 'Tattoo Studios', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=300&h=200&fit=crop', icon: Palette },
                { title: locale === 'pl' ? 'Stylizacja rzęs' : 'Lash Styling', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop', icon: Eye },
                { title: locale === 'pl' ? 'Gabinety stomatologiczne' : 'Dental Offices', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&h=200&fit=crop', icon: Heart },
                { title: locale === 'pl' ? 'Psycholodzy' : 'Psychologists', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop', icon: Heart },
                { title: locale === 'pl' ? 'Fotografowie' : 'Photographers', image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=300&h=200&fit=crop', icon: Eye },
                { title: locale === 'pl' ? 'Weterynarze' : 'Veterinarians', image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=300&h=200&fit=crop', icon: Heart },
                { title: locale === 'pl' ? 'Szkoły tańca' : 'Dance Schools', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop', icon: Heart },
                // Duplicate for infinite scroll
                { title: locale === 'pl' ? 'Warsztaty samochodowe' : 'Auto Workshops', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop', icon: Car },
                { title: locale === 'pl' ? 'Studio tatuażu' : 'Tattoo Studios', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=300&h=200&fit=crop', icon: Palette },
                { title: locale === 'pl' ? 'Stylizacja rzęs' : 'Lash Styling', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop', icon: Eye },
                { title: locale === 'pl' ? 'Gabinety stomatologiczne' : 'Dental Offices', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&h=200&fit=crop', icon: Heart },
              ].map((industry, i) => {
                const IconComponent = industry.icon
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 w-64 group"
                  >
                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={industry.image}
                        alt={industry.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-sm font-bold text-white">{industry.title}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-14">
            <p className="text-gray-500 mb-6">
              {locale === 'pl' 
                ? 'Niezależnie od branży - jeśli umawiasz klientów na wizyty, ten system jest dla Ciebie.' 
                : 'Regardless of industry - if you schedule client appointments, this system is for you.'}
            </p>
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
            >
              {locale === 'pl' ? 'Wypróbuj za darmo' : 'Try for free'}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Migracja z Booksy - Baner elegancki */}
      {locale === 'pl' && (
        <section className="py-14 bg-gradient-to-r from-teal-50 via-white to-emerald-50">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-8 md:p-10 relative overflow-hidden">
              {/* Delikatna dekoracja */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-100/50 to-transparent rounded-bl-full"></div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                <div className="text-center md:text-left">
                  <p className="text-teal-600 text-sm font-medium mb-2">Specjalna oferta</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    Przenieś się z Booksy
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Darmowa migracja klientów i danych. Zero prowizji na zawsze. 
                    <span className="text-teal-600 font-semibold"> 7 dni za darmo!</span>
                  </p>
                </div>
                <Link 
                  href="/migracja-z-booksy"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl transition-colors shadow-md whitespace-nowrap"
                >
                  Dowiedz się więcej
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Porównanie z konkurencją - Clean Design */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-full mb-5">
              {locale === 'pl' ? 'Porównanie' : 'Comparison'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'pl' ? 'Co nas wyróżnia?' : 'What makes us different?'}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {locale === 'pl' 
                ? 'Sprawdź dlaczego firmy wybierają Rezerwacja24' 
                : 'See why businesses choose Bookings24'}
            </p>
          </div>
          
          {/* Comparison Table - Clean */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-5 px-6 text-left text-sm font-medium text-gray-500">
                      {locale === 'pl' ? 'Funkcja' : 'Feature'}
                    </th>
                    <th className="py-5 px-4 text-center">
                      <span className="text-base font-bold text-teal-700">{locale === 'pl' ? 'Rezerwacja24' : 'Bookings24'}</span>
                    </th>
                    <th className="py-5 px-4 text-center text-sm font-medium text-gray-400">Booksy</th>
                    <th className="py-5 px-4 text-center text-sm font-medium text-gray-400">Calendly</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { 
                      feature: locale === 'pl' ? 'Prowizja od rezerwacji' : 'Booking commission', 
                      r24: { text: '0%', highlight: true }, 
                      booksy: { text: locale === 'pl' ? 'do 25%' : 'up to 25%', bad: true }, 
                      calendly: { text: '0%' }
                    },
                    { 
                      feature: locale === 'pl' ? 'SMS w cenie' : 'SMS included', 
                      r24: { check: true }, 
                      booksy: { check: false }, 
                      calendly: { check: false }
                    },
                    { 
                      feature: locale === 'pl' ? 'Własna subdomena' : 'Custom subdomain', 
                      r24: { check: true }, 
                      booksy: { check: true }, 
                      calendly: { check: true }
                    },
                    { 
                      feature: locale === 'pl' ? 'CRM i baza klientów' : 'CRM & clients', 
                      r24: { check: true }, 
                      booksy: { check: true }, 
                      calendly: { check: false }
                    },
                    { 
                      feature: locale === 'pl' ? 'Płatności online' : 'Online payments', 
                      r24: { check: true }, 
                      booksy: { check: true }, 
                      calendly: { check: true }
                    },
                    { 
                      feature: locale === 'pl' ? 'Program lojalnościowy' : 'Loyalty program', 
                      r24: { check: true }, 
                      booksy: { check: true }, 
                      calendly: { check: false }
                    },
                    { 
                      feature: locale === 'pl' ? 'Karnety i pakiety' : 'Passes & packages', 
                      r24: { check: true }, 
                      booksy: { check: true }, 
                      calendly: { check: false }
                    },
                    { 
                      feature: locale === 'pl' ? 'Zajęcia grupowe' : 'Group classes', 
                      r24: { check: true }, 
                      booksy: { check: true }, 
                      calendly: { check: false }
                    },
                    { 
                      feature: locale === 'pl' ? 'Wsparcie po polsku' : 'Polish support', 
                      r24: { check: true }, 
                      booksy: { check: true }, 
                      calendly: { check: false }
                    },
                    { 
                      feature: locale === 'pl' ? 'Serwery w Polsce/UE' : 'EU servers', 
                      r24: { check: true }, 
                      booksy: { check: false }, 
                      calendly: { check: false }
                    },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-4 px-6 text-sm text-gray-700">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {'check' in row.r24 ? (
                          row.r24.check ? (
                            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
                              <Check className="w-4 h-4 text-teal-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <Minus className="w-4 h-4 text-gray-400" />
                            </div>
                          )
                        ) : (
                          <span className={`text-sm font-semibold ${row.r24.highlight ? 'text-teal-600' : 'text-gray-700'}`}>
                            {row.r24.text}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {'check' in row.booksy ? (
                          row.booksy.check ? (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <Check className="w-4 h-4 text-gray-400" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <Minus className="w-4 h-4 text-gray-300" />
                            </div>
                          )
                        ) : (
                          <span className={`text-sm ${row.booksy.bad ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            {row.booksy.text}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {'check' in row.calendly ? (
                          row.calendly.check ? (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <Check className="w-4 h-4 text-gray-400" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <Minus className="w-4 h-4 text-gray-300" />
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-gray-500">{row.calendly.text}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-12 text-center">
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl transition-colors"
            >
              {locale === 'pl' ? 'Wypróbuj za darmo' : 'Try for free'}
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="mt-3 text-sm text-gray-500">
              {locale === 'pl' ? '7 dni za darmo • Bez karty kredytowej • 0% prowizji' : '7 days free • No credit card • 0% commission'}
            </p>
          </div>
        </div>
      </section>

      {/* Co zyskasz - Benefits */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              {locale === 'pl' ? 'Korzyści' : 'Benefits'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {locale === 'pl' ? 'Co zyskasz?' : 'What do you gain?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'pl' 
                ? 'Oszczędź czas i zwiększ przychody' 
                : 'Save time and increase revenue'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: locale === 'pl' ? 'Oszczędność czasu' : 'Save time',
                description: locale === 'pl' 
                  ? 'Koniec z odbieraniem telefonów i ręcznym zapisywaniem wizyt. System robi to za Ciebie.'
                  : 'No more answering phones and manually scheduling. The system does it for you.',
                stat: '5h',
                statLabel: locale === 'pl' ? 'tygodniowo' : 'weekly'
              },
              {
                icon: Users,
                title: locale === 'pl' ? 'Więcej klientów' : 'More clients',
                description: locale === 'pl'
                  ? 'Klienci mogą rezerwować o każdej porze. Nie tracisz rezerwacji przez nieodebrane telefony.'
                  : 'Clients can book anytime. No more lost bookings due to missed calls.',
                stat: '+30%',
                statLabel: locale === 'pl' ? 'rezerwacji' : 'bookings'
              },
              {
                icon: Bell,
                title: locale === 'pl' ? 'Mniej nieobecności' : 'Fewer no-shows',
                description: locale === 'pl'
                  ? 'Automatyczne przypomnienia SMS zmniejszają liczbę nieobecności.'
                  : 'Automatic SMS reminders reduce no-shows significantly.',
                stat: '-70%',
                statLabel: locale === 'pl' ? 'nieobecności' : 'no-shows'
              },
              {
                icon: Globe,
                title: locale === 'pl' ? 'Dostępność 24/7' : '24/7 availability',
                description: locale === 'pl'
                  ? 'Twoi klienci mogą rezerwować z telefonu, tabletu lub komputera - kiedy chcą.'
                  : 'Your clients can book from any device - whenever they want.',
                stat: '24/7',
                statLabel: locale === 'pl' ? 'online' : 'online'
              },
              {
                icon: BarChart3,
                title: locale === 'pl' ? 'Pełna kontrola' : 'Full control',
                description: locale === 'pl'
                  ? 'Zarządzaj kalendarzem, klientami i przychodami z jednego miejsca.'
                  : 'Manage calendar, clients and revenue from one place.',
                stat: '100%',
                statLabel: locale === 'pl' ? 'kontroli' : 'control'
              },
              {
                icon: Star,
                title: locale === 'pl' ? 'Profesjonalny wizerunek' : 'Professional image',
                description: locale === 'pl'
                  ? 'Własna strona rezerwacyjna z Twoim logo. Wyróżnij się na tle konkurencji.'
                  : 'Your own booking page with your logo. Stand out from competition.',
                stat: 'PRO',
                statLabel: locale === 'pl' ? 'wizerunek' : 'image'
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
                  className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-300"
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

      {/* How it works - rozbudowane */}
      <section id="jak-to-dziala" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              {t.howItWorks.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {t.howItWorks.steps.map((step, i) => {
              const StepIcon = i === 0 ? Users : i === 1 ? Calendar : Zap
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-teal-200 to-transparent z-0" style={{width: 'calc(100% - 8rem)', left: 'calc(50% + 4rem)'}}></div>
                  )}
                  
                  <div className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                    {/* Step number */}
                    <div className="absolute -top-4 left-8 px-3 py-1 bg-teal-800 text-white text-sm font-bold rounded-full">
                      Step {step.num}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 mt-2">
                      <StepIcon className="w-8 h-8 text-teal-700" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                    
                    {/* Details list */}
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
          
          {/* CTA */}
          <div className="text-center mt-16">
            <a 
              href={`${appUrl}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-teal-800/20"
            >
              {t.startNow}
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="mt-4 text-gray-500">{t.freeTrial}</p>
          </div>
        </div>
      </section>

      {/* Booking Form Mockup - Jak klienci rezerwują */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
                {locale === 'pl' ? 'Dla Twoich klientów' : 'For your clients'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {locale === 'pl' ? 'Prosta rezerwacja dla klientów' : 'Simple booking for clients'}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {locale === 'pl' 
                  ? 'Twoi klienci rezerwują wizyty w kilka sekund. Bez rejestracji, bez logowania - wystarczy wybrać usługę, termin i potwierdzić.' 
                  : 'Your clients book appointments in seconds. No registration, no login - just select service, time and confirm.'}
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Clock, text: locale === 'pl' ? 'Rezerwacja w 30 sekund' : 'Book in 30 seconds' },
                  { icon: Globe, text: locale === 'pl' ? 'Dostępne 24/7 online' : 'Available 24/7 online' },
                  { icon: Bell, text: locale === 'pl' ? 'Automatyczne przypomnienia SMS' : 'Automatic SMS reminders' },
                  { icon: CreditCard, text: locale === 'pl' ? 'Płatność online lub na miejscu' : 'Pay online or on-site' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Right - Booking form mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-3xl blur-2xl"></div>
              
              {/* Phone mockup */}
              <div className="relative max-w-sm mx-auto">
                <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10"></div>
                  
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-4">
                      <p className="text-white/70 text-xs mb-1">twoja-firma.rezerwacja24.pl</p>
                      <h3 className="text-white font-bold text-lg">{locale === 'pl' ? 'Zarezerwuj wizytę' : 'Book appointment'}</h3>
                    </div>
                    
                    {/* Form content */}
                    <div className="p-5 space-y-4">
                      {/* Service */}
                      <div>
                        <p className="text-xs text-gray-400 mb-2">{locale === 'pl' ? 'Wybrana usługa' : 'Selected service'}</p>
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Scissors className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{locale === 'pl' ? 'Strzyżenie damskie' : 'Women\'s haircut'}</p>
                            <p className="text-xs text-gray-500">45 min • 80 zł</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div>
                        <p className="text-xs text-gray-400 mb-2">{locale === 'pl' ? 'Wybierz dzień' : 'Select day'}</p>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { day: locale === 'pl' ? 'Pon' : 'Mon', num: '10' },
                            { day: locale === 'pl' ? 'Wt' : 'Tue', num: '11' },
                            { day: locale === 'pl' ? 'Śr' : 'Wed', num: '12', active: true },
                            { day: locale === 'pl' ? 'Czw' : 'Thu', num: '13' },
                            { day: locale === 'pl' ? 'Pt' : 'Fri', num: '14' },
                          ].map((d, i) => (
                            <div key={i} className={`text-center py-2 rounded-xl ${d.active ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <p className="text-[10px] font-medium">{d.day}</p>
                              <p className="text-sm font-bold">{d.num}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time */}
                      <div>
                        <p className="text-xs text-gray-400 mb-2">{locale === 'pl' ? 'Wybierz godzinę' : 'Select time'}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {['09:00', '10:30', '12:00', '14:00'].map((time, i) => (
                            <div key={i} className={`text-center py-2 rounded-lg text-xs font-medium ${i === 1 ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Customer info preview */}
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Anna Kowalska</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">+48 123 456 789</span>
                        </div>
                      </div>
                      
                      {/* Submit button */}
                      <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-teal-600/20">
                        {locale === 'pl' ? 'Zarezerwuj wizytę' : 'Book appointment'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Floating notification */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{locale === 'pl' ? 'Potwierdzone!' : 'Confirmed!'}</p>
                      <p className="text-[10px] text-gray-500">SMS {locale === 'pl' ? 'wysłany' : 'sent'}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof - Firmy które nam zaufały */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              {locale === 'pl' ? 'Zaufali nam' : 'Trusted by'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {locale === 'pl' ? 'Dołącz do setek zadowolonych firm' : 'Join hundreds of satisfied businesses'}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {locale === 'pl' 
                ? 'Firmy z całej Polski korzystają z naszego systemu rezerwacji' 
                : 'Businesses across Europe use our booking system'}
            </p>
          </div>
          
          {/* Company logos - styled cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            {[
              { name: 'Beauty Studio Anna', initials: 'BSA', color: 'from-pink-500 to-rose-500' },
              { name: 'Fryzjer Marek', initials: 'FM', color: 'from-amber-500 to-orange-500' },
              { name: 'FitZone Gym', initials: 'FZ', color: 'from-blue-500 to-cyan-500' },
              { name: 'Relax Spa Center', initials: 'RS', color: 'from-teal-500 to-emerald-500' },
              { name: 'Auto Serwis Pro', initials: 'AS', color: 'from-slate-600 to-slate-700' },
            ].map((company, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200"
              >
                {/* Logo */}
                <div className={`w-14 h-14 bg-gradient-to-br ${company.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-lg font-bold text-white">{company.initials}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{company.name}</h3>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '500+', label: locale === 'pl' ? 'Aktywnych firm' : 'Active businesses' },
              { value: '50k+', label: locale === 'pl' ? 'Rezerwacji miesięcznie' : 'Monthly bookings' },
              { value: '4.9', label: locale === 'pl' ? 'Średnia ocena' : 'Average rating', icon: Star },
              { value: '99.9%', label: locale === 'pl' ? 'Uptime systemu' : 'System uptime' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100"
              >
                <div className="flex items-center justify-center gap-1">
                  <p className="text-3xl sm:text-4xl font-bold text-teal-600">{stat.value}</p>
                  {stat.icon && <stat.icon className="w-6 h-6 text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-teal-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.testimonials.title}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {t.testimonials.items.map((item, i) => (
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
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/90 text-lg mb-6">"{item.quote}"</p>
                <div>
                  <p className="font-bold text-white">{item.author}</p>
                  <p className="text-teal-300">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="cennik" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              {locale === 'pl' ? 'Cennik' : 'Pricing'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {locale === 'pl' ? 'Wybierz plan dla siebie' : 'Choose your plan'}
            </h2>
            <p className="text-xl text-gray-600">
              {locale === 'pl' ? '7 dni za darmo. Bez karty kredytowej. Anuluj kiedy chcesz.' : '7 days free. No credit card. Cancel anytime.'}
            </p>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Starter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Starter</h3>
                <p className="text-sm text-gray-500 mb-4">{locale === 'pl' ? 'Dla początkujących' : 'For beginners'}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{isEuDomain ? '3,99' : '12,99'}</span>
                  <span className="text-gray-500">{isEuDomain ? '€/mo' : (locale === 'pl' ? 'zł/mies.' : 'PLN/mo')}</span>
                </div>
                <p className="text-sm text-teal-600 mt-2 font-medium">{locale === 'pl' ? '7 dni za darmo' : '7 days free'}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? '100 rezerwacji miesięcznie' : '100 bookings/month'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? '1 pracownik' : '1 employee'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? 'Własna strona rezerwacji' : 'Your booking page'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? 'Kalendarz online' : 'Online calendar'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{locale === 'pl' ? '0% prowizji' : '0% commission'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  <span className="text-gray-400">{locale === 'pl' ? 'Powiadomienia SMS' : 'SMS notifications'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  <span className="text-gray-400">{locale === 'pl' ? 'Analityka' : 'Analytics'}</span>
                </div>
              </div>
              
              <a 
                href={`${appUrl}/register?plan=starter`}
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl text-center transition-colors"
              >
                {locale === 'pl' ? 'Rozpocznij za darmo' : 'Start free'}
              </a>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-2 border-teal-500 relative transform md:scale-105 z-10">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-teal-600 text-white text-sm font-bold rounded-full">
                  {locale === 'pl' ? 'Najpopularniejszy' : 'Most popular'}
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Pro</h3>
                <p className="text-sm text-gray-500 mb-4">{locale === 'pl' ? 'Dla rozwijających się firm' : 'For growing businesses'}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-teal-600">{isEuDomain ? '9,99' : '29,99'}</span>
                  <span className="text-gray-500">{isEuDomain ? '€/mo' : (locale === 'pl' ? 'zł/mies.' : 'PLN/mo')}</span>
                </div>
                <p className="text-sm text-teal-600 mt-2 font-medium">{locale === 'pl' ? '7 dni za darmo' : '7 days free'}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{locale === 'pl' ? 'Bez limitu rezerwacji' : 'Unlimited bookings'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? 'Do 5 pracowników' : 'Up to 5 employees'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? 'Własna strona rezerwacji' : 'Your booking page'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? '100 SMS miesięcznie' : '100 SMS/month'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? 'Analityka i raporty' : 'Analytics & reports'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700">{locale === 'pl' ? 'CRM - baza klientów' : 'CRM - client database'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{locale === 'pl' ? '0% prowizji' : '0% commission'}</span>
                </div>
              </div>
              
              <a 
                href={`${appUrl}/register?plan=pro`}
                className="block w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-center transition-colors"
              >
                {locale === 'pl' ? 'Rozpocznij za darmo' : 'Start free'}
              </a>
            </div>

            {/* Premium */}
            <div className="bg-gray-900 rounded-2xl shadow-lg p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                <p className="text-sm text-gray-400 mb-4">{locale === 'pl' ? 'Dla dużych firm' : 'For large businesses'}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{isEuDomain ? '23,99' : '79,99'}</span>
                  <span className="text-gray-400">{isEuDomain ? '€/mo' : (locale === 'pl' ? 'zł/mies.' : 'PLN/mo')}</span>
                </div>
                <p className="text-sm text-teal-400 mt-2 font-medium">{locale === 'pl' ? '7 dni za darmo' : '7 days free'}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-white font-medium">{locale === 'pl' ? 'Bez limitu rezerwacji' : 'Unlimited bookings'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-white font-medium">{locale === 'pl' ? 'Bez limitu pracowników' : 'Unlimited employees'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">{locale === 'pl' ? 'Własna strona rezerwacji' : 'Your booking page'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">{locale === 'pl' ? '500 SMS miesięcznie' : '500 SMS/month'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">{locale === 'pl' ? 'Zaawansowana analityka' : 'Advanced analytics'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">{locale === 'pl' ? 'Dostęp do API' : 'API access'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">{locale === 'pl' ? 'Priorytetowe wsparcie' : 'Priority support'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <span className="text-white font-medium">{locale === 'pl' ? '0% prowizji' : '0% commission'}</span>
                </div>
              </div>
              
              <a 
                href={`${appUrl}/register?plan=premium`}
                className="block w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl text-center transition-colors"
              >
                {locale === 'pl' ? 'Rozpocznij za darmo' : 'Start free'}
              </a>
            </div>
          </div>
          
          {/* Info pod cennikiem */}
          <p className="text-center text-gray-500 mt-10 text-sm">
            {locale === 'pl' 
              ? 'Wszystkie plany zawierają: własną stronę rezerwacji, kalendarz online, powiadomienia email, synchronizację z Google Calendar' 
              : 'All plans include: your booking page, online calendar, email notifications, Google Calendar sync'}
          </p>
        </div>
      </section>

      {/* Stats - Liczby */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              {locale === 'pl' ? 'Zaufanie' : 'Trust'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {locale === 'pl' ? 'Liczby mówią same za siebie' : 'Numbers speak for themselves'}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: '500+', label: t.stats.companies, icon: Users },
              { value: '50k+', label: t.stats.bookings, icon: Calendar },
              { value: '99.9%', label: t.stats.uptime, icon: Zap },
              { value: '24/7', label: t.stats.support, icon: Clock },
            ].map((stat, i) => {
              const IconComponent = stat.icon
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 group"
                >
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-xl mb-4 group-hover:bg-teal-200 transition-colors">
                      <IconComponent className="w-6 h-6 text-teal-600" />
                    </div>
                    <motion.div 
                      className="text-4xl sm:text-5xl font-bold text-teal-700 mb-2"
                      initial={{ scale: 1 }}
                      whileInView={{ scale: [1, 1.1, 1] }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-teal-900">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-teal-200 mb-10">
            {t.cta.subtitle}
          </p>
          <a 
            href={`${appUrl}/register`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-teal-900 font-bold rounded-xl text-xl hover:bg-teal-50 transition-colors"
          >
            {t.cta.button}
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-bold text-white mb-3">{t.footer.brandName}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.footer.description}
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">{t.footer.product}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#funkcje" className="hover:text-white transition-colors">{t.footer.productLinks.features}</Link></li>
                <li><Link href="#jak-to-dziala" className="hover:text-white transition-colors">{t.footer.productLinks.howItWorks}</Link></li>
                <li><Link href="#cennik" className="hover:text-white transition-colors">{t.footer.productLinks.pricing}</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">{t.footer.productLinks.help}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">{t.footer.industries}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#funkcje" className="hover:text-white transition-colors">{t.footer.industryLinks.beauty}</Link></li>
                <li><Link href="#funkcje" className="hover:text-white transition-colors">{t.footer.industryLinks.hair}</Link></li>
                <li><Link href="#funkcje" className="hover:text-white transition-colors">{t.footer.industryLinks.massage}</Link></li>
                <li><Link href="#funkcje" className="hover:text-white transition-colors">{t.footer.industryLinks.auto}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">{t.footer.company}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">{t.footer.companyLinks.contact}</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">{t.footer.companyLinks.privacy}</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">{t.footer.companyLinks.terms}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">{t.footer.developers}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">{t.footer.developerLinks.api}</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">{t.footer.developerLinks.widget}</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">{t.footer.developerLinks.integrations}</Link></li>
              </ul>
            </div>
          </div>
          
          {/* SEO Internal Links - Popularne wyszukiwania */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <p className="text-gray-500 text-xs mb-3">{locale === 'pl' ? 'Popularne wyszukiwania:' : 'Popular searches:'}</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <Link href="#funkcje" className="hover:text-gray-300 transition-colors">system rezerwacji online</Link>
              <span>•</span>
              <Link href="#funkcje" className="hover:text-gray-300 transition-colors">rezerwacje dla fryzjera</Link>
              <span>•</span>
              <Link href="#funkcje" className="hover:text-gray-300 transition-colors">kalendarz dla kosmetyczki</Link>
              <span>•</span>
              <Link href="#cennik" className="hover:text-gray-300 transition-colors">darmowy system rezerwacji</Link>
              <span>•</span>
              <Link href="#funkcje" className="hover:text-gray-300 transition-colors">rezerwacje salon beauty</Link>
              <span>•</span>
              <Link href="#funkcje" className="hover:text-gray-300 transition-colors">booking dla masażysty</Link>
              <span>•</span>
              <Link href="#funkcje" className="hover:text-gray-300 transition-colors">powiadomienia SMS</Link>
              <span>•</span>
              <Link href="/help" className="hover:text-gray-300 transition-colors">jak założyć rezerwacje online</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2026 {t.footer.brandName} - {t.footer.copyright}</p>
            <div className="flex items-center gap-6">
              {/* Social Media Links */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61583476963744" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/rezerwacja24" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/rezerwacja24" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
              <LanguageSwitcher variant="footer" />
              <div className="flex gap-6 text-gray-400 text-sm">
                <Link href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
                <Link href="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link>
                <Link href="/contact" className="hover:text-white transition-colors">{t.footer.contact}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Ikony dla funkcji (używane z tłumaczeniami)
const featureIcons = {
  calendar: Calendar,
  users: Users,
  bell: Bell,
  creditCard: CreditCard,
  barChart: BarChart3,
  usersRound: UsersRound,
  globe: Globe,
  package: Package,
  ticket: Ticket,
  gift: Gift,
  star: Star,
  layers: Layers,
  code: Code,
  refresh: RefreshCcw,
  shield: Shield,
  lock: Lock,
  zap: Zap,
  palette: Palette,
  clock: Clock,
}
