'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, ExternalLink, Copy, Info, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Loga integracji
const GoogleCalendarLogo = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/500px-Google_Calendar_icon_%282020%29.svg.png" 
    alt="Google Calendar" 
    className="w-7 h-7 object-contain"
  />
)

const OutlookLogo = () => (
  <img 
    src="https://img.icons8.com/color/1200/outlook-calendar.jpg" 
    alt="Outlook Calendar" 
    className="w-7 h-7 object-contain rounded"
  />
)

const AppleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)

const MailchimpLogo = () => (
  <img 
    src="https://images.squarespace-cdn.com/content/v1/64e4b52cb313f8621ac5c155/1692710271545-4CH6SHW21WZPWF1MKZBX/7.+Mailchimp-Logo_Mailchimp-Article_TinySeed.jpg" 
    alt="Mailchimp" 
    className="w-7 h-7 object-contain rounded"
  />
)

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80"/>
        <stop offset="50%" stopColor="#F77737"/>
        <stop offset="100%" stopColor="#833AB4"/>
      </linearGradient>
    </defs>
    <rect fill="url(#ig-grad)" width="24" height="24" rx="6"/>
    <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/>
  </svg>
)

const GoogleAnalyticsLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <rect fill="#F9AB00" x="3" y="14" width="5" height="7" rx="1"/>
    <rect fill="#E37400" x="9.5" y="9" width="5" height="12" rx="1"/>
    <rect fill="#F9AB00" x="16" y="3" width="5" height="18" rx="1"/>
  </svg>
)

const ZapierLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <circle fill="#FF4A00" cx="12" cy="12" r="10"/>
    <path fill="#fff" d="M12 6l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z"/>
  </svg>
)

const SlackLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
    <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
    <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
    <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
)

const WhatsAppLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const HubSpotLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <circle fill="#FF7A59" cx="12" cy="12" r="10"/>
    <circle fill="#fff" cx="12" cy="12" r="4"/>
    <circle fill="#FF7A59" cx="12" cy="12" r="2"/>
    <circle fill="#fff" cx="17" cy="7" r="2"/>
    <line x1="14" y1="9" x2="16" y2="8" stroke="#fff" strokeWidth="1.5"/>
  </svg>
)

const SalesforceLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path fill="#00A1E0" d="M10.006 5.415a4.195 4.195 0 013.045-1.306c1.56 0 2.954.9 3.69 2.205.63-.3 1.35-.465 2.1-.465 2.79 0 5.055 2.265 5.055 5.055s-2.265 5.055-5.055 5.055c-.39 0-.765-.045-1.125-.135-.585 1.305-1.905 2.22-3.435 2.22-.615 0-1.2-.15-1.71-.405a4.2 4.2 0 01-3.72 2.25 4.2 4.2 0 01-3.93-2.7 3.45 3.45 0 01-.81.09c-1.92 0-3.48-1.56-3.48-3.48 0-1.14.555-2.16 1.41-2.79a4.47 4.47 0 01-.3-1.605c0-2.49 2.01-4.5 4.5-4.5 1.44 0 2.73.675 3.555 1.725z"/>
  </svg>
)

interface Integration {
  id: string
  name: string
  description: string
  logo: React.ReactNode
  status: 'available' | 'coming_soon'
  category: 'calendar' | 'marketing' | 'analytics' | 'automation' | 'crm'
}

