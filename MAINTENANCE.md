# Maintenance Guide - Rezerwacja24

## 🚀 Szybki Start

### Sprawdzenie Statusu
```bash
# Status wszystkich serwisów
pm2 status

# Logi backendu
pm2 logs rezerwacja24-backend --lines 50

# Logi frontendu
pm2 logs rezerwacja24-frontend --lines 50
```

### Restart Serwisów
```bash
# Restart backendu
cd /root/CascadeProjects/rezerwacja24-saas/backend
npm run build && pm2 restart rezerwacja24-backend

# Restart frontendu
cd /root/CascadeProjects/rezerwacja24-saas/frontend
npm run build && pm2 restart rezerwacja24-frontend

# Restart Nginx
sudo systemctl restart nginx
```

## 🧪 Testowanie

### Automatyczne Testy API
```bash
cd /root/CascadeProjects/rezerwacja24-saas
./test-api.sh
```

### Manualne Testy
```bash
# Test backendu
curl https://api.rezerwacja24.pl/api/tenants/1701364800000 | jq '.'

# Test frontendu
curl -I https://app.rezerwacja24.pl

# Test subdomeny
curl -I https://hubert-samek.rezerwacja24.pl
```

## 📝 Dodawanie Nowej Funkcjonalności

### Checklist
1. **Sprawdź Prisma Schema**
   ```bash
   cat /root/CascadeProjects/rezerwacja24-saas/backend/prisma/schema.prisma
   ```
   - Sprawdź dokładne nazwy tabel i relacji
   - Używaj lowercase z underscores

2. **Dodaj Backend Endpoint**
   - Dodaj controller w `/backend/src/[module]/[module].controller.ts`
   - Dodaj service w `/backend/src/[module]/[module].service.ts`
   - Użyj dokładnych nazw z Prisma schema

3. **Dodaj Frontend Types**
   - Dodaj interfejs w `/frontend/lib/api/[module].ts`
   - Użyj nazw z backendu (np. `service_categories` nie `category`)

4. **Mapuj Dane**
   - Backend może używać `name`, frontend `businessName`
   - Zawsze mapuj przy zapisie i odczycie

5. **Aktualizuj Stan**
   ```typescript
   const response = await fetch('/api/endpoint', {
     method: 'PATCH',
     body: JSON.stringify(data)
   })
   const updated = await response.json()
   setState(updated)  // WAŻNE!
   ```

6. **Testuj**
   ```bash
   # Wyczyść cache
   # Ctrl+Shift+Delete w przeglądarce
   
   # Sprawdź logi
   pm2 logs rezerwacja24-backend --lines 50
   
   # Uruchom testy
   ./test-api.sh
   ```

## 🔧 Częste Problemy

### Problem: "Property 'X' does not exist"
**Rozwiązanie:** Sprawdź nazwy w Prisma schema. Backend używa lowercase z underscores.
```bash
# Sprawdź schema
grep -A10 "model nazwa_tabeli" /root/CascadeProjects/rezerwacja24-saas/backend/prisma/schema.prisma
```

### Problem: Dane nie zapisują się
**Rozwiązanie:** 
1. Sprawdź czy endpoint istnieje
2. Sprawdź czy aktualizujesz stan po zapisie
3. Sprawdź logi backendu

### Problem: 404 na API
**Rozwiązanie:**
```bash
# Sprawdź czy backend działa
curl http://localhost:3001/api/tenants/1701364800000

# Sprawdź Nginx
sudo nginx -t
sudo systemctl status nginx

# Sprawdź upstream w nginx.conf
grep -A5 "upstream backend" /etc/nginx/nginx.conf
```

### Problem: Dane wracają do starych wartości
**Rozwiązanie:** Frontend nie aktualizuje stanu po zapisie do API.
```typescript
// BŁĄD:
updateLocalStorage(data)  // Tylko localStorage

// POPRAWNIE:
const response = await fetch('/api/endpoint', { ... })
const updated = await response.json()
setState(updated)  // Aktualizuj stan!
updateLocalStorage(updated)
```

## 📊 Monitoring

### Sprawdzanie Logów
```bash
# Backend - ostatnie błędy
pm2 logs rezerwacja24-backend --err --lines 50

# Frontend - ostatnie błędy  
pm2 logs rezerwacja24-frontend --err --lines 50

# Nginx - błędy
sudo tail -f /var/log/nginx/error.log

# Nginx - access log
sudo tail -f /var/log/nginx/access.log
```

