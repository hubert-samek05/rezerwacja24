import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'

// GET - pobierz firmę po subdomenie wraz z usługami i pracownikami z prawdziwej bazy danych
export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain')
  
  if (!subdomain) {
    return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
  }

  try {
    // Pobierz dane firmy z backendu (tenant po subdomenie)
    const tenantResponse = await fetch(`${API_URL}/api/tenants/subdomain/${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!tenantResponse.ok) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    const tenant = await tenantResponse.json()
    
    // Pobierz usługi dla tej firmy
    let services = []
    try {
      const servicesResponse = await fetch(`${API_URL}/api/services`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant.id,
        },
      })
      if (servicesResponse.ok) {
        services = await servicesResponse.json()
      }
    } catch (e) {
      console.error('Error fetching services:', e)
    }
    
    // Pobierz pracowników dla tej firmy z ich usługami
    let employees = []
    try {
      const employeesResponse = await fetch(`${API_URL}/api/employees`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant.id,
        },
      })
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        
        // Dla każdego pracownika pobierz jego usługi
        employees = await Promise.all(employeesData.map(async (emp: any) => {
          try {
            const servicesResponse = await fetch(`${API_URL}/api/employees/${emp.id}/services`)
            if (servicesResponse.ok) {
              const empServices = await servicesResponse.json()
              return {
                ...emp,
                services: empServices.map((s: any) => s.serviceId)
              }
            }
          } catch (e) {
            console.error(`Error fetching services for employee ${emp.id}:`, e)
          }
          return {
            ...emp,
            services: []
          }
        }))
      }
    } catch (e) {
      console.error('Error fetching employees:', e)
    }
    
    // Pobierz ustawienia płatności
    let paymentSettings = {
      acceptCashPayment: true,
      acceptOnlinePayment: false,
      stripeEnabled: false,
      przelewy24Enabled: false,
      payuEnabled: false,
      tpayEnabled: false,
      autopayEnabled: false
    }
    try {
      const paymentsResponse = await fetch(`${API_URL}/api/payments/settings`, {
        headers: {
          'x-tenant-id': tenant.id
        }
      })
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        paymentSettings = {
          acceptCashPayment: paymentsData.acceptCashPayment !== false,
          acceptOnlinePayment: paymentsData.acceptOnlinePayment || false,
          stripeEnabled: paymentsData.stripeEnabled || false,
          przelewy24Enabled: paymentsData.przelewy24Enabled || false,
          payuEnabled: paymentsData.payuEnabled || false,
          tpayEnabled: paymentsData.tpayEnabled || false,
          autopayEnabled: paymentsData.autopayEnabled || false
        }
      }
    } catch (e) {
      console.error('Error fetching payment settings:', e)
    }
    
    // Zwróć dane w formacie zgodnym z frontendem
    return NextResponse.json({
      userId: tenant.id,
      businessName: tenant.name || tenant.businessName,
      subdomain: tenant.subdomain,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      city: tenant.city,
      description: tenant.description,
      logo: tenant.logo,
      banner: tenant.banner,
      openingHours: tenant.openingHours,
      socialMedia: tenant.socialMedia,
      pageSettings: tenant.pageSettings,
      flexibleServiceSettings: tenant.flexibleServiceSettings || { showCouponCode: false, showPaymentOptions: false, availabilityHours: {} },
      gallery: tenant.gallery || [],
      paymentSettings,
      services,
      employees
    })
  } catch (error) {
    console.error('Error fetching company data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - dane zapisywane są przez backend API, nie przez frontend
