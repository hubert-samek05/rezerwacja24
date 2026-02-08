# ⚡ Stripe Subskrypcje - Szybki Start

**Status**: ✅ GOTOWE DO WDROŻENIA  
**Data**: 2024-12-13

---

## 🎯 Co Zostało Zrobione

Zaimplementowano **kompletny system subskrypcji** z następującymi funkcjami:

✅ **Checkout po rejestracji** - automatyczne przekierowanie do formularza płatności  
✅ **7-dniowy trial** - wymagana karta, ale bez pobierania opłat  
✅ **Embedded Stripe** - wszystko na naszej stronie (bez przekierowań)  
✅ **Zarządzanie subskrypcją** - anulowanie, wznawianie, zmiana karty  
✅ **Historia płatności** - faktury PDF  
✅ **Trial countdown** - banner z pozostałymi dniami  
✅ **Automatyczne odnowienie** - po trial automatyczna płatność  
✅ **Obsługa błędów** - retry logic i blokada konta  

---

## 📁 Nowe Pliki

### Frontend
```
/frontend/components/StripeCheckoutForm.tsx          - Formularz płatności
/frontend/components/TrialCountdownBanner.tsx        - Banner z pozostałymi dniami
/frontend/components/settings/PaymentMethodManager.tsx - Zarządzanie kartami
/frontend/app/subscription/checkout/page.tsx         - Strona checkout
```

### Zaktualizowane Pliki
```
/frontend/app/register/page.tsx                      - Przekierowanie do checkout
/frontend/app/dashboard/page.tsx                     - Wyświetlanie bannera
/frontend/components/settings/SubscriptionTab.tsx    - Zarządzanie subskrypcją
/backend/src/billing/stripe.service.ts               - Logika Stripe
/backend/src/billing/billing.controller.ts           - API endpoints
```

### Dokumentacja
```
STRIPE_SUBSCRIPTION_IMPLEMENTATION.md                - Pełna dokumentacja
STRIPE_TESTING_GUIDE.md                              - Przewodnik testowania
STRIPE_QUICK_START.md                                - Ten plik
```

---

## 🚀 Jak Wdrożyć (3 Kroki)

### 1. Przełącz na LIVE Mode

**Backend** (`/backend/.env`):
```bash
STRIPE_SECRET_KEY=sk_live_51SJs80G1gOZznL0i... # Twój LIVE key
STRIPE_WEBHOOK_SECRET=whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq # LIVE webhook
STRIPE_PUBLISHABLE_KEY=pk_live_51SJs80G1gOZznL0i... # Twój LIVE key
```

**Frontend** (`/frontend/.env.local`):
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SJs80G1gOZznL0i... # Twój LIVE key
```

### 2. Utwórz Produkt w Stripe LIVE

1. Stripe Dashboard → Products → Add product
2. Name: "Plan Pro - Rezerwacja24"
3. Price: 79.99 PLN / miesiąc
4. Skopiuj **Price ID** (np. `price_1ABC...`)
5. Zaktualizuj w bazie:
```sql
UPDATE subscription_plans 
SET stripePriceId = 'price_1ABC...' 
WHERE slug = 'pro';
```

### 3. Skonfiguruj Webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://api.rezerwacja24.pl/api/billing/webhook`
3. Wybierz eventy:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`
4. Skopiuj **Webhook Secret** i dodaj do `.env`

---

## 🧪 Jak Przetestować (Przed Wdrożeniem)

### Test 1: Rejestracja
```
1. Otwórz /register
2. Utwórz konto
3. Sprawdź czy przekierowuje do /subscription/checkout
4. Wprowadź kartę: 4242 4242 4242 4242
5. Sprawdź czy przekierowuje do /dashboard
6. Sprawdź czy wyświetla się banner z trial
```

### Test 2: Zarządzanie
```
1. Przejdź do /dashboard/settings/subscription
2. Sprawdź status subskrypcji
3. Kliknij "Zarządzaj płatnościami"
4. Dodaj/usuń kartę w Stripe Portal
5. Anuluj subskrypcję
6. Wznów subskrypcję
```

### Test 3: Webhooks
```
1. Stripe Dashboard → Webhooks → Send test webhook
2. Wybierz "customer.subscription.created"
3. Sprawdź logi: pm2 logs rezerwacja24-backend
4. Powinno być: "Otrzymano webhook Stripe: customer.subscription.created"
```

**Więcej testów**: Zobacz `STRIPE_TESTING_GUIDE.md`

---

## ⚠️ WAŻNE - Przed Wdrożeniem

### ✅ Checklist

**Stripe Dashboard**:
- [ ] Utwórz produkt w LIVE mode
- [ ] Skonfiguruj webhooks w LIVE mode
- [ ] Skonfiguruj Billing Portal
- [ ] Włącz smart retries

**Backend**:
- [ ] Zmień klucze na LIVE
- [ ] Zaktualizuj Price ID w bazie
- [ ] Zweryfikuj URL webhooka

**Frontend**:
- [ ] Zmień klucz na LIVE
- [ ] Przetestuj flow rejestracji
- [ ] Przetestuj checkout

**Testy**:
- [ ] Test rejestracji i checkout
- [ ] Test trial countdown
- [ ] Test zarządzania subskrypcją
- [ ] Test webhooków

---

## 🔄 Flow Użytkownika

```
REJESTRACJA
    ↓
