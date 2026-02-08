'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Mail,
  Loader2,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api-url';
import toast from 'react-hot-toast';

export default function TwoFactorTab() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    let tenantId = '';
    
    try {
      const user = localStorage.getItem('user');
      if (user) {
        tenantId = JSON.parse(user).tenantId || '';
      }
    } catch (e) {
      console.error('Error getting tenantId:', e);
    }
    
    console.log('🔐 2FA Auth - token:', token ? `${token.substring(0, 20)}...` : 'NULL');
    console.log('🔐 2FA Auth - tenantId:', tenantId);
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
    };
  };

  const checkStatus = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/2fa/status`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`${getApiUrl()}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setIsEnabled(true);
        toast.success('Uwierzytelnianie dwuskładnikowe zostało włączone!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Błąd podczas włączania 2FA');
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Błąd podczas włączania 2FA');
    } finally {
      setActionLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`${getApiUrl()}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setIsEnabled(false);
        toast.success('Uwierzytelnianie dwuskładnikowe zostało wyłączone');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Błąd podczas wyłączania 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Błąd podczas wyłączania 2FA');
    } finally {
      setActionLoading(false);
    }
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
        <h2 className="text-2xl font-bold text-white mb-2">Uwierzytelnianie dwuskładnikowe (2FA)</h2>
        <p className="text-neutral-gray">Dodatkowa warstwa bezpieczeństwa dla Twojego konta</p>
      </div>

      {/* Status 2FA */}
      <div className={`glass-card p-6 border-2 ${isEnabled ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${isEnabled ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
            {isEnabled ? (
              <ShieldCheck className="w-8 h-8 text-green-400" />
            ) : (
              <Shield className="w-8 h-8 text-yellow-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {isEnabled ? 'Uwierzytelnianie dwuskładnikowe jest włączone' : 'Uwierzytelnianie dwuskładnikowe jest wyłączone'}
            </h3>
            <p className="text-sm text-gray-400">
              {isEnabled 
                ? 'Przy każdym logowaniu otrzymasz kod weryfikacyjny na email'
                : 'Włącz 2FA aby zwiększyć bezpieczeństwo swojego konta'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Jak działa 2FA */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Jak działa 2FA przez email?</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent-neon/20 rounded-lg flex-shrink-0">
              <Mail className="w-5 h-5 text-accent-neon" />
            </div>
            <div>
              <p className="text-white font-medium">Kod na email</p>
              <p className="text-sm text-gray-400">
                Przy każdym logowaniu otrzymasz 6-cyfrowy kod weryfikacyjny na swój adres email.
                Kod jest ważny przez 10 minut.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent-neon/20 rounded-lg flex-shrink-0">
              <Shield className="w-5 h-5 text-accent-neon" />
            </div>
            <div>
              <p className="text-white font-medium">Dodatkowe zabezpieczenie</p>
              <p className="text-sm text-gray-400">
                Nawet jeśli ktoś pozna Twoje hasło, nie będzie mógł się zalogować bez dostępu do Twojego emaila.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Przycisk włączania/wyłączania */}
      {!isEnabled ? (
        <button
          onClick={enableTwoFactor}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Włącz uwierzytelnianie dwuskładnikowe
            </>
          )}
        </button>
      ) : (
        <div className="glass-card p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <ShieldOff className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Wyłącz 2FA</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Wyłączenie 2FA zmniejszy bezpieczeństwo Twojego konta. Czy na pewno chcesz kontynuować?
          </p>
          <button
            onClick={disableTwoFactor}
            disabled={actionLoading}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Wyłącz 2FA'}
          </button>
        </div>
      )}
    </div>
  );
}
