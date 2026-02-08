'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Shield, Key, LogOut } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserData {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  tenantId: string
  tenant?: { name: string }
  permissions?: {
    canViewCalendar?: boolean
    canManageBookings?: boolean
    canViewCustomers?: boolean
    canViewServices?: boolean
    canViewAnalytics?: boolean
    onlyOwnCalendar?: boolean
    accountType?: string
  }
}

export default function EmployeeSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('employee_user') || localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      setUser(JSON.parse(userData))
    } catch {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('rezerwacja24_session')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('employee_user')
    localStorage.removeItem('tenantId')
    sessionStorage.clear()
    router.push('/login')
  }

  const getAccountTypeLabel = () => {
    const type = user?.permissions?.accountType
    switch (type) {
      case 'manager': return 'Menadżer'
      case 'receptionist': return 'Recepcja'
      case 'secretary': return 'Sekretariat'
      case 'accountant': return 'Księgowość'
      case 'assistant': return 'Asystent'
      default: return 'Pracownik'
    }
  }

  const getPermissionLabel = (key: string) => {
    const labels: Record<string, string> = {
      canViewCalendar: 'Podgląd kalendarza',
      canManageBookings: 'Zarządzanie rezerwacjami',
      canViewCustomers: 'Podgląd klientów',
      canViewServices: 'Podgląd usług',
      canViewAnalytics: 'Podgląd statystyk',
      onlyOwnCalendar: 'Tylko własny kalendarz',
    }
    return labels[key] || key
  }

  if (!user) return null

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Ustawienia</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Informacje o Twoim koncie</p>
      </div>

      {/* Profile Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-[var(--text-muted)]">{getAccountTypeLabel()} • {user.tenant?.name}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Email</p>
              <p className="font-medium text-[var(--text-primary)]">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                <Phone className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Telefon</p>
                <p className="font-medium text-[var(--text-primary)]">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-semibold text-[var(--text-primary)]">Twoje uprawnienia</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.permissions && Object.entries(user.permissions)
            .filter(([key]) => key !== 'accountType' && key !== 'onlyOwnBookings')
            .map(([key, value]) => (
              <div 
                key={key}
                className={`flex items-center gap-2 p-3 rounded-xl ${
                  value 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-[var(--bg-secondary)] border border-transparent'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${value ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <span className={`text-sm ${value ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                  {getPermissionLabel(key)}
                </span>
              </div>
            ))}
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-4">
          Uprawnienia są zarządzane przez administratora firmy. Skontaktuj się z nim, jeśli potrzebujesz zmian.
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Wyloguj się
      </button>
    </div>
  )
}
