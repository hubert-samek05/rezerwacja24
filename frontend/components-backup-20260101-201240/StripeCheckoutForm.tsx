'use client';

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ clientSecret, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/settings/subscription?success=true`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Wystąpił błąd podczas przetwarzania płatności');
        onError(error.message || 'Błąd płatności');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage('Wystąpił nieoczekiwany błąd');
      onError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#41FFBC] hover:bg-[#41FFBC]/90 text-[#0A0A0A] font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Przetwarzanie...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Rozpocznij 7-dniowy okres próbny
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Twoja karta nie zostanie obciążona przez pierwsze 7 dni. Po zakończeniu okresu próbnego
        automatycznie pobierzemy 79,99 zł miesięcznie. Możesz anulować w dowolnym momencie.
      </p>
    </form>
  );
}

interface StripeCheckoutFormProps {
  email: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripeCheckoutForm({
  email,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createCheckoutSession();
  }, []);

  const createCheckoutSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się utworzyć sesji płatności');
      }

      const data = await response.json();
      
      // Dla Stripe Checkout Session, przekieruj użytkownika
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // Dla Payment Intent (embedded)
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Wystąpił błąd podczas tworzenia sesji płatności');
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-[#41FFBC] mb-4" />
        <p className="text-gray-400">Przygotowywanie formularza płatności...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Wystąpił błąd</h3>
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={createCheckoutSession}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#41FFBC]" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#41FFBC',
        colorBackground: '#0A0A0A',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
