# 🎯 Instrukcja wdrożenia systemu subskrypcji

## 📋 Przegląd

System subskrypcji z jednym planem cenowym:
- **Cena**: 79,99 zł/miesiąc
- **Okres próbny**: 7 dni
- **Wymagana karta**: TAK (przy rejestracji)
- **Dostęp**: Pełny dostęp do wszystkich funkcji

---

## 🔧 Krok 1: Konfiguracja Stripe

### 1.1 Utwórz produkt w Stripe Dashboard

1. Zaloguj się do [Stripe Dashboard](https://dashboard.stripe.com)
2. Przejdź do **Products** → **Add product**
3. Wypełnij dane:
   - **Name**: Rezerwacja24 Pro
   - **Description**: Pełny dostęp do platformy rezerwacji
   - **Pricing model**: Recurring
   - **Price**: 79.99 PLN
   - **Billing period**: Monthly
   - **Free trial**: 7 days
   - **Payment method**: Required at signup

4. Zapisz produkt i skopiuj:
   - **Product ID**: `prod_xxxxx`
   - **Price ID**: `price_xxxxx`

### 1.2 Skonfiguruj Webhooks

1. W Stripe Dashboard przejdź do **Developers** → **Webhooks**
2. Kliknij **Add endpoint**
3. Endpoint URL: `https://api.rezerwacja24.pl/billing/webhook`
4. Wybierz eventy:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`

5. Zapisz i skopiuj **Signing secret**: `whsec_xxxxx`

---

## 🗄️ Krok 2: Aktualizacja bazy danych

### 2.1 Zastosuj zmiany w schemacie Prisma

```bash
cd /root/CascadeProjects/rezerwacja24-saas/backend

# Wygeneruj Prisma Client
npx prisma generate

# Zastosuj zmiany bezpośrednio na produkcji (OSTROŻNIE!)
npx prisma db push
```

### 2.2 Utwórz plan subskrypcji w bazie

```bash
# Uruchom seed script
npx ts-node prisma/seed-subscription-plan.ts
```

Lub ręcznie w bazie danych:

```sql
INSERT INTO subscription_plans (
  id, name, slug, "priceMonthly", currency, 
  "stripePriceId", "stripeProductId", "trialDays", 
  "requiresPaymentMethod", features, "isActive", 
  "createdAt", "updatedAt"
) VALUES (
  'plan_pro_7999',
  'Plan Pro',
  'pro',
  79.99,
  'PLN',
  'price_xxxxx', -- Twój Price ID ze Stripe
  'prod_xxxxx',  -- Twój Product ID ze Stripe
  7,
  true,
  '{"bookings": -1, "employees": -1, "sms": 2000, "whatsapp": true, "ai": true, "analytics": true, "automations": true, "marketplace": true, "whiteLabel": true, "customDomain": true, "apiAccess": true, "prioritySupport": true}',
  true,
  NOW(),
  NOW()
);
```

---

## 🔐 Krok 3: Zmienne środowiskowe

Zaktualizuj plik `.env` w backendzie:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Product & Price IDs
STRIPE_PRODUCT_ID=prod_xxxxx
STRIPE_PRICE_ID=price_xxxxx

# Frontend URL (dla redirectów)
FRONTEND_URL=https://rezerwacja24.pl
```

---

## 🚀 Krok 4: Wdrożenie na produkcję

### 4.1 Backend

```bash
cd /root/CascadeProjects/rezerwacja24-saas/backend

# Zainstaluj zależności (jeśli potrzeba)
npm install

# Zbuduj aplikację
npm run build

# Uruchom ponownie serwer
pm2 restart rezerwacja24-backend
# lub
systemctl restart rezerwacja24-backend
```

### 4.2 Frontend

```bash
cd /root/CascadeProjects/rezerwacja24-saas/frontend

# Zainstaluj zależności (jeśli potrzeba)
npm install

# Zbuduj aplikację
npm run build

# Uruchom ponownie serwer
pm2 restart rezerwacja24-frontend
# lub
systemctl restart rezerwacja24-frontend
```

---

## 🧪 Krok 5: Testowanie

### 5.1 Test w trybie testowym Stripe

1. Użyj testowych kart Stripe:
   - **Sukces**: `4242 4242 4242 4242`
   - **Wymaga 3D Secure**: `4000 0025 0000 3155`
   - **Odrzucona**: `4000 0000 0000 9995`

2. Przetestuj flow:
   - Rejestracja nowej firmy
   - Przejście do `/dashboard/settings/subscription`
   - Kliknięcie "Rozpocznij 7-dniowy okres próbny"
   - Wypełnienie danych karty
   - Weryfikacja utworzenia subskrypcji

### 5.2 Test webhooków

```bash
# Zainstaluj Stripe CLI
stripe listen --forward-to localhost:4000/billing/webhook

# W innym terminalu, wywołaj test event
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

### 5.3 Sprawdź logi

```bash
# Backend logs
pm2 logs rezerwacja24-backend

# Szukaj:
# - "Utworzono checkout session"
# - "Otrzymano webhook Stripe"
# - "Utworzono subskrypcję dla tenant"
```

---

## 📊 Krok 6: Monitoring

### 6.1 Stripe Dashboard

Monitoruj:
- **Customers** - nowi klienci
- **Subscriptions** - aktywne subskrypcje
- **Payments** - płatności
- **Events** - webhooks

### 6.2 Baza danych

Sprawdź tabele:
```sql
-- Aktywne subskrypcje
SELECT COUNT(*) FROM subscriptions WHERE status = 'ACTIVE';

-- Okresy próbne
SELECT COUNT(*) FROM subscriptions WHERE status = 'TRIALING';

-- Zaległości
SELECT COUNT(*) FROM subscriptions WHERE status = 'PAST_DUE';

-- Przychód miesięczny (MRR)
SELECT SUM(sp."priceMonthly") as mrr
FROM subscriptions s
JOIN subscription_plans sp ON s."planId" = sp.id
WHERE s.status IN ('ACTIVE', 'TRIALING');
```

---

## 🔒 Krok 7: Zabezpieczenia

### 7.1 Weryfikacja webhooków

Webhook endpoint automatycznie weryfikuje sygnaturę Stripe. Upewnij się że:
- `STRIPE_WEBHOOK_SECRET` jest poprawny
- Endpoint jest dostępny tylko przez HTTPS
- Nie ma rate limitów blokujących Stripe

### 7.2 Ochrona endpointów

Dodaj `SubscriptionGuard` do chronionych endpointów:

```typescript
// W kontrolerze
import { UseGuards } from '@nestjs/common';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RequiresSubscription } from '../common/decorators/requires-subscription.decorator';

