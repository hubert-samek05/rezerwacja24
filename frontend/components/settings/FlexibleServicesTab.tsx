'use client'

import { useState } from 'react'
import { Clock, Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId, getTenantConfig } from '@/lib/tenant'

interface FlexibleServiceSettings {
  showCouponCode: boolean
  showPaymentOptions: boolean
  availabilityHours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
}

interface Props {
  companyData: any
  setCompanyData: (data: any) => void
  onSave: () => void
  isLoading: boolean
}

const defaultHours = {
  monday: { open: '08:00', close: '20:00', closed: false },
  tuesday: { open: '08:00', close: '20:00', closed: false },
  wednesday: { open: '08:00', close: '20:00', closed: false },
  thursday: { open: '08:00', close: '20:00', closed: false },
  friday: { open: '08:00', close: '20:00', closed: false },
  saturday: { open: '08:00', close: '20:00', closed: false },
  sunday: { open: '08:00', close: '20:00', closed: true },
}

const dayNames: { [key: string]: string } = {
  monday: 'Poniedziałek',
  tuesday: 'Wtorek',
  wednesday: 'Środa',
  thursday: 'Czwartek',
  friday: 'Piątek',
  saturday: 'Sobota',
  sunday: 'Niedziela'
}

export default function FlexibleServicesTab({ companyData, setCompanyData, onSave, isLoading }: Props) {
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const settings: FlexibleServiceSettings = companyData?.flexibleServiceSettings || {
    showCouponCode: false,
    showPaymentOptions: false,
    availabilityHours: defaultHours
  }

  const updateSettings = (newSettings: Partial<FlexibleServiceSettings>) => {
    setCompanyData({
      ...companyData,
      flexibleServiceSettings: {
        ...settings,
        ...newSettings
      }
    })
  }

  const updateDayHours = (day: string, field: string, value: any) => {
    const currentHours = settings.availabilityHours || defaultHours
    updateSettings({
      availabilityHours: {
        ...currentHours,
        [day]: {
          ...currentHours[day],
          [field]: value
        }
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const tenantId = getTenantId()
      const API_URL = getApiUrl()
      const config = getTenantConfig()
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/api/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          flexibleServiceSettings: settings
        })
      })
      
      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const hours = settings.availabilityHours || defaultHours

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Ustawienia usług na godziny i dni</h2>
        <p className="text-[var(--text-muted)] mt-1">
          Konfiguracja dla usług z elastycznym czasem trwania (np. wynajem sal, sprzętu)
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
          Zapisano pomyślnie!
        </div>
      )}

      {/* Opcje formularza rezerwacji */}
      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 space-y-6">
        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Opcje formularza rezerwacji
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-xl">
            <div>
              <div className="font-medium text-[var(--text-primary)]">Pokaż pole kodu rabatowego</div>
              <div className="text-sm text-[var(--text-muted)]">Pozwól klientom wpisać kod promocyjny</div>
            </div>
            <button
              onClick={() => updateSettings({ showCouponCode: !settings.showCouponCode })}
              className="text-2xl"
            >
              {settings.showCouponCode ? (
                <ToggleRight className="w-10 h-10 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-xl">
            <div>
              <div className="font-medium text-[var(--text-primary)]">Pokaż opcje płatności</div>
              <div className="text-sm text-[var(--text-muted)]">Wyświetl wybór metody płatności (gotówka, online)</div>
            </div>
            <button
              onClick={() => updateSettings({ showPaymentOptions: !settings.showPaymentOptions })}
              className="text-2xl"
            >
              {settings.showPaymentOptions ? (
                <ToggleRight className="w-10 h-10 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Godziny dostępności */}
      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Godziny dostępności rezerwacji
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Ustaw w jakich godzinach można rezerwować usługi elastyczne (niezależnie od godzin otwarcia firmy)
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(dayNames).map(([day, name]) => (
            <div key={day} className="p-4 bg-[var(--bg-card)] rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-40">
                  <div className="font-medium text-[var(--text-primary)]">{name}</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!hours[day]?.closed}
                      onChange={(e) => updateDayHours(day, 'closed', !e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-[var(--text-muted)] hidden sm:inline">Otwarte</span>
                  </label>
                </div>

                {!hours[day]?.closed && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="time"
                      value={hours[day]?.open || '08:00'}
                      onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                      className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm w-[110px]"
                    />
                    <span className="text-[var(--text-muted)]">-</span>
                    <input
                      type="time"
                      value={hours[day]?.close || '20:00'}
                      onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                      className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm w-[110px]"
                    />
                  </div>
                )}

                {hours[day]?.closed && (
                  <span className="text-[var(--text-muted)] italic text-sm">Zamknięte</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Przycisk zapisu */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Zapisz ustawienia
        </button>
      </div>
    </div>
  )
}
