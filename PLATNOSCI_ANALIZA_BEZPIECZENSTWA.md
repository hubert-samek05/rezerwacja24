# Analiza Bezpieczeństwa Systemu Płatności - KRYTYCZNE

## ⚠️ STATUS: WYMAGA POPRAWEK PRZED PRODUKCJĄ

Data analizy: 2024-12-07

## 🔴 KRYTYCZNE PROBLEMY

### 1. Brak Prawdziwych Wywołań API Płatności

#### Przelewy24
**Lokalizacja:** `/backend/src/payments/payments.service.ts:156-157`

```typescript
// TODO: Wywołaj API Przelewy24 aby utworzyć transakcję
// const response = await axios.post('https://secure.przelewy24.pl/api/v1/transaction/register', transactionData);
```

**Problem:** Kod jest zakomentowany - płatność NIE zostanie utworzona!

**Skutek:**
- Klient zostanie przekierowany na nieistniejący URL
- Płatność nie przejdzie
- Rezerwacja zostanie utworzona bez płatności

#### PayU
**Lokalizacja:** `/backend/src/payments/payments.service.ts:~280`

```typescript
// TODO: Wywołaj API PayU aby utworzyć zamówienie
// const response = await axios.post('https://secure.payu.com/api/v2_1/orders', orderData);
```

**Problem:** Identyczny - brak prawdziwego wywołania API

### 2. Błędna Kolejność Operacji

**Lokalizacja:** `/frontend/app/[subdomain]/page.tsx:143-210`

```typescript
// Krok 1: Utwórz rezerwację
const response = await fetch('/api/bookings', { method: 'POST', ... })

// Krok 2: Jeśli wybrano płatność online, utwórz płatność
if (paymentMethod !== 'cash' && bookingId) {
  const paymentResponse = await fetch('/api/payments/create', ...)
}
```

**Problem:** Rezerwacja tworzona PRZED płatnością!

**Skutek:**
- Jeśli płatność się nie powiedzie, rezerwacja już istnieje
- Brak rollbacku
- Zaśmiecanie bazy nieop łaconymi rezerwacjami

**Prawidłowa kolejność:**
1. Walidacja danych
2. Utworzenie płatności (jeśli online)
3. Przekierowanie do bramki
4. Webhook potwierdza → DOPIERO WTEDY utwórz rezerwację
5. Lub: Utwórz rezerwację ze statusem PENDING_PAYMENT

### 3. Brak Stron Sukcesu/Błędu

**Brakujące strony:**
- `/payment/success` - nie istnieje
- `/payment/error` - nie istnieje
- `/payment/cancelled` - nie istnieje

**Skutek:**
- Klient po płatności trafia na 404
- Nie wie czy płatność przeszła
- Zła UX

### 4. Brak Obsługi Błędów Płatności

**Frontend:** `/frontend/app/[subdomain]/page.tsx:203-204`

```typescript
} else {
  alert('Nie udało się utworzyć płatności. Rezerwacja została zapisana.')
}
```

**Problem:**
- Tylko alert() - nie profesjonalne
- Komunikat mylący: "Rezerwacja została zapisana" ale płatność nie przeszła
- Brak możliwości ponowienia płatności

### 5. Webhooks Nie W Pełni Zaimplementowane

**Przelewy24 Webhook:** `/backend/src/payments/payments.service.ts:308-339`

```typescript
async handlePrzelewy24Webhook(data: any) {
  // TODO: Zweryfikuj podpis CRC
  // TODO: Zaktualizuj status płatności w bazie danych
  
  const sessionId = data.sessionId;
  const booking = await this.prisma.bookings.findFirst({
    where: { przelewy24SessionId: sessionId },
  });
  // ...
}
```

**Problemy:**
- Brak weryfikacji podpisu (TODO)
- Brak walidacji danych wejściowych
- Brak logowania
- Brak obsługi błędów

### 6. Brak Instalacji Bibliotek HTTP

