'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Menu,
  X,
  Briefcase,
  ArrowRight,
  User,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLocale } from '@/hooks/useLocale'

// Przezroczysta nawigacja zintegrowana z hero (strona główna z katalogiem firm)
export default function CustomerNavigation() {
  const { locale } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const isEu = window.location.hostname.includes('bookings24.eu')
    setAppUrl(isEu ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])

  const t = {
    forBusiness: locale === 'pl' ? 'Dla biznesu' : 'For business',
    login: locale === 'pl' ? 'Panel klienta' : 'Customer panel',
    help: locale === 'pl' ? 'Pomoc' : 'Help',
    addBusiness: locale === 'pl' ? 'Dodaj swój biznes za darmo i zacznij przyjmować rezerwacje!' : 'Add your business for free and start accepting bookings!',
    startNow: locale === 'pl' ? 'Rozpocznij teraz' : 'Start now',
  }

  return (
    <>
      {/* Mini baner nad nawigacją - tylko desktop */}
      <div className="hidden lg:block absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 py-2">
            <Sparkles className="w-4 h-4 text-white/90" />
            <span className="text-sm text-white font-medium">{t.addBusiness}</span>
            <a 
              href="https://biz.rezerwacja24.pl/register" 
              className="px-3 py-1 text-xs font-semibold bg-white text-teal-700 rounded-full hover:bg-white/90 transition-colors"
            >
              {t.startNow} →
            </a>
          </div>
        </div>
      </div>

      {/* Przezroczysta nawigacja zintegrowana z hero */}
      <nav className="absolute top-0 lg:top-10 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - z filtrem brightness aby było białe na ciemnym tle */}
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png"
                alt="Rezerwacja24" 
                width={200} 
                height={60} 
                className="h-10 sm:h-12 w-auto brightness-0 invert"
                priority
              />
            </Link>
            
            {/* Desktop - minimalistyczne menu z białym tekstem */}
            <div className="hidden lg:flex items-center gap-6">
              <Link 
                href="/support" 
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {t.help}
              </Link>
              <a 
                href="https://biz.rezerwacja24.pl" 
                className="text-sm font-medium text-white hover:text-white/90 transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-4 h-4" />
                {t.forBusiness}
              </a>
              <Link 
                href="/logowanie" 
                className="px-4 py-2 text-sm font-medium text-teal-900 bg-white rounded-lg hover:bg-white/90 transition-colors"
              >
                {t.login}
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 text-white hover:text-white/80 transition-colors"
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
                className="lg:hidden fixed inset-0 z-40 bg-black/40"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl"
              >
                {/* Close button */}
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {/* Content */}
                <div className="pt-16 px-5 pb-8">
                  <nav className="space-y-2">
                    {/* Dla biznesu - wyróżniony */}
                    <a 
                      href="https://biz.rezerwacja24.pl" 
                      className="flex items-center gap-3 py-3 px-4 text-base text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold rounded-xl transition-colors"
                    >
                      <Briefcase className="w-5 h-5" />
                      {t.forBusiness}
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </a>
                    
                    <div className="my-4 border-t border-gray-100"></div>
                    
                    {/* Pomoc */}
                    <Link 
                      href="/support" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="flex items-center gap-3 py-3 px-4 text-base text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                    >
                      <HelpCircle className="w-5 h-5 text-gray-400" />
                      {t.help}
                    </Link>
                    
                    {/* Panel klienta */}
                    <Link 
                      href="/logowanie"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 text-base text-teal-700 bg-teal-50 hover:bg-teal-100 font-medium rounded-xl transition-colors"
                    >
                      <User className="w-5 h-5 text-teal-600" />
                      {t.login}
                    </Link>
                  </nav>
                  
                  {/* Language switcher */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <LanguageSwitcher variant="default" />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
