import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polityka prywatności - Rezerwacja24.pl | RODO i ochrona danych',
  description: 'Polityka prywatności Rezerwacja24.pl. Informacje o przetwarzaniu danych osobowych zgodnie z RODO, cookies, bezpieczeństwo danych klientów.',
  keywords: ['polityka prywatności', 'RODO', 'ochrona danych osobowych', 'privacy policy', 'rezerwacja24 prywatność'],
  openGraph: {
    title: 'Polityka prywatności - Rezerwacja24.pl',
    description: 'Informacje o przetwarzaniu danych osobowych i polityka prywatności serwisu Rezerwacja24.pl',
    url: 'https://rezerwacja24.pl/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Polityka prywatności - Rezerwacja24.pl',
    description: 'Polityka prywatności i RODO w Rezerwacja24.pl',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
