'use client'

import { Loader2, Building2, Mail, Phone, MapPin, FileText } from 'lucide-react'
import { CompanyData } from '@/lib/company'
import { useDashboardTranslations } from '@/hooks/useDashboardTranslations'

interface CompanyDataTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

export default function CompanyDataTab({ companyData, setCompanyData, onSave, isLoading }: CompanyDataTabProps) {
  const { d, isB2B } = useDashboardTranslations()
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{d.companyData?.title || 'Company Data'}</h2>
        <p className="text-[var(--text-muted)] mt-1">{d.companyData?.description || 'Basic information about your company'}</p>
      </div>
      
      <div className="space-y-8">
        {/* Sekcja: Podstawowe informacje */}
        <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">{isB2B ? 'Basic Information' : 'Podstawowe informacje'}</h3>
              <p className="text-sm text-[var(--text-muted)]">{isB2B ? 'Company name and description' : 'Nazwa i opis firmy'}</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {d.companyData?.companyName || 'Company name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyData.businessName}
                onChange={(e) => setCompanyData({ ...companyData, businessName: e.target.value })}
                className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                placeholder={isB2B ? 'Your company name' : 'Nazwa Twojej firmy'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {d.companyData?.description2 || 'Description'}
              </label>
              <textarea
                value={companyData.description || ''}
                onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all resize-none"
                placeholder={isB2B ? 'Short description visible to customers...' : 'Krótki opis Twojej firmy widoczny dla klientów...'}
              />
            </div>
          </div>
        </div>

        {/* Sekcja: Kontakt */}
        <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">{isB2B ? 'Contact Details' : 'Dane kontaktowe'}</h3>
              <p className="text-sm text-[var(--text-muted)]">{isB2B ? 'Email, phone and VAT ID' : 'Email, telefon i NIP'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {d.companyData?.email || 'Email'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                placeholder={isB2B ? 'contact@company.com' : 'kontakt@firma.pl'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {d.companyData?.phone || 'Phone'}
              </label>
              <input
                type="tel"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                placeholder={isB2B ? '+49 123 456 789' : '+48 123 456 789'}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {isB2B ? 'VAT ID' : 'NIP'}
              </label>
              <input
                type="text"
                value={companyData.nip || ''}
                onChange={(e) => setCompanyData({ ...companyData, nip: e.target.value })}
                className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                placeholder={isB2B ? 'DE123456789' : '1234567890'}
              />
              <p className="text-xs text-[var(--text-muted)] mt-2">{isB2B ? 'Tax identification number' : 'Numer identyfikacji podatkowej'}</p>
            </div>
          </div>
        </div>

        {/* Sekcja: Adres */}
        <div className="bg-[var(--bg-primary)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">{d.companyData?.address || 'Address'}</h3>
              <p className="text-sm text-[var(--text-muted)]">{isB2B ? 'Company location' : 'Lokalizacja firmy'}</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {isB2B ? 'Street and number' : 'Ulica i numer'}
              </label>
              <input
                type="text"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                placeholder={isB2B ? '123 Main Street' : 'ul. Przykładowa 123'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {d.companyData?.city || 'City'}
                </label>
                <input
                  type="text"
                  value={companyData.city}
                  onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                  placeholder={isB2B ? 'Berlin' : 'Warszawa'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {d.companyData?.postalCode || 'Postal code'}
                </label>
                <input
                  type="text"
                  value={companyData.postalCode}
                  onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 focus:border-[var(--text-primary)] transition-all"
                  placeholder={isB2B ? '12345' : '00-000'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="px-8 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? (d.buttons?.saving || 'Saving...') : (d.buttons?.save || 'Save changes')}
        </button>
      </div>
    </div>
  )
}
