# Backup Guide - Rezerwacja24

## 🔄 Automatyczne Backupy

### Harmonogram
Backupy bazy danych są wykonywane **automatycznie 3 razy dziennie**:
- **07:00** - Poranny backup
- **13:00** - Backup w południe
- **19:00** - Wieczorny backup

### Lokalizacja Backupów
```
/var/backups/rezerwacja24/database/
```

### Zawartość Backupu
Każdy backup zawiera:
1. **`db_YYYYMMDD_HHMMSS.dump.gz`** - Pełny backup bazy danych (skompresowany)
2. **`schema_YYYYMMDD_HHMMSS.sql`** - Schema bazy danych (dla łatwego podglądu)

### Retencja
- Backupy są przechowywane przez **30 dni**
- Starsze backupy są automatycznie usuwane

## 📋 Sprawdzanie Backupów

### Lista Backupów
```bash
ls -lh /var/backups/rezerwacja24/database/
```

### Ostatni Backup
```bash
ls -lt /var/backups/rezerwacja24/database/ | head -3
```

### Rozmiar Backupów
```bash
du -sh /var/backups/rezerwacja24/database/
```

### Logi Backupów
```bash
tail -f /var/log/rezerwacja24-backup.log
```

## 🔧 Ręczne Uruchomienie Backupu

Jeśli potrzebujesz wykonać backup poza harmonogramem:
```bash
/root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh
```

## 📥 Restore z Backupu

### 1. Znajdź Backup
```bash
ls -lt /var/backups/rezerwacja24/database/ | grep dump.gz
```

### 2. Rozpakuj Backup
```bash
gunzip /var/backups/rezerwacja24/database/db_20251206_203213.dump.gz
```

### 3. Restore do Bazy Danych

#### Opcja A: Restore do istniejącej bazy (UWAGA: usuwa obecne dane!)
```bash
# UWAGA: To usunie wszystkie obecne dane!
PGPASSWORD=rezerwacja24 pg_restore -h localhost -p 5433 -U rezerwacja24 \
  -d rezerwacja24 --clean --if-exists \
  /var/backups/rezerwacja24/database/db_20251206_203213.dump
```

#### Opcja B: Restore do nowej bazy (bezpieczniejsze)
```bash
# 1. Utwórz nową bazę
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -c "CREATE DATABASE rezerwacja24_restore;"

# 2. Restore do nowej bazy
PGPASSWORD=rezerwacja24 pg_restore -h localhost -p 5433 -U rezerwacja24 \
  -d rezerwacja24_restore \
  /var/backups/rezerwacja24/database/db_20251206_203213.dump

# 3. Sprawdź dane
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -d rezerwacja24_restore -c "SELECT COUNT(*) FROM tenants;"

# 4. Jeśli wszystko OK, zamień bazy
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -c "ALTER DATABASE rezerwacja24 RENAME TO rezerwacja24_old;"
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -c "ALTER DATABASE rezerwacja24_restore RENAME TO rezerwacja24;"

# 5. Restart aplikacji
cd /root/CascadeProjects/rezerwacja24-saas/backend
pm2 restart rezerwacja24-backend
```

## 🚨 Emergency Restore

W przypadku awarii:

### 1. Zatrzymaj Aplikację
```bash
pm2 stop rezerwacja24-backend
pm2 stop rezerwacja24-frontend
```

### 2. Znajdź Ostatni Backup
```bash
LATEST_BACKUP=$(ls -t /var/backups/rezerwacja24/database/*.dump.gz | head -1)
echo "Używam backupu: $LATEST_BACKUP"
```

### 3. Rozpakuj i Restore
```bash
gunzip -c "$LATEST_BACKUP" > /tmp/restore.dump
PGPASSWORD=rezerwacja24 pg_restore -h localhost -p 5433 -U rezerwacja24 \
  -d rezerwacja24 --clean --if-exists /tmp/restore.dump
rm /tmp/restore.dump
```

### 4. Uruchom Aplikację
```bash
pm2 start rezerwacja24-backend
pm2 start rezerwacja24-frontend
```

### 5. Sprawdź
```bash
curl https://api.rezerwacja24.pl/api/tenants/1701364800000 | jq '.name'
```

## 📊 Monitoring Backupów

### Sprawdź Czy Backupy Działają
```bash
# Sprawdź ostatni backup
LAST_BACKUP=$(ls -t /var/backups/rezerwacja24/database/*.dump.gz | head -1)
LAST_BACKUP_TIME=$(stat -c %y "$LAST_BACKUP" | cut -d' ' -f1,2)
echo "Ostatni backup: $LAST_BACKUP_TIME"

# Sprawdź czy backup jest świeży (max 13 godzin)
LAST_BACKUP_TIMESTAMP=$(stat -c %Y "$LAST_BACKUP")
CURRENT_TIMESTAMP=$(date +%s)
DIFF=$((CURRENT_TIMESTAMP - LAST_BACKUP_TIMESTAMP))
HOURS=$((DIFF / 3600))

if [ $HOURS -lt 13 ]; then
  echo "✅ Backup jest świeży ($HOURS godzin temu)"
else
  echo "⚠️  UWAGA: Ostatni backup jest stary ($HOURS godzin temu)!"
fi
```

