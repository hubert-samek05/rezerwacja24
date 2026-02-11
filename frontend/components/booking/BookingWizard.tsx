'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, User, CreditCard, Check, X, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, CheckCircle, XCircle, Wallet, Building2
} from 'lucide-react'

// Types
interface Service {
  id: string
  name: string
  description?: string
  price?: number
  basePrice?: string
  duration: number
  flexibleDuration?: boolean
  allowMultiDay?: boolean
  minDuration?: number
  maxDuration?: number
  durationStep?: number
  pricePerHour?: number
  pricePerDay?: number
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  avatar?: string
}

interface TimeSlot {
  time: string
  employeeId: string
  employeeName: string
}

interface PaymentSettings {
  acceptCashPayment?: boolean
  przelewy24Enabled?: boolean
  stripeEnabled?: boolean
  payuEnabled?: boolean
  tpayEnabled?: boolean
}

interface DepositInfo {
  required: boolean
  amount: number
  percentage?: number
}

interface BookingWizardProps {
  isOpen: boolean
  onClose: () => void
  service: Service
  employees: Employee[]
  companyName: string
  companyId: string
  paymentSettings?: PaymentSettings
  depositInfo?: DepositInfo | null
  onFetchSlots: (date: string, employeeId?: string) => Promise<TimeSlot[]>
  onSubmit: (data: BookingData) => Promise<{ success: boolean; paymentUrl?: string; error?: string }>
}

