'use client'

import { useState, useEffect } from 'react'
import { Send, Users, User, Bell, Loader2, Check, Search } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'
import toast from 'react-hot-toast'

interface Tenant {
  id: string
  name: string
  email: string
  subdomain: string
}

export default function AdminNotificationsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      const API_URL = getApiUrl()
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/api/admin/tenants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTenants(Array.isArray(data) ? data : data.tenants || [])
      }
    } catch (error) {
      console.error('Error loading tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Wypełnij tytuł i treść')
      return
    }
    
    if (!sendToAll && selectedTenants.length === 0) {
      toast.error('Wybierz odbiorców lub zaznacz "Wyślij do wszystkich"')
      return
    }

    try {
      setSending(true)
      const API_URL = getApiUrl()
      const token = localStorage.getItem('token')
      
      const targetTenants = sendToAll ? tenants.map(t => t.id) : selectedTenants
      
      // Wyślij powiadomienie do każdego tenanta
      const promises = targetTenants.map(tenantId => 
        fetch(`${API_URL}/api/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId
          },
          body: JSON.stringify({
            type: formData.type.toUpperCase(),
            title: formData.title,
            message: formData.message,
            userId: tenantId // Właściciel tenanta
          })
        })
      )
      
      await Promise.all(promises)
      
      toast.success(`Wysłano powiadomienie do ${targetTenants.length} odbiorców`)
      setFormData({ title: '', message: '', type: 'info' })
      setSelectedTenants([])
      setSendToAll(false)
    } catch (error) {
      console.error('Error sending notifications:', error)
      toast.error('Błąd wysyłania powiadomień')
    } finally {
      setSending(false)
    }
  }

  const toggleTenant = (id: string) => {
    setSelectedTenants(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Wyślij powiadomienie</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Treść powiadomienia</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Typ</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
              >
                <option value="info">Informacja</option>
                <option value="success">Sukces</option>
                <option value="alert">Ważne</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tytuł</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="np. Nowa funkcja dostępna!"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Treść</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Treść powiadomienia..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white resize-none"
              />
            </div>

            {/* Preview */}
            {formData.title && (
              <div className="border border-gray-600 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Podgląd:</p>
                <div className="flex items-start gap-3">
                  <Bell className={`w-5 h-5 ${formData.type === 'alert' ? 'text-red-400' : formData.type === 'success' ? 'text-green-400' : 'text-blue-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{formData.title}</p>
                    <p className="text-xs text-gray-400">{formData.message}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {sending ? 'Wysyłanie...' : 'Wyślij powiadomienie'}
            </button>
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Odbiorcy</h2>

          {/* Send to all */}
          <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={(e) => {
                setSendToAll(e.target.checked)
                if (e.target.checked) setSelectedTenants([])
              }}
              className="rounded"
            />
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Wyślij do wszystkich</p>
              <p className="text-xs text-gray-400">{tenants.length} firm</p>
            </div>
          </label>

          {!sendToAll && (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj firmy..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                />
              </div>

              {/* Selected count */}
              {selectedTenants.length > 0 && (
                <p className="text-sm text-blue-400 mb-3">
                  Wybrano: {selectedTenants.length} firm
                </p>
              )}

              {/* Tenants list */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Brak wyników</p>
                ) : (
                  filteredTenants.map((tenant) => (
                    <label
                      key={tenant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTenants.includes(tenant.id) 
                          ? 'bg-blue-900/30 border border-blue-500' 
                          : 'bg-gray-700 hover:bg-gray-650'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTenants.includes(tenant.id)}
                        onChange={() => toggleTenant(tenant.id)}
                        className="rounded"
                      />
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{tenant.name}</p>
                        <p className="text-xs text-gray-400 truncate">{tenant.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
