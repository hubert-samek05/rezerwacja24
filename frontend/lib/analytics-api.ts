// Analityka oparta na API
import axios from 'axios'
import { getApiUrl } from './api-url'
import { getTenantId, getTenantConfig } from './tenant'

export interface AnalyticsOverview {
  bookings: {
    total: number
    completed: number
    pending: number
    cancelled: number
    growth: number
    completionRate: number
    cancellationRate: number
  }
  revenue: {
    total: number
    growth: number
    averageBookingValue: number
    thisMonth: number
    lastMonth: number
  }
  customers: {
    total: number
    active: number
    new: number
    activeRate: number
    growth: number
  }
}

export interface RevenueData {
  chartData: Array<{ date: string; revenue: number; bookings: number }>
  byDayOfWeek: Array<{ day: string; revenue: number; bookings: number }>
  total: number
  average: number
}

export interface BookingsData {
  byStatus: Array<{ status: string; count: number; percentage: number; color: string }>
  byService: Array<{ service: string; count: number; revenue: number }>
  total: number
}

export interface ConversionData {
  confirmationRate: number
  completionRate: number
  cancellationRate: number
  noShowRate: number
  pendingCount: number
  confirmedCount: number
  completedCount: number
  cancelledCount: number
}

export interface PeakHoursData {
  hourly: Array<{ hour: string; bookingsCount: number; revenue: number }>
  daily: Array<{ day: string; bookingsCount: number; revenue: number }>
  peak: {
    hour: { hour: string; bookingsCount: number }
    day: { day: string; bookingsCount: number }
  }
}

export interface EmployeesData {
  employees: Array<{
    id: string
    name: string
    bookingsCount: number
    totalRevenue: number
    averageRating?: number
    cancellationRate: number
  }>
  topPerformer: {
    name: string
    revenue: number
  }
}

export interface ServicesData {
  services: Array<{
    id: string
    name: string
    category?: string
    bookingsCount: number
    totalRevenue: number
    averagePrice: number
  }>
  topService: {
    name: string
    bookings: number
  }
}

export interface CustomersData {
  segmentation: Array<{ segment: string; count: number; percentage: number }>
  topCustomers: Array<{
    id: string
    name: string
    bookingsCount: number
    totalSpent: number
    lastBooking: string
  }>
  newCustomers: number
  returningCustomers: number
}

export interface RetentionData {
  retentionRate: number
  returningCustomers: number
  oneTimeCustomers: number
  averageTimeBetweenBookings: number
  churnRate: number
}

export interface ForecastData {
  historical: Array<{ week: string; revenue: number; bookings: number }>
  forecast: Array<{ week: string; predictedRevenue: number; predictedBookings: number }>
  trend: 'growing' | 'declining' | 'stable'
  growthRate: number
  confidence: number
}

const getDayName = (date: Date): string => {
  const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
  return days[date.getDay()]
}

const getHeaders = () => {
  const config = getTenantConfig()
  return config.headers
}

