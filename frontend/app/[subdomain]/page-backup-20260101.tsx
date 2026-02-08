'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Facebook,
  Instagram,
  Globe as GlobeIcon,
  ArrowRight,
  Loader2,
  ChevronDown,
  Check,
  X
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  category?: string | { id: string; name: string; [key: string]: any }
  service_categories?: { id: string; name: string; color?: string }
  price?: number
  basePrice?: string
  duration: number
  employees?: string[]
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  role: string
  services: string[]
}

interface CompanyData {
  userId?: string
  businessName: string
  subdomain: string
  email?: string
  phone?: string
  address?: string
  city?: string
  description?: string
  logo?: string
  banner?: string
  openingHours?: any
  socialMedia?: {
    facebook?: string
    instagram?: string
    website?: string
  }
  services?: Service[]
  employees?: Employee[]
  paymentSettings?: {
    acceptCashPayment?: boolean
    acceptOnlinePayment?: boolean
    paymentProvider?: string
    stripeEnabled?: boolean
    przelewy24Enabled?: boolean
    payuEnabled?: boolean
  }
}

export default function TenantPublicPage({ params }: { params: { subdomain: string } }) {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [bookingModal, setBookingModal] = useState(false)
  const [calendarModal, setCalendarModal] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedSlotEmployee, setSelectedSlotEmployee] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [bookingStep, setBookingStep] = useState<number>(1)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendarPicker, setShowCalendarPicker] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [isEmbedded, setIsEmbedded] = useState(false)
  
  // Zgody RODO i marketingowe
  const [rodoConsent, setRodoConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [consentSettings, setConsentSettings] = useState<{
    marketingConsentEnabled: boolean
    marketingConsentText: string
    rodoConsentText: string
  } | null>(null)

  // Kod rabatowy
  const [couponCode, setCouponCode] = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [couponDiscount, setCouponDiscount] = useState<{
    type: 'percentage' | 'fixed'
    value: number
    discountAmount: number
    finalPrice: number
  } | null>(null)
  const [couponError, setCouponError] = useState('')

  // Sprawdź czy jesteśmy w trybie embed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setIsEmbedded(urlParams.get('embed') === 'true')
    }
  }, [])

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies?subdomain=${params.subdomain}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded company:', data)
          setCompany(data)
          
          // Załaduj ustawienia zgód
          if (data.userId) {
            try {
              const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') 
                ? 'https://api.rezerwacja24.pl' 
                : 'http://localhost:3001'
              const consentResponse = await fetch(`${apiUrl}/api/tenants/${data.userId}/consent-settings`)
              if (consentResponse.ok) {
                const consentData = await consentResponse.json()
                console.log('Loaded consent settings:', consentData)
                setConsentSettings(consentData)
              } else {
                console.log('Consent settings not found, using defaults')
                // Ustaw domyślne ustawienia zgód
                setConsentSettings({
                  marketingConsentEnabled: false,
                  marketingConsentText: '',
                  rodoConsentText: 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.'
                })
              }
            } catch (e) {
              console.error('Error loading consent settings:', e)
              // Ustaw domyślne ustawienia zgód
              setConsentSettings({
                marketingConsentEnabled: false,
                marketingConsentText: '',
                rodoConsentText: 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.'
              })
            }
          }
        }
      } catch (error) {
        console.error('Error loading company:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCompanyData()
  }, [params.subdomain])

  // Pobierz dostępne sloty gdy wybrano pracownika i datę
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (selectedEmployee && selectedDate && selectedService && company?.userId) {
        setLoadingSlots(true)
        try {
          const response = await fetch(
            `/api/bookings/availability?tenantId=${company.userId}&serviceId=${selectedService.id}&employeeId=${selectedEmployee}&date=${selectedDate}`
          )
          if (response.ok) {
            const data = await response.json()
            setAvailableSlots(data.availableSlots || [])
          } else {
            setAvailableSlots([])
          }
        } catch (error) {
          console.error('Error loading slots:', error)
          setAvailableSlots([])
        } finally {
          setLoadingSlots(false)
        }
      }
    }
    loadAvailableSlots()
  }, [selectedEmployee, selectedDate, selectedService, company?.userId])

  // Funkcja walidacji kodu rabatowego
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Wprowadź kod rabatowy')
      return
    }

    setCouponValidating(true)
    setCouponError('')
    setCouponValid(null)
    setCouponDiscount(null)

    try {
      const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl')
        ? 'https://api.rezerwacja24.pl'
        : 'http://localhost:3001'

      const servicePrice = selectedService?.price || parseFloat(selectedService?.basePrice || '0')

      const response = await fetch(`${apiUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': company?.userId || '',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderTotal: servicePrice,
        }),
      })

      const result = await response.json()

      if (response.ok && result.valid) {
        setCouponValid(true)
        setCouponDiscount({
          type: result.discountType,
          value: result.discountValue,
          discountAmount: result.discountAmount,
          finalPrice: result.finalPrice,
        })
      } else {
        setCouponValid(false)
        setCouponError(result.message || 'Nieprawidłowy kod rabatowy')
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      setCouponValid(false)
      setCouponError('Błąd podczas sprawdzania kodu')
    } finally {
      setCouponValidating(false)
    }
  }

  // Resetowanie kodu rabatowego
  const resetCoupon = () => {
    setCouponCode('')
    setCouponValid(null)
    setCouponDiscount(null)
    setCouponError('')
  }

  const handleBookingSubmit = async () => {
    // Użyj wybranego pracownika ze slotu lub ogólnego wyboru
    const finalEmployeeId = selectedSlotEmployee || selectedEmployee
    
    if (!selectedService || !finalEmployeeId || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      alert('Proszę wypełnić wszystkie wymagane pola')
      return
    }

    // Jeśli wybrano płatność online, email jest wymagany
    if (paymentMethod !== 'cash' && !customerEmail) {
      alert('Email jest wymagany dla płatności online')
      return
    }

    setBookingLoading(true)
    try {
      // Krok 1: Utwórz rezerwację
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: company?.userId,
          serviceId: selectedService.id,
          employeeId: finalEmployeeId,
          date: selectedDate,
          time: selectedTime,
          customerName,
          customerPhone,
          customerEmail,
          // Kod rabatowy
          couponCode: couponValid && couponDiscount ? couponCode.trim().toUpperCase() : null,
          discountAmount: couponDiscount?.discountAmount || 0,
          // Zgody RODO i marketingowe
          rodoConsent,
          rodoConsentText: consentSettings?.rodoConsentText,
          marketingConsent: consentSettings?.marketingConsentEnabled ? marketingConsent : false,
          marketingConsentText: marketingConsent ? consentSettings?.marketingConsentText : null,
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Backend zwraca obiekt booking bezpośrednio lub { success: true, booking: ... }
        const booking = result.booking || result
        const bookingId = booking?.id
        
        if (bookingId) {
          // Krok 2: Jeśli wybrano płatność online, utwórz płatność
          if (paymentMethod !== 'cash') {
            // Użyj ceny po rabacie jeśli jest
            const basePrice = selectedService.price || parseFloat(selectedService.basePrice || '0')
            const finalAmount = couponDiscount ? couponDiscount.finalPrice : basePrice

            const paymentResponse = await fetch('/api/payments/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId,
                amount: finalAmount,
                provider: paymentMethod,
                customerEmail,
                customerName,
                userId: company?.userId,
              })
            })

            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              
              // Przekieruj do bramki płatności
              if (paymentResult.paymentUrl) {
                setPaymentUrl(paymentResult.paymentUrl)
                window.location.href = paymentResult.paymentUrl
                return
              } else if (paymentResult.clientSecret) {
                // Dla Stripe - obsługa w komponencie
                setPaymentUrl(paymentResult.clientSecret)
                setBookingSuccess(true)
                setBookingStep(4)
              }
            } else {
              // Płatność nie powiodła się, ale rezerwacja jest zapisana
              setBookingSuccess(true)
              setBookingStep(4)
            }
          } else {
            // Płatność gotówką - pokaż sukces
            setBookingSuccess(true)
            setBookingStep(4)
          }
        } else {
          alert(result.error || result.message || 'Nie udało się utworzyć rezerwacji. Spróbuj ponownie.')
        }
      } else {
        const error = await response.json()
        alert(error.error || error.message || 'Nie udało się utworzyć rezerwacji. Spróbuj ponownie.')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setBookingLoading(false)
    }
  }

  const resetBookingModal = () => {
    setBookingModal(false)
    setCalendarModal(false)
    setSelectedService(null)
    setSelectedEmployee('')
    setSelectedDate('')
    setSelectedTime('')
    setSelectedSlotEmployee('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setBookingStep(1)
    setBookingSuccess(false)
    setAvailableSlots([])
    // Reset kodu rabatowego
    setCouponCode('')
    setCouponValid(null)
    setCouponDiscount(null)
    setCouponError('')
  }

  const getAvailableEmployees = () => {
    if (!selectedService || !company?.employees) return []
    return company.employees.filter(emp => 
      emp.services?.includes(selectedService.id)
    )
  }

  const getMinDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    const year = maxDate.getFullYear()
    const month = String(maxDate.getMonth() + 1).padStart(2, '0')
    const day = String(maxDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-emerald-400 animate-spin" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">404</h1>
          <p className="text-xl text-gray-300 mb-8">
            Subdomena <span className="text-emerald-400">{params.subdomain}</span> nie istnieje
          </p>
          <a href="https://rezerwacja24.pl" className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full transition-all">
            Wróć do strony głównej
          </a>
        </div>
      </div>
    )
  }

  const categories = company.services && company.services.length > 0
    ? ['all', ...Array.from(new Set(company.services.map(s => 
        s.service_categories?.name || (typeof s.category === 'string' ? s.category : (s.category as any)?.name) || 'Inne'
      )))]
    : ['all']

  const filteredServices = selectedCategory === 'all' 
    ? company.services || []
    : (company.services || []).filter(s => {
        const catName = s.service_categories?.name || (typeof s.category === 'string' ? s.category : (s.category as any)?.name) || 'Inne'
        return catName === selectedCategory
      })

  const dayNames: { [key: string]: string } = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela'
  }

  // W trybie embed - uproszczony widok bez hero
  if (isEmbedded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
        {/* Kompaktowy nagłówek dla embed */}
        <div className="py-6 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            {company.logo && (
              <img
                src={company.logo}
                alt={company.businessName}
                className="h-12 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{company.businessName}</h1>
              <p className="text-sm text-gray-400">Wybierz usługę i zarezerwuj wizytę</p>
            </div>
          </div>
        </div>

        {/* Usługi - od razu widoczne */}
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Category Filter */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => {
                  const catName = typeof cat === 'string' ? cat : String(cat)
                  return (
                    <button
                      key={catName}
                      onClick={() => setSelectedCategory(catName)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === catName
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {catName === 'all' ? 'Wszystkie' : catName}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                      <p className="text-sm text-emerald-400">
                        {service.service_categories?.name || (typeof service.category === 'string' ? service.category : (service.category as any)?.name) || 'Usługa'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{service.price || service.basePrice} zł</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                      </div>
                    </div>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{service.description}</p>
                  )}
                  <button
                    onClick={() => {
                      setSelectedService(service)
                      setBookingModal(true)
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Zarezerwuj
                  </button>
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Brak usług w tej kategorii</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="py-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <a href="https://rezerwacja24.pl" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
              Rezerwacja24
            </a>
          </p>
        </div>

        {/* Booking Modal - taki sam jak w pełnej wersji */}
        <AnimatePresence>
          {bookingModal && selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setBookingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-emerald-500/30 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Rezerwacja</h3>
                  <button
                    onClick={() => setBookingModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-white">{selectedService.name}</h4>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedService.duration} min
                    </span>
                    <span className="text-lg font-bold text-emerald-400">{selectedService.price || selectedService.basePrice} zł</span>
                  </div>
                </div>

                {/* Step 1: Wybór pracownika */}
                {bookingStep === 1 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Wybierz pracownika</label>
                    <button
                      onClick={() => {
                        setSelectedEmployee('any')
                        setBookingModal(false)
                        setCalendarModal(true)
                      }}
                      className="w-full p-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/50 rounded-xl text-left transition-all"
                    >
                      <div className="font-semibold text-white">✨ Dowolny pracownik</div>
                      <div className="text-sm text-emerald-400">Najszybszy dostępny termin</div>
                    </button>
                    {getAvailableEmployees().map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp.id)
                          setBookingModal(false)
                          setCalendarModal(true)
                        }}
                        className="w-full p-3 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-xl text-left transition-all"
                      >
                        <div className="font-semibold text-white">{emp.firstName} {emp.lastName}</div>
                        <div className="text-sm text-gray-400">{emp.role}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3: Dane kontaktowe */}
                {bookingStep === 3 && selectedTime && !bookingSuccess && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-3">
                      <div className="text-sm text-gray-400">Wybrany termin:</div>
                      <div className="text-white font-semibold">
                        📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <div className="text-emerald-400 font-semibold">🕐 {selectedTime}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Imię i nazwisko *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Jan Kowalski"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Telefon *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="+48 123 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="jan@example.com"
                      />
                    </div>

                    {/* Kod rabatowy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Kod rabatowy</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase())
                            if (couponValid !== null) resetCoupon()
                          }}
                          disabled={couponValid === true}
                          className={`flex-1 px-3 py-2 bg-white/5 border rounded-lg text-white focus:outline-none transition-colors ${
                            couponValid === true 
                              ? 'border-emerald-500 bg-emerald-500/10' 
                              : couponValid === false 
                                ? 'border-red-500' 
                                : 'border-white/10 focus:border-emerald-500/50'
                          }`}
                          placeholder="Wpisz kod"
                        />
                        {couponValid !== true ? (
                          <button
                            type="button"
                            onClick={validateCoupon}
                            disabled={couponValidating || !couponCode.trim()}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            {couponValidating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Zastosuj'
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={resetCoupon}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {couponError && (
                        <p className="text-red-400 text-xs mt-1">{couponError}</p>
                      )}
                      {couponValid && couponDiscount && (
                        <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <Check className="w-4 h-4" />
                            <span>
                              Rabat: {couponDiscount.type === 'percentage' 
                                ? `${couponDiscount.value}%` 
                                : `${couponDiscount.value.toFixed(2)} zł`}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Oszczędzasz: {couponDiscount.discountAmount.toFixed(2)} zł
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Podsumowanie ceny */}
                    {selectedService && (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Cena usługi:</span>
                          <span className={`text-white ${couponDiscount ? 'line-through text-gray-500' : ''}`}>
                            {(selectedService.price || parseFloat(selectedService.basePrice || '0')).toFixed(2)} zł
                          </span>
                        </div>
                        {couponDiscount && (
                          <>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-emerald-400">Rabat:</span>
                              <span className="text-emerald-400">-{couponDiscount.discountAmount.toFixed(2)} zł</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold mt-2 pt-2 border-t border-white/10">
                              <span className="text-white">Do zapłaty:</span>
                              <span className="text-emerald-400">{couponDiscount.finalPrice.toFixed(2)} zł</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Zgody RODO i marketingowe */}
                    {consentSettings && (
                      <div className="space-y-3 pt-2">
                        {/* Zgoda RODO - wymagana */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={rodoConsent}
                            onChange={(e) => setRodoConsent(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {consentSettings.rodoConsentText || 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.'}
                            <span className="text-red-400 ml-1">*</span>
                          </span>
                        </label>

                        {/* Zgoda marketingowa - opcjonalna */}
                        {consentSettings.marketingConsentEnabled && consentSettings.marketingConsentText && (
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={marketingConsent}
                              onChange={(e) => setMarketingConsent(e.target.checked)}
                              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                              {consentSettings.marketingConsentText}
                            </span>
                          </label>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleBookingSubmit}
                      disabled={!customerName || !customerPhone || bookingLoading || (consentSettings !== null && !rodoConsent)}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Rezerwuję...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Potwierdź rezerwację
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Sukces */}
                {bookingSuccess && (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Rezerwacja potwierdzona!</h4>
                    <p className="text-gray-400 mb-4 text-sm">Potwierdzenie zostanie wysłane na podany numer telefonu.</p>
                    <button
                      onClick={resetBookingModal}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold"
                    >
                      Zamknij
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Modal - taki sam jak w pełnej wersji */}
        <AnimatePresence>
          {calendarModal && selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 overflow-y-auto"
              onClick={() => setCalendarModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 max-w-lg w-full border border-emerald-500/30 shadow-2xl my-auto max-h-[95vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Wybierz termin</h3>
                    <p className="text-gray-400 text-sm">{selectedService.name}</p>
                  </div>
                  <button onClick={() => setCalendarModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Szybkie opcje */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => {
                      const today = new Date()
                      setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)
                      setSelectedTime('')
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedDate === getMinDate() ? 'bg-emerald-600/30 border-emerald-500' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Calendar className="w-6 h-6 mb-1 mx-auto text-emerald-400" />
                    <div className="text-white text-sm font-medium">Dziś</div>
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setSelectedDate(`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`)
                      setSelectedTime('')
                    }}
                    className="p-3 rounded-xl border-2 bg-white/5 border-white/10 text-center"
                  >
                    <Clock className="w-6 h-6 mb-1 mx-auto text-emerald-400" />
                    <div className="text-white text-sm font-medium">Jutro</div>
                  </button>
                  <button
                    onClick={() => {
                      const nextWeek = new Date()
                      nextWeek.setDate(nextWeek.getDate() + 7)
                      setSelectedDate(`${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`)
                      setSelectedTime('')
                    }}
                    className="p-3 rounded-xl border-2 bg-white/5 border-white/10 text-center"
                  >
                    <CalendarDays className="w-6 h-6 mb-1 mx-auto text-emerald-400" />
                    <div className="text-white text-sm font-medium">Za tydzień</div>
                  </button>
                </div>

                {/* Kalendarz */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => { const n = new Date(currentMonth); n.setMonth(n.getMonth() - 1); setCurrentMonth(n); }} className="p-1 hover:bg-white/10 rounded">
                      <ArrowRight className="w-4 h-4 text-gray-400 rotate-180" />
                    </button>
                    <div className="text-white font-medium text-sm">{currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</div>
                    <button onClick={() => { const n = new Date(currentMonth); n.setMonth(n.getMonth() + 1); setCurrentMonth(n); }} className="p-1 hover:bg-white/10 rounded">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
                      <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const year = currentMonth.getFullYear()
                      const month = currentMonth.getMonth()
                      const firstDay = new Date(year, month, 1)
                      const lastDay = new Date(year, month + 1, 0)
                      const daysInMonth = lastDay.getDate()
                      const startingDayOfWeek = (firstDay.getDay() + 6) % 7
                      const days = []
                      const today = new Date(); today.setHours(0, 0, 0, 0)
                      const minDate = new Date(getMinDate())
                      const maxDate = new Date(getMaxDate())
                      for (let i = 0; i < startingDayOfWeek; i++) days.push(<div key={`e-${i}`} className="aspect-square" />)
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day)
                        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isSelected = selectedDate === dateString
                        const isToday = date.getTime() === today.getTime()
                        const isDisabled = date < minDate || date > maxDate
                        days.push(
                          <button
                            key={day}
                            onClick={() => { if (!isDisabled) { setSelectedDate(dateString); setSelectedTime(''); } }}
                            disabled={isDisabled}
                            className={`aspect-square rounded text-xs font-medium transition-all ${
                              isSelected ? 'bg-emerald-600 text-white' : isToday ? 'bg-emerald-500/20 text-emerald-400' : isDisabled ? 'text-gray-600' : 'text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      }
                      return days
                    })()}
                  </div>
                </div>

                {/* Dostępne godziny */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dostępne godziny</label>
                    {loadingSlots ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => {
                              setSelectedTime(slot.time)
                              setSelectedSlotEmployee(slot.employees?.[0]?.employeeId || slot.employeeId || '')
                              setCalendarModal(false)
                              setBookingStep(3)
                              setBookingModal(true)
                            }}
                            className={`p-2 rounded-lg text-sm font-bold transition-all ${
                              selectedTime === slot.time ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-emerald-500/20 border border-white/10'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Brak dostępnych terminów</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {company.banner ? (
            <>
              <img
                src={company.banner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90"></div>
            </>
          ) : (
            <>
              {/* Default neutral professional background - modern reception desk */}
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&q=80"
                alt="Professional reception"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/85 to-slate-900/95"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-teal-900/20"></div>
            </>
          )}
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            {company.logo && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-12"
              >
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  {/* Logo container */}
                  <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
                    <img
                      src={company.logo}
                      alt={company.businessName}
                      className="h-24 w-auto max-w-xs object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Business Name */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
            >
              {company.businessName}
            </motion.h1>

            {/* Description */}
            {company.description && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                {company.description}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const servicesSection = document.getElementById('services')
                servicesSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group relative px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-white text-lg font-semibold shadow-2xl hover:shadow-emerald-500/50 transition-all"
            >
              <span className="flex items-center space-x-3">
                <Calendar className="w-6 h-6" />
                <span>Zarezerwuj wizytę</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-gray-300"
            >
              {company.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center space-x-2 hover:text-emerald-400 transition-colors group">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{company.phone}</span>
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center space-x-2 hover:text-emerald-400 transition-colors group">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{company.email}</span>
                </a>
              )}
              {company.address && (
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{company.address}, {company.city}</span>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-emerald-400 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Nasze Usługi
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Odkryj pełną gamę profesjonalnych usług dostosowanych do Twoich potrzeb
            </p>
          </motion.div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 px-2"
            >
              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : String(cat)
                return (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
                      selectedCategory === catName
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {catName === 'all' ? 'Wszystkie' : catName}
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <AnimatePresence mode="wait">
              {filteredServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/10 group-hover:to-teal-600/10 rounded-2xl transition-all"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-sm text-emerald-400 font-medium mb-3">
                          {service.service_categories?.name || (typeof service.category === 'string' ? service.category : (service.category as any)?.name) || 'Usługa'}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {service.price || service.basePrice} <span className="text-lg text-gray-400">zł</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedService(service)
                        setBookingModal(true)
                      }}
                      className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-emerald-500/50"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Zarezerwuj</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-400">Brak usług w tej kategorii</p>
            </div>
          )}
        </div>
      </section>


      {/* Contact & Social Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-900/30 to-teal-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Skontaktuj się z nami
            </h2>

            {/* Social Media */}
            {company.socialMedia && (
              <div className="flex justify-center space-x-6 mb-12">
                {company.socialMedia.facebook && (
                  <a
                    href={company.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 bg-white/10 hover:bg-emerald-600 rounded-2xl transition-all hover:shadow-lg hover:shadow-emerald-500/50"
                  >
                    <Facebook className="w-8 h-8 text-gray-300 group-hover:text-white transition-colors" />
                  </a>
                )}
                {company.socialMedia.instagram && (
                  <a
                    href={company.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 bg-white/10 hover:bg-gradient-to-br hover:from-emerald-600 hover:to-teal-600 rounded-2xl transition-all hover:shadow-lg hover:shadow-teal-500/50"
                  >
                    <Instagram className="w-8 h-8 text-gray-300 group-hover:text-white transition-colors" />
                  </a>
                )}
                {company.socialMedia.website && (
                  <a
                    href={company.socialMedia.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 bg-white/10 hover:bg-emerald-600 rounded-2xl transition-all hover:shadow-lg hover:shadow-emerald-500/50"
                  >
                    <GlobeIcon className="w-8 h-8 text-gray-300 group-hover:text-white transition-colors" />
                  </a>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const servicesSection = document.getElementById('services')
                servicesSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-white text-lg font-semibold shadow-2xl hover:shadow-emerald-500/50 transition-all inline-flex items-center space-x-3"
            >
              <Calendar className="w-6 h-6" />
              <span>Zarezerwuj wizytę teraz</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      {/* Godziny otwarcia */}
      {company.openingHours && (
        <section className="py-16 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Godziny otwarcia
              </h2>
              <p className="text-gray-400 text-lg">
                Zapraszamy w poniższych godzinach
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/10">
                {Object.entries(company.openingHours).map(([day, hours]: [string, any]) => {
                  const dayNames: Record<string, string> = {
                    monday: 'Poniedziałek',
                    tuesday: 'Wtorek',
                    wednesday: 'Środa',
                    thursday: 'Czwartek',
                    friday: 'Piątek',
                    saturday: 'Sobota',
                    sunday: 'Niedziela'
                  };
                  
                  return (
                    <div key={day} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                      <span className="text-white font-medium text-lg">
                        {dayNames[day]}
                      </span>
                      <span className={`text-lg font-semibold ${hours.closed ? 'text-red-400' : 'text-emerald-400'}`}>
                        {hours.closed ? 'Nieczynne' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="py-8 border-t border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 {company.businessName}. Wszystkie prawa zastrzeżone.</p>
            <p className="mt-2">
              Powered by{' '}
              <a href="https://rezerwacja24.pl" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                Rezerwacja24
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-xl w-full border border-emerald-500/30 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Rezerwacja</h3>
                <button
                  onClick={() => setBookingModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-2">{selectedService.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{selectedService.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedService.duration} min</span>
                  </span>
                  <span className="text-2xl font-bold text-emerald-400">{selectedService.price || selectedService.basePrice || 'N/A'} zł</span>
                </div>
              </div>

              {/* Booking Form */}
              {!bookingSuccess ? (
                <div className="space-y-6">
                  {/* Step 1: Wybór pracownika */}
                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-300">
                        Wybierz pracownika
                      </label>
                      <div className="space-y-2">
                        {/* Opcja: Dowolny pracownik */}
                        <button
                          onClick={() => {
                            setSelectedEmployee('any')
                            setBookingModal(false)
                            setCalendarModal(true)
                          }}
                          className="w-full p-4 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/50 hover:border-emerald-500/70 rounded-xl text-left transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white flex items-center space-x-2">
                                <span>✨ Dowolny pracownik</span>
                              </div>
                              <div className="text-sm text-emerald-400">Najszybszy dostępny termin</div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                        
                        {/* Konkretni pracownicy */}
                        {getAvailableEmployees().map((emp) => (
                          <button
                            key={emp.id}
                            onClick={() => {
                              setSelectedEmployee(emp.id)
                              setBookingModal(false)
                              setCalendarModal(true)
                            }}
                            className="w-full p-4 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-xl text-left transition-all"
                          >
                            <div className="font-semibold text-white">{emp.firstName} {emp.lastName}</div>
                            <div className="text-sm text-gray-400">{emp.role}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Dane kontaktowe - po wyborze terminu w kalendarzu */}
                  {bookingStep === 3 && selectedTime && (
                    <div className="space-y-4">
                      {/* Podsumowanie wybranego terminu */}
                      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-2">Wybrany termin:</div>
                        <div className="text-white font-semibold">
                          📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                        <div className="text-emerald-400 font-semibold text-lg">
                          🕐 {selectedTime}
                        </div>
                        <button
                          onClick={() => {
                            setBookingStep(1)
                            setCalendarModal(true)
                            setBookingModal(false)
                          }}
                          className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 flex items-center space-x-1"
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          <span>Zmień termin</span>
                        </button>
                      </div>

                      {/* Formularz danych kontaktowych */}
                      <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Imię i nazwisko *
                            </label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                              placeholder="Jan Kowalski"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Telefon *
                            </label>
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                              placeholder="+48 123 456 789"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Email {paymentMethod !== 'cash' && <span className="text-red-400">*</span>}
                            </label>
                            <input
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                              placeholder="jan@example.com"
                              required={paymentMethod !== 'cash'}
                            />
                            {paymentMethod !== 'cash' && (
                              <p className="text-xs text-gray-400 mt-1">
                                Email jest wymagany dla płatności online
                              </p>
                            )}
                          </div>

                          {/* Kod rabatowy */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Kod rabatowy
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value.toUpperCase())
                                  if (couponValid !== null) resetCoupon()
                                }}
                                disabled={couponValid === true}
                                className={`flex-1 px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none transition-colors ${
                                  couponValid === true 
                                    ? 'border-emerald-500 bg-emerald-500/10' 
                                    : couponValid === false 
                                      ? 'border-red-500' 
                                      : 'border-white/10 focus:border-emerald-500/50'
                                }`}
                                placeholder="Wpisz kod"
                              />
                              {couponValid !== true ? (
                                <button
                                  type="button"
                                  onClick={validateCoupon}
                                  disabled={couponValidating || !couponCode.trim()}
                                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                                >
                                  {couponValidating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Zastosuj'
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={resetCoupon}
                                  className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {couponError && (
                              <p className="text-red-400 text-xs mt-1">{couponError}</p>
                            )}
                            {couponValid && couponDiscount && (
                              <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                  <Check className="w-4 h-4" />
                                  <span>
                                    Rabat: {couponDiscount.type === 'percentage' 
                                      ? `${couponDiscount.value}%` 
                                      : `${couponDiscount.value.toFixed(2)} zł`}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Oszczędzasz: {couponDiscount.discountAmount.toFixed(2)} zł
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Podsumowanie ceny */}
                          {selectedService && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Cena usługi:</span>
                                <span className={`text-white ${couponDiscount ? 'line-through text-gray-500' : ''}`}>
                                  {(selectedService.price || parseFloat(selectedService.basePrice || '0')).toFixed(2)} zł
                                </span>
                              </div>
                              {couponDiscount && (
                                <>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span className="text-emerald-400">Rabat:</span>
                                    <span className="text-emerald-400">-{couponDiscount.discountAmount.toFixed(2)} zł</span>
                                  </div>
                                  <div className="flex justify-between text-base font-semibold mt-2 pt-2 border-t border-white/10">
                                    <span className="text-white">Do zapłaty:</span>
                                    <span className="text-emerald-400">{couponDiscount.finalPrice.toFixed(2)} zł</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {/* Wybór metody płatności */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Metoda płatności *
                            </label>
                            <div className="space-y-2">
                              {/* Płatność na miejscu */}
                              {company?.paymentSettings?.acceptCashPayment !== false && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentMethod('cash')}
                                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                    paymentMethod === 'cash'
                                      ? 'bg-emerald-500/20 border-emerald-500'
                                      : 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-white">Płatność na miejscu</div>
                                      <div className="text-sm text-gray-400">Gotówka lub karta przy odbiorze usługi</div>
                                    </div>
                                    {paymentMethod === 'cash' && <Check className="w-5 h-5 text-emerald-400" />}
                                  </div>
                                </button>
                              )}

                              {/* Przelewy24 */}
                              {company?.paymentSettings?.przelewy24Enabled && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentMethod('przelewy24')}
                                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                    paymentMethod === 'przelewy24'
                                      ? 'bg-emerald-500/20 border-emerald-500'
                                      : 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-white flex items-center gap-2">
                                        <span className="text-[#D9232E] font-bold">P24</span>
                                        Przelewy24
                                      </div>
                                      <div className="text-sm text-gray-400">BLIK, karty płatnicze, przelew bankowy</div>
                                    </div>
                                    {paymentMethod === 'przelewy24' && <Check className="w-5 h-5 text-emerald-400" />}
                                  </div>
                                </button>
                              )}

                              {/* Stripe */}
                              {company?.paymentSettings?.stripeEnabled && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentMethod('stripe')}
                                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                    paymentMethod === 'stripe'
                                      ? 'bg-emerald-500/20 border-emerald-500'
                                      : 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-white flex items-center gap-2">
                                        <span className="text-[#635BFF] font-bold">Stripe</span>
                                      </div>
                                      <div className="text-sm text-gray-400">Karty płatnicze (Visa, Mastercard, Apple Pay)</div>
                                    </div>
                                    {paymentMethod === 'stripe' && <Check className="w-5 h-5 text-emerald-400" />}
                                  </div>
                                </button>
                              )}

                              {/* PayU - Ukryte, wkrótce dostępne */}
                              {/* Tymczasowo wyłączone */}
                            </div>
                          </div>

                          {/* Zgody RODO i marketingowe */}
                          {consentSettings && (
                            <div className="space-y-3 pt-2 border-t border-white/10 mt-4">
                              {/* Zgoda RODO - wymagana */}
                              <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={rodoConsent}
                                  onChange={(e) => setRodoConsent(e.target.checked)}
                                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                />
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                  {consentSettings.rodoConsentText || 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.'}
                                  <span className="text-red-400 ml-1">*</span>
                                </span>
                              </label>

                              {/* Zgoda marketingowa - opcjonalna */}
                              {consentSettings.marketingConsentEnabled && consentSettings.marketingConsentText && (
                                <label className="flex items-start gap-3 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={marketingConsent}
                                    onChange={(e) => setMarketingConsent(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                  />
                                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                    {consentSettings.marketingConsentText}
                                  </span>
                                </label>
                              )}
                            </div>
                          )}

                          <button
                            onClick={handleBookingSubmit}
                            disabled={!customerName || !customerPhone || (paymentMethod !== 'cash' && !customerEmail) || bookingLoading || (consentSettings !== null && !rodoConsent)}
                            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                          >
                            {bookingLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Rezerwuję...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-5 h-5" />
                                <span>Potwierdź rezerwację</span>
                              </>
                            )}
                          </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Rezerwacja potwierdzona!</h4>
                  <p className="text-gray-400 mb-6">
                    Twoja rezerwacja została przyjęta. Potwierdzenie zostanie wysłane na podany numer telefonu.
                  </p>
                  <button
                    onClick={resetBookingModal}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Zamknij
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nowoczesny Modal Kalendarza */}
      <AnimatePresence>
        {calendarModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
            onClick={() => setCalendarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl w-full border border-emerald-500/30 shadow-2xl my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Wybierz termin</h3>
                  <p className="text-gray-400 text-sm">{selectedService.name}</p>
                </div>
                <button
                  onClick={() => setCalendarModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Szybkie opcje wyboru daty */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Szybki wybór
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      const today = new Date()
                      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                      setSelectedDate(dateStr)
                      setSelectedTime('')
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedDate === getMinDate()
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                    <Calendar className="w-8 h-8 mb-2 mx-auto text-emerald-400" />
                    <div className="text-white font-semibold">Dziś</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
                      setSelectedDate(dateStr)
                      setSelectedTime('')
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      (() => {
                        const tomorrow = new Date()
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        return selectedDate === `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
                      })()
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                    <Clock className="w-8 h-8 mb-2 mx-auto text-emerald-400" />
                    <div className="text-white font-semibold">Jutro</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(Date.now() + 86400000).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const nextWeek = new Date()
                      nextWeek.setDate(nextWeek.getDate() + 7)
                      const dateStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`
                      setSelectedDate(dateStr)
                      setSelectedTime('')
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      (() => {
                        const nextWeek = new Date()
                        nextWeek.setDate(nextWeek.getDate() + 7)
                        return selectedDate === `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`
                      })()
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                    <CalendarDays className="w-8 h-8 mb-2 mx-auto text-emerald-400" />
                    <div className="text-white font-semibold">Za tydzień</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(Date.now() + 7 * 86400000).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                    </div>
                  </button>
                </div>
              </div>

              {/* Nowoczesny Kalendarz */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Lub wybierz inną datę
                </label>
                <div className="bg-white/5 border-2 border-white/10 rounded-xl p-4">
                  {/* Header kalendarza */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => {
                        const newMonth = new Date(currentMonth)
                        newMonth.setMonth(newMonth.getMonth() - 1)
                        setCurrentMonth(newMonth)
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>
                    <div className="text-white font-semibold">
                      {currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                    </div>
                    <button
                      onClick={() => {
                        const newMonth = new Date(currentMonth)
                        newMonth.setMonth(newMonth.getMonth() + 1)
                        setCurrentMonth(newMonth)
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Dni tygodnia */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
                      <div key={day} className="text-center text-[10px] sm:text-xs text-gray-400 font-medium py-1 sm:py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Siatka dni */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const year = currentMonth.getFullYear()
                      const month = currentMonth.getMonth()
                      const firstDay = new Date(year, month, 1)
                      const lastDay = new Date(year, month + 1, 0)
                      const daysInMonth = lastDay.getDate()
                      const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Poniedziałek = 0
                      
                      const days = []
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const minDate = new Date(getMinDate())
                      const maxDate = new Date(getMaxDate())

                      // Puste komórki przed pierwszym dniem
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(<div key={`empty-${i}`} className="aspect-square" />)
                      }

                      // Dni miesiąca
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day)
                        // Formatuj datę bez konwersji timezone (YYYY-MM-DD)
                        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isSelected = selectedDate === dateString
                        const isToday = date.getTime() === today.getTime()
                        const isDisabled = date < minDate || date > maxDate

                        days.push(
                          <button
                            key={day}
                            onClick={() => {
                              if (!isDisabled) {
                                setSelectedDate(dateString)
                                setSelectedTime('')
                              }
                            }}
                            disabled={isDisabled}
                            className={`aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-110'
                                : isToday
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                : isDisabled
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-300 hover:bg-white/10 hover:scale-105'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      }

                      return days
                    })()}
                  </div>
                </div>
              </div>

              {/* Wybrana data */}
              {selectedDate && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="text-emerald-400 font-semibold flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {(() => {
                        // Parsuj datę bez konwersji timezone
                        const [year, month, day] = selectedDate.split('-').map(Number)
                        const date = new Date(year, month - 1, day)
                        return date.toLocaleDateString('pl-PL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      })()}
                    </span>
                  </div>
                </div>
              )}

              {/* Dostępne godziny */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Dostępne godziny
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => {
                            setSelectedTime(slot.time)
                            // Dla "dowolny pracownik" - wybierz pierwszego dostępnego (backend przydzieli automatycznie)
                            // Dla konkretnego pracownika - użyj tego pracownika
                            setSelectedSlotEmployee(slot.employees?.[0]?.employeeId || slot.employeeId || '')
                            setBookingStep(3)
                          }}
                          className={`p-3 sm:p-4 rounded-lg text-base sm:text-lg font-bold transition-all ${
                            selectedTime === slot.time
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                              : 'bg-white/5 text-gray-300 hover:bg-emerald-500/20 hover:scale-105 border border-white/10 hover:border-emerald-500/50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="text-6xl">😔</div>
                      <p className="text-gray-300 font-medium text-lg">
                        Brak dostępnych terminów
                      </p>
                      <p className="text-gray-400 text-sm">
                        Spróbuj wybrać inną datę
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Przycisk dalej - gdy wybrano godzinę */}
              {selectedTime && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      setCalendarModal(false)
                      setBookingStep(3)
                      setBookingModal(true)
                    }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    Dalej →
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
