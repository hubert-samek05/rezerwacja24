'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Edit2, Trash2, Users, Shield, Save, X, 
  UserCog, Briefcase, Phone, Calculator, HelpCircle, Settings,
  Mail, Key, RefreshCw, UserPlus, Copy, MoreVertical, Search,
  ChevronRight, Eye, EyeOff, Lock, Calendar, Scissors, TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId } from '@/lib/tenant'

const API_URL = getApiUrl()

interface Permission {
  key: string
  label: string
  description: string
}

interface AccountType {
  id: string
  name: string
  description: string
  icon: string
  permissions: Record<string, boolean>
  isSystem?: boolean
}

interface AccountUser {
  id: string
  email: string
  firstName: string
  lastName: string
  accountType: string
  isActive: boolean
  lastLoginAt?: string
  employeeId?: string
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // === KALENDARZ I REZERWACJE ===
  { key: 'canViewCalendar', label: 'Podgląd kalendarza', description: 'Widzi kalendarz rezerwacji' },
  { key: 'canManageBookings', label: 'Zarządzanie rezerwacjami', description: 'Może dodawać, edytować i anulować rezerwacje' },
  { key: 'onlyOwnCalendar', label: 'Tylko własne rezerwacje', description: 'Widzi TYLKO swoje rezerwacje (wyłącz aby widzieć wszystkich)' },
  { key: 'canViewOtherBookings', label: 'Podgląd rezerwacji innych', description: 'Widzi rezerwacje innych pracowników (tylko podgląd)' },
  
  // === KLIENCI ===
  { key: 'canViewCustomers', label: 'Podgląd klientów', description: 'Widzi listę klientów i ich dane' },
  { key: 'canManageCustomers', label: 'Zarządzanie klientami', description: 'Może dodawać i edytować klientów' },
  { key: 'onlyOwnCustomers', label: 'Tylko własni klienci', description: 'Widzi TYLKO klientów ze swoich rezerwacji' },
  
  // === USŁUGI ===
  { key: 'canViewServices', label: 'Podgląd usług', description: 'Widzi listę usług, kategorii i pakietów' },
  { key: 'canManageServices', label: 'Zarządzanie usługami', description: 'Może dodawać i edytować usługi, kategorie, pakiety' },
  { key: 'canViewAllServices', label: 'Wszystkie usługi', description: 'Widzi WSZYSTKIE usługi (nie tylko przypisane do siebie)' },
  { key: 'canViewPrices', label: 'Podgląd cen', description: 'Widzi ceny usług' },
  
  // === PRACOWNICY ===
  { key: 'canViewEmployees', label: 'Podgląd pracowników', description: 'Widzi listę pracowników' },
  { key: 'canManageEmployees', label: 'Zarządzanie pracownikami', description: 'Może dodawać pracowników, urlopy, godziny pracy' },
  
  // === ANALITYKA I PŁATNOŚCI ===
  { key: 'canViewAnalytics', label: 'Statystyki', description: 'Widzi raporty i analizy' },
  { key: 'canViewPayments', label: 'Płatności', description: 'Widzi płatności i rozliczenia' },
  
  // === USTAWIENIA ===
  { key: 'canViewSettings', label: 'Ustawienia firmy', description: 'Dostęp do ustawień firmy' },
  { key: 'canManageSettings', label: 'Zarządzanie ustawieniami', description: 'Może zmieniać ustawienia firmy' },
]

const ICONS = [
  { id: 'user', icon: UserCog, label: 'Pracownik' },
  { id: 'briefcase', icon: Briefcase, label: 'Menadżer' },
  { id: 'phone', icon: Phone, label: 'Recepcja' },
  { id: 'calculator', icon: Calculator, label: 'Księgowość' },
  { id: 'help', icon: HelpCircle, label: 'Asystent' },
  { id: 'settings', icon: Settings, label: 'Admin' },
]

