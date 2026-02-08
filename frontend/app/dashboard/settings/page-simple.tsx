'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  Building,
  Globe,
  Palette,
  Bell,
  Users,
  CreditCard,
  Shield,
  Save,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [subdomain, setSubdomain] = useState('moja-firma')
  const [companyName, setCompanyName] = useState('Moja Firma')
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const handleSave = () => {
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-8 h-8 text-accent-neon" />
              <span className="text-2xl font-bold text-gradient">Rezerwacja24</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-neutral-gray hover:text-accent-neon transition-colors">
                Dashboard
              </Link>
              <div className="w-8 h-8 bg-gradient-accent rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Ustawienia</h1>
            <p className="text-neutral-gray/70">Zarządzaj swoją firmą i konfiguracją systemu</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('company')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'company' ? 'bg-primary-green/20 text-accent-neon' : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span>Dane firmy</span>
                </button>

                <button
                  onClick={() => setActiveTab('subdomain')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'subdomain' ? 'bg-primary-green/20 text-accent-neon' : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span>Subdomena</span>
                </button>

                <button
                  onClick={() => setActiveTab('branding')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'branding' ? 'bg-primary-green/20 text-accent-neon' : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  <span>Branding</span>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'payments' ? 'bg-primary-green/20 text-accent-neon' : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Płatności</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security' ? 'bg-primary-green/20 text-accent-neon' : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Bezpieczeństwo</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Success Message */}
              {showSaveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 glass-card p-4 border border-green-500/30 bg-green-500/10"
                >
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">Zmiany zostały zapisane pomyślnie!</span>
                  </div>
                </motion.div>
              )}

              {/* Company Info Tab */}
              {activeTab === 'company' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dane firmy</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Nazwa firmy
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          Email kontaktowy
                        </label>
                        <input
                          type="email"
                          defaultValue="kontakt@moja-firma.pl"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          defaultValue="+48 123 456 789"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Adres
                      </label>
                      <input
                        type="text"
                        defaultValue="ul. Przykładowa 123, 00-001 Warszawa"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Opis firmy
                      </label>
                      <textarea
                        rows={4}
                        defaultValue="Profesjonalny salon fryzjerski z wieloletnim doświadczeniem"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          NIP
                        </label>
                        <input
                          type="text"
                          defaultValue="1234567890"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          REGON
                        </label>
                        <input
                          type="text"
                          defaultValue="123456789"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                        />
                      </div>
                    </div>

                    <button onClick={handleSave} className="btn-neon flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Zapisz zmiany</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Subdomain Tab */}
              {activeTab === 'subdomain' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Konfiguracja subdomeny</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-2">
                          Twoja subdomena
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={subdomain}
                            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                          />
                          <span className="text-neutral-gray">.rezerwacja24.pl</span>
                        </div>
                        <p className="mt-2 text-sm text-neutral-gray/70">
                          Twoja strona będzie dostępna pod adresem: <span className="text-accent-neon">{subdomain}.rezerwacja24.pl</span>
                        </p>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-blue-400 mb-1">Ważne informacje</h4>
                            <ul className="text-sm text-neutral-gray/70 space-y-1">
                              <li>• Subdomena może zawierać tylko małe litery, cyfry i myślniki</li>
                              <li>• Zmiana subdomeny może potrwać do 24 godzin</li>
                              <li>• Stara subdomena będzie przekierowywać przez 30 dni</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <button onClick={handleSave} className="btn-neon flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Zapisz subdomenę</span>
                      </button>
                    </div>
                  </div>

                  {/* Public Profile Preview */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Podgląd profilu publicznego</h3>
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-accent rounded-full"></div>
                        <div>
                          <h4 className="text-xl font-bold text-[var(--text-primary)]">{companyName}</h4>
                          <p className="text-sm text-neutral-gray/70">{subdomain}.rezerwacja24.pl</p>
                        </div>
                      </div>
                      <p className="text-neutral-gray/70 mb-4">
                        Profesjonalny salon fryzjerski z wieloletnim doświadczeniem
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-neutral-gray/70">
                        <span>📍 ul. Przykładowa 123, Warszawa</span>
                        <span>📞 +48 123 456 789</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link 
                        href={`https://${subdomain}.rezerwacja24.pl`}
                        target="_blank"
                        className="btn-outline-neon w-full text-center block"
                      >
                        Otwórz profil publiczny
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Personalizacja brandingu</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Logo firmy
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                          <Upload className="w-8 h-8 text-neutral-gray/50" />
                        </div>
                        <button className="btn-outline-neon">
                          Prześlij logo
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-neutral-gray/70">
                        Zalecany format: PNG lub SVG, maksymalny rozmiar: 2MB
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Kolor główny
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          defaultValue="#0F6048"
                          className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue="#0F6048"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-gray mb-2">
                        Kolor akcentu
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          defaultValue="#41FFBC"
                          className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue="#41FFBC"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-accent-neon"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-400 mb-1">Plan Premium wymagany</h4>
                          <p className="text-sm text-neutral-gray/70">
                            Pełna personalizacja brandingu jest dostępna w planie Premium i Pro.
                          </p>
                          <Link href="/dashboard/billing" className="text-sm text-accent-neon hover:underline mt-2 inline-block">
                            Zmień plan →
                          </Link>
                        </div>
                      </div>
                    </div>

                    <button onClick={handleSave} className="btn-neon flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Zapisz zmiany</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Other tabs placeholder */}
              {!['company', 'subdomain', 'branding'].includes(activeTab) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    {activeTab === 'team' && 'Zarządzanie zespołem'}
                    {activeTab === 'notifications' && 'Ustawienia powiadomień'}
                    {activeTab === 'billing' && 'Płatności i subskrypcja'}
                    {activeTab === 'security' && 'Bezpieczeństwo'}
                  </h2>
                  <p className="text-neutral-gray/70">Ta sekcja jest w trakcie budowy...</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
