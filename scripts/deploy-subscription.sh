#!/bin/bash

# 🚀 Skrypt wdrożenia systemu subskrypcji
# Autor: Rezerwacja24 Team
# Data: 2024-12-10

set -e

echo "🎯 Wdrożenie systemu subskrypcji Rezerwacja24"
echo "=============================================="
echo ""

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcje pomocnicze
function success() {
    echo -e "${GREEN}✓${NC} $1"
}

function error() {
    echo -e "${RED}✗${NC} $1"
}

function warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

function info() {
    echo -e "ℹ $1"
}

# Sprawdź czy jesteśmy w głównym katalogu projektu
if [ ! -f "ARCHITECTURE.md" ]; then
    error "Uruchom skrypt z głównego katalogu projektu!"
    exit 1
fi

# Krok 1: Sprawdź zmienne środowiskowe
echo "📋 Krok 1: Sprawdzanie zmiennych środowiskowych..."
echo ""

if [ ! -f "backend/.env" ]; then
    error "Brak pliku backend/.env"
    exit 1
fi

# Sprawdź czy są ustawione klucze Stripe
if ! grep -q "STRIPE_SECRET_KEY=sk_" backend/.env; then
    warning "STRIPE_SECRET_KEY nie jest ustawiony w backend/.env"
    echo "Dodaj: STRIPE_SECRET_KEY=sk_live_xxxxx"
fi

if ! grep -q "STRIPE_WEBHOOK_SECRET=whsec_" backend/.env; then
    warning "STRIPE_WEBHOOK_SECRET nie jest ustawiony w backend/.env"
    echo "Dodaj: STRIPE_WEBHOOK_SECRET=whsec_xxxxx"
fi

success "Zmienne środowiskowe sprawdzone"
echo ""

# Krok 2: Backend
echo "🔧 Krok 2: Wdrożenie backendu..."
echo ""

cd backend

# Zainstaluj zależności
info "Instalowanie zależności..."
npm install --production

# Wygeneruj Prisma Client
info "Generowanie Prisma Client..."
npx prisma generate

# Zastosuj zmiany w bazie danych
info "Aktualizacja bazy danych..."
read -p "Czy chcesz zastosować zmiany w bazie danych? (tak/nie): " confirm
if [ "$confirm" = "tak" ]; then
    npx prisma db push --accept-data-loss
    success "Baza danych zaktualizowana"
else
    warning "Pominięto aktualizację bazy danych"
fi

# Zbuduj aplikację
info "Budowanie aplikacji..."
npm run build

success "Backend wdrożony"
echo ""

cd ..

# Krok 3: Frontend
echo "🎨 Krok 3: Wdrożenie frontendu..."
echo ""

cd frontend

# Zainstaluj zależności
info "Instalowanie zależności..."
npm install --production

# Zbuduj aplikację
info "Budowanie aplikacji..."
npm run build

success "Frontend wdrożony"
echo ""

cd ..

# Krok 4: Seed planu subskrypcji
echo "🌱 Krok 4: Tworzenie planu subskrypcji..."
echo ""

read -p "Czy chcesz utworzyć plan subskrypcji w bazie? (tak/nie): " confirm
if [ "$confirm" = "tak" ]; then
    cd backend
    npx ts-node prisma/seed-subscription-plan.ts
    success "Plan subskrypcji utworzony"
    cd ..
else
    warning "Pominięto tworzenie planu subskrypcji"
fi

echo ""

# Krok 5: Restart serwisów
echo "🔄 Krok 5: Restart serwisów..."
echo ""

read -p "Czy chcesz zrestartować serwisy? (tak/nie): " confirm
if [ "$confirm" = "tak" ]; then
    # Sprawdź czy PM2 jest zainstalowany
    if command -v pm2 &> /dev/null; then
        info "Restartowanie przez PM2..."
        pm2 restart rezerwacja24-backend || warning "Nie znaleziono procesu rezerwacja24-backend"
        pm2 restart rezerwacja24-frontend || warning "Nie znaleziono procesu rezerwacja24-frontend"
        success "Serwisy zrestartowane (PM2)"
    # Sprawdź czy systemd jest dostępny
    elif command -v systemctl &> /dev/null; then
        info "Restartowanie przez systemd..."
        sudo systemctl restart rezerwacja24-backend || warning "Nie znaleziono serwisu rezerwacja24-backend"
        sudo systemctl restart rezerwacja24-frontend || warning "Nie znaleziono serwisu rezerwacja24-frontend"
        success "Serwisy zrestartowane (systemd)"
    else
        warning "Nie znaleziono PM2 ani systemd. Zrestartuj serwisy ręcznie."
    fi
else
    warning "Pominięto restart serwisów"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Wdrożenie zakończone!${NC}"
echo "=============================================="
echo ""
echo "📝 Następne kroki:"
echo ""
echo "1. Skonfiguruj produkt w Stripe Dashboard:"
echo "   https://dashboard.stripe.com/products"
echo ""
echo "2. Skonfiguruj webhooks w Stripe:"
echo "   https://dashboard.stripe.com/webhooks"
echo "   Endpoint: https://api.rezerwacja24.pl/billing/webhook"
echo ""
echo "3. Zaktualizuj zmienne środowiskowe:"
echo "   - STRIPE_PRODUCT_ID"
echo "   - STRIPE_PRICE_ID"
echo ""
echo "4. Przetestuj system:"
echo "   - Przejdź do /dashboard/settings/subscription"
echo "   - Użyj testowej karty: 4242 4242 4242 4242"
echo ""
echo "5. Sprawdź logi:"
echo "   pm2 logs rezerwacja24-backend"
echo ""
echo "📖 Pełna dokumentacja: SUBSCRIPTION_SETUP.md"
echo ""
