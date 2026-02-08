# 📱 DOKUMENTACJA SYSTEMU SMS - Rezerwacja24

## ✅ SYSTEM DZIAŁA I JEST ZABEZPIECZONY

**Data wdrożenia:** 16.12.2025  
**Status:** ✅ PRODUKCJA - W PEŁNI DZIAŁAJĄCY

---

## 🔧 KONFIGURACJA

### Backend (.env)
```bash
FLYSMS_API_KEY=scyMfnjzGQwnvRpGEvTCbolWnMZFRk6d
FLYSMS_SENDER=Rezerwacja
FLYSMS_API_URL=https://sms-fly.pl/api/v2/api.php
```

**⚠️ WAŻNE:**
- Nadawca "Rezerwacja" jest AKTYWNY w SMSFly
- NIE ZMIENIAJ nazwy nadawcy bez rejestracji w SMSFly
- Klucz API jest ważny i działa

---

## 📊 JAK DZIAŁA SYSTEM

### 1. Automatyczne SMS przy rezerwacji:

**Panel biznesowy:**
```
POST /api/bookings
Header: X-Tenant-ID: {tenantId}
→ bookings.service.create()
→ flySMSService.sendSMS()
→ ✅ SMS wysłany
```

**Subdomena (landing page):**
```
POST /api/bookings/public
Body: { tenantId: "...", ... }
→ bookings.service.createPublicBooking()
→ bookings.service.create()
→ flySMSService.sendSMS()
→ ✅ SMS wysłany
```

### 2. Typy SMS:

| Typ | Kiedy wysyła | Warunek |
|-----|--------------|---------|
| **confirmed** | Po utworzeniu rezerwacji | `status != 'CANCELLED'` |
| **rescheduled** | Zmiana daty/godziny | `startTime` się zmienia |
| **cancelled** | Odwołanie | `status = 'CANCELLED'` |
| **reminder** | Przypomnienie | 24h przed wizytą (TODO) |

### 3. Bezpieczeństwo:

✅ **Sprawdzanie przed wysłaniem:**
1. Czy klient ma numer telefonu?
2. Czy typ SMS jest włączony w ustawieniach?
3. Czy firma ma dostępne SMS (limit > 0)?
4. Czy numer jest poprawny (normalizacja)?

✅ **Izolacja danych:**
- Każdy tenant ma swoje ustawienia SMS
- Każdy tenant ma swój licznik SMS
- Filtrowanie po `tenantId` w każdym zapytaniu

---

## 🔢 LIMITY SMS

### Domyślne wartości:
- **Start:** 500 SMS na firmę
- **Ostrzeżenie:** Gdy pozostało ≤ 50 SMS
- **Blokada:** Gdy pozostało 0 SMS

### Struktura w bazie (tenants.sms_usage):
```json
{
  "used": 0,
  "limit": 500,
  "lastReset": "2025-12-16T22:00:00.000Z"
}
```

### Struktura ustawień (tenants.sms_settings):
```json
{
  "confirmedEnabled": true,
  "rescheduledEnabled": true,
  "cancelledEnabled": true,
  "reminderEnabled": false
}
```

---

## 🎯 ENDPOINTY API

### 1. Status SMS
```bash
GET /api/sms/status
Header: X-Tenant-ID: {tenantId}

Response:
{
  "used": 1,
  "limit": 500,
  "remaining": 499
}
```

### 2. Ustawienia SMS
```bash
GET /api/sms/settings
Header: X-Tenant-ID: {tenantId}

Response:
{
  "confirmedEnabled": true,
  "rescheduledEnabled": true,
  "cancelledEnabled": true,
  "reminderEnabled": false
}
```

### 3. Aktualizacja ustawień
```bash
POST /api/sms/settings
Header: X-Tenant-ID: {tenantId}
Body:
{
  "confirmedEnabled": true,
  "rescheduledEnabled": true,
  "cancelledEnabled": true,
  "reminderEnabled": false
}
```

### 4. Zakup SMS
```bash
POST /api/sms/purchase
Header: X-Tenant-ID: {tenantId}
Body:
{
  "amount": 100
}
```

