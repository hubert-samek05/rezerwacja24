# 🔧 Konfiguracja Webhooka Stripe - Instrukcja Krok po Kroku

**Data**: 2024-12-17  
**Priorytet**: 🔴 KRYTYCZNY - Wymaga natychmiastowej naprawy

---

## ⚠️ PROBLEM

Stripe wysyła webhooks na nieprawidłowy endpoint, co powoduje że:
- Status subskrypcji nie jest aktualizowany
- Płatności po okresie próbnym nie są rejestrowane
- Faktury nie są zapisywane
- Konta nie są blokowane przy nieudanych płatnościach

---

## ✅ ROZWIĄZANIE

### Krok 1: Zaloguj się do Stripe Dashboard

1. Przejdź do: https://dashboard.stripe.com
2. Zaloguj się na konto Rezerwacja24
3. **WAŻNE**: Upewnij się że jesteś w **LIVE MODE** (przełącznik w lewym górnym rogu)

---

### Krok 2: Przejdź do Webhooks

1. W menu bocznym kliknij: **Developers**
2. Wybierz: **Webhooks**
3. Zobaczysz listę skonfigurowanych webhooków

---

### Krok 3: Znajdź Nieprawidłowy Webhook

Szukaj webhooka z URL:
```
https://api.rezerwacja24.pl/api/payments/stripe/webhook
```

**Ten URL jest NIEPRAWIDŁOWY dla subskrypcji!**

---

### Krok 4: Edytuj Webhook

1. Kliknij na webhook z nieprawidłowym URL
2. W prawym górnym rogu kliknij **"..."** (trzy kropki)
3. Wybierz **"Update details"**

---

### Krok 5: Zmień URL

**STARY URL** (nieprawidłowy):
```
https://api.rezerwacja24.pl/api/payments/stripe/webhook
```

**NOWY URL** (prawidłowy):
```
https://api.rezerwacja24.pl/api/billing/webhook
```

**WAŻNE**: Skopiuj dokładnie ten URL, bez spacji i dodatkowych znaków!

---

### Krok 6: Sprawdź Eventy

Upewnij się że wybrane są następujące eventy:

#### Subskrypcje
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.trial_will_end`

#### Płatności
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`

#### Metody płatności
- ✅ `payment_method.attached`

**Jeśli brakuje któregoś eventu**:
1. Kliknij **"Add events"**
2. Zaznacz brakujące eventy
3. Kliknij **"Add events"**

---

### Krok 7: Zapisz Zmiany

1. Przewiń na dół strony
2. Kliknij **"Update endpoint"**
3. Poczekaj na potwierdzenie

---

### Krok 8: Skopiuj Webhook Secret

**WAŻNE**: Po zapisaniu zmian, skopiuj **Signing secret**

1. Na stronie webhooka znajdź sekcję **"Signing secret"**
2. Kliknij **"Reveal"**
3. Skopiuj klucz (zaczyna się od `whsec_...`)
4. Zapisz go w bezpiecznym miejscu

---

### Krok 9: Zaktualizuj .env na Serwerze

Zaloguj się na serwer i zaktualizuj plik `.env`:

```bash
# Zaloguj się na serwer
ssh user@api.rezerwacja24.pl

# Edytuj plik .env
cd /path/to/backend
nano .env

# Znajdź linię:
STRIPE_WEBHOOK_SECRET=whsec_...

# Zamień na nowy secret (skopiowany w kroku 8)
STRIPE_WEBHOOK_SECRET=whsec_NOWY_SECRET_Z_KROKU_8

# Zapisz (Ctrl+O, Enter, Ctrl+X)
```

---

### Krok 10: Restart Backendu

```bash
# Restart aplikacji
pm2 restart rezerwacja24-backend

# Sprawdź logi
pm2 logs rezerwacja24-backend --lines 50
```

---

### Krok 11: Przetestuj Webhook

Wróć do Stripe Dashboard:

1. Na stronie webhooka kliknij **"Send test webhook"**
2. Wybierz event: **`customer.subscription.created`**
3. Kliknij **"Send test webhook"**

**Oczekiwany rezultat**:
- Status: **200 OK** (zielony)
- Response time: < 1s

**Jeśli błąd**:
- Sprawdź logi backendu: `pm2 logs rezerwacja24-backend`
- Sprawdź czy URL jest prawidłowy
- Sprawdź czy webhook secret jest prawidłowy

---

### Krok 12: Sprawdź Logi Backendu

```bash
pm2 logs rezerwacja24-backend --lines 50
```

**Powinno być**:
```
Otrzymano webhook Stripe: customer.subscription.created
Utworzono subskrypcję dla tenant xxx
```

**Jeśli NIE MA tych logów**:
- Webhook nie dociera do backendu
- Sprawdź firewall/security groups
- Sprawdź czy backend działa: `curl https://api.rezerwacja24.pl/api/health`

---

## 🧪 Testy Po Konfiguracji

### Test 1: Webhook Działa

```bash
# W Stripe Dashboard → Webhooks → Twój endpoint
# Kliknij "Send test webhook"
# Wybierz: customer.subscription.created
# Kliknij "Send test webhook"

# Sprawdź logi:
pm2 logs rezerwacja24-backend --lines 20

# Powinno być:
# ✅ "Otrzymano webhook Stripe: customer.subscription.created"
```

### Test 2: Rejestracja + Checkout

