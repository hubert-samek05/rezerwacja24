#!/bin/bash

# Skrypt do konfiguracji SSL dla rezerwacja24.pl i subdomen
# Używa Let's Encrypt z certbotem

set -e

echo "=== Konfiguracja SSL dla rezerwacja24.pl ==="

# Sprawdź czy certbot jest zainstalowany
if ! command -v certbot &> /dev/null; then
    echo "Instalowanie certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Zatrzymaj nginx tymczasowo
systemctl stop nginx || true

# Wygeneruj certyfikat wildcard dla wszystkich subdomen
# UWAGA: Wymaga weryfikacji DNS - należy dodać rekord TXT w DNS
echo "Generowanie certyfikatu wildcard dla *.rezerwacja24.pl..."
echo "UWAGA: Będziesz musiał dodać rekord TXT w DNS swojej domeny"

certbot certonly \
  --manual \
  --preferred-challenges dns \
  --email admin@rezerwacja24.pl \
  --agree-tos \
  --no-eff-email \
  -d rezerwacja24.pl \
  -d "*.rezerwacja24.pl"

# Skopiuj certyfikaty do katalogu nginx
mkdir -p /etc/nginx/ssl
cp /etc/letsencrypt/live/rezerwacja24.pl/fullchain.pem /etc/nginx/ssl/rezerwacja24.pl.crt
cp /etc/letsencrypt/live/rezerwacja24.pl/privkey.pem /etc/nginx/ssl/rezerwacja24.pl.key

# Ustaw odpowiednie uprawnienia
chmod 644 /etc/nginx/ssl/rezerwacja24.pl.crt
chmod 600 /etc/nginx/ssl/rezerwacja24.pl.key

# Uruchom nginx
systemctl start nginx
systemctl reload nginx

# Skonfiguruj automatyczne odnawianie
echo "Konfiguracja automatycznego odnawiania certyfikatu..."
cat > /etc/cron.d/certbot-renew << 'EOF'
0 3 * * * root certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/rezerwacja24.pl/fullchain.pem /etc/nginx/ssl/rezerwacja24.pl.crt && cp /etc/letsencrypt/live/rezerwacja24.pl/privkey.pem /etc/nginx/ssl/rezerwacja24.pl.key && systemctl reload nginx"
EOF

echo "=== SSL skonfigurowane pomyślnie! ==="
echo "Certyfikat obejmuje:"
echo "  - rezerwacja24.pl"
echo "  - *.rezerwacja24.pl (wszystkie subdomeny)"
echo ""
echo "Certyfikat będzie automatycznie odnawiany co 3 miesiące."
