import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/partners/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Przekaż cookie z backendu
    const setCookie = response.headers.get('set-cookie');
    const res = NextResponse.json(data);
    
    if (setCookie) {
      res.headers.set('set-cookie', setCookie);
    } else {
      // Ustaw cookie ręcznie jeśli backend nie ustawił
      res.cookies.set('partner_id', data.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 dni
        sameSite: 'lax',
        path: '/',
      });
    }

    return res;
  } catch (error: any) {
    console.error('Partner login error:', error);
    return NextResponse.json(
      { message: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
