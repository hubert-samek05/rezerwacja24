'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, Clock, User, LogOut, Bell, Settings, ChevronLeft, ChevronRight,
  Menu, X, Users, Briefcase, BarChart3, Phone, Mail, Plus, Search, RefreshCw,
  Check, XCircle, Edit, Trash2, AlertCircle, CheckCircle, Filter, Home, Sun, Moon
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
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
  createdById?: string
  createdByType?: string
  createdByName?: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  totalBookings?: number
  totalSpent?: number
}

interface Service {
  id: string
  name: string
  description?: string
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
  }
}

type ViewMode = 'day' | 'week' | 'month'
type ActiveTab = 'calendar' | 'bookings' | 'customers' | 'services' | 'analytics' | 'settings'

export default function EmployeeDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    employeeId: '',
    date: '',
    time: '',
    notes: ''
  })

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true'
    setDarkMode(saved)
    if (saved) document.documentElement.classList.add('dark')
  }, [])

  const toggleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem('darkMode', String(newValue))
    document.documentElement.classList.toggle('dark', newValue)
  }

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token')
    let userData = localStorage.getItem('employee_user') || localStorage.getItem('user')
    
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

  // Load data
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

      // Calculate date range
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

      const [bookingsRes, employeesRes, servicesRes, customersRes] = await Promise.all([
        axios.get(`${API_URL}/api/bookings`, { ...config, params }),
        axios.get(`${API_URL}/api/employees?isActive=true`, config),
        axios.get(`${API_URL}/api/services`, config),
        axios.get(`${API_URL}/api/customers`, config),
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
          createdById: b.createdById,
          createdByType: b.createdByType,
          createdByName: b.createdByName,
        }
      })

      setBookings(transformed)
      setEmployees(employeesRes.data || [])
      setServices(servicesRes.data || [])
      setCustomers(customersRes.data || [])
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('employee_user')
    localStorage.removeItem('user')
    localStorage.removeItem('tenantId')
    router.push('/login')
  }

  // Navigation
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
      setFormData({ customerId: '', customerName: '', customerPhone: '', customerEmail: '', serviceId: '', employeeId: '', date: '', time: '', notes: '' })
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent-color)]"></div>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const menuItems = [
    { id: 'calendar', icon: Calendar, label: 'Kalendarz', show: true },
    { id: 'bookings', icon: Clock, label: 'Rezerwacje', show: user.permissions?.canManageBookings },
    { id: 'customers', icon: Users, label: 'Klienci', show: user.permissions?.canViewCustomers },
    { id: 'services', icon: Briefcase, label: 'Usługi', show: user.permissions?.canViewServices },
    { id: 'analytics', icon: BarChart3, label: 'Statystyki', show: user.permissions?.canViewAnalytics },
    { id: 'settings', icon: Settings, label: 'Ustawienia', show: true },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Toaster position="top-center" />
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)] z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-[var(--text-primary)]">{user.tenant?.name || 'Panel'}</h1>
                  <p className="text-xs text-[var(--text-muted)]">Panel pracownika</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-[var(--text-muted)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] text-sm truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {menuItems.filter(item => item.show).map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as ActiveTab); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    activeTab === item.id 
                      ? 'bg-[var(--accent-light)] text-[var(--accent-color)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[var(--border-color)] space-y-1">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] text-sm"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">{darkMode ? 'Tryb jasny' : 'Tryb ciemny'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Wyloguj się</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-[var(--bg-card)]/80 backdrop-blur-lg border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[var(--text-muted)]">
                  <Menu className="w-6 h-6" />
                </button>
                
                {activeTab === 'calendar' && (
                  <>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg">
                        <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                      </button>
                      <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-[var(--accent-color)] hover:bg-[var(--accent-light)] rounded-lg">
                        Dziś
                      </button>
                      <button onClick={() => navigate(1)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg">
                        <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                    <span className="hidden sm:block text-[var(--text-primary)] font-medium capitalize">{formatHeader()}</span>
                  </>
                )}

                {activeTab !== 'calendar' && (
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {menuItems.find(m => m.id === activeTab)?.label}
                  </h2>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'calendar' && (
                  <>
                    <div className="hidden sm:flex bg-[var(--bg-secondary)] rounded-lg p-1">
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
                    
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="hidden md:block px-3 py-1.5 bg-[var(--bg-secondary)] border-0 rounded-lg text-sm text-[var(--text-primary)]"
                    >
                      <option value="all">Wszyscy</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>
                  </>
                )}

                {(activeTab === 'customers' || activeTab === 'services') && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Szukaj..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border-0 rounded-lg text-sm text-[var(--text-primary)]"
                    />
                  </div>
                )}

                {user.permissions?.canManageBookings && (activeTab === 'calendar' || activeTab === 'bookings') && (
                  <button 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, date: todayStr, time: '09:00' }))
                      setShowAddModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] hover:bg-emerald-600 text-white rounded-lg text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nowa rezerwacja</span>
                  </button>
                )}

                <button onClick={loadData} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 lg:p-6">
            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <>
                {/* Week View */}
                {viewMode === 'week' && (
                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
                      {getWeekDays().map((day, i) => {
                        const dateStr = day.toISOString().split('T')[0]
                        const isToday = dateStr === todayStr
                        return (
                          <div key={i} className={`p-3 text-center border-r last:border-r-0 border-[var(--border-color)] ${isToday ? 'bg-[var(--accent-light)]' : ''}`}>
                            <p className="text-xs text-[var(--text-muted)] uppercase">{day.toLocaleDateString('pl-PL', { weekday: 'short' })}</p>
                            <p className={`text-lg font-semibold ${isToday ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}>{day.getDate()}</p>
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
                          <div key={i} className={`border-r last:border-r-0 border-[var(--border-color)] p-2 ${isToday ? 'bg-[var(--accent-light)]/30' : ''}`}>
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
                                    className="p-2 bg-[var(--accent-light)] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg cursor-pointer transition-colors border-l-4 border-[var(--accent-color)]"
                                  >
                                    <p className="text-xs font-semibold text-[var(--accent-color)]">{booking.time}</p>
                                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{booking.customerName}</p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">{booking.serviceName}</p>
                                    {!booking.employeeId && (
                                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">Elastyczna</span>
                                    )}
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
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)] mx-auto"></div>
                        </div>
                      ) : getBookingsForDate(currentDate.toISOString().split('T')[0]).length === 0 ? (
                        <div className="p-8 text-center">
                          <Calendar className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
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
                              <p className="text-lg font-bold text-[var(--accent-color)]">{booking.time}</p>
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
                              } ${isToday ? 'bg-[var(--accent-light)]' : ''}`}
                            >
                              <p className={`text-sm font-medium mb-1 ${
                                !item.isCurrentMonth ? 'text-[var(--text-muted)]' : isToday ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'
                              }`}>
                                {item.date.getDate()}
                              </p>
                              {dayBookings.slice(0, 2).map((booking) => (
                                <div 
                                  key={booking.id}
                                  onClick={() => setSelectedBooking(booking)}
                                  className="text-xs p-1 mb-1 bg-[var(--accent-light)] text-[var(--accent-color)] rounded truncate cursor-pointer"
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
              </>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
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
                      {bookings.slice(0, 50).map((booking) => (
                        <tr key={booking.id} className="hover:bg-[var(--bg-card-hover)] cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-[var(--text-primary)]">{booking.date}</div>
                            <div className="text-sm text-[var(--text-muted)]">{booking.time} - {booking.endTime}</div>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-primary)]">{booking.customerName}</td>
                          <td className="px-4 py-3 text-[var(--text-muted)]">{booking.serviceName}</td>
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
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-secondary)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Klient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Telefon</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {customers
                        .filter(c => !searchQuery || `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone?.includes(searchQuery))
                        .map((customer) => (
                        <tr key={customer.id} className="hover:bg-[var(--bg-card-hover)]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-color)] text-sm font-medium">
                                {customer.firstName?.[0]}{customer.lastName?.[0]}
                              </div>
                              <span className="font-medium text-[var(--text-primary)]">{customer.firstName} {customer.lastName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-muted)]">{customer.phone}</td>
                          <td className="px-4 py-3 text-[var(--text-muted)]">{customer.email || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services
                  .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((service) => (
                  <div key={service.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[var(--text-primary)]">{service.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {service.isActive ? 'Aktywna' : 'Nieaktywna'}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {service.duration} min
                      </span>
                      <span className="font-semibold text-[var(--accent-color)]">{Number(service.basePrice).toFixed(0)} zł</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Rezerwacje</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{bookings.length}</p>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Potwierdzone</p>
                    <p className="text-2xl font-bold text-emerald-600">{bookings.filter(b => b.status.toLowerCase() === 'confirmed').length}</p>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Anulowane</p>
                    <p className="text-2xl font-bold text-red-600">{bookings.filter(b => b.status.toLowerCase() === 'cancelled').length}</p>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                    <p className="text-sm text-[var(--text-muted)]">Przychód</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{bookings.reduce((sum, b) => sum + b.price, 0).toFixed(0)} zł</p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-4">Twoje konto</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Imię i nazwisko</span>
                      <span className="font-medium text-[var(--text-primary)]">{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Email</span>
                      <span className="font-medium text-[var(--text-primary)]">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Firma</span>
                      <span className="font-medium text-[var(--text-primary)]">{user.tenant?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
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

                {!selectedBooking.employeeId && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                    <p className="text-sm text-amber-700 dark:text-amber-400">⚡ Rezerwacja elastyczna</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Status</span>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusLabel(selectedBooking.status)}
                  </span>
                </div>

                {user.permissions?.canManageBookings && (
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
                  <a href={`tel:${selectedBooking.customerPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--accent-color)] hover:bg-emerald-600 text-white rounded-xl font-medium">
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
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Pracownik</label>
                  <select value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]">
                    <option value="">Ja ({user.firstName} {user.lastName})</option>
                    {employees.filter(e => e.isActive && e.id !== user.employeeId).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
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
                  <button onClick={handleCreateBooking} className="flex-1 px-4 py-3 bg-[var(--accent-color)] hover:bg-emerald-600 text-white rounded-xl font-medium">Utwórz</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
