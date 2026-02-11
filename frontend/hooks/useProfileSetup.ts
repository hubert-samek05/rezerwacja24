'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTenantConfig } from '@/lib/tenant'

export interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  href: string
  priority: number
}

export interface ProfileSetupState {
  steps: SetupStep[]
  completedCount: number
  totalCount: number
  percentage: number
  isComplete: boolean
  showWizard: boolean
  currentStep: number
}

const SETUP_STORAGE_KEY = 'rezerwacja24_profile_setup'
const WIZARD_DISMISSED_KEY = 'rezerwacja24_wizard_dismissed'

// Domyślne kroki konfiguracji
const DEFAULT_STEPS: Omit<SetupStep, 'completed'>[] = [
  {
    id: 'company_data',
    title: 'Uzupełnij dane firmy',
    description: 'Nazwa, adres, telefon i email kontaktowy',
    href: '/dashboard/settings?tab=company',
    priority: 1,
  },
  {
    id: 'services',
    title: 'Dodaj usługi',
    description: 'Zdefiniuj usługi które oferujesz klientom',
    href: '/dashboard/services',
    priority: 2,
  },
  {
    id: 'employees',
    title: 'Dodaj pracowników',
    description: 'Dodaj siebie lub zespół który wykonuje usługi',
    href: '/dashboard/employees',
    priority: 3,
  },
  {
    id: 'working_hours',
    title: 'Ustaw godziny pracy',
    description: 'Określ kiedy firma przyjmuje rezerwacje',
    href: '/dashboard/settings?tab=company',
    priority: 4,
  },
  {
    id: 'branding',
    title: 'Dodaj logo firmy',
    description: 'Spersonalizuj wygląd strony rezerwacji',
    href: '/dashboard/settings?tab=branding',
    priority: 5,
  },
]

// Automatyczne wykrywanie API URL
const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001'
  const hostname = window.location.hostname
  if (hostname.includes('bookings24.eu')) return 'https://api.bookings24.eu'
  if (hostname.includes('rezerwacja24.pl')) return 'https://api.rezerwacja24.pl'
  return 'http://localhost:3001'
}

/**
 * Hook do zarządzania postępem konfiguracji profilu firmy
 * Pokazuje wizard TYLKO dla nowych kont (ustawianych przy rejestracji)
 */
