# ✅ Stripe LIVE Mode - Włączony

**Data**: 2024-12-13 18:11  
**Status**: ✅ PRODUKCJA

---

## 🎯 Konfiguracja LIVE

### Frontend
```
NEXT_PUBLIC_API_URL=https://api.rezerwacja24.pl
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SJs80G1gOZznL0iNygHcXQfqqA1TbPhMpDZoEvBe9XyOIscEdNHDAHIAGisw9pxU2ZrKi3D97JvktXwiXyO4l0800xhBVBfvA
```

### Backend
```
STRIPE_MODE=live
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_LIVE}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY_LIVE}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET_LIVE}
STRIPE_PRICE_ID=price_1ScucgG1gOZznL0iT9QfumRR
```

### Database
```sql
subscription_plans:
  id: plan_pro_7999
  name: Plan Pro
  stripePriceId: price_1ScucgG1gOZznL0iT9QfumRR
  stripeProductId: prod_Ta4mMEWepkV5Us
  isActive: true
```

---

## 🔑 Klucze Stripe

### LIVE Keys (Produkcja)
- **Secret Key**: `sk_live_51SJs80G1gOZznL0i...`
- **Publishable Key**: `pk_live_51SJs80G1gOZznL0i...`
- **Webhook Secret**: `whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq`
- **Product ID**: `prod_Ta4mMEWepkV5Us`
- **Price ID**: `price_1ScucgG1gOZznL0iT9QfumRR`

### TEST Keys (Development)
- **Secret Key**: `sk_test_51SJs80G1gOZznL0i...`
- **Publishable Key**: `pk_test_51SJs80G1gOZznL0i...`
- **Webhook Secret**: `whsec_2k3U7LrrxMrZqYWYOCVpJ1Ac7aPVpQjg`
- **Price ID**: `price_1ScumaG1gOZznL0ievl9tdCE`

---

## 📋 Plan Subskrypcji

**Nazwa**: Plan Pro  
**Cena**: 79.99 PLN / miesiąc  
**Trial**: 7 dni  
**Wymagana karta**: Tak (nie obciążana podczas trial)

---

## 🚀 Deployment

### 1. Frontend
```bash
cd /root/CascadeProjects/rezerwacja24-saas/frontend
npm run build
pm2 restart rezerwacja24-frontend
```

### 2. Backend
```bash
cd /root/CascadeProjects/rezerwacja24-saas/backend
npm run build
pm2 restart rezerwacja24-backend --update-env
```

---

## ✅ Weryfikacja

### Sprawdź czy LIVE mode działa:
```bash
# 1. Sprawdź logi backendu
pm2 logs rezerwacja24-backend --lines 50

# 2. Sprawdź czy Stripe używa LIVE keys
curl https://api.rezerwacja24.pl/api/billing/subscription/status \
  -H "Cookie: token=YOUR_TOKEN"

# 3. Sprawdź w Stripe Dashboard (https://dashboard.stripe.com)
# - Przełącz na "View live data"
# - Sprawdź czy nowe subskrypcje pojawiają się w LIVE mode
```

---

## ⚠️ WAŻNE

### Płatności są PRAWDZIWE!
- ✅ Karty będą obciążane po zakończeniu trial
- ✅ Wszystkie transakcje są rzeczywiste
- ✅ Pieniądze trafiają na konto Stripe

### Webhook
- URL: `https://api.rezerwacja24.pl/api/payments/stripe/webhook`
- Secret: `whsec_r8Xx1AGq4rr5KRwTrgONK9iw3Ylxegjq`
- Events: `customer.subscription.*`, `invoice.*`, `payment_method.attached`

### Testowanie
- Użyj testowych kart Stripe: https://stripe.com/docs/testing
- Lub przełącz na TEST mode w `.env`

---

## 🔄 Przełączanie między TEST a LIVE

### Przełącz na TEST:
```bash
# Backend
sed -i 's/STRIPE_MODE=live/STRIPE_MODE=test/' /root/CascadeProjects/rezerwacja24-saas/backend/.env
sed -i 's/STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY_LIVE}/STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_TEST}/' /root/CascadeProjects/rezerwacja24-saas/backend/.env
sed -i 's/STRIPE_PUBLISHABLE_KEY=\${STRIPE_PUBLISHABLE_KEY_LIVE}/STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY_TEST}/' /root/CascadeProjects/rezerwacja24-saas/backend/.env
sed -i 's/STRIPE_WEBHOOK_SECRET=\${STRIPE_WEBHOOK_SECRET_LIVE}/STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET_TEST}/' /root/CascadeProjects/rezerwacja24-saas/backend/.env

# Frontend
sed -i 's/pk_live_/pk_test_/' /root/CascadeProjects/rezerwacja24-saas/frontend/.env.local

# Rebuild & Restart
cd /root/CascadeProjects/rezerwacja24-saas/frontend && npm run build
cd /root/CascadeProjects/rezerwacja24-saas/backend && npm run build
pm2 restart all --update-env
```

### Przełącz na LIVE:
```bash
# Backend
sed -i 's/STRIPE_MODE=test/STRIPE_MODE=live/' /root/CascadeProjects/rezerwacja24-saas/backend/.env
sed -i 's/STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY_TEST}/STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_LIVE}/' /root/CascadeProjects/rezerwacja24-saas/backend/.env
sed -i 's/STRIPE_PUBLISHABLE_KEY=\${STRIPE_PUBLISHABLE_KEY_TEST}/STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY_LIVE}/' /root/CascadeProjects/rezerwacja24-saas/backend/.env
sed -i 's/STRIPE_WEBHOOK_SECRET=\${STRIPE_WEBHOOK_SECRET_TEST}/STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET_LIVE}/' /root/CascadeProjects/rezerwacja24-saas/backend/.env

# Frontend
sed -i 's/pk_test_/pk_live_/' /root/CascadeProjects/rezerwacja24-saas/frontend/.env.local

# Rebuild & Restart
cd /root/CascadeProjects/rezerwacja24-saas/frontend && npm run build
cd /root/CascadeProjects/rezerwacja24-saas/backend && npm run build
pm2 restart all --update-env
```

---

## 📊 Status

✅ **LIVE MODE WŁĄCZONY**  
✅ Frontend używa LIVE Publishable Key  
✅ Backend używa LIVE Secret Key  
✅ Database ma LIVE Price ID  
✅ Wszystkie serwisy zrestartowane  

**System subskrypcji działa w trybie produkcyjnym!** 🚀
