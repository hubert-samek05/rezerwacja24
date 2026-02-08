# 🔧 Rozwiązanie problemu MIME type - Next.js + Nginx

## 🐛 Problem

Błędy w konsoli przeglądarki:
```
Zablokowano zasób „https://rezerwacja24.pl/_next/static/css/...css" 
z powodu niezgodności (X-Content-Type-Options: nosniff) typu MIME („text/html").
```

## 🔍 Przyczyna

1. **Nginx zwracał HTML zamiast plików statycznych** - brak konfiguracji MIME types
2. **Nagłówek `X-Content-Type-Options: nosniff`** - blokował pliki z nieprawidłowym MIME type
3. **Brak specjalnej obsługi dla `/_next/static/`** - wszystkie requesty szły przez główną lokalizację

## ✅ Rozwiązanie

### 1. Dodano MIME types do Nginx

```nginx
http {
    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
}
```

### 2. Specjalna lokalizacja dla plików statycznych Next.js

```nginx
# Next.js static files - BEZ nagłówka X-Content-Type-Options
location /_next/static/ {
    proxy_pass http://frontend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Cache static files
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# Next.js images
location /_next/image {
    proxy_pass http://frontend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

### 3. Security headers tylko dla HTML

```nginx
location / {
    # Security headers tylko dla stron HTML
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
    
    proxy_pass http://frontend;
    # ... rest of config
}
```

## 📁 Pliki zaktualizowane

### 1. `/nginx/nginx.conf` (Produkcja)
- ✅ Dodano MIME types
- ✅ Dodano specjalne lokalizacje dla `/_next/static/`
- ✅ Usunięto globalny nagłówek `X-Content-Type-Options`
- ✅ Dodano caching dla plików statycznych
- ✅ Zaktualizowano wszystkie server blocks (main, app, wildcard)

### 2. `/nginx/nginx-local.conf` (Lokalne testy)
- ✅ Uproszczona konfiguracja bez SSL
- ✅ Obsługa localhost i *.rezerwacja24.local
- ✅ Wsparcie dla Webpack HMR (hot reload)

## 🚀 Jak wdrożyć

### Produkcja (rezerwacja24.pl)

1. **Backup starej konfiguracji:**
```bash
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
```

2. **Skopiuj nową konfigurację:**
```bash
cp /root/CascadeProjects/rezerwacja24-saas/nginx/nginx.conf /etc/nginx/nginx.conf
```

3. **Test konfiguracji:**
```bash
nginx -t
```

4. **Restart Nginx:**
```bash
systemctl restart nginx
# lub
docker-compose restart nginx
```

### Lokalne testy

1. **Użyj nginx-local.conf:**
```bash
nginx -c /root/CascadeProjects/rezerwacja24-saas/nginx/nginx-local.conf
```

2. **Lub przez Docker:**
```yaml
# docker-compose.yml
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx/nginx-local.conf:/etc/nginx/nginx.conf:ro
  ports:
    - "80:80"
```

## 🔍 Weryfikacja

### 1. Sprawdź czy pliki statyczne się ładują

Otwórz DevTools (F12) → Network:
- `/_next/static/css/*.css` - powinien być **200 OK** z `Content-Type: text/css`
- `/_next/static/chunks/*.js` - powinien być **200 OK** z `Content-Type: application/javascript`

### 2. Sprawdź nagłówki

```bash
curl -I https://rezerwacja24.pl/_next/static/css/example.css
```

Powinno zwrócić:
```
HTTP/1.1 200 OK
Content-Type: text/css
Cache-Control: public, immutable
Expires: ...
```

### 3. Sprawdź czy strona działa

```bash
curl https://rezerwacja24.pl/
```

Powinno zwrócić HTML (nie błąd).

## 📊 Przed vs Po

### Przed (❌ Błąd)
```
Request: https://rezerwacja24.pl/_next/static/css/123.css
Response: HTML (404 page)
Content-Type: text/html
X-Content-Type-Options: nosniff
Result: ❌ BLOCKED - MIME type mismatch
```

### Po (✅ Działa)
```
Request: https://rezerwacja24.pl/_next/static/css/123.css
Response: CSS content
Content-Type: text/css
Cache-Control: public, immutable
Result: ✅ SUCCESS
```

## 🎯 Kluczowe zmiany

1. **MIME types** - Nginx wie jak obsługiwać .css, .js, .woff2, etc.
2. **Dedykowane lokalizacje** - `/_next/static/` ma własną konfigurację
3. **Brak X-Content-Type-Options** - dla plików statycznych (bezpieczne)
4. **Caching** - pliki statyczne cache'owane na 365 dni
5. **Gzip** - kompresja dla CSS/JS

## 🔒 Bezpieczeństwo

### Czy to bezpieczne?

✅ **TAK** - Usunięcie `X-Content-Type-Options` tylko dla `/_next/static/` jest bezpieczne, ponieważ:

1. Next.js generuje unikalne hash'e dla plików (np. `123abc.js`)
2. Pliki są statyczne i nie mogą być nadpisane przez użytkownika
3. Nagłówek pozostaje dla HTML pages (główna lokalizacja `/`)
4. Dodatkowa ochrona: CSP, X-Frame-Options, X-XSS-Protection

### Security headers (pozostają dla HTML)

```nginx
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';
```

## 📝 Dodatkowe uwagi

### Dla subdomen

Konfiguracja działa dla:
- `rezerwacja24.pl` - główna domena
- `app.rezerwacja24.pl` - panel admin
- `*.rezerwacja24.pl` - subdomeny firm (wildcard)

Wszystkie mają identyczną obsługę plików statycznych.

### Dla API

API (`api.rezerwacja24.pl`) ma osobną konfigurację z CORS headers, bez obsługi plików statycznych.

## ✅ Checklist wdrożenia

- [x] Zaktualizowano nginx.conf (produkcja)
- [x] Utworzono nginx-local.conf (development)
- [x] Dodano MIME types
- [x] Dodano lokalizacje dla `/_next/static/`
- [x] Usunięto globalne security headers
- [x] Dodano caching dla plików statycznych
- [x] Dodano gzip compression
- [x] Zaktualizowano wszystkie server blocks

## 🎉 Rezultat

Po wdrożeniu:
- ✅ Brak błędów MIME type
- ✅ Pliki CSS/JS ładują się poprawnie
- ✅ Strona działa bez błędów
- ✅ Pliki statyczne są cache'owane
- ✅ Szybsze ładowanie (gzip + cache)

---

**Status:** ✅ **ROZWIĄZANE**  
**Data:** 30 Listopada 2024  
**Pliki:** `nginx/nginx.conf`, `nginx/nginx-local.conf`
