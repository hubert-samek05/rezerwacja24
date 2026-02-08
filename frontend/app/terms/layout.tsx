import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamin - Rezerwacja24.pl | Warunki korzystania z usługi',
  description: 'Regulamin serwisu Rezerwacja24.pl. Warunki korzystania z systemu rezerwacji online, prawa i obowiązki użytkowników, zasady płatności i subskrypcji.',
  keywords: ['regulamin rezerwacja24', 'warunki korzystania', 'regulamin systemu rezerwacji', 'terms of service'],
  openGraph: {
    title: 'Regulamin - Rezerwacja24.pl',
    description: 'Regulamin serwisu i warunki korzystania z systemu rezerwacji online Rezerwacja24.pl',
    url: 'https://rezerwacja24.pl/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Regulamin - Rezerwacja24.pl',
    description: 'Regulamin serwisu Rezerwacja24.pl',
  },
  alternates: {
    canonical: 'https://rezerwacja24.pl/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
