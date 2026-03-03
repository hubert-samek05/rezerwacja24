'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Typy dla cordova-plugin-purchase (StoreKit)
interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceMicros: number;
  currency: string;
  loaded: boolean;
  valid: boolean;
  canPurchase: boolean;
  owned: boolean;
}

interface PurchaseResult {
  productIdentifier: string;
  transactionId: string;
  receipt?: string;
}

interface ApplePurchasesState {
  isAvailable: boolean;
  isLoading: boolean;
  products: IAPProduct[];
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

// Mapowanie product ID na slug planu
export const PRODUCT_ID_TO_PLAN: Record<string, string> = {
  [APPLE_PRODUCT_IDS.STARTER_MONTHLY]: 'starter',
  [APPLE_PRODUCT_IDS.STANDARD_MONTHLY]: 'standard',
  [APPLE_PRODUCT_IDS.PRO_MONTHLY]: 'pro',
  [APPLE_PRODUCT_IDS.STARTER_YEARLY]: 'starter',
  [APPLE_PRODUCT_IDS.STANDARD_YEARLY]: 'standard',
  [APPLE_PRODUCT_IDS.PRO_YEARLY]: 'pro',
};

/**
 * Hook do obsługi zakupów In-App Purchase na iOS
 * Używa cordova-plugin-purchase (StoreKit)
 * TYLKO dla natywnej aplikacji iOS - na web/Android używamy Stripe
 */
export function useApplePurchases() {
  const [state, setState] = useState<ApplePurchasesState>({
    isAvailable: false,
    isLoading: true,
    products: [],
    error: null,
  });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const storeInitialized = useRef(false);

  // Sprawdź czy jesteśmy na NATYWNYM iOS (nie web, nie Android)
  const isNativeIOS = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const Capacitor = (window as any).Capacitor;
    return Capacitor?.isNativePlatform?.() === true && Capacitor?.getPlatform?.() === 'ios';
  }, []);

  // Inicjalizuj store
  const initializeStore = useCallback(async () => {
    // WAŻNE: Tylko na natywnym iOS!
    if (!isNativeIOS()) {
      console.log('[IAP] Not native iOS - skipping IAP, using Stripe');
      setState(prev => ({ ...prev, isAvailable: false, isLoading: false }));
      return;
    }

    if (storeInitialized.current) return;

    try {
      // cordova-plugin-purchase eksportuje globalny obiekt CdvPurchase
      const CdvPurchase = (window as any).CdvPurchase;
      
      if (!CdvPurchase?.store) {
        console.log('[IAP] CdvPurchase.store not available');
        setState(prev => ({ ...prev, isAvailable: false, isLoading: false }));
        return;
      }

      const store = CdvPurchase.store;
      storeInitialized.current = true;

      console.log('[IAP] Initializing StoreKit...');

      // Rejestruj produkty
      const productIds = Object.values(APPLE_PRODUCT_IDS);
      productIds.forEach(productId => {
        store.register({
          id: productId,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: CdvPurchase.Platform.APPLE_APPSTORE,
        });
      });

      // Obsługa zatwierdzonych transakcji
      store.when()
        .approved((transaction: any) => {
          console.log('[IAP] Transaction approved:', transaction.id);
          // Weryfikuj na backendzie
          verifyPurchaseOnBackend({
            productIdentifier: transaction.products[0]?.id,
            transactionId: transaction.id,
            receipt: transaction.appStoreReceipt,
          }).then(() => {
            transaction.finish();
          }).catch((err: any) => {
            console.error('[IAP] Backend verification failed:', err);
          });
        })
        .verified((receipt: any) => {
          console.log('[IAP] Receipt verified:', receipt);
          receipt.finish();
        })
        .finished((transaction: any) => {
          console.log('[IAP] Transaction finished:', transaction.id);
          setIsPurchasing(false);
        });

      // Obsługa błędów
      store.error((error: any) => {
        console.error('[IAP] Store error:', error);
        setState(prev => ({ ...prev, error: error.message }));
        setIsPurchasing(false);
      });

      // Inicjalizuj store
      await store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);
      
      // Załaduj produkty
      await store.update();

      // Pobierz załadowane produkty
      const loadedProducts: IAPProduct[] = [];
      productIds.forEach(productId => {
        const product = store.get(productId, CdvPurchase.Platform.APPLE_APPSTORE);
        if (product && product.valid) {
          loadedProducts.push({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.pricing?.price || '',
            priceMicros: product.pricing?.priceMicros || 0,
            currency: product.pricing?.currency || 'PLN',
            loaded: true,
            valid: product.valid,
            canPurchase: product.canPurchase,
            owned: product.owned,
          });
        }
      });

      console.log('[IAP] Loaded products:', loadedProducts.length);
      
      setState({
        isAvailable: true,
        isLoading: false,
        products: loadedProducts,
        error: null,
      });

    } catch (error: any) {
      console.error('[IAP] Initialization error:', error);
      setState(prev => ({ 
        ...prev, 
        isAvailable: false, 
        isLoading: false,
        error: error.message 
      }));
    }
  }, [isNativeIOS]);

  // Kup produkt
  const purchaseProduct = useCallback(async (productId: string): Promise<PurchaseResult | null> => {
    if (!isNativeIOS()) {
      throw new Error('IAP only available on iOS');
    }

    try {
      setIsPurchasing(true);
      setState(prev => ({ ...prev, error: null }));

      const CdvPurchase = (window as any).CdvPurchase;
      const store = CdvPurchase?.store;
      
      if (!store) {
        throw new Error('Store not initialized');
      }

      console.log('[IAP] Starting purchase for:', productId);
      
      const product = store.get(productId, CdvPurchase.Platform.APPLE_APPSTORE);
      
      if (!product || !product.canPurchase) {
        throw new Error('Product not available for purchase');
      }

      // Rozpocznij zakup
      const offer = product.getOffer();
      if (!offer) {
        throw new Error('No offer available');
      }

      const result = await store.order(offer);
      
      if (result && result.isError) {
        if (result.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
          // Użytkownik anulował - nie pokazuj błędu
          return null;
        }
        throw new Error(result.message);
      }

      console.log('[IAP] Purchase initiated');
      
      // Transakcja będzie obsłużona przez handler 'approved'
      return {
        productIdentifier: productId,
        transactionId: result?.transactionId || 'pending',
      };
      
    } catch (error: any) {
      console.error('[IAP] Purchase error:', error);
      
      // Sprawdź czy użytkownik anulował
      if (error?.message?.includes('cancel') || error?.message?.includes('Cancel')) {
        setIsPurchasing(false);
        return null;
      }
      
      setState(prev => ({ 
        ...prev, 
        error: error?.message || 'Błąd podczas zakupu' 
      }));
      setIsPurchasing(false);
      throw error;
    }
  }, [isNativeIOS]);

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
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNativeIOS()) {
      return false;
    }

    try {
      setIsPurchasing(true);
      
      const CdvPurchase = (window as any).CdvPurchase;
      const store = CdvPurchase?.store;
      
      if (!store) {
        throw new Error('Store not initialized');
      }

      // Przywróć zakupy z App Store
      await store.restorePurchases();
      
      // Sprawdź czy są aktywne subskrypcje
      const productIds = Object.values(APPLE_PRODUCT_IDS);
      const activeSubscriptions: string[] = [];
      
      productIds.forEach(productId => {
        const product = store.get(productId, CdvPurchase.Platform.APPLE_APPSTORE);
        if (product && product.owned) {
          activeSubscriptions.push(productId);
        }
      });

      if (activeSubscriptions.length > 0) {
        // Zsynchronizuj z backendem
        const token = localStorage.getItem('token');
        const apiUrl = getApiUrl();
        
        await fetch(`${apiUrl}/api/billing/apple/restore`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscriptions: activeSubscriptions,
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
  }, [isNativeIOS]);

  // Helper do pobierania API URL
  const getApiUrl = () => {
    if (typeof window === 'undefined') return 'https://api.rezerwacja24.pl';
    const hostname = window.location.hostname;
    if (hostname.includes('bookings24.eu')) return 'https://api.bookings24.eu';
    if (hostname.includes('rezerwacja24.pl')) return 'https://api.rezerwacja24.pl';
    return 'http://localhost:3001';
  };

  // Pobierz produkt po ID planu
  const getProductForPlan = useCallback((planSlug: string): IAPProduct | undefined => {
    const productId = PLAN_TO_PRODUCT_ID[planSlug];
    return state.products.find(p => p.id === productId);
  }, [state.products]);

  // Inicjalizuj store przy montowaniu
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return {
    ...state,
    isPurchasing,
    isNativeIOS: isNativeIOS(),
    purchaseProduct,
    restorePurchases,
    getProductForPlan,
    refreshProducts: initializeStore,
  };
}

export default useApplePurchases;
