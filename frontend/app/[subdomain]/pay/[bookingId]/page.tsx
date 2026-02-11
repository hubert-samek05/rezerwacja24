'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CreditCard, Calendar, Clock, User, CheckCircle, XCircle, Loader2, ArrowLeft, Wallet, AlertCircle } from 'lucide-react'

interface BookingDetails {
  id: string
  startTime: string
  status: string
  paymentStatus: string
  paymentMethod: string
  serviceName: string
  employeeName: string
  customerName: string
  customerEmail: string
  businessName: string
  totalPrice: number
  depositAmount?: number
  depositPaid?: boolean
  canPayOnline: boolean
  availableProviders: string[]
}

export default function PayBookingPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId, subdomain])

  const fetchBookingDetails = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
      const response = await fetch(`${apiUrl}/api/public/booking/${bookingId}/payment?subdomain=${subdomain}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Rezerwacja nie została znaleziona')
        } else if (response.status === 400) {
          const data = await response.json()
          setError(data.message || 'Ta rezerwacja nie wymaga płatności online')
        } else {
          setError('Nie udało się pobrać szczegółów rezerwacji')
        }
        return
      }

      const data = await response.json()
      setBooking(data)
      setEmail(data.customerEmail || '')
      
      // Ustaw domyślnego providera
      if (data.availableProviders?.length > 0) {
        setSelectedProvider(data.availableProviders[0])
      }
    } catch (err) {
      setError('Wystąpił błąd podczas ładowania rezerwacji')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!booking || !selectedProvider || !email) return
    
    setProcessing(true)
    setError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
      const response = await fetch(`${apiUrl}/api/public/booking/${bookingId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subdomain,
          provider: selectedProvider,
          email
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Nie udało się utworzyć płatności')
        return
      }

      const data = await response.json()
      
      if (data.paymentUrl) {
        // Przekieruj do bramki płatności
        window.location.href = data.paymentUrl
      } else {
        setError('Nie udało się utworzyć linku do płatności')
      }
    } catch (err) {
      setError('Wystąpił błąd podczas tworzenia płatności')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'przelewy24': return 'Przelewy24'
      case 'stripe': return 'Karta płatnicza'
      case 'payu': return 'PayU'
      case 'tpay': return 'Tpay'
      default: return provider
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-slate-600">Ładowanie szczegółów płatności...</p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Błąd</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/${subdomain}`)}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const isPaid = booking.paymentStatus === 'paid'
  const isCancelled = booking.status === 'CANCELLED'
  const isPastBooking = new Date(booking.startTime) < new Date()
  const amountToPay = booking.depositAmount && !booking.depositPaid 
    ? booking.depositAmount 
    : booking.totalPrice

  // Jeśli metoda płatności to gotówka i nie ma zaliczki - nie można płacić online
  const cannotPayOnline = booking.paymentMethod === 'cash' && !booking.depositAmount

  if (isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Płatność zrealizowana</h1>
          <p className="text-slate-600 mb-6">
            Ta rezerwacja została już opłacona. Dziękujemy!
          </p>
          <button
            onClick={() => router.push(`/${subdomain}`)}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    )
  }

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Rezerwacja anulowana</h1>
          <p className="text-slate-600 mb-6">
            Ta rezerwacja została anulowana i nie wymaga płatności.
          </p>
          <button
            onClick={() => router.push(`/${subdomain}`)}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Zarezerwuj ponownie
          </button>
        </div>
      </div>
    )
  }

  if (cannotPayOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Wallet className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Płatność na miejscu</h1>
          <p className="text-slate-600 mb-6">
            Ta rezerwacja jest ustawiona na płatność gotówką na miejscu. 
            Płatność online nie jest dostępna.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-500">Do zapłaty na miejscu</p>
            <p className="text-3xl font-bold text-slate-800">{booking.totalPrice} zł</p>
          </div>
          <button
            onClick={() => router.push(`/${subdomain}`)}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Opłać rezerwację</h1>
          <p className="text-slate-500 mt-1">{booking.businessName}</p>
        </div>

        {/* Booking details */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Data</p>
              <p className="font-medium text-slate-800">{formatDate(booking.startTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Godzina</p>
              <p className="font-medium text-slate-800">{formatTime(booking.startTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Usługa</p>
              <p className="font-medium text-slate-800">{booking.serviceName}</p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-teal-600 mb-1">
            {booking.depositAmount && !booking.depositPaid ? 'Zaliczka do zapłaty' : 'Do zapłaty'}
          </p>
          <p className="text-3xl font-bold text-teal-700">{amountToPay} zł</p>
          {booking.depositAmount && !booking.depositPaid && (
            <p className="text-xs text-teal-600 mt-1">
              Pozostała kwota ({booking.totalPrice - booking.depositAmount} zł) płatna na miejscu
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email (do potwierdzenia płatności)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Payment provider selection */}
        {booking.availableProviders.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Metoda płatności
            </label>
            <div className="space-y-2">
              {booking.availableProviders.map((provider) => (
                <label
                  key={provider}
                  className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedProvider === provider 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={provider}
                    checked={selectedProvider === provider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-4 h-4 text-teal-500"
                  />
                  <span className="font-medium text-slate-700">{getProviderName(provider)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={processing || !email || !selectedProvider}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Przekierowywanie...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Zapłać {amountToPay} zł
              </>
            )}
          </button>
          <button
            onClick={() => router.push(`/${subdomain}`)}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć
          </button>
        </div>
      </div>
    </div>
  )
}
