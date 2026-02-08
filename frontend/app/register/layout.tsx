import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rejestracja - Rezerwacja24.pl | Załóż konto za darmo',
  description: 'Zarejestruj się w Rezerwacja24.pl i otrzymaj 7 dni za darmo! System rezerwacji online dla salonów kosmetycznych, fryzjerów, gabinetów. Bez karty kredytowej.',
  keywords: ['rejestracja rezerwacja24', 'załóż konto', 'darmowy trial', 'system rezerwacji za darmo', '7 dni za darmo', 'rejestracja systemu rezerwacji'],
  openGraph: {
    title: 'Załóż konto - Rezerwacja24.pl | 7 dni za darmo',
    description: 'Zarejestruj się i testuj system rezerwacji online przez 7 dni za darmo. Bez karty kredytowej!',
    url: 'https://rezerwacja24.pl/register',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Załóż konto - Rezerwacja24.pl | 7 dni za darmo',
    description: 'Zarejestruj się i testuj system rezerwacji online przez 7 dni za darmo!',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/register',
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