export const getAnalyticsOverview = async (startDate: string, endDate: string): Promise<AnalyticsOverview> => {
  try {
    const API_URL = getApiUrl()
    const [bookingsRes, customersRes] = await Promise.all([
      axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() }),
      axios.get(`${API_URL}/api/customers`, { headers: getHeaders() })
    ])

    const bookings = bookingsRes.data || []
    const customers = customersRes.data || []

    // Filtruj rezerwacje według dat (używamy createdAt - kiedy rezerwacja została utworzona)
    const start = new Date(startDate)
    const end = new Date(endDate)
    // Rozszerz end o 30 dni w przyszłość żeby uwzględnić przyszłe rezerwacje
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 30)
    
    const filteredBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      const bookingDate = new Date(b.startTime)
      // Rezerwacja utworzona w okresie LUB zaplanowana na okres
      return (createdDate >= start && createdDate <= end) || 
             (bookingDate >= start && bookingDate <= extendedEnd)
    })

    // Poprzedni okres (do porównania)
    const periodLength = end.getTime() - start.getTime()
    const prevStart = new Date(start.getTime() - periodLength)
    const prevBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      return createdDate >= prevStart && createdDate < start
    })

    // Statystyki rezerwacji
    const completed = filteredBookings.filter((b: any) => b.status === 'COMPLETED').length
    const pending = filteredBookings.filter((b: any) => b.status === 'PENDING').length
    const cancelled = filteredBookings.filter((b: any) => b.status === 'CANCELLED').length
    const total = filteredBookings.length

    const growth = prevBookings.length > 0 
      ? ((total - prevBookings.length) / prevBookings.length) * 100 
      : 100

    // Statystyki przychodów
    const totalRevenue = filteredBookings.reduce((sum: number, b: any) => 
      sum + (parseFloat(b.totalPrice) || 0), 0
    )
    const prevRevenue = prevBookings.reduce((sum: number, b: any) => 
      sum + (parseFloat(b.totalPrice) || 0), 0
    )
    const revenueGrowth = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : 100

    // Statystyki klientów
    const activeCustomers = customers.filter((c: any) => c.totalBookings > 0).length
    const newCustomers = customers.filter((c: any) => {
      const createdAt = new Date(c.createdAt)
      return createdAt >= start && createdAt <= end
    }).length

    return {
      bookings: {
        total,
        completed,
        pending,
        cancelled,
        growth: Math.round(growth),
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0
      },
      revenue: {
        total: Math.round(totalRevenue),
        growth: Math.round(revenueGrowth),
        averageBookingValue: total > 0 ? Math.round(totalRevenue / total) : 0,
        thisMonth: Math.round(totalRevenue),
        lastMonth: Math.round(prevRevenue)
      },
      customers: {
        total: customers.length,
        active: activeCustomers,
        new: newCustomers,
        activeRate: customers.length > 0 ? Math.round((activeCustomers / customers.length) * 100) : 0,
        growth: Math.round((newCustomers / Math.max(customers.length - newCustomers, 1)) * 100)
      }
    }
  } catch (error) {
    console.error('Error loading analytics overview:', error)
    throw error
  }
}

export const getRevenueData = async (startDate: string, endDate: string): Promise<RevenueData> => {
  try {
    const API_URL = getApiUrl()
    const response = await axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() })
    const bookings = response.data || []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 30)
    
    const filteredBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      const bookingDate = new Date(b.startTime)
      return (createdDate >= start && createdDate <= end) || 
             (bookingDate >= start && bookingDate <= extendedEnd)
    })

    // Grupuj po dniach
    const revenueByDate: { [key: string]: { revenue: number; bookings: number } } = {}
    filteredBookings.forEach((b: any) => {
      const date = new Date(b.startTime).toISOString().split('T')[0]
      if (!revenueByDate[date]) {
        revenueByDate[date] = { revenue: 0, bookings: 0 }
      }
      revenueByDate[date].revenue += parseFloat(b.totalPrice) || 0
      revenueByDate[date].bookings += 1
    })

    const chartData = Object.entries(revenueByDate)
      .map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue),
        bookings: data.bookings
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Grupuj po dniach tygodnia
    const revenueByDay: { [key: string]: { revenue: number; bookings: number } } = {}
    filteredBookings.forEach((b: any) => {
      const day = getDayName(new Date(b.startTime))
      if (!revenueByDay[day]) {
        revenueByDay[day] = { revenue: 0, bookings: 0 }
      }
      revenueByDay[day].revenue += parseFloat(b.totalPrice) || 0
      revenueByDay[day].bookings += 1
    })

    const byDayOfWeek = Object.entries(revenueByDay).map(([day, data]) => ({
      day,
      revenue: Math.round(data.revenue),
      bookings: data.bookings
    }))

    const total = filteredBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.totalPrice) || 0), 0)

    return {
      chartData,
      byDayOfWeek,
      total: Math.round(total),
      average: chartData.length > 0 ? Math.round(total / chartData.length) : 0
    }
  } catch (error) {
    console.error('Error loading revenue data:', error)
    throw error
  }
}

