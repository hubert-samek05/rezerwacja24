'use client'

import { useState, useEffect, useCallback } from 'react'

export interface UserPermissions {
  // Kalendarz i rezerwacje
  canViewCalendar?: boolean
  canManageBookings?: boolean
  onlyOwnCalendar?: boolean
  canViewOtherBookings?: boolean // Podgląd rezerwacji innych pracowników
  // Klienci
  canViewCustomers?: boolean
  canManageCustomers?: boolean
  onlyOwnCustomers?: boolean // Tylko klienci z własnych rezerwacji
  // Usługi
  canViewServices?: boolean
  canManageServices?: boolean
  canViewAllServices?: boolean // Wszystkie usługi (nie tylko przypisane)
  canViewPrices?: boolean // Podgląd cen
  // Pracownicy
  canViewEmployees?: boolean
  canManageEmployees?: boolean
  // Analityka i płatności
  canViewAnalytics?: boolean
  canViewPayments?: boolean
  // Ustawienia
  canViewSettings?: boolean
  canManageSettings?: boolean
}

export interface PermissionsState {
  isOwner: boolean // Właściciel firmy - pełny dostęp
  isEmployee: boolean // Pracownik z kontem
  permissions: UserPermissions
  loading: boolean
  // Pomocnicze funkcje
  can: (permission: keyof UserPermissions) => boolean
  canView: (section: string) => boolean
  canManage: (section: string) => boolean
}

export function usePermissions(): PermissionsState {
  const [isOwner, setIsOwner] = useState(true)
  const [isEmployee, setIsEmployee] = useState(false)
  const [permissions, setPermissions] = useState<UserPermissions>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = () => {
    try {
      // Sprawdź czy to pracownik
      const employeeUser = localStorage.getItem('employee_user')
      if (employeeUser) {
        const empData = JSON.parse(employeeUser)
        setIsEmployee(true)
        setIsOwner(false)
        
        // Pobierz uprawnienia
        const perms = Array.isArray(empData.permissions) 
          ? empData.permissions[0] 
          : empData.permissions
        
        setPermissions(perms || {})
      } else {
        // Właściciel firmy - pełny dostęp
        const user = localStorage.getItem('user')
        if (user) {
          const userData = JSON.parse(user)
          setIsOwner(userData.role !== 'EMPLOYEE')
          setIsEmployee(userData.role === 'EMPLOYEE')
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sprawdź pojedyncze uprawnienie
  const can = useCallback((permission: keyof UserPermissions): boolean => {
    if (isOwner) return true // Właściciel ma wszystkie uprawnienia
    return permissions[permission] === true
  }, [isOwner, permissions])

  // Sprawdź czy może wyświetlić sekcję
  const canView = useCallback((section: string): boolean => {
    if (isOwner) return true
    
    const viewMap: Record<string, keyof UserPermissions> = {
      'calendar': 'canViewCalendar',
      'bookings': 'canViewCalendar', // Rezerwacje wymagają dostępu do kalendarza
      'customers': 'canViewCustomers',
      'services': 'canViewServices',
      'categories': 'canViewServices',
      'packages': 'canViewServices',
      'passes': 'canViewServices',
      'promotions': 'canViewServices',
      'employees': 'canViewEmployees',
      'analytics': 'canViewAnalytics',
      'payments': 'canViewPayments',
      'settings': 'canViewSettings',
      'loyalty': 'canViewCustomers',
      'group-bookings': 'canViewCalendar', // Rezerwacje grupowe - wystarczy dostęp do kalendarza
    }
    
    const permKey = viewMap[section]
    if (!permKey) return false
    return permissions[permKey] === true
  }, [isOwner, permissions])

  // Sprawdź czy może zarządzać sekcją
  const canManage = useCallback((section: string): boolean => {
    if (isOwner) return true
    
    const manageMap: Record<string, keyof UserPermissions> = {
      'calendar': 'canManageBookings',
      'bookings': 'canManageBookings',
      'customers': 'canManageCustomers',
      'services': 'canManageServices',
      'categories': 'canManageServices',
      'packages': 'canManageServices',
      'passes': 'canManageServices',
      'promotions': 'canManageServices',
      'employees': 'canManageEmployees',
      'settings': 'canManageSettings',
    }
    
    const permKey = manageMap[section]
    if (!permKey) return false
    return permissions[permKey] === true
  }, [isOwner, permissions])

  return {
    isOwner,
    isEmployee,
    permissions,
    loading,
    can,
    canView,
    canManage,
  }
}
