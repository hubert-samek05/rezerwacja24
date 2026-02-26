'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Zap,
  Shield,
  CreditCard,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';
import { toast } from 'react-hot-toast';

// Wykryj domenę
function detectDomain() {
  if (typeof window === 'undefined') {
    return { isEnglish: false, apiUrl: 'https://api.rezerwacja24.pl' }
  }
  const hostname = window.location.hostname
  const isEnglish = hostname.includes('bookings24.eu')
  return {
    isEnglish,
    apiUrl: isEnglish ? 'https://api.bookings24.eu' : hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEnglish, setIsEnglish] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://api.rezerwacja24.pl');
  const [isClient, setIsClient] = useState(false);
  
  // Wykryj domenę po stronie klienta
  useEffect(() => {
    const { isEnglish: isEn, apiUrl: api } = detectDomain();
    setIsEnglish(isEn);
    setApiUrl(api);
    setIsClient(true);
  }, []);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusChecked, setStatusChecked] = useState(false); // WAŻNE: blokuje StripeCheckoutForm
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isPastDue, setIsPastDue] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndSubscription = async () => {
      // Pobierz dane użytkownika z localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        // Jeśli brak użytkownika, przekieruj do logowania
        router.push('/login');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Sprawdź czy użytkownik już ma subskrypcję
      try {
        // Pobierz token i tenantId z różnych źródeł
        let token = localStorage.getItem('token');
        let tenantId: string | null = null;
        
        // TenantId jest w obiekcie user, nie jako osobny klucz
        if (parsedUser?.tenantId) {
          tenantId = parsedUser.tenantId;
        }
        
        // Fallback do localStorage
        if (!tenantId) {
          tenantId = localStorage.getItem('tenantId');
        }
        
        // Jeśli nie ma tokena, spróbuj z rezerwacja24_session
        if (!token) {
          const session = localStorage.getItem('rezerwacja24_session');
          if (session) {
            const parsed = JSON.parse(session);
            token = parsed.token;
            if (!tenantId) {
              tenantId = parsed.tenantId;
            }
          }
        }
        
        console.log('🔐 Token:', token ? 'OK' : 'BRAK', 'TenantId:', tenantId);
        
        if (token && tenantId) {
          const currentApiUrl = detectDomain().apiUrl;
          
          console.log('🔍 Sprawdzam status subskrypcji dla tenantId:', tenantId);
          
          const response = await fetch(`${currentApiUrl}/api/billing/subscription/status`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-tenant-id': tenantId,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Status subskrypcji:', data);
            
            // Sprawdź czy konto jest zawieszone lub subskrypcja wygasła
            if (data.isSuspended || data.isSubscriptionExpired || data.isPastDue || data.isCancelled || data.status === 'PAST_DUE' || data.status === 'CANCELLED') {
              console.log('⚠️ Konto zawieszone lub subskrypcja wymaga odnowienia:', data.status, 'isSuspended:', data.isSuspended);
              setIsPastDue(true); // Używamy tego samego stanu dla obu przypadków
              setPaymentError(data.suspendedReason || data.lastPaymentError || 'Subskrypcja wygasła - odnów aby kontynuować');
              setLoading(false);
              setStatusChecked(true); // Pozwól na wyświetlenie formularza płatności
              return;
            }
            
            // Jeśli ma aktywną subskrypcję (ACTIVE lub TRIALING) - przekieruj do dashboard
            if (data.hasActiveSubscription || data.status === 'ACTIVE' || data.status === 'TRIALING') {
              console.log('✅ Użytkownik już ma subskrypcję, przekierowanie do dashboard');
              setHasSubscription(true);
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1500);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Błąd sprawdzania subskrypcji:', err);
      }
      
      setStatusChecked(true); // Status sprawdzony - teraz można renderować StripeCheckoutForm
      setLoading(false);
    };
    
    checkUserAndSubscription();
  }, [router]);

  const handleSuccess = () => {
    toast.success(isEnglish ? 'Subscription activated! 🎉' : 'Subskrypcja została aktywowana! 🎉');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const redirectToBillingPortal = async () => {
    try {
      // Pobierz token i tenantId z różnych źródeł
      let token = localStorage.getItem('token');
      let tenantId: string | null = null;
      
      // TenantId z obiektu user
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        tenantId = parsedUser.tenantId;
      }
      
      // Fallback do rezerwacja24_session
      if (!token) {
        const session = localStorage.getItem('rezerwacja24_session');
        if (session) {
          const parsed = JSON.parse(session);
          token = parsed.token;
          if (!tenantId) {
            tenantId = parsed.tenantId;
          }
        }
      }
      
      if (!token || !tenantId) {
        toast.error(isEnglish ? 'Session expired. Please log in again.' : 'Sesja wygasła. Zaloguj się ponownie.');
        router.push('/login');
        return;
      }

      const currentApiUrl = detectDomain().apiUrl;

      const response = await fetch(`${currentApiUrl}/api/billing/portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });

      if (!response.ok) {
        throw new Error(isEnglish ? 'Failed to create payment session' : 'Nie udało się utworzyć sesji płatności');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error opening payment portal:', err);
      toast.error(err.message || (isEnglish ? 'An error occurred' : 'Wystąpił błąd'));
    }
  };

  // Warunkowe returny - po wszystkich hookach
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-primary)]">{isEnglish ? 'Loading...' : 'Ładowanie...'}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Jeśli użytkownik już ma subskrypcję - pokaż komunikat
  if (hasSubscription) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-[var(--bg-card)] backdrop-blur-sm rounded-2xl p-8 border border-[var(--border-color)] shadow-lg">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{isEnglish ? 'You already have an active subscription!' : 'Masz już aktywną subskrypcję!'}</h2>
            <p className="text-[var(--text-secondary)] mb-6">{isEnglish ? 'Redirecting to dashboard...' : 'Przekierowywanie do panelu...'}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Jeśli subskrypcja jest PAST_DUE - pokaż komunikat o nieudanej płatności
  if (isPastDue) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-[var(--bg-card)] backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 shadow-lg">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 text-center">
              {isEnglish ? 'Payment issue' : 'Problem z płatnością'}
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 text-center">
              {isEnglish ? 'We could not process your subscription payment. Please update your payment method to restore full access.' : 'Nie udało się pobrać płatności za Twoją subskrypcję. Zaktualizuj metodę płatności, aby przywrócić pełny dostęp.'}
            </p>
            
            {paymentError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-500 text-sm text-center">{paymentError}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={redirectToBillingPortal}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {isEnglish ? 'Update payment method' : 'Zaktualizuj metodę płatności'}
              </button>

              <button
                onClick={() => {
                  // Wyloguj użytkownika
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('rezerwacja24_session');
                  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  router.push('/login');
                }}
                className="w-full text-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {isEnglish ? 'Log out' : 'Wyloguj się'}
              </button>
            </div>

            <p className="text-[var(--text-muted)] text-xs text-center mt-6">
              {isEnglish ? 'Need help? Contact us: support@bookings24.eu' : 'Potrzebujesz pomocy? Napisz do nas: kontakt@rezerwacja24.pl'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6"
          >
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4"
          >
            {isEnglish ? 'Welcome to Bookings24! 🎉' : 'Witaj w Rezerwacja24! 🎉'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-[var(--text-secondary)]"
          >
            {isEnglish ? 'Start your 7-day free trial' : 'Rozpocznij 7-dniowy okres próbny za darmo'}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-[#0B2E23] to-[#0F6048] rounded-2xl p-8 border border-emerald-500/30">
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-6xl font-bold text-[#41FFBC]">{isEnglish ? '€19.99' : '79,99 zł'}</span>
                <span className="text-2xl text-gray-300">{isEnglish ? '/month' : '/miesiąc'}</span>
              </div>
              <p className="text-center text-gray-300 text-lg mb-6">
                {isEnglish ? 'After the trial period' : 'Po zakończeniu okresu próbnego'}
              </p>
              <div className="flex items-center justify-center gap-2 text-[#41FFBC] font-semibold">
                <Calendar className="w-5 h-5" />
                <span>{isEnglish ? '7 days free - no commitment' : '7 dni za darmo - bez zobowiązań'}</span>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-[var(--bg-card)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border-color)] shadow-lg">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{isEnglish ? 'What you get:' : 'Co otrzymujesz:'}</h3>
              <div className="space-y-3">
                {(isEnglish ? [
                  'Unlimited bookings and employees',
                  '500 SMS per month',
                  'Google Calendar and iOS integration',
                  'Advanced analytics and reports',
                  'Automations and marketing campaigns',
                  'White-label branding',
                  'Custom subdomain',
                  'API access',
                  'Priority chat support',
                ] : [
                  'Nielimitowane rezerwacje i pracownicy',
                  '500 SMS miesięcznie',
                  'Integracja z Google Calendar i iOS',
                  'Zaawansowana analityka i raporty',
                  'Automatyzacje i kampanie marketingowe',
                  'White-label branding',
                  'Własna subdomena',
                  'Dostęp do API',
                  'Wsparcie priorytetowe przez chat',
                ]).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-[var(--text-primary)]">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              {(isEnglish ? [
                { icon: Shield, text: 'Secure payments' },
                { icon: Zap, text: 'Instant access' },
                { icon: CreditCard, text: 'Cancel anytime' },
              ] : [
                { icon: Shield, text: 'Bezpieczne płatności' },
                { icon: Zap, text: 'Natychmiastowy dostęp' },
                { icon: CreditCard, text: 'Anuluj w każdej chwili' },
              ]).map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-[var(--bg-card)] rounded-lg p-4 text-center border border-[var(--border-color)] shadow"
                >
                  <badge.icon className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">{badge.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-[var(--bg-card)] backdrop-blur-sm rounded-2xl p-8 border border-[var(--border-color)] shadow-lg sticky top-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {isEnglish ? 'Payment card details' : 'Dane karty płatniczej'}
              </h2>

              {/* WAŻNE: Renderuj StripeCheckoutForm TYLKO gdy status został sprawdzony i nie jest PAST_DUE/CANCELLED */}
              {statusChecked && !isPastDue ? (
                <StripeCheckoutForm
                  email={user.email}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <span className="ml-3 text-[var(--text-muted)]">{isEnglish ? 'Checking status...' : 'Sprawdzanie statusu...'}</span>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
                  <Shield className="w-4 h-4" />
                  <span>{isEnglish ? 'Payments powered by Stripe' : 'Płatności obsługiwane przez Stripe'}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {isEnglish ? 'Your data is secure and encrypted. We do not store card information.' : 'Twoje dane są bezpieczne i szyfrowane. Nie przechowujemy informacji o karcie.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 w-full text-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? 'Skip and go to dashboard' : 'Pomiń i przejdź do panelu'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
