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

// Loga płatności jako obrazki - pełne wypełnienie kontenerów
const StripeLogo = () => (
  <img 
    src="https://logowik.com/content/uploads/images/stripe1461.jpg" 
    alt="Stripe" 
    className="w-full h-full object-cover rounded-lg"
  />
)

const P24Logo = () => (
  <img 
    src="https://images.seeklogo.com/logo-png/24/2/przelewy-24-logo-png_seeklogo-245975.png" 
    alt="Przelewy24" 
    className="w-full h-full object-contain"
  />
)

const PayULogo = () => (
  <svg viewBox="0 0 80 35" className="w-full h-8">
    <text x="5" y="26" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#A6C307">Pay</text>
    <text x="42" y="26" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#169BD7">U</text>
  </svg>
)

const TpayLogo = () => (
  <img 
    src="https://inmarketing.pl/wp-content/uploads/2025/06/Projekt-bez-nazwy.png" 
    alt="Tpay" 
    className="w-full h-full object-contain"
  />
)

const AutopayLogo = () => (
  <img 
    src="https://www.gsmservice.pl/wp-content/uploads/2023/10/autopay.png" 
    alt="Autopay" 
    className="w-full h-full object-contain"
  />
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
              <div className="w-14 h-14 rounded-xl shadow-lg overflow-hidden">
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
              <div className="w-14 h-14 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-1">
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
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex items-center justify-center p-2">
                <PayULogo />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">PayU</h3>
                <p className="text-sm text-[var(--text-muted)]">Szybkie płatności online, raty</p>
              </div>
            </div>
            <Toggle 
              checked={(companyData.paymentMethods as any)?.payu?.enabled || false}
              onChange={() => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  payu: { enabled: !(companyData.paymentMethods as any)?.payu?.enabled }
                } as any
              })}
            />
          </div>
          
          {(companyData.paymentMethods as any)?.payu?.enabled && (
            <div className="mt-5 pt-5 border-t border-[var(--border-color)] space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Zarejestruj się na <a href="https://payu.pl" target="_blank" rel="noopener noreferrer" className="underline font-medium">payu.pl</a> i pobierz dane z panelu sprzedawcy.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">POS ID</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="123456"
                    value={(companyData.paymentMethods as any)?.payu?.posId || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        payu: { ...(companyData.paymentMethods as any)?.payu, enabled: true, posId: e.target.value }
                      } as any
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Second Key (MD5)</label>
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="••••••••"
                    value={(companyData.paymentMethods as any)?.payu?.secondKey || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        payu: { ...(companyData.paymentMethods as any)?.payu, enabled: true, secondKey: e.target.value }
                      } as any
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">OAuth Client ID</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="123456"
                    value={(companyData.paymentMethods as any)?.payu?.clientId || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        payu: { ...(companyData.paymentMethods as any)?.payu, enabled: true, clientId: e.target.value }
                      } as any
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">OAuth Client Secret</label>
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="••••••••"
                    value={(companyData.paymentMethods as any)?.payu?.clientSecret || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        payu: { ...(companyData.paymentMethods as any)?.payu, enabled: true, clientSecret: e.target.value }
                      } as any
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tpay */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-1">
                <TpayLogo />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Tpay</h3>
                <p className="text-sm text-[var(--text-muted)]">Przelewy, BLIK, karty, portfele</p>
              </div>
            </div>
            <Toggle 
              checked={(companyData.paymentMethods as any)?.tpay?.enabled || false}
              onChange={() => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  tpay: { enabled: !(companyData.paymentMethods as any)?.tpay?.enabled }
                } as any
              })}
            />
          </div>
          
          {(companyData.paymentMethods as any)?.tpay?.enabled && (
            <div className="mt-5 pt-5 border-t border-[var(--border-color)] space-y-4">
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                <p className="text-sm text-cyan-700 dark:text-cyan-300">
                  Zarejestruj się na <a href="https://tpay.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">tpay.com</a> i pobierz dane API z panelu.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Client ID</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="123456-abc"
                    value={(companyData.paymentMethods as any)?.tpay?.clientId || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        tpay: { ...(companyData.paymentMethods as any)?.tpay, enabled: true, clientId: e.target.value }
                      } as any
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Client Secret</label>
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="••••••••"
                    value={(companyData.paymentMethods as any)?.tpay?.clientSecret || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        tpay: { ...(companyData.paymentMethods as any)?.tpay, enabled: true, clientSecret: e.target.value }
                      } as any
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Merchant ID</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="12345"
                    value={(companyData.paymentMethods as any)?.tpay?.merchantId || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        tpay: { ...(companyData.paymentMethods as any)?.tpay, enabled: true, merchantId: e.target.value }
                      } as any
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Security Code</label>
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="••••••••"
                    value={(companyData.paymentMethods as any)?.tpay?.securityCode || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        tpay: { ...(companyData.paymentMethods as any)?.tpay, enabled: true, securityCode: e.target.value }
                      } as any
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Autopay (Blue Media) */}
        <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-1">
                <AutopayLogo />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Autopay (Blue Media)</h3>
                <p className="text-sm text-[var(--text-muted)]">Przelewy, BLIK, karty płatnicze</p>
              </div>
            </div>
            <Toggle 
              checked={(companyData.paymentMethods as any)?.autopay?.enabled || false}
              onChange={() => setCompanyData({
                ...companyData,
                paymentMethods: {
                  ...companyData.paymentMethods,
                  autopay: { enabled: !(companyData.paymentMethods as any)?.autopay?.enabled }
                } as any
              })}
            />
          </div>
          
          {(companyData.paymentMethods as any)?.autopay?.enabled && (
            <div className="mt-5 pt-5 border-t border-[var(--border-color)] space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Zarejestruj się na <a href="https://autopay.pl" target="_blank" rel="noopener noreferrer" className="underline font-medium">autopay.pl</a> i pobierz dane integracyjne.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Service ID</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="123456"
                    value={(companyData.paymentMethods as any)?.autopay?.serviceId || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        autopay: { ...(companyData.paymentMethods as any)?.autopay, enabled: true, serviceId: e.target.value }
                      } as any
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Shared Key</label>
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="••••••••"
                    value={(companyData.paymentMethods as any)?.autopay?.sharedKey || ''}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      paymentMethods: {
                        ...companyData.paymentMethods,
                        autopay: { ...(companyData.paymentMethods as any)?.autopay, enabled: true, sharedKey: e.target.value }
                      } as any
                    })}
                  />
                </div>
              </div>
            </div>
          )}
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
