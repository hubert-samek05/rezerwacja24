'use client'

import { Loader2, Banknote } from 'lucide-react'
import { CompanyData } from '@/lib/company'

interface Przelewy24Settings {
  enabled: boolean
  merchantId?: string
  posId?: string
  crcKey?: string
  apiKey?: string
}

interface PaymentsTabProps {
  companyData: CompanyData
  setCompanyData: (data: CompanyData) => void
  onSave: () => void
  isLoading: boolean
}

// SVG loga inline dla niezawodności
const StripeLogo = () => (
  <svg viewBox="0 0 60 25" className="w-10 h-5" fill="white">
    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.3-5.63c-1.03 0-1.87.73-2.03 2.2h4.09c-.15-1.47-1.03-2.2-2.06-2.2zM41.14 20.3V5.57l4.15-.67v14.4c0 2.97-1.41 4.36-4.36 4.36-.67 0-1.41-.07-1.93-.22v-3.32c.3.07.67.11.93.11.78 0 1.21-.37 1.21-1.21v-.72zm-2.08-14.73c0-1.33 1.03-2.42 2.42-2.42s2.42 1.1 2.42 2.42c0 1.33-1.03 2.42-2.42 2.42s-2.42-1.1-2.42-2.42zM33.17 20.3l-2.5-5.78-1.48 1.78v4h-4.15V.67l4.15-.67v12.73l3.62-4.87h4.87l-4.43 5.19 4.8 7.25h-4.88zm-12.73 0h-4.15V7.86h4.15v12.44zm-2.08-14.73c-1.33 0-2.42-1.1-2.42-2.42s1.1-2.42 2.42-2.42 2.42 1.1 2.42 2.42-1.1 2.42-2.42 2.42zM9.93 20.3c-1.85 0-3.36-.52-4.36-1.26l.74-3.1c.89.59 2.08 1.04 3.36 1.04 1.04 0 1.56-.37 1.56-.89 0-.59-.67-.81-1.93-1.19-2.31-.67-4.02-1.78-4.02-4.24 0-2.5 2.01-4.36 5.19-4.36 1.63 0 3.06.37 4.06.96l-.74 3.06c-.74-.44-1.78-.81-2.98-.81-.89 0-1.41.3-1.41.81 0 .52.59.74 1.71 1.11 2.46.74 4.24 1.78 4.24 4.28 0 2.61-2.01 4.59-5.42 4.59z"/>
  </svg>
)

const P24Logo = () => (
  <svg viewBox="0 0 120 50" className="w-12 h-6">
    <rect width="120" height="50" rx="4" fill="#D13239"/>
    <text x="10" y="36" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="white">Przelewy</text>
    <text x="95" y="36" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="white">24</text>
  </svg>
)

const PayULogo = () => (
  <svg viewBox="0 0 80 35" className="w-10 h-5">
    <text x="5" y="26" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#A6C307">Pay</text>
    <text x="42" y="26" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#169BD7">U</text>
  </svg>
)

const TpayLogo = () => (
  <svg viewBox="0 0 70 30" className="w-10 h-5">
    <text x="5" y="23" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#00A0E3">tpay</text>
  </svg>
)

const BlikLogo = () => (
  <svg viewBox="0 0 70 30" className="w-10 h-5">
    <rect width="70" height="30" rx="4" fill="#E6007A"/>
    <text x="10" y="22" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="white">BLIK</text>
  </svg>
)

