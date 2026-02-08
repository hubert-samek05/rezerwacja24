'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Mail,
  FileText,
  Save,
  Loader2,
  Info,
  Download,
  Users,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api-url';
import toast from 'react-hot-toast';

interface ConsentSettings {
  marketingConsentEnabled: boolean;
  marketingConsentText: string;
  rodoConsentText: string;
}

export default function ConsentTab() {
  const [settings, setSettings] = useState<ConsentSettings>({
    marketingConsentEnabled: false,
    marketingConsentText: '',
    rodoConsentText: 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const getTenantId = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user).tenantId;
      }
    } catch (e) {
      console.error('Error getting tenantId:', e);
    }
    return null;
  };

  const loadSettings = async () => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/tenants/${tenantId}/consent-settings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading consent settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const tenantId = getTenantId();
      if (!tenantId) {
        toast.error('Nie znaleziono ID firmy');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/tenants/${tenantId}/consent-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Ustawienia zgód zostały zapisane');
      } else {
        toast.error('Błąd podczas zapisywania ustawień');
      }
    } catch (error) {
      console.error('Error saving consent settings:', error);
      toast.error('Błąd podczas zapisywania ustawień');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Zgody i RODO</h2>
        <p className="text-neutral-gray">Zarządzaj zgodami marketingowymi i RODO dla klientów</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">Jak to działa?</p>
            <p className="text-blue-400/70 text-sm mt-1">
              Zgody będą wyświetlane klientom podczas dokonywania rezerwacji na Twojej subdomenie lub w widgecie. 
              Klient musi zaakceptować zgodę RODO, a zgoda marketingowa jest opcjonalna (jeśli włączona).
            </p>
          </div>
        </div>
      </div>

      {/* RODO Consent */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent-neon/20 rounded-lg">
            <Shield className="w-5 h-5 text-accent-neon" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Zgoda RODO (wymagana)</h3>
            <p className="text-sm text-gray-400">Ta zgoda jest zawsze wymagana przy rezerwacji</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Treść zgody RODO
          </label>
          <textarea
            value={settings.rodoConsentText}
            onChange={(e) => setSettings({ ...settings, rodoConsentText: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-neon resize-none"
            placeholder="Wyrażam zgodę na przetwarzanie moich danych osobowych..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Przykład: "Wyrażam zgodę na przetwarzanie moich danych osobowych przez [Nazwa Firmy] w celu realizacji rezerwacji zgodnie z Rozporządzeniem RODO."
          </p>
        </div>
      </div>

      {/* Marketing Consent */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Zgoda marketingowa (opcjonalna)</h3>
              <p className="text-sm text-gray-400">Zbieraj zgody na komunikację marketingową</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.marketingConsentEnabled}
              onChange={(e) => setSettings({ ...settings, marketingConsentEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-neon"></div>
          </label>
        </div>

        {settings.marketingConsentEnabled && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Treść zgody marketingowej
            </label>
            <textarea
              value={settings.marketingConsentText}
              onChange={(e) => setSettings({ ...settings, marketingConsentText: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-neon resize-none"
              placeholder="Wyrażam zgodę na otrzymywanie informacji marketingowych..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Przykład: "Wyrażam zgodę na otrzymywanie informacji o promocjach, nowościach i ofertach specjalnych drogą elektroniczną."
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Podgląd</h3>
        </div>

        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <p className="text-sm text-gray-400 mb-3">Tak będzie wyglądać dla klienta:</p>
          
          {/* RODO checkbox preview */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked
              readOnly
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-accent-neon focus:ring-accent-neon"
            />
            <span className="text-sm text-gray-300">
              {settings.rodoConsentText || 'Wyrażam zgodę na przetwarzanie moich danych osobowych...'}
              <span className="text-red-400 ml-1">*</span>
            </span>
          </label>

          {/* Marketing checkbox preview */}
          {settings.marketingConsentEnabled && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-accent-neon focus:ring-accent-neon"
              />
              <span className="text-sm text-gray-300">
                {settings.marketingConsentText || 'Wyrażam zgodę na otrzymywanie informacji marketingowych...'}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Zapisywanie...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Zapisz ustawienia zgód
          </>
        )}
      </button>

      {/* Export Section */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Eksport list klientów</h3>
            <p className="text-sm text-gray-400">Pobierz listy klientów ze zgodami do pliku CSV</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export RODO */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-accent-neon" />
              <span className="font-medium text-white">Lista RODO</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Klienci którzy wyrazili zgodę na przetwarzanie danych (do kontroli UODO)
            </p>
            <button
              onClick={() => {
                const tenantId = getTenantId();
                if (tenantId) {
                  window.open(`${getApiUrl()}/api/tenants/${tenantId}/export-rodo-csv`, '_blank');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-neon/20 hover:bg-accent-neon/30 text-accent-neon font-medium rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Pobierz CSV (RODO)
            </button>
          </div>

          {/* Export Marketing */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-white">Lista marketingowa</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Klienci którzy wyrazili zgodę na komunikację marketingową (do newsletterów)
            </p>
            <button
              onClick={() => {
                const tenantId = getTenantId();
                if (tenantId) {
                  window.open(`${getApiUrl()}/api/tenants/${tenantId}/export-marketing-csv`, '_blank');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-medium rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Pobierz CSV (Marketing)
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          💡 Pliki CSV można otworzyć w Excel, Google Sheets lub zaimportować do narzędzi do email marketingu (Mailchimp, GetResponse, itp.)
        </p>
      </div>
    </div>
  );
}
