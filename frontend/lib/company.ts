// Zarządzanie danymi firmy

import { getCurrentUserId, getTenantId } from './storage'
import { PageBuilderConfig } from './page-builder'

export interface PageSettings {
  servicesLayout?: 'grid' | 'list'
  showServiceImages?: boolean
  showServicePrices?: boolean
  showServiceDuration?: boolean
  showEmployeeSelection?: boolean
  showOpeningHours?: boolean
  showSocialMedia?: boolean
  showDescription?: boolean
  showAddress?: boolean
  showPhone?: boolean
  showEmail?: boolean
  primaryColor?: string
  accentColor?: string
  heroStyle?: 'banner' | 'minimal' | 'none'
  bookingButtonText?: string
  buttonStyle?: 'rounded' | 'pill' | 'square'
  cardStyle?: 'shadow' | 'border' | 'flat'
  // Page Builder
  pageBuilder?: PageBuilderConfig
}

export interface CompanyData {
  id: string
  userId: string
  businessName: string
  subdomain: string
  subdomainLocked: boolean
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  nip?: string
  description?: string
  logo?: string
  banner?: string
  openingHours?: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
  socialMedia?: {
    facebook?: string
    instagram?: string
    website?: string
  }
  paymentMethods?: {
    stripe?: { enabled: boolean; publicKey?: string; secretKey?: string }
    cash?: { enabled: boolean }
    przelewy24?: { enabled: boolean; merchantId?: string; crcKey?: string }
    payu?: { enabled: boolean; posId?: string; clientId?: string; clientSecret?: string }
  }
  pageSettings?: PageSettings
  gallery?: string[]
  flexibleServiceSettings?: {
    showCouponCode?: boolean
    showPaymentOptions?: boolean
    availabilityHours?: {
      [key: string]: { open: string; close: string; closed: boolean }
    }
  }
  createdAt: string
  updatedAt: string
}

// Pobierz dane firmy
export const getCompanyData = (): CompanyData | null => {
  const userId = getCurrentUserId()
  if (!userId) return null
  
  const key = `company_${userId}`
  const data = localStorage.getItem(key)
  
  if (!data) {
    // Stwórz domyślne dane z sesji
    const session = localStorage.getItem('rezerwacja24_session')
    if (session) {
      const sessionData = JSON.parse(session)
      const defaultData: CompanyData = {
        id: userId, // UŻYJ userId jako id (to jest tenantId)
        userId,
        businessName: sessionData.businessName || 'Moja Firma',
        subdomain: generateSubdomain(sessionData.businessName || 'moja-firma'),
        subdomainLocked: false,
        email: sessionData.email || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        description: '',
        openingHours: getDefaultOpeningHours(),
        socialMedia: {},
        paymentMethods: {
          cash: { enabled: true },
          stripe: { enabled: false },
          przelewy24: { enabled: false },
          payu: { enabled: false }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      saveCompanyData(defaultData)
      return defaultData
    }
    return null
  }
  
  return JSON.parse(data)
}

// Zapisz dane firmy
export const saveCompanyData = (data: CompanyData): void => {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('saveCompanyData: No userId found!')
    return
  }
  
  data.updatedAt = new Date().toISOString()
  
  const key = `company_${userId}`
  localStorage.setItem(key, JSON.stringify(data))
  console.log('✅ Company data saved to localStorage:', key, { logo: !!data.logo, banner: !!data.banner })
}

// Aktualizuj dane firmy
export const updateCompanyData = (updates: Partial<CompanyData>): CompanyData | null => {
  const current = getCompanyData()
  if (!current) return null
  
  const updated = { ...current, ...updates }
  saveCompanyData(updated)
  
  return updated
}

// Aktualizuj branding (logo/banner) w bazie danych
export const updateBranding = async (data: { logo?: string; banner?: string }): Promise<boolean> => {
  console.log('🎨 updateBranding called with:', { logo: !!data.logo, banner: !!data.banner })
  
  // ZAWSZE zapisz do localStorage
  const current = getCompanyData()
  if (!current) {
    console.error('updateBranding: No company data found!')
    return false
  }
  
  console.log('Current company data:', { id: current.id, userId: current.userId })
  updateCompanyData({ logo: data.logo, banner: data.banner })
  
  // Spróbuj zapisać do backendu (jeśli tenant istnieje)
  try {
    const tenantId = getTenantId()
    if (!tenantId) {
      console.log('No tenantId - saving only to localStorage')
      return true // Sukces bo zapisaliśmy do localStorage
    }
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
    const response = await fetch(`${API_URL}/api/tenants/${tenantId}/branding`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      console.log('Branding saved to database')
      return true
    } else {
      console.log('Failed to save to database, but saved to localStorage')
      return true // Sukces bo mamy w localStorage
    }
  } catch (error) {
    console.error('Error updating branding in database:', error)
    return true // Sukces bo mamy w localStorage
  }
}

// Generuj subdomenę z nazwy firmy
export const generateSubdomain = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30)
}

