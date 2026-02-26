'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Apple, Loader2, CheckCircle2 } from 'lucide-react';
import { useApplePurchases, PLAN_TO_PRODUCT_ID } from '@/hooks/useApplePurchases';

interface PaymentMethodSelectorProps {
  planSlug: string;
  planName: string;
  priceMonthly: number;
  currency: string;
  onSelectStripe: () => void;
  onApplePurchaseSuccess: () => void;
  onApplePurchaseError: (error: string) => void;
  isEnglish?: boolean;
}

/**
 * Komponent wyboru metody płatności
 * Na iOS pokazuje opcję Apple In-App Purchase obok Stripe
 * Zgodne z Apple Guideline 3.1.1
 */
export default function PaymentMethodSelector({
  planSlug,
  planName,
  priceMonthly,
  currency,
  onSelectStripe,
  onApplePurchaseSuccess,
  onApplePurchaseError,
  isEnglish = false,
}: PaymentMethodSelectorProps) {
  const { 
    isAvailable: isAppleIAPAvailable, 
    isLoading: isLoadingIAP,
    isPurchasing,
    products,
    purchaseProduct,
    getProductForPlan,
    error: iapError,
  } = useApplePurchases();

  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'apple' | null>(null);

  // Pobierz produkt Apple dla wybranego planu
  const appleProduct = getProductForPlan(planSlug);

  // Obsługa zakupu przez Apple IAP
  const handleApplePurchase = async () => {
    const productId = PLAN_TO_PRODUCT_ID[planSlug];
    if (!productId) {
      onApplePurchaseError(isEnglish ? 'Product not found' : 'Produkt nie znaleziony');
      return;
    }

    try {
      const result = await purchaseProduct(productId);
      if (result) {
        onApplePurchaseSuccess();
      }
    } catch (error: any) {
      onApplePurchaseError(error?.message || (isEnglish ? 'Purchase failed' : 'Zakup nie powiódł się'));
    }
  };

  // Jeśli IAP nie jest dostępny (nie iOS lub brak pluginu), od razu użyj Stripe
  useEffect(() => {
    if (!isLoadingIAP && !isAppleIAPAvailable) {
      // Automatycznie wybierz Stripe jeśli IAP niedostępny
      onSelectStripe();
    }
  }, [isLoadingIAP, isAppleIAPAvailable, onSelectStripe]);

  // Loading state
  if (isLoadingIAP) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <span className="ml-2 text-[var(--text-muted)]">
          {isEnglish ? 'Loading payment options...' : 'Ładowanie opcji płatności...'}
        </span>
      </div>
    );
  }

  // Jeśli IAP niedostępny, nie renderuj tego komponentu (Stripe zostanie użyty)
  if (!isAppleIAPAvailable) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {isEnglish ? 'Choose payment method' : 'Wybierz metodę płatności'}
      </h3>

      <div className="grid gap-3">
        {/* Opcja Apple In-App Purchase */}
        <button
          onClick={() => setSelectedMethod('apple')}
          disabled={isPurchasing}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
            selectedMethod === 'apple'
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-[var(--border-color)] hover:border-[var(--border-color-hover)]'
          } ${isPurchasing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
            <Apple className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--text-primary)]">
              {isEnglish ? 'Apple Pay / In-App Purchase' : 'Apple Pay / Zakup w aplikacji'}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {appleProduct?.priceString || `${priceMonthly} ${currency}`}
              {isEnglish ? '/month' : '/miesiąc'}
            </p>
          </div>
          {selectedMethod === 'apple' && (
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          )}
        </button>

        {/* Opcja Stripe (karta kredytowa) */}
        <button
          onClick={() => setSelectedMethod('stripe')}
          disabled={isPurchasing}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
            selectedMethod === 'stripe'
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-[var(--border-color)] hover:border-[var(--border-color-hover)]'
          } ${isPurchasing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--text-primary)]">
              {isEnglish ? 'Credit/Debit Card' : 'Karta kredytowa/debetowa'}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {priceMonthly.toFixed(2)} {currency}
              {isEnglish ? '/month' : '/miesiąc'}
            </p>
          </div>
          {selectedMethod === 'stripe' && (
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          )}
        </button>
      </div>

      {/* Przycisk kontynuacji */}
      {selectedMethod && (
        <button
          onClick={() => {
            if (selectedMethod === 'apple') {
              handleApplePurchase();
            } else {
              onSelectStripe();
            }
          }}
          disabled={isPurchasing}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPurchasing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isEnglish ? 'Processing...' : 'Przetwarzanie...'}
            </>
          ) : (
            <>
              {selectedMethod === 'apple' ? (
                <>
                  <Apple className="w-5 h-5" />
                  {isEnglish ? 'Pay with Apple' : 'Zapłać przez Apple'}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {isEnglish ? 'Continue with card' : 'Kontynuuj z kartą'}
                </>
              )}
            </>
          )}
        </button>
      )}

      {/* Błąd IAP */}
      {iapError && (
        <p className="text-sm text-red-500 text-center">{iapError}</p>
      )}

      {/* Info o subskrypcji */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        {isEnglish 
          ? 'Subscription renews automatically. You can cancel anytime.'
          : 'Subskrypcja odnawia się automatycznie. Możesz anulować w każdej chwili.'
        }
      </p>
    </div>
  );
}
