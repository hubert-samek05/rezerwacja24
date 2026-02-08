#!/bin/bash

# Skrypt przywracania backupu rezerwacja24.pl
# Użycie: ./restore-backup.sh <plik_backupu.tar.gz>

set -e

# Kolory dla outputu
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Sprawdź argumenty
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Błąd: Nie podano pliku backupu${NC}"
    echo "Użycie: $0 <plik_backupu.tar.gz>"
    echo ""
    echo "Przykład:"
    echo "  $0 /var/backups/rezerwacja24/full_backup_20241130_220000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Sprawdź czy plik istnieje
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Błąd: Plik backupu nie istnieje: $BACKUP_FILE${NC}"
    exit 1
fi

# Header
clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      PRZYWRACANIE BACKUPU REZERWACJA24.PL                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Plik backupu:${NC} $BACKUP_FILE"
echo ""

# Ostrzeżenie
echo -e "${RED}⚠️  UWAGA: To działanie nadpisze obecne dane!${NC}"
echo -e "${YELLOW}Czy chcesz kontynuować? (tak/nie)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "tak" ]; then
    echo -e "${YELLOW}Przywracanie anulowane.${NC}"
    exit 0
fi

# Utwórz katalog tymczasowy
TEMP_DIR="/tmp/rezerwacja24_restore_$$"
mkdir -p "$TEMP_DIR"

echo ""
echo -e "${GREEN}[1/5] Rozpakowywanie backupu...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Znajdź katalog z backupem
BACKUP_DIR=$(find "$TEMP_DIR" -type d -name "full_*" | head -1)

if [ -z "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Błąd: Nie znaleziono katalogu backupu${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${GREEN}✓ Backup rozpakowany${NC}"

# Przywracanie bazy danych
echo ""
echo -e "${GREEN}[2/5] Przywracanie bazy danych PostgreSQL...${NC}"
DB_FILE=$(find "$BACKUP_DIR" -name "db_*.dump.gz" | head -1)

if [ -n "$DB_FILE" ]; then
    echo -e "${YELLOW}Rozpakowywanie bazy danych...${NC}"
    gunzip -c "$DB_FILE" > "$TEMP_DIR/database.dump"
    
    echo -e "${YELLOW}Przywracanie do PostgreSQL...${NC}"
    echo -e "${RED}UWAGA: Istniejąca baza zostanie usunięta!${NC}"
    
    # Drop i recreate database
    psql -U postgres -c "DROP DATABASE IF EXISTS rezerwacja24;"
    psql -U postgres -c "CREATE DATABASE rezerwacja24;"
    
    # Restore
    pg_restore -U postgres -d rezerwacja24 "$TEMP_DIR/database.dump"
    
    echo -e "${GREEN}✓ Baza danych przywrócona${NC}"
else
    echo -e "${YELLOW}⚠ Nie znaleziono backupu bazy danych${NC}"
fi

# Przywracanie Redis
echo ""
echo -e "${GREEN}[3/5] Przywracanie Redis...${NC}"
REDIS_FILE=$(find "$BACKUP_DIR" -name "redis_*.rdb.gz" | head -1)

if [ -n "$REDIS_FILE" ]; then
    echo -e "${YELLOW}Zatrzymywanie Redis...${NC}"
    systemctl stop redis 2>/dev/null || true
    
    echo -e "${YELLOW}Przywracanie dump.rdb...${NC}"
    gunzip -c "$REDIS_FILE" > /var/lib/redis/dump.rdb
    chown redis:redis /var/lib/redis/dump.rdb
    
    echo -e "${YELLOW}Uruchamianie Redis...${NC}"
    systemctl start redis
    
    echo -e "${GREEN}✓ Redis przywrócony${NC}"
else
    echo -e "${YELLOW}⚠ Nie znaleziono backupu Redis${NC}"
fi

# Przywracanie aplikacji
echo ""
echo -e "${GREEN}[4/5] Przywracanie aplikacji...${NC}"

APP_DIR="/root/CascadeProjects/rezerwacja24-saas"

# Frontend
FRONTEND_FILE=$(find "$BACKUP_DIR" -name "frontend_*.tar.gz" | head -1)
if [ -n "$FRONTEND_FILE" ]; then
    echo -e "${YELLOW}Przywracanie frontend...${NC}"
    tar -xzf "$FRONTEND_FILE" -C "$APP_DIR"
    echo -e "${GREEN}✓ Frontend przywrócony${NC}"
fi

# Backend
BACKEND_FILE=$(find "$BACKUP_DIR" -name "backend_*.tar.gz" | head -1)
if [ -n "$BACKEND_FILE" ]; then
    echo -e "${YELLOW}Przywracanie backend...${NC}"
    tar -xzf "$BACKEND_FILE" -C "$APP_DIR"
    echo -e "${GREEN}✓ Backend przywrócony${NC}"
fi

# Konfiguracja
CONFIG_FILE=$(find "$BACKUP_DIR" -name "config_*.tar.gz" | head -1)
if [ -n "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}Przywracanie konfiguracji...${NC}"
    tar -xzf "$CONFIG_FILE" -C "$APP_DIR"
    echo -e "${GREEN}✓ Konfiguracja przywrócona${NC}"
fi

# Restart aplikacji
echo ""
echo -e "${GREEN}[5/5] Restart aplikacji...${NC}"

echo -e "${YELLOW}Zatrzymywanie aplikacji...${NC}"
pkill -f "next-server" 2>/dev/null || true

echo -e "${YELLOW}Instalacja zależności i build...${NC}"
cd "$APP_DIR/frontend"
npm install --silent
npm run build

echo -e "${YELLOW}Uruchamianie aplikacji...${NC}"
nohup npm start > /var/log/rezerwacja24-frontend.log 2>&1 &

echo -e "${YELLOW}Reload Nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}✓ Aplikacja uruchomiona${NC}"

# Czyszczenie
echo ""
echo -e "${YELLOW}Czyszczenie plików tymczasowych...${NC}"
rm -rf "$TEMP_DIR"

# Podsumowanie
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           PRZYWRACANIE ZAKOŃCZONE                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Backup został pomyślnie przywrócony!${NC}"
echo ""
echo -e "${YELLOW}PRZYWRÓCONE KOMPONENTY:${NC}"
[ -n "$DB_FILE" ] && echo "  ✓ Baza danych PostgreSQL"
[ -n "$REDIS_FILE" ] && echo "  ✓ Redis cache"
[ -n "$FRONTEND_FILE" ] && echo "  ✓ Aplikacja frontend"
[ -n "$BACKEND_FILE" ] && echo "  ✓ Aplikacja backend"
[ -n "$CONFIG_FILE" ] && echo "  ✓ Konfiguracja"
echo ""
echo -e "${YELLOW}WERYFIKACJA:${NC}"
echo "  🌐 Strona: https://rezerwacja24.pl"
echo "  🔧 API: https://api.rezerwacja24.pl/health"
echo ""
echo -e "${GREEN}🎉 System gotowy do użycia!${NC}"
echo ""
