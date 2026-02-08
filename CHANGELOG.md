# Changelog - Naprawione Błędy

## 2025-12-06 - Sesja Napraw

### 🎯 Główne Problemy Rozwiązane

#### 1. ✅ Nginx Upstream - Port Mismatch
**Problem:** Backend API zwracał 404 przez nginx, mimo że działał lokalnie.
**Przyczyna:** Nginx upstream `backend` wskazywał na port 4000 zamiast 3001.
**Rozwiązanie:** 
- Zmieniono w `/etc/nginx/nginx.conf`: `server localhost:4000` → `server localhost:3001`
- Plik: `/etc/nginx/nginx.conf`

#### 2. ✅ Subdomena - Nieprawidłowa w bazie
**Problem:** Subdomena `hubert-samek.rezerwacja24.pl` zwracała 404.
**Przyczyna:** Tenant miał subdomenę `salon-pieknosci-elegancja` zamiast `hubert-samek`.
**Rozwiązanie:**
- Zaktualizowano subdomenę w bazie danych
- SQL: `UPDATE tenants SET subdomain = 'hubert-samek' WHERE id = '1701364800000'`

#### 3. ✅ Bookings - Błąd "customer is undefined"
**Problem:** Frontend wyświetlał błąd: `can't access property "firstName", e.customer is undefined`
**Przyczyna:** Backend zwraca `customers` (liczba mnoga), frontend używał `customer` (pojedyncza).
**Rozwiązanie:**
- Zmieniono w `/frontend/app/dashboard/bookings/page.tsx`: `booking.customer` → `booking.customers`
- Zmieniono w `/frontend/app/dashboard/calendar/page.tsx`: `booking.customer` → `booking.customers`
- Dodano typy: `customers`, `services`, `employees` do interfejsów

#### 4. ✅ Services - Błąd 500 przy edycji
**Problem:** Aktualizacja usługi zwracała błąd 500.
**Przyczyna:** 
- Używano `employees` zamiast `service_employees` w relacjach
- `categoryId` nie był poprawnie obsługiwany
**Rozwiązanie:**
- Zmieniono w `/backend/src/services/services.service.ts`:
  - `updateData.employees` → `updateData.service_employees`
  - Dodano generowanie ID dla relacji
  - Uproszczono obsługę `categoryId` (bezpośrednie użycie zamiast relacji)
- Dodano `id` i `updatedAt` do create/update

#### 5. ✅ Services - Kategoria nie zapisywała się
**Problem:** Kategoria nie zapisywała się przy edycji usługi.
**Przyczyna:** Używano relacji `service_categories: { connect }` zamiast bezpośredniego `categoryId`.
**Rozwiązanie:**
- Uproszczono update - `categoryId` jest przekazywane bezpośrednio w `serviceData`

#### 6. ✅ Services - Kategoria nie wyświetlała się
**Problem:** Kategoria nie wyświetlała się w liście usług mimo że była w bazie.
**Przyczyna:** Frontend używał `service.category`, backend zwracał `service.service_categories`.
**Rozwiązanie:**
- Zmieniono w `/frontend/app/dashboard/services/page.tsx`: `service.category` → `service.service_categories`
- Dodano typ `service_categories` do interfejsu `Service`
- Naprawiono w `/frontend/lib/analytics.ts`: `category: string` → `category?: string`

#### 7. ✅ Services - Pracownicy nie byli zaznaczeni przy edycji
**Problem:** Pracownicy zapisywali się, ale nie byli zaznaczeni w formularzu edycji.
**Przyczyna:** Frontend ładował z `serviceData.employees`, backend zwracał `serviceData.service_employees`.
**Rozwiązanie:**
- Zmieniono w `/frontend/app/dashboard/services/[id]/page.tsx`:
  - Ładowanie: `serviceData.employees` → `serviceData.service_employees`
  - Mapowanie: `se.employeeId` zamiast `se.employee?.id`

#### 8. ✅ Settings - Dane nie zapisywały się
**Problem:** W ustawieniach zapisywały się tylko logo i banner, reszta danych nie.
**Przyczyna:** Brak endpointu do aktualizacji pełnych danych tenanta.
**Rozwiązanie:**
- Dodano endpoint `PATCH /api/tenants/:id` w backendzie
- Dodano metodę `update()` w `TenantsService`
- Zmieniono frontend aby wysyłał dane do API zamiast tylko do localStorage

