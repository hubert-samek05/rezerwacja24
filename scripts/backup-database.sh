#!/bin/bash

# Backup bazy danych PostgreSQL dla rezerwacja24.pl
# Data: $(date +%Y-%m-%d)

set -e

# Konfiguracja
BACKUP_DIR="/var/backups/rezerwacja24"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="rezerwacja24"

# Kolory dla outputu
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Backup Bazy Danych Rezerwacja24 ===${NC}"
echo "Data: $(date)"
echo "Katalog: $BACKUP_DIR"
echo ""

# Utwórz katalog backupu jeśli nie istnieje
mkdir -p "$BACKUP_DIR/database"

# Backup głównej bazy danych (używamy su - postgres dla lokalnego połączenia)
echo -e "${YELLOW}[1/3] Tworzenie backupu bazy danych...${NC}"
su - postgres -c "pg_dump -d $DB_NAME --format=custom" > "$BACKUP_DIR/database/db_${DATE}.dump"

# Kompresja backupu
echo -e "${YELLOW}[2/3] Kompresja backupu...${NC}"
gzip "$BACKUP_DIR/database/db_${DATE}.dump"

# Backup schema (dla łatwego podglądu)
echo -e "${YELLOW}[3/3] Eksport schema...${NC}"
su - postgres -c "pg_dump -d $DB_NAME --schema-only" > "$BACKUP_DIR/database/schema_${DATE}.sql"

# Statystyki
DB_SIZE=$(du -h "$BACKUP_DIR/database/db_${DATE}.dump.gz" | cut -f1)
echo ""
echo -e "${GREEN}✅ Backup bazy danych zakończony!${NC}"
echo "Plik: db_${DATE}.dump.gz"
echo "Rozmiar: $DB_SIZE"
echo ""

# Usuń backupy starsze niż 30 dni
echo -e "${YELLOW}Czyszczenie starych backupów (>30 dni)...${NC}"
find "$BACKUP_DIR/database" -name "*.dump.gz" -mtime +30 -delete
find "$BACKUP_DIR/database" -name "*.sql" -mtime +30 -delete
echo -e "${GREEN}✅ Gotowe!${NC}"
