# ✅ Naprawy Kalendarza i Systemu Rezerwacji

**Data**: 2024-12-10  
**Status**: ✅ NAPRAWIONE

---

## 🐛 Znalezione Problemy

### 1. **Zmiana statusu rezerwacji nie działała**
- **Problem**: W kalendarzu zmiana statusu używała `updateBooking` z localStorage zamiast API
- **Efekt**: Status nie był zapisywany w bazie danych
- **Lokalizacja**: `frontend/app/dashboard/calendar/page.tsx`

### 2. **Zmiana statusu płatności nie działała**
- **Problem**: Podobnie jak status rezerwacji - używał localStorage
- **Efekt**: Status płatności nie był aktualizowany
- **Lokalizacja**: `frontend/app/dashboard/calendar/page.tsx`

### 3. **Usuwanie rezerwacji nie działało**
- **Problem**: Używał `deleteBooking` z localStorage zamiast API
- **Efekt**: Rezerwacje nie były usuwane z bazy danych
- **Lokalizacja**: `frontend/app/dashboard/calendar/page.tsx`

### 4. **Brak automatycznego zatwierdzania rezerwacji przez pracownika**
- **Problem**: Rezerwacje dodawane przez pracownika miały status PENDING
- **Wymaganie**: Powinny być automatycznie zatwierdzone (CONFIRMED)
- **Lokalizacja**: `frontend/app/dashboard/calendar/page.tsx`

### 5. **Rezerwacje z subdomeny zawsze CONFIRMED**
- **Problem**: Backend na sztywno ustawiał status CONFIRMED dla publicznych rezerwacji
- **Wymaganie**: Powinien sprawdzać ustawienie `autoConfirmBookings` w panelu biznesowym
- **Lokalizacja**: `backend/src/bookings/bookings.service.ts`

### 6. **Nieprawidłowe pobieranie tenanta**
- **Problem**: Backend używał `employee.userId` zamiast prawdziwego `tenantId`
- **Efekt**: Ustawienia `autoConfirmBookings` nie były sprawdzane poprawnie
- **Lokalizacja**: `backend/src/bookings/bookings.service.ts`

---

## ✅ Rozwiązania

### Frontend (`frontend/app/dashboard/calendar/page.tsx`)

#### 1. Naprawiono `handleStatusChange`:
```typescript
const handleStatusChange = async (bookingId: string, newStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed') => {
  try {
    await axios.patch(`${API_URL}/api/bookings/${bookingId}`, 
      { status: newStatus.toUpperCase() },
      { headers: { 'X-Tenant-ID': 'default' } }
    )
    toast.success('Status został zaktualizowany')
    loadData()
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus })
    }
  } catch (error) {
    console.error('Błąd zmiany statusu:', error)
    toast.error('Nie udało się zmienić statusu')
  }
}
```

#### 2. Naprawiono `handlePaymentStatusChange`:
```typescript
const handlePaymentStatusChange = async (bookingId: string, newPaymentStatus: 'paid' | 'unpaid' | 'partial') => {
  try {
    await axios.patch(`${API_URL}/api/bookings/${bookingId}`, 
      { isPaid: newPaymentStatus === 'paid' },
      { headers: { 'X-Tenant-ID': 'default' } }
    )
    toast.success('Status płatności został zaktualizowany')
    loadData()
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, paymentStatus: newPaymentStatus })
    }
  } catch (error) {
    console.error('Błąd zmiany statusu płatności:', error)
    toast.error('Nie udało się zmienić statusu płatności')
  }
}
```

#### 3. Naprawiono `handleDeleteBooking`:
```typescript
const handleDeleteBooking = async (id: string) => {
  if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
    try {
      await axios.delete(`${API_URL}/api/bookings/${id}`, {
        headers: { 'X-Tenant-ID': 'default' }
      })
      toast.success('Rezerwacja została usunięta')
      loadData()
      setSelectedBooking(null)
    } catch (error) {
      console.error('Błąd usuwania:', error)
      toast.error('Nie udało się usunąć rezerwacji')
    }
  }
}
```

