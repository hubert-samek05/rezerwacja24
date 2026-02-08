'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Users, X } from 'lucide-react'
import Link from 'next/link'
import { servicesApi, ServiceCategory } from '@/lib/api/services'
import { employeesApi, Employee } from '@/lib/api/employees'
import toast from 'react-hot-toast'

export default function NewServicePage() {
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
    duration: '',
    bufferBefore: '0',
    bufferAfter: '0',
    maxCapacity: '1',
    requiresDeposit: false,
    depositAmount: '0',
    allowOnlineBooking: true,
    requiresApproval: false,
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
      console.error('Błąd ładowania danych:', error)
      toast.error('Nie udało się załadować danych')
    }
  }

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.basePrice || !formData.duration) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }

    try {
      setLoading(true)
      
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        basePrice: parseFloat(formData.basePrice),
        duration: parseInt(formData.duration),
        bufferBefore: parseInt(formData.bufferBefore),
        bufferAfter: parseInt(formData.bufferAfter),
        maxCapacity: parseInt(formData.maxCapacity),
        requiresDeposit: formData.requiresDeposit,
        depositAmount: parseFloat(formData.depositAmount),
        allowOnlineBooking: formData.allowOnlineBooking,
        requiresApproval: formData.requiresApproval,
        isActive: formData.isActive,
        employeeIds: selectedEmployees,
      }

      await servicesApi.create(data)
      toast.success('Usługa została utworzona')
      router.push('/dashboard/services')
    } catch (error: any) {
      console.error('Błąd tworzenia usługi:', error)
      toast.error(error.response?.data?.message || 'Nie udało się utworzyć usługi')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="min-h-screen bg-carbon-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/services"
            className="inline-flex items-center space-x-2 text-neutral-gray hover:text-accent-neon transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Powrót do usług</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Dodaj nową usługę</h1>
          <p className="text-neutral-gray/70 mt-2">Wypełnij poniższe informacje, aby utworzyć nową usługę</p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Podstawowe informacje</h2>
            
            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Nazwa usługi <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                placeholder="np. Strzyżenie damskie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Opis
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                placeholder="Opisz usługę..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Kategoria
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
              >
                <option value="">Bez kategorii</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Cena i czas trwania</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Cena (PLN) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Czas trwania (minuty) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Bufor przed (minuty)
                </label>
                <input
                  type="number"
                  name="bufferBefore"
                  value={formData.bufferBefore}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Bufor po (minuty)
                </label>
                <input
                  type="number"
                  name="bufferAfter"
                  value={formData.bufferAfter}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                />
              </div>
            </div>
          </div>

          {/* Deposit */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Depozyt</h2>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="requiresDeposit"
                checked={formData.requiresDeposit}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
              />
              <label className="text-sm text-neutral-gray">
                Wymaga depozytu
              </label>
            </div>

            {formData.requiresDeposit && (
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Kwota depozytu (PLN)
                </label>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                />
              </div>
            )}
          </div>

          {/* Employees */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-accent-neon" />
              <span>Przypisz pracowników</span>
            </h2>
            <p className="text-sm text-neutral-gray/70">Wybierz pracowników, którzy będą świadczyć tę usługę</p>
            
            {employees.length === 0 ? (
              <div className="glass-card p-4 text-center text-neutral-gray/70">
                Brak dostępnych pracowników. Dodaj pracowników w zakładce Zespół.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => toggleEmployee(employee.id)}
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      selectedEmployees.includes(employee.id)
                        ? 'border-2 border-accent-neon bg-primary-green/10'
                        : 'border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: employee.color }}
                      >
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {employee.firstName} {employee.lastName}
                        </div>
                        {employee.title && (
                          <div className="text-xs text-neutral-gray/70">{employee.title}</div>
                        )}
                      </div>
                      {selectedEmployees.includes(employee.id) && (
                        <div className="w-6 h-6 bg-accent-neon rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-carbon-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedEmployees.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-accent-neon">
                <Users className="w-4 h-4" />
                <span>Wybrano: {selectedEmployees.length} {selectedEmployees.length === 1 ? 'pracownik' : 'pracowników'}</span>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Ustawienia</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="allowOnlineBooking"
                  checked={formData.allowOnlineBooking}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
                />
                <label className="text-sm text-neutral-gray">
                  Zezwalaj na rezerwacje online
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
                />
                <label className="text-sm text-neutral-gray">
                  Wymaga zatwierdzenia
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-neon focus:ring-accent-neon"
                />
                <label className="text-sm text-neutral-gray">
                  Aktywna
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
            <Link
              href="/dashboard/services"
              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              Anuluj
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-neon flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Zapisywanie...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Zapisz usługę</span>
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
