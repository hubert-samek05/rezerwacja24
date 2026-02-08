'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface PaymentMethodManagerProps {
  customerId: string;
  onUpdate: () => void;
}

export default function PaymentMethodManager({
  customerId,
  onUpdate,
}: PaymentMethodManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleOpenBillingPortal = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/portal-session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Nie udało się otworzyć portalu płatności');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error.message || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Metody płatności</h3>
          <p className="text-sm text-gray-400">
            Zarządzaj swoimi kartami płatniczymi
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleOpenBillingPortal}
          disabled={loading}
          className="w-full bg-primary-green hover:bg-primary-green/80 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Otwieranie...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Zarządzaj metodami płatności
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Zostaniesz przekierowany do bezpiecznego portalu Stripe, gdzie możesz dodawać,
          usuwać i edytować swoje metody płatności.
        </p>
      </div>
    </div>
  );
}
