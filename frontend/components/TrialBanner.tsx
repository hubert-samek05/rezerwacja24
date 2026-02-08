'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, AlertTriangle, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionStatus {
  status: string;
  isTrialActive: boolean;
  remainingTrialDays: number;
  trialEnd: string;
  planName: string;
  isPastDue?: boolean;
  hasActiveSubscription?: boolean;
  daysUntilBlock?: number;
  gracePeriodDays?: number;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export default function TrialBanner() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/billing/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('subscriptionBannerDismissed', Date.now().toString());
  };

  useEffect(() => {
    const dismissedTime = localStorage.getItem('subscriptionBannerDismissed');
    if (dismissedTime) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        setDismissed(true);
      }
    }
  }, []);

  if (loading || !status || dismissed) {
    return null;
  }

  // Określ typ sytuacji
  const isTrialing = status.status === 'TRIALING';
  const isPastDue = status.isPastDue || status.status === 'PAST_DUE';
  const isActive = status.status === 'ACTIVE';
  const daysLeft = status.remainingTrialDays;
  const daysUntilBlock = status.daysUntilBlock ?? 0;

  // Oblicz dni do końca subskrypcji (dla aktywnych)
  let daysUntilPeriodEnd = 0;
  if (status.currentPeriodEnd) {
    const now = new Date();
    const periodEnd = new Date(status.currentPeriodEnd);
    daysUntilPeriodEnd = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Scenariusze:
  // 1. TRIALING + daysLeft > 3 - trial aktywny, dużo czasu
  // 2. TRIALING + daysLeft <= 3 - trial kończy się wkrótce
  // 3. TRIALING + daysLeft <= 0 - trial wygasł, grace period
  // 4. PAST_DUE - nieudana płatność za subskrypcję
  // 5. ACTIVE - wszystko OK, nie pokazuj banera

  // Jeśli aktywna subskrypcja - nie pokazuj
  if (isActive && !isPastDue) {
    return null;
  }

  // Określ co pokazać
  let title = '';
  let description = '';
  let severity: 'info' | 'warning' | 'danger' = 'info';
  let buttonText = 'Subskrypcja';
  let canDismiss = true;

  if (isPastDue) {
    // Nieudana płatność za subskrypcję
    severity = 'danger';
    canDismiss = false;
    title = 'Płatność nieudana';
    buttonText = 'Zaktualizuj płatność';
    
    if (daysUntilBlock > 0) {
      description = `Nie udało się pobrać płatności. Za ${daysUntilBlock} ${daysUntilBlock === 1 ? 'dzień' : 'dni'} Twoje konto zostanie zablokowane.`;
    } else {
      description = 'Zaktualizuj metodę płatności aby móc dalej korzystać z platformy.';
    }
  } else if (isTrialing) {
    // Trial
    if (daysLeft <= 0) {
      // Trial wygasł
      severity = 'danger';
      canDismiss = false;
      title = 'Twój okres próbny się skończył';
      buttonText = 'Wybierz plan';
      
      if (daysUntilBlock > 0) {
        description = `Za ${daysUntilBlock} ${daysUntilBlock === 1 ? 'dzień' : 'dni'} utracisz dostęp do swojego konta. Wybierz plan aby kontynuować.`;
      } else {
        description = 'Wybierz plan aby móc dalej korzystać z platformy.';
      }
    } else if (daysLeft <= 3) {
      // Trial kończy się wkrótce
      severity = 'warning';
      canDismiss = true;
      buttonText = 'Wybierz plan';
      
      if (daysLeft === 0) {
        title = 'Twój okres próbny kończy się dzisiaj';
      } else if (daysLeft === 1) {
        title = 'Twój okres próbny kończy się jutro';
      } else {
        title = `Twój okres próbny kończy się za ${daysLeft} dni`;
      }
      description = 'Wybierz plan aby kontynuować korzystanie z systemu po zakończeniu okresu próbnego.';
    } else {
      // Trial aktywny, dużo czasu
      severity = 'info';
      canDismiss = true;
      title = `Okres próbny - pozostało ${daysLeft} dni`;
      buttonText = 'Zobacz plany';
      description = status.trialEnd 
        ? `Testuj wszystkie funkcje za darmo do ${new Date(status.trialEnd).toLocaleDateString('pl-PL')}.`
        : 'Testuj wszystkie funkcje za darmo.';
    }
  } else {
    // Inny status - nie pokazuj
    return null;
  }

  const bgClass = severity === 'danger' 
    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30'
    : severity === 'warning'
    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30'
    : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30';

  const iconBgClass = severity === 'danger' ? 'bg-red-500/20' : severity === 'warning' ? 'bg-orange-500/20' : 'bg-blue-500/20';
  const iconClass = severity === 'danger' ? 'text-red-400' : severity === 'warning' ? 'text-orange-400' : 'text-blue-400';
  const buttonClass = severity === 'danger' 
    ? 'bg-red-500 hover:bg-red-600' 
    : severity === 'warning' 
    ? 'bg-orange-500 hover:bg-orange-600' 
    : 'bg-blue-500 hover:bg-blue-600';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative ${bgClass} border-b backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${iconBgClass}`}>
                {severity === 'danger' ? (
                  <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${iconClass}`} />
                ) : (
                  <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${iconClass}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm md:text-base">
                  {title}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] hidden sm:block">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 justify-end">
              <Link
                href="/dashboard/settings?tab=subscription"
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm text-white ${buttonClass}`}
              >
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{buttonText}</span>
              </Link>

              {canDismiss && (
                <button
                  onClick={handleDismiss}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Zamknij"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
