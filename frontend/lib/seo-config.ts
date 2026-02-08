import type { Metadata } from 'next'

export type SeoLocale = 'pl' | 'en'

interface SeoConfig {
  metadata: Metadata
  jsonLd: object
  htmlLang: string
}

// Polish SEO for rezerwacja24.pl
const plSeoConfig: SeoConfig = {
  htmlLang: 'pl',
  metadata: {
    metadataBase: new URL('https://rezerwacja24.pl'),
    title: {
      default: 'Rezerwacja24 - System rezerwacji online dla firm | Kalendarz, SMS, CRM',
      template: '%s | Rezerwacja24 - System rezerwacji online'
    },
    description: 'Rezerwacja24.pl - profesjonalny system rezerwacji online dla salonów kosmetycznych, fryzjerów, gabinetów masażu. Kalendarz online, powiadomienia SMS, CRM, płatności. 7 dni za darmo!',
    keywords: [
      'system rezerwacji online',
      'rezerwacje online',
      'kalendarz rezerwacji',
      'booking system',
      'rezerwacja wizyt',
      'system do rezerwacji',
      'rezerwacja24',
      'rezerwacja24.pl',
      'rezerwacje dla fryzjera',
      'rezerwacje online fryzjer',
      'system rezerwacji fryzjer',
      'kalendarz dla fryzjera',
      'rezerwacja do fryzjera online',
      'rezerwacje kosmetyczka',
      'rezerwacje online kosmetyczka',
      'system rezerwacji kosmetyczka',
      'salon kosmetyczny rezerwacje',
      'gabinet kosmetyczny rezerwacje',
      'oprogramowanie dla salonu',
      'system rezerwacji dla salonu',
      'salon beauty rezerwacje',
      'rezerwacje masaż',
      'system rezerwacji masażysta',
      'gabinet masażu rezerwacje',
      'rezerwacje fizjoterapeuta',
      'system rezerwacji fizjoterapia',
      'rezerwacje barber',
      'barber shop rezerwacje',
      'kalendarz wizyt online',
      'powiadomienia sms',
      'przypomnienia sms',
      'aplikacja do rezerwacji',
      'program do rezerwacji wizyt',
      'darmowy system rezerwacji',
      'system bookingowy',
      'umawianie wizyt online',
      'najlepszy system rezerwacji online',
      'polski system rezerwacji',
      'alternatywa dla booksy',
    ],
    authors: [{ name: 'Rezerwacja24.pl', url: 'https://rezerwacja24.pl' }],
    creator: 'Rezerwacja24.pl',
    publisher: 'Rezerwacja24.pl',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: 'https://rezerwacja24.pl',
      languages: {
        'pl-PL': 'https://rezerwacja24.pl',
        'en': 'https://bookings24.eu',
      },
    },
    openGraph: {
      title: 'Rezerwacja24.pl - Profesjonalny system rezerwacji online',
      description: 'System rezerwacji online dla firm usługowych. Kalendarz, CRM, SMS, płatności online. Wypróbuj 7 dni za darmo bez karty kredytowej!',
      url: 'https://rezerwacja24.pl',
      siteName: 'Rezerwacja24.pl',
      images: [
        {
          url: 'https://rezerwacja24.pl/og',
          width: 1200,
          height: 630,
          alt: 'Rezerwacja24.pl - system rezerwacji online dla firm usługowych',
        },
      ],
      locale: 'pl_PL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Rezerwacja24.pl - system rezerwacji online',
      description: 'Profesjonalny system rezerwacji dla firm usługowych. Kalendarz, CRM, SMS, płatności online. 7 dni za darmo!',
      images: {
        url: 'https://rezerwacja24.pl/og',
        alt: 'Rezerwacja24.pl - system rezerwacji online',
      },
      creator: '@rezerwacja24',
      site: '@rezerwacja24',
    },
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
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/icon.svg', color: '#00FF88' },
      ],
    },
    manifest: '/manifest.json',
    category: 'technology',
    verification: {
      google: 'dGLLnQD9GvZuzPrue1GFC7y69t06ySwytRdcvB5OlGQ',
    },
    other: {
      'msapplication-TileColor': '#00FF88',
      'msapplication-config': '/browserconfig.xml',
    },
  },
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://rezerwacja24.pl/#website',
        'url': 'https://rezerwacja24.pl',
        'name': 'Rezerwacja24.pl',
        'description': 'System rezerwacji online dla firm usługowych - salony kosmetyczne, fryzjerzy, gabinety',
        'publisher': {
          '@id': 'https://rezerwacja24.pl/#organization'
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://rezerwacja24.pl/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        'inLanguage': 'pl-PL'
      },
      {
        '@type': 'Organization',
        '@id': 'https://rezerwacja24.pl/#organization',
        'name': 'Rezerwacja24.pl',
        'url': 'https://rezerwacja24.pl',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://rezerwacja24.pl/logo.png',
          'width': 512,
          'height': 512
        },
        'description': 'Profesjonalny system rezerwacji online dla firm usługowych w Polsce',
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'kontakt@rezerwacja24.pl',
          'contactType': 'customer service',
          'availableLanguage': 'Polish',
          'areaServed': 'PL'
        },
        'sameAs': [
          'https://www.facebook.com/profile.php?id=61583476963744',
          'https://www.linkedin.com/company/rezerwacja24',
          'https://www.instagram.com/rezerwacja24'
        ]
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://rezerwacja24.pl/#software',
        'name': 'Rezerwacja24.pl - system rezerwacji online',
        'applicationCategory': 'BusinessApplication',
        'applicationSubCategory': 'Booking System',
        'operatingSystem': 'Web',
        'description': 'System rezerwacji online z kalendarzem, CRM, powiadomieniami SMS i płatnościami dla firm usługowych',
        'offers': {
          '@type': 'Offer',
          'price': '79.99',
          'priceCurrency': 'PLN',
          'priceValidUntil': '2027-12-31',
          'availability': 'https://schema.org/InStock'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'ratingCount': '247',
          'bestRating': '5',
          'worstRating': '1'
        },
        'featureList': [
          'Kalendarz rezerwacji online',
          'CRM - zarządzanie klientami',
          'Powiadomienia SMS',
          'Płatności online',
          'Integracja z Google Calendar',
          'Panel dla klientów',
          'Raporty i analityka'
        ]
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://rezerwacja24.pl/#breadcrumb',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Strona główna',
            'item': 'https://rezerwacja24.pl'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Funkcje',
            'item': 'https://rezerwacja24.pl/#funkcje'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Cennik',
            'item': 'https://rezerwacja24.pl/#cennik'
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': 'Kontakt',
            'item': 'https://rezerwacja24.pl/contact'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://rezerwacja24.pl/#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Ile kosztuje system rezerwacji Rezerwacja24?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Rezerwacja24.pl kosztuje 79,99 zł miesięcznie. Oferujemy 7 dni darmowego okresu próbnego bez karty kredytowej.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Czy mogę wypróbować system za darmo?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Tak! Oferujemy 7-dniowy darmowy okres próbny. Nie wymagamy karty kredytowej do rejestracji.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Dla jakich branż jest przeznaczony system?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Rezerwacja24.pl jest idealny dla salonów kosmetycznych, fryzjerów, gabinetów masażu, fizjoterapeutów, trenerów personalnych i innych firm usługowych.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Czy system wysyła przypomnienia SMS?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Tak, system automatycznie wysyła przypomnienia SMS do klientów przed wizytą. Możesz skonfigurować czas wysyłki i treść wiadomości.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Jak długo trwa konfiguracja systemu?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Konfiguracja podstawowa zajmuje około 15 minut. Wystarczy dodać usługi, pracowników i ustawić godziny pracy. System jest gotowy do przyjmowania rezerwacji od razu po rejestracji.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Czy mogę zintegrować system z moją stroną internetową?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Tak! Oferujemy widget rezerwacyjny, który możesz łatwo osadzić na swojej stronie WWW. Wystarczy skopiować kod JavaScript i wkleić go na swoją stronę.'
            }
          }
        ]
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://rezerwacja24.pl/#localbusiness',
        'name': 'Rezerwacja24.pl - Akademia Rozwoju EDUCRAFT',
        'description': 'Profesjonalny system rezerwacji online dla firm usługowych w Polsce',
        'url': 'https://rezerwacja24.pl',
        'telephone': '+48506785959',
        'email': 'kontakt@rezerwacja24.pl',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'ul. Lipowa 3d',
          'addressLocality': 'Kraków',
          'postalCode': '30-702',
          'addressCountry': 'PL'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': '50.0469',
          'longitude': '19.9450'
        },
        'openingHoursSpecification': [
          {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'opens': '09:00',
            'closes': '17:00'
          }
        ],
        'priceRange': '$$',
        'image': 'https://rezerwacja24.pl/og-image.png'
      }
    ]
  }
}

