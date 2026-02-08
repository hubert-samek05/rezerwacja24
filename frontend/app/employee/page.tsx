'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, Clock, Users, TrendingUp,
  CheckCircle, AlertCircle, Plus, ChevronRight, RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { getApiUrl } from '@/lib/api-url'

const API_URL = getApiUrl()

interface Booking {
  id: string
  customerName: string
  serviceName: string
  date: string
  time: string
  endTime: string
  status: string
  price: number
}

interface UserData {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  tenantId: string
  tenant?: { name: string }
  permissions?: {
    canViewCalendar?: boolean
    canManageBookings?: boolean
    canViewCustomers?: boolean
    canViewServices?: boolean
    canViewAnalytics?: boolean
    onlyOwnCalendar?: boolean
    accountType?: string
  }
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayBookings: 0,
    weekBookings: 0,
    monthRevenue: 0,
    completedToday: 0,
    pendingToday: 0
  })
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('employee_user') || localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsed = JSON.parse(userData)
      if (parsed.role !== 'EMPLOYEE' && parsed.type !== 'employee' && !parsed.employeeId) {
        router.push('/dashboard')
        return
      }
      setUser(parsed)
    } catch {
      router.push('/login')
    }
  }, [router])

  const loadData = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.tenantId,
        }
      }

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      const weekStart = new Date(today)
      const day = weekStart.getDay()
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
      weekStart.setDate(diff)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      const params: Record<string, string> = {
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0],
      }
      
      if (user.permissions?.onlyOwnCalendar) {
        params.employeeId = user.employeeId
      }

      const bookingsRes = await axios.get(`${API_URL}/api/bookings`, { ...config, params })
      const allBookings = (bookingsRes.data || []).map((b: any) => {
        const start = new Date(b.startTime)
        const end = new Date(b.endTime)
        return {
          id: b.id,
          customerName: `${b.customers?.firstName || ''} ${b.customers?.lastName || ''}`.trim() || 'Klient',
          serviceName: b.services?.name || 'Usluga',
          date: start.toISOString().split('T')[0],
          time: start.toTimeString().slice(0, 5),
          endTime: end.toTimeString().slice(0, 5),
          status: b.status,
          price: parseFloat(b.totalPrice) || 0,
        }
      })

      const todayList = allBookings.filter((b: Booking) => b.date === todayStr)
      const weekList = allBookings.filter((b: Booking) => {
        const d = new Date(b.date)
        return d >= weekStart && d <= weekEnd
      })
      
      setStats({
        todayBookings: todayList.length,
        weekBookings: weekList.length,
        monthRevenue: allBookings.reduce((sum: number, b: Booking) => sum + b.price, 0),
        completedToday: todayList.filter((b: Booking) => b.status.toLowerCase() === 'completed').length,
        pendingToday: todayList.filter((b: Booking) => b.status.toLowerCase() === 'pending').length
      })

      setTodayBookings(todayList.sort((a: Booking, b: Booking) => a.time.localeCompare(b.time)))
      
      const upcoming = allBookings
        .filter((b: Booking) => b.date > todayStr)
        .sort((a: Booking, b: Booking) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 5)
      setUpcomingBookings(upcoming)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Blad ladowania danych')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'confirmed') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (s === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    if (s === 'cancelled') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    if (s === 'completed') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'confirmed') return 'Potwierdzona'
    if (s === 'pending') return 'Oczekujaca'
    if (s === 'cancelled') return 'Anulowana'
    if (s === 'completed') return 'Zakonczona'
    return status
  }

  const getAccountTypeLabel = () => {
    const type = user?.permissions?.accountType
    switch (type) {
      case 'manager': return 'Menadzer'
      case 'receptionist': return 'Recepcja'
      case 'secretary': return 'Sekretariat'
      case 'accountant': return 'Ksiegowosc'
      case 'assistant': return 'Asystent'
      default: return 'Pracownik'
    }
  }

  if (!user) {
    return null
  }

  const todayFormatted = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Czesc, {user.firstName}!
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {todayFormatted} - {getAccountTypeLabel()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
          </button>
          {user.permissions?.canManageBookings !== false && (
            <Link 
              href="/employee/calendar"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nowa rezerwacja</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.todayBookings}</p>
          <p className="text-sm text-[var(--text-muted)]">Dzis rezerwacji</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.weekBookings}</p>
          <p className="text-sm text-[var(--text-muted)]">Ten tydzien</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.completedToday}</p>
          <p className="text-sm text-[var(--text-muted)]">Zakonczone dzis</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pendingToday}</p>
          <p className="text-sm text-[var(--text-muted)]">Oczekujace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Dzisiejsze rezerwacje</h2>
            <Link href="/employee/calendar" className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
              Zobacz wszystkie <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-muted)]">Brak rezerwacji na dzis</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {todayBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{booking.time}</p>
                      <p className="text-xs text-[var(--text-muted)]">{booking.endTime}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">{booking.customerName}</p>
                      <p className="text-sm text-[var(--text-muted)] truncate">{booking.serviceName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Nadchodzace</h2>
            <Link href="/employee/bookings" className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
              Zobacz wszystkie <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-muted)]">Brak nadchodzacych rezerwacji</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(booking.date).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{booking.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">{booking.customerName}</p>
                      <p className="text-sm text-[var(--text-muted)] truncate">{booking.serviceName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link 
            href="/employee/calendar"
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg hover:border-teal-500/30 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="font-medium text-[var(--text-primary)]">Kalendarz</p>
            <p className="text-xs text-[var(--text-muted)]">Zobacz grafik</p>
          </Link>

          <Link 
            href="/employee/bookings"
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg hover:border-blue-500/30 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-medium text-[var(--text-primary)]">Rezerwacje</p>
            <p className="text-xs text-[var(--text-muted)]">Lista wizyt</p>
          </Link>

          {user.permissions?.canViewCustomers && (
            <Link 
              href="/employee/customers"
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg hover:border-purple-500/30 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="font-medium text-[var(--text-primary)]">Klienci</p>
              <p className="text-xs text-[var(--text-muted)]">Baza klientow</p>
            </Link>
          )}

          {user.permissions?.canViewAnalytics && (
            <Link 
              href="/employee/analytics"
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg hover:border-emerald-500/30 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-medium text-[var(--text-primary)]">Statystyki</p>
              <p className="text-xs text-[var(--text-muted)]">Twoje wyniki</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
