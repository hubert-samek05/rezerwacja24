'use client'

import { useState } from 'react'
import { Calendar, Save, Loader2, Info, Clock, XCircle } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId, getTenantConfig } from '@/lib/tenant'
import toast from 'react-hot-toast'

interface Props {
  companyData: any
  setCompanyData: (data: any) => void
  onSave: () => void
  isLoading: boolean
}

// Opcje wyprzedzenia rezerwacji
const advanceOptions = [
  { value: 0, label: 'Bez limitu', description: 'Klienci mogą rezerwować na dowolny termin w przyszłości' },
  { value: 1, label: '1 dzień', description: 'Rezerwacje tylko na jutro' },
  { value: 3, label: '3 dni', description: 'Rezerwacje do 3 dni w przód' },
  { value: 7, label: '1 tydzień', description: 'Rezerwacje do tygodnia w przód' },
  { value: 14, label: '2 tygodnie', description: 'Rezerwacje do 2 tygodni w przód' },
  { value: 21, label: '3 tygodnie', description: 'Rezerwacje do 3 tygodni w przód' },
  { value: 30, label: '1 miesiąc', description: 'Rezerwacje do miesiąca w przód' },
  { value: 60, label: '2 miesiące', description: 'Rezerwacje do 2 miesięcy w przód' },
  { value: 90, label: '3 miesiące', description: 'Rezerwacje do 3 miesięcy w przód' },
]

// Opcje minimalnego czasu przed anulowaniem/przesunięciem
const cancellationOptions = [
  { value: 0, label: 'Bez ograniczeń', description: 'Klient może anulować/przesunąć w każdej chwili' },
  { value: 1, label: '1 godzina', description: 'Minimum 1 godzina przed wizytą' },
  { value: 2, label: '2 godziny', description: 'Minimum 2 godziny przed wizytą' },
  { value: 4, label: '4 godziny', description: 'Minimum 4 godziny przed wizytą' },
  { value: 12, label: '12 godzin', description: 'Minimum 12 godzin przed wizytą' },
  { value: 24, label: '24 godziny (1 dzień)', description: 'Minimum 24 godziny przed wizytą' },
  { value: 48, label: '48 godzin (2 dni)', description: 'Minimum 48 godzin przed wizytą' },
  { value: 72, label: '72 godziny (3 dni)', description: 'Minimum 72 godziny przed wizytą' },
]

export default function BookingSettingsTab({ companyData, setCompanyData, onSave, isLoading }: Props) {
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Pobierz aktualne ustawienie z pageSettings
  const pageSettings = companyData?.pageSettings || {}
  const bookingAdvanceDays = pageSettings.bookingAdvanceDays ?? 0 // 0 = bez limitu
  const minCancellationHours = pageSettings.minCancellationHours ?? 0 // 0 = bez ograniczeń

  const updateBookingAdvanceDays = (days: number) => {
    setCompanyData({
      ...companyData,
      pageSettings: {
        ...pageSettings,
        bookingAdvanceDays: days
      }
    })
  }

  const updateMinCancellationHours = (hours: number) => {
    setCompanyData({
      ...companyData,
      pageSettings: {
        ...pageSettings,
        minCancellationHours: hours
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
          pageSettings: {
            ...pageSettings,
            bookingAdvanceDays,
            minCancellationHours
          }
        })
      })
      
      if (response.ok) {
        toast.success('Ustawienia rezerwacji zapisane')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        toast.error('Błąd zapisu ustawień')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Wystąpił błąd')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Ustawienia rezerwacji</h2>
        <p className="text-[var(--text-muted)] mt-1">
          Konfiguracja zasad rezerwacji dla klientów końcowych
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
          Zapisano pomyślnie!
        </div>
      )}

      {/* Maksymalne wyprzedzenie rezerwacji */}
      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Maksymalne wyprzedzenie rezerwacji
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Określ, z jakim maksymalnym wyprzedzeniem klienci mogą rezerwować terminy
          </p>
        </div>

        <div className="grid gap-3">
          {advanceOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                bookingAdvanceDays === option.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-green-300'
              }`}
            >
              <input
                type="radio"
                name="bookingAdvanceDays"
                value={option.value}
                checked={bookingAdvanceDays === option.value}
                onChange={() => updateBookingAdvanceDays(option.value)}
                className="mt-1 w-4 h-4 text-green-500 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">{option.label}</div>
                <div className="text-sm text-[var(--text-muted)]">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Przykład:</strong> Jeśli ustawisz "2 tygodnie", klient rezerwujący 1 stycznia 
            będzie mógł wybrać terminy tylko do 15 stycznia. Terminy późniejsze nie będą widoczne 
            w kalendarzu rezerwacji.
          </div>
        </div>
      </div>

      {/* Minimalny czas anulowania/przesunięcia */}
      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Minimalny czas na anulowanie/przesunięcie
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Określ, z jakim minimalnym wyprzedzeniem klient może anulować lub przesunąć rezerwację
          </p>
        </div>

        <div className="grid gap-3">
          {cancellationOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                minCancellationHours === option.value
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-orange-300'
              }`}
            >
              <input
                type="radio"
                name="minCancellationHours"
                value={option.value}
                checked={minCancellationHours === option.value}
                onChange={() => updateMinCancellationHours(option.value)}
                className="mt-1 w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">{option.label}</div>
                <div className="text-sm text-[var(--text-muted)]">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Info box - bez zaliczki */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Dla firm bez zaliczek:</strong> Klient nie będzie mógł anulować ani przesunąć 
            rezerwacji jeśli do wizyty zostało mniej niż ustawiony czas.
          </div>
        </div>

        {/* Info box - z zaliczką */}
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Info className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-700 dark:text-green-400">
            <strong>Dla firm z zaliczkami:</strong> Klient może anulować rezerwację w każdej chwili. 
            Zaliczka (opłata rezerwacyjna) jest <strong>bezzwrotna</strong> i zostaje automatycznie 
            zatrzymana jako rekompensata za anulowaną wizytę.
          </div>
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