CHECKOUT (dodanie karty)
    ↓
DASHBOARD (banner: "Pozostało 7 dni")
    ↓
OKRES PRÓBNY (7 dni - pełny dostęp)
    ↓
KONIEC TRIAL
    ↓
AUTOMATYCZNA PŁATNOŚĆ (79.99 PLN)
    ↓
AKTYWNA SUBSKRYPCJA (30 dni)
    ↓
AUTOMATYCZNE ODNOWIENIE
```

---

## 📊 Kluczowe Funkcje

### 1. Trial Countdown Banner
- Wyświetla się na dashboardzie
- Pokazuje pozostałe dni
- Zmienia kolor (niebieski → żółty → pomarańczowy → czerwony)
- Progress bar wizualizujący postęp

### 2. Zarządzanie Subskrypcją
- Status subskrypcji (Trial / Aktywna / Anulowana)
- Daty okresu rozliczeniowego
- Anulowanie/wznawianie
- Zarządzanie kartami (Stripe Portal)
- Historia faktur z PDF

### 3. Automatyczne Odnowienie
- Po zakończeniu trial automatyczna płatność
- Jeśli sukces → subskrypcja aktywna
- Jeśli błąd → retry (3 próby) → blokada konta

### 4. Obsługa Błędów
- Nieudana płatność → retry co 6h
- Po 3 próbach → blokada konta
- Udana płatność → odblokowanie

---

## 🐛 Najczęstsze Problemy

### Webhook nie działa
```bash
# Sprawdź logi
pm2 logs rezerwacja24-backend

# Sprawdź endpoint
curl https://api.rezerwacja24.pl/api/billing/webhook

# Sprawdź webhook secret w .env
```

### Trial banner nie wyświetla się
```bash
# Sprawdź status subskrypcji
curl https://api.rezerwacja24.pl/api/billing/subscription/status

# Sprawdź console w przeglądarce
```

### Nie można dodać karty
```bash
# Sprawdź czy klucz Stripe jest poprawny
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Sprawdź console w przeglądarce
```

---

## 📞 Wsparcie

**Dokumentacja**:
- `STRIPE_SUBSCRIPTION_IMPLEMENTATION.md` - Pełna dokumentacja
- `STRIPE_TESTING_GUIDE.md` - Przewodnik testowania
- Stripe Docs: https://stripe.com/docs

**Logi**:
```bash
# Backend
pm2 logs rezerwacja24-backend

# Frontend
pm2 logs rezerwacja24-frontend

# Stripe Dashboard
https://dashboard.stripe.com/logs
```

---

## 🎉 Gotowe!

System jest w pełni zaimplementowany i gotowy do wdrożenia.

**PAMIĘTAJ**: Przetestuj wszystko w TEST mode przed wdrożeniem na produkcję!

---

**Następny krok**: Przeczytaj `STRIPE_SUBSCRIPTION_IMPLEMENTATION.md` dla pełnych szczegółów.

**Powodzenia! 🚀**
