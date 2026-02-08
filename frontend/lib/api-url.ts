/**
 * Pobiera URL API na podstawie środowiska
 * Automatycznie wykrywa czy jesteśmy na produkcji czy w developmencie
 * Obsługuje obie platformy: rezerwacja24.pl i bookings24.eu
 */
export function getApiUrl(host?: string): string {
  // Sprawdź czy jesteśmy w przeglądarce
  if (typeof window === 'undefined') {
    // Server-side - sprawdź host z parametru lub env
    const serverHost = host || process.env.HOST || '';
    
    if (serverHost.includes('bookings24.eu')) {
      return 'http://localhost:4001'
    }
    // Default dla rezerwacja24.pl lub localhost
    return 'http://localhost:3001'
  }
  
  // Client-side - sprawdź hostname
  const hostname = window.location.hostname
  
  // bookings24.eu -> api.bookings24.eu (port 4001)
  if (hostname.includes('bookings24.eu')) {
    return 'https://api.bookings24.eu'
  }
  
  // rezerwacja24.pl -> api.rezerwacja24.pl (port 3001)
  if (hostname.includes('rezerwacja24.pl')) {
    return 'https://api.rezerwacja24.pl'
  }
  
  // Development/localhost
  return 'http://localhost:3001'
}

/**
 * Pobiera tenant ID z zalogowanego użytkownika
 */
export function getTenantId(): string {
  if (typeof window === 'undefined') {
    return '1701364800000' // Default dla SSR
  }
  
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.tenantId || '1701364800000'
    }
  } catch (error) {
    console.error('Error getting tenant ID:', error)
  }
  
  return '1701364800000' // Fallback
}

/**
 * Pobiera headers dla requestów API
 */
export function getApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-ID': getTenantId()
  }
}
