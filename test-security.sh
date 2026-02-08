#!/bin/bash

# 🔒 AUTOMATYCZNY TEST BEZPIECZEŃSTWA
# Sprawdza czy każde konto widzi tylko swoje dane

echo "🔒 TEST BEZPIECZEŃSTWA - Izolacja danych między tenantami"
echo "=========================================================="

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Tenant IDs do testowania
TENANT_A="1701364800000"
TENANT_B="tenant-1765403042748-f2vwt00yr"

echo ""
echo "📊 Test 1: Customers - różne dane dla różnych tenantów"
echo "-------------------------------------------------------"

# Pobierz customers dla tenant A
CUSTOMERS_A=$(curl -s -H "X-Tenant-ID: $TENANT_A" http://localhost:3001/api/customers | jq 'length')
echo "Tenant A ($TENANT_A): $CUSTOMERS_A klientów"

# Pobierz customers dla tenant B
CUSTOMERS_B=$(curl -s -H "X-Tenant-ID: $TENANT_B" http://localhost:3001/api/customers | jq 'length')
echo "Tenant B ($TENANT_B): $CUSTOMERS_B klientów"

if [ "$CUSTOMERS_A" != "$CUSTOMERS_B" ]; then
    echo -e "${GREEN}✅ PASS - Różne dane dla różnych tenantów${NC}"
else
    echo -e "${RED}❌ FAIL - Te same dane! KRYTYCZNY BŁĄD BEZPIECZEŃSTWA!${NC}"
    exit 1
fi

echo ""
echo "📊 Test 2: Employees - różne dane dla różnych tenantów"
echo "-------------------------------------------------------"

EMPLOYEES_A=$(curl -s -H "X-Tenant-ID: $TENANT_A" http://localhost:3001/api/employees | jq 'length')
echo "Tenant A: $EMPLOYEES_A pracowników"

EMPLOYEES_B=$(curl -s -H "X-Tenant-ID: $TENANT_B" http://localhost:3001/api/employees | jq 'length')
echo "Tenant B: $EMPLOYEES_B pracowników"

if [ "$EMPLOYEES_A" != "$EMPLOYEES_B" ]; then
    echo -e "${GREEN}✅ PASS - Różne dane dla różnych tenantów${NC}"
else
    echo -e "${RED}❌ FAIL - Te same dane! KRYTYCZNY BŁĄD BEZPIECZEŃSTWA!${NC}"
    exit 1
fi

echo ""
echo "📊 Test 3: Bookings - różne dane dla różnych tenantów"
echo "-------------------------------------------------------"

BOOKINGS_A=$(curl -s -H "X-Tenant-ID: $TENANT_A" http://localhost:3001/api/bookings | jq 'length')
echo "Tenant A: $BOOKINGS_A rezerwacji"

BOOKINGS_B=$(curl -s -H "X-Tenant-ID: $TENANT_B" http://localhost:3001/api/bookings | jq 'length')
echo "Tenant B: $BOOKINGS_B rezerwacji"

if [ "$BOOKINGS_A" != "$BOOKINGS_B" ]; then
    echo -e "${GREEN}✅ PASS - Różne dane dla różnych tenantów${NC}"
else
    echo -e "${RED}❌ FAIL - Te same dane! KRYTYCZNY BŁĄD BEZPIECZEŃSTWA!${NC}"
    exit 1
fi

echo ""
echo "📊 Test 4: Brak tenantId - powinien zwrócić błąd"
echo "-------------------------------------------------------"

RESPONSE=$(curl -s http://localhost:3001/api/customers)
if echo "$RESPONSE" | grep -q "Tenant ID is required"; then
    echo -e "${GREEN}✅ PASS - Błąd zwrócony poprawnie${NC}"
else
    echo -e "${RED}❌ FAIL - Brak walidacji tenantId!${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "=========================================================="
echo -e "${GREEN}🎉 WSZYSTKIE TESTY PRZESZŁY - SYSTEM BEZPIECZNY!${NC}"
echo "=========================================================="
echo ""
echo "Data testu: $(date)"
echo "Tenant A: $TENANT_A ($CUSTOMERS_A klientów, $EMPLOYEES_A pracowników, $BOOKINGS_A rezerwacji)"
echo "Tenant B: $TENANT_B ($CUSTOMERS_B klientów, $EMPLOYEES_B pracowników, $BOOKINGS_B rezerwacji)"
