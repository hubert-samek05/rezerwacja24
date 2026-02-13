'use client'

import { useState, useEffect } from 'react'
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
  Clock,
  Star,
  Check,
  Zap,
  TrendingUp,
  Heart,
  Target,
  Award,
  Search,
} from 'lucide-react'
import MainNavigation from '@/components/MainNavigation'

// Dane funkcji
const featuresData: Record<string, {
  icon: any
  title: string
  subtitle: string
  description: string
  longDescription: string
  heroImage: string
  benefits: { icon: any; title: string; desc: string }[]
  features: string[]
  stats: { value: string; label: string }[]
  useCases: string[]
}> = {
  'kalendarz': {
    icon: Calendar,
    title: 'Kalendarz rezerwacji',
    subtitle: 'Wszystkie wizyty w jednym miejscu',
    description: 'Intuicyjny kalendarz z widokiem dziennym, tygodniowym i miesięcznym.',
    longDescription: 'Nasz kalendarz to serce całego systemu. Zaprojektowany z myślą o wygodzie, pozwala zarządzać wszystkimi wizytami w jednym miejscu. Funkcja drag & drop umożliwia błyskawiczne przenoszenie wizyt. Filtruj rezerwacje po pracownikach, usługach lub statusie. Kolorowe oznaczenia pomagają szybko identyfikować różne typy wizyt.',
    heroImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Clock, title: 'Oszczędność czasu', desc: 'Zarządzaj kalendarzem jednym kliknięciem' },
      { icon: Target, title: 'Pełna kontrola', desc: 'Widok wszystkich rezerwacji w jednym miejscu' },
      { icon: Zap, title: 'Szybkie zmiany', desc: 'Przeciągnij i upuść aby przenieść wizytę' },
    ],
    features: ['Widok dzienny, tygodniowy, miesięczny', 'Drag & drop rezerwacji', 'Filtrowanie po pracownikach', 'Kolorowe oznaczenia', 'Blokowanie terminów', 'Historia zmian', 'Widok wielu pracowników', 'Wykrywanie konfliktów'],
    stats: [{ value: '5h', label: 'oszczędności tygodniowo' }, { value: '0', label: 'podwójnych rezerwacji' }, { value: '100%', label: 'kontroli' }],
    useCases: ['Salony fryzjerskie', 'Gabinety kosmetyczne', 'Warsztaty samochodowe', 'Gabinety lekarskie', 'Studia fitness'],
  },
  'crm': {
    icon: Users,
    title: 'Baza klientów i CRM',
    subtitle: 'Poznaj swoich klientów lepiej',
    description: 'Kompletna kartoteka klientów z historią wizyt, notatkami i preferencjami.',
    longDescription: 'System CRM to znacznie więcej niż zwykła baza kontaktów. Każdy klient ma kartotekę z pełną historią wizyt i wydatków. Dodawaj notatki, zapisuj preferencje. Segmentuj klientów według częstotliwości wizyt lub wartości zakupów. Identyfikuj VIP-ów i klientów wymagających uwagi.',
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Heart, title: 'Lepsze relacje', desc: 'Pamiętaj o preferencjach każdego klienta' },
      { icon: TrendingUp, title: 'Więcej powrotów', desc: 'Klienci wracają gdy czują się docenieni' },
      { icon: Target, title: 'Personalizacja', desc: 'Dostosuj ofertę do potrzeb klienta' },
    ],
    features: ['Historia wizyt', 'Notatki i preferencje', 'Statystyki klienta', 'Segmentacja', 'Eksport do Excel', 'Zgodność z RODO', 'Wyszukiwanie', 'Tagi i kategorie'],
    stats: [{ value: '+40%', label: 'powracających klientów' }, { value: '∞', label: 'klientów w bazie' }, { value: '100%', label: 'historii' }],
    useCases: ['Budowanie lojalności', 'Personalizacja obsługi', 'Marketing targetowany', 'Analiza zachowań'],
  },
  'platnosci': {
    icon: CreditCard,
    title: 'Płatności online',
    subtitle: 'Przyjmuj płatności bez problemu',
    description: 'Integracja ze Stripe, Przelewy24 i PayU. Przyjmuj przedpłaty przy rezerwacji.',
    longDescription: 'Płatności online to ochrona Twojego biznesu. Wymagając przedpłaty, drastycznie zmniejszasz nieobecności. Klient który zapłacił prawie zawsze przychodzi. Integracja ze Stripe, Przelewy24 i PayU oznacza płatności kartą, BLIK-iem lub przelewem.',
    heroImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Shield, title: 'Mniej nieobecności', desc: 'Klienci którzy zapłacili przychodzą' },
      { icon: Zap, title: 'Szybsze rozliczenia', desc: 'Pieniądze na koncie od razu' },
      { icon: Heart, title: 'Wygoda dla klientów', desc: 'Karta, BLIK lub przelew' },
    ],
    features: ['Stripe, Przelewy24, PayU', 'Przedpłaty i zaliczki', 'Automatyczne potwierdzenia', 'Historia transakcji', 'Zwroty', 'Raporty finansowe', 'Bezpieczne transakcje', 'Faktury'],
    stats: [{ value: '-80%', label: 'nieobecności' }, { value: '24h', label: 'wypłata środków' }, { value: '100%', label: 'bezpieczeństwa' }],
    useCases: ['Zmniejszenie nieobecności', 'Pobieranie zaliczek', 'Sprzedaż pakietów', 'Rozliczenia online'],
  },
  'powiadomienia': {
    icon: Bell,
    title: 'Powiadomienia SMS',
    subtitle: 'Klienci nie zapomną o wizycie',
    description: 'Automatyczne przypomnienia SMS wysyłane przed wizytą.',
    longDescription: 'Nieobecności to jeden z największych problemów branży usługowej. Automatyczne przypomnienia SMS rozwiązują ten problem. Ustaw kiedy ma być wysłane przypomnienie. Personalizuj treść wiadomości. System wysyła też potwierdzenia rezerwacji.',
    heroImage: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&h=800&fit=crop',
    benefits: [
      { icon: TrendingUp, title: '80% mniej nieobecności', desc: 'Klienci z przypomnieniem przychodzą' },
      { icon: Zap, title: 'Pełna automatyzacja', desc: 'Ustaw raz, system wysyła sam' },
      { icon: Award, title: 'Profesjonalny wizerunek', desc: 'Klienci doceniają przypomnienia' },
    ],
    features: ['Automatyczne przypomnienia', 'Potwierdzenia rezerwacji', 'Powiadomienia o zmianach', 'Personalizowane szablony', 'Różne czasy wysyłki', 'Statystyki', 'SMS i email', 'Własna nazwa nadawcy'],
    stats: [{ value: '-80%', label: 'nieobecności' }, { value: '99%', label: 'dostarczalności' }, { value: '0', label: 'ręcznej pracy' }],
    useCases: ['Zmniejszenie nieobecności', 'Potwierdzanie rezerwacji', 'Informowanie o zmianach', 'Marketing SMS'],
  },
  'analityka': {
    icon: BarChart3,
    title: 'Raporty i statystyki',
    subtitle: 'Decyzje oparte na danych',
    description: 'Szczegółowe raporty i wykresy. Śledź przychody i popularność usług.',
    longDescription: 'Prowadzenie biznesu bez danych to jazda z zamkniętymi oczami. Dashboard z wykresami pokazuje przychody, liczbę rezerwacji i nowych klientów. Raporty finansowe pomagają śledzić rentowność. Statystyki usług pokazują co się sprzedaje najlepiej.',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Target, title: 'Lepsze decyzje', desc: 'Decyzje oparte na twardych danych' },
      { icon: TrendingUp, title: 'Wzrost przychodów', desc: 'Identyfikuj trendy i optymalizuj' },
      { icon: Clock, title: 'Oszczędność czasu', desc: 'Automatyczne raporty' },
    ],
    features: ['Dashboard z wykresami', 'Raporty finansowe', 'Statystyki usług', 'Efektywność pracowników', 'Trendy rezerwacji', 'Eksport do Excel', 'Porównania okresów', 'Cele i KPI'],
    stats: [{ value: '+25%', label: 'wzrost przychodów' }, { value: '100%', label: 'przejrzystości' }, { value: '1 klik', label: 'do raportu' }],
    useCases: ['Analiza przychodów', 'Optymalizacja oferty', 'Ocena pracowników', 'Planowanie rozwoju'],
  },
  'strona-rezerwacji': {
    icon: Globe,
    title: 'Strona rezerwacji',
    subtitle: 'Twoja wizytówka online',
    description: 'Własna subdomena z profesjonalną stroną rezerwacji.',
    longDescription: 'Nie masz strony internetowej? Z Rezerwacja24 dostajesz własną subdomenę z profesjonalną stroną rezerwacji. Personalizuj kolory, dodaj logo, opisz usługi i ceny. Klienci mogą rezerwować 24/7 z telefonu, tabletu lub komputera.',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Globe, title: 'Rezerwacje 24/7', desc: 'Klienci rezerwują kiedy chcą' },
      { icon: Award, title: 'Profesjonalny wizerunek', desc: 'Własna strona z Twoim logo' },
      { icon: Zap, title: 'Bez dodatkowych kosztów', desc: 'Strona w cenie abonamentu' },
    ],
    features: ['Własna subdomena', 'Personalizacja kolorów', 'Logo i branding', 'Responsywny design', 'Lista usług i cen', 'Wybór pracownika', 'Galeria zdjęć', 'Mapa i kontakt'],
    stats: [{ value: '24/7', label: 'dostępność' }, { value: '+30%', label: 'więcej rezerwacji' }, { value: '0 zł', label: 'dodatkowych kosztów' }],
    useCases: ['Firmy bez strony WWW', 'Dodatkowy kanał rezerwacji', 'Profesjonalna wizytówka', 'Rezerwacje 24/7'],
  },
  'widget': {
    icon: Smartphone,
    title: 'Widget na stronę WWW',
    subtitle: 'Rezerwacje na Twojej stronie',
    description: 'Osadź formularz rezerwacji na swojej stronie. Jeden kod JavaScript.',
    longDescription: 'Masz już stronę internetową? Osadź nasz widget rezerwacji i pozwól klientom umawiać się bez opuszczania Twojej strony. Wystarczy wkleić jeden kod JavaScript. Widget jest responsywny i dopasowuje się do wyglądu Twojej strony.',
    heroImage: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Target, title: 'Klient zostaje u Ciebie', desc: 'Rezerwacja bez opuszczania strony' },
      { icon: Zap, title: 'Łatwa integracja', desc: 'Jeden kod do wklejenia' },
      { icon: TrendingUp, title: 'Więcej konwersji', desc: 'Krótszy proces rezerwacji' },
    ],
    features: ['Jeden kod do wklejenia', 'Responsywny widget', 'Personalizacja wyglądu', 'Bez przekierowań', 'Automatyczne aktualizacje', 'Dokumentacja', 'Wsparcie techniczne', 'Różne rozmiary'],
    stats: [{ value: '5 min', label: 'integracja' }, { value: '+20%', label: 'konwersji' }, { value: '100%', label: 'responsywności' }],
    useCases: ['Strony firmowe', 'Blogi i portale', 'Sklepy internetowe', 'Landing page'],
  },
  'google-calendar': {
    icon: RefreshCcw,
    title: 'Google Calendar',
    subtitle: 'Wszystko w jednym kalendarzu',
    description: 'Dwukierunkowa synchronizacja z Google Calendar.',
    longDescription: 'Korzystasz z Google Calendar? Połącz go z Rezerwacja24 i miej wszystko w jednym miejscu. Synchronizacja jest dwukierunkowa - rezerwacje z systemu pojawiają się w Google Calendar, a wydarzenia z Google blokują terminy.',
    heroImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Target, title: 'Jeden kalendarz', desc: 'Wszystkie wydarzenia w jednym miejscu' },
      { icon: Shield, title: 'Bez konfliktów', desc: 'Automatyczne blokowanie terminów' },
      { icon: Zap, title: 'Automatyzacja', desc: 'Synchronizacja działa sama' },
    ],
    features: ['Dwukierunkowa sync', 'Automatyczne aktualizacje', 'Unikanie konfliktów', 'Bezpieczne OAuth', 'Wybór kalendarzy', 'Historia sync', 'Powiadomienia o błędach', 'Ręczna synchronizacja'],
    stats: [{ value: '5 min', label: 'interwał sync' }, { value: '100%', label: 'dokładności' }, { value: '0', label: 'konfliktów' }],
    useCases: ['Użytkownicy Google Calendar', 'Unikanie podwójnych rezerwacji', 'Integracja z narzędziami', 'Praca zespołowa'],
  },
  'promocje': {
    icon: Gift,
    title: 'Promocje i kupony',
    subtitle: 'Przyciągaj klientów ofertami',
    description: 'Twórz kody rabatowe, promocje czasowe i specjalne oferty.',
    longDescription: 'Promocje to potężne narzędzie marketingowe. Twórz kody rabatowe dla nowych klientów, promocje urodzinowe, zniżki sezonowe. Ustaw zniżkę procentową lub kwotową, określ limit wykorzystania i datę ważności.',
    heroImage: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Users, title: 'Nowi klienci', desc: 'Przyciągaj atrakcyjnymi ofertami' },
      { icon: Heart, title: 'Lojalność', desc: 'Nagradzaj stałych klientów' },
      { icon: TrendingUp, title: 'Mierzalne wyniki', desc: 'Śledź skuteczność promocji' },
    ],
    features: ['Kody rabatowe', 'Zniżki procentowe i kwotowe', 'Promocje czasowe', 'Limity wykorzystania', 'Śledzenie użycia', 'Statystyki', 'Promocje urodzinowe', 'Kody jednorazowe'],
    stats: [{ value: '+35%', label: 'nowych klientów' }, { value: '100%', label: 'kontroli' }, { value: '∞', label: 'promocji' }],
    useCases: ['Pozyskiwanie klientów', 'Promocje sezonowe', 'Programy lojalnościowe', 'Marketing szeptany'],
  },
  'pakiety': {
    icon: Package,
    title: 'Pakiety usług',
    subtitle: 'Zwiększ wartość zamówienia',
    description: 'Łącz usługi w atrakcyjne pakiety z lepszą ceną.',
    longDescription: 'Pakiety usług to sprawdzony sposób na zwiększenie średniej wartości zamówienia. Połącz popularne usługi w atrakcyjne zestawy z lepszą ceną. Klient dostaje więcej za mniej, Ty zarabiasz więcej na każdej wizycie.',
    heroImage: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=800&fit=crop',
    benefits: [
      { icon: TrendingUp, title: 'Wyższe przychody', desc: 'Klienci kupują więcej usług' },
      { icon: Heart, title: 'Zadowoleni klienci', desc: 'Oszczędzają kupując pakiet' },
      { icon: Zap, title: 'Łatwe zarządzanie', desc: 'Twórz pakiety w kilka kliknięć' },
    ],
    features: ['Łączenie usług', 'Ceny pakietowe', 'Elastyczne konfiguracje', 'Promocje na pakiety', 'Statystyki sprzedaży', 'Zarządzanie dostępnością', 'Pakiety czasowe', 'Pakiety dla grup'],
    stats: [{ value: '+45%', label: 'wartości zamówienia' }, { value: '3x', label: 'więcej usług' }, { value: '∞', label: 'pakietów' }],
    useCases: ['Zwiększenie wartości', 'Promocja usług', 'Oferty sezonowe', 'Pakiety prezentowe'],
  },
  'karnety': {
    icon: Ticket,
    title: 'Karnety',
    subtitle: 'Stały przychód i lojalność',
    description: 'Sprzedawaj karnety na wielokrotne wizyty.',
    longDescription: 'Karnety to gwarancja stałego przychodu i lojalnych klientów. Sprzedaj karnet na 10 wizyt w cenie 8, a klient będzie wracał. System automatycznie śledzi wykorzystanie, wysyła przypomnienia o kończącym się karnecie.',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop',
    benefits: [
      { icon: TrendingUp, title: 'Stały przychód', desc: 'Pieniądze z góry' },
      { icon: Heart, title: 'Lojalni klienci', desc: 'Klient z karnetem wraca' },
      { icon: Target, title: 'Przewidywalność', desc: 'Wiesz ile wizyt oczekiwać' },
    ],
    features: ['Karnety na wizyty', 'Karnety czasowe', 'Różne typy', 'Śledzenie wykorzystania', 'Daty ważności', 'Powiadomienia', 'Automatyczne odnawianie', 'Statystyki'],
    stats: [{ value: '+60%', label: 'retencji' }, { value: '100%', label: 'przychodu z góry' }, { value: '∞', label: 'karnetów' }],
    useCases: ['Studia fitness', 'Salony masażu', 'Fizjoterapia', 'Szkoły tańca'],
  },
  'bezpieczenstwo': {
    icon: Shield,
    title: 'Bezpieczeństwo',
    subtitle: 'Twoje dane są bezpieczne',
    description: 'RODO, 2FA, szyfrowanie SSL, kopie zapasowe.',
    longDescription: 'Bezpieczeństwo danych to nasz priorytet. System jest zgodny z RODO - zarządzaj zgodami, eksportuj dane, realizuj prawo do usunięcia. Dwuskładnikowe uwierzytelnianie chroni Twoje konto. Wszystkie połączenia są szyfrowane SSL.',
    heroImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=800&fit=crop',
    benefits: [
      { icon: Shield, title: 'Zgodność z RODO', desc: 'Spełniamy wszystkie wymogi' },
      { icon: Award, title: 'Spokój ducha', desc: 'Dane są bezpieczne' },
      { icon: Zap, title: 'Bez przestojów', desc: '99.9% dostępności' },
    ],
    features: ['Zgodność z RODO', 'Uwierzytelnianie 2FA', 'Szyfrowanie SSL', 'Kopie zapasowe', 'Serwery w UE', 'Zarządzanie zgodami', 'Eksport danych', 'Prawo do usunięcia'],
    stats: [{ value: '100%', label: 'zgodności RODO' }, { value: '99.9%', label: 'dostępności' }, { value: 'EU', label: 'serwery' }],
    useCases: ['Wszystkie branże', 'Dane osobowe', 'Gabinety medyczne', 'Firmy dbające o bezpieczeństwo'],
  },
}

