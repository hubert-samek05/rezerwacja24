// Analityka oparta na localStorage

import { getBookings, getCustomers, getServices, getEmployees } from './storage'

export interface AnalyticsOverview {
  bookings: {
    total: number
    completed: number
    growth: number
    completionRate: number
    cancellationRate: number
  }
  revenue: {
    total: number
    growth: number
    averageBookingValue: number
  }
  customers: {
    total: number
    active: number
    activeRate: number
  }
}

export interface RevenueData {
  chartData: Array<{ date: string; revenue: number }>
  byDayOfWeek: Array<{ day: string; revenue: number }>
}

export interface BookingsData {
  byStatus: Array<{ status: string; count: number; percentage: number }>
}

export interface ConversionData {
  confirmationRate: number
  completionRate: number
  cancellationRate: number
  noShowRate: number
}

export interface PeakHoursData {
  hourly: Array<{ hour: string; bookingsCount: number }>
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
    cancellationRate: number
  }>
}

export interface ServicesData {
  services: Array<{
    id: string
    name: string
    category?: string
    bookingsCount: number
    totalRevenue: number
  }>
}

export interface CustomersData {
  segmentation: Array<{ segment: string; count: number; percentage: number }>
  topCustomers: Array<{
    id: string
    name: string
    bookingsCount: number
    totalSpent: number
  }>
}

export interface RetentionData {
  retentionRate: number
  returningCustomers: number
  oneTimeCustomers: number
  averageTimeBetweenBookings: number
}

export interface ForecastData {
  historical: Array<{ week: string; revenue: number }>
  forecast: Array<{ week: string; predictedRevenue: number }>
  trend: 'growing' | 'declining' | 'stable'
  growthRate: number
}

const getDayName = (date: Date): string => {
  const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
  return days[date.getDay()]
}

export const getAnalyticsOverview = (startDate: string, endDate: string): AnalyticsOverview => {
  const bookings = getBookings()
  const customers = getCustomers()
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Filtruj rezerwacje w okresie
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end
  })
  
  // Poprzedni okres
  const periodLength = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - periodLength)
  const prevEnd = start
  
  const prevPeriodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= prevStart && bookingDate < prevEnd
  })
  
  const completedBookings = periodBookings.filter(b => b.status === 'completed').length
  const cancelledBookings = periodBookings.filter(b => b.status === 'cancelled').length
  
  const totalRevenue = periodBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0)
  
  const prevRevenue = prevPeriodBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0)
  
  const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
  const bookingsGrowth = prevPeriodBookings.length > 0 
    ? ((periodBookings.length - prevPeriodBookings.length) / prevPeriodBookings.length) * 100 
    : 0
  
  const activeCustomers = customers.filter(c => !c.isBlocked).length
  
  return {
    bookings: {
      total: periodBookings.length,
      completed: completedBookings,
      growth: Math.round(bookingsGrowth),
      completionRate: periodBookings.length > 0 ? Math.round((completedBookings / periodBookings.length) * 100) : 0,
      cancellationRate: periodBookings.length > 0 ? Math.round((cancelledBookings / periodBookings.length) * 100) : 0
    },
    revenue: {
      total: Math.round(totalRevenue),
      growth: Math.round(revenueGrowth),
      averageBookingValue: periodBookings.length > 0 ? Math.round(totalRevenue / periodBookings.length) : 0
    },
    customers: {
      total: customers.length,
      active: activeCustomers,
      activeRate: customers.length > 0 ? Math.round((activeCustomers / customers.length) * 100) : 0
    }
  }
}

export const getRevenueData = (startDate: string, endDate: string): RevenueData => {
  const bookings = getBookings()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end && (b.status === 'completed' || b.status === 'confirmed')
  })
  
  // Grupuj po dacie
  const revenueByDate: Record<string, number> = {}
  periodBookings.forEach(b => {
    if (!revenueByDate[b.date]) {
      revenueByDate[b.date] = 0
    }
    revenueByDate[b.date] += b.price
  })
  
  const chartData = Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  // Grupuj po dniu tygodnia
  const revenueByDayOfWeek: Record<string, number> = {}
  periodBookings.forEach(b => {
    const day = getDayName(new Date(b.date))
    if (!revenueByDayOfWeek[day]) {
      revenueByDayOfWeek[day] = 0
    }
    revenueByDayOfWeek[day] += b.price
  })
  
  const dayOrder = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
  const byDayOfWeek = dayOrder.map(day => ({
    day,
    revenue: Math.round(revenueByDayOfWeek[day] || 0)
  }))
  
  return { chartData, byDayOfWeek }
}

