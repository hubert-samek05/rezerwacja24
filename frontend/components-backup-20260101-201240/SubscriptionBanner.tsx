'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CreditCard, Calendar } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  remainingTrialDays: number;
}

export default function SubscriptionBanner() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/billing/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status || dismissed) {
    return null;
  }

  // Nie pokazuj bannera jeśli subskrypcja jest aktywna i nie jest w okresie próbnym
  if (status.hasActiveSubscription && !status.isInTrial) {
    return null;
  }

  // Brak subskrypcji
  if (!status.hasActiveSubscription) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-red-500/20 to-red-600/20 border-b border-red-500/30"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">
                    Brak aktywnej subskrypcji
                  </p>
                  <p className="text-sm text-gray-300">
                    Aktywuj subskrypcję aby korzystać ze wszystkich funkcji platformy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/settings/subscription"
                  className="bg-[#41FFBC] hover:bg-[#41FFBC]/90 text-[#0A0A0A] font-semibold px-6 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Aktywuj teraz
                </Link>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Okres próbny
  if (status.isInTrial) {
    const daysText = status.remainingTrialDays === 1 ? 'dzień' : 'dni';
    const isLastDays = status.remainingTrialDays <= 3;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${
            isLastDays
              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border-b border-yellow-500/30'
              : 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-b border-blue-500/30'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className={`w-5 h-5 flex-shrink-0 ${isLastDays ? 'text-yellow-400' : 'text-blue-400'}`} />
                <div>
                  <p className="text-white font-semibold">
                    Okres próbny - pozostało {status.remainingTrialDays} {daysText}
                  </p>
                  <p className="text-sm text-gray-300">
                    {isLastDays
                      ? 'Twój okres próbny wkrótce się kończy. Upewnij się, że masz dodaną kartę płatniczą.'
                      : 'Korzystasz z 7-dniowego okresu próbnego. Płatność zostanie pobrana po jego zakończeniu.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/settings/subscription"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2 rounded-lg transition-all border border-white/20"
                >
                  Zarządzaj subskrypcją
                </Link>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
