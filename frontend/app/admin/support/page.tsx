'use client'

import { useState, useEffect } from 'react'
import { Bug, Lightbulb, HelpCircle, MessageSquare, Clock, CheckCircle, Send, X, Loader2, Mail } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'

interface Ticket {
  id: string
  tenantId: string
  userId: string
  userEmail: string
  type: string
  subject: string
  message: string
  priority: string
  status: string
  createdAt: string
  closedAt?: string
  responses: TicketResponse[]
}

interface TicketResponse {
  id: string
  message: string
  isAdminResponse: boolean
  createdAt: string
}

interface Stats {
  total: number
  open: number
  inProgress: number
  closed: number
  bugs: number
  features: number
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{ status: string; type: string }>({ status: '', type: '' })
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responseText, setResponseText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      setLoading(true)
      const API_URL = getApiUrl()
      
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.type) params.append('type', filter.type)
      
      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/support/admin/tickets?${params}`),
        fetch(`${API_URL}/api/support/admin/stats`)
      ])
      
      if (ticketsRes.ok) setTickets(await ticketsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!selectedTicket || !responseText.trim()) return
    
    try {
      setSending(true)
      const API_URL = getApiUrl()
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      const response = await fetch(`${API_URL}/api/support/admin/tickets/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, message: responseText })
      })
      
      if (response.ok) {
        setResponseText('')
        loadData()
        // Odśwież wybrany ticket
        const ticketRes = await fetch(`${API_URL}/api/support/tickets/${selectedTicket.id}`)
        if (ticketRes.ok) setSelectedTicket(await ticketRes.json())
      }
    } catch (error) {
      console.error('Error responding:', error)
    } finally {
      setSending(false)
    }
  }

  const handleClose = async (ticketId: string) => {
    try {
      const API_URL = getApiUrl()
      await fetch(`${API_URL}/api/support/admin/tickets/${ticketId}/close`, { method: 'PATCH' })
      loadData()
      if (selectedTicket?.id === ticketId) setSelectedTicket(null)
    } catch (error) {
      console.error('Error closing ticket:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4 text-red-500" />
      case 'feature': return <Lightbulb className="w-4 h-4 text-amber-500" />
      case 'question': return <HelpCircle className="w-4 h-4 text-blue-500" />
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Otwarte</span>
      case 'in_progress': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">W trakcie</span>
      case 'closed': return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Zamknięte</span>
      default: return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Wysoki</span>
      case 'medium': return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Średni</span>
      case 'low': return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">Niski</span>
      default: return null
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Zgłoszenia pomocy</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Wszystkie</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">Otwarte</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.open}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-blue-400 text-sm">W trakcie</p>
            <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-green-400 text-sm">Zamknięte</p>
            <p className="text-2xl font-bold text-green-400">{stats.closed}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-red-400 text-sm">Błędy</p>
            <p className="text-2xl font-bold text-red-400">{stats.bugs}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-amber-400 text-sm">Propozycje</p>
            <p className="text-2xl font-bold text-amber-400">{stats.features}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
        >
          <option value="">Wszystkie statusy</option>
          <option value="open">Otwarte</option>
          <option value="in_progress">W trakcie</option>
          <option value="closed">Zamknięte</option>
        </select>
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
        >
          <option value="">Wszystkie typy</option>
          <option value="bug">Błędy</option>
          <option value="feature">Propozycje</option>
          <option value="question">Pytania</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Tickets List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Brak zgłoszeń</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors ${selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(ticket.type)}
                      <span className="font-medium text-white">{ticket.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">{ticket.message}</p>
                  <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="font-medium">{ticket.userEmail}</span>
                    </div>
                    <span className="text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('pl-PL')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="w-96 bg-gray-800 rounded-lg p-4 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Szczegóły zgłoszenia</h3>
              <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-700 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-gray-500">Temat</p>
                <p className="text-sm text-white">{selectedTicket.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Wiadomość</p>
                <p className="text-sm text-gray-300">{selectedTicket.message}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Od</p>
                <p className="text-sm text-white">{selectedTicket.userEmail}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500">Typ</p>
                  <div className="flex items-center gap-1">{getTypeIcon(selectedTicket.type)}<span className="text-sm text-white capitalize">{selectedTicket.type}</span></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priorytet</p>
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
            </div>

            {/* Responses */}
            {selectedTicket.responses?.length > 0 && (
              <div className="border-t border-gray-700 pt-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">Odpowiedzi</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTicket.responses.map((resp) => (
                    <div key={resp.id} className={`p-2 rounded text-sm ${resp.isAdminResponse ? 'bg-blue-900/30 text-blue-200' : 'bg-gray-700 text-gray-300'}`}>
                      <p>{resp.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(resp.createdAt).toLocaleString('pl-PL')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Form */}
            {selectedTicket.status !== 'closed' && (
              <div className="border-t border-gray-700 pt-4">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Napisz odpowiedź..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white resize-none mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRespond}
                    disabled={sending || !responseText.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Odpowiedz
                  </button>
                  <button
                    onClick={() => handleClose(selectedTicket.id)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
