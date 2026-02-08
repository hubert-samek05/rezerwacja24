'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { getCustomers, getBookings, updateCustomer, deleteCustomer, type Customer } from '@/lib/storage'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getTenantConfig } from '@/lib/tenant'
import { getApiUrl } from '@/lib/api-url'
const API_URL = getApiUrl()

type SortField = 'name' | 'totalVisits' | 'totalSpent' | 'lastVisit' | 'debt'
type SortOrder = 'asc' | 'desc'

export default function CustomersPage() {
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

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [customers, searchQuery, filterStatus, sortField, sortOrder])

  const loadData = async () => {
    try {
      const config = {
        ...getTenantConfig()
      }

      const [customersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/customers`, config),
        axios.get(`${API_URL}/api/bookings`, config)
      ])

      const customersData = customersRes.data || []
      const bookingsData = bookingsRes.data || []

      // Przelicz statystyki dla każdego klienta na podstawie rezerwacji
      const customersWithStats = customersData.map((customer: Customer) => {
        const customerBookings = bookingsData.filter((b: any) => b.customerId === customer.id)
        const completedBookings = customerBookings.filter((b: any) => 
          b.status === 'CONFIRMED' || b.status === 'COMPLETED'
        )
        
        const totalSpent = completedBookings.reduce((sum: number, b: any) => 
          sum + (parseFloat(b.totalPrice) || parseFloat(b.basePrice) || 0), 0
        )
        
        const lastBooking = customerBookings.length > 0 
          ? customerBookings.sort((a: any, b: any) => 
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            )[0]
          : null

        return {
          ...customer,
          totalBookings: customerBookings.length,
          totalVisits: completedBookings.length,
          totalSpent: Math.round(totalSpent),
          lastVisit: lastBooking ? new Date(lastBooking.startTime).toISOString() : undefined
        }
      })

      setCustomers(customersWithStats)
      setBookings(bookingsData)
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      toast.error('Nie udało się załadować klientów')
      // Fallback do localStorage
      setCustomers(getCustomers())
      setBookings(getBookings())
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

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      deleteCustomer(customerId)
      loadData()
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

  // Stats
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter(c => {
      const created = new Date(c.createdAt || Date.now())
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    active: customers.filter(c => !c.isBlocked).length,
    avgSpent: customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length) : 0,
    totalDebt: customers.reduce((sum, c) => sum + calculateCustomerDebt(c.id), 0)
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
        toast.success('Dane klienta zostały zaktualizowane')
        await loadData()
        setShowEditModal(false)
        setSelectedCustomer(null)
      } catch (error) {
        console.error('Error updating customer:', error)
        toast.error('Błąd podczas aktualizacji danych klienta')
      }
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">Baza klientów</h1>
              <p className="text-sm sm:text-base text-neutral-gray/70 truncate">Zarządzaj klientami</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleExport}
                className="p-2 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-neutral-gray hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Eksportuj CSV</span>
              </button>
              <Link href="/dashboard/customers/new" className="btn-neon flex items-center gap-1.5 sm:space-x-2 text-sm sm:text-base px-3 py-2 sm:px-4">
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Dodaj klienta</span>
                <span className="xs:hidden">Dodaj</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-gray/70">Wszyscy klienci</span>
                <Users className="w-5 h-5 text-accent-neon" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-gray/70">Nowi (ten miesiąc)</span>
                <Plus className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.newThisMonth}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-gray/70">Aktywni</span>
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-gray/70">Średnia wartość</span>
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.avgSpent} zł</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-gray/70">Łączny dług</span>
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-400">{stats.totalDebt} zł</p>
              <p className="text-xs text-neutral-gray/70 mt-1">
                {customers.filter(c => calculateCustomerDebt(c.id) > 0).length} klientów
              </p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="glass-card p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-gray/50" />
                <input
                  type="text"
                  placeholder="Szukaj klienta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-neutral-gray focus:outline-none focus:border-accent-neon"
                >
                  <option value="all">Wszyscy</option>
                  <option value="active">Aktywni</option>
                  <option value="vip">VIP</option>
                  <option value="blocked">Zablokowani</option>
                </select>

                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-gray" />
                </button>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        Klient
                        {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray">Kontakt</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white" onClick={() => handleSort('totalVisits')}>
                      <div className="flex items-center gap-2">
                        Wizyty
                        {sortField === 'totalVisits' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray">Ostatnia wizyta</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white" onClick={() => handleSort('totalSpent')}>
                      <div className="flex items-center gap-2">
                        Wydano
                        {sortField === 'totalSpent' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray cursor-pointer hover:text-white" onClick={() => handleSort('debt')}>
                      <div className="flex items-center gap-2">
                        Dług
                        {sortField === 'debt' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-gray">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <AlertCircle className="w-12 h-12 text-neutral-gray/50" />
                          <p className="text-neutral-gray">Brak klientów</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-carbon-black">{customer.firstName[0]}{customer.lastName[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{customer.firstName} {customer.lastName}</p>
                            <p className="text-xs text-neutral-gray/70">ID: {customer.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-neutral-gray/70">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-neutral-gray/70">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{customer.totalVisits || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-neutral-gray/70 text-sm">{getLastVisit(customer.id)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{customer.totalSpent || 0} zł</span>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const debt = calculateCustomerDebt(customer.id)
                          return debt > 0 ? (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-bold">
                                {debt} zł
                              </span>
                            </div>
                          ) : (
                            <span className="text-accent-neon text-sm font-medium">
                              0 zł
                            </span>
                          )
                        })()}
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
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Szczegóły"
                          >
                            <Eye className="w-4 h-4 text-neutral-gray" />
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
                    </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-sm text-neutral-gray/70">
                  Pokazano {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} z {filteredCustomers.length} klientów
                </p>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            ? 'bg-accent-neon text-carbon-black font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-neutral-gray'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  {totalPages > 5 && <span className="text-neutral-gray">...</span>}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <AnimatePresence>
        {showDetailsModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Szczegóły klienta</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-gray" />
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
                    <h3 className="text-xl font-bold text-white">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <p className="text-sm text-neutral-gray/70">ID: {selectedCustomer.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-neutral-gray">
                    <Mail className="w-4 h-4" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-gray">
                    <Phone className="w-4 h-4" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-gray">
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
                <div className="glass-card p-4">
                  <p className="text-xs text-neutral-gray/70 mb-1">Wizyty</p>
                  <p className="text-2xl font-bold text-white">{selectedCustomer.totalVisits || 0}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-neutral-gray/70 mb-1">Wydano</p>
                  <p className="text-2xl font-bold text-white">{selectedCustomer.totalSpent || 0} zł</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-neutral-gray/70 mb-1">Średnia wizyta</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedCustomer.totalVisits && selectedCustomer.totalVisits > 0 
                      ? Math.round((selectedCustomer.totalSpent || 0) / selectedCustomer.totalVisits)
                      : 0} zł
                  </p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-neutral-gray/70 mb-1">Dług</p>
                  <p className={`text-2xl font-bold ${calculateCustomerDebt(selectedCustomer.id) > 0 ? 'text-red-400' : 'text-accent-neon'}`}>
                    {calculateCustomerDebt(selectedCustomer.id)} zł
                  </p>
                </div>
              </div>

              {/* Historia wizyt */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Historia wizyt</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-gray">Data</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-gray">Usługa</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-gray">Cena</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-gray">Płatność</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCustomerBookings(selectedCustomer.id).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-neutral-gray">
                            Brak wizyt
                          </td>
                        </tr>
                      ) : (
                        getCustomerBookings(selectedCustomer.id)
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
                                <td className="px-4 py-3 text-sm text-neutral-gray">
                                  {bookingDate.toLocaleDateString('pl-PL', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-4 py-3 text-sm text-white">{serviceName}</td>
                                <td className="px-4 py-3 text-sm text-white">{totalPrice.toFixed(2)} zł</td>
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
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
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
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-gray rounded-lg transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal edycji klienta */}
      <AnimatePresence>
        {showEditModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edytuj klienta</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-gray" />
                </button>
              </div>

              {/* Formularz */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Imię
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isBlocked}
                      onChange={(e) => setEditForm({ ...editForm, isBlocked: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
                    />
                    <span className="text-sm font-medium text-neutral-gray">
                      Zablokuj klienta
                    </span>
                  </label>
                  <p className="text-xs text-neutral-gray/70 mt-1">
                    Zablokowany klient nie będzie mógł dokonywać rezerwacji
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Notatki
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon resize-none"
                    placeholder="Dodatkowe informacje o kliencie..."
                  />
                </div>
              </div>

              {/* Akcje */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-gray rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 btn-neon"
                >
                  Zapisz zmiany
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
