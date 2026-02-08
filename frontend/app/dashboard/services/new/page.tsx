'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react'
import Link from 'next/link'
import { servicesApi, ServiceCategory } from '@/lib/api/services'
import { employeesApi, Employee } from '@/lib/api/employees'
import toast from 'react-hot-toast'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

export default function NewServicePage() {
  const { t, language } = useDashboardTranslation()
  const currency = language === 'pl' ? 'zł' : '€'
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    basePrice: '',
    duration: '60',
    bufferBefore: '0',
    bufferAfter: '0',
    allowOnlineBooking: true,
    isActive: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, employeesData] = await Promise.all([
        servicesApi.getAllCategories(),
        employeesApi.getAll()
      ])
      setCategories(categoriesData)
      setEmployees(employeesData)
    } catch (error) {
      toast.error('Nie udało się załadować danych')
    }
  }

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.basePrice || !formData.duration) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }
    try {
      setLoading(true)
      await servicesApi.create({
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        basePrice: parseFloat(formData.basePrice),
        duration: parseInt(formData.duration),
        bufferBefore: parseInt(formData.bufferBefore),
        bufferAfter: parseInt(formData.bufferAfter),
        allowOnlineBooking: formData.allowOnlineBooking,
        isActive: formData.isActive,
        employeeIds: selectedEmployees,
      })
      toast.success('Usługa została utworzona')
      router.push('/dashboard/services')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nie udało się utworzyć usługi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/services" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Powrót do usług</span>
          </Link>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Nowa usługa</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Wypełnij dane nowej usługi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
          {/* Basic Info */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)] mb-4">Podstawowe informacje</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Nazwa <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="np. Strzyżenie damskie"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Opis</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                  placeholder="Opis usługi..."
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Kategoria</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Bez kategorii</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Price & Duration */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)] mb-4">Cena i czas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Cena (zł) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={e => setFormData({...formData, basePrice: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Czas trwania (min) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  required
                  min="5"
                  step="5"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Bufor przed (min)</label>
                <input
                  type="number"
                  value={formData.bufferBefore}
                  onChange={e => setFormData({...formData, bufferBefore: e.target.value})}
                  min="0"
                  step="5"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Bufor po (min)</label>
                <input
                  type="number"
                  value={formData.bufferAfter}
                  onChange={e => setFormData({...formData, bufferAfter: e.target.value})}
                  min="0"
                  step="5"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Employees */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)] mb-4">Pracownicy wykonujący usługę</h2>
            {employees.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Brak pracowników. Dodaj pracowników w zakładce Pracownicy.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {employees.map(emp => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleEmployee(emp.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      selectedEmployees.includes(emp.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedEmployees.includes(emp.id) ? 'bg-green-500 border-green-500' : 'border-[var(--border-color)]'
                    }`}>
                      {selectedEmployees.includes(emp.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-[var(--text-primary)]">{emp.firstName} {emp.lastName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="p-5 border-b border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--text-primary)]">Rezerwacje online</p>
                <p className="text-sm text-[var(--text-muted)]">Klienci mogą rezerwować tę usługę online</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, allowOnlineBooking: !formData.allowOnlineBooking})}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.allowOnlineBooking ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${formData.allowOnlineBooking ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--text-primary)]">Aktywna</p>
                <p className="text-sm text-[var(--text-muted)]">Usługa jest widoczna i dostępna do rezerwacji</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.isActive ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${formData.isActive ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-5">
            <Link href="/dashboard/services" className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm text-center">
              Anuluj
            </Link>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Zapisywanie...' : 'Dodaj usługę'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