export const getBookingsData = async (startDate: string, endDate: string): Promise<BookingsData> => {
  try {
    const API_URL = getApiUrl()
    const [bookingsRes, servicesRes] = await Promise.all([
      axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() }),
      axios.get(`${API_URL}/api/services`, { headers: getHeaders() })
    ])

    const bookings = bookingsRes.data || []
    const services = servicesRes.data || []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 30)
    
    const filteredBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      const bookingDate = new Date(b.startTime)
      return (createdDate >= start && createdDate <= end) || 
             (bookingDate >= start && bookingDate <= extendedEnd)
    })

    // Grupuj po statusie
    const statusCounts: { [key: string]: number } = {}
    filteredBookings.forEach((b: any) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1
    })

    const statusColors: { [key: string]: string } = {
      'PENDING': '#FFD700',
      'CONFIRMED': '#41FFBC',
      'COMPLETED': '#0F6048',
      'CANCELLED': '#FF6B6B',
      'NO_SHOW': '#95E1D3'
    }

    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / filteredBookings.length) * 100),
      color: statusColors[status] || '#D9D9D9'
    }))

    // Grupuj po usługach
    const serviceRevenue: { [key: string]: { count: number; revenue: number; name: string } } = {}
    filteredBookings.forEach((b: any) => {
      const service = services.find((s: any) => s.id === b.serviceId)
      const serviceName = service?.name || 'Nieznana usługa'
      
      if (!serviceRevenue[b.serviceId]) {
        serviceRevenue[b.serviceId] = { count: 0, revenue: 0, name: serviceName }
      }
      serviceRevenue[b.serviceId].count += 1
      serviceRevenue[b.serviceId].revenue += parseFloat(b.totalPrice) || 0
    })

    const byService = Object.values(serviceRevenue)
      .map(data => ({
        service: data.name,
        count: data.count,
        revenue: Math.round(data.revenue)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      byStatus,
      byService,
      total: filteredBookings.length
    }
  } catch (error) {
    console.error('Error loading bookings data:', error)
    throw error
  }
}

// Pozostałe funkcje będą podobnie przepisane...
export const getConversionData = async (startDate: string, endDate: string): Promise<ConversionData> => {
  try {
    const API_URL = getApiUrl()
    const response = await axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() })
    const bookings = response.data || []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 30)
    
    const filteredBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      const bookingDate = new Date(b.startTime)
      return (createdDate >= start && createdDate <= end) || 
             (bookingDate >= start && bookingDate <= extendedEnd)
    })

    const total = filteredBookings.length
    const pending = filteredBookings.filter((b: any) => b.status === 'PENDING').length
    const confirmed = filteredBookings.filter((b: any) => b.status === 'CONFIRMED').length
    const completed = filteredBookings.filter((b: any) => b.status === 'COMPLETED').length
    const cancelled = filteredBookings.filter((b: any) => b.status === 'CANCELLED').length
    const noShow = filteredBookings.filter((b: any) => b.status === 'NO_SHOW').length

    return {
      confirmationRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
      pendingCount: pending,
      confirmedCount: confirmed,
      completedCount: completed,
      cancelledCount: cancelled
    }
  } catch (error) {
    console.error('Error loading conversion data:', error)
    throw error
  }
}

