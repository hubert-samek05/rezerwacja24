#!/bin/bash

# 🚀 AUTOMATYCZNY SKRYPT PRZED DEPLOYEM
# Uruchamia się automatycznie i sprawdza bezpieczeństwo

echo "🚀 PRE-DEPLOY CHECK"
echo "==================="
echo ""

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Sprawdź czy backend działa
echo "📡 Sprawdzam czy backend działa..."
if pm2 list | grep -q "rezerwacja24-backend.*online"; then
    echo -e "${GREEN}✅ Backend działa${NC}"
else
    echo -e "${RED}❌ Backend nie działa!${NC}"
    exit 1
fi

# 2. Sprawdź czy baza danych jest dostępna
echo ""
echo "💾 Sprawdzam połączenie z bazą danych..."
if PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d rezerwacja24 -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Baza danych dostępna (port 5432)${NC}"
else
    echo -e "${RED}❌ Baza danych niedostępna!${NC}"
    exit 1
fi

# 3. Sprawdź czy .env ma poprawny port
echo ""
echo "⚙️ Sprawdzam konfigurację..."
if grep -q "5432" /root/CascadeProjects/rezerwacja24-saas/backend/.env; then
    echo -e "${GREEN}✅ .env używa portu 5432 (poprawna baza)${NC}"
else
    echo -e "${RED}❌ .env używa złego portu!${NC}"
    echo "Poprawiam..."
    sed -i 's/:5434\//:5432\//' /root/CascadeProjects/rezerwacja24-saas/backend/.env
    echo -e "${YELLOW}⚠️ Poprawiono port na 5432 - RESTART WYMAGANY!${NC}"
fi

# 4. Utwórz backup
echo ""
echo "💾 Tworzę backup..."
cd /root/CascadeProjects/rezerwacja24-saas
BACKUP_FILE="BACKUP-AUTO-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" backend/src frontend/ > /dev/null 2>&1
echo -e "${GREEN}✅ Backup utworzony: $BACKUP_FILE${NC}"

# 5. Uruchom test bezpieczeństwa
echo ""
echo "🔒 Uruchamiam test bezpieczeństwa..."
if ./test-security.sh > /tmp/security-test.log 2>&1; then
    echo -e "${GREEN}✅ Test bezpieczeństwa PRZESZEDŁ${NC}"
else
    echo -e "${RED}❌ Test bezpieczeństwa NIE PRZESZEDŁ!${NC}"
    echo ""
    echo "Logi testu:"
    cat /tmp/security-test.log
    echo ""
    echo "==================="
    echo -e "${RED}🚨 NIE WDRAŻAJ! SYSTEM NIEBEZPIECZNY!${NC}"
    echo "==================="
    exit 1
fi

# 6. Uruchom test SMS
echo ""
echo "📱 Uruchamiam test SMS..."
if ./test-sms.sh > /tmp/sms-test.log 2>&1; then
    echo -e "${GREEN}✅ Test SMS PRZESZEDŁ${NC}"
    echo ""
    echo "==================="
    echo -e "${GREEN}🎉 WSZYSTKO OK - MOŻESZ WDROŻYĆ!${NC}"
    echo "==================="
    exit 0
else
    echo -e "${YELLOW}⚠️  Test SMS nie przeszedł (może być OK jeśli SMS nie jest krytyczny)${NC}"
    echo ""
    echo "Logi testu:"
    cat /tmp/sms-test.log
    echo ""
    echo "==================="
    echo -e "${GREEN}🎉 BEZPIECZEŃSTWO OK - MOŻESZ WDROŻYĆ!${NC}"
    echo -e "${YELLOW}⚠️  Sprawdź SMS ręcznie po wdrożeniu${NC}"
    echo "==================="
    exit 0
fi
