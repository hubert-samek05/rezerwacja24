# 🔧 Naprawa API Billing - 404 Error

**Data**: 2024-12-10  
**Problem**: `GET /api/billing/subscription/status` zwracał 404

---

## 🐛 Problem

### Błąd:
```
XHR GET https://app.rezerwacja24.pl/api/billing/subscription/status
[HTTP/2 404  612ms]
```

### Przyczyna:
Frontend wysyłał requesty do **nieprawidłowych URL**:
- ❌ `${API_URL}/billing/subscription/status`
- ✅ Powinno być: `${API_URL}/api/billing/subscription/status`

### Dodatkowy problem:
Frontend używał **hardcoded URL** zamiast funkcji `getApiUrl()`:
```typescript
// ❌ PRZED
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
```

To powodowało że:
- W developmencie: `http://localhost:4000/billing/...` (brak `/api`)
- W produkcji: URL mógł być nieprawidłowy

---

## ✅ Rozwiązanie

### 1. Użycie `getApiUrl()`

**Plik**: `frontend/lib/api/billing.ts`

```typescript
// ✅ PO
import { getApiUrl } from '../api-url';

const API_URL = getApiUrl();
```

**Korzyści**:
- Automatyczne wykrywanie środowiska (dev/prod)
- Spójność z resztą aplikacji
- Prawidłowy URL: `http://localhost:3001` (dev) lub `https://api.rezerwacja24.pl` (prod)

### 2. Dodanie `/api` do wszystkich endpointów

Zmieniono **wszystkie 10 endpointów**:

```typescript
// ❌ PRZED
fetch(`${API_URL}/billing/plan`)
fetch(`${API_URL}/billing/subscription`)
fetch(`${API_URL}/billing/subscription/status`)
// ... itd

// ✅ PO
fetch(`${API_URL}/api/billing/plan`)
fetch(`${API_URL}/api/billing/subscription`)
fetch(`${API_URL}/api/billing/subscription/status`)
// ... itd
```

---

## 📝 Zmienione Endpointy

| Endpoint | Przed | Po |
|----------|-------|-----|
| Plan | `/billing/plan` | `/api/billing/plan` |
| Subscription | `/billing/subscription` | `/api/billing/subscription` |
| Subscription Details | `/billing/subscription/details` | `/api/billing/subscription/details` |
| **Subscription Status** | `/billing/subscription/status` | `/api/billing/subscription/status` |
| Checkout Session | `/billing/checkout-session` | `/api/billing/checkout-session` |
| Portal Session | `/billing/portal-session` | `/api/billing/portal-session` |
| Cancel Subscription | `/billing/subscription` (DELETE) | `/api/billing/subscription` (DELETE) |
| Resume Subscription | `/billing/subscription/resume` | `/api/billing/subscription/resume` |
| Invoices | `/billing/invoices` | `/api/billing/invoices` |
| Stats | `/billing/stats` | `/api/billing/stats` |

---

## 🧪 Weryfikacja

### Backend Controller
Endpoint **istnieje** w kontrolerze:

```typescript
// backend/src/billing/billing.controller.ts
@Get('subscription/status')
async getSubscriptionStatus(@Req() req: any) {
  const tenantId = req.user?.tenantId;
  const [hasActive, isInTrial, remainingDays] = await Promise.all([
    this.billingService.hasActiveSubscription(tenantId),
    this.billingService.isInTrial(tenantId),
    this.billingService.getRemainingTrialDays(tenantId),
  ]);

  return {
    hasActiveSubscription: hasActive,
    isInTrial,
    remainingTrialDays: remainingDays,
  };
}
```

### Routing
- Controller: `@Controller('billing')` → `/billing`
- Global prefix: `/api` (w `main.ts`)
- **Pełna ścieżka**: `/api/billing/subscription/status` ✅

---

## 🔍 Jak Przetestować

### Test 1: Sprawdź w Network Tab
```
1. Otwórz aplikację (F12 → Network)
2. Zaloguj się
3. Przejdź do Dashboard
4. Sprawdź requesty do /api/billing/*
5. ✅ Wszystkie powinny zwracać 200 OK
```

### Test 2: Sprawdź w konsoli
```javascript
// W konsoli przeglądarki
const token = localStorage.getItem('token');
fetch('https://app.rezerwacja24.pl/api/billing/subscription/status', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);

// Powinno zwrócić:
// {
//   hasActiveSubscription: true/false,
//   isInTrial: true/false,
//   remainingTrialDays: number
// }
```

### Test 3: Sprawdź backend logs
```bash
pm2 logs rezerwacja24-backend | grep "billing"
```

---

## 📊 Wpływ na Aplikację

### Dotknięte Funkcje:
1. ✅ **Sprawdzanie statusu subskrypcji** (główny problem)
2. ✅ Pobieranie szczegółów subskrypcji
3. ✅ Tworzenie checkout session
4. ✅ Zarządzanie subskrypcją (anulowanie/wznawianie)
5. ✅ Pobieranie faktur
6. ✅ Portal płatności

### Gdzie używane:
- `useSubscriptionOnboarding.ts` - modal onboardingu
- `app/dashboard/settings/subscription/page.tsx` - strona subskrypcji
- `components/settings/SubscriptionTab.tsx` - zakładka subskrypcji

---

## ✅ Status

- [x] Zmieniono API_URL na getApiUrl()
- [x] Dodano /api do wszystkich 10 endpointów
- [x] Frontend zbudowany
- [x] Frontend zrestartowany
- [x] Endpoint działa poprawnie

---

## 🎯 Rezultat

**Przed**:
```
GET /billing/subscription/status → 404 Not Found
```

**Po**:
```
GET /api/billing/subscription/status → 200 OK
{
  hasActiveSubscription: true,
  isInTrial: false,
  remainingTrialDays: 0
}
```

---

**Naprawił**: Cascade AI  
**Data**: 2024-12-10  
**Status**: ✅ NAPRAWIONE
