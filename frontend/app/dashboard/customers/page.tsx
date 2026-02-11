'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { 
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  AlertCircle,
  TrendingUp,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Ticket,
  ShoppingCart,
  Gift,
  Flag,
  UserX
} from 'lucide-react'
import Link from 'next/link'
import { getCustomers, getBookings, updateCustomer, deleteCustomer, type Customer } from '@/lib/storage'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getTenantConfig } from '@/lib/tenant'
import { getApiUrl } from '@/lib/api-url'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'
const API_URL = getApiUrl()

type SortField = 'name' | 'totalVisits' | 'totalSpent' | 'lastVisit' | 'debt'
type SortOrder = 'asc' | 'desc'

export default function CustomersPage() {
  const { t, language } = useDashboardTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currency = language === 'pl' ? 'zł' : '€'
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isBlocked: false,
    notes: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [customerPasses, setCustomerPasses] = useState<any[]>([])
  const [loadingPasses, setLoadingPasses] = useState(false)
  const [passTypes, setPassTypes] = useState<any[]>([])
  const [showSellPassModal, setShowSellPassModal] = useState(false)
  const [selectedPassType, setSelectedPassType] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [addLoading, setAddLoading] = useState(false)
  const [loyaltyPoints, setLoyaltyPoints] = useState<Record<string, number>>({})

  useEffect(() => {
    loadData()
    fetchPassTypes()
  }, [])

  // Obsługa parametru action z URL (szybkie akcje z dashboardu)
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'new') {
      setShowAddModal(true)
      router.replace('/dashboard/customers', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    applyFiltersAndSort()
  }, [customers, searchQuery, filterStatus, sortField, sortOrder])

  const loadData = async () => {
    try {
      const config = {
        ...getTenantConfig()
      }

      // Pobierz tylko klientów - statystyki są już w bazie danych
      const customersRes = await axios.get(`${API_URL}/api/customers`, config)
      const customersData = customersRes.data || []

      setCustomers(customersData)
      setBookings([])

      // Pobierz punkty lojalnościowe dla wszystkich klientów
      try {
        const loyaltyRes = await axios.get(`${API_URL}/api/loyalty/all-points`, config)
        if (loyaltyRes.data) {
          const pointsMap: Record<string, number> = {}
          loyaltyRes.data.forEach((item: { customerId: string; availablePoints: number }) => {
            pointsMap[item.customerId] = item.availablePoints
          })
          setLoyaltyPoints(pointsMap)
        }
      } catch (err) {
        // Loyalty może nie być aktywne - ignoruj błąd
        console.log('Loyalty points not available')
      }
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      toast.error(t.customers?.loadError || 'Failed to load customers')
      // Fallback do localStorage
      setCustomers(getCustomers())
      setBookings(getBookings())
    }
  }

  // Pobierz typy karnetów
  const fetchPassTypes = async () => {
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/passes/types`, config)
      setPassTypes(response.data || [])
    } catch (error) {
      console.error('Błąd pobierania typów karnetów:', error)
    }
  }

  // Pobierz karnety klienta
  const fetchCustomerPasses = async (customerId: string) => {
    setLoadingPasses(true)
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/passes/customer/${customerId}`, config)
      setCustomerPasses(response.data || [])
    } catch (error) {
      console.error('Błąd pobierania karnetów klienta:', error)
      setCustomerPasses([])
    } finally {
      setLoadingPasses(false)
    }
  }

  // Pobierz szczegóły klienta (z historią rezerwacji)
  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/customers/${customerId}`, config)
      setSelectedCustomer(response.data)
      // Ustaw bookings z odpowiedzi
      if (response.data.bookings) {
        setBookings(response.data.bookings)
      }
    } catch (error) {
      console.error('Błąd pobierania szczegółów klienta:', error)
    }
  }

  // Sprzedaj karnet klientowi
  const handleSellPass = async () => {
    if (!selectedCustomer || !selectedPassType) {
      toast.error(t.customers?.selectPassType || 'Select pass type')
      return
    }
    try {
      const config = getTenantConfig()
      await axios.post(`${API_URL}/api/passes/sell`, {
        passTypeId: selectedPassType,
        customerId: selectedCustomer.id
      }, config)
      toast.success(t.customers?.passSold || 'Pass sold!')
      setShowSellPassModal(false)
      setSelectedPassType('')
      fetchCustomerPasses(selectedCustomer.id)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.customers?.passSellError || 'Pass sell error')
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...customers]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        c.phone.includes(query)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'blocked') {
        filtered = filtered.filter(c => c.isBlocked)
      } else if (filterStatus === 'vip') {
        filtered = filtered.filter(c => !c.isBlocked && (c.totalBookings || 0) > 10)
      } else if (filterStatus === 'active') {
        filtered = filtered.filter(c => !c.isBlocked && (c.totalBookings || 0) <= 10)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
          break
        case 'totalVisits':
          comparison = (a.totalVisits || 0) - (b.totalVisits || 0)
          break
        case 'totalSpent':
          comparison = (a.totalSpent || 0) - (b.totalSpent || 0)
          break
        case 'debt':
          comparison = calculateCustomerDebt(a.id) - calculateCustomerDebt(b.id)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredCustomers(filtered)
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

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      try {
        const config = getTenantConfig()
        await axios.delete(`${API_URL}/api/customers/${customerId}`, config)
        toast.success(t.customers?.deleted || 'Klient został usunięty')
        await loadData()
      } catch (error: any) {
        console.error('Error deleting customer:', error)
        const errorMessage = error.response?.data?.message || t.customers?.deleteError || 'Nie można usunąć klienta'
        toast.error(errorMessage)
      }
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Imię', 'Nazwisko', 'Email', 'Telefon', 'Wizyty', 'Wydano', 'Dług', 'Status'],
      ...filteredCustomers.map(c => [
        c.firstName,
        c.lastName,
        c.email,
        c.phone,
        c.totalVisits?.toString() || '0',
        `${c.totalSpent || 0} zł`,
        `${calculateCustomerDebt(c.id)} zł`,
        c.isBlocked ? 'Zablokowany' : (c.totalBookings || 0) > 10 ? 'VIP' : 'Aktywny'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `klienci_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getCustomerBookings = (customerId: string) => {
    return bookings.filter(b => b.customerId === customerId)
  }

  const calculateCustomerDebt = (customerId: string) => {
    const customerBookings = bookings.filter((b: any) => b.customerId === customerId)
    const unpaidAmount = customerBookings
      .filter((b: any) => (b.status === 'CONFIRMED' || b.status === 'COMPLETED'))
      .reduce((sum: number, b: any) => {
        const totalPrice = parseFloat(b.totalPrice) || parseFloat(b.basePrice) || 0
        
        // Jeśli całkowicie zapłacone, dług = 0
        if (b.isPaid) {
          return sum + 0
        }
        
        // Jeśli częściowo zapłacone, dług = cena - zapłacona kwota
        const paidAmount = parseFloat(b.paidAmount) || 0
        const remainingDebt = totalPrice - paidAmount
        
        return sum + Math.max(0, remainingDebt)
      }, 0)
    return Math.round(unpaidAmount)
  }

  const getLastVisit = (customerId: string) => {
    const customerBookings = getCustomerBookings(customerId)
    if (customerBookings.length === 0) return 'Brak'
    
    const sorted = customerBookings.sort((a: any, b: any) => {
      const dateA = new Date(a.startTime || a.date)
      const dateB = new Date(b.startTime || b.date)
      return dateB.getTime() - dateA.getTime()
    })
    
    const lastBooking = sorted[0]
    const lastDate = lastBooking.startTime 
      ? new Date(lastBooking.startTime)
      : new Date(`${lastBooking.date} ${lastBooking.time}`)
    
    return lastDate.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Stats - obliczane z danych klientów z API
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter(c => {
      const created = new Date(c.createdAt || Date.now())
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    active: customers.filter(c => !c.isBlocked).length,
    avgSpent: customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length) : 0,
    totalDebt: customers.reduce((sum, c) => sum + (c.debt || 0), 0)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || '',
      phone: customer.phone,
      isBlocked: customer.isBlocked || false,
      notes: customer.notes || ''
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (selectedCustomer) {
      try {
        const config = getTenantConfig()
        // Send only fields that exist in database
        const updateData = {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email || null,
          phone: editForm.phone,
          isBlocked: editForm.isBlocked
        }
        await axios.patch(`${API_URL}/api/customers/${selectedCustomer.id}`, updateData, config)
        toast.success(t.customers?.updated || 'Customer updated')
        await loadData()
        setShowEditModal(false)
        setSelectedCustomer(null)
      } catch (error) {
        console.error('Error updating customer:', error)
        toast.error(t.customers?.updateError || 'Failed to update customer')
      }
    }
  }

  // Dodawanie klienta
  const handleAddCustomer = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim()) {
      toast.error(t.customers?.nameRequired || 'First and last name are required')
      return
    }
    if (!addForm.phone.trim()) {
      toast.error(t.customers?.phoneRequired || 'Phone is required')
      return
    }

    setAddLoading(true)
    try {
      const config = getTenantConfig()
      await axios.post(`${API_URL}/api/customers`, {
        firstName: addForm.firstName.trim(),
        lastName: addForm.lastName.trim(),
        email: addForm.email.trim() || null,
        phone: addForm.phone.trim(),
        notes: addForm.notes.trim() || null
      }, config)
      
      toast.success(t.customers?.added || 'Customer added')
      setShowAddModal(false)
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', notes: '' })
      await loadData()
    } catch (error: any) {
      console.error('Error adding customer:', error)
      toast.error(error.response?.data?.message || t.customers?.addError || 'Failed to add customer')
    } finally {
      setAddLoading(false)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="bg-[var(--bg-primary)]">
      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-1">{t.customers?.title || 'Customers'}</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">{t.customers?.subtitle || 'Manage your customers'}</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleExport}
                className="p-2.5 sm:px-5 sm:py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t.customers?.exportCSV || 'Export CSV'}</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">{t.customers?.addCustomer || 'Add customer'}</span>
                <span className="xs:hidden">{t.common?.add || 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <span className="text-xs text-[var(--text-muted)]">{t.customers?.title || 'Customers'}</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.newThisMonth}</p>
              <span className="text-xs text-[var(--text-muted)]">Nowi</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.active}</p>
              <span className="text-xs text-[var(--text-muted)]">Aktywni</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.avgSpent} <span className="text-sm">zł</span></p>
              <span className="text-xs text-[var(--text-muted)]">Śr. wartość</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-[var(--text-muted)]">Dług klientów</span>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-500">{stats.totalDebt} <span className="text-sm">zł</span></p>
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">
                {customers.filter(c => calculateCustomerDebt(c.id) > 0).length} klientów z długiem
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-muted)]/50" />
                <input
                  type="text"
                  placeholder={t.customers?.searchPlaceholder || 'Search customer...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-neutral-gray/50 focus:outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]"
                >
                  <option value="all">Wszyscy</option>
                  <option value="active">Aktywni</option>
                  <option value="vip">VIP</option>
                  <option value="blocked">Zablokowani</option>
                </select>

                <button className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors flex-shrink-0">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
          </div>

          {/* Customers - Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {paginatedCustomers.length === 0 ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-muted)]">Brak klientów</p>
              </div>
            ) : (
              paginatedCustomers.map((customer) => {
                return (
                  <div
                    key={customer.id}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{customer.firstName[0]}{customer.lastName[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[var(--text-primary)]">{customer.firstName} {customer.lastName}</p>
                            {loyaltyPoints[customer.id] > 0 && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                <Gift className="w-3 h-3" />
                                {loyaltyPoints[customer.id]}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">{customer.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedCustomer(customer); setShowDetailsModal(true); fetchCustomerDetails(customer.id); fetchCustomerPasses(customer.id) }}
                        className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[var(--bg-card-hover)] rounded-lg p-2">
                        <p className="text-xs text-[var(--text-muted)]">Wizyty</p>
                        <p className="font-semibold text-[var(--text-primary)]">{customer.totalVisits || 0}</p>
                      </div>
                      <div className="bg-[var(--bg-card-hover)] rounded-lg p-2">
                        <p className="text-xs text-[var(--text-muted)]">Wydano</p>
                        <p className="font-semibold text-[var(--text-primary)]">{customer.totalSpent || 0} zł</p>
                      </div>
                      <div className={`rounded-lg p-2 ${(customer.debt || 0) > 0 ? 'bg-red-500/10' : 'bg-[var(--bg-card-hover)]'}`}>
                        <p className="text-xs text-[var(--text-muted)]">Dług</p>
                        <p className={`font-semibold ${(customer.debt || 0) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {(customer.debt || 0) > 0 ? `${customer.debt} zł` : '0 zł'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Customers Table - Desktop Only */}
          <div className="hidden lg:block bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        Klient
                        {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">Kontakt</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('totalVisits')}>
                      <div className="flex items-center gap-2">
                        Wizyty
                        {sortField === 'totalVisits' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">Ostatnia wizyta</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('totalSpent')}>
                      <div className="flex items-center gap-2">
                        Wydano
                        {sortField === 'totalSpent' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('debt')}>
                      <div className="flex items-center gap-2">
                        Dług
                        {sortField === 'debt' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text-secondary)]">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <AlertCircle className="w-12 h-12 text-[var(--text-muted)]/50" />
                          <p className="text-[var(--text-muted)]">Brak klientów</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className="border-b border-white/5 hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-carbon-black">{customer.firstName[0]}{customer.lastName[0]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[var(--text-primary)]">{customer.firstName} {customer.lastName}</p>
                              {loyaltyPoints[customer.id] > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  <Gift className="w-3 h-3" />
                                  {loyaltyPoints[customer.id]} pkt
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-muted)]/70">ID: {customer.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-[var(--text-muted)]/70">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-[var(--text-muted)]/70">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[var(--text-primary)] font-medium">{customer.totalVisits || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[var(--text-muted)]/70 text-sm">
                          {customer.lastVisit 
                            ? new Date(customer.lastVisit).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' })
                            : 'Brak'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[var(--text-primary)] font-medium">{customer.totalSpent || 0} zł</span>
                      </td>
                      <td className="px-6 py-4">
                        {(customer.debt || 0) > 0 ? (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-bold">
                              {customer.debt} zł
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-primary)] text-sm font-medium">
                            0 zł
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.isBlocked
                            ? 'bg-red-500/20 text-red-400'
                            : (customer.totalBookings || 0) > 10
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {customer.isBlocked ? 'Zablokowany' : (customer.totalBookings || 0) > 10 ? 'VIP' : 'Aktywny'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setShowDetailsModal(true)
                              fetchCustomerDetails(customer.id)
                              fetchCustomerPasses(customer.id)
                            }}
                            className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                            title="Szczegóły"
                          >
                            <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edytuj"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Usuń"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]/70">
                  Pokazano {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} z {filteredCustomers.length} klientów
                </p>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg text-[var(--text-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Poprzednia
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[var(--text-primary)] text-carbon-black font-bold'
                            : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  {totalPages > 5 && <span className="text-[var(--text-muted)]">...</span>}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg text-[var(--text-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Następna
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal szczegółów klienta */}
      
        {showDetailsModal && selectedCustomer && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Szczegóły klienta</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Dane klienta */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-carbon-black">
                      {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]/70">ID: {selectedCustomer.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-[var(--text-muted)]">
                    <Mail className="w-4 h-4" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[var(--text-muted)]">
                    <Phone className="w-4 h-4" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[var(--text-muted)]">
                    <Calendar className="w-4 h-4" />
                    <span>Klient od: {new Date(selectedCustomer.createdAt || Date.now()).toLocaleDateString('pl-PL')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedCustomer.isBlocked
                        ? 'bg-red-500/20 text-red-400'
                        : (selectedCustomer.totalBookings || 0) > 10
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {selectedCustomer.isBlocked ? 'Zablokowany' : (selectedCustomer.totalBookings || 0) > 10 ? 'VIP' : 'Aktywny'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statystyki */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                  <p className="text-xs text-[var(--text-muted)]/70 mb-1">Wizyty</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedCustomer.totalVisits || 0}</p>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                  <p className="text-xs text-[var(--text-muted)]/70 mb-1">Wydano</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedCustomer.totalSpent || 0} zł</p>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                  <p className="text-xs text-[var(--text-muted)]/70 mb-1">Średnia wizyta</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {selectedCustomer.totalVisits && selectedCustomer.totalVisits > 0 
                      ? Math.round((selectedCustomer.totalSpent || 0) / selectedCustomer.totalVisits)
                      : 0} zł
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                  <p className="text-xs text-[var(--text-muted)]/70 mb-1">Dług</p>
                  <p className={`text-2xl font-bold ${(selectedCustomer.debt || 0) > 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                    {selectedCustomer.debt || 0} zł
                  </p>
                </div>
              </div>

              {/* Karnety klienta */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-400" />
                    Karnety klienta
                  </h3>
                  <button
                    onClick={() => setShowSellPassModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Sprzedaj karnet
                  </button>
                </div>
                
                {loadingPasses ? (
                  <div className="text-center py-4 text-[var(--text-muted)]">Ładowanie...</div>
                ) : customerPasses.length === 0 ? (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 text-center">
                    <Ticket className="w-10 h-10 text-[var(--text-muted)]/50 mx-auto mb-2" />
                    <p className="text-[var(--text-muted)]">Klient nie ma żadnych karnetów</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {customerPasses.map((pass: any) => {
                      const isExpired = new Date(pass.expiresAt) < new Date()
                      const isUsedUp = pass.passType?.passKind === 'VISITS' && pass.visitsUsed >= (pass.visitsTotal || 0)
                      const isActive = pass.status === 'ACTIVE' && !isExpired && !isUsedUp
                      
                      return (
                        <div 
                          key={pass.id} 
                          className={`bg-[var(--bg-card)] border rounded-xl p-4 ${
                            isActive ? 'border-purple-500/50' : 'border-[var(--border-color)] opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-[var(--text-primary)]">
                                  {pass.passType?.name || 'Karnet'}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  isActive 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : isExpired 
                                    ? 'bg-red-500/20 text-red-400'
                                    : isUsedUp
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {isActive ? 'Aktywny' : isExpired ? 'Wygasły' : isUsedUp ? 'Wykorzystany' : pass.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                                {pass.passType?.passKind === 'VISITS' && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {pass.visitsUsed || 0} / {pass.visitsTotal || 0} wizyt
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Wygasa: {new Date(pass.expiresAt).toLocaleDateString('pl-PL')}
                                </span>
                              </div>
                            </div>
                            {isActive && pass.passType?.passKind === 'VISITS' && (
                              <div className="text-right">
                                <p className="text-2xl font-bold text-purple-400">
                                  {(pass.visitsTotal || 0) - (pass.visitsUsed || 0)}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">pozostało</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Historia wizyt */}
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Historia wizyt</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-muted)]">Data</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-muted)]">Usługa</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-muted)]">Cena</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-muted)]">Płatność</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!selectedCustomer.bookings || selectedCustomer.bookings.length === 0) ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-muted)]">
                            Brak wizyt
                          </td>
                        </tr>
                      ) : (
                        selectedCustomer.bookings
                          .sort((a: any, b: any) => {
                            const dateA = new Date(a.startTime || a.date)
                            const dateB = new Date(b.startTime || b.date)
                            return dateB.getTime() - dateA.getTime()
                          })
                          .map((booking: any) => {
                            const bookingDate = booking.startTime 
                              ? new Date(booking.startTime)
                              : new Date(booking.date)
                            const totalPrice = parseFloat(booking.totalPrice || booking.basePrice || booking.price || 0)
                            const paidAmount = parseFloat(booking.paidAmount || 0)
                            const isPaid = booking.isPaid || booking.paymentStatus === 'paid'
                            const isPartiallyPaid = !isPaid && paidAmount > 0
                            const remainingDebt = totalPrice - paidAmount
                            const serviceName = booking.services?.name || booking.serviceName || 'Nieznana usługa'
                            
                            return (
                              <tr key={booking.id} className="border-b border-white/5">
                                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                                  {bookingDate.toLocaleDateString('pl-PL', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{serviceName}</td>
                                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{totalPrice.toFixed(2)} zł</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    isPaid
                                      ? 'bg-green-500/20 text-green-400'
                                      : isPartiallyPaid
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {isPaid 
                                      ? '✓ Zapłacono' 
                                      : isPartiallyPaid 
                                      ? `Częściowo (${paidAmount.toFixed(2)} zł / ${totalPrice.toFixed(2)} zł)`
                                      : '❌ Niezapłacone'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Akcje */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-[var(--border-color)]">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEditCustomer(selectedCustomer)
                  }}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleDeleteCustomer(selectedCustomer.id)
                  }}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Usuń
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] rounded-lg transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      

      {/* Modal edycji klienta */}
      
        {showEditModal && selectedCustomer && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-2xl w-full max-h-[calc(100vh-120px)] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Edytuj klienta</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Formularz */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Imię
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  />
                </div>

                {/* Flagi klienta */}
                <div className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Flagi klienta
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isBlocked}
                        onChange={(e) => setEditForm({ ...editForm, isBlocked: e.target.checked })}
                        className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)] text-red-500 focus:ring-red-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-red-400">Zablokowany</span>
                        <p className="text-xs text-[var(--text-muted)]/70">Nie może dokonywać rezerwacji</p>
                      </div>
                    </label>
                    
                    {selectedCustomer && (selectedCustomer.noShowCount || 0) > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg">
                        <UserX className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-500">
                          Nieobecności: {selectedCustomer.noShowCount || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Notatki
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] resize-none"
                    placeholder="Dodatkowe informacje o kliencie (np. nie przyszedł 2x, nie powiadomił)..."
                  />
                </div>
              </div>

              {/* Akcje */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Zapisz zmiany
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal sprzedaży karnetu */}
      {showSellPassModal && selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-md w-full max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Sprzedaj karnet</h2>
              <button
                onClick={() => setShowSellPassModal(false)}
                className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[var(--text-muted)] mb-2">Klient:</p>
              <p className="font-bold text-[var(--text-primary)]">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Wybierz typ karnetu
              </label>
              {passTypes.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  Brak dostępnych karnetów. <Link href="/dashboard/passes" className="text-purple-400 hover:underline">Utwórz typ karnetu</Link>
                </p>
              ) : (
                <select
                  value={selectedPassType}
                  onChange={(e) => setSelectedPassType(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                >
                  <option value="">Wybierz...</option>
                  {passTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {Number(type.price).toFixed(2)} zł ({type.passKind === 'VISITS' ? `${type.visitsCount} wizyt` : `${type.validityDays} dni`})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSellPassModal(false)}
                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Anuluj
              </button>
              <button
                onClick={handleSellPass}
                disabled={!selectedPassType}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sprzedaj karnet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal dodawania klienta */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-lg w-full max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Dodaj klienta</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Formularz */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Imię <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    placeholder="Jan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Nazwisko <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    placeholder="Kowalski"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Telefon <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  placeholder="500 123 456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                  placeholder="jan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Notatki
                </label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] resize-none"
                  placeholder="Dodatkowe informacje..."
                />
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={addLoading}
                className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {addLoading ? 'Dodawanie...' : 'Dodaj klienta'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
