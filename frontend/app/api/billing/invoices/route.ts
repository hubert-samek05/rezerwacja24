import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

// GET - pobierz faktury
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
    const decoded = jwtDecode<JWTPayload>(token);
    const tenantId = decoded.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { message: 'Tenant ID not found in token' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/billing/invoices`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
