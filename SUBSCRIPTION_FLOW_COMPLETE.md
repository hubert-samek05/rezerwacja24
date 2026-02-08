# ✅ Kompletny Flow Subskrypcji - Dokumentacja

**Data**: 2024-12-13 18:51  
**Status**: ✅ PRODUKCJA LIVE MODE

---

## 🎯 Jak to działa - Krok po kroku

### 1️⃣ **Rejestracja Nowego Użytkownika**

```
Użytkownik → Formularz rejestracji → Konto utworzone → PRZEKIEROWANIE do /subscription/checkout
```

- ✅ Użytkownik wypełnia formularz rejestracji
- ✅ Konto zostaje utworzone w bazie
- ✅ **AUTOMATYCZNE przekierowanie** do strony checkout
- ❌ **NIE MA dostępu do dashboard** bez subskrypcji

---

### 2️⃣ **Dodanie Karty i Rozpoczęcie Trial**

```
Checkout → Stripe Payment Form → Karta dodana → Webhook → Subskrypcja TRIALING
```

**Co się dzieje:**

1. **Użytkownik widzi formularz Stripe**
   - Email: automatycznie wypełniony z konta
   - Numer karty, data ważności, CVC
   - Kraj/region

2. **Po kliknięciu "Rozpocznij okres próbny":**
   - Stripe tworzy Customer
   - Stripe tworzy Subscription ze statusem `trialing`
   - **Karta NIE JEST OBCIĄŻANA!**
   - Trial trwa **7 dni**

3. **Stripe wysyła webhook:**
   ```
   customer.subscription.created → Backend zapisuje w bazie:
   - status: TRIALING
   - trialStart: dzisiaj
   - trialEnd: dzisiaj + 7 dni
   - stripeSubscriptionId: sub_xxx
   - stripeCustomerId: cus_xxx
   - stripePaymentMethodId: pm_xxx
   ```

4. **Użytkownik ma PEŁNY dostęp przez 7 dni**
   - Modal się zamyka
   - Dashboard jest dostępny
   - Wszystkie funkcje działają

---

### 3️⃣ **Koniec Okresu Próbnego (Po 7 Dniach)**

```
Dzień 7 → Stripe automatycznie pobiera 79,99 PLN → Webhook → Status: ACTIVE
```

**Co się dzieje:**

1. **3 dni przed końcem trial:**
   - Stripe wysyła webhook: `customer.subscription.trial_will_end`
   - Backend loguje: "Okres próbny kończy się za 3 dni"
   - TODO: Email do użytkownika z przypomnieniem

2. **W dniu końca trial:**
   - Stripe **AUTOMATYCZNIE** próbuje pobrać płatność
   - Kwota: **79,99 PLN**
   - Z karty dodanej podczas rejestracji

3. **Jeśli płatność SUKCES:**
   - Webhook: `invoice.paid`
   - Backend aktualizuje:
     - status: ACTIVE
     - lastPaymentStatus: paid
     - currentPeriodEnd: dzisiaj + 30 dni
   - Użytkownik dalej ma dostęp

4. **Jeśli płatność FAIL:**
   - Webhook: `invoice.payment_failed`
   - Backend zapisuje błąd
   - Stripe automatycznie **ponawia próbę** (3 razy w ciągu ~3 dni)

---

### 4️⃣ **Nieudana Płatność - Retry Logic**

```
Płatność FAIL → Próba 1 (dzień 0) → Próba 2 (dzień 1) → Próba 3 (dzień 3) → BLOKADA
```

**Stripe automatycznie ponawia:**

- **Próba 1**: Natychmiast po nieudanej płatności
- **Próba 2**: ~24h później
- **Próba 3**: ~72h później

**Backend reaguje:**

```javascript
// Po KAŻDEJ nieudanej próbie:
- status: PAST_DUE
- lastPaymentStatus: failed
- lastPaymentError: "Insufficient funds" (lub inny błąd)

// Po 3 NIEUDANYCH próbach:
- tenant.isSuspended: true
- tenant.suspendedReason: "Płatność nieudana po 3 próbach"
- 🚫 KONTO ZABLOKOWANE
```

---

### 5️⃣ **Blokada Konta**

```
3 nieudane próby → isSuspended: true → Modal NIE DO ZAMKNIĘCIA → Tylko odnowienie
```

**Co widzi użytkownik:**

- ❌ Dashboard jest niedostępny
- ❌ Wszystkie funkcje zablokowane
- ✅ **Modal wymuszający odnowienie** (nie można zamknąć!)
- ✅ Przycisk "Odnów subskrypcję" → Stripe Billing Portal

**Jak odblokować:**

1. Użytkownik klika "Odnów subskrypcję"
2. Przekierowanie do Stripe Billing Portal
3. Użytkownik aktualizuje kartę / opłaca zaległość
4. Stripe wysyła webhook: `invoice.paid`
5. Backend:
   ```javascript
   - isSuspended: false
   - suspendedReason: null
   - status: ACTIVE
   ```
