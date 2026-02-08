'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Plus, X, Save, Loader2, Trash2 } from 'lucide-react';
import { employeesApi } from '@/lib/api/employees';
import toast from 'react-hot-toast';

interface EmployeeAvailabilityProps {
  employeeId: string;
}

interface WorkingHour {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface TimeOff {
  id?: string;
  date: string;
  reason?: string;
}

const DAYS = [
  { key: 'monday', label: 'Poniedziałek' },
  { key: 'tuesday', label: 'Wtorek' },
  { key: 'wednesday', label: 'Środa' },
  { key: 'thursday', label: 'Czwartek' },
  { key: 'friday', label: 'Piątek' },
  { key: 'saturday', label: 'Sobota' },
  { key: 'sunday', label: 'Niedziela' },
];

export default function EmployeeAvailability({ employeeId }: EmployeeAvailabilityProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [newTimeOffDate, setNewTimeOffDate] = useState('');

  useEffect(() => {
    loadAvailability();
  }, [employeeId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading availability for employee:', employeeId);
      const data = await employeesApi.getAvailability(employeeId);
      console.log('📥 Received data:', data);
      setWorkingHours(data.workingHours || []);
      // Konwertuj Date na string
      const timeOffData = (data.timeOff || []).map(t => ({
        ...t,
        date: t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date).split('T')[0],
      }));
      setTimeOff(timeOffData);
      console.log('✅ Loaded working hours:', data.workingHours?.length, 'days');
    } catch (error) {
      console.error('❌ Błąd ładowania dostępności:', error);
      toast.error('Nie udało się załadować dostępności');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving availability for employee:', employeeId);
      console.log('📅 Working hours:', workingHours);
      console.log('🏖️ Time off:', timeOff);
      
      const response = await employeesApi.updateAvailability(employeeId, {
        workingHours,
        timeOff,
      });
      
      console.log('✅ Save response:', response);
      toast.success('Dostępność została zaktualizowana');
      
      // Przeładuj dane aby potwierdzić zapis
      await loadAvailability();
    } catch (error: any) {
      console.error('❌ Błąd zapisywania:', error);
      console.error('Response data:', error.response?.data);
      toast.error(error.response?.data?.message || 'Nie udało się zapisać dostępności');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setWorkingHours(prev =>
      prev.map(wh =>
        wh.day === day ? { ...wh, enabled: !wh.enabled } : wh
      )
    );
  };

  const updateTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(prev =>
      prev.map(wh =>
        wh.day === day ? { ...wh, [field]: value } : wh
      )
    );
  };

  const addTimeOff = () => {
    if (!newTimeOffDate) {
      toast.error('Wybierz datę');
      return;
    }

    setTimeOff(prev => [...prev, { date: newTimeOffDate, reason: 'Urlop' }]);
    setNewTimeOffDate('');
  };

  const removeTimeOff = async (index: number) => {
    const item = timeOff[index];
    
    if (item.id) {
      // Usuń z bazy
      try {
        await employeesApi.removeTimeOff(employeeId, item.id);
        toast.success('Urlop został usunięty');
      } catch (error) {
        toast.error('Nie udało się usunąć urlopu');
        return;
      }
    }
    
    // Usuń z lokalnego stanu
    setTimeOff(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Godziny pracy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-neon" />
            <h3 className="text-lg font-bold text-white">Godziny pracy</h3>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-neon flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Zapisz
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const dayData = workingHours.find(wh => wh.day === key);
            if (!dayData) return null;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer min-w-[140px]">
                    <input
                      type="checkbox"
                      checked={dayData.enabled}
                      onChange={() => toggleDay(key)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-neon focus:ring-accent-neon"
                    />
                    <span className={`font-medium ${dayData.enabled ? 'text-white' : 'text-neutral-gray'}`}>
                      {label}
                    </span>
                  </label>

                  {dayData.enabled && (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-gray">Od:</span>
                        <input
                          type="time"
                          value={dayData.startTime}
                          onChange={(e) => updateTime(key, 'startTime', e.target.value)}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-gray">Do:</span>
                        <input
                          type="time"
                          value={dayData.endTime}
                          onChange={(e) => updateTime(key, 'endTime', e.target.value)}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Urlopy */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-accent-neon" />
          <h3 className="text-lg font-bold text-white">Urlopy i dni wolne</h3>
        </div>

        <div className="space-y-3">
          {/* Dodaj nowy urlop */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={newTimeOffDate}
                onChange={(e) => setNewTimeOffDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
              />
              <button
                onClick={addTimeOff}
                className="btn-neon flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Dodaj urlop
              </button>
            </div>
          </div>

          {/* Lista urlopów */}
          {timeOff.length > 0 && (
            <div className="space-y-2">
              {timeOff.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-accent-neon" />
                    <span className="text-white font-medium">
                      {new Date(item.date).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-neutral-gray">({item.reason})</span>
                  </div>
                  <button
                    onClick={() => removeTimeOff(index)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-neutral-gray group-hover:text-red-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {timeOff.length === 0 && (
            <div className="text-center py-8 text-neutral-gray">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Brak zaplanowanych urlopów</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
