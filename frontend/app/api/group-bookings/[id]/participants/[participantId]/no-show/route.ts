import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

// POST - oznacz uczestnika jako nieobecnego
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const tenantId = cookieStore.get('tenantId')?.value

    const response = await fetch(
      `${API_URL}/api/group-bookings/${params.id}/participants/${params.participantId}/no-show`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId || '',
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error marking no-show:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
