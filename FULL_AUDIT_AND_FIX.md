# PEŁNY AUDYT I NAPRAWA SYSTEMU

## 🔍 ZNALEZIONE PROBLEMY:

### 1. ❌ BRAK getTenantConfig w storage.ts
**Plik**: `frontend/lib/storage.ts`
**Problem**: Używa localStorage zamiast API z tenantId
**Fix**: Zastąpić localStorage prawdziwymi API calls

### 2. ❌ company.ts używa fetch BEZ headers
**Plik**: `frontend/lib/company.ts`
**Problem**: Linie 132, 234, 272, 293 - fetch bez X-Tenant-ID
**Fix**: Dodać getTenantConfig do wszystkich fetch

### 3. ❌ Brakujące API routes
**Problem**: `/api/billing/*` nie istnieje w Next.js
**Fix**: Stworzyć proxy routes lub użyć bezpośrednio backend API

### 4. ❌ Dashboard używa storage.ts
**Pliki**: 
- `app/dashboard/page.tsx`
- `app/dashboard/bookings/page.tsx`
- `app/dashboard/calendar/page.tsx`
- `app/dashboard/customers/page.tsx`
**Problem**: Importują z `@/lib/storage` zamiast API
**Fix**: Zamienić na API calls

### 5. ❌ Cache w przeglądarce
**Problem**: Dane nie odświeżają się bo są w cache
**Fix**: Dodać cache busting lub force reload

## 🔧 PLAN NAPRAWY:

### KROK 1: Usunąć storage.ts (localStorage)
Zastąpić wszystkie wywołania prawdziwymi API

### KROK 2: Naprawić company.ts
Dodać getTenantConfig do wszystkich fetch

### KROK 3: Naprawić wszystkie strony dashboard
Zamienić storage na API calls

### KROK 4: Dodać force reload po zmianach
Wyczyścić cache przeglądarki

### KROK 5: Przetestować WSZYSTKO
- Dashboard
- Rezerwacje
- Pracownicy
- Usługi
- Klienci
- Kalendarz
- Analityka
- Ustawienia

## 📝 SZCZEGÓŁOWA LISTA PLIKÓW DO NAPRAWY:

1. ✅ `frontend/lib/api/employees.ts` - JUŻ NAPRAWIONE
2. ✅ `frontend/lib/api/services.ts` - JUŻ NAPRAWIONE
3. ✅ `frontend/lib/analytics-api.ts` - JUŻ NAPRAWIONE
4. ❌ `frontend/lib/company.ts` - DO NAPRAWY
5. ❌ `frontend/lib/storage.ts` - DO USUNIĘCIA/ZASTĄPIENIA
6. ❌ `frontend/app/dashboard/page.tsx` - DO NAPRAWY
7. ❌ `frontend/app/dashboard/bookings/page.tsx` - DO NAPRAWY
8. ❌ `frontend/app/dashboard/calendar/page.tsx` - DO NAPRAWY
9. ❌ `frontend/app/dashboard/customers/page.tsx` - DO NAPRAWY
10. ❌ `frontend/app/dashboard/settings/subscription/page.tsx` - DO NAPRAWY

## 🚀 ROZPOCZYNAM NAPRAWĘ...