export default function PaymentsTab({ companyData, setCompanyData, onSave, isLoading }: PaymentsTabProps) {
  const inputClass = "w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors"
  
  // Cast przelewy24 do pełnego typu
  const p24 = companyData.paymentMethods?.przelewy24 as Przelewy24Settings | undefined
  
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-14 h-8 rounded-full transition-all relative ${checked ? 'bg-green-500' : 'bg-[var(--border-color)]'}`}
    >
      <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  )
  
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Metody płatności</h2>
        <p className="text-[var(--text-muted)] mt-1">Wybierz jak klienci mogą płacić za rezerwacje</p>
      </div>

      <div className="space-y-6">
        {/* Płatność na miejscu */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Banknote className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Płatność na miejscu</h3>
                <p className="text-sm text-[var(--text-muted)]">Gotówka lub karta przy wizycie</p>
              </div>
            </div>
            <Toggle 
              checked={(companyData.paymentMethods as any)?.cash?.enabled !== false}
              onChange={() => setCompanyData({
                ...companyData,
                paymentMethods: { ...companyData.paymentMethods, cash: { enabled: !(companyData.paymentMethods as any)?.cash?.enabled } } as any
              })}
            />
          </div>
          
          {(companyData.paymentMethods as any)?.cash?.enabled !== false && (
            <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-xl">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Automatyczne zatwierdzanie</p>
                  <p className="text-sm text-[var(--text-muted)]">Rezerwacje potwierdzane bez ręcznej akceptacji</p>
                </div>
                <Toggle 
                  checked={(companyData as any).autoConfirmBookings !== false}
                  onChange={() => setCompanyData({ ...companyData, autoConfirmBookings: !(companyData as any).autoConfirmBookings } as any)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja płatności online */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Płatności online</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">Przyjmuj płatności kartą i przelewem online</p>
        </div>

        {/* Stripe */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#635BFF] rounded-xl flex items-center justify-center shadow-lg">
                <StripeLogo />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Stripe</h3>
                <p className="text-sm text-[var(--text-muted)]">Karty płatnicze, BLIK, Apple Pay, Google Pay</p>
              </div>
            </div>
            <Toggle 
              checked={companyData.paymentMethods?.stripe?.enabled || false}
              onChange={() => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  stripe: { enabled: !companyData.paymentMethods?.stripe?.enabled, publicKey: companyData.paymentMethods?.stripe?.publicKey, secretKey: companyData.paymentMethods?.stripe?.secretKey }
                }
              })}
            />
          </div>
          
          {companyData.paymentMethods?.stripe?.enabled && (
            <div className="mt-5 pt-5 border-t border-[var(--border-color)] space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Utwórz konto na <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">stripe.com</a> i skopiuj klucze API z panelu Stripe Dashboard.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Publishable Key</label>
                <input
                  type="text"
                  value={companyData.paymentMethods?.stripe?.publicKey || ''}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    paymentMethods: { ...companyData.paymentMethods, stripe: { enabled: true, publicKey: e.target.value, secretKey: companyData.paymentMethods?.stripe?.secretKey } }
                  })}
                  className={inputClass}
                  placeholder="pk_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Secret Key</label>
                <input
                  type="password"
                  value={companyData.paymentMethods?.stripe?.secretKey || ''}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    paymentMethods: { ...companyData.paymentMethods, stripe: { enabled: true, publicKey: companyData.paymentMethods?.stripe?.publicKey, secretKey: e.target.value } }
                  })}
                  className={inputClass}
                  placeholder="sk_live_..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Przelewy24 */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#D13239] rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <P24Logo />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Przelewy24</h3>
                <p className="text-sm text-[var(--text-muted)]">BLIK, szybkie przelewy, karty</p>
              </div>
            </div>
            <Toggle 
              checked={p24?.enabled || false}
              onChange={() => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  przelewy24: { enabled: !p24?.enabled, merchantId: p24?.merchantId, crcKey: p24?.crcKey }
                }
              })}
            />
          </div>
          
          {p24?.enabled && (
            <div className="mt-5 pt-5 border-t border-[var(--border-color)] space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Zarejestruj się na <a href="https://przelewy24.pl" target="_blank" rel="noopener noreferrer" className="underline font-medium">przelewy24.pl</a> i pobierz dane integracyjne z panelu sprzedawcy.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Merchant ID</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="12345"
                    value={p24?.merchantId || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        przelewy24: { ...p24 as any, enabled: p24?.enabled || false, merchantId: e.target.value }
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">POS ID</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="12345"
                    value={p24?.posId || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        przelewy24: { ...p24 as any, enabled: p24?.enabled || false, posId: e.target.value }
                      }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">CRC Key</label>
                <input 
                  type="password" 
                  className={inputClass} 
                  placeholder="••••••••"
                  value={p24?.crcKey || ''}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    paymentMethods: {
                      ...companyData.paymentMethods,
                      przelewy24: { ...p24 as any, enabled: p24?.enabled || false, crcKey: e.target.value }
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">API Key</label>
                <input 
                  type="password" 
                  className={inputClass} 
                  placeholder="••••••••"
                  value={p24?.apiKey || ''}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    paymentMethods: {
                      ...companyData.paymentMethods,
                      przelewy24: { ...p24 as any, enabled: p24?.enabled || false, apiKey: e.target.value }
                    }
                  })}
                />
              </div>
            </div>
          )}
        </div>

        {/* PayU */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
            Wkrótce
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-200">
              <PayULogo />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">PayU</h3>
              <p className="text-sm text-[var(--text-muted)]">Szybkie płatności online, raty</p>
            </div>
          </div>
        </div>

        {/* Tpay */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
            Wkrótce
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-200">
              <TpayLogo />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Tpay</h3>
              <p className="text-sm text-[var(--text-muted)]">Przelewy, BLIK, karty, portfele</p>
            </div>
          </div>
        </div>

        {/* BLIK */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
            Wkrótce
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-200 overflow-hidden">
              <BlikLogo />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">BLIK bezpośrednio</h3>
              <p className="text-sm text-[var(--text-muted)]">Płatności BLIK bez pośredników</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="px-8 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2 text-base"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? 'Zapisywanie...' : 'Zapisz ustawienia płatności'}
        </button>
      </div>
    </div>
  )
}
