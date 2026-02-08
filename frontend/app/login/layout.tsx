import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logowanie - Rezerwacja24.pl | Panel klienta',
  description: 'Zaloguj się do panelu Rezerwacja24.pl. Zarządzaj rezerwacjami, kalendarzem, klientami i usługami. Dostęp do systemu rezerwacji online 24/7.',
  keywords: ['logowanie rezerwacja24', 'panel klienta', 'login system rezerwacji', 'zaloguj się'],
  openGraph: {
    title: 'Logowanie - Rezerwacja24.pl',
    description: 'Zaloguj się do panelu zarządzania rezerwacjami online',
    url: 'https://rezerwacja24.pl/login',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Logowanie - Rezerwacja24.pl',
    description: 'Zaloguj się do systemu rezerwacji online',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/login',
  },
  robots: {
    index: true,
    follow: false, // Nie śledź linków ze strony logowania
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
