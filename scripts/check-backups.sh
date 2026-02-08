#!/bin/bash

# Sprawdzenie statusu backupów Rezerwacja24

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Status Backupów Rezerwacja24 ===${NC}"
echo ""

# Sprawdź czy katalog istnieje
if [ ! -d "/var/backups/rezerwacja24/database" ]; then
    echo -e "${RED}❌ Katalog backupów nie istnieje!${NC}"
    exit 1
fi

# Znajdź ostatni backup
LAST_BACKUP=$(ls -t /var/backups/rezerwacja24/database/*.dump.gz 2>/dev/null | head -1)

if [ -z "$LAST_BACKUP" ]; then
    echo -e "${RED}❌ Brak backupów!${NC}"
    exit 1
fi

# Informacje o ostatnim backupie
echo -e "${YELLOW}📦 Ostatni backup:${NC}"
echo "   Plik: $(basename $LAST_BACKUP)"
echo "   Data: $(stat -c %y "$LAST_BACKUP" | cut -d'.' -f1)"
echo "   Rozmiar: $(du -h "$LAST_BACKUP" | cut -f1)"
echo ""

# Sprawdź wiek backupu
LAST_BACKUP_TIMESTAMP=$(stat -c %Y "$LAST_BACKUP")
CURRENT_TIMESTAMP=$(date +%s)
DIFF=$((CURRENT_TIMESTAMP - LAST_BACKUP_TIMESTAMP))
HOURS=$((DIFF / 3600))

echo -e "${YELLOW}⏰ Wiek backupu:${NC}"
if [ $HOURS -lt 13 ]; then
    echo -e "   ${GREEN}✅ Świeży ($HOURS godzin temu)${NC}"
else
    echo -e "   ${RED}⚠️  Stary ($HOURS godzin temu) - sprawdź cron!${NC}"
fi
echo ""

# Sprawdź integralność
echo -e "${YELLOW}🔍 Test integralności:${NC}"
if gunzip -t "$LAST_BACKUP" 2>/dev/null; then
    echo -e "   ${GREEN}✅ Backup jest poprawny${NC}"
else
    echo -e "   ${RED}❌ Backup jest uszkodzony!${NC}"
fi
echo ""

# Statystyki
TOTAL_BACKUPS=$(ls /var/backups/rezerwacja24/database/*.dump.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh /var/backups/rezerwacja24/database/ 2>/dev/null | cut -f1)

echo -e "${YELLOW}📊 Statystyki:${NC}"
echo "   Liczba backupów: $TOTAL_BACKUPS"
echo "   Całkowity rozmiar: $TOTAL_SIZE"
echo ""

# Sprawdź cron
echo -e "${YELLOW}⚙️  Harmonogram (cron):${NC}"
if crontab -l | grep -q "backup-database.sh"; then
    echo -e "   ${GREEN}✅ Cron skonfigurowany${NC}"
    crontab -l | grep "backup-database.sh" | sed 's/^/   /'
else
    echo -e "   ${RED}❌ Cron nie skonfigurowany!${NC}"
fi
echo ""

# Ostatnie logi
if [ -f "/var/log/rezerwacja24-backup.log" ]; then
    echo -e "${YELLOW}📝 Ostatnie 5 linii z logów:${NC}"
    tail -5 /var/log/rezerwacja24-backup.log | sed 's/^/   /'
else
    echo -e "${YELLOW}📝 Brak pliku logów${NC}"
fi
echo ""

echo -e "${GREEN}✅ Sprawdzenie zakończone${NC}"
