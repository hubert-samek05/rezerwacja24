'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Trash2, Plus } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getApiUrl, getTenantId } from '@/lib/api-url'

interface TimeOff {
  id: string
  employeeId: string
  startTime: string
  endTime: string
  reason?: string
  createdAt: string
}

interface TimeOffModalProps {
  employeeId: string
  employeeName: string
  isOpen: boolean
  onClose: () => void
}

export default function TimeOffModal({ employeeId, employeeName, isOpen, onClose }: TimeOffModalProps) {
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    reason: ''
  })

  useEffect(() => {
    if (isOpen) loadTimeOffs()
  }, [isOpen, employeeId])

  const loadTimeOffs = async () => {
    try {
      setLoading(true)
      const API_URL = getApiUrl()
      const response = await axios.get(`${API_URL}/api/time-off`, {
        params: { employeeId },
        headers: { 'X-Tenant-ID': getTenantId() }
      })
      setTimeOffs(response.data)
    } catch (error) {
      console.error('Błąd ładowania urlopów:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }
    try {
      const startTime = new Date(`${formData.startDate}T${formData.startTime}:00`)
      const endTime = new Date(`${formData.endDate}T${formData.endTime}:00`)
      const API_URL = getApiUrl()
      await axios.post(`${API_URL}/api/time-off`, {
        employeeId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: formData.reason || 'Urlop'
      }, { headers: { 'X-Tenant-ID': getTenantId() } })
      toast.success('Urlop został dodany')
      setShowAddForm(false)
      setFormData({ startDate: '', startTime: '09:00', endDate: '', endTime: '17:00', reason: '' })
      loadTimeOffs()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nie udało się dodać urlopu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten urlop?')) return
    try {
      const API_URL = getApiUrl()
      await axios.delete(`${API_URL}/api/time-off/${id}`, { headers: { 'X-Tenant-ID': getTenantId() } })
      toast.success('Urlop został usunięty')
      loadTimeOffs()
    } catch (error) {
      toast.error('Nie udało się usunąć urlopu')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getDuration = (start: string, end: string) => {
    const diffDays = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
    return diffDays === 1 ? '1 dzień' : `${diffDays} dni`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Urlopy i nieobecności</h3>
            <p className="text-sm text-[var(--text-muted)]">{employeeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-muted)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors mb-4"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj urlop</span>
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-[var(--bg-primary)] rounded-xl p-4 mb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">Data od</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">Data do</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">Powód (opcjonalnie)</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  placeholder="np. Urlop wypoczynkowy"
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">
                  Anuluj
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium">
                  Dodaj
                </button>
              </div>
            </form>
          )}

          {/* Time Offs List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--text-primary)]"></div>
            </div>
          ) : timeOffs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[var(--text-muted)]">Brak zaplanowanych urlopów</p>
            </div>
          ) : (
            <div className="space-y-2">
              {timeOffs.map(timeOff => (
                <div key={timeOff.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {formatDate(timeOff.startTime)} - {formatDate(timeOff.endTime)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {getDuration(timeOff.startTime, timeOff.endTime)} • {timeOff.reason || 'Urlop'}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(timeOff.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