export const getBookingsData = (startDate: string, endDate: string): BookingsData => {
  const bookings = getBookings()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end
  })
  
  const statusCount: Record<string, number> = {}
  periodBookings.forEach(b => {
    statusCount[b.status] = (statusCount[b.status] || 0) + 1
  })
  
  const total = periodBookings.length
  const byStatus = Object.entries(statusCount).map(([status, count]) => ({
    status: status === 'confirmed' ? 'Potwierdzone' : 
            status === 'pending' ? 'Oczekujące' :
            status === 'cancelled' ? 'Anulowane' : 'Ukończone',
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }))
  
  return { byStatus }
}

export const getConversionData = (startDate: string, endDate: string): ConversionData => {
  const bookings = getBookings()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end
  })
  
  const total = periodBookings.length
  if (total === 0) {
    return {
      confirmationRate: 0,
      completionRate: 0,
      cancellationRate: 0,
      noShowRate: 0
    }
  }
  
  const confirmed = periodBookings.filter(b => b.status === 'confirmed').length
  const completed = periodBookings.filter(b => b.status === 'completed').length
  const cancelled = periodBookings.filter(b => b.status === 'cancelled').length
  
  return {
    confirmationRate: Math.round((confirmed / total) * 100),
    completionRate: Math.round((completed / total) * 100),
    cancellationRate: Math.round((cancelled / total) * 100),
    noShowRate: 0 // Brak danych o no-show w obecnym modelu
  }
}

export const getPeakHoursData = (startDate: string, endDate: string): PeakHoursData => {
  const bookings = getBookings()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end
  })
  
  // Grupuj po godzinie
  const bookingsByHour: Record<string, number> = {}
  periodBookings.forEach(b => {
    const hour = b.time.split(':')[0]
    bookingsByHour[hour] = (bookingsByHour[hour] || 0) + 1
  })
  
  const hourly = Object.entries(bookingsByHour)
    .map(([hour, bookingsCount]) => ({ hour: `${hour}:00`, bookingsCount }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
  
  // Znajdź szczyt
  const peakHour = hourly.reduce((max, curr) => curr.bookingsCount > max.bookingsCount ? curr : max, hourly[0] || { hour: '0:00', bookingsCount: 0 })
  
  // Grupuj po dniu tygodnia
  const bookingsByDay: Record<string, number> = {}
  periodBookings.forEach(b => {
    const day = getDayName(new Date(b.date))
    bookingsByDay[day] = (bookingsByDay[day] || 0) + 1
  })
  
  const peakDay = Object.entries(bookingsByDay)
    .map(([day, bookingsCount]) => ({ day, bookingsCount }))
    .reduce((max, curr) => curr.bookingsCount > max.bookingsCount ? curr : max, { day: 'Poniedziałek', bookingsCount: 0 })
  
  return {
    hourly,
    peak: {
      hour: peakHour,
      day: peakDay
    }
  }
}

export const getEmployeesData = (startDate: string, endDate: string): EmployeesData => {
  const bookings = getBookings()
  const employees = getEmployees()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end
  })
  
  const employeeStats = employees.map(emp => {
    const empBookings = periodBookings.filter(b => b.employeeId === emp.id)
    const totalRevenue = empBookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + b.price, 0)
    const cancelled = empBookings.filter(b => b.status === 'cancelled').length
    
    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      bookingsCount: empBookings.length,
      totalRevenue: Math.round(totalRevenue),
      cancellationRate: empBookings.length > 0 ? Math.round((cancelled / empBookings.length) * 100) : 0
    }
  }).filter(emp => emp.bookingsCount > 0) // Filtruj tylko pracowników z rezerwacjami
  
  return {
    employees: employeeStats.sort((a, b) => b.totalRevenue - a.totalRevenue)
  }
}

export const getServicesData = (startDate: string, endDate: string): ServicesData => {
  const bookings = getBookings()
  const services = getServices()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end
  })
  
  const serviceStats = services.map(service => {
    const serviceBookings = periodBookings.filter(b => b.serviceId === service.id)
    const totalRevenue = serviceBookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + b.price, 0)
    
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      bookingsCount: serviceBookings.length,
      totalRevenue: Math.round(totalRevenue)
    }
  }).filter(service => service.bookingsCount > 0) // Filtruj tylko usługi z rezerwacjami
  
  return {
    services: serviceStats.sort((a, b) => b.bookingsCount - a.bookingsCount)
  }
}

