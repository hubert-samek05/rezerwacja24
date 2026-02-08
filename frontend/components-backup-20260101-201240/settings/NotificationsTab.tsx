'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  UserCheck,
  X as XIcon,
  Zap,
} from 'lucide-react';

interface NotificationSettings {
  smsEnabled: boolean;
  notifications: {
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    bookingCancellation: boolean;
    bookingReschedule: boolean;
    reminderHoursBefore: number;
  };
}

interface SmsStats {
  used: number;
  limit: number;
  remaining: number;
}

export default function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: false,
    notifications: {
      bookingConfirmation: true,
      bookingReminder: true,
      bookingCancellation: true,
      bookingReschedule: true,
      reminderHoursBefore: 24,
    },
  });

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number>(100);

  const [smsStats, setSmsStats] = useState<SmsStats>({
    used: 0,
    limit: 500,
    remaining: 500,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Funkcja do wyciągnięcia tenantId z tokena JWT
  const getTenantIdFromToken = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tenantId || payload.sub;
    } catch (err) {
      console.error('Błąd parsowania tokena:', err);
      return null;
    }
  };

  // Pobierz ustawienia przy załadowaniu
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = localStorage.getItem('user');
        
        if (!user) {
          console.warn('Brak user w localStorage');
          setLoading(false);
          return;
        }

        const userData = JSON.parse(user);
        const extractedTenantId = userData.tenantId;
        
        console.log('📥 Pobieranie ustawień SMS...');
        console.log('Tenant ID:', extractedTenantId);
        
        if (!extractedTenantId) {
          console.warn('Nie można wyciągnąć tenant ID');
          setLoading(false);
          return;
        }

        setTenantId(extractedTenantId);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';
        
        // Pobierz status SMS (licznik)
        const statusResponse = await fetch(`${apiUrl}/api/sms/status`, {
          headers: {
            'X-Tenant-ID': extractedTenantId,
          },
        });

        if (statusResponse.ok) {
          const stats = await statusResponse.json();
          setSmsStats(stats);
          console.log('📊 SMS Stats:', stats);
        }

        // Pobierz ustawienia SMS
        const settingsResponse = await fetch(`${apiUrl}/api/sms/settings`, {
          headers: {
            'X-Tenant-ID': extractedTenantId,
          },
        });

        if (settingsResponse.ok) {
          const smsSettings = await settingsResponse.json();
          console.log('⚙️ SMS Settings:', smsSettings);
          
          setSettings({
            smsEnabled: true,
            notifications: {
              bookingConfirmation: smsSettings.confirmedEnabled !== false,
              bookingReminder: smsSettings.reminderEnabled !== false,
              bookingCancellation: smsSettings.cancelledEnabled !== false,
              bookingReschedule: smsSettings.rescheduledEnabled !== false,
              reminderHoursBefore: 24,
            },
          });
          
          console.log('✅ Ustawienia załadowane');
        }
      } catch (err) {
        console.error('❌ Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      console.log('💾 Zapisywanie ustawień SMS...');
      console.log('Tenant ID:', tenantId);
      console.log('Settings:', settings);
      
      if (!tenantId) {
        throw new Error('Brak ID firmy');
      }

      const updateData = {
        confirmedEnabled: settings.notifications.bookingConfirmation,
        rescheduledEnabled: settings.notifications.bookingReschedule,
        cancelledEnabled: settings.notifications.bookingCancellation,
        reminderEnabled: settings.notifications.bookingReminder,
      };

      console.log('Update data:', updateData);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';
      const url = `${apiUrl}/api/sms/settings`;
      
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response error:', errorData);
        throw new Error(errorData.message || 'Nie udało się zapisać ustawień');
      }

      const result = await response.json();
      console.log('✅ Zapisano:', result);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('❌ Błąd zapisu:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać ustawień');
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
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Powiadomienia SMS</h2>
        <p className="text-sm sm:text-base text-neutral-gray">Konfiguruj automatyczne powiadomienia SMS dla klientów</p>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-400">Ustawienia zostały zapisane!</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {/* SMS Settings */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white">Powiadomienia SMS</h3>
              <p className="text-xs sm:text-sm text-gray-400">Wysyłaj SMS-y przez SMS API</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold text-sm sm:text-base">{smsStats.remaining}/{smsStats.limit}</span>
              <span className="text-xs sm:text-sm text-gray-400">SMS</span>
            </div>
            <button 
              onClick={() => setShowPurchaseModal(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all text-sm sm:text-base"
            >
              Dokup SMS
            </button>
          </div>
        </div>

        {/* SMS Stats Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Wykorzystane SMS w tym miesiącu</span>
            <span className="text-white font-medium">{smsStats.used} / {smsStats.limit}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
              style={{ width: `${(smsStats.used / smsStats.limit) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Limit odnawia się automatycznie pierwszego dnia każdego miesiąca
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">Włącz powiadomienia SMS</p>
              <p className="text-sm text-gray-400">Automatyczne SMS-y o rezerwacjach przez SMS API</p>
            </div>
            <button
              onClick={async () => {
                const newValue = !settings.smsEnabled;
                setSettings({ ...settings, smsEnabled: newValue });
                
                // Automatyczny zapis
                try {
                  const token = localStorage.getItem('token');
                  
                  if (!tenantId || !token) {
                    console.error('Brak tenantId lub token');
                    return;
                  }
                  
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';
                  
                  console.log('🔄 Zapisywanie SMS:', newValue, 'dla tenanta:', tenantId);
                  
                  const response = await fetch(`${apiUrl}/api/tenants/${tenantId}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                      'X-Tenant-ID': tenantId,
                    },
                    body: JSON.stringify({
                      smsEnabled: newValue,
                    }),
                  });
                  
                  if (response.ok) {
                    console.log('✅ SMS', newValue ? 'włączone' : 'wyłączone');
                  } else {
                    console.error('❌ Błąd zapisu:', response.status);
                    const errorText = await response.text();
                    console.error('Response:', errorText);
                  }
                } catch (err) {
                  console.error('❌ Błąd zapisu:', err);
                }
              }}
              disabled={saving || !tenantId}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.smsEnabled ? 'bg-accent-neon' : 'bg-gray-600'
              } ${(saving || !tenantId) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.smsEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium mb-1">Powiadomienia SMS włączone</p>
                  <p className="text-sm text-gray-300">
                    SMS-y będą wysyłane automatycznie zgodnie z wybranymi typami powiadomień.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
            <Bell className="w-5 h-5 text-green-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">Typy powiadomień</h3>
            <p className="text-xs sm:text-sm text-gray-400">Wybierz kiedy wysyłać powiadomienia</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-medium text-sm sm:text-base">Potwierdzenie rezerwacji</p>
                <p className="text-xs sm:text-sm text-gray-400">Natychmiast po zarezerwowaniu</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  bookingConfirmation: !settings.notifications.bookingConfirmation
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.bookingConfirmation ? 'bg-accent-neon' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.bookingConfirmation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-medium text-sm sm:text-base">Przypomnienie o rezerwacji</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {settings.notifications.reminderHoursBefore}h przed wizytą
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  bookingReminder: !settings.notifications.bookingReminder
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.bookingReminder ? 'bg-accent-neon' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.bookingReminder ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.notifications.bookingReminder && (
            <div className="ml-0 sm:ml-12 p-3 sm:p-4 bg-white/5 rounded-lg">
              <label className="block text-sm font-medium text-white mb-2">
                Wyślij przypomnienie (godzin przed)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.notifications.reminderHoursBefore}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    reminderHoursBefore: parseInt(e.target.value) || 24
                  }
                })}
                className="w-32 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-medium text-sm sm:text-base">Przesunięcie rezerwacji</p>
                <p className="text-xs sm:text-sm text-gray-400">Gdy zmieni się termin wizyty</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  bookingReschedule: !settings.notifications.bookingReschedule
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.bookingReschedule ? 'bg-accent-neon' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.bookingReschedule ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <XIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-medium text-sm sm:text-base">Anulowanie rezerwacji</p>
                <p className="text-xs sm:text-sm text-gray-400">Gdy klient anuluje wizytę</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  bookingCancellation: !settings.notifications.bookingCancellation
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.bookingCancellation ? 'bg-accent-neon' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.bookingCancellation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Zapisz ustawienia
            </>
          )}
        </button>
      </div>

      {/* Purchase SMS Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-2xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Wykup dodatkowe SMS</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-400 mb-6">
              Wybierz pakiet SMS, który chcesz dodać do swojego konta. SMS-y nie wygasają i są dostępne bez limitu czasowego.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {[
                { size: 100, price: '29.99 PLN', popular: false },
                { size: 500, price: '99.99 PLN', popular: true },
                { size: 1000, price: '179.99 PLN', popular: false },
                { size: 5000, price: '799.99 PLN', popular: false },
              ].map((pkg) => (
                <button
                  key={pkg.size}
                  onClick={() => setSelectedPackage(pkg.size)}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    selectedPackage === pkg.size
                      ? 'border-accent-neon bg-accent-neon/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent-neon text-dark-bg text-xs font-bold rounded-full">
                      POPULARNE
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{pkg.size}</div>
                    <div className="text-sm text-gray-400 mb-3">SMS</div>
                    <div className="text-xl font-semibold text-accent-neon">{pkg.price}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {(parseFloat(pkg.price) / pkg.size).toFixed(2)} PLN/SMS
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-white mb-1">Informacje o pakietach SMS:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>SMS-y nie wygasają i są dostępne bez limitu czasowego</li>
                    <li>Dodatkowe SMS sumują się z miesięcznym limitem 500 SMS</li>
                    <li>Płatność jednorazowa przez Stripe lub Przelewy24</li>
                    <li>SMS-y dostępne natychmiast po opłaceniu</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    if (!tenantId || !token) {
                      setError('Brak autoryzacji');
                      return;
                    }

                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';
                    const response = await fetch(`${apiUrl}/api/sms/purchase`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Tenant-ID': tenantId,
                      },
                      body: JSON.stringify({ packageSize: selectedPackage }),
                    });

                    if (response.ok) {
                      setSaved(true);
                      setShowPurchaseModal(false);
                      // Odśwież statystyki
                      window.location.reload();
                    } else {
                      setError('Nie udało się wykupić pakietu SMS');
                    }
                  } catch (err) {
                    setError('Błąd podczas wykupu pakietu');
                  }
                }}
                className="flex-1 px-6 py-3 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all"
              >
                Wykup {selectedPackage} SMS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
