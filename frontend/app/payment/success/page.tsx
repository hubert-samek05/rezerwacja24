'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Loader2, CreditCard } from 'lucide-react'

// Wykryj domenę
function detectDomain() {
  if (typeof window === 'undefined') {
    return { isEnglish: false, apiUrl: 'https://api.rezerwacja24.pl' }
  }
  const hostname = window.location.hostname
  const isEnglish = hostname.includes('bookings24.eu')
  return {
    isEnglish,
    apiUrl: isEnglish ? 'https://api.bookings24.eu' : hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
  }
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEnglish, setIsEnglish] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [syncing, setSyncing] = useState(true)
  const [error, setError] = useState('')
  const [paymentType, setPaymentType] = useState<'subscription' | 'booking'>('subscription')
  
  // Wykryj domenę po stronie klienta
  useEffect(() => {
    const { isEnglish: isEn } = detectDomain()
    setIsEnglish(isEn)
    setIsClient(true)
  }, [])

  useEffect(() => {
    const processPayment = async () => {
      try {
        const currentApiUrl = detectDomain().apiUrl
        
        // Sprawdź parametry URL - Autopay/PayU zwracają OrderID, ServiceID, Hash
        const bookingId = searchParams.get('bookingId')
        const orderId = searchParams.get('OrderID') || searchParams.get('orderId')
        const serviceId = searchParams.get('ServiceID') || searchParams.get('serviceId')
        const hash = searchParams.get('Hash') || searchParams.get('hash')
        
        // ============================================
        // PRZYPADEK 1: Płatność za rezerwację (Autopay/PayU/Tpay)
        // ============================================
        if (orderId) {
          setPaymentType('booking')
          console.log('💳 Płatność za rezerwację - automatyczna weryfikacja...', { orderId, serviceId })
          
          // Wywołaj endpoint potwierdzający płatność (bez webhooka!)
          const response = await fetch(`${currentApiUrl}/api/payments/confirm-return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, serviceId, hash }),
          })
          
          const result = await response.json()
          console.log('📡 Confirm payment result:', result)
          
          setSyncing(false)
          
          if (result.success) {
            // Płatność potwierdzona - pokaż sukces
            setTimeout(() => {
              // Wróć do strony firmy (subdomena)
              const currentHost = window.location.hostname
              if (currentHost.includes('.rezerwacja24.pl') || currentHost.includes('.bookings24.eu')) {
                window.location.href = '/'
              } else {
                window.location.href = '/'
              }
            }, 3000)
          } else {
            // Błąd weryfikacji - ale klient zapłacił, więc pokaż info
            console.warn('⚠️ Weryfikacja nie powiodła się, ale płatność mogła się udać')
            setTimeout(() => {
              window.location.href = '/'
            }, 3000)
          }
          return
        }
        
        // ============================================
        // PRZYPADEK 2: Subskrypcja Stripe (panel właściciela)
        // ============================================
        setPaymentType('subscription')
        
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        const tenantId = userData ? JSON.parse(userData).tenantId : null
        
        // Jeśli brak tokena - pokaż sukces i przekieruj do logowania
        if (!token) {
          console.log('⚠️ Brak tokena - płatność zakończona, przekierowanie do logowania')
          setSyncing(false)
          setTimeout(() => {
            window.location.href = '/login?payment=success'
          }, 3000)
          return
        }

        // Synchronizuj subskrypcję ze Stripe
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
        
        if (tenantId) {
          headers['x-tenant-id'] = tenantId
        }

        const response = await fetch(`${currentApiUrl}/api/billing/subscription/sync`, {
          method: 'POST',
          headers,
        })

        console.log('📡 Sync response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Subskrypcja zsynchronizowana:', data)
        }
        
        setSyncing(false)
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
        
      } catch (err) {
        console.error('Błąd przetwarzania płatności:', err)
        setSyncing(false)
        setTimeout(() => {
          window.location.href = paymentType === 'booking' ? '/' : '/dashboard'
        }, 2000)
      }
    }

    processPayment()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-carbon-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="glass-card p-8 text-center">
          {syncing ? (
            <>
              {/* Ikona ładowania */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 bg-accent-neon/20 rounded-full flex items-center justify-center"
                >
                  <Loader2 className="w-16 h-16 text-accent-neon" />
                </motion.div>
              </div>

              {/* Tytuł */}
              <h1 className="text-2xl font-bold text-white mb-4">
                {isEnglish ? 'Payment successful!' : 'Płatność zakończona sukcesem!'}
              </h1>
              
              <p className="text-neutral-gray mb-4">
                {paymentType === 'booking' 
                  ? (isEnglish ? 'Confirming your booking...' : 'Potwierdzamy Twoją rezerwację...')
                  : (isEnglish ? 'Syncing your subscription...' : 'Synchronizujemy Twoją subskrypcję...')
                }
              </p>
              
              <p className="text-sm text-neutral-gray/70">
                {isEnglish ? 'Please wait...' : 'Proszę czekać...'}
              </p>
            </>
          ) : error ? (
            <>
              {/* Błąd */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-red-400" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">
                {isEnglish ? 'An issue occurred' : 'Wystąpił problem'}
              </h1>
              
              <p className="text-neutral-gray mb-6">
                {error}
              </p>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-accent-neon hover:bg-accent-neon/90 text-carbon-black font-bold py-3 px-6 rounded-lg transition-all"
              >
                {isEnglish ? 'Go back' : 'Wróć'}
              </button>
            </>
          ) : (
            <>
              {/* Sukces */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="w-24 h-24 bg-accent-neon/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-accent-neon" />
                </motion.div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">
                {paymentType === 'booking'
                  ? (isEnglish ? 'Booking confirmed!' : 'Rezerwacja potwierdzona!')
                  : (isEnglish ? 'All set!' : 'Wszystko gotowe!')
                }
              </h1>
              
              <p className="text-neutral-gray mb-2">
                {paymentType === 'booking'
                  ? (isEnglish ? 'Your payment has been received.' : 'Twoja płatność została przyjęta.')
                  : (isEnglish ? 'Your subscription is active.' : 'Twoja subskrypcja jest aktywna.')
                }
              </p>
              
              <p className="text-sm text-neutral-gray/70">
                {isEnglish ? 'Redirecting...' : 'Przekierowywanie...'}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
