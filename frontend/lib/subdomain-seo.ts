import { getCurrentDomain, isEnglishDomain } from './seo-config'

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

// Mapowanie dni tygodnia na format Schema.org
const dayMapping: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

// Generowanie godzin otwarcia w formacie Schema.org
function generateOpeningHoursSpecification(openingHours: Record<string, { open: string; close: string; closed?: boolean }>) {
  const specs = []
  
  for (const [day, hours] of Object.entries(openingHours)) {
    if (!hours.closed && hours.open && hours.close) {
      specs.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dayMapping[day.toLowerCase()] || day,
        opens: hours.open,
        closes: hours.close,
      })
    }
  }
  
  return specs
}

// Generowanie JSON-LD LocalBusiness dla firmy
export function generateLocalBusinessJsonLd(company: CompanyData, subdomain: string): object {
  const domain = getCurrentDomain()
  const isEnglish = isEnglishDomain()
  const canonicalUrl = `https://${subdomain}.${domain}`
  
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@graph': [
      // LocalBusiness - główny obiekt firmy
      {
        '@type': 'LocalBusiness',
        '@id': `${canonicalUrl}/#business`,
        name: company.businessName,
        url: canonicalUrl,
        description: company.description || (isEnglish 
          ? `Book your appointment at ${company.businessName}. Online booking available 24/7.`
          : `Zarezerwuj wizytę w ${company.businessName}. Rezerwacja online dostępna 24/7.`),
        ...(company.logo && { 
          logo: {
            '@type': 'ImageObject',
            url: company.logo,
            width: 400,
            height: 400,
          },
          image: company.logo,
        }),
        ...(company.banner && { image: company.banner }),
        ...(company.phone && { telephone: company.phone }),
        ...(company.email && { email: company.email }),
        ...(company.address && company.city && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: company.address,
            addressLocality: company.city,
            addressCountry: isEnglish ? 'EU' : 'PL',
          },
        }),
        ...(company.city && {
          areaServed: {
            '@type': 'City',
            name: company.city,
          },
        }),
        ...(company.openingHours && {
          openingHoursSpecification: generateOpeningHoursSpecification(company.openingHours),
        }),
        // Social media
        ...(company.socialMedia && {
          sameAs: [
            company.socialMedia.facebook,
            company.socialMedia.instagram,
            company.socialMedia.website,
          ].filter(Boolean),
        }),
        // Potencjalna akcja - rezerwacja
        potentialAction: {
          '@type': 'ReserveAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: canonicalUrl,
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          result: {
            '@type': 'Reservation',
            name: isEnglish ? 'Appointment Booking' : 'Rezerwacja wizyty',
          },
        },
        // Akceptowane metody płatności
        paymentAccepted: isEnglish ? 'Cash, Credit Card, Online Payment' : 'Gotówka, Karta, Płatność online',
        priceRange: '$$',
      },
      // WebSite
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}/#website`,
        url: canonicalUrl,
        name: company.businessName,
        description: company.description || (isEnglish 
          ? `Online booking for ${company.businessName}`
          : `Rezerwacja online w ${company.businessName}`),
        publisher: {
          '@id': `${canonicalUrl}/#business`,
        },
        inLanguage: isEnglish ? 'en' : 'pl-PL',
      },
      // WebPage
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}/#webpage`,
        url: canonicalUrl,
        name: company.city 
          ? `${company.businessName} | ${company.city}`
          : company.businessName,
        description: company.description || (isEnglish 
          ? `Book your appointment at ${company.businessName}. Online booking available 24/7.`
          : `Zarezerwuj wizytę w ${company.businessName}. Rezerwacja online dostępna 24/7.`),
        isPartOf: {
          '@id': `${canonicalUrl}/#website`,
        },
        about: {
          '@id': `${canonicalUrl}/#business`,
        },
        inLanguage: isEnglish ? 'en' : 'pl-PL',
      },
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isEnglish ? 'Home' : 'Strona główna',
            item: canonicalUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isEnglish ? 'Book Appointment' : 'Rezerwacja',
            item: canonicalUrl,
          },
        ],
      },
    ],
  }
  
  // Dodaj usługi jako Service schema jeśli są dostępne
  if (company.services && company.services.length > 0) {
    const servicesSchema = company.services.slice(0, 10).map((service, index) => ({
      '@type': 'Service',
      '@id': `${canonicalUrl}/#service-${index}`,
      name: service.name,
      provider: {
        '@id': `${canonicalUrl}/#business`,
      },
      ...(service.category && { serviceType: service.category }),
      ...(service.price && {
        offers: {
          '@type': 'Offer',
          price: service.price,
          priceCurrency: isEnglish ? 'EUR' : 'PLN',
          availability: 'https://schema.org/InStock',
        },
      }),
      ...(service.duration && {
        duration: `PT${service.duration}M`,
      }),
      areaServed: company.city ? {
        '@type': 'City',
        name: company.city,
      } : undefined,
    }))
    
    jsonLd['@graph'].push(...servicesSchema)
  }
  
  return jsonLd
}

// Generowanie JSON-LD jako string do wstrzyknięcia w HTML
export function generateJsonLdScript(company: CompanyData, subdomain: string): string {
  const jsonLd = generateLocalBusinessJsonLd(company, subdomain)
  return JSON.stringify(jsonLd)
}
