import { MetadataRoute } from 'next'
import { getCurrentDomain, isEnglishDomain } from '@/lib/seo-config'

interface SubdomainData {
  subdomain: string
  businessName: string
  city?: string
  updatedAt?: string
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
    // Industry pages - only for Polish version (English version uses generic landing)
    ...(isEnglish ? [] : [
      {
        url: `${baseUrl}/beauty`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/fryzjerzy`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/mechanicy`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/petsitterzy`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/lekarze`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/fizjoterapia`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/trenerzy`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
    ]),
  ]

  // Dynamiczne strony firm (subdomeny)
  // Wszystkie subdomeny są w jednym sitemap - Google Search Console
  // z właściwością domenową (rezerwacja24.pl) automatycznie je zaindeksuje
  const subdomains = await getActiveSubdomains()
  const companyPages: MetadataRoute.Sitemap = subdomains.map(company => ({
    url: `https://${company.subdomain}.${domain}`,
    lastModified: company.updatedAt 
      ? new Date(company.updatedAt).toISOString().split('T')[0] 
      : currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8, // Nieco niższy priorytet niż strona główna
  }))

  return [...staticPages, ...companyPages]
}
