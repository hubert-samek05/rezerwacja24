import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    const response = await fetch(`${API_URL}/partners/info/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Partner info error:', error);
    return NextResponse.json(
      { valid: false },
      { status: 200 }
    );
  }
}
