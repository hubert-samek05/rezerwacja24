# Plan ulepszeń ustawień i płatności

## Status: W TRAKCIE REALIZACJI
Data rozpoczęcia: 2024-12-12

## Cele główne:
1. ✅ Dodanie brakujących zakładek w ustawieniach
2. ✅ Naprawa systemu płatności dla firm
3. ✅ Naprawa systemu subskrypcji (trial 7 dni)
4. ✅ Wyświetlanie czasu końca okresu próbnego

---

## 1. Nowe zakładki w ustawieniach

### 1.1 Zakładka API
**Cel**: Umożliwienie firmom generowania i zarządzania kluczami API

**Funkcjonalności**:
- Generowanie API key
- Wyświetlanie aktywnych kluczy
- Usuwanie/regenerowanie kluczy
- Dokumentacja API
- Rate limiting info

**Pliki do utworzenia**:
- `frontend/components/settings/ApiTab.tsx`
- `backend/src/api-keys/api-keys.module.ts`
- `backend/src/api-keys/api-keys.controller.ts`
- `backend/src/api-keys/api-keys.service.ts`

**Status**: ⏳ Oczekuje

---

### 1.2 Zakładka Integracje
**Cel**: Zarządzanie integracjami z zewnętrznymi systemami

**Funkcjonalności**:
- Google Calendar sync
- Facebook/Instagram integracja
- Zapier webhooks
- Email marketing (Mailchimp, etc.)

**Pliki do utworzenia**:
- `frontend/components/settings/IntegrationsTab.tsx`
- `backend/src/integrations/integrations.module.ts`
- `backend/src/integrations/integrations.controller.ts`
- `backend/src/integrations/integrations.service.ts`

**Status**: ⏳ Oczekuje

---

### 1.3 Zakładka Widżet WWW
**Cel**: Generowanie kodu widżetu do osadzenia na stronie WWW

**Funkcjonalności**:
- Generowanie kodu embed
- Podgląd widżetu
- Konfiguracja wyglądu (kolory, rozmiar)
- Wybór wyświetlanych usług

**Pliki do utworzenia**:
- `frontend/components/settings/WidgetTab.tsx`
- `frontend/app/widget/[tenantId]/page.tsx` (publiczny widżet)

**Status**: ⏳ Oczekuje

---

### 1.4 Zakładka SMS i Powiadomienia
**Cel**: Konfiguracja powiadomień SMS i email

**Funkcjonalności**:
- Włączanie/wyłączanie powiadomień SMS
- Szablony wiadomości
- Konfiguracja providera SMS (Twilio, SMS API)
- Ustawienia email notifications
- Przypomnienia o rezerwacjach

**Pliki do utworzenia**:
- `frontend/components/settings/NotificationsTab.tsx`
- `backend/src/notifications/notifications.module.ts`
- `backend/src/notifications/notifications.service.ts`
- `backend/src/notifications/sms.service.ts`

**Status**: ⏳ Oczekuje

---

## 2. Naprawa płatności dla firm

### 2.1 Ustawienia płatności (Stripe, Przelewy24, PayU)
**Problem**: Brak pełnej konfiguracji płatności dla firm

**Do naprawy**:
- ✅ Formularz konfiguracji Stripe (publishable key, secret key)
- ✅ Formularz konfiguracji Przelewy24 (merchant ID, POS ID, CRC key, API key)
- ✅ Formularz konfiguracji PayU (POS ID, second key, OAuth credentials)
- ✅ Testowanie połączenia z providerami
- ✅ Bezpieczne przechowywanie kluczy API

**Pliki do modyfikacji**:
- `frontend/components/settings/PaymentsTab.tsx` - rozbudowa formularzy
- `backend/src/payments/payments.controller.ts` - endpointy do zapisu ustawień
- `backend/src/payments/payments.service.ts` - walidacja i szyfrowanie kluczy

**Status**: ⏳ Oczekuje

---

## 3. Naprawa systemu subskrypcji

