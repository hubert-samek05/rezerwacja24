# Naprawa Edycji Usług i Pracowników - Rezerwacja24

## Data naprawy: 2 grudnia 2025, 21:10

## Problem

Brak możliwości edycji usług i pracowników - nie istniały strony edycji w frontendzie.

**Symptomy:**
- Przycisk "Edytuj" (ikona ołówka) na kartach usług i pracowników
- Kliknięcie prowadziło do nieistniejących stron
- Brak folderów `[id]` w katalogach services i employees

## Przyczyna

W strukturze frontendu brakowało stron edycji:
- `/frontend/app/dashboard/services/[id]/page.tsx` - ❌ nie istniała
- `/frontend/app/dashboard/employees/[id]/page.tsx` - ❌ nie istniała

Istniały tylko strony tworzenia nowych:
- `/frontend/app/dashboard/services/new/page.tsx` - ✅
- `/frontend/app/dashboard/employees/new/page.tsx` - ✅

## Rozwiązanie

### 1. Utworzenie Strony Edycji Usługi

**Plik:** `/frontend/app/dashboard/services/[id]/page.tsx`

**Funkcjonalności:**
- Dynamiczny routing z parametrem `[id]`
- Ładowanie istniejących danych usługi z API
- Formularz z wypełnionymi wartościami
- Aktualizacja przez `PATCH /api/services/:id`
- Loading state podczas ładowania danych
- Walidacja formularza
- Toast notifications
- Przekierowanie po zapisaniu

**Kluczowe elementy:**
```typescript
const params = useParams()
const serviceId = params.id as string

const loadData = async () => {
  const [serviceData, categoriesData, employeesData] = await Promise.all([
    servicesApi.getOne(serviceId),
    servicesApi.getAllCategories(),
    employeesApi.getAll()
  ])
  
  // Populate form with existing data
  setFormData({
    name: serviceData.name || '',
    description: serviceData.description || '',
    categoryId: serviceData.categoryId || '',
    basePrice: serviceData.basePrice?.toString() || '',
    duration: serviceData.duration?.toString() || '',
    // ... rest of fields
  })
  
  // Set selected employees
  const employeeIds = serviceData.employees.map(se => se.employeeId)
  setSelectedEmployees(employeeIds)
}

const handleSubmit = async (e: React.FormEvent) => {
  await servicesApi.update(serviceId, data)
  toast.success('Usługa została zaktualizowana')
  router.push('/dashboard/services')
}
```

### 2. Utworzenie Strony Edycji Pracownika

**Plik:** `/frontend/app/dashboard/employees/[id]/page.tsx`

**Funkcjonalności:**
- Dynamiczny routing z parametrem `[id]`
- Ładowanie istniejących danych pracownika z API
- Formularz z wypełnionymi wartościami
- Aktualizacja przez `PATCH /api/employees/:id`
- Loading state podczas ładowania danych
- Zarządzanie specjalizacjami
- Wybór koloru w kalendarzu
- Toast notifications
- Przekierowanie po zapisaniu

**Kluczowe elementy:**
```typescript
const params = useParams()
const employeeId = params.id as string

const loadData = async () => {
  const employeeData = await employeesApi.getOne(employeeId)
  
  setFormData({
    firstName: employeeData.firstName || '',
    lastName: employeeData.lastName || '',
    email: employeeData.email || '',
    phone: employeeData.phone || '',
    title: employeeData.title || '',
    bio: employeeData.bio || '',
    specialties: employeeData.specialties || [],
    color: employeeData.color || PRESET_COLORS[0],
    isActive: employeeData.isActive !== false,
  })
}

const handleSubmit = async (e: React.FormEvent) => {
  await employeesApi.update(employeeId, data)
  toast.success('Pracownik został zaktualizowany')
  router.push('/dashboard/employees')
}
```

### 3. Poprawka Nazw Metod API

Podczas implementacji wykryto błąd w nazwach metod:
- Używano: `getById(id)`
- Poprawnie: `getOne(id)`

**Poprawione w:**
- `/frontend/app/dashboard/services/[id]/page.tsx`
- `/frontend/app/dashboard/employees/[id]/page.tsx`

## Struktura Plików

### Przed naprawą:
```
frontend/app/dashboard/
├── services/
│   ├── new/
│   │   └── page.tsx ✅
│   └── page.tsx ✅
└── employees/
    ├── new/
    │   └── page.tsx ✅
    └── page.tsx ✅
```

### Po naprawie:
```
frontend/app/dashboard/
├── services/
│   ├── [id]/
│   │   └── page.tsx ✅ NOWY
│   ├── new/
│   │   └── page.tsx ✅
│   └── page.tsx ✅
└── employees/
    ├── [id]/
    │   └── page.tsx ✅ NOWY
    ├── new/
    │   └── page.tsx ✅
    └── page.tsx ✅
```

## Routing Next.js

Next.js 14 używa App Router z dynamicznymi segmentami:

**Folder `[id]`** = Dynamiczny parametr
- URL: `/dashboard/services/abc123`
- Params: `{ id: 'abc123' }`
- Dostęp: `const params = useParams()`

**Przykłady URL:**
- `/dashboard/services/cmiozinnt0003oks2qi1fpous` → Edycja usługi
- `/dashboard/employees/cmiozaa9f000068l1id87lg4k` → Edycja pracownika

## Funkcje Formularzy Edycji

### Usługi - Edycja

**Sekcje formularza:**
1. **Podstawowe informacje**
   - Nazwa usługi
   - Opis
   - Kategoria

2. **Cena i czas trwania**
   - Cena (PLN)
   - Czas trwania (minuty)
   - Bufor przed/po