export const getPeakHoursData = async (startDate: string, endDate: string): Promise<PeakHoursData> => {
  try {
    const API_URL = getApiUrl()
    const response = await axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() })
    const bookings = response.data || []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 30)
    
    const filteredBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      const bookingDate = new Date(b.startTime)
      return (createdDate >= start && createdDate <= end) || 
             (bookingDate >= start && bookingDate <= extendedEnd)
    })

    // Grupuj po godzinach
    const hourlyData: { [key: string]: { count: number; revenue: number } } = {}
    for (let i = 0; i < 24; i++) {
      hourlyData[`${i}:00`] = { count: 0, revenue: 0 }
    }

    filteredBookings.forEach((b: any) => {
      const hour = new Date(b.startTime).getHours()
      const key = `${hour}:00`
      hourlyData[key].count += 1
      hourlyData[key].revenue += parseFloat(b.totalPrice) || 0
    })

    const hourly = Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      bookingsCount: data.count,
      revenue: Math.round(data.revenue)
    }))

    // Grupuj po dniach tygodnia
    const dailyData: { [key: string]: { count: number; revenue: number } } = {}
    filteredBookings.forEach((b: any) => {
      const day = getDayName(new Date(b.startTime))
      if (!dailyData[day]) {
        dailyData[day] = { count: 0, revenue: 0 }
      }
      dailyData[day].count += 1
      dailyData[day].revenue += parseFloat(b.totalPrice) || 0
    })

    const daily = Object.entries(dailyData).map(([day, data]) => ({
      day,
      bookingsCount: data.count,
      revenue: Math.round(data.revenue)
    }))

    // Znajdź szczyt
    const peakHour = hourly.reduce((max, curr) => 
      curr.bookingsCount > max.bookingsCount ? curr : max, hourly[0]
    )

    const peakDay = daily.reduce((max, curr) => 
      curr.bookingsCount > max.bookingsCount ? curr : max, daily[0] || { day: 'Brak', bookingsCount: 0 }
    )

    return {
      hourly,
      daily,
      peak: {
        hour: { hour: peakHour.hour, bookingsCount: peakHour.bookingsCount },
        day: { day: peakDay.day, bookingsCount: peakDay.bookingsCount }
      }
    }
  } catch (error) {
    console.error('Error loading peak hours data:', error)
    throw error
  }
}

// Implementacja pozostałych funkcji
export const getEmployeesData = async (startDate: string, endDate: string): Promise<EmployeesData> => {
  try {
    const API_URL = getApiUrl()
    const [bookingsRes, employeesRes] = await Promise.all([
      axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() }),
      axios.get(`${API_URL}/api/employees`, { headers: getHeaders() })
    ])

    const bookings = bookingsRes.data || []
    const employees = employeesRes.data || []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 30)
    
    const filteredBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      const bookingDate = new Date(b.startTime)
      return (createdDate >= start && createdDate <= end) || 
             (bookingDate >= start && bookingDate <= extendedEnd)
    })

    // Grupuj rezerwacje po pracownikach
    const employeeStats: { [key: string]: { bookings: number; revenue: number; cancelled: number; name: string } } = {}
    
    filteredBookings.forEach((b: any) => {
      const empId = b.employeeId
      if (!employeeStats[empId]) {
        const emp = employees.find((e: any) => e.id === empId)
        employeeStats[empId] = {
          bookings: 0,
          revenue: 0,
          cancelled: 0,
          name: emp ? `${emp.firstName} ${emp.lastName}` : 'Nieznany'
        }
      }
      employeeStats[empId].bookings += 1
      employeeStats[empId].revenue += parseFloat(b.totalPrice) || 0
      if (b.status === 'CANCELLED') {
        employeeStats[empId].cancelled += 1
      }
    })

    const employeesData = Object.entries(employeeStats).map(([id, stats]) => ({
      id,
      name: stats.name,
      bookingsCount: stats.bookings,
      totalRevenue: Math.round(stats.revenue),
      cancellationRate: stats.bookings > 0 ? Math.round((stats.cancelled / stats.bookings) * 100) : 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)

    const topPerformer = employeesData[0] || { name: 'Brak danych', revenue: 0 }

    return {
      employees: employeesData,
      topPerformer: { name: topPerformer.name, revenue: topPerformer.totalRevenue }
    }
  } catch (error) {
    console.error('Error loading employees data:', error)
    return {
      employees: [],
      topPerformer: { name: 'Brak danych', revenue: 0 }
    }
  }
}