### 3.1 Okres próbny 7 dni
**Problem**: Brak wyświetlania czasu końca trialu

**Do naprawy**:
- ✅ Wyświetlanie daty końca okresu próbnego
- ✅ Licznik dni pozostałych do końca trialu
- ✅ Powiadomienie przed końcem trialu
- ✅ Automatyczne przejście do płatnej subskrypcji lub blokada

**Pliki do modyfikacji**:
- `frontend/components/settings/SubscriptionTab.tsx` - wyświetlanie trialu
- `frontend/app/dashboard/layout.tsx` - banner z informacją o trialu
- `backend/src/subscriptions/*` - logika sprawdzania trialu

**Status**: ⏳ Oczekuje

---

### 3.2 Płatności za subskrypcję
**Problem**: Brak możliwości opłacenia subskrypcji

**Do naprawy**:
- ✅ Integracja Stripe Checkout dla subskrypcji
- ✅ Wybór planu (Basic, Pro, Enterprise)
- ✅ Automatyczne odnawianie
- ✅ Historia płatności
- ✅ Faktury

**Pliki do utworzenia/modyfikacji**:
- `backend/src/subscriptions/subscriptions.module.ts`
- `backend/src/subscriptions/subscriptions.controller.ts`
- `backend/src/subscriptions/subscriptions.service.ts`
- `backend/src/subscriptions/stripe-subscription.service.ts`

**Status**: ⏳ Oczekuje

---

## 4. Kolejność implementacji

### Faza 1: Subskrypcje i płatności (PRIORYTET)
1. Naprawa wyświetlania okresu próbnego
2. System płatności za subskrypcję
3. Ustawienia płatności dla firm

### Faza 2: Nowe zakładki (WAŻNE)
4. Zakładka SMS i Powiadomienia
5. Zakładka API
6. Zakładka Widżet WWW
7. Zakładka Integracje

---

## Bezpieczeństwo i ostrożność

### Zasady:
- ✅ Każda zmiana testowana lokalnie przed wdrożeniem
- ✅ Backup bazy danych przed większymi zmianami
- ✅ Stopniowe wdrażanie (feature by feature)
- ✅ Nie usuwać istniejącego kodu bez weryfikacji
- ✅ Wszystkie klucze API szyfrowane w bazie
- ✅ Walidacja danych po stronie backend i frontend

### Checklisty przed wdrożeniem:
- [ ] Kod zbudowany bez błędów
- [ ] Testy manualne przeprowadzone
- [ ] Nie ma konfliktów z istniejącym kodem
- [ ] Backend i frontend zrestartowane
- [ ] Logi sprawdzone pod kątem błędów

---

## Notatki techniczne

### Struktura bazy danych (Prisma):
- `tenants` - dane firm, ustawienia płatności
- `subscriptions` - subskrypcje firm
- `subscription_plans` - plany subskrypcji
- `api_keys` - klucze API (do utworzenia)
- `integrations` - integracje (do utworzenia)
- `notification_templates` - szablony powiadomień (do utworzenia)

### API Endpoints do utworzenia:
- `POST /api/api-keys/generate`
- `GET /api/api-keys`
- `DELETE /api/api-keys/:id`
- `GET /api/subscriptions/current`
- `POST /api/subscriptions/checkout`
- `POST /api/subscriptions/cancel`
- `GET /api/integrations`
- `POST /api/integrations/:provider/connect`
- `GET /api/notifications/templates`
- `POST /api/notifications/test-sms`

---

## Progress Tracking

**Data ostatniej aktualizacji**: 2024-12-12 21:26

**Ukończone**: 0/8 zadań
**W trakcie**: 1/8 zadań (Analiza)
**Oczekujące**: 7/8 zadań

---

## Następne kroki:
1. Rozpocząć od Fazy 1 - Subskrypcje i płatności
2. Utworzyć backend dla subskrypcji
3. Dodać wyświetlanie trialu w frontend
4. Przetestować przed wdrożeniem