3. **Depozyt**
   - Wymaga depozytu (checkbox)
   - Kwota depozytu

4. **Przypisanie pracowników**
   - Wybór pracowników (multi-select)
   - Wizualne karty z avatarami
   - Licznik wybranych pracowników

5. **Ustawienia**
   - Rezerwacje online
   - Wymaga zatwierdzenia
   - Aktywna

### Pracownicy - Edycja

**Sekcje formularza:**
1. **Dane podstawowe**
   - Imię
   - Nazwisko
   - Stanowisko
   - Bio/Opis

2. **Dane kontaktowe**
   - Email
   - Telefon

3. **Specjalizacje**
   - Dodawanie specjalizacji
   - Usuwanie specjalizacji
   - Lista tagów

4. **Kolor w kalendarzu**
   - 10 predefiniowanych kolorów
   - Podgląd koloru
   - Wybór przez kliknięcie

5. **Status**
   - Aktywny/Nieaktywny

## Wdrożenie

### Kroki:
1. ✅ Utworzenie folderów `[id]`
2. ✅ Skopiowanie i modyfikacja stron `new`
3. ✅ Dodanie ładowania danych z API
4. ✅ Zmiana `create` na `update`
5. ✅ Poprawka nazw metod API
6. ✅ Build frontendu: `npm run build`
7. ✅ Rebuild kontenera Docker
8. ✅ Restart frontendu na produkcji

### Komendy:
```bash
# Utworzenie folderów
mkdir -p frontend/app/dashboard/services/[id]
mkdir -p frontend/app/dashboard/employees/[id]

# Build
cd frontend && npm run build

# Docker
docker compose build frontend
docker compose stop frontend
docker compose rm -f frontend
docker compose up -d frontend
```

## Testy Produkcyjne

### Test 1: Dostępność Stron
```bash
# Edycja usługi
curl "https://rezerwacja24.pl/dashboard/services/cmiozinnt0003oks2qi1fpous"
# Status: 200 ✅

# Edycja pracownika
curl "https://rezerwacja24.pl/dashboard/employees/cmiozaa9f000068l1id87lg4k"
# Status: 200 ✅
```

### Test 2: Ładowanie Danych
- ✅ Formularz usługi ładuje istniejące dane
- ✅ Formularz pracownika ładuje istniejące dane
- ✅ Wybrani pracownicy są zaznaczeni
- ✅ Specjalizacje są wyświetlone
- ✅ Kolor jest ustawiony

### Test 3: Zapisywanie Zmian
- ✅ Edycja usługi zapisuje zmiany (PATCH 200)
- ✅ Edycja pracownika zapisuje zmiany (PATCH 200)
- ✅ Toast notification po zapisaniu
- ✅ Przekierowanie do listy

## Build Output

```
Route (app)                              Size     First Load JS
...
├ λ /dashboard/employees/[id]            7.93 kB         152 kB  ✅ NOWY
├ ○ /dashboard/employees/new             7.72 kB         151 kB
├ ○ /dashboard/services                  10.1 kB         154 kB
├ λ /dashboard/services/[id]             8.53 kB         152 kB  ✅ NOWY
├ ○ /dashboard/services/new              8.22 kB         152 kB
...

λ  (Dynamic)  server-rendered on demand using Node.js
```

**Legenda:**
- `λ` = Dynamiczny routing (Server-rendered)
- `○` = Statyczny (Prerendered)

## Status

### Przed naprawą:
- ❌ Brak stron edycji
- ❌ Przyciski "Edytuj" nie działały
- ❌ 404 Not Found przy próbie edycji

### Po naprawie:
- ✅ Strony edycji utworzone
- ✅ Przyciski "Edytuj" działają
- ✅ Formularze ładują istniejące dane
- ✅ Zapisywanie zmian działa
- ✅ HTTP 200 na stronach edycji
- ✅ Wdrożone na produkcję

## Przepływ Użytkownika

### Edycja Usługi:
1. Użytkownik otwiera stronę Usługi
2. Klika ikonę ołówka (Edit) przy usłudze
3. Otwiera się strona `/dashboard/services/[id]`
4. Formularz ładuje dane usługi z API
5. Użytkownik modyfikuje pola
6. Klika "Zapisz zmiany"
7. System wysyła PATCH do API
8. Toast: "Usługa została zaktualizowana"
9. Przekierowanie do `/dashboard/services`

### Edycja Pracownika:
1. Użytkownik otwiera stronę Pracownicy
2. Klika ikonę ołówka (Edit) przy pracowniku
3. Otwiera się strona `/dashboard/employees/[id]`
4. Formularz ładuje dane pracownika z API
5. Użytkownik modyfikuje pola
6. Klika "Zapisz zmiany"
7. System wysyła PATCH do API
8. Toast: "Pracownik został zaktualizowany"
9. Przekierowanie do `/dashboard/employees`

## Podsumowanie

Problem z brakiem możliwości edycji usług i pracowników został całkowicie rozwiązany poprzez:

1. ✅ Utworzenie stron edycji z dynamicznym routingiem
2. ✅ Implementację ładowania istniejących danych
3. ✅ Integrację z API (PATCH endpoints)
4. ✅ Poprawkę nazw metod API
5. ✅ Wdrożenie na produkcję

Użytkownicy mogą teraz w pełni edytować usługi i pracowników przez interfejs webowy! 🎉

## Status Końcowy

✅ **NAPRAWIONE I WDROŻONE NA PRODUKCJĘ**

- Frontend: https://rezerwacja24.pl
- Edycja usług: `/dashboard/services/[id]`
- Edycja pracowników: `/dashboard/employees/[id]`
- Status: 200 OK
- Data wdrożenia: 2 grudnia 2025, 21:10 UTC+01:00
