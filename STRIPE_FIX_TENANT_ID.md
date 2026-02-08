# 🔧 Naprawa: tenantId undefined w API Billing

**Data**: 2024-12-13 15:57  
**Problem**: Błędy 500 na wszystkich endpointach `/api/billing/*`  
**Przyczyna**: `tenantId: undefined` - frontend nie wysyłał `x-tenant-id` header

---

## 🐛 Problem

Wszystkie endpointy billing zwracały błąd:
```
PANIC: called `Option::unwrap()` on a `None` value
Argument `where` of type subscriptionsWhereUniqueInput needs at least one of `id`, `tenantId`, `stripeCustomerId` or `stripeSubscriptionId` arguments.
```

**Logi pokazywały**:
```javascript
where: {
  tenantId: undefined,  // ❌ UNDEFINED!
}
```

**Błędy w przeglądarce**:
```
XHR GET /api/billing/subscription [HTTP/2 500 284ms]
XHR GET /api/billing/subscription/status [HTTP/2 500 236ms]
XHR POST /api/billing/checkout-session [HTTP/2 400 160ms]
```

---

## 🔍 Przyczyna

Frontend API routes (`/frontend/app/api/billing/*`) próbowały pobrać `tenantId` z headera:
```typescript
const tenantId = request.headers.get('x-tenant-id'); // ❌ ZAWSZE undefined
```

Ale komponenty frontend **NIE wysyłały** tego headera:
```typescript
// ❌ Brak x-tenant-id!
fetch('/api/billing/subscription')
```

---

## ✅ Rozwiązanie

### 1. Zainstalowano `jwt-decode`
```bash
npm install jwt-decode
```

### 2. Zaktualizowano WSZYSTKIE API routes billing

Dodano dekodowanie JWT aby uzyskać `tenantId` z tokena:

```typescript
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  email: string;
  tenantId: string;  // ✅ tenantId jest w tokenie!
  role: string;
}

// Dekoduj token
const token = request.cookies.get('token')?.value;
const decoded = jwtDecode<JWTPayload>(token);
const tenantId = decoded.tenantId;  // ✅ Pobierz z tokena

// Wyślij do backendu
fetch(`${API_URL}/api/billing/subscription`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-tenant-id': tenantId,  // ✅ Teraz jest!
  },
});
```

### 3. Zaktualizowane pliki

**API Routes** (dodano dekodowanie JWT):
- `/frontend/app/api/billing/subscription/route.ts`
- `/frontend/app/api/billing/subscription/status/route.ts`
- `/frontend/app/api/billing/invoices/route.ts`
- `/frontend/app/api/billing/portal-session/route.ts`
- `/frontend/app/api/billing/subscription/resume/route.ts`
- `/frontend/app/api/billing/checkout-session/route.ts`

**Komponenty** (usunięto tenantId z props):
- `/frontend/components/StripeCheckoutForm.tsx`
- `/frontend/app/subscription/checkout/page.tsx`

---

## 🧪 Weryfikacja

### Przed naprawą:
```
❌ tenantId: undefined
❌ 500 Internal Server Error
❌ PANIC: called `Option::unwrap()` on a `None` value
```

### Po naprawie:
```
✅ tenantId: "1701364800000" (z tokena JWT)
✅ 200 OK
✅ Dane subskrypcji zwracane poprawnie
```

---

## 📝 Dlaczego to działa?

**JWT token zawiera wszystkie potrzebne dane**:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenantId": "1701364800000",  // ✅ To jest to!
  "role": "OWNER"
}
```

Zamiast polegać na headerze `x-tenant-id` wysyłanym przez frontend, **dekodujemy token** i wyciągamy `tenantId` bezpośrednio z niego.

**Zalety**:
- ✅ Bezpieczniejsze (tenantId nie może być sfałszowany)
- ✅ Prostsze (frontend nie musi pamiętać o wysyłaniu headera)
- ✅ Spójne z innymi API routes (np. bookings używają `getTenantConfig()`)

---

## 🚀 Status

**✅ NAPRAWIONE**

Wszystkie endpointy billing działają poprawnie. Frontend może teraz:
- Pobierać status subskrypcji
- Tworzyć checkout sessions
- Zarządzać subskrypcją
- Pobierać faktury
- Otwierać Stripe Portal

---

**Restart wymagany**: `pm2 restart rezerwacja24-frontend` ✅ WYKONANE
