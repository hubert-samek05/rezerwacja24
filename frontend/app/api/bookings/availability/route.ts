import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

// GET - pobierz dostępne terminy dla usługi i pracownika
export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId')
  const serviceId = request.nextUrl.searchParams.get('serviceId')
  const employeeId = request.nextUrl.searchParams.get('employeeId')
  const date = request.nextUrl.searchParams.get('date')
  
  if (!tenantId || !serviceId || !employeeId || !date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    // Wywołaj backend API
    const response = await fetch(
      `${API_URL}/api/bookings/availability?tenantId=${tenantId}&serviceId=${serviceId}&employeeId=${employeeId}&date=${date}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || 'Failed to check availability' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error getting available slots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
