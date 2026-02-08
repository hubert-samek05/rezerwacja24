'use client'

import { useState, useEffect } from 'react'
import { Bell, MessageSquare, Loader2, Check, AlertCircle, Clock, UserCheck, X as XIcon, Zap } from 'lucide-react'

interface NotificationSettings {
  smsEnabled: boolean
  notifications: {
    bookingConfirmation: boolean
    bookingReminder: boolean
    bookingCancellation: boolean
    bookingReschedule: boolean
    reminderHoursBefore: number
  }
}

interface SmsStats {
  used: number
  limit: number
  remaining: number
}

export default function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: false,
    notifications: {
      bookingConfirmation: true,
      bookingReminder: true,
      bookingCancellation: true,
      bookingReschedule: true,
      reminderHoursBefore: 24,
    },
  })

  const [smsStats, setSmsStats] = useState<SmsStats>({ used: 0, limit: 500, remaining: 500 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<number>(100)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = localStorage.getItem('user')
        if (!user) { setLoading(false); return }

        const userData = JSON.parse(user)
        const extractedTenantId = userData.tenantId
        if (!extractedTenantId) { setLoading(false); return }

        setTenantId(extractedTenantId)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
        
        const [statusRes, settingsRes] = await Promise.all([
          fetch(`${apiUrl}/api/sms/status`, { headers: { 'X-Tenant-ID': extractedTenantId } }),
          fetch(`${apiUrl}/api/sms/settings`, { headers: { 'X-Tenant-ID': extractedTenantId } })
        ])

        if (statusRes.ok) setSmsStats(await statusRes.json())
        if (settingsRes.ok) {
          const smsSettings = await settingsRes.json()
          setSettings({
            smsEnabled: true,
            notifications: {
              bookingConfirmation: smsSettings.confirmedEnabled !== false,
              bookingReminder: smsSettings.reminderEnabled !== false,
              bookingCancellation: smsSettings.cancelledEnabled !== false,
              bookingReschedule: smsSettings.rescheduledEnabled !== false,
              reminderHoursBefore: 24,
            },
          })
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (!tenantId) throw new Error('Brak ID firmy')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
      const response = await fetch(`${apiUrl}/api/sms/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
        body: JSON.stringify({
          confirmedEnabled: settings.notifications.bookingConfirmation,
          rescheduledEnabled: settings.notifications.bookingReschedule,
          cancelledEnabled: settings.notifications.bookingCancellation,
          reminderEnabled: settings.notifications.bookingReminder,
        }),
      })
      if (!response.ok) throw new Error('Nie udało się zapisać')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
    >
      <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Powiadomienia SMS</h2>
        <p className="text-[var(--text-muted)] mt-1">Automatyczne SMS-y dla klientów</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300">Ustawienia zapisane!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* SMS Stats */}
        <div className="p-6 bg-[var(--bg-primary)] rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Dostępne SMS</p>
                <p className="text-sm text-[var(--text-muted)]">{smsStats.remaining} z {smsStats.limit}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPurchaseModal(true)}
              className="px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              Dokup SMS
            </button>
          </div>
          <div className="w-full bg-[var(--border-color)] rounded-full h-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(smsStats.used / smsStats.limit) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Limit odnawia się pierwszego dnia miesiąca</p>
        </div>

        {/* SMS Toggle */}
        <div className="p-6 bg-[var(--bg-primary)] rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Włącz powiadomienia SMS</p>
                <p className="text-sm text-[var(--text-muted)]">Automatyczne SMS-y o rezerwacjach</p>
              </div>
            </div>
            <Toggle checked={settings.smsEnabled} onChange={() => setSettings({ ...settings, smsEnabled: !settings.smsEnabled })} />
          </div>
        </div>

        {/* Notification Types */}
        {settings.smsEnabled && (
          <div className="p-6 bg-[var(--bg-primary)] rounded-2xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-[var(--text-muted)]" />
              <p className="font-medium text-[var(--text-primary)]">Typy powiadomień</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Potwierdzenie rezerwacji</p>
                    <p className="text-xs text-[var(--text-muted)]">Po zarezerwowaniu</p>
                  </div>
                </div>
                <Toggle 
                  checked={settings.notifications.bookingConfirmation} 
                  onChange={() => setSettings({ ...settings, notifications: { ...settings.notifications, bookingConfirmation: !settings.notifications.bookingConfirmation } })} 
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Przypomnienie</p>
                    <p className="text-xs text-[var(--text-muted)]">{settings.notifications.reminderHoursBefore}h przed wizytą</p>
                  </div>
                </div>
                <Toggle 
                  checked={settings.notifications.bookingReminder} 
                  onChange={() => setSettings({ ...settings, notifications: { ...settings.notifications, bookingReminder: !settings.notifications.bookingReminder } })} 
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Przesunięcie terminu</p>
                    <p className="text-xs text-[var(--text-muted)]">Gdy zmieni się data</p>
                  </div>
                </div>
                <Toggle 
                  checked={settings.notifications.bookingReschedule} 
                  onChange={() => setSettings({ ...settings, notifications: { ...settings.notifications, bookingReschedule: !settings.notifications.bookingReschedule } })} 
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg">
                <div className="flex items-center gap-3">
                  <XIcon className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Anulowanie</p>
                    <p className="text-xs text-[var(--text-muted)]">Gdy klient anuluje</p>
                  </div>
                </div>
                <Toggle 
                  checked={settings.notifications.bookingCancellation} 
                  onChange={() => setSettings({ ...settings, notifications: { ...settings.notifications, bookingCancellation: !settings.notifications.bookingCancellation } })} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
        </button>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPurchaseModal(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Wykup dodatkowe SMS</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg">
                <XIcon className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { size: 100, price: '29.99' },
                { size: 500, price: '99.99', popular: true },
                { size: 1000, price: '179.99' },
                { size: 5000, price: '799.99' },
              ].map((pkg) => (
                <button
                  key={pkg.size}
                  onClick={() => setSelectedPackage(pkg.size)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedPackage === pkg.size
                      ? 'border-[var(--text-primary)] bg-[var(--bg-card-hover)]'
                      : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-bold rounded-full">
                      POPULARNE
                    </span>
                  )}
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{pkg.size}</div>
                  <div className="text-xs text-[var(--text-muted)]">SMS</div>
                  <div className="text-lg font-semibold text-[var(--text-primary)] mt-2">{pkg.price} zł</div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPurchaseModal(false)} className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl">
                Anuluj
              </button>
              <button className="flex-1 px-4 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium">
                Wykup {selectedPackage} SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
