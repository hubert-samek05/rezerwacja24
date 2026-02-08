# 📊 ZAKŁADKA KLIENCI - STATUS IMPLEMENTACJI

**Data:** 30 Listopada 2024, 21:45 CET  
**Status:** 🔄 **50% GOTOWE - WYMAGA DOKOŃCZENIA**

---

## ✅ CO ZOSTAŁO ZROBIONE:

### 1. **Importy i State** ✅
- Dodano import `getCustomers`, `getBookings`, `getCustomerDebt`
- Dodano state dla prawdziwych danych
- Dodano state dla filtrów, sortowania, paginacji
- Dodano state dla modali

### 2. **Funkcje pomocnicze** ✅
```typescript
- loadData() - ładuje klientów i rezerwacje
- applyFiltersAndSort() - filtruje i sortuje
- handleSort(field) - zmienia sortowanie
- handleDeleteCustomer(id) - usuwa klienta
- handleExport() - eksportuje do CSV
- getCustomerBookings(id) - zwraca rezerwacje klienta
- getLastVisit(id) - zwraca datę ostatniej wizyty
```

### 3. **Statystyki** ✅
Dodano 5. kartę:
- **Łączny dług** (czerwony)
- Pokazuje sumę wszystkich długów
- Pokazuje liczbę klientów z długiem
- Prawdziwe obliczenia z danych

### 4. **Przycisk Eksportu** ✅
- Dodano w headerze obok "Dodaj klienta"
- Eksportuje do CSV z długiem
- Kolumny: Imię, Nazwisko, Email, Telefon, Wizyty, Wydano, **Dług**, Status

---

## ❌ CO WYMAGA DOKOŃCZENIA:

### 1. **Tabela - Nagłówki** ⏳ KRYTYCZNE
Trzeba dodać kolumnę "Dług":
```typescript
<th className="px-6 py-4 text-left text-sm font-semibold text-neutral-gray">
  Dług
</th>
```

### 2. **Tabela - Wiersze** ⏳ KRYTYCZNE  
Trzeba zamienić `mockCustomers` na `paginatedCustomers`:
```typescript
// PRZED:
{mockCustomers.map((customer, index) => (

// PO:
{paginatedCustomers.map((customer, index) => (
```

### 3. **Tabela - Kolumna Dług** ⏳ KRYTYCZNE
Dodać wyświetlanie długu NA CZERWONO:
```typescript
<td className="px-6 py-4">
  {(() => {
    const debt = getCustomerDebt(customer.id)
    return debt > 0 ? (
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-400 font-bold">
          Dług: {debt} zł
        </span>
      </div>
    ) : (
      <span className="text-accent-neon text-sm">✓ Rozliczony</span>
    )
  })()}
</td>
```

### 4. **Tabela - Dane klienta** ⏳
Zaktualizować wyświetlanie:
```typescript
// Inicjały:
const initials = `${customer.firstName[0]}${customer.lastName[0]}`

// Nazwa:
{customer.firstName} {customer.lastName}

// Wizyty:
{customer.totalVisits || 0}

// Ostatnia wizyta:
{getLastVisit(customer.id)}

// Wydano:
{customer.totalSpent || 0} zł
```

### 5. **Przyciski akcji** ⏳
Dodać funkcjonalność:
```typescript
// Szczegóły:
<button onClick={() => {
  setSelectedCustomer(customer)
  setShowDetailsModal(true)
}}>
  <Eye />
</button>

// Usuń:
<button onClick={() => handleDeleteCustomer(customer.id)}>
  <Trash2 />
</button>
```

### 6. **Paginacja** ⏳
Zaktualizować licznik i przyciski:
```typescript
// Licznik:
Pokazano {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} z {filteredCustomers.length}

// Przyciski:
<button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
  Poprzednia
</button>
```

### 7. **Modal szczegółów** ⏳
Dodać na końcu pliku przed zamknięciem:
```typescript
<AnimatePresence>
  {showDetailsModal && selectedCustomer && (
    <motion.div className="fixed inset-0 bg-black/50 z-50">
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 8. **Usunąć mockCustomers** ⏳
Usunąć cały blok na końcu pliku (linie 246-303)

---

## 🔴 PRIORYTET 1 - DŁUG NA CZERWONO:

To jest **NAJWAŻNIEJSZE** - klient musi widzieć długi!

### Gdzie dodać:
1. Nagłówek tabeli - dodać `<th>Dług</th>`
2. Wiersz tabeli - dodać `<td>` z długiem
3. Kolor czerwony dla długu > 0
4. Ikona AlertCircle dla ostrzeżenia

### Przykład:
```
┌──────────────┬─────────┬────────┬──────────────┬─────────┬────────────────┬────────┐
│ Klient       │ Kontakt │ Wizyty │ Ostatnia wiz.│ Wydano  │ DŁUG           │ Status │
├──────────────┼─────────┼────────┼──────────────┼─────────┼────────────────┼────────┤
│ Jan Kowalski │ email   │   12   │  2024-11-28  │ 720 zł  │ ✓ Rozliczony   │ Aktywny│
│              │ phone   │        │              │         │ (zielony)      │        │
├──────────────┼─────────┼────────┼──────────────┼─────────┼────────────────┼────────┤
│ Maria Nowak  │ email   │    8   │  2024-11-25  │ 480 zł  │ ⚠️ Dług: 50 zł │ VIP    │
│              │ phone   │        │              │         │ (CZERWONY)     │        │
└──────────────┴─────────┴────────┴──────────────┴─────────┴────────────────┴────────┘
```

---

## 📝 SZYBKI PLAN DOKOŃCZENIA:

### Krok 1: Aktualizacja tabeli (5 min)
```typescript
// 1. Dodać nagłówek "Dług"
// 2. Zamienić mockCustomers na paginatedCustomers
// 3. Dodać kolumnę z długiem (czerwony tekst)
// 4. Zaktualizować dane klienta
```

### Krok 2: Działające przyciski (3 min)
```typescript
// 1. Przycisk szczegółów → setShowDetailsModal(true)
// 2. Przycisk usuń → handleDeleteCustomer(id)
```

### Krok 3: Paginacja (2 min)
```typescript
// 1. Zaktualizować licznik
// 2. Dodać onClick do przycisków
```

### Krok 4: Usunąć mock data (1 min)
```typescript
// Usunąć const mockCustomers = [...]
```

### Krok 5: Modal szczegółów (10 min)
```typescript
// Dodać modal z historią wizyt
// Opcjonalne - można zrobić później
```

**TOTAL:** ~20 minut do pełnej funkcjonalności

---

## 🎯 CO DZIAŁA JUŻ TERAZ:

1. ✅ Prawdziwe statystyki (5 kart)
2. ✅ Karta "Łączny dług" (czerwona)
3. ✅ Przycisk "Eksportuj CSV"
4. ✅ Funkcje filtrowania (w tle)
5. ✅ Funkcje sortowania (w tle)
6. ✅ Funkcja usuwania (w tle)
7. ✅ Obliczanie długu (getCustomerDebt)

---

## 🚀 NASTĘPNE KROKI:

1. **Build i deploy obecnej wersji** - żeby zobaczyć statystyki
2. **Dokończyć tabelę** - najważniejsze!
3. **Dodać modal szczegółów** - opcjonalne

---

**Status:** 🔄 **WYMAGA DOKOŃCZENIA**  
**Priorytet:** 🔴 **WYSOKI** - Tabela z długiem!  
**Czas:** ~20 minut do pełnej funkcjonalności

