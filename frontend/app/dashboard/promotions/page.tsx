'use client'

import { useState, useEffect } from 'react'
import { 
  Plus,
  Edit,
  Trash2,
  Percent,
  AlertCircle,
  X,
  Copy,
  Check,
  Calendar,
  Tag
} from 'lucide-react'
import { promotionsApi, Coupon, CreateCouponData } from '@/lib/api/promotions'
import toast from 'react-hot-toast'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

export default function PromotionsPage() {
  const { t, language } = useDashboardTranslation()
  const currency = language === 'pl' ? 'zł' : '€'
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; coupon: Coupon | null }>({ show: false, coupon: null })
  const [editModal, setEditModal] = useState<{ show: boolean; coupon: Coupon | null }>({ show: false, coupon: null })
  const [createModal, setCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateCouponData>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchase: undefined,
    maxDiscount: undefined,
    usageLimit: undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: undefined,
    isActive: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await promotionsApi.getAll()
      setCoupons(data)
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      toast.error(t.promotions?.loadError || 'Failed to load promo codes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code) {
      toast.error(t.promotions?.codeRequired || 'Promo code is required')
      return
    }
    if (formData.discountValue <= 0) {
      toast.error(t.promotions?.valueRequired || 'Discount value must be greater than 0')
      return
    }
    try {
      await promotionsApi.create({ ...formData, code: formData.code.toUpperCase() })
      toast.success(t.promotions?.created || 'Promo code created')
      setCreateModal(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.promotions?.createError || 'Failed to create promo code')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal.coupon) return
    try {
      await promotionsApi.update(editModal.coupon.id, { ...formData, code: formData.code.toUpperCase() })
      toast.success(t.promotions?.updated || 'Promo code updated')
      setEditModal({ show: false, coupon: null })
      resetForm()
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.promotions?.updateError || 'Failed to update promo code')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.coupon) return
    try {
      await promotionsApi.delete(deleteModal.coupon.id)
      toast.success(t.promotions?.deleted || 'Promo code deleted')
      setDeleteModal({ show: false, coupon: null })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.promotions?.deleteError || 'Failed to delete promo code')
    }
  }

  const openEditModal = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : undefined,
      isActive: coupon.isActive,
    })
    setEditModal({ show: true, coupon })
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: undefined,
      maxDiscount: undefined,
      usageLimit: undefined,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: undefined,
      isActive: true,
    })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(t.common?.copiedToClipboard || 'Copied to clipboard')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code }))
  }

  const formatDiscount = (coupon: Coupon) => {
    return coupon.discountType === 'PERCENTAGE' ? `-${coupon.discountValue}%` : `-${coupon.discountValue} zł`
  }

  const isExpired = (coupon: Coupon) => coupon.validUntil && new Date(coupon.validUntil) < new Date()
  const isLimitReached = (coupon: Coupon) => coupon.usageLimit && coupon.usageCount >= coupon.usageLimit

  const getStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: 'Nieaktywny', class: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }
    if (isExpired(coupon)) return { label: 'Wygasł', class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
    if (isLimitReached(coupon)) return { label: 'Limit', class: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
    return { label: 'Aktywny', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Promocje</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Zarządzaj kodami rabatowymi</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setCreateModal(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Dodaj kod</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && coupons.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-4">
            <Percent className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Brak kodów rabatowych</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">Dodaj pierwszy kod rabatowy</p>
          <button 
            onClick={() => { resetForm(); setCreateModal(true) }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj kod</span>
          </button>
        </div>
      )}

      {/* Coupons Grid */}
      {!loading && coupons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const status = getStatus(coupon)
            return (
              <div key={coupon.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-[var(--text-primary)]">{coupon.code}</span>
                    <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-[var(--bg-card-hover)] rounded">
                      {copiedCode === coupon.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
                    </button>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.class}`}>{status.label}</span>
                </div>

                <div className="text-3xl font-bold text-[var(--text-primary)] mb-3">{formatDiscount(coupon)}</div>

                {coupon.description && (
                  <p className="text-sm text-[var(--text-muted)] mb-3">{coupon.description}</p>
                )}

                <div className="space-y-1 text-sm text-[var(--text-muted)] mb-4">
                  <div className="flex justify-between">
                    <span>Użycia</span>
                    <span className="text-[var(--text-primary)]">{coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
                  </div>
                  {coupon.validUntil && (
                    <div className="flex justify-between">
                      <span>Ważny do</span>
                      <span className="text-[var(--text-primary)]">{new Date(coupon.validUntil).toLocaleDateString('pl-PL')}</span>
                    </div>
                  )}
                  {coupon.minPurchase && (
                    <div className="flex justify-between">
                      <span>Min. zakup</span>
                      <span className="text-[var(--text-primary)]">{coupon.minPurchase} zł</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-color)]">
                  <button onClick={() => openEditModal(coupon)} className="flex-1 px-3 py-2 text-sm text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)]">
                    Edytuj
                  </button>
                  <button onClick={() => setDeleteModal({ show: true, coupon })} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(createModal || editModal.show) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setCreateModal(false); setEditModal({ show: false, coupon: null }) }}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--text-primary)]">{editModal.show ? 'Edytuj kod' : 'Nowy kod rabatowy'}</h3>
              <button onClick={() => { setCreateModal(false); setEditModal({ show: false, coupon: null }) }} className="p-2 hover:bg-[var(--bg-card-hover)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            
            <form onSubmit={editModal.show ? handleUpdate : handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Kod</label>
                <div className="flex gap-2">
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] font-mono" placeholder="RABAT20" />
                  <button type="button" onClick={generateRandomCode} className="px-3 py-2 text-sm text-[var(--text-muted)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)]">Generuj</button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Opis (opcjonalnie)</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]" placeholder="Promocja świąteczna" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Typ rabatu</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]">
                    <option value="PERCENTAGE">Procentowy</option>
                    <option value="FIXED">Kwotowy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Wartość</label>
                  <input type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Ważny od</label>
                  <input type="date" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Ważny do</label>
                  <input type="date" value={formData.validUntil || ''} onChange={e => setFormData({...formData, validUntil: e.target.value || undefined})} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Limit użyć (opcjonalnie)</label>
                <input type="number" value={formData.usageLimit || ''} onChange={e => setFormData({...formData, usageLimit: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]" placeholder="Bez limitu" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setCreateModal(false); setEditModal({ show: false, coupon: null }) }} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">Anuluj</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium">{editModal.show ? 'Zapisz' : 'Utwórz'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && deleteModal.coupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal({ show: false, coupon: null })}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full max-h-[calc(100vh-120px)] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Usuń kod rabatowy</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Czy na pewno chcesz usunąć kod <strong className="text-[var(--text-primary)]">{deleteModal.coupon.code}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ show: false, coupon: null })} className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg text-sm">Anuluj</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm">Usuń</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
