# 🚀 Instrukcja Uruchomienia Rezerwacja24

## Problem
Strona **rezerwacja24.pl nie działa po wyłączeniu Windsurf**, ponieważ:
- Kontenery Docker są zatrzymane
- Brak automatycznego startu usług
- Nginx działa, ale aplikacja nie

## ✅ Rozwiązanie - Uruchomienie Produkcyjne

### Metoda 1: Ręczne uruchomienie (szybkie)

```bash
cd /root/CascadeProjects/rezerwacja24-saas
chmod +x start-production.sh
./start-production.sh
```

### Metoda 2: Systemd - Auto-start po restarcie serwera (zalecane)

```bash
# 1. Skopiuj service file
sudo cp /root/CascadeProjects/rezerwacja24-saas/systemd/rezerwacja24.service /etc/systemd/system/

# 2. Przeładuj systemd
sudo systemctl daemon-reload

# 3. Włącz auto-start
sudo systemctl enable rezerwacja24.service

# 4. Uruchom teraz
sudo systemctl start rezerwacja24.service

# 5. Sprawdź status
sudo systemctl status rezerwacja24.service
```

### Sprawdzenie czy działa

```bash
# Sprawdź kontenery
docker-compose ps

# Sprawdź logi
docker-compose logs -f

# Test API
curl http://localhost:4000/api/health

# Test Frontend
curl http://localhost:3000
```

## 📊 Zarządzanie Usługami

### Start
```bash
sudo systemctl start rezerwacja24
# lub
docker-compose up -d
```

### Stop
```bash
sudo systemctl stop rezerwacja24
# lub
docker-compose down
```

### Restart
```bash
sudo systemctl restart rezerwacja24
# lub
docker-compose restart
```

### Logi
```bash
# Wszystkie usługi
docker-compose logs -f

# Tylko backend
docker-compose logs -f backend

# Tylko frontend
docker-compose logs -f frontend
```

## 🔧 Troubleshooting

### Kontenery nie startują
```bash
# Sprawdź logi
docker-compose logs

# Restart wszystkiego
docker-compose down
docker-compose up -d
```

### Port zajęty
```bash
# Sprawdź co używa portu
sudo lsof -i :3000
sudo lsof -i :4000

# Zabij proces
sudo kill -9 <PID>
```

### Baza danych nie działa
```bash
# Sprawdź PostgreSQL
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Uruchom migracje
docker-compose exec backend npx prisma migrate deploy
```

## 🎯 Dlaczego to rozwiązuje problem?

1. **Docker Compose** - zarządza wszystkimi kontenerami jako jedną usługą
2. **Systemd Service** - automatycznie uruchamia aplikację po restarcie serwera
3. **Health Checks** - monitoruje czy usługi działają poprawnie
4. **Persistent Storage** - dane w volumes przetrwają restart

## 📝 Ważne

- Aplikacja będzie działać **24/7** nawet po wyłączeniu Windsurf
- Po restarcie serwera automatycznie wystartuje (jeśli użyjesz systemd)
- Nginx już działa i jest skonfigurowany poprawnie
- Wszystkie usługi są w kontenerach Docker - izolowane i bezpieczne
