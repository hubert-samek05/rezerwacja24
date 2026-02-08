import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

// GET - pobierz dane do faktury
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwtDecode<JWTPayload>(token);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const tenantId = decoded.tenantId;

    const response = await fetch(`${API_URL}/api/tenants/${tenantId}/billing-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
    });

    if (!response.ok) {
      // Jeśli endpoint nie istnieje, zwróć puste dane
      if (response.status === 404) {
        return NextResponse.json({
          wantInvoice: false,
          billingCompanyName: '',
          nip: '',
          billingAddress: '',
          billingPostalCode: '',
          billingCity: '',
          billingEmail: '',
        });
      }
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - zapisz dane do faktury
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwtDecode<JWTPayload>(token);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const tenantId = decoded.tenantId;
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/tenants/${tenantId}/billing-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving billing data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
