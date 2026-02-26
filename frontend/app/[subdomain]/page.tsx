'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, CalendarDays, Clock, MapPin, Phone, Mail, Star,
  Facebook, Instagram, Globe as GlobeIcon, ArrowRight, Loader2,
  ChevronDown, ChevronLeft, ChevronRight, Check, X, User, Sparkles, Package, Percent, Users, Plus, AlertCircle, Wallet, Info, Building2, Heart, Share2
} from 'lucide-react'

interface Service {
  id: string; name: string; description: string
  category?: string | { id: string; name: string; [key: string]: any }
  service_categories?: { id: string; name: string; color?: string }
  price?: number; basePrice?: string; duration: number; employees?: string[]
  // Rezerwacje elastyczne
  bookingType?: string; flexibleDuration?: boolean; minDuration?: number; maxDuration?: number
  durationStep?: number; allowMultiDay?: boolean; pricePerHour?: number; pricePerDay?: number
}

interface Employee { id: string; firstName: string; lastName: string; role: string; services: string[] }

interface PackageItem { id: string; serviceId: string; service: Service; order: number }
interface ServicePackage { id: string; name: string; description: string | null; price: number; originalPrice: number; duration: number; items: PackageItem[] }

interface GroupBooking {
  id: string; title: string; description: string | null; startTime: string; endTime: string
  maxParticipants: number; currentParticipants: number; pricePerPerson: number; status: string
  type: { id: string; name: string; description: string | null; duration: number }
  employee?: { firstName: string; lastName: string; avatar: string | null }
  _count?: { participants: number }
}

interface PageSettings {
  servicesLayout?: 'grid' | 'list'
  showServiceImages?: boolean
  showServicePrices?: boolean
  showServiceDuration?: boolean
  showEmployeeSelection?: boolean
  showOpeningHours?: boolean
  showSocialMedia?: boolean
  showDescription?: boolean
  showAddress?: boolean
  showPhone?: boolean
  showEmail?: boolean
  showTeam?: boolean // Pokaż sekcję Zespół na stronie
  primaryColor?: string
  accentColor?: string
  heroStyle?: 'banner' | 'minimal' | 'none'
  bookingButtonText?: string
  buttonStyle?: 'rounded' | 'pill' | 'square'
  cardStyle?: 'shadow' | 'border' | 'flat'
  bookingAdvanceDays?: number // Maksymalne wyprzedzenie rezerwacji (0 = bez limitu)
}

interface FlexibleServiceSettings {
  showCouponCode?: boolean
  showPaymentOptions?: boolean
  availabilityHours?: { [key: string]: { open: string; close: string; closed: boolean } }
}

