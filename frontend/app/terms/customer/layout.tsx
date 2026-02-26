import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamin dla Klientów - Rezerwacja24.pl | Zasady rezerwacji online',
  description: 'Regulamin korzystania z systemu rezerwacji online Rezerwacja24 dla klientów dokonujących rezerwacji usług. Poznaj swoje prawa i obowiązki.',
  keywords: ['regulamin klienta', 'zasady rezerwacji', 'rezerwacja online', 'warunki korzystania'],
  openGraph: {
    title: 'Regulamin dla Klientów - Rezerwacja24.pl',
    description: 'Zasady korzystania z systemu rezerwacji online dla klientów',
    url: 'https://rezerwacja24.pl/terms/customer',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Regulamin dla Klientów - Rezerwacja24.pl',
    description: 'Zasady korzystania z systemu rezerwacji online',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/terms/customer',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CustomerTermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
