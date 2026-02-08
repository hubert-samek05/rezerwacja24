// Synchronizacja tenanta z bazą danych

export const ensureTenantExists = async (userId: string, userData: any): Promise<string | null> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
    
    // Sprawdź czy tenant już istnieje
    const checkResponse = await fetch(`${API_URL}/api/tenants/${userId}`)
    
    if (checkResponse.ok) {
      const tenant = await checkResponse.json()
      return tenant.id
    }
    
    // Jeśli nie istnieje, utwórz nowego tenanta
    const createResponse = await fetch(`${API_URL}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userId,
        name: userData.businessName || 'Moja Firma',
        subdomain: generateSubdomain(userData.businessName || 'moja-firma'),
        email: userData.email,
        ownerId: userId,
      }),
    })
    
    if (createResponse.ok) {
      const tenant = await createResponse.json()
      return tenant.id
    }
    
    return null
  } catch (error) {
    console.error('Error ensuring tenant exists:', error)
    return null
  }
}

const generateSubdomain = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30)
}
