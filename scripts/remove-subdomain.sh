#!/bin/bash

# Skrypt do usuwania konfiguracji subdomeny (nginx + SSL)
# Użycie: ./remove-subdomain.sh <subdomain>

set -e

if [ -z "$1" ]; then
    echo "Użycie: $0 <subdomain>"
    echo "Przykład: $0 demo"
    exit 1
fi

SUBDOMAIN="$1"
FULL_DOMAIN="${SUBDOMAIN}.rezerwacja24.pl"
NGINX_CONF="/etc/nginx/sites-available/${FULL_DOMAIN}.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/${FULL_DOMAIN}.conf"

echo "=== Usuwanie subdomeny: ${FULL_DOMAIN} ==="
echo "📅 Data: $(date)"

# 1. Usuń konfigurację nginx
if [ -f "${NGINX_ENABLED}" ]; then
    echo "🗑️ Usuwam symlink nginx: ${NGINX_ENABLED}"
    rm -f "${NGINX_ENABLED}"
fi

if [ -f "${NGINX_CONF}" ]; then
    echo "🗑️ Usuwam konfigurację nginx: ${NGINX_CONF}"
    rm -f "${NGINX_CONF}"
fi

# 2. Przeładuj nginx
echo "🔄 Przeładowywanie nginx..."
if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "✅ Nginx przeładowany"
else
    echo "⚠️ Błąd konfiguracji nginx, pomijam reload"
fi

# 3. Usuń certyfikat SSL (opcjonalnie - certbot revoke)
# UWAGA: Nie usuwamy certyfikatu od razu, bo Let's Encrypt ma limity
# Certyfikat wygaśnie automatycznie lub można go usunąć ręcznie
if [ -d "/etc/letsencrypt/live/${FULL_DOMAIN}" ]; then
    echo "⚠️ Certyfikat SSL dla ${FULL_DOMAIN} nadal istnieje"
    echo "   Możesz go usunąć ręcznie: certbot delete --cert-name ${FULL_DOMAIN}"
    
    # Opcjonalnie: automatyczne usunięcie certyfikatu
    # certbot delete --cert-name "${FULL_DOMAIN}" --non-interactive 2>/dev/null || true
fi

echo ""
echo "✅ =============================================="
echo "✅ Subdomena ${FULL_DOMAIN} została usunięta!"
echo "✅ =============================================="
echo ""
