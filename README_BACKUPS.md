# 💾 Automatyczne Backupy - Szybki Start

## ✅ Status: AKTYWNE

Backupy bazy danych są **automatycznie wykonywane 2 razy dziennie**:
- 🌅 **07:00** - Poranny backup
- 🌆 **19:00** - Wieczorny backup

## 🚀 Szybkie Komendy

### Sprawdź Status Backupów
```bash
/root/CascadeProjects/rezerwacja24-saas/scripts/check-backups.sh
```

### Zobacz Ostatnie Backupy
```bash
ls -lh /var/backups/rezerwacja24/database/
```

### Ręczny Backup (jeśli potrzebny)
```bash
/root/CascadeProjects/rezerwacja24-saas/scripts/backup-database.sh
```

### Sprawdź Logi
```bash
tail -f /var/log/rezerwacja24-backup.log
```

## 📚 Pełna Dokumentacja

Szczegółowe instrukcje znajdziesz w:
- **`BACKUP_GUIDE.md`** - Pełny przewodnik po backupach i restore
- **`MAINTENANCE.md`** - Ogólne procedury utrzymania systemu

## 🔐 Bezpieczeństwo

- ✅ Backupy są przechowywane przez **30 dni**
- ✅ Stare backupy są **automatycznie usuwane**
- ✅ Każdy backup jest **kompresowany** (gzip)
- ✅ Backup zawiera **pełną bazę danych + schema**

## 📊 Lokalizacja

```
/var/backups/rezerwacja24/database/
├── db_20251206_203213.dump.gz    (pełny backup)
├── schema_20251206_203213.sql    (schema dla podglądu)
└── ...
```

## 🆘 Emergency Restore

W razie awarii:
```bash
# 1. Znajdź ostatni backup
ls -lt /var/backups/rezerwacja24/database/*.dump.gz | head -1

# 2. Zobacz BACKUP_GUIDE.md sekcja "Emergency Restore"
cat /root/CascadeProjects/rezerwacja24-saas/BACKUP_GUIDE.md
```

## ✨ Wszystko Działa!

System backupów jest w pełni skonfigurowany i działa automatycznie.
Nie musisz nic robić - backupy wykonują się same! 🎉
