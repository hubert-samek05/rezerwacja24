import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

// POST - zmień plan subskrypcji
export async function POST(request: NextRequest) {
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
    const decoded = jwtDecode<JWTPayload>(token);
    const tenantId = decoded.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { message: 'Tenant ID not found in token' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { message: 'Plan ID is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/billing/plan/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ planId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Przekaż oryginalny komunikat błędu z backendu
      return NextResponse.json(
        { 
          error: errorData.message || 'Nie udało się zmienić planu',
          message: errorData.message || 'Nie udało się zmienić planu'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error changing plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
