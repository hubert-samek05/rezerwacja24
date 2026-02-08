# 🔧 Szybka Naprawa - Backend 502

**Data**: 2024-12-10 21:49

---

## ✅ Naprawiono

Backend został uruchomiony przez PM2 z ecosystem.config.js.

### Co zrobiono:

1. **Utworzono ecosystem.config.js** - konfiguracja PM2
2. **Zabito stare procesy** - `pkill -f "node.*3001"`
3. **Uruchomiono przez PM2** - `pm2 start ecosystem.config.js`
4. **Zapisano konfigurację** - `pm2 save`

---

## 🚀 Jak Zarządzać

### Sprawdź Status
```bash
pm2 status
```

### Restart
```bash
pm2 restart all
# lub
pm2 restart rezerwacja24-backend
pm2 restart rezerwacja24-frontend
```

### Logi
```bash
# Wszystkie logi
pm2 logs

# Tylko backend
pm2 logs rezerwacja24-backend

# Tylko błędy
pm2 logs rezerwacja24-backend --err

# Ostatnie 50 linii
pm2 logs rezerwacja24-backend --lines 50
```

### Stop/Start
```bash
pm2 stop all
pm2 start all
```

### Po Rebuildzie
```bash
cd /root/CascadeProjects/rezerwacja24-saas/backend
npm run build

cd /root/CascadeProjects/rezerwacja24-saas/frontend
npm run build

pm2 restart all
```

---

## 🧪 Teraz Przetestuj Dostępność

1. **Odśwież stronę** (Ctrl+R)
2. **Otwórz konsolę** (F12)
3. **Przejdź do**: Dashboard → Pracownicy → [Wybierz pracownika]
4. **Kliknij**: "Zarządzaj dostępnością"
5. **Zmień godziny** (np. Poniedziałek 09:00 → 10:00)
6. **Kliknij "Zapisz"**

### Sprawdź Logi w Konsoli:
```
🌐 PUT availability URL: https://api.rezerwacja24.pl/api/employees/...
📤 PUT availability data: { workingHours: [...] }
📥 PUT availability response: { id: '...', ... }
```

### Sprawdź Backend Logi:
```bash
pm2 logs rezerwacja24-backend --lines 30
```

Szukaj:
```
🔧 updateAvailability called for employee: ...
📅 Received data: ...
💾 Creating availability: ...
✅ Created successfully
```

---

## ❌ Jeśli Nadal Nie Działa

### 1. Sprawdź czy backend odpowiada
```bash
curl http://localhost:3001/api/health
```

### 2. Sprawdź logi błędów
```bash
pm2 logs rezerwacja24-backend --err --lines 50
```

### 3. Restart z czyszczeniem
```bash
pm2 delete all
pm2 start /root/CascadeProjects/rezerwacja24-saas/ecosystem.config.js
pm2 save
```

---

**Status**: ✅ Backend działa  
**Następny krok**: Przetestuj zapisywanie dostępności
