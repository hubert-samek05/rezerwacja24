'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'

interface PlatformStats {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalUsers: number
  activeSubscriptions: number
  trialSubscriptions: number
  pastDueSubscriptions: number
  monthlyRevenue: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Użyj danych demo jeśli API nie istnieje
        setStats({
          totalTenants: 0,
          activeTenants: 0,
          suspendedTenants: 0,
          totalUsers: 0,
          activeSubscriptions: 0,
          trialSubscriptions: 0,
          pastDueSubscriptions: 0,
          monthlyRevenue: 0,
          totalRevenue: 0,
        })
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      // Użyj danych demo
      setStats({
        totalTenants: 0,
        activeTenants: 0,
        suspendedTenants: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        pastDueSubscriptions: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Wszystkie Firmy',
      value: stats?.totalTenants || 0,
      icon: Building2,
      color: 'bg-blue-500',
      description: `${stats?.activeTenants || 0} aktywnych, ${stats?.suspendedTenants || 0} zawieszonych`
    },
    {
      title: 'Użytkownicy',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-green-500',
      description: 'Wszystkich użytkowników'
    },
    {
      title: 'Aktywne Subskrypcje',
      value: stats?.activeSubscriptions || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      description: 'Płacących klientów'
    },
    {
      title: 'W Okresie Próbnym',
      value: stats?.trialSubscriptions || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      description: '7-dniowy trial'
    },
    {
      title: 'Zaległe Płatności',
      value: stats?.pastDueSubscriptions || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Wymaga uwagi'
    },
    {
      title: 'Przychód Miesięczny',
      value: `${(stats?.monthlyRevenue || 0).toFixed(2)} zł`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: 'MRR'
    },
    {
      title: 'Przychód Całkowity',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} zł`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      description: 'Od początku'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Panel Administratora</h1>
        <p className="text-gray-400">Zarządzaj całą platformą Rezerwacja24</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
              <p className="text-gray-500 text-xs">{card.description}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Szybkie Akcje</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/tenants" className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-white">Zarządzaj Firmami</span>
          </a>
          <a href="/admin/subscriptions" className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <CreditCard className="w-5 h-5 text-green-400" />
            <span className="text-white">Zarządzaj Subskrypcjami</span>
          </a>
          <a href="/admin/users" className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-white">Zarządzaj Użytkownikami</span>
          </a>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Ostatnia Aktywność</h2>
        <div className="text-gray-400 text-center py-8">
          <p>Brak ostatniej aktywności do wyświetlenia.</p>
          <p className="text-sm mt-2">Aktywność pojawi się gdy użytkownicy zaczną korzystać z platformy.</p>
        </div>
      </div>
    </div>
  )
}
