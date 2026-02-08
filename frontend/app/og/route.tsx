import { ImageResponse } from 'next/og'
import { isEnglishDomain, getCurrentDomain } from '@/lib/seo-config'

export const runtime = 'edge'

export async function GET() {
  const isEnglish = isEnglishDomain()
  const domain = getCurrentDomain()
  
  const title = isEnglish 
    ? 'Online Booking System' 
    : 'System rezerwacji online'
  
  const subtitle = isEnglish
    ? 'For beauty salons, hairdressers & service businesses'
    : 'Dla salonów kosmetycznych, fryzjerów i firm usługowych'
  
  const features = isEnglish
    ? ['Online Calendar', 'SMS Reminders', 'Client CRM', 'Online Payments']
    : ['Kalendarz online', 'Powiadomienia SMS', 'CRM klientów', 'Płatności online']
  
  const cta = isEnglish
    ? '7-day free trial'
    : '7 dni za darmo'
  
  const brandName = isEnglish ? 'Bookings24' : 'Rezerwacja24'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0A',
          padding: '60px',
        }}
      >
        {/* Top bar with brand */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#00FF88',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0A0A0A" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#0A0A0A" strokeWidth="2"/>
              <line x1="9" y1="4" x2="9" y2="10" stroke="#0A0A0A" strokeWidth="2"/>
              <line x1="15" y1="4" x2="15" y2="10" stroke="#0A0A0A" strokeWidth="2"/>
            </svg>
          </div>
          <span style={{ color: '#ffffff', fontSize: '32px', fontWeight: 700 }}>
            {brandName}
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
              marginBottom: '20px',
            }}
          >
            {title}
          </h1>
          
          <p
            style={{
              fontSize: '28px',
              color: '#9CA3AF',
              margin: 0,
              marginBottom: '40px',
            }}
          >
            {subtitle}
          </p>

          {/* Features */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
            {features.map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1F1F1F',
                  padding: '12px 20px',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#00FF88',
                    borderRadius: '50%',
                    marginRight: '12px',
                  }}
                />
                <span style={{ color: '#E5E7EB', fontSize: '18px' }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#00FF88',
              padding: '16px 32px',
              borderRadius: '12px',
              width: 'fit-content',
            }}
          >
            <span style={{ color: '#0A0A0A', fontSize: '24px', fontWeight: 700 }}>
              {cta}
            </span>
          </div>
        </div>

        {/* Bottom domain */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ color: '#6B7280', fontSize: '20px' }}>
            {domain}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
