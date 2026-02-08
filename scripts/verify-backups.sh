#!/bin/bash

# ============================================
# WERYFIKACJA BACKUPÓW
# ============================================
# Sprawdza czy backupy są aktualne i działające
# ============================================

set -e

# Konfiguracja
BACKUP_DIR="/var/backups/rezerwacja24/database"
SAFE_BACKUP_DIR="/var/backups/rezerwacja24/safe-backups"
MAX_AGE_HOURS=8  # Backup powinien być nie starszy niż 8 godzin

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🔍 WERYFIKACJA BACKUPÓW 🔍                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# 1. Sprawdź czy katalog backupów istnieje
echo -e "${YELLOW}[1/5] Sprawdzanie katalogów...${NC}"
if [ -d "$BACKUP_DIR" ]; then
    echo -e "  ${GREEN}✅${NC} Katalog backupów istnieje: $BACKUP_DIR"
else
    echo -e "  ${RED}❌${NC} Katalog backupów NIE istnieje: $BACKUP_DIR"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "$SAFE_BACKUP_DIR" ]; then
    echo -e "  ${GREEN}✅${NC} Katalog safe-backupów istnieje: $SAFE_BACKUP_DIR"
else
    echo -e "  ${YELLOW}⚠️${NC} Katalog safe-backupów nie istnieje (zostanie utworzony przy pierwszym użyciu)"
    WARNINGS=$((WARNINGS + 1))
fi

# 2. Sprawdź ostatni backup
echo ""
echo -e "${YELLOW}[2/5] Sprawdzanie ostatniego backupu...${NC}"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.dump.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "  ${RED}❌${NC} BRAK backupów w katalogu!"
    ERRORS=$((ERRORS + 1))
else
    BACKUP_TIME=$(stat -c %Y "$LATEST_BACKUP")
    CURRENT_TIME=$(date +%s)
    AGE_SECONDS=$((CURRENT_TIME - BACKUP_TIME))
    AGE_HOURS=$((AGE_SECONDS / 3600))
    AGE_MINUTES=$(((AGE_SECONDS % 3600) / 60))
    
    BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
    BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d'.' -f1)
    
    echo -e "  ${BLUE}Ostatni backup:${NC} $(basename "$LATEST_BACKUP")"
    echo -e "  ${BLUE}Data:${NC} $BACKUP_DATE"
    echo -e "  ${BLUE}Rozmiar:${NC} $BACKUP_SIZE"
    echo -e "  ${BLUE}Wiek:${NC} ${AGE_HOURS}h ${AGE_MINUTES}m"
    
    if [ $AGE_HOURS -lt $MAX_AGE_HOURS ]; then
        echo -e "  ${GREEN}✅${NC} Backup jest aktualny"
    else
        echo -e "  ${RED}❌${NC} Backup jest STARY (>$MAX_AGE_HOURS godzin)!"
        ERRORS=$((ERRORS + 1))
    fi
fi

# 3. Weryfikacja integralności backupu
echo ""
echo -e "${YELLOW}[3/5] Weryfikacja integralności...${NC}"
if [ -n "$LATEST_BACKUP" ]; then
    if gunzip -t "$LATEST_BACKUP" 2>/dev/null; then
        echo -e "  ${GREEN}✅${NC} Backup jest poprawny (gzip OK)"
    else
        echo -e "  ${RED}❌${NC} Backup jest USZKODZONY!"
        ERRORS=$((ERRORS + 1))
    fi
fi

# 4. Sprawdź liczbę backupów
echo ""
echo -e "${YELLOW}[4/5] Statystyki backupów...${NC}"
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.dump.gz 2>/dev/null | wc -l)
SCHEMA_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
SAFE_COUNT=$(ls -1 "$SAFE_BACKUP_DIR"/*.gz 2>/dev/null 2>/dev/null | wc -l || echo "0")
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo -e "  ${BLUE}Backupy bazy:${NC} $BACKUP_COUNT"
echo -e "  ${BLUE}Backupy schema:${NC} $SCHEMA_COUNT"
echo -e "  ${BLUE}Safe-backupy:${NC} $SAFE_COUNT"
echo -e "  ${BLUE}Łączny rozmiar:${NC} $TOTAL_SIZE"

if [ $BACKUP_COUNT -lt 3 ]; then
    echo -e "  ${YELLOW}⚠️${NC} Mało backupów (powinno być min. 3)"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Sprawdź cron
echo ""
echo -e "${YELLOW}[5/5] Sprawdzanie harmonogramu cron...${NC}"
CRON_ENTRIES=$(crontab -l 2>/dev/null | grep -c "backup-database.sh" || echo "0")

if [ "$CRON_ENTRIES" -ge 3 ]; then
    echo -e "  ${GREEN}✅${NC} Cron skonfigurowany ($CRON_ENTRIES wpisów)"
    crontab -l 2>/dev/null | grep "backup-database.sh" | while read line; do
        echo -e "     $line"
    done
else
    echo -e "  ${RED}❌${NC} Cron NIE jest poprawnie skonfigurowany!"
    ERRORS=$((ERRORS + 1))
fi

# Podsumowanie
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ WSZYSTKO OK! Backupy działają poprawnie.${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  OK z ostrzeżeniami: $WARNINGS ostrzeżeń${NC}"
else
    echo -e "${RED}❌ PROBLEMY: $ERRORS błędów, $WARNINGS ostrzeżeń${NC}"
    echo -e "${RED}   Sprawdź logi: tail -f /var/log/rezerwacja24-backup.log${NC}"
fi
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Lista ostatnich 5 backupów
echo -e "${YELLOW}Ostatnie 5 backupów:${NC}"
ls -lht "$BACKUP_DIR"/*.dump.gz 2>/dev/null | head -5 | while read line; do
    echo "  $line"
done

exit $ERRORS
