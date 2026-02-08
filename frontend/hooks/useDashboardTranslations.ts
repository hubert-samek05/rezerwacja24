'use client'

import { useState, useEffect } from 'react'
import { useLocale, Locale, isBookings24Domain } from './useLocale'

// Import dashboard translations
import plDashboard from '@/locales/pl/dashboard.json'
import enDashboard from '@/locales/en/dashboard.json'

type DashboardTranslations = typeof enDashboard

// For languages without full dashboard translations, use English as fallback
const dashboardTranslations: Record<Locale, DashboardTranslations> = {
  pl: plDashboard as unknown as DashboardTranslations,
  en: enDashboard,
  de: enDashboard,
  fr: enDashboard,
  it: enDashboard,
  nl: enDashboard,
  es: enDashboard,
  sk: enDashboard,
  hr: enDashboard,
  cs: enDashboard,
}

export function useDashboardTranslations() {
  const { locale, isInitialized } = useLocale()
  // Default to Polish for rezerwacja24.pl
  const [d, setD] = useState<DashboardTranslations>(plDashboard as unknown as DashboardTranslations)
  const [isB2B, setIsB2B] = useState(false)

  useEffect(() => {
    const isEU = isBookings24Domain()
    setIsB2B(isEU)
    
    if (isInitialized) {
      // For bookings24.eu use selected language, for rezerwacja24.pl always Polish
      if (isEU) {
        setD((dashboardTranslations[locale] || enDashboard) as unknown as DashboardTranslations)
      } else {
        setD(plDashboard as unknown as DashboardTranslations)
      }
    }
  }, [locale, isInitialized])

  // Helper function to get currency symbol based on platform
  const getCurrencySymbol = (): string => {
    return isB2B ? '€' : 'zł'
  }

  // Helper to format price with currency
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isB2B) {
      return `€${numPrice.toFixed(2)}`
    }
    return `${numPrice.toFixed(2)} zł`
  }

  // Helper to format price per month
  const formatPricePerMonth = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isB2B) {
      return `€${numPrice.toFixed(2)}/mo`
    }
    return `${numPrice.toFixed(2)} zł/mies.`
  }

  return { 
    d, 
    locale, 
    isInitialized,
    isB2B,
    getCurrencySymbol,
    formatPrice,
    formatPricePerMonth
  }
}

// Export type for use in components
export type { DashboardTranslations }
