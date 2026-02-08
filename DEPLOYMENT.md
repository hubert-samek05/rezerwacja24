# 🚀 Instrukcja Wdrożenia Rezerwacja24 na rezerwacja24.pl

## 📋 Wymagania Wstępne

### Infrastruktura
- ✅ Serwer z Docker i Docker Compose
- ✅ Domena: **rezerwacja24.pl** z konfiguracją DNS
- ✅ Certyfikat SSL (Let's Encrypt lub własny)
- ✅ PostgreSQL 15+ (może być w Docker)
- ✅ Redis 7+ (może być w Docker)

### Konta i Klucze API
- ✅ Stripe Account (payments)
- ✅ Twilio Account (SMS/WhatsApp)
- ✅ SendGrid Account (Email)
- ✅ OpenAI API Key (AI features)
- ✅ Google Cloud Console (OAuth + Calendar API)
- ✅ Microsoft Azure (OAuth + Outlook API)

---

## 🌐 Konfiguracja DNS

### Wymagane rekordy DNS dla rezerwacja24.pl:

```dns
# Główna domena
rezerwacja24.pl.          A      YOUR_SERVER_IP
www.rezerwacja24.pl.      CNAME  rezerwacja24.pl.

# Subdomena API
api.rezerwacja24.pl.      CNAME  rezerwacja24.pl.

# Subdomena Admin
app.rezerwacja24.pl.      CNAME  rezerwacja24.pl.

# Wildcard dla tenant subdomains
*.rezerwacja24.pl.        CNAME  rezerwacja24.pl.
```

### Weryfikacja DNS
```bash
# Sprawdź czy DNS propagował się
dig rezerwacja24.pl
dig api.rezerwacja24.pl
dig app.rezerwacja24.pl
dig firma123.rezerwacja24.pl
```

---

## 🔐 Certyfikat SSL (Let's Encrypt)

### Instalacja Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Generowanie certyfikatu wildcard
```bash
sudo certbot certonly --manual --preferred-challenges=dns \
  -d rezerwacja24.pl \
  -d *.rezerwacja24.pl \
  --email admin@rezerwacja24.pl \
  --agree-tos
```

Certbot poprosi o dodanie rekordu TXT w DNS:
```dns
_acme-challenge.rezerwacja24.pl.  TXT  "GENERATED_TOKEN"
```

Po weryfikacji certyfikaty będą w:
```
/etc/letsencrypt/live/rezerwacja24.pl/fullchain.pem
/etc/letsencrypt/live/rezerwacja24.pl/privkey.pem
```

### Auto-renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Dodaj do crontab (auto-renewal co 12h)
sudo crontab -e
0 */12 * * * certbot renew --quiet --post-hook "docker-compose restart nginx"
```

---

## 📦 Przygotowanie Serwera

### 1. Instalacja Docker
```bash
# Usuń stare wersje
sudo apt remove docker docker-engine docker.io containerd runc

# Instalacja Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Dodaj użytkownika do grupy docker
sudo usermod -aG docker $USER

# Instalacja Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Weryfikacja
docker --version
docker-compose --version
```

### 2. Klonowanie Projektu
```bash
cd /var/www
sudo git clone https://github.com/your-org/rezerwacja24-saas.git
cd rezerwacja24-saas
```

### 3. Konfiguracja Zmiennych Środowiskowych

#### Backend (.env)
```bash
cd backend
cp .env.example .env
nano .env
```

```env
# Database
DATABASE_URL="postgresql://postgres:STRONG_PASSWORD@postgres:5432/rezerwacja24?schema=public"

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# JWT
JWT_SECRET=GENERATE_STRONG_SECRET_KEY_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=GENERATE_ANOTHER_STRONG_SECRET
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://api.rezerwacja24.pl/auth/google/callback

MICROSOFT_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET=YOUR_MICROSOFT_CLIENT_SECRET
MICROSOFT_CALLBACK_URL=https://api.rezerwacja24.pl/auth/microsoft/callback

# Stripe
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+48123456789
TWILIO_WHATSAPP_NUMBER=whatsapp:+48123456789

# SendGrid (Email)
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=noreply@rezerwacja24.pl
SENDGRID_FROM_NAME=Rezerwacja24

# OpenAI
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-4-turbo-preview

# AWS S3 (opcjonalnie)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_S3_BUCKET=rezerwacja24-uploads
AWS_REGION=eu-central-1

# App
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://rezerwacja24.pl
API_URL=https://api.rezerwacja24.pl

# CORS
CORS_ORIGINS=https://rezerwacja24.pl,https://*.rezerwacja24.pl

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

#### Frontend (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.rezerwacja24.pl
NEXT_PUBLIC_APP_URL=https://rezerwacja24.pl
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
```

### 4. Konfiguracja Nginx SSL

```bash
cd ../nginx
mkdir -p ssl

# Skopiuj certyfikaty Let's Encrypt
sudo cp /etc/letsencrypt/live/rezerwacja24.pl/fullchain.pem ssl/rezerwacja24.pl.crt
sudo cp /etc/letsencrypt/live/rezerwacja24.pl/privkey.pem ssl/rezerwacja24.pl.key
sudo chmod 644 ssl/rezerwacja24.pl.crt
sudo chmod 600 ssl/rezerwacja24.pl.key
```

---

## 🚀 Deployment

### 1. Build i Start Kontenerów
```bash
cd /var/www/rezerwacja24-saas

# Build obrazów
docker-compose build

# Start wszystkich serwisów
docker-compose up -d

# Sprawdź status
docker-compose ps
```

### 2. Inicjalizacja Bazy Danych
```bash
# Wejdź do kontenera backend
docker-compose exec backend sh

# Uruchom migracje
npx prisma migrate deploy

# Wygeneruj Prisma Client
npx prisma generate

# (Opcjonalnie) Zaseeduj przykładowe dane
npm run prisma:seed

# Wyjdź z kontenera
exit
```

### 3. Weryfikacja Deploymentu
```bash
# Sprawdź logi
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Test API
curl https://api.rezerwacja24.pl/health

# Test Frontend
curl https://rezerwacja24.pl

# Test subdomeny
curl https://app.rezerwacja24.pl
```

---

## 🔧 Konfiguracja Stripe Webhooks

### 1. Dodaj Webhook Endpoint w Stripe Dashboard
```
URL: https://api.rezerwacja24.pl/billing/webhook
Events to send:
  - checkout.session.completed
  - invoice.paid
  - invoice.payment_failed
  - customer.subscription.updated
  - customer.subscription.deleted
```

### 2. Skopiuj Webhook Secret
Dodaj do `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### 3. Restart Backend
```bash
docker-compose restart backend
```

---

## 📧 Konfiguracja SendGrid

### 1. Weryfikacja Domeny
W SendGrid Dashboard:
- Settings → Sender Authentication
- Authenticate Your Domain
- Dodaj rekordy DNS dla rezerwacja24.pl

### 2. Wymagane rekordy DNS
```dns
em1234.rezerwacja24.pl.     CNAME  u1234567.wl123.sendgrid.net.
s1._domainkey.rezerwacja24.pl.  CNAME  s1.domainkey.u1234567.wl123.sendgrid.net.
s2._domainkey.rezerwacja24.pl.  CNAME  s2.domainkey.u1234567.wl123.sendgrid.net.
```

---

## 📱 Konfiguracja Twilio

### 1. Kup numer telefonu
- Twilio Console → Phone Numbers → Buy a Number
- Wybierz numer polski (+48)

### 2. Konfiguruj WhatsApp
- Messaging → Try it out → Try WhatsApp
- Połącz numer z WhatsApp Business API

### 3. Dodaj Webhook dla SMS
```
Webhook URL: https://api.rezerwacja24.pl/notifications/sms/status
Method: POST
```

---

## 🔄 Automatyczne Backupy

### 1. Backup Bazy Danych
```bash
# Utwórz skrypt backup
sudo nano /usr/local/bin/backup-rezerwacja24.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/rezerwacja24"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U postgres rezerwacja24 | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup Redis
docker-compose exec -T redis redis-cli SAVE
docker cp rezerwacja24-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Usuń backupy starsze niż 30 dni
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /usr/local/bin/backup-rezerwacja24.sh
```

### 2. Dodaj do Crontab
```bash
sudo crontab -e

# Backup codziennie o 3:00
0 3 * * * /usr/local/bin/backup-rezerwacja24.sh >> /var/log/rezerwacja24-backup.log 2>&1
```

---

## 📊 Monitoring

### 1. Healthchecks
```bash
# Utwórz skrypt healthcheck
sudo nano /usr/local/bin/healthcheck-rezerwacja24.sh
```

```bash
#!/bin/bash

# Check API
if ! curl -f https://api.rezerwacja24.pl/health > /dev/null 2>&1; then
    echo "API DOWN!" | mail -s "Rezerwacja24 API Alert" admin@rezerwacja24.pl
    docker-compose restart backend
fi

# Check Frontend
if ! curl -f https://rezerwacja24.pl > /dev/null 2>&1; then
    echo "Frontend DOWN!" | mail -s "Rezerwacja24 Frontend Alert" admin@rezerwacja24.pl
    docker-compose restart frontend
fi
```

```bash
sudo chmod +x /usr/local/bin/healthcheck-rezerwacja24.sh

# Dodaj do crontab (co 5 minut)
*/5 * * * * /usr/local/bin/healthcheck-rezerwacja24.sh
```

### 2. Logi
```bash
# Rotacja logów
sudo nano /etc/logrotate.d/rezerwacja24
```

```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
```

---

## 🔄 Aktualizacje

### Aktualizacja Aplikacji
```bash
cd /var/www/rezerwacja24-saas

# Pull najnowszego kodu
git pull origin main

# Rebuild i restart
docker-compose build
docker-compose up -d

# Uruchom migracje (jeśli są)
docker-compose exec backend npx prisma migrate deploy

# Sprawdź logi
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### Problem: Kontenery nie startują
```bash
# Sprawdź logi
docker-compose logs

# Sprawdź zasoby
docker stats

# Restart wszystkiego
docker-compose down
docker-compose up -d
```

### Problem: Baza danych nie łączy się
```bash
# Sprawdź czy PostgreSQL działa
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Sprawdź connection string
docker-compose exec backend env | grep DATABASE_URL
```

### Problem: SSL nie działa
```bash
# Sprawdź certyfikaty
sudo certbot certificates

# Odnów certyfikat
sudo certbot renew

# Restart Nginx
docker-compose restart nginx
```

---

## 📞 Wsparcie

W razie problemów:
- **Email:** support@rezerwacja24.pl
- **Dokumentacja:** https://docs.rezerwacja24.pl
- **GitHub Issues:** https://github.com/your-org/rezerwacja24-saas/issues

---

## ✅ Checklist Wdrożenia

- [ ] DNS skonfigurowane (A, CNAME, wildcard)
- [ ] Certyfikat SSL wygenerowany i zainstalowany
- [ ] Docker i Docker Compose zainstalowane
- [ ] Zmienne środowiskowe skonfigurowane (.env)
- [ ] Kontenery uruchomione (docker-compose up -d)
- [ ] Migracje bazy danych wykonane
- [ ] Stripe webhooks skonfigurowane
- [ ] SendGrid domain zweryfikowana
- [ ] Twilio numer skonfigurowany
- [ ] OAuth (Google, Microsoft) skonfigurowane
- [ ] Backupy automatyczne ustawione
- [ ] Monitoring i healthchecks działają
- [ ] SSL auto-renewal skonfigurowany
- [ ] Testy smoke przeszły pomyślnie

---

**Gratulacje! Rezerwacja24 jest gotowy do użycia na rezerwacja24.pl** 🎉
