# ⚠️ WAŻNE: Konfiguracja Webhook Stripe

**Status**: ❌ WEBHOOK NIE JEST SKONFIGUROWANY  
**Priorytet**: 🔴 KRYTYCZNY

---

## 🚨 Problem

Obecnie w bazie danych są **TESTOWE subskrypcje** utworzone ręcznie, które **NIE DZIAŁAJĄ** z prawdziwym Stripe:

```sql
SELECT * FROM subscriptions LIMIT 1;

stripeCustomerId: "temp_tenant-1765404786118-490i0tznt"  ❌ BŁĄD!
                  ^^^^^^^^^^ To nie jest prawdziwy Stripe Customer ID!
```

**Prawdziwy Stripe Customer ID** powinien wyglądać tak:
```
stripeCustomerId: "cus_RabcXYZ123..."  ✅ OK
```

---

## 💥 Konsekwencje

### 1. **Billing Portal NIE DZIAŁA**
```
Error: Błąd podczas tworzenia sesji portalu
Reason: Subskrypcja nie jest połączona ze Stripe
```

Użytkownik nie może:
- ❌ Zarządzać metodą płatności
- ❌ Anulować subskrypcji
- ❌ Pobrać faktur
- ❌ Zaktualizować danych karty

### 2. **Daty są nieprawidłowe**
```
Rozpoczęcie okresu: Invalid Date
Koniec okresu: Invalid Date
```

### 3. **Płatności NIE BĘDĄ DZIAŁAĆ**
- ❌ Stripe nie pobierze płatności po 7 dniach
- ❌ Brak webhooków o statusie płatności
- ❌ Brak automatycznego odnawiania

---

## ✅ Rozwiązanie

### Krok 1: Skonfiguruj Webhook w Stripe Dashboard

**MUSISZ to zrobić ręcznie!**

1. **Wejdź na Stripe Dashboard**
   ```
   https://dashboard.stripe.com/webhooks
   ```

2. **Przełącz na LIVE MODE**
   - Przełącznik w lewym górnym rogu
   - Upewnij się że widzisz "Viewing live data"

3. **Kliknij "Add endpoint"**

4. **Wpisz URL**
   ```
   https://api.rezerwacja24.pl/api/payments/stripe/webhook
   ```

5. **Wybierz eventy do nasłuchiwania**
   
   Zaznacz następujące eventy:
   
   ✅ **checkout.session.completed**
   - Gdy użytkownik zakończy checkout
   
   ✅ **customer.subscription.created**
   - Gdy subskrypcja zostanie utworzona (TRIAL START)
   
   ✅ **customer.subscription.updated**
   - Gdy subskrypcja zostanie zaktualizowana
   
   ✅ **customer.subscription.deleted**
   - Gdy subskrypcja zostanie usunięta
   
   ✅ **customer.subscription.trial_will_end**
   - 3 dni przed końcem trial
   
   ✅ **invoice.paid**
   - Gdy płatność się powiedzie
   
   ✅ **invoice.payment_failed**
   - Gdy płatność się nie powiedzie
   
   ✅ **payment_method.attached**
   - Gdy karta zostanie dodana

6. **Kliknij "Add endpoint"**

7. **Skopiuj Signing Secret**
   
   Po utworzeniu endpointu zobaczysz:
   ```
   Signing secret: whsec_xxxxxxxxxxxxxxxxxxxxx
   ```
   
   **SKOPIUJ TEN KLUCZ!**

8. **Dodaj do pliku .env**
   
   ```bash
   # W pliku: /root/CascadeProjects/rezerwacja24-saas/backend/.env
   
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

9. **Restart backendu**
   ```bash
   pm2 restart rezerwacja24-backend
   ```

---

### Krok 2: Usuń Testowe Subskrypcje

**Po skonfigurowaniu webhooka:**

```sql
-- Usuń wszystkie testowe subskrypcje
DELETE FROM subscriptions 
WHERE "stripeCustomerId" LIKE 'temp_%';

