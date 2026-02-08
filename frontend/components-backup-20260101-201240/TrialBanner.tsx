'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface TrialStatus {
  status: string;
  isTrialActive: boolean;
  remainingTrialDays: number;
  trialEnd: string;
  planName: string;
}

export default function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialStatus();
    
    // Sprawdzaj co godzinę
    const interval = setInterval(fetchTrialStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/billing/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setTrialStatus(data);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Zapamiętaj dismiss na 24h
    localStorage.setItem('trialBannerDismissed', Date.now().toString());
  };

  useEffect(() => {
    const dismissedTime = localStorage.getItem('trialBannerDismissed');
    if (dismissedTime) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        setDismissed(true);
      }
    }
  }, []);

  if (loading || !trialStatus || !trialStatus.isTrialActive || dismissed) {
    return null;
  }

  const daysLeft = trialStatus.remainingTrialDays;
  const isUrgent = daysLeft <= 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative ${
          isUrgent
            ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
            : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30'
        } border-b backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${isUrgent ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                {isUrgent ? (
                  <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${isUrgent ? 'text-red-400' : 'text-blue-400'}`} />
                ) : (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">
                  {isUrgent ? (
                    <>⚠️ Trial kończy się za {daysLeft} {daysLeft === 1 ? 'dzień' : 'dni'}!</>
                  ) : (
                    <>🎉 Okres próbny - {daysLeft} {daysLeft === 1 ? 'dzień' : 'dni'}</>
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">
                  {isUrgent ? (
                    'Dodaj metodę płatności aby kontynuować'
                  ) : (
                    `Kończy się ${new Date(trialStatus.trialEnd).toLocaleDateString('pl-PL')}`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 justify-end">
              <Link
                href="/dashboard/settings?tab=subscription"
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                  isUrgent
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{isUrgent ? 'Aktywuj teraz' : 'Subskrypcja'}</span>
                <span className="xs:hidden">Aktywuj</span>
              </Link>

              <button
                onClick={handleDismiss}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Zamknij"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
