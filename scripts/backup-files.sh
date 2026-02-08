#!/bin/bash

# Backup plików aplikacji rezerwacja24.pl
# Data: $(date +%Y-%m-%d)

set -e

# Konfiguracja
BACKUP_DIR="/var/backups/rezerwacja24"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/root/CascadeProjects/rezerwacja24-saas"

# Kolory dla outputu
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Backup Plików Aplikacji Rezerwacja24 ===${NC}"
echo "Data: $(date)"
echo "Katalog źródłowy: $APP_DIR"
echo "Katalog backupu: $BACKUP_DIR"
echo ""

# Utwórz katalog backupu jeśli nie istnieje
mkdir -p "$BACKUP_DIR/files"

# Backup frontend
echo -e "${YELLOW}[1/5] Backup Frontend (Next.js)...${NC}"
tar -czf "$BACKUP_DIR/files/frontend_${DATE}.tar.gz" \
    -C "$APP_DIR" \
    --exclude='frontend/node_modules' \
    --exclude='frontend/.next/cache' \
    frontend/

# Backup backend
echo -e "${YELLOW}[2/5] Backup Backend (NestJS)...${NC}"
tar -czf "$BACKUP_DIR/files/backend_${DATE}.tar.gz" \
    -C "$APP_DIR" \
    --exclude='backend/node_modules' \
    --exclude='backend/dist' \
    backend/

# Backup konfiguracji Nginx
echo -e "${YELLOW}[3/5] Backup konfiguracji Nginx...${NC}"
if [ -f "/etc/nginx/sites-available/rezerwacja24-main.conf" ]; then
    mkdir -p "$BACKUP_DIR/files/nginx"
    cp /etc/nginx/sites-available/rezerwacja24-main.conf \
       "$BACKUP_DIR/files/nginx/rezerwacja24-main_${DATE}.conf"
fi

# Backup docker-compose i zmiennych środowiskowych
echo -e "${YELLOW}[4/5] Backup konfiguracji Docker...${NC}"
tar -czf "$BACKUP_DIR/files/config_${DATE}.tar.gz" \
    -C "$APP_DIR" \
    docker-compose.yml \
    nginx/ \
    --exclude='nginx/ssl/*.key' \
    2>/dev/null || true

# Backup dokumentacji
echo -e "${YELLOW}[5/5] Backup dokumentacji...${NC}"
tar -czf "$BACKUP_DIR/files/docs_${DATE}.tar.gz" \
    -C "$APP_DIR" \
    *.md \
    2>/dev/null || true

# Statystyki
echo ""
echo -e "${GREEN}✅ Backup plików zakończony!${NC}"
echo "Pliki:"
ls -lh "$BACKUP_DIR/files/"*_${DATE}* | awk '{print "  - " $9 " (" $5 ")"}'
echo ""

# Usuń backupy starsze niż 30 dni
echo -e "${YELLOW}Czyszczenie starych backupów (>30 dni)...${NC}"
find "$BACKUP_DIR/files" -name "*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR/files/nginx" -name "*.conf" -mtime +30 -delete 2>/dev/null || true
echo -e "${GREEN}✅ Gotowe!${NC}"
