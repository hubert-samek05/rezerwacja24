'use client'

import { ReactNode, useState, useEffect, useCallback } from 'react'
import AuthCheck from './auth-check'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Calendar, Users, Clock, Settings, Bell, BarChart3, LogOut, TrendingUp,
  ChevronLeft, ChevronRight, Scissors, UserCog, FolderTree, X, Percent,
  ChevronDown, Sun, Moon, Home, LayoutGrid, Bug, Lightbulb, HelpCircle,
  Package, Ticket, UsersRound, User, Gift, Sparkles, MessageSquare
} from 'lucide-react'
import Image from 'next/image'
import NotificationsModal from '@/components/NotificationsModal'
import NotificationToast from '@/components/NotificationToast'
import SupportModal from '@/components/SupportModal'
import SubscriptionOnboardingModal from '@/components/SubscriptionOnboardingModal'
import TrialBanner from '@/components/TrialBanner'
// RequiredSubscriptionModal usunięty - przestarzały
import AccountSuspendedModal from '@/components/AccountSuspendedModal'
import Smartsupp from '@/components/Smartsupp'
import DashboardLanguageSwitcher from '@/components/DashboardLanguageSwitcher'
import { getUnreadCount, getNotifications, Notification } from '@/lib/notifications'
import { useSubscriptionOnboarding } from '@/hooks/useSubscriptionOnboarding'
// useRequireSubscription usunięty - przestarzały
import { useAccountStatus } from '@/hooks/useAccountStatus'
import { useTheme } from '@/hooks/useTheme'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'
import { useProfileSetup } from '@/hooks/useProfileSetup'
import { usePermissions } from '@/hooks/usePermissions'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { usePlatform } from '@/hooks/usePlatform'
import ProfileSetupWizard from '@/components/ProfileSetupWizard'
import { Crown } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  // Sidebar is now fixed width, no collapse functionality needed
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [supportModal, setSupportModal] = useState<{ show: boolean; type: 'bug' | 'feature' | 'question' }>({ show: false, type: 'bug' })
  const [newNotification, setNewNotification] = useState<Notification | null>(null)
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null)
  const { shouldShow, markAsShown } = useSubscriptionOnboarding()
  // useRequireSubscription usunięty - przestarzały
  const { isSuspended, suspendedReason, subscriptionStatus, paymentError } = useAccountStatus()
  const { theme, toggleTheme, mounted } = useTheme()
  const { t, isClient: translationsReady, region } = useDashboardTranslation()
  const { showWizard: showProfileWizard, dismissWizard: dismissProfileWizard } = useProfileSetup()
  const { isOwner, isEmployee, canView, canManage, permissions } = usePermissions()
  const { isNative: isPushNative } = usePushNotifications() // Inicjalizuj push notifications
  const { hidePayments } = usePlatform() // Ukryj płatności na iOS (Apple App Store requirement)
  const [planInfo, setPlanInfo] = useState<{ name: string; daysLeft: number | null } | null>(null)

  // Funkcja do pobierania liczby nieprzeczytanych - wywoływana natychmiast
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [])

  // Funkcja do sprawdzania nowych powiadomień (dla toast)
  const checkNewNotifications = useCallback(async () => {
    try {
      const notifications = await getNotifications()
      if (!Array.isArray(notifications)) return
      
      const unread = notifications.filter(n => !n.read)
      setUnreadCount(unread.length)
      
      // Sprawdź czy jest nowe powiadomienie (dla toast)
      if (unread.length > 0) {
        const newestId = unread[0].id
        setLastNotificationId(prev => {
          if (prev !== null && prev !== newestId) {
            setNewNotification(unread[0])
          }
          return newestId
        })
      }
    } catch (error) {
      console.error('Error checking notifications:', error)
    }
  }, [])

  // Pobierz liczbę powiadomień natychmiast po załadowaniu
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  useEffect(() => {
    // Pobierz dane użytkownika
    const employeeUser = localStorage.getItem('employee_user')
    if (employeeUser) {
      try {
        const empData = JSON.parse(employeeUser)
        setUserName(empData.firstName || t.common.user)
        setUserRole(empData.role || 'EMPLOYEE')
      } catch (e) {
        console.error('Error parsing employee user:', e)
      }
    }
    
    const session = localStorage.getItem('rezerwacja24_session')
    if (session) {
      const data = JSON.parse(session)
      if (!employeeUser) {
        setUserName(data.firstName || t.common.user)
        setUserRole(data.role || null)
      }
      
      // Automatyczne odświeżanie co 15 sekund
      const interval = setInterval(checkNewNotifications, 15000)
      return () => clearInterval(interval)
    }
  }, [checkNewNotifications, t.common.user])

  useEffect(() => {
    fetchPlanInfo()
  }, [])

  const fetchPlanInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPlanInfo({ name: 'Pro', daysLeft: null })
        return
      }
      
      const response = await fetch('/api/billing/subscription', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.id && data.subscription_plans) {
          const endDate = new Date(data.currentPeriodEnd)
          const now = new Date()
          const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          let planName = data.subscription_plans.name || 'Pro'
          planName = planName.replace('Plan ', '')
          setPlanInfo({ name: planName, daysLeft: daysLeft <= 3 ? daysLeft : null })
        } else {
          setPlanInfo({ name: 'Pro', daysLeft: null })
        }
      } else {
        setPlanInfo({ name: 'Pro', daysLeft: null })
      }
    } catch (err) {
      setPlanInfo({ name: 'Pro', daysLeft: null })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('rezerwacja24_session')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tenantId')
    sessionStorage.clear()
    router.push('/login')
    setTimeout(() => { window.location.href = '/login' }, 100)
  }

  const handleStartTrial = () => {
    markAsShown()
    router.push('/dashboard/settings?tab=subscription')
  }

  // Funkcja sprawdzająca czy element menu jest dostępny (używa hooka usePermissions)
  const isMenuItemAllowed = (href: string): boolean => {
    if (isOwner) return true // Właściciel ma dostęp do wszystkiego
    
    // Mapowanie ścieżek na sekcje
    const sectionMap: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/dashboard/calendar': 'calendar',
      '/dashboard/bookings': 'bookings',
      '/dashboard/customers': 'customers',
      '/dashboard/services': 'services',
      '/dashboard/employees': 'employees',
      '/dashboard/categories': 'categories',
      '/dashboard/packages': 'packages',
      '/dashboard/passes': 'passes',
      '/dashboard/loyalty': 'loyalty',
      '/dashboard/group-bookings': 'group-bookings',
      '/dashboard/promotions': 'promotions',
      '/dashboard/analytics': 'analytics',
    }
    
    const section = sectionMap[href]
    if (!section) return false
    if (section === 'dashboard') return true // Dashboard zawsze dostępny
    
    return canView(section)
  }

  const allMenuItems = [
    { href: '/dashboard', icon: BarChart3, label: t.nav.dashboard },
    { href: '/dashboard/calendar', icon: Calendar, label: t.nav.calendar },
    { href: '/dashboard/bookings', icon: Clock, label: t.nav.bookings },
    { href: '/dashboard/customers', icon: Users, label: t.nav.customers },
    { href: '/dashboard/services', icon: Scissors, label: t.nav.services },
    { href: '/dashboard/employees', icon: UserCog, label: t.nav.employees },
    { href: '/dashboard/categories', icon: FolderTree, label: t.nav.categories },
    { href: '/dashboard/packages', icon: Package, label: t.nav.packages },
    { href: '/dashboard/passes', icon: Ticket, label: t.nav.passes },
    { href: '/dashboard/loyalty', icon: Gift, label: t.nav.loyalty || 'Lojalność' },
    { href: '/dashboard/group-bookings', icon: UsersRound, label: t.nav.groupBookings },
    { href: '/dashboard/promotions', icon: Percent, label: t.nav.promotions },
    { href: '/dashboard/analytics', icon: TrendingUp, label: t.nav.analytics }
  ]
  
  // Filtruj menu na podstawie uprawnień
  const menuItems = allMenuItems.filter(item => isMenuItemAllowed(item.href))

  // Filtruj mobilne menu na podstawie uprawnień
  const allMobileNavItems = [
    { href: '/dashboard', icon: Home, label: t.nav.start },
    { href: '/dashboard/calendar', icon: Calendar, label: t.nav.calendar },
    { href: '/dashboard/bookings', icon: Clock, label: t.nav.bookings },
    { href: '/dashboard/customers', icon: Users, label: t.nav.customers },
    { href: '#more', icon: LayoutGrid, label: t.nav.more, isMore: true }
  ]
  
  const mobileNavItems = allMobileNavItems.filter(item => 
    item.isMore || isMenuItemAllowed(item.href)
  )
  
  // Sprawdź czy pracownik ma dostęp do ustawień
  const canAccessSettings = isOwner || canView('settings')

  return (
    <AuthCheck>
      <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
        {/* Top Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo - use English logo for EU region */}
              <Link href="/dashboard" className="flex items-center">
                <Image 
                  src={region === 'eu' ? '/logo-en.png' : '/logo.png'} 
                  alt={region === 'eu' ? 'Bookings24' : 'Rezerwacja24'} 
                  width={180} 
                  height={40} 
                  className="h-8 w-auto"
                  priority
                />
              </Link>
              
              {/* Right Actions */}
              <div className="flex items-center gap-1">
                {/* Plan Info */}
                {planInfo && (
                  <Link
                    href="/dashboard/settings?tab=subscription"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400 hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-200"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{planInfo.name}</span>
                  </Link>
                )}

                {/* Language Switcher */}
                <DashboardLanguageSwitcher />

                {/* Feedback Button */}
                <button 
                  onClick={() => setSupportModal({ show: true, type: 'feature' })}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 border border-[var(--border-color)]"
                  title={t.header.suggestFeature}
                >
                  <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-xs font-medium text-[var(--text-muted)]">Feedback</span>
                </button>

                {/* Theme Toggle */}
                {mounted && (
                  <button 
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                    title={theme === 'dark' ? t.header.lightMode : t.header.darkMode}
                  >
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-[var(--text-muted)]" /> : <Sun className="w-4 h-4 text-[var(--text-muted)]" />}
                  </button>
                )}
                
                {/* Notifications */}
                <button 
                  onClick={() => setNotificationsOpen(true)}
                  className="relative p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                >
                  <Bell className="w-4 h-4 text-[var(--text-muted)]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Settings - tylko dla właścicieli lub pracowników z uprawnieniami */}
                {canAccessSettings && (
                  <Link href="/dashboard/settings" className="hidden sm:flex p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200">
                    <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                  </Link>
                )}
                
                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-[var(--border-color)] mx-2" />
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[var(--text-primary)]">{userName}</span>
                    <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-[var(--border-color)] bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">{userName}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {isEmployee ? 'Panel pracownika' : t.header.businessPanel}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          {canAccessSettings && (
                            <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200">
                              <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-hover)] flex items-center justify-center">
                                <Settings className="w-4 h-4" />
                              </div>
                              <span>{t.nav.settings}</span>
                            </Link>
                          )}
                          <button onClick={() => { setUserMenuOpen(false); setSupportModal({ show: true, type: 'question' }) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-hover)] flex items-center justify-center">
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <span>{t.header.help}</span>
                          </button>
                        </div>
                        <div className="p-2 border-t border-[var(--border-color)]">
                          <button onClick={() => { setUserMenuOpen(false); handleLogout() }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{t.header.logout}</span>
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

        {/* Sidebar - Desktop - Dark theme with icons on top, text below */}
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
              href="/dashboard/settings"
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 group ${pathname?.startsWith('/dashboard/settings') ? 'bg-teal-500/10' : 'hover:bg-zinc-800'}`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl mb-1 transition-all duration-200 ${pathname?.startsWith('/dashboard/settings') ? 'bg-teal-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'}`}>
                <Settings className="w-[18px] h-[18px] flex-shrink-0" />
              </div>
              <span className={`text-[10px] text-center leading-tight ${pathname?.startsWith('/dashboard/settings') ? 'font-semibold text-teal-400' : 'font-medium text-zinc-400 group-hover:text-white'}`}>{t.nav.settings}</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Slide-out Menu */}
        <aside className={`fixed inset-y-0 left-0 w-80 bg-[var(--bg-card)] border-r border-[var(--border-color)] shadow-2xl transition-transform duration-300 z-[60] flex flex-col lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <Image 
              src={region === 'eu' ? '/logo-en.png' : '/logo.png'} 
              alt={region === 'eu' ? 'Bookings24' : 'Rezerwacja24'} 
              width={140} 
              height={32} 
              className="h-7 w-auto"
            />
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
            <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-hover)] flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-sm">{t.nav.settings}</span>
            </Link>
            <button onClick={() => { setMobileMenuOpen(false); handleLogout() }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.header.logout}</span>
            </button>
          </div>
        </aside>

        {/* Main Content - pb-24 zapewnia miejsce dla dolnego menu (80px menu + 16px zapas) */}
        <main className="pt-16 pb-24 lg:pb-0 lg:ml-20 transition-all duration-300">
          <TrialBanner />
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
                <Link key={item.href} href={item.href} prefetch={true}  className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200 ${isActive ? 'text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg' : 'text-[var(--text-muted)]'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
        
        {/* Modals */}
        <NotificationsModal isOpen={notificationsOpen} onClose={() => { setNotificationsOpen(false); checkNewNotifications() }} />
        <SupportModal isOpen={supportModal.show} type={supportModal.type} onClose={() => setSupportModal({ ...supportModal, show: false })} />
        {shouldShow && <SubscriptionOnboardingModal onClose={markAsShown} onStartTrial={handleStartTrial} />}
        {showProfileWizard && pathname === '/dashboard' && (
          <ProfileSetupWizard variant="modal" onClose={dismissProfileWizard} />
        )}
        {/* RequiredSubscriptionModal usunięty - przestarzały */}
        {/* Modal blokady - pokazuj ZAWSZE gdy konto zawieszone i nie jesteśmy na stronie ustawień */}
        <AccountSuspendedModal 
          isOpen={isSuspended && !pathname?.startsWith('/dashboard/settings')} 
          reason={suspendedReason || undefined}
          subscriptionStatus={subscriptionStatus || undefined}
        />
        
        {/* Notification Toast */}
        {newNotification && (
          <NotificationToast notification={newNotification} onClose={() => setNewNotification(null)} />
        )}

        <Smartsupp userRole={userRole} />
      </div>
    </AuthCheck>
  )
}
