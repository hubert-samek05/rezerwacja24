'use client'

import { useState, useEffect, useMemo } from 'react'
// Common translations
import plCommon from '@/locales/pl/common.json'
import enCommon from '@/locales/en/common.json'
import deCommon from '@/locales/de/common.json'
import frCommon from '@/locales/fr/common.json'
import itCommon from '@/locales/it/common.json'
import nlCommon from '@/locales/nl/common.json'
import esCommon from '@/locales/es/common.json'
import skCommon from '@/locales/sk/common.json'
import hrCommon from '@/locales/hr/common.json'
import csCommon from '@/locales/cs/common.json'
// Landing translations
import plLanding from '@/locales/pl/landing.json'
import enLanding from '@/locales/en/landing.json'
import deLanding from '@/locales/de/landing.json'
import frLanding from '@/locales/fr/landing.json'
import itLanding from '@/locales/it/landing.json'
import esLanding from '@/locales/es/landing.json'
import nlLanding from '@/locales/nl/landing.json'
import skLanding from '@/locales/sk/landing.json'
import hrLanding from '@/locales/hr/landing.json'
import csLanding from '@/locales/cs/landing.json'
// Auth translations
import plAuth from '@/locales/pl/auth.json'
import enAuth from '@/locales/en/auth.json'
import deAuth from '@/locales/de/auth.json'
import frAuth from '@/locales/fr/auth.json'
import itAuth from '@/locales/it/auth.json'
import esAuth from '@/locales/es/auth.json'
import nlAuth from '@/locales/nl/auth.json'
import skAuth from '@/locales/sk/auth.json'
import hrAuth from '@/locales/hr/auth.json'
import csAuth from '@/locales/cs/auth.json'

// All supported locales for EU platform
export type Locale = 'pl' | 'en' | 'de' | 'fr' | 'it' | 'nl' | 'es' | 'sk' | 'hr' | 'cs'

// Supported EU locales (excluding Polish which is for rezerwacja24.pl)
export const EU_LOCALES: Locale[] = ['en', 'de', 'fr', 'it', 'nl', 'es', 'sk', 'hr', 'cs']

// Language names for UI
export const LOCALE_NAMES: Record<Locale, string> = {
  pl: 'Polski',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  nl: 'Nederlands',
  es: 'Español',
  sk: 'Slovenčina',
  hr: 'Hrvatski',
  cs: 'Čeština'
}

// Country to locale mapping for auto-detection
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  'PL': 'pl',
  'GB': 'en', 'US': 'en', 'IE': 'en', 'AU': 'en', 'NZ': 'en',
  'DE': 'de', 'AT': 'de', 'CH': 'de',
  'FR': 'fr', 'BE': 'fr', 'LU': 'fr',
  'IT': 'it',
  'NL': 'nl',
  'ES': 'es',
  'SK': 'sk',
  'HR': 'hr', 'BA': 'hr', 'RS': 'hr', 'ME': 'hr',
  'CZ': 'cs',
  'HU': 'en', // Hungarian - fallback to English for now
  'RO': 'en', // Romanian - fallback to English for now
  'BG': 'en', // Bulgarian - fallback to English for now
  'SI': 'en', // Slovenian - fallback to English for now
  'PT': 'es'  // Portuguese - fallback to Spanish (similar)
}

type CommonTranslations = typeof plCommon
type LandingTranslations = typeof plLanding
type AuthTranslations = typeof plAuth

const commonTranslations: Record<Locale, CommonTranslations> = {
  pl: plCommon,
  en: enCommon,
  de: deCommon,
  fr: frCommon,
  it: itCommon,
  nl: nlCommon,
  es: esCommon,
  sk: skCommon,
  hr: hrCommon,
  cs: csCommon,
}

// Landing translations for all languages
const landingTranslations: Record<Locale, LandingTranslations> = {
  pl: plLanding,
  en: enLanding,
  de: deLanding,
  fr: frLanding,
  it: itLanding,
  nl: nlLanding as unknown as LandingTranslations,
  es: esLanding as unknown as LandingTranslations,
  sk: skLanding as unknown as LandingTranslations,
  hr: hrLanding as unknown as LandingTranslations,
  cs: csLanding as unknown as LandingTranslations,
}

// Auth translations for all languages
const authTranslations: Record<Locale, AuthTranslations> = {
  pl: plAuth,
  en: enAuth,
  de: deAuth,
  fr: frAuth,
  it: itAuth,
  nl: nlAuth,
  es: esAuth,
  sk: skAuth,
  hr: hrAuth,
  cs: csAuth,
}

// Helper to check if a locale is valid
function isValidLocale(locale: string | null): locale is Locale {
  if (!locale) return false
  return ['pl', 'en', 'de', 'fr', 'it', 'nl', 'es', 'sk', 'hr', 'cs'].includes(locale)
}

