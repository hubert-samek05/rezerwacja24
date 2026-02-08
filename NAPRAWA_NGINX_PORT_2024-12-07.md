# Naprawa Portów Nginx - 2024-12-07

## Problem
Pliki statyczne Next.js (CSS, JS) nie ładowały się na `app.rezerwacja24.pl` i domenie głównej:
```
GET https://app.rezerwacja24.pl/_next/static/css/daae5e84ec29a95b.css [HTTP/2 404]
GET https://app.rezerwacja24.pl/_next/static/chunks/webpack-14e2952ece5e842c.js [HTTP/2 404]
GET https://app.rezerwacja24.pl/_next/static/chunks/app/layout-25f1790b4d7d9041.js [HTTP/2 404]
```

## Przyczyna
Konfiguracja Nginx przekierowywała ruch na **port 3002**, podczas gdy kontener Docker z frontendem działał na **porcie 3000**.

### Szczegóły
- Kontener `rezerwacja24-frontend` nasłuchuje na porcie `3000`
- Konfiguracja Nginx w `/etc/nginx/sites-enabled/app.rezerwacja24.pl.conf` używała `proxy_pass http://localhost:3002`
- Konfiguracja Nginx w `/etc/nginx/sites-enabled/rezerwacja24-main.conf` również używała portu `3002`
- Subdomeny firm już prawidłowo używały portu `3000`

## Rozwiązanie

### 1. Zaktualizowano port w konfiguracji app.rezerwacja24.pl
```bash
sed -i 's/localhost:3002/localhost:3000/g' /etc/nginx/sites-enabled/app.rezerwacja24.pl.conf
```

Zmieniono wszystkie wystąpienia:
- `/_next/static/` → `proxy_pass http://localhost:3000`
- `/_next/image` → `proxy_pass http://localhost:3000`
- `/_next/webpack-hmr` → `proxy_pass http://localhost:3000`
- `/public/` → `proxy_pass http://localhost:3000`
- `/` → `proxy_pass http://localhost:3000`

### 2. Zaktualizowano port w konfiguracji domeny głównej
```bash
sed -i 's/localhost:3002/localhost:3000/g' /etc/nginx/sites-enabled/rezerwacja24-main.conf
```

### 3. Zrestartowano Nginx
```bash
nginx -t  # Test konfiguracji
systemctl reload nginx  # Przeładowanie bez przerwy w działaniu
```

## Weryfikacja

### Test plików statycznych
```bash
# CSS
curl -I https://app.rezerwacja24.pl/_next/static/css/6617afe15ab214f2.css
# Odpowiedź: HTTP/2 200 ✅

# JavaScript
curl -I https://app.rezerwacja24.pl/_next/static/chunks/webpack-cf9d320832ac64e1.js
# Odpowiedź: HTTP/2 200 ✅
```

### Struktura plików w kontenerze
```bash
docker exec rezerwacja24-frontend ls -la /app/.next/static/css/
# 6617afe15ab214f2.css ✅

docker exec rezerwacja24-frontend ls -la /app/.next/static/chunks/
# webpack-cf9d320832ac64e1.js ✅
# Wszystkie wymagane pliki obecne
```

## Status
✅ **NAPRAWIONE** - Wszystkie pliki statyczne ładują się poprawnie

## Wpływ
- Dashboard `app.rezerwacja24.pl` działa poprawnie
- Strona główna `rezerwacja24.pl` działa poprawnie
- Style CSS są ładowane
- Skrypty JavaScript działają
- Brak błędów 404 dla plików statycznych

## Pliki zmodyfikowane
1. `/etc/nginx/sites-enabled/app.rezerwacja24.pl.conf` - zmiana portu z 3002 na 3000
2. `/etc/nginx/sites-enabled/rezerwacja24-main.conf` - zmiana portu z 3002 na 3000

## Konfiguracja portów (aktualna)
- **Frontend (Next.js)**: Port 3000 (kontener Docker)
- **Backend (NestJS)**: Port 3001 (via api.rezerwacja24.pl)
- **PostgreSQL**: Port 5434
- **Redis**: Port 6379

## Następne kroki
Brak - system działa poprawnie.
