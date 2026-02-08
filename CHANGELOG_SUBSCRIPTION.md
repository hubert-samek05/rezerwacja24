# 📝 Changelog - System Subskrypcji

## [1.0.0] - 2024-12-10

### ✨ Dodane

#### Backend

**Schema Prisma**
- Zaktualizowano model `subscription_plans`:
  - Usunięto `tier`, `maxEmployees`, `maxBookings`, `maxSMS`, `maxCategories`
  - Dodano `slug`, `stripeProductId`, `trialDays`, `requiresPaymentMethod`
  - Zmieniono `priceMonthly` na PLN (było USD)
  
- Zaktualizowano model `subscriptions`:
  - Dodano `stripePaymentMethodId`, `trialStart`, `trialEnd`
  - Dodano `pausedAt`, `resumedAt`, `lastPaymentStatus`, `lastPaymentError`
  - Usunięto `bookingsUsed`, `smsUsed`
  - Dodano indeks na `status`

- Usunięto enum `PlanTier`

**Serwisy**
- `stripe.service.ts` - Pełna implementacja integracji Stripe:
  - `createCheckoutSession()` - Tworzenie sesji checkout z okresem próbnym
  - `createBillingPortalSession()` - Portal zarządzania subskrypcją
  - `cancelSubscription()` - Anulowanie subskrypcji
  - `resumeSubscription()` - Wznowienie subskrypcji
  - `getSubscriptionDetails()` - Szczegóły subskrypcji
  - `handleWebhook()` - Obsługa webhooków Stripe
  - Obsługa 8 typów eventów Stripe

- `billing.service.ts` - Logika biznesowa subskrypcji:
  - `getActivePlan()` - Pobieranie aktywnego planu
  - `getSubscription()` - Pobieranie subskrypcji tenanta
  - `hasActiveSubscription()` - Sprawdzanie statusu
  - `isInTrial()` - Sprawdzanie okresu próbnego
  - `getRemainingTrialDays()` - Pozostałe dni próbne
  - `getInvoices()` - Historia faktur
  - `getSubscriptionStats()` - Statystyki (admin)

**Kontrolery**
- `billing.controller.ts` - 10 endpointów REST API:
  - `GET /billing/plan` - Aktywny plan
  - `GET /billing/subscription` - Subskrypcja użytkownika
  - `GET /billing/subscription/details` - Szczegóły
  - `GET /billing/subscription/status` - Status
  - `POST /billing/checkout-session` - Rozpoczęcie subskrypcji
  - `POST /billing/portal-session` - Portal płatności
  - `DELETE /billing/subscription` - Anulowanie
  - `POST /billing/subscription/resume` - Wznowienie
  - `GET /billing/invoices` - Faktury
  - `POST /billing/webhook` - Webhook Stripe

**Guards & Decorators**
- `subscription.guard.ts` - Guard sprawdzający aktywną subskrypcję
- `requires-subscription.decorator.ts` - Dekorator dla endpointów

**Moduły**
- Zaktualizowano `billing.module.ts` - Dodano ConfigModule i PrismaService

#### Frontend

**Strony**
- `app/dashboard/settings/subscription/page.tsx`:
  - Wyświetlanie planu cenowego (79.99 PLN)
  - Rozpoczynanie okresu próbnego
  - Zarządzanie subskrypcją
  - Historia faktur
  - Anulowanie/wznawianie subskrypcji

**Komponenty**
- `components/SubscriptionBanner.tsx`:
  - Banner informujący o braku subskrypcji
  - Banner okresu próbnego z odliczaniem dni
  - Ostrzeżenie 3 dni przed końcem próbnego

**API Client**
- `lib/api/billing.ts` - Klient API dla subskrypcji:
  - Wszystkie metody z typami TypeScript
  - Obsługa błędów
  - Integracja z backendem

#### Skrypty & Dokumentacja

**Skrypty**
- `prisma/seed-subscription-plan.ts` - Seed planu Pro
- `scripts/deploy-subscription.sh` - Automatyczne wdrożenie

**Dokumentacja**
- `SUBSCRIPTION_SETUP.md` - Pełna instrukcja wdrożenia:
  - Konfiguracja Stripe (krok po kroku)
  - Aktualizacja bazy danych
  - Zmienne środowiskowe
  - Wdrożenie na produkcję
  - Testowanie
  - Monitoring
  - Troubleshooting
  - Checklist

- `CHANGELOG_SUBSCRIPTION.md` - Ten plik
- Zaktualizowano `ARCHITECTURE.md` - Nowy system subskrypcji

### 🔧 Zmienione

**Backend**
- Schema Prisma - Uproszczenie modeli subskrypcji
- Billing module - Dodanie zależności

**Frontend**
- Brak zmian w istniejących plikach (tylko nowe)

### ❌ Usunięte

**Backend**
- Enum `PlanTier` (STANDARD, PREMIUM, PRO)
- Pola związane z limitami w planie (maxEmployees, maxBookings, etc.)
- Pola liczników użycia (bookingsUsed, smsUsed)

### 🔒 Bezpieczeństwo

- Weryfikacja sygnatur webhooków Stripe
- Guard sprawdzający aktywną subskrypcję
- Zabezpieczenie endpointów przed nieautoryzowanym dostępem
- Walidacja danych wejściowych

### 📊 Metryki

Po wdrożeniu będzie można śledzić:
- Conversion rate (rejestracja → subskrypcja)
- Trial conversion (okres próbny → płatna)
- Churn rate (anulowane subskrypcje)
- MRR/ARR (przychody)
- LTV (wartość klienta)

### 🐛 Znane problemy

- [ ] Brak szablonów email dla powiadomień
- [ ] Brak testów jednostkowych dla nowych serwisów
- [ ] Brak testów E2E dla flow subskrypcji

### 📋 TODO

- [ ] Dodać szablony email (SendGrid):
  - Powitanie po rejestracji
  - Przypomnienie przed końcem próbnego
  - Potwierdzenie płatności
  - Nieudana płatność
  - Anulowanie subskrypcji

- [ ] Dodać testy:
  - Unit testy dla StripeService
  - Unit testy dla BillingService
  - E2E testy dla flow subskrypcji

- [ ] Dodać monitoring:
  - Alerty dla nieudanych płatności
  - Alerty dla błędów webhooków
  - Dashboard z metrykami subskrypcji

- [ ] Dodać dokumentację API (Swagger)

### 🚀 Wdrożenie

**Wymagane kroki przed wdrożeniem:**

1. ✅ Utworzyć produkt w Stripe Dashboard
2. ✅ Skonfigurować webhooks w Stripe
3. ✅ Ustawić zmienne środowiskowe
4. ✅ Zastosować zmiany w bazie danych (`prisma db push`)
5. ✅ Utworzyć plan w bazie (`seed-subscription-plan.ts`)
6. ✅ Wdrożyć backend i frontend
7. ✅ Przetestować z testową kartą Stripe

**Komenda wdrożenia:**
```bash
./scripts/deploy-subscription.sh
```

### 📞 Wsparcie

W razie problemów:
- Sprawdź `SUBSCRIPTION_SETUP.md`
- Sprawdź logi: `pm2 logs rezerwacja24-backend`
- Sprawdź Stripe Dashboard → Events
- Sprawdź bazę danych: `SELECT * FROM subscriptions;`

---

**Wersja**: 1.0.0  
**Data**: 2024-12-10  
**Autor**: Rezerwacja24 Team
