'use client'

import { CreditCard, Save, Loader2 } from 'lucide-react'
import { CompanyData } from '@/lib/company'

interface PaymentsTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

export default function PaymentsTab({ companyData, setCompanyData, onSave, isLoading }: PaymentsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Metody płatności</h2>
      
      <p className="text-neutral-gray mb-6">
        Wybierz dostępne metody płatności dla swoich klientów
      </p>

      {/* Płatność na miejscu (Gotówka) */}
      <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-white">Płatność na miejscu</h3>
              <p className="text-xs sm:text-sm text-neutral-gray">Gotówka, karta przy wizycie</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(companyData.paymentMethods as any)?.cash?.enabled !== false}
              onChange={(e) => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  cash: { 
                    enabled: e.target.checked
                  }
                } as any
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-neon"></div>
          </label>
        </div>
        
        {/* Toggle automatycznego zatwierdzania */}
        {(companyData.paymentMethods as any)?.cash?.enabled !== false && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-white">Automatyczne zatwierdzanie rezerwacji</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Gdy włączone, rezerwacje z płatnością na miejscu są automatycznie potwierdzane. 
                  Gdy wyłączone, wymagają ręcznego zatwierdzenia w panelu.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={(companyData as any).autoConfirmBookings !== false}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    autoConfirmBookings: e.target.checked
                  } as any)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-neon"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 my-6"></div>
      <h3 className="text-xl font-bold text-white mb-4">Płatności online</h3>

      {/* Stripe */}
      <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-white">Stripe</h3>
              <p className="text-xs sm:text-sm text-neutral-gray">Karty płatnicze, BLIK, przelewy</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={companyData.paymentMethods?.stripe?.enabled || false}
              onChange={(e) => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  stripe: { 
                    enabled: e.target.checked,
                    publicKey: companyData.paymentMethods?.stripe?.publicKey,
                    secretKey: companyData.paymentMethods?.stripe?.secretKey
                  }
                }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-neon"></div>
          </label>
        </div>
        
        {companyData.paymentMethods?.stripe?.enabled && (
          <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Public Key
              </label>
              <input
                type="text"
                value={companyData.paymentMethods?.stripe?.publicKey || ''}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  paymentMethods: {
                    ...companyData.paymentMethods,
                    stripe: {
                      enabled: true,
                      publicKey: e.target.value,
                      secretKey: companyData.paymentMethods?.stripe?.secretKey
                    }
                  }
                })}
                className="input-glass w-full"
                placeholder="pk_live_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={companyData.paymentMethods?.stripe?.secretKey || ''}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  paymentMethods: {
                    ...companyData.paymentMethods,
                    stripe: {
                      enabled: true,
                      publicKey: companyData.paymentMethods?.stripe?.publicKey,
                      secretKey: e.target.value
                    }
                  }
                })}
                className="input-glass w-full"
                placeholder="sk_live_..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Przelewy24 */}
      <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-white">Przelewy24</h3>
              <p className="text-xs sm:text-sm text-neutral-gray">Popularna bramka płatności w Polsce</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={companyData.paymentMethods?.przelewy24?.enabled || false}
              onChange={(e) => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  przelewy24: { 
                    enabled: e.target.checked,
                    merchantId: companyData.paymentMethods?.przelewy24?.merchantId,
                    crcKey: companyData.paymentMethods?.przelewy24?.crcKey
                  }
                }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-neon"></div>
          </label>
        </div>
        
        {companyData.paymentMethods?.przelewy24?.enabled && (
          <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                Merchant ID
              </label>
              <input
                type="text"
                value={companyData.paymentMethods?.przelewy24?.merchantId || ''}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  paymentMethods: {
                    ...companyData.paymentMethods,
                    przelewy24: {
                      enabled: true,
                      merchantId: e.target.value,
                      crcKey: companyData.paymentMethods?.przelewy24?.crcKey
                    }
                  }
                })}
                className="input-glass w-full"
                placeholder="12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                POS ID
              </label>
              <input
                type="text"
                value={(companyData.paymentMethods?.przelewy24 as any)?.posId || ''}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  paymentMethods: {
                    ...companyData.paymentMethods,
                    przelewy24: {
                      ...companyData.paymentMethods?.przelewy24,
                      enabled: true,
                      posId: e.target.value
                    } as any
                  }
                })}
                className="input-glass w-full"
                placeholder="12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                CRC Key
              </label>
              <input
                type="password"
                value={companyData.paymentMethods?.przelewy24?.crcKey || ''}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  paymentMethods: {
                    ...companyData.paymentMethods,
                    przelewy24: {
                      ...companyData.paymentMethods?.przelewy24,
                      enabled: true,
                      crcKey: e.target.value
                    } as any
                  }
                })}
                className="input-glass w-full"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-gray mb-2">
                API Key
              </label>
              <input
                type="password"
                value={(companyData.paymentMethods?.przelewy24 as any)?.apiKey || ''}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  paymentMethods: {
                    ...companyData.paymentMethods,
                    przelewy24: {
                      ...companyData.paymentMethods?.przelewy24,
                      enabled: true,
                      apiKey: e.target.value
                    } as any
                  }
                })}
                className="input-glass w-full"
                placeholder="••••••••"
              />
            </div>
          </div>
        )}
      </div>

      {/* PayU - Wkrótce dostępne */}
      <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg opacity-60 relative">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-yellow-500/20 text-yellow-400 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full border border-yellow-500/30">
          Wkrótce
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 mt-6 sm:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center opacity-50 flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-white">PayU</h3>
              <p className="text-xs sm:text-sm text-neutral-gray">Szybkie płatności online</p>
            </div>
          </div>
          <div className="w-11 h-6 bg-white/10 rounded-full relative">
            <div className="absolute top-[2px] left-[2px] bg-gray-400 rounded-full h-5 w-5"></div>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Integracja z PayU będzie dostępna wkrótce. Na ten moment skorzystaj z Przelewy24 lub Stripe.
        </p>
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
