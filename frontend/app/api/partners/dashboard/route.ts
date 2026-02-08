import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';

export async function GET(request: NextRequest) {
  try {
    const partnerId = request.cookies.get('partner_id')?.value;

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Nie zalogowano', statusCode: 401 },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/partners/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `partner_id=${partnerId}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Partner dashboard error:', error);
    return NextResponse.json(
      { message: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
