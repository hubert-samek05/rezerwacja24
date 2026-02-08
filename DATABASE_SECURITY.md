# 🔒 Bezpieczeństwo Bazy Danych - Rezerwacja24

## ⚠️ KRYTYCZNE ZASADY DLA AI/DEVELOPERA

### NIGDY NIE WYKONUJ:
1. **`DROP TABLE`** - NIGDY nie usuwaj tabel
2. **`TRUNCATE`** - NIGDY nie czyść tabel
3. **`DELETE FROM tabela`** (bez WHERE) - NIGDY nie usuwaj wszystkich rekordów
4. **`prisma migrate reset`** - NIGDY nie resetuj bazy na produkcji
5. **`prisma db push --force-reset`** - NIGDY nie wymuszaj resetu

### PRZED KAŻDĄ ZMIANĄ W BAZIE:
```bash
# ZAWSZE wykonaj backup przed zmianami!
/root/CascadeProjects/rezerwacja24-saas/scripts/safe-backup.sh "opis_zmiany"
```

---

## 📊 System Backupów

### Automatyczne Backupy (3x dziennie)
| Godzina | Opis |
|---------|------|
| 07:00 | Poranny backup |
| 13:00 | Backup w południe |
| 19:00 | Wieczorny backup |

### Lokalizacje
- **Regularne backupy:** `/var/backups/rezerwacja24/database/`
- **Safe-backupy (przed zmianami):** `/var/backups/rezerwacja24/safe-backups/`

### Retencja
- Regularne backupy: **30 dni**
- Safe-backupy: **50 ostatnich** (bez limitu czasowego)

---

## 🛡️ Ochrona Przed Usunięciem Danych

### 1. Audyt Usunięć
Wszystkie usunięcia z kluczowych tabel są logowane:
- `tenants`
- `users`
- `services`
- `employees`
- `bookings`
- `customers`

Sprawdź ostatnie usunięcia:
```sql
SELECT * FROM recent_deletions;
```

### 2. Odzyskiwanie Usuniętych Danych
```sql
-- Zobacz co zostało usunięte
SELECT * FROM deletion_audit WHERE table_name = 'bookings' ORDER BY deleted_at DESC;

-- Dane są w kolumnie deleted_data jako JSON
```

### 3. Użytkownik z Ograniczonymi Uprawnieniami
Aplikacja używa użytkownika `rezerwacja24_app` który:
- ✅ Może: SELECT, INSERT, UPDATE, DELETE
- ❌ Nie może: DROP TABLE, TRUNCATE, ALTER TABLE, CREATE TABLE

---

## 🚨 Procedury Awaryjne

### Przywracanie z Backupu
```bash
# 1. Lista dostępnych backupów
ls -lht /var/backups/rezerwacja24/database/*.dump.gz | head -10

# 2. Przywróć backup
/root/CascadeProjects/rezerwacja24-saas/scripts/restore-safe-backup.sh /ścieżka/do/backupu.dump.gz
```

### Szybkie Przywrócenie Ostatniego Backupu
```bash
# Znajdź ostatni backup
LATEST=$(ls -t /var/backups/rezerwacja24/database/*.dump.gz | head -1)

# Przywróć
/root/CascadeProjects/rezerwacja24-saas/scripts/restore-safe-backup.sh "$LATEST"
```

### Przywrócenie z Safe-Backupu (przed zmianami)
```bash
# Lista safe-backupów
ls -lht /var/backups/rezerwacja24/safe-backups/*.gz | head -10

# Przywróć
/root/CascadeProjects/rezerwacja24-saas/scripts/restore-safe-backup.sh /var/backups/rezerwacja24/safe-backups/safe_XXXXXXXX_opis.dump.gz
```

---

## 📋 Codzienne Sprawdzanie

### Weryfikacja Backupów
```bash
/root/CascadeProjects/rezerwacja24-saas/scripts/verify-backups.sh
```

### Sprawdź Logi Backupów
```bash
tail -50 /var/log/rezerwacja24-backup.log
```

### Sprawdź Ostatnie Usunięcia
```bash
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c "SELECT * FROM recent_deletions;"
```

---

## 🔧 Skrypty

| Skrypt | Opis |
|--------|------|
| `scripts/backup-database.sh` | Regularny backup (uruchamiany przez cron) |
| `scripts/safe-backup.sh` | Backup przed zmianami (uruchamiaj ręcznie!) |
| `scripts/restore-safe-backup.sh` | Przywracanie z backupu |
| `scripts/verify-backups.sh` | Weryfikacja stanu backupów |
| `scripts/setup-db-protection.sh` | Konfiguracja ochrony bazy |

---

## 📞 W Razie Problemów

### 1. Dane zostały usunięte
```bash
# Sprawdź co zostało usunięte
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c "SELECT * FROM deletion_audit ORDER BY deleted_at DESC LIMIT 20;"

# Przywróć z ostatniego backupu
/root/CascadeProjects/rezerwacja24-saas/scripts/restore-safe-backup.sh $(ls -t /var/backups/rezerwacja24/database/*.dump.gz | head -1)
```

### 2. Backup nie działa
```bash
# Sprawdź logi
tail -100 /var/log/rezerwacja24-backup.log

# Uruchom ręcznie
/root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh

# Sprawdź cron
crontab -l | grep backup
```

### 3. Baza nie odpowiada
```bash
# Sprawdź status PostgreSQL
docker ps | grep postgres

# Restart kontenera
cd /root/CascadeProjects/rezerwacja24-saas
docker-compose restart postgres
```

---

## ✅ Checklist Bezpieczeństwa

- [x] Backupy 3x dziennie (7:00, 13:00, 19:00)
- [x] Safe-backupy przed zmianami
- [x] Audyt usunięć (deletion_audit)
- [x] Retencja 30 dni
- [x] Skrypt weryfikacji backupów
- [ ] Backup offsite (zalecane!)
- [ ] Monitoring alertów

---

## 🎯 Zalecenia na Przyszłość

### 1. Backup Offsite (BARDZO ZALECANE)
Kopiuj backupy poza serwer:
```bash
# Opcja 1: SCP do innego serwera
scp /var/backups/rezerwacja24/database/*.dump.gz user@backup-server:/backups/

# Opcja 2: S3/Cloud Storage
aws s3 sync /var/backups/rezerwacja24/ s3://my-bucket/rezerwacja24-backups/
```

### 2. Monitoring
Dodaj alert gdy backup nie został wykonany przez 12 godzin.

### 3. Testowanie Restore
Raz w miesiącu testuj przywracanie backupu na testowej bazie.

---

## 📝 Historia Zmian

| Data | Zmiana |
|------|--------|
| 2026-01-18 | Konfiguracja 3x dziennie backupów |
| 2026-01-18 | Dodanie safe-backup przed zmianami |
| 2026-01-18 | Dodanie audytu usunięć |
| 2026-01-18 | Utworzenie dokumentacji bezpieczeństwa |
