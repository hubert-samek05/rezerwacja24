import { MetadataRoute } from 'next'
import { isEnglishDomain } from '@/lib/seo-config'

export default function manifest(): MetadataRoute.Manifest {
  const isEnglish = isEnglishDomain()
  
  return {
    name: isEnglish 
      ? 'Bookings24 - Online Booking System' 
      : 'Rezerwacja24.pl - System rezerwacji online',
    short_name: isEnglish ? 'Bookings24' : 'Rezerwacja24',
    description: isEnglish
      ? 'Professional online booking system for businesses. Calendar, CRM, SMS notifications, payments.'
      : 'Profesjonalny system rezerwacji online dla firm. Kalendarz, CRM, powiadomienia SMS, płatności.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#00FF88',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['business', 'productivity'],
    lang: isEnglish ? 'en' : 'pl-PL',
  }
}
