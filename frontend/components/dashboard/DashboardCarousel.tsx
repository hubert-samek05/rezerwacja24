'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Calendar, 
  TrendingUp, 
  Bell,
  Gift,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  MessageSquare,
  Users,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'

interface BannerCard {
  id: string
  type: 'feature' | 'tip' | 'news' | 'promo'
  title: string
  description: string
  icon: React.ReactNode
  buttonText: string
  buttonLink: string
  gradient: string
  tag?: string
}

interface DashboardCarouselProps {
  language?: string
}

export default function DashboardCarousel({ language = 'pl' }: DashboardCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboardCarouselCollapsed') === 'true'
    }
    return false
  })

  // Zapisz stan zwinięcia w localStorage
  useEffect(() => {
    localStorage.setItem('dashboardCarouselCollapsed', String(isCollapsed))
  }, [isCollapsed])

  const cards: BannerCard[] = [
    {
      id: 'calendar-tip',
      type: 'tip',
      title: language === 'pl' ? 'Szybkie rezerwacje' : 'Quick bookings',
      description: language === 'pl' 
        ? 'Kliknij w dowolne miejsce w kalendarzu, aby błyskawicznie dodać nową rezerwację. Możesz też przeciągać i zmieniać długość wizyt.'
        : 'Click anywhere in the calendar to quickly add a new booking. You can also drag and resize appointments.',
      icon: <Calendar className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Otwórz kalendarz' : 'Open calendar',
      buttonLink: '/dashboard/calendar',
      gradient: 'from-teal-500 to-emerald-600',
      tag: language === 'pl' ? 'Porada' : 'Tip'
    },
    {
      id: 'sms-feature',
      type: 'feature',
      title: language === 'pl' ? 'Przypomnienia SMS' : 'SMS Reminders',
      description: language === 'pl'
        ? 'Zmniejsz liczbę nieobecności nawet o 80%! Automatyczne przypomnienia wysyłane dzień przed wizytą. Klienci doceniają tę funkcję.'
        : 'Reduce no-shows by up to 80%! Automatic reminders sent the day before. Customers love this feature.',
      icon: <Bell className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Włącz SMS' : 'Enable SMS',
      buttonLink: '/dashboard/settings?tab=notifications',
      gradient: 'from-blue-500 to-indigo-600',
      tag: language === 'pl' ? 'Funkcja' : 'Feature'
    },
    {
      id: 'analytics-news',
      type: 'news',
      title: language === 'pl' ? 'Nowe raporty' : 'New Reports',
      description: language === 'pl'
        ? 'Sprawdź nowe wykresy i statystyki! Zobacz które usługi są najpopularniejsze, kiedy masz najwięcej klientów i jak rośnie Twój biznes.'
        : 'Check out new charts and statistics! See which services are most popular, when you have the most customers, and how your business is growing.',
      icon: <TrendingUp className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Zobacz raporty' : 'View reports',
      buttonLink: '/dashboard/analytics',
      gradient: 'from-emerald-500 to-green-600',
      tag: language === 'pl' ? 'Nowość' : 'New'
    },
    {
      id: 'loyalty-promo',
      type: 'promo',
      title: language === 'pl' ? 'Program lojalnościowy' : 'Loyalty Program',
      description: language === 'pl'
        ? 'Nagradzaj stałych klientów! Zbieraj punkty za wizyty, oferuj rabaty i buduj długotrwałe relacje. Zwiększ retencję klientów.'
        : 'Reward regular customers! Collect points for visits, offer discounts and build long-term relationships. Increase customer retention.',
      icon: <Gift className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Aktywuj' : 'Activate',
      buttonLink: '/dashboard/loyalty',
      gradient: 'from-purple-500 to-pink-600',
      tag: language === 'pl' ? 'Promocja' : 'Promo'
    },
    {
      id: 'customers-tip',
      type: 'tip',
      title: language === 'pl' ? 'Baza klientów' : 'Customer Database',
      description: language === 'pl'
        ? 'Wszystkie dane klientów w jednym miejscu. Historia wizyt, preferencje, notatki. Importuj klientów z Booksy lub dodaj ręcznie.'
        : 'All customer data in one place. Visit history, preferences, notes. Import customers from Booksy or add manually.',
      icon: <Users className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Zarządzaj' : 'Manage',
      buttonLink: '/dashboard/customers',
      gradient: 'from-orange-500 to-amber-600',
      tag: language === 'pl' ? 'Porada' : 'Tip'
    },
    {
      id: 'online-booking',
      type: 'feature',
      title: language === 'pl' ? 'Rezerwacje online 24/7' : 'Online Booking 24/7',
      description: language === 'pl'
        ? 'Twoi klienci mogą rezerwować wizyty o każdej porze! Udostępnij link do rezerwacji na swojej stronie, Facebooku lub Instagramie.'
        : 'Your customers can book appointments anytime! Share the booking link on your website, Facebook or Instagram.',
      icon: <Zap className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Skopiuj link' : 'Copy link',
      buttonLink: '/dashboard/settings?tab=widget',
      gradient: 'from-cyan-500 to-blue-600',
      tag: language === 'pl' ? 'Funkcja' : 'Feature'
    },
    {
      id: 'services-tip',
      type: 'tip',
      title: language === 'pl' ? 'Katalog usług' : 'Service Catalog',
      description: language === 'pl'
        ? 'Dodaj swoje usługi z cenami i czasem trwania. Możesz tworzyć kategorie, pakiety i promocje. Klienci zobaczą je przy rezerwacji.'
        : 'Add your services with prices and duration. Create categories, packages and promotions. Customers will see them when booking.',
      icon: <Star className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Dodaj usługi' : 'Add services',
      buttonLink: '/dashboard/services',
      gradient: 'from-pink-500 to-rose-600',
      tag: language === 'pl' ? 'Porada' : 'Tip'
    },
    {
      id: 'team-feature',
      type: 'feature',
      title: language === 'pl' ? 'Zarządzanie zespołem' : 'Team Management',
      description: language === 'pl'
        ? 'Dodaj pracowników, przypisz im usługi i ustaw grafik pracy. Każdy pracownik może mieć własne konto z ograniczonymi uprawnieniami.'
        : 'Add employees, assign services and set work schedules. Each employee can have their own account with limited permissions.',
      icon: <Users className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Zespół' : 'Team',
      buttonLink: '/dashboard/employees',
      gradient: 'from-violet-500 to-purple-600',
      tag: language === 'pl' ? 'Funkcja' : 'Feature'
    },
    {
      id: 'promotions-promo',
      type: 'promo',
      title: language === 'pl' ? 'Promocje i rabaty' : 'Promotions & Discounts',
      description: language === 'pl'
        ? 'Twórz kody rabatowe, promocje czasowe i oferty specjalne. Przyciągnij nowych klientów i zwiększ sprzedaż w wolniejsze dni.'
        : 'Create discount codes, time-limited promotions and special offers. Attract new customers and boost sales on slower days.',
      icon: <Sparkles className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Utwórz promocję' : 'Create promotion',
      buttonLink: '/dashboard/promotions',
      gradient: 'from-amber-500 to-orange-600',
      tag: language === 'pl' ? 'Promocja' : 'Promo'
    },
    {
      id: 'google-calendar',
      type: 'news',
      title: language === 'pl' ? 'Synchronizacja z Google' : 'Google Sync',
      description: language === 'pl'
        ? 'Połącz swój kalendarz Google! Wszystkie rezerwacje automatycznie pojawią się w Twoim kalendarzu. Działa też z Apple Calendar.'
        : 'Connect your Google Calendar! All bookings will automatically appear in your calendar. Also works with Apple Calendar.',
      icon: <Calendar className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Połącz' : 'Connect',
      buttonLink: '/dashboard/settings?tab=integrations',
      gradient: 'from-red-500 to-rose-600',
      tag: language === 'pl' ? 'Integracja' : 'Integration'
    },
    {
      id: 'mobile-app',
      type: 'news',
      title: language === 'pl' ? 'Aplikacja mobilna' : 'Mobile App',
      description: language === 'pl'
        ? 'Zarządzaj rezerwacjami z telefonu! Pobierz aplikację na iOS lub Android. Otrzymuj powiadomienia push o nowych rezerwacjach.'
        : 'Manage bookings from your phone! Download the app for iOS or Android. Get push notifications about new bookings.',
      icon: <Zap className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Pobierz' : 'Download',
      buttonLink: '/dashboard/settings?tab=app',
      gradient: 'from-indigo-500 to-blue-600',
      tag: language === 'pl' ? 'Nowość' : 'New'
    },
    {
      id: 'payments-feature',
      type: 'feature',
      title: language === 'pl' ? 'Płatności online' : 'Online Payments',
      description: language === 'pl'
        ? 'Przyjmuj płatności kartą przy rezerwacji. Zmniejsz ryzyko nieobecności i otrzymuj pieniądze od razu. Integracja z Stripe.'
        : 'Accept card payments when booking. Reduce no-show risk and get paid instantly. Stripe integration included.',
      icon: <TrendingUp className="w-6 h-6" />,
      buttonText: language === 'pl' ? 'Włącz płatności' : 'Enable payments',
      buttonLink: '/dashboard/settings?tab=payments',
      gradient: 'from-green-500 to-emerald-600',
      tag: language === 'pl' ? 'Funkcja' : 'Feature'
    }
  ]

  const cardsPerPage = 3
  const totalPages = Math.ceil(cards.length / cardsPerPage)

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }, [totalPages])

  useEffect(() => {
    const interval = setInterval(nextPage, 8000)
    return () => clearInterval(interval)
  }, [nextPage])

  const visibleCards = cards.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'tip': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'news': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'promo': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'feature': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  // Na mobile pokazujemy 1 kartę, na tablecie 2, na desktop 3
  const getCardsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1
      if (window.innerWidth < 1024) return 2
    }
    return 3
  }

  const [mobileCardsPerPage, setMobileCardsPerPage] = useState(cardsPerPage)
  
  useEffect(() => {
    const handleResize = () => {
      const newCardsPerPage = getCardsPerPage()
      setMobileCardsPerPage(newCardsPerPage)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const mobileTotalPages = Math.ceil(cards.length / mobileCardsPerPage)
  const mobileVisibleCards = cards.slice(currentPage * mobileCardsPerPage, (currentPage + 1) * mobileCardsPerPage)

  // Reset page if out of bounds after resize
  useEffect(() => {
    if (currentPage >= mobileTotalPages) {
      setCurrentPage(0)
    }
  }, [mobileTotalPages, currentPage])

  return (
    <div className="mb-8">
      {/* Przycisk zwijania - mała strzałka po prawej */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-all"
        >
          {isCollapsed 
            ? (language === 'pl' ? 'Pokaż porady' : 'Show tips')
            : (language === 'pl' ? 'Ukryj' : 'Hide')
          }
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Zawartość karuzelu - animowana */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
        <div className="space-y-4">
          {/* Cards Grid - responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {mobileVisibleCards.map((card) => (
          <Link
            key={card.id}
            href={card.buttonLink}
            className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-5 hover:shadow-lg hover:border-transparent active:scale-[0.98] transition-all duration-300 overflow-hidden"
          >
            {/* Gradient accent on hover/active */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 group-active:opacity-10 transition-opacity duration-300`} />
            
            {/* Mobile: Horizontal layout, Desktop: Vertical */}
            <div className="flex items-start gap-3 md:block">
              {/* Icon */}
              <div className={`flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md md:shadow-lg md:mb-3`}>
                {card.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Tag - hidden on mobile for cleaner look */}
                {card.tag && (
                  <span className={`hidden md:inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-2 ${getTagStyle(card.type)}`}>
                    {card.tag}
                  </span>
                )}
                
                {/* Title */}
                <h3 className="font-semibold text-[var(--text-primary)] text-sm md:text-base mb-1 line-clamp-1">
                  {card.title}
                </h3>
                
                {/* Description - shorter on mobile */}
                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2 md:line-clamp-3 mb-2 md:mb-4">
                  {card.description}
                </p>
                
                {/* Button */}
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-teal-600 dark:text-teal-400">
                  {card.buttonText}
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
            </div>

          {/* Navigation - larger touch targets on mobile */}
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <button
              onClick={prevPage}
              className="p-2.5 md:p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] active:bg-[var(--bg-secondary)] transition-all touch-manipulation"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 md:gap-2">
              {Array.from({ length: mobileTotalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`transition-all duration-300 rounded-full touch-manipulation ${
                    index === currentPage 
                      ? 'w-6 md:w-8 h-2 bg-teal-500' 
                      : 'w-2 h-2 bg-[var(--border-color)] hover:bg-[var(--text-muted)]'
                  }`}
                  aria-label={`Page ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextPage}
              className="p-2.5 md:p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] active:bg-[var(--bg-secondary)] transition-all touch-manipulation"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </div>
          
          {/* Swipe hint on mobile */}
          <p className="text-center text-xs text-[var(--text-muted)] md:hidden">
            {currentPage + 1} / {mobileTotalPages}
          </p>
        </div>
      </div>
    </div>
  )
}
