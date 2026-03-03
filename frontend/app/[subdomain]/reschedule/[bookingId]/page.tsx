'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Clock, User, CalendarClock, CheckCircle, XCircle, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

interface BookingDetails {
  id: string
  startTime: string
  endTime?: string
  status: string
  serviceName: string
  serviceId?: string
  serviceDuration?: number
  employeeName: string
  employeeId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  businessName: string
  tenantId?: string
  canReschedule?: boolean
  rescheduleDeadlineHours?: number
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function RescheduleBookingPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const bookingId = params.bookingId as string
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Wybór nowego terminu
  const [step, setStep] = useState<'info' | 'date' | 'time' | 'confirm'>('info')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Kalendarz
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId, subdomain])

  const fetchBookingDetails = async () => {
    try {
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

  const fetchAvailableSlots = async (date: string) => {
    if (!booking?.serviceId || !booking?.tenantId) {
      console.error('Missing serviceId or tenantId', { serviceId: booking?.serviceId, tenantId: booking?.tenantId })
      return
    }
    
    setLoadingSlots(true)
    try {
      // Użyj employeeId jeśli jest, w przeciwnym razie 'any'
      const employeeId = booking.employeeId || 'any'
      const duration = booking.serviceDuration || 60
      
      const response = await fetch(
        `${apiUrl}/api/bookings/availability?tenantId=${booking.tenantId}&serviceId=${booking.serviceId}&employeeId=${employeeId}&date=${date}&duration=${duration}`
      )
      
      if (response.ok) {
        const data = await response.json()
        // Backend zwraca availableSlots, nie slots
        setAvailableSlots(data.availableSlots || data.slots || [])
      } else {
        console.error('Availability response not ok:', response.status)
        setAvailableSlots([])
      }
    } catch (err) {
      console.error('Error fetching slots:', err)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    fetchAvailableSlots(date)
    setStep('time')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('confirm')
  }

  const handleConfirmReschedule = async () => {
    if (!booking || !selectedDate || !selectedTime) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`${apiUrl}/api/public/booking/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          newDate: selectedDate,
          newTime: selectedTime,
        })
      })
      
      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.message || 'Nie udało się przesunąć rezerwacji')
      }
    } catch (err) {
      setError('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setSubmitting(false)
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

  // Generuj dni miesiąca
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Poniedziałek = 0
    const daysInMonth = lastDay.getDate()
    
    const days: (number | null)[] = []
    for (let i = 0; i < startDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    
    return days
  }

  const isDateSelectable = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const formatSelectedDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Błąd</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Wróć
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Termin przesunięty!</h1>
          <p className="text-slate-600 mb-2">Twoja rezerwacja została przesunięta na:</p>
          <p className="text-lg font-semibold text-teal-600 mb-1">{formatSelectedDate(selectedDate)}</p>
          <p className="text-lg font-semibold text-teal-600 mb-6">godz. {selectedTime}</p>
          <button
            onClick={() => window.location.href = `https://${subdomain}.rezerwacja24.pl`}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Wróć do strony firmy
          </button>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const isPastBooking = new Date(booking.startTime) < new Date()
  const isAlreadyCancelled = booking.status === 'CANCELLED'
  const canReschedule = booking.canReschedule !== false && !isPastBooking && !isAlreadyCancelled

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarClock className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Przesunięcie terminu</h1>
          <p className="text-slate-500 text-sm mt-1">{booking.businessName}</p>
        </div>

        {/* Status messages for non-reschedulable bookings */}
        {!canReschedule && (
          <>
            {isAlreadyCancelled && (
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-slate-600">Ta rezerwacja została już anulowana.</p>
              </div>
            )}
            {isPastBooking && !isAlreadyCancelled && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-red-600">Nie można przesunąć rezerwacji, która już się odbyła.</p>
              </div>
            )}
            {!isPastBooking && !isAlreadyCancelled && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-amber-700">
                  Przesunięcie jest możliwe do {booking.rescheduleDeadlineHours || 24}h przed wizytą. Skontaktuj się z firmą.
                </p>
              </div>
            )}
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Wróć
            </button>
          </>
        )}

        {/* Step: Info */}
        {canReschedule && step === 'info' && (
          <>
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Obecna rezerwacja</p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Usługa</span>
                  <span className="font-medium text-slate-800">{booking.serviceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Data</span>
                  <span className="font-medium text-slate-800">{formatDate(booking.startTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Godzina</span>
                  <span className="font-medium text-slate-800">{formatTime(booking.startTime)}</span>
                </div>
                {booking.employeeName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Specjalista</span>
                    <span className="font-medium text-slate-800">{booking.employeeName}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setStep('date')}
              className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
            >
              Wybierz nowy termin
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 mt-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Anuluj
            </button>
          </>
        )}

        {/* Step: Date selection */}
        {canReschedule && step === 'date' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setStep('info')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <ChevronLeft className="w-4 h-4" /> Wstecz
              </button>
              <span className="text-sm font-medium text-slate-700">Wybierz datę</span>
              <div className="w-16"></div>
            </div>
            
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => {
                  if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
                  else setCurrentMonth(currentMonth - 1)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="font-semibold text-slate-800">
                {new Date(currentYear, currentMonth).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => {
                  if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
                  else setCurrentMonth(currentMonth + 1)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">{day}</div>
              ))}
              {generateCalendarDays().map((day, i) => (
                <div key={i} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => {
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        handleDateSelect(dateStr)
                      }}
                      disabled={!isDateSelectable(day)}
                      className={`w-full h-full rounded-lg text-sm font-medium transition-colors ${
                        isDateSelectable(day)
                          ? 'hover:bg-teal-500 hover:text-white text-slate-700'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step: Time selection */}
        {canReschedule && step === 'time' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setStep('date')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <ChevronLeft className="w-4 h-4" /> Wstecz
              </button>
              <span className="text-sm font-medium text-slate-700">{formatSelectedDate(selectedDate)}</span>
              <div className="w-16"></div>
            </div>
            
            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                    className="py-3 px-2 rounded-xl text-sm font-medium bg-slate-50 hover:bg-teal-500 hover:text-white text-slate-700 transition-colors"
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Brak dostępnych terminów w tym dniu</p>
                <button onClick={() => setStep('date')} className="mt-4 text-teal-500 hover:text-teal-600 font-medium">
                  Wybierz inną datę
                </button>
              </div>
            )}
          </>
        )}

        {/* Step: Confirm */}
        {canReschedule && step === 'confirm' && (
          <>
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Potwierdzenie zmiany</p>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-teal-600">Nowa data</p>
                    <p className="font-semibold text-teal-800">{formatSelectedDate(selectedDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-teal-600">Nowa godzina</p>
                    <p className="font-semibold text-teal-800">{selectedTime}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-amber-800 text-sm">Poprzedni termin zostanie automatycznie zwolniony.</p>
            </div>
            
            <button
              onClick={handleConfirmReschedule}
              disabled={submitting}
              className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Przetwarzanie...</>
              ) : (
                'Potwierdź zmianę terminu'
              )}
            </button>
            <button
              onClick={() => setStep('time')}
              disabled={submitting}
              className="w-full py-3 mt-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Zmień godzinę
            </button>
          </>
        )}
      </div>
    </div>
  )
}
