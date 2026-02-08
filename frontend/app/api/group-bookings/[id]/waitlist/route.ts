import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

// GET - pobierz listę oczekujących
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const tenantId = cookieStore.get('tenantId')?.value

    const response = await fetch(`${API_URL}/api/group-bookings/${params.id}/waitlist`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId || '',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