interface CompanyData {
  userId?: string; businessName: string; subdomain: string; email?: string; phone?: string
  address?: string; city?: string; description?: string; logo?: string; banner?: string
  openingHours?: any
  socialMedia?: { facebook?: string; instagram?: string; website?: string }
  pageSettings?: PageSettings
  services?: Service[]; employees?: Employee[]
  paymentSettings?: { acceptCashPayment?: boolean; acceptOnlinePayment?: boolean; paymentProvider?: string; stripeEnabled?: boolean; przelewy24Enabled?: boolean; payuEnabled?: boolean; tpayEnabled?: boolean; autopayEnabled?: boolean }
  flexibleServiceSettings?: FlexibleServiceSettings
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
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [depositPaymentProvider, setDepositPaymentProvider] = useState<string>('')
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [isEmbedded, setIsEmbedded] = useState(false)
  const [rodoConsent, setRodoConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [consentSettings, setConsentSettings] = useState<{ marketingConsentEnabled: boolean; marketingConsentText: string; rodoConsentText: string } | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [couponDiscount, setCouponDiscount] = useState<{ type: 'percentage' | 'fixed'; value: number; discountAmount: number; finalPrice: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [viewMode, setViewMode] = useState<'services' | 'packages' | 'group'>('services')
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null)
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([])
  const [selectedGroupBooking, setSelectedGroupBooking] = useState<GroupBooking | null>(null)
  const [groupBookingModal, setGroupBookingModal] = useState(false)
  const [groupParticipants, setGroupParticipants] = useState<Array<{ name: string; email: string; phone: string }>>([{ name: '', email: '', phone: '' }])
  const [groupBookingLoading, setGroupBookingLoading] = useState(false)
  const [groupBookingSuccess, setGroupBookingSuccess] = useState(false)
  const [groupBookingResult, setGroupBookingResult] = useState<{ addedCount: number; waitlistCount: number; totalPrice: number } | null>(null)
  const [groupRodoConsent, setGroupRodoConsent] = useState(false)
  const [groupMarketingConsent, setGroupMarketingConsent] = useState(false)
  // Elastyczne rezerwacje
  const [selectedDuration, setSelectedDuration] = useState<number>(60)
  const [selectedEndDate, setSelectedEndDate] = useState<string>('')
  // Widok kalendarza dla elastycznych rezerwacji
  const [calendarViewMonth, setCalendarViewMonth] = useState<number>(new Date().getMonth())
  const [calendarViewYear, setCalendarViewYear] = useState<number>(new Date().getFullYear())
  // Rezerwacje dla elastycznej usługi (do sprawdzania dostępności)
  const [serviceBookings, setServiceBookings] = useState<Array<{ startTime: string; endTime: string; isFullDay?: boolean }>>([])
  // Wykrywanie powrotu z płatności
  const [pendingPaymentAlert, setPendingPaymentAlert] = useState<{ bookingId: string; show: boolean } | null>(null)
  const [loadingServiceBookings, setLoadingServiceBookings] = useState(false)
  // Uwagi do rezerwacji (dla usług elastycznych)
  const [customerNotes, setCustomerNotes] = useState<string>('')
  // Zaliczki
  const [depositInfo, setDepositInfo] = useState<{ required: boolean; amount: number; reason: string } | null>(null)
  const [checkingDeposit, setCheckingDeposit] = useState(false)
  // Modal szczegółów usługi
  const [serviceDetailModal, setServiceDetailModal] = useState(false)
  const [serviceDetailData, setServiceDetailData] = useState<Service | null>(null)
  // Info o płatności po powrocie ze Stripe
  const [paymentSuccessInfo, setPaymentSuccessInfo] = useState<{ bookingId: string; status: 'paid' | 'processing' | 'cancelled' } | null>(null)
  // Modal wyboru usługi (gdy ktoś kliknie "Zarezerwuj wizytę")
  const [servicePickerModal, setServicePickerModal] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setIsEmbedded(urlParams.get('embed') === 'true')
      
      // Sprawdź czy to powrót z płatności Stripe
      const paymentStatus = urlParams.get('payment')
      const paymentBookingId = urlParams.get('bookingId')
      
      if (paymentStatus && paymentBookingId) {
        // Usuń parametry z URL
        window.history.replaceState({}, '', window.location.pathname)
        sessionStorage.removeItem('pendingPaymentBookingId')
        sessionStorage.removeItem('pendingPaymentTime')
        
        if (paymentStatus === 'success') {
          // Weryfikuj płatność w backendzie
          const verifyPayment = async () => {
            try {
              const apiUrl = window.location.hostname.includes('rezerwacja24.pl') 
                ? 'https://api.rezerwacja24.pl' 
                : 'http://localhost:3001'
              
              const response = await fetch(`${apiUrl}/api/payments/stripe/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: paymentBookingId })
              })
              
              if (response.ok) {
                const result = await response.json()
                if (result.success) {
                  // Pokaż stronę sukcesu
                  setPaymentSuccessInfo({ bookingId: paymentBookingId, status: 'paid' })
                } else {
                  setPaymentSuccessInfo({ bookingId: paymentBookingId, status: 'processing' })
                }
              } else {
                setPaymentSuccessInfo({ bookingId: paymentBookingId, status: 'processing' })
              }
            } catch (err) {
              console.error('Payment verification error:', err)
              setPaymentSuccessInfo({ bookingId: paymentBookingId, status: 'processing' })
            }
          }
          verifyPayment()
        } else if (paymentStatus === 'cancelled') {
          setPaymentSuccessInfo({ bookingId: paymentBookingId, status: 'cancelled' })
        }
        return
      }
      
      // Sprawdź czy to ponowienie płatności
      const retryPayment = urlParams.get('retryPayment')
      const retryBookingId = sessionStorage.getItem('retryPaymentBookingId')
      
      if (retryPayment === 'true' && retryBookingId) {
        // Usuń parametr z URL
        window.history.replaceState({}, '', window.location.pathname)
        sessionStorage.removeItem('retryPaymentBookingId')
        
        // Ponów płatność
        const retryPaymentForBooking = async () => {
          try {
            const apiUrl = window.location.hostname.includes('rezerwacja24.pl') 
              ? 'https://api.rezerwacja24.pl' 
              : 'http://localhost:3001'
            
            // Pobierz dane rezerwacji
            const bookingResponse = await fetch(`${apiUrl}/api/bookings/${retryBookingId}/full`)
            if (bookingResponse.ok) {
              const bookingData = await bookingResponse.json()
              
              if (bookingData.status === 'PENDING' && !bookingData.isPaid) {
                // Utwórz nową płatność
                const paymentResponse = await fetch('/api/payments/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bookingId: retryBookingId,
                    amount: bookingData.totalPrice || bookingData.basePrice || 0,
                    provider: bookingData.paymentMethod || 'przelewy24',
                    customerEmail: bookingData.customers?.email || '',
                    customerName: `${bookingData.customers?.firstName || ''} ${bookingData.customers?.lastName || ''}`.trim(),
                    userId: bookingData.customers?.tenantId
                  })
                })
                
                if (paymentResponse.ok) {
                  const paymentResult = await paymentResponse.json()
                  if (paymentResult.paymentUrl) {
                    // Zapisz ponownie przed przekierowaniem
                    sessionStorage.setItem('pendingPaymentBookingId', retryBookingId)
                    sessionStorage.setItem('pendingPaymentTime', Date.now().toString())
                    window.location.href = paymentResult.paymentUrl
                    return
                  }
                }
              }
            }
            // Jeśli coś poszło nie tak - pokaż alert
            alert('Nie udało się ponowić płatności. Spróbuj zarezerwować ponownie.')
          } catch (err) {
            console.error('Error retrying payment:', err)
            alert('Wystąpił błąd. Spróbuj ponownie.')
          }
        }
        retryPaymentForBooking()
        return
      }
      
      // Sprawdź czy użytkownik wrócił z płatności (cofnął się strzałką)
      const pendingBookingId = sessionStorage.getItem('pendingPaymentBookingId')
      const pendingTime = sessionStorage.getItem('pendingPaymentTime')
      
      if (pendingBookingId && pendingTime) {
        const timeDiff = Date.now() - parseInt(pendingTime)
        // Jeśli minęło mniej niż 30 minut - pokaż alert
        if (timeDiff < 30 * 60 * 1000) {
          // Sprawdź status rezerwacji
          const checkBookingStatus = async () => {
            try {
              const apiUrl = window.location.hostname.includes('rezerwacja24.pl') 
                ? 'https://api.rezerwacja24.pl' 
                : 'http://localhost:3001'
              const response = await fetch(`${apiUrl}/api/bookings/${pendingBookingId}/status`)
              if (response.ok) {
                const data = await response.json()
                if (data.status === 'PENDING' && !data.isPaid) {
                  // Rezerwacja nieopłacona - pokaż alert
                  setPendingPaymentAlert({ bookingId: pendingBookingId, show: true })
                } else {
                  // Rezerwacja opłacona lub anulowana - wyczyść
                  sessionStorage.removeItem('pendingPaymentBookingId')
                  sessionStorage.removeItem('pendingPaymentTime')
                }
              }
            } catch (err) {
              console.error('Error checking booking status:', err)
            }
          }
          checkBookingStatus()
        } else {
          // Minęło więcej niż 30 minut - wyczyść
          sessionStorage.removeItem('pendingPaymentBookingId')
          sessionStorage.removeItem('pendingPaymentTime')
        }
      }
    }
  }, [])

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies?subdomain=${params.subdomain}`)
        if (response.ok) {
          const data = await response.json()
          setCompany(data)
          if (data.userId) {
            try {
              const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
              const consentResponse = await fetch(`${apiUrl}/api/tenants/${data.userId}/consent-settings`)
              if (consentResponse.ok) { setConsentSettings(await consentResponse.json()) }
              else { setConsentSettings({ marketingConsentEnabled: false, marketingConsentText: '', rodoConsentText: 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.' }) }
            } catch { setConsentSettings({ marketingConsentEnabled: false, marketingConsentText: '', rodoConsentText: 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.' }) }
          }
        }
      } catch (error) { console.error('Error loading company:', error) }
      finally { setLoading(false) }
    }
    loadCompanyData()
  }, [params.subdomain])

  // Śledź wyświetlenie strony (tylko raz na sesję)
  useEffect(() => {
    if (company?.userId) {
      const viewKey = `tracked_view_${company.userId}`
      const lastView = sessionStorage.getItem(viewKey)
      const now = Date.now()
      // Śledź tylko raz na 30 minut
      if (!lastView || now - parseInt(lastView) > 30 * 60 * 1000) {
        sessionStorage.setItem(viewKey, now.toString())
        const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
        fetch(`${apiUrl}/api/marketplace/track-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId: company.userId })
        }).catch(() => {}) // Ignoruj błędy - to nie jest krytyczne
      }
    }
  }, [company?.userId])

  // Pobierz pakiety po załadowaniu danych firmy
  useEffect(() => {
    const loadPackages = async () => {
      if (company?.userId) {
        try {
          const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
          const response = await fetch(`${apiUrl}/api/packages`, { headers: { 'x-tenant-id': company.userId } })
          if (response.ok) { const data = await response.json(); setPackages(data || []) }
        } catch (error) { console.error('Error loading packages:', error) }
      }
    }
    loadPackages()
  }, [company?.userId])

  // Pobierz zajęcia grupowe po załadowaniu danych firmy
  useEffect(() => {
    const loadGroupBookings = async () => {
      if (company?.userId) {
        try {
          const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
          const response = await fetch(`${apiUrl}/api/group-bookings/public/${company.userId}`)
          if (response.ok) { const data = await response.json(); setGroupBookings(data || []) }
        } catch (error) { console.error('Error loading group bookings:', error) }
      }
    }
    loadGroupBookings()
  }, [company?.userId])

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (selectedEmployee && selectedDate && selectedService && company?.userId) {
        setLoadingSlots(true)
        try {
          // Dla elastycznych usług przekaż wybrany czas trwania
          const duration = selectedService.flexibleDuration ? selectedDuration : selectedService.duration
          const response = await fetch(`/api/bookings/availability?tenantId=${company.userId}&serviceId=${selectedService.id}&employeeId=${selectedEmployee}&date=${selectedDate}&duration=${duration}`)
          if (response.ok) { const data = await response.json(); setAvailableSlots(data.availableSlots || []) }
          else { setAvailableSlots([]) }
        } catch { setAvailableSlots([]) }
        finally { setLoadingSlots(false) }
      }
    }
    loadAvailableSlots()
  }, [selectedEmployee, selectedDate, selectedService, company?.userId, selectedDuration])

  // Pobierz rezerwacje dla elastycznej usługi (do sprawdzania dostępności)
  useEffect(() => {
    const loadServiceBookings = async () => {
      if (selectedService && company?.userId && (selectedService.flexibleDuration || selectedService.allowMultiDay)) {
        setLoadingServiceBookings(true)
        console.log('[Flexible] Loading bookings for service:', selectedService.id, 'flexibleDuration:', selectedService.flexibleDuration, 'allowMultiDay:', selectedService.allowMultiDay)
        try {
          const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
          const response = await fetch(`${apiUrl}/api/bookings/service/${selectedService.id}?tenantId=${company.userId}`)
          if (response.ok) {
            const data = await response.json()
            console.log('[Flexible] Loaded bookings:', data.bookings)
            setServiceBookings(data.bookings || [])
          } else {
            console.log('[Flexible] Failed to load bookings:', response.status)
            setServiceBookings([])
          }
        } catch (err) {
          console.error('[Flexible] Error loading bookings:', err)
          setServiceBookings([])
        } finally {
          setLoadingServiceBookings(false)
        }
      } else if (selectedService) {
        console.log('[Flexible] Service not flexible:', selectedService.id, 'flexibleDuration:', selectedService.flexibleDuration, 'allowMultiDay:', selectedService.allowMultiDay)
      }
    }
    loadServiceBookings()
  }, [selectedService, company?.userId])

  // Funkcja pomocnicza do formatowania daty lokalnie (bez UTC)
  const formatLocalDate = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Funkcje pomocnicze do sprawdzania dostępności
  const isTimeSlotAvailable = (date: string, startTime: string, durationMinutes: number): boolean => {
    const slotStart = new Date(`${date}T${startTime}:00`)
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000)
    
    return !serviceBookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      const bookingStartDate = bookingStart.toISOString().split('T')[0]
      const bookingEndDate = bookingEnd.toISOString().split('T')[0]
      
      // Jeśli rezerwacja jest całodniowa (isFullDay=true z backendu) - blokuje cały dzień/dni
      if (booking.isFullDay) {
        // Rezerwacja całodniowa - blokuje wszystkie godziny w dniach które obejmuje
        if (date >= bookingStartDate && date <= bookingEndDate) {
          return true // Dzień jest zajęty przez rezerwację całodniową
        }
        return false
      }
      
      // Rezerwacja godzinowa - konflikt tylko jeśli czasy się nakładają
      // Konflikt jeśli: slotStart < bookingEnd AND slotEnd > bookingStart
      return slotStart < bookingEnd && slotEnd > bookingStart
    })
  }

  const isDayFullyBooked = (date: string): boolean => {
    // Dzień jest w pełni zajęty jeśli jest rezerwacja całodniowa (isFullDay=true) obejmująca ten dzień
    return serviceBookings.some(booking => {
      // Jeśli rezerwacja jest całodniowa (z backendu)
      if (booking.isFullDay) {
        const bookingStart = new Date(booking.startTime)
        const bookingEnd = new Date(booking.endTime)
        const bookingStartDate = bookingStart.toISOString().split('T')[0]
        const bookingEndDate = bookingEnd.toISOString().split('T')[0]
        // Sprawdź czy data jest w zakresie rezerwacji
        return date >= bookingStartDate && date <= bookingEndDate
      }
      return false
    })
  }

  // Sprawdź czy dzień ma jakiekolwiek rezerwacje godzinowe (nie całodniowe)
  // Używane do informowania użytkownika, że w danym dniu są już rezerwacje
  const hasDayHourlyBookings = (date: string): boolean => {
    return serviceBookings.some(booking => {
      // Tylko rezerwacje NIE całodniowe
      if (!booking.isFullDay) {
        const bookingStart = new Date(booking.startTime)
        const bookingStartDate = bookingStart.toISOString().split('T')[0]
        return bookingStartDate === date
      }
      return false
    })
  }

  const isDayPartiallyBooked = (date: string): boolean => {
    // Sprawdź czy w danym dniu są jakiekolwiek rezerwacje (dla informacji)
    return serviceBookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      const dayStart = new Date(`${date}T00:00:00`)
      const dayEnd = new Date(`${date}T23:59:59`)
      // Rezerwacja dotyka tego dnia
      return bookingStart <= dayEnd && bookingEnd >= dayStart
    })
  }

  const getBookingsForDay = (date: string): Array<{ startTime: string; endTime: string }> => {
    return serviceBookings.filter(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      const dayStart = new Date(`${date}T00:00:00`)
      const dayEnd = new Date(`${date}T23:59:59`)
      return bookingStart <= dayEnd && bookingEnd >= dayStart
    })
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Wprowadź kod rabatowy'); return }
    setCouponValidating(true); setCouponError(''); setCouponValid(null); setCouponDiscount(null)
    try {
      const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      const servicePrice = selectedService?.price || parseFloat(selectedService?.basePrice || '0')
      const response = await fetch(`${apiUrl}/api/coupons/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-tenant-id': company?.userId || '' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), orderTotal: servicePrice })
      })
      const result = await response.json()
      if (response.ok && result.valid) { setCouponValid(true); setCouponDiscount({ type: result.discountType, value: result.discountValue, discountAmount: result.discountAmount, finalPrice: result.finalPrice }) }
      else { setCouponValid(false); setCouponError(result.message || 'Nieprawidłowy kod rabatowy') }
    } catch { setCouponValid(false); setCouponError('Błąd podczas sprawdzania kodu') }
    finally { setCouponValidating(false) }
  }

  const resetCoupon = () => { setCouponCode(''); setCouponValid(null); setCouponDiscount(null); setCouponError('') }

  // Sprawdź czy zaliczka jest wymagana
  const checkDepositRequired = async () => {
    if (!selectedService || !company?.userId) return
    setCheckingDeposit(true)
    try {
      const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      const servicePrice = selectedService?.price || parseFloat(selectedService?.basePrice || '0')
      const response = await fetch(`${apiUrl}/api/deposits/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: company.userId,
          serviceId: selectedService.id,
          totalPrice: servicePrice,
          customerPhone: customerPhone || undefined
        })
      })
      if (response.ok) {
        const result = await response.json()
        setDepositInfo(result)
      }
    } catch (error) {
      console.error('Error checking deposit:', error)
      setDepositInfo(null)
    } finally {
      setCheckingDeposit(false)
    }
  }

  // Sprawdź zaliczkę gdy zmieni się usługa lub telefon klienta
  useEffect(() => {
    if (selectedService && company?.userId) {
      checkDepositRequired()
    }
  }, [selectedService?.id, customerPhone])

  const handleBookingSubmit = async () => {
    const finalEmployeeId = selectedSlotEmployee || selectedEmployee
    const isFlexibleService = selectedService?.flexibleDuration || selectedService?.allowMultiDay
    
    // Dla usług elastycznych (sala/miejsce) nie wymagamy pracownika
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) { 
      alert('Proszę wypełnić wszystkie wymagane pola'); return 
    }
    // Dla standardowych usług wymagamy pracownika
    if (!isFlexibleService && !finalEmployeeId) {
      alert('Proszę wybrać pracownika'); return
    }
    if (paymentMethod !== 'cash' && !customerEmail) { alert('Email jest wymagany dla płatności online'); return }
    setBookingLoading(true)
    try {
      // Dla elastycznych usług przekaż wybrany czas trwania
      // Dla wielodniowych przekaż endDate
      const duration = selectedService.flexibleDuration ? selectedDuration : selectedService.duration
      const bookingData: any = { 
        tenantId: company?.userId, 
        // Jeśli to pakiet, użyj pierwszej usługi z pakietu jako serviceId
        serviceId: selectedPackage ? selectedPackage.items[0]?.serviceId : selectedService.id, 
        employeeId: finalEmployeeId || 'any', // 'any' dla usług elastycznych bez pracownika 
        date: selectedDate, 
        time: selectedTime, 
        duration, 
        customerName, 
        customerPhone, 
        customerEmail, 
        customerNotes: customerNotes.trim() || null, // Uwagi od klienta
        couponCode: couponValid && couponDiscount ? couponCode.trim().toUpperCase() : null, 
        discountAmount: couponDiscount?.discountAmount || 0, 
        rodoConsent, 
        rodoConsentText: consentSettings?.rodoConsentText, 
        marketingConsent: consentSettings?.marketingConsentEnabled ? marketingConsent : false, 
        marketingConsentText: marketingConsent ? consentSettings?.marketingConsentText : null,
        // Dodaj packageId jeśli to rezerwacja pakietu
        packageId: selectedPackage?.id || null,
        // Informacje o zaliczce
        depositRequired: depositInfo?.required || false,
        depositAmount: depositInfo?.amount || 0
      }
      // Dla rezerwacji wielodniowych dodaj endDate
      if (selectedService.allowMultiDay && selectedEndDate) {
        bookingData.endDate = selectedEndDate
      }
      const response = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      if (response.ok) {
        const result = await response.json(); const booking = result.booking || result; const bookingId = booking?.id
        if (bookingId) {
          // Oblicz cenę usługi
          const basePrice = selectedService.price || parseFloat(selectedService.basePrice || '0')
          const priceAfterDiscount = couponDiscount ? couponDiscount.finalPrice : basePrice
          
          // Logika płatności:
          // 1. Płatność online (Przelewy24/Stripe) → pełna kwota do wybranego providera
          // 2. Płatność gotówką + zaliczka wymagana → zaliczka do dostępnego providera
          // 3. Płatność gotówką bez zaliczki → brak płatności online
          const isOnlinePayment = paymentMethod !== 'cash'
          const depositRequired = paymentMethod === 'cash' && depositInfo?.required && depositInfo?.amount > 0
          const requiresOnlinePayment = isOnlinePayment || depositRequired
          
          if (requiresOnlinePayment) {
            // Kwota: pełna przy online, zaliczka przy gotówce
            const finalAmount = isOnlinePayment ? priceAfterDiscount : depositInfo!.amount
            const isDeposit = depositRequired
            
            // Provider: wybrany przy online, lub wybrany przez klienta przy zaliczce
            let provider = paymentMethod
            if (depositRequired) {
              if (!depositPaymentProvider) {
                alert('Wybierz metodę płatności zaliczki')
                setBookingLoading(false)
                return
              }
              provider = depositPaymentProvider
            }
            
            // Płatność online - przekieruj do bramki płatności
            const paymentResponse = await fetch('/api/payments/create', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ 
                bookingId, 
                amount: finalAmount, 
                provider,
                customerEmail, 
                customerName, 
                userId: company?.userId,
                isDeposit
              }) 
            })
            if (paymentResponse.ok) { 
              const paymentResult = await paymentResponse.json()
              if (paymentResult.paymentUrl) { 
                // Zapisz ID rezerwacji przed przekierowaniem (do wykrycia powrotu)
                sessionStorage.setItem('pendingPaymentBookingId', bookingId)
                sessionStorage.setItem('pendingPaymentTime', Date.now().toString())
                // Przekieruj do bramki płatności (Przelewy24, Stripe, etc.)
                window.location.href = paymentResult.paymentUrl
                return 
              } else if (paymentResult.clientSecret) { 
                setPaymentUrl(paymentResult.clientSecret)
                setBookingSuccess(true)
                setBookingStep(4) 
              } else {
                // Brak URL płatności - pokaż błąd
                alert('Nie udało się utworzyć płatności. Spróbuj ponownie lub wybierz płatność na miejscu.')
              }
            } else { 
              // Błąd tworzenia płatności
              const paymentError = await paymentResponse.json()
              alert(paymentError.error || paymentError.message || 'Błąd płatności. Spróbuj ponownie lub wybierz płatność na miejscu.')
            }
          } else { 
            // Płatność gotówką - od razu sukces
            setBookingSuccess(true)
            setBookingStep(4) 
          }
        } else { alert(result.error || result.message || 'Nie udało się utworzyć rezerwacji.') }
      } else { const error = await response.json(); alert(error.error || error.message || 'Nie udało się utworzyć rezerwacji.') }
    } catch { alert('Wystąpił błąd. Spróbuj ponownie.') }
    finally { setBookingLoading(false) }
  }

  const resetBookingModal = () => { setBookingModal(false); setCalendarModal(false); setSelectedService(null); setSelectedEmployee(''); setSelectedDate(''); setSelectedTime(''); setSelectedSlotEmployee(''); setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); setCustomerNotes(''); setBookingStep(1); setBookingSuccess(false); setAvailableSlots([]); resetCoupon(); setSelectedDuration(60); setSelectedEndDate(''); setDepositInfo(null) }
  const getAvailableEmployees = () => { if (!selectedService || !company?.employees) return []; return company.employees.filter(emp => emp.services?.includes(selectedService.id)) }
  const getMinDate = () => { const today = new Date(); return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}` }
  // Maksymalna data rezerwacji - używa bookingAdvanceDays z pageSettings (0 = bez limitu, domyślnie 90 dni)
  const getMaxDate = () => { 
    const advanceDays = company?.pageSettings?.bookingAdvanceDays || 0
    const maxDays = advanceDays > 0 ? advanceDays : 90 // Domyślnie 90 dni jeśli bez limitu
    const maxDate = new Date(); 
    maxDate.setDate(maxDate.getDate() + maxDays); 
    return `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}` 
  }
  // Sprawdź czy data przekracza maksymalny limit wyprzedzenia
  const isDateBeyondLimit = (dateStr: string): boolean => {
    const advanceDays = company?.pageSettings?.bookingAdvanceDays || 0
    if (advanceDays <= 0) return false // Bez limitu
    const date = new Date(dateStr)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + advanceDays)
    maxDate.setHours(23, 59, 59, 999)
    return date > maxDate
  }

  // Funkcja zapisu na zajęcia grupowe (wielu uczestników)
  const handleGroupBookingSubmit = async () => {
    const validParticipants = groupParticipants.filter(p => p.name.trim() && p.phone.trim())
    if (!selectedGroupBooking || validParticipants.length === 0) {
      alert('Proszę wypełnić dane co najmniej jednego uczestnika'); return
    }
    if (consentSettings && !groupRodoConsent) {
      alert('Wymagana jest zgoda na przetwarzanie danych osobowych'); return
    }
    setGroupBookingLoading(true)
    try {
      const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/group-bookings/${selectedGroupBooking.id}/participants/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: company?.userId,
          participants: validParticipants,
          rodoConsent: groupRodoConsent,
          rodoConsentText: consentSettings?.rodoConsentText,
          marketingConsent: consentSettings?.marketingConsentEnabled ? groupMarketingConsent : false,
          marketingConsentText: groupMarketingConsent ? consentSettings?.marketingConsentText : null,
        })
      })
      if (response.ok) {
        const result = await response.json()
        setGroupBookingResult(result)
        setGroupBookingSuccess(true)
      } else { const error = await response.json(); alert(error.message || 'Wystąpił błąd') }
    } catch { alert('Wystąpił błąd. Spróbuj ponownie.') }
    finally { setGroupBookingLoading(false) }
  }

  // Dodaj nowego uczestnika do formularza
  const addGroupParticipant = () => {
    if (selectedGroupBooking) {
      const availableSpots = selectedGroupBooking.maxParticipants - selectedGroupBooking.currentParticipants
      if (groupParticipants.length < Math.max(availableSpots, 5)) {
        setGroupParticipants([...groupParticipants, { name: '', email: '', phone: '' }])
      }
    }
  }

  // Usuń uczestnika z formularza
  const removeGroupParticipant = (index: number) => {
    if (groupParticipants.length > 1) {
      setGroupParticipants(groupParticipants.filter((_, i) => i !== index))
    }
  }

  // Aktualizuj dane uczestnika
  const updateGroupParticipant = (index: number, field: 'name' | 'email' | 'phone', value: string) => {
    const updated = [...groupParticipants]
    updated[index][field] = value
    setGroupParticipants(updated)
  }

  const resetGroupBookingModal = () => {
    setGroupBookingModal(false)
    setSelectedGroupBooking(null)
    setGroupParticipants([{ name: '', email: '', phone: '' }])
    setGroupBookingSuccess(false)
    setGroupBookingResult(null)
    setGroupRodoConsent(false)
    setGroupMarketingConsent(false)
  }

  const formatGroupDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">404</h1>
          <p className="text-slate-400 mb-6">Strona <span className="text-teal-400">{params.subdomain}</span> nie istnieje</p>
          <a href="https://rezerwacja24.pl" className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors">Strona główna</a>
        </div>
      </div>
    )
  }

  const categories = company.services?.length ? ['all', ...Array.from(new Set(company.services.map(s => s.service_categories?.name || (typeof s.category === 'string' ? s.category : (s.category as any)?.name) || 'Inne')))] : ['all']
  const filteredServices = selectedCategory === 'all' ? company.services || [] : (company.services || []).filter(s => { const catName = s.service_categories?.name || (typeof s.category === 'string' ? s.category : (s.category as any)?.name) || 'Inne'; return catName === selectedCategory })
  
  // Ustawienia strony z domyślnymi wartościami
  const pageSettings: PageSettings = {
    servicesLayout: 'grid',
    showServiceImages: true,
    showServicePrices: true,
    showServiceDuration: true,
    showEmployeeSelection: true,
    showOpeningHours: true,
    showSocialMedia: true,
    showDescription: true,
    showAddress: true,
    showPhone: true,
    showEmail: true,
    primaryColor: '#0F6048',
    accentColor: '#41FFBC',
    heroStyle: 'banner',
    bookingButtonText: 'Zarezerwuj',
    buttonStyle: 'rounded',
    cardStyle: 'shadow',
    ...company.pageSettings
  }
  
  // Funkcja pomocnicza do klasy zaokrąglenia przycisków
  const getButtonRoundedClass = () => {
    switch (pageSettings.buttonStyle) {
      case 'pill': return 'rounded-full'
      case 'square': return 'rounded-md'
      default: return 'rounded-xl'
    }
  }
  
  // Funkcja pomocnicza do klasy stylu kart
  const getCardClass = () => {
    switch (pageSettings.cardStyle) {
      case 'border': return 'border border-slate-200'
      case 'flat': return 'bg-slate-100'
      default: return 'shadow-lg shadow-slate-200/50'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ========== FLOATING MOBILE BOOKING BUTTON ========== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent pb-safe">
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={() => setServicePickerModal(true)}
          className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-gray-900/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
        >
          <Calendar className="w-5 h-5" />
          Zarezerwuj wizytę
        </motion.button>
      </div>

      {/* ========== ALERT O NIEOPŁACONEJ REZERWACJI ========== */}
      {pendingPaymentAlert?.show && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-3 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                Masz nieopłaconą rezerwację. Płatność nie została zrealizowana.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.location.href = `/payment/error?bookingId=${pendingPaymentAlert.bookingId}&error=Płatność%20została%20anulowana`
                }}
                className="px-3 py-1.5 bg-white text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-50 transition-colors"
              >
                Szczegóły
              </button>
              <button
                onClick={() => {
                  setPendingPaymentAlert(null)
                  sessionStorage.removeItem('pendingPaymentBookingId')
                  sessionStorage.removeItem('pendingPaymentTime')
                }}
                className="p-1.5 hover:bg-amber-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ========== HERO SECTION - IMMERSIVE ========== */}
      {pageSettings.heroStyle !== 'none' && (
        <section className="relative">
          {/* Mobile Hero - Full Screen */}
          <div className="lg:hidden relative min-h-[70vh] flex flex-col">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image 
                src={company.banner || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80'} 
                alt={company.businessName || 'Banner'} 
                fill
                priority
                sizes="100vw"
                className="object-cover"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-8">
              {/* Logo */}
              {company.logo && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="inline-block bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <img src={company.logo} alt={company.businessName} className="h-10 w-auto" />
                  </div>
                </motion.div>
              )}
              
              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight"
              >
                {company.businessName}
              </motion.h1>
              
              {/* Rating & Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 text-white/90 text-sm mb-4"
              >
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">5.0</span>
                </div>
                {company.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{company.city || company.address}</span>
                  </div>
                )}
              </motion.div>
              
              {/* Quick Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-6 text-white/80 text-sm"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{company.services?.length || 0}</div>
                  <div className="text-xs">usług</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{company.employees?.length || 1}</div>
                  <div className="text-xs">specjalistów</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs">zadowolonych</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Desktop Hero */}
          <div className="hidden lg:block bg-white">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-6 py-3">
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                  <a href="https://rezerwacja24.pl" className="hover:text-gray-700 transition-colors">Strona główna</a>
                  <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium truncate">{company.businessName}</span>
              </nav>
            </div>
          </div>

          {/* Nagłówek z info */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {company.businessName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  {/* Ocena - placeholder */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-900">5.0</span>
                    <span className="text-gray-400">(0)</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  {/* Status otwarcia */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Otwarte</span>
                  </div>
                  {company.address && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{company.address}, {company.city}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Przyciski akcji */}
              <div className="flex items-center gap-2">
                {pageSettings.showSocialMedia && company.socialMedia?.facebook && (
                  <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                     className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Facebook className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {pageSettings.showSocialMedia && company.socialMedia?.instagram && (
                  <a href={company.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                     className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Instagram className="w-5 h-5 text-gray-600" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Galeria zdjęć - styl Booksy - zawsze pokazuj (z domyślnym zdjęciem jeśli brak) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
            <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[280px] sm:h-[360px] lg:h-[420px]">
              {/* Główne zdjęcie */}
              <div className="col-span-4 sm:col-span-2 row-span-2 relative bg-gray-100">
                <Image 
                  src={company.banner || (company as any).gallery?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80'} 
                  alt={company.businessName || 'Banner'} 
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  quality={85}
                />
              </div>
                {/* Mniejsze zdjęcia - tylko na większych ekranach */}
                {((company as any).gallery || []).slice(company.banner ? 0 : 1, 4).map((img: string, idx: number) => (
                  <div key={idx} className="hidden sm:block relative bg-gray-100">
                    <Image 
                      src={img} 
                      alt={`Zdjęcie ${idx + 2}`} 
                      fill
                      sizes="25vw"
                      className="object-cover"
                      quality={75}
                    />
                    {idx === 3 && (company as any).gallery?.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">+{(company as any).gallery.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Placeholder jeśli brak galerii */}
                {!((company as any).gallery?.length > 0) && (
                  <>
                    <div className="hidden sm:block relative bg-gray-100">
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    </div>
                    <div className="hidden sm:block relative bg-gray-100">
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== NAGŁÓWEK DLA TRYBU NONE ========== */}
      {pageSettings.heroStyle === 'none' && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            {/* Górny rząd - logo, social media */}
            <div className="flex items-start justify-between gap-4 mb-3">
              {/* Logo */}
              {company.logo && (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                  <img src={company.logo} alt={company.businessName} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                </div>
              )}
              
              {/* Social media i telefon */}
              <div className="flex items-center gap-2">
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {pageSettings.showSocialMedia && company.socialMedia?.facebook && (
                  <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <Facebook className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {pageSettings.showSocialMedia && company.socialMedia?.instagram && (
                  <a href={company.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <Instagram className="w-5 h-5 text-gray-600" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Nazwa firmy - pełna, bez obcinania */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
              {company.businessName}
            </h1>
            
            {/* Info - ocena i miasto */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-gray-900">5.0</span>
              </div>
              {company.city && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{company.city}</span>
                </>
              )}
              {company.address && (
                <>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{company.address}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== SEKCJA O NAS - pełny opis (tylko gdy długi) ========== */}
      {pageSettings.showDescription && company.description && company.description.length > 180 && (
        <section id="o-nas" className="py-12 sm:py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">O nas</h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ========== SEKCJA GŁÓWNA - LAYOUT Z SIDEBAR ========== */}
      <section id="uslugi" className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ===== LEWA KOLUMNA - USŁUGI ===== */}
            <div className="flex-1 min-w-0">
              {/* Nagłówek sekcji */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Usługi</h2>
              </div>

              {/* Zakładki kategorii - styl pills */}
              {categories.length > 1 && viewMode === 'services' && (
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                  {categories.map((cat) => {
                    const catName = typeof cat === 'string' ? cat : String(cat)
                    return (
                      <button
                        key={catName}
                        onClick={() => setSelectedCategory(catName)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === catName
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {catName === 'all' ? 'Wszystkie' : catName}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Zakładki Usługi / Pakiety / Zajęcia grupowe */}
              {(packages.length > 0 || groupBookings.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setViewMode('services')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      viewMode === 'services'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Usługi
                  </button>
                  {packages.length > 0 && (
                  <button
                    onClick={() => setViewMode('packages')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      viewMode === 'packages'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Pakiety
                  </button>
                  )}
                  {groupBookings.length > 0 && (
                  <button
                    onClick={() => setViewMode('group')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      viewMode === 'group'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Zajęcia grupowe
                  </button>
                  )}
                </div>
              )}

          {/* Grid pakietów */}
          {viewMode === 'packages' && packages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg, i) => {
                const savings = pkg.originalPrice > 0 
                  ? Math.round(((Number(pkg.originalPrice) - Number(pkg.price)) / Number(pkg.originalPrice)) * 100)
                  : 0;
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border-2 border-teal-200 overflow-hidden hover:shadow-xl hover:border-teal-400 transition-all group h-full flex flex-col relative"
                  >
                    {savings > 0 && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-teal-500 text-white text-xs font-bold rounded-full">
                        <Percent className="w-3 h-3" />
                        -{savings}%
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-teal-600" />
                        <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">Pakiet</span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{pkg.name}</h3>
                      {pkg.description && <p className="text-slate-500 text-sm mb-4">{pkg.description}</p>}
                      <div className="space-y-2 mb-4">
                        {pkg.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm text-slate-600">
                            <Check className="w-4 h-4 text-teal-500" />
                            {item.service.name}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{pkg.duration} min</span></div>
                        <span className="line-through">{Number(pkg.originalPrice).toFixed(0)} zł</span>
                      </div>
                      <div className="text-2xl font-bold text-teal-600">{Number(pkg.price).toFixed(0)} zł</div>
                    </div>
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => { setSelectedPackage(pkg); setSelectedService({ id: pkg.id, name: pkg.name, description: pkg.description || '', duration: pkg.duration, basePrice: String(pkg.price) } as any); setBookingModal(true) }}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Zarezerwuj pakiet
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Grid zajęć grupowych */}
          {viewMode === 'group' && groupBookings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groupBookings.map((booking, i) => {
                const spotsLeft = booking.maxParticipants - booking.currentParticipants;
                const isFull = spotsLeft <= 0;
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all group h-full flex flex-col relative ${
                      isFull ? 'border-slate-200 opacity-75' : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="absolute top-4 right-4">
                      {isFull ? (
                        <span className="px-3 py-1 bg-slate-500 text-white text-xs font-bold rounded-full">Brak miejsc</span>
                      ) : (
                        <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">{spotsLeft} wolnych miejsc</span>
                      )}
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">{booking.type.name}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{booking.title}</h3>
                      {booking.description && <p className="text-slate-500 text-sm mb-4">{booking.description}</p>}
                      <div className="space-y-2 mb-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          {formatGroupDateTime(booking.startTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          {booking.type.duration} min
                        </div>
                        {booking.employee && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-500" />
                            {booking.employee.firstName} {booking.employee.lastName}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{Number(booking.pricePerPerson).toFixed(0)} zł/os</div>
                    </div>
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => { setSelectedGroupBooking(booking); setGroupBookingModal(true) }}
                        disabled={isFull}
                        className={`w-full py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
                          isFull 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        {isFull ? 'Lista oczekujących' : 'Zapisz się'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

              {/* Lista usług - premium design */}
              {viewMode === 'services' && (
                <div className="space-y-3">
                  {filteredServices.map((service, i) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => { setSelectedService(service); setBookingModal(true) }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Ikona kategorii */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 group-hover:from-gray-900 group-hover:to-gray-800 transition-all duration-300">
                          <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-0.5 group-hover:text-gray-700 transition-colors">{service.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            {pageSettings.showServiceDuration !== false && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {service.duration} min
                              </span>
                            )}
                            {service.description && (
                              <>
                                <span className="text-gray-300 hidden sm:inline">•</span>
                                <span className="hidden sm:inline truncate max-w-[200px]">{service.description}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Cena i przycisk */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {pageSettings.showServicePrices !== false && (
                            <div className="text-right hidden sm:block">
                              <div className="text-lg font-bold text-gray-900">{service.price || service.basePrice} zł</div>
                            </div>
                          )}
                          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-gray-800 group-hover:to-gray-700 transition-all shadow-lg shadow-gray-900/20">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile price */}
                      {pageSettings.showServicePrices !== false && (
                        <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-sm text-gray-500">Cena</span>
                          <span className="text-lg font-bold text-gray-900">{service.price || service.basePrice} zł</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

          {viewMode === 'services' && filteredServices.length === 0 && (
            <div className="text-center py-12 text-gray-500">Brak usług w tej kategorii</div>
          )}
            </div>

            {/* ===== PRAWA KOLUMNA - STICKY SIDEBAR ===== */}
            <div className="hidden lg:block w-[340px] flex-shrink-0">
              <div className="sticky top-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Nagłówek karty */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{company.businessName}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">5.0</span>
                      </div>
                      <span className="text-gray-400">(0 opinii)</span>
                    </div>
                  </div>

                  {/* Przycisk rezerwacji */}
                  <div className="p-6">
                    <button
                      onClick={() => setServicePickerModal(true)}
                      className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      Zarezerwuj wizytę
                    </button>
                  </div>

                  {/* Status otwarcia */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-green-600 font-medium">Otwarte</span>
                      <span className="text-gray-400">•</span>
                      <span>zamyka o 20:00</span>
                    </div>
                  </div>

                  {/* Adres */}
                  {company.address && (
                    <div className="px-6 pb-6">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{company.address}</p>
                          {company.city && <p>{company.city}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sekcja Zespół w sidebarze - tylko gdy włączone */}
                {pageSettings.showTeam === true && company.employees && company.employees.length > 0 && (
                  <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Zespół</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {company.employees.slice(0, 6).map((emp) => (
                        <div key={emp.id} className="text-center">
                          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2 overflow-hidden">
                            {(emp as any).avatar ? (
                              <img src={(emp as any).avatar} alt={emp.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-700 truncate">{emp.firstName}</p>
                          <div className="flex items-center justify-center gap-0.5 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-gray-500">5.0</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SEKCJA ZESPÓŁ (MOBILE) - tylko gdy włączone ========== */}
      {pageSettings.showTeam === true && company.employees && company.employees.length > 0 && (
        <section className="lg:hidden py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Zespół</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {company.employees.map((emp) => (
                <div key={emp.id} className="flex-shrink-0 text-center w-20">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2 overflow-hidden border-2 border-white shadow-md">
                    {(emp as any).avatar ? (
                      <img src={(emp as any).avatar} alt={emp.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate">{emp.firstName}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-gray-500">5.0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== SEKCJA INFORMACJE ========== */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informacje</h2>
          
          {/* Opis firmy */}
          {pageSettings.showDescription && company.description && (
            <div className="mb-8">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Godziny otwarcia */}
            {pageSettings.showOpeningHours !== false && company.openingHours && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4">Godziny otwarcia</h3>
                <div className="space-y-2">
                  {(() => {
                    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                    const dayNames: Record<string, string> = { monday: 'poniedziałek', tuesday: 'wtorek', wednesday: 'środa', thursday: 'czwartek', friday: 'piątek', saturday: 'sobota', sunday: 'niedziela' }
                    const sortedDays = dayOrder.filter(day => company.openingHours[day])
                    return sortedDays.map((day) => {
                      const hours = company.openingHours[day]
                      const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day
                      return (
                        <div key={day} className={`flex items-center gap-3 py-1.5 ${isToday ? 'font-medium' : ''}`}>
                          <span className={`w-2 h-2 rounded-full ${hours.closed ? 'bg-gray-300' : 'bg-green-500'}`} />
                          <span className="text-sm text-gray-700 w-24">{dayNames[day]}</span>
                          <span className={`text-sm ${hours.closed ? 'text-gray-400' : 'text-gray-900'}`}>
                            {hours.closed ? 'Zamknięte' : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}

            {/* Dodatkowe informacje */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Dodatkowe informacje</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Natychmiastowe potwierdzenie</span>
                </div>
                {company.paymentSettings?.acceptOnlinePayment && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Płatność online</span>
                  </div>
                )}
                {company.paymentSettings?.acceptCashPayment && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Płatność na miejscu</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== GALERIA ========== */}
      {(company as any).gallery && (company as any).gallery.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Galeria</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(company as any).gallery.slice(0, 8).map((image: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    // Można dodać lightbox w przyszłości
                  }}
                >
                  <img 
                    src={image} 
                    alt={`Zdjęcie ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))}
            </div>
            {(company as any).gallery.length > 8 && (
              <p className="text-center text-slate-500 mt-6">
                + {(company as any).gallery.length - 8} więcej zdjęć
              </p>
            )}
          </div>
        </section>
      )}

      {/* ========== CTA SECTION ========== */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Gotowy na wizytę?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Zarezerwuj termin online w kilka sekund. Bez dzwonienia, bez czekania.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => document.getElementById('uslugi')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg rounded-2xl transition-all shadow-2xl shadow-white/10 flex items-center gap-3"
              >
                <Calendar className="w-5 h-5" />
                Zarezerwuj teraz
              </button>
              
              {company.phone && (
                <a 
                  href={`tel:${company.phone}`}
                  className="px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 font-semibold text-lg rounded-2xl transition-all flex items-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  {company.phone}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 bg-gray-950 lg:pb-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {company.logo && (
                <img src={company.logo} alt={company.businessName} className="h-8 w-auto opacity-50" />
              )}
              <span className="text-gray-500 text-sm">© {new Date().getFullYear()} {company.businessName}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {company.socialMedia?.facebook && (
                <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {company.socialMedia?.instagram && (
                <a href={company.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              <span className="text-gray-600 text-xs">
                Powered by <a href="https://rezerwacja24.pl" className="text-gray-500 hover:text-white transition-colors">Rezerwacja24</a>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========== MODAL WYBORU USŁUGI ========== */}
      <AnimatePresence>
        {servicePickerModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" 
            onClick={() => setServicePickerModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }} 
              onClick={(e) => e.stopPropagation()} 
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Wybierz usługę</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{company.businessName}</p>
                </div>
                <button 
                  onClick={() => setServicePickerModal(false)} 
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Kategorie */}
              {categories.length > 1 && (
                <div className="px-6 py-3 border-b border-gray-100 overflow-x-auto">
                  <div className="flex gap-2">
                    {categories.map((cat) => {
                      const catName = typeof cat === 'string' ? cat : String(cat)
                      return (
                        <button
                          key={catName}
                          onClick={() => setSelectedCategory(catName)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            selectedCategory === catName
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {catName === 'all' ? 'Wszystkie' : catName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Lista usług */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {filteredServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service)
                        setServicePickerModal(false)
                        setBookingModal(true)
                      }}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {service.duration} min
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-semibold text-gray-900">{service.price || service.basePrice} zł</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-900 group-hover:bg-gray-800 flex items-center justify-center flex-shrink-0 transition-colors">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Brak usług w tej kategorii
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  {filteredServices.length} {filteredServices.length === 1 ? 'usługa' : filteredServices.length < 5 ? 'usługi' : 'usług'} dostępnych
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MODAL REZERWACJI ========== */}
      <AnimatePresence>
        {bookingModal && selectedService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setBookingModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-[100vw] sm:max-w-md md:max-w-xl lg:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[100vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
              {/* Header - elegancki gradient */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Rezerwacja</h3>
                  <p className="text-slate-300 text-sm mt-0.5">{selectedService.name}</p>
                </div>
                <button onClick={() => setBookingModal(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4 sm:p-6 flex-1">
                {/* Step indicator - responsywny */}
                {!selectedService.flexibleDuration && !selectedService.allowMultiDay && !bookingSuccess && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto">
                    {[{n:1,l:'Specjalista'},{n:2,l:'Data'},{n:3,l:'Godzina'},{n:4,l:'Dane'},{n:5,l:'Płatność'}].map((s,i) => (
                      <div key={s.n} className="flex items-center flex-shrink-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm ${s.n<bookingStep?'bg-teal-500 text-white':s.n===bookingStep?'bg-slate-800 text-white ring-2 sm:ring-4 ring-teal-100':'bg-slate-100 text-slate-400'}`}>
                            {s.n<bookingStep?<Check className="w-4 h-4 sm:w-5 sm:h-5"/>:s.n}
                          </div>
                          <span className={`text-[10px] sm:text-xs mt-1 font-medium hidden sm:block ${s.n===bookingStep?'text-slate-800':'text-slate-400'}`}>{s.l}</span>
                        </div>
                        {i<4&&<div className={`w-4 sm:w-8 h-0.5 sm:h-1 mx-0.5 sm:mx-1 rounded-full sm:mb-5 ${s.n<bookingStep?'bg-teal-500':'bg-slate-200'}`}/>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Info */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      {selectedService.allowMultiDay && selectedEndDate
                        ? (() => {
                            const start = new Date(selectedDate || getMinDate())
                            const end = new Date(selectedEndDate)
                            const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                            return `${days} dni`
                          })()
                        : selectedService.flexibleDuration 
                          ? `${selectedDuration} min` 
                          : `${selectedService.duration} min`
                      }
                    </span>
                  </div>
                  <div className="text-xl font-bold text-slate-800">
                    {selectedService.allowMultiDay && selectedEndDate && selectedService.pricePerDay
                      ? (() => {
                          const start = new Date(selectedDate || getMinDate())
                          const end = new Date(selectedEndDate)
                          const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                          return `${(days * Number(selectedService.pricePerDay)).toFixed(0)} zł`
                        })()
                      : selectedService.flexibleDuration && selectedService.pricePerHour 
                        ? `${((selectedDuration / 60) * Number(selectedService.pricePerHour)).toFixed(0)} zł`
                        : `${selectedService.price || selectedService.basePrice} zł`
                    }
                  </div>
                </div>

                {/* KROK 1: Dla elastycznych usług (sala/miejsce) - wybór typu i czasu */}
                {(selectedService.flexibleDuration || selectedService.allowMultiDay) && bookingStep === 1 && (
                  <div className="space-y-4">
                    {/* Wybór typu rezerwacji jeśli oba włączone */}
                    {selectedService.flexibleDuration && selectedService.allowMultiDay && (
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <button
                          type="button"
                          onClick={() => setSelectedEndDate('')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            !selectedEndDate 
                              ? 'border-slate-800 bg-slate-50' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <Clock className={`w-6 h-6 mx-auto mb-2 ${!selectedEndDate ? 'text-slate-800' : 'text-slate-400'}`} />
                          <div className="text-sm font-medium text-slate-800">Na godziny</div>
                          <div className="text-xs text-slate-500">Wybierz czas trwania</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEndDate(selectedDate || getMinDate())}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedEndDate 
                              ? 'border-slate-800 bg-slate-50' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <CalendarDays className={`w-6 h-6 mx-auto mb-2 ${selectedEndDate ? 'text-slate-800' : 'text-slate-400'}`} />
                          <div className="text-sm font-medium text-slate-800">Na dni</div>
                          <div className="text-xs text-slate-500">Wybierz daty</div>
                        </button>
                      </div>
                    )}

                    {/* Rezerwacja na godziny - wybór dnia + godzin od-do */}
                    {selectedService.flexibleDuration && !selectedEndDate && (
                      <div className="space-y-5">
                        {/* KROK 1: Wybór dnia */}
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center">1</span>
                            Wybierz dzień
                          </p>
                          
                          {/* Mini kalendarz */}
                          {(() => {
                            const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
                            const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
                            
                            const changeMonth = (delta: number) => {
                              let newMonth = calendarViewMonth + delta
                              let newYear = calendarViewYear
                              if (newMonth < 0) { newMonth = 11; newYear-- }
                              if (newMonth > 11) { newMonth = 0; newYear++ }
                              setCalendarViewMonth(newMonth)
                              setCalendarViewYear(newYear)
                            }
                            
                            const viewFirstDay = new Date(calendarViewYear, calendarViewMonth, 1)
                            const viewLastDay = new Date(calendarViewYear, calendarViewMonth + 1, 0)
                            const viewStartPadding = (viewFirstDay.getDay() + 6) % 7
                            const viewDaysInMonth = viewLastDay.getDate()
                            
                            const handleDayClick = (day: number) => {
                              const dateStr = formatLocalDate(calendarViewYear, calendarViewMonth, day)
                              if (dateStr < getMinDate()) return
                              setSelectedDate(dateStr)
                              setSelectedTime('') // Reset godziny przy zmianie dnia
                              setSelectedDuration(selectedService.minDuration || 60)
                            }
                            
                            const isSelected = (day: number) => {
                              const dateStr = formatLocalDate(calendarViewYear, calendarViewMonth, day)
                              return dateStr === selectedDate
                            }
                            
                            const isPast = (day: number) => {
                              const dateStr = formatLocalDate(calendarViewYear, calendarViewMonth, day)
                              // Sprawdź czy data jest w przeszłości lub przekracza limit wyprzedzenia
                              return dateStr < getMinDate() || isDateBeyondLimit(dateStr)
                            }
                            
                            return (
                              <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                  <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                                  </button>
                                  <span className="font-semibold text-slate-800">{monthNames[calendarViewMonth]} {calendarViewYear}</span>
                                  <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                                  {dayNames.map(d => (
                                    <div key={d} className="text-center text-[10px] sm:text-xs font-medium text-slate-500 py-1">{d}</div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                                  {Array.from({ length: viewStartPadding }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-8 sm:h-9" />
                                  ))}
                                  {Array.from({ length: viewDaysInMonth }).map((_, i) => {
                                    const day = i + 1
                                    const dateStr = formatLocalDate(calendarViewYear, calendarViewMonth, day)
                                    const past = isPast(day)
                                    const selected = isSelected(day)
                                    const fullyBooked = isDayFullyBooked(dateStr)
                                    const partiallyBooked = isDayPartiallyBooked(dateStr)
                                    
                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => !past && !fullyBooked && handleDayClick(day)}
                                        disabled={past || fullyBooked}
                                        className={`h-8 sm:h-9 text-xs sm:text-sm rounded-lg transition-all relative ${
                                          past || fullyBooked
                                            ? 'text-slate-300 cursor-not-allowed' 
                                            : selected 
                                              ? 'bg-slate-800 text-white font-semibold'
                                              : partiallyBooked
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                        title={fullyBooked ? 'Dzień w pełni zajęty' : partiallyBooked ? 'Częściowo zajęty' : ''}
                                      >
                                        {day}
                                        {partiallyBooked && !fullyBooked && !selected && (
                                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                        
                        {/* KROK 2: Wybór godzin - tylko jeśli wybrany dzień */}
                        {selectedDate && (
                          <div>
                            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <span className="w-6 h-6 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center">2</span>
                              Wybierz godziny
                              <span className="text-slate-400 font-normal">({new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })})</span>
                            </p>
                            
                            {/* Pokaż zajęte godziny w tym dniu */}
                            {getBookingsForDay(selectedDate).length > 0 && (
                              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600 font-medium mb-1">Zajęte terminy:</p>
                                <div className="flex flex-wrap gap-1">
                                  {getBookingsForDay(selectedDate).map((b, i) => (
                                    <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                      {new Date(b.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Godzina rozpoczęcia */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200 mb-3">
                              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Od godziny</label>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                                {(() => {
                                  const slots = []
                                  const minDur = selectedService.minDuration || 60
                                  
                                  // Pobierz godziny dla wybranego dnia
                                  // Dla usług elastycznych użyj flexibleServiceSettings.availabilityHours, fallback do openingHours
                                  const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay()
                                  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                                  const dayName = dayNames[dayOfWeek]
                                  const flexHours = company?.flexibleServiceSettings?.availabilityHours?.[dayName]
                                  const dayHours = flexHours || company?.openingHours?.[dayName]
                                  
                                  let openHour = 9
                                  let openMin = 0
                                  let closeHour = 18
                                  let closeMin = 0
                                  
                                  if (dayHours && !dayHours.closed) {
                                    const [openH, openM] = (dayHours.open || '09:00').split(':').map(Number)
                                    const [closeH, closeM] = (dayHours.close || '18:00').split(':').map(Number)
                                    openHour = openH
                                    openMin = openM || 0
                                    // Obsługa 24h: jeśli close=00:00 i open=00:00, to znaczy całą dobę (do 24:00)
                                    closeHour = (closeH === 0 && openH === 0 && (closeM || 0) === 0) ? 24 : closeH
                                    closeMin = closeM || 0
                                  }
                                  
                                  // Generuj sloty co 60 minut od otwarcia do zamknięcia
                                  for (let h = openHour; h < closeHour || (h === closeHour && closeMin > 0); h++) {
                                    for (let m = (h === openHour ? openMin : 0); m < 60; m += 60) {
                                      // Nie pokazuj slotów po godzinie zamknięcia
                                      if (h > closeHour || (h === closeHour && m >= closeMin)) break
                                      // Nie pokazuj slotów które kończą się po zamknięciu
                                      const endMinutes = h * 60 + m + minDur
                                      const closeMinutes = closeHour * 60 + closeMin
                                      if (endMinutes > closeMinutes) continue
                                      
                                      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                                      // Sprawdź czy slot jest dostępny (z minimalnym czasem trwania)
                                      const isAvailable = isTimeSlotAvailable(selectedDate, timeStr, minDur)
                                      
                                      slots.push(
                                        <button
                                          key={timeStr}
                                          type="button"
                                          onClick={() => isAvailable && setSelectedTime(timeStr)}
                                          disabled={!isAvailable}
                                          className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                            !isAvailable
                                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                              : selectedTime === timeStr 
                                                ? 'bg-slate-800 text-white' 
                                                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                          }`}
                                        >
                                          {timeStr}
                                        </button>
                                      )
                                    }
                                  }
                                  return slots
                                })()}
                              </div>
                            </div>
                            
                            {/* Godzina zakończenia - tylko jeśli wybrana godzina rozpoczęcia */}
                            {selectedTime && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Do godziny</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                                  {(() => {
                                    const [startH, startM] = selectedTime.split(':').map(Number)
                                    const startMinutes = startH * 60 + startM
                                    const minDur = selectedService.minDuration || 60
                                    const step = selectedService.durationStep || 60
                                    const slots = []
                                    
                                    // Pobierz godzinę zamknięcia dla wybranego dnia
                                    // Dla usług elastycznych użyj flexibleServiceSettings.availabilityHours
                                    const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay()
                                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                                    const dayName = dayNames[dayOfWeek]
                                    const flexHours = company?.flexibleServiceSettings?.availabilityHours?.[dayName]
                                    const dayHours = flexHours || company?.openingHours?.[dayName]
                                    
                                    // Jeśli dzień jest zamknięty, nie pokazuj żadnych slotów
                                    if (dayHours?.closed) {
                                      return <div className="text-sm text-slate-500 col-span-full">Ten dzień jest zamknięty</div>
                                    }
                                    
                                    const [closeH, closeM] = (dayHours?.close || '20:00').split(':').map(Number)
                                    const [openH] = (dayHours?.open || '09:00').split(':').map(Number)
                                    // Obsługa 24h: jeśli close=00:00 i open=00:00, to znaczy całą dobę (do 24:00)
                                    const closeHour = (closeH === 0 && openH === 0 && (closeM || 0) === 0) ? 24 : closeH
                                    const closeMin = closeM || 0
                                    const closeMinutes = closeHour * 60 + closeMin
                                    
                                    // Maksymalny czas trwania = do godziny zamknięcia (dla usług elastycznych)
                                    // Użyj maxDuration z usługi tylko jeśli jest mniejszy niż czas do zamknięcia
                                    const maxPossibleDur = closeMinutes - startMinutes
                                    const serviceMaxDur = selectedService.maxDuration || 9999
                                    const maxDur = Math.min(serviceMaxDur, maxPossibleDur)
                                    
                                    for (let dur = minDur; dur <= maxDur; dur += step) {
                                      const endMinutes = startMinutes + dur
                                      const endH = Math.floor(endMinutes / 60)
                                      const endM = endMinutes % 60
                                      
                                      const timeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
                                      const isSelected = selectedDuration === dur
                                      // Sprawdź czy ten czas trwania jest dostępny
                                      const isAvailable = isTimeSlotAvailable(selectedDate, selectedTime, dur)
                                      
                                      slots.push(
                                        <button
                                          key={dur}
                                          type="button"
                                          onClick={() => isAvailable && setSelectedDuration(dur)}
                                          disabled={!isAvailable}
                                          className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                            !isAvailable
                                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                              : isSelected 
                                                ? 'bg-slate-800 text-white' 
                                                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                          }`}
                                        >
                                          {timeStr}
                                        </button>
                                      )
                                    }
                                    return slots
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Podsumowanie */}
                        {selectedDate && selectedTime && selectedDuration > 0 && (
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Wybrany termin:</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}, {selectedTime} - {(() => {
                                  const [h, m] = selectedTime.split(':').map(Number)
                                  const endMinutes = h * 60 + m + selectedDuration
                                  const endH = Math.floor(endMinutes / 60)
                                  const endM = endMinutes % 60
                                  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
                                })()}
                              </span>
                            </div>
                            {selectedService.pricePerHour && (
                              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-100">
                                <span className="text-slate-600">
                                  {Math.floor(selectedDuration / 60)}h {selectedDuration % 60 > 0 ? `${selectedDuration % 60}min` : ''} × {Number(selectedService.pricePerHour).toFixed(0)} zł/h
                                </span>
                                <span className="font-bold text-green-600 text-lg">
                                  {((selectedDuration / 60) * Number(selectedService.pricePerHour)).toFixed(0)} zł
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rezerwacja na dni - ładny kalendarz */}
                    {selectedService.allowMultiDay && selectedEndDate && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center">1</span>
                          Wybierz daty rezerwacji
                        </p>
                        
                        {/* Mini kalendarz */}
                        {(() => {
                          const today = new Date()
                          const currentMonth = selectedDate ? new Date(selectedDate) : today
                          const year = currentMonth.getFullYear()
                          const month = currentMonth.getMonth()
                          const firstDay = new Date(year, month, 1)
                          const lastDay = new Date(year, month + 1, 0)
                          const startPadding = (firstDay.getDay() + 6) % 7 // Poniedziałek = 0
                          const daysInMonth = lastDay.getDate()
                          
                          const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
                          const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
                          
                          const changeMonth = (delta: number) => {
                            const newYear = month + delta < 0 ? year - 1 : month + delta > 11 ? year + 1 : year
                            const newMonth = month + delta < 0 ? 11 : month + delta > 11 ? 0 : month + delta
                            const dateStr = formatLocalDate(newYear, newMonth, 1)
                            setSelectedDate(dateStr)
                            setSelectedEndDate(dateStr)
                          }
                          
                          const handleDayClick = (day: number) => {
                            const dateStr = formatLocalDate(year, month, day)
                            const minDate = getMinDate()
                            
                            if (dateStr < minDate) return // Nie pozwól na przeszłe daty
                            
                            if (!selectedDate || (selectedDate && selectedEndDate && selectedDate !== selectedEndDate)) {
                              // Rozpocznij nowy wybór
                              setSelectedDate(dateStr)
                              setSelectedEndDate(dateStr)
                            } else if (dateStr < selectedDate) {
                              // Kliknięto wcześniejszą datę - ustaw jako początek
                              setSelectedDate(dateStr)
                            } else {
                              // Kliknięto późniejszą datę - ustaw jako koniec
                              setSelectedEndDate(dateStr)
                            }
                          }
                          
                          const isInRange = (day: number) => {
                            if (!selectedDate || !selectedEndDate) return false
                            const dateStr = formatLocalDate(year, month, day)
                            return dateStr >= selectedDate && dateStr <= selectedEndDate
                          }
                          
                          const isStart = (day: number) => {
                            const dateStr = formatLocalDate(year, month, day)
                            return dateStr === selectedDate
                          }
                          
                          const isEnd = (day: number) => {
                            const dateStr = formatLocalDate(year, month, day)
                            return dateStr === selectedEndDate
                          }
                          
                          const isPast = (day: number) => {
                            const dateStr = formatLocalDate(year, month, day)
                            // Sprawdź czy data jest w przeszłości lub przekracza limit wyprzedzenia
                            return dateStr < getMinDate() || isDateBeyondLimit(dateStr)
                          }
                          
                          return (
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                              {/* Nagłówek miesiąca */}
                              <div className="flex items-center justify-between mb-4">
                                <button 
                                  type="button"
                                  onClick={() => changeMonth(-1)}
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                                </button>
                                <span className="font-semibold text-slate-800">
                                  {monthNames[month]} {year}
                                </span>
                                <button 
                                  type="button"
                                  onClick={() => changeMonth(1)}
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <ChevronRight className="w-5 h-5 text-slate-600" />
                                </button>
                              </div>
                              
                              {/* Dni tygodnia */}
                              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                                {dayNames.map(d => (
                                  <div key={d} className="text-center text-[10px] sm:text-xs font-medium text-slate-500 py-1">
                                    {d}
                                  </div>
                                ))}
                              </div>
                              
                              {/* Dni miesiąca */}
                              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                                {/* Puste komórki na początek */}
                                {Array.from({ length: startPadding }).map((_, i) => (
                                  <div key={`empty-${i}`} className="h-8 sm:h-9" />
                                ))}
                                
                                {/* Dni */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                  const day = i + 1
                                  // Użyj lokalnej daty (nie UTC)
                                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                  const past = isPast(day)
                                  const inRange = isInRange(day)
                                  const start = isStart(day)
                                  const end = isEnd(day)
                                  // Sprawdź czy dzień jest zajęty
                                  const booked = isDayPartiallyBooked(dateStr)
                                  const fullyBooked = isDayFullyBooked(dateStr)
                                  // Dla rezerwacji całodniowych - blokuj też dni z rezerwacjami godzinowymi
                                  const hasHourlyBookings = hasDayHourlyBookings(dateStr)
                                  const isBlocked = fullyBooked || hasHourlyBookings
                                  
                                  return (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() => !past && !isBlocked && handleDayClick(day)}
                                      disabled={past || isBlocked}
                                      title={fullyBooked ? 'Dzień zajęty (rezerwacja całodniowa)' : hasHourlyBookings ? 'Dzień ma rezerwacje godzinowe' : booked ? 'Częściowo zajęty' : ''}
                                      className={`h-8 sm:h-9 text-xs sm:text-sm rounded-lg transition-all relative ${
                                        past || isBlocked
                                          ? 'text-slate-300 cursor-not-allowed bg-slate-50' 
                                          : start || end
                                            ? 'bg-slate-800 text-white font-semibold'
                                            : inRange
                                              ? booked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                                              : booked
                                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {day}
                                      {isBlocked && (
                                        <span className="absolute inset-0 flex items-center justify-center text-red-400 text-lg">×</span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}
                        
                        {/* Podsumowanie wyboru */}
                        {selectedDate && selectedEndDate && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Wybrany okres:</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} - {new Date(selectedEndDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            {selectedService.pricePerDay && (
                              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-100">
                                <span className="text-slate-600">
                                  {(() => {
                                    const start = new Date(selectedDate)
                                    const end = new Date(selectedEndDate)
                                    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                                    return `${days} dni × ${Number(selectedService.pricePerDay).toFixed(0)} zł`
                                  })()}
                                </span>
                                <span className="font-bold text-blue-600 text-lg">
                                  {(() => {
                                    const start = new Date(selectedDate)
                                    const end = new Date(selectedEndDate)
                                    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                                    return (days * Number(selectedService.pricePerDay)).toFixed(0)
                                  })()} zł
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Przycisk dalej - do formularza */}
                    {(() => {
                      // Dla rezerwacji wielodniowych - wymagane selectedDate i selectedEndDate
                      const isMultiDayReady = selectedService.allowMultiDay && selectedEndDate && selectedDate
                      // Dla rezerwacji godzinowych - wymagane selectedDate, selectedTime i selectedDuration
                      const isHourlyReady = selectedService.flexibleDuration && !selectedEndDate && selectedDate && selectedTime && selectedDuration > 0
                      // Czy można przejść dalej
                      const canProceed = isMultiDayReady || isHourlyReady
                      
                      return (
                        <button
                          onClick={() => {
                            setSelectedEmployee('any')
                            if (isMultiDayReady) {
                              setSelectedTime('09:00')
                            }
                            setBookingStep(3)
                          }}
                          disabled={!canProceed}
                          className={`w-full py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            canProceed 
                              ? 'bg-slate-800 hover:bg-slate-900 text-white' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <ArrowRight className="w-5 h-5" />
                          {canProceed ? 'Dalej do formularza' : (
                            isMultiDayReady === false && selectedService.allowMultiDay && selectedEndDate !== undefined
                              ? 'Wybierz daty'
                              : 'Wybierz dzień i godziny'
                          )}
                        </button>
                      )
                    })()}
                  </div>
                )}

                {/* KROK 3: Dane klienta - dla usług elastycznych */}
                {(selectedService.flexibleDuration || selectedService.allowMultiDay) && bookingStep === 3 && !bookingSuccess && (
                  <div className="space-y-5">
                    {/* Podsumowanie terminu */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Wybrany termin</div>
                          {selectedService?.allowMultiDay && selectedEndDate ? (
                            <>
                              <div className="font-bold text-slate-800 text-sm">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} - {new Date(selectedEndDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                              <div className="text-sm text-teal-600 font-medium">
                                {(() => {
                                  const start = new Date(selectedDate)
                                  const end = new Date(selectedEndDate)
                                  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                                  return `${days} dni`
                                })()}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-slate-800 text-sm">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </div>
                              <div className="text-sm text-teal-600 font-medium">
                                {selectedTime} - {(() => {
                                  const [h, m] = selectedTime.split(':').map(Number)
                                  const endMinutes = h * 60 + m + selectedDuration
                                  const endH = Math.floor(endMinutes / 60)
                                  const endM = endMinutes % 60
                                  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
                                })()} ({Math.floor(selectedDuration / 60)}h{selectedDuration % 60 > 0 ? ` ${selectedDuration % 60}min` : ''})
                              </div>
                            </>
                          )}
                        </div>
                        <button onClick={() => setBookingStep(1)} className="text-sm text-slate-500 hover:text-slate-700">
                          Zmień
                        </button>
                      </div>
                    </div>

                    {/* Formularz danych */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Imię i nazwisko *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors bg-slate-50 focus:bg-white" placeholder="Jan Kowalski" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors bg-slate-50 focus:bg-white" placeholder="+48 123 456 789" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email (opcjonalnie)</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors bg-slate-50 focus:bg-white" placeholder="jan@example.com" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Uwagi (opcjonalnie)</label>
                        <textarea 
                          value={customerNotes} 
                          onChange={(e) => setCustomerNotes(e.target.value)} 
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors bg-slate-50 focus:bg-white resize-none" 
                          placeholder="Dodatkowe informacje..."
                        />
                      </div>
                    </div>

                    {/* Cena */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Do zapłaty</span>
                        <span className="text-xl font-bold text-slate-800">
                          {(() => {
                            if (selectedService.allowMultiDay && selectedEndDate && selectedService.pricePerDay) {
                              const start = new Date(selectedDate)
                              const end = new Date(selectedEndDate)
                              const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                              return (days * Number(selectedService.pricePerDay)).toFixed(0)
                            } else if (selectedService.flexibleDuration && selectedService.pricePerHour) {
                              return ((selectedDuration / 60) * Number(selectedService.pricePerHour)).toFixed(0)
                            }
                            return selectedService.price || selectedService.basePrice || 0
                          })()} zł
                        </span>
                      </div>
                    </div>

                    {/* Przycisk rezerwacji */}
                    <button
                      onClick={handleBookingSubmit}
                      disabled={!customerName || !customerPhone || bookingLoading}
                      className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-3"
                    >
                      {bookingLoading ? (
                        <><Loader2 className="w-6 h-6 animate-spin" />Rezerwuję...</>
                      ) : (
                        <><Check className="w-6 h-6" />Zarezerwuj</>
                      )}
                    </button>
                  </div>
                )}

                {/* KROK 1: Wybór specjalisty */}
                {!selectedService.flexibleDuration && !selectedService.allowMultiDay && bookingStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-teal-500" />
                      Wybierz specjalistę
                    </p>
                    <button onClick={() => { setSelectedEmployee('any'); setBookingStep(2) }} className="w-full p-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-left transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
                        <div className="flex-1"><div className="font-medium">Dowolny specjalista</div><div className="text-sm text-white/70">Najszybszy termin</div></div>
                        <ChevronRight className="w-5 h-5 opacity-70" />
                      </div>
                    </button>
                    {getAvailableEmployees().map((emp) => (
                      <button key={emp.id} onClick={() => { setSelectedEmployee(emp.id); setBookingStep(2) }} className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-600" /></div>
                          <div className="flex-1"><div className="font-medium text-slate-800">{emp.firstName} {emp.lastName}</div><div className="text-sm text-slate-500">{emp.role}</div></div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* KROK 2: Wybór daty */}
                {!selectedService.flexibleDuration && !selectedService.allowMultiDay && bookingStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-500" />
                        Wybierz datę
                      </p>
                      <button onClick={() => setBookingStep(1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Wstecz
                      </button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={() => { const n = new Date(currentMonth); n.setMonth(n.getMonth() - 1); setCurrentMonth(n) }} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                        <span className="font-semibold text-slate-800">{currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => { const n = new Date(currentMonth); n.setMonth(n.getMonth() + 1); setCurrentMonth(n) }} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">{['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>)}</div>
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const year = currentMonth.getFullYear(); const month = currentMonth.getMonth()
                          const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0)
                          const daysInMonth = lastDay.getDate(); const startingDayOfWeek = (firstDay.getDay() + 6) % 7
                          const days = []; const today = new Date(); today.setHours(0, 0, 0, 0)
                          const minDateVal = new Date(getMinDate()); const maxDateVal = new Date(getMaxDate())
                          for (let i = 0; i < startingDayOfWeek; i++) days.push(<div key={`e-${i}`} />)
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(year, month, day); const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                            const isSelected = selectedDate === dateString; const isToday = date.getTime() === today.getTime(); const isDisabled = date < minDateVal || date > maxDateVal
                            days.push(<button key={day} onClick={() => { if (!isDisabled) { setSelectedDate(dateString); setSelectedTime(''); setBookingStep(3) } }} disabled={isDisabled} className={`aspect-square rounded-lg text-sm font-medium transition-all ${isSelected ? 'bg-teal-500 text-white' : isToday ? 'bg-teal-100 text-teal-700' : isDisabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'}`}>{day}</button>)
                          }
                          return days
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* KROK 3: Wybór godziny */}
                {!selectedService.flexibleDuration && !selectedService.allowMultiDay && bookingStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-500" />
                        Wybierz godzinę
                        <span className="text-slate-400 font-normal">({selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })})</span>
                      </p>
                      <button onClick={() => { setSelectedDate(''); setBookingStep(2) }} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Wstecz
                      </button>
                    </div>
                    {loadingSlots ? (
                      <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <button key={slot.time} onClick={() => { setSelectedTime(slot.time); setSelectedSlotEmployee(slot.employees?.[0]?.employeeId || slot.employeeId || ''); setBookingStep(4) }} className="py-3 px-2 rounded-xl text-sm font-medium transition-all bg-slate-50 hover:bg-teal-500 hover:text-white text-slate-700">{slot.time}</button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Brak dostępnych terminów</p>
                        <button onClick={() => { setSelectedDate(''); setBookingStep(2) }} className="mt-4 text-teal-500 hover:text-teal-600 font-medium">Wybierz inną datę</button>
                      </div>
                    )}
                  </div>
                )}

                {/* KROK 4: Dane klienta */}
                {!selectedService.flexibleDuration && !selectedService.allowMultiDay && bookingStep === 4 && !bookingSuccess && (
                  <div className="space-y-5">
                    {/* Podsumowanie terminu - elegancka karta */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Wybrany termin</div>
                          {/* Rezerwacja wielodniowa */}
                          {selectedService?.allowMultiDay && selectedEndDate ? (
                            <>
                              <div className="font-bold text-slate-800">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} - {new Date(selectedEndDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                              <div className="text-sm text-teal-600 font-medium mt-1">
                                {(() => {
                                  const start = new Date(selectedDate)
                                  const end = new Date(selectedEndDate)
                                  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                                  return `${days} dni`
                                })()}
                              </div>
                            </>
                          ) : selectedService?.flexibleDuration ? (
                            /* Rezerwacja godzinowa elastyczna */
                            <>
                              <div className="font-bold text-slate-800">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold text-teal-600">
                                  {selectedTime} - {(() => {
                                    const [h, m] = selectedTime.split(':').map(Number)
                                    const endMinutes = h * 60 + m + selectedDuration
                                    const endH = Math.floor(endMinutes / 60)
                                    const endM = endMinutes % 60
                                    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
                                  })()}
                                </span>
                                <span className="text-sm text-slate-500">
                                  ({Math.floor(selectedDuration / 60)}h{selectedDuration % 60 > 0 ? ` ${selectedDuration % 60}min` : ''})
                                </span>
                              </div>
                            </>
                          ) : (
                            /* Standardowa rezerwacja */
                            <>
                              <div className="font-bold text-slate-800">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                              <div className="text-lg font-bold text-teal-600 mt-1">{selectedTime}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Formularz danych - układ 2 kolumny na desktopie */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Imię i nazwisko *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="Jan Kowalski" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="+48 123 456 789" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="jan@example.com" required />
                      </div>
                    </div>
                    {/* Uwagi - dla usług elastycznych */}
                    {(selectedService?.flexibleDuration || selectedService?.allowMultiDay) && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Uwagi (opcjonalnie)</label>
                        <textarea 
                          value={customerNotes} 
                          onChange={(e) => setCustomerNotes(e.target.value)} 
                          rows={3}
                          className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white resize-none" 
                          placeholder="Dodatkowe informacje, specjalne wymagania..."
                        />
                      </div>
                    )}
                    {/* Kod rabatowy - ukryty dla usług elastycznych chyba że włączony w ustawieniach */}
                    {(!(selectedService?.flexibleDuration || selectedService?.allowMultiDay) || company?.flexibleServiceSettings?.showCouponCode) && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kod rabatowy</label>
                      <div className="flex gap-2">
                        <input type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); if (couponValid !== null) resetCoupon() }} disabled={couponValid === true} className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none ${couponValid === true ? 'border-green-500 bg-green-50' : couponValid === false ? 'border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-teal-500'}`} placeholder="Wpisz kod" />
                        {couponValid !== true ? (
                          <button onClick={validateCoupon} disabled={couponValidating || !couponCode.trim()} className="px-4 py-3 bg-slate-800 text-white rounded-xl font-medium disabled:opacity-50">{couponValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Zastosuj'}</button>
                        ) : (
                          <button onClick={resetCoupon} className="px-4 py-3 bg-red-50 text-red-500 rounded-xl"><X className="w-5 h-5" /></button>
                        )}
                      </div>
                      {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                      {couponValid && couponDiscount && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" />Rabat: {couponDiscount.type === 'percentage' ? `${couponDiscount.value}%` : `${couponDiscount.value} zł`}</div>
                      )}
                    </div>
                    )}
                    {/* Cena - obliczana dynamicznie dla usług elastycznych */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Do zapłaty</span>
                        <span className="text-xl font-bold text-slate-800">
                          {(() => {
                            let price = selectedService.price || parseFloat(selectedService.basePrice || '0')
                            if (selectedService.allowMultiDay && selectedEndDate && selectedService.pricePerDay) {
                              const start = new Date(selectedDate || getMinDate())
                              const end = new Date(selectedEndDate)
                              const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                              price = days * Number(selectedService.pricePerDay)
                            } else if (selectedService.flexibleDuration && selectedService.pricePerHour) {
                              price = (selectedDuration / 60) * Number(selectedService.pricePerHour)
                            }
                            return couponDiscount ? couponDiscount.finalPrice.toFixed(0) : price.toFixed(0)
                          })()} zł
                        </span>
                      </div>
                      {couponDiscount && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-sm text-green-600">
                          Rabat: -{couponDiscount.discountAmount.toFixed(0)} zł
                        </div>
                      )}
                    </div>
                    {/* Przycisk Dalej do kroku płatności */}
                    <div className="flex gap-3">
                      <button onClick={() => setBookingStep(3)} className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2"><ChevronLeft className="w-5 h-5" />Wstecz</button>
                      <button onClick={() => setBookingStep(5)} disabled={!customerName || !customerPhone || !customerEmail} className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-medium rounded-xl flex items-center justify-center gap-2">Dalej<ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </div>
                )}

                {/* KROK 5: Metoda płatności */}
                {!selectedService.flexibleDuration && !selectedService.allowMultiDay && bookingStep === 5 && !bookingSuccess && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-2"><Wallet className="w-5 h-5 text-teal-500" />Wybierz metodę płatności</p>
                      <button onClick={() => setBookingStep(4)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Wstecz</button>
                    </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Metoda płatności</label>
                        <div className="space-y-2">
                          {company?.paymentSettings?.acceptCashPayment && (
                            <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-teal-500" />
                              <div className="flex-1">
                                <div className="font-medium text-slate-800">Płatność na miejscu</div>
                                <div className="text-sm text-slate-500">Gotówka lub karta przy wizycie</div>
                              </div>
                            </label>
                          )}
                          {company?.paymentSettings?.przelewy24Enabled && (
                            <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'przelewy24' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input type="radio" name="paymentMethod" value="przelewy24" checked={paymentMethod === 'przelewy24'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-teal-500" />
                              <div className="flex-1">
                                <div className="font-medium text-slate-800">Przelewy24</div>
                                <div className="text-sm text-slate-500">BLIK, szybki przelew, karta online</div>
                              </div>
                              <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">P24</div>
                            </label>
                          )}
                          {company?.paymentSettings?.stripeEnabled && (
                            <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-teal-500" />
                              <div className="flex-1">
                                <div className="font-medium text-slate-800">Karta płatnicza</div>
                                <div className="text-sm text-slate-500">Visa, Mastercard, Apple Pay</div>
                              </div>
                              <div className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded">Stripe</div>
                            </label>
                          )}
                        </div>
                      </div>
                    {/* Informacja o zaliczce i wybór metody płatności */}
                    {paymentMethod === 'cash' && depositInfo?.required && depositInfo.amount > 0 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Wallet className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-amber-800">Wymagana opłata rezerwacyjna</h4>
                              <p className="text-sm text-amber-700 mt-1">
                                Aby potwierdzić rezerwację, wymagana jest opłata rezerwacyjna w wysokości <strong>{depositInfo.amount.toFixed(0)} zł</strong>.
                              </p>
                              <p className="text-xs text-amber-600 mt-2">
                                Pozostała kwota do zapłaty na miejscu.
                              </p>
                              <p className="text-xs text-amber-700 mt-2 font-medium">
                                ⚠️ Opłata rezerwacyjna jest bezzwrotna. W przypadku anulowania rezerwacji lub niestawienia się na wizytę, opłata nie podlega zwrotowi.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Wybierz metodę płatności zaliczki</label>
                          <div className="space-y-2">
                            {company?.paymentSettings?.przelewy24Enabled && (
                              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${depositPaymentProvider === 'przelewy24' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="depositProvider" value="przelewy24" checked={depositPaymentProvider === 'przelewy24'} onChange={(e) => setDepositPaymentProvider(e.target.value)} className="w-4 h-4 text-teal-500" />
                                <div className="flex-1"><div className="font-medium text-slate-800 text-sm">Przelewy24</div><div className="text-xs text-slate-500">BLIK, szybki przelew</div></div>
                              </label>
                            )}
                            {company?.paymentSettings?.stripeEnabled && (
                              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${depositPaymentProvider === 'stripe' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="depositProvider" value="stripe" checked={depositPaymentProvider === 'stripe'} onChange={(e) => setDepositPaymentProvider(e.target.value)} className="w-4 h-4 text-teal-500" />
                                <div className="flex-1"><div className="font-medium text-slate-800 text-sm">Karta płatnicza</div><div className="text-xs text-slate-500">Visa, Mastercard</div></div>
                              </label>
                            )}
                            {company?.paymentSettings?.payuEnabled && (
                              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${depositPaymentProvider === 'payu' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="depositProvider" value="payu" checked={depositPaymentProvider === 'payu'} onChange={(e) => setDepositPaymentProvider(e.target.value)} className="w-4 h-4 text-teal-500" />
                                <div className="flex-1"><div className="font-medium text-slate-800 text-sm">PayU</div><div className="text-xs text-slate-500">Szybkie płatności</div></div>
                              </label>
                            )}
                            {company?.paymentSettings?.tpayEnabled && (
                              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${depositPaymentProvider === 'tpay' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="depositProvider" value="tpay" checked={depositPaymentProvider === 'tpay'} onChange={(e) => setDepositPaymentProvider(e.target.value)} className="w-4 h-4 text-teal-500" />
                                <div className="flex-1"><div className="font-medium text-slate-800 text-sm">Tpay</div><div className="text-xs text-slate-500">BLIK, przelewy</div></div>
                              </label>
                            )}
                            {company?.paymentSettings?.autopayEnabled && (
                              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${depositPaymentProvider === 'autopay' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="depositProvider" value="autopay" checked={depositPaymentProvider === 'autopay'} onChange={(e) => setDepositPaymentProvider(e.target.value)} className="w-4 h-4 text-teal-500" />
                                <div className="flex-1"><div className="font-medium text-slate-800 text-sm">Autopay</div><div className="text-xs text-slate-500">BLIK, przelewy</div></div>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Zgody */}
                    {consentSettings && (
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={rodoConsent} onChange={(e) => setRodoConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500" /><span className="text-sm text-slate-600">{consentSettings.rodoConsentText} <span className="text-red-500">*</span></span></label>
                        {consentSettings.marketingConsentEnabled && consentSettings.marketingConsentText && (
                          <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500" /><span className="text-sm text-slate-600">{consentSettings.marketingConsentText}</span></label>
                        )}
                      </div>
                    )}
                    <button onClick={handleBookingSubmit} disabled={!customerName || !customerPhone || !customerEmail || bookingLoading || (consentSettings !== null && !rodoConsent)} className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 flex items-center justify-center gap-3">
                      {bookingLoading ? (
                        <><Loader2 className="w-6 h-6 animate-spin" />Rezerwuję...</>
                      ) : paymentMethod === 'cash' && depositInfo?.required && depositInfo?.amount > 0 ? (
                        <><Wallet className="w-6 h-6" />Zapłać zaliczkę {depositInfo.amount.toFixed(0)} zł</>
                      ) : paymentMethod === 'cash' ? (
                        <><Check className="w-6 h-6" />Potwierdź rezerwację</>
                      ) : (
                        <><Check className="w-6 h-6" />Zapłać {couponDiscount ? couponDiscount.finalPrice.toFixed(0) : (selectedService?.price || parseFloat(selectedService?.basePrice || '0')).toFixed(0)} zł</>
                      )}
                    </button>
                  </div>
                )}

                {/* Sukces */}
                {bookingSuccess && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-600" /></div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-2">Zarezerwowano!</h4>
                    <p className="text-slate-500 mb-6">Potwierdzenie wyślemy SMS-em</p>
                    <button onClick={resetBookingModal} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700">Zamknij</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MODAL KALENDARZA ========== */}
      <AnimatePresence>
        {calendarModal && selectedService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setCalendarModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md md:max-w-xl lg:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                <div><h3 className="font-semibold text-white">Wybierz termin</h3><p className="text-slate-400 text-sm">{selectedService.name}</p></div>
                <button onClick={() => setCalendarModal(false)} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
              </div>
              <div className="p-6 flex-1">
                {/* Kalendarz */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => { const n = new Date(currentMonth); n.setMonth(n.getMonth() - 1); setCurrentMonth(n) }} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                    <span className="font-medium text-slate-800">{currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => { const n = new Date(currentMonth); n.setMonth(n.getMonth() + 1); setCurrentMonth(n) }} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const year = currentMonth.getFullYear(); const month = currentMonth.getMonth()
                      const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0)
                      const daysInMonth = lastDay.getDate(); const startingDayOfWeek = (firstDay.getDay() + 6) % 7
                      const days = []; const today = new Date(); today.setHours(0, 0, 0, 0)
                      const minDate = new Date(getMinDate()); const maxDate = new Date(getMaxDate())
                      for (let i = 0; i < startingDayOfWeek; i++) days.push(<div key={`e-${i}`} />)
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day); const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isSelected = selectedDate === dateString; const isToday = date.getTime() === today.getTime(); const isDisabled = date < minDate || date > maxDate
                        days.push(<button key={day} onClick={() => { if (!isDisabled) { setSelectedDate(dateString); setSelectedTime('') } }} disabled={isDisabled} className={`aspect-square rounded-lg text-sm font-medium transition-all ${isSelected ? 'bg-teal-500 text-white' : isToday ? 'bg-teal-100 text-teal-700' : isDisabled ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100'}`}>{day}</button>)
                      }
                      return days
                    })()}
                  </div>
                </div>
                {/* Godziny */}
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">Dostępne godziny</p>
                    {loadingSlots ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div> : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button key={slot.time} onClick={() => { setSelectedTime(slot.time); setSelectedSlotEmployee(slot.employees?.[0]?.employeeId || slot.employeeId || ''); setCalendarModal(false); setBookingStep(3); setBookingModal(true) }} className={`py-3 rounded-lg text-sm font-medium transition-all ${selectedTime === slot.time ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{slot.time}</button>
                        ))}
                      </div>
                    ) : <div className="text-center py-8 text-slate-500">Brak dostępnych terminów</div>}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal zapisu na zajęcia grupowe */}
      <AnimatePresence>
        {groupBookingModal && selectedGroupBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={resetGroupBookingModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg md:max-w-xl lg:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!groupBookingSuccess ? (
                <>
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-800">Zapisz się na zajęcia</h3>
                      <button onClick={resetGroupBookingModal} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Informacje o zajęciach */}
                    <div className="bg-purple-50 rounded-xl p-4 mb-6">
                      <h4 className="font-semibold text-purple-800 mb-2">{selectedGroupBooking.title}</h4>
                      <div className="space-y-1 text-sm text-purple-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatGroupDateTime(selectedGroupBooking.startTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedGroupBooking.type.duration} min
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {selectedGroupBooking.currentParticipants}/{selectedGroupBooking.maxParticipants} uczestników
                          <span className="text-purple-500 font-medium">
                            ({selectedGroupBooking.maxParticipants - selectedGroupBooking.currentParticipants} wolnych)
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-purple-600">
                          {Number(selectedGroupBooking.pricePerPerson).toFixed(0)} zł/os
                        </span>
                        {groupParticipants.length > 1 && (
                          <span className="text-sm text-purple-700">
                            Razem: <strong>{(Number(selectedGroupBooking.pricePerPerson) * groupParticipants.filter(p => p.name.trim()).length).toFixed(0)} zł</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Formularz uczestników */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">Uczestnicy ({groupParticipants.length})</label>
                        {groupParticipants.length < (selectedGroupBooking.maxParticipants - selectedGroupBooking.currentParticipants) && (
                          <button
                            type="button"
                            onClick={addGroupParticipant}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Dodaj osobę
                          </button>
                        )}
                      </div>

                      {groupParticipants.map((participant, index) => (
                        <div key={index} className="bg-slate-50 rounded-xl p-4 relative">
                          {groupParticipants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeGroupParticipant(index)}
                              className="absolute top-2 right-2 p-1 hover:bg-slate-200 rounded-lg"
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          )}
                          <p className="text-xs font-medium text-slate-500 mb-3">Uczestnik {index + 1}</p>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={participant.name}
                              onChange={(e) => updateGroupParticipant(index, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                              placeholder="Imię i nazwisko *"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="email"
                                value={participant.email}
                                onChange={(e) => updateGroupParticipant(index, 'email', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                placeholder="Email"
                              />
                              <input
                                type="tel"
                                value={participant.phone}
                                onChange={(e) => updateGroupParticipant(index, 'phone', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                placeholder="Telefon *"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Zgody RODO */}
                    {consentSettings && (
                      <div className="mt-6 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={groupRodoConsent}
                            onChange={(e) => setGroupRodoConsent(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-sm text-slate-600">
                            {consentSettings.rodoConsentText} <span className="text-red-500">*</span>
                          </span>
                        </label>
                        {consentSettings.marketingConsentEnabled && consentSettings.marketingConsentText && (
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={groupMarketingConsent}
                              onChange={(e) => setGroupMarketingConsent(e.target.checked)}
                              className="mt-1 w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-600">{consentSettings.marketingConsentText}</span>
                          </label>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleGroupBookingSubmit}
                      disabled={groupBookingLoading || !groupParticipants.some(p => p.name.trim() && p.phone.trim()) || (consentSettings !== null && !groupRodoConsent)}
                      className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {groupBookingLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Users className="w-5 h-5" />
                          Zapisz {groupParticipants.filter(p => p.name.trim()).length > 1 ? `${groupParticipants.filter(p => p.name.trim()).length} osoby` : 'się'}
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Zapisano!</h3>
                  {groupBookingResult && (
                    <div className="bg-purple-50 rounded-xl p-4 mb-4 text-left">
                      <p className="text-sm text-purple-700">
                        <strong>{groupBookingResult.addedCount}</strong> {groupBookingResult.addedCount === 1 ? 'osoba zapisana' : 'osób zapisanych'} na zajęcia
                      </p>
                      {groupBookingResult.waitlistCount > 0 && (
                        <p className="text-sm text-orange-600 mt-1">
                          <strong>{groupBookingResult.waitlistCount}</strong> {groupBookingResult.waitlistCount === 1 ? 'osoba dodana' : 'osób dodanych'} do listy oczekujących
                        </p>
                      )}
                      <p className="text-sm text-purple-700 mt-2">
                        Do zapłaty: <strong>{groupBookingResult.totalPrice.toFixed(0)} zł</strong>
                      </p>
                    </div>
                  )}
                  <p className="text-slate-500 mb-6">
                    Potwierdzenie zostanie wysłane na podane adresy email.
                  </p>
                  <button
                    onClick={resetGroupBookingModal}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
                  >
                    Zamknij
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ========== MODAL SZCZEGÓŁÓW USŁUGI ========== */}
      <AnimatePresence>
        {serviceDetailModal && serviceDetailData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setServiceDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
                <button onClick={() => setServiceDetailModal(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-medium rounded-full mb-3">
                  {serviceDetailData.service_categories?.name || (typeof serviceDetailData.category === 'string' ? serviceDetailData.category : (serviceDetailData.category as any)?.name) || 'Usługa'}
                </span>
                <h2 className="text-2xl font-bold mb-2">{serviceDetailData.name}</h2>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{serviceDetailData.duration} min</span></div>
                  <div className="text-xl font-bold text-white">{serviceDetailData.price || serviceDetailData.basePrice} zł</div>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Opis usługi</h3>
                {serviceDetailData.description ? (
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{serviceDetailData.description}</p>
                ) : (
                  <p className="text-slate-400 italic">Brak opisu dla tej usługi.</p>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => { setServiceDetailModal(false); setSelectedService(serviceDetailData); setBookingModal(true) }}
                  className={`w-full py-3.5 text-white font-semibold ${getButtonRoundedClass()} transition-all shadow-lg flex items-center justify-center gap-2`}
                  style={{ backgroundColor: pageSettings.primaryColor }}
                >
                  <Calendar className="w-5 h-5" />
                  {pageSettings.bookingButtonText || 'Zarezerwuj'} teraz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal informacji o płatności */}
      <AnimatePresence>
        {paymentSuccessInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setPaymentSuccessInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {paymentSuccessInfo.status === 'paid' && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Płatność zakończona!</h2>
                  <p className="text-slate-600 mb-6">Twoja rezerwacja została potwierdzona. Szczegóły otrzymasz na podany adres email.</p>
                  <button
                    onClick={() => setPaymentSuccessInfo(null)}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Zamknij
                  </button>
                </div>
              )}
              {paymentSuccessInfo.status === 'processing' && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Przetwarzanie płatności</h2>
                  <p className="text-slate-600 mb-6">Twoja płatność jest przetwarzana. Potwierdzenie otrzymasz na email w ciągu kilku minut.</p>
                  <button
                    onClick={() => setPaymentSuccessInfo(null)}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Rozumiem
                  </button>
                </div>
              )}
              {paymentSuccessInfo.status === 'cancelled' && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Płatność anulowana</h2>
                  <p className="text-slate-600 mb-6">Płatność została anulowana. Możesz spróbować ponownie lub wybrać inną metodę płatności.</p>
                  <p className="text-sm text-slate-500 mb-4">Rezerwacja zostanie automatycznie anulowana jeśli nie zostanie opłacona w ciągu 10 minut.</p>
                  <button
                    onClick={() => setPaymentSuccessInfo(null)}
                    className="w-full py-3 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Zamknij
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
