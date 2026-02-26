'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Download,
  Clock,
  X,
  Check,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  User,
  Briefcase,
  DollarSign,
  CreditCard,
  UserPlus,
  XCircle,
  CheckCircle,
  Ticket,
  Package,
  Banknote,
  Ban,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { getBookings, getEmployees, getServices, addBooking, updateBooking, deleteBooking, getCustomers, addCustomer, type Booking } from '@/lib/storage'
import toast from 'react-hot-toast'
import { getTenantConfig } from '@/lib/tenant'
import { getApiUrl } from '@/lib/api-url'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'
const API_URL = getApiUrl()

export default function CalendarPage() {
  const { t, language } = useDashboardTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currency = language === 'pl' ? 'zł' : '€'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [dayViewMode, setDayViewMode] = useState<'list' | 'grid'>('list') // Tryb widoku dziennego
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [isMobile, setIsMobile] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{date: string, time: string} | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    employeeId: '',
    date: '',
    time: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showAllBookingsModal, setShowAllBookingsModal] = useState(false)
  const [allBookingsInSlot, setAllBookingsInSlot] = useState<any[]>([])
  const [slotInfo, setSlotInfo] = useState<{date: string, time: string} | null>(null)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customerPasses, setCustomerPasses] = useState<any[]>([])
  const [selectedPassId, setSelectedPassId] = useState<string>('')
  const [usePass, setUsePass] = useState(false)
  const [packages, setPackages] = useState<any[]>([])
  const [bookingType, setBookingType] = useState<'service' | 'package'>('service')
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [groupBookings, setGroupBookings] = useState<any[]>([])
  const [externalEvents, setExternalEvents] = useState<any[]>([])
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [paymentMethodModalBooking, setPaymentMethodModalBooking] = useState<any>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash')
  const [paymentModalCustomerPasses, setPaymentModalCustomerPasses] = useState<any[]>([])
  
  // Blokady czasu
  const [timeBlocks, setTimeBlocks] = useState<any[]>([])
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockFormData, setBlockFormData] = useState({
    employeeId: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    reason: ''
  })

  useEffect(() => {
    loadData()
    fetchPackages()
    fetchGroupBookings()
    fetchExternalEvents()
    fetchTimeBlocks()
    
    // Detect mobile - nie wymuszamy już widoku dziennego, użytkownik może wybrać
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Obsługa parametru action z URL (szybkie akcje z dashboardu)
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'new-booking') {
      // Otwórz modal dodawania rezerwacji
      const today = new Date().toISOString().split('T')[0]
      setSelectedSlot({ date: today, time: '09:00' })
      setFormData(prev => ({ ...prev, date: today, time: '09:00' }))
      setShowAddModal(true)
      // Usuń parametr z URL
      router.replace('/dashboard/calendar', { scroll: false })
    }
  }, [searchParams, router])

  // Zamknij dropdown przy kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.customer-autocomplete')) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadData = async () => {
    try {
      const config = {
        ...getTenantConfig()
      }

      // Pobierz dane z API
      const [employeesRes, servicesRes, customersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/employees?isActive=true`, config),
        axios.get(`${API_URL}/api/services`, config),
        axios.get(`${API_URL}/api/customers`, config),
        axios.get(`${API_URL}/api/bookings`, config)
      ])

      setEmployees(employeesRes.data || [])
      setServices(servicesRes.data || [])
      setCustomers(customersRes.data || [])
      
      // Transform bookings from API format to calendar format
      const transformedBookings = (bookingsRes.data || []).map((booking: any) => {
        const startTime = new Date(booking.startTime)
        const endTime = new Date(booking.endTime)
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
        
        // Sprawdź czy to rezerwacja wielodniowa
        const startDate = startTime.toISOString().split('T')[0]
        const endDateStr = endTime.toISOString().split('T')[0]
        const isMultiDay = startDate !== endDateStr
        
        // Rezerwacja jest całodniowa TYLKO jeśli trwa więcej niż 1 dzień (różne daty startu i końca)
        // Rezerwacje godzinowe (nawet długie, np. 8-9h) NIE są traktowane jako całodniowe
        const isFullDay = isMultiDay
        
        return {
          id: booking.id,
          customerId: booking.customerId,
          customerName: `${booking.customers?.firstName || ''} ${booking.customers?.lastName || ''}`,
          serviceId: booking.serviceId,
          serviceName: booking.services?.name || '',
          employeeId: booking.employeeId,
          employeeName: `${booking.employees?.firstName || ''} ${booking.employees?.lastName || ''}`,
          date: startDate,
          endDate: endDateStr, // Dodajemy datę końcową
          time: startTime.toTimeString().slice(0, 5),
          duration: duration,
          price: parseFloat(booking.totalPrice),
          status: booking.status.toLowerCase(),
          paymentStatus: booking.isPaid ? 'paid' : 'unpaid',
          paymentMethod: booking.paymentMethod || null,
          notes: booking.customerNotes || '',
          isMultiDay: isMultiDay,
          isFullDay: isFullDay, // Flaga dla rezerwacji całodniowych (na dni)
          // Informacje o anulowaniu
          cancelledAt: booking.cancelledAt || null,
          cancelledBy: booking.cancelledBy || null,
          cancellationReason: booking.cancellationReason || null
        }
      })
      
      setBookings(transformedBookings)
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      // Fallback do localStorage
      setEmployees(getEmployees())
      setServices(getServices())
      setCustomers(getCustomers())
      setBookings(getBookings())
    }
  }

  // Pobierz aktywne karnety klienta
  const fetchCustomerPasses = async (customerId: string) => {
    if (!customerId) {
      setCustomerPasses([])
      setSelectedPassId('')
      setUsePass(false)
      return
    }
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/passes/customer/${customerId}/active`, config)
      const passes = response.data || []
      setCustomerPasses(passes)
      // Automatycznie zaznacz użycie karnetu jeśli klient ma aktywny
      if (passes.length > 0) {
        setSelectedPassId(passes[0].id)
        setUsePass(true)
      } else {
        setSelectedPassId('')
        setUsePass(false)
      }
    } catch (error) {
      console.error('Błąd pobierania karnetów:', error)
      setCustomerPasses([])
    }
  }

  // Pobierz pakiety
  const fetchPackages = async () => {
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/packages`, config)
      setPackages(response.data || [])
    } catch (error) {
      console.error('Błąd pobierania pakietów:', error)
    }
  }

  // Pobierz zajęcia grupowe
  const fetchGroupBookings = async () => {
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/group-bookings`, config)
      setGroupBookings(response.data || [])
    } catch (error) {
      console.error('Błąd pobierania zajęć grupowych:', error)
    }
  }

  const fetchExternalEvents = async () => {
    try {
      const config = getTenantConfig()
      // Pobierz wydarzenia z zewnętrznego kalendarza (Google Calendar iCal)
      const response = await axios.get(`${API_URL}/api/calendar/external-events`, config)
      const events = (response.data || []).map((event: any) => ({
        id: event.id,
        title: event.title || 'Zajęty (Google Calendar)',
        date: new Date(event.startTime).toISOString().split('T')[0],
        time: new Date(event.startTime).toTimeString().slice(0, 5),
        endTime: new Date(event.endTime).toTimeString().slice(0, 5),
        startTime: new Date(event.startTime),
        endTimeDate: new Date(event.endTime),
        allDay: event.allDay,
        isExternal: true,
        source: event.source || 'google_ical'
      }))
      setExternalEvents(events)
    } catch (error) {
      // Nie pokazuj błędu jeśli endpoint nie istnieje - integracja może być wyłączona
      console.log('External events not available:', error)
    }
  }

  // Pobierz blokady czasu
  const fetchTimeBlocks = async () => {
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/time-off`, config)
      setTimeBlocks(response.data || [])
    } catch (error) {
      console.log('Time blocks not available:', error)
    }
  }

  // Dodaj blokadę czasu
  const handleAddTimeBlock = async () => {
    if (!blockFormData.employeeId || !blockFormData.startDate || !blockFormData.endDate) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }

    try {
      const config = getTenantConfig()
      const startTime = new Date(`${blockFormData.startDate}T${blockFormData.startTime}:00`)
      const endTime = new Date(`${blockFormData.endDate}T${blockFormData.endTime}:00`)

      await axios.post(`${API_URL}/api/time-off`, {
        employeeId: blockFormData.employeeId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: blockFormData.reason || 'Blokada'
      }, config)

      toast.success('Blokada dodana')
      setShowBlockModal(false)
      setBlockFormData({
        employeeId: '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '17:00',
        reason: ''
      })
      fetchTimeBlocks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nie udało się dodać blokady')
    }
  }

  // Usuń blokadę czasu
  const handleDeleteTimeBlock = async (blockId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę blokadę?')) return

    try {
      const config = getTenantConfig()
      await axios.delete(`${API_URL}/api/time-off/${blockId}`, config)
      toast.success('Blokada usunięta')
      fetchTimeBlocks()
    } catch (error) {
      toast.error('Nie udało się usunąć blokady')
    }
  }

  const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00

  const getWeekDates = () => {
    const start = new Date(currentDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      return date
    })
  }

  const getDayBookings = (date: Date, hour: number) => {
    // Użyj lokalnej daty zamiast toISOString() aby uniknąć przesunięcia strefy czasowej
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const filtered = selectedEmployee === 'all' 
      ? bookings 
      : bookings.filter(b => b.employeeId === selectedEmployee)
    
    const regularBookings = filtered.filter(b => {
      // Dla rezerwacji wielodniowych - pokaż we wszystkich dniach
      const isInDateRange = b.isMultiDay && b.endDate 
        ? (dateStr >= b.date && dateStr <= b.endDate)
        : b.date === dateStr
      
      if (!isInDateRange) return false
      
      // Dla rezerwacji wielodniowych - pokaż cały dzień (od 9:00)
      if (b.isMultiDay) {
        return hour === 9 // Pokaż tylko raz o 9:00
      }
      
      const bookingHour = parseInt(b.time.split(':')[0])
      return bookingHour === hour
    }).map(b => ({ ...b, eventType: 'booking' }))

    // Dodaj zajęcia grupowe
    const filteredGroup = selectedEmployee === 'all'
      ? groupBookings
      : groupBookings.filter((g: any) => g.employeeId === selectedEmployee || !g.employeeId)
    
    const groupEvents = filteredGroup.filter((g: any) => {
      const gDate = new Date(g.startTime).toISOString().split('T')[0]
      if (gDate !== dateStr) return false
      const gHour = new Date(g.startTime).getHours()
      return gHour === hour
    }).map((g: any) => ({
      id: g.id,
      date: dateStr,
      time: new Date(g.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
      customerName: g.title,
      serviceName: `${g.currentParticipants}/${g.maxParticipants} uczestników`,
      employeeName: g.employee ? `${g.employee.firstName} ${g.employee.lastName}` : 'Brak prowadzącego',
      price: Number(g.pricePerPerson),
      status: g.status === 'OPEN' ? 'confirmed' : 'pending',
      duration: g.type?.duration || 60,
      eventType: 'group',
      isPublic: g.isPublic,
      groupData: g
    }))

    // Dodaj wydarzenia z zewnętrznego kalendarza (Google Calendar)
    const externalEventsFiltered = externalEvents.filter((e: any) => {
      if (e.date !== dateStr) return false
      const eHour = parseInt(e.time.split(':')[0])
      return eHour === hour
    }).map((e: any) => ({
      id: e.id,
      date: dateStr,
      time: e.time,
      customerName: e.title,
      serviceName: 'Google Calendar',
      employeeName: '',
      price: 0,
      status: 'external',
      duration: Math.round((new Date(e.endTimeDate).getTime() - new Date(e.startTime).getTime()) / 60000),
      eventType: 'external',
      isExternal: true
    }))

    // Dodaj blokady czasu
    const filteredBlocks = selectedEmployee === 'all'
      ? timeBlocks
      : timeBlocks.filter((b: any) => b.employeeId === selectedEmployee)
    
    const blockEvents = filteredBlocks.filter((b: any) => {
      const blockStart = new Date(b.startTime)
      const blockEnd = new Date(b.endTime)
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(date)
      slotEnd.setHours(hour + 1, 0, 0, 0)
      
      // Sprawdź czy blokada nakłada się na ten slot
      return blockStart < slotEnd && blockEnd > slotStart
    }).map((b: any) => ({
      id: b.id,
      date: dateStr,
      time: new Date(b.startTime).toTimeString().slice(0, 5),
      customerName: b.reason || 'Zablokowane',
      serviceName: 'Blokada',
      employeeName: b.employee ? `${b.employee.firstName} ${b.employee.lastName}` : '',
      price: 0,
      status: 'blocked',
      duration: Math.round((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 60000),
      eventType: 'block',
      isBlock: true,
      blockData: b
    }))

    return [...regularBookings, ...groupEvents, ...externalEventsFiltered, ...blockEvents]
  }

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate)
    
    if (direction === 'today') {
      setCurrentDate(new Date())
      return
    }
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  const handleSlotClick = (date: Date, hour: number) => {
    // Użyj lokalnej daty zamiast toISOString() aby uniknąć przesunięcia strefy czasowej
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const timeStr = `${hour.toString().padStart(2, '0')}:00`
    setSelectedSlot({ date: dateStr, time: timeStr })
    setFormData({
      customerId: '',
      serviceId: '',
      employeeId: selectedEmployee !== 'all' ? selectedEmployee : '',
      date: dateStr,
      time: timeStr,
      notes: ''
    })
    setCustomerSearch('')
    setShowCustomerDropdown(false)
    setEditMode(false)
    setFormErrors([])
    setShowAddModal(true)
  }

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking)
  }

  const handleEditBooking = (booking: any) => {
    setFormData({
      customerId: booking.customerId,
      serviceId: booking.serviceId,
      employeeId: booking.employeeId,
      date: booking.date,
      time: booking.time,
      notes: booking.notes || ''
    })
    setCustomerSearch(booking.customerName)
    setShowCustomerDropdown(false)
    setEditMode(true)
    setSelectedBooking(booking)
    setFormErrors([])
    setShowAddModal(true)
  }

  // Funkcja pomocnicza do obliczania czasu zakończenia
  const getEndTime = (startTime: string, duration: number): string => {
    const [hours, mins] = startTime.split(':').map(Number)
    const totalMins = hours * 60 + mins + duration
    const endHours = Math.floor(totalMins / 60) % 24
    const endMins = totalMins % 60
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  // Funkcja do wyświetlania czasu rezerwacji (obsługuje rezerwacje wielodniowe)
  const getBookingTimeDisplay = (booking: any): string => {
    if (booking.isMultiDay) {
      // Dla rezerwacji wielodniowych - pokaż zakres dat
      const startDate = new Date(booking.date + 'T00:00:00')
      const endDate = new Date(booking.endDate + 'T00:00:00')
      const startStr = startDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
      const endStr = endDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
      return `${startStr} - ${endStr} (cały dzień)`
    }
    // Dla zwykłych rezerwacji - pokaż godziny
    return `${booking.time} - ${getEndTime(booking.time, booking.duration)}`
  }

  // Sprawdź czy rezerwacja jest całodniowa (elastyczna na dni)
  const isFullDayBooking = (booking: any): boolean => {
    return booking.isMultiDay === true
  }

  const checkBookingConflict = (date: string, time: string, employeeId: string, duration: number, excludeBookingId?: string) => {
    // Parsuj nowy czas rezerwacji (w minutach od północy)
    const [newHour, newMin] = time.split(':').map(Number)
    const newStart = newHour * 60 + newMin
    const newEnd = newStart + duration
    
    const conflicts = bookings.filter(b => {
      if (excludeBookingId && b.id === excludeBookingId) return false
      if (b.date !== date || b.employeeId !== employeeId) return false
      
      // Parsuj istniejącą rezerwację (w minutach od północy)
      const [existingHour, existingMin] = b.time.split(':').map(Number)
      const existingStart = existingHour * 60 + existingMin
      const existingEnd = existingStart + b.duration
      
      // Dwa przedziały kolidują gdy: A < D AND B > C
      // Rezerwacje "stykające się" (np. 9:00-9:20 i 9:20-9:40) NIE kolidują
      return newStart < existingEnd && newEnd > existingStart
    })
    return conflicts.length > 0
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.customerId) errors.push('Wybierz klienta')
    if (!formData.serviceId) errors.push('Wybierz usługę')
    if (!formData.employeeId) errors.push('Wybierz pracownika')
    if (!formData.date) errors.push('Wybierz datę')
    if (!formData.time) errors.push('Wybierz godzinę')
    
    // Check for conflicts
    if (formData.date && formData.time && formData.employeeId && formData.serviceId) {
      // Pobierz czas trwania wybranej usługi
      const selectedService = services.find(s => s.id === formData.serviceId)
      const serviceDuration = selectedService?.duration || 60
      
      const hasConflict = checkBookingConflict(
        formData.date, 
        formData.time, 
        formData.employeeId,
        serviceDuration,
        editMode ? selectedBooking?.id : undefined
      )
      if (hasConflict) {
        errors.push('Konflikt rezerwacji - pracownik jest zajęty w tym czasie')
      }
    }
    
    setFormErrors(errors)
    return errors.length === 0
  }

  const handleSubmitBooking = async () => {
    if (!validateForm()) return
    
    const customer = customers.find(c => c.id === formData.customerId)
    const service = services.find(s => s.id === formData.serviceId)
    const employee = employees.find(e => e.id === formData.employeeId)
    
    if (!customer || !service || !employee) {
      toast.error(t.calendar?.dataNotFound || 'Data not found. Refresh the page and try again.')
      return
    }
    
    try {
      // Create startTime and endTime from date and time
      const [hours, minutes] = formData.time.split(':')
      const startTime = new Date(formData.date)
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + service.duration)
      
      // Użyj basePrice (z API) lub price (fallback)
      const servicePrice = parseFloat(service.basePrice) || parseFloat(service.price) || 0
      
      const bookingData = {
        customerId: customer.id,
        serviceId: service.id,
        employeeId: employee.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: formData.notes,
        totalPrice: servicePrice
      }
      
      const config = {
        ...getTenantConfig()
      }
      
      if (editMode && selectedBooking) {
        await axios.patch(`${API_URL}/api/bookings/${selectedBooking.id}`, bookingData, config)
        toast.success(t.calendar?.bookingUpdated || 'Booking updated!')
      } else {
        const response = await axios.post(`${API_URL}/api/bookings`, bookingData, config)
        const newBooking = response.data
        
        // Automatycznie zatwierdź rezerwację dodaną przez pracownika
        if (newBooking.status === 'PENDING') {
          await axios.patch(`${API_URL}/api/bookings/${newBooking.id}`, 
            { status: 'CONFIRMED' },
            config
          )
        }

        // Wykorzystaj karnet jeśli wybrany
        if (usePass && selectedPassId) {
          try {
            await axios.post(`${API_URL}/api/passes/${selectedPassId}/use`, {
              bookingId: newBooking.id
            }, config)
            toast.success(t.calendar?.passUsed || 'Pass used!')
          } catch (passError) {
            console.error('Błąd wykorzystania karnetu:', passError)
            toast.error(t.calendar?.passUseError || 'Booking created, but pass could not be used')
          }
        }
        
        // Dodaj nową rezerwację do stanu natychmiast
        // Użyj ceny z odpowiedzi API lub ceny usługi jako fallback
        const bookingPrice = newBooking.totalPrice 
          ? parseFloat(newBooking.totalPrice) 
          : (parseFloat(service.basePrice) || parseFloat(service.price) || 0)
        
        const transformedBooking = {
          id: newBooking.id,
          customerId: newBooking.customerId,
          customerName: `${customer.firstName} ${customer.lastName}`,
          serviceId: newBooking.serviceId,
          serviceName: service.name,
          employeeId: newBooking.employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          date: formData.date,
          time: formData.time,
          duration: service.duration,
          price: bookingPrice,
          status: 'confirmed',
          paymentStatus: newBooking.isPaid ? 'paid' : 'unpaid',
          notes: formData.notes
        }
        
        setBookings(prev => [...prev, transformedBooking])
        toast.success(t.calendar?.bookingCreated || `Booking for ${customer.firstName} ${customer.lastName} created!`)
      }
      
      // Zamknij modal
      setShowAddModal(false)
      setSelectedBooking(null)
      setEditMode(false)
      setFormData({
        customerId: '',
        serviceId: '',
        employeeId: '',
        date: '',
        time: '',
        notes: ''
      })
      // Reset stanu karnetów
      setCustomerPasses([])
      setSelectedPassId('')
      setUsePass(false)
      setCustomerSearch('')
      
      // Odśwież dane w tle
      loadData()
    } catch (error: any) {
      console.error('Błąd tworzenia rezerwacji:', error)
      toast.error(error.response?.data?.message || error.message || t.calendar?.bookingCreateError || 'Failed to create booking')
    }
  }

  const handleExportCalendar = () => {
    const csvContent = [
      ['Data', 'Godzina', 'Klient', 'Usługa', 'Pracownik', 'Cena', 'Status'],
      ...bookings.map(b => [
        b.date,
        b.time,
        b.customerName,
        b.serviceName,
        b.employeeName,
        b.price.toString(),
        b.status === 'confirmed' ? 'Potwierdzona' : 'Oczekująca'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `kalendarz_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
      try {
        await axios.delete(`${API_URL}/api/bookings/${id}`, {
          ...getTenantConfig()
        })
        toast.success(t.calendar?.bookingDeleted || 'Booking deleted')
        loadData()
        setSelectedBooking(null)
      } catch (error) {
        console.error('Błąd usuwania:', error)
        toast.error(t.calendar?.bookingDeleteError || 'Failed to delete booking')
      }
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show') => {
    try {
      await axios.patch(`${API_URL}/api/bookings/${bookingId}`, 
        { status: newStatus.toUpperCase() },
        { ...getTenantConfig() }
      )
      toast.success(t.calendar?.statusUpdated || 'Status updated')
      loadData()
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus })
      }
    } catch (error) {
      console.error('Błąd zmiany statusu:', error)
      toast.error(t.calendar?.statusError || 'Failed to update status')
    }
  }

  const handlePaymentStatusChange = async (bookingId: string, newPaymentStatus: 'paid' | 'unpaid' | 'partial', paymentMethod?: string, passId?: string) => {
    try {
      const updateData: any = { isPaid: newPaymentStatus === 'paid' }
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod
      }
      if (passId) {
        updateData.passId = passId
      }
      if (newPaymentStatus === 'paid') {
        updateData.paidAt = new Date().toISOString()
      }
      
      await axios.patch(`${API_URL}/api/bookings/${bookingId}`, 
        updateData,
        { ...getTenantConfig() }
      )
      toast.success(t.calendar?.paymentStatusUpdated || 'Payment status updated')
      loadData()
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, paymentStatus: newPaymentStatus, paymentMethod })
      }
    } catch (error) {
      console.error('Błąd zmiany statusu płatności:', error)
      toast.error(t.calendar?.paymentStatusError || 'Failed to update payment status')
    }
  }

  // Otwórz modal płatności i pobierz karnety klienta
  const openPaymentMethodModal = async (booking: any) => {
    setPaymentMethodModalBooking(booking)
    setSelectedPaymentMethod('cash')
    setShowPaymentMethodModal(true)
    
    // Pobierz aktywne karnety klienta
    if (booking.customerId) {
      try {
        const config = getTenantConfig()
        const response = await axios.get(`${API_URL}/api/passes/customer/${booking.customerId}/active`, config)
        setPaymentModalCustomerPasses(response.data || [])
      } catch (error) {
        console.error('Błąd pobierania karnetów:', error)
        setPaymentModalCustomerPasses([])
      }
    }
  }

  // Potwierdź płatność z wybraną metodą
  const confirmPaymentWithMethod = async () => {
    if (!paymentMethodModalBooking) return
    
    const passId = selectedPaymentMethod.startsWith('pass_') ? selectedPaymentMethod.replace('pass_', '') : undefined
    const method = passId ? 'pass' : selectedPaymentMethod
    
    await handlePaymentStatusChange(paymentMethodModalBooking.id, 'paid', method, passId)
    setShowPaymentMethodModal(false)
    setPaymentMethodModalBooking(null)
  }

  const handleAddNewCustomer = async () => {
    if (!newCustomerData.firstName || !newCustomerData.lastName || !newCustomerData.phone) {
      toast.error(t.calendar?.fillRequiredFields || 'Fill required fields: First name, Last name, Phone')
      return
    }

    try {
      // Prepare data - remove empty email to avoid validation error
      const customerData = {
        firstName: newCustomerData.firstName,
        lastName: newCustomerData.lastName,
        phone: newCustomerData.phone,
        ...(newCustomerData.email && { email: newCustomerData.email })
      }
      
      const response = await axios.post(`${API_URL}/api/customers`, customerData, {
        ...getTenantConfig()
      })

      const customer = response.data

      // Dodaj klienta do lokalnego stanu natychmiast
      setCustomers(prev => [customer, ...prev])

      // Ustaw nowego klienta w formularzu
      setFormData({ ...formData, customerId: customer.id })
      setCustomerSearch(`${customer.firstName} ${customer.lastName}`)
      fetchCustomerPasses(customer.id)
      
      // Zamknij modal
      setShowAddCustomerModal(false)
      setNewCustomerData({ firstName: '', lastName: '', email: '', phone: '' })
      
      toast.success(t.calendar?.customerAdded || `${customer.firstName} ${customer.lastName} added!`)
    } catch (error: any) {
      console.error('Błąd dodawania klienta:', error)
      toast.error(error.response?.data?.message || t.calendar?.customerAddError || 'Failed to add customer')
    }
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    const days = []
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    // Next month days to fill the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    return days
  }

  const getMonthDayBookings = (date: Date) => {
    // Użyj lokalnej daty zamiast toISOString() aby uniknąć przesunięcia strefy czasowej
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const filtered = selectedEmployee === 'all' 
      ? bookings 
      : bookings.filter(b => b.employeeId === selectedEmployee)
    
    // Uwzględnij rezerwacje wielodniowe - pokaż je we wszystkich dniach od date do endDate
    return filtered.filter(b => {
      if (b.isMultiDay && b.endDate) {
        return dateStr >= b.date && dateStr <= b.endDate
      }
      return b.date === dateStr
    })
  }

  const filteredBookings = selectedEmployee === 'all' 
    ? bookings 
    : bookings.filter(b => b.employeeId === selectedEmployee)

  // Filtruj zajęcia grupowe dla wybranego pracownika
  const filteredGroupBookings = selectedEmployee === 'all'
    ? groupBookings
    : groupBookings.filter((g: any) => g.employeeId === selectedEmployee || !g.employeeId)

  // Połącz rezerwacje i zajęcia grupowe dla widoku kalendarza
  const allCalendarEvents = [
    ...filteredBookings.map((b: any) => ({ ...b, eventType: 'booking' })),
    ...filteredGroupBookings.map((g: any) => ({
      id: g.id,
      date: new Date(g.startTime).toISOString().split('T')[0],
      startTime: g.startTime,
      endTime: g.endTime,
      title: g.title,
      type: g.type,
      currentParticipants: g.currentParticipants,
      maxParticipants: g.maxParticipants,
      status: g.status,
      eventType: 'group'
    }))
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1 sm:mb-2">Kalendarz rezerwacji</h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)]/70">Zarządzaj rezerwacjami i harmonogramem</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                setBlockFormData(prev => ({ ...prev, startDate: today, endDate: today }))
                setShowBlockModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors flex-1 sm:flex-none justify-center"
            >
              <Ban className="w-4 h-4" />
              <span>Zablokuj</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Nowa rezerwacja</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            {/* Date Navigation */}
            <div className="flex items-center justify-between lg:justify-start space-x-2 sm:space-x-4">
              <button 
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
              
              {/* Klikalna data z date pickerem */}
              <div className="flex-1 lg:min-w-[200px]">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full text-center hover:bg-white/5 rounded-lg py-2 px-3 transition-colors"
                >
                  <h2 className="text-base sm:text-xl font-bold text-[var(--text-primary)]">
                    {currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]/70">
                    {viewMode === 'day' && currentDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric' })}
                    {viewMode === 'week' && `Tydzień ${Math.ceil(currentDate.getDate() / 7)}`}
                  </p>
                </button>
              </div>
              
              <button 
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
              
              <button 
                onClick={() => navigateDate('today')}
                className="hidden sm:block px-4 py-2 bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-color)] transition-colors flex-shrink-0"
              >
                Dzisiaj
              </button>
            </div>

            {/* View Mode - teraz dostępne również na mobile */}
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
              <button
                onClick={() => setViewMode('day')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-base whitespace-nowrap ${
                  viewMode === 'day' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                Dzień
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-base whitespace-nowrap ${
                  viewMode === 'week' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                Tydzień
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-base whitespace-nowrap ${
                  viewMode === 'month' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                Miesiąc
              </button>
            </div>
            
            {/* Day View Mode Toggle - tylko gdy widok dzienny */}
            {viewMode === 'day' && (
              <div className="flex items-center space-x-2 border-l border-white/10 pl-4">
                <button
                  onClick={() => setDayViewMode('list')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    dayViewMode === 'list' ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-white/5'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setDayViewMode('grid')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    dayViewMode === 'grid' ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-white/5'
                  }`}
                >
                  Kalendarz
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="flex-1 lg:flex-none px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-muted)] text-sm sm:text-base focus:outline-none focus:border-[var(--text-primary)]"
              >
                <option value="all">Wszyscy pracownicy</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
              
              <button 
                onClick={handleExportCalendar}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                title="Eksportuj do CSV"
              >
                <Download className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid - Day View */}
        {viewMode === 'day' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 sm:p-6">
            {/* Tryb Lista - uproszczony widok */}
            {dayViewMode === 'list' ? (
              <div className="space-y-3">
                {(() => {
                  const allDayBookings = hours.flatMap(hour => getDayBookings(currentDate, hour))
                  
                  if (allDayBookings.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 text-[var(--text-muted)]/30 mx-auto mb-4" />
                        <p className="text-[var(--text-muted)]/50 text-sm">Brak rezerwacji na ten dzień</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity mt-4 text-sm px-6 py-2"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Dodaj rezerwację
                        </button>
                      </div>
                    )
                  }
                  
                  return allDayBookings.map((booking, idx) => (
                    <div
                      key={booking.id}
                      onClick={() => handleBookingClick(booking)}
                      className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                        booking.eventType === 'block'
                          ? 'bg-gray-600 border border-gray-700'
                          : booking.status === 'confirmed' 
                          ? 'bg-[var(--text-primary)]/20 border border-[var(--text-primary)]/30' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/20 border border-yellow-500/30'
                          : booking.status === 'completed'
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : booking.status === 'no_show'
                          ? 'bg-orange-500/20 border border-orange-500/30'
                          : 'bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Clock className="w-4 h-4 text-[var(--text-primary)]" />
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {booking.isFullDay ? 'Cały dzień' : `${booking.time} - ${getEndTime(booking.time, booking.duration)}`}
                            </span>
                            {booking.isMultiDay && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                {new Date(booking.date + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} - {new Date(booking.endDate + 'T00:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              booking.eventType === 'block' ? 'bg-gray-600 text-white' :
                              booking.status === 'confirmed' ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)]' :
                              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              booking.status === 'no_show' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {booking.eventType === 'block' ? '🔒 Zablokowane' :
                               booking.status === 'confirmed' ? 'Potwierdzona' :
                               booking.status === 'pending' ? 'Oczekująca' :
                               booking.status === 'completed' ? 'Zakończona' :
                               booking.status === 'no_show' ? 'Nie przyszedł' : 'Anulowana'}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-[var(--text-primary)] mb-1">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-[var(--text-muted)]/80 mb-1">
                            {booking.serviceName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]/70">
                            <User className="w-3 h-3" />
                            {booking.employeeName}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-[var(--text-primary)]">
                            {booking.price} zł
                          </div>
                          {booking.paymentStatus === 'paid' && (
                            <div className="text-xs text-[var(--text-primary)] mt-1">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Opłacona
                            </div>
                          )}
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="text-xs text-[var(--text-muted)]/60 border-t border-white/10 pt-2 mt-2">
                          {booking.notes}
                        </div>
                      )}
                    </div>
                  ))
                })()}
              </div>
            ) : (
              /* Tryb Kalendarz - siatka godzinowa z lukami */
              <div className="space-y-px">
                {hours.map((hour) => {
                  const dayBookings = getDayBookings(currentDate, hour)
                  
                  return (
                    <div key={hour} className="flex border-b border-white/5">
                      <div className="w-20 p-4 text-right flex-shrink-0">
                        <span className="text-sm text-[var(--text-muted)]/70">{hour}:00</span>
                      </div>
                      <div 
                        className="flex-1 p-4 min-h-[80px] hover:bg-white/5 transition-colors cursor-pointer relative"
                        onClick={() => handleSlotClick(currentDate, hour)}
                      >
                      {dayBookings.length === 0 ? (
                        <div className="text-center text-[var(--text-muted)]/30 text-sm py-4">
                          Brak wizyt
                        </div>
                      ) : dayBookings.length === 1 ? (
                        // Pojedyncza wizyta - pełny widok
                        <div
                          key={dayBookings[0].id}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (dayBookings[0].eventType === 'block') {
                              // Dla blokad - pokaż opcję usunięcia
                              if (confirm(`Usunąć blokadę "${dayBookings[0].customerName}"?`)) {
                                handleDeleteTimeBlock(dayBookings[0].id)
                              }
                            } else {
                              handleBookingClick(dayBookings[0])
                            }
                          }}
                          className={`p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                            dayBookings[0].eventType === 'block'
                              ? 'bg-gray-600 border border-gray-700'
                              : dayBookings[0].eventType === 'external'
                              ? 'bg-blue-600 border border-blue-700'
                              : dayBookings[0].eventType === 'group'
                              ? 'bg-purple-600 border border-purple-700'
                              : dayBookings[0].status === 'confirmed' 
                                ? 'bg-emerald-600 border border-emerald-700' 
                                : dayBookings[0].status === 'no_show'
                                ? 'bg-orange-500 border border-orange-600'
                                : dayBookings[0].status === 'cancelled'
                                ? 'bg-red-600 border border-red-700'
                                : 'bg-yellow-500 border border-yellow-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <div className="text-xs font-bold text-white">
                                  {dayBookings[0].isFullDay ? 'Cały dzień' : `${dayBookings[0].time} - ${getEndTime(dayBookings[0].time, dayBookings[0].duration)}`}
                                </div>
                                {dayBookings[0].isMultiDay && (
                                  <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded">
                                    WIELODNIOWA
                                  </span>
                                )}
                                {dayBookings[0].eventType === 'block' && (
                                  <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded">
                                    BLOKADA
                                  </span>
                                )}
                                {dayBookings[0].eventType === 'group' && (
                                  <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded">
                                    GRUPOWE
                                  </span>
                                )}
                                {dayBookings[0].eventType === 'external' && (
                                  <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded">
                                    GOOGLE
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-white font-semibold mb-1">
                                {dayBookings[0].customerName}
                              </div>
                              <div className="text-xs text-white/80">
                                {dayBookings[0].serviceName}
                              </div>
                              <div className="text-xs text-white/80 mt-1">
                                {dayBookings[0].employeeName}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-white">
                              {dayBookings[0].price} zł{dayBookings[0].eventType === 'group' ? '/os' : ''}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Wiele wizyt - kompaktowy widok
                        <div className="space-y-1">
                          {dayBookings.slice(0, 2).map((booking, idx) => (
                            <div
                              key={booking.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookingClick(booking)
                              }}
                              className={`p-2 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                                booking.eventType === 'block'
                                  ? 'bg-gray-600 border border-gray-700'
                                  : booking.eventType === 'group'
                                  ? 'bg-purple-600 border border-purple-700'
                                  : booking.status === 'confirmed' 
                                    ? 'bg-emerald-600 border border-emerald-700' 
                                    : booking.status === 'no_show'
                                    ? 'bg-orange-500 border border-orange-600'
                                    : booking.status === 'cancelled'
                                    ? 'bg-red-600 border border-red-700'
                                    : 'bg-yellow-500 border border-yellow-600'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <div className="text-xs text-white font-semibold truncate">
                                      {booking.customerName}
                                    </div>
                                    {booking.eventType === 'group' && (
                                      <span className="px-1 py-0.5 bg-white/20 text-white text-[8px] font-bold rounded flex-shrink-0">
                                        GR
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-white/80 truncate">
                                    {booking.serviceName}
                                  </div>
                                </div>
                                <div className="text-xs font-bold text-white whitespace-nowrap">
                                  {booking.price} zł
                                </div>
                              </div>
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div 
                              className="text-xs text-center py-2 px-3 bg-white/5 rounded-lg text-[var(--text-primary)] font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Pokaż wszystkie wizyty w modalu
                                setAllBookingsInSlot(dayBookings)
                                const localDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
                                setSlotInfo({ date: localDateStr, time: `${hour}:00` })
                                setShowAllBookingsModal(true)
                              }}
                            >
                              +{dayBookings.length - 2} więcej wizyt
                            </div>
                          )}
                        </div>
                      )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Calendar Grid - Week View */}
        {viewMode === 'week' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 sm:p-6">
            {/* Mobile Week View - lista dni */}
            {isMobile ? (
              <div className="space-y-3">
                {getWeekDates().map((date, dayIndex) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayBookingsAll = hours.flatMap(hour => getDayBookings(date, hour))
                  const uniqueBookings = dayBookingsAll.filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i)
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`rounded-xl border ${isToday ? 'border-[var(--text-primary)] bg-[var(--text-primary)]/5' : 'border-[var(--border-color)]'}`}
                    >
                      {/* Day Header */}
                      <div 
                        className={`p-3 flex items-center justify-between cursor-pointer ${isToday ? 'bg-[var(--text-primary)]/10' : 'bg-[var(--bg-card-hover)]'} rounded-t-xl`}
                        onClick={() => {
                          setCurrentDate(date)
                          setViewMode('day')
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isToday ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-card)]'}`}>
                            <span className="font-bold">{date.getDate()}</span>
                          </div>
                          <div>
                            <div className={`font-semibold ${isToday ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                              {weekDays[dayIndex]}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {date.toLocaleDateString('pl-PL', { month: 'short' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uniqueBookings.length > 0 && (
                            <span className="px-2 py-1 bg-[var(--text-primary)]/20 text-[var(--text-primary)] text-xs font-bold rounded-full">
                              {uniqueBookings.length}
                            </span>
                          )}
                          <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                        </div>
                      </div>
                      
                      {/* Day Bookings Preview */}
                      {uniqueBookings.length > 0 ? (
                        <div className="p-2 space-y-1.5">
                          {uniqueBookings.slice(0, 3).map((booking) => (
                            <div
                              key={booking.id}
                              onClick={() => {
                                if (booking.eventType === 'block') {
                                  if (confirm(`Usunąć blokadę "${booking.customerName}"?`)) {
                                    handleDeleteTimeBlock(booking.id)
                                  }
                                } else {
                                  handleBookingClick(booking)
                                }
                              }}
                              className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 ${
                                booking.eventType === 'block'
                                  ? 'bg-gray-600 border border-gray-700'
                                  : booking.eventType === 'group'
                                  ? 'bg-purple-600/20 border border-purple-600/30'
                                  : booking.status === 'confirmed'
                                  ? 'bg-emerald-600/20 border border-emerald-600/30'
                                  : booking.status === 'no_show'
                                  ? 'bg-orange-500/20 border border-orange-500/30'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-600/20 border border-red-600/30'
                                  : 'bg-yellow-500/20 border border-yellow-500/30'
                              }`}
                            >
                              <div className={`w-1 h-8 rounded-full ${
                                booking.eventType === 'block'
                                  ? 'bg-gray-600'
                                  : booking.eventType === 'group'
                                  ? 'bg-purple-500'
                                  : booking.status === 'confirmed'
                                  ? 'bg-emerald-500'
                                  : booking.status === 'no_show'
                                  ? 'bg-orange-500'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-[var(--text-primary)]">
                                  {booking.time} {booking.customerName}
                                </div>
                                <div className="text-xs text-[var(--text-muted)] truncate">
                                  {booking.serviceName}
                                </div>
                              </div>
                            </div>
                          ))}
                          {uniqueBookings.length > 3 && (
                            <div 
                              className="text-center text-xs text-[var(--text-muted)] py-1 cursor-pointer hover:text-[var(--text-primary)]"
                              onClick={() => {
                                setCurrentDate(date)
                                setViewMode('day')
                              }}
                            >
                              +{uniqueBookings.length - 3} więcej...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-sm text-[var(--text-muted)]/50">
                          Brak wizyt
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
            /* Desktop Week View - klasyczna siatka */
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
              <div className="grid grid-cols-8 gap-px bg-white/10">
                {/* Time Column Header */}
                <div className="bg-carbon-black p-4 sticky left-0 z-10">
                  <Clock className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
                
                {/* Day Headers */}
                {getWeekDates().map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <div key={index} className="bg-carbon-black p-4 text-center">
                      <div className="text-sm text-[var(--text-muted)]/70">{weekDays[index]}</div>
                      <div className={`text-lg font-bold mt-1 ${isToday ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}

                {/* Time Slots */}
                {hours.map((hour) => (
                  <>
                    {/* Time Label */}
                    <div key={`time-${hour}`} className="bg-carbon-black p-4 text-right sticky left-0 z-10">
                      <span className="text-sm text-[var(--text-muted)]/70">{hour}:00</span>
                    </div>
                    
                    {/* Day Slots */}
                    {getWeekDates().map((date, dayIndex) => {
                      const dayBookings = getDayBookings(date, hour)
                      
                      return (
                        <div
                          key={`${dayIndex}-${hour}`}
                          className="bg-carbon-black p-2 min-h-[80px] hover:bg-white/5 transition-colors cursor-pointer relative"
                          onClick={() => handleSlotClick(date, hour)}
                        >
                          {dayBookings.length === 0 ? null : dayBookings.length === 1 ? (
                            // Pojedyncza wizyta - pełny widok
                            <div
                              key={dayBookings[0].id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookingClick(dayBookings[0])
                              }}
                              className={`p-2 rounded-lg h-full cursor-pointer hover:shadow-lg transition-all ${
                                dayBookings[0].eventType === 'block'
                                  ? 'bg-gray-600 border border-gray-700'
                                  : dayBookings[0].isFullDay
                                  ? 'bg-blue-600 border border-blue-700'
                                  : dayBookings[0].status === 'confirmed' 
                                  ? 'bg-emerald-600 border border-emerald-700' 
                                  : dayBookings[0].status === 'no_show'
                                  ? 'bg-orange-500 border border-orange-600'
                                  : dayBookings[0].status === 'cancelled'
                                  ? 'bg-red-600 border border-red-700'
                                  : 'bg-yellow-500 border border-yellow-600'
                              }`}
                            >
                              <div className="text-xs font-bold text-white mb-1">
                                {dayBookings[0].isFullDay ? '📅 Cały dzień' : `${dayBookings[0].time} - ${getEndTime(dayBookings[0].time, dayBookings[0].duration)}`}
                              </div>
                              <div className="text-xs text-white font-semibold truncate">
                                {dayBookings[0].customerName}
                              </div>
                              <div className="text-xs text-white/80 truncate">
                                {dayBookings[0].serviceName}
                              </div>
                            </div>
                          ) : (
                            // Wiele wizyt - kompaktowy widok ze stackowaniem
                            <div className="space-y-1">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBookingClick(dayBookings[0])
                                }}
                                className={`p-1.5 rounded cursor-pointer hover:shadow-lg transition-all ${
                                  dayBookings[0].eventType === 'block'
                                    ? 'bg-gray-600 border border-gray-700'
                                    : dayBookings[0].status === 'confirmed' 
                                    ? 'bg-emerald-600 border border-emerald-700' 
                                    : dayBookings[0].status === 'no_show'
                                    ? 'bg-orange-500 border border-orange-600'
                                    : dayBookings[0].status === 'cancelled'
                                    ? 'bg-red-600 border border-red-700'
                                    : 'bg-yellow-500 border border-yellow-600'
                                }`}
                              >
                                <div className="text-xs text-white font-semibold truncate">
                                  {dayBookings[0].customerName}
                                </div>
                              </div>
                              {dayBookings.length > 1 && (
                                <div 
                                  className="text-xs text-center py-1 px-2 bg-[var(--text-primary)]/20 rounded text-[var(--text-primary)] font-semibold cursor-pointer hover:bg-[var(--text-primary)]/30 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setAllBookingsInSlot(dayBookings)
                                    const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                    setSlotInfo({ date: localDateStr, time: `${hour}:00` })
                                    setShowAllBookingsModal(true)
                                  }}
                                >
                                  +{dayBookings.length - 1}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 sm:p-6">
            {/* Mobile Month View - kompaktowa siatka */}
            {isMobile ? (
              <div>
                {/* Day headers - skrócone */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((day, index) => (
                    <div key={index} className="text-center py-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">{day}</span>
                    </div>
                  ))}
                </div>
                
                {/* Calendar days - kompaktowe */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthDays().map((day, index) => {
                    const dayBookings = getMonthDayBookings(day.date)
                    const isToday = day.date.toDateString() === new Date().toDateString()
                    const hasBookings = dayBookings.length > 0
                    const confirmedCount = dayBookings.filter(b => b.status === 'confirmed').length
                    const pendingCount = dayBookings.filter(b => b.status === 'pending').length
                    const blockedCount = dayBookings.filter(b => b.eventType === 'block').length
                    
                    return (
                      <div
                        key={index}
                        className={`relative aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all ${
                          !day.isCurrentMonth 
                            ? 'opacity-30' 
                            : isToday 
                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                            : hasBookings 
                            ? 'bg-[var(--bg-card-hover)]' 
                            : 'hover:bg-[var(--bg-card-hover)]'
                        }`}
                        onClick={() => {
                          setCurrentDate(day.date)
                          setViewMode('day')
                        }}
                      >
                        <span className={`text-sm font-semibold ${isToday ? '' : 'text-[var(--text-primary)]'}`}>
                          {day.date.getDate()}
                        </span>
                        
                        {/* Dots indicator */}
                        {hasBookings && day.isCurrentMonth && (
                          <div className="flex gap-0.5 mt-1">
                            {confirmedCount > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                            {pendingCount > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            )}
                            {blockedCount > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                            )}
                          </div>
                        )}
                        
                        {/* Badge z liczbą */}
                        {dayBookings.length > 0 && day.isCurrentMonth && !isToday && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-bold">{dayBookings.length}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Podsumowanie dnia - po kliknięciu */}
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                  <div className="text-center text-sm text-[var(--text-muted)]">
                    Kliknij na dzień, aby zobaczyć szczegóły
                  </div>
                </div>
              </div>
            ) : (
            /* Desktop Month View - pełna siatka */
            <div className="grid grid-cols-7 gap-px bg-white/10">
              {/* Day headers */}
              {weekDays.map((day, index) => (
                <div key={index} className="bg-carbon-black p-4 text-center">
                  <span className="text-sm font-semibold text-[var(--text-muted)]">{day}</span>
                </div>
              ))}
              
              {/* Calendar days */}
              {getMonthDays().map((day, index) => {
                const dayBookings = getMonthDayBookings(day.date)
                const isToday = day.date.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={index}
                    className={`bg-carbon-black p-2 min-h-[120px] hover:bg-white/5 transition-colors cursor-pointer ${
                      !day.isCurrentMonth ? 'opacity-40' : ''
                    }`}
                    onClick={() => {
                      setCurrentDate(day.date)
                      setViewMode('day')
                    }}
                  >
                    <div className={`text-right mb-2 ${
                      isToday ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)]'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className={`text-xs p-1.5 rounded truncate font-semibold ${
                            booking.eventType === 'block'
                              ? 'bg-gray-600 text-white'
                              : booking.isFullDay
                              ? 'bg-blue-600 text-white'
                              : booking.status === 'confirmed'
                              ? 'bg-emerald-600 text-white'
                              : booking.status === 'no_show'
                              ? 'bg-orange-500 text-white'
                              : booking.status === 'cancelled'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (booking.eventType === 'block') {
                              if (confirm(`Usunąć blokadę "${booking.customerName}"?`)) {
                                handleDeleteTimeBlock(booking.id)
                              }
                            } else {
                              handleBookingClick(booking)
                            }
                          }}
                        >
                          {booking.eventType === 'block' ? '🔒 ' : booking.isFullDay ? '📅 ' : `${booking.time} `}{booking.customerName}
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-[var(--text-muted)]/70 text-center">
                          +{dayBookings.length - 3} więcej
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-600 rounded"></div>
            <span className="text-sm text-[var(--text-muted)]">Potwierdzona</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-[var(--text-muted)]">Oczekująca</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-sm text-[var(--text-muted)]">Zakończona</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-[var(--text-muted)]">Nie przyszedł</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-[var(--text-muted)]">Anulowana</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-sm text-[var(--text-muted)]">Zablokowane</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 border border-white/20 rounded"></div>
            <span className="text-sm text-[var(--text-muted)]">Wolny termin</span>
          </div>
        </div>

        {/* Add/Edit Booking Modal */}
        
          {showAddModal && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-2xl w-full max-h-[calc(100vh-120px)] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    {editMode ? 'Edytuj rezerwację' : 'Nowa rezerwacja'}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>

                {formErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-400 mb-1">Wystąpiły błędy:</p>
                        <ul className="text-sm text-red-300 space-y-1">
                          {formErrors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Customer - Autocomplete */}
                  <div className="relative customer-autocomplete">
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Klient *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value)
                          setShowCustomerDropdown(true)
                          if (!e.target.value) setFormData({ ...formData, customerId: '' })
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        placeholder="Wpisz imię, nazwisko lub telefon..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]/50" />
                    </div>
                    
                    {/* Dropdown z wynikami */}
                    {showCustomerDropdown && customerSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-carbon-black border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {customers
                          .filter(customer => {
                            const search = customerSearch.toLowerCase()
                            return (
                              customer.firstName.toLowerCase().includes(search) ||
                              customer.lastName.toLowerCase().includes(search) ||
                              customer.phone.includes(search) ||
                              (customer.email && customer.email.toLowerCase().includes(search))
                            )
                          })
                          .map(customer => (
                            <div
                              key={customer.id}
                              onClick={() => {
                                setFormData({ ...formData, customerId: customer.id })
                                setCustomerSearch(`${customer.firstName} ${customer.lastName}`)
                                setShowCustomerDropdown(false)
                                fetchCustomerPasses(customer.id)
                              }}
                              className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[var(--text-primary)] font-medium">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="text-sm text-[var(--text-muted)]/70">
                                    {customer.phone}{customer.email ? ` • ${customer.email}` : ''}
                                  </div>
                                </div>
                                {customer.status === 'vip' && (
                                  <span className="px-2 py-1 bg-[var(--text-primary)]/20 text-[var(--text-primary)] text-xs rounded-full">
                                    VIP
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        {customers.filter(customer => {
                          const search = customerSearch.toLowerCase()
                          return (
                            customer.firstName.toLowerCase().includes(search) ||
                            customer.lastName.toLowerCase().includes(search) ||
                            customer.phone.includes(search)
                          )
                        }).length === 0 && (
                          <div className="px-4 py-3 text-center">
                            <p className="text-[var(--text-muted)]/70 text-sm mb-2">Nie znaleziono klienta</p>
                            <button
                              onClick={() => {
                                setShowCustomerDropdown(false)
                                setShowAddCustomerModal(true)
                                // Wypełnij imię i nazwisko z wyszukiwania jeśli możliwe
                                const parts = customerSearch.trim().split(' ')
                                if (parts.length >= 2) {
                                  setNewCustomerData({
                                    firstName: parts[0],
                                    lastName: parts.slice(1).join(' '),
                                    email: '',
                                    phone: ''
                                  })
                                } else if (parts.length === 1) {
                                  setNewCustomerData({
                                    firstName: parts[0],
                                    lastName: '',
                                    email: '',
                                    phone: ''
                                  })
                                }
                              }}
                              className="px-4 py-2 bg-[var(--text-primary)]/20 text-[var(--text-primary)] rounded-lg hover:bg-[var(--text-primary)]/30 transition-colors flex items-center space-x-2 mx-auto"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Dodaj nowego klienta</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Wybór typu: Usługa / Pakiet */}
                  {packages.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => { setBookingType('service'); setSelectedPackage(null); setFormData({ ...formData, serviceId: '' }) }}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          bookingType === 'service'
                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                            : 'bg-white/10 text-[var(--text-muted)] hover:bg-white/20'
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        Usługa
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBookingType('package'); setFormData({ ...formData, serviceId: '' }) }}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          bookingType === 'package'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-[var(--text-muted)] hover:bg-white/20'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        Pakiet
                      </button>
                    </div>
                  )}

                  {/* Package Selection */}
                  {bookingType === 'package' && packages.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
                        <Package className="w-4 h-4 inline mr-1" />
                        Pakiet *
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                        {packages.map((pkg: any) => {
                          const savings = pkg.originalPrice > 0 
                            ? Math.round(((Number(pkg.originalPrice) - Number(pkg.price)) / Number(pkg.originalPrice)) * 100)
                            : 0;
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => { 
                                setSelectedPackage(pkg); 
                                // Ustaw pierwszą usługę z pakietu jako serviceId
                                if (pkg.items && pkg.items.length > 0) {
                                  setFormData({ ...formData, serviceId: pkg.items[0].serviceId })
                                }
                              }}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedPackage?.id === pkg.id
                                  ? 'border-purple-500 bg-yellow-500/10'
                                  : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[var(--text-primary)] font-semibold">{pkg.name}</h4>
                                {savings > 0 && (
                                  <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                    -{savings}%
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--text-muted)] mb-2">
                                {pkg.items?.map((item: any) => item.service?.name).join(' + ')}
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-[var(--text-muted)]">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {pkg.duration} min
                                </span>
                                <span className="line-through text-[var(--text-muted)]">{Number(pkg.originalPrice).toFixed(0)} zł</span>
                                <span className="text-purple-400 font-bold">{Number(pkg.price).toFixed(0)} zł</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Service - Cards */}
                  {bookingType === 'service' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Usługa *
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                      {services.map(service => (
                        <div
                          key={service.id}
                          onClick={() => setFormData({ ...formData, serviceId: service.id })}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.serviceId === service.id
                              ? 'border-[var(--text-primary)] bg-[var(--text-primary)]/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-[var(--text-primary)] font-semibold">{service.name}</h4>
                                {formData.serviceId === service.id && (
                                  <Check className="w-5 h-5 text-[var(--text-primary)]" />
                                )}
                              </div>
                              <p className="text-sm text-[var(--text-muted)]/70 mb-2">{service.description}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center text-[var(--text-muted)]">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {service.duration} min
                                </span>
                                <span className="text-[var(--text-primary)] font-bold">
                                  {service.basePrice || service.price || 0} zł
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Employee */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Pracownik *
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    >
                      <option value="">Wybierz pracownika</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Karnety klienta */}
                  {customerPasses.length > 0 && (
                    <div className="bg-yellow-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Ticket className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-purple-400">Klient ma aktywny karnet!</span>
                      </div>
                      <div className="space-y-2">
                        {customerPasses.map((pass: any) => {
                          const remaining = (pass.visitsTotal || 0) - (pass.visitsUsed || 0)
                          return (
                            <label 
                              key={pass.id}
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedPassId === pass.id && usePass
                                  ? 'bg-yellow-500/20 border border-purple-500'
                                  : 'bg-white/5 border border-white/10 hover:border-purple-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="passSelection"
                                  checked={selectedPassId === pass.id && usePass}
                                  onChange={() => {
                                    setSelectedPassId(pass.id)
                                    setUsePass(true)
                                  }}
                                  className="w-4 h-4 text-purple-500"
                                />
                                <div>
                                  <p className="text-[var(--text-primary)] font-medium">{pass.passType?.name}</p>
                                  <p className="text-xs text-[var(--text-muted)]">
                                    Wygasa: {new Date(pass.expiresAt).toLocaleDateString('pl-PL')}
                                  </p>
                                </div>
                              </div>
                              {pass.passType?.passKind === 'VISITS' && (
                                <div className="text-right">
                                  <p className="text-lg font-bold text-purple-400">{remaining}</p>
                                  <p className="text-xs text-[var(--text-muted)]">pozostało</p>
                                </div>
                              )}
                            </label>
                          )
                        })}
                        <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer bg-white/5 border border-white/10 hover:border-white/30">
                          <input
                            type="radio"
                            name="passSelection"
                            checked={!usePass}
                            onChange={() => setUsePass(false)}
                            className="w-4 h-4"
                          />
                          <span className="text-[var(--text-muted)]">Nie używaj karnetu (płatność normalna)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        Data *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        Godzina *
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                        placeholder="HH:MM"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Notatki
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="Dodatkowe informacje o rezerwacji..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 text-[var(--text-muted)] rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSubmitBooking}
                    className="flex-1 flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editMode ? 'Zapisz zmiany' : 'Utwórz rezerwację'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        

        {/* Booking Details Modal */}
        
          {selectedBooking && !showAddModal && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedBooking(null)}
            >
              <div
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-md w-full max-h-[calc(100vh-120px)] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Szczegóły rezerwacji</h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status rezerwacji */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[var(--text-muted)]/70 mb-2 block">Status rezerwacji</label>
                      <select
                        value={selectedBooking.status}
                        onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value as any)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-semibold border ${
                          selectedBooking.status === 'confirmed' ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)] border-[var(--text-primary)]/30' :
                          selectedBooking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          selectedBooking.status === 'no_show' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          selectedBooking.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        } focus:outline-none focus:ring-2 focus:ring-accent-neon`}
                      >
                        <option value="pending">Oczekująca</option>
                        <option value="confirmed">Potwierdzona</option>
                        <option value="completed">Zakończona</option>
                        <option value="no_show">Nie przyszedł</option>
                        <option value="cancelled">Anulowana</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-[var(--text-muted)]/70 mb-2 block">Status płatności</label>
                      {/* Jeśli płatność online - zablokuj zmianę */}
                      {selectedBooking.paymentMethod && ['stripe', 'przelewy24', 'payu'].includes(selectedBooking.paymentMethod) && selectedBooking.paymentStatus === 'paid' ? (
                        <div className="w-full px-3 py-2 rounded-lg text-sm font-semibold border bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Opłacono przez {
                              selectedBooking.paymentMethod === 'stripe' ? 'Stripe' :
                              selectedBooking.paymentMethod === 'przelewy24' ? 'Przelewy24' :
                              selectedBooking.paymentMethod === 'payu' ? 'PayU' : 'online'
                            }
                          </span>
                        </div>
                      ) : (
                        <select
                          value={selectedBooking.paymentStatus || 'unpaid'}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'paid' | 'unpaid' | 'partial'
                            if (newStatus === 'paid' && selectedBooking.paymentStatus !== 'paid') {
                              // Pokaż popup wyboru metody płatności
                              openPaymentMethodModal(selectedBooking)
                            } else {
                              handlePaymentStatusChange(selectedBooking.id, newStatus)
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-semibold border ${
                            (selectedBooking.paymentStatus || 'unpaid') === 'paid' 
                              ? 'bg-[var(--text-primary)]/20 text-[var(--text-primary)] border-[var(--text-primary)]/30' 
                              : (selectedBooking.paymentStatus || 'unpaid') === 'partial'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          } focus:outline-none focus:ring-2 focus:ring-accent-neon`}
                        >
                          <option value="unpaid">Niezapłacono</option>
                          <option value="partial">Częściowo</option>
                          <option value="paid">Zapłacono</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[var(--text-muted)]/70">Klient</label>
                    <p className="text-[var(--text-primary)] font-medium">{selectedBooking.customerName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-[var(--text-muted)]/70">Usługa</label>
                    <p className="text-[var(--text-primary)] font-medium">{selectedBooking.serviceName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-[var(--text-muted)]/70">Pracownik</label>
                    <p className="text-[var(--text-primary)] font-medium">{selectedBooking.employeeName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[var(--text-muted)]/70">Data</label>
                      <p className="text-[var(--text-primary)] font-medium">
                        {selectedBooking.isFullDay && selectedBooking.isMultiDay 
                          ? `${selectedBooking.date} - ${selectedBooking.endDate}`
                          : selectedBooking.date}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[var(--text-muted)]/70">{selectedBooking.isFullDay ? 'Typ' : 'Godzina'}</label>
                      <p className="text-[var(--text-primary)] font-medium">
                        {selectedBooking.isFullDay ? '📅 Cały dzień' : `${selectedBooking.time} - ${getEndTime(selectedBooking.time, selectedBooking.duration)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[var(--text-muted)]/70">Czas trwania</label>
                      <p className="text-[var(--text-primary)] font-medium">
                        {selectedBooking.isFullDay 
                          ? (selectedBooking.isMultiDay 
                              ? `${Math.ceil(selectedBooking.duration / (24 * 60))} dni`
                              : '1 dzień')
                          : `${selectedBooking.duration} min`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[var(--text-muted)]/70">Cena</label>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedBooking.price} zł</p>
                    </div>
                  </div>
                  
                  {selectedBooking.notes && (
                    <div>
                      <label className="text-sm text-[var(--text-muted)]/70">Notatki</label>
                      <p className="text-[var(--text-primary)]">{selectedBooking.notes}</p>
                    </div>
                  )}

                  {/* Informacja o anulowaniu */}
                  {selectedBooking.status === 'cancelled' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Ban className="w-5 h-5 text-red-400" />
                        <span className="font-medium text-red-400">Rezerwacja anulowana</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-[var(--text-muted)]">
                          <span className="text-[var(--text-muted)]/70">Anulował: </span>
                          <span className="text-[var(--text-primary)] font-medium">
                            {selectedBooking.cancelledBy === 'customer' ? '👤 Klient' : 
                             selectedBooking.cancelledBy === 'owner' ? '👔 Właściciel' : 
                             selectedBooking.cancelledBy === 'system' ? '🤖 System (automatycznie)' :
                             selectedBooking.cancelledBy === 'employee' ? '👷 Pracownik' :
                             '❓ Nieznany'}
                          </span>
                        </p>
                        {selectedBooking.cancelledAt && (
                          <p className="text-[var(--text-muted)]">
                            <span className="text-[var(--text-muted)]/70">Data: </span>
                            <span className="text-[var(--text-primary)]">
                              {new Date(selectedBooking.cancelledAt).toLocaleString('pl-PL')}
                            </span>
                          </p>
                        )}
                        {selectedBooking.cancellationReason && (
                          <p className="text-[var(--text-muted)]">
                            <span className="text-[var(--text-muted)]/70">Powód: </span>
                            <span className="text-[var(--text-primary)]">{selectedBooking.cancellationReason}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-6 flex-wrap">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'confirmed')
                      }}
                      className="flex-1 min-w-[100px] px-3 py-2 bg-[var(--text-primary)]/20 text-[var(--text-primary)] rounded-lg hover:bg-[var(--text-primary)]/30 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Potwierdź</span>
                    </button>
                  )}
                  {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'pending') && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'completed')
                      }}
                      className="flex-1 min-w-[100px] px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Zakończ</span>
                    </button>
                  )}
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'no_show' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'no_show')
                      }}
                      className="flex-1 min-w-[90px] px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors flex items-center justify-center gap-1.5 text-sm"
                      title="Oznacz jako nieobecność klienta"
                    >
                      <User className="w-4 h-4" />
                      <span>Nie przyszedł</span>
                    </button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.id, 'cancelled')
                      }}
                      className="flex-1 min-w-[90px] px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Anuluj</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditBooking(selectedBooking)}
                    className="px-3 py-2 bg-white/5 text-[var(--text-muted)] rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edytuj</span>
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(selectedBooking.id)}
                    className="px-3 py-2 bg-white/5 text-[var(--text-muted)] rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Usuń</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        

        {/* All Bookings in Slot Modal */}
        
          {showAllBookingsModal && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-2xl w-full max-h-[calc(100vh-120px)] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      Wszystkie wizyty
                    </h3>
                    {slotInfo && (
                      <p className="text-sm text-[var(--text-muted)]/70 mt-1">
                        {slotInfo.date}, godz. {slotInfo.time} - {parseInt(slotInfo.time.split(':')[0]) + 1}:00
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAllBookingsModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>

                <div className="space-y-3">
                  {allBookingsInSlot.map((booking, idx) => (
                    <div
                      key={booking.id}
                      onClick={() => {
                        setShowAllBookingsModal(false)
                        handleBookingClick(booking)
                      }}
                      className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all border-2 ${
                        booking.status === 'confirmed' 
                          ? 'bg-[var(--text-primary)]/20 border-[var(--text-primary)]/30 hover:border-[var(--text-primary)]/50' 
                          : 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-[var(--text-primary)]" />
                            <span className="text-[var(--text-primary)] font-semibold">
                              {booking.customerName}
                            </span>
                            {booking.status === 'confirmed' ? (
                              <span className="px-2 py-0.5 bg-[var(--text-primary)]/20 text-[var(--text-primary)] text-xs rounded-full">
                                Potwierdzona
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                                Oczekująca
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-[var(--text-muted)]/70">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>{booking.serviceName}</span>
                              <span className="text-[var(--text-muted)]/50">•</span>
                              <span>{booking.isFullDay 
                                ? (booking.isMultiDay ? `${Math.ceil(booking.duration / (24 * 60))} dni` : '1 dzień')
                                : `${booking.duration} min`}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)]/70">
                              <User className="w-3.5 h-3.5" />
                              <span>{booking.employeeName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)]/70">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{booking.isFullDay ? '📅 Cały dzień' : `${booking.time} - ${getEndTime(booking.time, booking.duration)}`}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[var(--text-primary)]">
                            {booking.price} zł
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]/70">
                      Łącznie wizyt: <span className="text-[var(--text-primary)] font-semibold">{allBookingsInSlot.length}</span>
                    </span>
                    <span className="text-[var(--text-muted)]/70">
                      Suma: <span className="text-[var(--text-primary)] font-bold text-lg">
                        {allBookingsInSlot.reduce((sum, b) => sum + b.price, 0)} zł
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAllBookingsModal(false)}
                  className="w-full mt-4 px-4 py-2 bg-white/5 text-[var(--text-muted)] rounded-lg hover:bg-white/10 transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          )}
        

        {/* Add New Customer Modal */}
        
          {showAddCustomerModal && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-md w-full max-h-[calc(100vh-120px)] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Dodaj nowego klienta</h3>
                  <button
                    onClick={() => setShowAddCustomerModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Imię *
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.firstName}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, firstName: e.target.value })}
                      placeholder="Jan"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.lastName}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, lastName: e.target.value })}
                      placeholder="Kowalski"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={newCustomerData.phone}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newCustomerData.email}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                      placeholder="jan.kowalski@example.com"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddCustomerModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 text-[var(--text-muted)] rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleAddNewCustomer}
                    className="flex-1 flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Dodaj klienta</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        

        {/* Date Picker Modal */}
        
          {showDatePicker && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowDatePicker(false)}
            >
              <div
                className="bg-carbon-black border border-white/10 rounded-xl shadow-2xl p-4 w-full max-w-[320px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nagłówek */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setCurrentDate(newDate)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                  <span className="text-base font-semibold text-[var(--text-primary)]">
                    {currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setCurrentDate(newDate)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>

                {/* Dni tygodnia */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(day => (
                    <div key={day} className="text-center text-xs text-[var(--text-muted)]/70 py-2 font-medium">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dni miesiąca */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const daysInMonth = lastDay.getDate()
                    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
                    
                    const days = []
                    
                    // Puste miejsca przed pierwszym dniem
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      days.push(<div key={`empty-${i}`} className="w-10 h-10" />)
                    }
                    
                    // Dni miesiąca
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day)
                      const isToday = date.getTime() === today.getTime()
                      const isSelected = date.toDateString() === currentDate.toDateString()
                      // Użyj lokalnej daty zamiast toISOString() aby uniknąć przesunięcia strefy czasowej
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const hasBookings = bookings.some(b => b.date === dateStr)
                      
                      days.push(
                        <button
                          key={day}
                          onClick={() => {
                            setCurrentDate(date)
                            setShowDatePicker(false)
                          }}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors relative flex items-center justify-center ${
                            isSelected
                              ? 'bg-[var(--text-primary)] text-carbon-black'
                              : isToday
                              ? 'bg-[var(--text-primary)]/30 text-[var(--text-primary)] ring-2 ring-primary-green'
                              : 'text-[var(--text-primary)] hover:bg-white/10'
                          }`}
                        >
                          {day}
                          {hasBookings && !isSelected && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full" />
                          )}
                        </button>
                      )
                    }
                    
                    return days
                  })()}
                </div>

                {/* Przycisk Dzisiaj */}
                <button
                  onClick={() => {
                    setCurrentDate(new Date())
                    setShowDatePicker(false)
                  }}
                  className="w-full mt-4 py-3 bg-[var(--text-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--text-primary)]/80 transition-colors text-sm font-semibold"
                >
                  Dzisiaj
                </button>
              </div>
            </div>
          )}

        {/* Modal wyboru metody płatności */}
        {showPaymentMethodModal && paymentMethodModalBooking && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          >
            <div
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[calc(100vh-120px)] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Wybierz formę płatności</h3>
                <button
                  onClick={() => setShowPaymentMethodModal(false)}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-[var(--bg-primary)] rounded-xl">
                <p className="text-sm text-[var(--text-muted)]">Rezerwacja</p>
                <p className="font-semibold text-[var(--text-primary)]">{paymentMethodModalBooking.serviceName}</p>
                <p className="text-sm text-[var(--text-muted)]">{paymentMethodModalBooking.customerName}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{paymentMethodModalBooking.price} zł</p>
              </div>

              <div className="space-y-3 mb-6">
                {/* Gotówka */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'cash' 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={selectedPaymentMethod === 'cash'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-teal-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--text-primary)]">Gotówka</p>
                    <p className="text-sm text-[var(--text-muted)]">Płatność gotówką na miejscu</p>
                  </div>
                  <Banknote className="w-6 h-6 text-[var(--text-muted)]" />
                </label>

                {/* Karta */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'card' 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-teal-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--text-primary)]">Karta płatnicza</p>
                    <p className="text-sm text-[var(--text-muted)]">Terminal płatniczy na miejscu</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-[var(--text-muted)]" />
                </label>

                {/* Karnety klienta */}
                {paymentModalCustomerPasses.length > 0 && (
                  <>
                    <div className="pt-2">
                      <p className="text-sm font-medium text-[var(--text-muted)] mb-2">Karnety klienta</p>
                    </div>
                    {paymentModalCustomerPasses.map((pass: any) => (
                      <label key={pass.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === `pass_${pass.id}` 
                          ? 'border-teal-500 bg-teal-500/10' 
                          : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={`pass_${pass.id}`}
                          checked={selectedPaymentMethod === `pass_${pass.id}`}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-teal-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--text-primary)]">{pass.passType?.name || 'Karnet'}</p>
                          <p className="text-sm text-[var(--text-muted)]">
                            Pozostało: {(pass.visitsTotal || 0) - (pass.visitsUsed || 0)} z {pass.visitsTotal} wizyt
                          </p>
                        </div>
                        <Ticket className="w-6 h-6 text-teal-500" />
                      </label>
                    ))}
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentMethodModal(false)}
                  className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors font-medium"
                >
                  Anuluj
                </button>
                <button
                  onClick={confirmPaymentWithMethod}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Potwierdź płatność
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal blokowania godzin */}
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Ban className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Zablokuj godziny</h3>
                </div>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Pracownik */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Pracownik *
                  </label>
                  <select
                    value={blockFormData.employeeId}
                    onChange={(e) => setBlockFormData({ ...blockFormData, employeeId: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                  >
                    <option value="">Wybierz pracownika</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>

                {/* Data i godzina rozpoczęcia */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Data od *
                    </label>
                    <input
                      type="date"
                      value={blockFormData.startDate}
                      onChange={(e) => setBlockFormData({ ...blockFormData, startDate: e.target.value, endDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Godzina od
                    </label>
                    <input
                      type="time"
                      value={blockFormData.startTime}
                      onChange={(e) => setBlockFormData({ ...blockFormData, startTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Data i godzina zakończenia */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Data do *
                    </label>
                    <input
                      type="date"
                      value={blockFormData.endDate}
                      onChange={(e) => setBlockFormData({ ...blockFormData, endDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                      Godzina do
                    </label>
                    <input
                      type="time"
                      value={blockFormData.endTime}
                      onChange={(e) => setBlockFormData({ ...blockFormData, endTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Powód */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Powód (opcjonalnie)
                  </label>
                  <input
                    type="text"
                    value={blockFormData.reason}
                    onChange={(e) => setBlockFormData({ ...blockFormData, reason: e.target.value })}
                    placeholder="np. Urlop, Szkolenie, Przerwa..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors font-medium"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddTimeBlock}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Zablokuj
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
