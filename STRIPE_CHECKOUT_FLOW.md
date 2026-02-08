# 🎯 Stripe Checkout Flow - Co się dzieje krok po kroku

**Data**: 2024-12-13 19:12  
**Status**: ✅ LIVE MODE AKTYWNY

---

## 📋 Pełny Flow - Od Kliknięcia do Subskrypcji

### 1️⃣ **Użytkownik Klika "Rozpocznij 7-dniowy okres próbny"**

**Lokalizacja**: Modal lub strona `/subscription/checkout`

```javascript
// Frontend: components/StripeCheckoutForm.tsx
const response = await fetch('/api/billing/checkout-session', {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com' })
});

const data = await response.json();
// data.url = "https://checkout.stripe.com/c/pay/cs_live_..."
window.location.href = data.url; // PRZEKIEROWANIE DO STRIPE
```

**Co się dzieje:**
- ✅ Frontend wysyła request do `/api/billing/checkout-session`
- ✅ Backend tworzy Stripe Checkout Session
- ✅ Użytkownik jest **PRZEKIEROWYWANY** do Stripe Checkout

---

### 2️⃣ **Backend Tworzy Checkout Session**

**Lokalizacja**: `backend/src/billing/stripe.service.ts`

```javascript
// 1. Sprawdź czy użytkownik już ma subskrypcję
const existingSubscription = await prisma.subscriptions.findUnique({
  where: { tenantId }
});

if (existingSubscription) {
  throw new Error('Firma już posiada aktywną subskrypcję');
}

// 2. Utwórz lub pobierz Stripe Customer
const customer = await stripe.customers.create({
  email: 'user@example.com',
  metadata: { tenantId, tenantName }
});

// 3. Utwórz Checkout Session z 7-dniowym trial
const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_1ScucgG1gOZznL0iT9QfumRR', // 79.99 PLN/miesiąc
    quantity: 1
  }],
  subscription_data: {
    trial_period_days: 7, // 7 DNI TRIAL
    trial_settings: {
      end_behavior: {
        missing_payment_method: 'cancel' // Anuluj jeśli brak karty
      }
    },
    metadata: { tenantId, planId }
  },
  payment_method_collection: 'always', // WYMAGAJ KARTY
  success_url: 'https://app.rezerwacja24.pl/dashboard/settings/subscription?success=true',
  cancel_url: 'https://app.rezerwacja24.pl/dashboard/settings/subscription?canceled=true'
});

return {
  sessionId: session.id,
  url: session.url // URL do Stripe Checkout
};
```

**Parametry:**
- ✅ `trial_period_days: 7` - 7 dni bez płatności
- ✅ `payment_method_collection: 'always'` - karta WYMAGANA
- ✅ `missing_payment_method: 'cancel'` - anuluj jeśli brak karty po trial
- ✅ `success_url` - gdzie przekierować po sukcesie
- ✅ `cancel_url` - gdzie przekierować po anulowaniu

---

### 3️⃣ **Użytkownik Jest Na Stripe Checkout**

**URL**: `https://checkout.stripe.com/c/pay/cs_live_...`

**Co widzi użytkownik:**
- ✅ Logo i nazwa firmy
- ✅ "7 dni bezpłatnie" - wyraźnie widoczne
- ✅ Email (automatycznie wypełniony)
- ✅ Formularz karty:
  - Numer karty
  - Data ważności (MM/YY)
  - CVC
  - Kraj/region
- ✅ Przycisk "Rozpocznij okres próbny"

**Ważne:**
- ❌ **Karta NIE JEST OBCIĄŻANA!**
- ✅ Stripe tylko zapisuje metodę płatności
- ✅ Płatność nastąpi dopiero po 7 dniach

---

### 4️⃣ **Użytkownik Wypełnia Dane Karty i Klika "Rozpocznij"**

**Co się dzieje w Stripe:**

1. **Walidacja karty**
   - Stripe sprawdza czy karta jest prawidłowa
   - Może wymagać 3D Secure (SMS/app)
   - Jeśli OK → przechodzi dalej

