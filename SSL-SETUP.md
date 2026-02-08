# Konfiguracja SSL dla rezerwacja24.pl

## Certyfikat Wildcard

Projekt używa certyfikatu wildcard SSL, który obejmuje:
- `rezerwacja24.pl` (główna domena)
- `*.rezerwacja24.pl` (wszystkie subdomeny: app, api, samek, itp.)

## Automatyczna konfiguracja

```bash
cd /root/CascadeProjects/rezerwacja24-saas
chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh
```

## Ręczna konfiguracja (jeśli potrzebna)

### 1. Instalacja Certbot

```bash
apt-get update
apt-get install -y certbot python3-certbot-nginx
```

### 2. Generowanie certyfikatu wildcard

```bash
certbot certonly \
  --manual \
  --preferred-challenges dns \
  --email admin@rezerwacja24.pl \
  --agree-tos \
  -d rezerwacja24.pl \
  -d "*.rezerwacja24.pl"
```

**WAŻNE:** Podczas procesu certbot poprosi o dodanie rekordu TXT w DNS:
- Nazwa: `_acme-challenge.rezerwacja24.pl`
- Typ: `TXT`
- Wartość: (zostanie podana przez certbot)

### 3. Kopiowanie certyfikatów

```bash
mkdir -p /etc/nginx/ssl
cp /etc/letsencrypt/live/rezerwacja24.pl/fullchain.pem /etc/nginx/ssl/rezerwacja24.pl.crt
cp /etc/letsencrypt/live/rezerwacja24.pl/privkey.pem /etc/nginx/ssl/rezerwacja24.pl.key
chmod 644 /etc/nginx/ssl/rezerwacja24.pl.crt
chmod 600 /etc/nginx/ssl/rezerwacja24.pl.key
```

### 4. Restart nginx

```bash
systemctl reload nginx
```

## Automatyczne odnawianie

Certyfikat jest automatycznie odnawiany przez cron job:

```bash
# Sprawdź status
cat /etc/cron.d/certbot-renew

# Testuj odnawianie
certbot renew --dry-run
```

## Weryfikacja SSL

Sprawdź czy SSL działa poprawnie:

```bash
# Główna domena
curl -I https://rezerwacja24.pl

# Panel administracyjny
curl -I https://app.rezerwacja24.pl

# API
curl -I https://api.rezerwacja24.pl

# Subdomena firmy
curl -I https://samek.rezerwacja24.pl
```

## Troubleshooting

### Problem: Certyfikat nie działa dla subdomen

Sprawdź czy certyfikat zawiera wildcard:
```bash
openssl x509 -in /etc/nginx/ssl/rezerwacja24.pl.crt -text -noout | grep DNS
```

Powinno pokazać:
```
DNS:rezerwacja24.pl, DNS:*.rezerwacja24.pl
```

### Problem: Nginx nie startuje

Sprawdź logi:
```bash
journalctl -u nginx -n 50
nginx -t
```

### Problem: Certyfikat wygasł

Odnów ręcznie:
```bash
certbot renew
cp /etc/letsencrypt/live/rezerwacja24.pl/fullchain.pem /etc/nginx/ssl/rezerwacja24.pl.crt
cp /etc/letsencrypt/live/rezerwacja24.pl/privkey.pem /etc/nginx/ssl/rezerwacja24.pl.key
systemctl reload nginx
```

## Bezpieczeństwo

Konfiguracja nginx używa:
- TLS 1.2 i 1.3
- Silne szyfry (HIGH:!aNULL:!MD5)
- HTTP/2
- Automatyczne przekierowanie HTTP → HTTPS

Wszystkie subdomeny są automatycznie zabezpieczone tym samym certyfikatem wildcard.