-- Sprawdź czy usunięto
SELECT COUNT(*) FROM subscriptions;
-- Powinno zwrócić: 0
```

---

### Krok 3: Przetestuj Flow

1. **Zaloguj się jako nowy użytkownik**
   - Lub wyloguj się i zaloguj ponownie

2. **Kliknij "Rozpocznij 7-dniowy okres próbny"**

3. **Dodaj kartę w Stripe Checkout**
   - Testowa karta: `4242 4242 4242 4242`
   - Data: dowolna przyszła
   - CVC: dowolny 3-cyfrowy

4. **Sprawdź czy webhook został odebrany**
   ```bash
   pm2 logs rezerwacja24-backend --lines 50 | grep "webhook\|subscription"
   ```
   
   Powinieneś zobaczyć:
   ```
   ✅ Otrzymano webhook Stripe: customer.subscription.created
   ✅ Subskrypcja TRIALING utworzona dla tenant: tenant-xxx
   ```

5. **Sprawdź bazę danych**
   ```sql
   SELECT 
     "stripeCustomerId",
     "stripeSubscriptionId",
     status,
     "trialEnd"
   FROM subscriptions 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```
   
   Powinno zwrócić:
   ```
   stripeCustomerId: cus_xxx  ✅ Prawdziwy Customer ID!
   stripeSubscriptionId: sub_xxx
   status: TRIALING
   trialEnd: 2024-12-20 19:00:00
   ```

6. **Sprawdź w aplikacji**
   - Przejdź do: Dashboard → Ustawienia → Subskrypcja
   - Powinieneś zobaczyć:
     - ✅ Status: "Okres próbny"
     - ✅ Pozostało: 7 dni
     - ✅ Daty są prawidłowe
     - ✅ Przycisk "Zarządzaj subskrypcją" działa

---

## 🔍 Weryfikacja Webhook

### Sprawdź czy webhook działa:

1. **W Stripe Dashboard**
   ```
   https://dashboard.stripe.com/webhooks
   ```
   
   Kliknij na swój endpoint i sprawdź:
   - ✅ Status: "Enabled"
   - ✅ Recent deliveries: Lista eventów
   - ✅ Success rate: 100%

2. **Wyślij test webhook**
   
   W Stripe Dashboard:
   - Kliknij "Send test webhook"
   - Wybierz event: `customer.subscription.created`
   - Kliknij "Send test webhook"
   
   Sprawdź logi:
   ```bash
   pm2 logs rezerwacja24-backend --lines 20
   ```
   
   Powinieneś zobaczyć:
   ```
   ✅ Otrzymano webhook Stripe: customer.subscription.created
   ```

---

## 📊 Co się dzieje po skonfigurowaniu webhook?

### Flow z webhookiem:

```
1. Użytkownik klika "Rozpocznij trial"
   ↓
2. Backend tworzy Checkout Session
   ↓
3. Użytkownik dodaje kartę w Stripe
   ↓
4. Stripe tworzy Subscription
   ↓
5. 🎯 WEBHOOK → Backend odbiera event
   ↓
6. Backend zapisuje w bazie:
   - stripeCustomerId: cus_xxx  ✅
   - stripeSubscriptionId: sub_xxx
   - status: TRIALING
   - trialEnd: za 7 dni
   ↓
7. Użytkownik ma pełny dostęp
   ↓
8. Po 7 dniach: Stripe automatycznie pobiera płatność
   ↓
9. 🎯 WEBHOOK → Backend aktualizuje status: ACTIVE
```

### Flow BEZ webhooka (obecny):

```
1. Użytkownik klika "Rozpocznij trial"
   ↓
2. Backend tworzy Checkout Session
   ↓
3. Użytkownik dodaje kartę w Stripe
   ↓
4. Stripe tworzy Subscription
   ↓
5. ❌ BRAK WEBHOOKA - Backend nie wie o subskrypcji!
   ↓
6. Testowa subskrypcja w bazie (ręczna):
   - stripeCustomerId: temp_xxx  ❌ BŁĄD!
   - Billing portal nie działa
   - Daty nieprawidłowe
   ↓
7. Po 7 dniach: Stripe pobiera płatność
   ↓
8. ❌ BRAK WEBHOOKA - Backend nie wie o płatności!
   ↓
9. Użytkownik ma dostęp ale system nie działa poprawnie
```

---

## ⚡ Szybka Naprawa (Tymczasowa)

Jeśli nie możesz teraz skonfigurować webhooka, możesz **ręcznie zaktualizować** subskrypcję w bazie:

```sql
-- 1. Znajdź Customer ID w Stripe Dashboard
-- https://dashboard.stripe.com/customers
-- Skopiuj ID klienta (zaczyna się od cus_)

-- 2. Znajdź Subscription ID w Stripe Dashboard
-- https://dashboard.stripe.com/subscriptions
-- Skopiuj ID subskrypcji (zaczyna się od sub_)

-- 3. Zaktualizuj w bazie
UPDATE subscriptions
SET 
  "stripeCustomerId" = 'cus_PRAWDZIWY_ID',
  "stripeSubscriptionId" = 'sub_PRAWDZIWY_ID',
  "currentPeriodStart" = NOW(),
  "currentPeriodEnd" = NOW() + INTERVAL '37 days',
  "trialStart" = NOW(),
  "trialEnd" = NOW() + INTERVAL '7 days'
WHERE "tenantId" = 'TWOJ_TENANT_ID';
```

**⚠️ To jest tylko tymczasowe rozwiązanie!** Webhook jest KONIECZNY dla pełnej funkcjonalności!

---

## ✅ Checklist

Przed uruchomieniem produkcyjnym:

- [ ] Webhook skonfigurowany w Stripe Dashboard
- [ ] Signing secret dodany do `.env`
- [ ] Backend zrestartowany
- [ ] Testowe subskrypcje usunięte z bazy
- [ ] Przetestowany pełny flow checkout
- [ ] Sprawdzone logi - webhook odbierany
- [ ] Sprawdzona baza - prawdziwe Customer ID
- [ ] Billing portal działa
- [ ] Daty wyświetlają się poprawnie

---

**BEZ WEBHOOKA SYSTEM NIE BĘDZIE DZIAŁAŁ POPRAWNIE!** 🚨
