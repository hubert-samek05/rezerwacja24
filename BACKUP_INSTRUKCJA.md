# 📦 Instrukcja Backupu i Przywracania - Rezerwacja24.pl

## 📋 Przegląd

System backupu dla rezerwacja24.pl obejmuje:
- ✅ **Bazę danych PostgreSQL** - wszystkie dane aplikacji
- ✅ **Redis** - cache i kolejki zadań
- ✅ **Aplikację frontend** - Next.js
- ✅ **Aplikację backend** - NestJS
- ✅ **Konfigurację Nginx** - reverse proxy
- ✅ **Konfigurację Docker** - docker-compose.yml
- ✅ **Dokumentację** - pliki .md

---

## 🚀 Szybki Start

### Wykonanie pełnego backupu
```bash
cd /root/CascadeProjects/rezerwacja24-saas/scripts
sudo bash backup-full.sh
```

### Przywracanie z backupu
```bash
cd /root/CascadeProjects/rezerwacja24-saas/scripts
sudo bash restore-backup.sh /var/backups/rezerwacja24/full_backup_YYYYMMDD_HHMMSS.tar.gz
```

---

## 📁 Struktura Backupów

### Lokalizacja
```
/var/backups/rezerwacja24/
├── database/
│   ├── db_20241130_220000.dump.gz
│   └── schema_20241130_220000.sql
├── redis/
│   └── redis_20241130_220000.rdb.gz
├── files/
│   ├── frontend_20241130_220000.tar.gz
│   ├── backend_20241130_220000.tar.gz
│   ├── config_20241130_220000.tar.gz
│   ├── docs_20241130_220000.tar.gz
│   └── nginx/
│       └── rezerwacja24-main_20241130_220000.conf
└── full_backup_20241130_220000.tar.gz  ← Pełny backup (wszystko w jednym)
```

---

## 🔧 Skrypty Backupu

### 1. `backup-full.sh` - Pełny backup
Wykonuje kompletny backup całego systemu.

**Użycie:**
```bash
sudo bash backup-full.sh
```

**Co robi:**
- Wykonuje backup bazy danych PostgreSQL
- Wykonuje backup Redis
- Pakuje pliki aplikacji (frontend + backend)
- Kopiuje konfigurację Nginx
- Tworzy archiwum zbiorcze `.tar.gz`
- Czyści stare backupy (>7 dni)

**Czas wykonania:** ~2-5 minut (zależnie od rozmiaru danych)

---

### 2. `backup-database.sh` - Tylko baza danych
Backup tylko bazy danych PostgreSQL.

**Użycie:**
```bash
sudo bash backup-database.sh
```

**Format:** PostgreSQL custom format (`.dump`) + gzip
**Retencja:** 30 dni

---

### 3. `backup-redis.sh` - Tylko Redis
Backup cache i kolejek Redis.

**Użycie:**
```bash
sudo bash backup-redis.sh
```

**Format:** Redis RDB (`.rdb`) + gzip
**Retencja:** 30 dni

---

### 4. `backup-files.sh` - Tylko pliki aplikacji
Backup plików aplikacji i konfiguracji.

**Użycie:**
```bash
sudo bash backup-files.sh
```

**Zawartość:**
- Frontend (Next.js) - bez `node_modules` i `.next/cache`
- Backend (NestJS) - bez `node_modules` i `dist`
- Konfiguracja Nginx
- Konfiguracja Docker
- Dokumentacja

**Retencja:** 30 dni

---

## 🔄 Przywracanie Backupu

### Pełne przywracanie
```bash
sudo bash restore-backup.sh /var/backups/rezerwacja24/full_backup_20241130_220000.tar.gz
```

**Proces:**
1. Rozpakowanie archiwum
2. Przywrócenie bazy danych (DROP + CREATE + RESTORE)
3. Przywrócenie Redis (stop + copy + start)
4. Przywrócenie plików aplikacji
5. Instalacja zależności (`npm install`)
6. Build aplikacji (`npm run build`)
7. Restart aplikacji i Nginx

**⚠️ UWAGA:** To działanie nadpisze wszystkie obecne dane!

---

### Przywracanie tylko bazy danych
```bash
# Rozpakuj backup
gunzip /var/backups/rezerwacja24/database/db_20241130_220000.dump.gz

# Przywróć do PostgreSQL
pg_restore -U postgres -d rezerwacja24 -c /var/backups/rezerwacja24/database/db_20241130_220000.dump
```

**Opcje:**
- `-c` - czyści istniejące obiekty przed przywróceniem
- `-C` - tworzy bazę danych
- `--if-exists` - nie zgłasza błędów jeśli obiekty nie istnieją

---

### Przywracanie tylko Redis
```bash
# Zatrzymaj Redis
sudo systemctl stop redis

# Rozpakuj i skopiuj dump
gunzip -c /var/backups/rezerwacja24/redis/redis_20241130_220000.rdb.gz > /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb

# Uruchom Redis
sudo systemctl start redis
```

---

### Przywracanie tylko aplikacji
```bash
cd /root/CascadeProjects/rezerwacja24-saas

# Frontend
tar -xzf /var/backups/rezerwacja24/files/frontend_20241130_220000.tar.gz
cd frontend
npm install
npm run build

# Backend
cd ..
tar -xzf /var/backups/rezerwacja24/files/backend_20241130_220000.tar.gz
cd backend
npm install
npm run build

# Restart
pkill -f "next-server"
cd ../frontend
nohup npm start > /var/log/rezerwacja24-frontend.log 2>&1 &
```

---

## ⏰ Automatyczne Backupy (Cron)

### Konfiguracja crontab
```bash
sudo crontab -e
```

### Przykładowe harmonogramy