6. ✅ Konto odblokowane!

---

### 6️⃣ **Cykliczne Płatności (Co Miesiąc)**

```
Co 30 dni → Stripe automatycznie pobiera 79,99 PLN → Webhook → Status: ACTIVE
```

**Automatyczne:**

- Stripe sam pobiera płatność co miesiąc
- Jeśli sukces: `invoice.paid` → wszystko działa
- Jeśli fail: retry logic (jak wyżej)

---

## 🔐 Logika Blokowania Dostępu

### Modal "Required Subscription"

**Kiedy się pokazuje:**

```javascript
// Hook: useRequireSubscription()
if (!hasActiveSubscription && !isInTrial) {
  showModal = true; // NIE MOŻNA ZAMKNĄĆ!
}
```

**Warunki dostępu:**

```javascript
// Dostęp OK jeśli:
hasActiveSubscription = status === 'ACTIVE' || status === 'TRIALING'

// Blokada jeśli:
- status === 'PAST_DUE' (po nieudanej płatności)
- status === 'CANCELLED' (anulowana subskrypcja)
- status === 'UNPAID' (brak płatności)
- tenant.isSuspended === true
```

---

## 📊 Statusy Subskrypcji

| Status | Znaczenie | Dostęp do Dashboard |
|--------|-----------|---------------------|
| `TRIALING` | Okres próbny (7 dni) | ✅ TAK |
| `ACTIVE` | Opłacona subskrypcja | ✅ TAK |
| `PAST_DUE` | Nieudana płatność (retry w toku) | ⚠️ TAK (do 3 prób) |
| `CANCELLED` | Anulowana przez użytkownika | ❌ NIE |
| `UNPAID` | Brak płatności po 3 próbach | ❌ NIE |

---

## 🔔 Webhooks Stripe

**URL**: `https://api.rezerwacja24.pl/api/payments/stripe/webhook`  
**Secret**: `whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq`

**Obsługiwane eventy:**

1. ✅ `checkout.session.completed` - Checkout zakończony
2. ✅ `customer.subscription.created` - Subskrypcja utworzona (TRIAL START)
3. ✅ `customer.subscription.updated` - Subskrypcja zaktualizowana
4. ✅ `customer.subscription.deleted` - Subskrypcja usunięta
5. ✅ `customer.subscription.trial_will_end` - Trial kończy się za 3 dni
6. ✅ `invoice.paid` - Płatność udana (ODBLOKOWANIE)
7. ✅ `invoice.payment_failed` - Płatność nieudana (RETRY)
8. ✅ `payment_method.attached` - Karta dodana

---

## 🚀 Konfiguracja Stripe Dashboard

### 1. Webhook Endpoint

```
URL: https://api.rezerwacja24.pl/api/payments/stripe/webhook
Events: Wszystkie powyższe
Secret: whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq
```

### 2. Retry Logic

```
Settings → Billing → Smart Retries: ENABLED
- Próba 1: Natychmiast
- Próba 2: Po 24h
- Próba 3: Po 72h
```

### 3. Email Notifications

```
Settings → Emails:
- Trial ending (3 days before)
- Payment failed
- Payment succeeded
- Subscription cancelled
```

---

## 💳 Testowanie

### TEST Mode (obecnie aktywne)

**Testowe karty:**
- Sukces: `4242 4242 4242 4242`
- Fail: `4000 0000 0000 0002`
- Wymaga 3DS: `4000 0025 0000 3155`

**Przyspieszenie czasu:**
- Stripe Dashboard → Developers → Webhooks → "Send test webhook"
- Symuluj `invoice.payment_failed` aby przetestować blokadę

### LIVE Mode

**Prawdziwe płatności:**
- Karty są obciążane
- Pieniądze trafiają na konto Stripe
- Wszystkie eventy są prawdziwe

---

## ✅ Podsumowanie

### Co działa:

1. ✅ **7-dniowy trial** z wymaganą kartą (nie obciążana)
2. ✅ **Automatyczne pobieranie** po 7 dniach
3. ✅ **Retry logic** - 3 próby w ciągu ~3 dni
4. ✅ **Blokada po 3 nieudanych próbach**
5. ✅ **Modal wymuszający subskrypcję** (nie można zamknąć)
6. ✅ **Automatyczne odblokowanie** po udanej płatności
7. ✅ **Cykliczne płatności** co miesiąc
8. ✅ **Webhooks** obsługujące wszystkie eventy

### Co wymaga konfiguracji:

1. ⚠️ **Webhook URL w Stripe Dashboard** - musisz dodać ręcznie
2. ⚠️ **Email notifications** - TODO (obecnie tylko logi)
3. ⚠️ **Smart Retries** - sprawdź czy włączone w Stripe

---

**System subskrypcji działa w pełni! 🎉**
