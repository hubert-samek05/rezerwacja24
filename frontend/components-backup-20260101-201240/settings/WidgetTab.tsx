'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Copy,
  Check,
  Eye,
  Palette,
  ExternalLink,
  Loader2,
  Save,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { getTenantId, getTenantConfig } from '@/lib/tenant';
import { getCompanyData } from '@/lib/company';
import { getApiUrl } from '@/lib/api-url';

interface Service {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  duration: number;
}

export default function WidgetTab() {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({
    primaryColor: '#0F6048',
    accentColor: '#10B981',
    showServices: true,
    showEmployees: true,
    showPrices: true,
  });

  const fetchWithTenant = async (url: string, options: RequestInit = {}) => {
    const config = getTenantConfig();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...config.headers,
      },
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Pobierz subdomenę z localStorage
      const session = localStorage.getItem('rezerwacja24_session');
      if (session) {
        const data = JSON.parse(session);
        setSubdomain(data.tenant?.subdomain || '');
      }
      
      // Pobierz logo i nazwę firmy z brandingu
      const companyData = getCompanyData();
      if (companyData) {
        setCompanyLogo(companyData.logo || '');
        setCompanyName(companyData.businessName || 'Moja Firma');
      }

      const tenantId = getTenantId();
      const API_URL = getApiUrl();

      // Pobierz konfigurację widgetu z API
      try {
        const configResponse = await fetchWithTenant(`${API_URL}/api/tenants/${tenantId}/widget-config`);
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setWidgetConfig({
            primaryColor: configData.primaryColor || '#0F6048',
            accentColor: configData.accentColor || '#10B981',
            showServices: configData.widgetConfig?.showServices ?? true,
            showEmployees: configData.widgetConfig?.showEmployees ?? true,
            showPrices: configData.widgetConfig?.showPrices ?? true,
          });
        }
      } catch (e) {
        console.log('Failed to load widget config:', e);
      }

      // Pobierz usługi z API
      try {
        const servicesResponse = await fetchWithTenant(`${API_URL}/api/services`);
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData.slice(0, 5)); // Max 5 usług w podglądzie
        }
      } catch (e) {
        console.log('Failed to load services:', e);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const tenantId = getTenantId();
      const API_URL = getApiUrl();

      const response = await fetchWithTenant(`${API_URL}/api/tenants/${tenantId}/widget-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgetConfig),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const widgetUrl = subdomain ? `https://${subdomain}.rezerwacja24.pl` : 'https://rezerwacja24.pl';
  const bookingUrl = subdomain ? `https://${subdomain}.rezerwacja24.pl` : 'https://rezerwacja24.pl';
  
  const embedCode = `<!-- Rezerwacja24 Widget -->
<div id="rezerwacja24-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${widgetUrl}/embed.js';
    script.async = true;
    script.dataset.subdomain = '${subdomain}';
    script.dataset.primaryColor = '${widgetConfig.primaryColor}';
    script.dataset.accentColor = '${widgetConfig.accentColor}';
    script.dataset.logo = '${companyLogo}';
    script.dataset.companyName = '${companyName}';
    document.body.appendChild(script);
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Widżet na stronę WWW</h2>
        <p className="text-sm sm:text-base text-neutral-gray">Osadź system rezerwacji na swojej stronie internetowej</p>
      </div>

      {/* Preview */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">Podgląd widżetu</h3>
        </div>
        
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 sm:p-8 border border-white/10 overflow-x-auto">
          <div className="max-w-2xl mx-auto min-w-[280px]">
            {/* Modern Widget Design */}
            <div 
              className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${widgetConfig.primaryColor} 0%, ${widgetConfig.primaryColor}dd 100%)`
              }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 opacity-10">
                <div 
                  className="w-full h-full rounded-full blur-3xl"
                  style={{ backgroundColor: widgetConfig.accentColor }}
                />
              </div>
              
              <div className="relative p-4 sm:p-8">
                {/* Header with Logo */}
                <div className="mb-4 sm:mb-8">
                  {companyLogo && (
                    <div className="mb-3 sm:mb-4 flex justify-center">
                      <img 
                        src={companyLogo} 
                        alt={companyName}
                        className="h-10 sm:h-16 w-auto object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 text-center">
                    {companyName || 'Umów się na wizytę'}
                  </h3>
                  <p className="text-white/70 text-center text-sm sm:text-base">Wybierz dogodny termin w kilku krokach</p>
                </div>

                {/* Steps */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Step 1 */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                        style={{ backgroundColor: widgetConfig.accentColor, color: widgetConfig.primaryColor }}
                      >
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base">Wybierz usługę</p>
                        <p className="text-xs sm:text-sm text-white/60 truncate">Strzyżenie, koloryzacja...</p>
                      </div>
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm bg-white/20 text-white flex-shrink-0"
                      >
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base">Wybierz specjalistę</p>
                        <p className="text-xs sm:text-sm text-white/60 truncate">Nasi doświadczeni pracownicy</p>
                      </div>
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm bg-white/20 text-white flex-shrink-0"
                      >
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base">Wybierz termin</p>
                        <p className="text-xs sm:text-sm text-white/60 truncate">Dostępne godziny i dni</p>
                      </div>
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className="w-full mt-4 sm:mt-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  style={{ 
                    backgroundColor: widgetConfig.accentColor, 
                    color: widgetConfig.primaryColor 
                  }}
                >
                  Zarezerwuj teraz
                </button>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-white/50">
                    Powered by <span className="font-semibold">Rezerwacja24</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <Palette className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">Konfiguracja wyglądu</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Kolor główny
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={widgetConfig.primaryColor}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                className="w-12 h-10 rounded border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={widgetConfig.primaryColor}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Kolor akcentu
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={widgetConfig.accentColor}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, accentColor: e.target.value })}
                className="w-12 h-10 rounded border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={widgetConfig.accentColor}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, accentColor: e.target.value })}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <span className="text-white">Pokaż usługi</span>
            <button
              onClick={() => setWidgetConfig({ ...widgetConfig, showServices: !widgetConfig.showServices })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                widgetConfig.showServices ? 'bg-accent-neon' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  widgetConfig.showServices ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <span className="text-white">Pokaż pracowników</span>
            <button
              onClick={() => setWidgetConfig({ ...widgetConfig, showEmployees: !widgetConfig.showEmployees })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                widgetConfig.showEmployees ? 'bg-accent-neon' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  widgetConfig.showEmployees ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <span className="text-white">Pokaż ceny</span>
            <button
              onClick={() => setWidgetConfig({ ...widgetConfig, showPrices: !widgetConfig.showPrices })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                widgetConfig.showPrices ? 'bg-accent-neon' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  widgetConfig.showPrices ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Przycisk zapisywania */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-accent-neon hover:bg-accent-neon/90 disabled:opacity-50 text-dark-bg font-semibold rounded-lg transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Zapisz konfigurację
              </>
            )}
          </button>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-green-400"
            >
              <Check className="w-5 h-5" />
              <span>Zapisano!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Embed Code */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
              <Code className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Kod do osadzenia</h3>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Skopiowano!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Kopiuj kod
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-3 sm:p-4 bg-black/50 rounded-lg border border-white/10 overflow-x-auto text-xs sm:text-sm">
            <code className="text-gray-300 font-mono">{embedCode}</code>
          </pre>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Wklej ten kod na swojej stronie internetowej, tam gdzie chcesz wyświetlić formularz rezerwacji
        </p>
      </div>

      {/* Direct Link */}
      <div className="glass-card p-4 sm:p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0 w-fit">
            <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Link bezpośredni</h3>
            <p className="text-sm sm:text-base text-gray-300 mb-3">
              Możesz też udostępnić bezpośredni link do formularza rezerwacji:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={bookingUrl}
                readOnly
                className="flex-1 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs sm:text-sm truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bookingUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-white rounded-lg transition-all flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Skopiowano
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Kopiuj
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
