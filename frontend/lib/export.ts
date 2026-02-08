// Funkcje eksportu raportów do CSV i PDF

import { Booking, Customer, Service, getBookings, getCustomers, getServices } from './storage'

export interface ReportData {
  bookings: Booking[]
  customers: Customer[]
  services: Service[]
  dateRange: {
    start: Date
    end: Date
  }
}

// Eksport do CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('Brak danych do eksportu')
    return
  }

  // Pobierz nagłówki z pierwszego obiektu
  const headers = Object.keys(data[0])
  
  // Utwórz wiersze CSV
  const csvRows = [
    headers.join(','), // Nagłówki
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escapuj wartości zawierające przecinki lub cudzysłowy
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ]

  // Utwórz blob i pobierz plik
  const csvContent = csvRows.join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Eksport rezerwacji
export const exportBookingsReport = (period: 'day' | 'week' | 'month' | 'all' = 'all') => {
  const bookings = getBookings()
  
  let filteredBookings = bookings
  
  if (period !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let startDate: Date
    
    switch (period) {
      case 'day':
        startDate = today
        break
      case 'week':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
        break
    }
    
    filteredBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date)
      return bookingDate >= startDate
    })
  }
  
  // Przygotuj dane do eksportu
  const exportData = filteredBookings.map(b => ({
    'ID': b.id,
    'Data': b.date,
    'Godzina': b.time,
    'Klient': b.customerName,
    'Usługa': b.serviceName,
    'Pracownik': b.employeeName,
    'Czas trwania (min)': b.duration,
    'Cena (zł)': b.price,
    'Status': b.status,
    'Status płatności': b.paymentStatus,
    'Zapłacono (zł)': b.paidAmount || 0,
    'Metoda płatności': b.paymentMethod || '-',
    'Notatki': b.notes || '-',
    'Utworzono': new Date(b.createdAt).toLocaleString('pl-PL')
  }))
  
  exportToCSV(exportData, `rezerwacje_${period}`)
}

// Eksport klientów
export const exportCustomersReport = () => {
  const customers = getCustomers()
  
  const exportData = customers.map(c => ({
    'ID': c.id,
    'Imię': c.firstName,
    'Nazwisko': c.lastName,
    'Email': c.email,
    'Telefon': c.phone,
    'Liczba wizyt': c.totalVisits,
    'Wydano (zł)': c.totalSpent,
    'Ostatnia wizyta': c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('pl-PL') : '-',
    'Status': c.isBlocked ? 'Zablokowany' : (c.totalBookings || 0) > 10 ? 'VIP' : 'Aktywny',
    'Notatki': c.notes || '-',
    'Utworzono': c.createdAt ? new Date(c.createdAt).toLocaleString('pl-PL') : '-'
  }))
  
  exportToCSV(exportData, 'klienci')
}

// Eksport usług
export const exportServicesReport = () => {
  const services = getServices()
  
  const exportData = services.map(s => ({
    'ID': s.id,
    'Nazwa': s.name,
    'Opis': s.description,
    'Kategoria': s.category,
    'Cena (zł)': s.price,
    'Czas trwania (min)': s.duration,
    'Liczba pracowników': s.employees.length,
    'Utworzono': new Date(s.createdAt).toLocaleString('pl-PL')
  }))
  
  exportToCSV(exportData, 'uslugi')
}

// Eksport raportu finansowego
export const exportFinancialReport = (period: 'day' | 'week' | 'month' | 'all' = 'month') => {
  const bookings = getBookings()
  
  let filteredBookings = bookings
  
  if (period !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let startDate: Date
    
    switch (period) {
      case 'day':
        startDate = today
        break
      case 'week':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
        break
    }
    
    filteredBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date)
      return bookingDate >= startDate
    })
  }
  
  // Grupuj po dacie
  const dailyStats = filteredBookings.reduce((acc, booking) => {
    const date = booking.date
    
    if (!acc[date]) {
      acc[date] = {
        date,
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0
      }
    }
    
    acc[date].totalBookings++
    
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      acc[date].confirmedBookings++
      acc[date].totalRevenue += booking.price
      
      if (booking.paymentStatus === 'paid') {
        acc[date].paidRevenue += booking.price
      } else if (booking.paymentStatus === 'partial' && booking.paidAmount) {
        acc[date].paidRevenue += booking.paidAmount
        acc[date].unpaidRevenue += (booking.price - booking.paidAmount)
      } else {
        acc[date].unpaidRevenue += booking.price
      }
    } else if (booking.status === 'cancelled') {
      acc[date].cancelledBookings++
    }
    
    return acc
  }, {} as Record<string, any>)
  
  const exportData = Object.values(dailyStats).map((stat: any) => ({
    'Data': stat.date,
    'Wszystkie rezerwacje': stat.totalBookings,
    'Potwierdzone': stat.confirmedBookings,
    'Anulowane': stat.cancelledBookings,
    'Przychód całkowity (zł)': stat.totalRevenue.toFixed(2),
    'Zapłacone (zł)': stat.paidRevenue.toFixed(2),
    'Niezapłacone (zł)': stat.unpaidRevenue.toFixed(2)
  }))
  
  // Sortuj po dacie
  exportData.sort((a, b) => a['Data'].localeCompare(b['Data']))
  
  exportToCSV(exportData, `raport_finansowy_${period}`)
}

// Eksport kompleksowego raportu
export const exportFullReport = () => {
  const bookings = getBookings()
  const customers = getCustomers()
  const services = getServices()
  
  const summary = {
    'Metryka': ['Wszystkie rezerwacje', 'Potwierdzone', 'Anulowane', 'Oczekujące', 'Zakończone', 
                'Całkowity przychód (zł)', 'Zapłacone (zł)', 'Niezapłacone (zł)', 
                'Liczba klientów', 'Aktywni klienci', 'Liczba usług'],
    'Wartość': [
      bookings.length,
      bookings.filter(b => b.status === 'confirmed').length,
      bookings.filter(b => b.status === 'cancelled').length,
      bookings.filter(b => b.status === 'pending').length,
      bookings.filter(b => b.status === 'completed').length,
      bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + b.price, 0).toFixed(2),
      bookings.filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.price, 0).toFixed(2),
      bookings.filter(b => b.paymentStatus === 'unpaid' || b.paymentStatus === 'partial')
        .reduce((sum, b) => sum + (b.paymentStatus === 'partial' && b.paidAmount ? b.price - b.paidAmount : b.price), 0).toFixed(2),
      customers.length,
      customers.filter(c => !c.isBlocked).length,
      services.length
    ]
  }
  
  exportToCSV([summary], 'raport_pelny')
}
