'use client'

import { useParams } from 'next/navigation'
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
  ArrowLeft,
  CheckCircle,
  Zap,
  Clock,
  TrendingUp,
  Star,
} from 'lucide-react'

// Pełne dane funkcji
const featuresData: Record<string, {
  icon: any
  color: string
  title: string
  subtitle: string
  description: string
  image: string
  benefits: { icon: any; title: string; description: string }[]
  features: string[]
  stats: { value: string; label: string }[]
  testimonial?: { quote: string; author: string; role: string }
}> = {
  'kalendarz': {
    icon: Calendar,
    color: 'from-teal-500 to-emerald-500',
    title: 'Kalendarz rezerwacji',
    subtitle: 'Zarządzaj wszystkimi rezerwacjami w jednym miejscu',
    description: 'Intuicyjny kalendarz z widokiem dziennym, tygodniowym i miesięcznym. Przeciągaj i upuszczaj wizyty, zarządzaj wieloma pracownikami jednocześnie. Kolorowe rezerwacje ułatwiają orientację.',
    image: '/screenshots/calendar.png',
    benefits: [
      { icon: Clock, title: 'Oszczędność czasu', description: 'Zarządzaj rezerwacjami 10x szybciej niż w tradycyjny sposób' },
      { icon: Users, title: 'Wielu pracowników', description: 'Każdy pracownik ma swój kalendarz z osobnymi ustawieniami' },
      { icon: Zap, title: 'Drag & Drop', description: 'Przeciągaj rezerwacje aby zmienić termin jednym ruchem' },
      { icon: TrendingUp, title: 'Pełna kontrola', description: 'Zobacz obłożenie i optymalizuj grafik' },
    ],
    features: [
      'Widok dzienny, tygodniowy i miesięczny',
      'Filtrowanie po pracownikach i usługach',
      'Kolorowe oznaczenia rezerwacji',
      'Przeciąganie i upuszczanie wizyt',
      'Blokowanie terminów i przerwy',
      'Widok listy rezerwacji',
      'Szybkie dodawanie nowych wizyt',
      'Historia zmian rezerwacji',
    ],
    stats: [
      { value: '10x', label: 'szybsze zarządzanie' },
      { value: '100%', label: 'kontrola nad grafikiem' },
      { value: '24/7', label: 'dostęp online' },
    ],
    testimonial: {
      quote: 'Kalendarz jest niesamowicie intuicyjny. Moi pracownicy nauczyli się go obsługiwać w 5 minut.',
      author: 'Anna Kowalska',
      role: 'Właścicielka salonu Beauty Studio',
    },
  },
  'crm': {
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    title: 'CRM i baza klientów',
    subtitle: 'Buduj relacje i zwiększaj lojalność klientów',
    description: 'Kompletna baza klientów z historią wizyt, notatkami i preferencjami. Segmentuj klientów, śledź ich aktywność i personalizuj komunikację.',
    image: '/screenshots/crm.png',
    benefits: [
      { icon: Users, title: 'Pełna historia', description: 'Wszystkie wizyty klienta w jednym miejscu' },
      { icon: Star, title: 'Notatki i preferencje', description: 'Zapisuj ważne informacje o klientach' },
      { icon: TrendingUp, title: 'Segmentacja', description: 'Grupuj klientów według różnych kryteriów' },
      { icon: Bell, title: 'Komunikacja', description: 'Wysyłaj spersonalizowane wiadomości' },
    ],
    features: [
      'Pełna historia wizyt każdego klienta',
      'Notatki i preferencje',
      'Dane kontaktowe i zgody RODO',
      'Segmentacja klientów',
      'Statystyki klienta (wydatki, częstotliwość)',
      'Eksport danych do Excel/CSV',
      'Import klientów z pliku',
      'Wyszukiwanie i filtrowanie',
    ],
    stats: [
      { value: '+40%', label: 'powracających klientów' },
      { value: '100%', label: 'zgodność z RODO' },
      { value: '∞', label: 'liczba klientów' },
    ],
  },
  'platnosci': {
    icon: CreditCard,
    color: 'from-violet-500 to-purple-500',
    title: 'Płatności online',
    subtitle: 'Przyjmuj płatności szybko i bezpiecznie',
    description: 'Integracja z najpopularniejszymi bramkami płatności: Stripe, Przelewy24, PayU. Przyjmuj przedpłaty, zaliczki lub pełne płatności za usługi.',
    image: '/screenshots/payments.png',
    benefits: [
      { icon: Shield, title: 'Bezpieczeństwo', description: 'Certyfikowane bramki płatności' },
      { icon: Zap, title: 'Szybkie płatności', description: 'Klient płaci w kilka sekund' },
      { icon: CreditCard, title: 'Wiele metod', description: 'Karty, BLIK, przelewy' },
      { icon: TrendingUp, title: 'Mniej no-shows', description: 'Przedpłaty zmniejszają nieobecności' },
    ],
    features: [
      'Integracja ze Stripe',
      'Integracja z Przelewy24',
      'Integracja z PayU',
      'Przedpłaty i zaliczki',
      'Płatność przy rezerwacji',
      'Automatyczne potwierdzenia',
      'Historia transakcji',
      'Zwroty i anulowania',
    ],
    stats: [
      { value: '-70%', label: 'mniej nieobecności' },
      { value: '3', label: 'bramki płatności' },
      { value: '0%', label: 'prowizji od nas' },
    ],
  },
  'powiadomienia': {
    icon: Bell,
    color: 'from-amber-500 to-orange-500',
    title: 'Powiadomienia SMS',
    subtitle: 'Automatyczne przypomnienia zmniejszają nieobecności',
    description: 'System automatycznie wysyła SMS-y z przypomnieniami o wizytach. Personalizuj treści, ustaw czas wysyłki i śledź skuteczność.',
    image: '/screenshots/notifications.png',
    benefits: [
      { icon: Bell, title: 'Automatyzacja', description: 'SMS-y wysyłają się same' },
      { icon: Clock, title: 'Elastyczny timing', description: 'Ustaw kiedy wysyłać przypomnienia' },
      { icon: TrendingUp, title: 'Mniej no-shows', description: 'Nawet 80% mniej nieobecności' },
      { icon: Users, title: 'Personalizacja', description: 'Dostosuj treść do swojej marki' },
    ],
    features: [
      'Automatyczne przypomnienia',
      'Potwierdzenia rezerwacji',
      'Powiadomienia o zmianach',
      'Powiadomienia o anulowaniu',
      'Personalizowane szablony',
      'Różne czasy wysyłki',
      'Historia wysłanych SMS',
      'Statystyki dostarczalności',
    ],
    stats: [
      { value: '-80%', label: 'mniej nieobecności' },
      { value: '99%', label: 'dostarczalność' },
      { value: '24h', label: 'przed wizytą' },
    ],
  },
  'analityka': {
    icon: BarChart3,
    color: 'from-rose-500 to-pink-500',
    title: 'Analityka i raporty',
    subtitle: 'Podejmuj decyzje oparte na danych',
    description: 'Szczegółowe statystyki i raporty. Śledź przychody, popularność usług, efektywność pracowników i trendy w rezerwacjach.',
    image: '/screenshots/analytics.png',
    benefits: [
      { icon: BarChart3, title: 'Dashboard', description: 'Wszystkie metryki w jednym miejscu' },
      { icon: TrendingUp, title: 'Trendy', description: 'Śledź wzrosty i spadki' },
      { icon: Users, title: 'Pracownicy', description: 'Porównuj efektywność zespołu' },
      { icon: CreditCard, title: 'Finanse', description: 'Kontroluj przychody i wydatki' },
    ],
    features: [
      'Dashboard z wykresami',
      'Raporty finansowe',
      'Statystyki usług',
      'Efektywność pracowników',
      'Trendy rezerwacji',
      'Eksport do Excel',
      'Raporty okresowe',
      'Porównania rok do roku',
    ],
    stats: [
      { value: '12+', label: 'rodzajów raportów' },
      { value: '∞', label: 'eksportów' },
      { value: '1 klik', label: 'do raportu' },
    ],
  },
  'strona-rezerwacji': {
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    title: 'Strona rezerwacji',
    subtitle: 'Twoja własna strona do rezerwacji online',
    description: 'Otrzymujesz własną subdomenę z profesjonalną stroną rezerwacji. Personalizuj kolory, dodaj logo i dostosuj do swojej marki.',
    image: '/screenshots/subdomain.png',
    benefits: [
      { icon: Globe, title: 'Własna subdomena', description: 'twoja-firma.rezerwacja24.pl' },
      { icon: Smartphone, title: 'Responsywność', description: 'Działa na każdym urządzeniu' },
      { icon: Zap, title: 'Szybka rezerwacja', description: 'Klient rezerwuje w 30 sekund' },
      { icon: Star, title: 'Profesjonalny wygląd', description: 'Nowoczesny design' },
    ],
    features: [
      'Własna subdomena',
      'Personalizacja kolorów',
      'Logo i branding',
      'Responsywny design',
      'Wybór usług i pracowników',
      'Kalendarz dostępności',
      'Formularz kontaktowy',
      'Integracja z płatnościami',
    ],
    stats: [
      { value: '24/7', label: 'dostępność' },
      { value: '30s', label: 'czas rezerwacji' },
      { value: '100%', label: 'Twoja marka' },
    ],
  },
  'widget': {
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-500',
    title: 'Widget na stronę',
    subtitle: 'Osadź rezerwacje na swojej stronie WWW',
    description: 'Jeden kod JavaScript - pełna funkcjonalność rezerwacji na Twojej stronie. Bez przekierowań, bez opuszczania Twojej witryny.',
    image: '/screenshots/widget-www.png',
    benefits: [
      { icon: Zap, title: 'Łatwa integracja', description: 'Jeden kod do wklejenia' },
      { icon: Smartphone, title: 'Responsywność', description: 'Dopasowuje się do strony' },
      { icon: Star, title: 'Personalizacja', description: 'Dostosuj wygląd do strony' },
      { icon: Users, title: 'Bez przekierowań', description: 'Klient zostaje na Twojej stronie' },
    ],
    features: [
      'Jeden kod do wklejenia',
      'Responsywny widget',
      'Personalizacja wyglądu',
      'Bez przekierowań',
      'Pełna funkcjonalność',
      'Automatyczne aktualizacje',
      'Wsparcie techniczne',
      'Dokumentacja integracji',
    ],
    stats: [
      { value: '1', label: 'linia kodu' },
      { value: '5 min', label: 'integracja' },
      { value: '∞', label: 'stron' },
    ],
  },
  'google-calendar': {
    icon: RefreshCcw,
    color: 'from-red-500 to-rose-500',
    title: 'Google Calendar',
    subtitle: 'Synchronizacja z Twoim kalendarzem',
    description: 'Dwukierunkowa synchronizacja z Google Calendar. Rezerwacje automatycznie pojawiają się w Twoim kalendarzu i odwrotnie.',
    image: '/screenshots/integrations.png',
    benefits: [
      { icon: RefreshCcw, title: 'Dwukierunkowa sync', description: 'Zmiany w obu kierunkach' },
      { icon: Zap, title: 'Automatyzacja', description: 'Bez ręcznego przepisywania' },
      { icon: Clock, title: 'Unikanie konfliktów', description: 'System sprawdza dostępność' },
      { icon: Shield, title: 'Prywatność', description: 'Bezpieczne połączenie OAuth' },
    ],
    features: [
      'Dwukierunkowa synchronizacja',
      'Automatyczne aktualizacje',
      'Unikanie konfliktów terminów',
      'Prywatność danych',
      'Bezpieczne połączenie OAuth',
      'Wybór kalendarzy',
      'Synchronizacja wielu kont',
      'Historia synchronizacji',
    ],
    stats: [
      { value: '2-way', label: 'synchronizacja' },
      { value: '5 min', label: 'opóźnienie max' },
      { value: '100%', label: 'automatyzacja' },
    ],
  },
  'promocje': {
    icon: Gift,
    color: 'from-pink-500 to-rose-500',
    title: 'Promocje i kupony',
    subtitle: 'Przyciągaj klientów atrakcyjnymi ofertami',
    description: 'Twórz kody rabatowe, promocje czasowe i specjalne oferty. Śledź wykorzystanie i mierz skuteczność kampanii.',
    image: '/screenshots/promotions.png',
    benefits: [
      { icon: Gift, title: 'Kody rabatowe', description: 'Twórz unikalne kody' },
      { icon: Clock, title: 'Promocje czasowe', description: 'Ustaw daty ważności' },
      { icon: TrendingUp, title: 'Śledzenie', description: 'Mierz skuteczność' },
      { icon: Users, title: 'Nowi klienci', description: 'Przyciągaj promocjami' },
    ],
    features: [
      'Kody rabatowe',
      'Zniżki procentowe i kwotowe',
      'Promocje czasowe',
      'Limity wykorzystania',
      'Śledzenie użycia',
      'Statystyki kampanii',
      'Promocje dla nowych klientów',
      'Promocje lojalnościowe',
    ],
    stats: [
      { value: '+25%', label: 'nowych klientów' },
      { value: '∞', label: 'kodów' },
      { value: '100%', label: 'kontrola' },
    ],
  },
  'pakiety': {
    icon: Package,
    color: 'from-cyan-500 to-blue-500',
    title: 'Pakiety usług',
    subtitle: 'Zwiększ średnią wartość zamówienia',
    description: 'Łącz usługi w atrakcyjne pakiety z lepszą ceną. Klienci oszczędzają, Ty zarabiasz więcej.',
    image: '/screenshots/dashboard-preview.png',
    benefits: [
      { icon: Package, title: 'Łączenie usług', description: 'Twórz atrakcyjne zestawy' },
      { icon: CreditCard, title: 'Lepsza cena', description: 'Zniżka za pakiet' },
      { icon: TrendingUp, title: 'Wyższe przychody', description: 'Większa wartość zamówienia' },
      { icon: Users, title: 'Zadowoleni klienci', description: 'Oszczędzają na pakietach' },
    ],
    features: [
      'Łączenie dowolnych usług',
      'Ceny pakietowe',
      'Oszczędność dla klientów',
      'Wyższe przychody',
      'Elastyczne konfiguracje',
      'Promocje na pakiety',
      'Statystyki sprzedaży',
      'Zarządzanie dostępnością',
    ],
    stats: [
      { value: '+35%', label: 'wyższa wartość' },
      { value: '∞', label: 'pakietów' },
      { value: 'Win-win', label: 'dla wszystkich' },
    ],
  },
  'karnety': {
    icon: Ticket,
    color: 'from-orange-500 to-amber-500',
    title: 'Karnety',
    subtitle: 'Buduj lojalność i zapewnij stały przychód',
    description: 'Sprzedawaj karnety na wielokrotne wizyty. Klienci kupują z góry, Ty masz pewny przychód.',
    image: '/screenshots/dashboard-preview.png',
    benefits: [
      { icon: Ticket, title: 'Wielokrotne wizyty', description: 'Jedna płatność, wiele wizyt' },
      { icon: CreditCard, title: 'Stały przychód', description: 'Płatność z góry' },
      { icon: Users, title: 'Lojalność', description: 'Klienci wracają' },
      { icon: TrendingUp, title: 'Przewidywalność', description: 'Planuj przychody' },
    ],
    features: [
      'Karnety na wizyty',
      'Różne typy karnetów',
      'Śledzenie wykorzystania',
      'Automatyczne odnawianie',
      'Daty ważności',
      'Transfery między klientami',
      'Statystyki sprzedaży',
      'Powiadomienia o wygasaniu',
    ],
    stats: [
      { value: '+50%', label: 'lojalność' },
      { value: '100%', label: 'pewny przychód' },
      { value: '∞', label: 'karnetów' },
    ],
  },
  'bezpieczenstwo': {
    icon: Shield,
    color: 'from-slate-600 to-slate-700',
    title: 'Bezpieczeństwo',
    subtitle: 'Twoje dane są u nas bezpieczne',
    description: 'Pełna zgodność z RODO, dwuskładnikowe uwierzytelnianie, szyfrowanie SSL i regularne kopie zapasowe.',
    image: '/screenshots/2fa.png',
    benefits: [
      { icon: Shield, title: 'RODO', description: 'Pełna zgodność z przepisami' },
      { icon: Zap, title: '2FA', description: 'Dwuskładnikowe uwierzytelnianie' },
      { icon: Globe, title: 'SSL', description: 'Szyfrowane połączenie' },
      { icon: RefreshCcw, title: 'Backupy', description: 'Codzienne kopie zapasowe' },
    ],
    features: [
      'Zgodność z RODO',
      'Uwierzytelnianie 2FA',
      'Szyfrowanie SSL/TLS',
      'Codzienne kopie zapasowe',
      'Serwery w UE',
      'Zarządzanie zgodami',
      'Eksport danych klientów',
      'Prawo do usunięcia danych',
    ],
    stats: [
      { value: '100%', label: 'zgodność RODO' },
      { value: '99.9%', label: 'uptime' },
      { value: 'EU', label: 'serwery' },
    ],
  },
}

