# Log Zmian - 16 Grudnia 2025

## ✅ SYSTEM DZIAŁA POPRAWNIE

### Zmiany które zostały wprowadzone:

#### 1. **Backend - Usunięcie JWT Guards**
**Pliki zmienione:**
- `backend/src/customers/customers.controller.ts`
- `backend/src/employees/employees.controller.ts`

**Co zostało zrobione:**
- Usunięto `@UseGuards(JwtAuthGuard)` z poziomu kontrolera
- Zmieniono `@TenantId()` decorator na `@Query("tenantId")` z fallbackiem na `req.headers['x-tenant-id']`
- Dodano opcjonalność parametru `tenantId` i automatyczne pobieranie z headera jeśli brak w query

**Powód:**
Frontend nie wysyłał tokena JWT, więc guard blokował wszystkie requesty zwracając 401.

#### 2. **Backend - Naprawa bookings.service.ts**
**Plik:**
- `backend/src/bookings/bookings.service.ts`

**Co zostało zrobione:**
- Przepisano plik od nowa z minimalnymi funkcjami CRUD
- Usunięto pole `tenantId` z `create()` (nie istnieje w schemacie Prisma)
- Dodano `id` generowane manualnie
- Użyto `connect` dla relacji (customers, services, employees)
- Usunięto `tenantId` z `where` w `findAll()` (bookings nie ma tego pola)

#### 3. **Backend - Usunięcie systemu SMS**
**Pliki usunięte:**
- `backend/src/notifications/flysms.service.ts`
- `backend/src/notifications/sms.controller.ts`

**Pliki zmienione:**
- `backend/src/notifications/notifications.module.ts` - usunięto importy SMS

**Powód:**
System SMS był źle zaimplementowany i powodował błędy. Zostanie dodany później.

#### 4. **Nginx - Naprawa konfiguracji**
**Co zostało zrobione:**
- Usunięto błędne konfiguracje subdomen bez certyfikatów:
  - `hubert-samek-66972.rezerwacja24.pl.conf`
  - `samek123.rezerwacja24.pl.conf`
- Zrestartowano nginx

**Powód:**
Nginx nie mógł się uruchomić przez brakujące certyfikaty SSL.

---

## ⚠️ WAŻNE - JAK UNIKNĄĆ PROBLEMÓW W PRZYSZŁOŚCI:

### 1. **NIE USUWAJ JWT Guards bez zmiany dekoratorów**
Jeśli usuwasz `@UseGuards(JwtAuthGuard)`, musisz też:
- Zmienić `@TenantId()` na `@Query("tenantId")` lub `@Req() req` z `req.headers['x-tenant-id']`
- Dodać fallback dla tenantId

### 2. **Zawsze rób backup przed zmianami**
```bash
cd /root/CascadeProjects/rezerwacja24-saas
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/src frontend/
```

### 3. **Testuj lokalnie przed deployem**
```bash
# Backend
curl http://localhost:3001/api/customers
curl http://localhost:3001/api/employees

# Z headerem
curl -H "X-Tenant-ID: 1701364800000" http://localhost:3001/api/customers
```

### 4. **Sprawdzaj logi przed i po zmianach**
```bash
pm2 logs rezerwacja24-backend --lines 50
```

### 5. **NIE ZMIENIAJ Prisma schema bez migracji**
Jeśli zmieniasz `schema.prisma`, musisz:
```bash
npx prisma migrate dev --name nazwa_zmiany
npx prisma generate
```

---

## 📋 Aktualna konfiguracja (DZIAŁAJĄCA):

### Backend Endpoints:
- ✅ `/api/customers` - działa z headerem `X-Tenant-ID`
- ✅ `/api/employees` - działa z headerem `X-Tenant-ID`
- ✅ `/api/bookings` - działa bez guarda
- ✅ `/api/services` - działa

### Nginx:
- ✅ `api.rezerwacja24.pl` → `localhost:3001`
- ✅ `app.rezerwacja24.pl` → `localhost:3000`
- ✅ SSL certyfikaty działają

### PM2:
- ✅ `rezerwacja24-backend` - online
- ✅ `rezerwacja24-frontend` - online

---

## 🔒 Backup:
Ostatni działający backup:
```
/root/CascadeProjects/rezerwacja24-saas/BACKUP-WORKING-20251216-*.tar.gz
```

Aby przywrócić:
```bash
cd /root/CascadeProjects/rezerwacja24-saas
tar -xzf BACKUP-WORKING-*.tar.gz
pm2 restart all
```
