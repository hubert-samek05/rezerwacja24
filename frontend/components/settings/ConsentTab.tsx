'use client'

import { useState, useEffect } from 'react'
import { Shield, Loader2, Check, AlertCircle } from 'lucide-react'
import { getTenantId } from '@/lib/storage'

export default function ConsentTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    requireConsent: true,
    consentText: 'Wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji rezerwacji zgodnie z polityką prywatności.',
    privacyPolicyUrl: '',
    marketingConsent: false,
    marketingText: 'Wyrażam zgodę na otrzymywanie informacji marketingowych.',
  })

  useEffect(() => {
    // Load settings
    setLoading(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save settings to API
      await new Promise(resolve => setTimeout(resolve, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

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
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Zgody RODO</h2>
        <p className="text-[var(--text-muted)] mt-1">Konfiguruj wymagane zgody dla klientów</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300">Ustawienia zapisane!</span>
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Require consent */}
        <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--text-muted)]" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Wymagaj zgody na przetwarzanie danych</p>
                <p className="text-sm text-[var(--text-muted)]">Klient musi zaakceptować przed rezerwacją</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, requireConsent: !settings.requireConsent })}
              className={`w-12 h-7 rounded-full transition-colors relative ${settings.requireConsent ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${settings.requireConsent ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          
          {settings.requireConsent && (
            <div className="pt-4 border-t border-[var(--border-color)]">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Treść zgody</label>
              <textarea
                value={settings.consentText}
                onChange={(e) => setSettings({ ...settings, consentText: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Privacy policy URL */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Link do polityki prywatności</label>
          <input
            type="url"
            value={settings.privacyPolicyUrl}
            onChange={(e) => setSettings({ ...settings, privacyPolicyUrl: e.target.value })}
            placeholder="https://twoja-strona.pl/polityka-prywatnosci"
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">Opcjonalnie - link będzie wyświetlany przy zgodzie</p>
        </div>

        {/* Marketing consent */}
        <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Zgoda marketingowa</p>
              <p className="text-sm text-[var(--text-muted)]">Opcjonalna zgoda na komunikację marketingową</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, marketingConsent: !settings.marketingConsent })}
              className={`w-12 h-7 rounded-full transition-colors relative ${settings.marketingConsent ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${settings.marketingConsent ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          
          {settings.marketingConsent && (
            <div className="pt-4 border-t border-[var(--border-color)]">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Treść zgody marketingowej</label>
              <textarea
                value={settings.marketingText}
                onChange={(e) => setSettings({ ...settings, marketingText: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
        </button>
      </div>
    </div>
  )
}
