'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      // Sprawdź czy użytkownik jest zalogowany (nowy system JWT)
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      // Fallback do starego systemu dla kompatybilności
      const oldSession = localStorage.getItem('rezerwacja24_session')
      
      if (!token && !oldSession) {
        // Brak sesji - przekieruj do logowania
        setIsAuthenticated(false)
        setIsChecking(false)
        router.push('/login')
        return
      }

      try {
        if (token && user) {
          // Nowy system JWT
          const userData = JSON.parse(user)
          if (userData.id && userData.email && userData.tenantId) {
            setIsAuthenticated(true)
          } else {
            // Niepełne dane - wyloguj
            localStorage.clear()
            sessionStorage.clear()
            setIsAuthenticated(false)
            router.push('/login')
          }
        } else if (oldSession) {
          // Stary system dla kompatybilności
          const sessionData = JSON.parse(oldSession)
          if (!sessionData.loggedIn || !sessionData.userId) {
            localStorage.clear()
            sessionStorage.clear()
            setIsAuthenticated(false)
            router.push('/login')
          } else {
            setIsAuthenticated(true)
          }
        } else {
          // Nieprawidłowy stan - wyloguj
          localStorage.clear()
          sessionStorage.clear()
          setIsAuthenticated(false)
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Błąd parsowania - wyczyść i wyloguj
        localStorage.clear()
        sessionStorage.clear()
        setIsAuthenticated(false)
        router.push('/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-gray">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
