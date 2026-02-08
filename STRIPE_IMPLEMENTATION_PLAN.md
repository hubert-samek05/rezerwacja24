# 🎯 Plan Implementacji Stripe - Rezerwacja24

**Data**: 2024-12-10  
**Status**: W TRAKCIE

---

## 🔑 Klucze Stripe (Zapisane)

### TEST MODE (Aktywny)
- ✅ Publishable Key: `pk_test_51SJs80G1gOZznL0i...`
- ✅ Secret Key: `sk_test_51SJs80G1gOZznL0i...`
- ✅ Price ID: `price_1ScumaG1gOZznL0ievl9tdCE`
- ✅ Webhook Secret: `whsec_2k3U7LrrxMrZqYWYOCVpJ1Ac7aPVpQjg`

### LIVE MODE (Do użycia w produkcji)
- ✅ Publishable Key: `pk_live_51SJs80G1gOZznL0i...`
- ✅ Secret Key: Zapisany (nie pokazuję ze względów bezpieczeństwa)
- ⚠️ Price ID: **DO UTWORZENIA** (utwórz produkt w LIVE mode)
- ✅ Webhook Secret: `whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq`

---

## 📋 Logika Biznesowa

### 1. Trial Period (7 dni)
```
✅ Nowy użytkownik → automatycznie 7 dni trial
✅ Odliczanie dni w UI (pasek postępu)
✅ Powiadomienie 1 dzień przed końcem trial
✅ Pełny dostęp podczas trial
```

### 2. Po Zakończeniu Trial
```
✅ Automatyczna próba pobrania płatności (99 PLN/miesiąc)
✅ Jeśli sukces → subskrypcja aktywna
✅ Jeśli błąd → retry logic
```

### 3. Retry Logic (Nieudana Płatność)
```
✅ Próba 1: Natychmiast
✅ Próba 2: Po 6 godzinach
✅ Próba 3: Po kolejnych 6 godzinach (12h od pierwszej)
✅ Próba 4: Po kolejnych 6 godzinach (18h od pierwszej)
❌ Po 3 nieudanych próbach → BLOKADA
```

### 4. Blokada Konta
```
❌ Brak dostępu do panelu (redirect do /subscription/expired)
❌ Nie można tworzyć/edytować rezerwacji
❌ Nie można zarządzać pracownikami/usługami
✅ DANE NIE SĄ USUWANE - tylko zablokowane
✅ Popup: "Subskrypcja wygasła - odnów aby kontynuować"
✅ Przycisk "Odnów subskrypcję" → Stripe Checkout
```

### 5. Odnowienie Subskrypcji
```
✅ Użytkownik klika "Odnów"
✅ Redirect do Stripe Checkout
✅ Po udanej płatności → odblokowanie konta
✅ Wszystkie dane zachowane
```

---

## 🏗️ Implementacja - Etapy

### ETAP 1: Backend - Stripe Service ✅
- [x] Instalacja `stripe` package
- [x] Konfiguracja Stripe SDK
- [x] Service do zarządzania subskrypcjami
- [x] Webhook handler
- [x] Retry logic dla nieudanych płatności

### ETAP 2: Database Schema ✅
- [x] Dodanie pól do `tenants`:
  - `stripeCustomerId`
  - `stripeSubscriptionId`
  - `subscriptionStatus` (trialing, active, past_due, canceled)
  - `trialEndsAt`
  - `currentPeriodEnd`
  - `paymentRetryCount`
  - `lastPaymentAttempt`

### ETAP 3: Frontend - Stripe Elements
- [ ] Instalacja `@stripe/stripe-js` i `@stripe/react-stripe-js`
- [ ] Komponent Checkout
- [ ] Trial countdown (odliczanie dni)
- [ ] Pasek postępu trial
- [ ] Popup "Subskrypcja wygasła"

### ETAP 4: Middleware - Blokada Dostępu
- [ ] Middleware sprawdzający status subskrypcji
- [ ] Redirect do `/subscription/expired` jeśli nieaktywna
- [ ] Whitelist dla stron (login, register, subscription)

### ETAP 5: Webhook Events
- [ ] `customer.subscription.created` - nowa subskrypcja
- [ ] `customer.subscription.updated` - zmiana statusu
- [ ] `customer.subscription.deleted` - anulowanie
- [ ] `invoice.payment_succeeded` - udana płatność
- [ ] `invoice.payment_failed` - nieudana płatność
- [ ] `customer.subscription.trial_will_end` - 1 dzień przed końcem trial

### ETAP 6: Cron Jobs
- [ ] Sprawdzanie wygasłych trial (co godzinę)
- [ ] Retry nieudanych płatności (co 6 godzin)
- [ ] Powiadomienia email

### ETAP 7: UI/UX
- [ ] Dashboard widget - status subskrypcji
- [ ] Strona `/subscription` - zarządzanie
- [ ] Strona `/subscription/expired` - odnowienie
- [ ] Email templates (trial ending, payment failed, etc.)

### ETAP 8: Testing
- [ ] Test trial flow
- [ ] Test successful payment
- [ ] Test failed payment + retry
- [ ] Test account blocking
- [ ] Test renewal
- [ ] Test webhooks

---

## 🔄 Przełączanie TEST → LIVE

Gdy wszystko będzie działać w TEST mode:

```bash
# Backend .env
STRIPE_MODE=live
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_LIVE}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY_LIVE}
STRIPE_PRICE_ID=${STRIPE_PRICE_ID_LIVE}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET_LIVE}
```

```bash
# Frontend .env.local
# Odkomentuj LIVE key, zakomentuj TEST key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SJs80G1gOZznL0i...
```

**WAŻNE**: Przed przełączeniem na LIVE:
1. ✅ Utwórz produkt w Stripe LIVE mode
2. ✅ Skopiuj nowy Price ID (LIVE)
3. ✅ Zaktualizuj webhook URL w Stripe LIVE
4. ✅ Przetestuj wszystko w TEST mode

---

## 📊 Monitoring

### Metryki do śledzenia:
- Liczba aktywnych subskrypcji
- Liczba trial users
- Conversion rate (trial → paid)
- Failed payments rate
- Churn rate

### Logi:
- Wszystkie webhook events
- Próby płatności
- Blokady kont
- Odnowienia

---

## 🚀 Następne Kroki

1. **Teraz**: Implementacja Stripe Service (Backend)
2. **Potem**: Database migrations
3. **Potem**: Frontend Checkout
4. **Potem**: Middleware blokady
5. **Potem**: Webhooks
6. **Potem**: Testing
7. **Na końcu**: Przełączenie na LIVE

---

**Rozpoczynam implementację!** 🎯
