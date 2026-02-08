import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id');

    console.log('🔄 Proxying to backend:', {
      url: `${BACKEND_URL}/api/api-keys/generate`,
      tenantId,
      body
    });

    const response = await fetch(`${BACKEND_URL}/api/api-keys/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('✅ Backend response:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
