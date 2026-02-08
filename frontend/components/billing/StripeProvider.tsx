'use client';

import { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const appearance: Appearance = {
    theme: 'flat',
    variables: {
      colorPrimary: '#10b981',
      colorBackground: 'var(--bg-primary)',
      colorText: 'var(--text-primary)',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: '12px',
    },
  };

  const options = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : {
        appearance,
      };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
