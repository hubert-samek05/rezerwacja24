'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar, Save } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getApiUrl, getTenantId } from '@/lib/api-url'

interface WorkingHours {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
}

interface AvailabilityModalProps {
  employeeId: string
  employeeName: string
  isOpen: boolean
  onClose: () => void
}

const DAYS = [
  { key: 'monday', label: 'Poniedziałek' },
  { key: 'tuesday', label: 'Wtorek' },
  { key: 'wednesday', label: 'Środa' },
  { key: 'thursday', label: 'Czwartek' },
  { key: 'friday', label: 'Piątek' },
  { key: 'saturday', label: 'Sobota' },
  { key: 'sunday', label: 'Niedziela' }
]

export default function AvailabilityModal({ employeeId, employeeName, isOpen, onClose }: AvailabilityModalProps) {
  const [loading, setLoading] = useState(false)
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(
    DAYS.map(day => ({
      day: day.key,
      enabled: true,
      startTime: '09:00',
      endTime: '17:00'
    }))
  )

  useEffect(() => {
    if (isOpen) {
      loadAvailability()
    }
  }, [isOpen, employeeId])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      const API_URL = getApiUrl()
      const response = await axios.get(`${API_URL}/api/employees/${employeeId}/availability`, {
        headers: { 'X-Tenant-ID': getTenantId() }
      })
      
      if (response.data && response.data.workingHours) {
        setWorkingHours(response.data.workingHours)
      }
    } catch (error: any) {
      // Jeśli brak danych, użyj domyślnych
      if (error.response?.status !== 404) {
        console.error('Błąd ładowania dostępności:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const API_URL = getApiUrl()
      
      await axios.put(`${API_URL}/api/employees/${employeeId}/availability`, {
        workingHours
      }, {
        headers: { 'X-Tenant-ID': getTenantId() }
      })

      toast.success('Dostępność została zapisana')
      onClose()
    } catch (error: any) {
      console.error('Błąd zapisywania dostępności:', error)
      toast.error(error.response?.data?.message || 'Nie udało się zapisać dostępności')
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (index: number) => {
    const updated = [...workingHours]
    updated[index].enabled = !updated[index].enabled
    setWorkingHours(updated)
  }

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...workingHours]
    updated[index][field] = value
    setWorkingHours(updated)
  }

  const setAllDays = (enabled: boolean) => {
    setWorkingHours(workingHours.map(wh => ({ ...wh, enabled })))
  }

  const copyToAll = (index: number) => {
    const source = workingHours[index]
    setWorkingHours(workingHours.map(wh => ({
      ...wh,
      startTime: source.startTime,
      endTime: source.endTime
    })))
    toast.success('Godziny skopiowane do wszystkich dni')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-carbon-gray rounded-xl border border-neutral-gray/20 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-carbon-gray border-b border-neutral-gray/20 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-accent-neon" />
                <span>Dostępność pracownika</span>
              </h2>
              <p className="text-neutral-gray/70 mt-1">{employeeName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-gray/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-gray" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center justify-between p-4 bg-neutral-gray/5 rounded-lg border border-neutral-gray/10">
              <span className="text-sm text-neutral-gray">Szybkie akcje:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAllDays(true)}
                  className="px-3 py-1 text-sm bg-accent-neon/10 text-accent-neon rounded-lg hover:bg-accent-neon/20 transition-colors"
                >
                  Włącz wszystkie
                </button>
                <button
                  onClick={() => setAllDays(false)}
                  className="px-3 py-1 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  Wyłącz wszystkie
                </button>
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-3">
              {workingHours.map((wh, index) => {
                const dayInfo = DAYS[index]
                return (
                  <div
                    key={wh.day}
                    className={`p-4 rounded-lg border transition-all ${
                      wh.enabled
                        ? 'bg-neutral-gray/5 border-neutral-gray/20'
                        : 'bg-neutral-gray/5 border-neutral-gray/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Day Toggle */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={wh.enabled}
                          onChange={() => toggleDay(index)}
                          className="w-5 h-5 rounded border-neutral-gray/30 text-accent-neon focus:ring-accent-neon focus:ring-offset-0"
                        />
                        <span className={`font-medium ${wh.enabled ? 'text-white' : 'text-neutral-gray/50'}`}>
                          {dayInfo.label}
                        </span>
                      </div>

                      {/* Time Inputs */}
                      {wh.enabled && (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-neutral-gray/50" />
                            <input
                              type="time"
                              value={wh.startTime}
                              onChange={(e) => updateTime(index, 'startTime', e.target.value)}
                              className="px-3 py-1.5 bg-carbon-black border border-neutral-gray/20 rounded-lg text-white text-sm focus:border-accent-neon focus:ring-1 focus:ring-accent-neon"
                            />
                            <span className="text-neutral-gray/50">-</span>
                            <input
                              type="time"
                              value={wh.endTime}
                              onChange={(e) => updateTime(index, 'endTime', e.target.value)}
                              className="px-3 py-1.5 bg-carbon-black border border-neutral-gray/20 rounded-lg text-white text-sm focus:border-accent-neon focus:ring-1 focus:ring-accent-neon"
                            />
                          </div>
                          <button
                            onClick={() => copyToAll(index)}
                            className="px-2 py-1 text-xs text-accent-neon hover:bg-accent-neon/10 rounded transition-colors"
                            title="Skopiuj do wszystkich dni"
                          >
                            Kopiuj
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                <strong>Wskazówka:</strong> Ustaw dni i godziny, w których pracownik jest dostępny do pracy. 
                Rezerwacje będą możliwe tylko w tych godzinach.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-carbon-gray border-t border-neutral-gray/20 p-6 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-gray/10 text-neutral-gray rounded-lg hover:bg-neutral-gray/20 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-accent-neon text-carbon-black rounded-lg hover:bg-accent-neon/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Zapisywanie...' : 'Zapisz dostępność'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