**Problem:** Kod używa `axios` ale nie jest zainstalowany!

```bash
grep -r "import.*axios" backend/src/payments/
# Brak importu - kod się nie skompiluje gdy odkomentujemy TODO
```

## 🟡 ŚREDNIE PROBLEMY

### 7. Brak Timeout dla Płatności

Rezerwacje ze statusem `pending` mogą wisieć w nieskończoność.

**Potrzebne:**
- Cronjob sprawdzający stare pending payments
- Auto-anulowanie po X minutach

### 8. Brak Retry Logic

Jeśli API płatności nie odpowiada - brak ponowienia próby.

### 9. Brak Logowania Transakcji

Wszystkie operacje płatności powinny być logowane do osobnej tabeli.

### 10. Klucze API Nieszyfrowane

Klucze API przechowywane w plain text w bazie danych.

**Powinno być:** Szyfrowanie AES-256

## 🟢 CO DZIAŁA POPRAWNIE

1. ✅ Stripe Payment Intent - prawdziwe API wywołane
2. ✅ Struktura bazy danych - pola dla wszystkich providerów
3. ✅ Interfejs użytkownika - ładny i funkcjonalny
4. ✅ Wybór metody płatności - działa
5. ✅ Webhooks endpoints - zdefiniowane (ale nie w pełni działają)

## 📋 PLAN NAPRAWY (PRIORYTET)

### FAZA 1: KRYTYCZNE (Przed produkcją)
1. ⚠️ Zainstaluj axios/fetch dla HTTP requests
2. ⚠️ Zaimplementuj prawdziwe API Przelewy24
3. ⚠️ Zaimplementuj prawdziwe API PayU
4. ⚠️ Utwórz strony `/payment/success`, `/payment/error`
5. ⚠️ Zmień kolejność: płatność → rezerwacja (lub PENDING status)
6. ⚠️ Zaimplementuj weryfikację webhooków
7. ⚠️ Dodaj proper error handling

### FAZA 2: WAŻNE (Tydzień po starcie)
8. 🔶 Dodaj logowanie transakcji
9. 🔶 Dodaj timeout dla pending payments
10. 🔶 Dodaj retry logic
11. 🔶 Zaszyfruj klucze API

### FAZA 3: NICE TO HAVE
12. 🔷 Dodaj dashboard płatności
13. 🔷 Dodaj raporty
14. 🔷 Dodaj zwroty (refunds)

## 🚨 REKOMENDACJA

**NIE URUCHAMIAJ NA PRODUKCJI** dopóki nie zostaną naprawione problemy z FAZY 1.

**Aktualnie system:**
- ✅ Wygląda profesjonalnie
- ✅ Ma dobrą strukturę
- ❌ NIE PRZETWARZA płatności
- ❌ NIE JEST bezpieczny dla prawdziwych transakcji

**Potrzebne:** 2-3 dni pracy nad implementacją prawdziwych API i obsługą błędów.

## 💡 TYMCZASOWE ROZWIĄZANIE

Do czasu naprawy:
1. **Wyłącz płatności online** w produkcji
2. Zostaw tylko "Płatność na miejscu"
3. Testuj płatności tylko w sandbox/development

```typescript
// W settings - dodaj ostrzeżenie
if (process.env.NODE_ENV === 'production') {
  return (
    <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-lg">
      ⚠️ Płatności online są w fazie testów. 
      Używaj tylko "Płatność na miejscu".
    </div>
  )
}
```

## 📞 Kontakt

Przed wdrożeniem płatności online na produkcję, należy:
1. Przetestować w sandbox każdego providera
2. Zaimplementować wszystkie punkty z FAZY 1
3. Przeprowadzić testy end-to-end
4. Uzyskać certyfikaty SSL (już jest ✅)
5. Skonfigurować monitoring

---

**Autor analizy:** Cascade AI  
**Data:** 2024-12-07  
**Wersja:** 1.0
