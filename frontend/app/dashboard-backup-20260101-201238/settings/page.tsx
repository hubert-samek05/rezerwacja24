'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building,
  Globe,
  Palette,
  CreditCard,
  Shield,
  Clock,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Bell,
  Key,
  Code,
  Plug,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  getCompanyData, 
  updateCompanyData,
  updateBranding,
  getDefaultOpeningHours,
  type CompanyData 
} from '@/lib/company'
import { getCurrentUserId } from '@/lib/storage'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId, getTenantConfig } from '@/lib/tenant'
import CompanyDataTab from '@/components/settings/CompanyDataTab'
import SubdomainTab from '@/components/settings/SubdomainTab'
import PaymentsTab from '@/components/settings/PaymentsTab'
import BrandingTab from '@/components/settings/BrandingTab'
import SubscriptionTab from '@/components/settings/SubscriptionTab'
import NotificationsTab from '@/components/settings/NotificationsTab'
import ApiTab from '@/components/settings/ApiTab'
import WidgetTab from '@/components/settings/WidgetTab'
import IntegrationsTab from '@/components/settings/IntegrationsTab'
import TwoFactorTab from '@/components/settings/TwoFactorTab'
import ConsentTab from '@/components/settings/ConsentTab'

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('company')
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showError, setShowError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Obsługa parametru tab z URL
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])
  
  // Helper do fetch z tenantId i tokenem
  const fetchWithTenant = async (url: string, options: RequestInit = {}) => {
    const config = getTenantConfig()
    const token = localStorage.getItem('token')
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...config.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
  }

  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    setIsPageLoading(true)
    const userId = getCurrentUserId()
    const tenantId = getTenantId()
    const API_URL = getApiUrl()
    
    // Spróbuj załadować z API
    try {
      const [tenantResponse, paymentsResponse] = await Promise.all([
        fetchWithTenant(`${API_URL}/api/tenants/${tenantId}`).catch(() => null),
        fetchWithTenant(`${API_URL}/api/payments/settings`, {
          headers: { 'x-user-id': userId || '' }
        }).catch(() => null)
      ])
      
      if (tenantResponse && tenantResponse.ok) {
        const tenant = await tenantResponse.json()
        
        // Domyślne ustawienia płatności
        let paymentMethods = {
          cash: { enabled: true },
          stripe: { enabled: false },
          przelewy24: { enabled: false },
          payu: { enabled: false }
        }
        
        // Parsuj payments jeśli się udało
        if (paymentsResponse?.ok) {
          try {
            const paymentsData = await paymentsResponse.json()
            paymentMethods = {
              cash: { enabled: paymentsData.acceptCashPayment !== false },
              stripe: { 
                enabled: paymentsData.stripeEnabled || false,
                publicKey: '',
                secretKey: ''
              } as any,
              przelewy24: { 
                enabled: paymentsData.przelewy24Enabled || false,
                merchantId: '',
                crcKey: ''
              } as any,
              payu: { 
                enabled: paymentsData.payuEnabled || false,
                posId: '',
                clientId: '',
                clientSecret: ''
              } as any
            }
          } catch (e) {
            console.log('Failed to parse payment settings:', e)
          }
        }
        
        const data: CompanyData = {
          id: tenant.id,
          userId: tenant.id,
          businessName: tenant.name,
          subdomain: tenant.subdomain,
          subdomainLocked: false,
          email: tenant.email,
          phone: tenant.phone || '',
          address: tenant.address || '',
          city: tenant.city || '',
          postalCode: tenant.postal_code || '',
          nip: tenant.nip || '',
          description: tenant.description || '',
          logo: tenant.logo,
          banner: tenant.banner,
          openingHours: tenant.openingHours || getDefaultOpeningHours(),
          socialMedia: tenant.socialMedia || {},
          paymentMethods,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt
        }
        setCompanyData(data)
        setIsPageLoading(false)
        return
      }
    } catch (e) {
      console.log('Failed to load from API, using localStorage')
    }
    
    // Fallback do localStorage
    const data = getCompanyData()
    setCompanyData(data)
    setIsPageLoading(false)
  }

  const handleSave = async () => {
    if (!companyData) return
    
    setIsLoading(true)
    setShowError('')
    
    try {
      const tenantId = getTenantId()
      console.log('Using tenant ID:', tenantId)
      
      const API_URL = getApiUrl()
      
      // Przygotuj dane do wysłania - tylko niepuste pola
      const updateData: any = {}
      if (companyData.businessName) updateData.name = companyData.businessName
      if (companyData.email) updateData.email = companyData.email
      if (companyData.phone) updateData.phone = companyData.phone
      if (companyData.address) updateData.address = companyData.address
      if (companyData.city) updateData.city = companyData.city
      if (companyData.postalCode) updateData.postal_code = companyData.postalCode
      if (companyData.nip) updateData.nip = companyData.nip
      if (companyData.description) updateData.description = companyData.description
      if (companyData.openingHours) updateData.openingHours = companyData.openingHours
      
      console.log('Saving tenant data:', updateData)
      
      // Zapisz również ustawienia płatności jeśli są
      if (companyData.paymentMethods) {
        try {
          const paymentResponse = await fetchWithTenant(`${API_URL}/api/payments/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData.paymentMethods),
          })
          
          if (!paymentResponse.ok) {
            console.error('Błąd zapisu ustawień płatności')
          }
        } catch (err) {
          console.error('Błąd zapisu płatności:', err)
        }
      }
      
      const response = await fetchWithTenant(`${API_URL}/api/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend error:', errorData)
        throw new Error(errorData.message || 'Nie udało się zapisać danych')
      }
      
      const updatedTenant = await response.json()
      // Mapuj dane z API do formatu CompanyData
      const updatedData = {
        ...companyData,
        businessName: updatedTenant.name,
        email: updatedTenant.email,
        phone: updatedTenant.phone || '',
        address: updatedTenant.address || '',
        city: updatedTenant.city || '',
        postalCode: updatedTenant.postal_code || '',
        nip: updatedTenant.nip || '',
        description: updatedTenant.description || '',
        openingHours: updatedTenant.openingHours || companyData.openingHours,
        updatedAt: updatedTenant.updatedAt,
      }
      setCompanyData(updatedData)
      updateCompanyData(updatedData)
      
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Błąd zapisu:', error)
      setShowError('Nie udało się zapisać danych. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePayments = async () => {
    if (!companyData) return
    
    setIsLoading(true)
    setShowError('')
    
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('Brak ID użytkownika')
      }

      // Przygotuj dane płatności do wysłania
      const paymentSettings = {
        paymentEnabled: companyData.paymentMethods?.cash?.enabled || 
                        companyData.paymentMethods?.stripe?.enabled || 
                        companyData.paymentMethods?.przelewy24?.enabled || 
                        companyData.paymentMethods?.payu?.enabled,
        acceptCashPayment: companyData.paymentMethods?.cash?.enabled !== false,
        acceptOnlinePayment: companyData.paymentMethods?.stripe?.enabled || 
                             companyData.paymentMethods?.przelewy24?.enabled || 
                             companyData.paymentMethods?.payu?.enabled,
        autoConfirmBookings: (companyData as any).autoConfirmBookings !== false,
        przelewy24: companyData.paymentMethods?.przelewy24 ? {
          enabled: companyData.paymentMethods.przelewy24.enabled || false,
          merchantId: companyData.paymentMethods.przelewy24.merchantId,
          posId: (companyData.paymentMethods.przelewy24 as any).posId,
          crcKey: (companyData.paymentMethods.przelewy24 as any).crcKey,
          apiKey: (companyData.paymentMethods.przelewy24 as any).apiKey,
        } : undefined,
        stripe: companyData.paymentMethods?.stripe ? {
          enabled: companyData.paymentMethods.stripe.enabled || false,
          publishableKey: companyData.paymentMethods.stripe.publicKey,
          secretKey: companyData.paymentMethods.stripe.secretKey,
          webhookSecret: (companyData.paymentMethods.stripe as any).webhookSecret,
        } : undefined,
        payu: companyData.paymentMethods?.payu ? {
          enabled: companyData.paymentMethods.payu.enabled || false,
          posId: companyData.paymentMethods.payu.posId,
          secondKey: (companyData.paymentMethods.payu as any).secondKey,
          oAuthClientId: companyData.paymentMethods.payu.clientId,
          oAuthClientSecret: companyData.paymentMethods.payu.clientSecret,
        } : undefined,
      }

      // Wywołaj API płatności
      const API_URL = getApiUrl()
      const response = await fetchWithTenant(`${API_URL}/api/payments/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(paymentSettings),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Nie udało się zapisać ustawień płatności')
      }
      
      // Zapisz również do localStorage
      updateCompanyData(companyData)
      
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error('Błąd zapisu płatności:', error)
      setShowError(`Nie udało się zapisać ustawień płatności: ${error.message || 'Nieznany błąd'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBranding = async () => {
    if (!companyData) return
    
    setIsLoading(true)
    setShowError('')
    
    try {
      const tenantId = getTenantId()
      
      const API_URL = getApiUrl()
      const response = await fetchWithTenant(`${API_URL}/api/tenants/${tenantId}/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo: companyData.logo,
          banner: companyData.banner,
        }),
      })
      
      if (response.ok) {
        await loadCompanyData()
        setShowSaveSuccess(true)
        setTimeout(() => setShowSaveSuccess(false), 3000)
      } else {
        setShowError('Nie udało się zapisać zmian.')
      }
    } catch (error) {
      console.error('Error:', error)
      setShowError('Wystąpił błąd podczas zapisywania.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!companyData) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-accent-neon animate-spin" />
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'company', label: 'Dane firmy', icon: Building },
    { id: 'subdomain', label: 'Subdomena', icon: Globe },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'hours', label: 'Godziny otwarcia', icon: Clock },
    { id: 'payments', label: 'Płatności', icon: CreditCard },
    { id: 'notifications', label: 'SMS i Powiadomienia', icon: Bell },
    { id: 'consent', label: 'Zgody i RODO', icon: FileText },
    { id: 'api', label: 'API', icon: Key },
    { id: 'widget', label: 'Widżet WWW', icon: Code },
    { id: 'integrations', label: 'Integracje', icon: Plug },
    { id: 'subscription', label: 'Subskrypcja', icon: Sparkles },
    { id: 'security', label: 'Bezpieczeństwo', icon: Shield }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ustawienia</h1>
          <p className="text-sm sm:text-base text-neutral-gray">Zarządzaj swoją firmą i konfiguracją systemu</p>
        </div>

        {/* Success/Error Messages */}
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-accent-neon/20 border border-accent-neon rounded-lg flex items-center space-x-3"
          >
            <Check className="w-5 h-5 text-accent-neon" />
            <span className="text-white">Zmiany zostały zapisane pomyślnie!</span>
          </motion.div>
        )}

        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-white">{showError}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mobile Accordion Menu */}
          <div className="lg:hidden">
            <div className="glass-card overflow-hidden">
              {/* Accordion Header - pokazuje aktywną zakładkę */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between p-4 text-white"
              >
                <div className="flex items-center space-x-3">
                  {(() => {
                    const activeTabData = tabs.find(t => t.id === activeTab)
                    const Icon = activeTabData?.icon || Building
                    return (
                      <>
                        <Icon className="w-5 h-5 text-accent-neon" />
                        <span className="font-medium">{activeTabData?.label || 'Dane firmy'}</span>
                      </>
                    )
                  })()}
                </div>
                {mobileMenuOpen ? (
                  <ChevronUp className="w-5 h-5 text-neutral-gray" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-gray" />
                )}
              </button>
              
              {/* Accordion Content - lista zakładek */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
                      {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id)
                              setMobileMenuOpen(false)
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                              activeTab === tab.id 
                                ? 'bg-primary-green/20 text-accent-neon' 
                                : 'text-neutral-gray hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-left">{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Sidebar - bez zmian */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="glass-card p-4 space-y-2 sticky top-20">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-primary-green/20 text-accent-neon' 
                        : 'text-neutral-gray hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass-card p-4 sm:p-6">
              {activeTab === 'company' && (
                <CompanyDataTab
                  companyData={companyData}
                  setCompanyData={setCompanyData}
                  onSave={handleSave}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'subdomain' && (
                <SubdomainTab
                  companyData={companyData}
                  onUpdate={loadCompanyData}
                />
              )}

              {activeTab === 'branding' && (
                <BrandingTab
                  companyData={companyData}
                  setCompanyData={setCompanyData}
                  onSave={handleSaveBranding}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'hours' && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Godziny otwarcia</h2>
                  <p className="text-sm sm:text-base text-neutral-gray mb-6">
                    Ustaw godziny otwarcia swojej firmy
                  </p>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {Object.entries(companyData.openingHours || {}).map(([day, hours]) => {
                      const dayNames: { [key: string]: string } = {
                        monday: 'Poniedziałek',
                        tuesday: 'Wtorek',
                        wednesday: 'Środa',
                        thursday: 'Czwartek',
                        friday: 'Piątek',
                        saturday: 'Sobota',
                        sunday: 'Niedziela'
                      }
                      
                      return (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between sm:w-32">
                            <span className="text-white font-medium text-sm sm:text-base">{dayNames[day]}</span>
                            {/* Checkbox na mobile - w tym samym wierszu co nazwa dnia */}
                            <label className="flex items-center space-x-2 cursor-pointer sm:hidden">
                              <input
                                type="checkbox"
                                checked={hours.closed}
                                onChange={(e) => setCompanyData({
                                  ...companyData,
                                  openingHours: {
                                    ...companyData.openingHours,
                                    [day]: { ...hours, closed: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
                              />
                              <span className="text-xs text-neutral-gray">Zamkn.</span>
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => setCompanyData({
                                ...companyData,
                                openingHours: {
                                  ...companyData.openingHours,
                                  [day]: { ...hours, open: e.target.value }
                                }
                              })}
                              disabled={hours.closed}
                              className="input-glass flex-1 text-sm"
                            />
                            <span className="text-neutral-gray">-</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => setCompanyData({
                                ...companyData,
                                openingHours: {
                                  ...companyData.openingHours,
                                  [day]: { ...hours, close: e.target.value }
                                }
                              })}
                              disabled={hours.closed}
                              className="input-glass flex-1 text-sm"
                            />
                          </div>
                          
                          {/* Checkbox na desktop */}
                          <label className="hidden sm:flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hours.closed}
                              onChange={(e) => setCompanyData({
                                ...companyData,
                                openingHours: {
                                  ...companyData.openingHours,
                                  [day]: { ...hours, closed: e.target.checked }
                                }
                              })}
                              className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
                            />
                            <span className="text-sm text-neutral-gray">Zamknięte</span>
                          </label>
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="btn-neon flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      <span>Zapisz zmiany</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <PaymentsTab
                  companyData={companyData}
                  setCompanyData={setCompanyData}
                  onSave={handleSavePayments}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'subscription' && (
                <SubscriptionTab />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab />
              )}

              {activeTab === 'consent' && (
                <ConsentTab />
              )}

              {activeTab === 'api' && (
                <ApiTab />
              )}

              {activeTab === 'widget' && (
                <WidgetTab />
              )}

              {activeTab === 'integrations' && (
                <IntegrationsTab />
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  {/* 2FA Section */}
                  <TwoFactorTab />

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* SSL Status */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Inne ustawienia bezpieczeństwa</h2>
                    
                    <div className="p-4 bg-accent-neon/10 border border-accent-neon/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-6 h-6 text-accent-neon" />
                        <div>
                          <p className="text-white font-medium">Certyfikat SSL aktywny</p>
                          <p className="text-sm text-neutral-gray">
                            Twoja subdomena jest zabezpieczona certyfikatem SSL
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Zmiana hasła</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          Obecne hasło
                        </label>
                        <input
                          type="password"
                          className="input-glass w-full"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          Nowe hasło
                        </label>
                        <input
                          type="password"
                          className="input-glass w-full"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          Potwierdź nowe hasło
                        </label>
                        <input
                          type="password"
                          className="input-glass w-full"
                          placeholder="••••••••"
                        />
                      </div>

                      <button className="btn-neon flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Zmień hasło</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
