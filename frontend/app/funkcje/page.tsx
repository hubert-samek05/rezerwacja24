'use client'

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
  CheckCircle,
} from 'lucide-react'

const features = [
  {
    id: 'kalendarz',
    icon: Calendar,
    color: 'from-teal-500 to-emerald-500',
    title: 'Kalendarz rezerwacji',
    description: 'Intuicyjny kalendarz z widokiem dziennym, tygodniowym i miesięcznym. Przeciągaj i upuszczaj wizyty, zarządzaj wieloma pracownikami.',
    image: '/screenshots/calendar.png',
    highlights: ['Widok dzienny, tygodniowy, miesięczny', 'Drag & drop', 'Filtrowanie po pracownikach', 'Kolorowe rezerwacje'],
  },
  {
    id: 'crm',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    title: 'CRM i baza klientów',
    description: 'Kompletna baza klientów z historią wizyt, notatkami i preferencjami. Buduj relacje i zwiększaj lojalność.',
    image: '/screenshots/crm.png',
    highlights: ['Historia wizyt', 'Notatki i preferencje', 'Segmentacja klientów', 'Eksport danych'],
  },
  {
    id: 'platnosci',
    icon: CreditCard,
    color: 'from-violet-500 to-purple-500',
    title: 'Płatności online',
    description: 'Przyjmuj płatności online przez Stripe, Przelewy24 lub PayU. Automatyczne faktury i rozliczenia.',
    image: '/screenshots/payments.png',
    highlights: ['Stripe, Przelewy24, PayU', 'Przedpłaty i zaliczki', 'Automatyczne faktury', 'Bezpieczne transakcje'],
  },
  {
    id: 'powiadomienia',
    icon: Bell,
    color: 'from-amber-500 to-orange-500',
    title: 'Powiadomienia SMS',
    description: 'Automatyczne przypomnienia SMS o wizytach. Zmniejsz liczbę nieobecności nawet o 80%.',
    image: '/screenshots/notifications.png',
    highlights: ['Automatyczne przypomnienia', 'Potwierdzenia rezerwacji', 'Powiadomienia o zmianach', 'Personalizowane treści'],
  },
  {
    id: 'analityka',
    icon: BarChart3,
    color: 'from-rose-500 to-pink-500',
    title: 'Analityka i raporty',
    description: 'Szczegółowe statystyki i raporty. Śledź przychody, popularność usług i efektywność pracowników.',
    image: '/screenshots/analytics.png',
    highlights: ['Dashboard z wykresami', 'Raporty finansowe', 'Statystyki usług', 'Eksport do Excel'],
  },
  {
    id: 'strona-rezerwacji',
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    title: 'Strona rezerwacji',
    description: 'Własna subdomena z personalizowaną stroną rezerwacji. Twoi klienci rezerwują 24/7.',
    image: '/screenshots/subdomain.png',
    highlights: ['Własna subdomena', 'Personalizacja kolorów', 'Logo i branding', 'Responsywny design'],
  },
  {
    id: 'widget',
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-500',
    title: 'Widget na stronę',
    description: 'Osadź formularz rezerwacji na swojej stronie WWW. Jeden kod - pełna funkcjonalność.',
    image: '/screenshots/widget-www.png',
    highlights: ['Łatwa integracja', 'Responsywny widget', 'Personalizacja wyglądu', 'Bez przekierowań'],
  },
  {
    id: 'google-calendar',
    icon: RefreshCcw,
    color: 'from-red-500 to-rose-500',
    title: 'Google Calendar',
    description: 'Dwukierunkowa synchronizacja z Google Calendar. Wszystkie rezerwacje w jednym miejscu.',
    image: '/screenshots/integrations.png',
    highlights: ['Dwukierunkowa sync', 'Automatyczne aktualizacje', 'Unikanie konfliktów', 'Prywatność danych'],
  },
  {
    id: 'promocje',
    icon: Gift,
    color: 'from-pink-500 to-rose-500',
    title: 'Promocje i kupony',
    description: 'Twórz kody rabatowe i promocje. Przyciągaj nowych klientów i nagradzaj stałych.',
    image: '/screenshots/promotions.png',
    highlights: ['Kody rabatowe', 'Promocje czasowe', 'Zniżki procentowe', 'Śledzenie wykorzystania'],
  },
  {
    id: 'pakiety',
    icon: Package,
    color: 'from-cyan-500 to-blue-500',
    title: 'Pakiety usług',
    description: 'Łącz usługi w atrakcyjne pakiety. Zwiększ średnią wartość zamówienia.',
    image: '/screenshots/dashboard-preview.png',
    highlights: ['Łączenie usług', 'Ceny pakietowe', 'Oszczędność dla klientów', 'Wyższe przychody'],
  },
  {
    id: 'karnety',
    icon: Ticket,
    color: 'from-orange-500 to-amber-500',
    title: 'Karnety',
    description: 'Sprzedawaj karnety na wielokrotne wizyty. Buduj lojalność i zapewnij stały przychód.',
    image: '/screenshots/dashboard-preview.png',
    highlights: ['Wielokrotne wizyty', 'Śledzenie wykorzystania', 'Automatyczne odnawianie', 'Różne typy karnetów'],
  },
  {
    id: 'bezpieczenstwo',
    icon: Shield,
    color: 'from-slate-600 to-slate-700',
    title: 'Bezpieczeństwo',
    description: 'Pełna zgodność z RODO, dwuskładnikowe uwierzytelnianie i szyfrowanie danych.',
    image: '/screenshots/2fa.png',
    highlights: ['Zgodność z RODO', 'Uwierzytelnianie 2FA', 'Szyfrowanie SSL', 'Kopie zapasowe'],
  },
]

export default function FunkcjePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-teal-500/20 text-teal-400 text-sm font-semibold rounded-full mb-6">
              Wszystkie funkcje
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Wszystko czego potrzebujesz<br />
              <span className="text-teal-400">w jednym miejscu</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
              Kompletny system rezerwacji online z kalendarzem, CRM, płatnościami, powiadomieniami SMS i wieloma innymi funkcjami.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
              >
                Wypróbuj za darmo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#cennik"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
              >
                Zobacz cennik
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/funkcje/${feature.id}`}
                    className="block h-full bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className={`absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.highlights.slice(0, 3).map((highlight, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex items-center gap-2 text-teal-600 font-medium text-sm group-hover:gap-3 transition-all">
                        Dowiedz się więcej
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Gotowy aby zacząć?
          </h2>
          <p className="text-xl text-teal-200 mb-8">
            Wypróbuj wszystkie funkcje za darmo przez 7 dni. Bez karty kredytowej.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-900 font-semibold rounded-xl hover:bg-teal-50 transition-colors"
          >
            Rozpocznij darmowy okres próbny
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
