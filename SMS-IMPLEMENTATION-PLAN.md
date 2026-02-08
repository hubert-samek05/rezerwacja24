# 📱 PLAN IMPLEMENTACJI SMS - DO ZATWIERDZENIA

## ⚠️ PRZECZYTAJ I ZATWIERDŹ PRZED ROZPOCZĘCIEM!

---

## 🎯 WYMAGANIA:

### 1. Typy SMS (4 szablony):
- ✅ Wizyta potwierdzona
- ✅ Rezerwacja przesunięta  
- ✅ Przypomnienie o wizycie
- ✅ Odwołana wizyta

### 2. Limity SMS:
- ✅ 500 SMS na start dla każdej firmy
- ✅ Możliwość zakupu dodatkowych SMS
- ✅ Ostrzeżenie gdy zostaje mało SMS (np. 50)

### 3. Ustawienia:
- ✅ Zakładka "Ustawienia → SMS i Powiadomienia"
- ✅ Firma wybiera które SMS mają być wysyłane automatycznie
- ✅ Włącz/wyłącz każdy typ SMS osobno

### 4. API SMSFly:
- ✅ Metoda: POST
- ✅ Format: JSON
- ✅ Endpoint: `https://sms-fly.pl/api/v2/api.php`

---

## 📋 CO BĘDZIE ZMIENIONE:

### BACKEND:

#### 1. Nowy serwis: `flysms.service.ts`
```typescript
// Funkcje:
- sendSMS(phone, message) - wysyła SMS przez SMSFly API
- checkBalance() - sprawdza saldo SMS
- normalizePhone(phone) - formatuje numer telefonu
```

#### 2. Nowa tabela w bazie: `sms_usage`
```sql
CREATE TABLE sms_usage (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  smsUsed INT DEFAULT 0,
  smsLimit INT DEFAULT 500,
  lastResetDate TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### 3. Nowa tabela: `sms_settings`
```sql
CREATE TABLE sms_settings (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  confirmedEnabled BOOLEAN DEFAULT true,
  rescheduledEnabled BOOLEAN DEFAULT true,
  reminderEnabled BOOLEAN DEFAULT true,
  cancelledEnabled BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### 4. Modyfikacja: `bookings.service.ts`
```typescript
// Dodanie wywołań SMS po:
- create() - SMS: "Wizyta potwierdzona"
- update() - SMS: "Rezerwacja przesunięta" (jeśli zmieniono datę)
- update() - SMS: "Odwołana wizyta" (jeśli status = CANCELLED)
```

#### 5. Nowy endpoint: `/api/sms/purchase`
```typescript
// Zakup dodatkowych SMS
POST /api/sms/purchase
Body: { packages: number } // 1 pakiet = 100 SMS
```

#### 6. Nowy endpoint: `/api/sms/status`
```typescript
// Sprawdzenie statusu SMS
GET /api/sms/status
Response: { used: 150, limit: 500, remaining: 350 }
```

### FRONTEND:

#### 1. Nowa zakładka: `NotificationsTab.tsx`
```typescript
// W Settings:
- Przełączniki dla każdego typu SMS
- Licznik użytych/pozostałych SMS
- Przycisk "Kup więcej SMS"
- Ostrzeżenie gdy mało SMS
```

#### 2. Modyfikacja: `BookingForm.tsx`
```typescript
// Dodanie checkboxa:
"Wyślij SMS z potwierdzeniem" (domyślnie zaznaczony)
```

---

## 🔒 BEZPIECZEŃSTWO:

### ✅ Każdy endpoint SMS będzie:
1. Sprawdzał `tenantId` (tylko swoje SMS)
2. Walidował limit SMS (nie wyśle jeśli brak)
3. Logował każde wysłanie SMS
4. Miał error handling (jeśli API nie działa)

### ✅ Testy bezpieczeństwa:
1. Firma A nie może zobaczyć SMS firmy B
2. Firma A nie może użyć SMS firmy B
3. Nie można wysłać SMS bez limitu

---

## 📝 KROKI IMPLEMENTACJI:

### KROK 1: Baza danych (5 min)
- [ ] Dodać tabele `sms_usage` i `sms_settings` do Prisma schema
- [ ] Uruchomić migrację
- [ ] Dodać seed data (500 SMS dla każdej firmy)

### KROK 2: Backend - SMS Service (10 min)
- [ ] Utworzyć `flysms.service.ts`
- [ ] Dodać integrację z SMSFly API (POST JSON)
- [ ] Dodać walidację numeru telefonu
- [ ] Dodać sprawdzanie limitu

### KROK 3: Backend - Endpoints (10 min)
- [ ] `/api/sms/status` - status SMS
- [ ] `/api/sms/settings` - ustawienia SMS
- [ ] `/api/sms/purchase` - zakup SMS
- [ ] Dodać do `bookings.service.ts` wywołania SMS

### KROK 4: Frontend - Settings (10 min)
- [ ] Zakładka "SMS i Powiadomienia"
- [ ] Przełączniki dla typów SMS
- [ ] Licznik SMS
- [ ] Przycisk zakupu

### KROK 5: Testy (10 min)
- [ ] Test wysyłania SMS
- [ ] Test limitów
- [ ] Test bezpieczeństwa (tenantId)
- [ ] Test ustawień

### KROK 6: Deploy (5 min)
- [ ] `npm run build` (automatyczny test bezpieczeństwa)
- [ ] `pm2 restart all`
- [ ] Sprawdzenie na produkcji

**ŁĄCZNY CZAS: ~50 minut**

---

## ⚠️ RYZYKA I ZABEZPIECZENIA:

### Ryzyko 1: SMS wysyłane do wszystkich firm
**Zabezpieczenie:** Każde wysłanie SMS sprawdza `tenantId`

### Ryzyko 2: Firma może wysłać nieskończenie SMS
**Zabezpieczenie:** Sprawdzanie limitu przed każdym wysłaniem

### Ryzyko 3: Błąd API SMSFly zatrzyma system
**Zabezpieczenie:** Try-catch, SMS wysyłane asynchronicznie

### Ryzyko 4: Zmiana kodu zepsuje bezpieczeństwo
**Zabezpieczenie:** Automatyczne testy przy `npm run build`

---

## 💰 KOSZTY:

- SMSFly API: ~0.10 PLN za SMS
- 500 SMS = ~50 PLN miesięcznie na firmę
- Pakiet 100 SMS = ~10 PLN

---

## ✅ CHECKLIST PRZED STARTEM:

- [ ] Masz klucz API SMSFly (`FLYSMS_API_KEY`)
- [ ] Masz nazwę nadawcy (`FLYSMS_SENDER`)
- [ ] Zatwierdzasz plan implementacji
- [ ] Rozumiesz że będzie migracja bazy danych
- [ ] Backup jest utworzony

---

## 🚀 GOTOWY DO STARTU?

**Jeśli zatwierdzasz plan, napisz: "ZATWIERDZAM"**

**Jeśli chcesz coś zmienić, napisz co.**

**NIE ZACZNĘ BEZ TWOJEGO ZATWIERDZENIA!**
