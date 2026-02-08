'use client'

import { useState, useEffect } from 'react'
import { Building2, User, Loader2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDashboardTranslations } from '@/hooks/useDashboardTranslations'

type BillingType = 'company' | 'individual'

interface BillingData {
  billingType: BillingType
  billingCompanyName: string
  billingFirstName: string
  billingLastName: string
  nip: string
  billingAddress: string
  billingPostalCode: string
  billingCity: string
  billingEmail: string
}

export default function BillingDataTab() {
  const { d, isB2B } = useDashboardTranslations()
  const [data, setData] = useState<BillingData>({
    billingType: 'company',
    billingCompanyName: '',
    billingFirstName: '',
    billingLastName: '',
    nip: '',
    billingAddress: '',
    billingPostalCode: '',
    billingCity: '',
    billingEmail: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tenant/billing-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const result = await response.json()
        setData({
          billingType: result.billingType || (result.nip ? 'company' : 'individual'),
          billingCompanyName: result.billingCompanyName || '',
          billingFirstName: result.billingFirstName || '',
          billingLastName: result.billingLastName || '',
          nip: result.nip || '',
          billingAddress: result.billingAddress || '',
          billingPostalCode: result.billingPostalCode || '',
          billingCity: result.billingCity || '',
          billingEmail: result.billingEmail || '',
        })
      }
    } catch (err) {
      console.error('Error fetching billing data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tenant/billing-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        toast.success(isB2B ? 'Data saved' : 'Dane zapisane')
      } else {
        toast.error(isB2B ? 'Save error' : 'Błąd zapisu')
      }
    } catch (err) {
      toast.error(isB2B ? 'An error occurred' : 'Wystąpił błąd')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors"

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{d.billingData?.title || 'Billing Data'}</h2>
        <p className="text-[var(--text-muted)] mt-1">{d.billingData?.description || 'Data used for invoicing'}</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300">{isB2B ? 'Data saved!' : 'Dane zapisane!'}</span>
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Billing type */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">{d.billingData?.billingType || 'Billing type'}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setData({ ...data, billingType: 'company' })}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                data.billingType === 'company' 
                  ? 'border-[var(--text-primary)] bg-[var(--bg-card-hover)]' 
                  : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
              }`}
            >
              <Building2 className={`w-5 h-5 ${data.billingType === 'company' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} />
              <span className={data.billingType === 'company' ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}>{d.billingData?.company || 'Company'}</span>
            </button>
            <button
              onClick={() => setData({ ...data, billingType: 'individual' })}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                data.billingType === 'individual' 
                  ? 'border-[var(--text-primary)] bg-[var(--bg-card-hover)]' 
                  : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
              }`}
            >
              <User className={`w-5 h-5 ${data.billingType === 'individual' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} />
              <span className={data.billingType === 'individual' ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}>{d.billingData?.individual || 'Individual'}</span>
            </button>
          </div>
        </div>

        {/* Company fields */}
        {data.billingType === 'company' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{d.billingData?.companyName || 'Company name'}</label>
              <input
                type="text"
                value={data.billingCompanyName}
                onChange={(e) => setData({ ...data, billingCompanyName: e.target.value })}
                className={inputClass}
                placeholder={isB2B ? 'Company Ltd.' : 'Nazwa firmy Sp. z o.o.'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{isB2B ? 'VAT ID' : 'NIP'}</label>
              <input
                type="text"
                value={data.nip}
                onChange={(e) => setData({ ...data, nip: e.target.value })}
                className={inputClass}
                placeholder={isB2B ? 'DE123456789' : '1234567890'}
              />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{d.billingData?.firstName || 'First name'}</label>
              <input
                type="text"
                value={data.billingFirstName}
                onChange={(e) => setData({ ...data, billingFirstName: e.target.value })}
                className={inputClass}
                placeholder={isB2B ? 'John' : 'Jan'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{d.billingData?.lastName || 'Last name'}</label>
              <input
                type="text"
                value={data.billingLastName}
                onChange={(e) => setData({ ...data, billingLastName: e.target.value })}
                className={inputClass}
                placeholder={isB2B ? 'Smith' : 'Kowalski'}
              />
            </div>
          </div>
        )}

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{d.billingData?.address || 'Address'}</label>
          <input
            type="text"
            value={data.billingAddress}
            onChange={(e) => setData({ ...data, billingAddress: e.target.value })}
            className={inputClass}
            placeholder={isB2B ? '123 Main Street' : 'ul. Przykładowa 123'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{d.billingData?.postalCode || 'Postal code'}</label>
            <input
              type="text"
              value={data.billingPostalCode}
              onChange={(e) => setData({ ...data, billingPostalCode: e.target.value })}
              className={inputClass}
              placeholder={isB2B ? '12345' : '00-000'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{d.billingData?.city || 'City'}</label>
            <input
              type="text"
              value={data.billingCity}
              onChange={(e) => setData({ ...data, billingCity: e.target.value })}
              className={inputClass}
              placeholder={isB2B ? 'Berlin' : 'Warszawa'}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{d.billingData?.email || 'Billing email'}</label>
          <input
            type="email"
            value={data.billingEmail}
            onChange={(e) => setData({ ...data, billingEmail: e.target.value })}
            className={inputClass}
            placeholder={isB2B ? 'invoices@company.com' : 'faktury@firma.pl'}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">{isB2B ? 'Invoices will be sent to this address' : 'Na ten adres będą wysyłane faktury'}</p>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? (d.buttons?.saving || 'Saving...') : (d.buttons?.save || 'Save')}
        </button>
      </div>
    </div>
  )
}
