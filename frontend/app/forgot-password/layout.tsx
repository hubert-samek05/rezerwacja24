import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resetowanie hasła - Rezerwacja24.pl',
  description: 'Zapomniałeś hasła? Zresetuj hasło do konta Rezerwacja24.pl. Wyślemy link do zmiany hasła na Twój email.',
  openGraph: {
    title: 'Resetowanie hasła - Rezerwacja24.pl',
    description: 'Zresetuj hasło do konta w systemie rezerwacji online',
    url: 'https://rezerwacja24.pl/forgot-password',
    type: 'website',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/forgot-password',
  },
  robots: {
    index: false, // Nie indeksuj strony resetowania hasła
    follow: false,
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
