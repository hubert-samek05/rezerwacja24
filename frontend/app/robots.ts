import { MetadataRoute } from 'next'
import { getCurrentDomain } from '@/lib/seo-config'

export default function robots(): MetadataRoute.Robots {
  const domain = getCurrentDomain()
  const baseUrl = `https://${domain}`
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/admin/',
          '/subscription/',
          '/payment/',
          '/auth/',
          '/_next/',
          '/forgot-password/',
          '/reset-password/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/admin/',
          '/subscription/',
          '/payment/',
          '/auth/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/admin/',
          '/subscription/',
          '/payment/',
          '/auth/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
