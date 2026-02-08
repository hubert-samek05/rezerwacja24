# 🏗️ Architektura Systemu Rezerwacja24 SaaS

## 📋 Przegląd Systemu

**Rezerwacja24** to wielofirmowy (multi-tenant) system rezerwacji z CRM, automatyzacjami i AI, zaprojektowany jako premium SaaS dla firm usługowych.

### 🎯 Kluczowe Cechy
- **Multi-tenant z subdomenami** - każda firma ma własną subdomenę (firma.rezerwacja24.pl)
- **White-label** - pełna personalizacja brandingu
- **AI-powered** - inteligentne planowanie, chatbot, dynamic pricing
- **Marketplace** - katalog firm dostępny publicznie
- **Automatyzacje** - scenariusze IFTTT, kampanie marketingowe
- **Single pricing** - Pro (79.99 PLN/miesiąc) z 7-dniowym okresem próbnym

---

## 🎨 Design System

### Paleta Kolorystyczna
```css
/* Główne kolory */
--primary-dark: #0B2E23;
--primary-green: #0F6048;
--accent-neon: #41FFBC;
--neutral-gray: #D9D9D9;
--carbon-black: #0A0A0A;

/* Gradienty */
--gradient-primary: linear-gradient(135deg, #0B2E23 0%, #0F6048 100%);
--gradient-accent: linear-gradient(135deg, #0F6048 0%, #41FFBC 100%);
```

### Styl UI/UX
- **Glassmorphism** - przezroczyste karty z blur effect
- **Neonowe akcenty** - #41FFBC dla CTA i hover states
- **Minimal Linear Icons** - Lucide React
- **Micro-interactions** - Framer Motion animations
- **Premium Enterprise Look** - przestrzeń, czytelność, elegancja

---

## 🧱 Stack Technologiczny

### Frontend
```
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- HeadlessUI
- Framer Motion
- React Hook Form + Zod
- TanStack Query
- Zustand (state management)
```

### Backend
```
- NestJS
- Prisma ORM
- PostgreSQL 15
- Redis (cache, queues, rate limiting)
- WebSockets (Socket.io)
- Bull (job queues)
```

### Infrastructure
```
- Docker + Docker Compose
- Kubernetes (production)
- Nginx (reverse proxy, SSL)
- GitHub Actions (CI/CD)
- AWS S3 (storage)
- CloudFlare (CDN, DNS)
```

### Integracje
```
- Stripe (payments, subscriptions)
- Twilio (SMS)
- SendGrid (Email)
- Google Calendar API
- Microsoft Graph API (Outlook)
- OpenAI API (AI features)
- Whisper API (voice booking)
```

---

## 🗄️ Architektura Bazy Danych

### Multi-Tenant Strategy
**Podejście: Shared Database, Separate Schemas**

Każda firma (tenant) ma własny schema w PostgreSQL:
```
tenant_firma123
tenant_firma456
tenant_firma789
```

Schema `public` zawiera:
- Użytkownicy systemu
- Subskrypcje i plany
- Marketplace
- Billing
- Globalne ustawienia

### Główne Tabele

#### Public Schema
```prisma
User
Tenant (firma)
Subscription
SubscriptionPlan
FeatureFlag
MarketplaceListing
Invoice
Payment
```

#### Tenant Schema (per firma)
```prisma
Customer (klienci firmy)
Employee (pracownicy)
Service (usługi)
ServiceCategory
ServiceAddon
Booking (rezerwacje)
Availability (dostępność)
TimeBlock (blokady)
CRMContact
CRMNote
CRMTag
CRMSegment
CRMPipeline
Automation
Campaign
Coupon
LoyaltyProgram
Review
```

---

## 🔐 Autentykacja i Autoryzacja

### Auth Flow
1. **Magic Link** (email)
2. **OAuth** (Google, Microsoft)
3. **JWT Tokens** (access + refresh)
4. **SMS OTP** (opcjonalnie dla klientów)

### Role System
```typescript
enum UserRole {
  SUPER_ADMIN,      // Admin platformy
  TENANT_OWNER,     // Właściciel firmy
  TENANT_ADMIN,     // Admin firmy
  TENANT_EMPLOYEE,  // Pracownik
  CUSTOMER          // Klient końcowy
}
```