#### 4. Dodano automatyczne zatwierdzanie rezerwacji przez pracownika:
```typescript
} else {
  const response = await axios.post(`${API_URL}/api/bookings`, bookingData, config)
  const newBooking = response.data
  
  // Automatycznie zatwierdź rezerwację dodaną przez pracownika
  if (newBooking.status === 'PENDING') {
    await axios.patch(`${API_URL}/api/bookings/${newBooking.id}`, 
      { status: 'CONFIRMED' },
      config
    )
  }
  
  // ... reszta kodu
  status: 'confirmed', // Zawsze confirmed dla rezerwacji pracownika
}
```

---

### Backend (`backend/src/bookings/bookings.service.ts`)

#### 1. Naprawiono pobieranie tenanta w `create()`:
```typescript
// Pobierz ustawienia tenanta - używamy tenantId przekazanego do funkcji
// Jeśli tenantId to 'default', szukamy tenanta po ownerId
let tenant: any = null;
if (tenantId !== 'default') {
  tenant = await this.prisma.tenants.findUnique({
    where: { id: tenantId },
  });
} else {
  // Znajdź tenanta po userId pracownika
  tenant = await this.prisma.tenants.findFirst({
    where: { ownerId: employee.userId },
  });
}

// Określ status rezerwacji na podstawie metody płatności
let bookingStatus: 'PENDING' | 'CONFIRMED' = 'PENDING';
let isPaid = false;

if (paymentMethod === 'cash') {
  // Płatność na miejscu - status zależy od ustawień
  const autoConfirm = tenant?.autoConfirmBookings !== false; // domyślnie true
  bookingStatus = autoConfirm ? 'CONFIRMED' : 'PENDING';
} else if (paymentMethod === 'przelewy24' || paymentMethod === 'stripe') {
  // Płatność online - zawsze PENDING do momentu potwierdzenia płatności
  bookingStatus = 'PENDING';
}
```

#### 2. Naprawiono `createPublicBooking()`:
```typescript
// Pobierz ustawienia tenanta dla publicznej rezerwacji
const tenant = await this.prisma.tenants.findUnique({
  where: { id: tenantId },
});

// Określ status rezerwacji na podstawie ustawień tenanta
// Jeśli autoConfirmBookings = true (lub nie ustawione), to CONFIRMED
// Jeśli autoConfirmBookings = false, to PENDING
const autoConfirm = tenant?.autoConfirmBookings !== false; // domyślnie true
const bookingStatus = autoConfirm ? 'CONFIRMED' : 'PENDING';

// Utwórz rezerwację
const booking = await this.prisma.bookings.create({
  data: {
    // ...
    status: bookingStatus as any, // Dynamiczny status
    // ...
  },
});
```

---

## 🎯 Logika Statusów Rezerwacji

### Rezerwacje dodawane przez pracownika (Dashboard):
✅ **Zawsze CONFIRMED** - automatycznie zatwierdzone

### Rezerwacje z subdomeny (Landing Page):
- ✅ **CONFIRMED** - jeśli `autoConfirmBookings = true` (domyślnie)
- ⏳ **PENDING** - jeśli `autoConfirmBookings = false`

### Rezerwacje z płatnością online:
- ⏳ **PENDING** - do momentu potwierdzenia płatności
- ✅ **CONFIRMED** - po potwierdzeniu płatności przez webhook

---

## 🔧 Ustawienie `autoConfirmBookings`

### W bazie danych (model `tenants`):
```sql
-- Domyślna wartość: true
autoConfirmBookings Boolean? @default(true)
```

### Jak zmienić ustawienie:
1. **Przez panel administracyjny** (TODO - dodać do ustawień firmy)
2. **Bezpośrednio w bazie**:
```sql
UPDATE tenants 
SET "autoConfirmBookings" = false 
WHERE id = 'tenant_id';
```

---

## 📊 Przepływ Rezerwacji

