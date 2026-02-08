'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Mail,
  Facebook,
  Instagram,
  Zap,
  Check,
  ExternalLink,
  Settings as SettingsIcon,
  Apple,
  Copy,
  Loader2,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api-url';
import { getTenantConfig } from '@/lib/tenant';
import toast from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  connected: boolean;
  comingSoon?: boolean;
}

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Synchronizuj rezerwacje z Google Calendar',
      icon: CalendarIcon,
      color: 'from-blue-500 to-blue-600',
      connected: false,
      comingSoon: false,
    },
    {
      id: 'ios-calendar',
      name: 'Apple Calendar (iOS)',
      description: 'Synchronizuj z Apple Calendar przez CalDAV',
      icon: Apple,
      color: 'from-gray-700 to-gray-900',
      connected: false,
      comingSoon: false,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Integracja z Facebook Business',
      icon: Facebook,
      color: 'from-blue-600 to-blue-700',
      connected: false,
      comingSoon: true,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Przyjmuj rezerwacje przez Instagram',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      connected: false,
      comingSoon: true,
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing i newslettery',
      icon: Mail,
      color: 'from-yellow-500 to-yellow-600',
      connected: false,
      comingSoon: true,
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automatyzuj workflow z 5000+ aplikacjami',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      connected: false,
      comingSoon: true,
    },
  ]);

  const [loading, setLoading] = useState<string | null>(null);
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);

  // Sprawdź status integracji przy ładowaniu
  useEffect(() => {
    checkGoogleCalendarStatus();
    
    // Sprawdź URL params dla sukcesu/błędu
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'google_calendar') {
      toast.success('Połączono z Google Calendar!');
      checkGoogleCalendarStatus();
      // Usuń parametry z URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('error')) {
      toast.error(`Błąd: ${params.get('error')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkGoogleCalendarStatus = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/integrations/google-calendar/status`, getTenantConfig());
      if (response.ok) {
        const data = await response.json();
        setGoogleEmail(data.email);
        setIntegrations(prev => prev.map(int => 
          int.id === 'google-calendar' ? { ...int, connected: data.connected } : int
        ));
      }
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (integrationId === 'google-calendar') {
      try {
        setLoading(integrationId);
        const response = await fetch(`${getApiUrl()}/api/integrations/google-calendar/disconnect`, {
          method: 'DELETE',
          ...getTenantConfig(),
        });
        if (response.ok) {
          toast.success('Rozłączono z Google Calendar');
          setGoogleEmail(null);
          setIntegrations(prev => prev.map(int => 
            int.id === 'google-calendar' ? { ...int, connected: false } : int
          ));
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
        toast.error('Błąd podczas rozłączania');
      } finally {
        setLoading(null);
      }
    }
  };

  const handleConnect = async (integrationId: string) => {
    if (integrationId === 'google-calendar') {
      // OAuth Google Calendar - wywołaj backend
      try {
        setLoading(integrationId);
        const response = await fetch(`${getApiUrl()}/api/integrations/google-calendar/auth`, getTenantConfig());
        if (response.ok) {
          const { authUrl } = await response.json();
          window.location.href = authUrl;
        } else {
          toast.error('Błąd podczas łączenia z Google Calendar');
        }
      } catch (error) {
        console.error('Google Calendar error:', error);
        toast.error('Błąd podczas łączenia z Google Calendar');
      } finally {
        setLoading(null);
      }
    } else if (integrationId === 'ios-calendar') {
      // Pokaż modal z instrukcjami dla Apple Calendar
      setShowAppleModal(true);
    } else {
      // Toggle dla innych integracji
      setIntegrations(integrations.map(int => 
        int.id === integrationId ? { ...int, connected: !int.connected } : int
      ));
    }
  };

  // Generuj URL do subskrypcji kalendarza (iCal)
  const getCalendarSubscriptionUrl = () => {
    if (typeof window === 'undefined') return '';
    
    // Próbuj pobrać tenantId z różnych źródeł
    let tenantId = '';
    try {
      const session = localStorage.getItem('rezerwacja24_session');
      if (session) {
        tenantId = JSON.parse(session).tenantId;
      }
      if (!tenantId) {
        const user = localStorage.getItem('user');
        if (user) {
          tenantId = JSON.parse(user).tenantId;
        }
      }
    } catch (e) {
      console.error('Error getting tenantId:', e);
    }
    
    return `${getApiUrl()}/api/calendar/ical/${tenantId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Integracje</h2>
        <p className="text-neutral-gray">Połącz Rezerwacja24 z innymi narzędziami</p>
      </div>

      {/* Integrations Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${integration.color} opacity-10 blur-3xl`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${integration.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {integration.comingSoon && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                      Wkrótce
                    </span>
                  )}
                  {integration.connected && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Połączono
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{integration.description}</p>
                
                {/* Pokaż email dla Google Calendar */}
                {integration.id === 'google-calendar' && integration.connected && googleEmail && (
                  <p className="text-xs text-accent-neon mb-3">Połączono: {googleEmail}</p>
                )}

                {/* Przycisk dla połączonych integracji - rozłącz */}
                {integration.connected && !integration.comingSoon ? (
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    disabled={loading === integration.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  >
                    {loading === integration.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rozłączanie...
                      </>
                    ) : (
                      'Rozłącz'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => !integration.comingSoon && !loading && handleConnect(integration.id)}
                    disabled={integration.comingSoon || loading === integration.id}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      integration.comingSoon || loading === integration.id
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-accent-neon hover:bg-accent-neon/90 text-dark-bg'
                    }`}
                  >
                    {loading === integration.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Łączenie...
                      </>
                    ) : integration.comingSoon ? (
                      'Wkrótce dostępne'
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Połącz
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Integration */}
      <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Potrzebujesz niestandardowej integracji?</h3>
            <p className="text-gray-300 mb-4">
              Skontaktuj się z nami, aby omówić możliwości integracji z Twoimi systemami
            </p>
            <a
              href="mailto:support@rezerwacja24.pl"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all"
            >
              <Mail className="w-4 h-4" />
              Skontaktuj się
            </a>
          </div>
        </div>
      </div>

      {/* Apple Calendar Modal */}
      {showAppleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAppleModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
                  <Apple className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Apple Calendar</h3>
              </div>
              <button
                onClick={() => setShowAppleModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Przycisk szybkiego dodania */}
              <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                <h4 className="font-semibold text-white mb-2">Szybkie dodanie (Mac/iPhone/iPad)</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Kliknij przycisk poniżej, aby automatycznie otworzyć Apple Calendar i dodać subskrypcję.
                </p>
                <a
                  href={getCalendarSubscriptionUrl().replace('https://', 'webcal://').replace('http://', 'webcal://')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-semibold rounded-lg transition-all"
                >
                  <Apple className="w-5 h-5" />
                  Otwórz w Apple Calendar
                </a>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Ręczne dodanie (URL)</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Skopiuj URL i dodaj jako subskrypcję kalendarza. Rezerwacje będą automatycznie synchronizowane.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getCalendarSubscriptionUrl()}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getCalendarSubscriptionUrl());
                      toast.success('URL skopiowany!');
                    }}
                    className="p-2 bg-accent-neon hover:bg-accent-neon/80 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-dark-bg" />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="font-semibold text-white mb-3">Instrukcja dla iPhone/iPad:</h4>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                    <span>Otwórz <strong>Ustawienia</strong> na urządzeniu</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                    <span>Przejdź do <strong>Kalendarz → Konta → Dodaj konto</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                    <span>Wybierz <strong>Inne → Dodaj subskrypcję kalendarza</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</span>
                    <span>Wklej skopiowany URL i kliknij <strong>Dalej</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">5</span>
                    <span>Nazwij kalendarz <strong>Rezerwacja24</strong> i zapisz</span>
                  </li>
                </ol>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="font-semibold text-white mb-3">Instrukcja dla Mac:</h4>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                    <span>Otwórz aplikację <strong>Kalendarz</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                    <span>Wybierz <strong>Plik → Nowa subskrypcja kalendarza...</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-accent-neon/20 text-accent-neon w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                    <span>Wklej skopiowany URL i kliknij <strong>Subskrybuj</strong></span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAppleModal(false)}
                className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/80 text-dark-bg font-semibold rounded-lg transition-colors"
              >
                Rozumiem
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