#### Backup codziennie o 3:00
```cron
0 3 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-full.sh >> /var/log/rezerwacja24-backup.log 2>&1
```

#### Backup co 6 godzin
```cron
0 */6 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-full.sh >> /var/log/rezerwacja24-backup.log 2>&1
```

#### Backup tylko bazy danych co godzinę
```cron
0 * * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh >> /var/log/rezerwacja24-backup.log 2>&1
```

---

## 📊 Monitoring Backupów

### Sprawdzenie ostatniego backupu
```bash
ls -lht /var/backups/rezerwacja24/full_backup_*.tar.gz | head -1
```

### Rozmiar backupów
```bash
du -sh /var/backups/rezerwacja24/
```

### Logi backupów
```bash
tail -f /var/log/rezerwacja24-backup.log
```

### Weryfikacja integralności
```bash
# Test archiwum
tar -tzf /var/backups/rezerwacja24/full_backup_20241130_220000.tar.gz > /dev/null
echo $?  # 0 = OK

# Test backupu bazy danych
pg_restore --list /var/backups/rezerwacja24/database/db_20241130_220000.dump
```

---

## 🌐 Backup Zdalny (Opcjonalnie)

### Kopiowanie do zdalnego serwera (rsync)
```bash
# Utwórz skrypt
sudo nano /usr/local/bin/backup-remote.sh
```

```bash
#!/bin/bash
REMOTE_HOST="backup-server.example.com"
REMOTE_USER="backup"
REMOTE_DIR="/backups/rezerwacja24"
LOCAL_DIR="/var/backups/rezerwacja24"

# Synchronizuj backupy
rsync -avz --delete \
    -e "ssh -i /root/.ssh/backup_key" \
    "$LOCAL_DIR/" \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"
```

### Kopiowanie do AWS S3
```bash
# Zainstaluj AWS CLI
sudo apt install awscli

# Konfiguruj credentials
aws configure

# Utwórz skrypt
sudo nano /usr/local/bin/backup-s3.sh
```

```bash
#!/bin/bash
BUCKET="s3://rezerwacja24-backups"
LOCAL_DIR="/var/backups/rezerwacja24"

# Synchronizuj do S3
aws s3 sync "$LOCAL_DIR" "$BUCKET" \
    --storage-class STANDARD_IA \
    --exclude "*" \
    --include "full_backup_*.tar.gz"
```

---

## 🔐 Szyfrowanie Backupów

### Szyfrowanie archiwum (GPG)
```bash
# Utwórz zaszyfrowany backup
tar -czf - /var/backups/rezerwacja24/full_backup_20241130_220000.tar.gz | \
    gpg --symmetric --cipher-algo AES256 \
    -o /var/backups/rezerwacja24/full_backup_20241130_220000.tar.gz.gpg

# Odszyfrowanie
gpg --decrypt /var/backups/rezerwacja24/full_backup_20241130_220000.tar.gz.gpg | \
    tar -xzf -
```

---

## 📋 Checklist Backupu

### Przed backupem
- [ ] Sprawdź miejsce na dysku (`df -h`)
- [ ] Sprawdź czy PostgreSQL działa
- [ ] Sprawdź czy Redis działa
- [ ] Sprawdź czy aplikacja działa

### Po backupie
- [ ] Sprawdź czy backup się utworzył
- [ ] Sprawdź rozmiar backupu (czy sensowny)
- [ ] Sprawdź logi (`/var/log/rezerwacja24-backup.log`)
- [ ] Zweryfikuj integralność archiwum
- [ ] (Opcjonalnie) Skopiuj do zdalnej lokalizacji

### Testowanie przywracania (co miesiąc)
- [ ] Przywróć backup na środowisku testowym
- [ ] Sprawdź czy baza danych działa
- [ ] Sprawdź czy aplikacja startuje
- [ ] Sprawdź czy dane są kompletne

---

## 🐛 Troubleshooting

### Problem: Brak miejsca na dysku
```bash
# Sprawdź miejsce
df -h /var/backups

# Usuń stare backupy ręcznie
find /var/backups/rezerwacja24 -name "full_backup_*.tar.gz" -mtime +7 -delete
```

### Problem: Backup się nie wykonuje
```bash
# Sprawdź logi
tail -100 /var/log/rezerwacja24-backup.log

# Sprawdź uprawnienia
ls -la /root/CascadeProjects/rezerwacja24-saas/scripts/

# Nadaj uprawnienia
chmod +x /root/CascadeProjects/rezerwacja24-saas/scripts/*.sh
```

### Problem: Nie można przywrócić bazy danych
```bash
# Sprawdź czy PostgreSQL działa
sudo systemctl status postgresql

# Sprawdź połączenie
psql -U postgres -c "SELECT 1"

# Sprawdź format backupu
pg_restore --list /var/backups/rezerwacja24/database/db_20241130_220000.dump
```

---

## 📞 Wsparcie

W razie problemów:
- **Email:** support@rezerwacja24.pl
- **Dokumentacja:** https://docs.rezerwacja24.pl
- **Logi:** `/var/log/rezerwacja24-backup.log`

---

## ✅ Dobre Praktyki

1. **Regularność** - wykonuj backupy codziennie
2. **Testowanie** - testuj przywracanie co miesiąc
3. **Redundancja** - przechowuj backupy w 2+ lokalizacjach
4. **Szyfrowanie** - szyfruj backupy zawierające dane wrażliwe
5. **Monitoring** - monitoruj czy backupy się wykonują
6. **Dokumentacja** - dokumentuj proces przywracania
7. **Retencja** - usuwaj stare backupy (oszczędność miejsca)

---

**Wersja:** 1.0.0  
**Data:** 30 Listopada 2024  
**Autor:** Rezerwacja24 Team
