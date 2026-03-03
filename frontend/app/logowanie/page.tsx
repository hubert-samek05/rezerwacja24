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
  Calendar,
  Clock,
  MapPin,
  Briefcase
} from 'lucide-react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'

export default function LogowaniePage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useCustomerAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/konto')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/konto')
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas logowania')
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop"
          alt="Kolorowe tło"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/40 via-emerald-500/30 to-cyan-400/40" />
        
        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Rezerwacja24"
              width={180}
              height={50}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
        </div>
        
        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Twoje rezerwacje w jednym miejscu
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Zarządzaj wizytami, zbieraj punkty i korzystaj z rabatów
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/90">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Łatwe rezerwacje</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Przypomnienia</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-sm">Tysiące firm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex items-center justify-between border-b border-gray-100">
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

        <main className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            {/* Logo - Desktop */}
            <div className="hidden lg:block mb-8">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Rezerwacja24"
                  width={160}
                  height={45}
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Zaloguj się
              </h1>
              <p className="text-gray-500">
                Zarządzaj swoimi rezerwacjami
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  placeholder="jan@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Hasło
                  </label>
                  <Link href="/reset-hasla" className="text-sm text-teal-600 hover:text-teal-700">
                    Zapomniałeś?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logowanie...
                  </>
                ) : (
                  'Zaloguj się'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">lub</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Kontynuuj z Google
              </button>

              <button 
                onClick={handleAppleLogin}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Kontynuuj z Apple
              </button>
            </div>

            {/* Register Link */}
            <p className="mt-8 text-center text-gray-600 text-sm">
              Nie masz konta?{' '}
              <Link href="/rejestracja" className="text-teal-600 hover:text-teal-700 font-medium">
                Zarejestruj się
              </Link>
            </p>

            {/* Business Link */}
            <p className="mt-6 text-center text-gray-400 text-sm">
              Prowadzisz firmę?{' '}
              <a href="https://biz.rezerwacja24.pl" className="text-gray-600 hover:text-gray-900">
                Panel dla biznesu
              </a>
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
