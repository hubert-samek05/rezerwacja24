'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Shield, 
  Globe,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Bell,
  CreditCard,
  Menu,
  X,
  Code,
  Gift,
  Lock,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Layout,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [analyticsSlide, setAnalyticsSlide] = useState(0)
  
  // Auto-rotate analytics carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setAnalyticsSlide((prev) => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-accent-neon" />
              <span className="text-lg sm:text-2xl font-bold text-gradient">Rezerwacja24</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#funkcje" className="text-neutral-gray hover:text-accent-neon transition-colors">
                Funkcje
              </Link>
              <Link href="#cennik" className="text-neutral-gray hover:text-accent-neon transition-colors">
                Cennik
              </Link>
              <Link href="/contact" className="text-neutral-gray hover:text-accent-neon transition-colors">
                Kontakt
              </Link>
              <a href="https://app.rezerwacja24.pl/login" className="text-neutral-gray hover:text-accent-neon transition-colors">
                Zaloguj się
              </a>
              <a href="https://app.rezerwacja24.pl/register" className="btn-neon">
                Rozpocznij za darmo
              </a>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-gray" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-gray" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3 bg-carbon-black/95 backdrop-blur-lg">
                <Link
                  href="#funkcje"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-neutral-gray hover:text-accent-neon hover:bg-white/5 rounded-lg transition-colors"
                >
                  Funkcje
                </Link>
                <Link
                  href="#cennik"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-neutral-gray hover:text-accent-neon hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cennik
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-neutral-gray hover:text-accent-neon hover:bg-white/5 rounded-lg transition-colors"
                >
                  Kontakt
                </Link>
                <a
                  href="https://app.rezerwacja24.pl/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-neutral-gray hover:text-accent-neon hover:bg-white/5 rounded-lg transition-colors"
                >
                  Zaloguj się
                </a>
                <a
                  href="https://app.rezerwacja24.pl/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 btn-neon text-center"
                >
                  Rozpocznij za darmo
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              System rezerwacji online
              <br />
              <span className="text-gradient">dla twojej firmy</span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-neutral-gray/80 mb-6 sm:mb-10 max-w-3xl mx-auto">
              Kosmetyczka, fryzjer, branża motoryzacyjna czy biznes online? Bez znaczenia. 
              System rezerwacji dla każdej branży, dostosowany do każdej kategorii.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a href="https://app.rezerwacja24.pl/register" className="btn-neon text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                Wypróbuj za darmo
                <ArrowRight className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <Link href="#features" className="btn-outline-neon text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                Sprawdź funkcje
              </Link>
            </div>
            
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-neutral-gray/60">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent-neon" />
                <span>7 dni za darmo</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent-neon" />
                <span>Pełny dostęp do funkcji</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent-neon" />
                <span>Anuluj w każdej chwili</span>
              </div>
            </div>
          </motion.div>
          
          {/* Hero Image with Floating Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 sm:mt-16 relative"
          >
            <motion.div 
              className="glass-card p-2 sm:p-4"
              animate={{ 
                y: [0, -10, 0],
                boxShadow: [
                  '0 10px 40px rgba(0, 255, 136, 0.2)',
                  '0 20px 60px rgba(0, 255, 136, 0.4)',
                  '0 10px 40px rgba(0, 255, 136, 0.2)'
                ]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            >
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-primary-dark to-carbon-black">
                <Image
                  src="/dashboard-preview.png"
                  alt="Panel Rezerwacja24 - Dashboard"
                  fill
                  className="object-contain"
                  priority
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
                
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funkcje" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-primary-dark/20">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Funkcje systemu <span className="text-gradient">rezerwacji online</span>
            </h2>
            <p className="text-base sm:text-xl text-neutral-gray/70 max-w-2xl mx-auto">
              Kompletny system rezerwacji z kalendarzem, crm, powiadomieniami sms i płatnościami online
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="glass-card-hover p-6 sm:p-8"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-carbon-black" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-neutral-gray/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
                {/* Screenshot - Carousel for Analytics */}
                {feature.isCarousel ? (
                  <div className="relative">
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-primary-dark/50 to-carbon-black border border-white/10 shadow-2xl">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={analyticsSlide}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={feature.screenshots![analyticsSlide]}
                            alt={`${feature.title} - Screenshot ${analyticsSlide + 1}`}
                            fill
                            className="object-cover"
                            quality={100}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    {/* Carousel Controls */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <button
                        onClick={() => setAnalyticsSlide((prev) => (prev - 1 + 4) % 4)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((i) => (
                          <button
                            key={i}
                            onClick={() => setAnalyticsSlide(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                              analyticsSlide === i ? 'bg-accent-neon' : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setAnalyticsSlide((prev) => (prev + 1) % 4)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-primary-dark/50 to-carbon-black border border-white/10 shadow-2xl">
                    <Image
                      src={feature.screenshot!}
                      alt={`${feature.title} - Screenshot`}
                      fill
                      className="object-cover"
                      quality={100}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="cennik" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Cennik systemu <span className="text-gradient">rezerwacji online</span>
            </h2>
            <p className="text-base sm:text-xl text-neutral-gray/70 max-w-2xl mx-auto">
              Jeden plan, wszystkie funkcje. Bez ukrytych kosztów. Wypróbuj 7 dni za darmo!
            </p>
          </header>
          
          <div className="max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-10 ring-2 ring-accent-neon glow-neon"
              >
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left - Title & Price */}
                  <div className="text-center md:text-left">
                    <div className="inline-block px-4 py-2 bg-accent-neon text-carbon-black text-sm font-bold rounded-full mb-4">
                      Najlepszy wybór
                    </div>
                    
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl sm:text-5xl font-bold text-gradient">{plan.price} zł</span>
                      <span className="text-base text-neutral-gray/70">/miesiąc</span>
                    </div>
                    
                    <Link 
                      href="/register" 
                      className="btn-neon w-full text-center block text-base py-3"
                    >
                      Rozpocznij 7-dniowy trial
                    </Link>
                  </div>
                  
                  {/* Right - Features in 2 columns */}
                  <div className="md:col-span-2 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-accent-neon flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-gray/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-primary-dark/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-6 sm:p-12 text-center glow-neon"
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Wypróbuj system rezerwacji <span className="text-gradient">za darmo</span>
            </h2>
            <p className="text-base sm:text-xl text-neutral-gray/70 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Dołącz do firm, które już korzystają z systemu rezerwacji online i rozwijają swój biznes
            </p>
            <Link href="/register" className="btn-neon text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 inline-block">
              Rozpocznij 7-dniowy trial
              <ArrowRight className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-accent-neon" />
                <span className="text-lg sm:text-xl font-bold text-gradient">Rezerwacja24</span>
              </div>
              <p className="text-neutral-gray/70 text-xs sm:text-sm">
                Nowoczesny system rezerwacji dla Twojego biznesu
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Produkt</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-gray/70">
                <li><Link href="#features" className="hover:text-accent-neon transition-colors">Funkcje</Link></li>
                <li><Link href="#pricing" className="hover:text-accent-neon transition-colors">Cennik</Link></li>
                <li><Link href="/api-docs" className="hover:text-accent-neon transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Firma</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-gray/70">
                <li><Link href="/about" className="hover:text-accent-neon transition-colors">O nas</Link></li>
                <li><Link href="/blog" className="hover:text-accent-neon transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-accent-neon transition-colors">Kontakt</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Wsparcie</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-gray/70">
                <li><Link href="/help" className="hover:text-accent-neon transition-colors">Centrum pomocy</Link></li>
                <li><Link href="/docs" className="hover:text-accent-neon transition-colors">Dokumentacja</Link></li>
                <li><Link href="/privacy" className="hover:text-accent-neon transition-colors">Prywatność</Link></li>
                <li><Link href="/terms" className="hover:text-accent-neon transition-colors">Regulamin</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-neutral-gray/60">
            <p>&copy; 2024 Rezerwacja24. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Data - Zaktualizowane funkcje
const features: Array<{
  icon: any;
  title: string;
  description: string;
  screenshot?: string;
  screenshots?: string[];
  isCarousel?: boolean;
}> = [
  {
    icon: Calendar,
    title: 'Inteligentny Kalendarz',
    description: 'Zarządzaj rezerwacjami z zaawansowanym kalendarzem, który automatycznie optymalizuje harmonogram.',
    screenshot: '/screenshots/calendar.png'
  },
  {
    icon: Users,
    title: 'CRM Premium',
    description: 'Kompleksowa baza klientów z historią wizyt i segmentacją - zarządzaj relacjami z klientami.',
    screenshot: '/screenshots/crm.png'
  },
  {
    icon: Layout,
    title: 'Widget WWW',
    description: 'Osadź formularz rezerwacji na swojej stronie internetowej. Prosty kod do wklejenia.',
    screenshot: '/screenshots/widget-www.png'
  },
  {
    icon: Calendar,
    title: 'Integracje Kalendarzy',
    description: 'Synchronizacja z Google Calendar i Apple Calendar - wszystkie rezerwacje w jednym miejscu.',
    screenshot: '/screenshots/integrations.png'
  },
  {
    icon: Bell,
    title: 'Powiadomienia SMS',
    description: 'Automatyczne przypomnienia SMS 24h i 2h przed wizytą dla Twoich klientów.',
    screenshot: '/screenshots/notifications.png'
  },
  {
    icon: CreditCard,
    title: 'Menedżer Płatności',
    description: 'Przyjmuj płatności online przez Stripe, Przelewy24, PayU. Depozyty i pełne płatności.',
    screenshot: '/screenshots/payments.png'
  },
  {
    icon: Globe,
    title: 'Własna Subdomena',
    description: 'Każda firma dostaje unikalną subdomenę z profesjonalną stroną rezerwacji online.',
    screenshot: '/screenshots/subdomain.png'
  },
  {
    icon: Code,
    title: 'API Access',
    description: 'Pełne API REST do integracji z własnymi systemami i automatyzacji procesów biznesowych.',
    screenshot: '/screenshots/api.png'
  },
  {
    icon: FileCheck,
    title: 'RODO i Zgody',
    description: 'Pełna zgodność z RODO. Zarządzaj zgodami marketingowymi i przetwarzaniem danych klientów.',
    screenshot: '/screenshots/rodo.png'
  },
  {
    icon: Gift,
    title: 'Promocje',
    description: 'Twórz kody rabatowe, promocje sezonowe i oferty specjalne dla swoich klientów.',
    screenshot: '/screenshots/promotions.png'
  },
  {
    icon: Lock,
    title: 'Uwierzytelnianie 2FA',
    description: 'Dodatkowa warstwa bezpieczeństwa z dwuskładnikowym uwierzytelnianiem dla Twojego konta.',
    screenshot: '/screenshots/2fa.png'
  },
  {
    icon: BarChart3,
    title: 'Zaawansowana Analityka',
    description: 'Raporty, statystyki, heatmapy rezerwacji i wskaźniki KPI - podejmuj decyzje oparte na danych.',
    isCarousel: true,
    screenshots: [
      '/screenshots/analytics1.png',
      '/screenshots/analytics2.png',
      '/screenshots/analytics3.png',
      '/screenshots/analytics4.png'
    ]
  }
]

const pricingPlans = [
  {
    name: 'Plan Premium',
    price: '79.99',
    popular: true,
    features: [
      '7 dni darmowego okresu próbnego',
      'Nieograniczone rezerwacje',
      'Nieograniczeni pracownicy',
      'CRM Premium z historią klientów',
      '500 SMS/miesiąc',
      'Własna subdomena (twoja-firma.rezerwacja24.pl)',
      'Integracje z Google & Apple Calendar',
      'Automatyczne powiadomienia SMS & Email',
      'Menedżer płatności (Stripe, Przelewy24, PayU)',
      'Pełny dostęp do API',
      'Zaawansowana analityka i raporty',
      'Dedykowane wsparcie techniczne 24/7'
    ]
  }
]
