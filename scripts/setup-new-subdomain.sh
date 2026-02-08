#!/bin/bash

# Skrypt do automatycznego dodawania nowej subdomeny z SSL
# Użycie: ./setup-new-subdomain.sh <subdomain>
# 
# NAPRAWIONY: 2025-12-18
# Problem: Skrypt tworzył konfigurację SSL przed uzyskaniem certyfikatu
# Rozwiązanie: Dwuetapowe podejście - najpierw HTTP, potem SSL

set -e

if [ -z "$1" ]; then
    echo "Użycie: $0 <subdomain>"
    echo "Przykład: $0 demo"
    exit 1
fi

SUBDOMAIN="$1"
FULL_DOMAIN="${SUBDOMAIN}.rezerwacja24.pl"
NGINX_CONF="/etc/nginx/sites-available/${FULL_DOMAIN}.conf"
WEBROOT="/var/www/rezerwacja24"

echo "=== Konfiguracja nowej subdomeny: ${FULL_DOMAIN} ==="
echo "📅 Data: $(date)"

# 1. Sprawdź czy certyfikat już istnieje
if [ -d "/etc/letsencrypt/live/${FULL_DOMAIN}" ]; then
    echo "✅ Certyfikat SSL dla ${FULL_DOMAIN} już istnieje"
    
    # Sprawdź czy konfiguracja nginx istnieje
    if [ -f "${NGINX_CONF}" ]; then
        echo "✅ Konfiguracja nginx już istnieje"
        exit 0
    fi
    
    # Certyfikat jest, ale brak konfiguracji - utwórz pełną konfigurację z SSL
    echo "📝 Tworzenie konfiguracji nginx z SSL..."
    cat > "${NGINX_CONF}" << EOF
# ${FULL_DOMAIN} - Subdomain configuration (with SSL)
server {
    listen 80;
    listen [::]:80;
    server_name ${FULL_DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${FULL_DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${FULL_DOMAIN}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${FULL_DOMAIN}.conf"
    nginx -t && systemctl reload nginx
    echo "✅ Konfiguracja nginx utworzona i aktywowana"
    exit 0
fi

# 2. Sprawdź czy konfiguracja już istnieje (bez certyfikatu)
if [ -f "${NGINX_CONF}" ]; then
    echo "⚠️  Konfiguracja dla ${FULL_DOMAIN} już istnieje, ale brak certyfikatu"
    echo "🔄 Usuwam starą konfigurację i tworzę nową..."
    rm -f "${NGINX_CONF}"
    rm -f "/etc/nginx/sites-enabled/${FULL_DOMAIN}.conf"
fi

# 3. Upewnij się że katalog webroot istnieje
mkdir -p "${WEBROOT}"

# 4. KROK 1: Utwórz konfigurację nginx TYLKO HTTP (bez SSL)
echo "📝 KROK 1: Tworzenie konfiguracji HTTP (bez SSL)..."
cat > "${NGINX_CONF}" << EOF
# ${FULL_DOMAIN} - Subdomain configuration (HTTP only - waiting for SSL)
server {
    listen 80;
    listen [::]:80;
    server_name ${FULL_DOMAIN};
    
    # Dla certbot - ACME challenge
    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
        allow all;
    }
    
    # Tymczasowo proxy do aplikacji (przed SSL)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 5. Aktywuj konfigurację HTTP
echo "🔗 Aktywowanie konfiguracji HTTP..."
ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${FULL_DOMAIN}.conf"

# 6. Test i reload nginx (tylko HTTP)
echo "🔄 Testowanie i przeładowywanie nginx (HTTP)..."
if ! nginx -t; then
    echo "❌ Błąd konfiguracji nginx!"
    rm -f "${NGINX_CONF}"
    rm -f "/etc/nginx/sites-enabled/${FULL_DOMAIN}.conf"
    exit 1
fi
systemctl reload nginx

# 7. Poczekaj chwilę na propagację
sleep 2

# 8. KROK 2: Wygeneruj certyfikat SSL używając webroot
echo "🔐 KROK 2: Generowanie certyfikatu SSL..."
if ! certbot certonly \
    --webroot \
    --webroot-path="${WEBROOT}" \
    --non-interactive \
    --agree-tos \
    --email admin@rezerwacja24.pl \
    -d "${FULL_DOMAIN}"; then
    echo "❌ Błąd podczas generowania certyfikatu SSL!"
    echo "⚠️  Subdomena działa na HTTP, ale bez SSL"
    exit 1
fi

echo "✅ Certyfikat SSL wygenerowany pomyślnie!"

# 9. KROK 3: Zaktualizuj konfigurację nginx o SSL
echo "📝 KROK 3: Aktualizacja konfiguracji nginx z SSL..."
cat > "${NGINX_CONF}" << EOF
# ${FULL_DOMAIN} - Subdomain configuration (with SSL)
server {
    listen 80;
    listen [::]:80;
    server_name ${FULL_DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${FULL_DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${FULL_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${FULL_DOMAIN}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 10. Test i reload nginx (z SSL)
echo "🔄 Testowanie i przeładowywanie nginx (z SSL)..."
if ! nginx -t; then
    echo "❌ Błąd konfiguracji nginx z SSL!"
    exit 1
fi
systemctl reload nginx

echo ""
echo "✅ =============================================="
echo "✅ Subdomena ${FULL_DOMAIN} została skonfigurowana!"
echo "✅ =============================================="
echo "   - HTTP:  http://${FULL_DOMAIN} (przekierowanie na HTTPS)"
echo "   - HTTPS: https://${FULL_DOMAIN} ✓"
echo ""
