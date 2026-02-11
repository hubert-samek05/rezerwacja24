'use client'

import { useState, useEffect } from 'react'
import { Loader2, Wallet, Info, AlertCircle } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId, getTenantConfig } from '@/lib/tenant'
import toast from 'react-hot-toast'

interface DepositSettings {
  deposit_enabled: boolean
  deposit_mode: string
  deposit_type: string
  deposit_value: number
  deposit_min_amount: number | null
  deposit_max_amount: number | null
  deposit_exempt_after_visits: number | null
  deposit_exempt_after_spent: number | null
  deposit_refund_policy: string
  deposit_refund_hours_before: number
  deposit_payment_deadline_hours: number
}

export default function DepositsTab() {
  const [settings, setSettings] = useState<DepositSettings>({
    deposit_enabled: false,
    deposit_mode: 'always',
    deposit_type: 'percentage',
    deposit_value: 30,
    deposit_min_amount: null,
    deposit_max_amount: null,
    deposit_exempt_after_visits: null,
    deposit_exempt_after_spent: null,
    deposit_refund_policy: 'non_refundable',
    deposit_refund_hours_before: 24,
    deposit_payment_deadline_hours: 24,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const inputClass = "w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors"
  const selectClass = "w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)] transition-colors appearance-none cursor-pointer"

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const tenantId = getTenantId()
      const API_URL = getApiUrl()
      const config = getTenantConfig()
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/deposits/settings/${tenantId}`, {
        headers: {
          ...config.headers,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading deposit settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const tenantId = getTenantId()
      const API_URL = getApiUrl()
      const config = getTenantConfig()
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/deposits/settings/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Ustawienia zaliczek zapisane!')
      } else {
        throw new Error('Błąd zapisu')
      }
    } catch (error) {
      console.error('Error saving deposit settings:', error)
      toast.error('Nie udało się zapisać ustawień')
    } finally {
      setIsSaving(false)
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-14 h-8 rounded-full transition-all relative ${checked ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
    >
      <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  )

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[var(--text-primary)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          Zaliczki
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Konfiguruj pobieranie zaliczek za rezerwacje
        </p>
      </div>

      <div className="space-y-6">
        {/* Włącz/wyłącz zaliczki */}
        <div className="p-4 sm:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl sm:rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-[var(--text-primary)] text-sm sm:text-base">Pobieranie zaliczek</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
                  Wymagaj zaliczki przy rezerwacji
                </p>
              </div>
            </div>
            <Toggle 
              checked={settings.deposit_enabled} 
              onChange={() => setSettings({ ...settings, deposit_enabled: !settings.deposit_enabled })} 
            />
          </div>
        </div>

        {settings.deposit_enabled && (
          <>
            {/* Kiedy pobierać zaliczkę */}
            <div className="p-4 sm:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl sm:rounded-2xl">
              <h3 className="font-medium text-[var(--text-primary)] mb-3 sm:mb-4 text-sm sm:text-base">Kiedy pobierać zaliczkę?</h3>
              
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="deposit_mode"
                    value="always"
                    checked={settings.deposit_mode === 'always'}
                    onChange={(e) => setSettings({ ...settings, deposit_mode: e.target.value })}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-green-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-sm sm:text-base">Zawsze</p>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">Dla każdej rezerwacji</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="deposit_mode"
                    value="first_time_only"
                    checked={settings.deposit_mode === 'first_time_only'}
                    onChange={(e) => setSettings({ ...settings, deposit_mode: e.target.value })}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-green-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-sm sm:text-base">Tylko nowi klienci</p>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">Powracający nie płacą</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="deposit_mode"
                    value="until_visits"
                    checked={settings.deposit_mode === 'until_visits'}
                    onChange={(e) => setSettings({ ...settings, deposit_mode: e.target.value })}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-green-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-sm sm:text-base">Do określonej liczby wizyt</p>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">Po X wizytach zwolniony</p>
                  </div>
                </label>

                {settings.deposit_mode === 'until_visits' && (
                  <div className="ml-6 sm:ml-8 mt-2">
                    <label className="text-xs sm:text-sm text-[var(--text-muted)]">Liczba wizyt</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.deposit_exempt_after_visits || ''}
                      onChange={(e) => setSettings({ ...settings, deposit_exempt_after_visits: parseInt(e.target.value) || null })}
                      className={`${inputClass} mt-1 w-24 sm:w-32`}
                      placeholder="np. 5"
                    />
                  </div>
                )}

                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="deposit_mode"
                    value="until_spent"
                    checked={settings.deposit_mode === 'until_spent'}
                    onChange={(e) => setSettings({ ...settings, deposit_mode: e.target.value })}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-green-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-sm sm:text-base">Do określonej kwoty</p>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">Po wydaniu X PLN zwolniony</p>
                  </div>
                </label>

                {settings.deposit_mode === 'until_spent' && (
                  <div className="ml-6 sm:ml-8 mt-2">
                    <label className="text-xs sm:text-sm text-[var(--text-muted)]">Kwota (PLN)</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.deposit_exempt_after_spent || ''}
                      onChange={(e) => setSettings({ ...settings, deposit_exempt_after_spent: parseFloat(e.target.value) || null })}
                      className={`${inputClass} mt-1 w-24 sm:w-32`}
                      placeholder="np. 500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Wysokość zaliczki */}
            <div className="p-4 sm:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl sm:rounded-2xl">
              <h3 className="font-medium text-[var(--text-primary)] mb-3 sm:mb-4 text-sm sm:text-base">Wysokość zaliczki</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-[var(--text-muted)]">Typ</label>
                  <select
                    value={settings.deposit_type}
                    onChange={(e) => setSettings({ ...settings, deposit_type: e.target.value })}
                    className={`${selectClass} mt-1`}
                  >
                    <option value="percentage">Procent od ceny</option>
                    <option value="fixed">Stała kwota</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-muted)]">
                    Wartość {settings.deposit_type === 'percentage' ? '(%)' : '(PLN)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={settings.deposit_type === 'percentage' ? 100 : 10000}
                    value={settings.deposit_value}
                    onChange={(e) => setSettings({ ...settings, deposit_value: parseFloat(e.target.value) || 0 })}
                    className={`${inputClass} mt-1`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--text-muted)]">Minimalna kwota zaliczki (PLN)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.deposit_min_amount || ''}
                    onChange={(e) => setSettings({ ...settings, deposit_min_amount: parseFloat(e.target.value) || null })}
                    className={`${inputClass} mt-1`}
                    placeholder="Brak limitu"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-muted)]">Maksymalna kwota zaliczki (PLN)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.deposit_max_amount || ''}
                    onChange={(e) => setSettings({ ...settings, deposit_max_amount: parseFloat(e.target.value) || null })}
                    className={`${inputClass} mt-1`}
                    placeholder="Brak limitu"
                  />
                </div>
              </div>

              {/* Przykład */}
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium">Przykład:</p>
                    <p>
                      Dla usługi za 200 PLN, zaliczka wyniesie:{' '}
                      <strong>
                        {settings.deposit_type === 'percentage'
                          ? `${Math.min(Math.max((200 * settings.deposit_value) / 100, settings.deposit_min_amount || 0), settings.deposit_max_amount || Infinity).toFixed(0)} PLN (${settings.deposit_value}%)`
                          : `${Math.min(Math.max(settings.deposit_value, settings.deposit_min_amount || 0), settings.deposit_max_amount || Infinity).toFixed(0)} PLN`
                        }
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Termin płatności */}
            <div className="p-4 sm:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl sm:rounded-2xl">
              <h3 className="font-medium text-[var(--text-primary)] mb-3 sm:mb-4 text-sm sm:text-base">Termin płatności</h3>
              
              <div>
                <label className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Czas na opłacenie zaliczki
                </label>
                <select
                  value={settings.deposit_payment_deadline_hours}
                  onChange={(e) => setSettings({ ...settings, deposit_payment_deadline_hours: parseInt(e.target.value) })}
                  className={`${selectClass} mt-1 w-full sm:w-48`}
                >
                  <option value="1">1 godzina</option>
                  <option value="2">2 godziny</option>
                  <option value="6">6 godzin</option>
                  <option value="12">12 godzin</option>
                  <option value="24">24 godziny</option>
                  <option value="48">48 godzin</option>
                  <option value="72">72 godziny</option>
                </select>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
                  Po tym czasie rezerwacja zostanie anulowana
                </p>
              </div>
            </div>

            {/* Polityka zwrotów */}
            <div className="p-4 sm:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl sm:rounded-2xl">
              <h3 className="font-medium text-[var(--text-primary)] mb-3 sm:mb-4 text-sm sm:text-base">Polityka zwrotów</h3>
              
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="refund_policy"
                    value="non_refundable"
                    checked={settings.deposit_refund_policy === 'non_refundable'}
                    onChange={(e) => setSettings({ ...settings, deposit_refund_policy: e.target.value })}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-green-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-sm sm:text-base">Brak zwrotu</p>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">Zaliczka nie podlega zwrotowi</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="refund_policy"
                    value="refundable_full"
                    checked={settings.deposit_refund_policy === 'refundable_full'}
                    onChange={(e) => setSettings({ ...settings, deposit_refund_policy: e.target.value })}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-green-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-sm sm:text-base">Pełny zwrot</p>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                      Zwrot do {settings.deposit_refund_hours_before}h przed wizytą
                    </p>
                  </div>
                </label>
              </div>

              {settings.deposit_refund_policy === 'refundable_full' && (
                <div className="mt-3 sm:mt-4">
                  <label className="text-xs sm:text-sm text-[var(--text-muted)]">
                    Zwrot możliwy do (godzin przed wizytą)
                  </label>
                  <select
                    value={settings.deposit_refund_hours_before}
                    onChange={(e) => setSettings({ ...settings, deposit_refund_hours_before: parseInt(e.target.value) })}
                    className={`${selectClass} mt-1 w-full sm:w-48`}
                  >
                    <option value="6">6 godzin</option>
                    <option value="12">12 godzin</option>
                    <option value="24">24 godziny</option>
                    <option value="48">48 godzin</option>
                    <option value="72">72 godziny</option>
                  </select>
                </div>
              )}
            </div>

            {/* Ostrzeżenie */}
            <div className="p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg sm:rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-amber-300">
                  <p className="font-medium">Ważne</p>
                  <p>
                    Aby pobierać zaliczki, skonfiguruj metodę płatności online w zakładce "Metody płatności".
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Przycisk zapisz */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Zapisz ustawienia
          </button>
        </div>
      </div>
    </div>
  )
}
