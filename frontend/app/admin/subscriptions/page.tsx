'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Search, 
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface Subscription {
  id: string
  status: string
  trialEnd: string | null
  trialStart: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  stripeSubscriptionId: string | null
  stripePaymentMethodId: string | null
  lastPaymentStatus: string | null
  lastPaymentError: string | null
  tenants: {
    id: string
    name: string
    email: string
  }
  subscription_plans: {
    name: string
    priceMonthly: number
  } | null
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<string>('all')
  const [cardFilter, setCardFilter] = useState<string>('all')

  useEffect(() => {
    fetchSubscriptions()
  }, [page])

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/admin/subscriptions?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSubscriptions(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktywna
          </span>
        )
      case 'TRIALING':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
            <Clock className="w-3 h-3 mr-1" />
            Trial
          </span>
        )
      case 'PAST_DUE':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Zaległa płatność
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Anulowana
          </span>
        )
      case 'INCOMPLETE':
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Niekompletna
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
            {status}
          </span>
        )
    }
  }

  const getTrialDaysRemaining = (trialEnd: string | null) => {
    if (!trialEnd) return null
    const end = new Date(trialEnd)
    const now = new Date()
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch = s.tenants.name.toLowerCase().includes(search.toLowerCase()) ||
      s.tenants.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = filter === 'all' || s.status === filter
    
    const matchesCard = cardFilter === 'all' || 
      (cardFilter === 'with_card' && s.stripePaymentMethodId) ||
      (cardFilter === 'without_card' && !s.stripePaymentMethodId)
    
    return matchesSearch && matchesStatus && matchesCard
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subskrypcje</h1>
        <p className="text-gray-400">Zarządzaj wszystkimi subskrypcjami na platformie</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Szukaj po nazwie firmy lub email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="ACTIVE">Aktywne</option>
          <option value="TRIALING">Trial</option>
          <option value="PAST_DUE">Zaległa płatność</option>
          <option value="CANCELLED">Anulowane</option>
        </select>
        <select
          value={cardFilter}
          onChange={(e) => setCardFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">Wszystkie (karta)</option>
          <option value="with_card">Z kartą</option>
          <option value="without_card">Bez karty</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{subscriptions.length}</div>
          <div className="text-gray-400 text-sm">Wszystkie</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{subscriptions.filter(s => s.status === 'ACTIVE').length}</div>
          <div className="text-gray-400 text-sm">Aktywne</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{subscriptions.filter(s => s.status === 'TRIALING').length}</div>
          <div className="text-gray-400 text-sm">Trial</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">{subscriptions.filter(s => s.status === 'PAST_DUE').length}</div>
          <div className="text-gray-400 text-sm">Zaległe</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{subscriptions.filter(s => s.stripePaymentMethodId).length}</div>
          <div className="text-gray-400 text-sm flex items-center"><CreditCard className="w-3 h-3 mr-1" /> Z kartą</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-red-400">{subscriptions.filter(s => !s.stripePaymentMethodId).length}</div>
          <div className="text-gray-400 text-sm flex items-center"><XCircle className="w-3 h-3 mr-1" /> Bez karty</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Firma</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trial</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Karta</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ostatnia płatność</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Okres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSubscriptions.map((subscription) => {
                const trialDays = getTrialDaysRemaining(subscription.trialEnd)
                return (
                <tr key={subscription.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{subscription.tenants.name}</div>
                        <div className="text-gray-400 text-sm">{subscription.tenants.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-white">
                      {subscription.subscription_plans?.name || 'Brak planu'}
                    </div>
                    {subscription.subscription_plans && (
                      <div className="text-gray-400 text-sm">
                        {Number(subscription.subscription_plans.priceMonthly).toFixed(2)} zł/mies.
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(subscription.status)}
                    {subscription.cancelAtPeriodEnd && (
                      <div className="text-xs text-yellow-400 mt-1">Anuluje się</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {subscription.status === 'TRIALING' && trialDays !== null ? (
                      <div className={`text-sm font-medium ${trialDays <= 3 ? 'text-red-400' : trialDays <= 5 ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {trialDays > 0 ? `${trialDays} dni` : 'Wygasł'}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {subscription.stripePaymentMethodId ? (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                        <CreditCard className="w-3 h-3 mr-1" />
                        Tak
                      </span>
                    ) : (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                        <XCircle className="w-3 h-3 mr-1" />
                        Brak
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {subscription.lastPaymentStatus === 'paid' ? (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        OK
                      </span>
                    ) : subscription.lastPaymentStatus === 'failed' ? (
                      <div>
                        <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3 mr-1" />
                          Nieudana
                        </span>
                        {subscription.lastPaymentError && (
                          <div className="text-xs text-red-400 mt-1 max-w-[150px] truncate" title={subscription.lastPaymentError}>
                            {subscription.lastPaymentError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-sm">
                    {subscription.status === 'TRIALING' && subscription.trialEnd ? (
                      <div>
                        <div className="text-xs">Trial do:</div>
                        <div className="text-white">{new Date(subscription.trialEnd).toLocaleDateString('pl-PL')}</div>
                      </div>
                    ) : subscription.currentPeriodEnd ? (
                      <div>
                        <div className="text-xs">Odnowienie:</div>
                        <div className="text-white">{new Date(subscription.currentPeriodEnd).toLocaleDateString('pl-PL')}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Poprzednia
            </button>
            <span className="text-gray-400">
              Strona {page} z {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Następna
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
