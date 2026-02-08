'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, CreditCard, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrialCountdownBannerProps {
  remainingDays: number;
  trialEndDate: string;
  onDismiss?: () => void;
}

export default function TrialCountdownBanner({
  remainingDays,
  trialEndDate,
  onDismiss,
}: TrialCountdownBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || remainingDays < 0) {
    return null;
  }

  const handleAddPaymentMethod = () => {
    router.push('/dashboard/settings?tab=subscription');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Określ kolor i wiadomość w zależności od pozostałych dni
  const getVariant = () => {
    if (remainingDays === 0) {
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: AlertCircle,
        message: 'Twój okres próbny kończy się dzisiaj!',
        cta: 'Dodaj metodę płatności teraz',
      };
    } else if (remainingDays === 1) {
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        icon: AlertCircle,
        message: 'Pozostał 1 dzień okresu próbnego',
        cta: 'Dodaj metodę płatności',
      };
    } else if (remainingDays <= 3) {
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: Calendar,
        message: `Pozostało ${remainingDays} dni okresu próbnego`,
        cta: 'Dodaj metodę płatności',
      };
    } else {
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: Calendar,
        message: `Pozostało ${remainingDays} dni okresu próbnego`,
        cta: 'Zarządzaj subskrypcją',
      };
    }
  };

  const variant = getVariant();
  const Icon = variant.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${variant.bg} border ${variant.border} rounded-xl p-3 sm:p-4 mb-4 sm:mb-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${variant.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${variant.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm sm:text-base ${variant.text} truncate`}>{variant.message}</p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
                Kończy się {new Date(trialEndDate).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleAddPaymentMethod}
              className={`${variant.text} hover:opacity-80 font-medium text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2`}
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{variant.cta}</span>
              <span className="xs:hidden">Subskrypcja</span>
            </button>

            {remainingDays > 3 && (
              <button
                onClick={handleDismiss}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 sm:p-2"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 sm:mt-4 bg-black/30 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(remainingDays / 7) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${variant.text.replace('text-', 'bg-')}`}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
