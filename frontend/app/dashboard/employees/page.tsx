'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit, Trash2, UserCog, Mail, Phone, Briefcase, X,
  ToggleLeft, ToggleRight, Calendar, Clock, Key, Shield, Copy, Check, RefreshCw
} from 'lucide-react'
import { employeesApi, Employee } from '@/lib/api/employees'
import axios from 'axios'
import toast from 'react-hot-toast'
import TimeOffModal from '@/components/employees/TimeOffModal'
import AvailabilityModal from '@/components/employees/AvailabilityModal'
import EmployeeModal from '@/components/employees/EmployeeModal'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'
import { getTenantConfig } from '@/lib/tenant'
import { getApiUrl } from '@/lib/api-url'

const API_URL = getApiUrl()

interface EmployeeAccount {
  id: string
  employeeId: string
  email: string
  isActive: boolean
  lastLoginAt: string | null
  permissions: any[]
}

export default function EmployeesPage() {
  const { t, language } = useDashboardTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeAccounts, setEmployeeAccounts] = useState<EmployeeAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; employee: Employee | null }>({ show: false, employee: null })
  const [showInactive, setShowInactive] = useState(false)
  const [timeOffModal, setTimeOffModal] = useState<{ show: boolean; employeeId: string; employeeName: string }>({ show: false, employeeId: '', employeeName: '' })
  const [availabilityModal, setAvailabilityModal] = useState<{ show: boolean; employeeId: string; employeeName: string }>({ show: false, employeeId: '', employeeName: '' })
  const [employeeModal, setEmployeeModal] = useState<{ show: boolean; employee: Employee | null }>({ show: false, employee: null })
  const [accountModal, setAccountModal] = useState<{ show: boolean; employee: Employee | null; account: EmployeeAccount | null }>({ show: false, employee: null, account: null })
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [permissions, setPermissions] = useState({
    accountType: 'employee',
    canViewCalendar: true,
    canManageBookings: true,
    canViewCustomers: true, // Pracownik widzi klientów
    canManageCustomers: false,
    canViewServices: true, // Pracownik widzi usługi
    canViewEmployees: false,
    canViewAnalytics: false,
    canViewSettings: false,
    canViewPayments: false,
    onlyOwnCalendar: true,
    onlyOwnBookings: true,
  })

  // Predefiniowane typy kont
  const accountTypes = [
    { id: 'employee', name: 'Pracownik', description: 'Własne rezerwacje, podgląd wszystkich usług i cen' },
    { id: 'employee_extended', name: 'Pracownik rozszerzony', description: 'Pracownik + podgląd rezerwacji innych' },
    { id: 'manager', name: 'Menadżer', description: 'Prawie pełny dostęp - zarządza zespołem, klientami i widzi statystyki' },
    { id: 'receptionist', name: 'Recepcja', description: 'Obsługa klientów - rezerwacje, klienci, wszystkie kalendarze' },
    { id: 'secretary', name: 'Sekretariat', description: 'Obsługa rezerwacji i klientów' },
    { id: 'accountant', name: 'Księgowość', description: 'Statystyki, płatności, podgląd danych' },
    { id: 'assistant', name: 'Asystent', description: 'Podgląd kalendarzy, może dodawać rezerwacje' },
    { id: 'custom', name: 'Niestandardowy', description: 'Ręczna konfiguracja uprawnień' },
  ]

  const applyAccountTypePermissions = (type: string) => {
    const presets: Record<string, typeof permissions> = {
      employee: {
        accountType: 'employee',
        canViewCalendar: true,
        canManageBookings: true,
        canViewCustomers: true,
        canManageCustomers: false,
        canViewServices: true,
        canViewEmployees: false,
        canViewAnalytics: false,
        canViewSettings: false,
        canViewPayments: false,
        onlyOwnCalendar: true, // TYLKO własne rezerwacje
        onlyOwnBookings: true,
      },
      employee_extended: {
        accountType: 'employee_extended',
        canViewCalendar: true,
        canManageBookings: true,
        canViewCustomers: true,
        canManageCustomers: false,
        canViewServices: true,
        canViewEmployees: false,
        canViewAnalytics: false,
        canViewSettings: false,
        canViewPayments: false,
        onlyOwnCalendar: false, // Widzi WSZYSTKIE kalendarze
        onlyOwnBookings: false,
      },
      manager: {
        accountType: 'manager',
        canViewCalendar: true,
        canManageBookings: true,
        canViewCustomers: true,
        canManageCustomers: true,
        canViewServices: true,
        canViewEmployees: true,
        canViewAnalytics: true,
        canViewSettings: false,
        canViewPayments: true,
        onlyOwnCalendar: false,
        onlyOwnBookings: false,
      },
      receptionist: {
        accountType: 'receptionist',
        canViewCalendar: true,
        canManageBookings: true,
        canViewCustomers: true,
        canManageCustomers: true,
        canViewServices: true,
        canViewEmployees: false,
        canViewAnalytics: false,
        canViewSettings: false,
        canViewPayments: false,
        onlyOwnCalendar: false,
        onlyOwnBookings: false,
      },
      secretary: {
        accountType: 'secretary',
        canViewCalendar: true,
        canManageBookings: true,
        canViewCustomers: true,
        canManageCustomers: true,
        canViewServices: true,
        canViewEmployees: false,
        canViewAnalytics: false,
        canViewSettings: false,
        canViewPayments: false,
        onlyOwnCalendar: false,
        onlyOwnBookings: false,
      },
      accountant: {
        accountType: 'accountant',
        canViewCalendar: false,
        canManageBookings: false,
        canViewCustomers: true,
        canManageCustomers: false,
        canViewServices: true,
        canViewEmployees: true,
        canViewAnalytics: true,
        canViewSettings: false,
        canViewPayments: true,
        onlyOwnCalendar: false,
        onlyOwnBookings: false,
      },
      assistant: {
        accountType: 'assistant',
        canViewCalendar: true,
        canManageBookings: true,
        canViewCustomers: true,
        canManageCustomers: false,
        canViewServices: true,
        canViewEmployees: false,
        canViewAnalytics: false,
        canViewSettings: false,
        canViewPayments: false,
        onlyOwnCalendar: false,
        onlyOwnBookings: false,
      },
    }
    
    if (presets[type]) {
      setPermissions(presets[type])
    } else {
      setPermissions(prev => ({ ...prev, accountType: 'custom' }))
    }
  }

  useEffect(() => {
    loadData()
  }, [showInactive])

  const loadData = async () => {
    try {
      setLoading(true)
      const [employeesData, accountsData] = await Promise.all([
        employeesApi.getAll({ isActive: showInactive ? undefined : true }),
        loadAccounts()
      ])
      setEmployees(employeesData)
    } catch (error) {
      toast.error(t.employees?.loadError || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const loadAccounts = async () => {
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/employee-accounts`, config)
      setEmployeeAccounts(response.data || [])
      return response.data
    } catch (error) {
      // Jeśli nie ma kont, to OK
      setEmployeeAccounts([])
      return []
    }
  }

  const getEmployeeAccount = (employeeId: string) => {
    return employeeAccounts.find(acc => acc.employeeId === employeeId)
  }

  // Pobierz nazwę typu konta dla pracownika
  const getEmployeeAccountTypeName = (employeeId: string): string | null => {
    const account = getEmployeeAccount(employeeId)
    if (!account || !account.permissions) return null
    const perms = Array.isArray(account.permissions) ? account.permissions[0] : account.permissions
    if (!perms) return null
    const detectedType = detectAccountType(perms)
    const typeInfo = accountTypes.find(t => t.id === detectedType)
    return typeInfo?.name || null
  }

  const handleCreateAccount = async (employee: Employee) => {
    if (!accountEmail) {
      toast.error('Podaj adres email')
      return
    }
    setCreatingAccount(true)
    try {
      const config = getTenantConfig()
      const response = await axios.post(`${API_URL}/api/employee-accounts`, {
        employeeId: employee.id,
        email: accountEmail,
        permissions: {
          canViewCalendar: true,
          canManageBookings: true,
          onlyOwnCalendar: true,
          onlyOwnBookings: true
        }
      }, config)
      setTempPassword(response.data.tempPassword)
      toast.success('Konto zostało utworzone!')
      await loadAccounts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nie udało się utworzyć konta')
    } finally {
      setCreatingAccount(false)
    }
  }

  const handleResetPassword = async (accountId: string) => {
    try {
      const config = getTenantConfig()
      const response = await axios.post(`${API_URL}/api/employee-accounts/${accountId}/reset-password`, {}, config)
      setTempPassword(response.data.tempPassword)
      toast.success('Hasło zostało zresetowane')
    } catch (error) {
      toast.error('Nie udało się zresetować hasła')
    }
  }

  const handleToggleAccountActive = async (accountId: string) => {
    try {
      const config = getTenantConfig()
      await axios.patch(`${API_URL}/api/employee-accounts/${accountId}/toggle-active`, {}, config)
      toast.success('Status konta został zmieniony')
      await loadAccounts()
    } catch (error) {
      toast.error('Nie udało się zmienić statusu')
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć konto tego pracownika?')) return
    try {
      const config = getTenantConfig()
      await axios.delete(`${API_URL}/api/employee-accounts/${accountId}`, config)
      toast.success('Konto zostało usunięte')
      setAccountModal({ show: false, employee: null, account: null })
      await loadAccounts()
    } catch (error) {
      toast.error('Nie udało się usunąć konta')
    }
  }

  // Funkcja do określenia typu konta na podstawie uprawnień
  const detectAccountType = (perms: any): string => {
    if (!perms) return 'employee'
    
    // Sprawdź czy pasuje do predefiniowanych typów
    if (perms.canViewAnalytics && perms.canViewPayments && perms.canViewCustomers && perms.canManageCustomers && !perms.onlyOwnCalendar) {
      return 'manager'
    }
    if (perms.canViewCustomers && perms.canManageCustomers && perms.canManageBookings && !perms.canViewAnalytics && !perms.onlyOwnCalendar) {
      return 'receptionist'
    }
    if (perms.canViewCustomers && !perms.canManageCustomers && perms.canManageBookings && !perms.canViewAnalytics && !perms.onlyOwnCalendar) {
      return 'secretary'
    }
    if (perms.canViewAnalytics && perms.canViewPayments && !perms.canManageBookings && !perms.canViewCalendar) {
      return 'accountant'
    }
    if (perms.canViewCalendar && !perms.canManageBookings && !perms.onlyOwnCalendar) {
      return 'assistant'
    }
    if (perms.onlyOwnCalendar && perms.onlyOwnBookings) {
      return 'employee'
    }
    return 'custom'
  }

  const openAccountModal = (employee: Employee) => {
    const account = getEmployeeAccount(employee.id)
    setAccountEmail(employee.email)
    setTempPassword(null)
    setShowPermissions(false)
    // Jeśli konto istnieje, załaduj jego uprawnienia
    if (account && account.permissions) {
      // permissions może być obiektem lub tablicą
      const perms = Array.isArray(account.permissions) ? account.permissions[0] : account.permissions
      if (perms) {
        const detectedType = detectAccountType(perms)
        setPermissions({
          accountType: detectedType,
          canViewCalendar: perms.canViewCalendar ?? true,
          canManageBookings: perms.canManageBookings ?? true,
          canViewCustomers: perms.canViewCustomers ?? false,
          canManageCustomers: perms.canManageCustomers ?? false,
          canViewServices: perms.canViewServices ?? false,
          canViewEmployees: perms.canViewEmployees ?? false,
          canViewAnalytics: perms.canViewAnalytics ?? false,
          canViewSettings: perms.canViewSettings ?? false,
          canViewPayments: perms.canViewPayments ?? false,
          onlyOwnCalendar: perms.onlyOwnCalendar ?? true,
          onlyOwnBookings: perms.onlyOwnBookings ?? true,
        })
      }
    } else {
      // Domyślne uprawnienia dla nowego konta
      setPermissions({
        accountType: 'employee',
        canViewCalendar: true,
        canManageBookings: true,
        canViewCustomers: false,
        canManageCustomers: false,
        canViewServices: false,
        canViewEmployees: false,
        canViewAnalytics: false,
        canViewSettings: false,
        canViewPayments: false,
        onlyOwnCalendar: true,
        onlyOwnBookings: true,
      })
    }
    setAccountModal({ show: true, employee, account: account || null })
  }

  const closeAccountModal = () => {
    setAccountModal({ show: false, employee: null, account: null })
    setTempPassword(null)
    setAccountEmail('')
    setShowPermissions(false)
  }

  const handleUpdatePermissions = async () => {
    if (!accountModal.account) return
    setSavingPermissions(true)
    try {
      const config = getTenantConfig()
      // Wysyłamy tylko uprawnienia bez accountType (backend go nie obsługuje)
      const { accountType, ...permissionsToSend } = permissions
      await axios.patch(`${API_URL}/api/employee-accounts/${accountModal.account.id}/permissions`, permissionsToSend, config)
      toast.success('Uprawnienia zostały zapisane')
      setShowPermissions(false)
      // Odśwież listę kont
      const accountsData = await loadAccounts()
      // Znajdź zaktualizowane konto i odśwież modal
      if (accountsData) {
        const updatedAccount = accountsData.find((a: EmployeeAccount) => a.id === accountModal.account?.id)
        if (updatedAccount) {
          setAccountModal(prev => ({ ...prev, account: updatedAccount }))
        }
      }
    } catch (error) {
      toast.error('Nie udało się zapisać uprawnień')
    } finally {
      setSavingPermissions(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t.common?.copiedToClipboard || 'Copied to clipboard')
  }

  const handleDelete = async (employee: Employee) => {
    setDeleteModal({ show: true, employee })
  }

  const confirmDelete = async () => {
    if (!deleteModal.employee) return
    try {
      await employeesApi.delete(deleteModal.employee.id)
      toast.success(t.employees?.deleted || 'Employee deleted')
      setDeleteModal({ show: false, employee: null })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.employees?.deleteError || 'Failed to delete employee')
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) || employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.employees?.title || 'Employees'}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.employees?.subtitle || 'Manage your team'}</p>
        </div>
        
        <button 
          onClick={() => setEmployeeModal({ show: true, employee: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t.employees?.addEmployee || 'Add employee'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={t.employees?.searchPlaceholder || 'Search employee...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
            />
          </div>

          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
              showInactive 
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm' 
                : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {showInactive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{t.employees?.showInactive || 'Show inactive'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-4">
            <UserCog className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t.employees?.noEmployees || 'No employees'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {searchQuery ? (t.employees?.notFound || 'No employees found') : (t.employees?.addFirstEmployee || 'Add your first employee')}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setEmployeeModal({ show: true, employee: null })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.employees?.addEmployee || 'Add employee'}</span>
            </button>
          )}
        </div>
      )}

      {/* Employees Grid */}
      {!loading && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200 ${
                !employee.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white"
                    style={{ backgroundColor: employee.color || '#64748b' }}
                  >
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{employee.title || 'Pracownik'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  employee.isActive 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {employee.isActive ? 'Aktywny' : 'Nieaktywny'}
                </span>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-muted)] truncate">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-muted)]">{employee.phone}</span>
                  </div>
                )}
              </div>

              {/* Services count */}
              <div className="flex items-center gap-2 text-sm mb-4 pb-4 border-b border-[var(--border-color)]">
                <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">{(employee as any).service_employees?.length || 0} usług</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => openAccountModal(employee)}
                  className={`flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    getEmployeeAccount(employee.id)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <Key className="w-3 h-3" />
                  {getEmployeeAccount(employee.id) 
                    ? (getEmployeeAccountTypeName(employee.id) || 'Konto')
                    : 'Utwórz konto'}
                </button>
                <button
                  onClick={() => setAvailabilityModal({ show: true, employeeId: employee.id, employeeName: `${employee.firstName} ${employee.lastName}` })}
                  className="flex-1 min-w-[80px] px-3 py-2 text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  Godziny
                </button>
                <button
                  onClick={() => setTimeOffModal({ show: true, employeeId: employee.id, employeeName: `${employee.firstName} ${employee.lastName}` })}
                  className="flex-1 min-w-[80px] px-3 py-2 text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Urlopy
                </button>
                <button
                  onClick={() => setEmployeeModal({ show: true, employee })}
                  className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                  title="Edytuj"
                >
                  <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button
                  onClick={() => handleDelete(employee)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Usuń"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && deleteModal.employee && (
        <>
          <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, employee: null })} />
          <div className="modal-container" onClick={() => setDeleteModal({ show: false, employee: null })}>
            <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Usuń pracownika</h3>
                <button onClick={() => setDeleteModal({ show: false, employee: null })} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Czy na pewno chcesz usunąć pracownika <strong className="text-[var(--text-primary)]">{deleteModal.employee.firstName} {deleteModal.employee.lastName}</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ show: false, employee: null })} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">
                  Anuluj
                </button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm">
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={employeeModal.show}
        employee={employeeModal.employee}
        onClose={() => setEmployeeModal({ show: false, employee: null })}
        onSaved={loadData}
      />

      {/* Time Off Modal */}
      <TimeOffModal
        isOpen={timeOffModal.show}
        employeeId={timeOffModal.employeeId}
        employeeName={timeOffModal.employeeName}
        onClose={() => setTimeOffModal({ show: false, employeeId: '', employeeName: '' })}
      />

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={availabilityModal.show}
        employeeId={availabilityModal.employeeId}
        employeeName={availabilityModal.employeeName}
        onClose={() => setAvailabilityModal({ show: false, employeeId: '', employeeName: '' })}
      />

      {/* Account Modal */}
      {accountModal.show && accountModal.employee && (
        <>
          <div className="modal-overlay" onClick={closeAccountModal} />
          <div className="modal-container" onClick={closeAccountModal}>
            <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {accountModal.account ? 'Konto pracownika' : 'Utwórz konto'}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {accountModal.employee.firstName} {accountModal.employee.lastName}
                </p>
              </div>
              <button onClick={closeAccountModal} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {tempPassword ? (
              // Pokazujemy hasło po utworzeniu/resecie
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-[var(--text-muted)] mb-4">
                  {accountModal.account ? 'Nowe hasło zostało wygenerowane' : 'Konto zostało utworzone'}
                </p>
                <div className="bg-[var(--bg-primary)] rounded-xl p-4 mb-6">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Tymczasowe hasło:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-[var(--bg-card)] rounded-lg text-[var(--text-primary)] font-mono text-lg">
                      {tempPassword}
                    </code>
                    <button
                      onClick={() => copyToClipboard(tempPassword)}
                      className="p-2 hover:bg-[var(--bg-card)] rounded-lg"
                      title="Kopiuj"
                    >
                      <Copy className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Hasło zostało również wysłane na email pracownika.
                </p>
                <button
                  onClick={closeAccountModal}
                  className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium"
                >
                  Zamknij
                </button>
              </div>
            ) : accountModal.account ? (
              // Zarządzanie istniejącym kontem
              showPermissions ? (
                // Widok uprawnień
                <div className="space-y-4">
                  {/* Typ konta */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Typ konta
                    </label>
                    <select
                      value={permissions.accountType}
                      onChange={(e) => applyAccountTypePermissions(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20"
                    >
                      {accountTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {accountTypes.find(t => t.id === permissions.accountType)?.description}
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    <PermissionToggle
                      label="Kalendarz"
                      description="Podgląd kalendarza rezerwacji"
                      checked={permissions.canViewCalendar}
                      onChange={(v) => setPermissions({...permissions, canViewCalendar: v, accountType: 'custom'})}
                    />
                    <PermissionToggle
                      label="Zarządzanie rezerwacjami"
                      description="Dodawanie, edycja i anulowanie"
                      checked={permissions.canManageBookings}
                      onChange={(v) => setPermissions({...permissions, canManageBookings: v, accountType: 'custom'})}
                    />
                    <PermissionToggle
                      label="Klienci"
                      description="Podgląd listy klientów"
                      checked={permissions.canViewCustomers}
                      onChange={(v) => setPermissions({...permissions, canViewCustomers: v, accountType: 'custom'})}
                    />
                    <PermissionToggle
                      label="Usługi"
                      description="Podgląd usług"
                      checked={permissions.canViewServices}
                      onChange={(v) => setPermissions({...permissions, canViewServices: v, accountType: 'custom'})}
                    />
                    <PermissionToggle
                      label="Pracownicy"
                      description="Podgląd innych pracowników"
                      checked={permissions.canViewEmployees}
                      onChange={(v) => setPermissions({...permissions, canViewEmployees: v, accountType: 'custom'})}
                    />
                    <PermissionToggle
                      label="Analityka"
                      description="Podgląd statystyk"
                      checked={permissions.canViewAnalytics}
                      onChange={(v) => setPermissions({...permissions, canViewAnalytics: v, accountType: 'custom'})}
                    />
                    <PermissionToggle
                      label="Płatności"
                      description="Podgląd płatności"
                      checked={permissions.canViewPayments}
                      onChange={(v) => setPermissions({...permissions, canViewPayments: v, accountType: 'custom'})}
                    />
                    <div className="pt-3 border-t border-[var(--border-color)]">
                      <PermissionToggle
                        label="Tylko własny kalendarz"
                        description="Widzi tylko swoje rezerwacje"
                        checked={permissions.onlyOwnCalendar}
                        onChange={(v) => setPermissions({...permissions, onlyOwnCalendar: v, onlyOwnBookings: v, accountType: 'custom'})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowPermissions(false)}
                      className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--bg-primary)]"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleUpdatePermissions}
                      disabled={savingPermissions}
                      className="flex-1 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {savingPermissions ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Zapisywanie...
                        </>
                      ) : (
                        'Zapisz uprawnienia'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Główny widok konta
                <div className="space-y-4">
                  <div className="bg-[var(--bg-primary)] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Konto pracownika</p>
                        <p className="text-xs text-[var(--text-muted)]">{accountModal.account.email}</p>
                      </div>
                      <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                        accountModal.account.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {accountModal.account.isActive ? 'Aktywne' : 'Nieaktywne'}
                      </span>
                    </div>
                    {accountModal.account.lastLoginAt && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Ostatnie logowanie: {new Date(accountModal.account.lastLoginAt).toLocaleDateString('pl-PL')}
                      </p>
                    )}
                  </div>

                  {/* Szybka zmiana typu konta */}
                  <div className="bg-[var(--bg-primary)] rounded-xl p-4">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Typ konta
                    </label>
                    <select
                      value={permissions.accountType}
                      onChange={async (e) => {
                        const newType = e.target.value
                        applyAccountTypePermissions(newType)
                      }}
                      className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {accountTypes.filter(t => t.id !== 'custom').map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {accountTypes.find(t => t.id === permissions.accountType)?.description}
                    </p>
                    <button
                      onClick={handleUpdatePermissions}
                      disabled={savingPermissions}
                      className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {savingPermissions ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Zapisywanie...
                        </>
                      ) : (
                        'Zapisz typ konta'
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setShowPermissions(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Szczegółowe uprawnienia
                    </button>
                    <button
                      onClick={() => handleResetPassword(accountModal.account!.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resetuj hasło
                    </button>
                    <button
                      onClick={() => handleToggleAccountActive(accountModal.account!.id)}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
                        accountModal.account.isActive
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      }`}
                    >
                      {accountModal.account.isActive ? 'Dezaktywuj konto' : 'Aktywuj konto'}
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(accountModal.account!.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Usuń konto
                    </button>
                  </div>
                </div>
              )
            ) : (
              // Tworzenie nowego konta
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Email do logowania
                  </label>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="pracownik@firma.pl"
                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Pracownik otrzyma email z danymi logowania i będzie mógł zarządzać swoim kalendarzem.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeAccountModal}
                    className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--bg-primary)]"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={() => handleCreateAccount(accountModal.employee!)}
                    disabled={!accountEmail || creatingAccount}
                    className="flex-1 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creatingAccount ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Utwórz konto
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Komponent toggle dla uprawnień
function PermissionToggle({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  )
}
