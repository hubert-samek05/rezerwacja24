'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Tag, X } from 'lucide-react'
import { servicesApi, Service, ServiceCategory } from '@/lib/api/services'
import toast from 'react-hot-toast'
import ServiceModal from '@/components/services/ServiceModal'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

export default function ServicesPage() {
  const { t, language } = useDashboardTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currency = language === 'pl' ? 'zł' : '€'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; service: Service | null; confirmStep: number }>({ show: false, service: null, confirmStep: 1 })
  const [serviceModal, setServiceModal] = useState<{ show: boolean; service: Service | null }>({ show: false, service: null })

  useEffect(() => {
    loadData()
  }, [])

  // Obsługa parametru action z URL (szybkie akcje z dashboardu)
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'new') {
      setServiceModal({ show: true, service: null })
      router.replace('/dashboard/services', { scroll: false })
    }
  }, [searchParams, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [servicesData, categoriesData] = await Promise.all([
        servicesApi.getAll(),
        servicesApi.getAllCategories()
      ])
      setServices(servicesData)
      setCategories(categoriesData)
    } catch (error) {
      toast.error(t.services?.loadError || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (service: Service) => {
    setDeleteModal({ show: true, service, confirmStep: 1 })
  }

  const confirmDelete = async () => {
    if (!deleteModal.service) return
    
    // Jeśli usługa ma rezerwacje i jesteśmy na kroku 1, przejdź do kroku 2 (podwójne potwierdzenie)
    const hasBookings = deleteModal.service._count && deleteModal.service._count.bookings > 0
    if (hasBookings && deleteModal.confirmStep === 1) {
      setDeleteModal({ ...deleteModal, confirmStep: 2 })
      return
    }
    
    try {
      // Dla usług z rezerwacjami użyj force=true
      await servicesApi.delete(deleteModal.service.id, hasBookings)
      toast.success(t.services?.deleted || 'Service deleted')
      setDeleteModal({ show: false, service: null, confirmStep: 1 })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.services?.deleteError || 'Failed to delete service')
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.services?.title || 'Services'}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.services?.subtitle || 'Manage your services'}</p>
        </div>
        
        <button 
          onClick={() => setServiceModal({ show: true, service: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t.services?.addService || 'Add service'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={t.services?.searchPlaceholder || 'Search service...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
          >
            <option value="all">{t.services?.allCategories || 'All categories'}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredServices.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t.services?.noServices || 'No services'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {searchQuery || selectedCategory !== 'all' ? (t.services?.notFound || 'No services found') : (t.services?.addFirst || 'Add your first service')}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <button 
              onClick={() => setServiceModal({ show: true, service: null })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.services?.addService || 'Add service'}</span>
            </button>
          )}
        </div>
      )}

      {/* Services Grid */}
      {!loading && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200 ${!service.isActive ? 'opacity-60' : ''}`}
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-4">
                {service.service_categories ? (
                  <span 
                    className="px-2.5 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${service.service_categories.color}20`,
                      color: service.service_categories.color
                    }}
                  >
                    {service.service_categories.name}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-[var(--bg-card-hover)] text-[var(--text-muted)] text-xs font-medium rounded-full">
                    {t.services?.noCategory || 'No category'}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setServiceModal({ show: true, service })}
                    className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Service Info */}
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{service.name}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{service.description || (t.services?.noDescription || 'No description')}</p>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t.services?.price || 'Price'}</span>
                  <span className="font-medium text-[var(--text-primary)]">{Number(service.basePrice).toFixed(0)} {service.currency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t.services?.duration || 'Duration'}</span>
                  <span className="font-medium text-[var(--text-primary)]">{service.duration} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t.employees?.title || 'Employees'}</span>
                  <span className="font-medium text-[var(--text-primary)]">{service.service_employees?.length || 0}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">{t.bookings?.title || 'Bookings'}</span>
                  <span className="font-medium text-[var(--text-primary)]">{service._count?.bookings || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && deleteModal.service && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal({ show: false, service: null, confirmStep: 1 })}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full max-h-[calc(100vh-120px)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {deleteModal.confirmStep === 2 ? (t.services?.confirmDeleteTitle || 'Potwierdź usunięcie') : (t.services?.deleteService || 'Delete service')}
              </h3>
              <button onClick={() => setDeleteModal({ show: false, service: null, confirmStep: 1 })} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            
            {/* Krok 1: Pierwsze potwierdzenie */}
            {deleteModal.confirmStep === 1 && (
              <>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  {t.services?.deleteConfirm || 'Are you sure you want to delete service'} <strong className="text-[var(--text-primary)]">{deleteModal.service.name}</strong>?
                  {deleteModal.service._count && deleteModal.service._count.bookings > 0 && (
                    <span className="block mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400">
                      <strong>Uwaga:</strong> Ta usługa ma {deleteModal.service._count.bookings} rezerwacji. 
                      Możesz ją usunąć, ale będzie to wymagało dodatkowego potwierdzenia.
                    </span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal({ show: false, service: null, confirmStep: 1 })} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">
                    {t.common?.cancel || 'Cancel'}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    {deleteModal.service._count && deleteModal.service._count.bookings > 0 
                      ? (t.services?.continueDelete || 'Kontynuuj usuwanie')
                      : (t.common?.delete || 'Delete')}
                  </button>
                </div>
              </>
            )}
            
            {/* Krok 2: Drugie potwierdzenie dla usług z rezerwacjami */}
            {deleteModal.confirmStep === 2 && (
              <>
                <div className="mb-6">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                    <p className="text-red-700 dark:text-red-400 font-semibold mb-2">⚠️ Ostateczne ostrzeżenie</p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Usuwasz usługę <strong>{deleteModal.service.name}</strong> która ma <strong>{deleteModal.service._count?.bookings || 0} rezerwacji</strong>.
                    </p>
                  </div>
                  <div className="text-sm text-[var(--text-muted)] space-y-2">
                    <p><strong>Co się stanie po usunięciu:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Usługa zostanie trwale usunięta z systemu</li>
                      <li>Powiązane rezerwacje pozostaną w historii, ale bez przypisanej usługi</li>
                      <li>Klienci nie będą mogli już rezerwować tej usługi</li>
                      <li><strong className="text-red-500">Ta operacja jest nieodwracalna!</strong></li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteModal({ ...deleteModal, confirmStep: 1 })} 
                    className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm"
                  >
                    {t.common?.back || 'Wróć'}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors font-semibold"
                  >
                    {t.services?.confirmDelete || 'Tak, usuń bezpowrotnie'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={serviceModal.show}
        service={serviceModal.service}
        onClose={() => setServiceModal({ show: false, service: null })}
        onSaved={loadData}
      />
    </div>
  )
}
