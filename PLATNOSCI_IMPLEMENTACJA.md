# Implementacja Systemu Płatności - 2024-12-07

## Przegląd
Zaimplementowano pełny system płatności online dla firm z obsługą trzech providerów:
- **Przelewy24** - polski system płatności
- **Stripe** - międzynarodowy system płatności
- **PayU** - popularny system płatności w Polsce

## Zmiany w Bazie Danych

### Tabela `users` - Nowe pola
```sql
-- Ustawienia biznesowe
businessName TEXT
subdomain TEXT UNIQUE
description TEXT
address TEXT
city TEXT
banner TEXT
logo TEXT
openingHours JSONB
socialMedia JSONB

-- Ustawienia płatności
paymentEnabled BOOLEAN DEFAULT false
acceptCashPayment BOOLEAN DEFAULT true
acceptOnlinePayment BOOLEAN DEFAULT false
paymentProvider TEXT

-- Przelewy24
przelewy24MerchantId TEXT
przelewy24PosId TEXT
przelewy24CrcKey TEXT
przelewy24ApiKey TEXT
przelewy24Enabled BOOLEAN DEFAULT false

-- Stripe
stripePublishableKey TEXT
stripeSecretKey TEXT
stripeWebhookSecret TEXT
stripeEnabled BOOLEAN DEFAULT false

-- PayU
payuPosId TEXT
payuSecondKey TEXT
payuOAuthClientId TEXT
payuOAuthClientSecret TEXT
payuEnabled BOOLEAN DEFAULT false
```

### Tabela `bookings` - Nowe pola
```sql
paymentStatus TEXT  -- 'pending', 'completed', 'failed', 'refunded'
stripeChargeId TEXT
przelewy24OrderId TEXT
przelewy24SessionId TEXT
przelewy24Status TEXT
payuOrderId TEXT
payuStatus TEXT
paymentUrl TEXT
paymentRedirectUrl TEXT
```

## Backend - Nowe Endpointy API

### Ustawienia Płatności
```
GET  /api/payments/settings
PUT  /api/payments/settings
```

### Tworzenie Płatności
```
POST /api/payments/create
Body: {
  bookingId: string
  amount: number
  provider: 'przelewy24' | 'stripe' | 'payu'
  customerEmail: string
  customerName: string
}
```

### Webhooks
```
POST /api/payments/przelewy24/webhook
POST /api/payments/stripe/webhook
POST /api/payments/payu/webhook
```

## Struktura Backendu

### Pliki utworzone:
1. `/backend/src/payments/payments.service.ts` - Logika biznesowa płatności
2. `/backend/src/payments/payments.controller.ts` - Kontroler API
3. `/backend/src/payments/payments.module.ts` - Moduł NestJS

### Funkcjonalności PaymentsService:

#### 1. Zarządzanie Ustawieniami
- `getPaymentSettings(userId)` - Pobiera ustawienia płatności firmy
- `updatePaymentSettings(userId, settings)` - Aktualizuje konfigurację

#### 2. Przelewy24
- `createPrzelewy24Payment()` - Tworzy transakcję
- `handlePrzelewy24Webhook()` - Obsługuje powiadomienia o statusie

#### 3. Stripe
- `createStripePayment()` - Tworzy Payment Intent
- `handleStripeWebhook()` - Obsługuje eventy Stripe

#### 4. PayU
- `createPayUPayment()` - Tworzy zamówienie
- `handlePayUWebhook()` - Obsługuje notyfikacje PayU

## Przepływ Płatności

### 1. Konfiguracja (Panel Biznesowy)
```
Firma → Ustawienia → Płatności
- Wybiera provider (Przelewy24/Stripe/PayU)
- Wprowadza dane dostępowe (Merchant ID, API Keys, etc.)
- Włącza płatności online
```

### 2. Rezerwacja z Płatnością (Subdomena Firmy)
```
Klient → Wybiera usługę → Wybiera termin
→ Formularz rezerwacji
→ Wybór metody płatności:
   - Gotówka na miejscu
   - Płatność online (jeśli włączona)
```

