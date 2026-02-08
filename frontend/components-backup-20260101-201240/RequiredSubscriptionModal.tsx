'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RequiredSubscriptionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export default function RequiredSubscriptionModal({
  isOpen,
  onClose,
  canClose = false,
}: RequiredSubscriptionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    // Przekieruj do strony checkout
    router.push('/subscription/checkout');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop - nie można kliknąć aby zamknąć */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-[#0B2E23] to-[#051810] rounded-2xl shadow-2xl border border-[#41FFBC]/20 overflow-hidden"
        >
          {/* Close button - tylko jeśli canClose */}
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}

          {/* Header */}
          <div className="p-8 text-center border-b border-white/10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#41FFBC]/20 to-[#41FFBC]/5 flex items-center justify-center">
              <Lock className="w-10 h-10 text-[#41FFBC]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Subskrypcja wymagana
            </h2>
            <p className="text-gray-400">
              Aby korzystać z Rezerwacja24, musisz aktywować subskrypcję
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-[#41FFBC]/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-[#41FFBC]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    7 dni za darmo
                  </h3>
                  <p className="text-sm text-gray-400">
                    Wypróbuj wszystkie funkcje przez 7 dni bez opłat. Karta wymagana, ale nie zostanie obciążona.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-[#41FFBC]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#41FFBC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Pełny dostęp
                  </h3>
                  <p className="text-sm text-gray-400">
                    Nieograniczone rezerwacje, kalendarz, klienci, pracownicy, usługi i więcej.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-[#41FFBC]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#41FFBC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Anuluj w dowolnym momencie
                  </h3>
                  <p className="text-sm text-gray-400">
                    Możesz anulować subskrypcję w każdej chwili. Bez ukrytych opłat.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-[#41FFBC]/10 to-[#41FFBC]/5 rounded-xl p-6 mb-6 border border-[#41FFBC]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Po okresie próbnym</p>
                  <p className="text-3xl font-bold text-white">79,99 zł<span className="text-lg text-gray-400">/miesiąc</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#41FFBC] font-semibold">7 DNI GRATIS</p>
                  <p className="text-xs text-gray-400">Karta nie zostanie obciążona</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#41FFBC] to-[#2DD4A3] text-[#0B2E23] font-bold rounded-xl hover:shadow-lg hover:shadow-[#41FFBC]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ładowanie...
                </span>
              ) : (
                'Rozpocznij 7-dniowy okres próbny'
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Płatności obsługiwane przez Stripe. Twoje dane są bezpieczne.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
