'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function useRequireSubscription() {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isPastDue, setIsPastDue] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isInTrial, setIsInTrial] = useState(false);
  const [remainingTrialDays, setRemainingTrialDays] = useState<number>(0);
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Ścieżki które nie wymagają subskrypcji
  const publicPaths = [
    '/login',
    '/register',
    '/subscription/checkout',
    '/payment/success',
    '/payment/error',
    '/dashboard/settings', // Ustawienia dostępne dla zablokowanych kont
  ];

  useEffect(() => {
    checkSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sprawdź tylko raz przy montowaniu

  const checkSubscription = async () => {
    // Jeśli jesteśmy na publicznej ścieżce, nie sprawdzaj
    if (publicPaths.some(path => pathname?.startsWith(path))) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/billing/subscription/status');
      
      if (response.ok) {
        const data = await response.json();
        const hasActive = data.hasActiveSubscription || data.isInTrial;
        
        setHasSubscription(hasActive);
        setSubscriptionStatus(data.status || null);
        setIsInTrial(data.isInTrial || false);
        setRemainingTrialDays(data.remainingTrialDays || 0);
        setTrialEndDate(data.trialEndDate || null);
        
        // Pokaż banner trialu jeśli jest w trialu
        if (data.isInTrial && data.remainingTrialDays <= 7) {
          setShowTrialBanner(true);
        }
        
        const needsRenewal = data.isPastDue || data.isCancelled || data.status === 'PAST_DUE' || data.status === 'CANCELLED';
        setIsPastDue(needsRenewal);
        
        // Jeśli trial się skończył (status TRIALING ale remainingTrialDays <= 0)
        const trialExpired = data.status === 'TRIALING' && data.remainingTrialDays <= 0;
        
        // Jeśli subskrypcja jest PAST_DUE, CANCELLED lub trial wygasł - przekieruj do ustawień (nie checkout)
        if (needsRenewal || trialExpired) {
          if (!pathname?.startsWith('/dashboard/settings')) {
            router.push('/dashboard/settings');
          }
          return;
        }
        
        // Jeśli nie ma subskrypcji i nie jesteśmy na ustawieniach, pokaż modal
        if (!hasActive && !pathname?.startsWith('/dashboard/settings')) {
          setShowModal(true);
        }
      } else {
        // Błąd API - załóż że nie ma subskrypcji
        setHasSubscription(false);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasSubscription(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasSubscription,
    loading,
    showModal,
    setShowModal,
    isPastDue,
    subscriptionStatus,
    isInTrial,
    remainingTrialDays,
    trialEndDate,
    showTrialBanner,
    setShowTrialBanner,
  };
}
