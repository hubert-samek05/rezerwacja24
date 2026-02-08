#!/bin/bash

# Rezerwacja24 - Google OAuth Setup Helper
# Ten skrypt pomoże skonfigurować Google OAuth

echo "🔐 Konfiguracja Google OAuth dla Rezerwacja24"
echo "=============================================="
echo ""

# Kolory
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Sprawdź czy jesteśmy w odpowiednim katalogu
if [ ! -f "backend/.env.example" ]; then
    echo -e "${RED}❌ Błąd: Uruchom ten skrypt z głównego katalogu projektu${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Krok 1: Przygotowanie${NC}"
echo ""
echo "Przed kontynuacją, upewnij się że:"
echo "  1. ✅ Masz konto Google"
echo "  2. ✅ Utworzyłeś projekt w Google Cloud Console"
echo "  3. ✅ Skonfigurowałeś OAuth Consent Screen"
echo "  4. ✅ Utworzyłeś OAuth 2.0 Client ID"
echo ""
echo "Jeśli nie, przeczytaj instrukcję: GOOGLE_OAUTH_SETUP.md"
echo ""

read -p "Czy masz już Client ID i Client Secret? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}📖 Przeczytaj instrukcję w pliku: GOOGLE_OAUTH_SETUP.md${NC}"
    echo ""
    echo "Szybki link do Google Cloud Console:"
    echo "https://console.cloud.google.com/apis/credentials"
    echo ""
    exit 0
fi

echo ""
echo -e "${BLUE}📋 Krok 2: Wprowadź Credentials${NC}"
echo ""

# Pobierz Client ID
read -p "Wklej Google Client ID: " GOOGLE_CLIENT_ID
echo ""

# Pobierz Client Secret
read -p "Wklej Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Potwierdź dane
echo ""
echo -e "${YELLOW}⚠️  Sprawdź wprowadzone dane:${NC}"
echo ""
echo "Client ID:     $GOOGLE_CLIENT_ID"
echo "Client Secret: ${GOOGLE_CLIENT_SECRET:0:20}..."
echo ""

read -p "Czy dane są poprawne? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Anulowano${NC}"
    exit 0
fi

# Sprawdź czy plik .env istnieje
if [ ! -f "backend/.env" ]; then
    echo ""
    echo -e "${YELLOW}📄 Tworzę plik backend/.env z .env.example...${NC}"
    cp backend/.env.example backend/.env
fi

# Aktualizuj .env
echo ""
echo -e "${BLUE}📝 Krok 3: Aktualizacja pliku .env${NC}"

# Backup
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Utworzono backup: backend/.env.backup.*"

# Aktualizuj wartości
if grep -q "^GOOGLE_CLIENT_ID=" backend/.env; then
    sed -i "s|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID|" backend/.env
else
    echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> backend/.env
fi

if grep -q "^GOOGLE_CLIENT_SECRET=" backend/.env; then
    sed -i "s|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET|" backend/.env
else
    echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> backend/.env
fi

if grep -q "^GOOGLE_CALLBACK_URL=" backend/.env; then
    sed -i "s|^GOOGLE_CALLBACK_URL=.*|GOOGLE_CALLBACK_URL=https://api.rezerwacja24.pl/api/auth/google/callback|" backend/.env
else
    echo "GOOGLE_CALLBACK_URL=https://api.rezerwacja24.pl/api/auth/google/callback" >> backend/.env
fi

if grep -q "^FRONTEND_URL=" backend/.env; then
    sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=https://rezerwacja24.pl|" backend/.env
else
    echo "FRONTEND_URL=https://rezerwacja24.pl" >> backend/.env
fi

echo "✅ Zaktualizowano backend/.env"

# Restart backend
echo ""
echo -e "${BLUE}🔄 Krok 4: Restart Backend${NC}"
echo ""

read -p "Czy zrestartować backend teraz? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Zatrzymuję stary proces..."
    pkill -f "node dist" || true
    sleep 2
    
    echo "Uruchamiam nowy proces..."
    cd backend
    nohup node dist/src/main.js > /var/log/rezerwacja24-backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    echo "✅ Backend uruchomiony (PID: $BACKEND_PID)"
    echo ""
    echo "Czekam 5 sekund na uruchomienie..."
    sleep 5
    
    # Sprawdź czy działa
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend działa poprawnie!${NC}"
    else
        echo -e "${RED}❌ Backend może nie działać. Sprawdź logi:${NC}"
        echo "   tail -f /var/log/rezerwacja24-backend.log"
    fi
fi

echo ""
echo -e "${GREEN}✅ Konfiguracja zakończona!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 Następne kroki:${NC}"
echo ""
echo "1. Sprawdź logi backendu:"
echo "   tail -f /var/log/rezerwacja24-backend.log"
echo ""
echo "2. Przetestuj logowanie:"
echo "   Otwórz: https://rezerwacja24.pl/login"
echo "   Kliknij: 'Zaloguj przez Google'"
echo ""
echo "3. W razie problemów sprawdź:"
echo "   - Google Cloud Console → Credentials"
echo "   - Authorized redirect URIs musi zawierać:"
echo "     https://api.rezerwacja24.pl/api/auth/google/callback"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Gotowe! Powodzenia!${NC}"
echo ""
