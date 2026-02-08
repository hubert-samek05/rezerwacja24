/**
 * Get API URL for server-side requests based on host header
 * Used in Next.js API routes
 */
export function getServerApiUrl(host: string): string {
  if (host.includes('bookings24.eu')) {
    return 'http://localhost:4001';
  }
  return 'http://localhost:3001';
}
