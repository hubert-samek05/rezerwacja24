#!/bin/bash

# Backup Redis dla rezerwacja24.pl
# Data: $(date +%Y-%m-%d)

set -e

# Konfiguracja
BACKUP_DIR="/var/backups/rezerwacja24"
DATE=$(date +%Y%m%d_%H%M%S)
REDIS_PORT="6379"

# Kolory dla outputu
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Backup Redis Rezerwacja24 ===${NC}"
echo "Data: $(date)"
echo ""

# Utwórz katalog backupu jeśli nie istnieje
mkdir -p "$BACKUP_DIR/redis"

# Wykonaj SAVE w Redis
echo -e "${YELLOW}[1/2] Wykonywanie SAVE w Redis...${NC}"
redis-cli -p "$REDIS_PORT" SAVE

# Kopiuj dump.rdb
echo -e "${YELLOW}[2/2] Kopiowanie dump.rdb...${NC}"
if [ -f "/var/lib/redis/dump.rdb" ]; then
    cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis/redis_${DATE}.rdb"
    gzip "$BACKUP_DIR/redis/redis_${DATE}.rdb"
    
    REDIS_SIZE=$(du -h "$BACKUP_DIR/redis/redis_${DATE}.rdb.gz" | cut -f1)
    echo ""
    echo -e "${GREEN}✅ Backup Redis zakończony!${NC}"
    echo "Plik: redis_${DATE}.rdb.gz"
    echo "Rozmiar: $REDIS_SIZE"
else
    echo -e "${RED}❌ Nie znaleziono pliku dump.rdb${NC}"
fi

echo ""

# Usuń backupy starsze niż 30 dni
echo -e "${YELLOW}Czyszczenie starych backupów (>30 dni)...${NC}"
find "$BACKUP_DIR/redis" -name "*.rdb.gz" -mtime +30 -delete
echo -e "${GREEN}✅ Gotowe!${NC}"
