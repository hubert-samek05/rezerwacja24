// Zarządzanie danymi w localStorage

export interface Service {
  id: string
  name: string
  description: string
  category?: string
  categoryId?: string
  service_categories?: {
    id: string
    name: string
    color: string
  }
  price: number
  duration: number // w minutach
  employees: string[] // ID pracowników
  createdAt: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  services: string[] // ID usług
  avatar?: string
  createdAt: string
}

export interface Booking {
  id: string
  customerId: string
  customerName: string
  serviceId: string
  serviceName: string
  employeeId: string
  employeeName: string
  date: string
  time: string
  duration: number
  price: number
  basePrice?: number
  couponCode?: string | null
  discountAmount?: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentStatus: 'paid' | 'unpaid' | 'partial'
  paidAmount?: number
  paymentMethod?: 'cash' | 'card' | 'przelewy24' | 'payu' | 'stripe' | 'other'
  notes?: string
  createdAt: string
  isPaid?: boolean
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  totalVisits?: number
  totalSpent?: number
  totalBookings?: number
  debt?: number
  lastVisit?: string
  isBlocked?: boolean
  blockedUntil?: string
  blockedReason?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  bookings?: any[]
}

// Pobierz ID zalogowanego użytkownika
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null
  
  // Sprawdź nowy format (JWT)
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      const userId = user.id || user.userId || user.sub || null
      if (userId) return userId
    } catch (e) {
      console.error('Error parsing user:', e)
    }
  }
  
  // Sprawdź token
  const token = localStorage.getItem('token')
  if (token) {
    try {
      // Dekoduj JWT (bez weryfikacji - tylko odczyt)
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.sub) return payload.sub
    } catch (e) {
      // Ignoruj błędy dekodowania
    }
  }
  
  // Sprawdź stary format (sesja)
  const session = localStorage.getItem('rezerwacja24_session')
  if (session) {
    try {
      const data = JSON.parse(session)
      return data.userId || data.user?.id || null
    } catch (e) {
      console.error('Error parsing session:', e)
    }
  }
  
  return null
}

// Pobierz ID tenanta (firmy) - ZAWSZE z tokena JWT
export const getTenantId = (): string | null => {
  if (typeof window === 'undefined') return null
  
  // NAJPIERW sprawdź token JWT - jedyne wiarygodne źródło
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.tenantId) {
        return String(payload.tenantId)
      }
    } catch (e) {
      // Ignoruj błędy dekodowania
    }
  }
  
  // Fallback do user
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.tenantId || null
    } catch (e) {
      console.error('Error parsing user for tenantId:', e)
    }
  }
  
  return null
}