interface BookingData {
  serviceId: string
  employeeId: string
  date: string
  time: string
  duration: number
  customerName: string
  customerPhone: string
  customerEmail: string
  paymentMethod: string
  depositPaymentProvider?: string
}

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps, labels }: { currentStep: number; totalSteps: number; labels: string[] }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div key={step} className="flex items-center">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
          ${step < currentStep ? 'bg-teal-500 text-white' : ''}
          ${step === currentStep ? 'bg-slate-800 text-white ring-4 ring-slate-200' : ''}
          ${step > currentStep ? 'bg-slate-100 text-slate-400' : ''}
        `}>
          {step < currentStep ? <Check className="w-4 h-4" /> : step}
        </div>
        {step < totalSteps && (
          <div className={`w-8 h-0.5 mx-1 ${step < currentStep ? 'bg-teal-500' : 'bg-slate-200'}`} />
        )}
      </div>
    ))}
  </div>
)

// Mini calendar component
const MiniCalendar = ({ 
  selectedDate, 
  onSelectDate,
  minDate = new Date()
}: { 
  selectedDate: string
  onSelectDate: (date: string) => void
  minDate?: Date
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
  const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []
    
    // Add empty slots for days before first day of month
    const startDay = (firstDay.getDay() + 6) % 7 // Monday = 0
    for (let i = 0; i < startDay; i++) days.push(null)
    
    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <span className="font-semibold text-slate-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => (
          <div key={i} className="aspect-square">
            {date ? (
              <button
                onClick={() => !isDateDisabled(date) && onSelectDate(formatDateString(date))}
                disabled={isDateDisabled(date)}
                className={`
                  w-full h-full rounded-lg text-sm font-medium transition-all
                  ${isDateDisabled(date) ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100'}
                  ${selectedDate === formatDateString(date) ? 'bg-teal-500 text-white hover:bg-teal-600' : 'text-slate-700'}
                `}
              >
                {date.getDate()}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BookingWizard({
  isOpen,
  onClose,
  service,
  employees,
  companyName,
  companyId,
  paymentSettings,
  depositInfo,
  onFetchSlots,
  onSubmit
}: BookingWizardProps) {
  // Steps: 1=Date, 2=Time, 3=Details, 4=Payment, 5=Confirmation
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Booking data
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  
  // Customer data
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [depositProvider, setDepositProvider] = useState('')
  
  // Result
  const [bookingResult, setBookingResult] = useState<{ success: boolean; error?: string } | null>(null)

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setSelectedDate('')
      setSelectedTime('')
      setSelectedEmployee('')
      setAvailableSlots([])
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
      setPaymentMethod('cash')
      setDepositProvider('')
      setBookingResult(null)
    }
  }, [isOpen])

  // Fetch slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setLoading(true)
      setSelectedTime('')
      onFetchSlots(selectedDate)
        .then(slots => setAvailableSlots(slots))
        .catch(() => setAvailableSlots([]))
        .finally(() => setLoading(false))
    }
  }, [selectedDate])

  // Calculate price
  const calculatePrice = () => {
    return service.price || parseFloat(service.basePrice || '0')
  }

  // Check if payment methods available
  const hasOnlinePayment = paymentSettings?.przelewy24Enabled || paymentSettings?.stripeEnabled || paymentSettings?.payuEnabled || paymentSettings?.tpayEnabled
  const hasCashPayment = paymentSettings?.acceptCashPayment !== false
  const needsDeposit = depositInfo?.required && depositInfo.amount > 0

  // Get available payment providers
  const getAvailableProviders = () => {
    const providers: { id: string; name: string; icon: string }[] = []
    if (paymentSettings?.przelewy24Enabled) providers.push({ id: 'przelewy24', name: 'Przelewy24', icon: '💳' })
    if (paymentSettings?.stripeEnabled) providers.push({ id: 'stripe', name: 'Karta płatnicza', icon: '💳' })
    if (paymentSettings?.payuEnabled) providers.push({ id: 'payu', name: 'PayU', icon: '💳' })
    if (paymentSettings?.tpayEnabled) providers.push({ id: 'tpay', name: 'Tpay', icon: '💳' })
    return providers
  }

  // Handle submit
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const result = await onSubmit({
        serviceId: service.id,
        employeeId: selectedEmployee,
        date: selectedDate,
        time: selectedTime,
        duration: service.duration,
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        depositPaymentProvider: depositProvider
      })

      if (result.paymentUrl) {
        // Redirect to payment
        window.location.href = result.paymentUrl
      } else if (result.success) {
        setBookingResult({ success: true })
        setStep(5)
      } else {
        setBookingResult({ success: false, error: result.error })
      }
    } catch (error) {
      setBookingResult({ success: false, error: 'Wystąpił błąd. Spróbuj ponownie.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Validation
  const canProceedFromStep = (s: number) => {
    switch (s) {
      case 1: return !!selectedDate
      case 2: return !!selectedTime && !!selectedEmployee
      case 3: return !!customerName && !!customerPhone && (paymentMethod === 'cash' || !!customerEmail)
      case 4: return paymentMethod === 'cash' || (needsDeposit ? !!depositProvider : true)
      default: return true
    }
  }

  // Get step labels
  const getStepLabels = () => {
    const labels = ['Data', 'Godzina', 'Dane', 'Płatność', 'Gotowe']
    // Skip payment step if only cash and no deposit
    if (!hasOnlinePayment && !needsDeposit) {
      return ['Data', 'Godzina', 'Dane', 'Gotowe']
    }
    return labels
  }

  const totalSteps = getStepLabels().length

  // Determine if we should show payment step
  const shouldShowPaymentStep = hasOnlinePayment || needsDeposit

  // Get actual step number for display
  const getDisplayStep = () => {
    if (!shouldShowPaymentStep && step >= 4) {
      return step - 1
    }
    return step
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Rezerwacja</h3>
                <p className="text-slate-300 text-sm mt-0.5">{service.name}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Service info */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4" />
                <span>{service.duration} min</span>
              </div>
              <div className="text-xl font-bold text-white">
                {calculatePrice()} zł
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step indicator */}
            {step < 5 && (
              <StepIndicator 
                currentStep={getDisplayStep()} 
                totalSteps={totalSteps} 
                labels={getStepLabels()} 
              />
            )}

            {/* Step 1: Date selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  Wybierz datę
                </h4>
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </motion.div>
            )}

            {/* Step 2: Time selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500" />
                  Wybierz godzinę
                </h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Brak dostępnych terminów w tym dniu</p>
                    <button
                      onClick={() => setStep(1)}
                      className="mt-4 text-teal-500 hover:text-teal-600 font-medium"
                    >
                      Wybierz inną datę
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedTime(slot.time)
                          setSelectedEmployee(slot.employeeId)
                        }}
                        className={`
                          p-3 rounded-xl text-center transition-all
                          ${selectedTime === slot.time && selectedEmployee === slot.employeeId
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }
                        `}
                      >
                        <div className="font-semibold">{slot.time}</div>
                        <div className="text-xs opacity-75 truncate">{slot.employeeName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Customer details */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-500" />
                  Twoje dane
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Imię i nazwisko *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Jan Kowalski"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Numer telefonu *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email {paymentMethod !== 'cash' || needsDeposit ? '*' : '(opcjonalnie)'}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="jan@example.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Payment selection */}
            {step === 4 && shouldShowPaymentStep && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-500" />
                  Metoda płatności
                </h4>
                
                <div className="space-y-3">
                  {/* Cash option */}
                  {hasCashPayment && (
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
                        ${paymentMethod === 'cash' 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">Płatność na miejscu</div>
                        <div className="text-sm text-slate-500">Zapłać gotówką lub kartą w lokalu</div>
                      </div>
                      {paymentMethod === 'cash' && (
                        <Check className="w-5 h-5 text-teal-500" />
                      )}
                    </button>
                  )}

                  {/* Online payment options */}
                  {getAvailableProviders().map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => setPaymentMethod(provider.id)}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
                        ${paymentMethod === provider.id 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === provider.id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{provider.name}</div>
                        <div className="text-sm text-slate-500">Zapłać online teraz</div>
                      </div>
                      {paymentMethod === provider.id && (
                        <Check className="w-5 h-5 text-teal-500" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Deposit info */}
                {paymentMethod === 'cash' && needsDeposit && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Wymagana zaliczka</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Aby potwierdzić rezerwację, wymagana jest zaliczka w wysokości <strong>{depositInfo?.amount} zł</strong>.
                        </p>
                        
                        {/* Deposit payment provider selection */}
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-amber-800">Wybierz metodę płatności zaliczki:</p>
                          {getAvailableProviders().map(provider => (
                            <button
                              key={provider.id}
                              onClick={() => setDepositProvider(provider.id)}
                              className={`
                                w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3
                                ${depositProvider === provider.id 
                                  ? 'border-amber-500 bg-amber-100' 
                                  : 'border-amber-200 hover:border-amber-300 bg-white'
                                }
                              `}
                            >
                              <CreditCard className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-800">{provider.name}</span>
                              {depositProvider === provider.id && (
                                <Check className="w-4 h-4 text-amber-600 ml-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                {bookingResult?.success ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">Rezerwacja potwierdzona!</h4>
                    <p className="text-slate-500 mb-6">
                      Dziękujemy za rezerwację. Szczegóły zostały wysłane na podany numer telefonu.
                    </p>
                    
                    {/* Booking summary */}
                    <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Usługa:</span>
                          <span className="font-medium text-slate-800">{service.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Data:</span>
                          <span className="font-medium text-slate-800">
                            {new Date(selectedDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Godzina:</span>
                          <span className="font-medium text-slate-800">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cena:</span>
                          <span className="font-medium text-slate-800">{calculatePrice()} zł</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={onClose}
                      className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Zamknij
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">Wystąpił błąd</h4>
                    <p className="text-slate-500 mb-6">
                      {bookingResult?.error || 'Nie udało się utworzyć rezerwacji. Spróbuj ponownie.'}
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      Spróbuj ponownie
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer with navigation */}
          {step < 5 && (
            <div className="px-6 pb-6 flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Wstecz
                </button>
              )}
              
              {step < 4 || (step === 4 && shouldShowPaymentStep) ? (
                <button
                  onClick={() => {
                    if (step === 3 && !shouldShowPaymentStep) {
                      // Skip payment step, go directly to submit
                      handleSubmit()
                    } else if (step === 4) {
                      handleSubmit()
                    } else {
                      setStep(step + 1)
                    }
                  }}
                  disabled={!canProceedFromStep(step) || submitting}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : step === 4 || (step === 3 && !shouldShowPaymentStep) ? (
                    <>
                      Potwierdź rezerwację
                      <Check className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Dalej
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedFromStep(step) || submitting}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Potwierdź rezerwację
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
