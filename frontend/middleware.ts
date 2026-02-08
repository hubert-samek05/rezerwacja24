import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

// Helper do sprawdzania trybu konserwacji
// UWAGA: Edge Runtime nie obsługuje fs/path/process.cwd - sprawdzamy tylko przez zmienną środowiskową
async function checkMaintenanceMode(request: NextRequest) {
  // Sprawdź zmienną środowiskową
  if (process.env.MAINTENANCE_MODE === 'true') {
    return true;
  }
  return false;
}

interface JWTPayload {
  sub: string
  email: string
  tenantId: string
  role: string
}

// Domeny i ich języki
const DOMAIN_LOCALES: Record<string, string> = {
  'rezerwacja24.pl': 'pl',
  'bookings24.eu': 'en',
}

// Pobierz bazową domenę (bez subdomeny)
function getBaseDomain(hostname: string): string {
  const host = hostname.split(':')[0]
  const parts = host.split('.')
  if (parts.length >= 2) {
    return parts.slice(-2).join('.')
  }
  return host
}

// Pobierz język na podstawie domeny
function getLocaleFromDomain(hostname: string): string {
  const baseDomain = getBaseDomain(hostname)
  return DOMAIN_LOCALES[baseDomain] || 'pl'
}

// Helper do tworzenia response z locale (tylko jeśli nie ma cookie)
function createResponseWithLocale(request: NextRequest, defaultLocale: string, response?: NextResponse): NextResponse {
  const res = response || NextResponse.next()
  
  // Sprawdź czy użytkownik już wybrał język (cookie istnieje)
  const existingLocale = request.cookies.get('locale')?.value
  if (!existingLocale) {
    // Brak cookie - ustaw domyślny na podstawie domeny
    res.cookies.set('locale', defaultLocale, { path: '/', sameSite: 'lax', maxAge: 31536000 })
  }
  // Jeśli cookie istnieje - nie nadpisuj (użytkownik wybrał język)
  
  return res
}