// USŁUGI
export const getServices = (): Service[] => {
  const userId = getCurrentUserId()
  if (!userId) return []
  const key = `services_${userId}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export const addService = (service: Omit<Service, 'id' | 'createdAt'>): Service | null => {
  const userId = getCurrentUserId()
  if (!userId) return null
  
  const newService: Service = {
    ...service,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  const services = getServices()
  services.push(newService)
  
  const key = `services_${userId}`
  localStorage.setItem(key, JSON.stringify(services))
  
  // Synchronizuj z API
  if (typeof window !== 'undefined') {
    import('./company').then(({ syncCompanyData }) => {
      syncCompanyData().catch(console.error)
    })
  }
  
  return newService
}

export const updateService = (id: string, updates: Partial<Service>): Service | null => {
  const userId = getCurrentUserId()
  if (!userId) return null
  
  const services = getServices()
  const index = services.findIndex(s => s.id === id)
  
  if (index === -1) return null
  
  services[index] = { ...services[index], ...updates }
  
  const key = `services_${userId}`
  localStorage.setItem(key, JSON.stringify(services))
  
  // Synchronizuj z API
  if (typeof window !== 'undefined') {
    import('./company').then(({ syncCompanyData }) => {
      syncCompanyData().catch(console.error)
    })
  }
  
  return services[index]
}

export const deleteService = (id: string): boolean => {
  const userId = getCurrentUserId()
  if (!userId) return false
  
  const services = getServices()
  const filtered = services.filter(s => s.id !== id)
  
  const key = `services_${userId}`
  localStorage.setItem(key, JSON.stringify(filtered))
  
  return true
}

// PRACOWNICY
export const getEmployees = (): Employee[] => {
  const userId = getCurrentUserId()
  if (!userId) return []
  const key = `employees_${userId}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt'>): Employee => {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('Not logged in')
  
  const newEmployee: Employee = {
    ...employee,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  const employees = getEmployees()
  employees.push(newEmployee)
  
  const key = `employees_${userId}`
  localStorage.setItem(key, JSON.stringify(employees))
  
  return newEmployee
}

export const updateEmployee = (id: string, updates: Partial<Employee>): Employee | null => {
  const userId = getCurrentUserId()
  if (!userId) return null
  
  const employees = getEmployees()
  const index = employees.findIndex(e => e.id === id)
  
  if (index === -1) return null
  
  employees[index] = { ...employees[index], ...updates }
  
  const key = `employees_${userId}`
  localStorage.setItem(key, JSON.stringify(employees))
  
  return employees[index]
}

export const deleteEmployee = (id: string): boolean => {
  const userId = getCurrentUserId()
  if (!userId) return false
  
  const employees = getEmployees()
  const filtered = employees.filter(e => e.id !== id)
  
  const key = `employees_${userId}`
  localStorage.setItem(key, JSON.stringify(filtered))
  
  return true
}

// REZERWACJE
export const getBookings = (): Booking[] => {
  const userId = getCurrentUserId()
  if (!userId) return []
  const key = `bookings_${userId}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>): Booking => {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('Not logged in')
  
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  const bookings = getBookings()
  bookings.push(newBooking)
  
  const key = `bookings_${userId}`
  localStorage.setItem(key, JSON.stringify(bookings))
  
  // Aktualizuj statystyki klienta
  updateCustomerStats(newBooking.customerId)
  
  return newBooking
}

export const updateBooking = (id: string, updates: Partial<Booking>): Booking | null => {
  const userId = getCurrentUserId()
  if (!userId) return null
  
  const bookings = getBookings()
  const index = bookings.findIndex(b => b.id === id)
  
  if (index === -1) return null
  
  const oldCustomerId = bookings[index].customerId
  bookings[index] = { ...bookings[index], ...updates }
  const newCustomerId = bookings[index].customerId
  
  const key = `bookings_${userId}`
  localStorage.setItem(key, JSON.stringify(bookings))
  
  // Aktualizuj statystyki klienta (zarówno starego jak i nowego jeśli się zmienił)
  updateCustomerStats(oldCustomerId)
  if (newCustomerId !== oldCustomerId) {
    updateCustomerStats(newCustomerId)
  }
  
  return bookings[index]
}

export const deleteBooking = (id: string): boolean => {
  const userId = getCurrentUserId()
  if (!userId) return false
  
  const bookings = getBookings()
  const bookingToDelete = bookings.find(b => b.id === id)
  const filtered = bookings.filter(b => b.id !== id)
  
  const key = `bookings_${userId}`
  localStorage.setItem(key, JSON.stringify(filtered))
  
  // Aktualizuj statystyki klienta
  if (bookingToDelete) {
    updateCustomerStats(bookingToDelete.customerId)
  }
  
  return true
}

// KLIENCI
export const getCustomers = (): Customer[] => {
  const userId = getCurrentUserId()
  if (!userId) return []
  const key = `customers_${userId}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('Not logged in')
  
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  const customers = getCustomers()
  customers.push(newCustomer)
  
  const key = `customers_${userId}`
  localStorage.setItem(key, JSON.stringify(customers))
  
  return newCustomer
}

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const userId = getCurrentUserId()
  if (!userId) return null
  
  const customers = getCustomers()
  const index = customers.findIndex(c => c.id === id)
  
  if (index === -1) return null
  
  customers[index] = { ...customers[index], ...updates }
  
  const key = `customers_${userId}`
  localStorage.setItem(key, JSON.stringify(customers))
  
  return customers[index]
}

