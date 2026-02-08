'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
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

export default function ForgotPasswordPage() {
  const [mainUrl, setMainUrl] = useState('https://rezerwacja24.pl');
  const [apiUrl, setApiUrl] = useState('https://api.rezerwacja24.pl');
  const [isEnglish, setIsEnglish] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Wykryj domenę po stronie klienta
  useEffect(() => {
    const { isEnglish: isEn, mainUrl: url, apiUrl: api } = detectDomain();
    setIsEnglish(isEn);
    setMainUrl(url);
    setApiUrl(api);
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success(isEnglish ? 'Check your email inbox!' : 'Sprawdź swoją skrzynkę email!');
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
            <div className="w-16 h-16 bg-[#41FFBC]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#41FFBC]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {isEnglish ? 'Check your inbox!' : 'Sprawdź swoją skrzynkę!'}
            </h1>
            <p className="text-gray-400 mb-6">
              {isEnglish 
                ? <>If an account with <strong className="text-white">{email}</strong> exists, we sent a password reset link.</>
                : <>Jeśli konto z adresem <strong className="text-white">{email}</strong> istnieje, wysłaliśmy na nie link do resetu hasła.</>}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {isEnglish ? 'The link is valid for 1 hour. Also check your spam folder.' : 'Link jest ważny przez 1 godzinę. Sprawdź również folder spam.'}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#41FFBC] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? 'Back to login' : 'Wróć do logowania'}
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
              <Mail className="w-8 h-8 text-[#41FFBC]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isEnglish ? 'Forgot your password?' : 'Zapomniałeś hasła?'}
            </h1>
            <p className="text-gray-400">
              {isEnglish ? 'Enter your email address and we will send you a password reset link' : 'Podaj swój adres email, a wyślemy Ci link do resetu hasła'}
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
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isEnglish ? 'Email address' : 'Adres email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isEnglish ? 'your@email.com' : 'twoj@email.pl'}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#41FFBC]/50 focus:ring-1 focus:ring-[#41FFBC]/50"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#0F6048] to-[#41FFBC] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isEnglish ? 'Sending...' : 'Wysyłanie...') : (isEnglish ? 'Send reset link' : 'Wyślij link do resetu')}
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