const DEFAULT_ACCOUNT_TYPES: AccountType[] = [
  {
    id: 'employee',
    name: 'Pracownik',
    description: 'Podstawowy dostęp - własne rezerwacje, podgląd wszystkich usług i cen',
    icon: 'user',
    isSystem: true,
    permissions: {
      // Kalendarz
      canViewCalendar: true, 
      canManageBookings: true, // Zarządza SWOIMI rezerwacjami
      onlyOwnCalendar: true, // Widzi TYLKO swoje rezerwacje
      canViewOtherBookings: false, // Nie widzi rezerwacji innych
      // Klienci
      canViewCustomers: true, 
      canManageCustomers: false,
      onlyOwnCustomers: true, // Widzi tylko swoich klientów
      // Usługi
      canViewServices: true, 
      canManageServices: false,
      canViewAllServices: true, // Widzi WSZYSTKIE usługi (może podać cenę klientowi)
      canViewPrices: true, // Widzi ceny
      // Pracownicy
      canViewEmployees: false, 
      canManageEmployees: false,
      // Analityka
      canViewAnalytics: false, 
      canViewPayments: false, 
      // Ustawienia
      canViewSettings: false, 
      canManageSettings: false,
    }
  },
  {
    id: 'employee_extended',
    name: 'Pracownik rozszerzony',
    description: 'Pracownik z podglądem rezerwacji innych (np. do koordynacji)',
    icon: 'user',
    isSystem: true,
    permissions: {
      canViewCalendar: true, 
      canManageBookings: true,
      onlyOwnCalendar: false, // Widzi WSZYSTKIE kalendarze
      canViewOtherBookings: true, // Widzi rezerwacje innych (podgląd)
      canViewCustomers: true, 
      canManageCustomers: false,
      onlyOwnCustomers: false, // Widzi wszystkich klientów
      canViewServices: true, 
      canManageServices: false,
      canViewAllServices: true,
      canViewPrices: true,
      canViewEmployees: false, 
      canManageEmployees: false,
      canViewAnalytics: false, 
      canViewPayments: false, 
      canViewSettings: false, 
      canManageSettings: false,
    }
  },
  {
    id: 'manager',
    name: 'Menadżer',
    description: 'Prawie pełny dostęp - zarządza zespołem, klientami, rezerwacjami i widzi statystyki',
    icon: 'briefcase',
    isSystem: true,
    permissions: {
      canViewCalendar: true, 
      canManageBookings: true,
      onlyOwnCalendar: false, // Widzi WSZYSTKIE kalendarze
      canViewOtherBookings: true,
      canViewCustomers: true, 
      canManageCustomers: true, // Pełne zarządzanie klientami
      onlyOwnCustomers: false,
      canViewServices: true, 
      canManageServices: false, // Usługi - tylko podgląd (edycja = właściciel)
      canViewAllServices: true,
      canViewPrices: true,
      canViewEmployees: true, 
      canManageEmployees: true, // Zarządza pracownikami, urlopami, godzinami
      canViewAnalytics: true, 
      canViewPayments: true,
      canViewSettings: false, 
      canManageSettings: false,
    }
  },
  {
    id: 'receptionist',
    name: 'Recepcja',
    description: 'Obsługa klientów - rezerwacje, klienci, kalendarz wszystkich pracowników',
    icon: 'phone',
    isSystem: true,
    permissions: {
      canViewCalendar: true, 
      canManageBookings: true,
      onlyOwnCalendar: false, // Widzi WSZYSTKIE kalendarze
      canViewOtherBookings: true,
      canViewCustomers: true, 
      canManageCustomers: true, // Pełne zarządzanie klientami
      onlyOwnCustomers: false,
      canViewServices: true, 
      canManageServices: false,
      canViewAllServices: true,
      canViewPrices: true,
      canViewEmployees: false, 
      canManageEmployees: false,
      canViewAnalytics: false, 
      canViewPayments: false, 
      canViewSettings: false, 
      canManageSettings: false,
    }
  },
  {
    id: 'secretary',
    name: 'Sekretariat',
    description: 'Obsługa rezerwacji i klientów',
    icon: 'phone',
    isSystem: true,
    permissions: {
      canViewCalendar: true, 
      canManageBookings: true,
      onlyOwnCalendar: false,
      canViewOtherBookings: true,
      canViewCustomers: true, 
      canManageCustomers: true,
      onlyOwnCustomers: false,
      canViewServices: true, 
      canManageServices: false,
      canViewAllServices: true,
      canViewPrices: true,
      canViewEmployees: false, 
      canManageEmployees: false,
      canViewAnalytics: false, 
      canViewPayments: false, 
      canViewSettings: false, 
      canManageSettings: false,
    }
  },
  {
    id: 'accountant',
    name: 'Księgowość',
    description: 'Dostęp do statystyk, płatności i danych klientów',
    icon: 'calculator',
    isSystem: true,
    permissions: {
      canViewCalendar: false, 
      canManageBookings: false,
      onlyOwnCalendar: false,
      canViewOtherBookings: false,
      canViewCustomers: true, 
      canManageCustomers: false,
      onlyOwnCustomers: false,
      canViewServices: true, 
      canManageServices: false,
      canViewAllServices: true,
      canViewPrices: true,
      canViewEmployees: true, 
      canManageEmployees: false,
      canViewAnalytics: true, 
      canViewPayments: true,
      canViewSettings: false, 
      canManageSettings: false,
    }
  },
  {
    id: 'assistant',
    name: 'Asystent',
    description: 'Podgląd kalendarzy i klientów, może dodawać rezerwacje',
    icon: 'help',
    isSystem: true,
    permissions: {
      canViewCalendar: true, 
      canManageBookings: true,
      onlyOwnCalendar: false, // Widzi wszystkie kalendarze
      canViewOtherBookings: true,
      canViewCustomers: true, 
      canManageCustomers: false,
      onlyOwnCustomers: false,
      canViewServices: true, 
      canManageServices: false,
      canViewAllServices: true,
      canViewPrices: true,
      canViewEmployees: false, 
      canManageEmployees: false,
      canViewAnalytics: false, 
      canViewPayments: false, 
      canViewSettings: false, 
      canManageSettings: false,
    }
  },
]

