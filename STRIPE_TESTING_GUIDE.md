# 🧪 Przewodnik Testowania Stripe - Rezerwacja24

**Data**: 2024-12-13  
**Środowisko**: TEST MODE

---

## 🎯 Cel

Ten przewodnik pomoże Ci przetestować cały system subskrypcji przed wdrożeniem na produkcję.

---

## 🔑 Karty Testowe Stripe

### Sukces Płatności
```
Numer karty: 4242 4242 4242 4242
Data ważności: dowolna przyszła (np. 12/25)
CVC: dowolne 3 cyfry (np. 123)
ZIP: dowolny (np. 12345)
```

### Nieudana Płatność (Insufficient Funds)
```
Numer karty: 4000 0000 0000 9995
Data ważności: dowolna przyszła
CVC: dowolne 3 cyfry
```

### Nieudana Płatność (Card Declined)
```
Numer karty: 4000 0000 0000 0002
Data ważności: dowolna przyszła
CVC: dowolne 3 cyfry
```

### Wymaga Autentykacji (3D Secure)
```
Numer karty: 4000 0025 0000 3155
Data ważności: dowolna przyszła
CVC: dowolne 3 cyfry
```

Więcej kart testowych: https://stripe.com/docs/testing

---

## 📝 Scenariusze Testowe

### Test 1: Rejestracja i Checkout ✅

**Cel**: Sprawdzenie pełnego flow rejestracji z dodaniem karty

**Kroki**:
1. Otwórz stronę `/register`
2. Wypełnij formularz rejestracji:
   - Imię: Jan
   - Nazwisko: Testowy
   - Email: jan.testowy+1@example.com
   - Nazwa firmy: Testowa Firma
   - Hasło: Test123!
   - Potwierdź hasło: Test123!
   - Zaakceptuj regulamin
3. Kliknij "Utwórz konto"
4. **Oczekiwany rezultat**: Przekierowanie do `/subscription/checkout`
5. Wprowadź dane karty testowej (4242 4242 4242 4242)
6. Kliknij "Rozpocznij 7-dniowy okres próbny"
7. **Oczekiwany rezultat**: 
   - Przekierowanie do `/dashboard`
   - Wyświetlenie Trial Countdown Banner
   - Banner pokazuje "Pozostało 7 dni okresu próbnego"

**Weryfikacja w Bazie Danych**:
```sql
-- Sprawdź czy utworzono subskrypcję
SELECT * FROM subscriptions WHERE tenantId = 'xxx';
-- Status powinien być 'TRIALING'
-- trialEnd powinien być za 7 dni
```

**Weryfikacja w Stripe Dashboard**:
- Przejdź do Customers → znajdź klienta po emailu
- Sprawdź czy ma aktywną subskrypcję w statusie "trialing"

---

### Test 2: Trial Countdown Banner ✅

**Cel**: Sprawdzenie wyświetlania bannera z pozostałymi dniami

**Kroki**:
1. Zaloguj się jako użytkownik z aktywnym trial
2. Przejdź do `/dashboard`
3. **Oczekiwany rezultat**: 
   - Banner wyświetla się na górze strony
   - Pokazuje pozostałe dni (np. "Pozostało 7 dni")
   - Progress bar pokazuje postęp
   - Przycisk "Zarządzaj subskrypcją"

**Test Różnych Stanów**:
```sql
-- Symuluj 1 dzień pozostały
UPDATE subscriptions 
SET trialEnd = NOW() + INTERVAL '1 day'
WHERE tenantId = 'xxx';
```
- Banner powinien być pomarańczowy
- Tekst: "Pozostał 1 dzień okresu próbnego"

```sql
-- Symuluj ostatni dzień
UPDATE subscriptions 
SET trialEnd = NOW() + INTERVAL '1 hour'
WHERE tenantId = 'xxx';
```
- Banner powinien być czerwony
- Tekst: "Twój okres próbny kończy się dzisiaj!"

---

### Test 3: Zarządzanie Subskrypcją ✅

**Cel**: Sprawdzenie strony zarządzania subskrypcją

**Kroki**:
1. Przejdź do `/dashboard/settings/subscription`
2. **Oczekiwany rezultat**:
   - Wyświetla się status "Okres próbny"
   - Pokazuje pozostałe dni
   - Pokazuje datę rozpoczęcia i końca okresu
   - Przycisk "Zarządzaj płatnościami"
   - Przycisk "Anuluj subskrypcję"

