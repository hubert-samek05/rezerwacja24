'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Clock,
  User,
  Briefcase,
  Search,
  Filter,
  Download,
  Check,
  X,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  CreditCard,
  Wallet
} from 'lucide-react'
import { getBookings, getEmployees, getServices, getCustomers, updateBooking, deleteBooking, type Booking } from '@/lib/storage'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getTenantConfig } from '@/lib/tenant'
import { getApiUrl } from '@/lib/api-url'
const API_URL = getApiUrl()

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
type SortField = 'date' | 'time' | 'customer' | 'price' | 'status'
type SortOrder = 'asc' | 'desc'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  
  // UI State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'przelewy24' | 'payu' | 'stripe' | 'other'>('cash')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [bookings, searchQuery, statusFilter, employeeFilter, dateFilter, sortField, sortOrder])

  const loadData = async () => {
    try {
      const config = {
        ...getTenantConfig()
      }

      const [bookingsRes, employeesRes, servicesRes, customersRes] = await Promise.all([
        axios.get(`${API_URL}/api/bookings`, config),
        axios.get(`${API_URL}/api/employees`, config),
        axios.get(`${API_URL}/api/services`, config),
        axios.get(`${API_URL}/api/customers`, config)
      ])

      // Transform bookings from API format
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
          basePrice: booking.basePrice ? parseFloat(booking.basePrice) : parseFloat(booking.totalPrice),
          couponCode: booking.couponCode || null,
          discountAmount: booking.discountAmount ? parseFloat(booking.discountAmount) : 0,
          status: booking.status.toLowerCase(),
          isPaid: booking.isPaid,
          paidAmount: booking.paidAmount ? parseFloat(booking.paidAmount) : 0,
          paymentStatus: booking.isPaid 
            ? 'paid' 
            : (booking.paidAmount && parseFloat(booking.paidAmount) > 0) 
            ? 'partial' 
            : 'unpaid',
          paymentMethod: booking.paymentMethod,
          notes: booking.customerNotes || ''
        }
      })

      setBookings(transformedBookings)
      setEmployees(employeesRes.data || [])
      setServices(servicesRes.data || [])
      setCustomers(customersRes.data || [])
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      toast.error('Nie udało się załadować rezerwacji')
      // Fallback do localStorage
      setBookings(getBookings())
      setEmployees(getEmployees())
      setServices(getServices())
      setCustomers(getCustomers())
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...bookings]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(b => 
        b.customerName.toLowerCase().includes(query) ||
        b.serviceName.toLowerCase().includes(query) ||
        b.employeeName.toLowerCase().includes(query) ||
        b.notes?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(b => b.employeeId === employeeFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date)
        bookingDate.setHours(0, 0, 0, 0)
        
        if (dateFilter === 'today') {
          return bookingDate.getTime() === today.getTime()
        } else if (dateFilter === 'week') {
          const weekFromNow = new Date(today)
          weekFromNow.setDate(weekFromNow.getDate() + 7)
          return bookingDate >= today && bookingDate <= weekFromNow
        } else if (dateFilter === 'month') {
          const monthFromNow = new Date(today)
          monthFromNow.setMonth(monthFromNow.getMonth() + 1)
          return bookingDate >= today && bookingDate <= monthFromNow
        }
        return true
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'date':
          const dateA = new Date(`${a.date} ${a.time}`)
          const dateB = new Date(`${b.date} ${b.time}`)
          comparison = dateA.getTime() - dateB.getTime()
          break
        case 'time':
          comparison = a.time.localeCompare(b.time)
          break
        case 'customer':
          comparison = a.customerName.localeCompare(b.customerName)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredBookings(filtered)
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await axios.patch(`${API_URL}/api/bookings/${bookingId}`, 
        { status: newStatus.toUpperCase() },
        { ...getTenantConfig() }
      )
      toast.success('Status został zaktualizowany')
      loadData()
    } catch (error) {
      console.error('Błąd zmiany statusu:', error)
      toast.error('Nie udało się zmienić statusu')
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
      try {
        await axios.delete(`${API_URL}/api/bookings/${bookingId}`, {
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

  const handleBulkStatusChange = async (newStatus: BookingStatus) => {
    if (selectedBookings.length === 0) return
    if (confirm(`Czy na pewno chcesz zmienić status ${selectedBookings.length} rezerwacji?`)) {
      try {
        await Promise.all(
          selectedBookings.map(id =>
            axios.patch(`${API_URL}/api/bookings/${id}`, 
              { status: newStatus.toUpperCase() },
              { ...getTenantConfig() }
            )
          )
        )
        toast.success(`Status ${selectedBookings.length} rezerwacji został zmieniony`)
        loadData()
        setSelectedBookings([])
      } catch (error) {
        console.error('Błąd zmiany statusu:', error)
        toast.error('Nie udało się zmienić statusu')
      }
    }
  }

  const handleOpenPaymentModal = (booking: Booking) => {
    setPaymentBooking(booking)
    setPaymentAmount(booking.paidAmount?.toString() || '')
    setPaymentMethod(booking.paymentMethod || 'cash')
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = async () => {
    if (!paymentBooking) return
    
    const amount = parseFloat(paymentAmount) || 0
    const totalPrice = paymentBooking.price
    
    // Określ czy rezerwacja jest opłacona
    const isPaid = amount >= totalPrice
    
    try {
      await axios.patch(`${API_URL}/api/bookings/${paymentBooking.id}`, 
        { 
          isPaid: isPaid,
          paidAmount: amount,
          paymentMethod: paymentMethod,
          paidAt: isPaid ? new Date().toISOString() : null
        },
        { ...getTenantConfig() }
      )
      
      if (isPaid) {
        toast.success('✅ Płatność została zarejestrowana!')
      } else if (amount > 0) {
        toast.success(`⚠️ Płatność częściowa zapisana: ${amount} zł / ${totalPrice} zł`)
      } else {
        toast.success('💰 Status płatności zaktualizowany')
      }
      
      // Odśwież dane
      await loadData()
      
      setShowPaymentModal(false)
      setPaymentBooking(null)
      setPaymentAmount('')
      setPaymentMethod('cash')
    } catch (error) {
      console.error('Błąd zapisu płatności:', error)
      toast.error('Nie udało się zapisać płatności')
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Data', 'Godzina', 'Klient', 'Telefon', 'Usługa', 'Pracownik', 'Czas', 'Cena', 'Status', 'Notatki'],
      ...filteredBookings.map(b => {
        const customer = customers.find(c => c.id === b.customerId)
        return [
          b.date,
          b.time,
          b.customerName,
          customer?.phone || '',
          b.serviceName,
          b.employeeName,
          `${b.duration} min`,
          `${b.price} zł`,
          b.status === 'confirmed' ? 'Potwierdzona' : 
          b.status === 'pending' ? 'Oczekująca' :
          b.status === 'cancelled' ? 'Anulowana' : 'Zakończona',
          b.notes || ''
        ]
      })
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rezerwacje_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
  }

  const toggleAllBookings = () => {
    if (selectedBookings.length === paginatedBookings.length) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(paginatedBookings.map(b => b.id))
    }
  }

  // Statistics
  const stats = {
    total: filteredBookings.length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
    completed: filteredBookings.filter(b => b.status === 'completed').length,
    revenue: filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0)
  }

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'completed': return <Check className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return 'text-accent-neon bg-accent-neon/20 border-accent-neon/30'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'completed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return 'Potwierdzona'
      case 'pending': return 'Oczekująca'
      case 'cancelled': return 'Anulowana'
      case 'completed': return 'Zakończona'
    }
  }

  const getPaymentStatusColor = (paymentStatus: 'paid' | 'unpaid' | 'partial') => {
    switch (paymentStatus) {
      case 'paid': return 'text-accent-neon bg-accent-neon/20 border-accent-neon/30'
      case 'unpaid': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'partial': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    }
  }

  const getPaymentStatusLabel = (booking: Booking) => {
    const status = booking.paymentStatus || 'unpaid'
    switch (status) {
      case 'paid': return 'Zapłacono'
      case 'unpaid': return 'Niezapłacono'
      case 'partial': return `Częściowo (${booking.paidAmount || 0}/${booking.price} zł)`
    }
  }

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'cash': return 'Gotówka'
      case 'card': return 'Karta'
      case 'przelewy24': return 'Przelewy24'
      case 'payu': return 'PayU'
      case 'stripe': return 'Stripe'
      case 'other': return 'Inne'
      default: return 'Nie określono'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Rezerwacje</h1>
            <p className="text-sm sm:text-base text-neutral-gray/70">Zarządzaj wszystkimi rezerwacjami</p>
          </div>
          
          <button
            onClick={handleExport}
            className="btn-neon flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            <span>Eksportuj CSV</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-neutral-gray/70">Wszystkie</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-gray/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-neutral-gray/70">Potwierdzone</p>
                <p className="text-xl sm:text-2xl font-bold text-accent-neon">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-accent-neon/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-neutral-gray/70">Oczekujące</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-neutral-gray/70">Zakończone</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.completed}</p>
              </div>
              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-neutral-gray/70">Anulowane</p>
                <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.cancelled}</p>
              </div>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-neutral-gray/70">Przychód</p>
                <p className="text-xl sm:text-2xl font-bold text-accent-neon">{stats.revenue} zł</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-accent-neon/50" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon text-sm"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-neutral-gray hover:bg-white/10 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filtry</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    >
                      <option value="all">Wszystkie</option>
                      <option value="confirmed">Potwierdzone</option>
                      <option value="pending">Oczekujące</option>
                      <option value="completed">Zakończone</option>
                      <option value="cancelled">Anulowane</option>
                    </select>
                  </div>

                  {/* Employee Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">Pracownik</label>
                    <select
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    >
                      <option value="all">Wszyscy pracownicy</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">Okres</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    >
                      <option value="all">Wszystkie</option>
                      <option value="today">Dzisiaj</option>
                      <option value="week">Najbliższy tydzień</option>
                      <option value="month">Najbliższy miesiąc</option>
                    </select>
                  </div>
                </div>

                {/* Reset Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setEmployeeFilter('all')
                      setDateFilter('all')
                    }}
                    className="px-4 py-2 text-sm text-neutral-gray hover:text-white transition-colors"
                  >
                    Wyczyść filtry
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 sm:p-4 mb-4 sm:mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-white text-sm">
                Zaznaczono: <span className="font-bold text-accent-neon">{selectedBookings.length}</span> rezerwacji
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleBulkStatusChange('confirmed')}
                  className="px-3 py-1.5 bg-accent-neon/20 text-accent-neon rounded-lg hover:bg-accent-neon/30 transition-colors text-xs sm:text-sm"
                >
                  Potwierdź
                </button>
                <button
                  onClick={() => handleBulkStatusChange('completed')}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs sm:text-sm"
                >
                  Zakończ
                </button>
                <button
                  onClick={() => handleBulkStatusChange('cancelled')}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs sm:text-sm"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => setSelectedBookings([])}
                  className="px-3 py-1.5 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors text-xs sm:text-sm"
                >
                  Odznacz
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Cards View */}
        <div className="lg:hidden space-y-3">
          {paginatedBookings.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <AlertCircle className="w-12 h-12 text-neutral-gray/50 mx-auto mb-3" />
              <p className="text-neutral-gray">Brak rezerwacji spełniających kryteria</p>
            </div>
          ) : (
            paginatedBookings.map((booking, index) => {
              const customer = customers.find(c => c.id === booking.customerId)
              const isToday = booking.date === new Date().toISOString().split('T')[0]
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`glass-card p-4 ${isToday ? 'border-l-4 border-l-accent-neon' : ''}`}
                >
                  {/* Header: Data + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-gray/50" />
                      <span className="text-white font-medium">{booking.date}</span>
                      <span className="text-neutral-gray/70">•</span>
                      <Clock className="w-4 h-4 text-neutral-gray/50" />
                      <span className="text-white">{booking.time}</span>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-accent-neon/20 text-accent-neon text-xs rounded-full font-medium">
                          Dziś
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => toggleBookingSelection(booking.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-neon focus:ring-accent-neon"
                    />
                  </div>

                  {/* Klient i Usługa */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-neutral-gray/70 mb-1">Klient</p>
                      <p className="text-white font-medium text-sm truncate">{booking.customerName}</p>
                      {customer?.phone && (
                        <p className="text-xs text-neutral-gray/70">{customer.phone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-gray/70 mb-1">Usługa</p>
                      <p className="text-white text-sm truncate">{booking.serviceName}</p>
                      <p className="text-xs text-neutral-gray/70">{booking.duration} min</p>
                    </div>
                  </div>

                  {/* Pracownik i Cena */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-neutral-gray/70 mb-1">Pracownik</p>
                      <p className="text-white text-sm truncate">{booking.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-gray/70 mb-1">Cena</p>
                      {booking.couponCode ? (
                        <div>
                          <span className="text-accent-neon font-bold">{booking.price} zł</span>
                          <span className="text-xs text-neutral-gray/70 line-through ml-2">{booking.basePrice} zł</span>
                        </div>
                      ) : (
                        <span className="text-accent-neon font-bold">{booking.price} zł</span>
                      )}
                    </div>
                  </div>

                  {/* Status i Płatność */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)} focus:outline-none`}
                    >
                      <option value="pending">Oczekująca</option>
                      <option value="confirmed">Potwierdzona</option>
                      <option value="completed">Zakończona</option>
                      <option value="cancelled">Anulowana</option>
                    </select>
                    <button
                      onClick={() => handleOpenPaymentModal(booking)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getPaymentStatusColor(booking.paymentStatus || 'unpaid')} flex items-center gap-1`}
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>{booking.paymentStatus === 'paid' ? 'Zapłacono' : booking.paymentStatus === 'partial' ? 'Częściowo' : 'Do zapłaty'}</span>
                    </button>
                  </div>

                  {/* Akcje */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-3 py-1.5 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      Szczegóły
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Usuń
                    </button>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="glass-card overflow-hidden hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                      onChange={toggleAllBookings}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-neon focus:ring-accent-neon"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Data i godzina</span>
                      {sortField === 'date' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Klient</span>
                      {sortField === 'customer' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray">Usługa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray">Pracownik</th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Cena</span>
                      {sortField === 'price' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray">Płatność</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-gray">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <AlertCircle className="w-12 h-12 text-neutral-gray/50" />
                        <p className="text-neutral-gray">Brak rezerwacji spełniających kryteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking, index) => {
                    const customer = customers.find(c => c.id === booking.customerId)
                    const isToday = booking.date === new Date().toISOString().split('T')[0]
                    return (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-white/5 transition-colors ${isToday ? 'bg-accent-neon/5' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking.id)}
                            onChange={() => toggleBookingSelection(booking.id)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-neon focus:ring-accent-neon"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-neutral-gray/50" />
                            <div>
                              <div className="text-sm text-white font-medium flex items-center gap-2">
                                {booking.date}
                                {isToday && (
                                  <span className="px-1.5 py-0.5 bg-accent-neon/20 text-accent-neon text-xs rounded font-medium">
                                    Dziś
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-gray/70">{booking.time}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-white font-medium">{booking.customerName}</div>
                            {customer && (
                              <div className="text-xs text-neutral-gray/70">{customer.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-white">{booking.serviceName}</div>
                            <div className="text-xs text-neutral-gray/70">{booking.duration} min</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{booking.employeeName}</div>
                        </td>
                        <td className="px-6 py-4">
                          {booking.couponCode ? (
                            <div>
                              <div className="text-sm font-bold text-accent-neon">{booking.price} zł</div>
                              <div className="text-xs text-neutral-gray/70 line-through">{booking.basePrice} zł</div>
                              <div className="text-xs text-green-400">-{booking.discountAmount} zł ({booking.couponCode})</div>
                            </div>
                          ) : (
                            <div className="text-sm font-bold text-accent-neon">{booking.price} zł</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)} focus:outline-none focus:ring-2 focus:ring-accent-neon`}
                          >
                            <option value="pending">Oczekująca</option>
                            <option value="confirmed">Potwierdzona</option>
                            <option value="completed">Zakończona</option>
                            <option value="cancelled">Anulowana</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleOpenPaymentModal(booking)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(booking.paymentStatus || 'unpaid')} focus:outline-none hover:opacity-80 transition-opacity flex items-center gap-1`}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>{getPaymentStatusLabel(booking)}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Szczegóły"
                            >
                              <FileText className="w-4 h-4 text-neutral-gray" />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-neutral-gray">
                Pokazano {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBookings.length)} z {filteredBookings.length}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-accent-neon text-carbon-black font-semibold'
                          : 'bg-white/5 text-neutral-gray hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="lg:hidden glass-card p-4 mt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ← Poprzednia
              </button>
              <span className="text-sm text-neutral-gray">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Następna →
              </button>
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        <AnimatePresence>
          {selectedBooking && (
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
                className="glass-card p-6 max-w-2xl w-full"
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

                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    <div className={`px-4 py-2 rounded-full border flex items-center space-x-2 ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusIcon(selectedBooking.status)}
                      <span className="font-semibold">{getStatusLabel(selectedBooking.status)}</span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-1 block">Klient</label>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-accent-neon" />
                        <p className="text-white font-medium">{selectedBooking.customerName}</p>
                      </div>
                      {customers.find(c => c.id === selectedBooking.customerId) && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-neutral-gray/70">
                            <Phone className="w-3 h-3" />
                            <span>{customers.find(c => c.id === selectedBooking.customerId)?.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-neutral-gray/70">
                            <Mail className="w-3 h-3" />
                            <span>{customers.find(c => c.id === selectedBooking.customerId)?.email}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-1 block">Pracownik</label>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-accent-neon" />
                        <p className="text-white font-medium">{selectedBooking.employeeName}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-1 block">Data</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent-neon" />
                        <p className="text-white font-medium">{selectedBooking.date}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-1 block">Godzina</label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-accent-neon" />
                        <p className="text-white font-medium">{selectedBooking.time}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-1 block">Usługa</label>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-accent-neon" />
                        <p className="text-white font-medium">{selectedBooking.serviceName}</p>
                      </div>
                      <p className="text-sm text-neutral-gray/70 mt-1">{selectedBooking.duration} minut</p>
                    </div>

                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-1 block">Cena</label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-accent-neon" />
                        <p className="text-2xl font-bold text-accent-neon">{selectedBooking.price} zł</p>
                      </div>
                      {selectedBooking.couponCode && (
                        <div className="mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                          <p className="text-sm text-neutral-gray/70 line-through">Cena bazowa: {selectedBooking.basePrice} zł</p>
                          <p className="text-sm text-green-400">Kupon: {selectedBooking.couponCode} (-{selectedBooking.discountAmount} zł)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedBooking.notes && (
                    <div>
                      <label className="text-sm text-neutral-gray/70 mb-2 block">Notatki</label>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white">{selectedBooking.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                    {selectedBooking.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedBooking.id, 'confirmed')
                          setSelectedBooking(null)
                        }}
                        className="flex-1 px-4 py-2 bg-accent-neon/20 text-accent-neon rounded-lg hover:bg-accent-neon/30 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Potwierdź</span>
                      </button>
                    )}
                    {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'pending') && (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedBooking.id, 'completed')
                          setSelectedBooking(null)
                        }}
                        className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Zakończ</span>
                      </button>
                    )}
                    {selectedBooking.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedBooking.id, 'cancelled')
                          setSelectedBooking(null)
                        }}
                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Anuluj</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBooking(selectedBooking.id)}
                      className="px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Usuń</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && paymentBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Płatność za rezerwację</h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Informacje o rezerwacji */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm text-neutral-gray/70 mb-1">Klient</div>
                    <div className="text-white font-medium mb-3">{paymentBooking.customerName}</div>
                    
                    <div className="text-sm text-neutral-gray/70 mb-1">Usługa</div>
                    <div className="text-white font-medium mb-3">{paymentBooking.serviceName}</div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-sm text-neutral-gray/70">Cena całkowita:</span>
                      <span className="text-2xl font-bold text-accent-neon">{paymentBooking.price} zł</span>
                    </div>
                  </div>

                  {/* Metoda płatności */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Metoda płatności
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    >
                      <option value="cash">💵 Gotówka</option>
                      <option value="card">💳 Karta</option>
                      <option value="przelewy24">🏦 Przelewy24</option>
                      <option value="payu">💰 PayU</option>
                      <option value="stripe">🔷 Stripe</option>
                      <option value="other">📋 Inne</option>
                    </select>
                  </div>

                  {/* Kwota zapłacona */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Kwota zapłacona
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        max={paymentBooking.price}
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg focus:outline-none focus:border-accent-neon"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray">zł</span>
                    </div>
                  </div>

                  {/* Szybkie przyciski */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentAmount('0')}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      0 zł
                    </button>
                    <button
                      onClick={() => setPaymentAmount((paymentBooking.price / 2).toString())}
                      className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                    >
                      Połowa
                    </button>
                    <button
                      onClick={() => setPaymentAmount(paymentBooking.price.toString())}
                      className="px-3 py-2 bg-accent-neon/20 text-accent-neon rounded-lg hover:bg-accent-neon/30 transition-colors text-sm"
                    >
                      Całość
                    </button>
                  </div>

                  {/* Podgląd statusu */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-neutral-gray/70 mb-1">Status płatności:</div>
                    <div className="flex items-center gap-2">
                      {parseFloat(paymentAmount || '0') === 0 ? (
                        <>
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm font-semibold text-red-400">Niezapłacono</span>
                        </>
                      ) : parseFloat(paymentAmount || '0') >= paymentBooking.price ? (
                        <>
                          <div className="w-3 h-3 rounded-full bg-accent-neon"></div>
                          <span className="text-sm font-semibold text-accent-neon">Zapłacono</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <span className="text-sm font-semibold text-yellow-400">
                            Częściowo ({paymentAmount}/{paymentBooking.price} zł)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    className="flex-1 btn-neon flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Zapisz</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
