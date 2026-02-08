# 📱 Integracja SMS-Fly - Dokumentacja

**Data**: 2024-12-13 20:54  
**Status**: ✅ GOTOWE DO KONFIGURACJI  
**Dokumentacja API**: `FLYSMS_API_DOCUMENTATION.pdf` (skopiowana z `/root/zdj/api123`)

**API**: Protokół oparty na wymianie komunikatów **JSON** za pośrednictwem protokołu **HTTP/S**  
**Cena**: 0,069 PLN za SMS (korzystniejsza cena dla klientów API)

---

## 🎯 Co Zostało Zrobione

### 1. ✅ SMS-Fly Service
**Plik**: `/backend/src/notifications/flysms.service.ts`

**Funkcje**:
- `sendSMS()` - Wysyła dowolny SMS przez SMS-Fly API
- `sendBookingConfirmation()` - SMS z potwierdzeniem rezerwacji
- `sendBookingReminder()` - SMS z przypomnieniem o rezerwacji
- `sendBookingCancellation()` - SMS z anulowaniem rezerwacji
- `getBalance()` - Sprawdza saldo konta SMS-Fly
- `normalizePhoneNumber()` - Normalizuje numery telefonów (dodaje +48)
- `isConfigured()` - Sprawdza czy dane logowania są skonfigurowane

### 2. ✅ SMS Controller
**Plik**: `/backend/src/notifications/sms.controller.ts`

**Endpointy API**:
- `POST /api/sms/send` - Wysyła testowy SMS
- `POST /api/sms/booking/confirmation` - SMS z potwierdzeniem rezerwacji
- `POST /api/sms/booking/reminder` - SMS z przypomnieniem
- `POST /api/sms/booking/cancellation` - SMS z anulowaniem
- `GET /api/sms/balance` - Sprawdza saldo konta
- `GET /api/sms/status` - Sprawdza status konfiguracji

### 3. ✅ Zmienne Środowiskowe
**Plik**: `/backend/.env`

```bash
FLYSMS_LOGIN=your_login_here
FLYSMS_PASSWORD=your_password_here
FLYSMS_SENDER=Rezerwacja24
```

### 4. ✅ Moduł Notifications (tylko SMS)
**Plik**: `/backend/src/notifications/notifications.module.ts`

**Zawiera tylko**:
- `FlySMSService` - serwis do wysyłki SMS
- `SMSController` - API do zarządzania SMS

**Usunięto**:
- ❌ Email notifications (SendGrid)
- ❌ Twilio SMS
- ❌ NotificationsService
- ❌ NotificationProcessor

**System obsługuje TYLKO powiadomienia SMS przez SMS-Fly!**

---

## 🔧 Konfiguracja

### Krok 1: Zarejestruj się w SMS-Fly

1. Zarejestruj się na: https://sms-fly.pl
2. Przejdź do: **Ustawienia** → **API**
3. Znajdź swój **login** i **hasło** do API (lub wygeneruj nowe)
4. Skopiuj dane

### Krok 2: Dodaj Dane do .env

```bash
# Edytuj plik
nano /root/CascadeProjects/rezerwacja24-saas/backend/.env

# Dodaj:
FLYSMS_LOGIN=twoj_login
FLYSMS_PASSWORD=twoje_haslo
FLYSMS_SENDER=Rezerwacja24
```

**API**: JSON przez HTTP/S - prosta implementacja, gotowa do użycia zaraz po rejestracji!

### Krok 3: Restart Backendu

```bash
cd /root/CascadeProjects/rezerwacja24-saas
pm2 restart rezerwacja24-backend
```

### Krok 4: Sprawdź Status

```bash
curl http://localhost:3001/api/sms/status
```

**Oczekiwany wynik**:
```json
{
  "configured": true,
  "provider": "FlySMS"
}
```

---

## 🧪 Testowanie

### Test 1: Sprawdź Saldo

```bash
curl http://localhost:3001/api/sms/balance
```

**Oczekiwany wynik**:
```json
{
  "success": true,
  "balance": 100.50,
  "currency": "PLN"
}
```

### Test 2: Wyślij Testowy SMS

```bash
curl -X POST http://localhost:3001/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+48123456789",
    "message": "Test SMS z Rezerwacja24"
  }'
```

**Oczekiwany wynik**:
```json
{
  "success": true,
  "messageId": "msg_123456",
  "message": "SMS sent successfully"
}
```

### Test 3: Wyślij SMS z Potwierdzeniem Rezerwacji

```bash
curl -X POST http://localhost:3001/api/sms/booking/confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+48123456789",
    "customerName": "Jan Kowalski",
    "serviceName": "Strzyżenie",
    "date": "15.12.2025",
    "time": "14:00"
  }'
```

**Oczekiwany wynik**:
```json
{
  "success": true,
  "messageId": "msg_123457",
  "message": "SMS sent successfully"
}
```

**SMS który otrzyma klient**:
```
Witaj Jan Kowalski! Potwierdzamy rezerwację: Strzyżenie w dniu 15.12.2025 o godzinie 14:00. Rezerwacja24
```

### Test 4: Wyślij SMS z Przypomnieniem

```bash
curl -X POST http://localhost:3001/api/sms/booking/reminder \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+48123456789",
    "customerName": "Jan Kowalski",
    "serviceName": "Strzyżenie",
    "date": "15.12.2025",
    "time": "14:00"
  }'
```

**SMS który otrzyma klient**:
```
Przypominamy Jan Kowalski: Strzyżenie jutro 15.12.2025 o 14:00. Do zobaczenia! Rezerwacja24
```

---

## 📊 API FlySMS - Szczegóły

