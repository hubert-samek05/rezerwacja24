'use client'

import { useState } from 'react'
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
  Gift,
  Package,
  Ticket,
  Clock,
  Zap,
  RefreshCcw,
  Scissors,
  Sparkles,
  Heart,
  Dumbbell,
  Car,
  Eye,
  Palette,
  ChevronDown,
  ArrowRight,
  Check,
  Code,
  Flower2,
  Activity,
  Wrench,
  Stethoscope,
} from 'lucide-react'

interface MegaMenuProps {
  locale: string
}

// Definicja funkcji systemu
const features = [
  {
    id: 'kalendarz',
    icon: Calendar,
    color: 'from-teal-500 to-emerald-500',
    titlePl: 'Kalendarz rezerwacji',
    titleEn: 'Booking Calendar',
    descPl: 'Widok dzienny, tygodniowy i miesięczny',
    descEn: 'Daily, weekly and monthly view',
    image: '/screenshots/calendar.png',
  },
  {
    id: 'crm',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    titlePl: 'CRM i baza klientów',
    titleEn: 'CRM & Customer Database',
    descPl: 'Historia wizyt, notatki, preferencje',
    descEn: 'Visit history, notes, preferences',
    image: '/screenshots/crm.png',
  },
  {
    id: 'platnosci',
    icon: CreditCard,
    color: 'from-violet-500 to-purple-500',
    titlePl: 'Płatności online',
    titleEn: 'Online Payments',
    descPl: 'Stripe, Przelewy24, PayU',
    descEn: 'Stripe, Przelewy24, PayU',
    image: '/screenshots/payments.png',
  },
  {
    id: 'powiadomienia',
    icon: Bell,
    color: 'from-amber-500 to-orange-500',
    titlePl: 'Powiadomienia SMS',
    titleEn: 'SMS Notifications',
    descPl: 'Automatyczne przypomnienia',
    descEn: 'Automatic reminders',
    image: '/screenshots/notifications.png',
  },
  {
    id: 'analityka',
    icon: BarChart3,
    color: 'from-rose-500 to-pink-500',
    titlePl: 'Analityka i raporty',
    titleEn: 'Analytics & Reports',
    descPl: 'Statystyki, wykresy, eksporty',
    descEn: 'Statistics, charts, exports',
    image: '/screenshots/analytics.png',
  },
  {
    id: 'strona-rezerwacji',
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    titlePl: 'Strona rezerwacji',
    titleEn: 'Booking Page',
    descPl: 'Własna subdomena i personalizacja',
    descEn: 'Custom subdomain & branding',
    image: '/screenshots/subdomain.png',
  },
  {
    id: 'widget',
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-500',
    titlePl: 'Widget na stronę',
    titleEn: 'Website Widget',
    descPl: 'Embed na Twojej stronie WWW',
    descEn: 'Embed on your website',
    image: '/screenshots/widget-www.png',
  },
  {
    id: 'google-calendar',
    icon: RefreshCcw,
    color: 'from-red-500 to-rose-500',
    titlePl: 'Google Calendar',
    titleEn: 'Google Calendar',
    descPl: 'Dwukierunkowa synchronizacja',
    descEn: 'Two-way sync',
    image: '/screenshots/integrations.png',
  },
  {
    id: 'promocje',
    icon: Gift,
    color: 'from-pink-500 to-rose-500',
    titlePl: 'Promocje i kupony',
    titleEn: 'Promotions & Coupons',
    descPl: 'Kody rabatowe, zniżki',
    descEn: 'Discount codes, offers',
    image: '/screenshots/promotions.png',
  },
  {
    id: 'pakiety',
    icon: Package,
    color: 'from-cyan-500 to-blue-500',
    titlePl: 'Pakiety usług',
    titleEn: 'Service Packages',
    descPl: 'Łączenie usług w pakiety',
    descEn: 'Bundle services together',
    image: '/screenshots/dashboard-preview.png',
  },
  {
    id: 'karnety',
    icon: Ticket,
    color: 'from-orange-500 to-amber-500',
    titlePl: 'Karnety',
    titleEn: 'Passes',
    descPl: 'Wielokrotne wizyty',
    descEn: 'Multiple visits',
    image: '/screenshots/dashboard-preview.png',
  },
  {
    id: 'bezpieczenstwo',
    icon: Shield,
    color: 'from-slate-600 to-slate-700',
    titlePl: 'Bezpieczeństwo',
    titleEn: 'Security',
    descPl: 'RODO, 2FA, szyfrowanie',
    descEn: 'GDPR, 2FA, encryption',
    image: '/screenshots/2fa.png',
  },
]

