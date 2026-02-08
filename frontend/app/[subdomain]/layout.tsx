import { Metadata } from 'next'

// Funkcja do pobierania danych firmy dla SEO
async function getCompanyData(subdomain: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
    const res = await fetch(`${apiUrl}/api/public/tenant/${subdomain}`, {
      next: { revalidate: 3600 } // Cache na 1 godzinę
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (error) {
    console.error('Error fetching company data for SEO:', error)
  }
  return null
}

// Dynamiczne generowanie meta tagów SEO
export async function generateMetadata({ params }: { params: { subdomain: string } }): Promise<Metadata> {
  const company = await getCompanyData(params.subdomain)
  
  if (!company) {
    return {
      title: 'Rezerwacja online | Rezerwacja24.pl',
      description: 'Zarezerwuj wizytę online w wybranym salonie.',
    }
  }

  const title = `${company.businessName} - Rezerwacja online | ${company.city || 'Rezerwacja24.pl'}`
  const description = company.description 
    || `Zarezerwuj wizytę w ${company.businessName}. ${company.city ? `Lokalizacja: ${company.city}.` : ''} Rezerwacja online 24/7.`

  return {
    title,
    description,
    keywords: [
      company.businessName,
      'rezerwacja online',
      'umów wizytę',
      company.city,
      'salon',
      'usługi',
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://${params.subdomain}.rezerwacja24.pl`,
      siteName: company.businessName,
      locale: 'pl_PL',
      images: company.logo ? [
        {
          url: company.logo,
          width: 400,
          height: 400,
          alt: company.businessName,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: company.banner || company.logo ? [company.banner || company.logo] : [],
    },
    alternates: {
      canonical: `https://${params.subdomain}.rezerwacja24.pl`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  }
}

export default function SubdomainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
