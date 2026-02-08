# 🔧 NAPRAWA: Dług nie uwzględniał rezerwacji pending

**Data:** 30 Listopada 2024, 22:42 CET  
**Status:** ✅ **NAPRAWIONE I WDROŻONE**

---

## 🐛 PROBLEM:

W historii wizyt klienta pokazywała się rezerwacja jako **"❌ Niezapłacone"**, ale w kolumnie "Dług" było **0 zł**.

### Przykład z ekranu:
```
Historia wizyt:
- 1.12.2025 | Pedicure | 120 zł | ❌ Niezapłacone

Kolumna Dług: 0 zł  ❌ (powinno być 120 zł)
```

---

## 🔍 PRZYCZYNA:

Funkcja `getCustomerDebt()` sprawdzała tylko rezerwacje ze statusem:
- `'confirmed'` (potwierdzone)
- `'completed'` (zakończone)

Ale **NIE sprawdzała** rezerwacji ze statusem:
- `'pending'` (oczekujące/przyszłe)

### Kod przed naprawą:
```typescript
export const getCustomerDebt = (customerId: string): number => {
  const bookings = getBookings()
  return bookings
    .filter(b => 
      b.customerId === customerId && 
      (b.paymentStatus === 'unpaid' || b.paymentStatus === 'partial') &&
      (b.status === 'confirmed' || b.status === 'completed')  // ❌ Brak 'pending'
    )
    .reduce((sum, b) => {
      if (b.paymentStatus === 'partial' && b.paidAmount) {
        return sum + (b.price - b.paidAmount)
      }
      return sum + b.price
    }, 0)
}
```

### Dlaczego to był problem?

Rezerwacja z 1.12.2025 (przyszła data) miała status `'pending'`, więc:
- ✅ **Pokazywała się** w historii wizyt (bo historia pokazuje wszystkie rezerwacje)
- ❌ **NIE była liczona** jako dług (bo status != 'confirmed' ani 'completed')

---

## ✅ ROZWIĄZANIE:

Dodano status `'pending'` do filtra, aby uwzględnić przyszłe zobowiązania klienta.

### Kod po naprawie:
```typescript
export const getCustomerDebt = (customerId: string): number => {
  const bookings = getBookings()
  return bookings
    .filter(b => 
      b.customerId === customerId && 
      (b.paymentStatus === 'unpaid' || b.paymentStatus === 'partial') &&
      // ✅ Uwzględnij pending (przyszłe), confirmed i completed, ale NIE cancelled
      (b.status === 'pending' || b.status === 'confirmed' || b.status === 'completed')
    )
    .reduce((sum, b) => {
      // Dla częściowo zapłaconych, odejmij już zapłaconą kwotę
      if (b.paymentStatus === 'partial' && b.paidAmount) {
        return sum + (b.price - b.paidAmount)
      }
      return sum + b.price
    }, 0)
}
```

### Co się zmieniło:
```typescript
// Przed:
(b.status === 'confirmed' || b.status === 'completed')

// Po:
(b.status === 'pending' || b.status === 'confirmed' || b.status === 'completed')
```

---

## 📊 LOGIKA DŁUGU:

### Rezerwacje LICZONE jako dług:

1. **Status: `'pending'`** (oczekujące/przyszłe)
   - Płatność: `'unpaid'` → Dług = cena
   - Płatność: `'partial'` → Dług = cena - zapłacona kwota
   - ✅ **TERAZ LICZONE**

2. **Status: `'confirmed'`** (potwierdzone)
   - Płatność: `'unpaid'` → Dług = cena
   - Płatność: `'partial'` → Dług = cena - zapłacona kwota
   - ✅ Już było liczone

3. **Status: `'completed'`** (zakończone)
   - Płatność: `'unpaid'` → Dług = cena
   - Płatność: `'partial'` → Dług = cena - zapłacona kwota
   - ✅ Już było liczone

### Rezerwacje NIE LICZONE jako dług:

1. **Status: `'cancelled'`** (anulowane)
   - ❌ Nie liczymy - rezerwacja anulowana

2. **Płatność: `'paid'`** (zapłacone)
   - ❌ Nie liczymy - wszystko zapłacone

---

## 🎯 PRZYKŁADY:

### Przykład 1: Przyszła rezerwacja niezapłacona
```typescript
{
  date: '2025-12-01',
  price: 120,
  status: 'pending',
  paymentStatus: 'unpaid'
}
// Przed: Dług = 0 zł ❌
// Po: Dług = 120 zł ✅
```

### Przykład 2: Przyszła rezerwacja częściowo zapłacona
```typescript
{
  date: '2025-12-01',
  price: 120,
  status: 'pending',
  paymentStatus: 'partial',
  paidAmount: 50
}
// Przed: Dług = 0 zł ❌
// Po: Dług = 70 zł ✅ (120 - 50)
```

### Przykład 3: Anulowana rezerwacja
```typescript
{
  date: '2025-12-01',
  price: 120,
  status: 'cancelled',
  paymentStatus: 'unpaid'
}
// Przed: Dług = 0 zł ✅
// Po: Dług = 0 zł ✅ (nadal nie liczymy)
```