3. Kliknij "Zarządzaj płatnościami"
4. **Oczekiwany rezultat**: 
   - Przekierowanie do Stripe Billing Portal
   - Możliwość dodania/usunięcia karty
   - Możliwość pobrania faktur

5. Wróć do aplikacji
6. Kliknij "Anuluj subskrypcję"
7. Potwierdź anulowanie
8. **Oczekiwany rezultat**:
   - Status zmienia się na "Anulowana"
   - Pokazuje datę wygaśnięcia
   - Przycisk zmienia się na "Wznów subskrypcję"

9. Kliknij "Wznów subskrypcję"
10. **Oczekiwany rezultat**:
    - Status wraca do "Okres próbny"
    - Przycisk wraca do "Anuluj subskrypcję"

---

### Test 4: Webhooks ✅

**Cel**: Sprawdzenie czy webhooks działają poprawnie

**Kroki**:
1. Przejdź do Stripe Dashboard → Developers → Webhooks
2. Znajdź swój endpoint (np. `http://localhost:3001/api/billing/webhook`)
3. Kliknij "Send test webhook"
4. Wybierz event: `customer.subscription.created`
5. Kliknij "Send test webhook"
6. **Oczekiwany rezultat**:
   - Status: 200 OK
   - W logach backendu: "Otrzymano webhook Stripe: customer.subscription.created"

**Testuj Wszystkie Eventy**:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.trial_will_end`

**Sprawdź Logi Backend**:
```bash
pm2 logs rezerwacja24-backend --lines 100
```

---

### Test 5: Koniec Okresu Próbnego (Symulacja) ✅

**Cel**: Sprawdzenie co się dzieje po zakończeniu trial

**Uwaga**: W TEST mode możesz symulować koniec trial w bazie danych

**Kroki**:
1. Znajdź subskrypcję w bazie:
```sql
SELECT * FROM subscriptions WHERE tenantId = 'xxx';
```

2. Ustaw trial na zakończony:
```sql
UPDATE subscriptions 
SET trialEnd = NOW() - INTERVAL '1 day',
    status = 'ACTIVE'
