'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Download,
  Clock,
  X,
  Check,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  User,
  Briefcase,
  DollarSign,
  CreditCard,
  UserPlus,
  XCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { getBookings, getEmployees, getServices, addBooking, updateBooking, deleteBooking, getCustomers, addCustomer, type Booking } from '@/lib/storage'
import toast from 'react-hot-toast'
import { getTenantConfig } from '@/lib/tenant'
import { getApiUrl } from '@/lib/api-url'
const API_URL = getApiUrl()

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [dayViewMode, setDayViewMode] = useState<'list' | 'grid'>('list') // Tryb widoku dziennego
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [isMobile, setIsMobile] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{date: string, time: string} | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    employeeId: '',
    date: '',
    time: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showAllBookingsModal, setShowAllBookingsModal] = useState(false)
  const [allBookingsInSlot, setAllBookingsInSlot] = useState<any[]>([])
  const [slotInfo, setSlotInfo] = useState<{date: string, time: string} | null>(null)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    loadData()
    
    // Detect mobile and switch to day view
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile && viewMode !== 'day') {
        setViewMode('day')
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Zamknij dropdown przy kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.customer-autocomplete')) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadData = async () => {
    try {
      const config = {
        ...getTenantConfig()
      }

      // Pobierz dane z API
      const [employeesRes, servicesRes, customersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/employees?isActive=true`, config),
        axios.get(`${API_URL}/api/services`, config),
        axios.get(`${API_URL}/api/customers`, config),
        axios.get(`${API_URL}/api/bookings`, config)
      ])

      setEmployees(employeesRes.data || [])
      setServices(servicesRes.data || [])
      setCustomers(customersRes.data || [])
      
      // Transform bookings from API format to calendar format
      const transformedBookings = (bookingsRes.data || []).map((booking: any) => {
        const startTime = new Date(booking.startTime)
        const endTime = new Date(booking.endTime)
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
        
        return {
          id: booking.id,
          customerId: booking.customerId,
          customerName: `${booking.customers?.firstName || ''} ${booking.customers?.lastName || ''}`,
          serviceId: booking.serviceId,
          serviceName: booking.services?.name || '',
          employeeId: booking.employeeId,
          employeeName: `${booking.employees?.firstName || ''} ${booking.employees?.lastName || ''}`,
          date: startTime.toISOString().split('T')[0],
          time: startTime.toTimeString().slice(0, 5),
          duration: duration,
          price: parseFloat(booking.totalPrice),
          status: booking.status.toLowerCase(),
          paymentStatus: booking.isPaid ? 'paid' : 'unpaid',
          notes: booking.customerNotes || ''
        }
      })
      
      setBookings(transformedBookings)
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      // Fallback do localStorage
      setEmployees(getEmployees())
      setServices(getServices())
      setCustomers(getCustomers())
      setBookings(getBookings())
    }
  }

  const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00

  const getWeekDates = () => {
    const start = new Date(currentDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      return date
    })
  }

  const getDayBookings = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0]
    const filtered = selectedEmployee === 'all' 
      ? bookings 
      : bookings.filter(b => b.employeeId === selectedEmployee)
    
    return filtered.filter(b => {
      if (b.date !== dateStr) return false
      const bookingHour = parseInt(b.time.split(':')[0])
      return bookingHour === hour
    })
  }

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate)
    
    if (direction === 'today') {
      setCurrentDate(new Date())
      return
    }
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  const handleSlotClick = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0]
    const timeStr = `${hour.toString().padStart(2, '0')}:00`
    setSelectedSlot({ date: dateStr, time: timeStr })
    setFormData({
      customerId: '',
      serviceId: '',
      employeeId: selectedEmployee !== 'all' ? selectedEmployee : '',
      date: dateStr,
      time: timeStr,
      notes: ''
    })
    setCustomerSearch('')
    setShowCustomerDropdown(false)
    setEditMode(false)
    setFormErrors([])
    setShowAddModal(true)
  }

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking)
  }

  const handleEditBooking = (booking: any) => {
    setFormData({
      customerId: booking.customerId,
      serviceId: booking.serviceId,
      employeeId: booking.employeeId,
      date: booking.date,
      time: booking.time,
      notes: booking.notes || ''
    })
    setCustomerSearch(booking.customerName)
    setShowCustomerDropdown(false)
    setEditMode(true)
    setSelectedBooking(booking)
    setFormErrors([])
    setShowAddModal(true)
  }

  const checkBookingConflict = (date: string, time: string, employeeId: string, excludeBookingId?: string) => {
    const timeHour = parseInt(time.split(':')[0])
    const conflicts = bookings.filter(b => {
      if (excludeBookingId && b.id === excludeBookingId) return false
      if (b.date !== date || b.employeeId !== employeeId) return false
      const bookingHour = parseInt(b.time.split(':')[0])
      const bookingEndHour = bookingHour + Math.ceil(b.duration / 60)
      return timeHour >= bookingHour && timeHour < bookingEndHour
    })
    return conflicts.length > 0
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.customerId) errors.push('Wybierz klienta')
    if (!formData.serviceId) errors.push('Wybierz usługę')
    if (!formData.employeeId) errors.push('Wybierz pracownika')
    if (!formData.date) errors.push('Wybierz datę')
    if (!formData.time) errors.push('Wybierz godzinę')
    
    // Check for conflicts
    if (formData.date && formData.time && formData.employeeId) {
      const hasConflict = checkBookingConflict(
        formData.date, 
        formData.time, 
        formData.employeeId,
        editMode ? selectedBooking?.id : undefined
      )
      if (hasConflict) {
        errors.push('Konflikt rezerwacji - pracownik jest zajęty w tym czasie')
      }
    }
    
    setFormErrors(errors)
    return errors.length === 0
  }

  const handleSubmitBooking = async () => {
    if (!validateForm()) return
    
    const customer = customers.find(c => c.id === formData.customerId)
    const service = services.find(s => s.id === formData.serviceId)
    const employee = employees.find(e => e.id === formData.employeeId)
    
    if (!customer || !service || !employee) {
      toast.error('Nie znaleziono wybranych danych. Odśwież stronę i spróbuj ponownie.')
      return
    }
    
    try {
      // Create startTime and endTime from date and time
      const [hours, minutes] = formData.time.split(':')
      const startTime = new Date(formData.date)
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + service.duration)
      
      const bookingData = {
        customerId: customer.id,
        serviceId: service.id,
        employeeId: employee.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: formData.notes
      }
      
      const config = {
        ...getTenantConfig()
      }
      
      if (editMode && selectedBooking) {
        await axios.patch(`${API_URL}/api/bookings/${selectedBooking.id}`, bookingData, config)
        toast.success('🎉 Rezerwacja została zaktualizowana!')
      } else {
        const response = await axios.post(`${API_URL}/api/bookings`, bookingData, config)
        const newBooking = response.data
        
        // Automatycznie zatwierdź rezerwację dodaną przez pracownika
        if (newBooking.status === 'PENDING') {
          await axios.patch(`${API_URL}/api/bookings/${newBooking.id}`, 
            { status: 'CONFIRMED' },
            config
          )
        }
        
        // Dodaj nową rezerwację do stanu natychmiast
        const transformedBooking = {
          id: newBooking.id,
          customerId: newBooking.customerId,
          customerName: `${customer.firstName} ${customer.lastName}`,
          serviceId: newBooking.serviceId,
          serviceName: service.name,
          employeeId: newBooking.employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          date: formData.date,
          time: formData.time,
          duration: service.duration,
          price: parseFloat(newBooking.totalPrice),
          status: 'confirmed',
          paymentStatus: newBooking.isPaid ? 'paid' : 'unpaid',
          notes: formData.notes
        }
        
        setBookings(prev => [...prev, transformedBooking])
        toast.success(`🎉 Rezerwacja dla ${customer.firstName} ${customer.lastName} została utworzona!`)
      }
      
      // Zamknij modal
      setShowAddModal(false)
      setSelectedBooking(null)
      setEditMode(false)
      setFormData({
        customerId: '',
        serviceId: '',
        employeeId: '',
        date: '',
        time: '',
        notes: ''
      })
      
      // Odśwież dane w tle
      loadData()
    } catch (error: any) {
      console.error('Błąd tworzenia rezerwacji:', error)
      toast.error(error.response?.data?.message || error.message || 'Nie udało się utworzyć rezerwacji')
    }
  }

  const handleExportCalendar = () => {
    const csvContent = [
      ['Data', 'Godzina', 'Klient', 'Usługa', 'Pracownik', 'Cena', 'Status'],
      ...bookings.map(b => [
        b.date,
        b.time,
        b.customerName,
        b.serviceName,
        b.employeeName,
        b.price.toString(),
        b.status === 'confirmed' ? 'Potwierdzona' : 'Oczekująca'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `kalendarz_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
      try {
        await axios.delete(`${API_URL}/api/bookings/${id}`, {
          ...getTenantConfig()
        })
        toast.success('Rezerwacja została usunięta')
        loadData()
        setSelectedBooking(null)
      } catch (error) {
        console.error('Błąd usuwania:', error)
        toast.error('Nie udało się usunąć rezerwacji')
      }
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed') => {
    try {
      await axios.patch(`${API_URL}/api/bookings/${bookingId}`, 
        { status: newStatus.toUpperCase() },
        { ...getTenantConfig() }
      )
      toast.success('Status został zaktualizowany')
      loadData()
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus })
      }
    } catch (error) {
      console.error('Błąd zmiany statusu:', error)
      toast.error('Nie udało się zmienić statusu')
    }
  }

  const handlePaymentStatusChange = async (bookingId: string, newPaymentStatus: 'paid' | 'unpaid' | 'partial') => {
    try {
      await axios.patch(`${API_URL}/api/bookings/${bookingId}`, 
        { isPaid: newPaymentStatus === 'paid' },
        { ...getTenantConfig() }
      )
      toast.success('Status płatności został zaktualizowany')
      loadData()
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, paymentStatus: newPaymentStatus })
      }
    } catch (error) {
      console.error('Błąd zmiany statusu płatności:', error)
      toast.error('Nie udało się zmienić statusu płatności')
    }
  }

  const handleAddNewCustomer = async () => {
    if (!newCustomerData.firstName || !newCustomerData.lastName || !newCustomerData.phone) {
      toast.error('Wypełnij wymagane pola: Imię, Nazwisko, Telefon')
      return
    }

    try {
      // Prepare data - remove empty email to avoid validation error
      const customerData = {
        firstName: newCustomerData.firstName,
        lastName: newCustomerData.lastName,
        phone: newCustomerData.phone,
        ...(newCustomerData.email && { email: newCustomerData.email })
      }
      
      const response = await axios.post(`${API_URL}/api/customers`, customerData, {
        ...getTenantConfig()
      })

      const customer = response.data

      // Dodaj klienta do lokalnego stanu natychmiast
      setCustomers(prev => [customer, ...prev])

      // Ustaw nowego klienta w formularzu
      setFormData({ ...formData, customerId: customer.id })
      setCustomerSearch(`${customer.firstName} ${customer.lastName}`)
      
      // Zamknij modal
      setShowAddCustomerModal(false)
      setNewCustomerData({ firstName: '', lastName: '', email: '', phone: '' })
      
      toast.success(`✨ ${customer.firstName} ${customer.lastName} został dodany do systemu!`)
    } catch (error: any) {
      console.error('Błąd dodawania klienta:', error)
      toast.error(error.response?.data?.message || 'Nie udało się dodać klienta')
    }
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    const days = []
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    // Next month days to fill the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    return days
  }

  const getMonthDayBookings = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const filtered = selectedEmployee === 'all' 
      ? bookings 
      : bookings.filter(b => b.employeeId === selectedEmployee)
    
    return filtered.filter(b => b.date === dateStr)
  }

  const filteredBookings = selectedEmployee === 'all' 
    ? bookings 
    : bookings.filter(b => b.employeeId === selectedEmployee)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Kalendarz rezerwacji</h1>
            <p className="text-sm sm:text-base text-neutral-gray/70">Zarządzaj rezerwacjami i harmonogramem</p>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-neon flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Nowa rezerwacja</span>
          </button>
        </div>

        {/* Controls */}
        <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            {/* Date Navigation */}
            <div className="flex items-center justify-between lg:justify-start space-x-2 sm:space-x-4">
              <button 
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-gray" />
              </button>
              
              {/* Klikalna data z date pickerem */}
              <div className="flex-1 lg:min-w-[200px]">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full text-center hover:bg-white/5 rounded-lg py-2 px-3 transition-colors"
                >
                  <h2 className="text-base sm:text-xl font-bold text-white">
                    {currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-gray/70">
                    {viewMode === 'day' && currentDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric' })}
                    {viewMode === 'week' && `Tydzień ${Math.ceil(currentDate.getDate() / 7)}`}
                  </p>
                </button>
              </div>
              
              <button 
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-5 h-5 text-neutral-gray" />
              </button>
              
              <button 
                onClick={() => navigateDate('today')}
                className="hidden sm:block px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/80 transition-colors flex-shrink-0"
              >
                Dzisiaj
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  viewMode === 'day' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
                }`}
              >
                Dzień
              </button>
              {!isMobile && (
                <>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'week' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
                    }`}
                  >
                    Tydzień
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'month' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
                    }`}
                  >
                    Miesiąc
                  </button>
                </>
              )}
            </div>
            
            {/* Day View Mode Toggle - tylko gdy widok dzienny */}
            {viewMode === 'day' && (
              <div className="flex items-center space-x-2 border-l border-white/10 pl-4">
                <button
                  onClick={() => setDayViewMode('list')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    dayViewMode === 'list' ? 'bg-accent-neon/20 text-accent-neon' : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setDayViewMode('grid')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    dayViewMode === 'grid' ? 'bg-accent-neon/20 text-accent-neon' : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  Kalendarz
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="flex-1 lg:flex-none px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-neutral-gray text-sm sm:text-base focus:outline-none focus:border-accent-neon"
              >
                <option value="all">Wszyscy pracownicy</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
              
              <button 
                onClick={handleExportCalendar}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                title="Eksportuj do CSV"
              >
                <Download className="w-5 h-5 text-neutral-gray" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid - Day View */}
        {viewMode === 'day' && (
          <div className="glass-card p-3 sm:p-6">
            {/* Tryb Lista - uproszczony widok */}
            {dayViewMode === 'list' ? (
              <div className="space-y-3">
                {(() => {
                  const allDayBookings = hours.flatMap(hour => getDayBookings(currentDate, hour))
                  
                  if (allDayBookings.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 text-neutral-gray/30 mx-auto mb-4" />
                        <p className="text-neutral-gray/50 text-sm">Brak rezerwacji na ten dzień</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="btn-neon mt-4 text-sm px-6 py-2"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Dodaj rezerwację
                        </button>
                      </div>
                    )
                  }
                  
                  return allDayBookings.map((booking, idx) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleBookingClick(booking)}
                      className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                        booking.status === 'confirmed' 
                          ? 'bg-primary-green/20 border border-accent-neon/30' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/20 border border-yellow-500/30'
                          : booking.status === 'completed'
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-accent-neon" />
                            <span className="text-sm font-bold text-white">{booking.time}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              booking.status === 'confirmed' ? 'bg-accent-neon/20 text-accent-neon' :
                              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {booking.status === 'confirmed' ? 'Potwierdzona' :
                               booking.status === 'pending' ? 'Oczekująca' :
                               booking.status === 'completed' ? 'Zakończona' : 'Anulowana'}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-white mb-1">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-neutral-gray/80 mb-1">
                            {booking.serviceName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-gray/70">
                            <User className="w-3 h-3" />
                            {booking.employeeName}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-white">
                            {booking.price} zł
                          </div>
                          {booking.paymentStatus === 'paid' && (
                            <div className="text-xs text-accent-neon mt-1">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Opłacona
                            </div>
                          )}
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="text-xs text-neutral-gray/60 border-t border-white/10 pt-2 mt-2">
                          {booking.notes}
                        </div>
                      )}
                    </motion.div>
                  ))
                })()}
              </div>
            ) : (
              /* Tryb Kalendarz - siatka godzinowa z lukami */
              <div className="space-y-px">
                {hours.map((hour) => {
                  const dayBookings = getDayBookings(currentDate, hour)
                  
                  return (
                    <div key={hour} className="flex border-b border-white/5">
                      <div className="w-20 p-4 text-right flex-shrink-0">
                        <span className="text-sm text-neutral-gray/70">{hour}:00</span>
                      </div>
                      <div 
                        className="flex-1 p-4 min-h-[80px] hover:bg-white/5 transition-colors cursor-pointer relative"
                        onClick={() => handleSlotClick(currentDate, hour)}
                      >
                      {dayBookings.length === 0 ? (
                        <div className="text-center text-neutral-gray/30 text-sm py-4">
                          Brak wizyt
                        </div>
                      ) : dayBookings.length === 1 ? (
                        // Pojedyncza wizyta - pełny widok
                        <motion.div
                          key={dayBookings[0].id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookingClick(dayBookings[0])
                          }}
                          className={`p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                            dayBookings[0].status === 'confirmed' 
                              ? 'bg-primary-green/30 border border-accent-neon/30' 
                              : 'bg-yellow-500/20 border border-yellow-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold text-white mb-1">
                                {dayBookings[0].time}
                              </div>
                              <div className="text-sm text-white font-medium mb-1">
                                {dayBookings[0].customerName}
                              </div>
                              <div className="text-xs text-neutral-gray/70">
                                {dayBookings[0].serviceName}
                              </div>
                              <div className="text-xs text-neutral-gray/70 mt-1">
                                {dayBookings[0].employeeName}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-white">
                              {dayBookings[0].price} zł
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        // Wiele wizyt - kompaktowy widok
                        <div className="space-y-1">
                          {dayBookings.slice(0, 2).map((booking, idx) => (
                            <motion.div
                              key={booking.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookingClick(booking)
                              }}
                              className={`p-2 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                                booking.status === 'confirmed' 
                                  ? 'bg-primary-green/30 border border-accent-neon/30' 
                                  : 'bg-yellow-500/20 border border-yellow-500/30'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-white font-medium truncate">
                                    {booking.customerName}
                                  </div>
                                  <div className="text-xs text-neutral-gray/70 truncate">
                                    {booking.employeeName}
                                  </div>
                                </div>
                                <div className="text-xs font-bold text-white whitespace-nowrap">
                                  {booking.price} zł
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div 
                              className="text-xs text-center py-2 px-3 bg-white/5 rounded-lg text-accent-neon font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Pokaż wszystkie wizyty w modalu
                                setAllBookingsInSlot(dayBookings)
                                setSlotInfo({ date: currentDate.toISOString().split('T')[0], time: `${hour}:00` })
                                setShowAllBookingsModal(true)
                              }}
                            >
                              +{dayBookings.length - 2} więcej wizyt
                            </div>
                          )}
                        </div>
                      )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Calendar Grid - Week View */}
        {viewMode === 'week' && (
          <div className="glass-card p-3 sm:p-6 overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="grid grid-cols-8 gap-px bg-white/10">
                {/* Time Column Header */}
                <div className="bg-carbon-black p-4 sticky left-0 z-10">
                  <Clock className="w-5 h-5 text-neutral-gray" />
                </div>
                
                {/* Day Headers */}
                {getWeekDates().map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <div key={index} className="bg-carbon-black p-4 text-center">
                      <div className="text-sm text-neutral-gray/70">{weekDays[index]}</div>
                      <div className={`text-lg font-bold mt-1 ${isToday ? 'text-accent-neon' : 'text-white'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}

                {/* Time Slots */}
                {hours.map((hour) => (
                  <>
                    {/* Time Label */}
                    <div key={`time-${hour}`} className="bg-carbon-black p-4 text-right sticky left-0 z-10">
                      <span className="text-sm text-neutral-gray/70">{hour}:00</span>
                    </div>
                    
                    {/* Day Slots */}
                    {getWeekDates().map((date, dayIndex) => {
                      const dayBookings = getDayBookings(date, hour)
                      
                      return (
                        <div
                          key={`${dayIndex}-${hour}`}
                          className="bg-carbon-black p-2 min-h-[80px] hover:bg-white/5 transition-colors cursor-pointer relative"
                          onClick={() => handleSlotClick(date, hour)}
                        >
                          {dayBookings.length === 0 ? null : dayBookings.length === 1 ? (
                            // Pojedyncza wizyta - pełny widok
                            <motion.div
                              key={dayBookings[0].id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookingClick(dayBookings[0])
                              }}
                              className={`p-2 rounded-lg h-full cursor-pointer hover:shadow-lg transition-all ${
                                dayBookings[0].status === 'confirmed' 
                                  ? 'bg-primary-green/30 border border-accent-neon/30' 
                                  : 'bg-yellow-500/20 border border-yellow-500/30'
                              }`}
                            >
                              <div className="text-xs font-semibold text-white mb-1">
                                {dayBookings[0].time}
                              </div>
                              <div className="text-xs text-white font-medium truncate">
                                {dayBookings[0].customerName}
                              </div>
                              <div className="text-xs text-neutral-gray/70 truncate">
                                {dayBookings[0].serviceName}
                              </div>
                            </motion.div>
                          ) : (
                            // Wiele wizyt - kompaktowy widok ze stackowaniem
                            <div className="space-y-1">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBookingClick(dayBookings[0])
                                }}
                                className={`p-1.5 rounded cursor-pointer hover:shadow-lg transition-all ${
                                  dayBookings[0].status === 'confirmed' 
                                    ? 'bg-primary-green/30 border border-accent-neon/30' 
                                    : 'bg-yellow-500/20 border border-yellow-500/30'
                                }`}
                              >
                                <div className="text-xs text-white font-medium truncate">
                                  {dayBookings[0].customerName}
                                </div>
                              </motion.div>
                              {dayBookings.length > 1 && (
                                <div 
                                  className="text-xs text-center py-1 px-2 bg-accent-neon/20 rounded text-accent-neon font-semibold cursor-pointer hover:bg-accent-neon/30 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setAllBookingsInSlot(dayBookings)
                                    setSlotInfo({ date: date.toISOString().split('T')[0], time: `${hour}:00` })
                                    setShowAllBookingsModal(true)
                                  }}
                                >
                                  +{dayBookings.length - 1}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="glass-card p-6">
            <div className="grid grid-cols-7 gap-px bg-white/10">
              {/* Day headers */}
              {weekDays.map((day, index) => (
                <div key={index} className="bg-carbon-black p-4 text-center">
                  <span className="text-sm font-semibold text-neutral-gray">{day}</span>
                </div>
              ))}
              
              {/* Calendar days */}
              {getMonthDays().map((day, index) => {
                const dayBookings = getMonthDayBookings(day.date)
                const isToday = day.date.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={index}
                    className={`bg-carbon-black p-2 min-h-[120px] hover:bg-white/5 transition-colors cursor-pointer ${
                      !day.isCurrentMonth ? 'opacity-40' : ''
                    }`}
                    onClick={() => {
                      setCurrentDate(day.date)
                      setViewMode('day')
                    }}
                  >
                    <div className={`text-right mb-2 ${
                      isToday ? 'text-accent-neon font-bold' : 'text-neutral-gray'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-xs p-1 rounded truncate ${
                            booking.status === 'confirmed'
                              ? 'bg-primary-green/30 text-white'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookingClick(booking)
                          }}
                        >
                          {booking.time} {booking.customerName}
                        </motion.div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-neutral-gray/70 text-center">
                          +{dayBookings.length - 3} więcej
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-green/30 border border-accent-neon/30 rounded"></div>
            <span className="text-sm text-neutral-gray/70">Potwierdzona</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
            <span className="text-sm text-neutral-gray/70">Oczekująca</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/5 border border-white/10 rounded"></div>
            <span className="text-sm text-neutral-gray/70">Wolny termin</span>
          </div>
        </div>

        {/* Add/Edit Booking Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {editMode ? 'Edytuj rezerwację' : 'Nowa rezerwacja'}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                {formErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-400 mb-1">Wystąpiły błędy:</p>
                        <ul className="text-sm text-red-300 space-y-1">
                          {formErrors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Customer - Autocomplete */}
                  <div className="relative customer-autocomplete">
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Klient *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value)
                          setShowCustomerDropdown(true)
                          if (!e.target.value) setFormData({ ...formData, customerId: '' })
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        placeholder="Wpisz imię, nazwisko lub telefon..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
                    </div>
                    
                    {/* Dropdown z wynikami */}
                    {showCustomerDropdown && customerSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-carbon-black border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {customers
                          .filter(customer => {
                            const search = customerSearch.toLowerCase()
                            return (
                              customer.firstName.toLowerCase().includes(search) ||
                              customer.lastName.toLowerCase().includes(search) ||
                              customer.phone.includes(search) ||
                              (customer.email && customer.email.toLowerCase().includes(search))
                            )
                          })
                          .map(customer => (
                            <div
                              key={customer.id}
                              onClick={() => {
                                setFormData({ ...formData, customerId: customer.id })
                                setCustomerSearch(`${customer.firstName} ${customer.lastName}`)
                                setShowCustomerDropdown(false)
                              }}
                              className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-white font-medium">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="text-sm text-neutral-gray/70">
                                    {customer.phone}{customer.email ? ` • ${customer.email}` : ''}
                                  </div>
                                </div>
                                {customer.status === 'vip' && (
                                  <span className="px-2 py-1 bg-accent-neon/20 text-accent-neon text-xs rounded-full">
                                    VIP
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        {customers.filter(customer => {
                          const search = customerSearch.toLowerCase()
                          return (
                            customer.firstName.toLowerCase().includes(search) ||
                            customer.lastName.toLowerCase().includes(search) ||
                            customer.phone.includes(search)
                          )
                        }).length === 0 && (
                          <div className="px-4 py-3 text-center">
                            <p className="text-neutral-gray/70 text-sm mb-2">Nie znaleziono klienta</p>
                            <button
                              onClick={() => {
                                setShowCustomerDropdown(false)
                                setShowAddCustomerModal(true)
                                // Wypełnij imię i nazwisko z wyszukiwania jeśli możliwe
                                const parts = customerSearch.trim().split(' ')
                                if (parts.length >= 2) {
                                  setNewCustomerData({
                                    firstName: parts[0],
                                    lastName: parts.slice(1).join(' '),
                                    email: '',
                                    phone: ''
                                  })
                                } else if (parts.length === 1) {
                                  setNewCustomerData({
                                    firstName: parts[0],
                                    lastName: '',
                                    email: '',
                                    phone: ''
                                  })
                                }
                              }}
                              className="px-4 py-2 bg-accent-neon/20 text-accent-neon rounded-lg hover:bg-accent-neon/30 transition-colors flex items-center space-x-2 mx-auto"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Dodaj nowego klienta</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Service - Cards */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-3">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Usługa *
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                      {services.map(service => (
                        <motion.div
                          key={service.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, serviceId: service.id })}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.serviceId === service.id
                              ? 'border-accent-neon bg-accent-neon/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-white font-semibold">{service.name}</h4>
                                {formData.serviceId === service.id && (
                                  <Check className="w-5 h-5 text-accent-neon" />
                                )}
                              </div>
                              <p className="text-sm text-neutral-gray/70 mb-2">{service.description}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center text-neutral-gray">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {service.duration} min
                                </span>
                                <span className="text-accent-neon font-bold">
                                  {service.price} zł
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Employee */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Pracownik *
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    >
                      <option value="">Wybierz pracownika</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Data *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Godzina *
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                        placeholder="HH:MM"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Notatki
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="Dodatkowe informacje o rezerwacji..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSubmitBooking}
                    className="flex-1 btn-neon flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editMode ? 'Zapisz zmiany' : 'Utwórz rezerwację'}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Details Modal */}
        <AnimatePresence>
          {selectedBooking && !showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedBooking(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Szczegóły rezerwacji</h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status rezerwacji */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-2 block">Status rezerwacji</label>
                      <select
                        value={selectedBooking.status}
                        onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value as any)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-semibold border ${
                          selectedBooking.status === 'confirmed' ? 'bg-accent-neon/20 text-accent-neon border-accent-neon/30' :
                          selectedBooking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          selectedBooking.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        } focus:outline-none focus:ring-2 focus:ring-accent-neon`}
                      >
                        <option value="pending">Oczekująca</option>
                        <option value="confirmed">Potwierdzona</option>
                        <option value="completed">Zakończona</option>
                        <option value="cancelled">Anulowana</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-2 block">Status płatności</label>
                      <select
                        value={selectedBooking.paymentStatus || 'unpaid'}
                        onChange={(e) => handlePaymentStatusChange(selectedBooking.id, e.target.value as any)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-semibold border ${
                          (selectedBooking.paymentStatus || 'unpaid') === 'paid' 
                            ? 'bg-accent-neon/20 text-accent-neon border-accent-neon/30' 
                            : (selectedBooking.paymentStatus || 'unpaid') === 'partial'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        } focus:outline-none focus:ring-2 focus:ring-accent-neon`}
                      >
                        <option value="unpaid">Niezapłacono</option>
                        <option value="partial">Częściowo</option>
                        <option value="paid">Zapłacono</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-neutral-gray/70">Klient</label>
                    <p className="text-white font-medium">{selectedBooking.customerName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-neutral-gray/70">Usługa</label>
                    <p className="text-white font-medium">{selectedBooking.serviceName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-neutral-gray/70">Pracownik</label>
                    <p className="text-white font-medium">{selectedBooking.employeeName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-neutral-gray/70">Data</label>
                      <p className="text-white font-medium">{selectedBooking.date}</p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-gray/70">Godzina</label>
                      <p className="text-white font-medium">{selectedBooking.time}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-neutral-gray/70">Czas trwania</label>
                      <p className="text-white font-medium">{selectedBooking.duration} min</p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-gray/70">Cena</label>
                      <p className="text-2xl font-bold text-accent-neon">{selectedBooking.price} zł</p>
                    </div>
                  </div>
                  
                  {selectedBooking.notes && (
                    <div>
                      <label className="text-sm text-neutral-gray/70">Notatki</label>
                      <p className="text-white">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-6 flex-wrap">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'confirmed')
                      }}
                      className="flex-1 min-w-[100px] px-3 py-2 bg-accent-neon/20 text-accent-neon rounded-lg hover:bg-accent-neon/30 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Potwierdź</span>
                    </button>
                  )}
                  {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'pending') && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'completed')
                      }}
                      className="flex-1 min-w-[100px] px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Zakończ</span>
                    </button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'cancelled')
                      }}
                      className="flex-1 min-w-[90px] px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Anuluj</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditBooking(selectedBooking)}
                    className="px-3 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edytuj</span>
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(selectedBooking.id)}
                    className="px-3 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Usuń</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Bookings in Slot Modal */}
        <AnimatePresence>
          {showAllBookingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAllBookingsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Wszystkie wizyty
                    </h3>
                    {slotInfo && (
                      <p className="text-sm text-neutral-gray/70 mt-1">
                        {slotInfo.date} o {slotInfo.time}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAllBookingsModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                <div className="space-y-3">
                  {allBookingsInSlot.map((booking, idx) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        setShowAllBookingsModal(false)
                        handleBookingClick(booking)
                      }}
                      className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all border-2 ${
                        booking.status === 'confirmed' 
                          ? 'bg-primary-green/20 border-accent-neon/30 hover:border-accent-neon/50' 
                          : 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-accent-neon" />
                            <span className="text-white font-semibold">
                              {booking.customerName}
                            </span>
                            {booking.status === 'confirmed' ? (
                              <span className="px-2 py-0.5 bg-accent-neon/20 text-accent-neon text-xs rounded-full">
                                Potwierdzona
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                                Oczekująca
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-neutral-gray/70">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>{booking.serviceName}</span>
                              <span className="text-neutral-gray/50">•</span>
                              <span>{booking.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-gray/70">
                              <User className="w-3.5 h-3.5" />
                              <span>{booking.employeeName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-gray/70">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {booking.price} zł
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-gray/70">
                      Łącznie wizyt: <span className="text-white font-semibold">{allBookingsInSlot.length}</span>
                    </span>
                    <span className="text-neutral-gray/70">
                      Suma: <span className="text-accent-neon font-bold text-lg">
                        {allBookingsInSlot.reduce((sum, b) => sum + b.price, 0)} zł
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAllBookingsModal(false)}
                  className="w-full mt-4 px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors"
                >
                  Zamknij
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add New Customer Modal */}
        <AnimatePresence>
          {showAddCustomerModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddCustomerModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Dodaj nowego klienta</h3>
                  <button
                    onClick={() => setShowAddCustomerModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Imię *
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.firstName}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, firstName: e.target.value })}
                      placeholder="Jan"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.lastName}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, lastName: e.target.value })}
                      placeholder="Kowalski"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={newCustomerData.phone}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newCustomerData.email}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                      placeholder="jan.kowalski@example.com"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddCustomerModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleAddNewCustomer}
                    className="flex-1 btn-neon flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Dodaj klienta</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Picker Modal */}
        <AnimatePresence>
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowDatePicker(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="bg-carbon-black border border-white/10 rounded-xl shadow-2xl p-4 w-full max-w-[320px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nagłówek */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setCurrentDate(newDate)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-gray" />
                  </button>
                  <span className="text-base font-semibold text-white">
                    {currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setCurrentDate(newDate)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                {/* Dni tygodnia */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(day => (
                    <div key={day} className="text-center text-xs text-neutral-gray/70 py-2 font-medium">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dni miesiąca */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const daysInMonth = lastDay.getDate()
                    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
                    
                    const days = []
                    
                    // Puste miejsca przed pierwszym dniem
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      days.push(<div key={`empty-${i}`} className="w-10 h-10" />)
                    }
                    
                    // Dni miesiąca
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day)
                      const isToday = date.getTime() === today.getTime()
                      const isSelected = date.toDateString() === currentDate.toDateString()
                      const dateStr = date.toISOString().split('T')[0]
                      const hasBookings = bookings.some(b => b.date === dateStr)
                      
                      days.push(
                        <button
                          key={day}
                          onClick={() => {
                            setCurrentDate(date)
                            setShowDatePicker(false)
                          }}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors relative flex items-center justify-center ${
                            isSelected
                              ? 'bg-accent-neon text-carbon-black'
                              : isToday
                              ? 'bg-primary-green/30 text-white ring-2 ring-primary-green'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {day}
                          {hasBookings && !isSelected && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent-neon rounded-full" />
                          )}
                        </button>
                      )
                    }
                    
                    return days
                  })()}
                </div>

                {/* Przycisk Dzisiaj */}
                <button
                  onClick={() => {
                    setCurrentDate(new Date())
                    setShowDatePicker(false)
                  }}
                  className="w-full mt-4 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-green/80 transition-colors text-sm font-semibold"
                >
                  Dzisiaj
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
