'use client'

import { useState } from 'react'
import { Shield, Smartphone, Check, X, Loader2 } from 'lucide-react'

export default function TwoFactorTab() {
  const [enabled, setEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEnable = async () => {
    if (!enabled) {
      setShowSetup(true)
    } else {
      // Disable 2FA
      setEnabled(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      // Verify code with API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEnabled(true)
      setShowSetup(false)
      setVerificationCode('')
    } catch (error) {
      console.error('Verification failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-6">Uwierzytelnianie dwuskładnikowe (2FA)</h3>
      
      <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-[var(--bg-card)]'}`}>
              <Shield className={`w-6 h-6 ${enabled ? 'text-green-600 dark:text-green-400' : 'text-[var(--text-muted)]'}`} />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {enabled ? 'Włączone' : 'Wyłączone'}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {enabled ? 'Twoje konto jest chronione' : 'Dodaj dodatkową warstwę zabezpieczeń'}
              </p>
            </div>
          </div>
          <button
            onClick={handleEnable}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              enabled 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'
            }`}
          >
            {enabled ? 'Wyłącz' : 'Włącz 2FA'}
          </button>
        </div>

        {/* Setup flow */}
        {showSetup && !enabled && (
          <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)] mb-1">Skonfiguruj aplikację</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Zeskanuj kod QR w aplikacji Google Authenticator lub Microsoft Authenticator
                </p>
              </div>
            </div>

            {/* QR Code placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                <div className="w-40 h-40 bg-[var(--bg-primary)] rounded-lg flex items-center justify-center">
                  <p className="text-xs text-[var(--text-muted)]">Kod QR</p>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="max-w-xs mx-auto">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 text-center">
                Wprowadź kod z aplikacji
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-center text-2xl font-mono tracking-widest text-[var(--text-primary)] focus:outline-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowSetup(false); setVerificationCode('') }}
                  className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl text-sm"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || loading}
                  className="flex-1 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Zweryfikuj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
