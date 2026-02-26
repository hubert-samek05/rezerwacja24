'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Building, CheckCircle, Shield, Star, Users, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { toast } from 'react-hot-toast'
import enAuth from '@/locales/en/auth.json'
import plAuth from '@/locales/pl/auth.json'

type TabType = 'login' | 'register'

// Wykryj domenę i zwróć odpowiednie wartości
function detectDomain() {
  if (typeof window === 'undefined') {
    return { isEnglish: false, mainUrl: 'https://rezerwacja24.pl' }
  }
  const hostname = window.location.hostname
  const isEnglish = hostname.includes('bookings24.eu')
  return {
    isEnglish,
    mainUrl: isEnglish ? 'https://bookings24.eu' : 'https://rezerwacja24.pl'
  }
}

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // Wykryj domenę natychmiast przy renderowaniu
  const domain = detectDomain()
  const isEnglish = domain.isEnglish
  const mainUrl = domain.mainUrl
  const [activeTab, setActiveTab] = useState<TabType>('login')
  
  // Wybierz tłumaczenia na podstawie domeny
  const t = isEnglish ? enAuth : plAuth
  
  // Login state
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [showProfileSelection, setShowProfileSelection] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  
  // Register state
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', businessName: '',
    password: '', confirmPassword: '', acceptTerms: false
  })

  useEffect(() => {
    if (searchParams.get('payment') === 'success') setPaymentSuccess(true)
    if (searchParams.get('tab') === 'register') setActiveTab('register')
  }, [searchParams])

  // Helper do pobierania API URL na podstawie domeny
  const getApiUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3001'
    const hostname = window.location.hostname
    if (hostname.includes('bookings24.eu')) return 'https://api.bookings24.eu'
    if (hostname.includes('rezerwacja24.pl')) return 'https://api.rezerwacja24.pl'
    return 'http://localhost:3001'
  }

  // Login handler
  const handleLogin = async (e: React.FormEvent, profileType?: 'owner' | 'employee') => {
    e.preventDefault()
    setIsLoading(true)
    // Nie czyść localStorage - zachowaj sesję dla aplikacji mobilnej
    if (typeof window !== 'undefined' && !profileType) { 
      // Usuń tylko dane sesji, nie wszystko
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('rezerwacja24_session')
      localStorage.removeItem('employee_user')
      sessionStorage.clear() 
    }
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, profileType }),
      })
      if (response.ok) {
        const data = await response.json()
        // Wybór profilu
        if (data.requiresProfileSelection) {
          setProfiles(data.profiles)
          setShowProfileSelection(true)
          setIsLoading(false)
          return
        }
        if (data.requiresTwoFactor) { setTempToken(data.tempToken); setShow2FA(true); setIsLoading(false); return }
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Zapisz sesję dla aplikacji mobilnej (persistent login)
        localStorage.setItem('rezerwacja24_session', JSON.stringify({
          token: data.access_token,
          user: data.user,
          firstName: data.user.firstName,
          role: data.user.role,
          tenantId: data.user.tenantId,
          loginTime: new Date().toISOString()
        }))
        // Set token in cookie - MUST wait before redirect
        await fetch('/api/auth/set-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: data.access_token }) })
        // Redirect based on role and permissions
        if (data.user.role === 'SUPER_ADMIN') {
          router.push('/admin')
        } else if (data.user.role === 'EMPLOYEE' || data.user.type === 'employee') {
          // Sprawdź uprawnienia pracownika - jeśli ma rozszerzone uprawnienia, idź do dashboard
          const perms = Array.isArray(data.user.permissions) ? data.user.permissions[0] : data.user.permissions
          const hasExtendedAccess = perms && (
            !perms.onlyOwnCalendar || // Ma dostęp do wszystkich kalendarzy
            perms.canViewAnalytics ||  // Ma dostęp do analityki
            perms.canViewEmployees ||  // Ma dostęp do pracowników
            perms.canViewSettings ||   // Ma dostęp do ustawień
            perms.canViewPayments      // Ma dostęp do płatności
          )
          if (hasExtendedAccess) {
            // Menadżer/Recepcja/etc - pełny dashboard
            localStorage.setItem('employee_user', JSON.stringify(data.user))
            router.push('/dashboard')
          } else {
            // Zwykły pracownik - ograniczony panel
            localStorage.setItem('employee_user', JSON.stringify(data.user))
            router.push('/employee')
          }
        } else {
          router.push('/dashboard')
        }
      } else {
        const error = await response.json()
        toast.error(error.message || t.login.invalidCredentials)
        setIsLoading(false)
      }
    } catch (error) { 
      console.error('Login error:', error);
      toast.error(t.login.connectionError); 
      setIsLoading(false) 
    }
  }

  // Wybór profilu
  const handleSelectProfile = async (profileType: 'owner' | 'employee') => {
    setShowProfileSelection(false)
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent
    await handleLogin(fakeEvent, profileType)
  }

  // 2FA handler
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/2fa/verify-login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: twoFactorCode }),
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Set token in cookie - MUST wait before redirect
        await fetch('/api/auth/set-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: data.access_token }) })
        router.push(data.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || t.twoFactor.invalidCode)
        setIsLoading(false)
      }
    } catch (error) { toast.error(t.twoFactor.verificationError); setIsLoading(false) }
  }

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) { toast.error(t.register.passwordMismatch); return }
    if (!formData.acceptTerms) { toast.error(t.register.acceptTermsRequired); return }
    setIsLoading(true)
    try {
      // Pobierz plan z URL jeśli istnieje
      const planFromUrl = searchParams.get('plan')
      const response = await authApi.register({
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, businessName: formData.businessName, password: formData.password,
        plan: planFromUrl || undefined,
      })
      localStorage.clear()
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      // Oznacz jako nowe konto - pokaże wizard onboardingowy
      localStorage.setItem('rezerwacja24_is_new_account', 'true')
      fetch('/api/auth/set-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: response.access_token }) })
      toast.success(t.register.success)
      router.push('/subscription/checkout')
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.register.error)
    } finally { setIsLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGoogleAuth = () => {
    const apiUrl = getApiUrl()
    // Wykryj czy to aplikacja mobilna (Capacitor)
    const isMobileApp = typeof window !== 'undefined' && 
      (window.navigator.userAgent.includes('Rezerwacja24App') || 
       (window as any).Capacitor?.isNativePlatform?.())
    
    if (isMobileApp) {
      // Dla aplikacji mobilnej - przekaż redirect_uri jako HTTPS URL który jest zarejestrowany jako deep link
      // AndroidManifest.xml ma intent-filter dla https://app.rezerwacja24.pl/auth/callback
      const stateData = {
        redirect_uri: 'https://app.rezerwacja24.pl/auth/callback',
        mobile: true
      }
      const state = btoa(JSON.stringify(stateData))
      // Otwórz w zewnętrznej przeglądarce systemowej
      const authUrl = `${apiUrl}/api/auth/google?state=${state}`
      
      // Użyj Capacitor Browser plugin jeśli dostępny, inaczej window.open
      const Browser = (window as any).Capacitor?.Plugins?.Browser
      if (Browser) {
        Browser.open({ url: authUrl, windowName: '_system' })
      } else {
        window.open(authUrl, '_system')
      }
    } else {
      // Dla przeglądarki - standardowe przekierowanie
      window.location.href = `${apiUrl}/api/auth/google`
    }
  }

  const handleAppleAuth = async () => {
    const apiUrl = getApiUrl()
    
    // Wykryj czy to aplikacja mobilna iOS (Capacitor) - sprawdź różne metody
    const Capacitor = (window as any).Capacitor
    const userAgent = navigator.userAgent || ''
    const isCapacitorNative = Capacitor?.isNativePlatform?.() === true
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isInWebView = userAgent.includes('Rezerwacja24App') || (window as any).webkit?.messageHandlers
    const isNativeIOS = isCapacitorNative && Capacitor?.getPlatform?.() === 'ios'
    
    console.log('[Apple Auth] Detection:', { isCapacitorNative, isIOSDevice, isIPad, isInWebView, isNativeIOS, userAgent, platform: navigator.platform })
    
    // Próbuj użyć natywnego Sign in with Apple jeśli dostępny (działa na iPhone i iPad)
    if (isNativeIOS) {
      try {
        setIsLoading(true)
        console.log('[Apple Auth] Attempting native Capacitor plugin on', isIPad ? 'iPad' : 'iPhone')
        
        // Dynamiczny import - może nie być dostępny
        let SignInWithApple: any
        try {
          const module = await import('@capacitor-community/apple-sign-in')
          SignInWithApple = module.SignInWithApple
        } catch (importError) {
          console.error('[Apple Auth] Failed to import SignInWithApple plugin:', importError)
          throw new Error('Plugin not available')
        }
        
        // Sprawdź czy plugin jest dostępny
        if (!SignInWithApple || !SignInWithApple.authorize) {
          console.error('[Apple Auth] SignInWithApple plugin not properly initialized')
          throw new Error('Plugin not initialized')
        }
        
        console.log('[Apple Auth] Calling SignInWithApple.authorize...')
        
        // WAŻNE: Dla natywnego iOS używamy Bundle ID aplikacji (pl.rezerwacja24.app)
        // NIE Services ID (pl.rezerwacja24.auth.web) - to jest dla web OAuth
        const result = await SignInWithApple.authorize({
          clientId: 'pl.rezerwacja24.app', // Bundle ID dla natywnego iOS
          redirectURI: 'https://api.rezerwacja24.pl/api/auth/apple/callback',
          scopes: 'email name',
          state: isIPad ? 'native_ipad' : 'native_iphone',
          nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        })
        
        console.log('[Apple Auth] Native result received:', {
          hasIdentityToken: !!result?.response?.identityToken,
          hasAuthCode: !!result?.response?.authorizationCode,
          hasEmail: !!result?.response?.email,
          user: result?.response?.user
        })
        
        // Walidacja odpowiedzi
        if (!result?.response?.identityToken) {
          console.error('[Apple Auth] No identity token in response')
          throw new Error('No identity token received from Apple')
        }
        
        // Wyślij dane do backendu
        console.log('[Apple Auth] Sending to backend...')
        const response = await fetch(`${apiUrl}/api/auth/apple/native`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identityToken: result.response.identityToken,
            authorizationCode: result.response.authorizationCode,
            user: result.response.user,
            email: result.response.email,
            givenName: result.response.givenName,
            familyName: result.response.familyName,
            deviceType: isIPad ? 'ipad' : 'iphone',
          }),
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Apple Auth] Backend error:', response.status, errorText)
          let errorMessage = 'Błąd logowania przez Apple'
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || errorMessage
          } catch (e) {}
          toast.error(errorMessage)
          throw new Error(`Backend error: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('[Apple Auth] Backend success, user:', data.user?.email)
        
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Zapisz sesję
        localStorage.setItem('rezerwacja24_session', JSON.stringify({
          token: data.access_token,
          user: data.user,
          firstName: data.user.firstName,
          role: data.user.role,
          tenantId: data.user.tenantId,
          loginTime: new Date().toISOString()
        }))
        
        await fetch('/api/auth/set-token', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ token: data.access_token }) 
        })
        
        toast.success(isEnglish ? 'Logged in successfully!' : 'Zalogowano pomyślnie!')
        router.push('/dashboard')
      } catch (error: any) {
        console.error('[Apple Auth] Native error:', error?.message || error)
        setIsLoading(false)
        
        // Sprawdź czy użytkownik anulował
        const errorMessage = error?.message || String(error) || ''
        const isCancelled = errorMessage.includes('cancel') || 
                           errorMessage.includes('Cancel') ||
                           errorMessage.includes('1001') || // ASAuthorizationError.canceled
                           errorMessage.includes('user denied')
        
        if (isCancelled) {
          console.log('[Apple Auth] User cancelled')
          return // Nie pokazuj błędu przy anulowaniu
        }
        
        // Dla innych błędów - pokaż komunikat i NIE rób fallback do web
        // (web OAuth nie zadziała lepiej jeśli natywny nie działa)
        console.error('[Apple Auth] Error details:', {
          message: errorMessage,
          name: error?.name,
          code: error?.code
        })
        
        // Pokaż użytkownikowi konkretny błąd
        if (errorMessage.includes('Plugin not')) {
          toast.error(isEnglish ? 'Apple Sign In not available. Please update the app.' : 'Logowanie Apple niedostępne. Zaktualizuj aplikację.')
        } else if (errorMessage.includes('Backend error')) {
          // Błąd już pokazany wyżej
        } else {
          toast.error(isEnglish ? 'Apple Sign In failed. Please try again.' : 'Logowanie Apple nie powiodło się. Spróbuj ponownie.')
        }
      } finally {
        setIsLoading(false)
      }
    } else {
      // Dla przeglądarki lub gdy natywny plugin niedostępny - standardowe przekierowanie OAuth
      console.log('[Apple Auth] Using web OAuth redirect (not native iOS)')
      
      // Dla iOS w WebView - otwórz w zewnętrznej przeglądarce
      if (isIOSDevice && isInWebView) {
        console.log('[Apple Auth] iOS WebView detected, trying Browser plugin')
        const Browser = Capacitor?.Plugins?.Browser
        if (Browser) {
          try {
            await Browser.open({ url: `${apiUrl}/api/auth/apple`, windowName: '_system' })
            return
          } catch (e) {
            console.log('[Apple Auth] Browser plugin failed:', e)
          }
        }
      }
      
      // Standardowe przekierowanie
      window.location.href = `${apiUrl}/api/auth/apple`
    }
  }

  const testimonial = isEnglish ? {
    quote: "Bookings24 transformed how we manage appointments. Our no-show rate dropped by 60% and clients love the easy booking process.",
    author: "Sarah Johnson",
    role: "Owner, Beauty Studio London",
    avatar: "SJ"
  } : {
    quote: "Rezerwacja24 całkowicie zmieniła sposób, w jaki zarządzamy wizytami. Liczba nieobecności spadła o 60%, a klienci uwielbiają łatwy proces rezerwacji.",
    author: "Anna Kowalska",
    role: "Właścicielka, Studio Urody Kraków",
    avatar: "AK"
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image with overlay */}
      <div 
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative"
        style={{
          backgroundImage: 'url(/auth-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div>
            <Link href={mainUrl}>
              <Image 
                src={isEnglish ? '/logo-en.png' : '/logo.png'} 
                alt={isEnglish ? 'Bookings24' : 'Rezerwacja24'} 
                width={200} 
                height={60} 
                className="h-10 w-auto brightness-0 invert" 
                priority 
              />
            </Link>
          </div>
          
          {/* Main content */}
          <div className="space-y-6">
            <h1 className="text-3xl xl:text-4xl font-semibold text-white leading-snug max-w-md">
              {isEnglish 
                ? 'You deserve a proper system. No stress, no chaos – more bookings and peace of mind.' 
                : 'Zasługujesz na porządny system. Bez stresu i chaosu – więcej rezerwacji i spokoju.'
              }
            </h1>
            <p className="text-gray-300 text-lg max-w-md">
              {isEnglish 
                ? 'Join over 2,500 businesses already using our platform.'
                : 'Dołącz do ponad 2 500 firm, które już korzystają z naszej platformy.'
              }
            </p>
          </div>
          
          {/* Testimonial - solid dark background */}
          <div className="bg-gray-900/90 rounded-2xl p-6">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-gray-200 text-base leading-relaxed mb-5">
              "{testimonial.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                {testimonial.avatar}
              </div>
              <div>
                <div className="font-medium text-white">{testimonial.author}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div 
        className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-4 py-8 lg:px-6 lg:py-12 relative min-h-screen"
      >
        {/* White background for all devices */}
        <div className="absolute inset-0 bg-white" />
        
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-6">
            <Link href={mainUrl} className="inline-block">
              <Image src={isEnglish ? '/logo-en.png' : '/logo.png'} alt={isEnglish ? 'Bookings24' : 'Rezerwacja24'} width={160} height={48} className="h-9 w-auto mx-auto" priority />
            </Link>
          </div>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="login-header mb-6 text-center md:mb-8 md:text-left"
          >
            <h2 className="login-title text-2xl font-bold text-gray-900">
              {activeTab === 'login' ? t.login.title : t.register.title}
            </h2>
            <p className="login-subtitle mt-1 text-gray-500">
              {activeTab === 'login' ? t.login.subtitle : t.register.subtitle}
            </p>
          </motion.div>

          {/* Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="login-card bg-white md:shadow-gray-200/50 rounded-2xl shadow-2xl md:shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Tabs */}
            <div className="login-tabs flex p-1.5 m-4 md:m-5 rounded-xl bg-gray-50">
              <button
                onClick={() => { setActiveTab('login'); setShow2FA(false) }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'login' 
                    ? 'login-tab-active bg-white text-gray-900 shadow-sm'
                    : 'login-tab-inactive text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.login.tab}
              </button>
              <button
                onClick={() => { setActiveTab('register'); setShow2FA(false) }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'register' 
                    ? 'login-tab-active bg-white text-gray-900 shadow-sm'
                    : 'login-tab-inactive text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.register.tab}
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
              {/* Payment Success */}
              {paymentSuccess && activeTab === 'login' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">{t.paymentSuccess}</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {/* LOGIN TAB */}
                {activeTab === 'login' && (
                  <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
                    {showProfileSelection ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-700" />
                          <div className="text-sm"><p className="font-medium text-blue-800">{isEnglish ? 'Select profile' : 'Wybierz profil'}</p><p className="text-blue-600">{isEnglish ? 'You have multiple accounts' : 'Masz kilka kont powiązanych z tym emailem'}</p></div>
                        </div>
                        <div className="space-y-3">
                          {profiles.map((profile) => (
                            <button
                              key={profile.type}
                              onClick={() => handleSelectProfile(profile.type)}
                              disabled={isLoading || profile.passwordValid === false}
                              className={`w-full p-4 border rounded-xl transition-all text-left flex items-center gap-4 ${
                                profile.passwordValid === false 
                                  ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profile.type === 'owner' ? 'bg-purple-100' : 'bg-teal-100'}`}>
                                {profile.type === 'owner' ? <Building className="w-6 h-6 text-purple-600" /> : <User className="w-6 h-6 text-teal-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{profile.label}</p>
                                <p className="text-sm text-gray-500">{profile.businessName}</p>
                                {profile.employeeName && <p className="text-xs text-gray-400">{profile.employeeName}</p>}
                                {profile.passwordValid === false && (
                                  <p className="text-xs text-red-500 mt-1">{isEnglish ? 'Wrong password for this profile' : 'Nieprawidłowe hasło dla tego profilu'}</p>
                                )}
                              </div>
                              {profile.passwordValid !== false && <ArrowRight className="w-5 h-5 text-gray-400" />}
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={() => { setShowProfileSelection(false); setProfiles([]) }} className="w-full text-sm text-gray-500 hover:text-gray-700">{isEnglish ? 'Back' : 'Wróć'}</button>
                      </div>
                    ) : show2FA ? (
                      <form onSubmit={handleVerify2FA} className="space-y-4">
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center gap-3">
                          <Shield className="w-5 h-5 text-teal-700" />
                          <div className="text-sm"><p className="font-medium text-teal-800">{t.twoFactor.title}</p><p className="text-teal-600">{t.twoFactor.subtitle}</p></div>
                        </div>
                        <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder={t.twoFactor.placeholder} maxLength={6} autoFocus />
                        <button type="submit" disabled={isLoading || twoFactorCode.length !== 6} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all disabled:opacity-50">{isLoading ? t.twoFactor.loading : t.twoFactor.submit}</button>
                        <button type="button" onClick={() => { setShow2FA(false); setTwoFactorCode('') }} className="w-full text-sm text-gray-500 hover:text-gray-700">{t.twoFactor.back}</button>
                      </form>
                    ) : (
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.login.email}</label>
                          <div className="relative">
                            <Mail className="login-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="login-input w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all border border-gray-200 bg-white text-gray-900" placeholder={isEnglish ? 'your@email.com' : 'twoj@email.com'} />
                          </div>
                        </div>
                        <div>
                          <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.login.password}</label>
                          <div className="relative">
                            <Lock className="login-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="login-input w-full pl-11 pr-11 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all border border-gray-200 bg-white text-gray-900" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="login-icon absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Link href="/forgot-password" className="login-link text-sm font-medium text-blue-600 hover:text-blue-700">{t.login.forgotPassword}</Link>
                        </div>
                        <button type="submit" disabled={isLoading} className="login-btn w-full py-3 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-slate-900 hover:bg-slate-800">
                          {isLoading ? t.login.loading : <><span>{t.login.submit}</span><ArrowRight className="w-4 h-4" /></>}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* REGISTER TAB */}
                {activeTab === 'register' && (
                  <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.register.firstName}</label>
                          <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="login-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm border border-gray-200 bg-white text-gray-900" placeholder={isEnglish ? 'John' : 'Jan'} />
                        </div>
                        <div>
                          <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.register.lastName}</label>
                          <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="login-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm border border-gray-200 bg-white text-gray-900" placeholder={isEnglish ? 'Smith' : 'Kowalski'} />
                        </div>
                      </div>
                      <div>
                        <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.register.businessName}</label>
                        <div className="relative">
                          <Building className="login-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input name="businessName" type="text" required value={formData.businessName} onChange={handleChange} className="login-input w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm border border-gray-200 bg-white text-gray-900" placeholder={isEnglish ? 'My Business' : 'Moja Firma'} />
                        </div>
                      </div>
                      <div>
                        <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.register.email}</label>
                        <div className="relative">
                          <Mail className="login-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input name="email" type="email" required value={formData.email} onChange={handleChange} className="login-input w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm border border-gray-200 bg-white text-gray-900" placeholder={isEnglish ? 'your@email.com' : 'twoj@email.com'} />
                        </div>
                      </div>
                      <div>
                        <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.register.password}</label>
                        <div className="relative">
                          <Lock className="login-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="login-input w-full pl-10 pr-10 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm border border-gray-200 bg-white text-gray-900" placeholder={isEnglish ? 'Min. 8 characters' : 'Min. 8 znaków'} minLength={8} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="login-icon absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="login-label block text-sm font-medium mb-1.5 text-gray-700">{t.register.confirmPassword}</label>
                        <div className="relative">
                          <Lock className="login-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className="login-input w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm border border-gray-200 bg-white text-gray-900" placeholder="••••••••" />
                        </div>
                      </div>
                      <label className="flex items-start gap-2 pt-1">
                        <input name="acceptTerms" type="checkbox" required checked={formData.acceptTerms} onChange={handleChange} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-700 focus:ring-teal-500" />
                        <span className="login-label text-xs text-gray-600">{t.register.acceptTerms} <Link href="/terms" className="login-link text-teal-700 hover:underline">{t.register.terms}</Link> {t.register.and} <Link href="/privacy" className="login-link text-teal-700 hover:underline">{t.register.privacy}</Link></span>
                      </label>
                      <button type="submit" disabled={isLoading} className="login-btn w-full py-3 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 bg-slate-900 hover:bg-slate-800">
                        {isLoading ? t.register.loading : <><span>{t.register.submit}</span><ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="login-divider-line w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center"><span className="login-divider-text px-3 text-xs uppercase tracking-wider bg-white text-gray-500">{t.login.orContinueWith}</span></div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2.5">
                {/* Google */}
                <button type="button" onClick={handleGoogleAuth} className="login-google w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2.5 border border-gray-200 bg-white hover:bg-gray-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="text-sm font-medium text-gray-600">{t.login.google}</span>
                </button>

                {/* Apple */}
                <button type="button" onClick={handleAppleAuth} className="login-apple w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2.5 border border-gray-200 bg-black hover:bg-gray-900">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-sm font-medium text-white">{isEnglish ? 'Sign in with Apple' : 'Zaloguj przez Apple'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <a href={mainUrl} className="login-footer text-sm transition-colors text-gray-400 hover:text-teal-700">
              {t.backToHomepage}
            </a>
          </div>

          {/* Trust note - mobile only */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-sm text-white/60">
              {isEnglish 
                ? 'Trusted by 2,500+ businesses worldwide'
                : 'Zaufało nam ponad 2 500 firm'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