export function useProfileSetup() {
  const [state, setState] = useState<ProfileSetupState>({
    steps: [],
    completedCount: 0,
    totalCount: DEFAULT_STEPS.length,
    percentage: 0,
    isComplete: false,
    showWizard: false,
    currentStep: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Sprawdź status kroków na podstawie danych z API
  const checkStepsCompletion = useCallback(async () => {
    try {
      const session = localStorage.getItem('rezerwacja24_session')
      if (!session) return null

      const sessionData = JSON.parse(session)
      const userId = sessionData.id || sessionData.tenantId

      const API_URL = getApiUrl()
      const config = getTenantConfig()

      // Pobierz dane z API
      let services: any[] = []
      let employees: any[] = []
      
      try {
        const [servicesRes, employeesRes] = await Promise.all([
          fetch(`${API_URL}/api/services`, config),
          fetch(`${API_URL}/api/employees`, config)
        ])
        
        if (servicesRes.ok) services = await servicesRes.json()
        if (employeesRes.ok) employees = await employeesRes.json()
      } catch (e) {
        console.log('Could not fetch from API, checking localStorage')
      }

      // Fallback do localStorage
      if (services.length === 0) {
        const servicesData = localStorage.getItem(`services_${userId}`)
        if (servicesData) services = JSON.parse(servicesData)
      }
      if (employees.length === 0) {
        const employeesData = localStorage.getItem(`employees_${userId}`)
        if (employeesData) employees = JSON.parse(employeesData)
      }

      // Pobierz dane firmy z localStorage
      const companyData = localStorage.getItem(`company_${userId}`)
      const company = companyData ? JSON.parse(companyData) : null

      // Sprawdź każdy krok - bardziej liberalne warunki
      // Uznajemy krok za ukończony jeśli są JAKIEKOLWIEK dane
      const completedSteps: Record<string, boolean> = {
        // Dane firmy - wystarczy nazwa firmy
        company_data: !!(company?.businessName),
        // Usługi - wystarczy jedna usługa
        services: services.length > 0,
        // Pracownicy - wystarczy jeden pracownik
        employees: employees.length > 0,
        // Godziny pracy - zawsze uznajemy za ukończone (domyślne są ustawiane)
        working_hours: true,
        // Branding - opcjonalne, zawsze uznajemy za ukończone
        branding: true,
      }

      console.log('🔍 Profile Setup Check:', {
        userId,
        services: services.length,
        employees: employees.length,
        company: company ? { name: company.businessName, phone: company.phone, address: company.address } : null,
        completedSteps,
        wizardDismissed: localStorage.getItem(WIZARD_DISMISSED_KEY)
      })

      // Zapisz do localStorage
      localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(completedSteps))

      return completedSteps
    } catch (error) {
      console.error('Error checking setup completion:', error)
      return null
    }
  }, [])

  // Załaduj stan
  const loadState = useCallback(async () => {
    setIsLoading(true)
    try {
      const completedSteps = await checkStepsCompletion()
      const wizardDismissed = localStorage.getItem(WIZARD_DISMISSED_KEY) === 'true'

      // Jeśli completedSteps jest null - brak sesji, nie pokazuj wizarda
      if (completedSteps === null) {
        setState(prev => ({ ...prev, showWizard: false, isComplete: true }))
        setIsLoading(false)
        return
      }

      const steps: SetupStep[] = DEFAULT_STEPS.map(step => ({
        ...step,
        completed: completedSteps?.[step.id] || false,
      }))

      const completedCount = steps.filter(s => s.completed).length
      const percentage = Math.round((completedCount / steps.length) * 100)
      const isComplete = completedCount === steps.length

      // Znajdź pierwszy nieukończony krok
      const firstIncompleteIndex = steps.findIndex(s => !s.completed)
      const currentStep = firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex

      // Pokaż wizard jeśli nie jest ukończony i nie został zamknięty
      const showWizard = !isComplete && !wizardDismissed

      setState({
        steps,
        completedCount,
        totalCount: steps.length,
        percentage,
        isComplete,
        showWizard,
        currentStep,
      })
    } catch (error) {
      console.error('Error loading setup state:', error)
    } finally {
      setIsLoading(false)
    }
  }, [checkStepsCompletion])

  // Oznacz krok jako ukończony
  const markStepComplete = useCallback((stepId: string) => {
    try {
      const saved = localStorage.getItem(SETUP_STORAGE_KEY)
      const completedSteps = saved ? JSON.parse(saved) : {}
      completedSteps[stepId] = true
      localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(completedSteps))
      loadState()
    } catch (error) {
      console.error('Error marking step complete:', error)
    }
  }, [loadState])

  // Zamknij wizard (nie pokazuj więcej)
  const dismissWizard = useCallback(() => {
    localStorage.setItem(WIZARD_DISMISSED_KEY, 'true')
    setState(prev => ({ ...prev, showWizard: false }))
  }, [])

  // Resetuj wizard (pokaż ponownie)
  const resetWizard = useCallback(() => {
    localStorage.removeItem(WIZARD_DISMISSED_KEY)
    loadState()
  }, [loadState])

  // Odśwież stan
  const refresh = useCallback(() => {
    loadState()
  }, [loadState])

  // Załaduj przy montowaniu
  useEffect(() => {
    loadState()
  }, [loadState])

  return {
    ...state,
    isLoading,
    markStepComplete,
    dismissWizard,
    resetWizard,
    refresh,
  }
}

export default useProfileSetup
