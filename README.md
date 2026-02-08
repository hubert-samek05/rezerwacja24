# 🚀 Rezerwacja24 - Wielofirmowy System Rezerwacji SaaS

> Inteligentny system rezerwacji z CRM, automatyzacjami i AI dla nowoczesnych firm

![Rezerwacja24](https://source.unsplash.com/random/1200x400/?business,technology)

## 📋 Spis Treści

- [O Projekcie](#o-projekcie)
- [Funkcje](#funkcje)
- [Stack Technologiczny](#stack-technologiczny)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
- [Deployment](#deployment)
- [Struktura Projektu](#struktura-projektu)
- [API Documentation](#api-documentation)
- [Licencja](#licencja)

## 🎯 O Projekcie

**Rezerwacja24** to kompleksowy system SaaS do zarządzania rezerwacjami, klientami i rozwojem biznesu. System wyróżnia się na tle konkurencji (Booksy, Calendly, Reservio) dzięki:

- **Multi-tenant architecture** - każda firma ma własną subdomenę
- **AI-powered features** - inteligentne planowanie, chatbot, dynamic pricing
- **Zaawansowane automatyzacje** - scenariusze IFTTT, kampanie marketingowe
- **White-label** - pełna personalizacja brandingu
- **Marketplace** - katalog firm dostępny publicznie

## ✨ Funkcje

### 🎨 Podstawowe
- ✅ System rezerwacji online z kalendarzem
- ✅ CRM z historią klientów, tagami i segmentacją
- ✅ Powiadomienia (Email, SMS, WhatsApp, Push)
- ✅ Multi-tenant z subdomenami
- ✅ 3-tier pricing (Standard, Premium, Pro)
- ✅ Integracje (Google Calendar, Outlook, Stripe)

### 🤖 AI Features
- ✅ **AI Smart Scheduler** - proponuje najlepsze terminy
- ✅ **AI Chatbot** - przyjmuje rezerwacje i odpowiada na pytania
- ✅ **Voice Booking** - rezerwacje głosowe (Whisper API)
- ✅ **Dynamic Pricing** - ceny dostosowane do popytu
- ✅ **Auto-summary** - podsumowania wizyt generowane przez AI

### 🔄 Automatyzacje
- ✅ Scenariusze IFTTT (if this then that)
- ✅ Kampanie SMS/Email
- ✅ Program lojalnościowy
- ✅ Kupony i vouchery
- ✅ Kolejka oczekujących z AI

### 🏪 Marketplace
- ✅ Katalog firm z filtrowaniem
- ✅ System recenzji
- ✅ Profile premium
- ✅ SEO optimization

### 🎨 White-label
- ✅ Własne logo i kolory
- ✅ Własna domena
- ✅ E-maile z własnego SMTP
- ✅ Pełna personalizacja panelu

## 🛠 Stack Technologiczny

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** (Dark Metallic Green theme)
- **Framer Motion** (animations)
- **TanStack Query** (data fetching)
- **Zustand** (state management)

### Backend
- **NestJS**
- **Prisma ORM**
- **PostgreSQL 15**
- **Redis** (cache, queues)
- **WebSockets** (Socket.io)
- **Bull** (job queues)

### Integracje
- **Stripe** (payments)
- **Twilio** (SMS/WhatsApp)
- **SendGrid** (Email)
- **OpenAI** (AI features)
- **Google Calendar API**
- **Microsoft Graph API**

### Infrastructure
- **Docker** + **Docker Compose**
- **Kubernetes** (production)
- **Nginx** (reverse proxy)
- **GitHub Actions** (CI/CD)
- **AWS S3** (storage)

## 📦 Wymagania

- **Node.js** >= 20.x
- **PostgreSQL** >= 15.x
- **Redis** >= 7.x
- **Docker** + **Docker Compose** (opcjonalnie)
- **npm** lub **yarn**

## 🚀 Instalacja

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/your-org/rezerwacja24-saas.git
cd rezerwacja24-saas
```

### 2. Instalacja zależności

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Konfiguracja bazy danych

```bash
cd backend

# Skopiuj przykładowy plik .env
cp .env.example .env

# Edytuj .env i ustaw DATABASE_URL
nano .env

# Uruchom migracje
npx prisma migrate dev

# Wygeneruj Prisma Client
npx prisma generate

# (Opcjonalnie) Zaseeduj bazę przykładowymi danymi
npm run prisma:seed
```

## ⚙️ Konfiguracja

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rezerwacja24?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# SendGrid
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@rezerwacja24.pl

# OpenAI
OPENAI_API_KEY=sk-...
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.rezerwacja24.pl
NEXT_PUBLIC_APP_URL=https://rezerwacja24.pl
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🏃 Uruchomienie

### Development (lokalnie)

#### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 3 - Redis (jeśli nie masz zainstalowanego)
```bash
docker run -p 6379:6379 redis:7-alpine
```

#### Terminal 4 - PostgreSQL (jeśli nie masz zainstalowanego)
```bash
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
```

### Development (Docker Compose)

```bash
# Uruchom wszystkie serwisy
docker-compose up -d

# Sprawdź logi
docker-compose logs -f

# Zatrzymaj serwisy
docker-compose down
```

Aplikacja będzie dostępna pod:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs

## 🌐 Deployment

### Production (Docker Compose)

```bash
# Build i uruchom w trybie produkcyjnym
docker-compose -f docker-compose.yml up -d --build

# Sprawdź status
docker-compose ps
```

### Kubernetes

```bash
# Zastosuj konfigurację
kubectl apply -f k8s/

# Sprawdź status
kubectl get pods
kubectl get services

# Sprawdź logi
kubectl logs -f deployment/rezerwacja24-backend
```

### CI/CD (GitHub Actions)

Pipeline automatycznie:
1. Uruchamia testy
2. Buduje obrazy Docker
3. Pushuje do registry
4. Deployuje na Kubernetes
5. Uruchamia smoke tests

## 📁 Struktura Projektu

```
rezerwacja24-saas/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Autentykacja
│   │   ├── tenants/           # Zarządzanie firmami
│   │   ├── bookings/          # System rezerwacji
│   │   ├── crm/               # CRM
│   │   ├── billing/           # Płatności i subskrypcje
│   │   ├── ai/                # AI features
│   │   ├── notifications/     # Powiadomienia
│   │   ├── marketplace/       # Marketplace
│   │   ├── automations/       # Automatyzacje
│   │   └── common/            # Shared modules
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── Dockerfile
│
├── frontend/                   # Next.js Frontend
│   ├── app/                   # App Router
│   │   ├── (landing)/         # Landing page
│   │   ├── (dashboard)/       # Admin dashboard
│   │   └── (tenant)/          # Tenant frontend
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── Dockerfile
│
├── nginx/                      # Nginx configuration
│   └── nginx.conf
│
├── k8s/                        # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ingress.yaml
│
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline
│
├── docker-compose.yml
├── ARCHITECTURE.md            # Dokumentacja architektury
└── README.md
```

## 📚 API Documentation

API dokumentacja dostępna pod:
- **Swagger UI**: https://api.rezerwacja24.pl/api/docs
- **OpenAPI JSON**: https://api.rezerwacja24.pl/api/docs-json

### Przykładowe endpointy

#### Auth
```bash
POST /api/auth/magic-link
POST /api/auth/verify-magic-link
POST /api/auth/oauth/google
```

#### Bookings
```bash
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id
DELETE /api/bookings/:id
GET    /api/bookings/availability
```

#### CRM
```bash
GET    /api/crm/contacts
POST   /api/crm/contacts
GET    /api/crm/contacts/:id
GET    /api/crm/segments
```

#### AI
```bash
POST   /api/ai/smart-scheduler
POST   /api/ai/chatbot
POST   /api/ai/voice-booking
```

## 🎨 Design System

### Paleta Kolorystyczna

```css
/* Dark Metallic Green Gradient */
--primary-dark: #0B2E23
--primary-green: #0F6048
--accent-neon: #41FFBC
--neutral-gray: #D9D9D9
--carbon-black: #0A0A0A
```

### Komponenty UI
- Glassmorphism cards
- Neonowe akcenty (#41FFBC)
- Minimal linear icons (Lucide)
- Micro-interactions (Framer Motion)

## 🧪 Testing

```bash
# Backend - Unit tests
cd backend
npm run test

# Backend - E2E tests
npm run test:e2e

# Frontend - Component tests
cd frontend
npm run test

# Load tests
k6 run tests/load-test.js
```

## 📊 Monitoring

- **Sentry** - error tracking
- **Datadog** - APM, logs, metrics
- **Uptime Robot** - uptime monitoring
- **LogRocket** - session replay

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Licencja

Copyright © 2024 Rezerwacja24. All rights reserved.

---

**Rezerwacja24** - Inteligentny System Rezerwacji dla Nowoczesnych Firm 🚀
