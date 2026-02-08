'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  MoreHorizontal,
  ChevronRight,
  FileText,
  Wallet,
  Settings,
  Scissors,
  UserCog,
  BarChart3,
  Bell,
  Star,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { exportBookingsReport, exportFinancialReport } from '@/lib/export'
import { getTenantConfig } from '@/lib/tenant'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'
import { useProfileSetup } from '@/hooks/useProfileSetup'
import ProfileSetupWizard from '@/components/ProfileSetupWizard'
import DashboardCarousel from '@/components/dashboard/DashboardCarousel'
import axios from 'axios'

export default function DashboardPage() {
  const { t, language } = useDashboardTranslation()
  const { showWizard, isComplete, percentage } = useProfileSetup()
  
  // Automatyczne wykrywanie środowiska
  const API_URL = typeof window !== 'undefined' 
    ? (window.location.hostname.includes('bookings24.eu') 
        ? 'https://api.bookings24.eu'
        : window.location.hostname.includes('rezerwacja24.pl')
          ? 'https://api.rezerwacja24.pl'
          : 'http://localhost:3001')
    : 'http://localhost:3001'
  
  // Waluta na podstawie języka
  const currency = language === 'pl' ? 'zł' : '€'
  const locale = language === 'pl' ? 'pl-PL' : language === 'de' ? 'de-DE' : 'en-GB'
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week')
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    bookingsTrend: 0,
    revenueTrend: 0,
    customersTrend: 0,
    activeCustomersTrend: 0
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)

  const getDateRange = (period: 'day' | 'week' | 'month') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'day':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)
        return { start: weekStart, end: weekEnd }
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        return { start: monthStart, end: monthEnd }
    }
  }

  const getPreviousDateRange = (period: 'day' | 'week' | 'month') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'day':
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        return { start: yesterday, end: today }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() - 7)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)
        return { start: weekStart, end: weekEnd }
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth(), 1)
        return { start: monthStart, end: monthEnd }
    }
  }

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const loadStats = async () => {
    try {
      console.log('📊 Loading stats from API:', API_URL)
      
      const config = getTenantConfig()
      
      const [bookingsRes, customersRes] = await Promise.all([
        axios.get(`${API_URL}/api/bookings`, config),
        axios.get(`${API_URL}/api/customers`, config)
      ])
      
      const bookings = bookingsRes.data || []
      const customers = customersRes.data || []
      console.log('✅ Loaded bookings:', bookings.length, 'customers:', customers.length)
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const todayBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.startTime)
        return bookingDate >= todayStart && bookingDate < todayEnd
      })
    
      // Filtruj rezerwacje według wybranego okresu
      const { start, end } = getDateRange(selectedPeriod)
      const { start: prevStart, end: prevEnd } = getPreviousDateRange(selectedPeriod)
      
      const periodBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.startTime)
        return bookingDate >= start && bookingDate < end
      })
      
      const prevPeriodBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.startTime)
        return bookingDate >= prevStart && bookingDate < prevEnd
      })
      
      // Oblicz przychody
      const periodRevenue = periodBookings
        .filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0)
      
      const prevPeriodRevenue = prevPeriodBookings
        .filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0)
      
      const todayRevenue = todayBookings
        .filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0)
      
      // Oblicz klientów w okresie
      const periodCustomerIds = new Set(periodBookings.map((b: any) => b.customerId))
      const prevPeriodCustomerIds = new Set(prevPeriodBookings.map((b: any) => b.customerId))
      
      const activeCustomers = customers.filter((c: any) => !c.isBlocked).length
      
      setStats({
        totalBookings: periodBookings.length,
        todayBookings: todayBookings.length,
        totalRevenue: Math.round(periodRevenue),
        todayRevenue: Math.round(todayRevenue),
        totalCustomers: customers.length,
        activeCustomers,
        bookingsTrend: calculateTrend(periodBookings.length, prevPeriodBookings.length),
        revenueTrend: calculateTrend(periodRevenue, prevPeriodRevenue),
        customersTrend: calculateTrend(periodCustomerIds.size, prevPeriodCustomerIds.size),
        activeCustomersTrend: 0
      })
    } catch (error) {
      console.error('Błąd ładowania statystyk:', error)
      // Ustaw puste statystyki
      setStats({
        totalBookings: 0,
        todayBookings: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        totalCustomers: 0,
        activeCustomers: 0,
        bookingsTrend: 0,
        revenueTrend: 0,
        customersTrend: 0,
        activeCustomersTrend: 0
      })
    }
  }
  
  const loadRecentBookings = async () => {
    try {
      const config = getTenantConfig()
      
      const [bookingsRes, customersRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/bookings`, config),
        axios.get(`${API_URL}/api/customers`, config),
        axios.get(`${API_URL}/api/services`, config)
      ])
      
      const bookings = bookingsRes.data || []
      const customers = customersRes.data || []
      const services = servicesRes.data || []
      const now = new Date()
      
      // Filtruj tylko nadchodzące rezerwacje (przyszłe)
      const upcoming = bookings
        .filter((b: any) => {
          const bookingDateTime = new Date(b.startTime)
          return bookingDateTime >= now && (b.status === 'CONFIRMED' || b.status === 'PENDING')
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.startTime).getTime()
          const dateB = new Date(b.startTime).getTime()
          return dateA - dateB
        })
        .slice(0, 4)
        .map((booking: any) => {
          const customer = customers.find((c: any) => c.id === booking.customerId)
          const service = services.find((s: any) => s.id === booking.serviceId)
          const startTime = new Date(booking.startTime)
          
          return {
            id: booking.id,
            customerName: customer ? `${customer.firstName} ${customer.lastName}` : (language === 'pl' ? 'Nieznany klient' : 'Unknown customer'),
            serviceName: service?.name || (language === 'pl' ? 'Nieznana usługa' : 'Unknown service'),
            date: startTime.toISOString().split('T')[0],
            time: startTime.toTimeString().slice(0, 5),
            status: booking.status.toLowerCase()
          }
        })
      
      setRecentBookings(upcoming)
    } catch (error) {
      console.error('Błąd ładowania nadchodzących rezerwacji:', error)
      // Ustaw pustą listę
      setRecentBookings([])
    }
  }

  const handleExport = (type: 'bookings' | 'financial') => {
    if (type === 'bookings') {
      exportBookingsReport(selectedPeriod)
    } else {
      exportFinancialReport(selectedPeriod)
    }
  }

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/billing/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionStatus(data)
      }
    } catch (error) {
      console.error('Błąd ładowania statusu subskrypcji:', error)
    }
  }

  useEffect(() => {
    // Załaduj dane z API
    loadStats()
    loadRecentBookings()
    loadSubscriptionStatus()
    
    // Auto-refresh co 30 sekund
    const interval = setInterval(() => {
      loadStats()
      loadRecentBookings()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedPeriod])

  // Formatowanie daty
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return t.common.today
    if (date.toDateString() === tomorrow.toDateString()) return t.common.tomorrow
    return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen">
      {/* Trial Banner - przeniesiony do layout.tsx jako TrialBanner */}

      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
            {t.dashboard.welcome}
          </h1>
          <p className="text-[var(--text-muted)]">
            {language === 'pl' ? 'Oto co dzieje się w Twoim biznesie' : language === 'de' ? 'Das passiert in Ihrem Unternehmen' : "Here's what's happening in your business"}
          </p>
        </div>

        {/* Carousel - Feature Highlights */}
        <div className="mb-8">
          <DashboardCarousel language={language} />
        </div>

        {/* Period Tabs - Pill Style */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-card)] rounded-full w-fit border border-[var(--border-color)]">
          {[
            { key: 'day', label: t.common.today },
            { key: 'week', label: t.common.thisWeek },
            { key: 'month', label: t.common.thisMonth }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedPeriod(tab.key as 'day' | 'week' | 'month')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                selectedPeriod === tab.key
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Grid - Modern Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Rezerwacje */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[var(--text-primary)]" />
              </div>
              <span className="text-sm text-[var(--text-muted)]">{t.nav.bookings}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{stats.totalBookings}</span>
              {stats.bookingsTrend !== 0 && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.bookingsTrend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {stats.bookingsTrend > 0 ? '+' : ''}{stats.bookingsTrend}%
                </span>
              )}
            </div>
          </div>

          {/* Przychód */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[var(--text-primary)]" />
              </div>
              <span className="text-sm text-[var(--text-muted)]">{t.analytics.revenue}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{stats.totalRevenue} {currency}</span>
              {stats.revenueTrend !== 0 && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.revenueTrend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {stats.revenueTrend > 0 ? '+' : ''}{stats.revenueTrend}%
                </span>
              )}
            </div>
          </div>

          {/* Klienci */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--text-primary)]" />
              </div>
              <span className="text-sm text-[var(--text-muted)]">{t.nav.customers}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{stats.totalCustomers}</span>
              {stats.customersTrend !== 0 && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.customersTrend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {stats.customersTrend > 0 ? '+' : ''}{stats.customersTrend}%
                </span>
              )}
            </div>
          </div>

          {/* Dzisiejsze rezerwacje */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[var(--text-primary)]" />
              </div>
              <span className="text-sm text-[var(--text-muted)]">{t.common.today}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{stats.todayBookings}</span>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-card-hover)] px-2 py-1 rounded-full">{stats.todayRevenue} {currency}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nadchodzące rezerwacje */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
                <h2 className="font-semibold text-[var(--text-primary)]">{t.dashboard.upcomingBookings}</h2>
                <Link 
                  href="/dashboard/bookings" 
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                >
                  {language === 'pl' ? 'Zobacz wszystkie' : language === 'de' ? 'Alle anzeigen' : 'View all'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {recentBookings.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-muted)] mb-5">{t.dashboard.noBookingsToday}</p>
                  <Link 
                    href="/dashboard/bookings/new" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t.dashboard.newBooking}
                  </Link>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {recentBookings.map((booking, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-primary)] font-semibold text-sm">
                          {booking.customerName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{booking.customerName}</p>
                          <p className="text-sm text-[var(--text-muted)]">{booking.serviceName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--text-primary)]">{booking.time}</p>
                        <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded-full inline-block">{formatDate(booking.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile Setup Wizard - pokazuj tylko gdy profil nie jest kompletny */}
            {!isComplete && <ProfileSetupWizard variant="inline" />}

            {/* Szybkie akcje */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5">
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t.dashboard.quickActions}</h2>
              <div className="space-y-2">
                <Link 
                  href="/dashboard/calendar?action=new-booking" 
                  className="flex items-center gap-3 p-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 transition-all duration-200 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{t.dashboard.newBooking}</span>
                </Link>
                
                <Link 
                  href="/dashboard/customers?action=new" 
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{t.dashboard.newCustomer}</span>
                </Link>
                
                <Link 
                  href="/dashboard/services?action=new" 
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                    <Plus className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{t.services.newService}</span>
                </Link>
                
                <Link 
                  href="/dashboard/calendar" 
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{t.nav.calendar}</span>
                </Link>
              </div>
            </div>

            {/* Raporty */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5">
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t.common.export}</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExport('bookings')}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{language === 'pl' ? 'Raport rezerwacji' : language === 'de' ? 'Buchungsbericht' : 'Bookings report'}</span>
                </button>
                <button 
                  onClick={() => handleExport('financial')}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{language === 'pl' ? 'Raport finansowy' : language === 'de' ? 'Finanzbericht' : 'Financial report'}</span>
                </button>
              </div>
            </div>

            {/* Link do ustawień */}
            <Link 
              href="/dashboard/settings" 
              className="flex items-center justify-between bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 hover:bg-[var(--bg-card-hover)] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <span className="text-sm text-[var(--text-primary)]">{language === 'pl' ? 'Ustawienia firmy' : language === 'de' ? 'Firmeneinstellungen' : 'Company settings'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          </div>
        </div>

        {/* Quick Access Grid - Additional Features */}
        <div className="mt-8">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            {language === 'pl' ? 'Szybki dostęp' : language === 'de' ? 'Schnellzugriff' : 'Quick Access'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { href: '/dashboard/services', icon: Scissors, label: language === 'pl' ? 'Usługi' : language === 'de' ? 'Dienste' : 'Services', color: 'from-pink-500 to-rose-500' },
              { href: '/dashboard/employees', icon: UserCog, label: language === 'pl' ? 'Pracownicy' : language === 'de' ? 'Mitarbeiter' : 'Employees', color: 'from-blue-500 to-cyan-500' },
              { href: '/dashboard/analytics', icon: BarChart3, label: language === 'pl' ? 'Analityka' : language === 'de' ? 'Analytik' : 'Analytics', color: 'from-emerald-500 to-green-500' },
              { href: '/dashboard/promotions', icon: Zap, label: language === 'pl' ? 'Promocje' : language === 'de' ? 'Aktionen' : 'Promotions', color: 'from-amber-500 to-orange-500' },
              { href: '/dashboard/loyalty', icon: Star, label: language === 'pl' ? 'Lojalność' : language === 'de' ? 'Treue' : 'Loyalty', color: 'from-purple-500 to-violet-500' },
              { href: '/dashboard/settings?tab=notifications', icon: Bell, label: language === 'pl' ? 'SMS' : 'SMS', color: 'from-red-500 to-pink-500' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center gap-2 p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] hover:shadow-lg hover:border-transparent transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
