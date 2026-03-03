'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CustomerAccount {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  emailVerified: boolean
}

interface CustomerAuthContextType {
  customer: CustomerAccount | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  marketingConsent?: boolean
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sprawdź czy użytkownik jest zalogowany przy starcie
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('customerAccessToken')
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/customer-auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        // Token wygasł - spróbuj odświeżyć
        await refreshAuth()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('customerAccessToken')
      localStorage.removeItem('customerRefreshToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/customer-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Błąd logowania')
    }

    const data = await response.json()
    localStorage.setItem('customerAccessToken', data.accessToken)
    localStorage.setItem('customerRefreshToken', data.refreshToken)
    setCustomer(data.customer)
  }

  const register = async (registerData: RegisterData) => {
    const response = await fetch(`${API_URL}/api/customer-auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Błąd rejestracji')
    }

    const data = await response.json()
    localStorage.setItem('customerAccessToken', data.accessToken)
    localStorage.setItem('customerRefreshToken', data.refreshToken)
    setCustomer(data.customer)
  }

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('customerAccessToken')
      if (accessToken) {
        await fetch(`${API_URL}/api/customer-auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('customerAccessToken')
      localStorage.removeItem('customerRefreshToken')
      setCustomer(null)
    }
  }

  const refreshAuth = async () => {
    try {
      // Najpierw spróbuj użyć istniejącego access tokenu
      const accessToken = localStorage.getItem('customerAccessToken')
      if (accessToken) {
        const meResponse = await fetch(`${API_URL}/api/customer-auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (meResponse.ok) {
          const customerData = await meResponse.json()
          setCustomer(customerData)
          return
        }
      }

      // Jeśli access token nie działa, spróbuj refresh token
      const refreshToken = localStorage.getItem('customerRefreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await fetch(`${API_URL}/api/customer-auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Refresh failed')
      }

      const data = await response.json()
      localStorage.setItem('customerAccessToken', data.accessToken)
      localStorage.setItem('customerRefreshToken', data.refreshToken)

      // Pobierz dane użytkownika
      const meResponse = await fetch(`${API_URL}/api/customer-auth/me`, {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      })

      if (meResponse.ok) {
        const customerData = await meResponse.json()
        setCustomer(customerData)
      }
    } catch (error) {
      localStorage.removeItem('customerAccessToken')
      localStorage.removeItem('customerRefreshToken')
      setCustomer(null)
      throw error
    }
  }

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}
