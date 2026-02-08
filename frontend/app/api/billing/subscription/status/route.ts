import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

function getApiUrl(host: string): string {
  if (host.includes('bookings24.eu')) {
    return 'http://localhost:4001';
  }
  return 'http://localhost:3001';
}

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

// GET - pobierz status subskrypcji (trial, dni pozostałe)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Dekoduj token aby uzyskać tenantId
    let decoded;
    try {
      decoded = jwtDecode<JWTPayload>(token);
    } catch (err) {
      console.error('❌ [Frontend API] Failed to decode token:', err);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const tenantId = decoded.tenantId;
    const role = decoded.role;

    // SUPER_ADMIN nie wymaga subskrypcji - zawsze ma dostęp
    if (role === 'SUPER_ADMIN') {
      return NextResponse.json({
        hasActiveSubscription: true,
        isInTrial: false,
        remainingTrialDays: 0,
        trialEndDate: null,
        currentPeriodEnd: null,
        isSuperAdmin: true,
      });
    }

    if (!tenantId) {
      // Zwróć że nie ma subskrypcji zamiast błędu
      return NextResponse.json({
        hasActiveSubscription: false,
        isInTrial: false,
        remainingTrialDays: 0,
        trialEndDate: null,
        currentPeriodEnd: null,
      });
    }
    
    const host = request.headers.get('host') || '';
    const API_URL = getApiUrl(host);
    
    const response = await fetch(`${API_URL}/api/billing/subscription/status`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch subscription status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
