import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
}

// POST - spróbuj ponownie pobrać zaległą płatność
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

    const decoded = jwtDecode<JWTPayload>(token);
    const tenantId = decoded.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { message: 'Tenant ID not found' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/billing/retry-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