### Middleware Stack
```
1. TenantResolver (subdomain → tenant_id)
2. AuthGuard (JWT validation)
3. RoleGuard (role-based access)
4. SubscriptionGuard (feature flags)
5. RateLimitGuard (Redis)
```

---

## 🌐 Routing i Subdomeny

### DNS Configuration
```
*.rezerwacja24.pl → Load Balancer
rezerwacja24.pl → Landing Page
app.rezerwacja24.pl → Admin Dashboard
api.rezerwacja24.pl → Backend API
firma123.rezerwacja24.pl → Tenant Frontend
```

### Nginx Config
```nginx
server {
    server_name ~^(?<subdomain>.+)\.rezerwacja24\.pl$;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header X-Tenant-Subdomain $subdomain;
    }
}
```

### Next.js Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const subdomain = extractSubdomain(hostname);
  
  if (subdomain && subdomain !== 'app' && subdomain !== 'api') {
    // Tenant frontend
    return NextResponse.rewrite(new URL(`/tenant/${subdomain}${pathname}`, request.url));
  }
  
  // Main app
  return NextResponse.next();
}
```

---

## 📡 API Architecture

### REST API Endpoints

#### Auth
```
POST   /api/auth/magic-link
POST   /api/auth/verify-magic-link
POST   /api/auth/oauth/google
POST   /api/auth/oauth/microsoft
POST   /api/auth/refresh
POST   /api/auth/logout
```

#### Tenants
```
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/:id
PATCH  /api/tenants/:id
DELETE /api/tenants/:id
POST   /api/tenants/:id/subdomain
```

#### Bookings
```
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id
DELETE /api/bookings/:id
POST   /api/bookings/:id/cancel
POST   /api/bookings/:id/reschedule
GET    /api/bookings/availability
POST   /api/bookings/cross-booking
```

#### CRM
```
GET    /api/crm/contacts
POST   /api/crm/contacts
GET    /api/crm/contacts/:id
PATCH  /api/crm/contacts/:id
GET    /api/crm/contacts/:id/history
POST   /api/crm/contacts/:id/notes
GET    /api/crm/segments
POST   /api/crm/pipeline
```

#### Billing
```
POST   /api/billing/create-checkout-session
POST   /api/billing/upgrade
GET    /api/billing/limits
GET    /api/billing/invoices
POST   /api/billing/portal
```

#### AI
```
POST   /api/ai/smart-scheduler
POST   /api/ai/recommend
POST   /api/ai/chatbot
POST   /api/ai/voice-booking
POST   /api/ai/summary
```

#### Marketplace
```
GET    /api/marketplace/listings
GET    /api/marketplace/listings/:id
POST   /api/marketplace/listings/:id/review
GET    /api/marketplace/search
```

### WebSocket Events
```typescript
// Server → Client
booking:created
booking:updated
booking:cancelled
notification:new
chat:message

// Client → Server
booking:subscribe
notification:subscribe
chat:send
```

---

## 🤖 AI Features

### 1. Smart Scheduler
```typescript
// Algorytm:
1. Analiza historii rezerwacji klienta
2. Preferencje czasowe (rano/popołudnie)
3. Obłożenie pracowników
4. Dynamic pricing
5. Propozycja 3 najlepszych terminów
```

### 2. AI Chatbot
```typescript
// OpenAI GPT-4 + Function Calling
- Odpowiedzi na pytania o usługi
- Tworzenie rezerwacji głosowo
- Rekomendacje usług
- Obsługa anulacji/zmian
```

### 3. Voice Booking
```typescript
// Whisper API
1. Nagranie audio → transkrypcja
2. NLP extraction (usługa, data, godzina)
3. Potwierdzenie → utworzenie rezerwacji
```

### 4. Dynamic Pricing
```typescript
// Algorytm:
basePrice * demandMultiplier * dayMultiplier * timeMultiplier

