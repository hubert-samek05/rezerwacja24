'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, CalendarDays, Clock, MapPin, Phone, Mail, Star,
  Facebook, Instagram, Globe as GlobeIcon, ArrowRight, Loader2,
  ChevronDown, ChevronLeft, ChevronRight, Check, X, User, Sparkles
} from 'lucide-react'

interface Service {
  id: string; name: string; description: string
  category?: string | { id: string; name: string; [key: string]: any }
  service_categories?: { id: string; name: string; color?: string }
  price?: number; basePrice?: string; duration: number; employees?: string[]
}

interface Employee { id: string; firstName: string; lastName: string; role: string; services: string[] }

interface CompanyData {
  userId?: string; businessName: string; subdomain: string; email?: string; phone?: string
  address?: string; city?: string; description?: string; logo?: string; banner?: string
  openingHours?: any
  socialMedia?: { facebook?: string; instagram?: string; website?: string }
  services?: Service[]; employees?: Employee[]
  paymentSettings?: { acceptCashPayment?: boolean; acceptOnlinePayment?: boolean; paymentProvider?: string; stripeEnabled?: boolean; przelewy24Enabled?: boolean; payuEnabled?: boolean }
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

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (selectedEmployee && selectedDate && selectedService && company?.userId) {
        setLoadingSlots(true)
        try {
          const response = await fetch(`/api/bookings/availability?tenantId=${company.userId}&serviceId=${selectedService.id}&employeeId=${selectedEmployee}&date=${selectedDate}`)
          if (response.ok) { const data = await response.json(); setAvailableSlots(data.availableSlots || []) }
          else { setAvailableSlots([]) }
        } catch { setAvailableSlots([]) }
        finally { setLoadingSlots(false) }
      }
    }
    loadAvailableSlots()
  }, [selectedEmployee, selectedDate, selectedService, company?.userId])

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

  const handleBookingSubmit = async () => {
    const finalEmployeeId = selectedSlotEmployee || selectedEmployee
    if (!selectedService || !finalEmployeeId || !selectedDate || !selectedTime || !customerName || !customerPhone) { alert('Proszę wypełnić wszystkie wymagane pola'); return }
    if (paymentMethod !== 'cash' && !customerEmail) { alert('Email jest wymagany dla płatności online'); return }
    setBookingLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: company?.userId, serviceId: selectedService.id, employeeId: finalEmployeeId, date: selectedDate, time: selectedTime, customerName, customerPhone, customerEmail, couponCode: couponValid && couponDiscount ? couponCode.trim().toUpperCase() : null, discountAmount: couponDiscount?.discountAmount || 0, rodoConsent, rodoConsentText: consentSettings?.rodoConsentText, marketingConsent: consentSettings?.marketingConsentEnabled ? marketingConsent : false, marketingConsentText: marketingConsent ? consentSettings?.marketingConsentText : null })
      })
      if (response.ok) {
        const result = await response.json(); const booking = result.booking || result; const bookingId = booking?.id
        if (bookingId) {
          if (paymentMethod !== 'cash') {
            const basePrice = selectedService.price || parseFloat(selectedService.basePrice || '0')
            const finalAmount = couponDiscount ? couponDiscount.finalPrice : basePrice
            const paymentResponse = await fetch('/api/payments/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId, amount: finalAmount, provider: paymentMethod, customerEmail, customerName, userId: company?.userId }) })
            if (paymentResponse.ok) { const paymentResult = await paymentResponse.json(); if (paymentResult.paymentUrl) { window.location.href = paymentResult.paymentUrl; return } else if (paymentResult.clientSecret) { setPaymentUrl(paymentResult.clientSecret); setBookingSuccess(true); setBookingStep(4) } }
            else { setBookingSuccess(true); setBookingStep(4) }
          } else { setBookingSuccess(true); setBookingStep(4) }
        } else { alert(result.error || result.message || 'Nie udało się utworzyć rezerwacji.') }
      } else { const error = await response.json(); alert(error.error || error.message || 'Nie udało się utworzyć rezerwacji.') }
    } catch { alert('Wystąpił błąd. Spróbuj ponownie.') }
    finally { setBookingLoading(false) }
  }

  const resetBookingModal = () => { setBookingModal(false); setCalendarModal(false); setSelectedService(null); setSelectedEmployee(''); setSelectedDate(''); setSelectedTime(''); setSelectedSlotEmployee(''); setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); setBookingStep(1); setBookingSuccess(false); setAvailableSlots([]); resetCoupon() }
  const getAvailableEmployees = () => { if (!selectedService || !company?.employees) return []; return company.employees.filter(emp => emp.services?.includes(selectedService.id)) }
  const getMinDate = () => { const today = new Date(); return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}` }
  const getMaxDate = () => { const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 30); return `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}` }

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========== BANER HERO ========== */}
      <section className="relative h-[500px] sm:h-[550px]">
        {/* Tło - baner lub gradient */}
        <div className="absolute inset-0">
          {company.banner ? (
            <img src={company.banner} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        {/* Górna nawigacja */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {company.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">{company.phone}</span>
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  {company.email}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              {company.socialMedia?.facebook && (
                <a href={company.socialMedia.facebook} target="_blank" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
              )}
              {company.socialMedia?.instagram && (
                <a href={company.socialMedia.instagram} target="_blank" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Treść banera - Logo, nazwa, opis */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              {/* Logo */}
              {company.logo && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="inline-block bg-white p-3 rounded-2xl shadow-2xl">
                    <img src={company.logo} alt={company.businessName} className="h-14 sm:h-16 w-auto" />
                  </div>
                </motion.div>
              )}

              {/* Nazwa firmy */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              >
                {company.businessName}
              </motion.h1>

              {/* Opis */}
              {company.description && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed"
                >
                  {company.description}
                </motion.p>
              )}

              {/* Przyciski */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById('uslugi')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Zarezerwuj wizytę
                </button>
                {company.address && (
                  <div className="px-5 py-3.5 bg-white/10 backdrop-blur text-white rounded-xl flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span className="text-sm">{company.address}, {company.city}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SEKCJA USŁUG ========== */}
      <section id="uslugi" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Nagłówek */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Nasze usługi</h2>
            <p className="text-slate-500">Wybierz usługę i umów się na wizytę</p>
          </div>

          {/* Filtry kategorii */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : String(cat)
                return (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === catName
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {catName === 'all' ? 'Wszystkie' : catName}
                  </button>
                )
              })}
            </div>
          )}

          {/* Grid usług */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all group"
              >
                {/* Górna część karty */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                      {service.service_categories?.name || (typeof service.category === 'string' ? service.category : (service.category as any)?.name) || 'Usługa'}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800">{service.price || service.basePrice} zł</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{service.name}</h3>
                  
                  {service.description && (
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                  )}
                  
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                {/* Przycisk rezerwacji */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => { setSelectedService(service); setBookingModal(true) }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Zarezerwuj
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 text-slate-500">Brak usług w tej kategorii</div>
          )}
        </div>
      </section>

      {/* ========== GODZINY OTWARCIA ========== */}
      {company.openingHours && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Godziny otwarcia</h2>
            <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-6">
              {Object.entries(company.openingHours).map(([day, hours]: [string, any]) => {
                const dayNames: Record<string, string> = { monday: 'Poniedziałek', tuesday: 'Wtorek', wednesday: 'Środa', thursday: 'Czwartek', friday: 'Piątek', saturday: 'Sobota', sunday: 'Niedziela' }
                return (
                  <div key={day} className="flex justify-between py-3 border-b border-slate-200 last:border-0">
                    <span className="text-slate-600">{dayNames[day]}</span>
                    <span className={`font-medium ${hours.closed ? 'text-slate-400' : 'text-slate-800'}`}>
                      {hours.closed ? 'Zamknięte' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========== KONTAKT ========== */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Skontaktuj się z nami</h2>
              <p className="text-slate-400 mb-8">Masz pytania? Chętnie na nie odpowiemy.</p>
              <div className="space-y-4">
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="flex items-center gap-4 text-white hover:text-teal-400 transition-colors">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                    <span className="text-lg">{company.phone}</span>
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`} className="flex items-center gap-4 text-white hover:text-teal-400 transition-colors">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                    <span className="text-lg">{company.email}</span>
                  </a>
                )}
                {company.address && (
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                    <span className="text-lg">{company.address}, {company.city}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => document.getElementById('uslugi')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all shadow-lg text-lg"
              >
                Zarezerwuj wizytę
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} {company.businessName}</p>
          <p className="text-slate-600 text-xs mt-2">
            Powered by <a href="https://rezerwacja24.pl" className="text-teal-500 hover:text-teal-400">Rezerwacja24</a>
          </p>
        </div>
      </footer>

      {/* ========== MODAL REZERWACJI ========== */}
      <AnimatePresence>
        {bookingModal && selectedService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBookingModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Rezerwacja</h3>
                  <p className="text-slate-400 text-sm">{selectedService.name}</p>
                </div>
                <button onClick={() => setBookingModal(false)} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="p-6">
                {/* Info */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-slate-500"><Clock className="w-4 h-4" /><span>{selectedService.duration} min</span></div>
                  <div className="text-xl font-bold text-slate-800">{selectedService.price || selectedService.basePrice} zł</div>
                </div>

                {/* KROK 1: Pracownik */}
                {bookingStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 mb-3">Wybierz specjalistę</p>
                    <button onClick={() => { setSelectedEmployee('any'); setBookingModal(false); setCalendarModal(true) }} className="w-full p-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-left transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
                        <div><div className="font-medium">Dowolny specjalista</div><div className="text-sm text-white/70">Najszybszy termin</div></div>
                      </div>
                    </button>
                    {getAvailableEmployees().map((emp) => (
                      <button key={emp.id} onClick={() => { setSelectedEmployee(emp.id); setBookingModal(false); setCalendarModal(true) }} className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-600" /></div>
                          <div><div className="font-medium text-slate-800">{emp.firstName} {emp.lastName}</div><div className="text-sm text-slate-500">{emp.role}</div></div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* KROK 3: Dane */}
                {bookingStep === 3 && selectedTime && !bookingSuccess && (
                  <div className="space-y-4">
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                      <div className="text-sm text-teal-600 mb-1">Wybrany termin</div>
                      <div className="font-semibold text-slate-800">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                      <div className="text-lg font-bold text-slate-800">{selectedTime}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Imię i nazwisko *</label>
                      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Jan Kowalski" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefon *</label>
                      <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="+48 123 456 789" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="jan@example.com" />
                    </div>
                    {/* Kod rabatowy */}
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
                    {/* Cena */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Cena</span><span className={couponDiscount ? 'line-through text-slate-400' : 'text-slate-800'}>{(selectedService.price || parseFloat(selectedService.basePrice || '0')).toFixed(2)} zł</span></div>
                      {couponDiscount && (<><div className="flex justify-between text-sm text-green-600"><span>Rabat</span><span>-{couponDiscount.discountAmount.toFixed(2)} zł</span></div><div className="flex justify-between font-bold text-slate-800 mt-2 pt-2 border-t border-slate-200"><span>Do zapłaty</span><span>{couponDiscount.finalPrice.toFixed(2)} zł</span></div></>)}
                    </div>
                    {/* Zgody */}
                    {consentSettings && (
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={rodoConsent} onChange={(e) => setRodoConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500" /><span className="text-sm text-slate-600">{consentSettings.rodoConsentText} <span className="text-red-500">*</span></span></label>
                        {consentSettings.marketingConsentEnabled && consentSettings.marketingConsentText && (
                          <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500" /><span className="text-sm text-slate-600">{consentSettings.marketingConsentText}</span></label>
                        )}
                      </div>
                    )}
                    <button onClick={handleBookingSubmit} disabled={!customerName || !customerPhone || bookingLoading || (consentSettings !== null && !rodoConsent)} className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                      {bookingLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Rezerwuję...</> : <><Check className="w-5 h-5" />Potwierdź rezerwację</>}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCalendarModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                <div><h3 className="font-semibold text-white">Wybierz termin</h3><p className="text-slate-400 text-sm">{selectedService.name}</p></div>
                <button onClick={() => setCalendarModal(false)} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
              </div>
              <div className="p-6">
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
    </div>
  )
}
