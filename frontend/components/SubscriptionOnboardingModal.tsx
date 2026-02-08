'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Calendar,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface SubscriptionOnboardingModalProps {
  onClose: () => void;
  onStartTrial: () => void;
}

export default function SubscriptionOnboardingModal({
  onClose,
  onStartTrial,
}: SubscriptionOnboardingModalProps) {
  const [step, setStep] = useState(1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-[#0B2E23] to-[#0F6048] rounded-2xl shadow-2xl border border-[#41FFBC]/20 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#41FFBC]/20 mb-4"
              >
                <Sparkles className="w-10 h-10 text-[#41FFBC]" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                Witaj w Rezerwacja24! 🎉
              </h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Rozpocznij 7-dniowy okres próbny za darmo
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  icon: Zap,
                  title: 'Pełny dostęp',
                  description: 'Wszystkie funkcje premium bez ograniczeń',
                },
                {
                  icon: Calendar,
                  title: '7 dni za darmo',
                  description: 'Testuj bez ryzyka, anuluj w każdej chwili',
                },
                {
                  icon: CreditCard,
                  title: 'Bezpieczne płatności',
                  description: 'Karta wymagana, ale nie pobierzemy opłat przez 7 dni',
                },
                {
                  icon: CheckCircle2,
                  title: 'Bez zobowiązań',
                  description: 'Możesz anulować przed końcem okresu próbnego',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#41FFBC]/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-[#41FFBC]" />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/5 rounded-xl p-6 mb-6 border border-[#41FFBC]/30"
            >
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-[#41FFBC]">79,99 zł</span>
                <span className="text-xl text-[var(--text-secondary)]">/miesiąc</span>
              </div>
              <p className="text-center text-[var(--text-muted)] text-sm">
                Po zakończeniu okresu próbnego
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onStartTrial}
                className="flex-1 bg-[#41FFBC] hover:bg-[#41FFBC]/90 text-[#0A0A0A] font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>Rozpocznij 7-dniowy okres próbny</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onClose}
                className="sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-[var(--text-primary)] font-semibold transition-colors"
              >
                Później
              </button>
            </div>

            {/* Fine print */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Klikając "Rozpocznij okres próbny" zostaniesz przekierowany do bezpiecznej strony płatności Stripe.
              Twoja karta nie zostanie obciążona przez pierwsze 7 dni.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#41FFBC]/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0F6048]/30 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
