'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Edit,
  Trash2,
  FolderTree,
  AlertCircle,
  X,
  GripVertical
} from 'lucide-react'
import { servicesApi, ServiceCategory } from '@/lib/api/services'
import toast from 'react-hot-toast'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; category: ServiceCategory | null }>({ show: false, category: null })
  const [editModal, setEditModal] = useState<{ show: boolean; category: ServiceCategory | null }>({ show: false, category: null })
  const [createModal, setCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#0F6048',
    order: 0,
  })

  const PRESET_COLORS = [
    '#0F6048', '#41FFBC', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await servicesApi.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      toast.error('Nie udało się załadować kategorii')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('Nazwa kategorii jest wymagana')
      return
    }

    try {
      await servicesApi.createCategory({
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        color: formData.color,
        order: categories.length,
      })
      toast.success('Kategoria została utworzona')
      setCreateModal(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Błąd tworzenia:', error)
      toast.error(error.response?.data?.message || 'Nie udało się utworzyć kategorii')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editModal.category) return

    try {
      await servicesApi.updateCategory(editModal.category.id, {
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        color: formData.color,
      })
      toast.success('Kategoria została zaktualizowana')
      setEditModal({ show: false, category: null })
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Błąd aktualizacji:', error)
      toast.error(error.response?.data?.message || 'Nie udało się zaktualizować kategorii')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.category) return

    try {
      await servicesApi.deleteCategory(deleteModal.category.id)
      toast.success('Kategoria została usunięta')
      setDeleteModal({ show: false, category: null })
      loadData()
    } catch (error: any) {
      console.error('Błąd usuwania:', error)
      toast.error(error.response?.data?.message || 'Nie udało się usunąć kategorii')
    }
  }

  const openEditModal = (category: ServiceCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color,
      order: category.order,
    })
    setEditModal({ show: true, category })
  }

  const openCreateModal = () => {
    resetForm()
    setCreateModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#0F6048',
      order: 0,
    })
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">Kategorie usług</h1>
            <p className="text-sm sm:text-base text-neutral-gray/70">Organizuj usługi</p>
          </div>
          
          <button 
            onClick={openCreateModal}
            className="btn-neon flex items-center gap-1.5 text-sm sm:text-base px-3 py-2 sm:px-4 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Dodaj kategorię</span>
            <span className="xs:hidden">Dodaj</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FolderTree className="w-16 h-16 text-neutral-gray/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Brak kategorii</h3>
            <p className="text-neutral-gray/70 mb-6">
              Dodaj pierwszą kategorię, aby uporządkować swoje usługi
            </p>
            <button 
              onClick={openCreateModal}
              className="btn-neon inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj kategorię</span>
            </button>
          </div>
        )}

        {/* Categories List */}
        {!loading && categories.length > 0 && (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-3 sm:p-4 flex items-center gap-2 sm:gap-4 overflow-hidden"
              >
                {/* Drag Handle - hidden on mobile */}
                <div className="hidden sm:block cursor-move text-neutral-gray/30 hover:text-neutral-gray flex-shrink-0">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Color */}
                <div 
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-lg font-bold text-white truncate">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-neutral-gray/70 truncate">{category.description}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="text-center px-2 sm:px-4 flex-shrink-0">
                  <div className="text-lg sm:text-2xl font-bold text-accent-neon">
                    {category._count?.services || 0}
                  </div>
                  <div className="text-xs text-neutral-gray/70 hidden sm:block">usług</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:space-x-2 flex-shrink-0">
                  <button 
                    onClick={() => openEditModal(category)}
                    className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-neutral-gray" />
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ show: true, category })}
                    className="p-1.5 sm:p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {(createModal || editModal.show) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setCreateModal(false)
                setEditModal({ show: false, category: null })
                resetForm()
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {editModal.show ? 'Edytuj kategorię' : 'Nowa kategoria'}
                  </h3>
                  <button
                    onClick={() => {
                      setCreateModal(false)
                      setEditModal({ show: false, category: null })
                      resetForm()
                    }}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                <form onSubmit={editModal.show ? handleUpdate : handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Nazwa <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                      placeholder="np. Fryzjerstwo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Opis
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                      placeholder="Krótki opis kategorii..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Kolor
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-10 h-10 rounded-lg border-2 border-white/20"
                        style={{ backgroundColor: formData.color }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                              formData.color === color ? 'ring-2 ring-accent-neon' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateModal(false)
                        setEditModal({ show: false, category: null })
                        resetForm()
                      }}
                      className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-accent-neon hover:bg-accent-neon/80 text-carbon-black font-semibold rounded-lg transition-colors"
                    >
                      {editModal.show ? 'Zapisz' : 'Utwórz'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModal.show && deleteModal.category && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteModal({ show: false, category: null })}
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
                    <h3 className="text-xl font-bold text-white mb-2">Usuń kategorię</h3>
                    <p className="text-neutral-gray/70 mb-4">
                      Czy na pewno chcesz usunąć kategorię <strong className="text-white">{deleteModal.category.name}</strong>?
                      {deleteModal.category._count && deleteModal.category._count.services > 0 && (
                        <span className="block mt-2 text-red-400">
                          Ta kategoria ma {deleteModal.category._count.services} usług i nie może zostać usunięta.
                        </span>
                      )}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setDeleteModal({ show: false, category: null })}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteModal.category._count && deleteModal.category._count.services > 0}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteModal({ show: false, category: null })}
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
    </div>
  )
}