2. **Utworzenie Subscription**
   ```javascript
   // Stripe automatycznie tworzy:
   {
     id: "sub_1ScudgG1gOZznL0i...",
     customer: "cus_...",
     status: "trialing", // STATUS: TRIALING!
     trial_start: 1734120000, // Dzisiaj
     trial_end: 1734724800,   // Za 7 dni
     current_period_start: 1734120000,
     current_period_end: 1737398400, // Za 37 dni (7 trial + 30 płatny)
     default_payment_method: "pm_...", // Zapisana karta
     items: [{
       price: "price_1ScucgG1gOZznL0iT9QfumRR",
       quantity: 1
     }]
   }
   ```

3. **Stripe wysyła WEBHOOK do backendu**
   ```
   POST https://api.rezerwacja24.pl/api/payments/stripe/webhook
   Event: customer.subscription.created
   ```

---

### 5️⃣ **Backend Odbiera Webhook i Zapisuje Subskrypcję**

**Lokalizacja**: `backend/src/billing/stripe.service.ts`

```javascript
// Webhook handler
async handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId;
  const planId = subscription.metadata?.planId;

  // Zapisz subskrypcję w bazie
  await prisma.subscriptions.upsert({
    where: { tenantId },
    create: {
      id: `sub_${Date.now()}`,
      status: 'TRIALING', // ✅ STATUS: TRIALING
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      stripePaymentMethodId: subscription.default_payment_method,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: new Date(subscription.trial_start * 1000), // ✅ Dzisiaj
      trialEnd: new Date(subscription.trial_end * 1000),     // ✅ Za 7 dni
      cancelAtPeriodEnd: false,
      tenantId,
      planId
    }
  });

  console.log('✅ Subskrypcja TRIALING utworzona dla tenant:', tenantId);
}
```

**Co jest zapisane w bazie:**
```sql
SELECT * FROM subscriptions WHERE tenantId = 'tenant-xxx';

id                          | sub-1734120000-xxx
status                      | TRIALING
stripeCustomerId            | cus_xxx
stripeSubscriptionId        | sub_xxx
stripePaymentMethodId       | pm_xxx
currentPeriodStart          | 2024-12-13 19:00:00
currentPeriodEnd            | 2025-01-20 19:00:00
trialStart                  | 2024-12-13 19:00:00
trialEnd                    | 2024-12-20 19:00:00  ← 7 DNI!
cancelAtPeriodEnd           | false
tenantId                    | tenant-xxx
planId                      | plan_pro_7999
```

---

### 6️⃣ **Stripe Przekierowuje Użytkownika Po Sukcesie**

**URL**: `https://app.rezerwacja24.pl/dashboard/settings/subscription?success=true`

**Co widzi użytkownik:**
- ✅ Toast: "Subskrypcja została aktywowana! 🎉"
- ✅ Strona ustawień subskrypcji
- ✅ Status: **"Okres próbny"**
- ✅ Pozostało: **7 dni**
- ✅ Cena: **79.99 PLN/miesiąc**
- ✅ Następna płatność: **20 grudnia 2024**

**Użytkownik ma PEŁNY dostęp do dashboard!**

---

### 7️⃣ **Co Widać W Stripe Dashboard**

**Lokalizacja**: https://dashboard.stripe.com/subscriptions

**Lista subskrypcji:**
```
Customer          | Status    | Amount      | Next payment
user@example.com  | Trialing  | 79.99 PLN   | Dec 20, 2024
```

**Szczegóły subskrypcji:**
```
Status: Trialing
Trial ends: Dec 20, 2024 at 7:00 PM
Next invoice: Dec 20, 2024
Amount: 79.99 PLN

Timeline:
✅ Dec 13, 2024 - Subscription created (trialing)
⏳ Dec 20, 2024 - Trial ends, first payment
```

**Customer:**
```
Email: user@example.com
Payment methods: •••• 4242 (Visa)
Subscriptions: 1 active (trialing)
```

---

### 8️⃣ **Co Się Dzieje Po 7 Dniach (20 grudnia)**

**Automatycznie przez Stripe:**

1. **Stripe próbuje pobrać płatność**
   ```
   Kwota: 79.99 PLN
   Karta: •••• 4242
   ```

2. **Jeśli SUKCES:**
   ```javascript
   // Webhook: invoice.paid
   - Status: ACTIVE (zmiana z TRIALING)
   - Następna płatność: 20 stycznia 2025
   - Faktura: inv_xxx (PDF dostępny)
   ```

