import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centrum pomocy - Rezerwacja24.pl | FAQ i poradniki',
  description: 'Centrum pomocy Rezerwacja24.pl. Odpowiedzi na najczęściej zadawane pytania, poradniki, instrukcje obsługi systemu rezerwacji online. Jak zacząć? Jak dodać usługę?',
  keywords: ['pomoc rezerwacja24', 'FAQ', 'centrum pomocy', 'jak korzystać z systemu rezerwacji', 'poradnik rezerwacje online', 'instrukcja obsługi'],
  openGraph: {
    title: 'Centrum pomocy - Rezerwacja24.pl',
    description: 'FAQ, poradniki i instrukcje obsługi systemu rezerwacji online Rezerwacja24.pl',
    url: 'https://rezerwacja24.pl/help',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Centrum pomocy - Rezerwacja24.pl',
    description: 'FAQ i poradniki dla użytkowników Rezerwacja24.pl',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/help',
  },
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
