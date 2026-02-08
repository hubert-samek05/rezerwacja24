'use client'

import { useState, useEffect } from 'react'
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
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

export default function CategoriesPage() {
  const { t, language } = useDashboardTranslation()
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; category: ServiceCategory | null }>({ show: false, category: null })
  const [editModal, setEditModal] = useState<{ show: boolean; category: ServiceCategory | null }>({ show: false, category: null })
  const [createModal, setCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#64748b',
    order: 0,
  })

  const PRESET_COLORS = [
    '#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#64748b',
      order: 0,
    })
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Kategorie</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Organizuj usługi w kategorie</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setCreateModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj kategorię</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 text-center">
          <FolderTree className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Brak kategorii</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">Dodaj pierwszą kategorię usług</p>
          <button 
            onClick={() => { resetForm(); setCreateModal(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj kategorię</span>
          </button>
        </div>
      )}

      {/* Categories List */}
      {!loading && categories.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="divide-y divide-[var(--border-color)]">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="text-[var(--text-muted)] cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name[0].toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--text-primary)]">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-[var(--text-muted)] truncate">{category.description}</p>
                  )}
                </div>
                
                <div className="text-sm text-[var(--text-muted)]">
                  {category._count?.services || 0} usług
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditModal(category)}
                    className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ show: true, category })}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(createModal || editModal.show) && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setCreateModal(false); setEditModal({ show: false, category: null }) }}
        >
          <div 
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--text-primary)]">
                {editModal.show ? 'Edytuj kategorię' : 'Nowa kategoria'}
              </h3>
              <button 
                onClick={() => { setCreateModal(false); setEditModal({ show: false, category: null }) }}
                className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            
            <form onSubmit={editModal.show ? handleUpdate : handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Nazwa</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                  placeholder="np. Strzyżenie"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Opis (opcjonalnie)</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                  placeholder="Krótki opis kategorii"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Kolor</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-8 h-8 rounded-lg transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setCreateModal(false); setEditModal({ show: false, category: null }) }}
                  className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm"
                >
                  Anuluj
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium"
                >
                  {editModal.show ? 'Zapisz' : 'Utwórz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && deleteModal.category && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteModal({ show: false, category: null })}
        >
          <div 
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full max-h-[calc(100vh-120px)] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Usuń kategorię</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Czy na pewno chcesz usunąć kategorię <strong className="text-[var(--text-primary)]">{deleteModal.category.name}</strong>?
              {deleteModal.category._count && deleteModal.category._count.services > 0 && (
                <span className="block mt-2 text-red-500">
                  Ta kategoria ma {deleteModal.category._count.services} usług i nie może zostać usunięta.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ show: false, category: null })}
                className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm"
              >
                Anuluj
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleteModal.category._count && deleteModal.category._count.services > 0}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