WHERE tenantId = 'xxx';
```

3. Odśwież stronę `/dashboard`
4. **Oczekiwany rezultat**:
   - Banner trial NIE wyświetla się
   - Subskrypcja jest aktywna

5. Przejdź do `/dashboard/settings/subscription`
6. **Oczekiwany rezultat**:
   - Status: "Aktywna"
   - Pokazuje datę następnej płatności

---

### Test 6: Nieudana Płatność (Symulacja) ✅

**Cel**: Sprawdzenie obsługi nieudanej płatności

**Kroki**:
1. W Stripe Dashboard → Webhooks → Send test webhook
2. Wybierz event: `invoice.payment_failed`
3. Wyślij webhook
4. **Oczekiwany rezultat**:
   - W logach: "🚫 Zablokowano konto xxx - płatność nieudana"
   - W bazie danych: `tenants.isSuspended = true`
   - Status subskrypcji: `PAST_DUE`

5. Sprawdź w bazie:
```sql
SELECT isSuspended, suspendedReason FROM tenants WHERE id = 'xxx';
-- isSuspended: true
-- suspendedReason: "Płatność nieudana - odnów subskrypcję"
```

6. Wyślij webhook: `invoice.paid`
7. **Oczekiwany rezultat**:
   - W logach: "✅ Odblokowano konto xxx po udanej płatności"
   - W bazie danych: `tenants.isSuspended = false`
   - Status subskrypcji: `ACTIVE`

---

### Test 7: Historia Faktur ✅

**Cel**: Sprawdzenie wyświetlania faktur

**Kroki**:
1. Utwórz fakturę w Stripe Dashboard:
   - Customers → Wybierz klienta
   - Create invoice
   - Dodaj item (79.99 PLN)
   - Finalize and pay

2. Wyślij webhook `invoice.paid`

3. Przejdź do `/dashboard/settings/subscription`
4. Scroll w dół do sekcji "Historia faktur"
5. **Oczekiwany rezultat**:
   - Wyświetla się faktura
   - Kwota: 79.99 PLN
   - Status: "Opłacona"
   - Ikona PDF (kliknięcie otwiera fakturę)

---

### Test 8: Pominięcie Checkout ✅

**Cel**: Sprawdzenie możliwości pominięcia checkout

**Kroki**:
1. Po rejestracji, na stronie `/subscription/checkout`
2. Kliknij "Pomiń i przejdź do panelu"
3. **Oczekiwany rezultat**:
   - Przekierowanie do `/dashboard`
   - Brak subskrypcji
   - Wyświetla się modal onboardingu (opcjonalnie)

---

## 🔍 Checklist Testów

### Frontend
- [ ] Rejestracja działa poprawnie
- [ ] Przekierowanie do checkout działa
- [ ] Formularz Stripe wyświetla się poprawnie
- [ ] Można wprowadzić dane karty
- [ ] Przekierowanie po udanej płatności działa
- [ ] Trial Countdown Banner wyświetla się
- [ ] Banner zmienia kolor w zależności od dni
- [ ] Strona zarządzania subskrypcją działa
- [ ] Można anulować subskrypcję
- [ ] Można wznowić subskrypcję
- [ ] Stripe Portal otwiera się poprawnie
- [ ] Historia faktur wyświetla się
- [ ] Można pobrać faktury PDF

### Backend
- [ ] Endpoint `/billing/checkout-session` działa
- [ ] Endpoint `/billing/subscription` działa
- [ ] Endpoint `/billing/subscription/status` działa
- [ ] Endpoint `/billing/portal-session` działa
- [ ] Endpoint `/billing/webhook` działa
- [ ] Wszystkie webhooks są obsługiwane
- [ ] Subskrypcje są tworzone w bazie
- [ ] Faktury są zapisywane w bazie
- [ ] Blokada konta działa przy nieudanej płatności
- [ ] Odblokowanie konta działa przy udanej płatności

### Stripe
- [ ] Klienci są tworzeni w Stripe
- [ ] Subskrypcje są tworzone w Stripe
- [ ] Trial period jest ustawiony na 7 dni
- [ ] Karta jest wymagana podczas trial
- [ ] Webhooks są wysyłane poprawnie
- [ ] Billing Portal działa
- [ ] Faktury są generowane

---

## 🐛 Najczęstsze Problemy

### Problem 1: Webhook nie działa

**Objawy**: Webhook zwraca 401 lub 500

**Rozwiązanie**:
1. Sprawdź czy webhook secret jest poprawny w `.env`
2. Sprawdź logi backendu: `pm2 logs rezerwacja24-backend`
3. Sprawdź czy endpoint jest dostępny: `curl http://localhost:3001/api/billing/webhook`

### Problem 2: Stripe nie przekierowuje po płatności

**Objawy**: Po płatności użytkownik zostaje na stronie Stripe

**Rozwiązanie**:
1. Sprawdź `success_url` i `cancel_url` w `createCheckoutSession`
2. Upewnij się że URL jest pełny (z protokołem http/https)
3. Sprawdź logi Stripe Dashboard → Events

### Problem 3: Trial Countdown nie wyświetla się

**Objawy**: Banner nie pojawia się na dashboardzie

**Rozwiązanie**:
1. Sprawdź czy subskrypcja ma status `TRIALING`
2. Sprawdź czy `trialEnd` jest ustawiony
3. Sprawdź czy endpoint `/billing/subscription/status` działa
4. Sprawdź console w przeglądarce

### Problem 4: Nie można dodać karty

**Objawy**: Formularz Stripe nie ładuje się

**Rozwiązanie**:
1. Sprawdź czy `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` jest ustawiony
2. Sprawdź czy klucz jest poprawny (TEST mode)
3. Sprawdź console w przeglądarce
4. Sprawdź czy Stripe.js jest załadowany

---

## 📊 Metryki do Monitorowania

Po wdrożeniu monitoruj:

- **Conversion Rate**: % użytkowników, którzy dodają kartę po rejestracji
- **Trial Completion Rate**: % użytkowników, którzy kończą trial
- **Failed Payments**: liczba nieudanych płatności
- **Webhook Success Rate**: % webhooków, które zakończyły się sukcesem
- **Response Time**: czas odpowiedzi API

---

## ✅ Gotowe do Wdrożenia?

Jeśli wszystkie testy przeszły pomyślnie, możesz przejść do wdrożenia na produkcję.

**Następny krok**: Przeczytaj `STRIPE_SUBSCRIPTION_IMPLEMENTATION.md` → sekcja "Wdrożenie"

---

**Powodzenia! 🚀**
