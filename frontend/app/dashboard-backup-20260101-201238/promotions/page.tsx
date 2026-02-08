'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function PromotionsPage() {
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
      toast.error('Nie udało się załadować kodów rabatowych')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code) {
      toast.error('Kod rabatowy jest wymagany')
      return
    }

    if (formData.discountValue <= 0) {
      toast.error('Wartość rabatu musi być większa od 0')
      return
    }

    try {
      await promotionsApi.create({
        ...formData,
        code: formData.code.toUpperCase(),
      })
      toast.success('Kod rabatowy został utworzony')
      setCreateModal(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Błąd tworzenia:', error)
      toast.error(error.response?.data?.message || 'Nie udało się utworzyć kodu rabatowego')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editModal.coupon) return

    try {
      await promotionsApi.update(editModal.coupon.id, {
        ...formData,
        code: formData.code.toUpperCase(),
      })
      toast.success('Kod rabatowy został zaktualizowany')
      setEditModal({ show: false, coupon: null })
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Błąd aktualizacji:', error)
      toast.error(error.response?.data?.message || 'Nie udało się zaktualizować kodu rabatowego')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.coupon) return

    try {
      await promotionsApi.delete(deleteModal.coupon.id)
      toast.success('Kod rabatowy został usunięty')
      setDeleteModal({ show: false, coupon: null })
      loadData()
    } catch (error: any) {
      console.error('Błąd usuwania:', error)
      toast.error(error.response?.data?.message || 'Nie udało się usunąć kodu rabatowego')
    }
  }

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await promotionsApi.update(coupon.id, { isActive: !coupon.isActive })
      toast.success(coupon.isActive ? 'Kod został dezaktywowany' : 'Kod został aktywowany')
      loadData()
    } catch (error: any) {
      console.error('Błąd zmiany statusu:', error)
      toast.error('Nie udało się zmienić statusu kodu')
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

  const openCreateModal = () => {
    resetForm()
    setCreateModal(true)
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
    toast.success('Kod skopiowany do schowka')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `-${coupon.discountValue}%`
    }
    return `-${coupon.discountValue} PLN`
  }

  const isExpired = (coupon: Coupon) => {
    if (!coupon.validUntil) return false
    return new Date(coupon.validUntil) < new Date()
  }

  const isLimitReached = (coupon: Coupon) => {
    if (!coupon.usageLimit) return false
    return coupon.usageCount >= coupon.usageLimit
  }

  const getStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: 'Nieaktywny', color: 'bg-gray-500/20 text-gray-400' }
    if (isExpired(coupon)) return { label: 'Wygasł', color: 'bg-red-500/20 text-red-400' }
    if (isLimitReached(coupon)) return { label: 'Limit wyczerpany', color: 'bg-orange-500/20 text-orange-400' }
    return { label: 'Aktywny', color: 'bg-green-500/20 text-green-400' }
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code }))
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">Promocje</h1>
            <p className="text-sm sm:text-base text-neutral-gray/70">Zarządzaj kodami rabatowymi</p>
          </div>
          
          <button 
            onClick={openCreateModal}
            className="btn-neon flex items-center gap-1.5 text-sm sm:text-base px-3 py-2 sm:px-4 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Dodaj kod rabatowy</span>
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
        {!loading && coupons.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Percent className="w-16 h-16 text-neutral-gray/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Brak kodów rabatowych</h3>
            <p className="text-neutral-gray/70 mb-6">
              Dodaj pierwszy kod rabatowy, aby oferować zniżki swoim klientom
            </p>
            <button 
              onClick={openCreateModal}
              className="btn-neon inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj kod rabatowy</span>
            </button>
          </div>
        )}

        {/* Coupons List */}
        {!loading && coupons.length > 0 && (
          <div className="space-y-3">
            {coupons.map((coupon, index) => {
              const status = getStatus(coupon)
              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-3 sm:p-4"
                >
                  {/* Mobile Layout */}
                  <div className="flex flex-col sm:hidden gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-neon/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-accent-neon" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white font-mono">{coupon.code}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-neutral-gray/70 truncate">{coupon.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-accent-neon">{formatDiscount(coupon)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-neutral-gray">
                        <span>Użyć: {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
                        {coupon.validUntil && (
                          <span>• Do: {new Date(coupon.validUntil).toLocaleDateString('pl-PL')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1.5 hover:bg-white/5 rounded transition-colors"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-neutral-gray" />
                          )}
                        </button>
                        <button 
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-neutral-gray" />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ show: true, coupon })}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center space-x-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-accent-neon/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-6 h-6 text-accent-neon" />
                    </div>

                    {/* Code & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-white font-mono">{coupon.code}</h3>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                          title="Kopiuj kod"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-neutral-gray" />
                          )}
                        </button>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-neutral-gray/70 truncate">{coupon.description}</p>
                      )}
                    </div>

                    {/* Discount */}
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-accent-neon">
                        {formatDiscount(coupon)}
                      </div>
                      <div className="text-xs text-neutral-gray/70">rabat</div>
                    </div>

                    {/* Usage */}
                    <div className="text-center px-4">
                      <div className="text-lg font-bold text-white">
                        {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                      </div>
                      <div className="text-xs text-neutral-gray/70">użyć</div>
                    </div>

                    {/* Validity */}
                    <div className="text-center px-4 hidden md:block">
                      <div className="flex items-center space-x-1 text-sm text-neutral-gray">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {coupon.validUntil 
                            ? new Date(coupon.validUntil).toLocaleDateString('pl-PL')
                            : 'Bezterminowo'
                          }
                        </span>
                      </div>
                      <div className="text-xs text-neutral-gray/70">ważność</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          coupon.isActive 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        {coupon.isActive ? 'Aktywny' : 'Nieaktywny'}
                      </button>
                      <button 
                        onClick={() => openEditModal(coupon)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-neutral-gray" />
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ show: true, coupon })}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
                setEditModal({ show: false, coupon: null })
                resetForm()
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {editModal.show ? 'Edytuj kod rabatowy' : 'Nowy kod rabatowy'}
                  </h3>
                  <button
                    onClick={() => {
                      setCreateModal(false)
                      setEditModal({ show: false, coupon: null })
                      resetForm()
                    }}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>

                <form onSubmit={editModal.show ? handleUpdate : handleCreate} className="space-y-4">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Kod rabatowy <span className="text-red-400">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        required
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon font-mono uppercase"
                        placeholder="np. LATO2024"
                      />
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-gray transition-colors"
                      >
                        Generuj
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Opis (opcjonalnie)
                    </label>
                    <input
                      type="text"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                      placeholder="np. Promocja letnia"
                    />
                  </div>

                  {/* Discount Type & Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Typ rabatu
                      </label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                      >
                        <option value="PERCENTAGE">Procentowy (%)</option>
                        <option value="FIXED">Kwotowy (PLN)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Wartość rabatu <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                          required
                          min="0"
                          step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                          max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray">
                          {formData.discountType === 'PERCENTAGE' ? '%' : 'PLN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Min Purchase & Max Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Min. wartość zamówienia
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.minPurchase || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                          placeholder="Brak"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray">PLN</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Max. rabat
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.maxDiscount || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                          placeholder="Brak"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray">PLN</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-gray mb-2">
                      Limit użyć
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value ? parseInt(e.target.value) : undefined }))}
                      min="1"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                      placeholder="Bez limitu"
                    />
                  </div>

                  {/* Validity Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Ważny od <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                        required
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Ważny do
                      </label>
                      <input
                        type="date"
                        value={formData.validUntil || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value || undefined }))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                      />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Aktywny</div>
                      <div className="text-sm text-neutral-gray/70">Kod może być używany przez klientów</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.isActive ? 'bg-accent-neon' : 'bg-white/20'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.isActive ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateModal(false)
                        setEditModal({ show: false, coupon: null })
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
          {deleteModal.show && deleteModal.coupon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteModal({ show: false, coupon: null })}
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
                    <h3 className="text-xl font-bold text-white mb-2">Usuń kod rabatowy</h3>
                    <p className="text-neutral-gray/70 mb-4">
                      Czy na pewno chcesz usunąć kod <strong className="text-white font-mono">{deleteModal.coupon.code}</strong>?
                      {deleteModal.coupon.usageCount > 0 && (
                        <span className="block mt-2 text-yellow-400">
                          Ten kod został użyty {deleteModal.coupon.usageCount} razy.
                        </span>
                      )}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setDeleteModal({ show: false, coupon: null })}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteModal({ show: false, coupon: null })}
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
