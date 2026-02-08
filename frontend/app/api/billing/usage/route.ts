import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let tenantId: string;
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      tenantId = decoded.tenantId;
    } catch (e) {
      console.error('[usage] Error decoding token:', e);
      return NextResponse.json({
        bookings: { used: 0, limit: null },
        employees: { used: 0, limit: null },
        sms: { used: 0, limit: null },
      });
    }

    if (!tenantId) {
      console.error('[usage] No tenantId in token');
      return NextResponse.json({
        bookings: { used: 0, limit: null },
        employees: { used: 0, limit: null },
        sms: { used: 0, limit: null },
      });
    }

    console.log('[usage] Fetching for tenantId:', tenantId);

    const response = await fetch(`${API_URL}/api/billing/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
    });

    console.log('[usage] Backend response status:', response.status);

    if (!response.ok) {
      console.error('[usage] Backend error:', response.status);
      return NextResponse.json({
        bookings: { used: 0, limit: null },
        employees: { used: 0, limit: null },
        sms: { used: 0, limit: null },
      });
    }

    const data = await response.json();
    console.log('[usage] Backend data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[usage] Error:', error);
    return NextResponse.json({
      bookings: { used: 0, limit: null },
      employees: { used: 0, limit: null },
      sms: { used: 0, limit: null },
    });
  }
}
