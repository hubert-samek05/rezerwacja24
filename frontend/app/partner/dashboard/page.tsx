'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users2, 
  Copy, 
  Check, 
  TrendingUp, 
  Users, 
  Wallet, 
  MousePointer,
  LogOut,
  Loader2,
  ExternalLink,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface DashboardData {
  partner: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    referralCode: string;
    bankAccount: string | null;
    status: string;
  };
  stats: {
    totalClicks: number;
    totalRegistrations: number;
    totalPaidCustomers: number;
    totalEarnings: number;
    pendingPayout: number;
    conversionRate: number;
  };
  referralLink: string;
  commissionInfo: {
    oneTime: number;
    recurring: number;
    recurringMonths: number;
    referralDiscount: number;
    discountMonths: number;
  };
  recentConversions: any[];
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversions' | 'payouts'>('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/partners/dashboard', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/partner/login');
          return;
        }
        throw new Error('Błąd pobierania danych');
      }

      const dashboardData = await response.json();
      
      if (dashboardData.error) {
        router.push('/partner/login');
        return;
      }
      
      setData(dashboardData);
    } catch (error) {
      console.error('Dashboard error:', error);
      router.push('/partner/login');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/partners/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('partner');
    router.push('/partner/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const stats = [
    { 
      label: 'Kliknięcia', 
      value: data.stats.totalClicks, 
      icon: MousePointer,
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Rejestracje', 
      value: data.stats.totalRegistrations, 
      icon: Users,
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      label: 'Płacący klienci', 
      value: data.stats.totalPaidCustomers, 
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'Konwersja', 
      value: `${data.stats.conversionRate}%`, 
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users2 className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="font-bold text-gray-900">Panel Partnera</h1>
              <p className="text-sm text-gray-500">{data.partner.companyName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            Wyloguj
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Referral Link */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-lg font-semibold mb-2">Twój link polecający</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-sm truncate">
              {data.referralLink}
            </div>
            <button
              onClick={copyLink}
              className="bg-white text-emerald-600 px-4 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Skopiowano!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Kopiuj
                </>
              )}
            </button>
          </div>
          <p className="text-emerald-100 text-sm mt-3">
            Udostępnij ten link swoim klientom. Otrzymają {data.commissionInfo.referralDiscount}% rabatu przez {data.commissionInfo.discountMonths} miesiące.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Earnings Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Łączne zarobki</h3>
                <p className="text-sm text-gray-500">Od początku współpracy</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {data.stats.totalEarnings.toFixed(2)} zł
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Do wypłaty</h3>
                <p className="text-sm text-gray-500">Minimalna kwota: 100 zł</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {data.stats.pendingPayout.toFixed(2)} zł
            </div>
            {data.stats.pendingPayout >= 100 ? (
              <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Wypłać środki
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Potrzebujesz jeszcze {(100 - data.stats.pendingPayout).toFixed(2)} zł do wypłaty
              </p>
            )}
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Twoje warunki prowizji</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {data.commissionInfo.oneTime} zł
              </div>
              <div className="text-sm text-gray-600">Jednorazowo za klienta</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {data.commissionInfo.recurring}%
              </div>
              <div className="text-sm text-gray-600">
                Recurring przez {data.commissionInfo.recurringMonths} mies.
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {data.commissionInfo.referralDiscount}%
              </div>
              <div className="text-sm text-gray-600">
                Rabat dla klientów ({data.commissionInfo.discountMonths} mies.)
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Ostatnie konwersje</h3>
          </div>
          {data.recentConversions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.recentConversions.map((conversion: any) => (
                <div key={conversion.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Tenant #{conversion.tenantId.substring(0, 8)}...
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(conversion.registeredAt).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversion.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Płacący
                      </span>
                    ) : conversion.status === 'REGISTERED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        Zarejestrowany
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {conversion.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Brak konwersji</p>
              <p className="text-sm">Udostępnij swój link polecający aby zacząć zarabiać</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