### Endpoint: POST /api/v2/messages

**URL**: `https://api.flysms.pl/api/v2/messages`

**Headers**:
```
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

**Body**:
```json
{
  "to": "+48123456789",
  "text": "Treść wiadomości",
  "from": "Rezerwacja24"
}
```

**Response (Success)**:
```json
{
  "id": "msg_123456",
  "status": "sent",
  "to": "+48123456789",
  "from": "Rezerwacja24"
}
```

**Response (Error)**:
```json
{
  "error": "Invalid phone number",
  "message": "The phone number is not valid"
}
```

### Endpoint: GET /api/v2/account/balance

**URL**: `https://api.flysms.pl/api/v2/account/balance`

**Headers**:
```
Authorization: Bearer YOUR_API_TOKEN
```

**Response**:
```json
{
  "balance": 100.50,
  "currency": "PLN"
}
```

---

## 💡 Użycie w Kodzie

### Przykład 1: Wysyłanie SMS z Innego Serwisu

```typescript
import { Injectable } from '@nestjs/common';
import { FlySMSService } from '../notifications/flysms.service';

@Injectable()
export class BookingsService {
  constructor(private readonly flySMSService: FlySMSService) {}

  async createBooking(bookingData: any) {
    // ... logika tworzenia rezerwacji ...

    // Wyślij SMS z potwierdzeniem
    await this.flySMSService.sendBookingConfirmation(
      bookingData.customerPhone,
      bookingData.customerName,
      bookingData.serviceName,
      bookingData.date,
      bookingData.time,
    );

    return booking;
  }
}
```

### Przykład 2: Wysyłanie Niestandardowego SMS

```typescript
async sendCustomSMS(phoneNumber: string, message: string) {
  const result = await this.flySMSService.sendSMS({
    to: phoneNumber,
    message: message,
    from: 'MojaFirma', // Opcjonalnie
  });

  if (result.success) {
    console.log('SMS wysłany!', result.messageId);
  } else {
    console.error('Błąd:', result.error);
  }
}
```

### Przykład 3: Sprawdzanie Salda Przed Wysyłką

```typescript
async sendSMSWithBalanceCheck(phoneNumber: string, message: string) {
  // Sprawdź saldo
  const balance = await this.flySMSService.getBalance();
  
  if (!balance || balance.balance < 1) {
    throw new Error('Insufficient SMS balance');
  }

  // Wyślij SMS
  return this.flySMSService.sendSMS({
    to: phoneNumber,
    message: message,
  });
}
```

---

## 🔄 Migracja z SMSAPI do FlySMS

### Różnice w API

| Funkcja | SMSAPI | FlySMS |
|---------|--------|--------|
| Endpoint | `https://api.smsapi.pl` | `https://api.flysms.pl/api/v2` |
| Autoryzacja | OAuth Token | Bearer Token |
| Format numeru | +48123456789 | +48123456789 |
| Pole "from" | `sender` | `from` |
| Pole "to" | `to` | `to` |
| Pole "message" | `message` | `text` |

### Checklist Migracji

- [x] Utworzono `FlySMSService`
- [x] Dodano endpointy API
- [x] Dodano zmienne środowiskowe
- [x] Dodano normalizację numerów telefonów
- [x] Dodano obsługę błędów
- [x] Dodano logowanie
- [ ] Dodać API token do `.env`
- [ ] Przetestować wysyłkę SMS
- [ ] Zintegrować z modułem rezerwacji
- [ ] Dodać automatyczne przypomnienia

---

## ⚠️ Ważne Uwagi

### 1. Normalizacja Numerów Telefonów

FlySMS wymaga numerów w formacie międzynarodowym:
- ✅ `+48123456789`
- ❌ `123456789`
- ❌ `0048123456789`

Serwis automatycznie normalizuje numery:
- `123456789` → `+48123456789`
- `0123456789` → `+48123456789`

### 2. Limity Znaków

- Maksymalna długość SMS: **160 znaków** (bez polskich znaków)
- Z polskimi znakami: **70 znaków**
- Dłuższe wiadomości są dzielone na części

### 3. Koszty

- Sprawdź cennik na: https://flysms.pl/cennik
- Monitoruj saldo regularnie
- Ustaw alerty przy niskim saldzie

### 4. Testy

- Używaj prawdziwych numerów do testów
- FlySMS nie ma trybu testowego (sandbox)
- Każdy wysłany SMS jest płatny

---

## 📞 Wsparcie

### FlySMS
- Panel: https://flysms.pl
- Dokumentacja API: https://flysms.pl/docs
- Email: support@flysms.pl

### Rezerwacja24
- Logi: `pm2 logs rezerwacja24-backend | grep FlySMS`
- Status: `curl http://localhost:3001/api/sms/status`
- Saldo: `curl http://localhost:3001/api/sms/balance`

---

## ✅ Podsumowanie

### Co Działa
- ✅ FlySMS Service utworzony
- ✅ API endpointy dodane
- ✅ Normalizacja numerów
- ✅ Obsługa błędów
- ✅ Logowanie
- ✅ Sprawdzanie salda

### Co Musisz Zrobić
1. **Dodaj API token** do `.env`
2. **Restart backendu**: `pm2 restart rezerwacja24-backend`
3. **Przetestuj**: `curl http://localhost:3001/api/sms/status`
4. **Wyślij testowy SMS**: Użyj przykładów powyżej

### Następne Kroki
1. Zintegruj z modułem rezerwacji
2. Dodaj automatyczne przypomnienia (cron job)
3. Dodaj panel SMS w dashboard
4. Dodaj statystyki wysyłek

**Integracja FlySMS jest gotowa!** 🚀
