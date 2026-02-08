'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Globe,
  Palette,
  Code,
  Headphones,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  trialDays: number;
  isHighlighted: boolean;
  tier: number;
  limits: {
    bookings: number | null;
    employees: number | null;
    sms: number | null;
  };
  features: {
    googleCalendar: boolean;
    iosCalendar: boolean;
    analytics: boolean;
    automations: boolean;
    whiteLabel: boolean;
    subdomain: boolean;
    apiAccess: boolean;
    prioritySupportChat: boolean;
  };
}

interface PricingPlansProps {
  onSelectPlan?: (planId: string) => void;
  selectedPlanId?: string;
  showTrialInfo?: boolean;
  variant?: 'full' | 'compact';
  currentPlanSlug?: string;
}

export default function PricingPlans({
  onSelectPlan,
  selectedPlanId,
  showTrialInfo = true,
  variant = 'full',
  currentPlanSlug,
}: PricingPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/plans');
      if (!response.ok) throw new Error('Błąd pobierania planów');
      const data = await response.json();
      setPlans(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return '∞';
    return limit.toString();
  };

  const getPlanIcon = (tier: number) => {
    switch (tier) {
      case 1:
        return Zap;
      case 2:
        return Sparkles;
      case 3:
        return Crown;
      default:
        return Zap;
    }
  };

  const getPlanColor = (tier: number, isHighlighted: boolean) => {
    if (isHighlighted) {
      return {
        bg: 'bg-gradient-to-br from-[#0B2E23] to-[#0F6048]',
        border: 'border-[#41FFBC]',
        button: 'bg-[#41FFBC] hover:bg-[#41FFBC]/90 text-[#0A0A0A]',
        badge: 'bg-[#41FFBC] text-[#0A0A0A]',
      };
    }
    switch (tier) {
      case 1:
        return {
          bg: 'bg-[#1A1A1A]',
          border: 'border-gray-700',
          button: 'bg-gray-700 hover:bg-gray-600 text-[var(--text-primary)]',
          badge: 'bg-gray-700 text-[var(--text-primary)]',
        };
      case 2:
        return {
          bg: 'bg-[#1A1A1A]',
          border: 'border-blue-500/30',
          button: 'bg-blue-600 hover:bg-blue-700 text-[var(--text-primary)]',
          badge: 'bg-blue-600 text-[var(--text-primary)]',
        };
      default:
        return {
          bg: 'bg-[#1A1A1A]',
          border: 'border-gray-700',
          button: 'bg-gray-700 hover:bg-gray-600 text-[var(--text-primary)]',
          badge: 'bg-gray-700 text-[var(--text-primary)]',
        };
    }
  };

  const getFeaturesList = (plan: Plan) => {
    const features = plan.features as any;
    return [
      {
        name: `${formatLimit(plan.limits.bookings)} rezerwacji/mies.`,
        included: true,
        icon: Calendar,
      },
      {
        name: `${formatLimit(plan.limits.employees)} ${plan.limits.employees === 1 ? 'pracownik' : 'pracowników'}`,
        included: true,
        icon: Users,
      },
      {
        name: plan.limits.sms === 0 ? 'Brak SMS' : `${formatLimit(plan.limits.sms)} SMS/mies.`,
        included: plan.limits.sms !== 0,
        icon: MessageSquare,
      },
      {
        name: 'Google Calendar',
        included: features.googleCalendar,
        icon: Calendar,
      },
      {
        name: 'Analityka',
        included: features.analytics,
        icon: BarChart3,
      },
      {
        name: 'Własna subdomena',
        included: features.subdomain,
        icon: Globe,
      },
      {
        name: 'White-label',
        included: features.whiteLabel,
        icon: Palette,
      },
      {
        name: 'Dostęp API',
        included: features.apiAccess,
        icon: Code,
      },
      {
        name: 'Priorytetowe wsparcie',
        included: features.prioritySupportChat,
        icon: Headphones,
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#41FFBC]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchPlans}
          className="mt-4 px-4 py-2 bg-[#41FFBC] text-[#0A0A0A] rounded-lg"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${variant === 'full' ? 'md:grid-cols-3' : 'md:grid-cols-3'}`}>
      {plans.map((plan, index) => {
        const Icon = getPlanIcon(plan.tier);
        const colors = getPlanColor(plan.tier, plan.isHighlighted);
        const isSelected = selectedPlanId === plan.id;
        const isCurrent = currentPlanSlug === plan.slug;
        const features = getFeaturesList(plan);

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-2xl p-6 border-2 ${colors.bg} ${colors.border} ${
              isSelected ? 'ring-2 ring-[#41FFBC] ring-offset-2 ring-offset-[#0A0A0A]' : ''
            } ${plan.isHighlighted ? 'scale-105 z-10' : ''}`}
          >
            {/* Badge dla wyróżnionego planu */}
            {plan.isHighlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${colors.badge}`}>
                  Najpopularniejszy
                </span>
              </div>
            )}

            {/* Badge dla obecnego planu */}
            {isCurrent && (
              <div className="absolute -top-3 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-[var(--text-primary)]">
                  Twój plan
                </span>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                plan.isHighlighted ? 'bg-[#41FFBC]/20' : 'bg-gray-700'
              }`}>
                <Icon className={`w-6 h-6 ${plan.isHighlighted ? 'text-[#41FFBC]' : 'text-[var(--text-secondary)]'}`} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-4xl font-bold ${plan.isHighlighted ? 'text-[#41FFBC]' : 'text-[var(--text-primary)]'}`}>
                  {plan.priceMonthly.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[var(--text-muted)]">zł/mies.</span>
              </div>
              {showTrialInfo && plan.trialDays > 0 && (
                <p className="text-sm text-[#41FFBC] mt-2">
                  {plan.trialDays} dni za darmo
                </p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-[#41FFBC] flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                  <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Button */}
            {onSelectPlan && (
              <button
                onClick={() => onSelectPlan(plan.id)}
                disabled={isCurrent}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                  isCurrent
                    ? 'bg-gray-700 text-[var(--text-muted)] cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#41FFBC] text-[#0A0A0A]'
                    : colors.button
                }`}
              >
                {isCurrent ? 'Obecny plan' : isSelected ? 'Wybrany' : 'Wybierz plan'}
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
