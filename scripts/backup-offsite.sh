#!/bin/bash

# ============================================
# BACKUP OFFSITE - Backblaze B2
# ============================================
# Wysyła backupy do chmury Backblaze B2
# ============================================

set -e

# Konfiguracja
BACKUP_DIR="/var/backups/rezerwacja24"
BUCKET="backblaze:rezerwacja24-backups"
LOG_FILE="/var/log/rezerwacja24-offsite-backup.log"

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $1" >> "$LOG_FILE"
    echo -e "$1"
}

log "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
log "${BLUE}║       ☁️  BACKUP OFFSITE - Backblaze B2 ☁️                 ║${NC}"
log "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
log ""

# Sprawdź czy rclone jest zainstalowany
if ! command -v rclone &> /dev/null; then
    log "${RED}❌ rclone nie jest zainstalowany!${NC}"
    exit 1
fi

# Sprawdź połączenie z Backblaze
log "${YELLOW}[1/4] Sprawdzanie połączenia z Backblaze...${NC}"
if ! rclone lsd backblaze: &> /dev/null; then
    log "${RED}❌ Nie można połączyć się z Backblaze!${NC}"
    exit 1
fi
log "${GREEN}✅ Połączenie OK${NC}"

# COPY backupów bazy danych (NIE sync - nie usuwa plików z chmury!)
log ""
log "${YELLOW}[2/4] Wysyłanie backupów bazy danych...${NC}"
rclone copy "$BACKUP_DIR/database/" "$BUCKET/database/" \
    --progress \
    --transfers 4 \
    --checkers 8 \
    --contimeout 60s \
    --timeout 300s \
    --retries 3 \
    --low-level-retries 10 \
    --stats 10s \
    --ignore-existing \
    2>&1 | tee -a "$LOG_FILE"

# COPY safe-backupów (NIE sync!)
log ""
log "${YELLOW}[3/4] Wysyłanie safe-backupów...${NC}"
if [ -d "$BACKUP_DIR/safe-backups" ]; then
    rclone copy "$BACKUP_DIR/safe-backups/" "$BUCKET/safe-backups/" \
        --progress \
        --transfers 4 \
        --checkers 8 \
        --contimeout 60s \
        --timeout 300s \
        --retries 3 \
        --low-level-retries 10 \
        --stats 10s \
        --ignore-existing \
        2>&1 | tee -a "$LOG_FILE"
else
    log "${YELLOW}⚠️ Brak katalogu safe-backups${NC}"
fi

# Pokaż statystyki
log ""
log "${YELLOW}[4/4] Statystyki w chmurze...${NC}"
CLOUD_SIZE=$(rclone size "$BUCKET" --json 2>/dev/null | grep -o '"bytes":[0-9]*' | grep -o '[0-9]*')
CLOUD_COUNT=$(rclone size "$BUCKET" --json 2>/dev/null | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

if [ -n "$CLOUD_SIZE" ]; then
    CLOUD_SIZE_MB=$((CLOUD_SIZE / 1024 / 1024))
    log "${BLUE}Plików w chmurze:${NC} $CLOUD_COUNT"
    log "${BLUE}Rozmiar w chmurze:${NC} ${CLOUD_SIZE_MB} MB"
fi

log ""
log "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
log "${GREEN}║           ✅ BACKUP OFFSITE ZAKOŃCZONY!                    ║${NC}"
log "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
log ""

# Lista plików w chmurze
log "${YELLOW}Ostatnie pliki w chmurze:${NC}"
rclone ls "$BUCKET/database/" 2>/dev/null | tail -5
log ""
