'use client'

import { useState } from 'react'
import { Globe, Lock, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { CompanyData } from '@/lib/company'
import { getTenantId } from '@/lib/storage'

interface SubdomainTabProps {
  companyData: CompanyData
  onUpdate: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

export default function SubdomainTab({ companyData, onUpdate }: SubdomainTabProps) {
  const [subdomainInput, setSubdomainInput] = useState(companyData.subdomain)
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubdomainChange = async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomainInput(cleaned)
    setError(null)
    
    if (cleaned.length >= 3 && cleaned !== companyData.subdomain) {
      setIsCheckingAvailability(true)
      try {
        const response = await fetch(`${API_URL}/api/tenants/check-subdomain/${cleaned}`)
        const data = await response.json()
        setSubdomainAvailable(data.available)
      } catch (error) {
        setSubdomainAvailable(null)
      } finally {
        setIsCheckingAvailability(false)
      }
    } else {
      setSubdomainAvailable(null)
    }
  }

  const handleSubdomainSave = async () => {
    if (!subdomainAvailable && subdomainInput !== companyData.subdomain) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const tenantId = getTenantId()
      if (!tenantId) throw new Error('Brak ID firmy')

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subdomain: subdomainInput }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Nie udało się zapisać subdomeny')
      }
      
      setShowSuccess(true)
      onUpdate()
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message || 'Wystąpił błąd podczas zapisywania')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Subdomena</h2>
        <p className="text-[var(--text-muted)] mt-1">Adres Twojej strony rezerwacji</p>
      </div>

      {/* Info box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-6">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Ważne:</strong> Subdomenę można zmienić tylko raz. Po zapisaniu:
        </p>
        <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 ml-4 list-disc space-y-1">
          <li>Zostanie wygenerowany certyfikat SSL (do 60 sekund)</li>
          <li>Subdomena zostanie zablokowana</li>
        </ul>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 mb-6">
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-green-700 dark:text-green-300">Subdomena została zapisana!</span>
        </div>
      )}

      <div className="space-y-6">
        {companyData.subdomainLocked ? (
          <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-[var(--text-primary)]">Subdomena zablokowana</span>
            </div>
            <p className="text-[var(--text-muted)] mb-4">
              Twoja subdomena została ustawiona i nie może być już zmieniona.
            </p>
            <a 
              href={`https://${companyData.subdomain}.rezerwacja24.pl`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
            >
              <Globe className="w-5 h-5 text-[var(--text-muted)]" />
              <span>{companyData.subdomain}.rezerwacja24.pl</span>
              <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
            </a>
          </div>
        ) : (
          <div className="bg-[var(--bg-primary)] rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Twoja subdomena
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={subdomainInput}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    className="w-full px-4 py-3.5 pr-36 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                    placeholder="moja-firma"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
                    .rezerwacja24.pl
                  </span>
                </div>
                {isCheckingAvailability && (
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
                )}
                {!isCheckingAvailability && subdomainAvailable !== null && (
                  <div className={`p-2 rounded-lg ${subdomainAvailable ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {subdomainAvailable ? (
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                )}
              </div>
              {subdomainAvailable === false && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">Ta subdomena jest już zajęta</p>
              )}
              {subdomainAvailable === true && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">Ta subdomena jest dostępna!</p>
              )}
            </div>

            {/* Preview */}
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <p className="text-sm text-[var(--text-muted)] mb-1">Podgląd adresu:</p>
              <p className="text-[var(--text-primary)] font-medium">
                https://{subdomainInput || 'twoja-subdomena'}.rezerwacja24.pl
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSubdomainSave}
                disabled={(!subdomainAvailable && subdomainInput !== companyData.subdomain) || isLoading || isCheckingAvailability}
                className="px-8 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Zapisywanie...' : 'Zapisz subdomenę'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
