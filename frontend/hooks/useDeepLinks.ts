'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useDeepLinks() {
  const router = useRouter()

  useEffect(() => {
    const isNative = typeof window !== 'undefined' && 
      (window.Capacitor?.isNativePlatform?.() || 
       window.navigator.userAgent.includes('Rezerwacja24App'))

    if (!isNative) return

    const App = window.Capacitor?.Plugins?.App
    const Browser = window.Capacitor?.Plugins?.Browser

    if (!App) {
      console.log('[DeepLinks] App plugin not available')
      return
    }

    let cleanup: (() => void) | null = null

    const setupListener = async () => {
      try {
        // Nasłuchuj na deep linki (appUrlOpen)
        const listener = await App.addListener('appUrlOpen', async (event: { url: string }) => {
          console.log('[DeepLinks] Received URL:', event.url)
          
          // Zamknij przeglądarkę jeśli otwarta
          if (Browser) {
            try {
              await Browser.close()
            } catch (e) {
              // Ignoruj błąd jeśli przeglądarka nie była otwarta
            }
          }

          // Parsuj URL
          const url = new URL(event.url)
          const path = url.pathname
          const token = url.searchParams.get('token')

          console.log('[DeepLinks] Path:', path, 'Token:', token ? 'present' : 'none')

          // Obsłuż callback z Google OAuth
          if (path.includes('/auth/callback') && token) {
            console.log('[DeepLinks] Handling OAuth callback with token')
            
            // Dekoduj token i zapisz sesję
            try {
              const payload = decodeJwt(token)
              console.log('[DeepLinks] Token payload:', payload)

              if (payload && payload.sub) {
                // Zapisz token
                localStorage.setItem('token', token)

                // Utwórz dane użytkownika
                const userData = {
                  id: payload.sub,
                  email: payload.email,
                  role: payload.role || 'TENANT_OWNER',
                  tenantId: payload.tenantId,
                  firstName: payload.firstName || payload.email?.split('@')[0],
                }

                localStorage.setItem('user', JSON.stringify(userData))

                // Zapisz sesję dla persistent login
                localStorage.setItem('rezerwacja24_session', JSON.stringify({
                  token: token,
                  user: userData,
                  firstName: userData.firstName,
                  role: userData.role,
                  tenantId: userData.tenantId,
                  loginTime: new Date().toISOString()
                }))

                console.log('[DeepLinks] Session saved, redirecting to dashboard')

                // Przekieruj do dashboardu
                window.location.replace('/dashboard')
              } else {
                console.error('[DeepLinks] Invalid token payload')
                router.push('/login?error=invalid_token')
              }
            } catch (error) {
              console.error('[DeepLinks] Error processing token:', error)
              router.push('/login?error=auth_failed')
            }
          } else {
            // Inne deep linki - nawiguj do ścieżki
            router.push(path + url.search)
          }
        })

        cleanup = () => listener.remove()
      } catch (error) {
        console.error('[DeepLinks] Error setting up listener:', error)
      }
    }

    setupListener()

    return () => {
      if (cleanup) cleanup()
    }
  }, [router])
}

// Funkcja do dekodowania JWT
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