export const getServicesData = async (startDate: string, endDate: string): Promise<ServicesData> => {
  try {
    const API_URL = getApiUrl()
    const [bookingsRes, servicesRes] = await Promise.all([
      axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() }),
      axios.get(`${API_URL}/api/services`, { headers: getHeaders() })
    ])

    const bookings = bookingsRes.data || []
    const services = servicesRes.data || []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 30)
    
    const filteredBookings = bookings.filter((b: any) => {
      const createdDate = new Date(b.createdAt)
      const bookingDate = new Date(b.startTime)
      return (createdDate >= start && createdDate <= end) || 
             (bookingDate >= start && bookingDate <= extendedEnd)
    })

    // Grupuj po usługach
    const serviceStats: { [key: string]: { bookings: number; revenue: number; name: string; category?: string } } = {}
    
    filteredBookings.forEach((b: any) => {
      const svcId = b.serviceId
      if (!serviceStats[svcId]) {
        const svc = services.find((s: any) => s.id === svcId)
        serviceStats[svcId] = {
          bookings: 0,
          revenue: 0,
          name: svc?.name || 'Nieznana usługa',
          category: svc?.service_categories?.name
        }
      }
      serviceStats[svcId].bookings += 1
      serviceStats[svcId].revenue += parseFloat(b.totalPrice) || 0
    })

    const servicesData = Object.entries(serviceStats).map(([id, stats]) => ({
      id,
      name: stats.name,
      category: stats.category,
      bookingsCount: stats.bookings,
      totalRevenue: Math.round(stats.revenue),
      averagePrice: Math.round(stats.revenue / stats.bookings)
    })).sort((a, b) => b.bookingsCount - a.bookingsCount)

    const topService = servicesData[0] || { name: 'Brak danych', bookings: 0 }

    return {
      services: servicesData,
      topService: { name: topService.name, bookings: topService.bookingsCount }
    }
  } catch (error) {
    console.error('Error loading services data:', error)
    return {
      services: [],
      topService: { name: 'Brak danych', bookings: 0 }
    }
  }
}

export const getCustomersData = async (startDate: string, endDate: string): Promise<CustomersData> => {
  try {
    const API_URL = getApiUrl()
    const [bookingsRes, customersRes] = await Promise.all([
      axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() }),
      axios.get(`${API_URL}/api/customers`, { headers: getHeaders() })
    ])

    const bookings = bookingsRes.data || []
    const customers = customersRes.data || []

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Segmentacja klientów
    const newCustomers = customers.filter((c: any) => {
      const createdAt = new Date(c.createdAt)
      return createdAt >= start && createdAt <= end
    })

    const returningCustomers = customers.filter((c: any) => c.totalBookings > 1)

    const segmentation = [
      { segment: 'Nowi klienci', count: newCustomers.length, percentage: Math.round((newCustomers.length / customers.length) * 100) },
      { segment: 'Powracający', count: returningCustomers.length, percentage: Math.round((returningCustomers.length / customers.length) * 100) },
      { segment: 'Jednorazowi', count: customers.length - returningCustomers.length, percentage: Math.round(((customers.length - returningCustomers.length) / customers.length) * 100) }
    ]

    // Top klienci
    const topCustomers = customers
      .sort((a: any, b: any) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, 10)
      .map((c: any) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        bookingsCount: c.totalBookings || 0,
        totalSpent: Math.round(c.totalSpent || 0),
        lastBooking: c.lastBookingDate || 'Brak'
      }))

    return {
      segmentation,
      topCustomers,
      newCustomers: newCustomers.length,
      returningCustomers: returningCustomers.length
    }
  } catch (error) {
    console.error('Error loading customers data:', error)
    return {
      segmentation: [],
      topCustomers: [],
      newCustomers: 0,
      returningCustomers: 0
    }
  }
}

