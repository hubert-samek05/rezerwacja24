'use client';

import { useState, useEffect, useCallback } from 'react';

// Typy dla Capacitor Purchases plugin
interface Product {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

interface PurchaseResult {
  productIdentifier: string;
  transactionId: string;
  receipt?: string;
}

interface ApplePurchasesState {
  isAvailable: boolean;
  isLoading: boolean;
  products: Product[];
  error: string | null;
}

// Product IDs zdefiniowane w App Store Connect
export const APPLE_PRODUCT_IDS = {
  STARTER_MONTHLY: 'pl.rezerwacja24.starter.monthly',
  STANDARD_MONTHLY: 'pl.rezerwacja24.standard.monthly',
  PRO_MONTHLY: 'pl.rezerwacja24.pro.monthly',
  STARTER_YEARLY: 'pl.rezerwacja24.starter.yearly',
  STANDARD_YEARLY: 'pl.rezerwacja24.standard.yearly',
  PRO_YEARLY: 'pl.rezerwacja24.pro.yearly',
};

// Mapowanie planów na product IDs
export const PLAN_TO_PRODUCT_ID: Record<string, string> = {
  'starter': APPLE_PRODUCT_IDS.STARTER_MONTHLY,
  'standard': APPLE_PRODUCT_IDS.STANDARD_MONTHLY,
  'pro': APPLE_PRODUCT_IDS.PRO_MONTHLY,
};

/**
 * Hook do obsługi zakupów In-App Purchase na iOS
 * Używa Capacitor Purchases plugin (RevenueCat) lub natywnego StoreKit
 */
export function useApplePurchases() {
  const [state, setState] = useState<ApplePurchasesState>({
    isAvailable: false,
    isLoading: true,
    products: [],
    error: null,
  });
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Sprawdź czy jesteśmy na iOS i czy IAP jest dostępny
  const checkAvailability = useCallback(async () => {
    try {
      const Capacitor = (window as any).Capacitor;
      const isNativeIOS = Capacitor?.isNativePlatform?.() && Capacitor?.getPlatform?.() === 'ios';
      
      if (!isNativeIOS) {
        setState(prev => ({ ...prev, isAvailable: false, isLoading: false }));
        return;
      }

      // Sprawdź czy plugin Purchases jest dostępny
      // Możemy użyć @revenuecat/purchases-capacitor lub własnej implementacji
      const Purchases = Capacitor?.Plugins?.Purchases;
      
      if (Purchases) {
        setState(prev => ({ ...prev, isAvailable: true, isLoading: false }));
        await loadProducts();
      } else {
        // Brak pluginu - IAP niedostępny, ale to OK - użyjemy Stripe
        console.log('[IAP] Purchases plugin not available');
        setState(prev => ({ ...prev, isAvailable: false, isLoading: false }));
      }
    } catch (error) {
      console.error('[IAP] Error checking availability:', error);
      setState(prev => ({ ...prev, isAvailable: false, isLoading: false }));
    }
  }, []);

  // Załaduj produkty z App Store
  const loadProducts = useCallback(async () => {
    try {
      const Capacitor = (window as any).Capacitor;
      const Purchases = Capacitor?.Plugins?.Purchases;
      
      if (!Purchases) return;

      const productIds = Object.values(APPLE_PRODUCT_IDS);
      const result = await Purchases.getProducts({ productIdentifiers: productIds });
      
      if (result?.products) {
        setState(prev => ({ 
          ...prev, 
          products: result.products,
          error: null 
        }));
      }
    } catch (error: any) {
      console.error('[IAP] Error loading products:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Nie udało się załadować produktów' 
      }));
    }
  }, []);

  // Kup produkt
  const purchaseProduct = useCallback(async (productId: string): Promise<PurchaseResult | null> => {
    try {
      setIsPurchasing(true);
      setState(prev => ({ ...prev, error: null }));

      const Capacitor = (window as any).Capacitor;
      const Purchases = Capacitor?.Plugins?.Purchases;
      
      if (!Purchases) {
        throw new Error('Purchases plugin not available');
      }

      console.log('[IAP] Starting purchase for:', productId);
      
      const result = await Purchases.purchaseProduct({ productIdentifier: productId });
      
      console.log('[IAP] Purchase result:', result);
      
      if (result?.transaction) {
        // Wyślij receipt do backendu do weryfikacji
        await verifyPurchaseOnBackend(result.transaction);
        return result.transaction;
      }
      
      return null;
    } catch (error: any) {
      console.error('[IAP] Purchase error:', error);
      
      // Sprawdź czy użytkownik anulował
      if (error?.code === 'E_USER_CANCELLED' || error?.message?.includes('cancel')) {
        // Nie pokazuj błędu przy anulowaniu
        return null;
      }
      
      setState(prev => ({ 
        ...prev, 
        error: error?.message || 'Błąd podczas zakupu' 
      }));
      throw error;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  // Weryfikuj zakup na backendzie
  const verifyPurchaseOnBackend = async (transaction: PurchaseResult) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/billing/apple/verify-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: transaction.productIdentifier,
          transactionId: transaction.transactionId,
          receipt: transaction.receipt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('[IAP] Backend verification error:', error);
      throw error;
    }
  };

  // Przywróć zakupy (dla użytkowników którzy reinstalowali aplikację)
  const restorePurchases = useCallback(async () => {
    try {
      setIsPurchasing(true);
      
      const Capacitor = (window as any).Capacitor;
      const Purchases = Capacitor?.Plugins?.Purchases;
      
      if (!Purchases) {
        throw new Error('Purchases plugin not available');
      }

      const result = await Purchases.restorePurchases();
      
      if (result?.customerInfo?.activeSubscriptions?.length > 0) {
        // Użytkownik ma aktywne subskrypcje - zsynchronizuj z backendem
        const token = localStorage.getItem('token');
        const apiUrl = getApiUrl();
        
        await fetch(`${apiUrl}/api/billing/apple/restore`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscriptions: result.customerInfo.activeSubscriptions,
          }),
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('[IAP] Restore error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Nie udało się przywrócić zakupów' 
      }));
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  // Helper do pobierania API URL
  const getApiUrl = () => {
    if (typeof window === 'undefined') return 'https://api.rezerwacja24.pl';
    const hostname = window.location.hostname;
    if (hostname.includes('bookings24.eu')) return 'https://api.bookings24.eu';
    if (hostname.includes('rezerwacja24.pl')) return 'https://api.rezerwacja24.pl';
    return 'http://localhost:3001';
  };

  // Pobierz produkt po ID planu
  const getProductForPlan = useCallback((planSlug: string): Product | undefined => {
    const productId = PLAN_TO_PRODUCT_ID[planSlug];
    return state.products.find(p => p.identifier === productId);
  }, [state.products]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    ...state,
    isPurchasing,
    purchaseProduct,
    restorePurchases,
    getProductForPlan,
    refreshProducts: loadProducts,
  };
}

export default useApplePurchases;
