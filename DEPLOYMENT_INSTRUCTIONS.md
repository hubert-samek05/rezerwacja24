# 🚀 Instrukcja Wdrożenia - Naprawa Stripe Webhooks

**Data**: 2024-12-17  
**Priorytet**: 🔴 KRYTYCZNY

---

## ✅ Co Już Zrobiłeś

- ✅ Zmieniłeś URL webhooka w Stripe Dashboard
- ✅ Skopiowałeś nowy webhook secret: `whsec_p6KuPNgPnxiQUTXBZeFPeeseNjfxbMQx`

---

## 📋 Co Teraz Musisz Zrobić

### KROK 1: Zaloguj się na Serwer

```bash
ssh user@api.rezerwacja24.pl
```

Zamień `user` na swoją nazwę użytkownika.

---

### KROK 2: Przejdź do Katalogu Projektu

```bash
cd /path/to/rezerwacja24-saas
```

**Nie wiesz gdzie jest projekt?** Sprawdź:
```bash
# Opcja 1: Znajdź przez PM2
pm2 list
pm2 info rezerwacja24-backend

# Opcja 2: Znajdź przez proces
ps aux | grep node | grep rezerwacja24

# Opcja 3: Typowe lokalizacje
ls -la /var/www/rezerwacja24-saas
ls -la /home/*/rezerwacja24-saas
ls -la /opt/rezerwacja24-saas
```

---

### KROK 3: Zaktualizuj Kod z Git

```bash
# Sprawdź aktualny branch
git branch

# Pobierz najnowsze zmiany
git fetch origin

# Jeśli jesteś na main/master
git pull origin main

# LUB jeśli jesteś na innym branchu
git pull origin <nazwa-brancha>
```

**WAŻNE**: Jeśli masz lokalne zmiany, git może pokazać błąd. W takim przypadku:
```bash
# Zapisz lokalne zmiany
git stash

# Pobierz zmiany
git pull origin main

# Przywróć lokalne zmiany (jeśli potrzebne)
git stash pop
```

---

### KROK 4: Zaktualizuj Webhook Secret w .env

```bash
# Przejdź do katalogu backendu
cd backend

# Edytuj plik .env
nano .env
```

W edytorze nano:

1. **Znajdź linię**:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_stary_klucz
   ```

2. **Zamień na**:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_p6KuPNgPnxiQUTXBZeFPeeseNjfxbMQx
   ```

3. **Zapisz plik**:
   - Naciśnij `Ctrl + O` (zapisz)
   - Naciśnij `Enter` (potwierdź)
   - Naciśnij `Ctrl + X` (wyjdź)

---

### KROK 5: Zainstaluj Zależności (jeśli są nowe)

```bash
# Upewnij się że jesteś w katalogu backend
cd /path/to/rezerwacja24-saas/backend

# Zainstaluj zależności
npm install
```

---

### KROK 6: Zbuduj Aplikację

```bash
# Zbuduj backend
npm run build
```

**Oczekiwany output**:
```
✓ Built in XXXms
```

**Jeśli są błędy**:
- Sprawdź logi
- Upewnij się że wszystkie zmienne w `.env` są ustawione
- Sprawdź czy `node_modules` są zainstalowane

---

### KROK 7: Restart Backendu

#### Opcja A: PM2 (najprawdopodobniej)

```bash
# Restart aplikacji
pm2 restart rezerwacja24-backend

# Sprawdź status
pm2 status

# Sprawdź logi
pm2 logs rezerwacja24-backend --lines 50
```

#### Opcja B: Systemd

```bash
sudo systemctl restart rezerwacja24-backend
sudo systemctl status rezerwacja24-backend
sudo journalctl -u rezerwacja24-backend -n 50 -f
```

#### Opcja C: Docker

```bash
docker-compose restart backend
docker-compose logs -f backend
```

---

### KROK 8: Sprawdź Czy Backend Działa

```bash
# Sprawdź health endpoint
curl https://api.rezerwacja24.pl/api/health

# Powinno zwrócić:
# {"status":"ok","timestamp":"...","uptime":...}
```

---

### KROK 9: Sprawdź Czy Webhook Endpoint Istnieje

```bash
# Sprawdź webhook endpoint
curl -X POST https://api.rezerwacja24.pl/api/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{}'

# Powinno zwrócić 400 lub 401 (nie 404!)
# 404 = endpoint nie istnieje (źle)
# 400/401 = endpoint istnieje ale brak danych (dobrze)
```

---

### KROK 10: Sprawdź Logi

```bash
# PM2
pm2 logs rezerwacja24-backend --lines 100

# Lub bezpośrednio
tail -f /path/to/logs/backend.log
```

