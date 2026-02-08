# 🔍 Debugowanie Zapisywania Dostępności - Instrukcja

**Data**: 2024-12-10  
**Problem**: Dostępność się nie zapisuje mimo komunikatu sukcesu

---

## 🧪 Jak Przetestować (Krok po Kroku)

### Test 1: Sprawdź Logi w Konsoli Przeglądarki

1. **Otwórz konsolę** (F12 → Console)
2. **Wyczyść konsolę** (Ctrl+L lub ikona 🚫)
3. **Przejdź do**: Dashboard → Pracownicy → [Wybierz pracownika]
4. **Kliknij**: "Zarządzaj dostępnością"

**Sprawdź logi ładowania**:
```
📥 Loading availability for employee: emp-xxx
📥 Received data: { workingHours: [...], timeOff: [] }
✅ Loaded working hours: 7 days
```

5. **Zmień godziny** (np. Poniedziałek: 09:00 → 10:00)
6. **Kliknij "Zapisz"**

**Sprawdź logi zapisywania**:
```
💾 Saving availability for employee: emp-xxx
📅 Working hours: [
  { day: 'monday', enabled: true, startTime: '10:00', endTime: '17:00' },
  ...
]
🏖️ Time off: []
✅ Save response: { id: 'emp-xxx', message: '...' }
```

7. **Po zapisaniu** powinny pojawić się logi ponownego ładowania:
```
📥 Loading availability for employee: emp-xxx
📥 Received data: { workingHours: [...], timeOff: [] }
✅ Loaded working hours: 7 days
```

### Test 2: Sprawdź Network Tab

1. **Otwórz Network** (F12 → Network)
2. **Filtruj**: "availability"
3. **Kliknij "Zapisz"**

**Sprawdź requesty**:

#### Request 1: PUT /api/employees/{id}/availability
```
Status: 200 OK
Request Headers:
  X-Tenant-ID: default
Request Payload:
  {
    "workingHours": [
      { "day": "monday", "enabled": true, "startTime": "10:00", "endTime": "17:00" },
      ...
    ],
    "timeOff": []
  }
Response:
  {
    "id": "emp-xxx",
    "firstName": "...",
    "lastName": "...",
    "message": "Dostępność została zaktualizowana"
  }
```

#### Request 2: GET /api/employees/{id}/availability (reload)
```
Status: 200 OK
Response:
  {
    "workingHours": [
      { "day": "monday", "enabled": true, "startTime": "10:00", "endTime": "17:00" },
      ...
    ],
    "timeOff": []
  }
```

**❌ Jeśli Request 2 zwraca stare dane** → Problem w backendzie (nie zapisuje)

### Test 3: Sprawdź Backend Logs

```bash
pm2 logs rezerwacja24-backend --lines 50
```

**Szukaj**:
```
🔧 updateAvailability called for employee: emp-xxx
📅 Received data: { "workingHours": [...], "timeOff": [] }
✅ Saving 5 working days
💾 Creating availability: { id: 'avail-...', dayOfWeek: 'MONDAY', ... }
✅ Created successfully
💾 Creating availability: { id: 'avail-...', dayOfWeek: 'TUESDAY', ... }
✅ Created successfully
...
✅ Working hours saved successfully
```

**❌ Jeśli nie ma tych logów** → Request nie dochodzi do backendu

**❌ Jeśli są błędy**:
```
❌ Invalid day: monday
❌ Error creating availability: ...
```

### Test 4: Sprawdź Bazę Danych

```sql
-- Sprawdź czy rekordy są zapisywane
SELECT * FROM availability 
WHERE "employeeId" = 'emp-xxx' 
AND "specificDate" IS NULL
ORDER BY "dayOfWeek";

-- Sprawdź wszystkie rekordy dla pracownika
SELECT 
  id,
  "dayOfWeek",
  "startTime",
  "endTime",
  "specificDate",
  "isActive",
  "createdAt"
FROM availability 
WHERE "employeeId" = 'emp-xxx'
ORDER BY "createdAt" DESC
LIMIT 20;
```

**Oczekiwany wynik**:
- Dla każdego włączonego dnia powinien być 1 rekord
- `specificDate` = NULL
- `isActive` = true
- `dayOfWeek` = MONDAY, TUESDAY, etc.

