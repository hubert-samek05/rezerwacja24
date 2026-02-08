'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  AlertTriangle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Zap,
  Sparkles,
  Crown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  tier: number;
  isHighlighted: boolean;
  limits: {
    bookings: number | null;
    employees: number | null;
    sms: number | null;
  };
}

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanSlug: string;
  onPlanChanged?: () => void;
}

export default function ChangePlanModal({
  isOpen,
  onClose,
  currentPlanSlug,
  onPlanChanged,
}: ChangePlanModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [canChangeResult, setCanChangeResult] = useState<any>(null);
  const [checkingDowngrade, setCheckingDowngrade] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/plans');
      if (!response.ok) throw new Error('Błąd pobierania planów');
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      toast.error('Nie udało się pobrać planów');
    } finally {
      setLoading(false);
    }
  };

  const checkCanChange = async (planId: string) => {
    try {
      setCheckingDowngrade(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/billing/plan/can-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      setCanChangeResult(data);
      return data;
    } catch (err) {
      return null;
    } finally {
      setCheckingDowngrade(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.slug === currentPlanSlug) return;
    
    setSelectedPlanId(plan.id);
    
    // Sprawdź czy to downgrade
    const currentPlan = plans.find(p => p.slug === currentPlanSlug);
    if (currentPlan && plan.tier < currentPlan.tier) {
      await checkCanChange(plan.id);
    } else {
      setCanChangeResult(null);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) return;

    try {
      setChanging(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/billing/plan/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: selectedPlanId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Nie udało się zmienić planu');
      }

      const data = await response.json();
      toast.success(data.message || 'Plan został zmieniony!');
      onPlanChanged?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChanging(false);
    }
  };

  const getPlanIcon = (tier: number) => {
    switch (tier) {
      case 1: return Zap;
      case 2: return Sparkles;
      case 3: return Crown;
      default: return Zap;
    }
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return '∞';
    return limit.toString();
  };

  const currentPlan = plans.find(p => p.slug === currentPlanSlug);
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const isDowngrade = currentPlan && selectedPlan && selectedPlan.tier < currentPlan.tier;
  const isUpgrade = currentPlan && selectedPlan && selectedPlan.tier > currentPlan.tier;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--bg-card)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Zmień plan</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : (
              <>
                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {plans.map((plan) => {
                    const Icon = getPlanIcon(plan.tier);
                    const isCurrent = plan.slug === currentPlanSlug;
                    const isSelected = plan.id === selectedPlanId;

                    return (
                      <button
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isCurrent}
                        className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                          isCurrent
                            ? 'border-[var(--border-color)] bg-[var(--bg-secondary)] cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-[var(--border-color)] hover:border-emerald-500/50 bg-[var(--bg-card)]'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2 right-3 px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">
                            Obecny
                          </span>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            plan.isHighlighted ? 'bg-emerald-500/20' : 'bg-[var(--bg-secondary)]'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              plan.isHighlighted ? 'text-emerald-500' : 'text-[var(--text-secondary)]'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-[var(--text-primary)]">{plan.name}</h3>
                            <p className={`text-lg font-bold ${
                              plan.isHighlighted ? 'text-emerald-500' : 'text-[var(--text-secondary)]'
                            }`}>
                              {plan.priceMonthly.toFixed(2).replace('.', ',')} zł
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-[var(--text-muted)]">
                          <p>{formatLimit(plan.limits.bookings)} rezerwacji</p>
                          <p>{formatLimit(plan.limits.employees)} pracowników</p>
                          <p>{plan.limits.sms === 0 ? 'Brak SMS' : `${formatLimit(plan.limits.sms)} SMS`}</p>
                        </div>

                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <Check className="w-5 h-5 text-emerald-500" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Downgrade Warning */}
                {isDowngrade && canChangeResult && !canChangeResult.canDowngrade && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-semibold mb-2">
                          Nie można zmienić na ten plan
                        </p>
                        <ul className="text-sm text-red-300 space-y-1">
                          {canChangeResult.issues?.map((issue: string, i: number) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upgrade/Downgrade Info */}
                {selectedPlanId && selectedPlan && currentPlan && (
                  <div className={`rounded-xl p-4 mb-6 ${
                    isUpgrade 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-yellow-500/10 border border-yellow-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      {isUpgrade ? (
                        <ArrowUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-yellow-400" />
                      )}
                      <div>
                        <p className={`font-semibold ${isUpgrade ? 'text-green-400' : 'text-yellow-400'}`}>
                          {isUpgrade ? 'Ulepszenie planu' : 'Obniżenie planu'}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {isUpgrade 
                            ? 'Nowe limity zostaną zastosowane natychmiast. Różnica w cenie zostanie naliczona proporcjonalnie.'
                            : 'Zmiana wejdzie w życie od następnego okresu rozliczeniowego.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-[var(--border-color)]">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleChangePlan}
              disabled={!selectedPlanId || changing || checkingDowngrade || (isDowngrade && canChangeResult && !canChangeResult.canDowngrade)}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {changing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Zmieniam...
                </>
              ) : (
                'Zmień plan'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