### 5. Test SMS
```bash
POST /api/sms/test
Header: X-Tenant-ID: {tenantId}
Body:
{
  "phone": "506785959",
  "message": "Test SMS"
}
```

---

## 🧪 TESTOWANIE

### Test manualny:
```bash
curl -X POST http://localhost:3001/api/sms/test \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 1701364800000" \
  -d '{"phone":"506785959","message":"Test"}'
```

**Oczekiwany wynik:**
```json
{
  "success": true,
  "message": "SMS sent successfully"
}
```

### Sprawdzenie logów:
```bash
pm2 logs rezerwacja24-backend --lines 20 | grep SMS
```

**Oczekiwane logi:**
```
✅ SMS sent to 48506785959 for tenant 1701364800000 (type: confirmed)
📡 SMSFly Response: {"success":1,"messageID":"..."}
```

---

## 🚨 TROUBLESHOOTING

### Problem: SMS się nie wysyła

**1. Sprawdź ustawienia:**
```bash
curl http://localhost:3001/api/sms/settings \
  -H "X-Tenant-ID: 1701364800000"
```

**2. Sprawdź limit:**
```bash
curl http://localhost:3001/api/sms/status \
  -H "X-Tenant-ID: 1701364800000"
```

**3. Sprawdź logi:**
```bash
pm2 logs rezerwacja24-backend | grep -E "SMS|Error"
```

### Błędy SMSFly API:

| Kod | Opis | Rozwiązanie |
|-----|------|-------------|
| `INVRECIPIENT` | Nieprawidłowy numer | Sprawdź format numeru (48...) |
| `INVSOURCE` | Nieprawidłowy nadawca | Zarejestruj nazwę w SMSFly |
| `INVAUTH` | Błędny klucz API | Sprawdź `FLYSMS_API_KEY` |
| `NOFUNDS` | Brak środków | Doładuj konto SMSFly |

---

## 📝 PLIKI KLUCZOWE

### Backend:
- `backend/src/notifications/flysms.service.ts` - Logika SMS
- `backend/src/notifications/sms.controller.ts` - Endpointy API
- `backend/src/bookings/bookings.service.ts` - Wysyłanie przy rezerwacji
- `backend/.env` - Konfiguracja SMSFly

### Frontend:
- `frontend/components/settings/NotificationsTab.tsx` - UI ustawień SMS

### Baza danych:
- `tenants.sms_usage` - Licznik SMS (JSONB)
- `tenants.sms_settings` - Ustawienia SMS (JSONB)

---

## ✅ CHECKLIST PRZED ZMIANAMI

Przed każdą zmianą w systemie SMS:

- [ ] Zrób backup bazy danych
- [ ] Sprawdź czy testy bezpieczeństwa przechodzą: `./test-security.sh`
- [ ] Przetestuj na środowisku testowym
- [ ] Sprawdź logi po wdrożeniu
- [ ] Zweryfikuj licznik SMS

---

## 🔐 BEZPIECZEŃSTWO

### ✅ Zaimplementowane zabezpieczenia:

1. **Walidacja tenantId** - każde zapytanie sprawdza tenantId
2. **Limity SMS** - sprawdzanie przed wysłaniem
3. **Asynchroniczne wysyłanie** - nie blokuje API
4. **Error handling** - jeśli SMS nie wyśle się, nie crashuje
5. **Normalizacja numerów** - automatyczne dodawanie +48
6. **Logowanie** - wszystkie operacje są logowane

### ⚠️ NIE WOLNO:

- ❌ Usuwać sprawdzania limitów SMS
- ❌ Usuwać filtrowania po tenantId
- ❌ Zmieniać nazwy nadawcy bez rejestracji
- ❌ Hardcodować numerów telefonów
- ❌ Usuwać error handlingu

---

## 📞 KONTAKT W RAZIE PROBLEMÓW

1. Sprawdź logi: `pm2 logs rezerwacja24-backend`
2. Sprawdź status: `pm2 status`
3. Sprawdź bazę danych: `psql -h localhost -p 5434 -U postgres -d rezerwacja24`
4. Sprawdź dokumentację SMSFly: https://sms-fly.pl/api/

---

**SYSTEM SMS JEST W 100% GOTOWY I ZABEZPIECZONY!** ✅📱🔒