@Controller('bookings')
@UseGuards(SubscriptionGuard)
export class BookingsController {
  
  @Post()
  @RequiresSubscription() // Wymaga aktywnej subskrypcji
  async createBooking() {
    // ...
  }
}
```

---

## 📧 Krok 8: Powiadomienia email

### 8.1 Szablony email (TODO)

Utwórz szablony w SendGrid dla:
- Powitanie po rejestracji z informacją o okresie próbnym
- Przypomnienie 3 dni przed końcem okresu próbnego
- Potwierdzenie pierwszej płatności
- Nieudana płatność
- Anulowanie subskrypcji

### 8.2 Integracja w kodzie

W `stripe.service.ts` odkomentuj i zaimplementuj:
```typescript
// TODO: Wyślij email z przypomnieniem o końcu okresu próbnego
// TODO: Wyślij email z informacją o nieudanej płatności
```

---

## 🎨 Krok 9: UI/UX

### 9.1 Dodaj banner subskrypcji

W głównym layoutcie dashboardu:

```tsx
// app/dashboard/layout.tsx
import SubscriptionBanner from '@/components/SubscriptionBanner';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <SubscriptionBanner />
      {children}
    </div>
  );
}
```

### 9.2 Dodaj link w menu

```tsx
// W komponencie nawigacji
<Link href="/dashboard/settings/subscription">
  <CreditCard className="w-5 h-5" />
  Subskrypcja
</Link>
```

---

## 🐛 Troubleshooting

### Problem: Webhook nie działa

**Rozwiązanie:**
1. Sprawdź czy endpoint jest dostępny: `curl https://api.rezerwacja24.pl/billing/webhook`
2. Sprawdź logi Stripe Dashboard → Developers → Webhooks → [Twój endpoint] → Events
3. Zweryfikuj `STRIPE_WEBHOOK_SECRET`

### Problem: Checkout session nie przekierowuje

**Rozwiązanie:**
1. Sprawdź `FRONTEND_URL` w `.env`
2. Zweryfikuj `successUrl` i `cancelUrl` w `stripe.service.ts`

### Problem: Subskrypcja nie jest tworzona

**Rozwiązanie:**
1. Sprawdź czy webhook `customer.subscription.created` jest włączony
2. Sprawdź logi backendu: `pm2 logs rezerwacja24-backend`
3. Sprawdź czy `tenantId` i `planId` są w metadata subskrypcji

### Problem: Płatność odrzucona po okresie próbnym

**Rozwiązanie:**
1. Sprawdź czy karta jest ważna w Stripe Dashboard
2. Wyślij klientowi link do billing portal: `/dashboard/settings/subscription` → "Zarządzaj płatnościami"
3. Klient może zaktualizować kartę w portalu Stripe

---

## 📈 Metryki do śledzenia

1. **Conversion Rate**: % rejestracji → aktywna subskrypcja
2. **Trial Conversion**: % okresów próbnych → płatne subskrypcje
3. **Churn Rate**: % anulowanych subskrypcji miesięcznie
4. **MRR (Monthly Recurring Revenue)**: Miesięczny przychód z subskrypcji
5. **ARR (Annual Recurring Revenue)**: Roczny przychód z subskrypcji
6. **LTV (Lifetime Value)**: Średnia wartość klienta

---

## ✅ Checklist wdrożenia

- [ ] Produkt utworzony w Stripe
- [ ] Webhooks skonfigurowane
- [ ] Zmienne środowiskowe ustawione
- [ ] Schema Prisma zaktualizowana (`prisma db push`)
- [ ] Plan subskrypcji utworzony w bazie
- [ ] Backend wdrożony i uruchomiony
- [ ] Frontend wdrożony i uruchomiony
- [ ] Testowanie z testową kartą Stripe
- [ ] Webhooks przetestowane
- [ ] Monitoring włączony
- [ ] Email templates utworzone (opcjonalnie)
- [ ] Dokumentacja dla zespołu

---

## 🆘 Wsparcie

W razie problemów:
1. Sprawdź logi: `pm2 logs`
2. Sprawdź Stripe Dashboard → Events
3. Sprawdź bazę danych: `SELECT * FROM subscriptions ORDER BY "createdAt" DESC LIMIT 10;`
4. Kontakt z supportem Stripe: https://support.stripe.com

---

**Ostatnia aktualizacja**: 2024-12-10
**Wersja**: 1.0.0
