import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

// GET - pobierz dostępne terminy dla usługi i pracownika
export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId')
  const serviceId = request.nextUrl.searchParams.get('serviceId')
  const employeeId = request.nextUrl.searchParams.get('employeeId')
  const date = request.nextUrl.searchParams.get('date')
  const duration = request.nextUrl.searchParams.get('duration') // Dla elastycznych usług
  
  if (!tenantId || !serviceId || !employeeId || !date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    // Wywołaj backend API - dodaj duration jeśli przekazany
    let url = `${API_URL}/api/bookings/availability?tenantId=${tenantId}&serviceId=${serviceId}&employeeId=${employeeId}&date=${date}`
    if (duration) {
      url += `&duration=${duration}`
    }
    const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
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

// POST - utwórz nową rezerwację
export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    
    if (!bookingData.tenantId || !bookingData.serviceId || !bookingData.employeeId || 
        !bookingData.date || !bookingData.time || !bookingData.customerName || !bookingData.customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Wywołaj backend API
    const response = await fetch(`${API_URL}/api/bookings/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
