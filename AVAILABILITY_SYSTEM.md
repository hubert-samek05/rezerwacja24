# ✅ System Dostępności Pracowników i Urlopów

**Data**: 2024-12-10  
**Status**: ✅ WDROŻONE

---

## 🎯 Cel

Pełny system zarządzania dostępnością pracowników obejmujący:
1. **Godziny pracy** - regularne godziny dla każdego dnia tygodnia
2. **Urlopy** - blokowanie konkretnych dni
3. **Walidacja** - sprawdzanie dostępności przy tworzeniu rezerwacji
4. **Filtrowanie** - pokazywanie tylko dostępnych slotów na subdomenie

---

## 🗄️ Struktura Bazy Danych

### Model `availability`

```prisma
model availability {
  id           String    @id
  employeeId   String
  dayOfWeek    DayOfWeek  // MONDAY, TUESDAY, etc.
  startTime    String     // "09:00"
  endTime      String     // "17:00"
  specificDate DateTime?  // Dla urlopów
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime
  employees    employees  @relation(...)
}
```

### Logika:
- **Regularne godziny pracy**: `specificDate = null`, `dayOfWeek` określa dzień
- **Urlopy**: `specificDate != null`, konkretna data blokady

---

## 🔧 Backend API

### Endpointy

#### 1. GET `/api/employees/:id/availability`
Pobiera dostępność pracownika

**Odpowiedź**:
```json
{
  "workingHours": [
    {
      "day": "monday",
      "enabled": true,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    ...
  ],
  "timeOff": [
    {
      "id": "timeoff-123",
      "date": "2024-12-25",
      "reason": "Urlop"
    }
  ]
}
```

#### 2. PUT `/api/employees/:id/availability`
Aktualizuje dostępność pracownika

**Request**:
```json
{
  "workingHours": [
    {
      "day": "monday",
      "enabled": true,
      "startTime": "09:00",
      "endTime": "15:00"
    },
    ...
  ],
  "timeOff": [
    {
      "date": "2024-12-25",
      "reason": "Święta"
    }
  ]
}
```

#### 3. POST `/api/employees/:id/time-off`
Dodaje urlop

**Request**:
```json
{
  "date": "2024-12-25",
  "reason": "Urlop"
}
```

#### 4. DELETE `/api/employees/:id/time-off/:timeOffId`
Usuwa urlop

---

## ✅ Walidacja przy Rezerwacji

### Metoda `checkEmployeeAvailability()`

Sprawdza 3 rzeczy:

#### 1. **Urlop**
```typescript
// Sprawdź czy pracownik ma urlop w tym dniu
const timeOff = await this.prisma.availability.findFirst({
  where: {
    employeeId,
    specificDate: bookingDate,
    isActive: true,
  },
});

if (timeOff) {
  return {
    available: false,
    reason: 'Pracownik ma urlop w tym dniu',
  };
}
```

#### 2. **Dzień tygodnia**
```typescript
// Sprawdź czy pracownik pracuje w tym dniu
const availability = await this.prisma.availability.findFirst({
  where: {
    employeeId,
    dayOfWeek: dayOfWeek,
    specificDate: null,
    isActive: true,
  },
});

if (!availability) {
  return {
    available: false,
    reason: 'Pracownik nie pracuje w tym dniu tygodnia',
  };
}
```

#### 3. **Godziny pracy**
```typescript
// Sprawdź czy godziny rezerwacji mieszczą się w godzinach pracy
if (bookingStartTime < availability.startTime || bookingEndTime > availability.endTime) {
  return {
    available: false,
    reason: `Pracownik pracuje od ${availability.startTime} do ${availability.endTime}`,
  };
}
```

### Zastosowanie

Walidacja jest wywoływana w:
1. **`create()`** - tworzenie rezerwacji przez pracownika
2. **`createPublicBooking()`** - rezerwacja z subdomeny
3. **`checkAvailability()`** - filtrowanie dostępnych slotów

---

## 🎨 Frontend

### Komponent `EmployeeAvailability`

**Lokalizacja**: `frontend/components/EmployeeAvailability.tsx`

**Funkcje**:
- ✅ Wyświetlanie godzin pracy dla każdego dnia
- ✅ Włączanie/wyłączanie dni
- ✅ Edycja godzin rozpoczęcia i zakończenia
- ✅ Dodawanie urlopów (kalendarz)
- ✅ Usuwanie urlopów
- ✅ Zapisywanie zmian

### Integracja

Modal dostępności w stronie edycji pracownika:

```typescript
// frontend/app/dashboard/employees/[id]/page.tsx

<button onClick={() => setShowAvailabilityModal(true)}>
  <Clock /> Zarządzaj dostępnością
</button>

<AnimatePresence>
  {showAvailabilityModal && (
    <Modal>
      <EmployeeAvailability employeeId={employeeId} />
    </Modal>
  )}
</AnimatePresence>
```

---

## 📊 Przepływy

### Scenariusz 1: Ustawienie godzin pracy

```
1. Właściciel otwiera edycję pracownika
   ↓
2. Klika "Zarządzaj dostępnością"
   ↓
3. Otwiera się modal z dostępnością
   ↓
4. Właściciel ustawia godziny dla każdego dnia:
   - Poniedziałek: 09:00 - 15:00
   - Wtorek: 15:00 - 21:00
   - Środa: wyłączona
   ↓
5. Klika "Zapisz"
   ↓
6. Backend zapisuje w tabeli availability
```

### Scenariusz 2: Dodanie urlopu

```
1. W modalu dostępności
   ↓
2. Sekcja "Urlopy i dni wolne"
   ↓
3. Wybiera datę z kalendarza
   ↓
4. Klika "Dodaj urlop"
   ↓
5. Urlop dodany do listy
   ↓
6. Klika "Zapisz"
   ↓
7. Backend zapisuje urlop z specificDate
```

