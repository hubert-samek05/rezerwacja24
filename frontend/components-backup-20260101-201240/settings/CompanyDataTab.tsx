'use client'

import { Mail, Phone, MapPin, FileText, Save, Loader2 } from 'lucide-react'
import { CompanyData } from '@/lib/company'

interface CompanyDataTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

export default function CompanyDataTab({ companyData, setCompanyData, onSave, isLoading }: CompanyDataTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Dane firmy</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Nazwa firmy *
          </label>
          <input
            type="text"
            value={companyData.businessName}
            onChange={(e) => setCompanyData({ ...companyData, businessName: e.target.value })}
            className="input-glass w-full"
            placeholder="Nazwa Twojej firmy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
            <input
              type="email"
              value={companyData.email}
              onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
              className="input-glass w-full pl-12"
              placeholder="kontakt@firma.pl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Telefon
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
            <input
              type="tel"
              value={companyData.phone}
              onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
              className="input-glass w-full pl-12"
              placeholder="+48 123 456 789"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            NIP
          </label>
          <input
            type="text"
            value={companyData.nip || ''}
            onChange={(e) => setCompanyData({ ...companyData, nip: e.target.value })}
            className="input-glass w-full"
            placeholder="1234567890"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Adres
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-neutral-gray/50" />
            <input
              type="text"
              value={companyData.address}
              onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
              className="input-glass w-full pl-12"
              placeholder="ul. Przykładowa 123"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Miasto
          </label>
          <input
            type="text"
            value={companyData.city}
            onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
            className="input-glass w-full"
            placeholder="Warszawa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Kod pocztowy
          </label>
          <input
            type="text"
            value={companyData.postalCode}
            onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
            className="input-glass w-full"
            placeholder="00-000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-gray mb-2">
            Opis firmy
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-neutral-gray/50" />
            <textarea
              value={companyData.description || ''}
              onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
              className="input-glass w-full pl-12 min-h-[120px]"
              placeholder="Krótki opis Twojej firmy..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="btn-neon flex items-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Zapisz zmiany</span>
        </button>
      </div>
    </div>
  )
}
