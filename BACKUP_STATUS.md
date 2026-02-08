# 💾 Status Backupów - Rezerwacja24

**Data sprawdzenia:** 6 grudnia 2024, 21:53  
**Status:** ✅ WSZYSTKO DZIAŁA

---

## ✅ Backup Wykonany Teraz

### Kod Aplikacji
```
Plik: /root/backups/rezerwacja24_20251206_215321.tar.gz
Rozmiar: 529K
Zawartość: Cały projekt (bez node_modules, .next, dist)
```

### Poprzednie Backupy w /root/backups/
- `rezerwacja24_code_20251206_215226.tar.gz` - 215M
- `rezerwacja24_full_20251206_213027.tar.gz` - 216M
- `rezerwacja24_20251206_215321.tar.gz` - 529K (najnowszy)

---

## 🤖 Automatyczne Backupy

### ✅ WŁĄCZONE - Cron Jobs

```bash
# Backup Rezerwacja24 - 2x dziennie
0 7 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh
0 19 * * * /root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh
```

**Harmonogram:**
- 🌅 **07:00** - Poranny backup
- 🌆 **19:00** - Wieczorny backup

### Skrypt Backupu

**Lokalizacja:** `/root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh`

**Co robi:**
1. ✅ Backup bazy danych (format custom)
2. ✅ Kompresja (gzip)
3. ✅ Eksport schema (SQL)
4. ✅ Czyszczenie starych backupów (>30 dni)

**Konfiguracja:**
```bash
BACKUP_DIR="/var/backups/rezerwacja24"
DB_NAME="rezerwacja24"
DB_USER="rezerwacja24"
DB_HOST="localhost"
DB_PORT="5433"
```

---

## 📊 Ostatnie Backupy Bazy Danych

**Katalog:** `/var/backups/rezerwacja24/database/`

```
db_20251206_203213.dump.gz     81K   (backup bazy)
schema_20251206_203213.sql     48K   (schema)
```

**Ostatni backup:** 6 grudnia 2024, 20:32

---

## 📁 Struktura Backupów

### /root/backups/
- Ręczne backupy kodu
- Pełne archiwa projektu
- Historyczne backupy

### /var/backups/rezerwacja24/
- Automatyczne backupy bazy danych
- Rotacja co 30 dni
- 2x dziennie (7:00 i 19:00)

---

## 🔄 Retencja

**Baza danych:** 30 dni  
**Kod:** Ręczne czyszczenie

Stare backupy są automatycznie usuwane po 30 dniach.

---

## 📝 Logi

**Lokalizacja:** `/var/log/rezerwacja24-backup.log`

**Status:** Plik nie istnieje jeszcze (pierwszy backup o 7:00 lub 19:00)

---

## ✅ Weryfikacja

### Sprawdź czy cron działa:
```bash
crontab -l | grep rezerwacja24
```

### Sprawdź ostatnie backupy:
```bash
ls -lh /var/backups/rezerwacja24/database/
```

### Sprawdź logi:
```bash
tail -f /var/log/rezerwacja24-backup.log
```

### Test ręczny:
```bash
/root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh
```

---

## 🚨 Przywracanie z Backupu

### Kod
```bash
cd /root/CascadeProjects
tar -xzf /root/backups/rezerwacja24_20251206_215321.tar.gz
```

### Baza Danych
```bash
# Z custom dump
PGPASSWORD="rezerwacja24" pg_restore -h localhost -p 5433 -U rezerwacja24 -d rezerwacja24 \
  /var/backups/rezerwacja24/database/db_20251206_203213.dump.gz

# Lub z SQL schema
PGPASSWORD="rezerwacja24" psql -h localhost -p 5433 -U rezerwacja24 -d rezerwacja24 \
  < /var/backups/rezerwacja24/database/schema_20251206_203213.sql
```

---

## 📈 Statystyki

**Rozmiar bazy danych:** ~81KB (skompresowana)  
**Rozmiar kodu:** ~529KB (bez node_modules)  
**Częstotliwość:** 2x dziennie  
**Retencja:** 30 dni  

---

## ✅ Podsumowanie

1. ✅ **Backup kodu wykonany** - 6 grudnia 2024, 21:53
2. ✅ **Automatyczne backupy włączone** - 2x dziennie (7:00, 19:00)
3. ✅ **Skrypt backupu działa** - `/root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh`
4. ✅ **Ostatni backup bazy** - 6 grudnia 2024, 20:32
5. ✅ **Rotacja backupów** - Automatyczne czyszczenie >30 dni

**Wszystko działa poprawnie! 🎉**

---

## 🔔 Następny Automatyczny Backup

**Jutro o 7:00** (poranny backup)

Możesz sprawdzić logi po tej godzinie:
```bash
tail -f /var/log/rezerwacja24-backup.log
```
