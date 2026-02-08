'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Bell,
  MessageSquare,
  Send
} from 'lucide-react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('Admin')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sprawdź czy użytkownik jest SUPER_ADMIN
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (!token || !userStr) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userStr)
        
        if (user.role !== 'SUPER_ADMIN') {
          // Nie jest adminem - przekieruj do dashboard
          router.push('/dashboard')
          return
        }

        setUserName(user.firstName || user.email || 'Admin')
        setIsAuthorized(true)
      } catch (error) {
        console.error('Admin auth error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.clear()
    router.push('/login')
  }

  const menuItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/tenants', icon: Building2, label: 'Klienci (Firmy)' },
    { href: '/admin/users', icon: Users, label: 'Użytkownicy' },
    { href: '/admin/subscriptions', icon: CreditCard, label: 'Subskrypcje' },
    { href: '/admin/invoices', icon: FileText, label: 'Faktury' },
    { href: '/admin/support', icon: MessageSquare, label: 'Zgłoszenia' },
    { href: '/admin/notifications', icon: Send, label: 'Powiadomienia' },
    { href: '/admin/settings', icon: Settings, label: 'Ustawienia' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Weryfikacja uprawnień...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-800 border-b border-gray-700">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold text-white">Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-700">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{userName[0]?.toUpperCase()}</span>
                </div>
                <span className="text-sm text-gray-300 hidden md:block">{userName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                title="Wyloguj"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
              </button>
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

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out z-40 flex flex-col
        lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'}
        ${sidebarOpen ? 'lg:w-64' : 'lg:w-16'}
      `}>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                    ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* Back to Dashboard */}
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Panel Biznesowy</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ease-in-out lg:ml-64 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
