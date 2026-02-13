'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Users,
  CheckCircle,
  ArrowRight,
  Bell,
  CreditCard,
  Clock,
  Star,
  Zap,
  Shield,
  Sparkles,
  Globe,
  BarChart3,
} from 'lucide-react'
import MainNavigation from '@/components/MainNavigation'

const industryData = {
  title: 'System rezerwacji dla salonów kosmetycznych',
  subtitle: 'Profesjonalne zarządzanie rezerwacjami dla gabinetów kosmetycznych, beauty i SPA',
  heroImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop',
  color: 'pink',
  icon: Sparkles,
  benefits: [
    { icon: Calendar, title: 'Kalendarz online', description: 'Klientki rezerwują zabiegi 24/7 przez internet' },
    { icon: Bell, title: 'Przypomnienia SMS', description: 'Automatyczne przypomnienia zmniejszają nieobecności o 80%' },
    { icon: CreditCard, title: 'Płatności online', description: 'Przedpłaty za zabiegi zwiększają pewność rezerwacji' },
    { icon: Users, title: 'Baza klientek', description: 'Historia zabiegów, preferencje i notatki w jednym miejscu' },
  ],
  features: [
    'Rezerwacje online 24/7',
    'Przypomnienia SMS i email',
    'Kalendarz dla wielu kosmetyczek',
    'Płatności online (Stripe, Przelewy24)',
    'Pakiety zabiegów i karnety',
    'Promocje i kody rabatowe',
    'Synchronizacja z Google Calendar',
    'Własna strona rezerwacji',
    'Widget na Twoją stronę WWW',
    'Analityka i raporty',
    'CRM i baza klientek',
    'Zgodność z RODO',
  ],
  useCases: [
    'Salony kosmetyczne',
    'Gabinety beauty',
    'Makijażystki',
    'Stylistki paznokci',
    'Gabinety medycyny estetycznej',
    'Studia makijażu permanentnego',
  ],
  testimonial: {
    quote: 'Od kiedy używam Rezerwacja24, moje klientki same rezerwują zabiegi online. Oszczędzam 2 godziny dziennie na odbieraniu telefonów!',
    author: 'Magdalena Wiśniewska',
    role: 'Właścicielka Beauty Studio Mag',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  stats: [
    { value: '80%', label: 'mniej nieobecności' },
    { value: '2h', label: 'oszczędności dziennie' },
    { value: '24/7', label: 'rezerwacje online' },
    { value: '500+', label: 'salonów kosmetycznych' },
  ],
}

export default function KosmetyczkiPage() {
  const Icon = industryData.icon

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - identyczna jak na stronie głównej */}
      <MainNavigation />
      
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={industryData.heroImage}
            alt={industryData.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-teal-900/60 to-teal-900/40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-900/80 border border-teal-400/30 rounded-full mb-6">
              <Icon className="w-5 h-5 text-teal-300" />
              <span className="text-teal-300 font-medium">Dla salonów kosmetycznych</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {industryData.title}
            </h1>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl">
              {industryData.subtitle}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
              >
                Wypróbuj za darmo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="https://demo.rezerwacja24.pl"
                target="_blank"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors backdrop-blur-sm"
              >
                Zobacz demo
              </Link>
            </div>
            
            <p className="mt-6 text-teal-200 text-sm">
              ✓ 7 dni za darmo ✓ Bez karty kredytowej ✓ Pełna funkcjonalność
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {industryData.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-teal-600 mb-1">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
              Korzyści
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Dlaczego salony kosmetyczne wybierają Rezerwacja24?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industryData.benefits.map((benefit, i) => {
              const BenefitIcon = benefit.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BenefitIcon className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full mb-4">
                Funkcje
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Wszystko czego potrzebuje salon kosmetyczny
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Kompletny system do zarządzania rezerwacjami, klientkami i płatnościami w jednym miejscu.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {industryData.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <Link
                href="/funkcje"
                className="mt-8 inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700"
              >
                Zobacz wszystkie funkcje
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/10 to-teal-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <Image
                  src="/screenshots/dashboard-preview.png"
                  alt="Dashboard dla salonu kosmetycznego"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Dla kogo jest ten system?
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {industryData.useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-6 py-3 bg-teal-50 text-teal-700 rounded-full font-medium border border-teal-200"
              >
                {useCase}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-teal-400 fill-teal-400" />
            ))}
          </div>
          <blockquote className="text-2xl text-white mb-8">
            "{industryData.testimonial.quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <Image
              src={industryData.testimonial.image}
              alt={industryData.testimonial.author}
              width={56}
              height={56}
              className="rounded-full"
            />
            <div className="text-left">
              <p className="font-bold text-white">{industryData.testimonial.author}</p>
              <p className="text-teal-300">{industryData.testimonial.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Gotowa aby usprawnić swój salon?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Dołącz do setek salonów kosmetycznych, które już korzystają z Rezerwacja24
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Rozpocznij darmowy okres próbny
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-gray-500">
            7 dni za darmo • Bez karty kredytowej • Anuluj kiedy chcesz
          </p>
        </div>
      </section>
    </div>
  )
}
