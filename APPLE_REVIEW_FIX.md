# Apple App Store Review - Naprawa odrzucenia

**Data:** 10 Lutego 2026  
**Submission ID:** 31b21dcb-359c-4d21-8b63-f3618d1e3a59

---

## ✅ Status napraw

| Problem | Status | Rozwiązanie |
|---------|--------|-------------|
| 5.1.2 - App Tracking Transparency | ⏳ Do zrobienia w App Store Connect | Usuń "tracking" z deklaracji prywatności |
| 2.1 - Konto demo nie działa | ✅ Naprawione | Konto naprawione w bazie danych |
| 2.1 - Model biznesowy | ✅ Gotowa odpowiedź | Skopiuj odpowiedź poniżej |
| 4.8 - Sign in with Apple | ✅ Zaimplementowane | Kod dodany, wymaga konfiguracji Apple Developer |

---

## 1. Guideline 5.1.2 - App Tracking Transparency

### Co zrobić w App Store Connect:

1. Zaloguj się do [App Store Connect](https://appstoreconnect.apple.com)
2. Przejdź do: **My Apps** → **Rezerwacja24** → **App Privacy**
3. Kliknij **Edit** przy sekcji "Data Used to Track You"
4. **Usuń** "Other Diagnostic Data" z listy
5. Zapisz zmiany

**Uwaga:** Aplikacja NIE śledzi użytkowników w celach reklamowych, więc ta deklaracja była błędna.

---

## 2. Guideline 2.1 - Konto demo

### ✅ NAPRAWIONE

Konto demo zostało naprawione w bazie danych:

```
Email: apple-review@rezerwacja24.pl
Password: AppleReview2024!
```

**Co zostało naprawione:**
- Zmieniono rolę z `CUSTOMER` na `TENANT_OWNER`
- Przypisano tenant "Demo Salon Beauty"
- Dodano aktywną subskrypcję Premium
- Konto ma pełny dostęp do wszystkich funkcji

---

## 3. Guideline 2.1 - Model biznesowy

### Gotowa odpowiedź do skopiowania (po angielsku):

```
Thank you for your questions about our business model. Here are the answers:

1. **Who are the users that will use the paid content in the app?**
   Business owners (salon owners, spa managers, fitness instructors, medical practitioners) who manage their appointment scheduling and client bookings.

2. **Where can users purchase the content that can be accessed in the app?**
   Users purchase subscriptions through our website at https://rezerwacja24.pl/subscription/checkout. Payment is processed via Stripe. The mobile app is used to manage their existing subscription and business operations.

3. **What specific types of previously purchased content can a user access in the app?**
   - Calendar and appointment management
   - Client database and history
   - Service and employee management
   - Business analytics and reports
   - SMS notifications settings
   - Online booking page management

4. **What paid content, subscriptions, or features are unlocked within your app that do not use in-app purchase?**
   All subscription purchases are made through our website (https://rezerwacja24.pl), not within the iOS app. The app is a companion tool for existing subscribers to manage their business. This is a B2B SaaS application similar to Calendly, Acuity Scheduling, or Square Appointments.

5. **How do users obtain an account? Do users have to pay a fee to create an account?**
   Users can create a free account with a 7-day trial period. After the trial, they must subscribe to continue using the service. Account creation and subscription management happens on our website. The iOS app requires an existing account to log in.

This is a "reader" app model where users consume content/services purchased outside the app, similar to Netflix, Spotify, or other B2B SaaS tools.
```

---

## 4. Guideline 4.8 - Sign in with Apple

### ✅ Kod zaimplementowany

Dodano:
- `/backend/src/auth/strategies/apple.strategy.ts` - strategia Passport
- `/backend/src/auth/auth.service.ts` - metoda `appleLogin()`
- `/backend/src/auth/auth.controller.ts` - endpointy `/api/auth/apple` i `/api/auth/apple/callback`
- `/frontend/app/login/page.tsx` - przycisk "Zaloguj przez Apple"
- `/frontend/ios/App/App/App.entitlements` - uprawnienie Sign in with Apple

### Konfiguracja w Apple Developer Portal:

1. **Zaloguj się do [Apple Developer](https://developer.apple.com)**

2. **Włącz Sign in with Apple dla App ID:**
   - Certificates, Identifiers & Profiles → Identifiers
   - Wybierz App ID aplikacji
   - Zaznacz "Sign in with Apple" → Configure
   - Zapisz

3. **Utwórz Service ID (dla web):**
   - Identifiers → + → Services IDs
   - Description: `Rezerwacja24 Web Auth`
   - Identifier: `pl.rezerwacja24.auth` (lub podobny)
   - Włącz "Sign in with Apple"
   - Configure:
     - Primary App ID: wybierz główną aplikację
     - Domains: `api.rezerwacja24.pl`
     - Return URLs: `https://api.rezerwacja24.pl/api/auth/apple/callback`

4. **Utwórz Key dla Sign in with Apple:**
   - Keys → + → Sign in with Apple
   - Pobierz plik `.p8` (zapisz bezpiecznie!)
   - Zanotuj Key ID

5. **Dodaj zmienne środowiskowe do backendu:**

```env
# Apple Sign In
APPLE_CLIENT_ID=pl.rezerwacja24.auth
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...zawartość pliku .p8...\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=https://api.rezerwacja24.pl/api/auth/apple/callback
```

6. **Zainstaluj pakiet passport-apple:**

```bash
cd backend
npm install passport-apple
npm install --save-dev @types/passport-apple
```

7. **Zaktualizuj auth.module.ts** (dodaj AppleStrategy do providers)

8. **Przebuduj i wdróż aplikację**

---

## Checklist przed ponownym wysłaniem

- [ ] Zaktualizuj App Privacy w App Store Connect (usuń tracking)
- [ ] Zweryfikuj że konto demo działa (zaloguj się przez aplikację)
- [ ] Odpowiedz na pytania o model biznesowy w App Store Connect
- [ ] Skonfiguruj Sign in with Apple w Apple Developer Portal
- [ ] Dodaj zmienne środowiskowe do produkcji
- [ ] Zainstaluj passport-apple
- [ ] Przebuduj backend i frontend
- [ ] Zaktualizuj screenshoty w App Store Connect (pokaż przycisk Apple)
- [ ] W Review Notes napisz: "Sign in with Apple is available on the login screen as an alternative to Google Sign-In"

---

## Kontakt

W razie pytań od Apple Review, odpowiedz w App Store Connect.