export default function AccountTypesTab() {
  // Main state
  const [activeView, setActiveView] = useState<'types' | 'users'>('users')
  const [accountTypes, setAccountTypes] = useState<AccountType[]>(DEFAULT_ACCOUNT_TYPES)
  const [accountUsers, setAccountUsers] = useState<AccountUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Modals
  const [typeModal, setTypeModal] = useState<{ show: boolean; type: AccountType | null; isNew: boolean }>({ 
    show: false, type: null, isNew: false 
  })
  const [userModal, setUserModal] = useState<{ 
    show: boolean; 
    user: AccountUser | null; 
    isNew: boolean;
    tempPassword: string | null;
    selectedType: string;
  }>({
    show: false, user: null, isNew: false, tempPassword: null, selectedType: 'employee'
  })
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; item: any; type: 'user' | 'accountType' }>({ 
    show: false, item: null, type: 'user' 
  })
  const [passwordModal, setPasswordModal] = useState<{ show: boolean; user: AccountUser | null; newPassword: string | null }>({
    show: false, user: null, newPassword: null
  })

  // Form data
  const [typeFormData, setTypeFormData] = useState<AccountType>({
    id: '', name: '', description: '', icon: 'user', permissions: {}
  })
  const [userFormData, setUserFormData] = useState({
    firstName: '', lastName: '', email: '', accountType: 'employee'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const tenantId = getTenantId()

      // Load custom account types
      const typesRes = await axios.get(`${API_URL}/api/tenants/${tenantId}/account-types`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      }).catch(() => null)

      if (typesRes && typesRes.data?.length > 0) {
        const customTypes = typesRes.data.filter((t: AccountType) => !t.isSystem)
        setAccountTypes([...DEFAULT_ACCOUNT_TYPES, ...customTypes])
      }

      // Load employee accounts
      const usersRes = await axios.get(`${API_URL}/api/employee-accounts`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      }).catch(() => null)

      if (usersRes?.data) {
        const users = usersRes.data.map((acc: any) => {
          // Pobierz uprawnienia (może być tablica lub obiekt)
          const perms = Array.isArray(acc.permissions) ? acc.permissions[0] : acc.permissions
          // Wykryj typ konta na podstawie uprawnień
          let detectedType = 'employee'
          if (perms) {
            if (perms.canViewAnalytics && perms.canViewPayments && perms.canViewCustomers && perms.canManageCustomers && !perms.onlyOwnCalendar) {
              detectedType = 'manager'
            } else if (perms.canViewCustomers && perms.canManageCustomers && perms.canManageBookings && !perms.canViewAnalytics && !perms.onlyOwnCalendar) {
              detectedType = 'receptionist'
            } else if (perms.canViewCustomers && !perms.canManageCustomers && perms.canManageBookings && !perms.canViewAnalytics && !perms.onlyOwnCalendar) {
              detectedType = 'secretary'
            } else if (perms.canViewAnalytics && perms.canViewPayments && !perms.canManageBookings && !perms.canViewCalendar) {
              detectedType = 'accountant'
            } else if (perms.canViewCalendar && !perms.canManageBookings && !perms.onlyOwnCalendar) {
              detectedType = 'assistant'
            } else if (perms.onlyOwnCalendar && perms.onlyOwnBookings) {
              detectedType = 'employee'
            }
          }
          
          return {
            id: acc.id,
            email: acc.email,
            firstName: acc.employee?.firstName || acc.employees?.firstName || '',
            lastName: acc.employee?.lastName || acc.employees?.lastName || '',
            accountType: detectedType,
            isActive: acc.isActive,
            lastLoginAt: acc.lastLoginAt,
            employeeId: acc.employeeId,
          }
        })
        setAccountUsers(users)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // === USER FUNCTIONS ===
  const openUserModal = (user: AccountUser | null, isNew: boolean, preselectedType?: string) => {
    if (user) {
      setUserFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType
      })
    } else {
      setUserFormData({
        firstName: '', lastName: '', email: '',
        accountType: preselectedType || 'employee'
      })
    }
    setUserModal({ show: true, user, isNew, tempPassword: null, selectedType: preselectedType || user?.accountType || 'employee' })
  }

  const handleSaveUser = async () => {
    // Przy tworzeniu nowego użytkownika wymagamy wszystkich pól
    if (userModal.isNew && (!userFormData.email || !userFormData.firstName || !userFormData.lastName)) {
      toast.error('Wypełnij wszystkie pola')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const tenantId = getTenantId()
      const selectedType = accountTypes.find(t => t.id === userFormData.accountType)

      if (userModal.isNew) {
        // Create new user
        const response = await axios.post(`${API_URL}/api/employee-accounts/create-standalone`, {
          email: userFormData.email,
          firstName: userFormData.firstName,
          lastName: userFormData.lastName,
          accountType: userFormData.accountType,
          permissions: selectedType?.permissions || {},
        }, {
          headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
        })

        if (response.data?.tempPassword) {
          setUserModal(prev => ({ ...prev, tempPassword: response.data.tempPassword }))
          toast.success('Konto zostało utworzone')
        } else {
          toast.success('Konto zostało utworzone')
          setUserModal({ show: false, user: null, isNew: false, tempPassword: null, selectedType: 'employee' })
        }
      } else if (userModal.user) {
        // Update existing user - tylko uprawnienia przez /permissions endpoint
        await axios.patch(`${API_URL}/api/employee-accounts/${userModal.user.id}/permissions`, 
          selectedType?.permissions || {}, 
          {
            headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
          }
        )
        toast.success('Typ konta został zmieniony')
        setUserModal({ show: false, user: null, isNew: false, tempPassword: null, selectedType: 'employee' })
      }
      
      await loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!passwordModal.user) return

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const tenantId = getTenantId()

      const response = await axios.post(`${API_URL}/api/employee-accounts/${passwordModal.user.id}/reset-password`, {}, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      })

      if (response.data?.tempPassword) {
        setPasswordModal(prev => ({ ...prev, newPassword: response.data.tempPassword }))
        toast.success('Hasło zostało zresetowane')
      }
    } catch (error) {
      toast.error('Błąd resetowania hasła')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleUserActive = async (user: AccountUser) => {
    try {
      const token = localStorage.getItem('token')
      const tenantId = getTenantId()

      await axios.patch(`${API_URL}/api/employee-accounts/${user.id}/toggle-active`, {}, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      })

      toast.success(user.isActive ? 'Konto dezaktywowane' : 'Konto aktywowane')
      await loadData()
    } catch (error) {
      toast.error('Błąd aktualizacji')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteModal.item || deleteModal.type !== 'user') return

    try {
      const token = localStorage.getItem('token')
      const tenantId = getTenantId()

      await axios.delete(`${API_URL}/api/employee-accounts/${deleteModal.item.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      })

      toast.success('Konto zostało usunięte')
      setDeleteModal({ show: false, item: null, type: 'user' })
      await loadData()
    } catch (error) {
      toast.error('Błąd usuwania')
    }
  }

  // === TYPE FUNCTIONS ===
  const openTypeModal = (type: AccountType | null, isNew: boolean) => {
    if (type) {
      setTypeFormData({ ...type })
    } else {
      setTypeFormData({
        id: `custom_${Date.now()}`,
        name: '',
        description: '',
        icon: 'user',
        permissions: {
          canViewCalendar: true, canManageBookings: false, canViewCustomers: false,
          canManageCustomers: false, canViewServices: false, canViewEmployees: false,
          canViewAnalytics: false, canViewPayments: false, canViewSettings: false, onlyOwnCalendar: true,
        }
      })
    }
    setTypeModal({ show: true, type, isNew })
  }

  const handleSaveType = async () => {
    if (!typeFormData.name.trim()) {
      toast.error('Podaj nazwę typu konta')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const tenantId = getTenantId()

      await axios.post(`${API_URL}/api/tenants/${tenantId}/account-types`, typeFormData, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      }).catch(() => null)

      if (typeModal.isNew) {
        setAccountTypes(prev => [...prev, typeFormData])
        toast.success('Typ konta został dodany')
      } else {
        setAccountTypes(prev => prev.map(t => t.id === typeFormData.id ? typeFormData : t))
        toast.success('Typ konta został zaktualizowany')
      }

      setTypeModal({ show: false, type: null, isNew: false })
    } catch (error) {
      toast.error('Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteType = async () => {
    if (!deleteModal.item || deleteModal.type !== 'accountType') return

    try {
      const token = localStorage.getItem('token')
      const tenantId = getTenantId()

      await axios.delete(`${API_URL}/api/tenants/${tenantId}/account-types/${deleteModal.item.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      }).catch(() => null)

      setAccountTypes(prev => prev.filter(t => t.id !== deleteModal.item.id))
      toast.success('Typ konta został usunięty')
      setDeleteModal({ show: false, item: null, type: 'accountType' })
    } catch (error) {
      toast.error('Błąd usuwania')
    }
  }

  // === HELPERS ===
  const getIconComponent = (iconId: string) => {
    return ICONS.find(i => i.id === iconId)?.icon || UserCog
  }

  const getTypeName = (typeId: string) => {
    return accountTypes.find(t => t.id === typeId)?.name || 'Pracownik'
  }

  const getTypeColor = (typeId: string) => {
    const colors: Record<string, string> = {
      employee: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      receptionist: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      secretary: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      accountant: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      assistant: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    }
    return colors[typeId] || 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
  }

  const filteredUsers = accountUsers.filter(user => {
    const matchesSearch = !searchQuery || 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || user.accountType === filterType
    return matchesSearch && matchesType
  })

  const getUserCountForType = (typeId: string) => {
    return accountUsers.filter(u => u.accountType === typeId).length
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Typy kont oraz użytkownicy</h2>
          <p className="text-sm text-[var(--text-muted)]">Zarządzaj rolami, uprawnieniami i dostępem do systemu</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1">
            <button
              onClick={() => setActiveView('users')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeView === 'users' 
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Użytkownicy ({accountUsers.length})
            </button>
            <button
              onClick={() => setActiveView('types')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeView === 'types' 
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Typy kont ({accountTypes.length})
            </button>
          </div>
        </div>
      </div>

      {/* USERS VIEW */}
      {activeView === 'users' && (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Szukaj użytkownika..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none"
            >
              <option value="all">Wszystkie typy</option>
              {accountTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <button
              onClick={() => openUserModal(null, true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              Dodaj użytkownika
            </button>
          </div>

          {/* Users list */}
          {filteredUsers.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="font-medium text-[var(--text-primary)] mb-2">Brak użytkowników</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Dodaj pierwszego użytkownika do systemu</p>
              <button
                onClick={() => openUserModal(null, true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-xl text-sm font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Dodaj użytkownika
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Użytkownik</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Typ konta</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Ostatnie logowanie</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(user.accountType)}`}>
                            {getTypeName(user.accountType)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                            user.isActive 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {user.isActive ? 'Aktywny' : 'Nieaktywny'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Nigdy'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openUserModal(user, false)}
                              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                              title="Edytuj"
                            >
                              <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                            <button
                              onClick={() => setPasswordModal({ show: true, user, newPassword: null })}
                              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                              title="Resetuj hasło"
                            >
                              <Key className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                            <button
                              onClick={() => handleToggleUserActive(user)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive 
                                  ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30' 
                                  : 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                              }`}
                              title={user.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                            >
                              {user.isActive ? (
                                <EyeOff className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Eye className="w-4 h-4 text-emerald-600" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteModal({ show: true, item: user, type: 'user' })}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TYPES VIEW */}
      {activeView === 'types' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openTypeModal(null, true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Nowy typ konta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountTypes.map((type) => {
              const IconComponent = getIconComponent(type.icon)
              const userCount = getUserCountForType(type.id)
              
              return (
                <div 
                  key={type.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{type.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{userCount} użytkowników</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {type.isSystem && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
                          Systemowy
                        </span>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => openTypeModal(type, false)}
                          className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg"
                          title="Edytuj uprawnienia"
                        >
                          <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        {!type.isSystem && (
                          <button
                            onClick={() => setDeleteModal({ show: true, item: type, type: 'accountType' })}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[var(--text-muted)] mb-4">{type.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_PERMISSIONS.filter(p => type.permissions[p.key]).slice(0, 4).map((perm) => (
                      <span 
                        key={perm.key}
                        className="px-2 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md"
                      >
                        {perm.label}
                      </span>
                    ))}
                    {Object.values(type.permissions).filter(Boolean).length > 4 && (
                      <span className="px-2 py-1 text-xs bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-md">
                        +{Object.values(type.permissions).filter(Boolean).length - 4}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => { setFilterType(type.id); setActiveView('users') }}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors"
                  >
                    Zobacz użytkowników
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {userModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {userModal.isNew ? 'Nowy użytkownik' : 'Edytuj użytkownika'}
                </h3>
                <button
                  onClick={() => setUserModal({ show: false, user: null, isNew: false, tempPassword: null, selectedType: 'employee' })}
                  className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {userModal.tempPassword ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Konto utworzone!</h4>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Tymczasowe hasło dla {userFormData.email}:
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-[var(--bg-secondary)] rounded-xl mb-4">
                    <code className="flex-1 text-lg font-mono text-[var(--text-primary)]">
                      {userModal.tempPassword}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(userModal.tempPassword || '')
                        toast.success('Skopiowano')
                      }}
                      className="p-2 hover:bg-[var(--bg-card)] rounded-lg"
                    >
                      <Copy className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-6">
                    Przekaż to hasło użytkownikowi. Zostanie poproszony o zmianę przy pierwszym logowaniu.
                  </p>
                  <button
                    onClick={() => setUserModal({ show: false, user: null, isNew: false, tempPassword: null, selectedType: 'employee' })}
                    className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium"
                  >
                    Zamknij
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Przy edycji pokazujemy info o użytkowniku */}
                  {!userModal.isNew && userModal.user && (
                    <div className="bg-[var(--bg-primary)] rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium text-lg">
                          {userModal.user.firstName?.[0]}{userModal.user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {userModal.user.firstName} {userModal.user.lastName}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">{userModal.user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Przy tworzeniu nowego - pola formularza */}
                  {userModal.isNew && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Imię</label>
                          <input
                            type="text"
                            value={userFormData.firstName}
                            onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                            placeholder="Jan"
                            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Nazwisko</label>
                          <input
                            type="text"
                            value={userFormData.lastName}
                            onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                            placeholder="Kowalski"
                            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email</label>
                        <input
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          placeholder="jan.kowalski@firma.pl"
                          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Typ konta</label>
                    <select
                      value={userFormData.accountType}
                      onChange={(e) => setUserFormData({ ...userFormData, accountType: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      {accountTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {accountTypes.find(t => t.id === userFormData.accountType)?.description}
                    </p>
                  </div>

                  {userModal.isNew && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex gap-2">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          Użytkownik otrzyma tymczasowe hasło do pierwszego logowania.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setUserModal({ show: false, user: null, isNew: false, tempPassword: null, selectedType: 'employee' })}
                      className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--bg-primary)]"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleSaveUser}
                      disabled={saving}
                      className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {userModal.isNew ? 'Utwórz konto' : 'Zmień typ konta'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordModal.show && passwordModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-md p-6">
            {passwordModal.newPassword ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">Hasło zresetowane!</h4>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Nowe tymczasowe hasło dla {passwordModal.user.email}:
                </p>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-secondary)] rounded-xl mb-4">
                  <code className="flex-1 text-lg font-mono text-[var(--text-primary)]">
                    {passwordModal.newPassword}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(passwordModal.newPassword || '')
                      toast.success('Skopiowano')
                    }}
                    className="p-2 hover:bg-[var(--bg-card)] rounded-lg"
                  >
                    <Copy className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>
                <button
                  onClick={() => setPasswordModal({ show: false, user: null, newPassword: null })}
                  className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium"
                >
                  Zamknij
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Resetuj hasło
                </h3>
                <p className="text-[var(--text-muted)] mb-6">
                  Czy na pewno chcesz zresetować hasło dla użytkownika <strong>{passwordModal.user.firstName} {passwordModal.user.lastName}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPasswordModal({ show: false, user: null, newPassword: null })}
                    className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--bg-primary)]"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={saving}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Resetuj hasło
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TYPE MODAL - Zaawansowany edytor uprawnień */}
      {typeModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] bg-gradient-to-r from-teal-500/5 to-emerald-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    {typeModal.isNew ? 'Nowy typ konta' : `Edytuj: ${typeFormData.name}`}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {typeFormData.isSystem ? 'Typ systemowy - możesz dostosować uprawnienia' : 'Typ niestandardowy'}
                  </p>
                </div>
                <button
                  onClick={() => setTypeModal({ show: false, type: null, isNew: false })}
                  className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Podstawowe info - tylko dla niestandardowych */}
              {!typeFormData.isSystem && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Nazwa</label>
                    <input
                      type="text"
                      value={typeFormData.name}
                      onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                      placeholder="np. Stażysta"
                      className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Opis</label>
                    <input
                      type="text"
                      value={typeFormData.description}
                      onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                      placeholder="Krótki opis"
                      className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              )}

              {/* SEKCJA: Kalendarz i Rezerwacje */}
              <div className="bg-[var(--bg-primary)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Kalendarz i Rezerwacje</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'canViewCalendar', label: 'Podgląd kalendarza', desc: 'Widzi kalendarz rezerwacji' },
                    { key: 'canManageBookings', label: 'Zarządzanie rezerwacjami', desc: 'Może dodawać, edytować i anulować' },
                    { key: 'onlyOwnCalendar', label: 'Tylko własne rezerwacje', desc: 'Widzi TYLKO swoje (wyłącz = widzi wszystkich)', warning: true },
                    { key: 'canViewOtherBookings', label: 'Podgląd rezerwacji innych', desc: 'Widzi rezerwacje innych pracowników' },
                  ].map((perm) => (
                    <div key={perm.key} className={`flex items-center justify-between p-3 rounded-xl ${perm.warning ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-[var(--bg-card)]'}`}>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{perm.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{perm.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTypeFormData({
                          ...typeFormData,
                          permissions: { ...typeFormData.permissions, [perm.key]: !typeFormData.permissions[perm.key] }
                        })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          typeFormData.permissions[perm.key] ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          typeFormData.permissions[perm.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEKCJA: Klienci */}
              <div className="bg-[var(--bg-primary)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Klienci</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'canViewCustomers', label: 'Podgląd klientów', desc: 'Widzi listę klientów i ich dane' },
                    { key: 'canManageCustomers', label: 'Zarządzanie klientami', desc: 'Może dodawać i edytować klientów' },
                    { key: 'onlyOwnCustomers', label: 'Tylko własni klienci', desc: 'Widzi TYLKO klientów ze swoich rezerwacji', warning: true },
                  ].map((perm) => (
                    <div key={perm.key} className={`flex items-center justify-between p-3 rounded-xl ${perm.warning ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-[var(--bg-card)]'}`}>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{perm.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{perm.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTypeFormData({
                          ...typeFormData,
                          permissions: { ...typeFormData.permissions, [perm.key]: !typeFormData.permissions[perm.key] }
                        })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          typeFormData.permissions[perm.key] ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          typeFormData.permissions[perm.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEKCJA: Usługi */}
              <div className="bg-[var(--bg-primary)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-pink-500" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Usługi i Cennik</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'canViewServices', label: 'Podgląd usług', desc: 'Widzi listę usług, kategorii i pakietów' },
                    { key: 'canManageServices', label: 'Zarządzanie usługami', desc: 'Może dodawać i edytować usługi' },
                    { key: 'canViewAllServices', label: 'Wszystkie usługi', desc: 'Widzi WSZYSTKIE usługi (nie tylko przypisane)' },
                    { key: 'canViewPrices', label: 'Podgląd cen', desc: 'Widzi ceny usług (może podać klientowi)' },
                  ].map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{perm.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{perm.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTypeFormData({
                          ...typeFormData,
                          permissions: { ...typeFormData.permissions, [perm.key]: !typeFormData.permissions[perm.key] }
                        })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          typeFormData.permissions[perm.key] ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          typeFormData.permissions[perm.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEKCJA: Pracownicy */}
              <div className="bg-[var(--bg-primary)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <UserCog className="w-4 h-4 text-orange-500" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Pracownicy</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'canViewEmployees', label: 'Podgląd pracowników', desc: 'Widzi listę pracowników' },
                    { key: 'canManageEmployees', label: 'Zarządzanie pracownikami', desc: 'Może dodawać pracowników, urlopy, godziny pracy' },
                  ].map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{perm.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{perm.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTypeFormData({
                          ...typeFormData,
                          permissions: { ...typeFormData.permissions, [perm.key]: !typeFormData.permissions[perm.key] }
                        })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          typeFormData.permissions[perm.key] ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          typeFormData.permissions[perm.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEKCJA: Analityka i Płatności */}
              <div className="bg-[var(--bg-primary)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Analityka i Płatności</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'canViewAnalytics', label: 'Statystyki', desc: 'Widzi raporty i analizy' },
                    { key: 'canViewPayments', label: 'Płatności', desc: 'Widzi płatności i rozliczenia' },
                  ].map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{perm.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{perm.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTypeFormData({
                          ...typeFormData,
                          permissions: { ...typeFormData.permissions, [perm.key]: !typeFormData.permissions[perm.key] }
                        })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          typeFormData.permissions[perm.key] ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          typeFormData.permissions[perm.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEKCJA: Ustawienia */}
              <div className="bg-[var(--bg-primary)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-red-500" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Ustawienia firmy</h4>
                  <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">Zaawansowane</span>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'canViewSettings', label: 'Podgląd ustawień', desc: 'Dostęp do ustawień firmy (tylko podgląd)' },
                    { key: 'canManageSettings', label: 'Zarządzanie ustawieniami', desc: 'Może zmieniać ustawienia firmy' },
                  ].map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{perm.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{perm.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTypeFormData({
                          ...typeFormData,
                          permissions: { ...typeFormData.permissions, [perm.key]: !typeFormData.permissions[perm.key] }
                        })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          typeFormData.permissions[perm.key] ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          typeFormData.permissions[perm.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-primary)] flex gap-3">
              <button
                onClick={() => setTypeModal({ show: false, type: null, isNew: false })}
                className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--bg-card)]"
              >
                Anuluj
              </button>
              <button
                onClick={handleSaveType}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Zapisz uprawnienia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.show && deleteModal.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {deleteModal.type === 'user' ? 'Usuń użytkownika' : 'Usuń typ konta'}
              </h3>
              <p className="text-[var(--text-muted)] mb-6">
                {deleteModal.type === 'user' 
                  ? `Czy na pewno chcesz usunąć konto użytkownika "${deleteModal.item.firstName} ${deleteModal.item.lastName}"?`
                  : `Czy na pewno chcesz usunąć typ konta "${deleteModal.item.name}"?`
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, item: null, type: 'user' })}
                  className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--bg-primary)]"
                >
                  Anuluj
                </button>
                <button
                  onClick={deleteModal.type === 'user' ? handleDeleteUser : handleDeleteType}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
