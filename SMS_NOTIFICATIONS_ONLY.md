# 📱 System Powiadomień - TYLKO SMS

**Data**: 2024-12-13 21:00  
**Status**: ✅ GOTOWE

---

## 🎯 Decyzja Projektowa

**System obsługuje TYLKO powiadomienia SMS przez SMS-Fly.**

**NIE MA**:
- ❌ Powiadomień email (SendGrid)
- ❌ Innych dostawców SMS (Twilio)
- ❌ Push notifications
- ❌ Powiadomień w aplikacji

**JEST TYLKO**:
- ✅ SMS przez SMS-Fly API (JSON przez HTTP/S)

---

## 📂 Struktura Modułu Notifications

```
backend/src/notifications/
├── flysms.service.ts      # Serwis SMS-Fly (główna logika)
├── sms.controller.ts      # API endpoints dla SMS
└── notifications.module.ts # Moduł (tylko SMS)
```

**Usunięte pliki**:
- ❌ `twilio.service.ts`
- ❌ `sendgrid.service.ts`
- ❌ `notifications.controller.ts`
- ❌ `notifications.service.ts`
- ❌ `notification.processor.ts`

---

## 🔧 Konfiguracja

### Zmienne środowiskowe (.env)

```bash
# SMS-Fly Configuration
FLYSMS_LOGIN=your_login_here
FLYSMS_PASSWORD=your_password_here
FLYSMS_SENDER=Rezerwacja24
```

### Jak skonfigurować:

1. **Zarejestruj się**: https://sms-fly.pl
2. **Pobierz dane**: Login i hasło do API z panelu
3. **Dodaj do .env**: Wpisz login i hasło
4. **Restart**: `pm2 restart rezerwacja24-backend`

---

## 📡 API Endpoints

### 1. Wysyłanie SMS

**POST** `/api/sms/send`

```json
{
  "to": "+48123456789",
  "message": "Treść wiadomości"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_123456",
  "message": "SMS sent successfully"
}
```

### 2. SMS z potwierdzeniem rezerwacji

**POST** `/api/sms/booking/confirmation`

```json
{
  "phoneNumber": "+48123456789",
  "customerName": "Jan Kowalski",
  "serviceName": "Strzyżenie",
  "date": "15.12.2025",
  "time": "14:00"
}
```

**Treść SMS**:
```
Witaj Jan Kowalski! Potwierdzamy rezerwację: Strzyżenie w dniu 15.12.2025 o godzinie 14:00. Rezerwacja24
```

### 3. SMS z przypomnieniem

**POST** `/api/sms/booking/reminder`

```json
{
  "phoneNumber": "+48123456789",
  "customerName": "Jan Kowalski",
  "serviceName": "Strzyżenie",
  "date": "15.12.2025",
  "time": "14:00"
}
```

**Treść SMS**:
```
Przypominamy Jan Kowalski: Strzyżenie jutro 15.12.2025 o 14:00. Do zobaczenia! Rezerwacja24
```

### 4. SMS z anulowaniem

**POST** `/api/sms/booking/cancellation`

```json
{
  "phoneNumber": "+48123456789",
  "customerName": "Jan Kowalski",
  "serviceName": "Strzyżenie",
  "date": "15.12.2025",
  "time": "14:00"
}
```

**Treść SMS**:
```
Witaj Jan Kowalski. Rezerwacja Strzyżenie w dniu 15.12.2025 o 14:00 została anulowana. Rezerwacja24
```

### 5. Sprawdź saldo

**GET** `/api/sms/balance`

**Response**:
```json
{
  "success": true,
  "balance": 100.50,
  "currency": "PLN"
}
```

### 6. Sprawdź status

**GET** `/api/sms/status`

**Response**:
```json
{
  "configured": true,
  "provider": "SMS-Fly"
}
```

---

## 💡 Użycie w Kodzie

### Przykład: Wysyłanie SMS po utworzeniu rezerwacji

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

### Przykład: Wysyłanie niestandardowego SMS

```typescript
async sendCustomSMS(phoneNumber: string, message: string) {
  const result = await this.flySMSService.sendSMS({
    to: phoneNumber,
    message: message,
  });

  if (result.success) {
    console.log('SMS wysłany!', result.messageId);
  } else {
    console.error('Błąd:', result.error);
  }
}
```

---

## 📊 Format API SMS-Fly

### Request do SMS-Fly

```json
{
  "auth": {
    "login": "twoj_login",
    "password": "twoje_haslo"
  },
  "action": "SENDMESSAGE",
  "data": {
    "recipient": "+48123456789",
    "message": {
      "text": "Treść wiadomości",
      "from": "Rezerwacja24"
    }
  }
}
```

### Response od SMS-Fly

```json
{
  "success": true,
  "data": {
    "messageId": "msg_123456"
  },
  "message": "Message sent successfully"
}
```

---

## 💰 Ceny

**SMS-Fly API**: **0,069 PLN za SMS**

To korzystniejsza cena niż standardowa wysyłka przez panel!

---

## 📞 Normalizacja Numerów Telefonów

System automatycznie normalizuje numery do formatu międzynarodowego:

| Wejście | Wyjście |
|---------|---------|
| `123456789` | `+48123456789` |
| `0123456789` | `+48123456789` |
| `+48 123 456 789` | `+48123456789` |
| `48-123-456-789` | `+48123456789` |

**Domyślny prefiks**: `+48` (Polska)

---

## ✅ Checklist Implementacji

### Backend
- [x] FlySMSService utworzony
- [x] SMS Controller dodany
- [x] Notifications Module uproszczony (tylko SMS)
- [x] Usunięto SendGrid
- [x] Usunięto Twilio
- [x] Usunięto NotificationsService
- [x] Zmienne środowiskowe skonfigurowane
- [x] Normalizacja numerów telefonów
- [x] Obsługa błędów
- [x] Logowanie

### Do Zrobienia
- [ ] Dodać login i hasło SMS-Fly do `.env`
- [ ] Przetestować wysyłkę SMS
- [ ] Zintegrować z modułem rezerwacji
- [ ] Dodać automatyczne przypomnienia (cron job)
- [ ] Dodać panel SMS w dashboard (opcjonalnie)
- [ ] Dodać statystyki wysyłek (opcjonalnie)

---

## 🚀 Następne Kroki

1. **Zarejestruj się** w SMS-Fly
2. **Dodaj dane** do `.env`
3. **Przetestuj** wysyłkę:
   ```bash
   curl -X POST http://localhost:3001/api/sms/send \
     -H "Content-Type: application/json" \
     -d '{
       "to": "+48123456789",
       "message": "Test SMS z Rezerwacja24"
     }'
   ```
4. **Zintegruj** z rezerwacjami

---

## 📄 Dokumentacja

- **API SMS-Fly**: `FLYSMS_API_DOCUMENTATION.pdf`
- **Integracja**: `FLYSMS_INTEGRATION.md`
- **Ten plik**: `SMS_NOTIFICATIONS_ONLY.md`

---

**System powiadomień jest gotowy! Tylko SMS, bez emaili!** 📱✅