### Scenariusz 3: Próba rezerwacji w czasie urlopu (Dashboard)

```
1. Pracownik próbuje dodać rezerwację
   ↓
2. Wybiera pracownika który ma urlop
   ↓
3. Wybiera datę urlopu
   ↓
4. Klika "Utwórz rezerwację"
   ↓
5. Backend sprawdza dostępność
   ↓
6. Zwraca błąd: "Pracownik ma urlop w tym dniu"
   ↓
7. Toast z komunikatem błędu
   ↓
8. Rezerwacja NIE zostaje utworzona
```

### Scenariusz 4: Próba rezerwacji poza godzinami pracy (Dashboard)

```
1. Pracownik próbuje dodać rezerwację
   ↓
2. Pracownik A pracuje 09:00-15:00
   ↓
3. Próba rezerwacji na 16:00
   ↓
4. Backend sprawdza dostępność
   ↓
5. Zwraca błąd: "Pracownik pracuje od 09:00 do 15:00"
   ↓
6. Toast z komunikatem błędu
   ↓
7. Rezerwacja NIE zostaje utworzona
```

### Scenariusz 5: Rezerwacja przez subdomenę

```
1. Klient wybiera usługę
   ↓
2. Wybiera datę
   ↓
3. System wywołuje checkAvailability()
   ↓
4. Backend:
   - Sprawdza urlopy każdego pracownika
   - Sprawdza godziny pracy
   - Sprawdza istniejące rezerwacje
   ↓
5. Zwraca TYLKO dostępne sloty
   ↓
6. Klient widzi np:
   - 09:00 (Pracownik A)
   - 10:00 (Pracownik A, Pracownik B)
   - 15:00 (Pracownik B)
   ↓
7. Pracownik A nie jest widoczny po 15:00 (koniec jego pracy)
   ↓
8. W dniu urlopu pracownik w ogóle nie pojawia się
```

---

## 🧪 Testowanie

### Test 1: Zapisywanie godzin pracy
```
1. Edytuj pracownika
2. Otwórz "Zarządzaj dostępnością"
3. Ustaw różne godziny dla różnych dni
4. Zapisz
5. Odśwież stronę
6. Sprawdź czy godziny są zachowane
```

### Test 2: Dodawanie urlopu
```
1. W dostępności pracownika
2. Dodaj urlop na jutro
3. Zapisz
4. Sprawdź czy urlop pojawia się na liście
5. Spróbuj dodać rezerwację na ten dzień
6. Powinien być błąd: "Pracownik ma urlop"
```

### Test 3: Walidacja godzin w dashboardzie
```
1. Pracownik pracuje 09:00-15:00
2. Spróbuj dodać rezerwację na 16:00
3. Powinien być błąd z godzinam pracy
```

### Test 4: Filtrowanie na subdomenie
```
1. Pracownik A: 09:00-15:00
2. Pracownik B: 15:00-21:00
3. Otwórz subdomenę
4. Wybierz usługę i datę
5. Sprawdź dostępne sloty:
   - Przed 15:00: tylko Pracownik A
   - Po 15:00: tylko Pracownik B
```

### Test 5: Urlop na subdomenie
```
1. Dodaj urlop pracownikowi na konkretny dzień
2. Otwórz subdomenę
3. Wybierz ten dzień
4. Pracownik NIE powinien się pojawić w dostępnych slotach
5. Jeśli to jedyny pracownik: "Brak wolnych terminów"
```

---

## 📝 Komunikaty Błędów

### Dashboard (ręczne dodawanie):
- ❌ "Pracownik ma urlop w tym dniu"
- ❌ "Pracownik nie pracuje w tym dniu tygodnia"
- ❌ "Pracownik pracuje od 09:00 do 17:00"

### Subdomena (publiczna rezerwacja):
- ℹ️ "Brak wolnych terminów" (gdy wszyscy pracownicy niedostępni)
- ℹ️ Sloty są automatycznie filtrowane (klient nie widzi niedostępnych)

---

## 🔄 Domyślne Wartości

Jeśli pracownik nie ma ustawionych godzin pracy:

```typescript
const defaultHours = [
  { day: 'monday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'friday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
  { day: 'sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
];
```

---

## ✅ Status Wdrożenia

- [x] Backend - model availability (już istniał)
- [x] Backend - getAvailability() - pobieranie
- [x] Backend - updateAvailability() - zapisywanie
- [x] Backend - addTimeOff() - dodawanie urlopu
- [x] Backend - removeTimeOff() - usuwanie urlopu
- [x] Backend - checkEmployeeAvailability() - walidacja
- [x] Backend - walidacja w create()
- [x] Backend - walidacja w createPublicBooking()
- [x] Backend - filtrowanie w checkAvailability()
- [x] Frontend - API client
- [x] Frontend - komponent EmployeeAvailability
- [x] Frontend - integracja w stronie pracownika
- [x] Backend zbudowany
- [x] Frontend zbudowany
- [x] Serwisy zrestartowane

---

## 🚀 Następne Kroki (Opcjonalne)

1. **Powiadomienia**:
   - Email do właściciela gdy ktoś próbuje zarezerwować w czasie urlopu
   - Przypomnienie o nadchodzących urlopach

2. **Statystyki**:
   - Ile dni urlopu wykorzystał pracownik
   - Najczęściej wybierane godziny pracy

3. **Bulk operations**:
   - Kopiowanie godzin pracy między pracownikami
   - Import urlopów z pliku CSV

4. **Integracje**:
   - Synchronizacja z Google Calendar
   - Export urlopów do kalendarza

---

**Wdrożył**: Cascade AI  
**Data**: 2024-12-10  
**Wersja**: 1.0.0
