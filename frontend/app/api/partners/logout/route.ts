import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ message: 'Wylogowano' });
  
  // Usuń cookie partnera
  res.cookies.delete('partner_id');
  
  return res;
}
