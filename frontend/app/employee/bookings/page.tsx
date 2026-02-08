'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Filter, RefreshCw, ChevronDown, X, Check, XCircle, CheckCircle, Phone, Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { getApiUrl } from '@/lib/api-url'

const API_URL = getApiUrl()

interface Booking {
  id: string
  customerName: string
  customerPhone?: string
  serviceName: string
  employeeName?: string
  date: string
  time: string
  endTime: string
  duration: number
  status: string
  price: number
}

interface UserData {
  employeeId: string
  firstName: string
  lastName: string
  tenantId: string
  permissions?: {
    canManageBookings?: boolean
    onlyOwnBookings?: boolean
  }
}

export default function EmployeeBookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('employee_user') || localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      setUser(JSON.parse(userData))
    } catch {
      router.push('/login')
    }
  }, [router])

  const loadData = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Get last 30 days and next 30 days
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30)

      const params: any = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }
      
      if (user.permissions?.onlyOwnBookings) {
        params.employeeId = user.employeeId
      }

      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.tenantId,
        },
        params
      })

      const transformed = (response.data || []).map((b: any) => {
        const start = new Date(b.startTime)
        const end = new Date(b.endTime)
        return {
          id: b.id,
          customerName: `${b.customers?.firstName || ''} ${b.customers?.lastName || ''}`.trim() || 'Klient',
          customerPhone: b.customers?.phone,
          serviceName: b.services?.name || 'Usługa',
          employeeName: b.employees ? `${b.employees.firstName} ${b.employees.lastName}` : null,
          date: start.toISOString().split('T')[0],
          time: start.toTimeString().slice(0, 5),
          endTime: end.toTimeString().slice(0, 5),
          duration: Math.round((end.getTime() - start.getTime()) / 60000),
          status: b.status,
          price: parseFloat(b.totalPrice) || 0,
        }
      })

      // Sort by date descending (newest first)
      transformed.sort((a: Booking, b: Booking) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return b.time.localeCompare(a.time)
      })

      setBookings(transformed)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Błąd ładowania rezerwacji')
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
    if (s === 'pending') return 'Oczekująca'
    if (s === 'cancelled') return 'Anulowana'
    if (s === 'completed') return 'Zakończona'
    return status
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${API_URL}/api/bookings/${bookingId}`, { status }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user?.tenantId,
        }
      })
      toast.success('Status zaktualizowany')
      setSelectedBooking(null)
      loadData()
    } catch (error) {
      toast.error('Błąd aktualizacji')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  if (!user) return null

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Rezerwacje</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Lista wszystkich rezerwacji</p>
        </div>
        
        <button 
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Szukaj klienta lub usługi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)]"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="pending">Oczekujące</option>
            <option value="confirmed">Potwierdzone</option>
            <option value="completed">Zakończone</option>
            <option value="cancelled">Anulowane</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">Brak rezerwacji</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Klient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Usługa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Cena</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredBookings.map((booking) => (
                  <tr 
                    key={booking.id} 
                    className="hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors" 
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">
                        {new Date(booking.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">{booking.time} - {booking.endTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{booking.customerName}</div>
                      {booking.customerPhone && (
                        <div className="text-sm text-[var(--text-muted)]">{booking.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[var(--text-primary)]">{booking.serviceName}</div>
                      <div className="text-sm text-[var(--text-muted)]">{booking.duration} min</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{booking.price.toFixed(0)} zł</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Szczegóły rezerwacji</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg">
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
                  {selectedBooking.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedBooking.customerName}</p>
                  {selectedBooking.customerPhone && <p className="text-sm text-[var(--text-muted)]">{selectedBooking.customerPhone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Data</p>
                  <p className="font-medium text-[var(--text-primary)]">{new Date(selectedBooking.date).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Godzina</p>
                  <p className="font-medium text-[var(--text-primary)]">{selectedBooking.time} - {selectedBooking.endTime}</p>
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)] mb-1">Usługa</p>
                <p className="font-medium text-[var(--text-primary)]">{selectedBooking.serviceName}</p>
                <p className="text-sm text-[var(--text-muted)]">{selectedBooking.duration} min • {selectedBooking.price.toFixed(0)} zł</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedBooking.status)}`}>
                  {getStatusLabel(selectedBooking.status)}
                </span>
              </div>

              {user?.permissions?.canManageBookings !== false && (
                <div className="flex gap-2 pt-4">
                  {selectedBooking.status.toLowerCase() === 'pending' && (
                    <button onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Potwierdź
                    </button>
                  )}
                  {selectedBooking.status.toLowerCase() !== 'cancelled' && (
                    <button onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Anuluj
                    </button>
                  )}
                  {selectedBooking.status.toLowerCase() === 'confirmed' && (
                    <button onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Zakończ
                    </button>
                  )}
                </div>
              )}

              {selectedBooking.customerPhone && (
                <a href={`tel:${selectedBooking.customerPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium">
                  <Phone className="w-5 h-5" /> Zadzwoń
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
