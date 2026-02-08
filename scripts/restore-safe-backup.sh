#!/bin/bash

# ============================================
# PRZYWRACANIE Z BEZPIECZNEGO BACKUPU
# ============================================

set -e

# Konfiguracja
DB_NAME="rezerwacja24"

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Użycie: $0 <ścieżka_do_backupu.dump.gz>${NC}"
    echo ""
    echo -e "${YELLOW}Dostępne safe-backupy:${NC}"
    ls -lht /var/backups/rezerwacja24/safe-backups/*.gz 2>/dev/null | head -20
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Plik nie istnieje: $BACKUP_FILE${NC}"
    exit 1
fi

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║          ⚠️  UWAGA: PRZYWRACANIE BACKUPU! ⚠️               ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Plik backupu:${NC} $BACKUP_FILE"
echo -e "${YELLOW}Baza docelowa:${NC} $DB_NAME"
echo ""
echo -e "${RED}TO NADPISZE WSZYSTKIE OBECNE DANE W BAZIE!${NC}"
echo ""
read -p "Czy na pewno chcesz kontynuować? (wpisz 'TAK' aby potwierdzić): " CONFIRM

if [ "$CONFIRM" != "TAK" ]; then
    echo -e "${YELLOW}Anulowano.${NC}"
    exit 0
fi

# Najpierw zrób backup obecnego stanu
echo ""
echo -e "${YELLOW}[1/4] Tworzenie backupu obecnego stanu (na wszelki wypadek)...${NC}"
CURRENT_BACKUP="/var/backups/rezerwacja24/safe-backups/before_restore_$(date +%Y%m%d_%H%M%S).dump"
su - postgres -c "pg_dump -d $DB_NAME --format=custom" > "$CURRENT_BACKUP"
gzip "$CURRENT_BACKUP"
echo -e "${GREEN}✅ Backup obecnego stanu: ${CURRENT_BACKUP}.gz${NC}"

# Zatrzymaj aplikację
echo ""
echo -e "${YELLOW}[2/4] Zatrzymywanie aplikacji...${NC}"
pm2 stop rezerwacja24-backend 2>/dev/null || true
pm2 stop rezerwacja24-frontend 2>/dev/null || true
sleep 2

# Przywróć backup
echo ""
echo -e "${YELLOW}[3/4] Przywracanie backupu...${NC}"
gunzip -c "$BACKUP_FILE" > /tmp/restore.dump
su - postgres -c "pg_restore -d $DB_NAME --clean --if-exists /tmp/restore.dump" 2>/dev/null || true
rm /tmp/restore.dump

# Uruchom aplikację
echo ""
echo -e "${YELLOW}[4/4] Uruchamianie aplikacji...${NC}"
pm2 start rezerwacja24-backend 2>/dev/null || true
pm2 start rezerwacja24-frontend 2>/dev/null || true

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ PRZYWRACANIE ZAKOŃCZONE!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Backup obecnego stanu (przed restore):${NC} ${CURRENT_BACKUP}.gz"
echo ""

# Weryfikacja
echo -e "${YELLOW}Weryfikacja danych:${NC}"
su - postgres -c "psql -d $DB_NAME -c \"SELECT (SELECT COUNT(*) FROM tenants) as tenants, (SELECT COUNT(*) FROM services) as services, (SELECT COUNT(*) FROM employees) as employees, (SELECT COUNT(*) FROM bookings) as bookings;\""