// English SEO for bookings24.eu
const enSeoConfig: SeoConfig = {
  htmlLang: 'en',
  metadata: {
    metadataBase: new URL('https://bookings24.eu'),
    title: {
      default: 'Bookings24 - Online Booking System for Businesses | Calendar, SMS, CRM',
      template: '%s | Bookings24 - Online Booking Software'
    },
    description: 'Bookings24.eu - Professional online booking system for beauty salons, hairdressers, massage studios, and service businesses. Online calendar, SMS reminders, CRM, payments. 7-day free trial!',
    keywords: [
      // Main keywords
      'online booking system',
      'appointment scheduling software',
      'booking calendar',
      'appointment booking',
      'scheduling system',
      'bookings24',
      'bookings24.eu',
      
      // Industries - Hair & Beauty
      'salon booking system',
      'hair salon appointments',
      'beauty salon scheduling',
      'hairdresser booking software',
      'beauty appointment system',
      'spa booking software',
      
      // Industries - Wellness
      'massage booking system',
      'physiotherapy scheduling',
      'wellness appointment software',
      'fitness booking system',
      'personal trainer scheduling',
      
      // Industries - Other
      'barber shop booking',
      'tattoo studio appointments',
      'nail salon scheduling',
      'lash studio booking',
      
      // Features
      'online appointment calendar',
      'SMS appointment reminders',
      'client management CRM',
      'online payment booking',
      'staff scheduling software',
      
      // General
      'appointment management',
      'booking software for small business',
      'free booking system',
      'best appointment scheduling app',
      'European booking software',
      'GDPR compliant booking system',
      
      // Comparisons
      'Calendly alternative',
      'Acuity alternative',
      'Booksy alternative Europe',
      'affordable booking software',
    ],
    authors: [{ name: 'Bookings24.eu', url: 'https://bookings24.eu' }],
    creator: 'Bookings24.eu',
    publisher: 'Bookings24.eu',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: 'https://bookings24.eu',
      languages: {
        'en': 'https://bookings24.eu',
        'pl-PL': 'https://rezerwacja24.pl',
      },
    },
    openGraph: {
      title: 'Bookings24 - Professional Online Booking System',
      description: 'Online booking system for service businesses. Calendar, CRM, SMS reminders, online payments. Try 7 days free - no credit card required!',
      url: 'https://bookings24.eu',
      siteName: 'Bookings24.eu',
      images: [
        {
          url: 'https://bookings24.eu/og',
          width: 1200,
          height: 630,
          alt: 'Bookings24 - Online booking system for service businesses',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Bookings24 - Online Booking System',
      description: 'Professional booking system for service businesses. Calendar, CRM, SMS, online payments. 7 days free!',
      images: {
        url: 'https://bookings24.eu/og',
        alt: 'Bookings24 - Online booking system',
      },
      creator: '@bookings24eu',
      site: '@bookings24eu',
    },
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
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/icon.svg', color: '#00FF88' },
      ],
    },
    manifest: '/manifest.json',
    category: 'technology',
    other: {
      'msapplication-TileColor': '#00FF88',
      'msapplication-config': '/browserconfig.xml',
    },
  },
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://bookings24.eu/#website',
        'url': 'https://bookings24.eu',
        'name': 'Bookings24.eu',
        'description': 'Online booking system for service businesses - beauty salons, hairdressers, wellness studios',
        'publisher': {
          '@id': 'https://bookings24.eu/#organization'
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://bookings24.eu/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        'inLanguage': 'en'
      },
      {
        '@type': 'Organization',
        '@id': 'https://bookings24.eu/#organization',
        'name': 'Bookings24.eu',
        'url': 'https://bookings24.eu',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://bookings24.eu/logo-en.png',
          'width': 512,
          'height': 512
        },
        'description': 'Professional online booking system for service businesses in Europe',
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'contact@bookings24.eu',
          'contactType': 'customer service',
          'availableLanguage': ['English', 'German', 'Polish'],
          'areaServed': 'EU'
        },
        'sameAs': [
          'https://www.facebook.com/bookings24eu',
          'https://www.linkedin.com/company/bookings24',
          'https://www.instagram.com/bookings24eu'
        ]
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://bookings24.eu/#software',
        'name': 'Bookings24 - Online Booking System',
        'applicationCategory': 'BusinessApplication',
        'applicationSubCategory': 'Booking System',
        'operatingSystem': 'Web',
        'description': 'Online booking system with calendar, CRM, SMS notifications and payments for service businesses',
        'offers': {
          '@type': 'Offer',
          'price': '19.99',
          'priceCurrency': 'EUR',
          'priceValidUntil': '2027-12-31',
          'availability': 'https://schema.org/InStock'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'ratingCount': '247',
          'bestRating': '5',
          'worstRating': '1'
        },
        'featureList': [
          'Online booking calendar',
          'Customer CRM management',
          'SMS notifications',
          'Online payments',
          'Google Calendar integration',
          'Customer portal',
          'Reports and analytics'
        ]
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://bookings24.eu/#breadcrumb',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://bookings24.eu'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Features',
            'item': 'https://bookings24.eu/#features'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Pricing',
            'item': 'https://bookings24.eu/#pricing'
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': 'Contact',
            'item': 'https://bookings24.eu/contact'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://bookings24.eu/#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How much does Bookings24 cost?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Bookings24 costs €19.99 per month. We offer a 7-day free trial without requiring a credit card.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I try the system for free?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! We offer a 7-day free trial. No credit card required to sign up.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What industries is the system designed for?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Bookings24 is perfect for beauty salons, hairdressers, massage studios, physiotherapists, personal trainers, and other service businesses.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Does the system send SMS reminders?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, the system automatically sends SMS reminders to clients before their appointments. You can configure the timing and message content.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How long does it take to set up?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Basic setup takes about 15 minutes. Just add your services, staff members, and set working hours. The system is ready to accept bookings immediately after registration.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I integrate the system with my website?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! We offer a booking widget that you can easily embed on your website. Just copy the JavaScript code and paste it on your site.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is Bookings24 GDPR compliant?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, Bookings24 is fully GDPR compliant. All data is stored on EU servers with SSL encryption and regular backups.'
            }
          }
        ]
      },
      {
        '@type': 'Organization',
        '@id': 'https://bookings24.eu/#business',
        'name': 'Bookings24.eu',
        'description': 'Professional online booking system for service businesses in Europe',
        'url': 'https://bookings24.eu',
        'email': 'contact@bookings24.eu',
        'areaServed': {
          '@type': 'GeoShape',
          'name': 'European Union'
        },
        'priceRange': '€€',
        'image': 'https://bookings24.eu/og-image-en.png'
      }
    ]
  }
}

// Get current domain from environment variable
export function getCurrentDomain(): string {
  return process.env.NEXT_PUBLIC_DOMAIN || 'rezerwacja24.pl'
}

// Check if current domain is English version
export function isEnglishDomain(): boolean {
  return getCurrentDomain() === 'bookings24.eu'
}

// Get SEO config based on environment variable
export function getSeoConfig(): SeoConfig {
  if (isEnglishDomain()) {
    return enSeoConfig
  }
  return plSeoConfig
}

// Get locale from environment
export function getSeoLocale(): SeoLocale {
  if (isEnglishDomain()) {
    return 'en'
  }
  return 'pl'
}

export { plSeoConfig, enSeoConfig }
