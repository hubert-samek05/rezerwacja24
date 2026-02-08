'use client'

import { ReactNode, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Calendar, Users, Clock, Settings, Bell, BarChart3, LogOut,
  ChevronDown, Sun, Moon, Home, LayoutGrid, X, User, Scissors
} from 'lucide-react'
import Image from 'next/image'
import { Toaster } from 'react-hot-toast'
import { useTheme } from '@/hooks/useTheme'

interface UserData {
  id?: string
  firstName: string
  lastName: string
  email: string
  tenantId: string
  employeeId?: string
  tenant?: { name: string; logo?: string }
  permissions?: {
    canViewCalendar?: boolean
    canManageBookings?: boolean
    canViewCustomers?: boolean
    canViewServices?: boolean
    canViewEmployees?: boolean
    canViewAnalytics?: boolean
    canViewSettings?: boolean
    onlyOwnCalendar?: boolean
    onlyOwnBookings?: boolean
    accountType?: string
  }
}

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { theme, toggleTheme, mounted } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('employee_user') || localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsed = JSON.parse(userData)
      if (parsed.role !== 'EMPLOYEE' && parsed.type !== 'employee' && !parsed.employeeId) {
        router.push('/dashboard')
        return
      }
      setUser(parsed)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
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

  // Menu items based on permissions
  const getMenuItems = () => {
    if (!user) return []
    const perms = user.permissions || {}
    
    const items = [
      { href: '/employee', icon: BarChart3, label: 'Panel', show: true },
      { href: '/employee/calendar', icon: Calendar, label: 'Kalendarz', show: perms.canViewCalendar !== false },
      { href: '/employee/bookings', icon: Clock, label: 'Rezerwacje', show: perms.canManageBookings !== false },
      { href: '/employee/customers', icon: Users, label: 'Klienci', show: perms.canViewCustomers === true },
      { href: '/employee/services', icon: Scissors, label: 'Usługi', show: perms.canViewServices === true },
      { href: '/employee/analytics', icon: BarChart3, label: 'Statystyki', show: perms.canViewAnalytics === true },
    ]
    
    return items.filter(item => item.show)
  }

  const menuItems = getMenuItems()

  const mobileNavItems = [
    { href: '/employee', icon: Home, label: 'Start' },
    { href: '/employee/calendar', icon: Calendar, label: 'Kalendarz' },
    { href: '/employee/bookings', icon: Clock, label: 'Rezerwacje' },
    { href: '#more', icon: LayoutGrid, label: 'Więcej', isMore: true }
  ]

  // Get account type label
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      <Toaster position="top-center" />
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Company Name */}
            <Link href="/employee" className="flex items-center gap-3">
              {user.tenant?.logo ? (
                <Image src={user.tenant.logo} alt={user.tenant?.name || ''} width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.tenant?.name?.[0] || 'R'}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="font-semibold text-[var(--text-primary)] text-sm">{user.tenant?.name || 'Rezerwacja24'}</p>
                <p className="text-xs text-[var(--text-muted)]">{getAccountTypeLabel()}</p>
              </div>
            </Link>
            
            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              {mounted && (
                <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                  title={theme === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-[var(--text-muted)]" /> : <Sun className="w-4 h-4 text-[var(--text-muted)]" />}
                </button>
              )}
              
              {/* Settings */}
              <Link href="/employee/settings" className="hidden sm:flex p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200">
                <Settings className="w-4 h-4 text-[var(--text-muted)]" />
              </Link>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-[var(--border-color)] mx-2" />
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[var(--text-primary)]">{user.firstName}</span>
                  <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-[var(--border-color)] bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-[var(--text-muted)]">{getAccountTypeLabel()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link href="/employee/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-hover)] flex items-center justify-center">
                            <Settings className="w-4 h-4" />
                          </div>
                          <span>Ustawienia</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-[var(--border-color)]">
                        <button onClick={() => { setUserMenuOpen(false); handleLogout() }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all duration-200">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span className="font-medium">Wyloguj się</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-zinc-900 border-r border-zinc-800 transition-all duration-300 z-40 flex-col hidden lg:flex w-20">
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 group ${isActive ? 'bg-teal-500/10' : 'hover:bg-zinc-800'}`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl mb-1 transition-all duration-200 ${isActive ? 'bg-teal-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'}`}>
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${isActive ? 'font-semibold text-teal-400' : 'font-medium text-zinc-400 group-hover:text-white'}`}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
        
        <div className="border-t border-zinc-800 p-2">
          <Link
            href="/employee/settings"
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 group ${pathname?.startsWith('/employee/settings') ? 'bg-teal-500/10' : 'hover:bg-zinc-800'}`}
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl mb-1 transition-all duration-200 ${pathname?.startsWith('/employee/settings') ? 'bg-teal-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'}`}>
              <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            </div>
            <span className={`text-[10px] text-center leading-tight ${pathname?.startsWith('/employee/settings') ? 'font-semibold text-teal-400' : 'font-medium text-zinc-400 group-hover:text-white'}`}>Ustawienia</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Slide-out Menu */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-[var(--bg-card)] border-r border-[var(--border-color)] shadow-2xl transition-transform duration-300 z-[60] flex flex-col lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            {user.tenant?.logo ? (
              <Image src={user.tenant.logo} alt="" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                {user.tenant?.name?.[0] || 'R'}
              </div>
            )}
            <span className="font-semibold text-[var(--text-primary)]">{user.tenant?.name}</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-all duration-200">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>
        
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} prefetch={true} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-[var(--bg-primary)]'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
        
        <div className="p-3 border-t border-[var(--border-color)] space-y-1">
          <Link href="/employee/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-all duration-200">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-hover)] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-sm">Ustawienia</span>
          </Link>
          <button onClick={() => { setMobileMenuOpen(false); handleLogout() }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Wyloguj się</span>
          </button>
        </div>
      </aside>

      {/* Main Content - pb-24 zapewnia miejsce dla dolnego menu (80px menu + 16px zapas) */}
      <main className="pt-16 pb-24 lg:pb-0 lg:ml-20 transition-all duration-300">
        <div className="min-h-[calc(100vh-4rem)]">{children}</div>
      </main>

      {/* Mobile Bottom Navigation - fixed, ale z pełnym białym tłem (bez przezroczystości) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[var(--bg-card)] border-t border-[var(--border-color)] safe-bottom">
        <div className="flex items-center justify-around px-2 py-3">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            if (item.isMore) {
              return (
                <button key="more" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200 ${mobileMenuOpen ? 'text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg' : 'text-[var(--text-muted)]'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </button>
              )
            }
            return (
              <Link key={item.href} href={item.href} prefetch={true} className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200 ${isActive ? 'text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg' : 'text-[var(--text-muted)]'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