### Sprawdź Logi Crona
```bash
grep "backup-database" /var/log/syslog | tail -10
```

### Test Backupu
```bash
# Sprawdź czy backup można rozpakować
LATEST_BACKUP=$(ls -t /var/backups/rezerwacja24/database/*.dump.gz | head -1)
gunzip -t "$LATEST_BACKUP" && echo "✅ Backup jest OK" || echo "❌ Backup jest uszkodzony!"
```

## 🔐 Bezpieczeństwo

### Uprawnienia
```bash
# Sprawdź uprawnienia do backupów
ls -la /var/backups/rezerwacja24/database/

# Powinny być:
# drwxr-xr-x dla katalogów
# -rw-r--r-- dla plików
```

### Backup Poza Serwerem (Zalecane!)

Dla dodatkowego bezpieczeństwa, kopiuj backupy poza serwer:

#### Opcja 1: SCP do innego serwera
```bash
# Dodaj do crona (np. o 8:00 i 20:00):
# 0 8,20 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-offsite.sh

# Utwórz skrypt backup-offsite.sh:
#!/bin/bash
LATEST_BACKUP=$(ls -t /var/backups/rezerwacja24/database/*.dump.gz | head -1)
scp "$LATEST_BACKUP" user@backup-server:/backups/rezerwacja24/
```

#### Opcja 2: S3/Cloud Storage
```bash
# Zainstaluj AWS CLI lub rclone
# Dodaj do crona:
# 0 8,20 * * * aws s3 sync /var/backups/rezerwacja24/ s3://my-bucket/rezerwacja24-backups/
```

## 📝 Crontab

Aktualna konfiguracja crona:
```bash
# Backup Rezerwacja24 - 3x dziennie (7:00, 13:00, 19:00)
0 7 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh >> /var/log/rezerwacja24-backup.log 2>&1
0 13 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh >> /var/log/rezerwacja24-backup.log 2>&1
0 19 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh >> /var/log/rezerwacja24-backup.log 2>&1
```

### Edycja Crona
```bash
crontab -e
```

### Sprawdzenie Crona
```bash
crontab -l
```

## 🧪 Testowanie Restore

**WAŻNE:** Zawsze testuj restore na kopii bazy, nie na produkcji!

```bash
# 1. Utwórz testową bazę
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -c "CREATE DATABASE test_restore;"

# 2. Restore ostatniego backupu
LATEST_BACKUP=$(ls -t /var/backups/rezerwacja24/database/*.dump.gz | head -1)
gunzip -c "$LATEST_BACKUP" > /tmp/test.dump
PGPASSWORD=rezerwacja24 pg_restore -h localhost -p 5433 -U rezerwacja24 \
  -d test_restore /tmp/test.dump

# 3. Sprawdź dane
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -d test_restore -c "
  SELECT 
    (SELECT COUNT(*) FROM tenants) as tenants,
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM employees) as employees,
    (SELECT COUNT(*) FROM bookings) as bookings;
"

# 4. Usuń testową bazę
PGPASSWORD=rezerwacja24 psql -h localhost -p 5433 -U rezerwacja24 -c "DROP DATABASE test_restore;"
rm /tmp/test.dump
```

## 📞 Kontakt w Razie Problemów

Jeśli backupy nie działają:
1. Sprawdź logi: `tail -f /var/log/rezerwacja24-backup.log`
2. Sprawdź cron: `crontab -l`
3. Sprawdź uprawnienia: `ls -la /var/backups/rezerwacja24/`
4. Uruchom ręcznie: `/root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh`

## ✅ Checklist Backupów

- [x] Backupy uruchamiają się 3x dziennie (7:00, 13:00, 19:00)
- [x] Logi są zapisywane w `/var/log/rezerwacja24-backup.log`
- [x] Backupy są przechowywane w `/var/backups/rezerwacja24/database/`
- [x] Stare backupy (>30 dni) są automatycznie usuwane
- [x] Safe-backupy przed zmianami w `/var/backups/rezerwacja24/safe-backups/`
- [ ] Przetestowano restore z backupu
- [ ] (Opcjonalnie) Backupy są kopiowane poza serwer

## 🎯 Best Practices

1. **Testuj restore regularnie** - np. raz w miesiącu
2. **Monitoruj rozmiar backupów** - nagły wzrost może wskazywać problem
3. **Sprawdzaj logi** - upewnij się że backupy się wykonują
4. **Kopiuj poza serwer** - dla dodatkowego bezpieczeństwa
5. **Dokumentuj restore** - zapisz procedurę dla swojego zespołu
