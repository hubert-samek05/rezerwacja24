'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Clock, User, AlertTriangle, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'

interface BookingDetails {
  id: string
  startTime: string
  status: string
  serviceName: string
  employeeName: string
  customerName: string
  businessName: string
  canCancel: boolean
  cancelDeadlineHours?: number
}

export default function CancelBookingPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmStep, setConfirmStep] = useState(false)

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId, subdomain])

  const fetchBookingDetails = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
      const response = await fetch(`${apiUrl}/api/public/booking/${bookingId}?subdomain=${subdomain}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Rezerwacja nie została znaleziona')
        } else {
          setError('Nie udało się pobrać szczegółów rezerwacji')
        }
        return
      }

      const data = await response.json()
      setBooking(data)
    } catch (err) {
      setError('Wystąpił błąd podczas ładowania rezerwacji')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    
    setCancelling(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
      const response = await fetch(`${apiUrl}/api/public/booking/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Nie udało się anulować rezerwacji')
        return
      }

      setCancelled(true)
    } catch (err) {
      setError('Wystąpił błąd podczas anulowania rezerwacji')
    } finally {
      setCancelling(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-slate-600">Ładowanie szczegółów rezerwacji...</p>
        </div>
      </div>
    )
  }

  if (error) {
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

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Rezerwacja anulowana</h1>
          <p className="text-slate-600 mb-6">
            Twoja rezerwacja została pomyślnie anulowana. Dziękujemy za powiadomienie.
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

  if (!booking) return null

  const isPastBooking = new Date(booking.startTime) < new Date()
  const isAlreadyCancelled = booking.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Anulowanie rezerwacji</h1>
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

        {/* Status messages */}
        {isAlreadyCancelled && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-slate-600">Ta rezerwacja została już anulowana.</p>
          </div>
        )}

        {isPastBooking && !isAlreadyCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600">Nie można anulować rezerwacji, która już się odbyła.</p>
          </div>
        )}

        {!booking.canCancel && !isPastBooking && !isAlreadyCancelled && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-amber-700">
              Anulowanie rezerwacji jest możliwe do {booking.cancelDeadlineHours || 24} godzin przed wizytą.
              Skontaktuj się bezpośrednio z firmą.
            </p>
          </div>
        )}

        {/* Actions */}
        {!confirmStep && booking.canCancel && !isPastBooking && !isAlreadyCancelled ? (
          <div className="space-y-3">
            <button
              onClick={() => setConfirmStep(true)}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Anuluj rezerwację
            </button>
            <button
              onClick={() => router.push(`/${subdomain}`)}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Wróć
            </button>
          </div>
        ) : confirmStep ? (
          <div className="space-y-3">
            <p className="text-center text-slate-600 mb-4">
              Czy na pewno chcesz anulować tę rezerwację? Tej operacji nie można cofnąć.
            </p>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Anulowanie...
                </>
              ) : (
                'Tak, anuluj rezerwację'
              )}
            </button>
            <button
              onClick={() => setConfirmStep(false)}
              disabled={cancelling}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Nie, zachowaj rezerwację
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push(`/${subdomain}`)}
            className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Wróć do strony głównej
          </button>
        )}
      </div>
    </div>
  )
}
