'use client'

import { useState, useEffect } from 'react'
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
  Wallet,
  Gift
} from 'lucide-react'
import { getBookings, getEmployees, getServices, getCustomers, updateBooking, deleteBooking, type Booking } from '@/lib/storage'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getTenantConfig } from '@/lib/tenant'
import { getApiUrl } from '@/lib/api-url'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'
const API_URL = getApiUrl()

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
type SortField = 'date' | 'time' | 'customer' | 'price' | 'status'
type SortOrder = 'asc' | 'desc'

export default function BookingsPage() {
  const { t, language } = useDashboardTranslation()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [customDateFrom, setCustomDateFrom] = useState<string>('')
  const [customDateTo, setCustomDateTo] = useState<string>('')
  
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'przelewy24' | 'payu' | 'stripe' | 'pass' | 'other'>('cash')
  const [customerPasses, setCustomerPasses] = useState<any[]>([])
  const [selectedPassId, setSelectedPassId] = useState<string>('')
  const [customerLoyalty, setCustomerLoyalty] = useState<any>(null)
  const [selectedRewardId, setSelectedRewardId] = useState<string>('')
  const [loyaltyDiscount, setLoyaltyDiscount] = useState<number>(0)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [bookings, searchQuery, statusFilter, employeeFilter, dateFilter, customDateFrom, customDateTo, sortField, sortOrder])

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
      toast.error(t.bookings?.loadError || 'Failed to load bookings')
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
        } else if (dateFilter === 'custom') {
          // Filtr po konkretnym zakresie dat
          if (customDateFrom && customDateTo) {
            const fromDate = new Date(customDateFrom)
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(customDateTo)
            toDate.setHours(23, 59, 59, 999)
            return bookingDate >= fromDate && bookingDate <= toDate
          } else if (customDateFrom) {
            const fromDate = new Date(customDateFrom)
            fromDate.setHours(0, 0, 0, 0)
            return bookingDate >= fromDate
          } else if (customDateTo) {
            const toDate = new Date(customDateTo)
            toDate.setHours(23, 59, 59, 999)
            return bookingDate <= toDate
          }
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
      toast.success(t.bookings?.statusUpdated || 'Status updated')
      loadData()
    } catch (error) {
      console.error('Błąd zmiany statusu:', error)
      toast.error(t.bookings?.statusError || 'Failed to update status')
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
      try {
        await axios.delete(`${API_URL}/api/bookings/${bookingId}`, {
          ...getTenantConfig()
        })
        toast.success(t.bookings?.deleted || 'Booking deleted')
        loadData()
        setSelectedBooking(null)
      } catch (error) {
        console.error('Błąd usuwania:', error)
        toast.error(t.bookings?.deleteError || 'Failed to delete booking')
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
        toast.success(t.bookings?.bulkStatusUpdated || `Status of ${selectedBookings.length} bookings updated`)
        loadData()
        setSelectedBookings([])
      } catch (error) {
        console.error('Błąd zmiany statusu:', error)
        toast.error(t.bookings?.statusError || 'Failed to update status')
      }
    }
  }

  const handleOpenPaymentModal = async (booking: Booking) => {
    setPaymentBooking(booking)
    setPaymentAmount(booking.paidAmount?.toString() || '')
    setPaymentMethod(booking.paymentMethod || 'cash')
    setSelectedPassId('')
    setSelectedRewardId('')
    setLoyaltyDiscount(0)
    setCustomerLoyalty(null)
    setShowPaymentModal(true)
    
    // Pobierz karnety klienta
    if (booking.customerId) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/passes/customer/${booking.customerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const passes = await response.json()
          setCustomerPasses(passes || [])
        }
      } catch (error) {
        console.error('Error fetching customer passes:', error)
        setCustomerPasses([])
      }

      // Pobierz punkty lojalnościowe klienta
      try {
        const config = getTenantConfig()
        const loyaltyRes = await axios.get(`${API_URL}/api/loyalty/customers/${booking.customerId}`, config)
        setCustomerLoyalty(loyaltyRes.data)
      } catch (error) {
        console.log('Loyalty not available for this customer')
        setCustomerLoyalty(null)
      }
    }
  }

  const handlePaymentSubmit = async () => {
    if (!paymentBooking) return
    
    const amount = parseFloat(paymentAmount) || 0
    const totalPrice = paymentBooking.price - loyaltyDiscount
    
    // Jeśli płatność karnetem - wymagaj wyboru karnetu
    if (paymentMethod === 'pass' && !selectedPassId) {
      toast.error(t.bookings?.selectPass || 'Select pass')
      return
    }
    
    // Określ czy rezerwacja jest opłacona
    const isPaid = amount >= totalPrice
    
    try {
      // Jeśli wybrano nagrodę lojalnościową - najpierw ją zrealizuj
      if (selectedRewardId && paymentBooking.customerId) {
        try {
          await axios.post(`${API_URL}/api/loyalty/redeem`, 
            { customerId: paymentBooking.customerId, rewardId: selectedRewardId },
            { ...getTenantConfig() }
          )
          toast.success(`🎁 Nagroda lojalnościowa wykorzystana! Zniżka: ${loyaltyDiscount} zł`)
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Błąd realizacji nagrody')
          return
        }
      }

      // Aktualizuj rezerwację - backend sam wykorzysta karnet jeśli passId jest przekazany
      await axios.patch(`${API_URL}/api/bookings/${paymentBooking.id}`, 
        { 
          isPaid: isPaid,
          paidAmount: amount,
          paymentMethod: paymentMethod,
          paidAt: isPaid ? new Date().toISOString() : null,
          passId: paymentMethod === 'pass' ? selectedPassId : null,
          loyaltyDiscount: loyaltyDiscount > 0 ? loyaltyDiscount : null,
          loyaltyRewardId: selectedRewardId || null
        },
        { ...getTenantConfig() }
      )
      
      if (paymentMethod === 'pass') {
        toast.success('🎫 Wizyta opłacona karnetem!')
      } else if (isPaid) {
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
      setSelectedPassId('')
      setCustomerPasses([])
      setSelectedRewardId('')
      setLoyaltyDiscount(0)
      setCustomerLoyalty(null)
    } catch (error) {
      console.error('Błąd zapisu płatności:', error)
      toast.error(t.bookings?.paymentError || 'Failed to save payment')
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
      case 'confirmed': return t.labels.confirmed
      case 'pending': return t.labels.pending
      case 'cancelled': return t.labels.cancelled
      case 'completed': return t.labels.completed
    }
  }

  const getPaymentStatusColor = (paymentStatus: 'paid' | 'unpaid' | 'partial') => {
    switch (paymentStatus) {
      case 'paid': return 'text-accent-neon bg-accent-neon/20 border-accent-neon/30'
      case 'unpaid': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'partial': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    }
  }

  const currency = language === 'pl' ? 'zł' : '€'
  
  const getPaymentStatusLabel = (booking: Booking) => {
    const status = booking.paymentStatus || 'unpaid'
    switch (status) {
      case 'paid': return t.labels.paid
      case 'unpaid': return t.labels.unpaid
      case 'partial': return `${t.labels.partial} (${booking.paidAmount || 0}/${booking.price} ${currency})`
    }
  }

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'cash': return t.labels.cash
      case 'card': return t.labels.card
      case 'przelewy24': return 'Przelewy24'
      case 'payu': return 'PayU'
      case 'stripe': return 'Stripe'
      case 'pass': return t.labels.pass
      case 'other': return t.labels.other
      default: return t.labels.notSpecified
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.nav.bookings}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">{t.labels.manageBookings}</p>
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>{t.labels.exportCsv}</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[var(--text-primary)]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.total}</p>
            <span className="text-xs text-[var(--text-muted)]">{t.labels.all}</span>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.confirmed}</p>
            <span className="text-xs text-[var(--text-muted)]">{t.labels.confirmed}</span>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.pending}</p>
            <span className="text-xs text-[var(--text-muted)]">{t.labels.pending}</span>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.completed}</p>
            <span className="text-xs text-[var(--text-muted)]">{t.labels.completed}</span>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.cancelled}</p>
            <span className="text-xs text-[var(--text-muted)]">{t.labels.cancelled}</span>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.revenue} {currency}</p>
            <span className="text-xs text-[var(--text-muted)]">{t.labels.revenue}</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.labels.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>{t.labels.filters}</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
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
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Pracownik</label>
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
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
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Okres</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value as any)
                      if (e.target.value !== 'custom') {
                        setCustomDateFrom('')
                        setCustomDateTo('')
                      }
                    }}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="all">Wszystkie</option>
                    <option value="today">Dzisiaj</option>
                    <option value="week">Najbliższy tydzień</option>
                    <option value="month">Najbliższy miesiąc</option>
                    <option value="custom">Wybierz zakres dat</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Data od</label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Data do</label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20"
                    />
                  </div>
                </div>
              )}

              {/* Reset Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setEmployeeFilter('all')
                    setDateFilter('all')
                    setCustomDateFrom('')
                    setCustomDateTo('')
                  }}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Wyczyść filtry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-sm text-[var(--text-primary)]">
                Zaznaczono: <span className="font-medium">{selectedBookings.length}</span> rezerwacji
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleBulkStatusChange('confirmed')}
                  className="px-3 py-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  Potwierdź
                </button>
                <button
                  onClick={() => handleBulkStatusChange('completed')}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-card-hover)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Zakończ
                </button>
                <button
                  onClick={() => handleBulkStatusChange('cancelled')}
                  className="px-3 py-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => setSelectedBookings([])}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Odznacz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Cards View */}
        <div className="lg:hidden space-y-3">
          {paginatedBookings.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-center">
              <Calendar className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-muted)]">Brak rezerwacji</p>
            </div>
          ) : (
            paginatedBookings.map((booking) => {
              const customer = customers.find(c => c.id === booking.customerId)
              const isToday = booking.date === new Date().toISOString().split('T')[0]
              return (
                <div
                  key={booking.id}
                  className={`bg-[var(--bg-card)] border rounded-xl overflow-hidden ${
                    isToday ? 'border-l-4 border-l-green-500 border-[var(--border-color)]' : 'border-[var(--border-color)]'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-sm font-medium text-[var(--text-primary)]">
                        {booking.customerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{booking.customerName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{customer?.phone || ''}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => toggleBookingSelection(booking.id)}
                      className="w-4 h-4 rounded border-[var(--border-color)]"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-primary)]">{booking.date}</span>
                        <span className="text-[var(--text-muted)]">•</span>
                        <span className="text-[var(--text-primary)]">{booking.time}</span>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                            Dziś
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">{booking.price} zł</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Usługa</p>
                        <p className="text-[var(--text-primary)]">{booking.serviceName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Pracownik</p>
                        <p className="text-[var(--text-primary)]">{booking.employeeName}</p>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        booking.status === 'completed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {booking.status === 'confirmed' ? 'Potwierdzona' :
                         booking.status === 'pending' ? 'Oczekująca' :
                         booking.status === 'completed' ? 'Zakończona' : 'Anulowana'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        booking.paymentStatus === 'partial' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {booking.paymentStatus === 'paid' ? '✓ Opłacone' : 
                         booking.paymentStatus === 'partial' ? `Częściowo ${booking.paidAmount}/${booking.price} zł` : 
                         'Nieopłacone'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center border-t border-[var(--border-color)] divide-x divide-[var(--border-color)]">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="flex-1 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      Szczegóły
                    </button>
                    <button
                      onClick={() => handleOpenPaymentModal(booking)}
                      className="flex-1 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      Płatność
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="flex-1 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-card-hover)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                      onChange={toggleAllBookings}
                      className="w-4 h-4 rounded border-[var(--border-color)]"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Data
                      {sortField === 'date' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center gap-1">
                      Klient
                      {sortField === 'customer' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Usługa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Pracownik</th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Cena
                      {sortField === 'price' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Płatność</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Calendar className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="text-[var(--text-muted)]">Brak rezerwacji</p>
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => {
                    const customer = customers.find(c => c.id === booking.customerId)
                    const isToday = booking.date === new Date().toISOString().split('T')[0]
                    return (
                      <tr
                        key={booking.id}
                        className={`hover:bg-[var(--bg-card-hover)] transition-colors ${isToday ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking.id)}
                            onChange={() => toggleBookingSelection(booking.id)}
                            className="w-4 h-4 rounded border-[var(--border-color)]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm text-[var(--text-primary)] font-medium flex items-center gap-2">
                              {booking.date}
                              {isToday && (
                                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                                  Dziś
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">{booking.time}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center text-xs font-medium text-[var(--text-primary)]">
                              {booking.customerName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm text-[var(--text-primary)] font-medium">{booking.customerName}</div>
                              {customer && <div className="text-xs text-[var(--text-muted)]">{customer.phone}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-[var(--text-primary)]">{booking.serviceName}</div>
                          <div className="text-xs text-[var(--text-muted)]">{booking.duration} min</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-[var(--text-primary)]">{booking.employeeName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{booking.price} zł</div>
                          {booking.couponCode && (
                            <div className="text-xs text-green-600">-{booking.discountAmount} zł</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                            booking.status === 'completed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {booking.status === 'confirmed' ? 'Potwierdzona' :
                             booking.status === 'pending' ? 'Oczekująca' :
                             booking.status === 'completed' ? 'Zakończona' : 'Anulowana'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleOpenPaymentModal(booking)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80 ${
                              booking.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              booking.paymentStatus === 'partial' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {booking.paymentStatus === 'paid' ? '✓ Opłacone' : 
                             booking.paymentStatus === 'partial' ? 'Częściowo' : 
                             'Nieopłacone'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                              title="Szczegóły"
                            >
                              <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm text-[var(--text-muted)]">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBookings.length)} z {filteredBookings.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors disabled:opacity-50"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1
                  if (totalPages > 5) {
                    if (currentPage > 3) page = currentPage - 2 + i
                    if (currentPage > totalPages - 2) page = totalPages - 4 + i
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="lg:hidden bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                ← Poprzednia
              </button>
              <span className="text-sm text-[var(--text-muted)]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                Następna →
              </button>
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBooking(null)}
          >
            <div
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center text-lg font-semibold text-[var(--text-primary)]">
                    {selectedBooking.customerName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{selectedBooking.customerName}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{customers.find(c => c.id === selectedBooking.customerId)?.phone || ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Status & Payment */}
              <div className="flex items-center gap-2 p-5 border-b border-[var(--border-color)]">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  selectedBooking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  selectedBooking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                  selectedBooking.status === 'completed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {selectedBooking.status === 'confirmed' ? 'Potwierdzona' :
                   selectedBooking.status === 'pending' ? 'Oczekująca' :
                   selectedBooking.status === 'completed' ? 'Zakończona' : 'Anulowana'}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  selectedBooking.paymentStatus === 'partial' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {selectedBooking.paymentStatus === 'paid' ? '✓ Opłacone' : 
                   selectedBooking.paymentStatus === 'partial' ? 'Częściowo opłacone' : 
                   'Nieopłacone'}
                </span>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-primary)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Data</p>
                    <p className="font-medium text-[var(--text-primary)]">{selectedBooking.date}</p>
                  </div>
                  <div className="bg-[var(--bg-primary)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Godzina</p>
                    <p className="font-medium text-[var(--text-primary)]">{selectedBooking.time}</p>
                  </div>
                </div>

                <div className="bg-[var(--bg-primary)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Usługa</p>
                  <p className="font-medium text-[var(--text-primary)]">{selectedBooking.serviceName}</p>
                  <p className="text-sm text-[var(--text-muted)]">{selectedBooking.duration} min</p>
                </div>

                <div className="bg-[var(--bg-primary)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Pracownik</p>
                  <p className="font-medium text-[var(--text-primary)]">{selectedBooking.employeeName}</p>
                </div>

                <div className="bg-[var(--bg-primary)] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-1">Cena</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedBooking.price} zł</p>
                    </div>
                    {selectedBooking.couponCode && (
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)] line-through">{selectedBooking.basePrice} zł</p>
                        <p className="text-xs text-green-600">-{selectedBooking.discountAmount} zł ({selectedBooking.couponCode})</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="bg-[var(--bg-primary)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Notatki</p>
                    <p className="text-sm text-[var(--text-primary)]">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-[var(--border-color)] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'confirmed')
                        setSelectedBooking(null)
                      }}
                      className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Potwierdź
                    </button>
                  )}
                  {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'pending') && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'completed')
                        setSelectedBooking(null)
                      }}
                      className="px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Zakończ
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedBooking.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'cancelled')
                        setSelectedBooking(null)
                      }}
                      className="px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                    >
                      Anuluj rezerwację
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBooking(selectedBooking.id)}
                    className="px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        

        {/* Payment Modal */}
        {showPaymentModal && paymentBooking && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <div
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
                <h3 className="font-semibold text-[var(--text-primary)]">Płatność</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Informacje o rezerwacji */}
                <div className="bg-[var(--bg-primary)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{paymentBooking.customerName}</p>
                      <p className="text-sm text-[var(--text-muted)]">{paymentBooking.serviceName}</p>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{paymentBooking.price} zł</p>
                  </div>
                </div>

                {/* Metoda płatności */}
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Metoda płatności</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="cash">Gotówka</option>
                    <option value="card">Karta</option>
                    <option value="pass">Karnet</option>
                    <option value="przelewy24">Przelewy24</option>
                    <option value="payu">PayU</option>
                    <option value="stripe">Stripe</option>
                    <option value="other">Inne</option>
                  </select>
                </div>

                {/* Wybór karnetu - pokazuj tylko gdy wybrano metodę "Karnet" */}
                {paymentMethod === 'pass' && (
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Wybierz karnet</label>
                    {customerPasses.length > 0 ? (
                      <select
                        value={selectedPassId}
                        onChange={(e) => {
                          setSelectedPassId(e.target.value)
                          if (e.target.value) {
                            // Automatycznie ustaw pełną kwotę jako zapłaconą
                            setPaymentAmount(paymentBooking?.price.toString() || '0')
                          }
                        }}
                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value="">-- Wybierz karnet --</option>
                        {customerPasses.map((pass: any) => (
                          <option key={pass.id} value={pass.id}>
                            {pass.passType?.name} - {pass.passType?.passKind === 'VISITS' 
                              ? `${pass.visitsUsed}/${pass.visitsTotal} wizyt` 
                              : `ważny do ${new Date(pass.expiresAt).toLocaleDateString('pl-PL')}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Klient nie ma aktywnych karnetów
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Nagrody lojalnościowe */}
                {customerLoyalty && customerLoyalty.availablePoints > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-amber-600" />
                      <span className="font-medium text-amber-700 dark:text-amber-400">
                        Program lojalnościowy
                      </span>
                      <span className="ml-auto text-sm text-amber-600">
                        {customerLoyalty.availablePoints} pkt
                      </span>
                    </div>
                    
                    {customerLoyalty.availableRewards && customerLoyalty.availableRewards.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-sm text-amber-700 dark:text-amber-400">Dostępne nagrody:</label>
                        <select
                          value={selectedRewardId}
                          onChange={(e) => {
                            const rewardId = e.target.value
                            setSelectedRewardId(rewardId)
                            if (rewardId) {
                              const reward = customerLoyalty.availableRewards.find((r: any) => r.id === rewardId)
                              if (reward) {
                                let discount = 0
                                if (reward.rewardType === 'DISCOUNT_PERCENT') {
                                  discount = Math.round(paymentBooking!.price * Number(reward.rewardValue) / 100)
                                } else if (reward.rewardType === 'DISCOUNT_AMOUNT') {
                                  discount = Number(reward.rewardValue)
                                }
                                setLoyaltyDiscount(Math.min(discount, paymentBooking!.price))
                              }
                            } else {
                              setLoyaltyDiscount(0)
                            }
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-lg text-sm focus:outline-none"
                        >
                          <option value="">-- Nie używaj nagrody --</option>
                          {customerLoyalty.availableRewards.map((reward: any) => (
                            <option key={reward.id} value={reward.id}>
                              {reward.name} ({reward.pointsCost} pkt) - 
                              {reward.rewardType === 'DISCOUNT_PERCENT' && ` ${reward.rewardValue}% zniżki`}
                              {reward.rewardType === 'DISCOUNT_AMOUNT' && ` ${reward.rewardValue} zł zniżki`}
                              {reward.rewardType === 'FREE_SERVICE' && ' Darmowa usługa'}
                            </option>
                          ))}
                        </select>
                        
                        {loyaltyDiscount > 0 && (
                          <div className="flex items-center justify-between p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-400 text-sm">
                            <span>Zniżka lojalnościowa:</span>
                            <span className="font-bold">-{loyaltyDiscount} zł</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600">
                        Klient ma punkty, ale brak dostępnych nagród do wymiany
                      </p>
                    )}
                  </div>
                )}

                {/* Kwota zapłacona */}
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Kwota do zapłaty {loyaltyDiscount > 0 && <span className="text-green-600">(po zniżce: {paymentBooking.price - loyaltyDiscount} zł)</span>}
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
                      className="w-full px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-lg text-[var(--text-primary)] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">zł</span>
                  </div>
                </div>

                {/* Szybkie przyciski */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentAmount('0')}
                    className="px-3 py-2 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
                  >
                    0 zł
                  </button>
                  <button
                    onClick={() => setPaymentAmount(((paymentBooking.price - loyaltyDiscount) / 2).toString())}
                    className="px-3 py-2 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
                  >
                    Połowa
                  </button>
                  <button
                    onClick={() => setPaymentAmount((paymentBooking.price - loyaltyDiscount).toString())}
                    className="px-3 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    Całość
                  </button>
                </div>

                {/* Podgląd statusu */}
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-primary)] rounded-lg">
                  {parseFloat(paymentAmount || '0') === 0 ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-sm text-red-600">Nieopłacone</span>
                    </>
                  ) : parseFloat(paymentAmount || '0') >= (paymentBooking.price - loyaltyDiscount) ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm text-green-600">Opłacone w całości</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-sm text-amber-600">
                        Częściowo ({paymentAmount}/{paymentBooking.price - loyaltyDiscount} zł)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 p-5 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
                >
                  Anuluj
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="flex-1 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Zapisz płatność
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
