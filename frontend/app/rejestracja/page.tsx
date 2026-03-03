'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  Check,
  Calendar,
  Star,
  Shield,
  Briefcase
} from 'lucide-react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'

export default function RejestracjaPage() {
  const router = useRouter()
  const { register, isAuthenticated, isLoading: authLoading } = useCustomerAuth()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    marketingConsent: false,
    termsAccepted: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/konto')
    }
  }, [authLoading, isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Hasło musi mieć minimum 8 znaków'
    if (!/[a-zA-Z]/.test(password)) return 'Hasło musi zawierać literę'
    if (!/[0-9]/.test(password)) return 'Hasło musi zawierać cyfrę'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.termsAccepted) {
      setError('Musisz zaakceptować regulamin')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne')
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        marketingConsent: formData.marketingConsent,
      })
      router.push('/konto')
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas rejestracji')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'}/api/customer-auth/oauth/google`
  }

  const handleAppleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'}/api/customer-auth/oauth/apple`
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Rezerwacja24"
              width={200}
              height={60}
              className="h-12 w-auto brightness-0 invert"
            />
          </Link>
        </div>
        
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Dołącz do nas!
            </h2>
            <p className="text-xl text-white/80">
              Rezerwuj wizyty szybciej i wygodniej
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Szybka rezerwacja</p>
                <p className="text-sm text-white/70">Bez podawania danych za każdym razem</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Program lojalnościowy</p>
                <p className="text-sm text-white/70">Zbieraj punkty i korzystaj z nagród</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Historia wizyt</p>
                <p className="text-sm text-white/70">Wszystkie rezerwacje w jednym miejscu</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            Prowadzisz firmę?{' '}
            <a href="https://biz.rezerwacja24.pl" className="text-white hover:underline font-medium inline-flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              Panel dla biznesu
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex items-center justify-between bg-white border-b">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Powrót</span>
          </Link>
          <Image
            src="/logo.png"
            alt="Rezerwacja24"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Panel Type Badge */}
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                <Calendar className="w-4 h-4" />
                Panel Klienta
              </span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Utwórz konto
              </h1>
              <p className="mt-2 text-gray-600">
                Dołącz i korzystaj z wygodnych rezerwacji
              </p>
            </div>

            {/* Register Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 font-medium text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Zarejestruj przez Google
                </button>

                <button 
                  onClick={handleAppleLogin}
                  className="w-full py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Zarejestruj przez Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">lub email</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Imię
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Jan"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nazwisko
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Kowalski"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="jan.kowalski@email.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telefon <span className="text-gray-400 font-normal">(opcjonalnie)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="+48 123 456 789"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Min. 8 znaków"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Potwierdź hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Powtórz hasło"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="mt-0.5 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">
                      Akceptuję{' '}
                      <Link href="/terms/customer" className="text-teal-600 hover:underline font-medium">
                        regulamin
                      </Link>{' '}
                      i{' '}
                      <Link href="/privacy" className="text-teal-600 hover:underline font-medium">
                        politykę prywatności
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleChange}
                      className="mt-0.5 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">
                      Chcę otrzymywać informacje o promocjach
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Tworzenie konta...
                    </>
                  ) : (
                    'Utwórz konto'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <p className="mt-6 text-center text-gray-600">
                Masz już konto?{' '}
                <Link href="/logowanie" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Zaloguj się
                </Link>
              </p>
            </div>

            {/* Business Link - Mobile */}
            <p className="lg:hidden mt-6 text-center text-gray-500 text-sm">
              Prowadzisz firmę?{' '}
              <a href="https://biz.rezerwacja24.pl" className="text-teal-600 hover:text-teal-700 font-medium">
                Panel dla biznesu
              </a>
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
