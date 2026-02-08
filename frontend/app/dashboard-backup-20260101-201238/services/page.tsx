'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Tag,
  Users,
  AlertCircle,
  X
} from 'lucide-react'
import Link from 'next/link'
import { servicesApi, Service, ServiceCategory } from '@/lib/api/services'
import toast from 'react-hot-toast'

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; service: Service | null }>({ show: false, service: null })

  useEffect(() => {
    loadData()
  }, [])

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
      console.error('Błąd ładowania danych:', error)
      toast.error('Nie udało się załadować usług')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (service: Service) => {
    setDeleteModal({ show: true, service })
  }

  const confirmDelete = async () => {
    if (!deleteModal.service) return

    try {
      await servicesApi.delete(deleteModal.service.id)
      toast.success('Usługa została usunięta')
      setDeleteModal({ show: false, service: null })
      loadData()
    } catch (error: any) {
      console.error('Błąd usuwania:', error)
      toast.error(error.response?.data?.message || 'Nie udało się usunąć usługi')
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Zarządzanie usługami</h1>
              <p className="text-neutral-gray/70">Dodawaj, edytuj i organizuj swoje usługi</p>
            </div>
            
            <Link href="/dashboard/services/new" className="btn-neon flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Dodaj usługę</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
                <input
                  type="text"
                  placeholder="Szukaj usługi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-neutral-gray focus:outline-none focus:border-accent-neon"
              >
                <option value="all">Wszystkie kategorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredServices.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Tag className="w-16 h-16 text-neutral-gray/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Brak usług</h3>
              <p className="text-neutral-gray/70 mb-6">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Nie znaleziono usług spełniających kryteria'
                  : 'Dodaj swoją pierwszą usługę, aby rozpocząć'}
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Link href="/dashboard/services/new" className="btn-neon inline-flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Dodaj usługę</span>
                </Link>
              )}
            </div>
          )}

          {/* Services Grid */}
          {!loading && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  {service.service_categories ? (
                    <span 
                      className="px-3 py-1 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: `${service.service_categories.color}20`,
                        color: service.service_categories.color
                      }}
                    >
                      {service.service_categories.name}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-white/5 text-neutral-gray text-xs font-semibold rounded-full">
                      Bez kategorii
                    </span>
                  )}
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/dashboard/services/${service.id}`}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-neutral-gray" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(service)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Service Info */}
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-neutral-gray/70 text-sm mb-4 line-clamp-2">{service.description}</p>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-accent-neon" />
                      <span className="text-sm text-neutral-gray/70">Cena</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{Number(service.basePrice).toFixed(2)} {service.currency}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-accent-neon" />
                      <span className="text-sm text-neutral-gray/70">Czas trwania</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{service.duration} min</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-accent-neon" />
                      <span className="text-sm text-neutral-gray/70">Pracownicy</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{service.service_employees?.length || 0}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-gray/70">Wszystkich rezerwacji</span>
                    <span className="text-accent-neon font-semibold">{service._count?.bookings || 0}</span>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}

          {/* Add Service Card */}
          {!loading && filteredServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Link href="/dashboard/services/new" className="glass-card p-8 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-carbon-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dodaj nową usługę</h3>
                <p className="text-neutral-gray/70 text-sm text-center">
                  Kliknij, aby utworzyć nową usługę dla swojej firmy
                </p>
              </Link>
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteModal.show && deleteModal.service && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setDeleteModal({ show: false, service: null })}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass-card p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Usuń usługę</h3>
                      <p className="text-neutral-gray/70 mb-4">
                        Czy na pewno chcesz usunąć usługę <strong className="text-white">{deleteModal.service.name}</strong>?
                        {deleteModal.service._count && deleteModal.service._count.bookings > 0 && (
                          <span className="block mt-2 text-red-400">
                            Ta usługa ma {deleteModal.service._count.bookings} rezerwacji i nie może zostać usunięta.
                          </span>
                        )}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setDeleteModal({ show: false, service: null })}
                          className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                        >
                          Anuluj
                        </button>
                        <button
                          onClick={confirmDelete}
                          disabled={deleteModal.service._count && deleteModal.service._count.bookings > 0}
                          className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteModal({ show: false, service: null })}
                      className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-neutral-gray" />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

