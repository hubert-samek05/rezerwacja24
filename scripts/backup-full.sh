#!/bin/bash

# Pełny backup systemu rezerwacja24.pl
# Obejmuje: bazę danych, Redis, pliki aplikacji, konfigurację
# Data: $(date +%Y-%m-%d)

set -e

# Konfiguracja
BACKUP_DIR="/var/backups/rezerwacja24"
DATE=$(date +%Y%m%d_%H%M%S)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/rezerwacja24-backup.log"

# Kolory dla outputu
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkcja logowania
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Header
clear
log "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
log "${BLUE}║         BACKUP SYSTEMU REZERWACJA24.PL                    ║${NC}"
log "${BLUE}║         Data: $(date '+%Y-%m-%d %H:%M:%S')                        ║${NC}"
log "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
log ""

START_TIME=$(date +%s)

# Utwórz główny katalog backupu
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/full_${DATE}"

# 1. Backup bazy danych PostgreSQL
log "${GREEN}[1/4] Backup bazy danych PostgreSQL...${NC}"
if [ -f "$SCRIPT_DIR/backup-database.sh" ]; then
    bash "$SCRIPT_DIR/backup-database.sh" 2>&1 | tee -a "$LOG_FILE"
else
    log "${RED}❌ Nie znaleziono skryptu backup-database.sh${NC}"
fi
log ""

# 2. Backup Redis
log "${GREEN}[2/4] Backup Redis...${NC}"
if [ -f "$SCRIPT_DIR/backup-redis.sh" ]; then
    bash "$SCRIPT_DIR/backup-redis.sh" 2>&1 | tee -a "$LOG_FILE"
else
    log "${RED}❌ Nie znaleziono skryptu backup-redis.sh${NC}"
fi
log ""

# 3. Backup plików aplikacji
log "${GREEN}[3/4] Backup plików aplikacji...${NC}"
if [ -f "$SCRIPT_DIR/backup-files.sh" ]; then
    bash "$SCRIPT_DIR/backup-files.sh" 2>&1 | tee -a "$LOG_FILE"
else
    log "${RED}❌ Nie znaleziono skryptu backup-files.sh${NC}"
fi
log ""

# 4. Tworzenie archiwum zbiorczego
log "${GREEN}[4/4] Tworzenie archiwum zbiorczego...${NC}"
log "${YELLOW}Pakowanie wszystkich backupów...${NC}"

# Kopiuj najnowsze backupy do katalogu zbiorczego
cp "$BACKUP_DIR/database/db_${DATE}.dump.gz" "$BACKUP_DIR/full_${DATE}/" 2>/dev/null || true
cp "$BACKUP_DIR/redis/redis_${DATE}.rdb.gz" "$BACKUP_DIR/full_${DATE}/" 2>/dev/null || true
cp "$BACKUP_DIR/files/frontend_${DATE}.tar.gz" "$BACKUP_DIR/full_${DATE}/" 2>/dev/null || true
cp "$BACKUP_DIR/files/backend_${DATE}.tar.gz" "$BACKUP_DIR/full_${DATE}/" 2>/dev/null || true
cp "$BACKUP_DIR/files/config_${DATE}.tar.gz" "$BACKUP_DIR/full_${DATE}/" 2>/dev/null || true
cp "$BACKUP_DIR/files/docs_${DATE}.tar.gz" "$BACKUP_DIR/full_${DATE}/" 2>/dev/null || true

# Utwórz plik README w archiwum
cat > "$BACKUP_DIR/full_${DATE}/README.txt" << EOF
BACKUP REZERWACJA24.PL
======================

Data utworzenia: $(date)
Wersja systemu: 1.0.0

ZAWARTOŚĆ:
----------
1. db_${DATE}.dump.gz - Baza danych PostgreSQL (format custom)
2. redis_${DATE}.rdb.gz - Redis dump
3. frontend_${DATE}.tar.gz - Aplikacja frontend (Next.js)
4. backend_${DATE}.tar.gz - Aplikacja backend (NestJS)
5. config_${DATE}.tar.gz - Konfiguracja Docker i Nginx
6. docs_${DATE}.tar.gz - Dokumentacja

PRZYWRACANIE BAZY DANYCH:
--------------------------
gunzip db_${DATE}.dump.gz
pg_restore -U postgres -d rezerwacja24 db_${DATE}.dump

PRZYWRACANIE REDIS:
-------------------
gunzip redis_${DATE}.rdb.gz
cp redis_${DATE}.rdb /var/lib/redis/dump.rdb
systemctl restart redis

PRZYWRACANIE APLIKACJI:
-----------------------
tar -xzf frontend_${DATE}.tar.gz -C /root/CascadeProjects/rezerwacja24-saas/
tar -xzf backend_${DATE}.tar.gz -C /root/CascadeProjects/rezerwacja24-saas/
cd /root/CascadeProjects/rezerwacja24-saas/frontend && npm install && npm run build
cd /root/CascadeProjects/rezerwacja24-saas/backend && npm install && npm run build

KONTAKT:
--------
Email: support@rezerwacja24.pl
Dokumentacja: https://docs.rezerwacja24.pl
EOF

# Utwórz archiwum tar.gz ze wszystkiego
cd "$BACKUP_DIR"
tar -czf "full_backup_${DATE}.tar.gz" "full_${DATE}/"

# Statystyki
BACKUP_SIZE=$(du -h "full_backup_${DATE}.tar.gz" | cut -f1)
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log ""
log "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
log "${BLUE}║                 BACKUP ZAKOŃCZONY                          ║${NC}"
log "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
log ""
log "${GREEN}✅ Pełny backup systemu zakończony pomyślnie!${NC}"
log ""
log "${YELLOW}SZCZEGÓŁY:${NC}"
log "  📁 Katalog: $BACKUP_DIR"
log "  📦 Archiwum: full_backup_${DATE}.tar.gz"
log "  💾 Rozmiar: $BACKUP_SIZE"
log "  ⏱️  Czas trwania: ${DURATION}s"
log ""
log "${YELLOW}ZAWARTOŚĆ BACKUPU:${NC}"
log "  ✓ Baza danych PostgreSQL"
log "  ✓ Redis cache"
log "  ✓ Aplikacja frontend (Next.js)"
log "  ✓ Aplikacja backend (NestJS)"
log "  ✓ Konfiguracja Nginx"
log "  ✓ Konfiguracja Docker"
log "  ✓ Dokumentacja"
log ""
log "${YELLOW}LOKALIZACJA:${NC}"
log "  $BACKUP_DIR/full_backup_${DATE}.tar.gz"
log ""

# Usuń tymczasowy katalog
rm -rf "$BACKUP_DIR/full_${DATE}"

# Usuń stare pełne backupy (starsze niż 7 dni)
log "${YELLOW}Czyszczenie starych pełnych backupów (>7 dni)...${NC}"
find "$BACKUP_DIR" -name "full_backup_*.tar.gz" -mtime +7 -delete
log "${GREEN}✅ Czyszczenie zakończone!${NC}"
log ""

# Podsumowanie miejsca na dysku
log "${YELLOW}MIEJSCE NA DYSKU:${NC}"
df -h "$BACKUP_DIR" | tail -1 | awk '{print "  Użyte: " $3 " / " $2 " (" $5 ")"}'
log ""

log "${GREEN}🎉 Backup gotowy do pobrania lub archiwizacji!${NC}"
log ""
