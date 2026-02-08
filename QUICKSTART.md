# ⚡ Quick Start Guide - Rezerwacja24

Szybki start w 5 minut!

## 🚀 Opcja 1: Docker Compose (Najszybsza)

```bash
# 1. Klonuj repozytorium
git clone https://github.com/your-org/rezerwacja24-saas.git
cd rezerwacja24-saas

# 2. Skopiuj i edytuj zmienne środowiskowe
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Uruchom wszystko
docker-compose up -d

# 4. Inicjalizuj bazę danych
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate

# 5. Gotowe! Otwórz przeglądarkę
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# API Docs: http://localhost:4000/api/docs
```

## 🛠 Opcja 2: Manualna Instalacja

### Backend

```bash
cd backend

# Instalacja
npm install

# Konfiguracja
cp .env.example .env
# Edytuj .env i ustaw DATABASE_URL

# Migracje
npx prisma migrate dev
npx prisma generate

# Start
npm run start:dev
```

### Frontend

```bash
cd frontend

# Instalacja
npm install

# Konfiguracja
cp .env.example .env.local

# Start
npm run dev
```

## 📝 Minimalna Konfiguracja .env

### Backend
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rezerwacja24"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-me
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ✅ Weryfikacja

```bash
# Test API
curl http://localhost:4000/health

# Test Frontend
open http://localhost:3000
```

## 🎯 Pierwsze Kroki

1. **Utwórz konto** - http://localhost:3000/register
2. **Zaloguj się** - http://localhost:3000/login
3. **Utwórz firmę** - Dashboard → Nowa Firma
4. **Dodaj usługę** - Usługi → Dodaj Usługę
5. **Pierwsza rezerwacja** - Kalendarz → Nowa Rezerwacja

## 📚 Dalsze Kroki

- [Pełna Dokumentacja](./README.md)
- [Architektura Systemu](./ARCHITECTURE.md)
- [Plany Cenowe](./PRICING.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Potrzebujesz pomocy?** support@rezerwacja24.pl
