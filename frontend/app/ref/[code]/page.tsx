'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Gift, CheckCircle2 } from 'lucide-react';

export default function ReferralRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [partnerInfo, setPartnerInfo] = useState<{
    valid: boolean;
    companyName?: string;
    discount?: number;
    discountMonths?: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Pobierz info o partnerze
    fetch(`/api/partners/info/${code}`)
      .then(res => res.json())
      .then(data => {
        setPartnerInfo(data);
        
        // Zapisz kod w localStorage i cookie
        if (data.valid) {
          localStorage.setItem('referral_code', code);
          document.cookie = `referral_code=${code}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }
      })
      .catch(() => {
        setPartnerInfo({ valid: false });
      });
  }, [code]);

  useEffect(() => {
    if (partnerInfo !== null) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(`/register?ref=${code}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [partnerInfo, code, router]);

  if (partnerInfo === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Weryfikacja linku...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {partnerInfo.valid ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-emerald-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Masz specjalną ofertę!
            </h1>
            
            {partnerInfo.companyName && (
              <p className="text-gray-600 mb-4">
                Polecenie od: <strong>{partnerInfo.companyName}</strong>
              </p>
            )}
            
            <div className="bg-emerald-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Twój rabat</span>
              </div>
              <div className="text-4xl font-bold text-emerald-600 mb-1">
                {partnerInfo.discount}% taniej
              </div>
              <p className="text-emerald-700 text-sm">
                przez {partnerInfo.discountMonths} {partnerInfo.discountMonths === 1 ? 'miesiąc' : 'miesiące'}
              </p>
            </div>
            
            <p className="text-gray-500 text-sm mb-4">
              Przekierowanie za {countdown} sekund...
            </p>
            
            <button
              onClick={() => router.push(`/register?ref=${code}`)}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Zarejestruj się teraz
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Link nieaktywny
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ten link polecający jest nieaktywny lub wygasł. 
              Możesz się zarejestrować bez rabatu.
            </p>
            
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Zarejestruj się
            </button>
          </>
        )}
      </div>
    </div>
  );
}
