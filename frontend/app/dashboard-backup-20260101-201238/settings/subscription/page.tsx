'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  ExternalLink,
  XCircle,
} from 'lucide-react';

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

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTrialDays, setRemainingTrialDays] = useState(0);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Pobierz token z localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Brak tokena autoryzacji');
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      
      const [subRes, invoicesRes, statusRes] = await Promise.all([
        fetch('/api/billing/subscription', { headers }),
        fetch('/api/billing/invoices', { headers }),
        fetch('/api/billing/subscription/status', { headers }),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        console.log('✅ Subscription response:', subData);
        
        // Backend zwraca { ...subscription, hasSubscription: true } lub { subscription: null, hasSubscription: false }
        if (subData.hasSubscription === true && subData.id) {
          console.log('✅ Subscription found!', subData.id);
          setSubscription(subData);
        } else {
          console.log('❌ No subscription');
          setSubscription(null);
        }
      } else {
        console.log('❌ API error:', subRes.status);
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
      
      // Pobierz email i token z localStorage
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const user = userStr ? JSON.parse(userStr) : null;
      const email = user?.email;
      const tenantId = user?.tenantId;
      
      if (!email) {
        throw new Error('Brak adresu email użytkownika');
      }
      
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }
      
      if (!tenantId) {
        throw new Error('Brak tenant ID');
      }
      
      const response = await fetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, tenantId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Błąd podczas tworzenia sesji checkout');
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('Brak URL do przekierowania');
      }
      
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Błąd podczas rozpoczynania subskrypcji');
      console.error('Checkout error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }
      
      const response = await fetch('/api/billing/portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Błąd podczas tworzenia sesji portalu');

      const data = await response.json();
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Błąd podczas otwierania portalu płatności');
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
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }
      
      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Błąd podczas anulowania subskrypcji');

      await fetchSubscriptionData();
    } catch (err: any) {
      setError(err.message || 'Błąd podczas anulowania subskrypcji');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }
      
      const response = await fetch('/api/billing/subscription/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Błąd podczas wznawiania subskrypcji');

      await fetchSubscriptionData();
    } catch (err: any) {
      setError(err.message || 'Błąd podczas wznawiania subskrypcji');
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
      CANCELLED: { text: 'Anulowana', color: 'bg-gray-500/20 text-gray-400', icon: XCircle },
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#41FFBC]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subskrypcja</h1>
          <p className="text-gray-400">Zarządzaj swoją subskrypcją i płatnościami</p>
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

        {(!subscription || subscription === null) ? (
          /* Brak subskrypcji - pokaż plan */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#0B2E23] to-[#0F6048] rounded-2xl p-8 border border-[#41FFBC]/20"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Plan Pro</h2>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-6xl font-bold text-[#41FFBC]">79,99 zł</span>
                <span className="text-2xl text-gray-300">/miesiąc</span>
              </div>
              <p className="text-xl text-gray-300 mb-2">Pełny dostęp do wszystkich funkcji</p>
              <p className="text-lg text-[#41FFBC] font-semibold">7 dni okresu próbnego za darmo</p>
              <p className="text-sm text-gray-400 mt-2">Wymagana karta płatnicza</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
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
                'Wsparcie priorytetowe przez chat',
                'Aplikacja mobilna - już niebawem!',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#41FFBC] flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartSubscription}
              disabled={actionLoading}
              className="w-full bg-[#41FFBC] hover:bg-[#41FFBC]/90 text-[#0A0A0A] font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Rozpocznij 7-dniowy okres próbny
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
              className="bg-[#0B2E23]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#41FFBC]/20"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{subscription.subscription_plans?.name || 'Plan Pro'}</h2>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(subscription.status)}
                    {subscription.status === 'TRIALING' && (
                      <span className="text-sm text-gray-400">
                        Pozostało {remainingTrialDays} {remainingTrialDays === 1 ? 'dzień' : 'dni'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#41FFBC]">
                    {subscription.subscription_plans?.priceMonthly || '79.99'} {subscription.subscription_plans?.currency || 'PLN'}
                  </div>
                  <div className="text-sm text-gray-400">miesięcznie</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0A0A0A]/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Rozpoczęcie okresu</span>
                  </div>
                  <div className="text-white font-semibold">
                    {subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart).toLocaleDateString('pl-PL') : 'Brak danych'}
                  </div>
                </div>
                <div className="bg-[#0A0A0A]/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Koniec okresu</span>
                  </div>
                  <div className="text-white font-semibold">
                    {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pl-PL') : 'Brak danych'}
                  </div>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-semibold">Subskrypcja zostanie anulowana</p>
                      <p className="text-sm text-gray-400">
                        Twoja subskrypcja wygaśnie {new Date(subscription.currentPeriodEnd).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading}
                  className="flex-1 bg-[#0F6048] hover:bg-[#0F6048]/80 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Zarządzaj płatnościami
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>

                {subscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleResumeSubscription}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Wznów subskrypcję
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anuluj subskrypcję
                  </button>
                )}
              </div>
            </motion.div>

            {/* Invoices */}
            {invoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0B2E23]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#41FFBC]/20"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Historia faktur
                </h3>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="bg-[#0A0A0A]/50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-white font-semibold">
                          {invoice.amount} {invoice.currency}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(invoice.createdAt).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            invoice.status === 'paid'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {invoice.status === 'paid' ? 'Opłacona' : 'Oczekująca'}
                        </span>
                        {invoice.invoicePdf && (
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#41FFBC] hover:text-[#41FFBC]/80 transition-colors"
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
      </div>
    </div>
  );
}