### 3. Proces Płatności Online
```
1. Frontend wywołuje: POST /api/payments/create
2. Backend tworzy transakcję u providera
3. Zwraca URL płatności lub client_secret (Stripe)
4. Klient przekierowywany do bramki płatności
5. Po płatności → webhook aktualizuje status
6. Klient przekierowany na stronę sukcesu
```

## Bezpieczeństwo

### Klucze API
- Przechowywane w bazie danych (należy dodać szyfrowanie)
- Nie zwracane w API GET /payments/settings
- Dostęp tylko dla właściciela firmy

### Webhooks
- Weryfikacja podpisu dla każdego providera
- Przelewy24: MD5 hash z CRC key
- Stripe: `stripe.webhooks.constructEvent()`
- PayU: Weryfikacja podpisu OpenSSL

### Subdomena
- Każda firma ma unikalną subdomenę
- Płatności przypisane do subdomeny
- Przy zmianie subdomeny - automatyczna aktualizacja URL-i

## Frontend - Do Zaimplementowania

### 1. Panel Ustawień Płatności (`/dashboard/settings/payments`)
```tsx
- Przełącznik: Akceptuj płatności gotówką
- Przełącznik: Akceptuj płatności online
- Wybór providera: Radio buttons (Przelewy24/Stripe/PayU)
- Formularz konfiguracji dla wybranego providera
- Przyciski: Testuj połączenie, Zapisz
```

### 2. Komponent Płatności na Subdomenie
```tsx
- Wyświetlanie dostępnych metod płatności
- Integracja Stripe Elements (dla Stripe)
- Przekierowanie do Przelewy24/PayU
- Strona sukcesu płatności
- Strona błędu płatności
```

### 3. Historia Płatności w Panelu
```tsx
- Lista płatności dla rezerwacji
- Status płatności
- Możliwość zwrotu (refund)
```

## Następne Kroki

### Backend (TODO):
1. ✅ Utworzenie modułu płatności
2. ✅ Dodanie pól do bazy danych
3. ✅ Implementacja podstawowych metod
4. ⏳ Pełna integracja z API Przelewy24
5. ⏳ Pełna integracja z API PayU
6. ⏳ Szyfrowanie kluczy API w bazie
7. ⏳ Obsługa zwrotów (refunds)

### Frontend (TODO):
1. ⏳ Panel ustawień płatności
2. ⏳ Komponent wyboru płatności na subdomenie
3. ⏳ Integracja Stripe Elements
4. ⏳ Strony sukcesu/błędu
5. ⏳ Historia płatności w dashboardzie

### Testy (TODO):
1. ⏳ Testy jednostkowe serwisów
2. ⏳ Testy integracyjne z sandbox API
3. ⏳ Testy E2E przepływu płatności

## Konfiguracja Produkcyjna

### Zmienne Środowiskowe
Nie są wymagane globalne zmienne - każda firma ma własną konfigurację w bazie.

### Nginx
Webhooks muszą być dostępne publicznie:
```nginx
location /api/payments/ {
    proxy_pass http://backend:4000;
}
```

### SSL
Wymagane dla wszystkich płatności online (już skonfigurowane).

## Dokumentacja API Providerów

### Przelewy24
- Docs: https://docs.przelewy24.pl/
- Sandbox: https://sandbox.przelewy24.pl/
- Test Merchant ID: Dostępny po rejestracji

### Stripe
- Docs: https://stripe.com/docs/api
- Dashboard: https://dashboard.stripe.com/
- Test Keys: Dostępne w dashboardzie

### PayU
- Docs: https://developers.payu.com/
- Sandbox: https://secure.snd.payu.com/
- Test POS ID: Dostępny po rejestracji

## Status Implementacji
🟢 **Backend**: 70% - Podstawowa struktura gotowa, wymaga integracji z prawdziwymi API
🟡 **Frontend**: 0% - Do zaimplementowania
🟡 **Testy**: 0% - Do zaimplementowania

## Notatki
- System zaprojektowany z myślą o wielodomenowości
- Każda firma może mieć własną konfigurację płatności
- Subdomena automatycznie używana w URL-ach zwrotnych
- Gotowe do rozbudowy o kolejne metody płatności
