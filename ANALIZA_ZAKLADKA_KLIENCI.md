# 📊 ANALIZA I PLAN - ZAKŁADKA KLIENCI

**Data:** 30 Listopada 2024, 21:42 CET  
**Status:** 🔄 **W TRAKCIE IMPLEMENTACJI**

---

## ❌ CO NIE DZIAŁA (PROBLEMY):

### 1. **Brak połączenia z prawdziwymi danymi**
- Używa `mockCustomers` zamiast `getCustomers()` z localStorage
- Statystyki są hardcoded (1,245, 87, 892, $340)
- Nie ma prawdziwych obliczeń

### 2. **Przyciski bez funkcjonalności**
- 👁️ Eye (Szczegóły) - nie otwiera modalu
- ✏️ Edit (Edycja) - nie otwiera formularza
- 🗑️ Trash2 (Usuń) - nie usuwa klienta

### 3. **Brak wyświetlania długu** ❌ KRYTYCZNE
- Nie pokazuje niezapłaconych kwot
- Brak czerwonego oznaczenia dla klientów z długiem
- Brak kolumny "Dług"

### 4. **Filtry nie działają**
- `searchQuery` nie filtruje listy
- `filterStatus` nie filtruje po statusie
- Brak sortowania po kolumnach

### 5. **Paginacja statyczna**
- Przyciski nie zmieniają strony
- Zawsze pokazuje te same dane
- Licznik "1-10 z 1,245" jest hardcoded

### 6. **Brak modali**
- Brak modalu szczegółów klienta
- Brak modalu edycji
- Brak historii wizyt klienta

### 7. **Brak eksportu**
- Nie ma przycisku eksportu do CSV
- Nie można wyeksportować bazy klientów

---

## ✅ CO DZIAŁA DOBRZE:

1. **UI/UX Design** - ładny, nowoczesny interfejs
2. **Struktura tabeli** - dobra organizacja kolumn
3. **Ikony i kolory** - przejrzyste oznaczenia
4. **Responsywność** - grid adaptacyjny
5. **Animacje** - Framer Motion dla wierszy

---

## 🎯 CO TRZEBA DODAĆ:

### 1. **Prawdziwe dane** ✅ DODANE
```typescript
- getCustomers() z localStorage
- getBookings() dla historii
- getCustomerDebt() dla długów
- Prawdziwe obliczenia statystyk
```

### 2. **Kolumna DŁUG** ✅ KRYTYCZNE
```typescript
// W tabeli dodać kolumnę:
<th>Dług</th>

// W wierszu:
const debt = getCustomerDebt(customer.id)
{debt > 0 && (
  <span className="text-red-400 font-bold">
    Dług: {debt} zł
  </span>
)}
```

### 3. **Działające filtry** ✅ DODANE
- Wyszukiwanie po imieniu, nazwisku, email, telefonie
- Filtrowanie po statusie (all, active, inactive, vip)
- Sortowanie po: nazwa, wizyty, wydano, dług

### 4. **Modal szczegółów klienta** ✅ POTRZEBNE
Zawartość:
- Pełne dane klienta
- Historia wizyt (tabela)
- Statystyki klienta
- Dług (jeśli jest)
- Lista niezapłaconych rezerwacji
- Przyciski akcji

### 5. **Modal edycji** ✅ POTRZEBNE
Pola:
- Imię, Nazwisko
- Email, Telefon
- Status (active, inactive, vip)
- Notatki

### 6. **Funkcja usuwania** ✅ DODANE
- Potwierdzenie przed usunięciem
- Usunięcie z localStorage
- Odświeżenie listy

### 7. **Eksport do CSV** ✅ DODANE
Kolumny:
- Imię, Nazwisko
- Email, Telefon
- Wizyty, Wydano
- **Dług** (ważne!)
- Status

### 8. **Paginacja** ✅ DODANE
- 10 klientów na stronę
- Działające przyciski
- Licznik dynamiczny

### 9. **Statystyki** ✅ DODANE
- Wszyscy klienci (total)
- Nowi ten miesiąc
- Aktywni
- Średnia wartość
- **Łączny dług** (nowa karta!)

---

## 📊 NOWA STRUKTURA TABELI:

```
┌─────────────┬─────────┬────────┬──────────────┬─────────┬────────────┬────────┬────────┐
│ Klient      │ Kontakt │ Wizyty │ Ostatnia wiz.│ Wydano  │ DŁUG       │ Status │ Akcje  │
├─────────────┼─────────┼────────┼──────────────┼─────────┼────────────┼────────┼────────┤
│ Jan Kowalski│ email   │   12   │  2024-11-28  │ 720 zł  │ -          │ Aktywny│ 👁️✏️🗑️│
│ ID: C001    │ phone   │        │              │         │            │        │        │
├─────────────┼─────────┼────────┼──────────────┼─────────┼────────────┼────────┼────────┤
│ Maria Nowak │ email   │    8   │  2024-11-25  │ 480 zł  │ Dług: 50zł │ VIP    │ 👁️✏️🗑️│
│ ID: C002    │ phone   │        │              │         │ (czerwony) │        │        │
└─────────────┴─────────┴────────┴──────────────┴─────────┴────────────┴────────┴────────┘
```

---

## 🔴 WYŚWIETLANIE DŁUGU - SZCZEGÓŁY:

### Logika:
```typescript
const debt = getCustomerDebt(customer.id)

// getCustomerDebt zwraca sumę niezapłaconych rezerwacji:
// - paymentStatus === 'unpaid' lub 'partial'
// - status === 'confirmed' lub 'completed'
```

