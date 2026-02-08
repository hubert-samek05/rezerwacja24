import { NextRequest, NextResponse } from 'next/server';

// Determine API URL based on request host
function getApiUrl(request: NextRequest): string {
  const host = request.headers.get('host') || '';
  
  // bookings24.eu -> api.bookings24.eu (separate backend)
  if (host.includes('bookings24.eu')) {
    return 'https://api.bookings24.eu';
  }
  
  // rezerwacja24.pl -> api.rezerwacja24.pl
  if (host.includes('rezerwacja24.pl')) {
    return 'https://api.rezerwacja24.pl';
  }
  
  // Development/localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

// GET - pobierz wszystkie dostępne plany (publiczny endpoint)
export async function GET(request: NextRequest) {
  try {
    const API_URL = getApiUrl(request);
    const response = await fetch(`${API_URL}/api/billing/plans`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Bez cache - zawsze świeże dane
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch plans' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
