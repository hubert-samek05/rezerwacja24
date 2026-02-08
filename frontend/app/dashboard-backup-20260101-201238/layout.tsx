'use client'

import { ReactNode, useState, useEffect } from 'react'
import AuthCheck from './auth-check'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  Clock,
  Settings,
  Bell,
  BarChart3,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Scissors,
  UserCog,
  FolderTree,
  Menu,
  X,
  Percent,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import NotificationsModal from '@/components/NotificationsModal'
import SubscriptionOnboardingModal from '@/components/SubscriptionOnboardingModal'
import TrialBanner from '@/components/TrialBanner'
import RequiredSubscriptionModal from '@/components/RequiredSubscriptionModal'
import AccountSuspendedModal from '@/components/AccountSuspendedModal'
import Smartsupp from '@/components/Smartsupp'
import { getUnreadCount } from '@/lib/notifications'
import { useSubscriptionOnboarding } from '@/hooks/useSubscriptionOnboarding'
import useRequireSubscription from '@/hooks/useRequireSubscription'
import { useAccountStatus } from '@/hooks/useAccountStatus'
import { useRouter as useNextRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('Użytkownik')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { shouldShow, markAsShown } = useSubscriptionOnboarding()
  const { hasSubscription, loading: subscriptionLoading, showModal: showRequiredModal } = useRequireSubscription()
  const { isSuspended, suspendedReason } = useAccountStatus()

  useEffect(() => {
    const session = localStorage.getItem('rezerwacja24_session')
    if (session) {
      const data = JSON.parse(session)
      setUserName(data.firstName || 'Użytkownik')
      
      // Pobierz liczbę nieprzeczytanych od razu
      updateUnreadCount()
      
      // Automatyczne odświeżanie co 30 sekund
      const interval = setInterval(updateUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [])
  
  const updateUnreadCount = async () => {
    const count = await getUnreadCount()
    setUnreadCount(count)
  }
  
  const handleNotificationsOpen = () => {
    setNotificationsOpen(true)
    // Odśwież licznik po otwarciu
    setTimeout(updateUnreadCount, 500)
  }

  const handleLogout = () => {
    // Usuń WSZYSTKIE dane sesji
    localStorage.removeItem('rezerwacja24_session')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tenantId')
    
    // Wyczyść wszystkie dane cache
    sessionStorage.clear()
    
    // Przekieruj do logowania
    router.push('/login')
    
    // Force reload aby wyczyścić stan aplikacji
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }

  const handleStartTrial = () => {
    markAsShown()
    router.push('/dashboard/settings/subscription')
  }

  const menuItems = [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Kalendarz' },
    { href: '/dashboard/bookings', icon: Clock, label: 'Rezerwacje' },
    { href: '/dashboard/customers', icon: Users, label: 'Klienci' },
    { href: '/dashboard/services', icon: Scissors, label: 'Usługi' },
    { href: '/dashboard/employees', icon: UserCog, label: 'Pracownicy' },
    { href: '/dashboard/categories', icon: FolderTree, label: 'Kategorie' },
    { href: '/dashboard/promotions', icon: Percent, label: 'Promocje' },
    { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analityka' }
  ]

  return (
    <AuthCheck>
      <div className="min-h-screen bg-carbon-black">
        {/* Top Navigation */}
        <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-neutral-gray" />
                ) : (
                  <Menu className="w-6 h-6 text-neutral-gray" />
                )}
              </button>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-accent-neon" />
                <span className="text-lg sm:text-2xl font-bold text-white">Rezerwacja24</span>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button 
                  onClick={handleNotificationsOpen}
                  className="relative p-2 hover:bg-white/5 rounded-lg transition-colors hidden sm:block"
                >
                  <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-accent-neon' : 'text-neutral-gray'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent-neon text-carbon-black text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <Link href="/dashboard/settings" className="p-2 hover:bg-white/5 rounded-lg transition-colors hidden sm:block">
                  <Settings className="w-5 h-5 text-neutral-gray" />
                </Link>
                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 pl-2 sm:pl-4 border-l border-white/10 hover:bg-white/5 rounded-lg py-1 pr-2 transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-carbon-black">{userName[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-neutral-gray hidden md:block">{userName}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-gray transition-transform hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      {/* Overlay do zamykania */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-carbon-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white">{userName}</p>
                          <p className="text-xs text-neutral-gray">Panel biznesowy</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-gray hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm">Ustawienia</span>
                          </Link>
                          <Link
                            href="/dashboard/settings?tab=subscription"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-gray hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm">Subskrypcja</span>
                          </Link>
                        </div>
                        <div className="p-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false)
                              handleLogout()
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Wyloguj się</span>
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
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop & Mobile */}
        <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] glass-card border-r border-white/10 transition-all duration-300 ease-in-out z-40 flex flex-col
          lg:translate-x-0
          ${
            mobileMenuOpen 
              ? 'translate-x-0 w-64' 
              : '-translate-x-full w-64 lg:translate-x-0'
          }
          ${
            sidebarOpen ? 'lg:w-64' : 'lg:w-16'
          }
        `}>
          <nav className={`flex-1 p-4 space-y-2 overflow-y-auto transition-opacity duration-300 ${
            mobileMenuOpen || sidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:pointer-events-none'
          }`}>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-green/20 text-accent-neon shadow-lg shadow-primary-green/20'
                      : 'text-neutral-gray hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          
          {/* Toggle Button na dole - tylko desktop */}
          <div className="p-4 border-t border-white/10 hidden lg:block">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center justify-center p-3 rounded-lg bg-primary-green/10 hover:bg-primary-green/20 text-accent-neon transition-all duration-200 ${
                sidebarOpen ? '' : 'px-2'
              }`}
              title={sidebarOpen ? "Zwiń menu" : "Rozwiń menu"}
            >
              {sidebarOpen ? (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="ml-2 text-sm font-medium">Zwiń</span>
                </>
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-white/10 lg:hidden space-y-2">
            <Link 
              href="/dashboard/settings" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-gray hover:bg-white/5 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Ustawienia</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Wyloguj</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`pt-16 transition-all duration-300 ease-in-out
          lg:ml-64
          ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          }
        `}>
          <TrialBanner />
          {children}
        </main>
        
        {/* Notifications Modal */}
        <NotificationsModal 
          isOpen={notificationsOpen}
          onClose={() => {
            setNotificationsOpen(false)
            updateUnreadCount()
          }}
        />

        {/* Subscription Onboarding Modal */}
        {shouldShow && (
          <SubscriptionOnboardingModal
            onClose={markAsShown}
            onStartTrial={handleStartTrial}
          />
        )}

        {/* Required Subscription Modal - gdy brak subskrypcji */}
        <RequiredSubscriptionModal
          isOpen={showRequiredModal && !isSuspended}
        />

        {/* Account Suspended Modal - blokuje dostęp gdy konto zawieszone */}
        <AccountSuspendedModal
          isOpen={isSuspended}
          reason={suspendedReason || undefined}
        />

        {/* Smartsupp Live Chat - tylko dla zalogowanych w dashboard */}
        <Smartsupp />
      </div>
    </AuthCheck>
  )
}