### Wyświetlanie:
```typescript
{debt > 0 ? (
  <div className="flex items-center gap-2">
    <AlertCircle className="w-4 h-4 text-red-400" />
    <span className="text-red-400 font-bold">
      Dług: {debt} zł
    </span>
  </div>
) : (
  <span className="text-accent-neon text-sm">✓ Rozliczony</span>
)}
```

### Kolory:
- **Czerwony (text-red-400)** - klient ma dług
- **Zielony (text-accent-neon)** - wszystko zapłacone
- **Ikona AlertCircle** - ostrzeżenie o długu

---

## 📈 NOWE STATYSTYKI:

### 5. Karta "Łączny dług"
```typescript
<div className="glass-card p-6">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-neutral-gray/70">Łączny dług</span>
    <AlertCircle className="w-5 h-5 text-red-400" />
  </div>
  <p className="text-3xl font-bold text-red-400">{stats.totalDebt} zł</p>
  <p className="text-xs text-neutral-gray/70 mt-1">
    {customers.filter(c => getCustomerDebt(c.id) > 0).length} klientów
  </p>
</div>
```

---

## 🎨 MODAL SZCZEGÓŁÓW KLIENTA:

```
┌────────────────────────────────────────────────────┐
│ Szczegóły klienta                              [X] │
├────────────────────────────────────────────────────┤
│                                                    │
│ 👤 Jan Kowalski                                    │
│ ✉️ jan.kowalski@example.com                       │
│ 📞 +48 123 456 789                                 │
│ 📅 Klient od: 2024-01-15                          │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ Statystyki                                   │  │
│ │ • Wizyty: 12                                 │  │
│ │ • Wydano: 720 zł                             │  │
│ │ • Średnia wizyta: 60 zł                      │  │
│ │ • Dług: 50 zł ⚠️                             │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Historia wizyt:                                    │
│ ┌────────┬─────────────┬────────┬────────────┐   │
│ │ Data   │ Usługa      │ Cena   │ Płatność   │   │
│ ├────────┼─────────────┼────────┼────────────┤   │
│ │11-28   │Strzyżenie   │ 50 zł  │ ✓ Zapłac.  │   │
│ │11-25   │Koloryzacja  │200 zł  │ ✓ Zapłac.  │   │
│ │11-20   │Manicure     │ 50 zł  │ ❌ Niezapł.│   │
│ └────────┴─────────────┴────────┴────────────┘   │
│                                                    │
│ [Edytuj] [Usuń] [Zamknij]                        │
└────────────────────────────────────────────────────┘
```

---

## 🔄 IMPLEMENTACJA - PLAN:

### Faza 1: Podstawy ✅ GOTOWE
- [x] Import prawdziwych danych
- [x] Funkcje filtrowania i sortowania
- [x] Funkcja usuwania
- [x] Funkcja eksportu
- [x] Obliczanie statystyk
- [x] Paginacja

### Faza 2: Tabela ⏳ W TRAKCIE
- [ ] Aktualizacja nagłówków (dodać kolumnę Dług)
- [ ] Aktualizacja wierszy (prawdziwe dane)
- [ ] Wyświetlanie długu na czerwono
- [ ] Sortowanie po kolumnach
- [ ] Działające przyciski akcji

### Faza 3: Modale ⏳ NASTĘPNE
- [ ] Modal szczegółów klienta
- [ ] Historia wizyt w modalu
- [ ] Modal edycji klienta
- [ ] Walidacja formularza

### Faza 4: Statystyki ⏳ NASTĘPNE
- [ ] Karta "Łączny dług"
- [ ] Dynamiczne obliczenia
- [ ] Aktualizacja istniejących kart

---

## 📝 PRZYKŁADOWY KOD:

### Kolumna Dług w tabeli:
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
      <span className="text-accent-neon text-sm flex items-center gap-1">
        <Check className="w-3 h-3" />
        Rozliczony
      </span>
    )
  })()}
</td>
```

### Przycisk Szczegóły:
```typescript
<button 
  onClick={() => {
    setSelectedCustomer(customer)
    setShowDetailsModal(true)
  }}
  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
  title="Szczegóły"
>
  <Eye className="w-4 h-4 text-neutral-gray" />
</button>
```

---

## ✅ PODSUMOWANIE ZMIAN:

### Dodane:
1. ✅ Import `getCustomers`, `getBookings`, `getCustomerDebt`
2. ✅ State dla prawdziwych danych
3. ✅ Funkcje filtrowania i sortowania
4. ✅ Funkcja usuwania klientów
5. ✅ Funkcja eksportu do CSV
6. ✅ Obliczanie prawdziwych statystyk
7. ✅ Działająca paginacja
8. ✅ Funkcja `getLastVisit()`
9. ✅ Funkcja `getCustomerBookings()`

### Do dodania:
1. ⏳ Kolumna "Dług" w tabeli
2. ⏳ Wyświetlanie długu na czerwono
3. ⏳ Modal szczegółów klienta
4. ⏳ Modal edycji klienta
5. ⏳ Karta statystyk "Łączny dług"
6. ⏳ Aktualizacja wierszy tabeli (prawdziwe dane)
7. ⏳ Sortowanie po kolumnach (klikalne nagłówki)

---

**Status:** 🔄 **IMPLEMENTACJA W TRAKCIE**  
**Następny krok:** Aktualizacja tabeli i dodanie kolumny Dług  
**Priorytet:** 🔴 **WYSOKI** - Dług musi być widoczny!