**❌ Jeśli brak rekordów** → Problem z zapisem w Prisma

**❌ Jeśli są stare rekordy** → Usuwanie nie działa

---

## 🐛 Możliwe Problemy i Rozwiązania

### Problem 1: Brak logów w konsoli
**Przyczyna**: Frontend nie wywołuje funkcji  
**Rozwiązanie**: Sprawdź czy przycisk "Zapisz" ma `onClick={handleSave}`

### Problem 2: Request nie wychodzi (brak w Network)
**Przyczyna**: Błąd JavaScript przed wywołaniem API  
**Rozwiązanie**: Sprawdź Console → Errors

### Problem 3: Request 404
**Przyczyna**: Nieprawidłowy URL  
**Rozwiązanie**: Sprawdź czy używa `getApiUrl()` i ma `/api/`

### Problem 4: Request 401/403
**Przyczyna**: Brak autoryzacji  
**Rozwiązanie**: Sprawdź nagłówek `X-Tenant-ID`

### Problem 5: Backend nie otrzymuje danych
**Przyczyna**: Brak logów w pm2  
**Rozwiązanie**: 
```bash
# Sprawdź czy backend działa
pm2 status

# Sprawdź czy port 3001 jest otwarty
curl http://localhost:3001/api/health

# Restart backendu
pm2 restart rezerwacja24-backend
```

### Problem 6: Dane nie zapisują się w bazie
**Przyczyna**: Błąd Prisma  
**Rozwiązanie**: Sprawdź backend logs:
```bash
pm2 logs rezerwacja24-backend --err
```

### Problem 7: Stare dane po reload
**Przyczyna**: Cache lub usuwanie nie działa  
**Rozwiązanie**: 
```sql
-- Usuń ręcznie stare rekordy
DELETE FROM availability 
WHERE "employeeId" = 'emp-xxx' 
AND "specificDate" IS NULL;
```

---

## ✅ Co Zostało Naprawione

### 1. Dodano szczegółowe logi
- **Frontend**: 📥 📅 🏖️ ✅ ❌
- **Backend**: 🔧 📅 💾 ✅ ❌

### 2. Dodano walidację dni
```typescript
const dayOfWeekEnum = daysMap[day.day];
if (!dayOfWeekEnum) {
  console.error('❌ Invalid day:', day.day);
  continue;
}
```

### 3. Dodano obsługę błędów
```typescript
try {
  await this.prisma.availability.create({ data: record });
  console.log('✅ Created successfully');
} catch (error) {
  console.error('❌ Error creating availability:', error.message);
  throw error;
}
```

### 4. Naprawiono brak timeOff w odpowiedzi
```typescript
if (employee.availability.length === 0) {
  return { 
    workingHours: defaultHours,
    timeOff: []  // ← DODANE
  };
}
```

---

## 📋 Checklist Debugowania

Gdy dostępność się nie zapisuje, sprawdź po kolei:

- [ ] **Console** → Czy są logi "💾 Saving availability"?
- [ ] **Console** → Czy są błędy JavaScript?
- [ ] **Network** → Czy request PUT wychodzi?
- [ ] **Network** → Czy status 200 OK?
- [ ] **Network** → Czy payload zawiera prawidłowe dane?
- [ ] **Network** → Czy GET po zapisie zwraca nowe dane?
- [ ] **Backend Logs** → Czy są logi "🔧 updateAvailability called"?
- [ ] **Backend Logs** → Czy są logi "💾 Creating availability"?
- [ ] **Backend Logs** → Czy są błędy?
- [ ] **Database** → Czy rekordy są w tabeli?

---

## 🆘 Jeśli Nadal Nie Działa

### Krok 1: Wyślij mi logi
```bash
# Console logs (skopiuj z przeglądarki)
# Network tab (screenshot)
# Backend logs:
pm2 logs rezerwacja24-backend --lines 100 > backend-logs.txt
```

### Krok 2: Wyślij mi dane z bazy
```sql
SELECT * FROM availability 
WHERE "employeeId" = 'emp-xxx';
```

### Krok 3: Sprawdź czy employeeId jest prawidłowy
```
Console → Sprawdź: "💾 Saving availability for employee: ???"
```

---

**Utworzył**: Cascade AI  
**Data**: 2024-12-10  
**Wersja**: 2.0