// Ścieżki, które mają być dostępne podczas konserwacji
const ALLOWED_PATHS_DURING_MAINTENANCE = [
  '/maintenance',
  '/_next',
  '/favicon.ico',
  '/assets',
  '/images',
  '/api/auth',
  '/api/health'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Sprawdź czy to jest dozwolona ścieżka podczas konserwacji
  const isAllowedPath = ALLOWED_PATHS_DURING_MAINTENANCE.some(path => 
    pathname.startsWith(path)
  );
  
  // Pomiń sprawdzanie dla statycznych plików i dozwolonych ścieżek
  if (isAllowedPath || /\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  // Sprawdź tryb konserwacji
  const isMaintenance = await checkMaintenanceMode(request);
  
  if (isMaintenance) {
    // Jeśli to nie jest strona konserwacji, przekieruj na nią
    if (!pathname.startsWith('/maintenance')) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith('/maintenance')) {
    // Jeśli tryb konserwacji jest wyłączony, przekieruj na stronę główną
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl
  
  // Domyślny język na podstawie domeny (używany tylko gdy brak cookie)
  const defaultLocale = getLocaleFromDomain(hostname)

  // Przekierowanie www → non-www (canonical URL - zapobiega duplicate content)
  if (hostname.startsWith('www.')) {
    const newHost = hostname.replace('www.', '')
    const newUrl = new URL(url.pathname + url.search, `https://${newHost}`)
    return NextResponse.redirect(newUrl, 301)
  }

  const subdomain = extractSubdomain(hostname)

  // Main domain - redirect auth pages and dashboard to app subdomain
  if (!subdomain) {
    // Ścieżki które powinny być tylko na app.rezerwacja24.pl
    const appOnlyPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/dashboard']
    const shouldRedirectToApp = appOnlyPaths.some(path => url.pathname.startsWith(path))
    
    if (shouldRedirectToApp && !hostname.includes('localhost')) {
      // Przekieruj na app.rezerwacja24.pl (lub app.bookings24.eu)
      const baseDomain = getBaseDomain(hostname)
      const appUrl = new URL(url.pathname, `https://app.${baseDomain}`)
      appUrl.search = url.search
      return NextResponse.redirect(appUrl, 301) // 301 = permanent redirect (dla SEO)
    }
    return createResponseWithLocale(request, defaultLocale)
  }

  // Admin subdomain (app.rezerwacja24.pl)
  if (subdomain === 'app') {
    // Strony które NIE wymagają sprawdzania subskrypcji
    const publicPaths = [
      '/login',
      '/register',
      '/subscription/checkout',
      '/subscription/setup',
      '/payment/success',
      '/payment/error',
      '/auth/callback',
      '/dashboard/settings', // Ustawienia dostępne dla zablokowanych kont
    ]
    
    if (publicPaths.some(path => url.pathname.startsWith(path))) {
      return createResponseWithLocale(request, defaultLocale)
    }

    // Panel Admin - wymaga tokena i roli SUPER_ADMIN
    if (url.pathname.startsWith('/admin')) {
      const token = request.cookies.get('token')?.value
      
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Sprawdź rolę
      try {
        const decoded = jwtDecode<JWTPayload>(token)
        if (decoded.role !== 'SUPER_ADMIN') {
          // Nie jest adminem - przekieruj do dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      return createResponseWithLocale(request, defaultLocale)
    }

    // Dashboard wymaga tokena i subskrypcji
    if (url.pathname.startsWith('/dashboard')) {
      const token = request.cookies.get('token')?.value
      
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Sprawdź subskrypcję
      const hasAccess = await checkSubscriptionAccess(token, hostname)
      
      if (!hasAccess) {
        // Brak subskrypcji - przekieruj do ustawień (nie checkout)
        return NextResponse.redirect(new URL('/dashboard/settings', request.url))
      }
    }
    
    // Redirect root to dashboard
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return createResponseWithLocale(request, defaultLocale)
  }

  // API subdomain
  if (subdomain === 'api') {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id')
    return response
  }

  // Tenant subdomain
  if (url.pathname.startsWith('/api/')) {
    return createResponseWithLocale(request, defaultLocale)
  }
  
  const rewriteUrl = new URL(`/${subdomain}${url.pathname}`, request.url)
  const rewriteResponse = NextResponse.rewrite(rewriteUrl)
  rewriteResponse.headers.set('x-tenant-subdomain', subdomain)
  // Ustaw locale tylko jeśli nie ma cookie
  const existingLocale = request.cookies.get('locale')?.value
  if (!existingLocale) {
    rewriteResponse.cookies.set('locale', defaultLocale, { path: '/', sameSite: 'lax', maxAge: 31536000 })
  }
  
  return rewriteResponse
}

async function checkSubscriptionAccess(token: string, hostname: string): Promise<boolean> {
  try {
    // Dekoduj token aby uzyskać tenantId i rolę
    let tenantId: string | undefined
    let role: string | undefined
    try {
      const decoded = jwtDecode<JWTPayload>(token)
      tenantId = decoded.tenantId
      role = decoded.role
    } catch {
      return false
    }

    // SUPER_ADMIN nie wymaga subskrypcji
    if (role === 'SUPER_ADMIN') {
      return true
    }

    if (!tenantId) {
      return false
    }

    // Wybierz odpowiedni API URL na podstawie domeny
    const baseDomain = getBaseDomain(hostname)
    const apiUrl = baseDomain === 'bookings24.eu' 
      ? 'https://api.bookings24.eu/api/billing/subscription/status'
      : 'https://api.rezerwacja24.pl/api/billing/subscription/status'

    // Wywołaj backend bezpośrednio z tenantId
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    
    // Pozwól jeśli ma aktywną subskrypcję LUB jest w trial
    return Boolean(data?.hasActiveSubscription) || Boolean(data?.isInTrial)
  } catch (error) {
    console.error('Error checking subscription:', error)
    // W przypadku błędu - pozwól (lepsze UX niż blokowanie)
    return true
  }
}

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0]
  const parts = host.split('.')
  
  if (parts.length < 2 || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }
  
  if (parts.length === 2) {
    return null
  }
  
  if (parts.length >= 3) {
    return parts[0]
  }
  
  return null
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
