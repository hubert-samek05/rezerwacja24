'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

// Wykryj domenę
function detectDomain() {
  if (typeof window === 'undefined') {
    return { isEnglish: false, mainUrl: 'https://rezerwacja24.pl' }
  }
  const hostname = window.location.hostname
  const isEnglish = hostname.includes('bookings24.eu')
  return {
    isEnglish,
    mainUrl: isEnglish ? 'https://bookings24.eu' : 'https://rezerwacja24.pl'
  }
}

export default function PaymentErrorPage() {
  const searchParams = useSearchParams()
  const [mainUrl, setMainUrl] = useState('https://rezerwacja24.pl')
  const [isEnglish, setIsEnglish] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [bookingId, setBookingId] = useState('')

  // Wykryj domenę po stronie klienta
  useEffect(() => {
    const { isEnglish: isEn, mainUrl: url } = detectDomain()
    setIsEnglish(isEn)
    setMainUrl(url)
    setIsClient(true)
    
    // Ustaw komunikat błędu
    const error = searchParams.get('error')
    const id = searchParams.get('bookingId')
    setErrorMessage(error || (isEn ? 'An unexpected error occurred while processing your payment' : 'Wystąpił nieoczekiwany błąd podczas przetwarzania płatności'))
    setBookingId(id || '')
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
          {/* Ikona błędu */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-16 h-16 text-white" />
            </motion.div>
          </div>

          {/* Tytuł */}
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            {isEnglish ? 'Payment failed' : 'Płatność nie powiodła się'}
          </h1>
          
          <p className="text-neutral-gray text-center mb-8">
            {isEnglish ? "Unfortunately, we couldn't process your payment. Don't worry - no funds were charged." : 'Niestety, nie udało się przetworzyć Twojej płatności. Nie martw się - żadne środki nie zostały pobrane.'}
          </p>

          {/* Szczegóły błędu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-red-300 font-semibold mb-2">{isEnglish ? 'Error reason:' : 'Powód błędu:'}</h3>
                <p className="text-red-200 text-sm">{errorMessage}</p>
              </div>
            </div>
          </motion.div>

          {/* Możliwe przyczyny */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-white font-semibold mb-3">{isEnglish ? 'Possible causes:' : 'Możliwe przyczyny:'}</h3>
            <ul className="space-y-2 text-neutral-gray text-sm">
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{isEnglish ? 'Insufficient funds' : 'Niewystarczające środki na koncie'}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{isEnglish ? 'Transaction limit exceeded' : 'Przekroczony limit transakcji'}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{isEnglish ? 'Invalid card details or expired card' : 'Błędne dane karty lub wygasła karta'}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{isEnglish ? 'Internet connection issue' : 'Problem z połączeniem internetowym'}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{isEnglish ? 'Transaction declined by bank' : 'Transakcja odrzucona przez bank'}</span>
              </li>
            </ul>
          </div>

          {/* Co dalej? */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
            <h3 className="text-blue-300 font-semibold mb-2">{isEnglish ? 'What can you do?' : 'Co możesz zrobić?'}</h3>
            <p className="text-blue-200 text-sm">
              {isEnglish ? 'You can try again in a moment, use a different payment method, or contact us to make a reservation by phone.' : 'Możesz spróbować ponownie za chwilę, użyć innej metody płatności lub skontaktować się z nami w celu dokonania rezerwacji telefonicznie.'}
            </p>
          </div>

          {/* Przyciski akcji */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={mainUrl}
              className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{isEnglish ? 'Back to homepage' : 'Powrót do strony głównej'}</span>
            </Link>
            
            {bookingId && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>{isEnglish ? 'Try again' : 'Spróbuj ponownie'}</span>
              </button>
            )}
          </div>

          {/* Pomoc */}
          <div className="mt-8 text-center">
            <p className="text-neutral-gray text-sm">
              {isEnglish ? 'Need help?' : 'Potrzebujesz pomocy?'}{' '}
              <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 underline">
                {isEnglish ? 'Contact us' : 'Skontaktuj się z nami'}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