### Przykład 4: Zapłacona rezerwacja
```typescript
{
  date: '2025-11-28',
  price: 120,
  status: 'completed',
  paymentStatus: 'paid'
}
// Przed: Dług = 0 zł ✅
// Po: Dług = 0 zł ✅ (nadal nie liczymy)
```

---

## 🔄 WPŁYW NAPRAWY:

### Gdzie funkcja jest używana:

1. **Kolumna "Dług" w tabeli klientów**
   - Teraz pokazuje dług z przyszłych rezerwacji ✅

2. **Karta "Dług" w modalu szczegółów**
   - Teraz pokazuje dług z przyszłych rezerwacji ✅

3. **Karta "Łączny dług" w statystykach**
   - Teraz sumuje dług z przyszłych rezerwacji ✅

4. **Eksport CSV**
   - Teraz eksportuje dług z przyszłych rezerwacji ✅

5. **Sortowanie po długu**
   - Teraz sortuje uwzględniając przyszłe rezerwacje ✅

---

## 📊 PORÓWNANIE PRZED/PO:

### Klient z przyszłą rezerwacją (1.12.2025, 120 zł, niezapłacone):

#### Przed naprawą:
```
Kolumna Dług: 0 zł                    ❌
Modal Dług: 0 zł                      ❌
Historia wizyt: ❌ Niezapłacone       ✅ (pokazywało się)
```
**Niespójność!** Historia pokazuje niezapłacone, ale dług = 0 zł

#### Po naprawie:
```
Kolumna Dług: ⚠️ 120 zł               ✅
Modal Dług: 120 zł                    ✅
Historia wizyt: ❌ Niezapłacone       ✅
```
**Spójność!** Wszystko pokazuje dług 120 zł

---

## 🎯 LOGIKA BIZNESOWA:

### Dlaczego liczymy `'pending'` jako dług?

1. **Przyszłe zobowiązanie**
   - Klient zarezerwował usługę
   - Usługa będzie wykonana
   - Klient jest zobowiązany do zapłaty

2. **Planowanie finansowe**
   - Firma musi wiedzieć, ile pieniędzy oczekuje
   - Przyszłe przychody = potwierdzone + oczekujące

3. **Zarządzanie klientami**
   - Widać, którzy klienci mają niezapłacone przyszłe wizyty
   - Można wysłać przypomnienie o płatności

4. **Spójność danych**
   - Historia wizyt pokazuje rezerwację jako "Niezapłacone"
   - Kolumna dług powinna pokazywać tę samą informację

---

## 🚀 BUILD I WDROŻENIE:

### Build:
```bash
✅ npm run build - SUCCESS
✅ TypeScript compilation - SUCCESS
✅ Linting - SUCCESS
```

### Deployment:
```bash
✅ Frontend restarted
✅ Application running on http://localhost:3000
```

---

## 📝 PLIK ZMODYFIKOWANY:

`/frontend/lib/storage.ts` - funkcja `getCustomerDebt()` (linia 334)

**Zmiana:** Dodano `b.status === 'pending'` do warunku filtrowania

---

## ✅ WERYFIKACJA:

### Test 1: Klient z przyszłą rezerwacją niezapłaconą
- ✅ Kolumna "Dług": pokazuje kwotę (np. 120 zł)
- ✅ Modal "Dług": pokazuje tę samą kwotę
- ✅ Historia wizyt: pokazuje "❌ Niezapłacone"
- ✅ **Spójność danych!**

### Test 2: Klient bez długu
- ✅ Kolumna "Dług": pokazuje 0 zł
- ✅ Modal "Dług": pokazuje 0 zł
- ✅ Historia wizyt: wszystkie "✓ Zapłacono"
- ✅ **Spójność danych!**

### Test 3: Klient z anulowaną rezerwacją
- ✅ Kolumna "Dług": nie liczy anulowanej
- ✅ Modal "Dług": nie liczy anulowanej
- ✅ Historia wizyt: pokazuje anulowaną
- ✅ **Poprawna logika!**

---

## 🎉 PODSUMOWANIE:

### Problem:
Dług nie uwzględniał przyszłych rezerwacji (status `'pending'`), co powodowało niespójność między historią wizyt a wyświetlanym długiem.

### Rozwiązanie:
Dodano status `'pending'` do filtra w funkcji `getCustomerDebt()`, aby uwzględnić przyszłe zobowiązania klienta.

### Rezultat:
- ✅ Dług teraz pokazuje wszystkie niezapłacone rezerwacje (przeszłe, obecne i przyszłe)
- ✅ Spójność między historią wizyt a kolumną długu
- ✅ Lepsza widoczność przyszłych zobowiązań klientów
- ✅ Poprawne planowanie finansowe

---

**Status:** 🎉 **NAPRAWIONE I WDROŻONE**

**Czas naprawy:** ~5 minut  
**Czas wdrożenia:** ~2 minuty  
**Wpływ:** Wszystkie miejsca wyświetlające dług klienta
