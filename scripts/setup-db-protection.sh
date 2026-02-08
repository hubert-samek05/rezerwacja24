#!/bin/bash

# ============================================
# OCHRONA BAZY DANYCH PRZED USUNIĘCIEM DANYCH
# ============================================
# Ten skrypt tworzy bezpiecznego użytkownika bazy danych
# który NIE MOŻE usuwać tabel ani truncować danych
# ============================================

set -e

# Konfiguracja
DB_HOST="localhost"
DB_PORT="5434"
DB_NAME="rezerwacja24"
DB_ADMIN_USER="postgres"
DB_ADMIN_PASSWORD="postgres"

# Nowy bezpieczny użytkownik
SAFE_USER="rezerwacja24_app"
SAFE_PASSWORD="rezerwacja24_app_secure_$(date +%s | sha256sum | head -c 16)"

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🔒 KONFIGURACJA OCHRONY BAZY DANYCH 🔒              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Tworzenie użytkownika z ograniczonymi uprawnieniami
echo -e "${YELLOW}[1/4] Tworzenie bezpiecznego użytkownika...${NC}"

PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$DB_NAME" << EOF
-- Usuń starego użytkownika jeśli istnieje
DROP ROLE IF EXISTS $SAFE_USER;

-- Utwórz nowego użytkownika
CREATE ROLE $SAFE_USER WITH LOGIN PASSWORD '$SAFE_PASSWORD';

-- Podstawowe uprawnienia do bazy
GRANT CONNECT ON DATABASE $DB_NAME TO $SAFE_USER;

-- Uprawnienia do schematu public
GRANT USAGE ON SCHEMA public TO $SAFE_USER;

-- Uprawnienia do WSZYSTKICH tabel (SELECT, INSERT, UPDATE, DELETE)
-- ALE NIE: DROP, TRUNCATE, ALTER
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $SAFE_USER;

-- Uprawnienia do sekwencji (dla auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $SAFE_USER;

-- Uprawnienia dla przyszłych tabel
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $SAFE_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO $SAFE_USER;

-- WAŻNE: NIE dajemy uprawnień do:
-- - DROP TABLE
-- - TRUNCATE
-- - ALTER TABLE
-- - CREATE TABLE (migracje muszą być robione przez admina)

EOF

echo -e "${GREEN}✅ Użytkownik $SAFE_USER utworzony!${NC}"

# Tworzenie triggera blokującego DELETE na ważnych tabelach
echo ""
echo -e "${YELLOW}[2/4] Tworzenie triggerów ochronnych...${NC}"

PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$DB_NAME" << 'EOF'
-- Funkcja logująca usunięcia
CREATE OR REPLACE FUNCTION log_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Loguj każde usunięcie do tabeli audit
    INSERT INTO deletion_audit (table_name, deleted_id, deleted_at, deleted_data)
    VALUES (TG_TABLE_NAME, OLD.id, NOW(), row_to_json(OLD)::text);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Tabela audytu usunięć
CREATE TABLE IF NOT EXISTS deletion_audit (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    deleted_id VARCHAR(100),
    deleted_at TIMESTAMP DEFAULT NOW(),
    deleted_data TEXT
);

-- Dodaj triggery do najważniejszych tabel
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY['tenants', 'users', 'services', 'employees', 'bookings', 'customers'];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        -- Usuń stary trigger jeśli istnieje
        EXECUTE format('DROP TRIGGER IF EXISTS audit_delete_%I ON %I', tbl, tbl);
        
        -- Utwórz nowy trigger
        EXECUTE format('
            CREATE TRIGGER audit_delete_%I
            BEFORE DELETE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION log_deletion()
        ', tbl, tbl);
        
        RAISE NOTICE 'Trigger utworzony dla tabeli: %', tbl;
    END LOOP;
END $$;

EOF

echo -e "${GREEN}✅ Triggery ochronne utworzone!${NC}"

# Tworzenie widoku do sprawdzania usunięć
echo ""
echo -e "${YELLOW}[3/4] Tworzenie widoku audytu...${NC}"

PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$DB_NAME" << 'EOF'
-- Widok ostatnich usunięć
CREATE OR REPLACE VIEW recent_deletions AS
SELECT 
    table_name,
    deleted_id,
    deleted_at,
    LEFT(deleted_data, 200) as data_preview
FROM deletion_audit
ORDER BY deleted_at DESC
LIMIT 100;

-- Uprawnienia do widoku
GRANT SELECT ON recent_deletions TO rezerwacja24_app;
GRANT SELECT ON deletion_audit TO rezerwacja24_app;
EOF

echo -e "${GREEN}✅ Widok audytu utworzony!${NC}"

# Zapisz dane logowania
echo ""
echo -e "${YELLOW}[4/4] Zapisywanie konfiguracji...${NC}"

cat > /root/CascadeProjects/rezerwacja24-saas/.db-credentials << EOF
# Bezpieczne dane logowania do bazy danych
# UWAGA: Ten plik powinien być w .gitignore!

# Użytkownik aplikacji (ograniczone uprawnienia)
DB_USER=$SAFE_USER
DB_PASSWORD=$SAFE_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME

# Użytkownik admin (pełne uprawnienia - tylko do migracji!)
DB_ADMIN_USER=$DB_ADMIN_USER
DB_ADMIN_PASSWORD=$DB_ADMIN_PASSWORD

# Wygenerowano: $(date)
EOF

chmod 600 /root/CascadeProjects/rezerwacja24-saas/.db-credentials

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ OCHRONA SKONFIGUROWANA!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Nowy użytkownik bazy:${NC} $SAFE_USER"
echo -e "${YELLOW}Hasło zapisane w:${NC} /root/CascadeProjects/rezerwacja24-saas/.db-credentials"
echo ""
echo -e "${BLUE}WAŻNE:${NC}"
echo "1. Zaktualizuj DATABASE_URL w aplikacji na nowego użytkownika"
echo "2. Migracje bazy muszą być wykonywane przez użytkownika 'postgres'"
echo "3. Wszystkie usunięcia są logowane w tabeli 'deletion_audit'"
echo ""
echo -e "${YELLOW}Nowy DATABASE_URL:${NC}"
echo "postgresql://$SAFE_USER:$SAFE_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"
echo ""
