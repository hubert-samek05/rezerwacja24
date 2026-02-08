import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    // Pobierz token z cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      console.error('Checkout session - NO TOKEN FOUND');
      return NextResponse.json(
        { message: 'Unauthorized - brak tokena' },
        { status: 401 }
      );
    }

    // Dekoduj token aby uzyskać tenantId
    const decoded = jwtDecode<JWTPayload>(token);
    const tenantId = decoded.tenantId;

    if (!tenantId) {
      console.error('Checkout session - NO TENANT ID IN TOKEN');
      return NextResponse.json(
        { message: 'Tenant ID not found in token' },
        { status: 400 }
      );
    }

    console.log('Checkout session - Token:', 'EXISTS');
    console.log('Checkout session - TenantId from token:', tenantId);
    console.log('Checkout session - Email:', email);
    
    console.log('Checkout session - Sending to backend:', `${API_URL}/api/billing/checkout-session`);
    
    const response = await fetch(`${API_URL}/api/billing/checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Backend error:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
