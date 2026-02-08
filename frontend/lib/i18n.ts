import plCommon from '@/locales/pl/common.json'
import enCommon from '@/locales/en/common.json'

export type Locale = 'pl' | 'en'

const translations: Record<Locale, typeof plCommon> = {
  pl: plCommon,
  en: enCommon,
}

// Pobierz locale z cookies (ustawiane przez middleware)
export function getLocaleFromCookies(): Locale {
  if (typeof document === 'undefined') return 'pl'
  
  const cookies = document.cookie.split(';')
  const localeCookie = cookies.find(c => c.trim().startsWith('locale='))
  if (localeCookie) {
    const locale = localeCookie.split('=')[1]?.trim()
    if (locale === 'en' || locale === 'pl') {
      return locale
    }
  }
  return 'pl'
}

// Pobierz locale z hostname (dla SSR)
export function getLocaleFromHostname(hostname: string): Locale {
  if (hostname.includes('bookings24.eu')) {
    return 'en'
  }
  return 'pl'
}

// Pobierz tłumaczenia dla danego locale
export function getTranslations(locale: Locale = 'pl') {
  return translations[locale] || translations.pl
}

// Hook-like function do użycia w komponentach
export function useTranslations(locale?: Locale) {
  const currentLocale = locale || getLocaleFromCookies()
  return {
    t: translations[currentLocale] || translations.pl,
    locale: currentLocale,
  }
}

// Helper do pobierania zagnieżdżonych tłumaczeń
export function t(translations: any, key: string): string {
  const keys = key.split('.')
  let result = translations
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      return key // Zwróć klucz jeśli nie znaleziono
    }
  }
  
  return typeof result === 'string' ? result : key
}

// Domeny i ich języki
export const DOMAIN_LOCALES: Record<string, Locale> = {
  'rezerwacja24.pl': 'pl',
  'bookings24.eu': 'en',
}

// Pobierz bazową domenę dla danego locale
export function getDomainForLocale(locale: Locale): string {
  return locale === 'en' ? 'bookings24.eu' : 'rezerwacja24.pl'
}
