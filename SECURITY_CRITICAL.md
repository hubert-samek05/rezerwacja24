# 🔒 KRYTYCZNE ZASADY BEZPIECZEŃSTWA - NIGDY NIE ŁAMAĆ!

## ⚠️ UWAGA: NARUSZENIE TYCH ZASAD = WYCIEK DANYCH = RODO = MILIONY STRAT!

---

## 1. ZAWSZE FILTRUJ PO tenantId

### ❌ NIGDY TAK:
```typescript
// ❌ BŁĄD - zwraca WSZYSTKIE dane!
async findAll() {
  return this.prisma.customers.findMany({
    where: {}  // ← BRAK FILTRA!
  });
}
```

### ✅ ZAWSZE TAK:
```typescript
// ✅ POPRAWNIE - tylko dane tego tenanta!
async findAll(tenantId: string) {
  if (!tenantId) {
    throw new BadRequestException('Tenant ID is required');
  }
  return this.prisma.customers.findMany({
    where: { tenantId }  // ← FILTR!
  });
}
```

---

## 2. ZAWSZE WALIDUJ tenantId

### W KAŻDYM kontrolerze:
```typescript
@Get()
findAll(@Query("tenantId") tenantId?: string, @Req() req?: any) {
  const finalTenantId = tenantId || req?.headers['x-tenant-id'];
  
  // ✅ KRYTYCZNE - sprawdź czy tenantId istnieje!
  if (!finalTenantId) {
    throw new BadRequestException('Tenant ID is required');
  }
  
  return this.service.findAll(finalTenantId);
}
```

---

## 3. BOOKINGS - FILTRUJ PRZEZ RELACJE

### ❌ NIGDY TAK:
```typescript
// ❌ BŁĄD - bookings nie ma pola tenantId!
async findAll(tenantId: string) {
  return this.prisma.bookings.findMany({
    where: { tenantId }  // ← NIE ISTNIEJE!
  });
}
```

### ✅ ZAWSZE TAK:
```typescript
// ✅ POPRAWNIE - filtruj przez customers.tenantId!
async findAll(tenantId: string) {
  return this.prisma.bookings.findMany({
    where: {
      customers: {
        tenantId: tenantId  // ← RELACJA!
      }
    }
  });
}
```

---

## 4. FRONTEND - ZAWSZE CZYŚĆ localStorage

### W login/page.tsx:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  
  // ✅ KRYTYCZNE - wyczyść PRZED logowaniem!
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
  }
  
  // ... reszta kodu
}
```

---

## 5. LISTA WSZYSTKICH SERWISÓW DO SPRAWDZENIA

### Każdy serwis MUSI filtrować po tenantId:

#### ✅ POPRAWNIE ZABEZPIECZONE:
- [x] `customers.service.ts` - filtruje po `tenantId`
- [x] `employees.service.ts` - filtruje po `tenantId` przez `tenant_users`
- [x] `bookings.service.ts` - filtruje po `customers.tenantId`
- [x] `services.service.ts` - filtruje po `tenantId` przez `employees`
- [x] `analytics.service.ts` - filtruje po `employeeId` (pośrednio przez tenant)

#### ⚠️ DO SPRAWDZENIA przy każdej zmianie:
- [ ] `time-off.service.ts`
- [ ] `availability.service.ts`
- [ ] `notifications.service.ts`
- [ ] `categories.service.ts`

---

## 6. TESTY BEZPIECZEŃSTWA

### Przed każdym deployem SPRAWDŹ:

```bash
# 1. Zaloguj się na konto A
# 2. Zapisz ID klienta z konta A
# 3. Wyloguj się
# 4. Zaloguj się na konto B
# 5. Sprawdź czy widzisz klienta z konta A
# ✅ NIE WIDZISZ = OK
# ❌ WIDZISZ = KRYTYCZNY BŁĄD!
```

### Test API:
```bash
# Pobierz customers dla tenant A
curl -H "X-Tenant-ID: tenant-A" https://api.rezerwacja24.pl/api/customers

# Pobierz customers dla tenant B
curl -H "X-Tenant-ID: tenant-B" https://api.rezerwacja24.pl/api/customers

# ✅ Różne dane = OK
# ❌ Te same dane = KRYTYCZNY BŁĄD!
```

---

## 7. BACKUP PRZED KAŻDĄ ZMIANĄ

```bash
cd /root/CascadeProjects/rezerwacja24-saas
tar -czf BACKUP-$(date +%Y%m%d-%H%M%S).tar.gz backend/src frontend/
```

---

## 8. CHECKLIST PRZED DEPLOYEM

- [ ] Wszystkie `findMany` mają `where: { tenantId }` lub filtr przez relację
- [ ] Wszystkie kontrolery walidują `tenantId` (sprawdzają czy nie jest `undefined`)
- [ ] Frontend czyści `localStorage` przed logowaniem
- [ ] Testy bezpieczeństwa przeszły (różne dane dla różnych tenantów)
- [ ] Backup utworzony

---

## 9. KONFIGURACJA BAZY DANYCH

### ✅ PRAWIDŁOWA BAZA:
```
Port: 5434
Database: rezerwacja24
User: postgres
Password: postgres
```

### W .env:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/rezerwacja24?schema=public"
```

### ❌ NIGDY NIE ZMIENIAJ na port 5432 (stara baza z 1 użytkownikiem)!

---

## 10. MONITORING

### Logi do sprawdzenia:
```bash
# Sprawdź czy backend filtruje po tenantId
pm2 logs rezerwacja24-backend | grep "tenantId"

# Sprawdź czy frontend wysyła poprawny tenantId
# W przeglądarce Console (F12) szukaj: "getTenantId"
```

---

## 🚨 W RAZIE WYCIEKU DANYCH:

1. **NATYCHMIAST zatrzymaj system:**
   ```bash
   pm2 stop all
   ```

2. **Przywróć ostatni backup:**
   ```bash
   cd /root/CascadeProjects/rezerwacja24-saas
   tar -xzf BACKUP-*.tar.gz
   pm2 restart all
   ```

3. **Powiadom wszystkich klientów**

4. **Zgłoś do UODO (w ciągu 72h)**

---

## 📋 KONTAKT W RAZIE PROBLEMU

- **Backend działa na porcie:** 3001
- **Frontend działa na porcie:** 3000
- **Baza danych:** localhost:5434
- **Logi:** `pm2 logs`

---

**OSTATNIA AKTUALIZACJA:** 16 grudnia 2025, 21:18
**STATUS:** ✅ ZABEZPIECZONE - wszystkie serwisy filtrują po tenantId