export default function FeaturePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const feature = featuresData[slug]
  
  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Funkcja nie znaleziona</h1>
          <Link href="/funkcje" className="text-teal-600 hover:text-teal-700">
            Wróć do listy funkcji
          </Link>
        </div>
      </div>
    )
  }

  const Icon = feature.icon

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/funkcje"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wszystkie funkcje
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {feature.title}
              </h1>
              <p className="text-xl text-teal-400 mb-6">
                {feature.subtitle}
              </p>
              <p className="text-lg text-slate-300 mb-8">
                {feature.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Wypróbuj za darmo
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                >
                  Zobacz demo
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {feature.stats.map((stat, i) => (
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Korzyści</h2>
            <p className="text-lg text-gray-600">Dlaczego warto korzystać z tej funkcji</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {feature.benefits.map((benefit, i) => {
              const BenefitIcon = benefit.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
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

      {/* Features list */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Co zawiera ta funkcja</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {feature.features.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {feature.testimonial && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-2xl text-gray-900 mb-6">
              "{feature.testimonial.quote}"
            </blockquote>
            <div>
              <p className="font-bold text-gray-900">{feature.testimonial.author}</p>
              <p className="text-gray-500">{feature.testimonial.role}</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Wypróbuj {feature.title}
          </h2>
          <p className="text-xl text-teal-200 mb-8">
            7 dni za darmo. Bez karty kredytowej. Pełna funkcjonalność.
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