1. Utwórz nowe konto testowe
2. Przejdź przez checkout z kartą testową: `4242 4242 4242 4242`
3. Sprawdź logi:
```bash
pm2 logs rezerwacja24-backend --lines 50 | grep "subscription"
```
4. Sprawdź bazę danych:
```sql
SELECT * FROM subscriptions ORDER BY createdAt DESC LIMIT 1;
```

### Test 3: Koniec Trial (Symulacja)

```sql
-- Ustaw trial na zakończony
UPDATE subscriptions 
SET trialEnd = NOW() - INTERVAL '1 day'
WHERE tenantId = 'TEST_TENANT_ID';
```

W Stripe Dashboard:
1. Webhooks → Twój endpoint
2. Send test webhook → `invoice.paid`
3. Sprawdź logi i bazę danych

---

## 📊 Monitoring

### Sprawdzanie Webhooków w Stripe

1. Stripe Dashboard → Developers → Webhooks
2. Kliknij na swój webhook
3. Zakładka **"Events"** - zobacz ostatnie eventy
4. Zakładka **"Logs"** - zobacz szczegóły requestów

### Sprawdzanie Logów Backendu

```bash
# Ostatnie 100 linii
pm2 logs rezerwacja24-backend --lines 100

# Tylko błędy
pm2 logs rezerwacja24-backend --err

# Filtrowanie po "webhook"
pm2 logs rezerwacja24-backend --lines 100 | grep webhook

# Filtrowanie po "subscription"
pm2 logs rezerwacja24-backend --lines 100 | grep subscription
```

### Sprawdzanie Bazy Danych

```sql
-- Ostatnie subskrypcje
SELECT id, tenantId, status, trialEnd, createdAt 
FROM subscriptions 
ORDER BY createdAt DESC 
LIMIT 10;

-- Ostatnie faktury
SELECT id, tenantId, amount, status, paidAt 
FROM invoices 
ORDER BY createdAt DESC 
LIMIT 10;

-- Subskrypcje w trial
SELECT COUNT(*) as trial_count 
FROM subscriptions 
WHERE status = 'TRIALING';

-- Aktywne subskrypcje
SELECT COUNT(*) as active_count 
FROM subscriptions 
WHERE status = 'ACTIVE';
```

---

## 🚨 Rozwiązywanie Problemów

### Problem: Webhook zwraca 401 Unauthorized

**Przyczyna**: Webhook secret jest nieprawidłowy

**Rozwiązanie**:
1. Skopiuj nowy secret ze Stripe Dashboard
2. Zaktualizuj `.env` na serwerze
3. Restart backendu: `pm2 restart rezerwacja24-backend`

---

### Problem: Webhook zwraca 500 Internal Server Error

**Przyczyna**: Błąd w kodzie backendu

**Rozwiązanie**:
1. Sprawdź logi: `pm2 logs rezerwacja24-backend --err`
2. Sprawdź czy baza danych działa
3. Sprawdź czy wszystkie zmienne środowiskowe są ustawione

---

### Problem: Webhook zwraca 404 Not Found

**Przyczyna**: URL jest nieprawidłowy

**Rozwiązanie**:
1. Sprawdź czy URL to dokładnie: `https://api.rezerwacja24.pl/api/billing/webhook`
2. Sprawdź czy backend działa: `curl https://api.rezerwacja24.pl/api/health`
3. Sprawdź routing w `billing.controller.ts`

---

### Problem: Subskrypcje nie są tworzone

**Przyczyna**: Webhook nie dociera lub jest błąd w handleru

**Rozwiązanie**:
1. Sprawdź logi Stripe: Dashboard → Webhooks → Logs
2. Sprawdź logi backendu: `pm2 logs`
3. Sprawdź bazę danych: `SELECT * FROM subscriptions;`
4. Wyślij test webhook ze Stripe Dashboard

---

## ✅ Checklist Konfiguracji

- [ ] Zalogowano się do Stripe Dashboard (LIVE MODE)
- [ ] Znaleziono nieprawidłowy webhook
- [ ] Zmieniono URL na `/api/billing/webhook`
- [ ] Sprawdzono eventy (8 eventów)
- [ ] Zapisano zmiany
- [ ] Skopiowano webhook secret
- [ ] Zaktualizowano `.env` na serwerze
- [ ] Zrestartowano backend
- [ ] Przetestowano webhook (Send test webhook)
- [ ] Sprawdzono logi backendu
- [ ] Sprawdzono bazę danych
- [ ] Przetestowano rejestrację + checkout

---

## 📞 Wsparcie

Jeśli masz problemy:

1. **Sprawdź logi**: `pm2 logs rezerwacja24-backend`
2. **Sprawdź Stripe Dashboard**: Webhooks → Logs
3. **Sprawdź bazę danych**: `SELECT * FROM subscriptions;`
4. **Sprawdź health**: `curl https://api.rezerwacja24.pl/api/health`

---

## 📝 Notatki

### Różnica między endpointami

#### `/api/payments/stripe/webhook`
- Obsługuje płatności za **REZERWACJE** (bookings)
- Każdy tenant ma własny Stripe account
- Używane przez klientów do płacenia za usługi

#### `/api/billing/webhook`
- Obsługuje **SUBSKRYPCJE** (subscription management)
- Jeden centralny Stripe account dla całej platformy
- Używane do zarządzania dostępem do platformy

**NIE MIESZAJ TYCH ENDPOINTÓW!**

---

**Autor**: Cascade AI  
**Data**: 2024-12-17  
**Wersja**: 1.0.0
