'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Copy, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getApiUrl, getTenantId } from '@/lib/api-url'

interface TimeSlot {
  id?: string
  startTime: string
  endTime: string
}

interface WorkingHours {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
  timeSlots?: TimeSlot[]
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

const defaultTimeSlot = (): TimeSlot => ({ startTime: '09:00', endTime: '17:00' })

export default function AvailabilityModal({ employeeId, employeeName, isOpen, onClose }: AvailabilityModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(
    DAYS.map(day => ({ 
      day: day.key, 
      enabled: day.key !== 'sunday' && day.key !== 'saturday', 
      startTime: '09:00', 
      endTime: '17:00',
      timeSlots: [defaultTimeSlot()]
    }))
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
      if (response.data?.workingHours) {
        // Upewnij się, że każdy dzień ma timeSlots
        const hours = response.data.workingHours.map((wh: WorkingHours) => ({
          ...wh,
          timeSlots: wh.timeSlots && wh.timeSlots.length > 0 
            ? wh.timeSlots 
            : [{ startTime: wh.startTime, endTime: wh.endTime }]
        }))
        setWorkingHours(hours)
      }
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
    // Jeśli włączamy dzień i nie ma przedziałów, dodaj domyślny
    if (updated[index].enabled && (!updated[index].timeSlots || updated[index].timeSlots!.length === 0)) {
      updated[index].timeSlots = [defaultTimeSlot()]
    }
    setWorkingHours(updated)
  }

  const updateSlotTime = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...workingHours]
    if (updated[dayIndex].timeSlots) {
      updated[dayIndex].timeSlots![slotIndex][field] = value
      // Aktualizuj też główne pola dla kompatybilności
      if (slotIndex === 0) {
        updated[dayIndex][field] = value
      }
    }
    setWorkingHours(updated)
  }

  const addTimeSlot = (dayIndex: number) => {
    const updated = [...workingHours]
    if (!updated[dayIndex].timeSlots) {
      updated[dayIndex].timeSlots = []
    }
    // Dodaj nowy przedział z domyślnymi godzinami
    const lastSlot = updated[dayIndex].timeSlots![updated[dayIndex].timeSlots!.length - 1]
    const newStartTime = lastSlot ? lastSlot.endTime : '12:00'
    updated[dayIndex].timeSlots!.push({ startTime: newStartTime, endTime: '18:00' })
    setWorkingHours(updated)
  }

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...workingHours]
    if (updated[dayIndex].timeSlots && updated[dayIndex].timeSlots!.length > 1) {
      updated[dayIndex].timeSlots!.splice(slotIndex, 1)
      // Aktualizuj główne pola z pierwszego przedziału
      if (updated[dayIndex].timeSlots!.length > 0) {
        updated[dayIndex].startTime = updated[dayIndex].timeSlots![0].startTime
        updated[dayIndex].endTime = updated[dayIndex].timeSlots![0].endTime
      }
    }
    setWorkingHours(updated)
  }

  const copyToAll = (dayIndex: number) => {
    const source = workingHours[dayIndex]
    setWorkingHours(workingHours.map(wh => ({ 
      ...wh, 
      startTime: source.startTime, 
      endTime: source.endTime,
      timeSlots: source.timeSlots ? [...source.timeSlots.map(s => ({ ...s }))] : [defaultTimeSlot()]
    })))
    toast.success('Skopiowano do wszystkich dni')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
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
            <div className="space-y-4">
              {workingHours.map((wh, dayIndex) => {
                const day = DAYS.find(d => d.key === wh.day)
                const slots = wh.timeSlots || [{ startTime: wh.startTime, endTime: wh.endTime }]
                
                return (
                  <div key={wh.day} className={`p-3 rounded-lg transition-colors ${wh.enabled ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-card-hover)] opacity-60'}`}>
                    {/* Day header */}
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => toggleDay(dayIndex)}
                        className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${wh.enabled ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${wh.enabled ? 'left-5' : 'left-1'}`} />
                      </button>
                      <span className="text-sm font-medium text-[var(--text-primary)] flex-1">{day?.label}</span>
                      {wh.enabled && (
                        <button 
                          onClick={() => copyToAll(dayIndex)} 
                          className="p-1.5 hover:bg-[var(--bg-card-hover)] rounded text-[var(--text-muted)]" 
                          title="Kopiuj do wszystkich dni"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Time slots */}
                    {wh.enabled ? (
                      <div className="space-y-2 ml-[52px]">
                        {slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={e => updateSlotTime(dayIndex, slotIndex, 'startTime', e.target.value)}
                              className="px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] w-24"
                            />
                            <span className="text-[var(--text-muted)]">-</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={e => updateSlotTime(dayIndex, slotIndex, 'endTime', e.target.value)}
                              className="px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] w-24"
                            />
                            {slots.length > 1 && (
                              <button 
                                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                className="p-1.5 hover:bg-red-500/20 rounded text-red-400"
                                title="Usuń przedział"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {/* Add slot button */}
                        <button
                          onClick={() => addTimeSlot(dayIndex)}
                          className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] hover:text-green-400 transition-colors py-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Dodaj przedział</span>
                        </button>
                      </div>
                    ) : (
                      <div className="ml-[52px]">
                        <span className="text-sm text-[var(--text-muted)]">Dzień wolny</span>
                      </div>
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