// Główne kategorie branż ze zdjęciami
const industries = [
  { id: 'beauty', titlePl: 'Beauty & SPA', titleEn: 'Beauty & SPA', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
  { id: 'zdrowie', titlePl: 'Zdrowie i medycyna', titleEn: 'Health & Medical', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&h=100&fit=crop' },
  { id: 'motoryzacja', titlePl: 'Motoryzacja', titleEn: 'Automotive', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop' },
  { id: 'sport', titlePl: 'Sport i fitness', titleEn: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop' },
  { id: 'edukacja', titlePl: 'Edukacja', titleEn: 'Education', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop' },
  { id: 'zwierzeta', titlePl: 'Usługi dla zwierząt', titleEn: 'Pet Services', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop' },
  { id: 'dom', titlePl: 'Dom i naprawa', titleEn: 'Home & Repair', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop' },
  { id: 'konsultacje', titlePl: 'Konsultacje', titleEn: 'Consulting', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=100&h=100&fit=crop' },
  { id: 'rozrywka', titlePl: 'Rozrywka i eventy', titleEn: 'Entertainment', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop' },
  { id: 'gastronomia', titlePl: 'Gastronomia', titleEn: 'Gastronomy', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop' },
  { id: 'prawne', titlePl: 'Usługi prawne', titleEn: 'Legal Services', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&h=100&fit=crop' },
  { id: 'inne', titlePl: 'Inne usługi', titleEn: 'Other Services', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop' },
]

export default function MegaMenu({ locale }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  const isPl = locale === 'pl'

  return (
    <div className="hidden lg:flex items-center gap-1">
      {/* Funkcje dropdown */}
      <div 
        className="relative"
        onMouseEnter={() => setActiveMenu('features')}
        onMouseLeave={() => { setActiveMenu(null); setHoveredFeature(null) }}
      >
        <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-800 transition-colors rounded-lg hover:bg-gray-50">
          {isPl ? 'Funkcje' : 'Features'}
          <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === 'features' ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {activeMenu === 'features' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ marginLeft: '-200px' }}
            >
              <div className="grid grid-cols-2">
                {/* Left - Features list */}
                <div className="p-4 border-r border-gray-100 max-h-[500px] overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    {isPl ? 'Wszystkie funkcje' : 'All Features'}
                  </p>
                  <div className="space-y-1">
                    {features.map((feature) => {
                      const Icon = feature.icon
                      return (
                        <Link
                          key={feature.id}
                          href={`/funkcje/${feature.id}`}
                          onMouseEnter={() => setHoveredFeature(feature.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            hoveredFeature === feature.id 
                              ? 'bg-teal-50 border-teal-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">
                              {isPl ? feature.titlePl : feature.titleEn}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {isPl ? feature.descPl : feature.descEn}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
                
                {/* Right - Preview with mini mockups */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                  {hoveredFeature ? (
                    <>
                      {(() => {
                        const feature = features.find(f => f.id === hoveredFeature)
                        if (!feature) return null
                        const Icon = feature.icon
                        return (
                          <div>
                            <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {isPl ? feature.titlePl : feature.titleEn}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {isPl ? feature.descPl : feature.descEn}
                            </p>
                            {/* Mini mockup based on feature - advanced realistic design */}
                            <div className="relative h-52 rounded-2xl overflow-hidden shadow-2xl">
                              {/* Realistic browser chrome */}
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50">
                                <div className="bg-slate-200 h-6 flex items-center px-2 gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                  <div className="flex-1 mx-2 h-3 bg-white rounded-sm flex items-center px-1">
                                    <span className="text-[6px] text-slate-400">app.rezerwacja24.pl</span>
                                  </div>
                                </div>
                              </div>
                              
                              {hoveredFeature === 'kalendarz' && (
                                <div className="absolute inset-0 pt-6 bg-white">
                                  {/* Sidebar */}
                                  <div className="absolute left-0 top-6 bottom-0 w-10 bg-slate-800 flex flex-col items-center py-2 gap-2">
                                    <div className="w-6 h-6 bg-teal-500 rounded-lg"></div>
                                    <div className="w-5 h-5 bg-slate-700 rounded"></div>
                                    <div className="w-5 h-5 bg-slate-700 rounded"></div>
                                    <div className="w-5 h-5 bg-slate-700 rounded"></div>
                                  </div>
                                  {/* Main content */}
                                  <div className="ml-10 p-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[9px] font-bold text-slate-800">{isPl ? 'Luty 2026' : 'Feb 2026'}</span>
                                      <div className="flex gap-0.5">
                                        <span className="px-1.5 py-0.5 bg-teal-500 text-white text-[6px] rounded">{isPl ? 'Tydzień' : 'Week'}</span>
                                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[6px] rounded">{isPl ? 'Miesiąc' : 'Month'}</span>
                                      </div>
                                    </div>
                                    {/* Calendar grid */}
                                    <div className="grid grid-cols-6 gap-0.5 text-[6px]">
                                      <div className="text-slate-400"></div>
                                      {['Pn','Wt','Śr','Cz','Pt'].map((d,i) => (
                                        <div key={i} className="text-center text-slate-500 font-medium py-0.5">{d}</div>
                                      ))}
                                      {['09:00','10:00','11:00','12:00','13:00'].map((t, ti) => (
                                        <div key={ti} className="contents">
                                          <div className="text-slate-400 py-1">{t}</div>
                                          {[0,1,2,3,4].map((ci) => {
                                            const hasBooking = (ti === 0 && ci === 1) || (ti === 1 && ci === 0) || (ti === 1 && ci === 2) || (ti === 2 && ci === 3) || (ti === 3 && ci === 1) || (ti === 4 && ci === 2)
                                            const isConfirmed = (ti === 0 && ci === 1) || (ti === 1 && ci === 2) || (ti === 3 && ci === 1)
                                            return (
                                              <div key={ci} className={`h-4 rounded-sm ${hasBooking ? (isConfirmed ? 'bg-teal-500' : 'bg-slate-400') : 'bg-slate-50 border border-slate-100'}`}></div>
                                            )
                                          })}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {hoveredFeature === 'crm' && (
                                <div className="absolute inset-0 pt-6 bg-slate-50">
                                  <div className="h-full flex">
                                    {/* Sidebar */}
                                    <div className="w-10 bg-slate-800 flex flex-col items-center py-2 gap-2">
                                      <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
                                      <div className="w-5 h-5 bg-slate-700 rounded"></div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-2">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-bold text-slate-800">{isPl ? 'Klienci' : 'Clients'}</span>
                                        <div className="px-1.5 py-0.5 bg-teal-500 text-white text-[6px] rounded">+ {isPl ? 'Dodaj' : 'Add'}</div>
                                      </div>
                                      {/* Search */}
                                      <div className="h-4 bg-white rounded border border-slate-200 mb-2 flex items-center px-1">
                                        <span className="text-[6px] text-slate-400">{isPl ? 'Szukaj klienta...' : 'Search client...'}</span>
                                      </div>
                                      {/* Table */}
                                      <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                        <div className="grid grid-cols-4 gap-1 px-1 py-0.5 bg-slate-50 text-[6px] text-slate-500 font-medium">
                                          <span>{isPl ? 'Klient' : 'Client'}</span>
                                          <span>{isPl ? 'Wizyty' : 'Visits'}</span>
                                          <span>{isPl ? 'Wydane' : 'Spent'}</span>
                                          <span>{isPl ? 'Ostatnia' : 'Last'}</span>
                                        </div>
                                        {[
                                          { name: 'Anna K.', visits: 24, spent: '2.4k', last: '2 dni', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop' },
                                          { name: 'Marek W.', visits: 18, spent: '1.8k', last: '5 dni', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop' },
                                          { name: 'Kasia N.', visits: 12, spent: '960', last: '1 tydz', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop' },
                                        ].map((c, i) => (
                                          <div key={i} className="grid grid-cols-4 gap-1 px-1 py-1 border-t border-slate-100 text-[6px] items-center">
                                            <div className="flex items-center gap-1">
                                              <Image src={c.img} alt="" width={12} height={12} className="w-3 h-3 rounded-full object-cover" />
                                              <span className="text-slate-700 font-medium">{c.name}</span>
                                            </div>
                                            <span className="text-slate-600">{c.visits}</span>
                                            <span className="text-teal-600 font-medium">{c.spent} zł</span>
                                            <span className="text-slate-400">{c.last}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {hoveredFeature === 'platnosci' && (
                                <div className="absolute inset-0 pt-6 bg-slate-50">
                                  <div className="h-full p-3">
                                    {/* Payment modal */}
                                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3">
                                      <div className="text-center mb-2">
                                        <p className="text-[7px] text-slate-500">{isPl ? 'Do zapłaty' : 'Amount due'}</p>
                                        <p className="text-lg font-bold text-slate-800">150,00 zł</p>
                                      </div>
                                      <div className="space-y-1.5 mb-2">
                                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                          <div className="w-8 h-5 bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] rounded flex items-center justify-center">
                                            <span className="text-[6px] text-white font-bold">Stripe</span>
                                          </div>
                                          <span className="text-[7px] text-slate-600">{isPl ? 'Karta płatnicza' : 'Credit card'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-1.5 bg-teal-50 rounded-lg border-2 border-teal-500">
                                          <div className="w-8 h-5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded flex items-center justify-center">
                                            <span className="text-[6px] text-white font-bold">P24</span>
                                          </div>
                                          <span className="text-[7px] text-teal-700 font-medium">Przelewy24</span>
                                          <Check className="w-3 h-3 text-teal-500 ml-auto" />
                                        </div>
                                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                          <div className="w-8 h-5 bg-gradient-to-r from-green-500 to-lime-500 rounded flex items-center justify-center">
                                            <span className="text-[6px] text-white font-bold">PayU</span>
                                          </div>
                                          <span className="text-[7px] text-slate-600">PayU</span>
                                        </div>
                                      </div>
                                      <div className="bg-teal-500 text-white text-center py-1.5 rounded-lg text-[8px] font-medium">
                                        {isPl ? 'Zapłać teraz' : 'Pay now'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {hoveredFeature === 'powiadomienia' && (
                                <div className="absolute inset-0 pt-6 bg-slate-800">
                                  <div className="h-full p-3">
                                    {/* Phone mockup */}
                                    <div className="bg-slate-900 rounded-2xl p-1 mx-auto w-24 shadow-xl">
                                      <div className="bg-white rounded-xl overflow-hidden">
                                        <div className="bg-slate-100 h-3 flex items-center justify-center">
                                          <div className="w-8 h-1 bg-slate-300 rounded-full"></div>
                                        </div>
                                        <div className="p-1.5 space-y-1">
                                          <div className="bg-green-50 border border-green-200 rounded-lg p-1.5">
                                            <div className="flex items-center gap-1 mb-0.5">
                                              <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                <Check className="w-1.5 h-1.5 text-white" />
                                              </div>
                                              <span className="text-[6px] text-green-700 font-bold">Rezerwacja24</span>
                                            </div>
                                            <p className="text-[5px] text-slate-600">{isPl ? 'Twoja wizyta została potwierdzona na jutro o 14:00' : 'Your appointment is confirmed for tomorrow at 2 PM'}</p>
                                          </div>
                                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5">
                                            <div className="flex items-center gap-1 mb-0.5">
                                              <Clock className="w-3 h-3 text-amber-500" />
                                              <span className="text-[6px] text-amber-700 font-bold">{isPl ? 'Przypomnienie' : 'Reminder'}</span>
                                            </div>
                                            <p className="text-[5px] text-slate-600">{isPl ? 'Wizyta za 24h - Studio Anna' : 'Appointment in 24h - Studio Anna'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {hoveredFeature === 'analityka' && (
                                <div className="absolute inset-0 pt-6 bg-slate-50">
                                  <div className="h-full flex">
                                    {/* Sidebar */}
                                    <div className="w-10 bg-slate-800 flex flex-col items-center py-2 gap-2">
                                      <div className="w-6 h-6 bg-violet-500 rounded-lg"></div>
                                      <div className="w-5 h-5 bg-slate-700 rounded"></div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-2">
                                      {/* Stats cards */}
                                      <div className="grid grid-cols-3 gap-1 mb-2">
                                        {[
                                          { label: isPl ? 'Rezerwacje' : 'Bookings', value: '156', change: '+23%', color: 'text-teal-500' },
                                          { label: isPl ? 'Przychód' : 'Revenue', value: '12.4k', change: '+18%', color: 'text-emerald-500' },
                                          { label: isPl ? 'Klienci' : 'Clients', value: '89', change: '+12%', color: 'text-blue-500' },
                                        ].map((stat, i) => (
                                          <div key={i} className="bg-white rounded-lg p-1.5 border border-slate-200">
                                            <p className="text-[5px] text-slate-400">{stat.label}</p>
                                            <p className="text-[10px] font-bold text-slate-800">{stat.value}</p>
                                            <p className={`text-[5px] font-medium ${stat.color}`}>{stat.change}</p>
                                          </div>
                                        ))}
                                      </div>
                                      {/* Chart */}
                                      <div className="bg-white rounded-lg p-2 border border-slate-200">
                                        <p className="text-[6px] text-slate-500 mb-1">{isPl ? 'Rezerwacje w tym tygodniu' : 'Bookings this week'}</p>
                                        <div className="h-12 flex items-end gap-0.5">
                                          {[35, 50, 40, 65, 55, 80, 70].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center">
                                              <div className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t" style={{ height: `${h}%` }}></div>
                                              <span className="text-[5px] text-slate-400 mt-0.5">{['Pn','Wt','Śr','Cz','Pt','Sb','Nd'][i]}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {hoveredFeature === 'strona-rezerwacji' && (
                                <div className="absolute inset-0 pt-6 bg-gradient-to-br from-teal-600 to-teal-700">
                                  <div className="h-full p-3">
                                    {/* Phone frame */}
                                    <div className="bg-slate-900 rounded-2xl p-1 mx-auto w-28 shadow-xl">
                                      <div className="bg-white rounded-xl overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-teal-600 px-2 py-1.5">
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <div className="w-4 h-4 bg-white/20 rounded-lg"></div>
                                            <div>
                                              <p className="text-[6px] text-white font-bold">Studio Anna</p>
                                              <p className="text-[5px] text-teal-200">{isPl ? 'Salon fryzjerski' : 'Hair Salon'}</p>
                                            </div>
                                          </div>
                                        </div>
                                        {/* Content */}
                                        <div className="p-1.5 space-y-1">
                                          <p className="text-[5px] text-slate-400 uppercase">{isPl ? 'Usługi' : 'Services'}</p>
                                          <div className="bg-teal-50 border border-teal-200 rounded p-1 flex items-center gap-1">
                                            <div className="w-2 h-2 bg-teal-500 rounded"></div>
                                            <span className="text-[5px] text-slate-700">{isPl ? 'Strzyżenie' : 'Haircut'}</span>
                                            <span className="ml-auto text-[5px] text-teal-600 font-bold">80 zł</span>
                                          </div>
                                          <div className="flex gap-0.5">
                                            {['10:00','11:30','14:00'].map((t,i) => (
                                              <div key={i} className={`flex-1 py-0.5 text-center text-[5px] rounded ${i===1 ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</div>
                                            ))}
                                          </div>
                                          <div className="bg-teal-500 text-white text-center py-1 rounded text-[6px] font-medium">
                                            {isPl ? 'Zarezerwuj' : 'Book'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {hoveredFeature === 'widget' && (
                                <div className="absolute inset-0 pt-6 bg-slate-100">
                                  <div className="h-full p-2">
                                    {/* Website mockup */}
                                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 h-full overflow-hidden">
                                      <div className="bg-slate-50 h-4 flex items-center px-1 gap-0.5 border-b border-slate-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                        <div className="flex-1 mx-1 h-2 bg-slate-200 rounded-sm"></div>
                                      </div>
                                      <div className="p-2">
                                        <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-2 bg-slate-100 rounded w-3/4 mb-3"></div>
                                        {/* Widget */}
                                        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg p-2 shadow-lg">
                                          <p className="text-[7px] font-bold text-white mb-1">{isPl ? 'Zarezerwuj wizytę' : 'Book appointment'}</p>
                                          <div className="bg-white/20 rounded h-3 mb-1"></div>
                                          <div className="flex gap-1">
                                            <div className="flex-1 bg-white/20 rounded h-3"></div>
                                            <div className="bg-white text-teal-600 px-2 rounded text-[6px] font-bold flex items-center">{isPl ? 'Dalej' : 'Next'}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {hoveredFeature === 'google-calendar' && (
                                <div className="absolute inset-0 pt-6 bg-slate-50">
                                  <div className="h-full p-3 flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                      {/* Rezerwacja24 calendar */}
                                      <div className="bg-white rounded-xl shadow-lg p-2 border border-slate-200">
                                        <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-1">
                                          <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-[6px] text-center text-slate-600 font-medium">Rezerwacja24</p>
                                      </div>
                                      {/* Sync arrows */}
                                      <div className="flex flex-col items-center gap-0.5">
                                        <div className="w-6 h-0.5 bg-teal-400"></div>
                                        <RefreshCcw className="w-4 h-4 text-teal-500 animate-spin" style={{animationDuration: '3s'}} />
                                        <div className="w-6 h-0.5 bg-teal-400"></div>
                                      </div>
                                      {/* Google calendar */}
                                      <div className="bg-white rounded-xl shadow-lg p-2 border border-slate-200">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-1 border border-slate-200">
                                          <Image src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" width={32} height={32} className="w-8 h-8" />
                                        </div>
                                        <p className="text-[6px] text-center text-slate-600 font-medium">Google</p>
                                      </div>
                                    </div>
                                    <p className="text-[8px] text-slate-500">{isPl ? 'Dwukierunkowa synchronizacja' : 'Two-way sync'}</p>
                                  </div>
                                </div>
                              )}
                              {hoveredFeature === 'promocje' && (
                                <div className="absolute inset-0 pt-6 bg-gradient-to-br from-pink-500 to-rose-600">
                                  <div className="h-full p-3 flex items-center justify-center">
                                    {/* Coupon card */}
                                    <div className="bg-white rounded-xl shadow-xl p-3 w-full max-w-[140px] relative overflow-hidden">
                                      <div className="absolute -left-2 top-1/2 w-4 h-4 bg-pink-500 rounded-full"></div>
                                      <div className="absolute -right-2 top-1/2 w-4 h-4 bg-pink-500 rounded-full"></div>
                                      <div className="border-b border-dashed border-slate-200 pb-2 mb-2">
                                        <p className="text-[7px] text-slate-400 uppercase">{isPl ? 'Kod rabatowy' : 'Discount code'}</p>
                                        <p className="text-sm font-bold text-slate-800 tracking-wider">LATO2026</p>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-lg font-bold text-pink-500">-20%</p>
                                          <p className="text-[6px] text-slate-400">{isPl ? 'na wszystkie usługi' : 'on all services'}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[7px] text-slate-500">{isPl ? 'Użyto' : 'Used'}</p>
                                          <p className="text-[9px] font-bold text-slate-700">156x</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {hoveredFeature === 'pakiety' && (
                                <div className="absolute inset-0 pt-6 bg-gradient-to-br from-cyan-500 to-blue-600">
                                  <div className="h-full p-3 flex items-center justify-center">
                                    {/* Package card */}
                                    <div className="bg-white rounded-xl shadow-xl p-3 w-full max-w-[140px]">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                          <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <p className="text-[8px] font-bold text-slate-800">{isPl ? 'Pakiet Premium' : 'Premium'}</p>
                                          <p className="text-[6px] text-slate-400">{isPl ? '3 usługi' : '3 services'}</p>
                                        </div>
                                      </div>
                                      <div className="space-y-1 mb-2">
                                        {[isPl ? 'Strzyżenie' : 'Haircut', isPl ? 'Koloryzacja' : 'Coloring', isPl ? 'Stylizacja' : 'Styling'].map((s, i) => (
                                          <div key={i} className="flex items-center gap-1">
                                            <Check className="w-2 h-2 text-cyan-500" />
                                            <span className="text-[6px] text-slate-600">{s}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold text-cyan-600">299 zł</span>
                                        <span className="text-[8px] text-slate-400 line-through">350 zł</span>
                                        <span className="ml-auto px-1.5 py-0.5 bg-cyan-100 text-cyan-600 text-[6px] font-bold rounded">-15%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {hoveredFeature === 'karnety' && (
                                <div className="absolute inset-0 pt-6 bg-gradient-to-br from-amber-500 to-orange-600">
                                  <div className="h-full p-3 flex items-center justify-center">
                                    {/* Pass card */}
                                    <div className="bg-white rounded-xl shadow-xl p-3 w-full max-w-[140px]">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                                          <Ticket className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <p className="text-[8px] font-bold text-slate-800">{isPl ? 'Karnet 10 wizyt' : '10 Visit Pass'}</p>
                                          <p className="text-[6px] text-slate-400">Anna Kowalska</p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-5 gap-1 mb-2">
                                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                          <div key={n} className={`aspect-square rounded-full flex items-center justify-center ${n <= 7 ? 'bg-amber-500' : 'bg-slate-100'}`}>
                                            {n <= 7 && <Check className="w-2 h-2 text-white" />}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[7px] text-slate-500">{isPl ? 'Pozostało' : 'Remaining'}</span>
                                        <span className="text-[10px] font-bold text-amber-600">{isPl ? '3 wizyty' : '3 visits'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {hoveredFeature === 'bezpieczenstwo' && (
                                <div className="absolute inset-0 pt-6 bg-gradient-to-br from-slate-700 to-slate-900">
                                  <div className="h-full p-3 flex flex-col items-center justify-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-green-500/30">
                                      <Shield className="w-7 h-7 text-white" />
                                    </div>
                                    <p className="text-[10px] font-bold text-white mb-2">{isPl ? 'Twoje dane są bezpieczne' : 'Your data is secure'}</p>
                                    <div className="flex gap-2">
                                      <div className="bg-white/10 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                          <Check className="w-1.5 h-1.5 text-white" />
                                        </div>
                                        <span className="text-[7px] text-white">SSL</span>
                                      </div>
                                      <div className="bg-white/10 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                          <Check className="w-1.5 h-1.5 text-white" />
                                        </div>
                                        <span className="text-[7px] text-white">RODO</span>
                                      </div>
                                      <div className="bg-white/10 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1">
                                        <div className="w-3 h-3 bg-violet-500 rounded-full flex items-center justify-center">
                                          <Check className="w-1.5 h-1.5 text-white" />
                                        </div>
                                        <span className="text-[7px] text-white">2FA</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <Link
                              href={`/funkcje/${feature.id}`}
                              className="mt-4 inline-flex items-center gap-2 text-teal-600 font-medium text-sm hover:text-teal-700"
                            >
                              {isPl ? 'Dowiedz się więcej' : 'Learn more'}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )
                      })()}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
                        <Zap className="w-8 h-8 text-teal-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {isPl ? 'Poznaj nasze funkcje' : 'Explore our features'}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {isPl ? 'Najedź na funkcję aby zobaczyć podgląd' : 'Hover over a feature to see preview'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bottom CTA */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {isPl ? 'Wszystkie funkcje dostępne w każdym planie' : 'All features available in every plan'}
                </p>
                <Link
                  href="/funkcje"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isPl ? 'Zobacz wszystkie funkcje' : 'See all features'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dla kogo dropdown */}
      <div 
        className="relative"
        onMouseEnter={() => setActiveMenu('industries')}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-800 transition-colors rounded-lg hover:bg-gray-50">
          {isPl ? 'Dla kogo?' : 'For whom?'}
          <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === 'industries' ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {activeMenu === 'industries' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ marginLeft: '-150px' }}
            >
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                  {isPl ? 'Branże' : 'Industries'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {industries.map((industry) => (
                    <Link
                      key={industry.id}
                      href={`/${industry.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 transition-all group"
                    >
                      <Image 
                        src={industry.image} 
                        alt="" 
                        width={40} 
                        height={40} 
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm" 
                      />
                      <span className="font-medium text-gray-700 group-hover:text-teal-700 text-sm transition-colors">
                        {isPl ? industry.titlePl : industry.titleEn}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Bottom */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {isPl 
                    ? 'Nasz system sprawdzi się w każdej branży usługowej' 
                    : 'Our system works for any service industry'}
                </p>
                <Link 
                  href="/branze" 
                  className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
                >
                  {isPl ? 'Zobacz wszystkie kategorie' : 'See all categories'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Regular links */}
      <a href="#jak-to-dziala" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-800 transition-colors rounded-lg hover:bg-gray-50">
        {isPl ? 'Jak to działa?' : 'How it works?'}
      </a>
      <a href="#cennik" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-800 transition-colors rounded-lg hover:bg-gray-50">
        {isPl ? 'Cennik' : 'Pricing'}
      </a>
      <Link href="/contact" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-800 transition-colors rounded-lg hover:bg-gray-50">
        {isPl ? 'Kontakt' : 'Contact'}
      </Link>
    </div>
  )
}
