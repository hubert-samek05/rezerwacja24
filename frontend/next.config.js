/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dynamic distDir for multi-domain builds
  // Set NEXT_BUILD_DIR=.next-bookings24 for bookings24.eu build
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  
  // Optymalizacje wydajności
  compress: true,
  poweredByHeader: false,
  
  // Wyłącz source maps w produkcji
  productionBrowserSourceMaps: false,
  
  // Optymalizacja bundli
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
  
  // Cache headers dla static assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
  
  // Optymalizacja obrazów
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'api.rezerwacja24.pl' },
      { protocol: 'https', hostname: 'play.google.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [32, 64, 128, 256],
  },
  
  // Optymalizacja kompilacji
  swcMinify: true,
  
  // Wyłącz niepotrzebne funkcje
  reactStrictMode: false, // Wyłącz double-render w dev
}

module.exports = nextConfig
