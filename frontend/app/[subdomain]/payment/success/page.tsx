'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Loader2, ArrowLeft, Clock, XCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function BookingPaymentSuccessPage({ params }: { params: { subdomain: string } }) {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'cancelled'>('loading')
  const [message, setMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const bookingId = searchParams.get('bookingId')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!bookingId) {
        setStatus('cancelled')
        setMessage('Brak identyfikatora rezerwacji')
        return
      }

      try {
        const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') 
          ? 'https://api.rezerwacja24.pl' 
          : 'http://localhost:3001'
        
        const response = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'CONFIRMED' || data.isPaid === true) {
            // Płatność potwierdzona!
            setStatus('success')
            setMessage('Twoja rezerwacja została potwierdzona!')
          } else if (data.status === 'PENDING') {
            // Płatność jeszcze nie przetworzona - sprawdź ponownie za chwilę
            if (retryCount < 5) {
              // Czekaj i sprawdź ponownie (webhook może jeszcze nie dotrzeć)
              setStatus('pending')
              setMessage('Sprawdzamy status płatności...')
              setTimeout(() => setRetryCount(prev => prev + 1), 2000)
            } else {
              // Po 5 próbach - pokaż że płatność nie przeszła
              setStatus('cancelled')
              setMessage('Płatność nie została zrealizowana lub została anulowana.')
            }
          } else if (data.status === 'CANCELLED') {
            setStatus('cancelled')
            setMessage('Rezerwacja została anulowana.')
          } else {
            setStatus('pending')
            setMessage('Sprawdzamy status płatności...')
          }
        } else {
          setStatus('cancelled')
          setMessage('Nie udało się sprawdzić statusu płatności.')
        }
      } catch (err) {
        setStatus('cancelled')
        setMessage('Wystąpił błąd podczas sprawdzania statusu płatności.')
      }
    }

    checkPaymentStatus()
  }, [bookingId, retryCount])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* ŁADOWANIE */}
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center"
                >
                  <Loader2 className="w-12 h-12 text-teal-500" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Przetwarzanie płatności...</h1>
              <p className="text-slate-500">Proszę czekać</p>
            </>
          )}
          
          {/* OCZEKIWANIE NA WEBHOOK */}
          {status === 'pending' && (
            <>
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center"
                >
                  <Clock className="w-12 h-12 text-amber-500" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Sprawdzamy płatność...</h1>
              <p className="text-slate-500 mb-4">{message}</p>
              <p className="text-slate-400 text-sm">Próba {retryCount + 1} z 5</p>
            </>
          )}
          
          {/* SUKCES */}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Płatność zakończona!</h1>
              <p className="text-slate-500 mb-6">{message}</p>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Rezerwacja potwierdzona</span>
                </div>
                <p className="text-green-600 text-sm mt-2">
                  Otrzymasz SMS z potwierdzeniem i szczegółami wizyty.
                </p>
              </div>
              
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Powrót do strony
              </Link>
            </>
          )}
          
          {/* ANULOWANE / BŁĄD */}
          {status === 'cancelled' && (
            <>
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center"
                >
                  <XCircle className="w-12 h-12 text-red-500" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Płatność nie powiodła się</h1>
              <p className="text-slate-500 mb-6">{message}</p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-700 text-sm">
                  Twoja rezerwacja została zapisana, ale wymaga płatności. 
                  Możesz spróbować ponownie lub wybrać płatność na miejscu.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Powrót
                </Link>
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Spróbuj ponownie
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
