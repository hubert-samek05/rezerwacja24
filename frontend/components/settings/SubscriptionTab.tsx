'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  CheckCircle,
  AlertCircle,
  Calendar,
  Loader2,
  Shield,
  Users,
  MessageSquare,
  RefreshCw,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import StripeProvider from '@/components/billing/StripeProvider';
import StripeCardForm from '@/components/billing/StripeCardForm';
import { useDashboardTranslations } from '@/hooks/useDashboardTranslations';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  features: {
    bookings: number | null;
    employees: number | null;
    sms: number | null;
  };
  isHighlighted?: boolean;
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
  subscription_plans: {
    id: string;
    name: string;
    priceMonthly: number;
    currency: string;
    features: any;
  };
}

interface PaymentMethod {
  id: string;
  type?: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  email?: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  paidAt?: string;
  dueDate?: string;
  createdAt: string;
}

interface UsageStats {
  bookings: { used: number; limit: number | null };
  employees: { used: number; limit: number | null };
  sms: { used: number; limit: number | null };
}

export default function SubscriptionTab() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showCardForm, setShowCardForm] = useState(false);
  const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [billingDataComplete, setBillingDataComplete] = useState(false);
  const [showBillingDataWarning, setShowBillingDataWarning] = useState(false);
  
  const { isSuspended, suspendedReason } = useAccountStatus();
  const { d, isB2B, formatPricePerMonth } = useDashboardTranslations();

  useEffect(() => {
    fetchData();
    checkBillingData();
    fetchInvoices();
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/billing/usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  };

  const checkBillingData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tenant/billing-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const isComplete = data.billingAddress && data.billingCity && data.billingPostalCode &&
          ((data.billingType === 'company' && data.billingCompanyName && data.nip) ||
           (data.billingType === 'individual' && data.billingFirstName && data.billingLastName));
        setBillingDataComplete(isComplete);
      }
    } catch (err) {
      console.error('Error checking billing data:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/billing/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [subRes, plansRes] = await Promise.all([
        fetch('/api/billing/subscription', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/billing/plans'),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.id) {
          setSubscription(subData);
          setSelectedPlanId(subData.planId);
          if (subData.stripePaymentMethodId) {
            fetchPaymentMethod();
          }
        }
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
    } catch (err) {
      setError('Błąd podczas pobierania danych');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethod = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/billing/payment-method', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.paymentMethod) {
          setPaymentMethod(data.paymentMethod);
        }
      }
    } catch (err) {
      console.error('Error fetching payment method:', err);
    }
  };

  const handleAddCard = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/billing/setup-intent', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setSetupIntentSecret(data.clientSecret);
        setShowCardForm(true);
      } else {
        setError('Nie udało się zainicjować formularza karty');
      }
    } catch (err) {
      setError('Wystąpił błąd');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardSuccess = async () => {
    setShowCardForm(false);
    setSetupIntentSecret(null);
    setSuccessMessage('Karta została zapisana pomyślnie');
    fetchPaymentMethod();
    
    // Jeśli jest zaległa płatność, spróbuj ją pobrać automatycznie
    if (subscription?.status === 'PAST_DUE') {
      setSuccessMessage('Karta zapisana. Próbuję pobrać zaległą płatność...');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/billing/retry-payment', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSuccessMessage('Płatność pobrana pomyślnie! Subskrypcja została odnowiona.');
            fetchData(); // Odśwież dane subskrypcji
          } else {
            setError(data.message || 'Nie udało się pobrać płatności. Spróbuj ponownie lub skontaktuj się z obsługą.');
          }
        } else {
          const data = await res.json();
          setError(data.message || 'Nie udało się pobrać płatności');
        }
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania płatności');
      }
    }
    
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleChangePlan = async (planId: string) => {
    if (planId === subscription?.subscription_plans?.id) return;
    
    if (!billingDataComplete) {
      setShowBillingDataWarning(true);
      return;
    }
    
    try {
      setChangingPlan(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/billing/plan/change', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccessMessage('Plan został zmieniony pomyślnie');
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Nie udało się zmienić planu');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas zmiany planu');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Czy na pewno chcesz anulować subskrypcję?\n\nDostęp zostanie zachowany do końca opłaconego okresu rozliczeniowego. Po tym czasie Twoje konto zostanie zablokowane.\n\nMożesz w każdej chwili wznowić subskrypcję przed końcem okresu.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/billing/subscription/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccessMessage('Subskrypcja zostanie anulowana na koniec okresu rozliczeniowego');
        fetchData();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError('Nie udało się anulować subskrypcji');
      }
    } catch (err) {
      setError('Wystąpił błąd');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/billing/subscription/resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccessMessage('Subskrypcja została wznowiona');
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Nie udało się wznowić subskrypcji');
      }
    } catch (err) {
      setError('Wystąpił błąd');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null || limit === -1) return 'Bez limitu';
    if (limit === 0) return 'Brak';
    return limit.toString();
  };

  const getUsagePercent = (used: number, limit: number | null) => {
    if (limit === null || limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    const end = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = () => {
    if (!subscription) return { label: d.subscriptionData?.incomplete || 'None', color: 'gray' };
    
    switch (subscription.status) {
      case 'ACTIVE':
        return { label: d.subscriptionData?.active || 'Active', color: 'emerald' };
      case 'TRIALING':
        return { label: d.subscriptionData?.trialing || 'Trial', color: 'blue' };
      case 'PAST_DUE':
        return { label: d.subscriptionData?.pastDue || 'Past due', color: 'red' };
      case 'CANCELLED':
        return { label: d.subscriptionData?.cancelled || 'Cancelled', color: 'gray' };
      default:
        return { label: subscription.status, color: 'gray' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-6">
      {/* Alert o zawieszonym koncie */}
      {isSuspended && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                {suspendedReason?.includes('próbn') ? 'Okres próbny zakończony' : 'Konto zawieszone'}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400/80">
                {suspendedReason?.includes('próbn') 
                  ? 'Wybierz plan poniżej, aby kontynuować korzystanie z aplikacji. Twoje dane są bezpieczne.'
                  : suspendedReason || 'Wybierz plan lub zaktualizuj metodę płatności, aby odblokować konto.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Komunikaty błędów */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-400">×</button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-500 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Status subskrypcji - różny wygląd dla Trial vs Aktywna */}
      {subscription && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
          {/* TRIAL - specjalny wygląd */}
          {subscription.status === 'TRIALING' ? (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Okres próbny
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Testujesz wszystkie funkcje za darmo
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-muted)]">Pozostało dni</span>
                  <span className="text-lg font-bold text-blue-500">{daysRemaining}</span>
                </div>
                <div className="h-2 bg-blue-500/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, (daysRemaining / 7) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Kończy się: {formatDate(subscription.trialEnd || subscription.currentPeriodEnd)}
                </p>
              </div>
              
              <p className="text-sm text-[var(--text-secondary)]">
                Wybierz plan poniżej, aby kontynuować po zakończeniu okresu próbnego.
              </p>
            </div>
          ) : (
            <>
              {/* AKTYWNA SUBSKRYPCJA */}
              <div className="p-5 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      statusInfo.color === 'emerald' ? 'bg-emerald-500/10' :
                      statusInfo.color === 'red' ? 'bg-red-500/10' :
                      'bg-gray-500/10'
                    }`}>
                      {statusInfo.color === 'red' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                          {subscription.subscription_plans?.name?.replace('Plan ', '') || 'Pro'}
                        </h2>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          statusInfo.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                          statusInfo.color === 'red' ? 'bg-red-500/10 text-red-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        {subscription.status === 'PAST_DUE' 
                          ? 'Problem z płatnością'
                          : `Następna płatność: ${formatDate(subscription.currentPeriodEnd)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {formatPricePerMonth(subscription.subscription_plans?.priceMonthly || 0)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">miesięcznie</p>
                  </div>
                </div>
              </div>

              {/* Informacje o okresie - uproszczone na mobile */}
              <div className="grid grid-cols-2 divide-x divide-[var(--border-color)]">
                <div className="p-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Pozostało dni</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{daysRemaining}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Koniec okresu</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Ostrzeżenie o anulowaniu */}
          {subscription.cancelAtPeriodEnd && subscription.status !== 'PAST_DUE' && (
            <div className="p-4 bg-amber-500/10 border-t border-amber-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Subskrypcja zostanie anulowana {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                <button
                  onClick={handleResumeSubscription}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  Wznów
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wykorzystanie limitu */}
      {usage && subscription && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[var(--text-muted)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{d.subscriptionData?.usage || 'Usage this month'}</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Rezerwacje */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{d.subscriptionData?.bookings || 'Bookings'}</span>
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  {usage.bookings.used} / {usage.bookings.limit === null || usage.bookings.limit === -1 ? '∞' : usage.bookings.limit}
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    getUsagePercent(usage.bookings.used, usage.bookings.limit) > 90 ? 'bg-red-500' :
                    getUsagePercent(usage.bookings.used, usage.bookings.limit) > 70 ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${getUsagePercent(usage.bookings.used, usage.bookings.limit)}%` }}
                />
              </div>
            </div>

            {/* Pracownicy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{d.subscriptionData?.employees || 'Employees'}</span>
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  {usage.employees.used} / {usage.employees.limit === null || usage.employees.limit === -1 ? '∞' : usage.employees.limit}
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    getUsagePercent(usage.employees.used, usage.employees.limit) > 90 ? 'bg-red-500' :
                    getUsagePercent(usage.employees.used, usage.employees.limit) > 70 ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${getUsagePercent(usage.employees.used, usage.employees.limit)}%` }}
                />
              </div>
            </div>

            {/* SMS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">SMS</span>
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  {usage.sms.used} / {usage.sms.limit === null || usage.sms.limit === -1 ? '∞' : usage.sms.limit}
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    getUsagePercent(usage.sms.used, usage.sms.limit) > 90 ? 'bg-red-500' :
                    getUsagePercent(usage.sms.used, usage.sms.limit) > 70 ? 'bg-amber-500' :
                    'bg-purple-500'
                  }`}
                  style={{ width: `${getUsagePercent(usage.sms.used, usage.sms.limit)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info o fakturze */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{d.billingData?.title || 'Billing Data'}</h3>
            <p className="text-[var(--text-secondary)] mb-3">
              {d.billingData?.description || 'Complete your billing information for invoices.'}
            </p>
            <a
              href="/dashboard/settings?tab=billing-data"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {d.billingData?.saveData || 'Complete billing data'}
            </a>
          </div>
        </div>
      </div>

      {/* Metoda płatności */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{d.subscriptionData?.paymentMethod || 'Payment method'}</h3>
          {paymentMethod && !showCardForm && (
            <button
              onClick={handleAddCard}
              disabled={actionLoading}
              className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
            >
              {d.subscriptionData?.updatePaymentMethod || 'Change card'}
            </button>
          )}
        </div>

        {showCardForm && setupIntentSecret ? (
          <StripeProvider clientSecret={setupIntentSecret}>
            <StripeCardForm
              clientSecret={setupIntentSecret}
              onSuccess={handleCardSuccess}
              onCancel={() => {
                setShowCardForm(false);
                setSetupIntentSecret(null);
              }}
            />
          </StripeProvider>
        ) : paymentMethod ? (
          <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
            <div className={`w-12 h-8 rounded-md flex items-center justify-center ${paymentMethod.type === 'link' ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              {paymentMethod.type === 'link' ? (
                <>
                  <p className="font-medium text-[var(--text-primary)]">
                    Stripe Link
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {paymentMethod.email || 'Połączono'}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-[var(--text-primary)] capitalize">
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {d.subscriptionData?.expires || 'Expires'} {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}
                  </p>
                </>
              )}
            </div>
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)] mb-4">{d.subscriptionData?.noPaymentMethod || 'No payment method saved'}</p>
            <button
              onClick={handleAddCard}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (d.subscriptionData?.addPaymentMethod || 'Add card')}
            </button>
          </div>
        )}
      </div>

      {/* Wybór planu */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{d.subscriptionData?.changePlan || 'Choose plan'}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            // Nie pokazuj "Aktualny plan" jeśli konto jest zawieszone lub trial się skończył
            const hasActiveSubscription = subscription?.status === 'ACTIVE' && !isSuspended;
            const isCurrentPlan = hasActiveSubscription && subscription?.subscription_plans?.id === plan.id;
            const isSelected = selectedPlanId === plan.id;
            
            return (
              <div
                key={plan.id}
                onClick={() => !isCurrentPlan && setSelectedPlanId(plan.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  isCurrentPlan
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : isSelected
                    ? 'border-emerald-500/50 bg-[var(--bg-card)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-color-hover)]'
                }`}
              >
                {isCurrentPlan && (
                  <span className="absolute -top-3 left-4 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                    {d.subscriptionData?.currentPlan || 'Current plan'}
                  </span>
                )}

                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {plan.name.replace('Plan ', '')}
                </h4>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[var(--text-primary)]">
                    {formatPricePerMonth(plan.priceMonthly)}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    {formatLimit(plan.features.bookings)} {d.subscriptionData?.bookingsPerMonth || (isB2B ? 'bookings/mo' : 'rezerwacji/mies.')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Users className="w-4 h-4 text-emerald-500" />
                    {formatLimit(plan.features.employees)} {d.subscriptionData?.employees || (isB2B ? 'employees' : 'pracowników')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    {formatLimit(plan.features.sms)} SMS{d.subscriptionData?.perMonth || (isB2B ? '/mo' : '/mies.')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {d.subscriptionData?.noCommission || (isB2B ? '0% commission' : '0% prowizji')}
                  </li>
                </ul>

                {!isCurrentPlan && isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangePlan(plan.id);
                    }}
                    disabled={changingPlan}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {changingPlan ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        {d.subscriptionData?.switchPlan || (isB2B ? 'Switch to this plan' : 'Zmień na ten plan')}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historia płatności */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{d.subscriptionData?.paymentHistory || (isB2B ? 'Payment history' : 'Historia płatności')}</h3>
        
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--text-muted)]">{d.subscriptionData?.noPaymentHistory || (isB2B ? 'No payment history' : 'Brak historii płatności')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left py-3 px-2 text-sm font-medium text-[var(--text-muted)]">{d.common?.date || 'Data'}</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-[var(--text-muted)]">{d.subscriptionData?.amount || 'Kwota'}</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-[var(--text-muted)]">{d.common?.status || 'Status'}</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-[var(--text-muted)]">{d.subscriptionData?.invoice || 'Faktura'}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="py-3 px-2 text-sm text-[var(--text-primary)]">
                      {new Date(invoice.createdAt).toLocaleDateString(isB2B ? 'en-GB' : 'pl-PL')}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-[var(--text-primary)]">
                      {invoice.amount.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {invoice.status === 'paid' ? (d.subscriptionData?.paid || 'Opłacona') : (d.subscriptionData?.pending || 'Oczekująca')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {invoice.invoicePdf && (
                        <a href={invoice.invoicePdf} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                          {d.common?.download || 'Pobierz'}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Anuluj subskrypcję */}
      {subscription && !subscription.cancelAtPeriodEnd && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{d.subscriptionData?.cancelSubscription || 'Cancel subscription'}</h3>
          <p className="text-[var(--text-muted)] mb-4">
            {isB2B 
              ? `After cancellation, you will retain access until the end of the paid period (${formatDate(subscription.currentPeriodEnd)}). You will not be charged again.`
              : `Po anulowaniu zachowasz dostęp do końca opłaconego okresu (${formatDate(subscription.currentPeriodEnd)}). Nie zostaniesz obciążony kolejną płatnością.`
            }
          </p>
          <button
            onClick={handleCancelSubscription}
            disabled={actionLoading}
            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl transition-colors disabled:opacity-50 border border-red-500/20"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (d.subscriptionData?.cancelSubscription || 'Cancel subscription')}
          </button>
        </div>
      )}

      {/* Modal - Wymagane dane do faktury */}
      {showBillingDataWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {d.billingData?.saveData || 'Uzupełnij dane do faktury'}
              </h3>
            </div>
            
            <p className="text-[var(--text-secondary)] mb-6">
              {d.subscriptionData?.completeBillingFirst || 'Przed zmianą planu musisz uzupełnić swoje dane do faktury.'}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBillingDataWarning(false)}
                className="flex-1 px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
              >
                {d.buttons?.cancel || 'Cancel'}
              </button>
              <a
                href="/dashboard/settings?tab=billing-data"
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center font-medium transition-colors"
              >
                {d.billingData?.completeData || 'Uzupełnij dane'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
