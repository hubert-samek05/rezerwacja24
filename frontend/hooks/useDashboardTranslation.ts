'use client'

import { useState, useEffect, useCallback } from 'react'

// Import translations
import enDashboard from '@/locales/en/dashboard.json'
import deDashboard from '@/locales/de/dashboard.json'
import plDashboard from '@/locales/pl/dashboard.json'
import frDashboard from '@/locales/fr/dashboard.json'
import itDashboard from '@/locales/it/dashboard.json'
import esDashboard from '@/locales/es/dashboard.json'
import nlDashboard from '@/locales/nl/dashboard.json'
import skDashboard from '@/locales/sk/dashboard.json'
import hrDashboard from '@/locales/hr/dashboard.json'
import csDashboard from '@/locales/cs/dashboard.json'

// All EU languages supported
export type Language = 'pl' | 'en' | 'de' | 'fr' | 'it' | 'es' | 'nl' | 'cs' | 'sk' | 'hr'
export type Region = 'pl' | 'eu'

// Deep merge function to fill missing translations with English fallback
function deepMerge(target: any, source: any): any {
  const result = { ...source }
  for (const key in target) {
    if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key] || {})
    } else if (target[key] !== undefined) {
      result[key] = target[key]
    }
  }
  return result
}

// Translations with fallback to English for missing keys
const translations: Record<Language, typeof enDashboard> = {
  en: enDashboard,
  de: deepMerge(deDashboard, enDashboard),
  pl: deepMerge(plDashboard, enDashboard),
  fr: deepMerge(frDashboard, enDashboard),
  it: deepMerge(itDashboard, enDashboard),
  es: deepMerge(esDashboard, enDashboard),
  nl: deepMerge(nlDashboard, enDashboard),
  cs: deepMerge(csDashboard, enDashboard),
  sk: deepMerge(skDashboard, enDashboard),
  hr: deepMerge(hrDashboard, enDashboard),
}

// Klucz do przechowywania języka w localStorage (ten sam co w useLocale)
const LANGUAGE_STORAGE_KEY = 'bookings24_locale'

/**
 * Wykryj region na podstawie domeny
 */
function detectRegion(): Region {
  if (typeof window === 'undefined') return 'eu'
  const hostname = window.location.hostname
  return hostname.includes('bookings24.eu') ? 'eu' : 'pl'
}

// Valid EU languages
const EU_LANGUAGES: Language[] = ['en', 'de', 'fr', 'it', 'es', 'nl', 'cs', 'sk', 'hr']

/**
 * Pobierz język z localStorage lub domyślny dla regionu
 */
function getLanguage(region: Region): Language {
  if (typeof window === 'undefined') return 'en'
  
  // Dla regionu PL zawsze polski
  if (region === 'pl') return 'pl'
  
  // Dla regionu EU sprawdź localStorage
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
  if (savedLanguage && EU_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage
  }
  
  return 'en'
}

/**
 * Hook do zarządzania tłumaczeniami w dashboardzie
 * 
 * - Dla rezerwacja24.pl: zawsze polski
 * - Dla bookings24.eu: angielski lub niemiecki (wybór użytkownika)
 */
export function useDashboardTranslation() {
  const [language, setLanguageState] = useState<Language>('en')
  const [region, setRegion] = useState<Region>('eu')
  const [isClient, setIsClient] = useState(false)

  // Inicjalizacja po stronie klienta
  useEffect(() => {
    const detectedRegion = detectRegion()
    const detectedLanguage = getLanguage(detectedRegion)
    setRegion(detectedRegion)
    setLanguageState(detectedLanguage)
    setIsClient(true)
    
    // Nasłuchuj zmian w localStorage (gdy użytkownik zmieni język w innym komponencie)
    const handleStorageChange = () => {
      const newLanguage = getLanguage(detectedRegion)
      setLanguageState(newLanguage)
    }
    
    // Nasłuchuj na custom event dla zmian w tej samej zakładce
    const handleLocaleChange = (e: CustomEvent) => {
      const newLocale = e.detail as Language
      if (detectedRegion === 'eu' && EU_LANGUAGES.includes(newLocale)) {
        setLanguageState(newLocale)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localeChange', handleLocaleChange as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localeChange', handleLocaleChange as EventListener)
    }
  }, [])

  // Funkcja do zmiany języka (tylko dla regionu EU)
  const setLanguage = useCallback((newLanguage: Language) => {
    if (region === 'eu' && EU_LANGUAGES.includes(newLanguage)) {
      setLanguageState(newLanguage)
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
      // Emituj event dla innych komponentów
      window.dispatchEvent(new CustomEvent('localeChange', { detail: newLanguage }))
    }
  }, [region])

  // Pobierz tłumaczenia
  const t = translations[language] || translations.pl

  // Funkcja pomocnicza do pobierania zagnieżdżonych tłumaczeń
  const translate = useCallback((key: string, fallback?: string): string => {
    const keys = key.split('.')
    let value: any = t
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }
    
    return typeof value === 'string' ? value : fallback || key
  }, [t])

  return {
    t,
    translate,
    language,
    setLanguage,
    region,
    isClient,
    isEuRegion: region === 'eu',
    isPlRegion: region === 'pl',
    availableLanguages: region === 'eu' ? EU_LANGUAGES : ['pl'] as Language[],
  }
}

/**
 * Hook do pobierania tylko regionu (bez tłumaczeń)
 */
export function useRegion() {
  const [region, setRegion] = useState<Region>('pl')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setRegion(detectRegion())
    setIsClient(true)
  }, [])

  return {
    region,
    isClient,
    isEuRegion: region === 'eu',
    isPlRegion: region === 'pl',
  }
}

export default useDashboardTranslation
