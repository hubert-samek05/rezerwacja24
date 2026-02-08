'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, AlertCircle, ArrowLeft, RefreshCw, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function BookingPaymentErrorPage({ params }: { params: { subdomain: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [retrying, setRetrying] = useState(false)
  const bookingId = searchParams.get('bookingId')

  useEffect(() => {
    const error = searchParams.get('error')
    setErrorMessage(error || 'Wystąpił nieoczekiwany błąd podczas przetwarzania płatności')
  }, [searchParams])

  const handleRetryPayment = async () => {
    if (!bookingId) {
      router.push('/')
      return
    }
    
    setRetrying(true)
    try {
      // Pobierz dane rezerwacji
      const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') 
        ? 'https://api.rezerwacja24.pl' 
        : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`)
      if (response.ok) {
        const booking = await response.json()
        
        if (booking.status === 'PENDING' && !booking.isPaid) {
          // Rezerwacja nadal oczekuje - spróbuj ponownie utworzyć płatność
          // Zapisz bookingId do sessionStorage i przekieruj na stronę główną z parametrem
          sessionStorage.setItem('retryPaymentBookingId', bookingId)
          router.push('/?retryPayment=true')
        } else if (booking.status === 'CONFIRMED' || booking.isPaid) {
          // Rezerwacja już opłacona
          router.push('/payment/success?bookingId=' + bookingId)
        } else {
          // Rezerwacja anulowana lub inny status - wróć na stronę główną
          router.push('/')
        }
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error('Error retrying payment:', err)
      router.push('/')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Ikona błędu */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-red-500" />
            </motion.div>
          </div>

          {/* Tytuł */}
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
            Płatność nie powiodła się
          </h1>
          
          <p className="text-slate-500 text-center mb-6">
            Nie martw się - żadne środki nie zostały pobrane.
          </p>

          {/* Szczegóły błędu */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-700 font-medium mb-1">Powód błędu:</h3>
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            </div>
          </div>

          {/* Możliwe przyczyny */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <h3 className="text-slate-700 font-medium mb-3">Możliwe przyczyny:</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Niewystarczające środki na koncie</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Przekroczony limit transakcji</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Błędne dane karty lub wygasła karta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Transakcja odrzucona przez bank</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Anulowanie płatności przez użytkownika</span>
              </li>
            </ul>
          </div>

          {/* Co dalej? */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="text-blue-700 font-medium mb-2">Co możesz zrobić?</h3>
            <p className="text-blue-600 text-sm">
              Możesz spróbować ponownie za chwilę, użyć innej metody płatności 
              lub wybrać płatność na miejscu.
            </p>
          </div>

          {/* Przyciski akcji */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Powrót do strony
            </Link>
            
            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="flex-1 py-3 px-6 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {retrying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Ładowanie...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Ponów płatność
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
