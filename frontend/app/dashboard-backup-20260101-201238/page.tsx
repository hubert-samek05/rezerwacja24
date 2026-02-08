'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  DollarSign,
  Settings,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { exportBookingsReport, exportFinancialReport } from '@/lib/export'
import { getTenantConfig } from '@/lib/tenant'
import axios from 'axios'
import { bookingsApi } from '@/lib/api/bookings'
import { customersApi } from '@/lib/api/customers'
import { servicesApi } from '@/lib/api/services'
import TrialCountdownBanner from '@/components/TrialCountdownBanner'

export default function DashboardPage() {
  // Automatyczne wykrywanie środowiska
  const API_URL = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl')
    ? 'https://api.rezerwacja24.pl'
    : 'http://localhost:3001'
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
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
            customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Nieznany klient',
            serviceName: service?.name || 'Nieznana usługa',
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

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadStats()
    loadRecentBookings()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleExport = (type: 'bookings' | 'financial') => {
    if (type === 'bookings') {
      exportBookingsReport(selectedPeriod)
    } else {
      exportFinancialReport(selectedPeriod)
    }
    setShowExportMenu(false)
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-neutral-gray/70">Witaj ponownie! Oto podsumowanie Twojego biznesu</p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 text-accent-neon ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Trial Countdown Banner */}
        {subscriptionStatus?.isInTrial && subscriptionStatus?.remainingTrialDays >= 0 && (
          <TrialCountdownBanner
            remainingDays={subscriptionStatus.remainingTrialDays}
            trialEndDate={subscriptionStatus.trialEndDate || new Date(Date.now() + subscriptionStatus.remainingTrialDays * 24 * 60 * 60 * 1000).toISOString()}
          />
        )}

        <div className="flex items-center space-x-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedPeriod('day')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              selectedPeriod === 'day' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
            }`}
          >
            Dzisiaj
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              selectedPeriod === 'week' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
            }`}
          >
            Tydzień
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              selectedPeriod === 'month' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
            }`}
          >
            Miesiąc
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-carbon-black" />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                stats.bookingsTrend >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.bookingsTrend >= 0 ? '+' : ''}{stats.bookingsTrend}%
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">{stats.totalBookings}</h3>
            <p className="text-neutral-gray/70 text-xs sm:text-sm">
              {selectedPeriod === 'day' ? 'Dzisiaj' : selectedPeriod === 'week' ? 'Ten tydzień' : 'Ten miesiąc'}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-carbon-black" />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                stats.revenueTrend >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.revenueTrend >= 0 ? '+' : ''}{stats.revenueTrend}%
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">{stats.totalRevenue.toFixed(2)} zł</h3>
            <p className="text-neutral-gray/70 text-xs sm:text-sm">
              Przychód - {selectedPeriod === 'day' ? 'dziś' : selectedPeriod === 'week' ? 'tydzień' : 'miesiąc'}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-carbon-black" />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                stats.customersTrend >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.customersTrend >= 0 ? '+' : ''}{stats.customersTrend}%
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">{stats.totalCustomers}</h3>
            <p className="text-neutral-gray/70 text-xs sm:text-sm">Wszyscy klienci</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-carbon-black" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-accent-neon">
                {stats.activeCustomers}
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">{stats.activeCustomers}</h3>
            <p className="text-neutral-gray/70 text-xs sm:text-sm">Aktywni klienci</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 glass-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Nadchodzące rezerwacje</h2>
              <Link href="/dashboard/bookings" className="text-accent-neon text-xs sm:text-sm hover:underline">
                Zobacz wszystkie
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-neutral-gray/70 text-center py-8">Brak nadchodzących rezerwacji</p>
              ) : (
                recentBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-carbon-black">{booking.customerName[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{booking.customerName}</h4>
                        <p className="text-sm text-neutral-gray/70">{booking.serviceName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{booking.time}</p>
                      <p className="text-xs text-neutral-gray/70">{booking.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Szybkie akcje</h2>
            
            <div className="space-y-3">
              <Link href="/dashboard/bookings/new" className="btn-neon w-full flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nowa rezerwacja</span>
              </Link>
              
              <Link href="/dashboard/customers/new" className="btn-outline-neon w-full flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Dodaj klienta</span>
              </Link>
              
              <Link href="/dashboard/services/new" className="btn-outline-neon w-full flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Dodaj usługę</span>
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="btn-outline-neon w-full flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Eksportuj raport</span>
                </button>
                
                {showExportMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-primary-dark border border-accent-neon/20 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => handleExport('bookings')}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-accent-neon/10 transition-colors"
                    >
                      Raport rezerwacji (CSV)
                    </button>
                    <button
                      onClick={() => handleExport('financial')}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-accent-neon/10 transition-colors border-t border-white/5"
                    >
                      Raport finansowy (CSV)
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-neutral-gray mb-4">Dzisiaj</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-gray/70">Rezerwacje</span>
                  <span className="text-sm font-medium text-white">{stats.todayBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-gray/70">Przychód</span>
                  <span className="text-sm font-medium text-white">{stats.todayRevenue} zł</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-gray/70">Aktywni klienci</span>
                  <span className="text-sm font-medium text-white">{stats.activeCustomers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
