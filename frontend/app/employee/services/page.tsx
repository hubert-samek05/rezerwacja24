'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Scissors, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { getApiUrl } from '@/lib/api-url'

const API_URL = getApiUrl()

interface Service {
  id: string
  name: string
  description?: string
  duration: number
  basePrice: number
  isActive: boolean
  categoryName?: string
}

interface UserData {
  tenantId: string
  permissions?: {
    canViewServices?: boolean
  }
}

export default function EmployeeServicesPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('employee_user') || localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsed = JSON.parse(userData)
      if (!parsed.permissions?.canViewServices) {
        router.push('/employee')
        return
      }
      setUser(parsed)
    } catch {
      router.push('/login')
    }
  }, [router])

  const loadData = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${API_URL}/api/services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.tenantId,
        }
      })

      setServices(response.data || [])
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Błąd ładowania usług')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Usługi</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Lista dostępnych usług</p>
        </div>
        
        <button 
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Szukaj usługi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
          <Scissors className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-muted)]">Brak usług</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-[var(--text-primary)]">{service.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  service.isActive 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {service.isActive ? 'Aktywna' : 'Nieaktywna'}
                </span>
              </div>
              
              {service.description && (
                <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{service.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                  {Number(service.basePrice).toFixed(0)} zł
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
