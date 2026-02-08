'use client'

import { useState, useEffect, useRef } from 'react'
import { getApiUrl } from '@/lib/api-url'
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  sub: string
  email: string
  tenantId: string
}

interface AccountStatus {
  isSuspended: boolean
  suspendedReason: string | null
  subscriptionStatus: string | null
  paymentError: string | null
  loading: boolean
}

// Cache dla statusu konta (5 minut)
const STATUS_CACHE_KEY = 'account_status_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minut

function getCachedStatus(): { isSuspended: boolean; suspendedReason: string | null } | null {
  try {
    const cached = sessionStorage.getItem(STATUS_CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_TTL) {
        return data
      }
    }
  } catch {}
  return null
}

function setCachedStatus(data: { isSuspended: boolean; suspendedReason: string | null }) {
  try {
    sessionStorage.setItem(STATUS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

export function useAccountStatus(): AccountStatus {
  const [isSuspended, setIsSuspended] = useState(false)
  const [suspendedReason, setSuspendedReason] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const checkedRef = useRef(false)

  useEffect(() => {
    // Sprawdź cache najpierw
    const cached = getCachedStatus()
    if (cached) {
      setIsSuspended(cached.isSuspended)
      setSuspendedReason(cached.suspendedReason)
      setLoading(false)
      checkedRef.current = true
    }

    const checkAccountStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }

        let tenantId: string | null = null
        try {
          const decoded = jwtDecode<JWTPayload>(token)
          tenantId = decoded.tenantId
        } catch {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            tenantId = JSON.parse(userStr).tenantId
          }
        }
        
        if (!tenantId) {
          setLoading(false)
          return
        }

        const apiUrl = getApiUrl()

        // Sprawdź status konta
        const response = await fetch(`${apiUrl}/api/tenants/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const status = {
            isSuspended: data.isSuspended || false,
            suspendedReason: data.suspendedReason || null,
            subscriptionStatus: data.subscriptionStatus || null,
            paymentError: data.paymentError || null
          }
          setIsSuspended(status.isSuspended)
          setSuspendedReason(status.suspendedReason)
          setSubscriptionStatus(status.subscriptionStatus)
          setPaymentError(status.paymentError)
          setCachedStatus(status)
        }
      } catch (error) {
        // Cicho ignoruj błędy
      } finally {
        setLoading(false)
      }
    }

    // Sprawdź tylko raz przy montowaniu (lub jeśli nie ma cache)
    if (!checkedRef.current) {
      checkAccountStatus()
      checkedRef.current = true
    }

    // Sprawdzaj co 5 minut (zamiast 30 sekund)
    const interval = setInterval(checkAccountStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { isSuspended, suspendedReason, subscriptionStatus, paymentError, loading }
}
