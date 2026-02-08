'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Check, ChevronDown, ChevronUp, Clock, Calendar, Upload, Image as ImageIcon } from 'lucide-react'
import { servicesApi, Service, ServiceCategory } from '@/lib/api/services'
import { employeesApi, Employee } from '@/lib/api/employees'
import toast from 'react-hot-toast'

interface ServiceModalProps {
  isOpen: boolean
  service: Service | null // null = dodawanie, obiekt = edycja
  onClose: () => void
  onSaved: () => void
}

export default function ServiceModal({ isOpen, service, onClose, onSaved }: ServiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  
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
    image: '',
    // Rezerwacje elastyczne
    flexibleDuration: false,
    minDuration: '60',
    maxDuration: '480',
    durationStep: '60',
    allowMultiDay: false,
    pricePerHour: '',
    pricePerDay: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && service) {
      const svc = service as any
      setFormData({
        name: service.name || '',
        description: service.description || '',
        categoryId: service.categoryId || '',
        basePrice: service.basePrice?.toString() || '',
        duration: service.duration?.toString() || '60',
        bufferBefore: service.bufferBefore?.toString() || '0',
        bufferAfter: service.bufferAfter?.toString() || '0',
        allowOnlineBooking: service.allowOnlineBooking !== false,
        isActive: service.isActive !== false,
        image: svc.image || '',
        // Rezerwacje elastyczne
        flexibleDuration: svc.flexibleDuration || false,
        minDuration: svc.minDuration?.toString() || '60',
        maxDuration: svc.maxDuration?.toString() || '480',
        durationStep: svc.durationStep?.toString() || '60',
        allowMultiDay: svc.allowMultiDay || false,
        pricePerHour: svc.pricePerHour?.toString() || '',
        pricePerDay: svc.pricePerDay?.toString() || '',
      })
      // Pokaż sekcję zaawansowaną jeśli usługa ma elastyczne ustawienia
      if (svc.flexibleDuration || svc.allowMultiDay) {
        setShowAdvanced(true)
      }
      if ((service as any).service_employees?.length) {
        setSelectedEmployees((service as any).service_employees.map((se: any) => se.employeeId).filter(Boolean))
      } else {
        setSelectedEmployees([])
      }
    } else if (isOpen) {
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        basePrice: '',
        duration: '60',
        bufferBefore: '0',
        bufferAfter: '0',
        allowOnlineBooking: true,
        isActive: true,
        image: '',
        flexibleDuration: false,
        minDuration: '60',
        maxDuration: '480',
        durationStep: '60',
        allowMultiDay: false,
        pricePerHour: '',
        pricePerDay: '',
      })
      setSelectedEmployees([])
      setShowAdvanced(false)
    }
  }, [isOpen, service])

  const loadData = async () => {
    try {
      const [categoriesData, employeesData] = await Promise.all([
        servicesApi.getAllCategories(),
        employeesApi.getAll()
      ])
      setCategories(categoriesData)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Błąd ładowania:', error)
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
      const data: any = {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        basePrice: parseFloat(formData.basePrice),
        duration: parseInt(formData.duration),
        bufferBefore: parseInt(formData.bufferBefore),
        bufferAfter: parseInt(formData.bufferAfter),
        allowOnlineBooking: formData.allowOnlineBooking,
        isActive: formData.isActive,
        image: formData.image || undefined,
        employeeIds: selectedEmployees,
        // Rezerwacje elastyczne
        flexibleDuration: formData.flexibleDuration,
        bookingType: formData.flexibleDuration ? 'FLEXIBLE' : 'FIXED',
      }
      
      // Dodaj pola elastyczne tylko jeśli włączone
      if (formData.flexibleDuration) {
        data.minDuration = parseInt(formData.minDuration)
        data.maxDuration = parseInt(formData.maxDuration)
        data.durationStep = parseInt(formData.durationStep)
        if (formData.pricePerHour) {
          data.pricePerHour = parseFloat(formData.pricePerHour)
        }
      }
      
      data.allowMultiDay = formData.allowMultiDay
      if (formData.allowMultiDay && formData.pricePerDay) {
        data.pricePerDay = parseFloat(formData.pricePerDay)
      }
      
      if (service) {
        await servicesApi.update(service.id, data)
        toast.success('Usługa zaktualizowana')
      } else {
        await servicesApi.create(data)
        toast.success('Usługa dodana')
      }
      onSaved()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Wystąpił błąd')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container" onClick={onClose}>
        <div className="modal-content modal-content-lg" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              {service ? 'Edytuj usługę' : 'Nowa usługa'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            {/* Name */}
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

            {/* Description */}
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">Opis</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                placeholder="Opis usługi..."
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">Zdjęcie usługi</label>
              {formData.image ? (
                <div className="relative inline-block">
                  <img 
                    src={formData.image} 
                    alt="Zdjęcie usługi" 
                    className="w-32 h-32 object-cover rounded-lg border border-[var(--border-color)]" 
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, image: ''})}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[var(--border-color)] rounded-lg cursor-pointer hover:border-[var(--text-muted)] transition-colors bg-[var(--bg-primary)]">
                  <ImageIcon className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-primary)]">Kliknij</span> lub przeciągnij
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">PNG, JPG (max 2MB)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error('Plik jest za duży (max 2MB)')
                          return
                        }
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({...formData, image: reader.result as string})
                        }
                        reader.readAsDataURL(file)
                      }
                    }} 
                  />
                </label>
              )}
            </div>

            {/* Category */}
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

            {/* Price & Duration */}
            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Czas (min) <span className="text-red-500">*</span></label>
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
            </div>

            {/* Buffers */}
            <div className="grid grid-cols-2 gap-3">
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

            {/* Employees */}
            {employees.length > 0 && (
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Pracownicy wykonujący</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => toggleEmployee(emp.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors text-left text-sm ${
                        selectedEmployees.includes(emp.id)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        selectedEmployees.includes(emp.id) ? 'bg-green-500 border-green-500' : 'border-[var(--border-color)]'
                      }`}>
                        {selectedEmployees.includes(emp.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[var(--text-primary)] truncate">{emp.firstName} {emp.lastName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Rezerwacje online</p>
                  <p className="text-xs text-[var(--text-muted)]">Klienci mogą rezerwować online</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, allowOnlineBooking: !formData.allowOnlineBooking})}
                  className={`w-11 h-6 rounded-full transition-colors relative ${formData.allowOnlineBooking ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.allowOnlineBooking ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Aktywna</p>
                  <p className="text-xs text-[var(--text-muted)]">Widoczna i dostępna</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-11 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Więcej ustawień - rozwijana sekcja */}
            <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Więcej ustawień</span>
                  {(formData.flexibleDuration || formData.allowMultiDay) && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                      Aktywne
                    </span>
                  )}
                </div>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </button>
              
              {showAdvanced && (
                <div className="p-4 space-y-4 border-t border-[var(--border-color)]">
                  {/* Elastyczny czas trwania */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Elastyczny czas trwania</p>
                      <p className="text-xs text-[var(--text-muted)]">Klient wybiera jak długo chce rezerwować</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, flexibleDuration: !formData.flexibleDuration})}
                      className={`w-11 h-6 rounded-full transition-colors relative ${formData.flexibleDuration ? 'bg-blue-500' : 'bg-[var(--border-color)]'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.flexibleDuration ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Ustawienia elastycznego czasu */}
                  {formData.flexibleDuration && (
                    <div className="pl-4 border-l-2 border-blue-500 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Min. czas (min)</label>
                          <input
                            type="number"
                            value={formData.minDuration}
                            onChange={e => setFormData({...formData, minDuration: e.target.value})}
                            min="15"
                            step="15"
                            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Max. czas (min)</label>
                          <input
                            type="number"
                            value={formData.maxDuration}
                            onChange={e => setFormData({...formData, maxDuration: e.target.value})}
                            min="30"
                            step="15"
                            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Krok (min)</label>
                          <select
                            value={formData.durationStep}
                            onChange={e => setFormData({...formData, durationStep: e.target.value})}
                            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                          >
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="60">1 godzina</option>
                            <option value="120">2 godziny</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Cena za godzinę (zł)</label>
                          <input
                            type="number"
                            value={formData.pricePerHour}
                            onChange={e => setFormData({...formData, pricePerHour: e.target.value})}
                            min="0"
                            step="1"
                            placeholder="np. 50"
                            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rezerwacje wielodniowe */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Rezerwacje wielodniowe</p>
                      <p className="text-xs text-[var(--text-muted)]">Pozwól rezerwować na kilka dni</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, allowMultiDay: !formData.allowMultiDay})}
                      className={`w-11 h-6 rounded-full transition-colors relative ${formData.allowMultiDay ? 'bg-blue-500' : 'bg-[var(--border-color)]'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.allowMultiDay ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Ustawienia wielodniowe */}
                  {formData.allowMultiDay && (
                    <div className="pl-4 border-l-2 border-blue-500">
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">Cena za dzień (zł)</label>
                        <input
                          type="number"
                          value={formData.pricePerDay}
                          onChange={e => setFormData({...formData, pricePerDay: e.target.value})}
                          min="0"
                          step="1"
                          placeholder="np. 200"
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t border-[var(--border-color)]">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">
              Anuluj
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Zapisywanie...' : (service ? 'Zapisz' : 'Dodaj')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
