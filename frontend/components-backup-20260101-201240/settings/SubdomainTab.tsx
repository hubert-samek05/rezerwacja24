'use client'

import { useState, useEffect } from 'react'
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
        console.error('Error checking subdomain:', error)
        setSubdomainAvailable(null)
      } finally {
        setIsCheckingAvailability(false)
      }
    } else if (cleaned === companyData.subdomain) {
      setSubdomainAvailable(null)
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
      if (!tenantId) {
        throw new Error('Brak ID firmy')
      }

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
      setTimeout(() => {
        setShowSuccess(false)
        // Opcjonalnie przekieruj na nową subdomenę
        // window.location.href = `https://${subdomainInput}.rezerwacja24.pl`
      }, 3000)
    } catch (error: any) {
      console.error('Error saving subdomain:', error)
      setError(error.message || 'Wystąpił błąd podczas zapisywania')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Subdomena</h2>
      
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Ważne:</strong> Subdomenę można zmienić tylko raz! Po zapisaniu zostanie automatycznie:
        </p>
        <ul className="text-sm text-blue-300 mt-2 ml-4 list-disc">
          <li>Wygenerowany certyfikat SSL (proces do 60 sekund)</li>
          <li>Subdomena zostanie zablokowana i nie będzie można jej zmienić</li>
        </ul>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-white">{error}</span>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-accent-neon/20 border border-accent-neon rounded-lg flex items-center space-x-3">
          <Check className="w-5 h-5 text-accent-neon" />
          <span className="text-white">Subdomena została zapisana i strona wygenerowana!</span>
        </div>
      )}

      {companyData.subdomainLocked ? (
        <div className="space-y-4">
          <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-accent-neon" />
              <span className="text-lg font-medium text-white">Subdomena zablokowana</span>
            </div>
            <p className="text-neutral-gray mb-4">
              Twoja subdomena została ustawiona i nie może być już zmieniona. Subdomenę można zmienić tylko raz.
            </p>
            <div className="flex items-center space-x-2 p-4 bg-primary-green/10 border border-primary-green/30 rounded-lg">
              <Globe className="w-5 h-5 text-accent-neon" />
              <a 
                href={`https://${companyData.subdomain}.rezerwacja24.pl`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-neon hover:underline flex items-center space-x-2"
              >
                <span>{companyData.subdomain}.rezerwacja24.pl</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-gray mb-2">
              Twoja subdomena
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={subdomainInput}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className="input-glass w-full pr-32"
                  placeholder="moja-firma"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray">
                  .rezerwacja24.pl
                </span>
              </div>
              {isCheckingAvailability && (
                <div className="p-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                </div>
              )}
              {!isCheckingAvailability && subdomainAvailable !== null && (
                <div className={`p-2 rounded-lg ${
                  subdomainAvailable ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {subdomainAvailable ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {subdomainAvailable === false && (
              <p className="text-sm text-red-400 mt-2">
                Ta subdomena jest już zajęta lub niedostępna
              </p>
            )}
            {subdomainAvailable === true && (
              <p className="text-sm text-green-400 mt-2">
                Ta subdomena jest dostępna!
              </p>
            )}
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-white font-medium mb-2">Podgląd:</h3>
            <p className="text-accent-neon">
              https://{subdomainInput || 'twoja-subdomena'}.rezerwacja24.pl
            </p>
          </div>

          <button
            onClick={handleSubdomainSave}
            disabled={(!subdomainAvailable && subdomainInput !== companyData.subdomain) || isLoading || isCheckingAvailability}
            className="btn-neon flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Zapisywanie...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Zapisz subdomenę</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