export const getCustomersData = (startDate: string, endDate: string): CustomersData => {
  const bookings = getBookings()
  const customers = getCustomers()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const periodBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate >= start && bookingDate <= end
  })
  
  // Oblicz rzeczywiste dane dla każdego klienta na podstawie WSZYSTKICH rezerwacji
  const allBookings = getBookings()
  const customerStats = customers.map(c => {
    const customerBookings = allBookings.filter(b => b.customerId === c.id)
    const completedBookings = customerBookings.filter(b => b.status === 'completed' || b.status === 'confirmed')
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.price, 0)
    const totalVisits = completedBookings.length
    
    return {
      ...c,
      actualTotalVisits: totalVisits,
      actualTotalSpent: totalSpent
    }
  })
  
  // Segmentacja na podstawie rzeczywistych wizyt
  const newCustomers = customerStats.filter(c => c.actualTotalVisits === 1).length
  const regularCustomers = customerStats.filter(c => c.actualTotalVisits >= 2 && c.actualTotalVisits <= 5).length
  const vipCustomers = customerStats.filter(c => c.actualTotalVisits > 5).length
  
  const total = customers.length
  const segmentation = [
    { segment: 'Nowi', count: newCustomers, percentage: total > 0 ? Math.round((newCustomers / total) * 100) : 0 },
    { segment: 'Regularni', count: regularCustomers, percentage: total > 0 ? Math.round((regularCustomers / total) * 100) : 0 },
    { segment: 'VIP', count: vipCustomers, percentage: total > 0 ? Math.round((vipCustomers / total) * 100) : 0 }
  ]
  
  // Top klienci na podstawie rzeczywistych wydatków
  const topCustomers = customerStats
    .filter(c => c.actualTotalVisits > 0) // Tylko klienci z wizytami
    .map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      bookingsCount: c.actualTotalVisits,
      totalSpent: Math.round(c.actualTotalSpent)
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
  
  return { segmentation, topCustomers }
}

export const getRetentionData = (): RetentionData => {
  const customers = getCustomers()
  const allBookings = getBookings()
  
  // Oblicz rzeczywiste wizyty dla każdego klienta
  const customerVisits = customers.map(c => {
    const completedBookings = allBookings.filter(b => 
      b.customerId === c.id && (b.status === 'completed' || b.status === 'confirmed')
    )
    return {
      customerId: c.id,
      visits: completedBookings.length,
      bookings: completedBookings
    }
  })
  
  const returningCustomers = customerVisits.filter(c => c.visits > 1).length
  const oneTimeCustomers = customerVisits.filter(c => c.visits === 1).length
  const total = customers.length
  
  // Oblicz średni czas między wizytami
  let totalDaysBetween = 0
  let pairsCount = 0
  
  customerVisits.forEach(customer => {
    if (customer.visits > 1) {
      const sortedBookings = customer.bookings
        .map(b => new Date(b.date).getTime())
        .sort((a, b) => a - b)
      
      for (let i = 1; i < sortedBookings.length; i++) {
        const daysBetween = (sortedBookings[i] - sortedBookings[i-1]) / (1000 * 60 * 60 * 24)
        totalDaysBetween += daysBetween
        pairsCount++
      }
    }
  })
  
  const averageTimeBetweenBookings = pairsCount > 0 ? Math.round(totalDaysBetween / pairsCount) : 0
  
  return {
    retentionRate: total > 0 ? Math.round((returningCustomers / total) * 100) : 0,
    returningCustomers,
    oneTimeCustomers,
    averageTimeBetweenBookings
  }
}

export const getForecastData = (): ForecastData => {
  const bookings = getBookings()
  
  // Ostatnie 4 tygodnie
  const now = new Date()
  const historical = []
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (i + 1) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    
    const weekBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date)
      return bookingDate >= weekStart && bookingDate < weekEnd && (b.status === 'completed' || b.status === 'confirmed')
    })
    
    const revenue = weekBookings.reduce((sum, b) => sum + b.price, 0)
    historical.push({
      week: `Tydz. ${4 - i}`,
      revenue: Math.round(revenue)
    })
  }
  
  // Prognoza na następne 4 tygodnie
  const avgRevenue = historical.reduce((sum, h) => sum + h.revenue, 0) / historical.length
  const growthRate = historical.length > 1 
    ? ((historical[historical.length - 1].revenue - historical[0].revenue) / historical[0].revenue) * 100 
    : 0
  
  const forecast = []
  for (let i = 1; i <= 4; i++) {
    const predictedRevenue = Math.round(avgRevenue * (1 + (growthRate / 100) * i))
    forecast.push({
      week: `Tydz. ${4 + i}`,
      predictedRevenue
    })
  }
  
  const trend = growthRate > 5 ? 'growing' : growthRate < -5 ? 'declining' : 'stable'
  
  return {
    historical,
    forecast,
    trend,
    growthRate: Math.round(growthRate)
  }
}
