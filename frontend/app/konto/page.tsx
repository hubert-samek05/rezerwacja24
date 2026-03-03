'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  LogOut,
  ChevronRight,
  Building2,
  Loader2,
  Plus,
  X,
  Ticket,
  Award,
  TrendingUp,
  Menu,
  CalendarX,
  CalendarClock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  service: { id: string; name: string; duration: number; basePrice: number } | null
  employee: { id: string; firstName: string; lastName: string; avatar: string | null } | null
  business: { id: string; name: string; subdomain: string; logo: string | null; phone?: string; email?: string; address?: string } | null
  canCancel?: boolean
  canReschedule?: boolean
  cancelDeadlineHours?: number
  rescheduleDeadlineHours?: number
}

interface BookingsData {
  upcoming: Booking[]
  past: Booking[]
  cancelled: Booking[]
}

interface LoyaltyData {
  business: { id: string; name: string; subdomain: string; logo: string | null } | null
  points: number
  history: { id: string; points: number; reason: string; createdAt: string }[]
}

interface Pass {
  id: string
  name: string
  type: string
  totalUses: number | null
  usesRemaining: number | null
  expiresAt: string | null
  purchasedAt: string
  status: string
  business: { id: string; name: string; subdomain: string; logo: string | null } | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

export default function KontoPage() {
  const { customer, isLoading, isAuthenticated, logout, refreshAuth } = useCustomerAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingsData | null>(null)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyData[]>([])
  const [loadingLoyalty, setLoadingLoyalty] = useState(true)
  const [passes, setPasses] = useState<{ active: Pass[]; expired: Pass[] } | null>(null)
  const [loadingPasses, setLoadingPasses] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'bookings' | 'loyalty' | 'passes' | 'settings'>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tokenProcessed, setTokenProcessed] = useState(false)
  const [bookingsTab, setBookingsTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [actionModal, setActionModal] = useState<{ type: 'cancel' | 'reschedule'; booking: Booking } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null)
  const [expandedLoyalty, setExpandedLoyalty] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get('token')
      if (tokenFromUrl) {
        localStorage.setItem('customerAccessToken', tokenFromUrl)
        window.history.replaceState({}, '', '/konto')
        if (refreshAuth) refreshAuth()
      }
      setTokenProcessed(true)
    }
  }, [refreshAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && tokenProcessed) {
      router.push('/logowanie')
    }
  }, [isLoading, isAuthenticated, router, tokenProcessed])

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
      fetchLoyaltyPoints()
      fetchPasses()
    }
  }, [isAuthenticated])

  const getToken = () => localStorage.getItem('customerAccessToken')

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customer-auth/bookings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (response.ok) setBookings(await response.json())
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const fetchLoyaltyPoints = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customer-auth/loyalty`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (response.ok) setLoyaltyPoints(await response.json())
    } catch (error) {
      console.error('Error fetching loyalty points:', error)
    } finally {
      setLoadingLoyalty(false)
    }
  }

  const fetchPasses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customer-auth/passes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (response.ok) setPasses(await response.json())
    } catch (error) {
      console.error('Error fetching passes:', error)
    } finally {
      setLoadingPasses(false)
    }
  }

  const fetchBookingDetails = async (bookingId: string) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`${API_URL}/api/customer-auth/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (response.ok) {
        const data = await response.json()
        setBookingDetails(data)
        return data
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    } finally {
      setLoadingDetails(false)
    }
    return null
  }

  const handleCancelBooking = async () => {
    if (!actionModal || actionModal.type !== 'cancel') return
    setActionLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/customer-auth/bookings/${actionModal.booking.id}/cancel`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok) {
        setActionResult({ success: true, message: data.message || 'Rezerwacja została anulowana' })
        fetchBookings()
      } else {
        setActionResult({ success: false, message: data.message || 'Nie udało się anulować rezerwacji' })
      }
    } catch (error) {
      setActionResult({ success: false, message: 'Wystąpił błąd. Spróbuj ponownie.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!actionModal || actionModal.type !== 'reschedule') return
    setActionLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/customer-auth/bookings/${actionModal.booking.id}/reschedule`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      if (response.ok && data.rescheduleUrl) {
        window.open(data.rescheduleUrl, '_blank')
        setActionModal(null)
      } else {
        setActionResult({ success: false, message: data.message || 'Nie udało się wygenerować linku' })
      }
    } catch (error) {
      setActionResult({ success: false, message: 'Wystąpił błąd. Spróbuj ponownie.' })
    } finally {
      setActionLoading(false)
    }
  }

  const openActionModal = async (type: 'cancel' | 'reschedule', booking: Booking) => {
    const details = await fetchBookingDetails(booking.id)
    if (details) {
      setActionModal({ type, booking: { ...booking, ...details } })
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Oczekująca', color: 'bg-amber-100 text-amber-700' },
      CONFIRMED: { label: 'Potwierdzona', color: 'bg-green-100 text-green-700' },
      COMPLETED: { label: 'Zakończona', color: 'bg-gray-100 text-gray-600' },
      CANCELLED: { label: 'Anulowana', color: 'bg-red-100 text-red-700' },
      NO_SHOW: { label: 'Nieobecność', color: 'bg-red-100 text-red-700' },
    }
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
  }

  const isUpcoming = (booking: Booking) => {
    return new Date(booking.startTime) > new Date() && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const menuItems = [
    { id: 'overview', label: 'Przegląd', icon: TrendingUp },
    { id: 'bookings', label: 'Rezerwacje', icon: Calendar },
    { id: 'loyalty', label: 'Punkty', icon: Award },
    { id: 'passes', label: 'Karnety', icon: Ticket },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ]

  const upcomingCount = bookings?.upcoming.length || 0
  const activePasses = passes?.active.length || 0
  const currentBookings = bookingsTab === 'upcoming' ? bookings?.upcoming : bookingsTab === 'past' ? bookings?.past : bookings?.cancelled

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Rezerwacja24" width={140} height={40} className="h-8 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl shadow-sm shadow-teal-500/20 transition-all">
                <Plus className="w-4 h-4" />
                <span>Nowa rezerwacja</span>
              </Link>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{customer?.firstName} {customer?.lastName}</p>
                  <p className="text-xs text-gray-500">{customer?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Wyloguj">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* User Card */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20">
                    {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer?.firstName} {customer?.lastName}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-[140px]">{customer?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-2">
                {menuItems.map((item) => (
                  <button key={item.id} onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeSection === item.id 
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'bookings' && upcomingCount > 0 && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                        activeSection === item.id ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'
                      }`}>{upcomingCount}</span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Podsumowanie
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Nadchodzące wizyty</span>
                    <span className="font-bold">{upcomingCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Aktywne karnety</span>
                    <span className="font-bold">{activePasses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Programy lojalnościowe</span>
                    <span className="font-bold">{loyaltyPoints.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.2 }} className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-white">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <Image src="/logo.png" alt="Rezerwacja24" width={110} height={30} className="h-6 w-auto" />
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-gray-500"><X className="w-5 h-5" /></button>
                  </div>
                  <nav className="p-2">
                    {menuItems.map((item) => (
                      <button key={item.id} onClick={() => { setActiveSection(item.id as any); setMobileMenuOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm ${activeSection === item.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>
                        <item.icon className="w-4 h-4" />{item.label}
                      </button>
                    ))}
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Overview */}
            {activeSection === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-2xl p-6 lg:p-8 text-white shadow-xl shadow-teal-500/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative">
                    <h1 className="text-2xl lg:text-3xl font-bold">Witaj, {customer?.firstName}! 👋</h1>
                    <p className="text-white/80 mt-2 max-w-lg">Zarządzaj swoimi rezerwacjami, śledź punkty lojalnościowe i korzystaj z karnetów w jednym miejscu.</p>
                    <Link href="/" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-teal-600 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg">
                      <Plus className="w-5 h-5" />
                      Zarezerwuj wizytę
                    </Link>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nadchodzące wizyty</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingCount}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <button onClick={() => setActiveSection('bookings')} className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      Zobacz wszystkie <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Programy lojalnościowe</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{loyaltyPoints.length}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                        <Award className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                    <button onClick={() => setActiveSection('loyalty')} className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                      Sprawdź punkty <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Aktywne karnety</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{activePasses}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <button onClick={() => setActiveSection('passes')} className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                      Zarządzaj karnetami <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">Nadchodzące wizyty</h2>
                      <p className="text-sm text-gray-500">Twoje najbliższe rezerwacje</p>
                    </div>
                    <button onClick={() => setActiveSection('bookings')} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 px-3 py-1.5 hover:bg-teal-50 rounded-lg transition-colors">
                      Wszystkie <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {loadingBookings ? (
                      <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">Ładowanie rezerwacji...</p>
                      </div>
                    ) : bookings?.upcoming.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Brak nadchodzących wizyt</h3>
                        <p className="text-gray-500 text-sm mb-4">Zarezerwuj swoją pierwszą wizytę już teraz</p>
                        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 font-medium shadow-md shadow-teal-500/20 transition-all">
                          <Plus className="w-5 h-5" />
                          Zarezerwuj wizytę
                        </Link>
                      </div>
                    ) : (
                      bookings?.upcoming.slice(0, 4).map((booking, index) => (
                        <div key={booking.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Date Badge */}
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex flex-col items-center justify-center text-white shadow-md">
                              <span className="text-lg font-bold leading-none">{new Date(booking.startTime).getDate()}</span>
                              <span className="text-xs uppercase">{new Date(booking.startTime).toLocaleDateString('pl-PL', { month: 'short' })}</span>
                            </div>
                            {/* Business Logo */}
                            {booking.business?.logo ? (
                              <Image src={booking.business.logo} alt="" width={48} height={48} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{booking.service?.name}</h3>
                              <p className="text-sm text-gray-500 truncate">{booking.business?.name}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatTime(booking.startTime)}
                                </span>
                                {booking.employee && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {booking.employee.firstName}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Price & Actions */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-gray-900">{Number(booking.totalPrice).toFixed(0)} zł</p>
                              <div className="flex gap-1 mt-1">
                                <button onClick={(e) => { e.stopPropagation(); openActionModal('reschedule', booking) }} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Przesuń termin">
                                  <CalendarClock className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); openActionModal('cancel', booking) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Anuluj">
                                  <CalendarX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Loyalty Points Summary */}
                {loyaltyPoints.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-gray-900">Punkty lojalnościowe</h2>
                          <p className="text-sm text-gray-500">Zbieraj punkty w ulubionych miejscach</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveSection('loyalty')} className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 px-3 py-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                        Wszystkie <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {loyaltyPoints.slice(0, 3).map((lp) => (
                          <div key={lp.business?.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                            {lp.business?.logo ? (
                              <Image src={lp.business.logo} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-amber-700" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{lp.business?.name}</p>
                              <p className="text-lg font-bold text-amber-600">{lp.points} pkt</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Bookings */}
            {activeSection === 'bookings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Moje rezerwacje</h1>
                    <p className="text-gray-500 mt-1">Zarządzaj swoimi wizytami</p>
                  </div>
                  <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 font-medium shadow-md shadow-teal-500/20 transition-all">
                    <Plus className="w-5 h-5" />
                    Nowa rezerwacja
                  </Link>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-1.5 inline-flex gap-1">
                  {[
                    { id: 'upcoming', label: 'Nadchodzące', count: bookings?.upcoming.length, icon: Calendar },
                    { id: 'past', label: 'Historia', count: bookings?.past.length, icon: Clock },
                    { id: 'cancelled', label: 'Anulowane', count: bookings?.cancelled.length, icon: CalendarX },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setBookingsTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        bookingsTab === tab.id 
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}>
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          bookingsTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>{tab.count}</span>
                      ) : null}
                    </button>
                  ))}
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                  {loadingBookings ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/60 shadow-sm">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Ładowanie rezerwacji...</p>
                    </div>
                  ) : currentBookings?.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/60 shadow-sm">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Brak rezerwacji</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {bookingsTab === 'upcoming' ? 'Nie masz żadnych nadchodzących wizyt' : 
                         bookingsTab === 'past' ? 'Nie masz jeszcze historii wizyt' : 
                         'Nie masz anulowanych rezerwacji'}
                      </p>
                      {bookingsTab === 'upcoming' && (
                        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 font-medium shadow-md shadow-teal-500/20 transition-all">
                          <Plus className="w-5 h-5" />
                          Zarezerwuj wizytę
                        </Link>
                      )}
                    </div>
                  ) : (
                    currentBookings?.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="p-5">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Date Badge */}
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex flex-col items-center justify-center text-white shadow-lg">
                              <span className="text-xl font-bold leading-none">{new Date(booking.startTime).getDate()}</span>
                              <span className="text-xs uppercase mt-0.5">{new Date(booking.startTime).toLocaleDateString('pl-PL', { month: 'short' })}</span>
                            </div>
                            
                            {/* Business Logo */}
                            {booking.business?.logo ? (
                              <Image src={booking.business.logo} alt="" width={56} height={56} className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-7 h-7 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 text-lg truncate">{booking.service?.name}</h3>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-gray-600 truncate">{booking.business?.name}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(booking.startTime)}
                                </span>
                                {booking.employee && (
                                  <span className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" />
                                    {booking.employee.firstName} {booking.employee.lastName}
                                  </span>
                                )}
                                {booking.service?.duration && (
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {booking.service.duration} min
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Price & Actions */}
                            <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                              <p className="text-2xl font-bold text-gray-900">{Number(booking.totalPrice).toFixed(0)} zł</p>
                              {isUpcoming(booking) && (
                                <div className="flex gap-2">
                                  <button onClick={() => openActionModal('reschedule', booking)} className="px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 border border-teal-200 rounded-xl font-medium flex items-center gap-2 transition-colors">
                                    <CalendarClock className="w-4 h-4" />
                                    Przesuń
                                  </button>
                                  <button onClick={() => openActionModal('cancel', booking)} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-medium flex items-center gap-2 transition-colors">
                                    <CalendarX className="w-4 h-4" />
                                    Anuluj
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Business contact */}
                        {/* Business Link */}
                        {booking.business?.subdomain && (
                          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                            <a href={`https://${booking.business.subdomain}.rezerwacja24.pl`} target="_blank" rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
                              <ExternalLink className="w-4 h-4" />
                              Odwiedź stronę firmy
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Loyalty */}
            {activeSection === 'loyalty' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Punkty lojalnościowe</h1>
                  <p className="text-gray-500 mt-1">Zbieraj punkty i wymieniaj na nagrody</p>
                </div>
                
                {/* Info Banner */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Jak działają punkty?</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      Każda firma prowadzi własny program lojalnościowy. Punkty zbierasz osobno w każdej firmie i możesz je wymieniać na nagrody u danego usługodawcy.
                    </p>
                  </div>
                </div>

                {loadingLoyalty ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/60 shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Ładowanie punktów...</p>
                  </div>
                ) : loyaltyPoints.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/60 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Nie zbierasz jeszcze punktów</h3>
                    <p className="text-gray-500 text-sm mb-4">Rezerwuj wizyty w firmach z programem lojalnościowym</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-medium shadow-md shadow-amber-500/20 transition-all">
                      <Plus className="w-5 h-5" />
                      Znajdź firmy
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loyaltyPoints.map((lp) => (
                      <div key={lp.business?.id || 'unknown'} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5">
                          <div className="flex items-center gap-4">
                            {lp.business?.logo ? (
                              <Image src={lp.business.logo} alt="" width={56} height={56} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                <Building2 className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{lp.business?.name || 'Firma'}</h3>
                              <a href={`https://${lp.business?.subdomain}.rezerwacja24.pl`} target="_blank" rel="noopener noreferrer" 
                                className="text-sm text-gray-500 hover:text-teal-600 flex items-center gap-1">
                                {lp.business?.subdomain}.rezerwacja24.pl
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-amber-600">{lp.points}</p>
                              <p className="text-sm text-gray-500">punktów</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expandable History */}
                        <button onClick={() => setExpandedLoyalty(expandedLoyalty === lp.business?.id ? null : lp.business?.id || null)}
                          className="w-full px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                          <span>Historia punktów</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedLoyalty === lp.business?.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {expandedLoyalty === lp.business?.id && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                                {lp.history.length === 0 ? (
                                  <p className="text-sm text-gray-400 text-center py-2">Brak historii punktów</p>
                                ) : (
                                  <div className="space-y-2">
                                    {lp.history.slice(0, 5).map((h) => (
                                      <div key={h.id} className="flex items-center justify-between py-1">
                                        <div>
                                          <p className="text-sm text-gray-700">{h.reason}</p>
                                          <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString('pl-PL')}</p>
                                        </div>
                                        <span className={`text-sm font-bold ${h.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {h.points > 0 ? '+' : ''}{h.points}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Passes */}
            {activeSection === 'passes' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Moje karnety</h1>
                  <p className="text-gray-500 mt-1">Zarządzaj swoimi karnetami i abonamentami</p>
                </div>
                
                {loadingPasses ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/60 shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Ładowanie karnetów...</p>
                  </div>
                ) : (passes?.active.length || 0) === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/60 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Brak aktywnych karnetów</h3>
                    <p className="text-gray-500 text-sm mb-4">Karnety pozwalają korzystać z usług w atrakcyjnych cenach</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-medium shadow-md shadow-purple-500/20 transition-all">
                      <Plus className="w-5 h-5" />
                      Przeglądaj oferty
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {passes?.active.map((pass) => (
                      <div key={pass.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5">
                          <div className="flex items-center gap-4">
                            {pass.business?.logo ? (
                              <Image src={pass.business.logo} alt="" width={56} height={56} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Ticket className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{pass.name}</h3>
                              <p className="text-sm text-gray-500 truncate">{pass.business?.name}</p>
                            </div>
                          </div>
                          
                          {/* Progress Bar for Uses */}
                          {pass.usesRemaining !== null && pass.totalUses && (
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Pozostało wejść</span>
                                <span className="font-bold text-purple-600">{pass.usesRemaining} / {pass.totalUses}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                  style={{ width: `${(pass.usesRemaining / pass.totalUses) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {pass.expiresAt && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              Ważny do {new Date(pass.expiresAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                        
                        {pass.business?.subdomain && (
                          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                            <a href={`https://${pass.business.subdomain}.rezerwacja24.pl`} target="_blank" rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                              <ExternalLink className="w-4 h-4" />
                              Zarezerwuj z karnetem
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings */}
            {activeSection === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Ustawienia konta</h1>
                  <p className="text-gray-500 mt-1">Zarządzaj swoimi danymi i preferencjami</p>
                </div>
                
                {/* Personal Data */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Dane osobowe</h2>
                      <p className="text-sm text-gray-500">Twoje podstawowe informacje</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imię</label>
                        <input type="text" defaultValue={customer?.firstName} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko</label>
                        <input type="text" defaultValue={customer?.lastName} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" defaultValue={customer?.email} disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                        <p className="text-xs text-gray-400 mt-1">Email nie może być zmieniony</p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                        <input type="tel" defaultValue={(customer as any)?.phone || ''} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="+48 123 456 789" />
                      </div>
                    </div>
                    <button className="mt-6 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 font-medium shadow-md shadow-teal-500/20 transition-all">
                      Zapisz zmiany
                    </button>
                  </div>
                </div>
                
                {/* Notifications */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Powiadomienia</h2>
                      <p className="text-sm text-gray-500">Wybierz jak chcesz otrzymywać powiadomienia</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Przypomnienia email</p>
                          <p className="text-sm text-gray-500">Otrzymuj przypomnienia o wizytach na email</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded-lg" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Przypomnienia SMS</p>
                          <p className="text-sm text-gray-500">Otrzymuj przypomnienia o wizytach przez SMS</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded-lg" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Promocje i nowości</p>
                          <p className="text-sm text-gray-500">Bądź na bieżąco z promocjami</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-teal-600 rounded-lg" />
                    </label>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3 bg-red-50">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-red-900">Strefa niebezpieczna</h2>
                      <p className="text-sm text-red-700">Nieodwracalne operacje na koncie</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Usunięcie konta spowoduje trwałe usunięcie wszystkich Twoich danych, historii rezerwacji i punktów lojalnościowych. Ta operacja jest nieodwracalna.
                    </p>
                    <button className="px-5 py-2.5 text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 font-medium transition-colors">
                      Usuń moje konto
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Action Modal (Cancel/Reschedule) */}
      <AnimatePresence>
        {actionModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => { setActionModal(null); setActionResult(null) }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-xl p-5 shadow-xl mx-4">
              
              {actionResult ? (
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${actionResult.success ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mx-auto mb-3`}>
                    {actionResult.success ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
                  </div>
                  <p className="text-gray-900 font-medium mb-4">{actionResult.message}</p>
                  <button onClick={() => { setActionModal(null); setActionResult(null) }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                    Zamknij
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${actionModal.type === 'cancel' ? 'bg-red-100' : 'bg-teal-100'} flex items-center justify-center mx-auto mb-3`}>
                    {actionModal.type === 'cancel' ? <CalendarX className="w-6 h-6 text-red-600" /> : <CalendarClock className="w-6 h-6 text-teal-600" />}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {actionModal.type === 'cancel' ? 'Anulować rezerwację?' : 'Przesunąć termin?'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {actionModal.booking.service?.name} - {formatDate(actionModal.booking.startTime)} o {formatTime(actionModal.booking.startTime)}
                  </p>
                  
                  {/* Info about restrictions */}
                  {loadingDetails ? (
                    <div className="mb-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" /></div>
                  ) : bookingDetails && (
                    <div className="mb-4 text-left bg-gray-50 rounded-lg p-3 text-xs">
                      {actionModal.type === 'cancel' ? (
                        bookingDetails.canCancel ? (
                          <div className="flex items-start gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Możesz anulować tę rezerwację{bookingDetails.hasDeposit ? '. Uwaga: zaliczka nie podlega zwrotowi.' : '.'}</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Anulowanie jest możliwe do {bookingDetails.cancelDeadlineHours}h przed wizytą. Pozostało {bookingDetails.hoursUntilBooking}h.</span>
                          </div>
                        )
                      ) : (
                        bookingDetails.canReschedule ? (
                          <div className="flex items-start gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Możesz przesunąć tę rezerwację. Zostaniesz przekierowany na stronę firmy.</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Przesunięcie jest możliwe do {bookingDetails.rescheduleDeadlineHours}h przed wizytą. Pozostało {bookingDetails.hoursUntilBooking}h.</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button onClick={() => { setActionModal(null); setActionResult(null) }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-sm">
                      Anuluj
                    </button>
                    <button 
                      onClick={actionModal.type === 'cancel' ? handleCancelBooking : handleReschedule} 
                      disabled={actionLoading || (bookingDetails && (actionModal.type === 'cancel' ? !bookingDetails.canCancel : !bookingDetails.canReschedule))}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                        actionModal.type === 'cancel' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}>
                      {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {actionModal.type === 'cancel' ? 'Tak, anuluj' : 'Przesuń termin'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
