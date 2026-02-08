'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  ExternalLink,
  XCircle,
  Sparkles,
} from 'lucide-react';
import PaymentMethodManager from './PaymentMethodManager';
import ChangePlanModal from '@/components/ChangePlanModal';
import { ArrowUpCircle } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  trialDays: number;
  features: any;
}

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED' | 'INCOMPLETE';
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePaymentMethodId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  subscription_plans: SubscriptionPlan;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  paidAt?: string;
  createdAt: string;
}

export default function SubscriptionTab() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTrialDays, setRemainingTrialDays] = useState(0);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subRes, invoicesRes, statusRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/invoices'),
        fetch('/api/billing/subscription/status'),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        // Sprawdź czy to nie jest obiekt { subscription: null, hasSubscription: false }
        if (subData && !subData.hasSubscription) {
          setSubscription(null);
        } else {
          setSubscription(subData);
        }
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setRemainingTrialDays(statusData.remainingTrialDays || 0);
      }
    } catch (err) {
      setError('Błąd podczas pobierania danych subskrypcji');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSubscription = async () => {
    try {
      setActionLoading(true);
      
      // Pobierz email użytkownika z localStorage
      const userStr = localStorage.getItem('user');
      const email = userStr ? JSON.parse(userStr).email : '';
      
      const response = await fetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Błąd podczas tworzenia sesji checkout');

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      setError('Błąd podczas rozpoczynania subskrypcji');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/billing/portal-session', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Błąd podczas tworzenia sesji portalu');

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      setError('Błąd podczas otwierania portalu płatności');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Czy na pewno chcesz anulować subskrypcję? Będzie aktywna do końca okresu rozliczeniowego.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Błąd podczas anulowania subskrypcji');

      await fetchSubscriptionData();
    } catch (err) {
      setError('Błąd podczas anulowania subskrypcji');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/billing/subscription/resume', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Błąd podczas wznawiania subskrypcji');

      await fetchSubscriptionData();
    } catch (err) {
      setError('Błąd podczas wznawiania subskrypcji');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { text: 'Aktywna', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
      TRIALING: { text: 'Okres próbny', color: 'bg-blue-500/20 text-blue-400', icon: Calendar },
      PAST_DUE: { text: 'Zaległość', color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
      CANCELLED: { text: 'Anulowana', color: 'bg-gray-500/20 text-[var(--text-muted)]', icon: XCircle },
      INCOMPLETE: { text: 'Niekompletna', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
    };

    const badge = badges[status as keyof typeof badges] || badges.INCOMPLETE;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2">Subskrypcja</h2>
        <p className="text-sm sm:text-base text-neutral-gray">Zarządzaj swoją subskrypcją i płatnościami</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {!subscription ? (
        /* Brak subskrypcji - pokaż plan */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-8"
        >
          <div className="text-center mb-6 sm:mb-8">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">Plan Pro</h3>
            <div className="flex items-baseline justify-center gap-2 mb-3 sm:mb-4">
              <span className="text-3xl sm:text-5xl font-bold text-emerald-500">79,99 zł</span>
              <span className="text-lg sm:text-xl text-[var(--text-secondary)]">/miesiąc</span>
            </div>
            <p className="text-sm sm:text-lg text-[var(--text-secondary)] mb-2">Pełny dostęp do wszystkich funkcji</p>
            <p className="text-xs sm:text-sm text-emerald-500 font-semibold">7 dni okresu próbnego za darmo</p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">Wymagana karta płatnicza</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {[
              'Nielimitowane rezerwacje',
              'Nielimitowani pracownicy',
              '500 SMS miesięcznie',
              'Integracja Google Calendar',
              'Integracja iOS Calendar',
              'Zaawansowana analityka',
              'Automatyzacje',
              'White-label branding',
              'Własna subdomena',
              'Dostęp do API',
              'Wsparcie priorytetowe',
              'Aplikacja mobilna - niebawem!',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[var(--text-primary)] text-xs sm:text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartSubscription}
            disabled={actionLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-500/90 text-white font-bold py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span className="hidden sm:inline">Rozpocznij 7-dniowy okres próbny</span>
                <span className="sm:hidden">Rozpocznij okres próbny</span>
              </>
            )}
          </button>
        </motion.div>
      ) : (
        /* Aktywna subskrypcja */
        <div className="space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">{subscription.subscription_plans?.name || 'Plan Pro'}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  {getStatusBadge(subscription.status)}
                  {subscription.status === 'TRIALING' && (
                    <span className="text-xs sm:text-sm text-[var(--text-muted)]">
                      Pozostało {remainingTrialDays} {remainingTrialDays === 1 ? 'dzień' : 'dni'}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-emerald-500">
                  {subscription.subscription_plans?.priceMonthly || '79.99'} {subscription.subscription_plans?.currency || 'PLN'}
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)]">miesięcznie</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              <div className="bg-[var(--bg-primary)]/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Rozpoczęcie okresu</span>
                </div>
                <div className="text-[var(--text-primary)] font-semibold">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString('pl-PL')}
                </div>
              </div>
              <div className="bg-[var(--bg-primary)]/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Koniec okresu</span>
                </div>
                <div className="text-[var(--text-primary)] font-semibold">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('pl-PL')}
                </div>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-yellow-400 font-semibold">Subskrypcja zostanie anulowana</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Twoja subskrypcja wygaśnie {new Date(subscription.currentPeriodEnd).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Przycisk zmiany planu */}
              <button
                onClick={() => setShowChangePlanModal(true)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Zmień plan
              </button>

              <button
                onClick={handleManageBilling}
                disabled={actionLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span className="hidden sm:inline">Zarządzaj płatnościami</span>
                    <span className="sm:hidden">Płatności</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              {subscription.cancelAtPeriodEnd ? (
                <button
                  onClick={handleResumeSubscription}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-[var(--text-primary)] font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Wznów subskrypcję
                </button>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Anuluj subskrypcję
                </button>
              )}
            </div>
          </motion.div>

          {/* Payment Methods */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <PaymentMethodManager
                customerId={subscription.stripeCustomerId}
                onUpdate={fetchSubscriptionData}
              />
            </motion.div>
          )}

          {/* Invoices */}
          {invoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10"
            >
              <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Historia faktur
              </h4>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-[var(--bg-primary)]/50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="text-[var(--text-primary)] font-semibold">
                        {invoice.amount} {invoice.currency}
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {new Date(invoice.createdAt).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          invoice.status === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-[var(--text-muted)]'
                        }`}
                      >
                        {invoice.status === 'paid' ? 'Opłacona' : 'Oczekująca'}
                      </span>
                      {invoice.invoicePdf && (
                        <a
                          href={invoice.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 hover:text-emerald-500/80 transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Modal zmiany planu */}
      <ChangePlanModal
        isOpen={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        currentPlanSlug={subscription?.subscription_plans?.features?.slug || 'pro'}
        onPlanChanged={fetchSubscriptionData}
      />
    </div>
  );
}
