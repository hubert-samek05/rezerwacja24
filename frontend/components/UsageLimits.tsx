'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface LimitCheckResult {
  canProceed: boolean;
  current: number;
  limit: number | null;
  remaining: number | null;
  percentUsed: number;
  message?: string;
}

interface UsageLimitsData {
  bookings: LimitCheckResult;
  employees: LimitCheckResult;
  sms: LimitCheckResult;
  planName: string;
  planSlug: string;
}

interface UsageLimitsProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
  onUpgradeClick?: () => void;
}

export default function UsageLimits({
  compact = false,
  showUpgradeButton = true,
  onUpgradeClick,
}: UsageLimitsProps) {
  const [data, setData] = useState<UsageLimitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const tenantId = user?.tenantId;

      if (!token || !tenantId) {
        setError('Brak autoryzacji');
        return;
      }

      const response = await fetch('/api/limits', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });

      if (!response.ok) throw new Error('Błąd pobierania limitów');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return '∞';
    return limit.toString();
  };

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'bg-red-500';
    if (percentUsed >= 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getProgressBgColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'bg-red-500/20';
    if (percentUsed >= 70) return 'bg-yellow-500/20';
    return 'bg-emerald-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !data) {
    return null; // Nie pokazuj błędu, po prostu ukryj komponent
  }

  const limits = [
    {
      name: 'Rezerwacje',
      icon: Calendar,
      data: data.bookings,
      unit: 'w tym miesiącu',
    },
    {
      name: 'Pracownicy',
      icon: Users,
      data: data.employees,
      unit: 'aktywnych',
    },
    {
      name: 'SMS',
      icon: MessageSquare,
      data: data.sms,
      unit: 'w tym miesiącu',
    },
  ];

  // Sprawdź czy któryś limit jest bliski wyczerpania
  const hasWarning = limits.some(l => l.data.percentUsed >= 70 && l.data.limit !== null);
  const hasCritical = limits.some(l => l.data.percentUsed >= 90 && l.data.limit !== null);

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {limits.map((limit, index) => {
          const Icon = limit.icon;
          const isUnlimited = limit.data.limit === null;
          
          if (isUnlimited) return null;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                limit.data.percentUsed >= 90
                  ? 'bg-red-500/20 text-red-400'
                  : limit.data.percentUsed >= 70
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {limit.data.current}/{formatLimit(limit.data.limit)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Wykorzystanie planu</h3>
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded">
            {data.planName}
          </span>
        </div>
        {hasCritical && (
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Limit prawie wyczerpany!</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {limits.map((limit, index) => {
          const Icon = limit.icon;
          const isUnlimited = limit.data.limit === null;
          const progressColor = getProgressColor(limit.data.percentUsed);
          const progressBgColor = getProgressBgColor(limit.data.percentUsed);

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">{limit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-primary)] font-semibold">
                    {limit.data.current}
                  </span>
                  <span className="text-gray-500">/</span>
                  <span className="text-[var(--text-muted)]">
                    {formatLimit(limit.data.limit)}
                  </span>
                  <span className="text-gray-500 text-sm">{limit.unit}</span>
                </div>
              </div>

              {!isUnlimited && (
                <div className={`h-2 rounded-full ${progressBgColor}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, limit.data.percentUsed)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full rounded-full ${progressColor}`}
                  />
                </div>
              )}

              {isUnlimited && (
                <div className="h-2 rounded-full bg-emerald-500/20">
                  <div className="h-full rounded-full bg-emerald-500 w-full opacity-30" />
                </div>
              )}

              {limit.data.message && (
                <p className={`text-sm ${
                  limit.data.percentUsed >= 90 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {limit.data.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {showUpgradeButton && hasWarning && (
        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
          <button
            onClick={onUpgradeClick}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Ulepsz plan
          </button>
        </div>
      )}
    </motion.div>
  );
}