// Detect locale from browser language
function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en'
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  // Map browser language to our supported locales
  const langMap: Record<string, Locale> = {
    'pl': 'pl',
    'en': 'en',
    'de': 'de',
    'fr': 'fr',
    'it': 'it',
    'nl': 'nl',
    'es': 'es',
    'sk': 'sk',
    'hr': 'hr',
    'cs': 'cs',
    'sr': 'hr', // Serbian -> Croatian (similar)
    'bs': 'hr', // Bosnian -> Croatian (similar)
    'pt': 'es', // Portuguese -> Spanish (similar)
    'ca': 'es', // Catalan -> Spanish
  }
  
  return langMap[langCode] || 'en'
}

// Funkcja do wykrywania domyślnego języka na podstawie domeny i przeglądarki
function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'pl' // Domyślnie polski dla SSR (rezerwacja24.pl)
  
  // Najpierw sprawdź domenę
  const hostname = window.location.hostname
  const isEuDomain = hostname.includes('bookings24.eu')
  
  // Dla rezerwacja24.pl zawsze polski
  if (!isEuDomain) return 'pl'
  
  // Dla bookings24.eu:
  // 1. Sprawdź zapisany wybór użytkownika
  const savedLocale = localStorage.getItem('bookings24_locale')
  if (isValidLocale(savedLocale)) {
    return savedLocale
  }
  
  // 2. Wykryj język z przeglądarki
  const browserLocale = detectBrowserLocale()
  
  // Dla EU domeny, nie używaj polskiego (to jest dla rezerwacja24.pl)
  if (browserLocale === 'pl') return 'en'
  
  return browserLocale
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('pl')
  const [t, setT] = useState<CommonTranslations>(commonTranslations['pl'])
  const [landing, setLanding] = useState<LandingTranslations>(landingTranslations['pl'])
  const [auth, setAuth] = useState<AuthTranslations>(authTranslations['pl'])
  const [isInitialized, setIsInitialized] = useState(false)

  // Funkcja do zmiany języka
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setT(commonTranslations[newLocale])
    setLanding(landingTranslations[newLocale])
    setAuth(authTranslations[newLocale])
    
    // Zapisz w localStorage i emituj event
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookings24_locale', newLocale)
      // Emituj custom event dla innych komponentów w tej samej zakładce
      window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }))
    }
  }

  useEffect(() => {
    // Po zamontowaniu komponentu, wykryj prawidłowy locale
    const detectedLocale = getInitialLocale()
    setLocaleState(detectedLocale)
    setT(commonTranslations[detectedLocale])
    setLanding(landingTranslations[detectedLocale])
    setAuth(authTranslations[detectedLocale])
    setIsInitialized(true)
    
    // Nasłuchuj na zmiany localStorage (dla synchronizacji między zakładkami i komponentami)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookings24_locale' && e.newValue) {
        const newLocale = e.newValue
        if (isValidLocale(newLocale)) {
          setLocaleState(newLocale)
          setT(commonTranslations[newLocale])
          setLanding(landingTranslations[newLocale])
          setAuth(authTranslations[newLocale])
        }
      }
    }
    
    // Nasłuchuj na custom event dla zmian w tej samej zakładce
    const handleLocaleChange = (e: CustomEvent) => {
      const newLocale = e.detail as string
      if (isValidLocale(newLocale)) {
        setLocaleState(newLocale)
        setT(commonTranslations[newLocale])
        setLanding(landingTranslations[newLocale])
        setAuth(authTranslations[newLocale])
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localeChange', handleLocaleChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localeChange', handleLocaleChange as EventListener)
    }
  }, [])

  return { locale, setLocale, t, landing, auth, isInitialized }
}

// Helper do pobierania URL dla danego locale
export function getAppUrl(locale: Locale): string {
  return locale === 'en' 
    ? 'https://app.bookings24.eu' 
    : 'https://app.rezerwacja24.pl'
}

export function getMainUrl(locale: Locale): string {
  return locale === 'en' 
    ? 'https://bookings24.eu' 
    : 'https://rezerwacja24.pl'
}

// Helper do pobierania URL bezpośrednio na podstawie domeny (nie zależy od state)
export function getMainUrlFromDomain(): string {
  if (typeof window === 'undefined') return 'https://rezerwacja24.pl'
  const hostname = window.location.hostname
  return hostname.includes('bookings24.eu') 
    ? 'https://bookings24.eu' 
    : 'https://rezerwacja24.pl'
}

export function getAppUrlFromDomain(): string {
  if (typeof window === 'undefined') return 'https://app.rezerwacja24.pl'
  const hostname = window.location.hostname
  return hostname.includes('bookings24.eu') 
    ? 'https://app.bookings24.eu' 
    : 'https://app.rezerwacja24.pl'
}

// Sprawdź czy jesteśmy na domenie bookings24.eu
export function isBookings24Domain(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.includes('bookings24.eu')
}
