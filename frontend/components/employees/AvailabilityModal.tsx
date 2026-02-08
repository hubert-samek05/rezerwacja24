'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Copy } from 'lucide-react'
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
  { key: 'monday', label: 'Poniedziałek', short: 'Pon' },
  { key: 'tuesday', label: 'Wtorek', short: 'Wt' },
  { key: 'wednesday', label: 'Środa', short: 'Śr' },
  { key: 'thursday', label: 'Czwartek', short: 'Czw' },
  { key: 'friday', label: 'Piątek', short: 'Pt' },
  { key: 'saturday', label: 'Sobota', short: 'Sob' },
  { key: 'sunday', label: 'Niedziela', short: 'Nd' }
]

export default function AvailabilityModal({ employeeId, employeeName, isOpen, onClose }: AvailabilityModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(
    DAYS.map(day => ({ day: day.key, enabled: day.key !== 'sunday' && day.key !== 'saturday', startTime: '09:00', endTime: '17:00' }))
  )

  useEffect(() => {
    if (isOpen) loadAvailability()
  }, [isOpen, employeeId])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      const API_URL = getApiUrl()
      const response = await axios.get(`${API_URL}/api/employees/${employeeId}/availability`, {
        headers: { 'X-Tenant-ID': getTenantId() }
      })
      if (response.data?.workingHours) setWorkingHours(response.data.workingHours)
    } catch (error: any) {
      if (error.response?.status !== 404) console.error('Błąd ładowania:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const API_URL = getApiUrl()
      await axios.put(`${API_URL}/api/employees/${employeeId}/availability`, { workingHours }, {
        headers: { 'X-Tenant-ID': getTenantId() }
      })
      toast.success('Godziny pracy zapisane')
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nie udało się zapisać')
    } finally {
      setSaving(false)
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

  const copyToAll = (index: number) => {
    const source = workingHours[index]
    setWorkingHours(workingHours.map(wh => ({ ...wh, startTime: source.startTime, endTime: source.endTime })))
    toast.success('Skopiowano do wszystkich dni')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Godziny pracy</h3>
            <p className="text-sm text-[var(--text-muted)]">{employeeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--text-primary)]"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {workingHours.map((wh, index) => {
                const day = DAYS.find(d => d.key === wh.day)
                return (
                  <div key={wh.day} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${wh.enabled ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-card-hover)] opacity-60'}`}>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleDay(index)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${wh.enabled ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${wh.enabled ? 'left-5' : 'left-1'}`} />
                    </button>

                    {/* Day */}
                    <span className="w-24 text-sm font-medium text-[var(--text-primary)]">{day?.label}</span>

                    {/* Times */}
                    {wh.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={wh.startTime}
                          onChange={e => updateTime(index, 'startTime', e.target.value)}
                          className="px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] w-24"
                        />
                        <span className="text-[var(--text-muted)]">-</span>
                        <input
                          type="time"
                          value={wh.endTime}
                          onChange={e => updateTime(index, 'endTime', e.target.value)}
                          className="px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] w-24"
                        />
                        <button onClick={() => copyToAll(index)} className="p-1.5 hover:bg-[var(--bg-card-hover)] rounded" title="Kopiuj do wszystkich">
                          <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">Dzień wolny</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[var(--border-color)]">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">
            Anuluj
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </div>
    </div>
  )
}
