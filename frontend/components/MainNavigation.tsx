'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Menu,
  X,
  ChevronRight,
  Scissors,
  Stethoscope,
  Car,
  Dumbbell,
  GraduationCap,
  PawPrint,
  Home,
  UtensilsCrossed,
} from 'lucide-react'
import MegaMenu from '@/components/MegaMenu'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLocale } from '@/hooks/useLocale'

export default function MainNavigation() {
  const { locale } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState<string | null>(null)
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const isEu = window.location.hostname.includes('bookings24.eu')
    setAppUrl(isEu ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])

  const t = {
    nav: {
      login: locale === 'pl' ? 'Zaloguj się' : 'Log in',
      tryFree: locale === 'pl' ? 'Wypróbuj za darmo' : 'Try for free',
      features: locale === 'pl' ? 'Funkcje' : 'Features',
      forWhom: locale === 'pl' ? 'Dla kogo?' : 'For whom?',
      howItWorks: locale === 'pl' ? 'Jak to działa' : 'How it works',
      pricing: locale === 'pl' ? 'Cennik' : 'Pricing',
      contact: locale === 'pl' ? 'Kontakt' : 'Contact',
      allFeatures: locale === 'pl' ? 'Wszystkie funkcje →' : 'All features →',
      allCategories: locale === 'pl' ? 'Zobacz wszystkie kategorie →' : 'See all categories →',
    }
  }

  const featuresMenu = [
    { href: '/funkcje/kalendarz', label: locale === 'pl' ? 'Kalendarz rezerwacji' : 'Booking Calendar', icon: Calendar, color: 'from-teal-500 to-emerald-500' },
    { href: '/funkcje/crm', label: locale === 'pl' ? 'CRM i baza klientów' : 'CRM & Clients', icon: Users, color: 'from-blue-500 to-indigo-500' },
    { href: '/funkcje/platnosci', label: locale === 'pl' ? 'Płatności online' : 'Online Payments', icon: CreditCard, color: 'from-violet-500 to-purple-500' },
    { href: '/funkcje/powiadomienia', label: locale === 'pl' ? 'Powiadomienia SMS' : 'SMS Notifications', icon: Bell, color: 'from-amber-500 to-orange-500' },
    { href: '/funkcje/analityka', label: locale === 'pl' ? 'Analityka' : 'Analytics', icon: BarChart3, color: 'from-pink-500 to-rose-500' },
    { href: '/funkcje/wielojezycznosc', label: locale === 'pl' ? 'Wielojęzyczność' : 'Multi-language', icon: Globe, color: 'from-cyan-500 to-teal-500' },
    { href: '/funkcje/aplikacja', label: locale === 'pl' ? 'Aplikacja mobilna' : 'Mobile App', icon: Smartphone, color: 'from-slate-500 to-gray-600' },
    { href: '/funkcje/bezpieczenstwo', label: locale === 'pl' ? 'Bezpieczeństwo' : 'Security', icon: Shield, color: 'from-emerald-500 to-green-600' },
  ]

  const industriesMenu = [
    { href: '/beauty', label: 'Beauty & SPA', icon: Scissors, color: 'from-pink-500 to-rose-500' },
    { href: '/zdrowie', label: locale === 'pl' ? 'Zdrowie i medycyna' : 'Health & Medical', icon: Stethoscope, color: 'from-red-500 to-rose-500' },
    { href: '/motoryzacja', label: locale === 'pl' ? 'Motoryzacja' : 'Automotive', icon: Car, color: 'from-slate-600 to-slate-700' },
    { href: '/sport', label: locale === 'pl' ? 'Sport i fitness' : 'Sports & Fitness', icon: Dumbbell, color: 'from-orange-500 to-amber-500' },
    { href: '/edukacja', label: locale === 'pl' ? 'Edukacja' : 'Education', icon: GraduationCap, color: 'from-blue-500 to-indigo-500' },
    { href: '/zwierzeta', label: locale === 'pl' ? 'Usługi dla zwierząt' : 'Pet Services', icon: PawPrint, color: 'from-amber-500 to-yellow-500' },
    { href: '/dom', label: locale === 'pl' ? 'Dom i naprawa' : 'Home & Repair', icon: Home, color: 'from-emerald-500 to-teal-500' },
    { href: '/gastronomia', label: locale === 'pl' ? 'Gastronomia' : 'Gastronomy', icon: UtensilsCrossed, color: 'from-red-500 to-orange-500' },
  ]

  return (
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
          
          {/* Mobile menu button */}
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
                      <span>{t.nav.features}</span>
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
                            {featuresMenu.map((item) => {
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
                              {t.nav.allFeatures}
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
                      <span>{t.nav.forWhom}</span>
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
                            {industriesMenu.map((item) => {
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
                              {t.nav.allCategories}
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Separator */}
                  <div className="my-3 border-t border-gray-100"></div>
                  
                  {/* Other links */}
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
  )
}
