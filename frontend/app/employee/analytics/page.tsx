'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, Calendar, Clock, DollarSign, Users, CheckCircle, XCircle, RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { getApiUrl } from '@/lib/api-url'

const API_URL = getApiUrl()

interface UserData {
  employeeId: string
  tenantId: string
  permissions?: {
    canViewAnalytics?: boolean
    onlyOwnCalendar?: boolean
  }
}

interface Stats {
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
  avgBookingValue: number
  uniqueCustomers: number
}

export default function EmployeeAnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    avgBookingValue: 0,
    uniqueCustomers: 0
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('employee_user') || localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsed = JSON.parse(userData)
      if (!parsed.permissions?.canViewAnalytics) {
        router.push('/employee')
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
      
      // Calculate date range based on period
      const endDate = new Date()
      const startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else {
        startDate.setFullYear(startDate.getFullYear() - 1)
      }

      const params: any = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }
      
      if (user.permissions?.onlyOwnCalendar) {
        params.employeeId = user.employeeId
      }

      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.tenantId,
        },
        params
      })

      const bookings = response.data || []
      
      const completed = bookings.filter((b: any) => b.status?.toLowerCase() === 'completed')
      const cancelled = bookings.filter((b: any) => b.status?.toLowerCase() === 'cancelled')
      const totalRevenue = completed.reduce((sum: number, b: any) => sum + (parseFloat(b.totalPrice) || 0), 0)
      const uniqueCustomerIds = new Set(bookings.map((b: any) => b.customerId))

      setStats({
        totalBookings: bookings.length,
        completedBookings: completed.length,
        cancelledBookings: cancelled.length,
        totalRevenue,
        avgBookingValue: completed.length > 0 ? totalRevenue / completed.length : 0,
        uniqueCustomers: uniqueCustomerIds.size
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Błąd ładowania statystyk')
    } finally {
      setLoading(false)
    }
  }, [user, period])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  if (!user) return null

  const completionRate = stats.totalBookings > 0 
    ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1) 
    : '0'

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Statystyki</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Twoje wyniki i statystyki</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p 
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p === 'week' ? 'Tydzień' : p === 'month' ? 'Miesiąc' : 'Rok'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalBookings}</p>
              <p className="text-sm text-[var(--text-muted)]">Wszystkie rezerwacje</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.completedBookings}</p>
              <p className="text-sm text-[var(--text-muted)]">Zakończone</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.cancelledBookings}</p>
              <p className="text-sm text-[var(--text-muted)]">Anulowane</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalRevenue.toFixed(0)} zł</p>
              <p className="text-sm text-[var(--text-muted)]">Przychód</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.avgBookingValue.toFixed(0)} zł</p>
              <p className="text-sm text-[var(--text-muted)]">Średnia wartość</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.uniqueCustomers}</p>
              <p className="text-sm text-[var(--text-muted)]">Unikalnych klientów</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Wskaźnik realizacji</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)]">{completionRate}%</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              {stats.completedBookings} z {stats.totalBookings} rezerwacji zakończonych
            </p>
          </div>
        </>
      )}
    </div>
  )
}
