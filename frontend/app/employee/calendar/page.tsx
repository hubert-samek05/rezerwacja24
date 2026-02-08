'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, ChevronRight, Plus, X, Check, XCircle, CheckCircle,
  Phone, RefreshCw, Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { getApiUrl } from '@/lib/api-url'

const API_URL = getApiUrl()

interface Booking {
  id: string
  customerId: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  employeeId?: string
  employeeName?: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  endTime: string
  duration: number
  status: string
  notes?: string
  price: number
}

interface Service {
  id: string
  name: string
  duration: number
  basePrice: number
  isActive: boolean
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  isActive: boolean
}

interface UserData {
  employeeId: string
  firstName: string
  lastName: string
  tenantId: string
  permissions?: {
    canManageBookings?: boolean
    onlyOwnCalendar?: boolean
  }
}

type ViewMode = 'day' | 'week' | 'month'

export default function EmployeeCalendarPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    employeeId: '',
    date: '',
    time: '',
    notes: ''
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
      setUser(parsed)
      if (parsed.permissions?.onlyOwnCalendar) {
        setSelectedEmployee(parsed.employeeId)
      }
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

      let startDate = new Date(currentDate)
      let endDate = new Date(currentDate)
      
      if (viewMode === 'day') {
        // Just today
      } else if (viewMode === 'week') {
        const day = startDate.getDay()
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1)
        startDate = new Date(startDate.setDate(diff))
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      }

      const params: any = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }
      
      if (user.permissions?.onlyOwnCalendar) {
        params.employeeId = user.employeeId
      }

      const [bookingsRes, employeesRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/bookings`, { ...config, params }),
        axios.get(`${API_URL}/api/employees?isActive=true`, config),
        axios.get(`${API_URL}/api/services`, config),
      ])

      const transformed = (bookingsRes.data || []).map((b: any) => {
        const start = new Date(b.startTime)
        const end = new Date(b.endTime)
        return {
          id: b.id,
          customerId: b.customerId,
          customerName: `${b.customers?.firstName || ''} ${b.customers?.lastName || ''}`.trim() || 'Klient',
          customerPhone: b.customers?.phone,
          customerEmail: b.customers?.email,
          employeeId: b.employeeId,
          employeeName: b.employees ? `${b.employees.firstName} ${b.employees.lastName}` : null,
          serviceId: b.serviceId,
          serviceName: b.services?.name || 'Usługa',
          date: start.toISOString().split('T')[0],
          time: start.toTimeString().slice(0, 5),
          endTime: end.toTimeString().slice(0, 5),
          duration: Math.round((end.getTime() - start.getTime()) / 60000),
          status: b.status,
          notes: b.customerNotes,
          price: parseFloat(b.totalPrice) || 0,
        }
      })

      setBookings(transformed)
      setEmployees(employeesRes.data || [])
      setServices(servicesRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Błąd ładowania danych')
    } finally {
      setLoading(false)
    }
  }, [user, currentDate, viewMode])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction)
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction * 7))
    else newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => setCurrentDate(new Date())

  const formatHeader = () => {
    const options: Intl.DateTimeFormatOptions = viewMode === 'day' 
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : viewMode === 'week'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { month: 'long', year: 'numeric' }
    return currentDate.toLocaleDateString('pl-PL', options)
  }

  const getWeekDays = () => {
    const days = []
    const start = new Date(currentDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }

  const getBookingsForDate = (dateStr: string) => {
    let filtered = bookings.filter(b => b.date === dateStr)
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(b => b.employeeId === selectedEmployee || !b.employeeId)
    }
    return filtered.sort((a, b) => a.time.localeCompare(b.time))
  }

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

  const handleCreateBooking = async () => {
    if (!formData.customerName || !formData.customerPhone || !formData.serviceId || !formData.date || !formData.time) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const service = services.find(s => s.id === formData.serviceId)
      const duration = service?.duration || 60

      const [hours, minutes] = formData.time.split(':').map(Number)
      const startTime = new Date(formData.date)
      startTime.setHours(hours, minutes, 0, 0)
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + duration)

      await axios.post(`${API_URL}/api/bookings`, {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        serviceId: formData.serviceId,
        employeeId: formData.employeeId || user?.employeeId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPrice: service?.basePrice || 0,
        notes: formData.notes,
        status: 'CONFIRMED',
        createdById: user?.employeeId,
        createdByType: 'employee',
        createdByName: `${user?.firstName} ${user?.lastName}`,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user?.tenantId,
        }
      })

      toast.success('Rezerwacja utworzona!')
      setShowAddModal(false)
      setFormData({ customerName: '', customerPhone: '', customerEmail: '', serviceId: '', employeeId: '', date: '', time: '', notes: '' })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Błąd tworzenia rezerwacji')
    }
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

  if (!user) return null

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
              Dziś
            </button>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] capitalize">{formatHeader()}</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === mode 
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {mode === 'day' ? 'Dzień' : mode === 'week' ? 'Tydzień' : 'Miesiąc'}
              </button>
            ))}
          </div>
          
          {!user.permissions?.onlyOwnCalendar && (
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-secondary)] border-0 rounded-lg text-sm text-[var(--text-primary)]"
            >
              <option value="all">Wszyscy</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          )}

          {user.permissions?.canManageBookings !== false && (
            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, date: todayStr, time: '09:00' }))
                setShowAddModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nowa rezerwacja</span>
            </button>
          )}

          <button onClick={loadData} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
            {getWeekDays().map((day, i) => {
              const dateStr = day.toISOString().split('T')[0]
              const isToday = dateStr === todayStr
              return (
                <div key={i} className={`p-3 text-center border-r last:border-r-0 border-[var(--border-color)] ${isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                  <p className="text-xs text-[var(--text-muted)] uppercase">{day.toLocaleDateString('pl-PL', { weekday: 'short' })}</p>
                  <p className={`text-lg font-semibold ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-[var(--text-primary)]'}`}>{day.getDate()}</p>
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[500px]">
            {getWeekDays().map((day, i) => {
              const dateStr = day.toISOString().split('T')[0]
              const dayBookings = getBookingsForDate(dateStr)
              const isToday = dateStr === todayStr
              return (
                <div key={i} className={`border-r last:border-r-0 border-[var(--border-color)] p-2 ${isToday ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}>
                  {loading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-16 bg-[var(--bg-secondary)] rounded-lg"></div>
                    </div>
                  ) : dayBookings.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] text-center py-4">Brak</p>
                  ) : (
                    <div className="space-y-2">
                      {dayBookings.map((booking) => (
                        <div 
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-lg cursor-pointer transition-colors border-l-4 border-teal-500"
                        >
                          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">{booking.time}</p>
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{booking.customerName}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{booking.serviceName}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              {currentDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
              </div>
            ) : getBookingsForDate(currentDate.toISOString().split('T')[0]).length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-muted)]">Brak rezerwacji na ten dzień</p>
              </div>
            ) : (
              getBookingsForDate(currentDate.toISOString().split('T')[0]).map((booking) => (
                <div 
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="p-4 hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors flex items-center gap-4"
                >
                  <div className="w-16 text-center">
                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{booking.time}</p>
                    <p className="text-xs text-[var(--text-muted)]">{booking.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)]">{booking.customerName}</p>
                    <p className="text-sm text-[var(--text-muted)]">{booking.serviceName} • {booking.duration} min</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{booking.price.toFixed(0)} zł</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-[var(--text-muted)] border-r last:border-r-0 border-[var(--border-color)]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {(() => {
              const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
              const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
              const startDay = (firstDay.getDay() + 6) % 7
              const days = []
              
              for (let i = startDay - 1; i >= 0; i--) {
                const d = new Date(firstDay)
                d.setDate(d.getDate() - i - 1)
                days.push({ date: d, isCurrentMonth: false })
              }
              
              for (let i = 1; i <= lastDay.getDate(); i++) {
                days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), isCurrentMonth: true })
              }
              
              const remaining = 42 - days.length
              for (let i = 1; i <= remaining; i++) {
                const d = new Date(lastDay)
                d.setDate(d.getDate() + i)
                days.push({ date: d, isCurrentMonth: false })
              }
              
              return days.map((item, i) => {
                const dateStr = item.date.toISOString().split('T')[0]
                const isToday = dateStr === todayStr
                const dayBookings = getBookingsForDate(dateStr)
                
                return (
                  <div 
                    key={i}
                    className={`min-h-[80px] p-2 border-r border-b last:border-r-0 border-[var(--border-color)] ${
                      !item.isCurrentMonth ? 'bg-[var(--bg-secondary)]/50' : ''
                    } ${isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                  >
                    <p className={`text-sm font-medium mb-1 ${
                      !item.isCurrentMonth ? 'text-[var(--text-muted)]' : isToday ? 'text-teal-600 dark:text-teal-400' : 'text-[var(--text-primary)]'
                    }`}>
                      {item.date.getDate()}
                    </p>
                    {dayBookings.slice(0, 2).map((booking) => (
                      <div 
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="text-xs p-1 mb-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded truncate cursor-pointer"
                      >
                        {booking.time} {booking.customerName}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <p className="text-xs text-[var(--text-muted)]">+{dayBookings.length - 2}</p>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

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

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Nowa rezerwacja</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg">
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Imię i nazwisko *</label>
                <input type="text" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" placeholder="Jan Kowalski" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Telefon *</label>
                <input type="tel" value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" placeholder="+48 123 456 789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                <input type="email" value={formData.customerEmail} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" placeholder="jan@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Usługa *</label>
                <select value={formData.serviceId} onChange={(e) => setFormData({...formData, serviceId: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]">
                  <option value="">Wybierz usługę</option>
                  {services.filter(s => s.isActive).map(service => (
                    <option key={service.id} value={service.id}>{service.name} ({service.duration} min - {Number(service.basePrice).toFixed(0)} zł)</option>
                  ))}
                </select>
              </div>
              {!user?.permissions?.onlyOwnCalendar && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Pracownik</label>
                  <select value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]">
                    <option value="">Ja ({user?.firstName} {user?.lastName})</option>
                    {employees.filter(e => e.isActive && e.id !== user?.employeeId).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data *</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Godzina *</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notatki</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" placeholder="Dodatkowe informacje..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-medium hover:bg-[var(--bg-card-hover)]">Anuluj</button>
                <button onClick={handleCreateBooking} className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium">Utwórz</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
