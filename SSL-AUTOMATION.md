# Automatyczna konfiguracja SSL dla subdomen

## Jak to działa?

Od teraz **każda nowa firma** utworzona przez panel rejestracji automatycznie otrzymuje:
- ✅ Konfigurację nginx dla swojej subdomeny
- ✅ Certyfikat SSL Let's Encrypt
- ✅ Automatyczne przekierowanie HTTP → HTTPS

## Proces automatyczny

1. Użytkownik rejestruje nową firmę przez `/register`
2. Backend tworzy subdomenę w bazie danych (np. `moja-firma-123456.rezerwacja24.pl`)
3. **Automatycznie** uruchamia się skrypt konfiguracji w tle:
   - Tworzy konfigurację nginx dla subdomeny
   - Generuje certyfikat SSL przez certbot
   - Przeładowuje nginx

## Ręczne dodanie SSL dla istniejącej subdomeny

Jeśli subdomena już istnieje w bazie ale nie ma SSL:

```bash
# Pełna konfiguracja (nginx + SSL):
/root/CascadeProjects/rezerwacja24-saas/scripts/setup-new-subdomain.sh nazwa-subdomeny

# Tylko certyfikat SSL (jeśli nginx już skonfigurowany):
/root/CascadeProjects/rezerwacja24-saas/scripts/add-subdomain-ssl.sh nazwa-subdomeny
```

## Logi

Logi automatycznej konfiguracji subdomen:
```bash
tail -f /var/log/subdomain-setup.log
```

Logi backendu (w tym błędy konfiguracji):
```bash
pm2 logs rezerwacja24-backend
```

## Sprawdzenie statusu

```bash
# Sprawdź czy subdomena ma SSL:
ls -la /etc/letsencrypt/live/ | grep nazwa-subdomeny

# Sprawdź konfigurację nginx:
ls -la /etc/nginx/sites-enabled/ | grep nazwa-subdomeny

# Test SSL:
curl -I https://nazwa-subdomeny.rezerwacja24.pl
```

## Ważne informacje

- Proces działa **w tle** - nie blokuje rejestracji użytkownika
- Konfiguracja zajmuje ~10-30 sekund
- Certyfikaty są automatycznie odnawiane przez certbot
- W przypadku błędu - użytkownik może się zalogować, ale subdomena może nie działać przez HTTPS (trzeba uruchomić skrypt ręcznie)

## Troubleshooting

### Subdomena nie działa przez HTTPS

1. Sprawdź logi: `tail -100 /var/log/subdomain-setup.log`
2. Uruchom ręcznie: `./scripts/setup-new-subdomain.sh nazwa-subdomeny`

### Certbot zwraca błąd

- Sprawdź czy DNS wskazuje na serwer: `dig nazwa-subdomeny.rezerwacja24.pl`
- Sprawdź czy port 80 jest otwarty: `netstat -tlnp | grep :80`

### Nginx nie startuje

- Test konfiguracji: `nginx -t`
- Sprawdź logi: `tail -100 /var/log/nginx/error.log`

## Pliki

- `/root/CascadeProjects/rezerwacja24-saas/scripts/setup-new-subdomain.sh` - główny skrypt
- `/root/CascadeProjects/rezerwacja24-saas/scripts/add-subdomain-ssl.sh` - tylko SSL
- `/root/CascadeProjects/rezerwacja24-saas/backend/src/common/services/subdomain-setup.service.ts` - serwis backend
- `/var/log/subdomain-setup.log` - logi automatycznej konfiguracji
