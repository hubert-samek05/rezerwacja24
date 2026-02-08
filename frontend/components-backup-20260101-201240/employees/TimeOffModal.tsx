'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, AlertCircle, Trash2, Plus } from 'lucide-react'
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
    if (isOpen) {
      loadTimeOffs()
    }
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
      toast.error('Nie udało się załadować urlopów')
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
      }, {
        headers: { 'X-Tenant-ID': getTenantId() }
      })

      toast.success('Urlop został dodany')
      setShowAddForm(false)
      setFormData({
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '17:00',
        reason: ''
      })
      loadTimeOffs()
    } catch (error: any) {
      console.error('Błąd dodawania urlopu:', error)
      toast.error(error.response?.data?.message || 'Nie udało się dodać urlopu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten urlop?')) return

    try {
      const API_URL = getApiUrl()
      await axios.delete(`${API_URL}/api/time-off/${id}`, {
        headers: { 'X-Tenant-ID': getTenantId() }
      })
      toast.success('Urlop został usunięty')
      loadTimeOffs()
    } catch (error) {
      console.error('Błąd usuwania urlopu:', error)
      toast.error('Nie udało się usunąć urlopu')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffDays === 1 ? '1 dzień' : `${diffDays} dni`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Urlopy i nieobecności</h3>
              <p className="text-neutral-gray/70 text-sm mt-1">{employeeName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-gray" />
            </button>
          </div>

          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 px-4 py-3 bg-accent-neon/20 text-accent-neon rounded-lg hover:bg-accent-neon/30 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj urlop/nieobecność</span>
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Data rozpoczęcia *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Godzina
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Data zakończenia *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Godzina
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Powód
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="np. Urlop wypoczynkowy, Choroba, Szkolenie..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({
                      startDate: '',
                      startTime: '09:00',
                      endDate: '',
                      endTime: '17:00',
                      reason: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 text-neutral-gray rounded-lg hover:bg-white/10 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-neon"
                >
                  Dodaj
                </button>
              </div>
            </form>
          )}

          {/* Time Offs List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-neon mx-auto"></div>
              <p className="text-neutral-gray/70 mt-2">Ładowanie...</p>
            </div>
          ) : timeOffs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-neutral-gray/30 mx-auto mb-3" />
              <p className="text-neutral-gray/70">Brak zaplanowanych urlopów</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeOffs.map((timeOff) => (
                <motion.div
                  key={timeOff.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-accent-neon" />
                        <span className="text-white font-semibold">
                          {formatDate(timeOff.startTime)} - {formatDate(timeOff.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-neutral-gray/70">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{getDuration(timeOff.startTime, timeOff.endTime)}</span>
                        </span>
                        {timeOff.reason && (
                          <span className="flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{timeOff.reason}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(timeOff.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