### Scenariusz 1: Pracownik dodaje rezerwację
```
1. Pracownik wypełnia formularz w kalendarzu
   ↓
2. POST /api/bookings (status: PENDING)
   ↓
3. Frontend automatycznie wywołuje PATCH /api/bookings/:id (status: CONFIRMED)
   ↓
4. Rezerwacja zapisana jako CONFIRMED
```

### Scenariusz 2: Klient rezerwuje przez subdomenę (autoConfirm = true)
```
1. Klient wypełnia formularz na landing page
   ↓
2. POST /api/bookings/public
   ↓
3. Backend sprawdza tenant.autoConfirmBookings (true)
   ↓
4. Rezerwacja zapisana jako CONFIRMED
```

### Scenariusz 3: Klient rezerwuje przez subdomenę (autoConfirm = false)
```
1. Klient wypełnia formularz na landing page
   ↓
2. POST /api/bookings/public
   ↓
3. Backend sprawdza tenant.autoConfirmBookings (false)
   ↓
4. Rezerwacja zapisana jako PENDING
   ↓
5. Pracownik musi ręcznie zatwierdzić w dashboardzie
```

---

## 🧪 Testowanie

### Test 1: Zmiana statusu w kalendarzu
```
1. Otwórz kalendarz
2. Kliknij na rezerwację
3. Zmień status w dropdown
4. Sprawdź czy status się zmienił
5. Odśwież stronę - status powinien być zachowany
```

### Test 2: Zmiana statusu płatności
```
1. Otwórz szczegóły rezerwacji
2. Zmień status płatności
3. Sprawdź czy zmiana została zapisana
```

### Test 3: Usuwanie rezerwacji
```
1. Kliknij "Usuń" na rezerwacji
2. Potwierdź usunięcie
3. Sprawdź czy rezerwacja zniknęła z kalendarza
4. Sprawdź w bazie danych czy została usunięta
```

### Test 4: Dodawanie rezerwacji przez pracownika
```
1. Dodaj nową rezerwację w kalendarzu
2. Sprawdź czy status to "Potwierdzona" (nie "Oczekująca")
3. Sprawdź w bazie: status powinien być CONFIRMED
```

### Test 5: Rezerwacja z subdomeny (autoConfirm = true)
```
1. Ustaw autoConfirmBookings = true
2. Zarezerwuj przez landing page
3. Sprawdź w dashboardzie - status powinien być "Potwierdzona"
```

### Test 6: Rezerwacja z subdomeny (autoConfirm = false)
```
1. Ustaw autoConfirmBookings = false
2. Zarezerwuj przez landing page
3. Sprawdź w dashboardzie - status powinien być "Oczekująca"
4. Ręcznie zatwierdź rezerwację
```

---

## ✅ Status Wdrożenia

- [x] Frontend - naprawiono funkcje zmiany statusu
- [x] Frontend - naprawiono funkcję usuwania
- [x] Frontend - dodano automatyczne zatwierdzanie przez pracownika
- [x] Backend - naprawiono pobieranie tenanta
- [x] Backend - dodano sprawdzanie autoConfirmBookings w createPublicBooking
- [x] Backend zbudowany
- [x] Frontend zbudowany
- [x] Serwisy zrestartowane

---

## 📝 TODO - Przyszłe Ulepszenia

1. **Panel ustawień firmy**:
   - Dodać checkbox "Automatyczne zatwierdzanie rezerwacji z landing page"
   - Lokalizacja: `/dashboard/settings` → zakładka "Rezerwacje"

2. **Filtrowanie pracowników w kalendarzu**:
   - Sprawdzić czy działa wybieranie konkretnego pracownika
   - Testować widok "Wszyscy pracownicy" vs pojedynczy pracownik

3. **Powiadomienia**:
   - Email do klienta po utworzeniu rezerwacji (PENDING vs CONFIRMED)
   - Email do pracownika o nowej rezerwacji wymagającej zatwierdzenia

4. **Statystyki**:
   - Ile rezerwacji oczekuje na zatwierdzenie
   - Średni czas zatwierdzania rezerwacji

---

**Naprawił**: Cascade AI  
**Data**: 2024-12-10  
**Wersja**: 1.1.0
