# ✅ Webhook Stripe - SKONFIGUROWANY

**Data**: 2024-12-13 19:27  
**Status**: ✅ GOTOWE DO TESTOWANIA

---

## ✅ Co zostało zrobione:

### 1. **Webhook Secret Dodany**
```bash
STRIPE_WEBHOOK_SECRET=whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq
```
- ✅ Dodano do `/root/CascadeProjects/rezerwacja24-saas/backend/.env`
- ✅ Backend zrestartowany z nową konfiguracją

### 2. **Testowe Subskrypcje Usunięte**
```sql
DELETE FROM subscriptions WHERE stripeCustomerId LIKE 'temp_%';
-- Usunięto: 5 testowych subskrypcji

DELETE FROM subscriptions WHERE stripeCustomerId IS NULL;
-- Usunięto: 1 pustą subskrypcję

-- Aktualna liczba subskrypcji: 0 ✅
```

### 3. **Backend Endpoint Gotowy**
```
URL: https://api.rezerwacja24.pl/api/payments/stripe/webhook
Status: ✅ Online
```

---

## 🎯 Następne Kroki

### 1. **Przetestuj Pełny Flow**

**WAŻNE: Teraz musisz przejść przez PRAWDZIWY checkout!**

1. **Wyloguj się z aplikacji**
   ```
   https://app.rezerwacja24.pl
   ```

2. **Zaloguj się ponownie**
   - Lub zarejestruj nowe konto

3. **Kliknij "Rozpocznij 7-dniowy okres próbny"**

4. **Dodaj kartę w Stripe Checkout**
   - Testowa karta: `4242 4242 4242 4242`
   - Data: `12/25`
   - CVC: `123`
   - Kraj: Polska

5. **Sprawdź logi backendu**
   ```bash
   pm2 logs rezerwacja24-backend --lines 50 | grep "webhook\|subscription"
   ```
   
   **Powinieneś zobaczyć:**
   ```
   ✅ Otrzymano webhook Stripe: customer.subscription.created
   ✅ Subskrypcja TRIALING utworzona dla tenant: tenant-xxx
   ```

6. **Sprawdź bazę danych**
   ```bash
   PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c "SELECT id, status, \"stripeCustomerId\", \"stripeSubscriptionId\" FROM subscriptions ORDER BY \"createdAt\" DESC LIMIT 1;"
   ```
   
   **Powinieneś zobaczyć:**
   ```
   stripeCustomerId: cus_xxx  ✅ Prawdziwy Customer ID!
   stripeSubscriptionId: sub_xxx
   status: TRIALING
   ```

7. **Sprawdź w aplikacji**
   - Przejdź do: Dashboard → Ustawienia → Subskrypcja
   - **Powinieneś zobaczyć:**
     - ✅ Status: "Okres próbny"
     - ✅ Pozostało: 7 dni
     - ✅ Daty są prawidłowe (nie "Invalid Date")
     - ✅ Przycisk "Zarządzaj subskrypcją" działa

---

## 🔍 Weryfikacja Webhook w Stripe Dashboard

### Sprawdź czy webhook odbiera eventy:

1. **Wejdź na Stripe Dashboard**
   ```
   https://dashboard.stripe.com/webhooks
   ```

2. **Znajdź swój endpoint**
   ```
   URL: https://api.rezerwacja24.pl/api/payments/stripe/webhook
   ```

3. **Sprawdź "Recent deliveries"**
   - Po przejściu przez checkout powinieneś zobaczyć:
     - ✅ `customer.subscription.created` - Success
     - ✅ `checkout.session.completed` - Success

4. **Sprawdź Success Rate**
   - Powinno być: **100%**

---

## 🐛 Troubleshooting

### Jeśli webhook NIE działa:

#### 1. **Sprawdź logi backendu**
```bash
pm2 logs rezerwacja24-backend --lines 100 | grep -i "webhook\|error"
```

**Szukaj:**
- ❌ `Error: No signatures found matching the expected signature`
  - **Rozwiązanie**: Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest poprawny
  
- ❌ `Error: Webhook signature verification failed`
  - **Rozwiązanie**: Webhook secret w `.env` nie zgadza się z Stripe Dashboard

#### 2. **Sprawdź czy backend działa**
```bash
pm2 status
```

**Powinieneś zobaczyć:**
```
rezerwacja24-backend | online
```

#### 3. **Sprawdź czy endpoint jest dostępny**
```bash
curl -X POST https://api.rezerwacja24.pl/api/payments/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Jeśli zwraca 502 Bad Gateway:**
- Sprawdź nginx: `sudo nginx -t`
- Sprawdź czy backend nasłuchuje na porcie 3001: `netstat -tlnp | grep 3001`

#### 4. **Sprawdź Stripe Dashboard**

W Stripe Dashboard → Webhooks → Twój endpoint:

**Jeśli widzisz błędy:**
- Kliknij na event
- Sprawdź "Response"
- Sprawdź "Request body"

---

## 📊 Co się dzieje po webhook?

### Event: `customer.subscription.created`

**Stripe wysyła:**
```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_xxx",
      "customer": "cus_xxx",
      "status": "trialing",
      "trial_start": 1734120000,
      "trial_end": 1734724800,
      "metadata": {
        "tenantId": "tenant-xxx",
        "planId": "plan_pro_7999"
      }
    }
  }
}
```

**Backend robi:**
```javascript
1. Weryfikuje signature (webhook secret)
2. Parsuje event
3. Wywołuje handleSubscriptionCreated()
4. Zapisuje w bazie:
   - stripeCustomerId: cus_xxx
   - stripeSubscriptionId: sub_xxx
   - status: TRIALING
   - trialStart: dzisiaj
   - trialEnd: za 7 dni
5. Loguje: "✅ Subskrypcja TRIALING utworzona"
```

---

## 🎉 Sukces!

**Jeśli wszystko działa:**

1. ✅ Webhook odbiera eventy ze Stripe
2. ✅ Backend zapisuje subskrypcje w bazie
3. ✅ `stripeCustomerId` to prawdziwy `cus_xxx`
4. ✅ Billing portal działa
5. ✅ Daty są prawidłowe
6. ✅ Po 7 dniach Stripe automatycznie pobierze płatność
7. ✅ Webhook zaktualizuje status na ACTIVE

**System subskrypcji działa w pełni! 🚀**

---

## 📝 Notatki

### Webhook Secret
```
LIVE: whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq
TEST: whsec_2k3U7LrrxMrZqYWYOCVpJ1Ac7aPVpQjg
```

### Endpoint URL
```
https://api.rezerwacja24.pl/api/payments/stripe/webhook
```

### Eventy do nasłuchiwania
```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ customer.subscription.trial_will_end
✅ invoice.paid
✅ invoice.payment_failed
✅ payment_method.attached
```

---

**Gotowe do testowania! Przejdź przez checkout i sprawdź czy webhook działa! 🎯**
