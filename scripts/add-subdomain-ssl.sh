#!/bin/bash

# Skrypt do dodawania certyfikatu SSL dla nowej subdomeny
# Użycie: ./add-subdomain-ssl.sh <subdomain>

set -e

if [ -z "$1" ]; then
    echo "Użycie: $0 <subdomain>"
    echo "Przykład: $0 demo"
    exit 1
fi

SUBDOMAIN="$1"
FULL_DOMAIN="${SUBDOMAIN}.rezerwacja24.pl"

echo "=== Dodawanie certyfikatu SSL dla ${FULL_DOMAIN} ==="

# Sprawdź czy certbot jest zainstalowany
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot nie jest zainstalowany!"
    exit 1
fi

# Sprawdź czy certyfikat już istnieje
if [ -d "/etc/letsencrypt/live/${FULL_DOMAIN}" ]; then
    echo "✅ Certyfikat dla ${FULL_DOMAIN} już istnieje"
    exit 0
fi

# Wygeneruj certyfikat
echo "📜 Generowanie certyfikatu dla ${FULL_DOMAIN}..."
certbot certonly \
  --nginx \
  --non-interactive \
  --agree-tos \
  --email admin@rezerwacja24.pl \
  -d "${FULL_DOMAIN}"

if [ $? -eq 0 ]; then
    echo "✅ Certyfikat wygenerowany pomyślnie!"
    
    # Przeładuj nginx
    echo "🔄 Przeładowywanie nginx..."
    nginx -t && systemctl reload nginx
    
    echo "✅ Certyfikat SSL dla ${FULL_DOMAIN} został dodany!"
else
    echo "❌ Błąd podczas generowania certyfikatu"
    exit 1
fi
