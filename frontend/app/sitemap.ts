import { MetadataRoute } from 'next'
import { getCurrentDomain, isEnglishDomain } from '@/lib/seo-config'

interface SubdomainData {
  subdomain: string
  businessName: string
  city?: string
  category?: string
  updatedAt?: string
}

interface MarketplaceListing {
  slug: string
  title: string
  category: string
  city?: string
  updatedAt?: string
  tenants: {
    subdomain: string
  }
}

// Pobierz listę aktywnych firm dla sitemap z dodatkowymi danymi
async function getActiveSubdomains(): Promise<SubdomainData[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
    const res = await fetch(`${apiUrl}/api/tenants/public/subdomains`, {
      next: { revalidate: 3600 } // Cache na 1 godzinę
    })
    if (res.ok) {
      const data = await res.json()
      // Obsłuż zarówno stary format (string[]) jak i nowy (SubdomainData[])
      if (Array.isArray(data.subdomains)) {
        return data.subdomains.map((item: string | SubdomainData) => 
          typeof item === 'string' 
            ? { subdomain: item, businessName: item } 
            : item
        )
      }
      return []
    }
  } catch (error) {
    console.error('Error fetching subdomains for sitemap:', error)
  }
  return []
}

// Pobierz listę firm z marketplace dla lepszego SEO
async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
    const res = await fetch(`${apiUrl}/api/marketplace/listings?limit=500`, {
      next: { revalidate: 3600 } // Cache na 1 godzinę
    })
    if (res.ok) {
      const data = await res.json()
      return data.listings || []
    }
  } catch (error) {
    console.error('Error fetching marketplace listings for sitemap:', error)
  }
  return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = getCurrentDomain()
  const baseUrl = `https://${domain}`
  const currentDate = new Date().toISOString().split('T')[0]
  const isEnglish = isEnglishDomain()
  
  // Statyczne strony główne
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Sekcje strony głównej (anchory) - dla lepszego SEO
    {
      url: `${baseUrl}/#${isEnglish ? 'features' : 'funkcje'}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#${isEnglish ? 'how-it-works' : 'jak-to-dziala'}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#${isEnglish ? 'pricing' : 'cennik'}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Industry/Category pages - only for Polish version
    ...(isEnglish ? [] : [
      // Główne kategorie
      { url: `${baseUrl}/beauty`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/fryzjerzy`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/kosmetyczki`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/mechanicy`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/trenerzy`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/lekarze`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/fizjoterapia`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/petsitterzy`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/masaz`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/spa`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/joga`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/tatuaz`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/rzesy`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/stomatologia`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
      // Kategorie ogólne
      { url: `${baseUrl}/zdrowie`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.85 },
      { url: `${baseUrl}/sport`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.85 },
      { url: `${baseUrl}/motoryzacja`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.85 },
      { url: `${baseUrl}/edukacja`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.85 },
      { url: `${baseUrl}/dom`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.85 },
      { url: `${baseUrl}/zwierzeta`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.85 },
      { url: `${baseUrl}/konsultacje`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.85 },
      // Strony pomocnicze
      { url: `${baseUrl}/support`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.7 },
      { url: `${baseUrl}/funkcje`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${baseUrl}/dla-biznesu`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${baseUrl}/partnerzy`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.6 },
    ]),
  ]

  // Pobierz firmy z marketplace (lepsze dane SEO)
  const marketplaceListings = await getMarketplaceListings()
  
  // Dynamiczne strony firm (subdomeny) - z danymi z marketplace
  const companyPages: MetadataRoute.Sitemap = marketplaceListings.map(listing => ({
    url: `https://${listing.tenants.subdomain}.${domain}`,
    lastModified: listing.updatedAt 
      ? new Date(listing.updatedAt).toISOString().split('T')[0] 
      : currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fallback - pobierz też subdomeny jeśli marketplace jest pusty
  if (companyPages.length === 0) {
    const subdomains = await getActiveSubdomains()
    const fallbackPages: MetadataRoute.Sitemap = subdomains.map(company => ({
      url: `https://${company.subdomain}.${domain}`,
      lastModified: company.updatedAt 
        ? new Date(company.updatedAt).toISOString().split('T')[0] 
        : currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    return [...staticPages, ...fallbackPages]
  }

  return [...staticPages, ...companyPages]
}