// Mockupy - responsywne
const MockupKalendarz = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-teal-600 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
      <span className="text-white font-semibold text-sm sm:text-base">Luty 2026</span>
      <div className="flex gap-1">
        <span className="px-2 py-1 bg-white text-teal-700 text-xs font-medium rounded">Tydzień</span>
      </div>
    </div>
    <div className="p-2 sm:p-3">
      {['9:00', '10:00', '11:00', '12:00'].map((time, i) => (
        <div key={time} className="flex gap-1 sm:gap-2 mb-1 sm:mb-2">
          <span className="text-xs text-gray-400 w-8 sm:w-10 py-1 sm:py-2">{time}</span>
          <div className="flex-1 grid grid-cols-3 gap-1">
            {[0,1,2].map(j => {
              const hasEvent = (i === 0 && j === 0) || (i === 1 && j === 2) || (i === 2 && j === 1)
              const names = ['Anna K.', 'Maria W.', 'Ewa N.']
              const colors = ['bg-teal-100 border-teal-400', 'bg-violet-100 border-violet-400', 'bg-pink-100 border-pink-400']
              return (
                <div key={j} className={`py-1 sm:py-2 px-1 sm:px-2 rounded text-xs ${hasEvent ? `${colors[j]} border-l-2` : 'bg-gray-50'}`}>
                  {hasEvent && <span className="font-medium text-gray-700">{names[j]}</span>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const MockupCRM = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-blue-600 px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
        <Search className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
        <span className="text-white/70 text-xs sm:text-sm">Szukaj klienta...</span>
      </div>
    </div>
    <div className="divide-y">
      {[
        { name: 'Anna Kowalska', visits: 24, value: '2 450 zł', color: 'bg-teal-500' },
        { name: 'Maria Nowak', visits: 18, value: '1 890 zł', color: 'bg-violet-500' },
        { name: 'Ewa Wiśniewska', visits: 12, value: '980 zł', color: 'bg-pink-500' },
      ].map((client, i) => (
        <div key={i} className="px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 ${client.color} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm`}>
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{client.name}</p>
            <p className="text-xs text-gray-500">{client.visits} wizyt</p>
          </div>
          <span className="font-bold text-gray-900 text-sm">{client.value}</span>
        </div>
      ))}
    </div>
  </div>
)

const MockupPlatnosci = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-violet-600 px-3 sm:px-4 py-4 sm:py-6 text-center">
      <p className="text-white/70 text-xs sm:text-sm mb-1">Do zapłaty</p>
      <p className="text-2xl sm:text-3xl font-bold text-white">150,00 zł</p>
    </div>
    <div className="p-3 sm:p-4">
      <div className="space-y-2 mb-3 sm:mb-4">
        {['Karta płatnicza', 'BLIK', 'Przelew'].map((method, i) => (
          <div key={method} className={`p-2 sm:p-3 rounded-lg border-2 flex items-center gap-2 ${i === 0 ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}>
            <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'border-violet-500 bg-violet-500' : 'border-gray-300'}`}>
              {i === 0 && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${i === 0 ? 'font-medium text-violet-700' : 'text-gray-600'}`}>{method}</span>
          </div>
        ))}
      </div>
      <button className="w-full py-2 sm:py-3 bg-violet-600 text-white font-semibold rounded-lg text-sm">
        Zapłać 150,00 zł
      </button>
    </div>
  </div>
)

const MockupPowiadomienia = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-amber-500 px-3 sm:px-4 py-2 sm:py-3">
      <span className="text-white font-semibold text-sm">Historia SMS</span>
    </div>
    <div className="divide-y">
      {[
        { client: 'Anna Kowalska', time: '10:00', status: 'sent' },
        { client: 'Maria Nowak', time: '9:30', status: 'sent' },
        { client: 'Jan Kowalski', time: 'Jutro', status: 'scheduled' },
      ].map((item, i) => (
        <div key={i} className="px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${item.status === 'sent' ? 'bg-green-100' : 'bg-amber-100'}`}>
            {item.status === 'sent' ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" /> : <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">{item.client}</p>
            <p className="text-xs text-gray-500">Przypomnienie</p>
          </div>
          <span className="text-xs text-gray-400">{item.time}</span>
        </div>
      ))}
    </div>
  </div>
)

const MockupAnalityka = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-rose-500 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
      <span className="text-white font-semibold text-sm">Przychody</span>
      <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded">+23%</span>
    </div>
    <div className="p-3 sm:p-4">
      <div className="flex items-end gap-1 h-20 sm:h-28 mb-3 sm:mb-4">
        {[35, 50, 40, 65, 55, 80, 70, 90].map((h, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t" style={{ height: `${h}%` }}></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Przychód', value: '12.4k' },
          { label: 'Rezerwacje', value: '156' },
          { label: 'Klienci', value: '89' },
        ].map((stat, i) => (
          <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm sm:text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Mockup Karnety
const MockupKarnety = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 sm:px-4 py-3 sm:py-4">
      <span className="text-white font-semibold text-sm">Aktywne karnety</span>
    </div>
    <div className="p-3 sm:p-4 space-y-3">
      {[
        { name: 'Karnet 10 wejść', used: 7, total: 10, client: 'Anna K.', color: 'bg-orange-500' },
        { name: 'Karnet miesięczny', used: 12, total: 30, client: 'Maria N.', color: 'bg-amber-500' },
        { name: 'Karnet 5 wejść', used: 4, total: 5, client: 'Ewa W.', color: 'bg-yellow-500' },
      ].map((karnet, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900 text-sm">{karnet.name}</span>
            <span className="text-xs text-gray-500">{karnet.client}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${karnet.color} rounded-full`} style={{ width: `${(karnet.used / karnet.total) * 100}%` }}></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">{karnet.used}/{karnet.total} wykorzystane</span>
            <span className="text-xs font-medium text-orange-600">{karnet.total - karnet.used} pozostało</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Mockup Promocje
const MockupPromocje = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-3 sm:px-4 py-3 sm:py-4">
      <span className="text-white font-semibold text-sm">Aktywne promocje</span>
    </div>
    <div className="p-3 sm:p-4 space-y-3">
      {[
        { code: 'NOWY20', discount: '-20%', uses: 45, limit: 100, active: true },
        { code: 'LATO2026', discount: '-15%', uses: 78, limit: 100, active: true },
        { code: 'VIP50', discount: '-50 zł', uses: 12, limit: 20, active: true },
      ].map((promo, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
            <span className="text-pink-600 font-bold text-xs">{promo.discount}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gray-900 text-sm">{promo.code}</span>
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">Aktywny</span>
            </div>
            <span className="text-xs text-gray-500">{promo.uses}/{promo.limit} użyć</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Mockup Google Calendar
const MockupGoogleCalendar = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-gradient-to-r from-red-500 to-rose-500 px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2">
      <RefreshCcw className="w-4 h-4 text-white" />
      <span className="text-white font-semibold text-sm">Synchronizacja</span>
    </div>
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-green-800 text-sm">Połączono</p>
            <p className="text-xs text-green-600">Google Calendar</p>
          </div>
        </div>
        <span className="text-xs text-green-600">Sync: 2 min temu</span>
      </div>
      <div className="space-y-2">
        {[
          { event: 'Anna K. - Strzyżenie', time: '10:00', synced: true },
          { event: 'Maria N. - Koloryzacja', time: '11:30', synced: true },
          { event: 'Spotkanie prywatne', time: '14:00', synced: false },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${item.synced ? 'bg-teal-500' : 'bg-gray-400'}`}></div>
            <span className="flex-1 text-sm text-gray-700 truncate">{item.event}</span>
            <span className="text-xs text-gray-400">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Mockup Widget
const MockupWidget = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 sm:px-4 py-3 sm:py-4">
      <span className="text-white font-semibold text-sm">Widget na stronie</span>
    </div>
    <div className="p-3 sm:p-4">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 mb-3">
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <div className="w-8 h-8 bg-teal-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-700">Zarezerwuj wizytę</p>
          <p className="text-xs text-gray-500">Wybierz termin online</p>
        </div>
      </div>
      <div className="bg-gray-900 rounded-lg p-2 font-mono text-xs text-green-400 overflow-hidden">
        <span className="text-gray-500">&lt;script src="</span>rezerwacja24.pl/widget.js<span className="text-gray-500">"&gt;&lt;/script&gt;</span>
      </div>
    </div>
  </div>
)

// Mockup Strona rezerwacji
const MockupStronaRezerwacji = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-3 sm:px-4 py-3 sm:py-4">
      <span className="text-white font-semibold text-sm">Twoja strona</span>
    </div>
    <div className="p-3 sm:p-4">
      <div className="bg-gray-100 rounded-lg p-2 mb-3 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-500 truncate">
          twoja-firma.rezerwacja24.pl
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-gradient-to-r from-indigo-100 to-violet-100 rounded"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
        <div className="h-8 bg-indigo-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-medium">Zarezerwuj</span>
        </div>
      </div>
    </div>
  </div>
)

// Mockup Pakiety
const MockupPakiety = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-3 sm:px-4 py-3 sm:py-4">
      <span className="text-white font-semibold text-sm">Pakiety usług</span>
    </div>
    <div className="p-3 sm:p-4 space-y-3">
      {[
        { name: 'Pakiet Relaks', services: ['Masaż 60min', 'Sauna'], price: '180 zł', oldPrice: '220 zł' },
        { name: 'Pakiet Beauty', services: ['Manicure', 'Pedicure'], price: '120 zł', oldPrice: '150 zł' },
      ].map((pkg, i) => (
        <div key={i} className="p-3 border border-gray-200 rounded-xl hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-900 text-sm">{pkg.name}</span>
            <div className="text-right">
              <span className="text-xs text-gray-400 line-through">{pkg.oldPrice}</span>
              <span className="ml-1 font-bold text-cyan-600">{pkg.price}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {pkg.services.map((s, j) => (
              <span key={j} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs rounded">{s}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Mockup Bezpieczeństwo
const MockupBezpieczenstwo = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-3 sm:px-4 py-3 sm:py-4">
      <span className="text-white font-semibold text-sm">Status bezpieczeństwa</span>
    </div>
    <div className="p-3 sm:p-4 space-y-3">
      {[
        { label: 'Szyfrowanie SSL', status: 'active', icon: Shield },
        { label: 'Uwierzytelnianie 2FA', status: 'active', icon: Shield },
        { label: 'Zgodność RODO', status: 'active', icon: CheckCircle },
        { label: 'Kopie zapasowe', status: 'active', icon: CheckCircle },
      ].map((item, i) => {
        const ItemIcon = item.icon
        return (
          <div key={i} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <ItemIcon className="w-4 h-4 text-white" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Aktywne</span>
          </div>
        )
      })}
    </div>
  </div>
)

const MockupDefault = ({ Icon }: { Icon: any }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <div className="bg-teal-600 px-3 sm:px-4 py-6 sm:py-8 flex items-center justify-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>
    </div>
    <div className="p-3 sm:p-4 space-y-2">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const mockups: Record<string, React.FC> = {
  'kalendarz': MockupKalendarz,
  'crm': MockupCRM,
  'platnosci': MockupPlatnosci,
  'powiadomienia': MockupPowiadomienia,
  'analityka': MockupAnalityka,
  'karnety': MockupKarnety,
  'promocje': MockupPromocje,
  'google-calendar': MockupGoogleCalendar,
  'widget': MockupWidget,
  'strona-rezerwacji': MockupStronaRezerwacji,
  'pakiety': MockupPakiety,
  'bezpieczenstwo': MockupBezpieczenstwo,
}

export default function FeaturePage() {
  const params = useParams()
  const slug = params.slug as string
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    setAppUrl(hostname.includes('bookings24.eu') ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])
  
  const feature = featuresData[slug]
  
  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Funkcja nie znaleziona</h1>
          <Link href="/funkcje" className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700">
            <ArrowLeft className="w-4 h-4" /> Wróć do listy
          </Link>
        </div>
      </div>
    )
  }

  const Icon = feature.icon
  const Mockup = mockups[slug]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - identyczna jak na stronie głównej */}
      <MainNavigation />

      {/* Hero */}
      <section className="pt-14 sm:pt-16">
        {/* Hero image background */}
        <div className="relative">
          <div className="absolute inset-0 h-64 sm:h-80 lg:h-96">
            <Image 
              src={feature.heroImage} 
              alt={feature.title} 
              fill 
              className="object-cover" 
              priority 
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/ANK6f1C4vNPjnuYY45XJJVCSB+Z+1WaUpVTMxY2TYlj/2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
            <Link href="/funkcje" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 sm:mb-6">
              <ArrowLeft className="w-4 h-4" /> Wszystkie funkcje
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
              {/* Left - Text */}
              <div className="pt-4 sm:pt-8 lg:pt-16">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-2 sm:mb-4">
                  {feature.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-3 sm:mb-4">{feature.subtitle}</p>
                <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8 max-w-lg">{feature.description}</p>
                
                <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors text-sm sm:text-base shadow-lg">
                  Wypróbuj za darmo <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
              
              {/* Right - Mockup */}
              <div className="mt-4 sm:mt-0 lg:pt-8">
                {Mockup ? <Mockup /> : <MockupDefault Icon={Icon} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-12 bg-slate-900 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {feature.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl lg:text-4xl font-bold text-teal-400 mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description + Benefits */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <div>
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4">
                O funkcji
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{feature.title} w szczegółach</h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">{feature.longDescription}</p>
              <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-sm sm:text-base">
                Wypróbuj teraz <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {feature.benefits.map((benefit, i) => {
                const BenefitIcon = benefit.icon
                return (
                  <div key={i} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BenefitIcon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Wszystkie możliwości</h2>
            <p className="text-sm sm:text-base text-gray-600">Co zawiera {feature.title}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {feature.features.map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Idealne dla</h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {feature.useCases.map((useCase, i) => (
              <span key={i} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-full text-sm text-gray-700 font-medium">
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">Wypróbuj {feature.title}</h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-400 mb-6 sm:mb-10">7 dni za darmo. Bez karty kredytowej.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href={`${appUrl}/register`} className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors text-sm sm:text-lg">
              Załóż darmowe konto <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <Link href="/funkcje" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-white font-medium rounded-xl border-2 border-white/20 hover:bg-white/10 transition-colors text-sm sm:text-lg">
              Zobacz inne funkcje
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <Link href="/"><Image src="/logo-white.png" alt="Rezerwacja24" width={150} height={45} className="h-8 sm:h-10 w-auto" /></Link>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white">Prywatność</Link>
              <Link href="/terms" className="hover:text-white">Regulamin</Link>
              <Link href="/contact" className="hover:text-white">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
