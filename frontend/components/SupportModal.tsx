'use client'

import { useState } from 'react'
import { X, Send, Loader2, Bug, Lightbulb, HelpCircle, MessageSquare } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'
import { getTenantId, getCurrentUserId } from '@/lib/storage'
import toast from 'react-hot-toast'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'bug' | 'feature' | 'question'
}

export default function SupportModal({ isOpen, onClose, type }: SupportModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  })

  const getTitle = () => {
    switch (type) {
      case 'bug': return 'Zgłoś problem'
      case 'feature': return 'Zaproponuj funkcję'
      case 'question': return 'Zadaj pytanie'
      default: return 'Kontakt'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'bug': return <Bug className="w-5 h-5" />
      case 'feature': return <Lightbulb className="w-5 h-5" />
      case 'question': return <HelpCircle className="w-5 h-5" />
      default: return <MessageSquare className="w-5 h-5" />
    }
  }

  const getPlaceholder = () => {
    switch (type) {
      case 'bug': return 'Opisz problem, który napotkałeś. Co się stało? Jakie kroki doprowadziły do błędu?'
      case 'feature': return 'Opisz swoją propozycję. Jaka funkcja byłaby przydatna? Jak powinna działać?'
      case 'question': return 'Zadaj pytanie dotyczące systemu...'
      default: return 'Twoja wiadomość...'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.message) {
      toast.error('Wypełnij wszystkie pola')
      return
    }

    try {
      setLoading(true)
      const API_URL = getApiUrl()
      const tenantId = getTenantId()
      const userId = getCurrentUserId()
      
      // Pobierz email z sesji
      const session = localStorage.getItem('rezerwacja24_session')
      const userEmail = session ? JSON.parse(session).email : ''

      const response = await fetch(`${API_URL}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || '',
          'X-User-ID': userId || '',
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          type,
          subject: formData.subject,
          message: formData.message,
          priority: formData.priority,
        }),
      })

      if (!response.ok) throw new Error('Błąd wysyłania')

      toast.success('Zgłoszenie zostało wysłane!')
      setFormData({ subject: '', message: '', priority: 'medium' })
      onClose()
    } catch (error) {
      toast.error('Nie udało się wysłać zgłoszenia')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'bug' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : type === 'feature' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              {getIcon()}
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">{getTitle()}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1.5">Temat</label>
            <input
              type="text"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              required
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
              placeholder={type === 'bug' ? 'np. Błąd przy tworzeniu rezerwacji' : type === 'feature' ? 'np. Integracja z Google Calendar' : 'np. Jak zmienić godziny pracy?'}
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1.5">Opis</label>
            <textarea
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              required
              rows={5}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none resize-none"
              placeholder={getPlaceholder()}
            />
          </div>

          {type === 'bug' && (
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">Priorytet</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
              >
                <option value="low">Niski - drobna niedogodność</option>
                <option value="medium">Średni - utrudnia pracę</option>
                <option value="high">Wysoki - blokuje pracę</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">
              Anuluj
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Wysyłanie...' : 'Wyślij'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