export const deleteCustomer = (id: string): boolean => {
  const userId = getCurrentUserId()
  if (!userId) return false
  
  const customers = getCustomers()
  const filtered = customers.filter(c => c.id !== id)
  
  const key = `customers_${userId}`
  localStorage.setItem(key, JSON.stringify(filtered))
  
  return true
}

// STATYSTYKI
export const getStats = () => {
  const bookings = getBookings()
  const customers = getCustomers()
  const services = getServices()
  const employees = getEmployees()
  
  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.date === today)
  
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0)
  
  const todayRevenue = todayBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0)
  
  return {
    totalBookings: bookings.length,
    todayBookings: todayBookings.length,
    totalRevenue,
    todayRevenue,
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => !c.isBlocked).length,
    totalServices: services.length,
    totalEmployees: employees.length
  }
}

// PRZELICZ STATYSTYKI WSZYSTKICH KLIENTÓW
export const recalculateAllCustomerStats = (): void => {
  const userId = getCurrentUserId()
  if (!userId) return
  
  const bookings = getBookings()
  const customers = getCustomers()
  
  // Przelicz statystyki dla wszystkich klientów na raz
  const updatedCustomers = customers.map(customer => {
    const customerBookings = bookings.filter(b => b.customerId === customer.id)
    const completedBookings = customerBookings.filter(b => b.status === 'completed' || b.status === 'confirmed')
    
    const totalVisits = completedBookings.length
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.price, 0)
    
    // Znajdź ostatnią wizytę
    const sortedBookings = completedBookings
      .map(b => ({ ...b, dateTime: new Date(b.date + ' ' + b.time) }))
      .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime())
    
    const lastVisit = sortedBookings.length > 0 ? sortedBookings[0].date : undefined
    
    return {
      ...customer,
      totalVisits,
      totalSpent,
      lastVisit
    }
  })
  
  const key = `customers_${userId}`
  localStorage.setItem(key, JSON.stringify(updatedCustomers))
}

// AKTUALIZACJA STATYSTYK KLIENTA
export const updateCustomerStats = (customerId: string): void => {
  const userId = getCurrentUserId()
  if (!userId) return
  
  const bookings = getBookings()
  const customers = getCustomers()
  const customerIndex = customers.findIndex(c => c.id === customerId)
  
  if (customerIndex === -1) return
  
  // Oblicz statystyki na podstawie wszystkich rezerwacji klienta
  const customerBookings = bookings.filter(b => b.customerId === customerId)
  const completedBookings = customerBookings.filter(b => b.status === 'completed' || b.status === 'confirmed')
  
  const totalVisits = completedBookings.length
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.price, 0)
  
  // Znajdź ostatnią wizytę
  const sortedBookings = completedBookings
    .map(b => ({ ...b, dateTime: new Date(b.date + ' ' + b.time) }))
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime())
  
  const lastVisit = sortedBookings.length > 0 ? sortedBookings[0].date : undefined
  
  // Aktualizuj dane klienta
  customers[customerIndex] = {
    ...customers[customerIndex],
    totalVisits,
    totalSpent,
    lastVisit
  }
  
  const key = `customers_${userId}`
  localStorage.setItem(key, JSON.stringify(customers))
}

// DŁUG KLIENTA
export const getCustomerDebt = (customerId: string): number => {
  const bookings = getBookings()
  return bookings
    .filter(b => 
      b.customerId === customerId && 
      (b.paymentStatus === 'unpaid' || b.paymentStatus === 'partial') &&
      // Uwzględnij pending (przyszłe), confirmed i completed, ale NIE cancelled
      (b.status === 'pending' || b.status === 'confirmed' || b.status === 'completed')
    )
    .reduce((sum, b) => {
      // Dla częściowo zapłaconych, odejmij już zapłaconą kwotę
      if (b.paymentStatus === 'partial' && b.paidAmount) {
        return sum + (b.price - b.paidAmount)
      }
      return sum + b.price
    }, 0)
}
