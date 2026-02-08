'use client'

import { useState, useEffect } from 'react'
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Check, Loader2, X } from 'lucide-react'
import { getTenantId } from '@/lib/storage'

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
}

export default function ApiTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const tenantId = getTenantId()
      if (!tenantId) { setLoading(false); return }
      
      const response = await fetch('/api/api-keys', { headers: { 'x-tenant-id': tenantId } })
      if (response.ok) {
        const data = await response.json()
        setApiKeys(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key)
    setCopied(keyId)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerateKey = async () => {
    try {
      setGenerating(true)
      const tenantId = getTenantId()
      if (!tenantId) return

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ name: newKeyName || 'Nowy klucz API' }),
      })

      if (response.ok) {
        setNewKeyName('')
        setShowNewKeyModal(false)
        loadApiKeys()
      }
    } catch (error) {
      console.error('Error generating key:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten klucz API?')) return
    try {
      const tenantId = getTenantId()
      await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenantId || '' },
      })
      loadApiKeys()
    } catch (error) {
      console.error('Error deleting key:', error)
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
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Klucze API</h2>
        <p className="text-[var(--text-muted)] mt-1">Zarządzaj dostępem programistycznym do API</p>
      </div>

      <div className="space-y-6">
        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Klucze API pozwalają na integrację z zewnętrznymi aplikacjami. Traktuj je jak hasła - nie udostępniaj publicznie.
          </p>
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Wygeneruj nowy klucz
        </button>

        {/* Keys list */}
        {apiKeys.length === 0 ? (
          <div className="p-10 bg-[var(--bg-primary)] rounded-2xl text-center">
            <Key className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">Brak kluczy API</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Wygeneruj pierwszy klucz, aby rozpocząć</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-5 bg-[var(--bg-primary)] rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{apiKey.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Utworzono: {new Date(apiKey.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm font-mono text-[var(--text-muted)] overflow-hidden">
                    {showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowKeys(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                    className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg"
                  >
                    {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4 text-[var(--text-muted)]" /> : <Eye className="w-4 h-4 text-[var(--text-muted)]" />}
                  </button>
                  <button
                    onClick={() => handleCopy(apiKey.key, apiKey.id)}
                    className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg"
                  >
                    {copied === apiKey.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewKeyModal(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full max-h-[calc(100vh-120px)] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Nowy klucz API</h3>
              <button onClick={() => setShowNewKeyModal(false)} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Nazwa klucza</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="np. Integracja z moją aplikacją"
                className="w-full px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowNewKeyModal(false)} className="flex-1 px-4 py-3.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-full hover:bg-[var(--bg-card-hover)] transition-all duration-200">
                Anuluj
              </button>
              <button
                onClick={handleGenerateKey}
                disabled={generating}
                className="flex-1 px-4 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                {generating ? 'Generowanie...' : 'Wygeneruj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
