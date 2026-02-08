'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, AlertCircle, Loader2, ChevronRight, Building2, Globe, Palette, Clock, CreditCard, Bell, Shield, Key, Code, Link2, FileText, Receipt, AlertTriangle, Upload, Users } from 'lucide-react'
import { 
  getCompanyData, 
  updateCompanyData,
  getDefaultOpeningHours,
  type CompanyData 
} from '@/lib/company'
import { getCurrentUserId } from '@/lib/storage'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId, getTenantConfig } from '@/lib/tenant'
import { useAccountStatus } from '@/hooks/useAccountStatus'

// Komponenty zakładek
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
import BillingDataTab from '@/components/settings/BillingDataTab'
import ConsentTab from '@/components/settings/ConsentTab'
import ImportDataTab from '@/components/settings/ImportDataTab'
import GalleryTab from '@/components/settings/GalleryTab'
import FlexibleServicesTab from '@/components/settings/FlexibleServicesTab'
import AccountTypesTab from '@/components/settings/AccountTypesTab'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

export default function SettingsPage() {
  const { t, language } = useDashboardTranslation()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showError, setShowError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const { isSuspended, suspendedReason } = useAccountStatus()
  
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) setActiveTab(tabParam)
  }, [searchParams])
  
  const fetchWithTenant = async (url: string, options: RequestInit = {}) => {
    const config = getTenantConfig()
    const token = localStorage.getItem('token')
    
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
    
    return fetch(url, {
      ...options,
      headers,
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
    
    try {
      const [tenantResponse, paymentsResponse] = await Promise.all([
        fetchWithTenant(`${API_URL}/api/tenants/${tenantId}`).catch(() => null),
        fetchWithTenant(`${API_URL}/api/payments/settings`, {
          headers: { 'x-user-id': userId || '' }
        }).catch(() => null)
      ])
      
      if (tenantResponse && tenantResponse.ok) {
        const tenant = await tenantResponse.json()
        
        let paymentMethods = {
          cash: { enabled: true },
          stripe: { enabled: false },
          przelewy24: { enabled: false },
          payu: { enabled: false }
        }
        
        if (paymentsResponse?.ok) {
          try {
            const paymentsData = await paymentsResponse.json()
            paymentMethods = {
              cash: { enabled: paymentsData.acceptCashPayment !== false },
              stripe: { enabled: paymentsData.stripeEnabled || false } as any,
              przelewy24: { 
                enabled: paymentsData.przelewy24Enabled || false,
                merchantId: paymentsData.przelewy24MerchantId || '',
                posId: paymentsData.przelewy24PosId || '',
                crcKey: paymentsData.przelewy24CrcKey || '',
                apiKey: paymentsData.przelewy24ApiKey || ''
              } as any,
              payu: { enabled: paymentsData.payuEnabled || false } as any
            }
          } catch (e) {}
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
          logo: tenant.logo || '',
          banner: tenant.banner || '',
          openingHours: tenant.openingHours || getDefaultOpeningHours(),
          socialMedia: tenant.socialMedia || undefined,
          paymentMethods,
          pageSettings: tenant.pageSettings || undefined,
          gallery: tenant.gallery || [],
          flexibleServiceSettings: tenant.flexibleServiceSettings || undefined,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
        }
        setCompanyData(data)
        updateCompanyData(data)
      } else {
        const localData = getCompanyData()
        if (localData) setCompanyData(localData)
      }
    } catch (error) {
      const localData = getCompanyData()
      if (localData) setCompanyData(localData)
    } finally {
      setIsPageLoading(false)
    }
  }

  const handleSave = async () => {
    if (!companyData) return
    setIsLoading(true)
    setShowError('')
    
    try {
      const tenantId = getTenantId()
      const API_URL = getApiUrl()
      
      const updateData = {
        name: companyData.businessName,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        city: companyData.city,
        postal_code: companyData.postalCode,
        nip: companyData.nip,
        description: companyData.description,
        openingHours: companyData.openingHours,
      }
      
      const response = await fetchWithTenant(`${API_URL}/api/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) throw new Error('Nie udało się zapisać danych')
      
      const updatedTenant = await response.json()
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
      }
      setCompanyData(updatedData)
      updateCompanyData(updatedData)
      
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error) {
      setShowError('Nie udało się zapisać danych.')
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
      if (!userId) throw new Error('Brak ID użytkownika')

      const p24 = companyData.paymentMethods?.przelewy24 as any
      const paymentSettings = {
        paymentEnabled: true,
        acceptCashPayment: companyData.paymentMethods?.cash?.enabled !== false,
        acceptOnlinePayment: companyData.paymentMethods?.stripe?.enabled || p24?.enabled,
        // Przelewy24
        przelewy24: {
          enabled: p24?.enabled || false,
          merchantId: p24?.merchantId || '',
          posId: p24?.posId || '',
          crcKey: p24?.crcKey && !p24.crcKey.includes('•') ? p24.crcKey : undefined,
          apiKey: p24?.apiKey && !p24.apiKey.includes('•') ? p24.apiKey : undefined,
        },
        // Stripe
        stripe: {
          enabled: companyData.paymentMethods?.stripe?.enabled || false,
        },
        // Gotówka
        cash: {
          enabled: companyData.paymentMethods?.cash?.enabled !== false,
        },
      }

      const API_URL = getApiUrl()
      const response = await fetchWithTenant(`${API_URL}/api/payments/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(paymentSettings),
      })
      
      if (!response.ok) throw new Error('Błąd zapisu')
      
      updateCompanyData(companyData)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error: any) {
      setShowError(`Błąd: ${error.message}`)
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
      
      // Zapisz logo i banner
      const brandingResponse = await fetchWithTenant(`${API_URL}/api/tenants/${tenantId}/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: companyData.logo, banner: companyData.banner }),
      })
      
      // Zapisz socialMedia, pageSettings i gallery przez jeden PATCH
      const settingsResponse = await fetchWithTenant(`${API_URL}/api/tenants/${tenantId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          socialMedia: companyData.socialMedia || {},
          pageSettings: companyData.pageSettings || {},
          gallery: companyData.gallery || []
        }),
      })
      
      if (!settingsResponse.ok) {
        console.error('Błąd zapisu ustawień')
      }
      
      if (brandingResponse.ok && settingsResponse.ok) {
        await loadCompanyData()
        setShowSaveSuccess(true)
        setTimeout(() => setShowSaveSuccess(false), 3000)
      } else {
        setShowError('Nie udało się zapisać.')
      }
    } catch (error) {
      setShowError('Wystąpił błąd.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!companyData) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[var(--text-primary)] animate-spin" />
      </div>
    )
  }

  // Kategorie ustawień z kartami
  const settingsCategories = [
    {
      title: 'Firma',
      items: [
        { id: 'company', icon: Building2, label: 'Dane firmy', desc: 'Nazwa, adres, kontakt' },
        { id: 'subdomain', icon: Globe, label: 'Subdomena', desc: 'Adres strony rezerwacji' },
        { id: 'branding', icon: Palette, label: 'Wygląd i funkcje strony', desc: 'Personalizuj swoją stronę rezerwacji' },
        { id: 'gallery', icon: Upload, label: 'Galeria zdjęć', desc: 'Zdjęcia firmy i usług' },
        { id: 'hours', icon: Clock, label: 'Godziny otwarcia', desc: 'Dni i godziny pracy' },
        { id: 'flexible-services', icon: Clock, label: 'Usługi na godziny/dni', desc: 'Ustawienia rezerwacji elastycznych' },
      ]
    },
    {
      title: 'Płatności i rozliczenia',
      items: [
        { id: 'payments', icon: CreditCard, label: 'Metody płatności', desc: 'Gotówka, karty, przelewy' },
        { id: 'subscription', icon: Receipt, label: 'Subskrypcja', desc: 'Plan i fakturowanie' },
        { id: 'billing-data', icon: FileText, label: 'Dane do faktury', desc: 'NIP, adres rozliczeniowy' },
      ]
    },
    {
      title: 'Komunikacja',
      items: [
        { id: 'notifications', icon: Bell, label: 'Powiadomienia SMS', desc: 'Przypomnienia dla klientów' },
        { id: 'consent', icon: Shield, label: 'Zgody RODO', desc: 'Polityka prywatności' },
      ]
    },
    {
      title: 'Integracje i API',
      items: [
        { id: 'api', icon: Key, label: 'Klucze API', desc: 'Dostęp programistyczny' },
        { id: 'widget', icon: Code, label: 'Widżet WWW', desc: 'Osadzenie na stronie' },
        { id: 'integrations', icon: Link2, label: 'Integracje', desc: 'Kalendarz Google, iCal' },
      ]
    },
    {
      title: 'Zespół',
      items: [
        { id: 'account-types', icon: Users, label: 'Typy kont oraz użytkownicy', desc: 'Role, uprawnienia i zarządzanie użytkownikami' },
      ]
    },
    {
      title: 'Bezpieczeństwo',
      items: [
        { id: 'security', icon: Shield, label: 'Hasło i 2FA', desc: 'Zabezpieczenia konta' },
      ]
    },
    {
      title: 'Dane',
      items: [
        { id: 'import', icon: Upload, label: 'Import z Booksy', desc: 'Przenieś klientów z pliku CSV' },
      ]
    }
  ]

  const dayNames: { [key: string]: string } = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela'
  }

  // Widok szczegółowy zakładki
  if (activeTab) {
    return (
      <div className="p-6 lg:p-8">
        {/* Back button */}
        <button 
          onClick={() => setActiveTab(null)}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Powrót do ustawień</span>
        </button>

        {/* Alerts */}
        {showSaveSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span>Zapisano pomyślnie</span>
          </div>
        )}
        {showError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{showError}</span>
          </div>
        )}

        {/* Content */}
        <div>
          {activeTab === 'company' && (
            <CompanyDataTab companyData={companyData} setCompanyData={setCompanyData} onSave={handleSave} isLoading={isLoading} />
          )}

          {activeTab === 'subdomain' && (
            <SubdomainTab companyData={companyData} onUpdate={loadCompanyData} />
          )}

          {activeTab === 'branding' && (
            <BrandingTab companyData={companyData} setCompanyData={setCompanyData} onSave={handleSaveBranding} isLoading={isLoading} />
          )}

          {activeTab === 'gallery' && (
            <GalleryTab companyData={companyData} setCompanyData={setCompanyData} onSave={handleSaveBranding} isLoading={isLoading} />
          )}

          {activeTab === 'hours' && (
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Godziny otwarcia</h2>
                <p className="text-[var(--text-muted)] mt-1">Ustaw godziny pracy Twojej firmy</p>
              </div>
              
              <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">Harmonogram tygodniowy</h3>
                    <p className="text-sm text-[var(--text-muted)]">Określ godziny dla każdego dnia</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(companyData.openingHours || {}).map(([day, hours]) => (
                    <div key={day} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                      <div className="w-full lg:w-36 font-medium text-[var(--text-primary)]">{dayNames[day]}</div>
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setCompanyData({
                            ...companyData,
                            openingHours: { ...companyData.openingHours, [day]: { ...hours, open: e.target.value } }
                          })}
                          disabled={hours.closed}
                          className="flex-1 lg:flex-none px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all"
                        />
                        <span className="text-[var(--text-muted)] text-sm">do</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setCompanyData({
                            ...companyData,
                            openingHours: { ...companyData.openingHours, [day]: { ...hours, close: e.target.value } }
                          })}
                          disabled={hours.closed}
                          className="flex-1 lg:flex-none px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => setCompanyData({
                          ...companyData,
                          openingHours: { ...companyData.openingHours, [day]: { ...hours, closed: !hours.closed } }
                        })}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          hours.closed 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {hours.closed ? 'Zamknięte' : 'Otwarte'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={isLoading} 
                  className="px-8 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-sm"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'flexible-services' && (
            <FlexibleServicesTab companyData={companyData} setCompanyData={setCompanyData} onSave={handleSave} isLoading={isLoading} />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab companyData={companyData} setCompanyData={setCompanyData} onSave={handleSavePayments} isLoading={isLoading} />
          )}

          {activeTab === 'subscription' && <SubscriptionTab />}
          {activeTab === 'billing-data' && <BillingDataTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'consent' && <ConsentTab />}
          {activeTab === 'api' && <ApiTab />}
          {activeTab === 'widget' && <WidgetTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'import' && <ImportDataTab />}
          {activeTab === 'account-types' && (
            <div className="p-6 lg:p-8">
              <AccountTypesTab />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Bezpieczeństwo</h2>
                <p className="text-[var(--text-muted)] mt-1">Zarządzaj zabezpieczeniami konta</p>
              </div>
              
              <div className="space-y-8">
                {/* Sekcja 2FA */}
                <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Weryfikacja dwuetapowa (2FA)</h3>
                      <p className="text-sm text-[var(--text-muted)]">Dodatkowa warstwa bezpieczeństwa</p>
                    </div>
                  </div>
                  <TwoFactorTab />
                </div>
                
                {/* Sekcja zmiany hasła */}
                <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
                      <Key className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Zmiana hasła</h3>
                      <p className="text-sm text-[var(--text-muted)]">Zaktualizuj hasło do konta</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Obecne hasło</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all" 
                        placeholder="••••••••" 
                      />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Nowe hasło</label>
                        <input 
                          type="password" 
                          className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all" 
                          placeholder="••••••••" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Potwierdź nowe hasło</label>
                        <input 
                          type="password" 
                          className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all" 
                          placeholder="••••••••" 
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button className="px-8 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm">
                        Zmień hasło
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Główny widok - karty kategorii
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Ustawienia</h1>
        <p className="text-[var(--text-muted)] mt-1">Zarządzaj ustawieniami swojej firmy</p>
      </div>

      <div className="space-y-8">
        {settingsCategories.map((category) => (
          <div key={category.title}>
            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">{category.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {category.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="flex items-start gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-left hover:border-[var(--text-muted)] hover:shadow-sm transition-all group"
                  >
                    <div className="p-3 bg-[var(--bg-primary)] rounded-xl group-hover:bg-[var(--bg-card-hover)] transition-colors">
                      <Icon className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--text-primary)] mb-1">{item.label}</h3>
                      <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