// Sprawdź czy subdomena jest dostępna
export const isSubdomainAvailable = (subdomain: string): boolean => {
  // W prawdziwej aplikacji sprawdzilibyśmy w bazie danych
  // Na razie zakładamy że wszystkie są dostępne
  const reserved = ['www', 'app', 'api', 'admin', 'dashboard', 'login', 'register']
  return !reserved.includes(subdomain.toLowerCase())
}

// Zablokuj subdomenę (można zmienić tylko raz)
export const lockSubdomain = (): void => {
  const company = getCompanyData()
  if (!company) return
  
  company.subdomainLocked = true
  saveCompanyData(company)
}

// Domyślne godziny otwarcia
export const getDefaultOpeningHours = () => ({
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '14:00', closed: false },
  sunday: { open: '10:00', close: '14:00', closed: true }
})

// Upload logo/banner (symulacja)
export const uploadImage = async (file: File, type: 'logo' | 'banner'): Promise<string> => {
  // W prawdziwej aplikacji wysłalibyśmy do API
  // Na razie konwertujemy do base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Generuj stronę landing page dla subdomeny
export const generateLandingPage = async (subdomain: string): Promise<void> => {
  const company = getCompanyData()
  if (!company) return
  
  // Zapisz informację że strona została wygenerowana
  company.subdomain = subdomain
  saveCompanyData(company)
  
  // Pobierz usługi i pracowników z localStorage
  const userId = getCurrentUserId()
  let services = []
  let employees = []
  
  if (userId) {
    try {
      const servicesData = localStorage.getItem(`services_${userId}`)
      if (servicesData) {
        services = JSON.parse(servicesData).map((s: any) => ({ ...s, userId }))
      }
      
      const employeesData = localStorage.getItem(`employees_${userId}`)
      if (employeesData) {
        employees = JSON.parse(employeesData).map((e: any) => ({ ...e, userId }))
      }
    } catch (e) {
      console.error('Error reading localStorage:', e)
    }
  }
  
  // Zapisz wszystko do publicznego pliku JSON
  try {
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...company,
        userId,
        services,
        employees
      })
    })
    console.log(`Strona wygenerowana dla ${subdomain}.rezerwacja24.pl`)
  } catch (error) {
    console.error('Error saving company to API:', error)
  }
}

// Synchronizuj usługi i pracowników do API (wywołaj po każdej zmianie)
export const syncCompanyData = async (): Promise<void> => {
  const company = getCompanyData()
  if (!company || !company.subdomain) return
  
  const userId = getCurrentUserId()
  if (!userId) return
  
  let services = []
  let employees = []
  
  try {
    const servicesData = localStorage.getItem(`services_${userId}`)
    if (servicesData) {
      services = JSON.parse(servicesData).map((s: any) => ({ ...s, userId }))
    }
    
    const employeesData = localStorage.getItem(`employees_${userId}`)
    if (employeesData) {
      employees = JSON.parse(employeesData).map((e: any) => ({ ...e, userId }))
    }
    
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...company,
        userId,
        services,
        employees
      })
    })
    
    console.log('Company data synchronized')
  } catch (error) {
    console.error('Error syncing company data:', error)
  }
}

// Pobierz dane firmy po subdomenie (dla strony publicznej) - ASYNC
export const getCompanyBySubdomain = async (subdomain: string): Promise<CompanyData | null> => {
  try {
    // Najpierw spróbuj z API
    const response = await fetch(`/api/companies?subdomain=${subdomain}`)
    
    if (response.ok) {
      const company = await response.json()
      console.log('Found company from API:', company)
      return company
    }
  } catch (error) {
    console.error('Error fetching from API:', error)
  }
  
  // Fallback do localStorage (dla kompatybilności)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      
      if (key && key.startsWith('company_')) {
        const companyData = localStorage.getItem(key)
        
        if (companyData) {
          try {
            const company = JSON.parse(companyData)
            if (company.subdomain === subdomain) {
              console.log('Found company from localStorage:', company)
              return company
            }
          } catch (e) {
            console.error('Error parsing company data:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error)
  }
  
  return null
}
// Test
