import { useState, useEffect } from 'react';

const ONBOARDING_SHOWN_KEY = 'rezerwacja24_subscription_onboarding_shown';

export function useSubscriptionOnboarding() {
  // CAŁKOWICIE WYŁĄCZONE - nie sprawdza, zawsze zwraca false
  const [shouldShow] = useState(false);
  const [isLoading] = useState(false);

  const markAsShown = () => {
    localStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_SHOWN_KEY);
  };

  return {
    shouldShow,
    isLoading,
    markAsShown,
    resetOnboarding,
  };
}
