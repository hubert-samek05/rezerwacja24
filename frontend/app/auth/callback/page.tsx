'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

// Funkcja do dekodowania JWT bez weryfikacji (tylko odczyt payload)
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Inicjalizacja...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    
    console.log('[AuthCallback] Token received:', token ? 'yes' : 'no')
    
    if (token) {
      const handleAuth = async () => {
        try {
          setStatus('Dekodowanie tokena...')
          console.log('[AuthCallback] Decoding token...')
          
          // Dekoduj token JWT aby pobrać dane użytkownika
          const payload = decodeJwt(token)
          console.log('[AuthCallback] Payload:', payload)
          
          if (!payload || !payload.sub) {
            throw new Error('Invalid token payload - missing sub')
          }

          setStatus('Zapisywanie tokena...')
          // Zapisz token w localStorage
          localStorage.setItem('token', token)
          console.log('[AuthCallback] Token saved to localStorage')
          
          // Pobierz pełne dane użytkownika z API tenants (który istnieje)
          const isProduction = typeof window !== 'undefined' && 
            (window.location.hostname.includes('rezerwacja24.pl') || window.location.hostname.includes('bookings24.eu'))
          const apiUrl = isProduction 
            ? (window.location.hostname.includes('bookings24.eu') ? 'https://api.bookings24.eu' : 'https://api.rezerwacja24.pl')
            : 'http://localhost:3001'
          
          console.log('[AuthCallback] API URL:', apiUrl)
          
          // Pobierz dane tenanta jeśli mamy tenantId
          let tenant = null
          if (payload.tenantId) {
            setStatus('Pobieranie danych firmy...')
            try {
              console.log('[AuthCallback] Fetching tenant:', payload.tenantId)
              const tenantResponse = await fetch(`${apiUrl}/api/tenants/${payload.tenantId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'x-tenant-id': payload.tenantId,
                },
              })
              console.log('[AuthCallback] Tenant response status:', tenantResponse.status)
              if (tenantResponse.ok) {
                tenant = await tenantResponse.json()
                console.log('[AuthCallback] Tenant data:', tenant)
              }
            } catch (e) {
              console.warn('[AuthCallback] Could not fetch tenant data:', e)
            }
          }
          
          // Utwórz obiekt użytkownika z danych JWT
          const userData = {
            id: payload.sub,
            email: payload.email,
            role: payload.role || 'TENANT_OWNER',
            tenantId: payload.tenantId,
            tenant: tenant,
            firstName: payload.firstName || payload.email?.split('@')[0],
          }
          
          localStorage.setItem('user', JSON.stringify(userData))
          console.log('[AuthCallback] User data saved:', userData)
          
          // Zapisz sesję dla aplikacji mobilnej (persistent login)
          localStorage.setItem('rezerwacja24_session', JSON.stringify({
            token: token,
            user: userData,
            firstName: userData.firstName,
            role: userData.role,
            tenantId: userData.tenantId,
            loginTime: new Date().toISOString()
          }))
          
          setStatus('Ustawianie sesji...')
          // Zapisz token w httpOnly cookie
          const setCookieResponse = await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })
          console.log('[AuthCallback] Set-token response:', setCookieResponse.status)
          
          if (!setCookieResponse.ok) {
            console.error('[AuthCallback] Failed to set cookie')
          }
          
          setStatus('Przekierowywanie...')
          // Przekieruj do dashboardu lub admin panelu
          const redirectUrl = payload.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'
          console.log('[AuthCallback] Redirecting to:', redirectUrl)
          
          // Użyj window.location.replace zamiast href dla pewniejszego przekierowania
          window.location.replace(redirectUrl)
        } catch (error) {
          console.error('[AuthCallback] Error:', error)
          setError(error instanceof Error ? error.message : 'Unknown error')
          setTimeout(() => {
            router.push('/login?error=auth_failed')
          }, 3000)
        }
      }

      handleAuth()
    } else {
      console.log('[AuthCallback] No token in URL')
      setError('Brak tokena w URL')
      setTimeout(() => {
        router.push('/login?error=no_token')
      }, 2000)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-carbon-black flex items-center justify-center">
      <div className="text-center">
        <Calendar className="w-16 h-16 text-accent-neon mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">Logowanie...</h2>
        <p className="text-neutral-gray mb-2">{status}</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}
