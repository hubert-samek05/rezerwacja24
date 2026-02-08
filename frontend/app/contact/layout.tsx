import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt - Rezerwacja24.pl | Skontaktuj się z nami',
  description: 'Masz pytania o system rezerwacji online? Skontaktuj się z nami! Email: kontakt@rezerwacja24.pl. Odpowiadamy w ciągu 24h. Pomoc techniczna i wsparcie dla klientów.',
  keywords: ['kontakt rezerwacja24', 'pomoc techniczna', 'wsparcie klienta', 'system rezerwacji kontakt'],
  openGraph: {
    title: 'Kontakt - Rezerwacja24.pl',
    description: 'Skontaktuj się z nami w sprawie systemu rezerwacji online. Odpowiadamy w ciągu 24h!',
    url: 'https://rezerwacja24.pl/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Kontakt - Rezerwacja24.pl',
    description: 'Skontaktuj się z nami w sprawie systemu rezerwacji online.',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