demandMultiplier = 1 + (bookingRate / maxCapacity) * 0.3
dayMultiplier = weekendDay ? 1.2 : 1.0
timeMultiplier = peakHour ? 1.15 : 1.0
```

---

## 🔄 Automatyzacje

### Automation Engine
```typescript
interface AutomationRule {
  trigger: 'booking_created' | 'booking_cancelled' | 'no_show' | 'review_received';
  conditions: Condition[];
  actions: Action[];
}

// Przykład:
{
  trigger: 'no_show',
  conditions: [
    { field: 'customer.noShowCount', operator: 'gte', value: 3 }
  ],
  actions: [
    { type: 'block_customer', duration: '30d' },
    { type: 'send_email', template: 'no_show_warning' }
  ]
}
```

### Predefiniowane Scenariusze
1. **No-show protection** - blokada po 3 niestawiennictwach
2. **Review request** - SMS 2h po wizycie
3. **Lead nurturing** - email sequence dla nowych leadów
4. **Slot optimization** - automatyczne wypełnianie wolnych terminów
5. **Loyalty rewards** - punkty za każdą wizytę

---

## 📊 Dashboard & Analytics

### Metryki Kluczowe
```typescript
- Booking Rate (dzienny/tygodniowy/miesięczny)
- Revenue (MRR, ARR)
- Occupancy Rate (% zapełnienia)
- Customer Lifetime Value
- Churn Rate
- Top Services
- Top Customers
- Peak Hours Heatmap
- No-show Rate
- Average Booking Value
```

### Wizualizacje
- **Heatmapa** - obłożenie wg dni i godzin
- **Funnel** - konwersja od wizyty do rezerwacji
- **Cohort Analysis** - retention klientów
- **Revenue Chart** - przychody w czasie

---

## 💳 System Subskrypcji

### Plan Cenowy

**Plan Pro - 79.99 PLN/miesiąc**

- ✅ **Nielimitowane rezerwacje**
- ✅ **Nielimitowani pracownicy**
- ✅ **500 SMS miesięcznie**
- ✅ **Integracja Google Calendar**
- ✅ **Integracja iOS Calendar**
- ✅ **Zaawansowana analityka**
- ✅ **Automatyzacje**
- ✅ **White-label branding**
- ✅ **Własna subdomena**
- ✅ **Dostęp do API**
- ✅ **Wsparcie priorytetowe przez chat**
- ✅ **Aplikacja mobilna - już niebawem!**

### Okres Próbny

- **Czas trwania**: 7 dni
- **Wymagana karta**: TAK (przy rejestracji)
- **Pierwsza płatność**: Po zakończeniu okresu próbnego
- **Anulowanie**: Możliwe w dowolnym momencie

### Stripe Integration

```typescript
// Webhook events:
- checkout.session.completed → potwierdzenie checkout
- customer.subscription.created → utworzenie subskrypcji
- customer.subscription.updated → aktualizacja statusu
- customer.subscription.deleted → anulowanie subskrypcji
- customer.subscription.trial_will_end → przypomnienie (3 dni przed końcem)
- invoice.paid → potwierdzenie płatności
- invoice.payment_failed → nieudana płatność
- payment_method.attached → dodanie karty
```

### Flow Subskrypcji

```
1. Rejestracja → 2. Checkout (karta) → 3. Okres próbny (7 dni) → 4. Pierwsza płatność → 5. Aktywna subskrypcja
                                                ↓
                                         Anulowanie (opcjonalne)