### Sprawdzanie Bazy Danych
```bash
# Połącz się z bazą
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -d rezerwacja24

# Sprawdź tabele
\dt

# Sprawdź dane tenanta
SELECT id, name, subdomain, email FROM tenants;

# Sprawdź usługi
SELECT id, name, "categoryId" FROM services;

# Sprawdź relacje
SELECT * FROM service_employees;
```

## 🔄 Backup i Restore

### Backup Bazy Danych
```bash
# Backup
PGPASSWORD=rezerwacja24 pg_dump -h localhost -p 5433 -U rezerwacja24 rezerwacja24 > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 rezerwacja24 < backup_20251206_120000.sql
```

### Backup Plików
```bash
# Backup całego projektu
tar -czf rezerwacja24_backup_$(date +%Y%m%d).tar.gz /root/CascadeProjects/rezerwacja24-saas

# Backup tylko uploads (jeśli są)
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /root/CascadeProjects/rezerwacja24-saas/backend/uploads
```

## 🎯 Best Practices

### 1. Zawsze Sprawdzaj Prisma Schema
```bash
# Przed dodaniem nowej funkcjonalności
cat /root/CascadeProjects/rezerwacja24-saas/backend/prisma/schema.prisma | grep -A20 "model nazwa"
```

### 2. Używaj Dokładnych Nazw
```typescript
// ❌ BŁĄD
booking.customer.firstName

// ✅ POPRAWNIE
booking.customers.firstName
```

### 3. Testuj z Czystym Cache
- Ctrl+Shift+Delete przed każdym testem
- Sprawdź w trybie incognito

### 4. Dodawaj Logi
```typescript
// Backend
console.log('📝 Updating service:', id, data)

// Frontend
console.log('Saving data:', data)
console.log('Response:', response)
```

### 5. Aktualizuj Dokumentację
Po każdej zmianie aktualizuj:
- `API_DOCUMENTATION.md` - nowe endpointy
- `CHANGELOG.md` - co zostało zmienione
- `MAINTENANCE.md` - nowe procedury

## 📞 Pomoc

### Dokumentacja
- API: `/API_DOCUMENTATION.md`
- Changelog: `/CHANGELOG.md`
- Architecture: `/ARCHITECTURE.md`

### Przydatne Komendy
```bash
# Sprawdź wszystkie endpointy
pm2 logs rezerwacja24-backend --lines 100 | grep "Mapped"

# Sprawdź porty
netstat -tulpn | grep -E '3001|3002|5433'

# Sprawdź procesy
pm2 list

# Restart wszystkiego
pm2 restart all && sudo systemctl restart nginx
```

## 🚨 Emergency Procedures

### Backend Nie Działa
```bash
# 1. Sprawdź logi
pm2 logs rezerwacja24-backend --err --lines 50

# 2. Sprawdź czy port jest zajęty
netstat -tulpn | grep 3001

# 3. Restart
cd /root/CascadeProjects/rezerwacja24-saas/backend
npm run build && pm2 restart rezerwacja24-backend

# 4. Jeśli nadal nie działa, sprawdź bazę
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -d rezerwacja24 -c "SELECT 1"
```

### Frontend Nie Działa
```bash
# 1. Sprawdź logi
pm2 logs rezerwacja24-frontend --err --lines 50

# 2. Usuń cache i rebuild
cd /root/CascadeProjects/rezerwacja24-saas/frontend
rm -rf .next
npm run build && pm2 restart rezerwacja24-frontend
```

### Nginx Nie Działa
```bash
# 1. Test konfiguracji
sudo nginx -t

# 2. Sprawdź logi
sudo tail -f /var/log/nginx/error.log

# 3. Restart
sudo systemctl restart nginx
```

## 📈 Performance

### Optymalizacja
```bash
# Sprawdź rozmiar buildu
du -sh /root/CascadeProjects/rezerwacja24-saas/frontend/.next

# Sprawdź użycie pamięci
pm2 monit

# Sprawdź czas odpowiedzi API
time curl https://api.rezerwacja24.pl/api/services
```

### Monitoring
```bash
# CPU i RAM
htop

# Dysk
df -h

# Procesy PM2
pm2 monit
```


## 💾 Backupy

### Automatyczne Backupy
Backupy są wykonywane automatycznie 2x dziennie:
- **07:00** - Poranny backup
- **19:00** - Wieczorny backup

### Sprawdzenie Backupów
```bash
# Lista backupów
ls -lh /var/backups/rezerwacja24/database/

# Ostatni backup
ls -lt /var/backups/rezerwacja24/database/ | head -3

# Logi backupów
tail -f /var/log/rezerwacja24-backup.log
```

### Więcej Informacji
Zobacz pełną dokumentację: `BACKUP_GUIDE.md`

