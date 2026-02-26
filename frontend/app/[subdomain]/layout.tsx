import { Metadata } from 'next'
import { getCurrentDomain, isEnglishDomain } from '@/lib/seo-config'
import { generateJsonLdScript } from '@/lib/subdomain-seo'

interface CompanyData {
  businessName: string
  subdomain: string
  description?: string
  city?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  banner?: string
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  services?: Array<{ name: string; category?: string; price?: number; duration?: number }>
  socialMedia?: { facebook?: string; instagram?: string; website?: string }
}

// Funkcja do pobierania danych firmy dla SEO
async function getCompanyData(subdomain: string): Promise<CompanyData | null> {
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

// Generowanie słów kluczowych na podstawie usług i lokalizacji
function generateKeywords(company: CompanyData, isEnglish: boolean): string[] {
  const keywords: string[] = [company.businessName]
  
  if (company.city) {
    keywords.push(company.city)
    keywords.push(isEnglish 
      ? `booking ${company.city}` 
      : `rezerwacja ${company.city}`)
  }
  
  // Dodaj kategorie usług jako słowa kluczowe
  if (company.services && company.services.length > 0) {
    const categories = [...new Set(company.services
      .map(s => s.category)
      .filter(Boolean))]
    keywords.push(...categories.slice(0, 5) as string[])
  }
  
  // Podstawowe słowa kluczowe
  if (isEnglish) {
    keywords.push('online booking', 'book appointment', 'schedule online')
  } else {
    keywords.push('rezerwacja online', 'umów wizytę', 'rezerwuj online', 'salon', 'usługi')
  }
  
  return keywords.filter(Boolean)
}

// Dynamiczne generowanie meta tagów SEO
export async function generateMetadata({ params }: { params: { subdomain: string } }): Promise<Metadata> {
  const company = await getCompanyData(params.subdomain)
  const domain = getCurrentDomain()
  const isEnglish = isEnglishDomain()
  const canonicalUrl = `https://${params.subdomain}.${domain}`
  
  if (!company) {
    return {
      title: isEnglish ? 'Online Booking | Bookings24' : 'Rezerwacja online | Rezerwacja24.pl',
      description: isEnglish 
        ? 'Book your appointment online at your chosen salon.' 
        : 'Zarezerwuj wizytę online w wybranym salonie.',
      robots: { index: false, follow: false },
    }
  }

  // Tytuł: Nazwa firmy jako główny tytuł (bez "Rezerwacja24" w tytule!)
  // Format: "Nazwa Firmy | Miasto" lub "Nazwa Firmy - Rezerwacja online"
  const title = company.city 
    ? `${company.businessName} | ${company.city}`
    : company.businessName
  
  // Opis: Bogaty w słowa kluczowe, ale naturalny
  const defaultDescription = isEnglish
    ? `Book your appointment at ${company.businessName}${company.city ? ` in ${company.city}` : ''}. Online booking available 24/7. Quick and easy appointment scheduling.`
    : `Zarezerwuj wizytę w ${company.businessName}${company.city ? ` w ${company.city}` : ''}. Rezerwacja online dostępna 24/7. Szybkie i wygodne umawianie wizyt.`
  
  const description = company.description || defaultDescription
  const keywords = generateKeywords(company, isEnglish)

  return {
    // metadataBase - kluczowe dla poprawnych canonical URLs
    metadataBase: new URL(canonicalUrl),
    
    // Tytuł strony - TYLKO nazwa firmy (najważniejsze dla SEO!)
    title: {
      absolute: title, // absolute = nie dodaje template z głównego layout
    },
    description,
    keywords: keywords.join(', '),
    
    // Autorzy i wydawca
    authors: [{ name: company.businessName }],
    creator: company.businessName,
    publisher: company.businessName,
    
    // Open Graph - dla Facebooka, LinkedIna
    openGraph: {
      title: company.businessName,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: company.businessName,
      locale: isEnglish ? 'en_US' : 'pl_PL',
      images: company.logo ? [
        {
          url: company.logo,
          width: 400,
          height: 400,
          alt: company.businessName,
        }
      ] : company.banner ? [
        {
          url: company.banner,
          width: 1200,
          height: 630,
          alt: company.businessName,
        }
      ] : [],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: company.businessName,
      description,
      images: company.banner ? [company.banner] : company.logo ? [company.logo] : [],
    },
    
    // Canonical URL i alternatywne wersje językowe
    alternates: {
      canonical: canonicalUrl,
      languages: isEnglish ? {
        'en': canonicalUrl,
        'pl-PL': `https://${params.subdomain}.rezerwacja24.pl`,
      } : {
        'pl-PL': canonicalUrl,
        'en': `https://${params.subdomain}.bookings24.eu`,
      },
    },
    
    // Robots - indeksowanie włączone
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Dodatkowe meta tagi
    other: {
      'geo.placename': company.city || '',
      'geo.region': isEnglish ? 'EU' : 'PL',
    },
  }
}

export default async function SubdomainLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { subdomain: string }
}) {
  // Pobierz dane firmy dla JSON-LD
  const company = await getCompanyData(params.subdomain)
  const domain = getCurrentDomain()
  const isEnglish = isEnglishDomain()
  
  // Generuj JSON-LD tylko jeśli firma istnieje
  const jsonLdScript = company ? generateJsonLdScript(company, params.subdomain) : null
  
  return (
    <>
      {/* JSON-LD Structured Data dla SEO */}
      {jsonLdScript && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
      )}
      {children}
    </>
  )
}