```

---

## 🔔 System Powiadomień

### Kanały
1. **Email** (SendGrid)
2. **SMS** (Twilio)
3. **WhatsApp** (Twilio)
4. **Push** (PWA)
5. **In-app** (WebSocket)

### Typy Powiadomień
```typescript
- booking_confirmed
- booking_reminder_24h
- booking_reminder_2h
- booking_cancelled
- booking_rescheduled
- payment_received
- review_request
- campaign_message
- loyalty_reward
```

### Queue System (Bull)
```typescript
// Redis-backed job queue
notificationQueue.add('send-sms', {
  to: '+48123456789',
  message: 'Przypomnienie o wizycie jutro o 10:00',
  scheduledFor: new Date('2024-01-15T08:00:00Z')
}, {
  delay: calculateDelay(),
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

---

## 🏪 Marketplace

### Funkcje
- **Katalog firm** - publiczny listing z filtrowaniem
- **Profile premium** - wyróżnienie w wynikach
- **Review system** - oceny i opinie
- **Booking widget** - bezpośrednia rezerwacja
- **SEO optimization** - meta tags, schema.org

### Ranking Algorithm
```typescript
score = (
  reviewScore * 0.3 +
  bookingCount * 0.2 +
  responseTime * 0.15 +
  premiumBoost * 0.2 +
  completionRate * 0.15
)
```

---

## 🔒 Bezpieczeństwo

### Środki Bezpieczeństwa
1. **Rate Limiting** (Redis)
   - 100 req/min per IP
   - 1000 req/hour per user
2. **CORS** - whitelist domen
3. **Helmet.js** - security headers
4. **SQL Injection** - Prisma ORM (parametryzowane)
5. **XSS Protection** - sanityzacja inputów
6. **CSRF Tokens**
7. **Encryption at Rest** - PostgreSQL + pgcrypto
8. **SSL/TLS** - Let's Encrypt
9. **2FA** - opcjonalnie dla adminów

---

## 📦 Deployment

### Docker Compose (Development)
```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  backend:
    build: ./backend
    ports: ["4000:4000"]
  
  postgres:
    image: postgres:15
    volumes: ["pgdata:/var/lib/postgresql/data"]
  
  redis:
    image: redis:7-alpine
```

### Kubernetes (Production)
```yaml
# Deployments:
- frontend (3 replicas)
- backend (5 replicas)
- postgres (StatefulSet)
- redis (StatefulSet)
- nginx-ingress

# Services:
- LoadBalancer (external)
- ClusterIP (internal)

# ConfigMaps & Secrets
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
1. Run tests
2. Build Docker images
3. Push to registry
4. Deploy to K8s cluster
5. Run smoke tests
6. Rollback on failure
```

---

## 📈 Skalowanie

### Horizontal Scaling
- **Frontend** - CDN + multiple instances
- **Backend** - load balancer + auto-scaling
- **Database** - read replicas
- **Redis** - cluster mode

### Caching Strategy
```typescript
// Multi-level cache:
1. Browser cache (static assets)
2. CDN cache (CloudFlare)
3. Redis cache (API responses)
4. PostgreSQL query cache
```

### Performance Targets
- **API Response** < 200ms (p95)
- **Page Load** < 2s (LCP)
- **Booking Creation** < 500ms
- **Uptime** 99.9%

---

## 🧪 Testing

### Test Coverage
```
- Unit Tests (Jest) - 80%+
- Integration Tests (Supertest) - 70%+
- E2E Tests (Playwright) - critical paths
- Load Tests (k6) - 1000 concurrent users
```

---

## 📚 Dokumentacja

### Generowana Automatycznie
- **API Docs** - Swagger/OpenAPI
- **Component Storybook** - UI components
- **Database Schema** - Prisma Studio
- **Architecture Diagrams** - Mermaid

---

## 🚀 Roadmap

### Phase 1 (MVP) - Q1 2024
- ✅ Multi-tenant architecture
- ✅ Basic booking system
- ✅ CRM foundation
- ✅ Stripe integration
- ✅ Email notifications

### Phase 2 - Q2 2024
- AI Smart Scheduler
- Voice Booking
- WhatsApp integration
- Advanced automations
- Marketplace launch

### Phase 3 - Q3 2024
- Mobile apps (React Native)
- Advanced analytics
- White-label customization
- API for developers
- Integrations marketplace

---

## 📞 Support & Monitoring

### Monitoring Stack
- **Sentry** - error tracking
- **Datadog** - APM, logs, metrics
- **Uptime Robot** - uptime monitoring
- **LogRocket** - session replay

### Support Tiers
- **Standard** - email (48h response)
- **Premium** - email + chat (24h response)
- **Pro** - dedicated support (4h response)

---

**Wersja:** 1.0.0  
**Data:** 2024-01-15  
**Autor:** Rezerwacja24 Team
