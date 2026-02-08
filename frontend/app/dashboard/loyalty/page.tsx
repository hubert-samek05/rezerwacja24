'use client'

import { useState, useEffect } from 'react'
import { 
  Gift, 
  Star, 
  Users, 
  TrendingUp, 
  Settings, 
  Plus, 
  Trophy,
  Coins,
  Award,
  Loader2,
  Save,
  Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

interface LoyaltyProgram {
  id: string
  name: string
  isActive: boolean
  pointsPerCurrency: number
  pointsPerBooking: number
  levels: LoyaltyLevel[]
  loyalty_rewards: LoyaltyReward[]
}

interface LoyaltyLevel {
  id: string
  name: string
  minPoints: number
  multiplier: number
  color: string
}

interface LoyaltyReward {
  id: string
  name: string
  description?: string
  pointsCost: number
  rewardType: string
  rewardValue: number
  isActive: boolean
}

interface LoyaltyStats {
  totalMembers: number
  activeMembers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  redemptionRate: number
}

interface LeaderboardEntry {
  rank: number
  customerId: string
  customerName: string
  availablePoints: number
  totalPoints: number
  level: string
}

export default function LoyaltyPage() {
  const { t } = useDashboardTranslation()
  const [program, setProgram] = useState<LoyaltyProgram | null>(null)
  const [stats, setStats] = useState<LoyaltyStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')

  const [settings, setSettings] = useState({
    name: '',
    isActive: false,
    pointsPerCurrency: 1,
    pointsPerBooking: 0,
  })

  const [newLevel, setNewLevel] = useState({
    name: '',
    minPoints: 0,
    multiplier: 1,
    color: '#CD7F32',
  })

  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    pointsCost: 100,
    rewardType: 'DISCOUNT_PERCENT',
    rewardValue: 10,
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const getHeaders = () => {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null
    return {
      'x-tenant-id': tenantId || '',
      'Content-Type': 'application/json',
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [programRes, statsRes, leaderboardRes] = await Promise.all([
        axios.get(`${API_URL}/api/loyalty/settings`, { headers: getHeaders() }),
        axios.get(`${API_URL}/api/loyalty/stats`, { headers: getHeaders() }).catch(() => ({ data: null })),
        axios.get(`${API_URL}/api/loyalty/leaderboard`, { headers: getHeaders() }).catch(() => ({ data: [] })),
      ])

      setProgram(programRes.data)
      setSettings({
        name: programRes.data.name || '',
        isActive: programRes.data.isActive || false,
        pointsPerCurrency: Number(programRes.data.pointsPerCurrency) || 1,
        pointsPerBooking: Number(programRes.data.pointsPerBooking) || 0,
      })
      setStats(statsRes.data)
      setLeaderboard(leaderboardRes.data || [])
    } catch (error) {
      console.error('Error loading loyalty data:', error)
      toast.error(t.loyalty?.loadError || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await axios.put(`${API_URL}/api/loyalty/settings`, settings, { headers: getHeaders() })
      toast.success(t.loyalty?.saved || 'Settings saved')
      loadData()
    } catch (error) {
      toast.error(t.loyalty?.saveError || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addLevel = async () => {
    if (!newLevel.name || newLevel.minPoints < 0) {
      toast.error(t.loyalty?.fillAllFields || 'Fill all fields')
      return
    }
    try {
      await axios.post(`${API_URL}/api/loyalty/levels`, newLevel, { headers: getHeaders() })
      toast.success(t.loyalty?.levelAdded || 'Level added')
      setNewLevel({ name: '', minPoints: 0, multiplier: 1, color: '#CD7F32' })
      loadData()
    } catch (error) {
      toast.error(t.loyalty?.levelError || 'Failed to add level')
    }
  }

  const addReward = async () => {
    if (!newReward.name || newReward.pointsCost <= 0) {
      toast.error(t.loyalty?.fillAllFields || 'Fill all fields')
      return
    }
    try {
      await axios.post(`${API_URL}/api/loyalty/rewards`, newReward, { headers: getHeaders() })
      toast.success(t.loyalty?.rewardAdded || 'Reward added')
      setNewReward({ name: '', description: '', pointsCost: 100, rewardType: 'DISCOUNT_PERCENT', rewardValue: 10 })
      loadData()
    } catch (error) {
      toast.error(t.loyalty?.rewardError || 'Failed to add reward')
    }
  }

  const removeReward = async (rewardId: string) => {
    try {
      await axios.delete(`${API_URL}/api/loyalty/rewards/${rewardId}`, { headers: getHeaders() })
      toast.success(t.loyalty?.rewardDeleted || 'Reward deleted')
      loadData()
    } catch (error) {
      toast.error(t.loyalty?.rewardDeleteError || 'Failed to delete reward')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">Program Lojalnościowy</h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] mt-1">Nagradzaj stałych klientów punktami za wizyty</p>
        </div>
        <span className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium w-fit ${
          settings.isActive 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {settings.isActive ? 'Aktywny' : 'Nieaktywny'}
        </span>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
          <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalMembers}</p>
            <p className="text-xs text-[var(--text-muted)]">{stats.activeMembers} aktywnych</p>
          </div>
          <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalPointsIssued.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Wydane punkty</p>
          </div>
          <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalPointsRedeemed.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">Wymienione</p>
          </div>
          <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.redemptionRate}%</p>
            <p className="text-xs text-[var(--text-muted)]">Wskaźnik wymiany</p>
          </div>
        </div>
      )}

      {/* Tabs - Pill Style */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1 md:gap-2 p-1 md:p-1.5 bg-[var(--bg-card)] rounded-xl md:rounded-2xl w-fit border border-[var(--border-color)]">
          {[
            { id: 'settings', label: 'Ustawienia', icon: Settings },
            { id: 'levels', label: 'Poziomy', icon: Award },
            { id: 'rewards', label: 'Nagrody', icon: Gift },
            { id: 'leaderboard', label: 'Ranking', icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-sm md:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)]">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Ustawienia programu</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--text-primary)]">Program aktywny</p>
                <p className="text-sm text-[var(--text-secondary)]">Włącz aby klienci zaczęli zbierać punkty</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isActive}
                  onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Nazwa programu</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="np. Klub Stałego Klienta"
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Punkty za każde 1 zł</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.pointsPerCurrency}
                  onChange={(e) => setSettings({ ...settings, pointsPerCurrency: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Bonus za każdą rezerwację</label>
                <input
                  type="number"
                  min="0"
                  value={settings.pointsPerBooking}
                  onChange={(e) => setSettings({ ...settings, pointsPerBooking: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="font-medium mb-1 text-[var(--text-primary)]">Przykład naliczania:</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Wizyta za 100 zł = <strong>{Math.floor(100 * settings.pointsPerCurrency) + settings.pointsPerBooking} punktów</strong>
              </p>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Zapisz ustawienia
            </button>
          </div>
        </div>
      )}

      {/* Levels Tab */}
      {activeTab === 'levels' && (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)]">
            <h2 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-primary)]">Poziomy lojalnościowe</h2>
            {program?.levels && program.levels.length > 0 ? (
              <div className="space-y-3">
                {program.levels.map((level) => (
                  <div
                    key={level.id}
                    className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl"
                    style={{ borderLeftColor: level.color, borderLeftWidth: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${level.color}20` }}>
                        <Star className="h-5 w-5" style={{ color: level.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{level.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          Od {level.minPoints.toLocaleString()} pkt • x{level.multiplier} mnożnik
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-3">
                  <Award className="w-7 h-7 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-muted)]">Brak poziomów. Dodaj pierwszy.</p>
              </div>
            )}
          </div>

          <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)]">
            <h2 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-primary)]">Dodaj poziom</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Nazwa</label>
                <input
                  type="text"
                  value={newLevel.name}
                  onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                  placeholder="np. Brązowy, Srebrny, Złoty"
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Min. punktów</label>
                <input
                  type="number"
                  min="0"
                  value={newLevel.minPoints}
                  onChange={(e) => setNewLevel({ ...newLevel, minPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Mnożnik</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={newLevel.multiplier}
                  onChange={(e) => setNewLevel({ ...newLevel, multiplier: parseFloat(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Kolor</label>
                <input
                  type="color"
                  value={newLevel.color}
                  onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })}
                  className="h-12 w-24 rounded-xl cursor-pointer"
                />
              </div>
              <button
                onClick={addLevel}
                className="flex items-center gap-2 w-full justify-center px-5 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Dodaj poziom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)]">
            <h2 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-primary)]">Nagrody do wymiany</h2>
            {program?.loyalty_rewards && program.loyalty_rewards.length > 0 ? (
              <div className="space-y-3">
                {program.loyalty_rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{reward.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {reward.pointsCost} pkt • 
                          {reward.rewardType === 'DISCOUNT_PERCENT' && ` ${reward.rewardValue}% zniżki`}
                          {reward.rewardType === 'DISCOUNT_AMOUNT' && ` ${reward.rewardValue} zł zniżki`}
                          {reward.rewardType === 'FREE_SERVICE' && ' Darmowa usługa'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeReward(reward.id)}
                      className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-7 h-7 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-muted)]">Brak nagród. Dodaj pierwszą.</p>
              </div>
            )}
          </div>

          <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)]">
            <h2 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-primary)]">Dodaj nagrodę</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Nazwa</label>
                <input
                  type="text"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  placeholder="np. 10% zniżki"
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Koszt (punkty)</label>
                <input
                  type="number"
                  min="1"
                  value={newReward.pointsCost}
                  onChange={(e) => setNewReward({ ...newReward, pointsCost: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Typ nagrody</label>
                <select
                  value={newReward.rewardType}
                  onChange={(e) => setNewReward({ ...newReward, rewardType: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                >
                  <option value="DISCOUNT_PERCENT">Zniżka procentowa</option>
                  <option value="DISCOUNT_AMOUNT">Zniżka kwotowa</option>
                  <option value="FREE_SERVICE">Darmowa usługa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
                  {newReward.rewardType === 'DISCOUNT_PERCENT' ? 'Procent zniżki' : 'Wartość (zł)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={newReward.rewardValue}
                  onChange={(e) => setNewReward({ ...newReward, rewardValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)]"
                />
              </div>
              <button
                onClick={addReward}
                className="flex items-center gap-2 w-full justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                Dodaj nagrodę
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)]">
          <h2 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-primary)]">Ranking klientów</h2>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div key={entry.customerId} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)]">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base text-[var(--text-primary)]">{entry.customerName}</p>
                      <p className="text-xs md:text-sm text-[var(--text-secondary)]">Poziom: {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base text-[var(--text-primary)]">{entry.availablePoints.toLocaleString()} pkt</p>
                    <p className="text-xs text-[var(--text-secondary)]">Łącznie: {entry.totalPoints.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-secondary)] text-center py-8 text-sm md:text-base">
              Brak danych. Klienci pojawią się po pierwszych wizytach.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
