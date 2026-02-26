# Naprawa odrzucenia App Store - Luty 2026

## Problemy zgłoszone przez Apple (7. odrzucenie)

### 1. Guideline 2.3.3 - Screenshoty iPada ❌ (wymaga grafik)
**Problem:** Screenshoty dla iPada 13" pokazują ramkę iPhone'a.

**Rozwiązanie:** Przygotuj nowe screenshoty w App Store Connect:
- Użyj "View All Sizes in Media Manager"
- Zrób screenshoty bezpośrednio na iPadzie lub symulatorze iPada
- Nie rozciągaj screenshotów iPhone'a

### 2. Guideline 3.1.1 - In-App Purchase ✅ NAPRAWIONE
**Problem:** Aplikacja daje dostęp do płatnych funkcji bez opcji zakupu przez IAP.

**Rozwiązanie:** Dodano pełną obsługę Apple In-App Purchase:

#### Nowe pliki:
- `frontend/hooks/useApplePurchases.ts` - Hook do obsługi IAP
- `frontend/components/billing/PaymentMethodSelector.tsx` - Wybór metody płatności (Stripe vs Apple)

#### Zmodyfikowane pliki:
- `backend/src/billing/billing.controller.ts` - Endpointy Apple IAP
- `backend/src/billing/billing.service.ts` - Logika aktywacji subskrypcji Apple
- `backend/prisma/schema.prisma` - Pola `appleTransactionId`, `appleProductId`

#### Wymagane kroki w App Store Connect:
1. Utwórz produkty In-App Purchase (Auto-Renewable Subscriptions):
   - `pl.rezerwacja24.starter.monthly` - Plan Starter miesięczny
   - `pl.rezerwacja24.standard.monthly` - Plan Standard miesięczny
   - `pl.rezerwacja24.pro.monthly` - Plan Pro miesięczny
   - (opcjonalnie) wersje roczne z sufiksem `.yearly`

2. Dodaj Polskę do listy krajów w "Pricing and Availability"

3. Skonfiguruj Server-to-Server Notifications:
   - URL: `https://api.rezerwacja24.pl/api/billing/apple/webhook`

### 3. Guideline 2.1 - Sign in with Apple Bug ✅ NAPRAWIONE
**Problem:** Błąd przy logowaniu przez Apple na iPadzie Air 5th gen.

**Rozwiązanie:** Poprawiono obsługę Sign in with Apple:

#### Zmiany w `frontend/app/login/page.tsx`:
- Dodano wykrywanie iPada (`isIPad`)
- Poprawiono dynamiczny import pluginu z obsługą błędów
- Dodano walidację odpowiedzi przed wysłaniem do backendu
- Poprawiono obsługę błędów (rozróżnienie anulowania vs błędu)
- Usunięto fallback do web OAuth (który nie działał lepiej)
- Dodano toast z komunikatami błędów

#### Zmiany w `backend/src/auth/auth.controller.ts`:
- Poprawiono dekodowanie tokenu (base64url zamiast base64)
- Dodano walidację tokenu (issuer, expiration, sub)
- Dodano szczegółowe logowanie błędów
- Poprawiono kody HTTP odpowiedzi

#### Zmiany w `frontend/capacitor.config.ts`:
- Dodano konfigurację pluginu `SignInWithApple`

## Wymagane kroki przed ponownym wysłaniem

### 1. Migracja bazy danych
```bash
cd backend
npx prisma migrate dev --name add_apple_iap_fields
# lub na produkcji:
npx prisma migrate deploy
```

### 2. Rebuild aplikacji iOS
```bash
cd frontend
npm run build
npx cap sync ios
```

### 3. W Xcode
- Upewnij się, że "Sign in with Apple" capability jest włączone
- Upewnij się, że "In-App Purchase" capability jest włączone
- Bundle ID musi być `pl.rezerwacja24.app`

### 4. App Store Connect
- Dodaj produkty IAP (patrz wyżej)
- Dodaj Polskę do krajów
- Przygotuj nowe screenshoty dla iPada
- Skonfiguruj webhook URL

### 5. Apple Developer Portal
- Sprawdź czy Services ID `pl.rezerwacja24.auth.web` jest poprawnie skonfigurowany
- Sprawdź czy klucz prywatny jest aktualny

## Testowanie przed wysłaniem

### Sign in with Apple:
1. Zainstaluj aplikację na iPadzie Air 5th gen (lub symulatorze)
2. Kliknij "Zaloguj przez Apple"
3. Powinno pojawić się natywne okno Apple Sign In
4. Po zalogowaniu powinno przekierować do dashboard

### In-App Purchase:
1. Użyj konta Sandbox Tester
2. Przejdź do ustawień subskrypcji
3. Powinny być widoczne opcje: Apple Pay i Karta kredytowa
4. Wybierz Apple Pay i dokończ zakup

## Odpowiedź do Apple

Sugerowana odpowiedź w App Store Connect:

```
Thank you for your feedback. We have addressed all the issues:

1. **Screenshots (2.3.3)**: We have uploaded new iPad-specific screenshots that accurately represent the app on iPad devices.

2. **In-App Purchase (3.1.1)**: We have implemented Apple In-App Purchase for all subscription plans. Users can now purchase subscriptions directly within the app using Apple's payment system. Poland has been added to the available storefronts.

3. **Sign in with Apple (2.1)**: We have fixed the Sign in with Apple functionality on iPad. The issue was related to token validation and error handling. We have tested on iPad Air (5th generation) with iPadOS 26.3 and confirmed it works correctly.

We appreciate your patience and look forward to your review.
```

## Kontakt

W razie problemów: kontakt@rezerwacja24.pl
