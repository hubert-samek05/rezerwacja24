import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { getSeoConfig, isEnglishDomain } from '@/lib/seo-config'

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
})

// Get SEO config based on NEXT_PUBLIC_DOMAIN environment variable
const seoConfig = getSeoConfig()
export const metadata: Metadata = seoConfig.metadata

// JSON-LD Structured Data - from SEO config
const jsonLd = seoConfig.jsonLd

// Dynamic values based on domain
const isEnglish = isEnglishDomain()
const htmlLang = isEnglish ? 'en' : 'pl'
const geoRegion = isEnglish ? 'EU' : 'PL'
const geoPlacename = isEnglish ? 'Europe' : 'Polska'
const language = isEnglish ? 'English' : 'Polish'
const appTitle = isEnglish ? 'Bookings24' : 'Rezerwacja24'
const apiDomain = isEnglish ? 'https://api.bookings24.eu' : 'https://api.rezerwacja24.pl'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={htmlLang} className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: dark)" />
        <meta name="geo.region" content={geoRegion} />
        <meta name="geo.placename" content={geoPlacename} />
        <meta name="language" content={language} />
        <meta name="revisit-after" content="3 days" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={appTitle} />
        <meta name="application-name" content={appTitle} />
        <meta name="msapplication-TileColor" content="#00FF88" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={apiDomain} />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-carbon-black text-neutral-gray antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