**Szukaj**:
- ✅ "🚀 Rezerwacja24 API is running!"
- ✅ "API: http://localhost:4000/api"
- ❌ Błędy związane z Stripe

---

### KROK 11: Przetestuj Webhook w Stripe

1. Wróć do **Stripe Dashboard**
2. Przejdź do: **Developers → Webhooks**
3. Kliknij na swój webhook
4. Kliknij **"Send test webhook"**
5. Wybierz: **`customer.subscription.created`**
6. Kliknij **"Send test webhook"**

**Oczekiwany rezultat**:
- Status: **200 OK** ✅
- Response time: < 1s

---

### KROK 12: Sprawdź Logi Po Teście

```bash
pm2 logs rezerwacja24-backend --lines 20
```

**Powinno być**:
```
Otrzymano webhook Stripe: customer.subscription.created
Utworzono subskrypcję dla tenant xxx
```

---

## 🎯 Szybka Ściągawka (Wszystkie Komendy)

Jeśli znasz lokalizację projektu, możesz wykonać wszystko jedną sekwencją:

```bash
# 1. Zaloguj się
ssh user@api.rezerwacja24.pl

# 2. Przejdź do projektu
cd /path/to/rezerwacja24-saas

# 3. Pobierz zmiany
git pull origin main

# 4. Zaktualizuj .env
cd backend
nano .env
# Zmień STRIPE_WEBHOOK_SECRET na: whsec_p6KuPNgPnxiQUTXBZeFPeeseNjfxbMQx
# Zapisz: Ctrl+O, Enter, Ctrl+X

# 5. Zainstaluj i zbuduj
npm install
npm run build

# 6. Restart
pm2 restart rezerwacja24-backend

# 7. Sprawdź
pm2 logs rezerwacja24-backend --lines 50
curl https://api.rezerwacja24.pl/api/health
```

---

## 🚨 Rozwiązywanie Problemów

### Problem: git pull pokazuje konflikty

```bash
# Zapisz lokalne zmiany
git stash

# Pobierz zmiany
git pull origin main

# Jeśli potrzebujesz lokalnych zmian
git stash pop
```

---

### Problem: npm run build pokazuje błędy

```bash
# Usuń node_modules i package-lock.json
rm -rf node_modules package-lock.json

# Zainstaluj ponownie
npm install

# Spróbuj zbudować
npm run build
```

---

### Problem: pm2 restart nie działa

```bash
# Sprawdź czy PM2 działa
pm2 status

# Jeśli nie ma procesu, uruchom
pm2 start ecosystem.config.js

# Lub
pm2 start dist/main.js --name rezerwacja24-backend
```

---

### Problem: Webhook nadal zwraca 404

**Przyczyna**: Nowy kod nie jest wdrożony

**Rozwiązanie**:
1. Sprawdź czy `git pull` pobrał zmiany
2. Sprawdź czy `npm run build` się powiódł
3. Sprawdź czy PM2 zrestartował aplikację
4. Sprawdź logi: `pm2 logs rezerwacja24-backend`

---

### Problem: Webhook zwraca 401 Unauthorized

**Przyczyna**: Webhook secret jest nieprawidłowy

**Rozwiązanie**:
1. Sprawdź czy `.env` ma prawidłowy secret
2. Sprawdź czy nie ma spacji na końcu
3. Restart backendu
4. Spróbuj ponownie

---

## ✅ Checklist Wdrożenia

- [ ] Zalogowano na serwer
- [ ] Przeszedłem do katalogu projektu
- [ ] Wykonano `git pull`
- [ ] Zaktualizowano `.env` (webhook secret)
- [ ] Wykonano `npm install`
- [ ] Wykonano `npm run build` (sukces)
- [ ] Zrestartowano backend (PM2/systemd/docker)
- [ ] Sprawdzono logi (brak błędów)
- [ ] Sprawdzono health endpoint (200 OK)
- [ ] Przetestowano webhook w Stripe (200 OK)
- [ ] Sprawdzono logi po teście (webhook odebrany)

---

## 📞 Potrzebujesz Pomocy?

Jeśli coś nie działa, wyślij mi:

1. **Output z `pm2 logs`**:
   ```bash
   pm2 logs rezerwacja24-backend --lines 100 > logs.txt
   ```

2. **Output z `pm2 status`**:
   ```bash
   pm2 status
   ```

3. **Output z testu webhooka** (z Stripe Dashboard)

4. **Output z curl**:
   ```bash
   curl https://api.rezerwacja24.pl/api/health
   curl -I https://api.rezerwacja24.pl/api/billing/webhook
   ```

---

**Powodzenia! 🚀**