3. **Jeśli FAIL:**
   ```javascript
   // Webhook: invoice.payment_failed
   - Status: PAST_DUE
   - Retry 1: Natychmiast
   - Retry 2: Po 24h
   - Retry 3: Po 72h
   - Po 3 próbach: BLOKADA KONTA
   ```

---

## 🔍 Weryfikacja - Jak Sprawdzić Czy Działa

### 1. **W Stripe Dashboard**

```
1. Wejdź na: https://dashboard.stripe.com
2. Przełącz na LIVE MODE (przełącznik w lewym górnym rogu)
3. Przejdź do: Payments → Subscriptions
4. Znajdź subskrypcję użytkownika
5. Sprawdź:
   ✅ Status: Trialing
   ✅ Trial ends: Za 7 dni
   ✅ Amount: 79.99 PLN
   ✅ Payment method: Karta dodana
```

### 2. **W Bazie Danych**

```sql
-- Sprawdź subskrypcję
SELECT 
  s.id,
  s.status,
  s.trialStart,
  s.trialEnd,
  s.stripeSubscriptionId,
  t.email
FROM subscriptions s
JOIN tenants t ON s.tenantId = t.id
WHERE t.email = 'user@example.com';

-- Powinno zwrócić:
status: TRIALING
trialStart: 2024-12-13 19:00:00
trialEnd: 2024-12-20 19:00:00
stripeSubscriptionId: sub_xxx
```

### 3. **W Aplikacji**

```
1. Zaloguj się jako użytkownik
2. Przejdź do: Dashboard → Ustawienia → Subskrypcja
3. Sprawdź:
   ✅ Status: "Okres próbny"
   ✅ Pozostało: 7 dni
   ✅ Następna płatność: 20 grudnia 2024
   ✅ Cena: 79.99 PLN/miesiąc
```

---

## ⚠️ Ważne Informacje

### Karta Jest Wymagana

- ✅ Użytkownik MUSI dodać kartę
- ✅ Karta jest walidowana przez Stripe
- ✅ Może wymagać 3D Secure
- ❌ Bez karty = brak dostępu

### Trial Trwa 7 Dni

- ✅ Od momentu dodania karty
- ✅ Karta NIE jest obciążana
- ✅ Pełny dostęp do wszystkich funkcji
- ⏰ Po 7 dniach: automatyczna płatność

### Płatność Po Trial

- ✅ Stripe automatycznie pobiera 79.99 PLN
- ✅ Jeśli sukces: status ACTIVE
- ✅ Jeśli fail: 3 próby w 3 dni
- ❌ Po 3 próbach: blokada konta

### Webhooks Są Kluczowe

- ✅ Stripe wysyła webhook po każdym evencie
- ✅ Backend zapisuje dane w bazie
- ⚠️ **MUSISZ skonfigurować webhook URL w Stripe Dashboard!**

---

## 🔧 Konfiguracja Webhook W Stripe

**WAŻNE: To MUSISZ zrobić ręcznie!**

1. Wejdź na: https://dashboard.stripe.com/webhooks
2. Kliknij: **"Add endpoint"**
3. Wpisz URL: `https://api.rezerwacja24.pl/api/payments/stripe/webhook`
4. Wybierz eventy:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.trial_will_end`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
   - ✅ `payment_method.attached`
5. Kliknij: **"Add endpoint"**
6. Skopiuj **Signing secret** (zaczyna się od `whsec_`)
7. Dodaj do `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**BEZ TEGO WEBHOOKS NIE BĘDĄ DZIAŁAĆ!**

---

## ✅ Podsumowanie Flow

```
1. Kliknięcie "Rozpocznij trial"
   ↓
2. Backend tworzy Checkout Session
   ↓
3. Przekierowanie do Stripe Checkout
   ↓
4. Użytkownik dodaje kartę
   ↓
5. Stripe tworzy Subscription (status: trialing)
   ↓
6. Webhook → Backend zapisuje w bazie
   ↓
7. Przekierowanie do /dashboard/settings/subscription?success=true
   ↓
8. Użytkownik widzi: "Okres próbny - 7 dni"
   ↓
9. Po 7 dniach: Stripe automatycznie pobiera 79.99 PLN
   ↓
10. Jeśli sukces: status ACTIVE
    Jeśli fail: retry 3x → blokada
```

**WSZYSTKO DZIAŁA AUTOMATYCZNIE! 🎉**
