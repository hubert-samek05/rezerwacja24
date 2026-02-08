'use client'

import Image from 'next/image'
import Link from 'next/link'

interface AccountSuspendedModalProps {
  isOpen: boolean
  reason?: string | null
  subscriptionStatus?: string | null
  onClose?: () => void
}

export default function AccountSuspendedModal({ isOpen, reason, subscriptionStatus, onClose }: AccountSuspendedModalProps) {
  if (!isOpen) return null

  // Określ typ blokady
  const isTrialExpired = reason?.toLowerCase().includes('trial') || reason?.toLowerCase().includes('próbn')
  const isPaymentFailed = reason?.toLowerCase().includes('płatność') || reason?.toLowerCase().includes('payment') || reason?.toLowerCase().includes('nieudana')
  const isSubscriptionCancelled = subscriptionStatus === 'CANCELLED' || reason?.toLowerCase().includes('anulowana')
  const isSubscriptionExpired = subscriptionStatus === 'PAST_DUE' || (reason?.toLowerCase().includes('wygasł') && !isTrialExpired)
  
  // Czy to powracający użytkownik (miał już subskrypcję)
  const isReturningUser = isSubscriptionCancelled || isSubscriptionExpired || isPaymentFailed

  // ============================================
  // WARIANT 1: TRIAL WYGASŁ (pierwszy raz)
  // ============================================
  if (isTrialExpired && !isReturningUser) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Ilustracja */}
          <div className="relative h-48 bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                <circle cx="50" cy="50" r="80" fill="url(#grad1)" opacity="0.3"/>
                <circle cx="350" cy="150" r="100" fill="url(#grad2)" opacity="0.3"/>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#14b8a6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Image src="/app-icon-512.png" alt="Rezerwacja24" width={48} height={48} className="w-12 h-12 rounded-xl" />
              </div>
              <p className="text-teal-600 font-medium text-sm">Rezerwacja24</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Dziękujemy za wypróbowanie!
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Twój okres próbny dobiegł końca. Mamy nadzieję, że Rezerwacja24 
              przypadła Ci do gustu. Wybierz plan i zarządzaj rezerwacjami bez ograniczeń.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-gray-500 text-sm">
                Wszystkie Twoje dane zostały zachowane i czekają na Ciebie.
              </p>
            </div>

            <Link
              href="/dashboard/settings?tab=subscription"
              className="block w-full py-4 px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors"
            >
              Wybierz plan
            </Link>
            
            <p className="text-gray-400 text-sm mt-6">
              Masz pytania? Napisz do nas na{' '}
              <a href="mailto:kontakt@rezerwacja24.pl" className="text-teal-500 hover:underline">
                kontakt@rezerwacja24.pl
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // WARIANT 2: PŁATNOŚĆ NIEUDANA
  // ============================================
  if (isPaymentFailed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Ilustracja */}
          <div className="relative h-48 bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                <circle cx="50" cy="50" r="80" fill="url(#gradRed1)" opacity="0.3"/>
                <circle cx="350" cy="150" r="100" fill="url(#gradRed2)" opacity="0.3"/>
                <defs>
                  <linearGradient id="gradRed1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e"/>
                    <stop offset="100%" stopColor="#ef4444"/>
                  </linearGradient>
                  <linearGradient id="gradRed2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444"/>
                    <stop offset="100%" stopColor="#f43f5e"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ups, coś poszło nie tak
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Nie udało nam się pobrać płatności za Twoją subskrypcję. 
              Sprawdź dane karty lub dodaj nową metodę płatności.
            </p>
            
            <div className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-100">
              <p className="text-red-600 text-sm">
                Twoje dane są bezpieczne. Po aktualizacji płatności wszystko wróci do normy.
              </p>
            </div>

            <Link
              href="/dashboard/settings?tab=subscription"
              className="block w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
            >
              Zaktualizuj płatność
            </Link>
            
            <p className="text-gray-400 text-sm mt-6">
              Potrzebujesz pomocy?{' '}
              <a href="mailto:kontakt@rezerwacja24.pl" className="text-red-500 hover:underline">
                Napisz do nas
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // WARIANT 3: SUBSKRYPCJA WYGASŁA / ANULOWANA
  // ============================================
  if (isSubscriptionExpired || isSubscriptionCancelled || isReturningUser) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Ilustracja */}
          <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                <circle cx="50" cy="50" r="80" fill="url(#gradAmber1)" opacity="0.3"/>
                <circle cx="350" cy="150" r="100" fill="url(#gradAmber2)" opacity="0.3"/>
                <defs>
                  <linearGradient id="gradAmber1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b"/>
                    <stop offset="100%" stopColor="#f97316"/>
                  </linearGradient>
                  <linearGradient id="gradAmber2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316"/>
                    <stop offset="100%" stopColor="#f59e0b"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Image src="/app-icon-512.png" alt="Rezerwacja24" width={48} height={48} className="w-12 h-12 rounded-xl" />
              </div>
              <p className="text-amber-600 font-medium text-sm">Rezerwacja24</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Miło Cię znowu widzieć!
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Twoja subskrypcja wygasła, ale wszystkie dane czekają na Ciebie. 
              Odnów subskrypcję i wróć do zarządzania rezerwacjami.
            </p>
            
            <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-100">
              <p className="text-amber-700 text-sm">
                Twoi klienci, rezerwacje i ustawienia są bezpieczne.
              </p>
            </div>

            <Link
              href="/dashboard/settings?tab=subscription"
              className="block w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Odnów subskrypcję
            </Link>
            
            <p className="text-gray-400 text-sm mt-6">
              Masz pytania?{' '}
              <a href="mailto:kontakt@rezerwacja24.pl" className="text-amber-500 hover:underline">
                Chętnie pomożemy
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // WARIANT DOMYŚLNY: KONTO ZAWIESZONE
  // ============================================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Ilustracja */}
        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
          <div className="relative text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <Image src="/app-icon-512.png" alt="Rezerwacja24" width={40} height={40} className="w-10 h-10 rounded-lg" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Konto tymczasowo zawieszone
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {reason || 'Skontaktuj się z nami, aby dowiedzieć się więcej.'}
          </p>

          <Link
            href="/dashboard/settings?tab=subscription"
            className="block w-full py-4 px-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors"
          >
            Przejdź do ustawień
          </Link>
          
          <p className="text-gray-400 text-sm mt-6">
            Potrzebujesz pomocy?{' '}
            <a href="mailto:kontakt@rezerwacja24.pl" className="text-gray-600 hover:underline">
              kontakt@rezerwacja24.pl
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
