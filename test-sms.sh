#!/bin/bash

# 🧪 TEST SYSTEMU SMS - Rezerwacja24
# Sprawdza czy system SMS działa poprawnie

echo "🧪 TEST SYSTEMU SMS"
echo "===================="
echo ""

# Kolory
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TENANT_ID="1701364800000"
API_URL="http://localhost:3001/api"

# Test 1: Sprawdź czy backend działa
echo "1️⃣ Sprawdzanie backendu..."
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend działa${NC}"
else
    echo -e "${RED}❌ Backend nie odpowiada${NC}"
    exit 1
fi

# Test 2: Sprawdź status SMS
echo ""
echo "2️⃣ Sprawdzanie statusu SMS..."
STATUS=$(curl -s -X GET "$API_URL/sms/status" \
    -H "X-Tenant-ID: $TENANT_ID")

if echo "$STATUS" | grep -q "remaining"; then
    REMAINING=$(echo "$STATUS" | grep -o '"remaining":[0-9]*' | grep -o '[0-9]*')
    echo -e "${GREEN}✅ Status SMS: $REMAINING SMS pozostało${NC}"
else
    echo -e "${RED}❌ Nie można pobrać statusu SMS${NC}"
    exit 1
fi

# Test 3: Sprawdź ustawienia SMS
echo ""
echo "3️⃣ Sprawdzanie ustawień SMS..."
SETTINGS=$(curl -s -X GET "$API_URL/sms/settings" \
    -H "X-Tenant-ID: $TENANT_ID")

if echo "$SETTINGS" | grep -q "confirmedEnabled"; then
    echo -e "${GREEN}✅ Ustawienia SMS dostępne${NC}"
else
    echo -e "${RED}❌ Nie można pobrać ustawień SMS${NC}"
    exit 1
fi

# Test 4: Sprawdź konfigurację .env
echo ""
echo "4️⃣ Sprawdzanie konfiguracji..."
if grep -q "FLYSMS_API_KEY=scyMfnjzGQwnvRpGEvTCbolWnMZFRk6d" backend/.env; then
    echo -e "${GREEN}✅ Klucz API skonfigurowany${NC}"
else
    echo -e "${RED}❌ Brak klucza API w .env${NC}"
    exit 1
fi

if grep -q "FLYSMS_SENDER=Rezerwacja" backend/.env; then
    echo -e "${GREEN}✅ Nadawca skonfigurowany (Rezerwacja)${NC}"
else
    echo -e "${YELLOW}⚠️  Nadawca może być niepoprawny${NC}"
fi

# Test 5: Sprawdź czy FlySMSService jest załadowany
echo ""
echo "5️⃣ Sprawdzanie logów SMS..."
if pm2 logs rezerwacja24-backend --lines 50 --nostream 2>&1 | grep -q "FlySMSService"; then
    echo -e "${GREEN}✅ FlySMSService załadowany${NC}"
else
    echo -e "${YELLOW}⚠️  Brak logów FlySMSService (może być OK jeśli nie było SMS)${NC}"
fi

# Test 6: Sprawdź strukturę bazy danych
echo ""
echo "6️⃣ Sprawdzanie struktury bazy danych..."
DB_CHECK=$(PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='tenants' AND column_name IN ('sms_usage', 'sms_settings');" 2>&1)

if echo "$DB_CHECK" | grep -q "sms_usage"; then
    echo -e "${GREEN}✅ Kolumna sms_usage istnieje${NC}"
else
    echo -e "${RED}❌ Brak kolumny sms_usage${NC}"
    exit 1
fi

if echo "$DB_CHECK" | grep -q "sms_settings"; then
    echo -e "${GREEN}✅ Kolumna sms_settings istnieje${NC}"
else
    echo -e "${RED}❌ Brak kolumny sms_settings${NC}"
    exit 1
fi

# Podsumowanie
echo ""
echo "===================="
echo -e "${GREEN}🎉 WSZYSTKIE TESTY PRZESZŁY!${NC}"
echo ""
echo "System SMS jest gotowy i zabezpieczony!"
echo ""
echo "📝 Aby wysłać testowy SMS:"
echo "   curl -X POST $API_URL/sms/test \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'X-Tenant-ID: $TENANT_ID' \\"
echo "     -d '{\"phone\":\"506785959\",\"message\":\"Test\"}'"
echo ""
