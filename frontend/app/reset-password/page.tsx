'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Wykryj domenę
function detectDomain() {
  if (typeof window === 'undefined') {
    return { isEnglish: false, mainUrl: 'https://rezerwacja24.pl', apiUrl: 'https://api.rezerwacja24.pl' }
  }
  const hostname = window.location.hostname
  const isEnglish = hostname.includes('bookings24.eu')
  return {
    isEnglish,
    mainUrl: isEnglish ? 'https://bookings24.eu' : 'https://rezerwacja24.pl',
    apiUrl: isEnglish ? 'https://api.bookings24.eu' : hostname.includes('rezerwacja24.pl') ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
  }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [mainUrl, setMainUrl] = useState('https://rezerwacja24.pl');
  const [apiUrl, setApiUrl] = useState('https://api.rezerwacja24.pl');
  const [isEnglish, setIsEnglish] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Wykryj domenę po stronie klienta
  useEffect(() => {
    const { isEnglish: isEn, mainUrl: url, apiUrl: api } = detectDomain();
    setIsEnglish(isEn);
    setMainUrl(url);
    setApiUrl(api);
    setIsClient(true);
  }, []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isClient && !token) {
      setError(isEnglish ? 'Missing reset token. Check the link from your email.' : 'Brak tokenu resetu hasła. Sprawdź link z emaila.');
    }
  }, [token, isEnglish, isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(isEnglish ? 'Password must be at least 8 characters' : 'Hasło musi mieć minimum 8 znaków');
      return;
    }

    if (password !== confirmPassword) {
      setError(isEnglish ? 'Passwords do not match' : 'Hasła nie są identyczne');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success(isEnglish ? 'Password has been changed!' : 'Hasło zostało zmienione!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || (isEnglish ? 'An error occurred. Please try again.' : 'Wystąpił błąd. Spróbuj ponownie.'));
      }
    } catch (err) {
      setError(isEnglish ? 'Connection error' : 'Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  // Pokaż ekran ładowania dopóki nie wykryjemy domeny
  if (!isClient) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-10 w-40 bg-gray-700 rounded mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {isEnglish ? 'Password changed!' : 'Hasło zmienione!'}
            </h1>
            <p className="text-gray-400 mb-6">
              {isEnglish ? 'Your password has been successfully changed. You will be redirected to the login page shortly.' : 'Twoje hasło zostało pomyślnie zmienione. Za chwilę zostaniesz przekierowany do strony logowania.'}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#41FFBC] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? 'Go to login' : 'Przejdź do logowania'}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={mainUrl} className="inline-block">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#0F6048] to-[#41FFBC] bg-clip-text text-transparent">
              {isEnglish ? 'Bookings24' : 'Rezerwacja24'}
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#41FFBC]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#41FFBC]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isEnglish ? 'Set new password' : 'Ustaw nowe hasło'}
            </h1>
            <p className="text-gray-400">
              {isEnglish ? 'Enter a new password for your account' : 'Wprowadź nowe hasło do swojego konta'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isEnglish ? 'New password' : 'Nowe hasło'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEnglish ? 'Minimum 8 characters' : 'Minimum 8 znaków'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#41FFBC]/50 focus:ring-1 focus:ring-[#41FFBC]/50 pr-12"
                  required
                  minLength={8}
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isEnglish ? 'Confirm password' : 'Potwierdź hasło'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isEnglish ? 'Repeat password' : 'Powtórz hasło'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#41FFBC]/50 focus:ring-1 focus:ring-[#41FFBC]/50 pr-12"
                  required
                  minLength={8}
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-gradient-to-r from-[#0F6048] to-[#41FFBC] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isEnglish ? 'Saving...' : 'Zapisywanie...') : (isEnglish ? 'Change password' : 'Zmień hasło')}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? 'Back to login' : 'Wróć do logowania'}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
