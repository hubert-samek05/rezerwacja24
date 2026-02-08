# 🔐 Konfiguracja Google OAuth dla Rezerwacja24

## Krok 1: Utwórz Projekt w Google Cloud Console

1. **Przejdź do:** https://console.cloud.google.com/
2. **Zaloguj się** swoim kontem Google
3. **Kliknij** na dropdown z nazwą projektu (góra, obok "Google Cloud")
4. **Kliknij** "NEW PROJECT" (Nowy projekt)
5. **Wpisz nazwę:** `Rezerwacja24` (lub dowolną)
6. **Kliknij** "CREATE" (Utwórz)

## Krok 2: Włącz Google+ API

1. W menu bocznym kliknij **"APIs & Services"** → **"Library"**
2. W wyszukiwarce wpisz: `Google+ API`
3. Kliknij na **"Google+ API"**
4. Kliknij **"ENABLE"** (Włącz)

## Krok 3: Skonfiguruj OAuth Consent Screen

1. W menu bocznym: **"APIs & Services"** → **"OAuth consent screen"**
2. Wybierz **"External"** (jeśli nie masz Google Workspace)
3. Kliknij **"CREATE"**

### Wypełnij formularz:

**App information:**
- **App name:** `Rezerwacja24`
- **User support email:** `twoj-email@gmail.com`
- **App logo:** (opcjonalnie - możesz pominąć)

**App domain:**
- **Application home page:** `https://rezerwacja24.pl`
- **Application privacy policy link:** `https://rezerwacja24.pl/privacy`
- **Application terms of service link:** `https://rezerwacja24.pl/terms`

**Authorized domains:**
- Kliknij **"ADD DOMAIN"**
- Wpisz: `rezerwacja24.pl`

**Developer contact information:**
- **Email addresses:** `twoj-email@gmail.com`

4. Kliknij **"SAVE AND CONTINUE"**

### Scopes (Zakresy):
5. Kliknij **"ADD OR REMOVE SCOPES"**
6. Zaznacz:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
7. Kliknij **"UPDATE"**
8. Kliknij **"SAVE AND CONTINUE"**

### Test users (opcjonalnie):
9. Możesz dodać testowych użytkowników lub pominąć
10. Kliknij **"SAVE AND CONTINUE"**
11. Kliknij **"BACK TO DASHBOARD"**

## Krok 4: Utwórz OAuth 2.0 Client ID

1. W menu bocznym: **"APIs & Services"** → **"Credentials"**
2. Kliknij **"+ CREATE CREDENTIALS"** (na górze)
3. Wybierz **"OAuth client ID"**

### Konfiguracja:

**Application type:**
- Wybierz: **"Web application"**

**Name:**
- Wpisz: `Rezerwacja24 Web Client`

**Authorized JavaScript origins:**
- Kliknij **"+ ADD URI"**
- Dodaj: `https://rezerwacja24.pl`
- Kliknij **"+ ADD URI"**
- Dodaj: `https://api.rezerwacja24.pl`
- Kliknij **"+ ADD URI"** (dla developmentu)
- Dodaj: `http://localhost:3000`

**Authorized redirect URIs:**
- Kliknij **"+ ADD URI"**
- Dodaj: `https://api.rezerwacja24.pl/api/auth/google/callback`
- Kliknij **"+ ADD URI"** (dla developmentu)
- Dodaj: `http://localhost:3001/api/auth/google/callback`

4. Kliknij **"CREATE"**

## Krok 5: Skopiuj Credentials

Po utworzeniu zobaczysz popup z credentials:

```
Your Client ID
1234567890-abcdefghijklmnop.apps.googleusercontent.com

Your Client Secret
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

**WAŻNE:** Skopiuj te wartości - będą potrzebne w następnym kroku!

---

## Krok 6: Dodaj Credentials do Serwera

### Połącz się z serwerem:
```bash
ssh root@your-server-ip
```

### Edytuj plik .env:
```bash
cd /root/CascadeProjects/rezerwacja24-saas/backend
nano .env
```

### Dodaj/zaktualizuj te linie:
```env
# Google OAuth
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=https://api.rezerwacja24.pl/api/auth/google/callback

# Frontend URL
FRONTEND_URL=https://rezerwacja24.pl
```

**Zapisz:** Ctrl + O, Enter, Ctrl + X

---

## Krok 7: Zrestartuj Backend

```bash
cd /root/CascadeProjects/rezerwacja24-saas/backend

# Zabij stary proces
pkill -f "node dist"

# Uruchom nowy
nohup node dist/src/main.js > /var/log/rezerwacja24-backend.log 2>&1 &

# Sprawdź logi
tail -f /var/log/rezerwacja24-backend.log
```

Poczekaj aż zobaczysz:
```
[Nest] ... LOG [NestApplication] Nest application successfully started
```

Naciśnij **Ctrl + C** aby wyjść z logów.

---

## Krok 8: Testowanie

### Test 1: Sprawdź endpoint
```bash
curl -I https://api.rezerwacja24.pl/api/auth/google
```

Powinno przekierować (302) do Google.

### Test 2: Otwórz w przeglądarce
1. Otwórz: https://rezerwacja24.pl/login
2. Kliknij **"Zaloguj przez Google"**
3. Wybierz konto Google
4. Zaakceptuj uprawnienia
5. Powinno przekierować do `/dashboard`

---

## ✅ Gotowe!

Logowanie przez Google działa! 🎉

---

## 🐛 Troubleshooting

### Problem: "Error 400: redirect_uri_mismatch"
**Rozwiązanie:** Sprawdź czy w Google Cloud Console masz dokładnie:
- `https://api.rezerwacja24.pl/api/auth/google/callback`

### Problem: "Access blocked: This app's request is invalid"
**Rozwiązanie:** Upewnij się że:
1. OAuth Consent Screen jest skonfigurowany
2. Dodałeś domenę `rezerwacja24.pl` do Authorized domains

### Problem: Backend nie startuje
**Rozwiązanie:** Sprawdź logi:
```bash
tail -50 /var/log/rezerwacja24-backend.log
```

### Problem: Przekierowuje ale nie loguje
**Rozwiązanie:** Sprawdź czy endpoint `/api/users/me` działa:
```bash
curl https://api.rezerwacja24.pl/api/users/me
```

---

## 📝 Notatki

- **Client ID i Secret** trzymaj w tajemnicy!
- **Nigdy** nie commituj pliku `.env` do git
- W trybie development możesz dodać testowych użytkowników w Google Cloud Console
- Po publikacji aplikacji możesz przejść z "Testing" na "In production" w OAuth consent screen

---

**Powodzenia!** 🚀
