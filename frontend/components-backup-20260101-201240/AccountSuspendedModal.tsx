'use client'

import { useState } from 'react'
import { AlertTriangle, CreditCard, X, Loader2 } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'

interface AccountSuspendedModalProps {
  isOpen: boolean
  reason?: string
  onClose?: () => void
}

export default function AccountSuspendedModal({ isOpen, reason, onClose }: AccountSuspendedModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleUpdatePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const session = localStorage.getItem('rezerwacja24_session')
      if (!session) {
        setError('Sesja wygasła. Zaloguj się ponownie.')
        return
      }

      const { tenantId, token } = JSON.parse(session)
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/billing/portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/settings/subscription`,
        }),
      })

      if (!response.ok) {
        throw new Error('Nie udało się utworzyć sesji płatności')
      }

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Brak URL do portalu płatności')
      }
    } catch (err: any) {
      console.error('Error opening payment portal:', err)
      setError(err.message || 'Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-dark-lighter border border-red-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close button - only if onClose provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-gray hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          Konto zawieszone
        </h2>

        {/* Description */}
        <p className="text-neutral-gray text-center mb-4">
          Twoje konto zostało tymczasowo zawieszone z powodu problemów z płatnością.
        </p>

        {reason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm text-center">
              {reason}
            </p>
          </div>
        )}

        <p className="text-neutral-gray text-center mb-6 text-sm">
          Zaktualizuj metodę płatności, aby przywrócić pełny dostęp do konta.
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleUpdatePayment}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-accent-neon to-accent-cyan text-dark font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Przekierowywanie...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Zaktualizuj metodę płatności
            </>
          )}
        </button>

        {/* Help text */}
        <p className="text-neutral-gray/60 text-xs text-center mt-4">
          Potrzebujesz pomocy? Napisz do nas: kontakt@rezerwacja24.pl
        </p>
      </div>
    </div>
  )
}
