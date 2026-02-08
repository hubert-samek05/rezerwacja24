#!/bin/bash

# ============================================
# BEZPIECZNY BACKUP PRZED ZMIANAMI
# ============================================
# Ten skrypt MUSI być uruchomiony przed każdą zmianą w kodzie
# która może wpłynąć na bazę danych!
# ============================================

set -e

# Konfiguracja
BACKUP_DIR="/var/backups/rezerwacja24/safe-backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="rezerwacja24"
REASON="${1:-manual}"

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🔒 BEZPIECZNY BACKUP PRZED ZMIANAMI 🔒              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Data:${NC} $(date)"
echo -e "${YELLOW}Powód:${NC} $REASON"
echo ""

# Utwórz katalog
mkdir -p "$BACKUP_DIR"

# Nazwa pliku z powodem
BACKUP_FILE="$BACKUP_DIR/safe_${DATE}_${REASON}.dump"

# Wykonaj backup
echo -e "${YELLOW}[1/3] Tworzenie backupu bazy danych...${NC}"
su - postgres -c "pg_dump -d $DB_NAME --format=custom" > "$BACKUP_FILE"

# Kompresja
echo -e "${YELLOW}[2/3] Kompresja...${NC}"
gzip "$BACKUP_FILE"

# Weryfikacja
echo -e "${YELLOW}[3/3] Weryfikacja backupu...${NC}"
if gunzip -t "${BACKUP_FILE}.gz" 2>/dev/null; then
    echo -e "${GREEN}✅ Backup zweryfikowany pomyślnie!${NC}"
else
    echo -e "${RED}❌ BŁĄD: Backup jest uszkodzony!${NC}"
    exit 1
fi

# Statystyki
BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ BACKUP GOTOWY!                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Plik:${NC} ${BACKUP_FILE}.gz"
echo -e "${YELLOW}Rozmiar:${NC} $BACKUP_SIZE"
echo -e "${YELLOW}Liczba safe-backupów:${NC} $BACKUP_COUNT"
echo ""
echo -e "${BLUE}Aby przywrócić ten backup:${NC}"
echo "  /root/CascadeProjects/rezerwacja24-saas/scripts/restore-safe-backup.sh ${BACKUP_FILE}.gz"
echo ""

# Zapisz log
echo "$(date) | $REASON | ${BACKUP_FILE}.gz | $BACKUP_SIZE" >> "$BACKUP_DIR/backup.log"

# Zachowaj tylko ostatnie 50 safe-backupów (nie usuwaj za szybko!)
ls -t "$BACKUP_DIR"/*.gz 2>/dev/null | tail -n +51 | xargs -r rm --

echo -e "${GREEN}Możesz teraz bezpiecznie wprowadzać zmiany!${NC}"
echo ""
