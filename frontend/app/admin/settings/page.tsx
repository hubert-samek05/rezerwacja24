'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Save,
  CreditCard,
  Mail,
  Bell,
  Shield,
  Globe,
  Database,
  CheckCircle
} from 'lucide-react'

interface PlatformSettings {
  siteName: string
  siteUrl: string
  supportEmail: string
  defaultTrialDays: number
  defaultPlanPrice: number
  stripeEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  maintenanceMode: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'Rezerwacja24',
    siteUrl: 'https://rezerwacja24.pl',
    supportEmail: 'support@rezerwacja24.pl',
    defaultTrialDays: 7,
    defaultPlanPrice: 79.99,
    stripeEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Symulacja zapisu - w przyszłości można dodać API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const settingSections = [
    {
      title: 'Ogólne',
      icon: Globe,
      fields: [
        { key: 'siteName', label: 'Nazwa platformy', type: 'text' },
        { key: 'siteUrl', label: 'URL platformy', type: 'text' },
        { key: 'supportEmail', label: 'Email wsparcia', type: 'email' },
      ]
    },
    {
      title: 'Subskrypcje',
      icon: CreditCard,
      fields: [
        { key: 'defaultTrialDays', label: 'Domyślne dni trialu', type: 'number' },
        { key: 'defaultPlanPrice', label: 'Domyślna cena planu (PLN)', type: 'number' },
        { key: 'stripeEnabled', label: 'Stripe włączony', type: 'toggle' },
      ]
    },
    {
      title: 'Powiadomienia',
      icon: Bell,
      fields: [
        { key: 'emailNotifications', label: 'Powiadomienia email', type: 'toggle' },
        { key: 'smsNotifications', label: 'Powiadomienia SMS', type: 'toggle' },
      ]
    },
    {
      title: 'System',
      icon: Shield,
      fields: [
        { key: 'maintenanceMode', label: 'Tryb konserwacji', type: 'toggle' },
      ]
    },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ustawienia</h1>
          <p className="text-gray-400">Konfiguracja platformy Rezerwacja24</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : saved ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {saved ? 'Zapisano!' : 'Zapisz zmiany'}
        </button>
      </div>

      <div className="space-y-6">
        {settingSections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.title} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center">
                <Icon className="w-5 h-5 text-red-400 mr-3" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <div className="p-6 space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between">
                    <label className="text-gray-300">{field.label}</label>
                    {field.type === 'toggle' ? (
                      <button
                        onClick={() => setSettings(s => ({ ...s, [field.key]: !s[field.key as keyof PlatformSettings] }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings[field.key as keyof PlatformSettings] ? 'bg-red-500' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings[field.key as keyof PlatformSettings] ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <input
                        type={field.type}
                        value={settings[field.key as keyof PlatformSettings] as string | number}
                        onChange={(e) => setSettings(s => ({ 
                          ...s, 
                          [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value 
                        }))}
                        className="w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Database Info */}
      <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center">
          <Database className="w-5 h-5 text-red-400 mr-3" />
          <h2 className="text-lg font-semibold text-white">Informacje o systemie</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Wersja</div>
              <div className="text-white font-medium">1.0.0</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Środowisko</div>
              <div className="text-white font-medium">Production</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Ostatnia aktualizacja</div>
              <div className="text-white font-medium">{new Date().toLocaleDateString('pl-PL')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-gray-800 rounded-xl border border-red-500/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/50 flex items-center">
          <Shield className="w-5 h-5 text-red-500 mr-3" />
          <h2 className="text-lg font-semibold text-red-400">Strefa niebezpieczna</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-4">
            Te akcje są nieodwracalne. Upewnij się, że wiesz co robisz.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors">
              Wyczyść cache
            </button>
            <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors">
              Zresetuj statystyki
            </button>
            <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors">
              Eksportuj dane
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
