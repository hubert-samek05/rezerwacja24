'use client'

import { useEffect, useState, useCallback } from 'react'

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | null>(null)
  const [isNative, setIsNative] = useState(false)

  // Sprawdź czy to aplikacja natywna
  useEffect(() => {
    const checkNative = () => {
      const isNativePlatform = typeof window !== 'undefined' && 
        (window.Capacitor?.isNativePlatform?.() || 
         window.navigator.userAgent.includes('Rezerwacja24App'))
      setIsNative(isNativePlatform)
    }
    checkNative()
  }, [])

  // Rejestruj token w backendzie
  const registerTokenInBackend = useCallback(async (fcmToken: string) => {
    try {
      const authToken = localStorage.getItem('token')
      const session = localStorage.getItem('rezerwacja24_session')
      const sessionData = session ? JSON.parse(session) : null
      const tenantId = sessionData?.tenantId
      const user = localStorage.getItem('user')
      const userData = user ? JSON.parse(user) : null
      const userId = userData?.id || sessionData?.user?.id

      if (!authToken || !tenantId || !userId) {
        console.log('[Push] Brak tokenu auth, tenantId lub userId:', { authToken: !!authToken, tenantId, userId })
        return false
      }

      const apiUrl = window.location.hostname.includes('bookings24.eu') 
        ? 'https://api.bookings24.eu' 
        : 'https://api.rezerwacja24.pl'

      console.log('[Push] Rejestruję token w backendzie...', { tenantId, userId })

      const response = await fetch(`${apiUrl}/api/notifications/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          token: fcmToken,
          platform: 'android',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[Push] Token zarejestrowany w backendzie:', result)
        return true
      } else {
        console.error('[Push] Błąd rejestracji tokenu:', await response.text())
        return false
      }
    } catch (error) {
      console.error('[Push] Błąd rejestracji tokenu:', error)
      return false
    }
  }, [])

  // Inicjalizuj push notifications
  const initPushNotifications = useCallback(async () => {
    if (!isNative) {
      console.log('[Push] Nie jest to aplikacja natywna')
      return
    }

    const PushNotifications = window.Capacitor?.Plugins?.PushNotifications
    if (!PushNotifications) {
      console.log('[Push] Plugin PushNotifications niedostępny')
      return
    }

    try {
      // Poproś o uprawnienia
      const permResult = await PushNotifications.requestPermissions()
      console.log('[Push] Uprawnienia:', permResult.receive)
      setPermissionStatus(permResult.receive as 'granted' | 'denied' | 'prompt')

      if (permResult.receive !== 'granted') {
        console.log('[Push] Brak uprawnień do powiadomień')
        return
      }

      // Nasłuchuj na token
      await PushNotifications.addListener('registration', async (tokenData: { value: string }) => {
        console.log('[Push] Otrzymano token FCM:', tokenData.value.substring(0, 20) + '...')
        setToken(tokenData.value)
        
        // Zapisz token lokalnie
        localStorage.setItem('fcm_token', tokenData.value)
        
        // Zarejestruj w backendzie
        await registerTokenInBackend(tokenData.value)
      })

      // Nasłuchuj na błędy
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('[Push] Błąd rejestracji:', error)
      })

      // Nasłuchuj na powiadomienia gdy app jest otwarta
      await PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('[Push] Otrzymano powiadomienie:', notification)
        // Możesz tu pokazać toast lub zaktualizować UI
      })

      // Nasłuchuj na kliknięcie w powiadomienie
      await PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
        console.log('[Push] Kliknięto powiadomienie:', action)
        // Możesz tu nawigować do odpowiedniej strony
        const data = action.notification?.data
        if (data?.type === 'new_booking') {
          window.location.href = '/dashboard/bookings'
        } else if (data?.type === 'booking_reminder') {
          window.location.href = '/dashboard/calendar'
        }
      })

      // Zarejestruj się do FCM
      await PushNotifications.register()
      console.log('[Push] Zarejestrowano do FCM')

    } catch (error) {
      console.error('[Push] Błąd inicjalizacji:', error)
    }
  }, [isNative, registerTokenInBackend])

  // Inicjalizuj przy montowaniu
  useEffect(() => {
    if (isNative) {
      // Opóźnij inicjalizację żeby dać czas na załadowanie
      const timer = setTimeout(() => {
        initPushNotifications()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isNative, initPushNotifications])

  // Cleanup przy odmontowaniu
  useEffect(() => {
    return () => {
      if (isNative && window.Capacitor?.Plugins?.PushNotifications) {
        window.Capacitor.Plugins.PushNotifications.removeAllListeners()
      }
    }
  }, [isNative])

  return {
    token,
    permissionStatus,
    isNative,
    initPushNotifications,
  }
}
