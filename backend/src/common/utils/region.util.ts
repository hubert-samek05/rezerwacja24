import { Request } from 'express';

export type Region = 'pl' | 'eu';

/**
 * Wykrywa region na podstawie żądania HTTP.
 * Sprawdza nagłówki Origin, Referer oraz Host.
 * 
 * @param request - Obiekt żądania Express
 * @returns 'eu' dla bookings24.eu, 'pl' dla rezerwacja24.pl (domyślnie)
 */
export function getRegionFromRequest(request: Request): Region {
  // Sprawdź Origin header (najczęściej używany przy CORS)
  const origin = request.headers.origin || '';
  if (origin.includes('bookings24.eu')) {
    return 'eu';
  }
  
  // Sprawdź Referer header (backup)
  const referer = request.headers.referer || '';
  if (referer.includes('bookings24.eu')) {
    return 'eu';
  }
  
  // Sprawdź Host header (dla bezpośrednich żądań)
  const host = request.headers.host || '';
  if (host.includes('bookings24.eu')) {
    return 'eu';
  }
  
  // Domyślnie polska wersja
  return 'pl';
}

/**
 * Wykrywa region na podstawie stringa (URL, domena, subdomena)
 * 
 * @param domainOrUrl - URL lub domena do sprawdzenia
 * @returns 'eu' dla bookings24.eu, 'pl' dla rezerwacja24.pl (domyślnie)
 */
export function getRegionFromDomain(domainOrUrl: string): Region {
  if (!domainOrUrl) return 'pl';
  
  if (domainOrUrl.includes('bookings24.eu')) {
    return 'eu';
  }
  
  return 'pl';
}

/**
 * Sprawdza czy region to EU
 */
export function isEuRegion(region: Region): boolean {
  return region === 'eu';
}

/**
 * Sprawdza czy region to PL
 */
export function isPlRegion(region: Region): boolean {
  return region === 'pl';
}

/**
 * Zwraca odpowiedni język dla regionu
 */
export function getLanguageForRegion(region: Region): 'en' | 'pl' {
  return region === 'eu' ? 'en' : 'pl';
}

/**
 * Zwraca odpowiednią domenę główną dla regionu
 */
export function getMainDomainForRegion(region: Region): string {
  return region === 'eu' ? 'bookings24.eu' : 'rezerwacja24.pl';
}

/**
 * Zwraca odpowiedni URL aplikacji dla regionu
 */
export function getAppUrlForRegion(region: Region): string {
  return region === 'eu' ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl';
}

/**
 * Zwraca odpowiedni URL API dla regionu
 */
export function getApiUrlForRegion(region: Region): string {
  return region === 'eu' ? 'https://api.bookings24.eu' : 'https://api.rezerwacja24.pl';
}
