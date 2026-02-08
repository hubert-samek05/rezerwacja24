'use client';

import { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Check, AlertCircle, Building2 } from 'lucide-react';
import { isBookings24Domain } from '@/hooks/useLocale';

interface StripeCardFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel?: () => void;
  buttonText?: string;
}

// EU VAT ID validation patterns
const VAT_PATTERNS: Record<string, RegExp> = {
  AT: /^ATU\d{8}$/,
  BE: /^BE0?\d{9,10}$/,
  BG: /^BG\d{9,10}$/,
  CY: /^CY\d{8}[A-Z]$/,
  CZ: /^CZ\d{8,10}$/,
  DE: /^DE\d{9}$/,
  DK: /^DK\d{8}$/,
  EE: /^EE\d{9}$/,
  EL: /^EL\d{9}$/,
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
  FI: /^FI\d{8}$/,
  FR: /^FR[A-Z0-9]{2}\d{9}$/,
  HR: /^HR\d{11}$/,
  HU: /^HU\d{8}$/,
  IE: /^IE\d{7}[A-Z]{1,2}$|^IE\d[A-Z]\d{5}[A-Z]$/,
  IT: /^IT\d{11}$/,
  LT: /^LT(\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,
  LV: /^LV\d{11}$/,
  MT: /^MT\d{8}$/,
  NL: /^NL\d{9}B\d{2}$/,
  PL: /^PL\d{10}$/,
  PT: /^PT\d{9}$/,
  RO: /^RO\d{2,10}$/,
  SE: /^SE\d{12}$/,
  SI: /^SI\d{8}$/,
  SK: /^SK\d{10}$/,
  GB: /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/,
};

function validateVatId(vatId: string): boolean {
  const cleanVat = vatId.replace(/[\s.-]/g, '').toUpperCase();
  const countryCode = cleanVat.substring(0, 2);
  const pattern = VAT_PATTERNS[countryCode];
  if (!pattern) return false;
  return pattern.test(cleanVat);
}

export default function StripeCardForm({
  clientSecret,
  onSuccess,
  onCancel,
  buttonText = 'Zapisz kartę',
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // B2B fields for bookings24.eu
  const [isB2B, setIsB2B] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [vatId, setVatId] = useState('');
  const [vatError, setVatError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsB2B(isBookings24Domain());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // B2B validation for bookings24.eu
    if (isB2B) {
      if (!companyName.trim()) {
        setError('Company name is required');
        return;
      }
      if (!vatId.trim()) {
        setVatError('VAT ID is required for business accounts');
        return;
      }
      if (!validateVatId(vatId)) {
        setVatError('Invalid VAT ID format. Please use format: XX123456789');
        return;
      }
      setVatError(null);
      
      // Save billing data to backend
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/tenants/billing-data', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            billing_company_name: companyName,
            billing_vat_id: vatId.replace(/[\s.-]/g, '').toUpperCase(),
            billing_type: 'company',
          }),
        });
      } catch (err) {
        console.error('Failed to save billing data:', err);
      }
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Błąd inicjalizacji formularza');
      setLoading(false);
      return;
    }

    try {
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Wystąpił błąd podczas zapisywania karty');
      } else if (setupIntent?.status === 'succeeded') {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił nieoczekiwany błąd');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'var(--text-primary)',
        '::placeholder': {
          color: 'var(--text-muted)',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-[var(--text-primary)] font-medium">Karta została zapisana</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* B2B Company Data - only for bookings24.eu */}
      {isB2B && (
        <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Business Account Required</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Bookings24 is a B2B platform. Please provide your company details for invoicing.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Ltd."
              className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              VAT ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vatId}
              onChange={(e) => {
                setVatId(e.target.value);
                setVatError(null);
              }}
              placeholder="DE123456789"
              className={`w-full px-4 py-3 border rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 transition-all ${
                vatError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-[var(--border-color)] focus:border-emerald-500 focus:ring-emerald-500'
              }`}
            />
            {vatError && (
              <p className="mt-1 text-sm text-red-500">{vatError}</p>
            )}
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Format: Country code + number (e.g., DE123456789, FR12345678901)
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
          {isB2B ? 'Payment Card Details' : 'Dane karty płatniczej'}
        </label>
        <div className="p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)] flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          {isB2B ? 'We accept Visa, Mastercard, American Express' : 'Obsługujemy Visa, Mastercard, American Express'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-[var(--border-color)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
          >
            {isB2B ? 'Cancel' : 'Anuluj'}
          </button>
        )}
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isB2B ? 'Processing...' : 'Przetwarzanie...'}
            </>
          ) : (
            isB2B ? 'Save Card' : buttonText
          )}
        </button>
      </div>

      <p className="text-xs text-center text-[var(--text-muted)]">
        {isB2B 
          ? 'Payments are securely processed by Stripe. We do not store your card details.'
          : 'Płatności są bezpiecznie przetwarzane przez Stripe. Nie przechowujemy danych Twojej karty.'
        }
      </p>
    </form>
  );
}
