'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  MoreVertical,
  Ban,
  CheckCircle,
  Eye,
  Users,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Briefcase,
  CalendarCheck
} from 'lucide-react'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string | null
  subdomain: string
  isSuspended: boolean
  suspendedReason: string | null
  createdAt: string
  isOnline: boolean
  lastActivity: string | null
  smsUsed: number
  smsLimit: number
  smsBalance: number
  subscriptions: {
    status: string
    trialEnd: string | null
    currentPeriodEnd: string | null
  } | null
  _count: {
    tenant_users: number
    customers: number
    employees: number
    bookings: number
  }
}

// Formatowanie "ostatnio widziany"
const formatLastSeen = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Przed chwilą'
  if (diffMins < 5) return 'Teraz online'
  if (diffMins < 60) return `${diffMins} min temu`
  if (diffHours < 24) return `${diffHours} godz. temu`
  if (diffDays === 1) return 'Wczoraj'
  if (diffDays < 7) return `${diffDays} dni temu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`
  return `${Math.floor(diffDays / 30)} mies. temu`
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchTenants()
    
    // Auto-refresh co 15 sekund dla statusu online
    const interval = setInterval(() => {
      fetchTenants()
    }, 15000)
    
    return () => clearInterval(interval)
  }, [page])

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/admin/tenants?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTenants(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (tenantId: string) => {
    const reason = prompt('Podaj powód zawieszenia:')
    if (!reason) return

    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/admin/tenants/${tenantId}/suspend`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        fetchTenants()
        setActionMenuOpen(null)
      }
    } catch (error) {
      console.error('Error suspending tenant:', error)
    }
  }

  const handleUnsuspend = async (tenantId: string) => {
    if (!confirm('Czy na pewno chcesz odblokować tę firmę?')) return

    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/admin/tenants/${tenantId}/unsuspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        fetchTenants()
        setActionMenuOpen(null)
      }
    } catch (error) {
      console.error('Error unsuspending tenant:', error)
    }
  }

  const getStatusBadge = (tenant: Tenant) => {
    if (tenant.isSuspended) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Zawieszona</span>
    }
    if (!tenant.subscriptions) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">Brak subskrypcji</span>
    }
    switch (tenant.subscriptions.status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Aktywna</span>
      case 'TRIALING':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Trial</span>
      case 'PAST_DUE':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Zaległa płatność</span>
      case 'CANCELLED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Anulowana</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">{tenant.subscriptions.status}</span>
    }
  }

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(search.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-white mb-2">Klienci (Firmy)</h1>
        <p className="text-gray-400">Zarządzaj wszystkimi firmami na platformie</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Szukaj po nazwie, email lub subdomenie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Firma</th>
                <th className="px-3 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ostatnio</th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subskrypcja</th>
                <th className="px-3 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Klienci</th>
                <th className="px-3 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Rezerwacje</th>
                <th className="px-3 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Pracownicy</th>
                <th className="px-3 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">SMS</th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rejestracja</th>
                <th className="px-3 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{tenant.name}</div>
                        <div className="text-gray-400 text-sm">{tenant.email}</div>
                        <div className="text-gray-500 text-xs">{tenant.subdomain}.rezerwacja24.pl</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    {(() => {
                      // Sprawdź czy użytkownik jest online na podstawie lastActivity (< 5 min)
                      const isRecentlyActive = tenant.lastActivity && 
                        (Date.now() - new Date(tenant.lastActivity).getTime()) < 5 * 60 * 1000
                      const isOnline = tenant.isOnline || isRecentlyActive
                      return (
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-3 py-4">
                    {tenant.lastActivity ? (
                      <div>
                        <div className="text-gray-300 text-sm">
                          {formatLastSeen(tenant.lastActivity)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Nigdy</span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {getStatusBadge(tenant)}
                    {tenant.isSuspended && tenant.suspendedReason && (
                      <div className="text-xs text-red-400 mt-1 max-w-[100px] truncate" title={tenant.suspendedReason}>{tenant.suspendedReason}</div>
                    )}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center text-gray-300">
                      <Users className="w-4 h-4 mr-1.5 text-gray-500" />
                      <span className="font-medium">{tenant._count.customers}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center text-gray-300">
                      <CalendarCheck className="w-4 h-4 mr-1.5 text-blue-400" />
                      <span className="font-medium">{tenant._count.bookings || 0}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center text-gray-300">
                      <Briefcase className="w-4 h-4 mr-1.5 text-purple-400" />
                      <span className="font-medium">{tenant._count.employees || 0}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex flex-col items-center text-gray-300">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1.5 text-green-400" />
                        <span className="font-medium">{tenant.smsUsed || 0}</span>
                        <span className="text-gray-500 text-xs ml-1">/ {tenant.smsLimit || 500}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gray-400 text-sm">
                    {new Date(tenant.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === tenant.id ? null : tenant.id)}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      {actionMenuOpen === tenant.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10">
                          <a
                            href={`/admin/tenants/${tenant.id}`}
                            className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-600 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Szczegóły
                          </a>
                          {tenant.isSuspended ? (
                            <button
                              onClick={() => handleUnsuspend(tenant.id)}
                              className="flex items-center w-full px-4 py-2 text-green-400 hover:bg-gray-600 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Odblokuj
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(tenant.id)}
                              className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-600 transition-colors"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Zawieś
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