export const getRetentionData = async (): Promise<RetentionData> => {
  try {
    const API_URL = getApiUrl()
    const customersRes = await axios.get(`${API_URL}/api/customers`, { headers: getHeaders() })
    const customers = customersRes.data || []

    const returningCustomers = customers.filter((c: any) => c.totalBookings > 1).length
    const oneTimeCustomers = customers.filter((c: any) => c.totalBookings === 1).length
    const retentionRate = customers.length > 0 ? Math.round((returningCustomers / customers.length) * 100) : 0
    const churnRate = 100 - retentionRate

    return {
      retentionRate,
      returningCustomers,
      oneTimeCustomers,
      averageTimeBetweenBookings: 0, // TODO: oblicz z dat rezerwacji
      churnRate
    }
  } catch (error) {
    console.error('Error loading retention data:', error)
    return {
      retentionRate: 0,
      returningCustomers: 0,
      oneTimeCustomers: 0,
      averageTimeBetweenBookings: 0,
      churnRate: 0
    }
  }
}

export const getForecastData = async (): Promise<ForecastData> => {
  try {
    const API_URL = getApiUrl()
    const bookingsRes = await axios.get(`${API_URL}/api/bookings`, { headers: getHeaders() })
    const bookings = bookingsRes.data || []

    // Grupuj po tygodniach (ostatnie 12 tygodni)
    const weeks: { [key: string]: { revenue: number; bookings: number } } = {}
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7))
      const weekKey = `Tydz. ${12 - i}`
      weeks[weekKey] = { revenue: 0, bookings: 0 }
    }

    bookings.forEach((b: any) => {
      const bookingDate = new Date(b.startTime)
      const weeksAgo = Math.floor((now.getTime() - bookingDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (weeksAgo >= 0 && weeksAgo < 12) {
        const weekKey = `Tydz. ${12 - weeksAgo}`
        if (weeks[weekKey]) {
          weeks[weekKey].revenue += parseFloat(b.totalPrice) || 0
          weeks[weekKey].bookings += 1
        }
      }
    })

    const historical = Object.entries(weeks).map(([week, data]) => ({
      week,
      revenue: Math.round(data.revenue),
      bookings: data.bookings
    }))

    // Prosta prognoza (średnia z ostatnich 4 tygodni)
    const recentWeeks = historical.slice(-4)
    const avgRevenue = recentWeeks.reduce((sum, w) => sum + w.revenue, 0) / 4
    const avgBookings = Math.round(recentWeeks.reduce((sum, w) => sum + w.bookings, 0) / 4)

    const forecast = [
      { week: 'Tydz. 13', predictedRevenue: Math.round(avgRevenue), predictedBookings: avgBookings },
      { week: 'Tydz. 14', predictedRevenue: Math.round(avgRevenue * 1.05), predictedBookings: avgBookings },
      { week: 'Tydz. 15', predictedRevenue: Math.round(avgRevenue * 1.1), predictedBookings: avgBookings },
      { week: 'Tydz. 16', predictedRevenue: Math.round(avgRevenue * 1.15), predictedBookings: avgBookings }
    ]

    // Trend
    const firstHalf = historical.slice(0, 6).reduce((sum, w) => sum + w.revenue, 0)
    const secondHalf = historical.slice(6, 12).reduce((sum, w) => sum + w.revenue, 0)
    const growthRate = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0
    const trend = growthRate > 10 ? 'growing' : growthRate < -10 ? 'declining' : 'stable'

    return {
      historical,
      forecast,
      trend,
      growthRate,
      confidence: 75
    }
  } catch (error) {
    console.error('Error loading forecast data:', error)
    return {
      historical: [],
      forecast: [],
      trend: 'stable',
      growthRate: 0,
      confidence: 0
    }
  }
}