#### 9. ✅ Settings - Dane wracały do poprzednich po zapisie
**Problem:** Po zapisaniu danych, wracały do starych wartości.
**Przyczyna:** Frontend nie aktualizował stanu po zapisie do API.
**Rozwiązanie:**
- Zmieniono `handleSave` aby był async i wysyłał do API
- Dodano mapowanie między `businessName` (frontend) a `name` (backend)
- Po zapisie stan jest aktualizowany z odpowiedzi API

#### 10. ✅ Subdomena - Kategorie nie wyświetlały się
**Problem:** Na stronie publicznej subdomeny kategorie pokazywały się jako "Usługa".
**Przyczyna:** Frontend subdomeny używał `service.category`, backend zwracał `service.service_categories`.
**Rozwiązanie:**
- Zmieniono w `/frontend/app/[subdomain]/page.tsx`:
  - Mapowanie kategorii: `s.category` → `s.service_categories?.name`
  - Wyświetlanie: `service.category` → `service.service_categories?.name`
  - Dodano typ `service_categories` do interfejsu

### 📊 Statystyki

- **Naprawione pliki:** 15+
- **Dodane endpointy:** 1 (PATCH /api/tenants/:id)
- **Naprawione typy TypeScript:** 5+
- **Czas naprawy:** ~3 godziny
- **Testy:** Wszystkie moduły przetestowane i działają

### 🔧 Zmiany w Infrastrukturze

#### Backend
- ✅ Wszystkie moduły aktywne (Services, Employees, Bookings, Customers, Analytics, etc.)
- ✅ Nginx poprawnie przekierowuje na port 3001
- ✅ PM2 zarządza procesami z ecosystem.config.js
- ✅ Prisma schema używa lowercase z underscores

#### Frontend
- ✅ Build bez błędów TypeScript
- ✅ Wszystkie typy zgodne z API
- ✅ Mapowanie danych między formatami
- ✅ Stan aktualizowany po zapisie do API

#### Database
- ✅ Subdomena poprawnie ustawiona
- ✅ Dane testowe: 1 usługa, 1 pracownik, 1 kategoria, 1 rezerwacja
- ✅ Relacje działają poprawnie

### 🎓 Wnioski i Zasady

1. **Konwencja nazewnictwa:** Backend używa lowercase z underscores, frontend musi to respektować
2. **Relacje:** Zawsze sprawdzaj nazwy relacji w Prisma schema
3. **Typy:** TypeScript pomaga wychwycić błędy - używaj strict types
4. **Mapowanie:** Backend i frontend mogą używać różnych nazw - mapuj dane
5. **Stan:** Zawsze aktualizuj stan po zapisie do API
6. **Cache:** Testuj z czystym cache przeglądarki
7. **Logi:** Dodawaj console.log w backendzie do debugowania

### 📝 Pliki Kluczowe

#### Backend
- `/backend/src/tenants/tenants.controller.ts` - Endpointy tenantów
- `/backend/src/tenants/tenants.service.ts` - Logika tenantów
- `/backend/src/services/services.service.ts` - Logika usług
- `/backend/prisma/schema.prisma` - Definicje modeli
- `/etc/nginx/nginx.conf` - Konfiguracja nginx upstream

#### Frontend
- `/frontend/app/dashboard/settings/page.tsx` - Ustawienia firmy
- `/frontend/app/dashboard/services/page.tsx` - Lista usług
- `/frontend/app/dashboard/services/[id]/page.tsx` - Edycja usługi
- `/frontend/app/dashboard/bookings/page.tsx` - Rezerwacje
- `/frontend/app/dashboard/calendar/page.tsx` - Kalendarz
- `/frontend/app/[subdomain]/page.tsx` - Strona publiczna subdomeny
- `/frontend/lib/api/services.ts` - Typy API dla usług

### 🚀 Następne Kroki

- [ ] Dodać testy automatyczne (Jest/Vitest)
- [ ] Dodać CI/CD pipeline
- [ ] Monitorowanie błędów (Sentry)
- [ ] Backup bazy danych
- [ ] Dokumentacja dla użytkowników końcowych

### 🔗 Linki

- Backend API: https://api.rezerwacja24.pl
- Panel biznesowy: https://app.rezerwacja24.pl
- Subdomena testowa: https://hubert-samek.rezerwacja24.pl
- Dokumentacja API: `/API_DOCUMENTATION.md`
