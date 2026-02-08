#!/bin/bash

# Test API Endpoints - Rezerwacja24
# Użycie: ./test-api.sh

set -e

API_URL="https://api.rezerwacja24.pl"
TENANT_ID="1701364800000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Rezerwacja24 API..."
echo "API URL: $API_URL"
echo "Tenant ID: $TENANT_ID"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing: $description... "
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        return 1
    fi
}

# Function to test JSON response
test_json_field() {
    local endpoint=$1
    local field=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    response=$(curl -s "$API_URL$endpoint")
    value=$(echo "$response" | jq -r ".$field")
    
    if [ "$value" != "null" ] && [ "$value" != "" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Value: $value)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Field '$field' is null or empty)"
        echo "Response: $response"
        return 1
    fi
}

# Function to test array length
test_array_length() {
    local endpoint=$1
    local min_length=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    response=$(curl -s "$API_URL$endpoint")
    length=$(echo "$response" | jq 'length')
    
    if [ "$length" -ge "$min_length" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Length: $length)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected >= $min_length, Got: $length)"
        return 1
    fi
}

# Function to test nested field
test_nested_field() {
    local endpoint=$1
    local path=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    response=$(curl -s "$API_URL$endpoint")
    value=$(echo "$response" | jq -r "$path")
    
    if [ "$value" != "null" ] && [ "$value" != "" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Path '$path' is null or empty)"
        echo "Response: $response"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 TENANTS (Firmy)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/api/tenants/$TENANT_ID" "200" "GET /api/tenants/:id"
test_json_field "/api/tenants/$TENANT_ID" "name" "Tenant has name field"
test_json_field "/api/tenants/$TENANT_ID" "email" "Tenant has email field"
test_json_field "/api/tenants/$TENANT_ID" "subdomain" "Tenant has subdomain field"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛠️  SERVICES (Usługi)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/api/services" "200" "GET /api/services"
test_array_length "/api/services" "1" "Services array has at least 1 item"
test_nested_field "/api/services" ".[0].name" "Service has name field"
test_nested_field "/api/services" ".[0].service_categories.name" "Service has service_categories.name"
test_nested_field "/api/services" ".[0].service_employees[0].employeeId" "Service has service_employees with employeeId"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 SERVICE CATEGORIES (Kategorie)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/api/service-categories" "200" "GET /api/service-categories"
test_array_length "/api/service-categories" "1" "Categories array has at least 1 item"
test_nested_field "/api/service-categories" ".[0].name" "Category has name field"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 EMPLOYEES (Pracownicy)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/api/employees" "200" "GET /api/employees"
test_array_length "/api/employees" "1" "Employees array has at least 1 item"
test_nested_field "/api/employees" ".[0].firstName" "Employee has firstName field"
test_nested_field "/api/employees" ".[0].service_employees[0].serviceId" "Employee has service_employees with serviceId"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 BOOKINGS (Rezerwacje)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/api/bookings" "200" "GET /api/bookings"
test_array_length "/api/bookings" "1" "Bookings array has at least 1 item"
test_nested_field "/api/bookings" ".[0].customers.firstName" "Booking has customers.firstName"
test_nested_field "/api/bookings" ".[0].services.name" "Booking has services.name"
test_nested_field "/api/bookings" ".[0].employees.firstName" "Booking has employees.firstName"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 CUSTOMERS (Klienci)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/api/customers" "200" "GET /api/customers"
test_array_length "/api/customers" "1" "Customers array has at least 1 item"
test_nested_field "/api/customers" ".[0].firstName" "Customer has firstName field"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ANALYTICS (Analityka)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "GET" "/api/analytics/overview" "200" "GET /api/analytics/overview"
test_nested_field "/api/analytics/overview" ".bookings.total" "Analytics has bookings.total"
test_nested_field "/api/analytics/overview" ".customers.total" "Analytics has customers.total"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${GREEN}All critical API endpoints are working!${NC}"
echo ""
echo "💡 Tips:"
echo "  - Run this script after any backend changes"
echo "  - Add new tests when adding new endpoints"
echo "  - Check logs if tests fail: pm2 logs rezerwacja24-backend"
echo ""
