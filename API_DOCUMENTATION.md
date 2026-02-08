# API Documentation - Rezerwacja24

## ⚠️ WAŻNE - Konwencje nazewnictwa

### Backend (Prisma/Database)
Backend używa **lowercase z underscores** dla nazw tabel i relacji:
- `tenants` (nie `Tenant`)
- `service_categories` (nie `ServiceCategory`)
- `service_employees` (nie `ServiceEmployee`)
- `tenant_users` (nie `TenantUser`)

### Frontend (TypeScript)
Frontend może używać różnych konwencji w zależności od kontekstu:
- Typy API: używaj nazw z backendu (`service_categories`)
- Typy lokalne: mogą używać camelCase (`businessName`)

## 🔑 Kluczowe Endpointy

### Tenants (Firmy)

#### GET /api/tenants/:id
Pobiera dane firmy po ID.
```typescript
Response: {
  id: string
  name: string              // ⚠️ Backend: "name", Frontend może mapować na "businessName"
  subdomain: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  logo: string | null
  banner: string | null
  timezone: string
  language: string
  // ... inne pola
}
```

#### PATCH /api/tenants/:id
Aktualizuje dane firmy.
```typescript
Body: {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  // ... inne pola
}
```

#### PUT /api/tenants/:id/branding
Aktualizuje tylko logo i banner.
```typescript
Body: {
  logo?: string
  banner?: string
}
```

### Services (Usługi)

#### GET /api/services
Pobiera listę usług.
```typescript
Response: Array<{
  id: string
  name: string
  categoryId: string | null
  service_categories?: {     // ⚠️ ZAWSZE używaj "service_categories" nie "category"
    id: string
    name: string
    color: string
  }
  service_employees?: Array<{  // ⚠️ ZAWSZE używaj "service_employees" nie "employees"
    id: string
    employeeId: string
    employees: {              // Zagnieżdżony obiekt pracownika
      id: string
      firstName: string
      lastName: string
    }
  }>
  basePrice: string
  duration: number
  isActive: boolean
  _count?: {
    bookings: number
  }
}>
```

#### PATCH /api/services/:id
Aktualizuje usługę.
```typescript
Body: {
  name?: string
  description?: string
  categoryId?: string        // ⚠️ Używaj categoryId bezpośrednio, nie relacji
  basePrice?: number
  duration?: number
  employeeIds?: string[]     // Backend automatycznie utworzy relacje service_employees
  // ... inne pola
}
```

### Employees (Pracownicy)

#### GET /api/employees
```typescript
Response: Array<{
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  service_employees?: Array<{  // ⚠️ Relacje do usług
    serviceId: string
    services: {
      id: string
      name: string
    }
  }>
}>
```

### Bookings (Rezerwacje)

#### GET /api/bookings
```typescript
Response: Array<{
  id: string
  customerId: string
  serviceId: string
  employeeId: string
  customers: {               // ⚠️ ZAWSZE "customers" nie "customer"
    firstName: string
    lastName: string
    email: string
  }
  services: {                // ⚠️ ZAWSZE "services" nie "service"
    name: string
  }
  employees: {               // ⚠️ ZAWSZE "employees" nie "employee"
    firstName: string
    lastName: string
  }
  startTime: string
  endTime: string
  status: string
  totalPrice: string
}>
```

## 🚨 Najczęstsze Pułapki

### 1. Nazwy relacji (liczba pojedyncza vs mnoga)
❌ **BŁĄD:**
```typescript
booking.customer.firstName    // NIE!
service.category.name         // NIE!
service.employees             // NIE! (to nie relacja, tylko pole)
```

✅ **POPRAWNIE:**
```typescript
booking.customers.firstName   // TAK!
service.service_categories.name  // TAK!
service.service_employees     // TAK!
```

### 2. Mapowanie Backend ↔ Frontend
Backend zwraca `name`, ale frontend może używać `businessName`:
```typescript
// Przy zapisie do API:
const apiData = {
  name: companyData.businessName  // Mapuj businessName → name
}

// Po odczycie z API:
const frontendData = {
  businessName: apiResponse.name  // Mapuj name → businessName
}
```

### 3. Tworzenie relacji
❌ **BŁĄD:**
```typescript
// Próba użycia relacji w create:
service_employees: {
  create: employeeIds.map(id => ({
    employees: { connect: { id } }  // NIE! To nie zadziała
  }))
}
```

✅ **POPRAWNIE:**
```typescript
// Użyj employeeId bezpośrednio:
service_employees: {
  create: employeeIds.map(id => ({
    id: generateId(),
    employeeId: id  // Bezpośrednie użycie ID
  }))
}
```

### 4. Aktualizacja danych
Zawsze aktualizuj stan po zapisie do API:
```typescript
const response = await fetch('/api/tenants/123', {
  method: 'PATCH',
  body: JSON.stringify(data)
})
const updated = await response.json()
setData(updated)  // ⚠️ WAŻNE: Aktualizuj stan!
```

## 📋 Checklist przed dodaniem nowej funkcjonalności

- [ ] Sprawdź nazwy tabel w Prisma schema (`prisma/schema.prisma`)
- [ ] Użyj dokładnych nazw relacji z backendu
- [ ] Dodaj typy TypeScript dla nowych endpointów
- [ ] Mapuj dane między formatem API a frontendem jeśli potrzeba
- [ ] Aktualizuj stan po zapisie do API
- [ ] Przetestuj z czystym cache przeglądarki
- [ ] Sprawdź logi backendu (`pm2 logs rezerwacja24-backend`)

## 🔧 Debugowanie

### Backend
```bash
# Sprawdź logi backendu
pm2 logs rezerwacja24-backend --lines 50

# Sprawdź czy backend działa
curl https://api.rezerwacja24.pl/api/tenants/TENANT_ID

# Restart backendu
cd /root/CascadeProjects/rezerwacja24-saas/backend
npm run build && pm2 restart rezerwacja24-backend
```

### Frontend
```bash
# Sprawdź logi frontendu
pm2 logs rezerwacja24-frontend --lines 50

# Rebuild frontendu
cd /root/CascadeProjects/rezerwacja24-saas/frontend
rm -rf .next
npm run build && pm2 restart rezerwacja24-frontend
```

### Baza danych
```bash
# Sprawdź strukturę tabel
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -d rezerwacja24 -c "\dt"

# Sprawdź dane w tabeli
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -d rezerwacja24 -c "SELECT * FROM tenants LIMIT 1;"
```

## 📝 Generowanie ID

Wszystkie nowe rekordy wymagają ID. Użyj tego wzorca:
```typescript
const id = `prefix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Przykłady:
// Usługi: srv-1765047462927-295op7zi1
// Pracownicy: emp-1764626036324-4hjafu98z
// Relacje: se-1765047462927-q8f8tdx5x
```

## 🎯 Najważniejsze zasady

1. **ZAWSZE używaj nazw z Prisma schema** - nie zgaduj, sprawdź w `prisma/schema.prisma`
2. **Testuj z czystym cache** - Ctrl+Shift+Delete przed każdym testem
3. **Aktualizuj stan po zapisie** - nie polegaj tylko na localStorage
4. **Mapuj dane między API a frontendem** - backend i frontend mogą używać różnych nazw
5. **Dodawaj logi** - `console.log` w backendzie pomaga debugować