export default function IntegrationsTab() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([])
  const [googleCalendarEmail, setGoogleCalendarEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tenantId, setTenantId] = useState<string>('')
  
  // Google Calendar iCal Link state
  const [icalEnabled, setIcalEnabled] = useState(false)
  const [icalUrl, setIcalUrl] = useState('')
  const [icalLastSync, setIcalLastSync] = useState<string | null>(null)
  const [icalEventsCount, setIcalEventsCount] = useState(0)
  const [icalInputUrl, setIcalInputUrl] = useState('')
  const [icalLoading, setIcalLoading] = useState(false)
  const [showGoogleCalendarInfo, setShowGoogleCalendarInfo] = useState(false)

  // Pobierz API URL
  const getApiUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3001'
    const hostname = window.location.hostname
    if (hostname.includes('bookings24.eu')) return 'https://api.bookings24.eu'
    if (hostname.includes('rezerwacja24.pl')) return 'https://api.rezerwacja24.pl'
    return 'http://localhost:3001'
  }

  // Sprawdź status integracji przy ładowaniu
  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const currentTenantId = user.tenantId || ''
        setTenantId(currentTenantId)

        if (!token || !currentTenantId) return

        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/api/integrations/google-calendar/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': currentTenantId,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.connected) {
            setConnectedIntegrations(prev => [...prev.filter(i => i !== 'google-calendar'), 'google-calendar'])
            setGoogleCalendarEmail(data.email)
          }
        }

        // Sprawdź status integracji iCal
        const icalResponse = await fetch(`${apiUrl}/api/integrations/google-calendar-ical/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': currentTenantId,
          },
        })

        if (icalResponse.ok) {
          const icalData = await icalResponse.json()
          setIcalEnabled(icalData.enabled || false)
          setIcalUrl(icalData.url || '')
          setIcalLastSync(icalData.lastSync)
          setIcalEventsCount(icalData.eventsCount || 0)
          if (icalData.url) {
            setIcalInputUrl(icalData.url)
          }
        }
      } catch (error) {
        console.error('Error checking integrations:', error)
      }
    }

    checkIntegrations()
  }, [])

  // Obsługa połączenia z Google Calendar
  const handleGoogleCalendarConnect = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const currentTenantId = user.tenantId || ''

      if (!token || !currentTenantId) {
        toast.error('Musisz być zalogowany')
        return
      }

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/integrations/google-calendar/auth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': currentTenantId,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Przekieruj do Google OAuth
        window.location.href = data.authUrl
      } else {
        toast.error('Nie udało się połączyć z Google Calendar')
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error)
      toast.error('Błąd połączenia')
    } finally {
      setIsLoading(false)
    }
  }

  // Rozłącz Google Calendar
  const handleGoogleCalendarDisconnect = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const currentTenantId = user.tenantId || ''

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/integrations/google-calendar/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': currentTenantId,
        },
      })

      if (response.ok) {
        setConnectedIntegrations(prev => prev.filter(i => i !== 'google-calendar'))
        setGoogleCalendarEmail(null)
        toast.success('Rozłączono z Google Calendar')
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error('Błąd rozłączania')
    } finally {
      setIsLoading(false)
    }
  }

  // Kopiuj link iCal
  const copyICalLink = () => {
    const apiUrl = getApiUrl()
    const icalUrl = `${apiUrl}/api/calendar/ical/${tenantId}`
    navigator.clipboard.writeText(icalUrl)
    toast.success('Skopiowano link iCal!')
  }

  // Włącz synchronizację Google Calendar przez link iCal
  const handleEnableICalSync = async () => {
    if (!icalInputUrl) {
      toast.error('Wklej link do kalendarza Google')
      return
    }

    try {
      setIcalLoading(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const currentTenantId = user.tenantId || ''

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/integrations/google-calendar-ical/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': currentTenantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: icalInputUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setIcalEnabled(true)
        setIcalUrl(icalInputUrl)
        setIcalEventsCount(data.eventsCount || 0)
        setIcalLastSync(new Date().toISOString())
        toast.success(`Synchronizacja włączona! Zaimportowano ${data.eventsCount || 0} wydarzeń.`)
      } else {
        toast.error(data.error || 'Nie udało się włączyć synchronizacji')
      }
    } catch (error) {
      console.error('Error enabling iCal sync:', error)
      toast.error('Błąd połączenia')
    } finally {
      setIcalLoading(false)
    }
  }

  // Wyłącz synchronizację iCal
  const handleDisableICalSync = async () => {
    try {
      setIcalLoading(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const currentTenantId = user.tenantId || ''

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/integrations/google-calendar-ical/disable`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': currentTenantId,
        },
      })

      if (response.ok) {
        setIcalEnabled(false)
        setIcalUrl('')
        setIcalEventsCount(0)
        setIcalLastSync(null)
        toast.success('Synchronizacja wyłączona')
      }
    } catch (error) {
      console.error('Error disabling iCal sync:', error)
      toast.error('Błąd rozłączania')
    } finally {
      setIcalLoading(false)
    }
  }

  // Ręczna synchronizacja
  const handleManualSync = async () => {
    try {
      setIcalLoading(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const currentTenantId = user.tenantId || ''

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/integrations/google-calendar-ical/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': currentTenantId,
        },
      })

      const data = await response.json()

      if (data.success) {
        setIcalEventsCount(data.eventsCount || 0)
        setIcalLastSync(new Date().toISOString())
        toast.success(`Zsynchronizowano ${data.eventsCount || 0} wydarzeń`)
      } else {
        toast.error(data.error || 'Błąd synchronizacji')
      }
    } catch (error) {
      console.error('Error syncing:', error)
      toast.error('Błąd synchronizacji')
    } finally {
      setIcalLoading(false)
    }
  }

  const integrations: Integration[] = [
    { id: 'google-calendar', name: 'Google Calendar', description: 'Synchronizuj rezerwacje z kalendarzem Google', logo: <GoogleCalendarLogo />, status: 'available', category: 'calendar' },
    { id: 'outlook', name: 'Microsoft Outlook', description: 'Synchronizacja z kalendarzem Outlook', logo: <OutlookLogo />, status: 'coming_soon', category: 'calendar' },
    { id: 'apple-calendar', name: 'Apple Calendar', description: 'Integracja z kalendarzem Apple (iCal)', logo: <AppleLogo />, status: 'available', category: 'calendar' },
    { id: 'mailchimp', name: 'Mailchimp', description: 'Automatyczne dodawanie klientów do list', logo: <MailchimpLogo />, status: 'coming_soon', category: 'marketing' },
    { id: 'facebook', name: 'Facebook Pixel', description: 'Śledzenie konwersji i remarketing', logo: <FacebookLogo />, status: 'coming_soon', category: 'marketing' },
    { id: 'instagram', name: 'Instagram', description: 'Przycisk rezerwacji na profilu', logo: <InstagramLogo />, status: 'coming_soon', category: 'marketing' },
    { id: 'google-analytics', name: 'Google Analytics', description: 'Szczegółowa analityka ruchu', logo: <GoogleAnalyticsLogo />, status: 'coming_soon', category: 'analytics' },
    { id: 'zapier', name: 'Zapier', description: 'Połącz z tysiącami aplikacji', logo: <ZapierLogo />, status: 'coming_soon', category: 'automation' },
    { id: 'slack', name: 'Slack', description: 'Powiadomienia o rezerwacjach', logo: <SlackLogo />, status: 'coming_soon', category: 'automation' },
    { id: 'whatsapp', name: 'WhatsApp Business', description: 'Powiadomienia przez WhatsApp', logo: <WhatsAppLogo />, status: 'coming_soon', category: 'automation' },
    { id: 'hubspot', name: 'HubSpot', description: 'Synchronizacja kontaktów z CRM', logo: <HubSpotLogo />, status: 'coming_soon', category: 'crm' },
    { id: 'salesforce', name: 'Salesforce', description: 'Integracja z Salesforce CRM', logo: <SalesforceLogo />, status: 'coming_soon', category: 'crm' },
  ]

  const categories = [
    { id: 'calendar', name: 'Kalendarz' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'analytics', name: 'Analityka' },
    { id: 'automation', name: 'Automatyzacja' },
    { id: 'crm', name: 'CRM' },
  ]

  const handleConnect = (id: string) => {
    setConnectedIntegrations(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Integracje</h2>
        <p className="text-[var(--text-muted)] mt-1">Połącz Rezerwacja24 z innymi narzędziami</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-center">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{integrations.length}</p>
          <p className="text-sm text-[var(--text-muted)]">Dostępnych</p>
        </div>
        <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-center">
          <p className="text-2xl font-bold text-green-500">{connectedIntegrations.length}</p>
          <p className="text-sm text-[var(--text-muted)]">Połączonych</p>
        </div>
        <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-500">{integrations.filter(i => i.status === 'available').length}</p>
          <p className="text-sm text-[var(--text-muted)]">Aktywnych</p>
        </div>
        <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-500">{integrations.filter(i => i.status === 'coming_soon').length}</p>
          <p className="text-sm text-[var(--text-muted)]">Wkrótce</p>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map(category => {
          const items = integrations.filter(i => i.category === category.id)
          if (items.length === 0) return null
          
          return (
            <div key={category.id}>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(integration => {
                  const isConnected = connectedIntegrations.includes(integration.id)
                  const isComingSoon = integration.status === 'coming_soon'
                  
                  return (
                    <div key={integration.id} className={`p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl relative ${isComingSoon ? 'opacity-60' : ''}`}>
                      {isComingSoon && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold rounded-full">Wkrótce</span>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow border border-gray-100 dark:border-gray-700 flex-shrink-0">
                          {integration.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[var(--text-primary)]">{integration.name}</h4>
                            {integration.id === 'google-calendar' && (
                              <button
                                onClick={() => setShowGoogleCalendarInfo(true)}
                                className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 transition-colors"
                                title="Informacje o integracji"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-muted)] mt-0.5">{integration.description}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        {isComingSoon ? (
                          <button disabled className="w-full py-2.5 bg-[var(--bg-card)] text-[var(--text-muted)] rounded-xl text-sm font-medium cursor-not-allowed">Niedostępne</button>
                        ) : integration.id === 'google-calendar' ? (
                          // Google Calendar - dwie opcje: OAuth lub link iCal
                          <div className="space-y-3">
                            {/* Opcja 1: OAuth */}
                            <div className="p-3 bg-[var(--bg-card)] rounded-xl">
                              <p className="text-xs font-medium text-[var(--text-primary)] mb-2">Opcja 1: Pełna integracja (OAuth)</p>
                              {isConnected ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center gap-2 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                                    <Check className="w-3 h-3" />
                                    <span>Połączono{googleCalendarEmail ? `: ${googleCalendarEmail}` : ''}</span>
                                  </div>
                                  <button 
                                    onClick={handleGoogleCalendarDisconnect} 
                                    disabled={isLoading}
                                    className="w-full py-1.5 bg-[var(--bg-primary)] text-[var(--text-muted)] rounded-lg text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Rozłącz'}
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={handleGoogleCalendarConnect} 
                                  disabled={isLoading}
                                  className="w-full py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-xs font-medium hover:opacity-90 flex items-center justify-center gap-2"
                                >
                                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                                  {isLoading ? 'Łączenie...' : 'Połącz z Google'}
                                </button>
                              )}
                            </div>
                            
                            {/* Opcja 2: Link iCal */}
                            <div className="p-3 bg-[var(--bg-card)] rounded-xl">
                              <p className="text-xs font-medium text-[var(--text-primary)] mb-2">Opcja 2: Synchronizacja przez link</p>
                              {icalEnabled ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center gap-2 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                                    <Check className="w-3 h-3" />
                                    <span>Synchronizacja aktywna ({icalEventsCount} wydarzeń)</span>
                                  </div>
                                  {icalLastSync && (
                                    <p className="text-[10px] text-[var(--text-muted)] text-center">
                                      Ostatnia sync: {new Date(icalLastSync).toLocaleString('pl-PL')}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={handleManualSync} 
                                      disabled={icalLoading}
                                      className="flex-1 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:opacity-90"
                                    >
                                      {icalLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Synchronizuj'}
                                    </button>
                                    <button 
                                      onClick={handleDisableICalSync} 
                                      disabled={icalLoading}
                                      className="flex-1 py-1.5 bg-[var(--bg-primary)] text-[var(--text-muted)] rounded-lg text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                      Wyłącz
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <input 
                                    type="text" 
                                    placeholder="Wklej link iCal z Google Calendar"
                                    value={icalInputUrl}
                                    onChange={(e) => setIcalInputUrl(e.target.value)}
                                    className="w-full text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[var(--text-primary)]"
                                  />
                                  <button 
                                    onClick={handleEnableICalSync} 
                                    disabled={icalLoading || !icalInputUrl}
                                    className="w-full py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
                                  >
                                    {icalLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Włącz synchronizację'}
                                  </button>
                                  <div className="text-[10px] text-[var(--text-muted)] space-y-1 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="font-medium text-blue-700 dark:text-blue-300">Jak uzyskać link iCal:</p>
                                    <ol className="list-decimal list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
                                      <li>Otwórz calendar.google.com</li>
                                      <li>Kliknij ⚙️ → Ustawienia</li>
                                      <li>Wybierz swój kalendarz z listy</li>
                                      <li>Przewiń do "Integruj kalendarz"</li>
                                      <li>Skopiuj "Tajny adres w formacie iCal"</li>
                                    </ol>
                                    <p className="text-blue-500 dark:text-blue-400 mt-1">✨ Wydarzenia z Google Calendar będą blokować terminy w systemie rezerwacji</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : integration.id === 'apple-calendar' ? (
                          // Apple Calendar (iCal) - pokaż link do skopiowania
                          <div className="space-y-2">
                            <div className="p-3 bg-[var(--bg-card)] rounded-xl">
                              <p className="text-xs text-[var(--text-muted)] mb-2">Link do subskrypcji kalendarza:</p>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  readOnly 
                                  value={tenantId ? `${getApiUrl()}/api/calendar/ical/${tenantId}` : 'Ładowanie...'}
                                  className="flex-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[var(--text-muted)]"
                                />
                                <button 
                                  onClick={copyICalLink}
                                  disabled={!tenantId}
                                  className="px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-xs font-medium hover:opacity-90 flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  Kopiuj
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">Dodaj ten link w Apple Calendar, Outlook lub innej aplikacji kalendarza.</p>
                          </div>
                        ) : isConnected ? (
                          <div className="flex gap-2">
                            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">
                              <Check className="w-4 h-4" />Połączono
                            </div>
                            <button onClick={() => handleConnect(integration.id)} className="px-4 py-2.5 bg-[var(--bg-card)] text-[var(--text-muted)] rounded-xl text-sm hover:bg-[var(--bg-card-hover)]">Rozłącz</button>
                          </div>
                        ) : (
                          <button onClick={() => handleConnect(integration.id)} className="w-full py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-sm font-medium hover:opacity-90">Połącz</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Potrzebujesz innej integracji?</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">Skontaktuj się z nami, a rozważymy dodanie nowej integracji!</p>
      </div>

      {/* Modal informacyjny Google Calendar */}
      {showGoogleCalendarInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-primary)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GoogleCalendarLogo />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Integracja Google Calendar</h3>
                </div>
                <button
                  onClick={() => setShowGoogleCalendarInfo(false)}
                  className="p-2 rounded-full hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                {/* Opcja 1 */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Opcja 1: Pełna integracja (OAuth)</h4>
                  <p className="text-green-700 dark:text-green-400 mb-2">Wymaga zalogowania się do konta Google.</p>
                  <div className="space-y-1 text-green-600 dark:text-green-400">
                    <p><strong>Co daje:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>Automatyczne dodawanie rezerwacji do Google Calendar</li>
                      <li>Aktualizacja wydarzeń przy zmianie rezerwacji</li>
                      <li>Usuwanie wydarzeń przy anulowaniu rezerwacji</li>
                    </ul>
                  </div>
                </div>

                {/* Opcja 2 */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🔗 Opcja 2: Synchronizacja przez link iCal</h4>
                  <p className="text-blue-700 dark:text-blue-400 mb-2">Nie wymaga logowania - wystarczy wkleić link.</p>
                  <div className="space-y-1 text-blue-600 dark:text-blue-400">
                    <p><strong>Co daje:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>Pobieranie wydarzeń z Twojego Google Calendar</li>
                      <li>Blokowanie terminów w formularzu rezerwacji</li>
                      <li>Wyświetlanie wydarzeń w kalendarzu panelu</li>
                      <li>Synchronizacja co 5 minut</li>
                    </ul>
                    <p className="mt-2"><strong>Co blokuje:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>Klienci nie mogą rezerwować terminów zajętych w Google Calendar</li>
                      <li>Dotyczy wszystkich wydarzeń (spotkania, urlopy, prywatne)</li>
                    </ul>
                  </div>
                </div>

                {/* Przekazywane dane */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">🔒 Jakie dane są przekazywane?</h4>
                  <div className="space-y-2 text-[var(--text-muted)]">
                    <p><strong>Opcja 1 (OAuth):</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>Tytuł rezerwacji (imię klienta, usługa)</li>
                      <li>Data i godzina rezerwacji</li>
                      <li>Opis z danymi kontaktowymi</li>
                    </ul>
                    <p className="mt-2"><strong>Opcja 2 (Link iCal):</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>Pobieramy tylko: tytuł, datę rozpoczęcia i zakończenia</li>
                      <li>Nie mamy dostępu do szczegółów wydarzeń</li>
                      <li>Dane są przechowywane tylko w Twoim koncie</li>
                    </ul>
                  </div>
                </div>

                {/* Rekomendacja */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">💡 Rekomendacja</h4>
                  <p className="text-amber-700 dark:text-amber-400">
                    Dla pełnej dwukierunkowej synchronizacji użyj <strong>obu opcji</strong>:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-1 text-amber-600 dark:text-amber-400">
                    <li>Opcja 1 → rezerwacje trafiają do Google</li>
                    <li>Opcja 2 → wydarzenia z Google blokują terminy</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowGoogleCalendarInfo(false)}
                className="w-full mt-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Rozumiem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
