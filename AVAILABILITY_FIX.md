# 🔧 Naprawa Zapisywania Dostępności Pracowników

**Data**: 2024-12-10  
**Problem**: Dostępność pracowników nie była zapisywana w bazie danych

---

## 🐛 Znaleziony Problem

### 1. **Brak nagłówka X-Tenant-ID**
Frontend nie wysyłał nagłówka `X-Tenant-ID` w requestach do API dostępności.

**Efekt**: Backend nie mógł prawidłowo zapisać danych.

### 2. **Brak przeładowania po zapisaniu**
Po zapisaniu dostępności frontend nie przeładowywał danych z serwera.

**Efekt**: Użytkownik nie widział potwierdzenia że dane zostały zapisane.

### 3. **Potencjalne duplikaty ID**
Generowanie ID w pętli mogło tworzyć duplikaty.

**Efekt**: Możliwe błędy przy zapisywaniu wielu dni naraz.

---

## ✅ Rozwiązania

### 1. Dodano nagłówek X-Tenant-ID

**Plik**: `frontend/lib/api/employees.ts`

```typescript
async updateAvailability(id: string, data: {...}): Promise<any> {
  const response = await axios.put(
    `${getApiUrl()}/api/employees/${id}/availability`, 
    data, 
    {
      headers: { 'X-Tenant-ID': 'default' }  // ← DODANE
    }
  );
  return response.data;
}
```

### 2. Dodano przeładowanie po zapisaniu

**Plik**: `frontend/components/EmployeeAvailability.tsx`

```typescript
const handleSave = async () => {
  try {
    setSaving(true);
    await employeesApi.updateAvailability(employeeId, {
      workingHours,
      timeOff,
    });
    toast.success('Dostępność została zaktualizowana');
    
    // Przeładuj dane aby potwierdzić zapis
    await loadAvailability();  // ← DODANE
  } catch (error: any) {
    // ...
  }
};
```

### 3. Dodano opóźnienie między zapisami

**Plik**: `backend/src/employees/employees.service.ts`

```typescript
for (const day of workingHours) {
  if (day.enabled) {
    await this.prisma.availability.create({ data: record });
    // Małe opóźnienie aby uniknąć duplikatów ID
    await new Promise(resolve => setTimeout(resolve, 10));  // ← DODANE
  }
}
```

### 4. Dodano szczegółowe logi

**Backend**:
```typescript
console.log('🔧 updateAvailability called for employee:', employeeId);
console.log('📅 Received data:', JSON.stringify(availabilityData, null, 2));
console.log('✅ Saving', workingHours.filter(d => d.enabled).length, 'working days');
console.log('💾 Creating availability:', record);
console.log('✅ Working hours saved successfully');
```

**Frontend**:
```typescript
console.log('💾 Saving availability for employee:', employeeId);
console.log('📅 Working hours:', workingHours);
console.log('🏖️ Time off:', timeOff);
console.log('✅ Save response:', response);
```

---

## 🧪 Jak Przetestować

### Test 1: Zapisywanie godzin pracy

```
1. Przejdź do: Dashboard → Pracownicy → [Wybierz pracownika]
2. Kliknij "Zarządzaj dostępnością"
3. Ustaw godziny dla kilku dni:
   - Poniedziałek: 09:00 - 15:00 ✅
   - Wtorek: 15:00 - 21:00 ✅
   - Środa: wyłączona ❌
   - Czwartek: 09:00 - 17:00 ✅
4. Kliknij "Zapisz"
5. Poczekaj na toast: "Dostępność została zaktualizowana"
6. Zamknij modal
7. Otwórz ponownie "Zarządzaj dostępnością"
8. ✅ Sprawdź czy godziny są zachowane
```

### Test 2: Sprawdzenie w bazie danych

```sql
-- Sprawdź zapisane godziny pracy
SELECT * FROM availability 
WHERE "employeeId" = 'emp-xxx' 
AND "specificDate" IS NULL
ORDER BY "dayOfWeek";

-- Powinno zwrócić rekordy dla włączonych dni
```

### Test 3: Sprawdzenie logów

**Backend logs** (pm2 logs rezerwacja24-backend):
```
🔧 updateAvailability called for employee: emp-xxx
📅 Received data: { workingHours: [...], timeOff: [] }
✅ Saving 4 working days
💾 Creating availability: { id: 'avail-...', dayOfWeek: 'MONDAY', ... }
💾 Creating availability: { id: 'avail-...', dayOfWeek: 'TUESDAY', ... }
...
✅ Working hours saved successfully
```

**Frontend console** (F12):
```
💾 Saving availability for employee: emp-xxx
📅 Working hours: [...]
🏖️ Time off: []
✅ Save response: { id: 'emp-xxx', message: '...' }
```

### Test 4: Walidacja przy rezerwacji

```
1. Ustaw pracownikowi godziny: 09:00-15:00
2. Zapisz
3. Przejdź do Kalendarza
4. Spróbuj dodać rezerwację na 16:00
5. ✅ Powinien być błąd: "Pracownik pracuje od 09:00 do 15:00"
```

### Test 5: Urlopy

```
1. W dostępności pracownika dodaj urlop na jutro
2. Zapisz
3. ✅ Urlop powinien pojawić się na liście
4. Zamknij i otwórz ponownie modal
5. ✅ Urlop nadal jest na liście
6. Spróbuj dodać rezerwację na ten dzień
7. ✅ Błąd: "Pracownik ma urlop w tym dniu"
```

---

## 📊 Logi do Monitorowania

### Jeśli zapisywanie NIE działa:

**Sprawdź backend logs**:
```bash
pm2 logs rezerwacja24-backend --lines 50
```

**Szukaj**:
- ❌ Błędy Prisma (duplikaty ID, błędy walidacji)
- ❌ Brak logów "updateAvailability called" (request nie dochodzi)
- ❌ Błędy "NotFoundException" (zły employeeId)

**Sprawdź frontend console**:
- ❌ Błędy 400/500 w Network tab
- ❌ Brak nagłówka X-Tenant-ID
- ❌ Nieprawidłowy format danych

---

## ✅ Status

- [x] Dodano nagłówek X-Tenant-ID
- [x] Dodano przeładowanie po zapisaniu
- [x] Dodano opóźnienie między zapisami
- [x] Dodano szczegółowe logi
- [x] Backend zbudowany
- [x] Frontend zbudowany
- [x] Serwisy zrestartowane

---

## 🔍 Debugging

Jeśli nadal nie działa:

### 1. Sprawdź czy request dochodzi do backendu
```bash
pm2 logs rezerwacja24-backend | grep "updateAvailability"
```

### 2. Sprawdź response w Network tab
```
F12 → Network → Filtruj: "availability" → Kliknij request → Response
```

### 3. Sprawdź bazę danych
```sql
SELECT COUNT(*) FROM availability WHERE "employeeId" = 'emp-xxx';
```

### 4. Sprawdź czy employeeId jest prawidłowy
```
Console → Sprawdź logi: "Saving availability for employee: ..."
```

---

**Naprawił**: Cascade AI  
**Data**: 2024-12-10  
**Status**: ✅ NAPRAWIONE
