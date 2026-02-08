# 🚀 Przewodnik Wdrożenia SMS na Produkcję

## Krok 1: Konfiguracja API SMSFly

### 1.1. Zarejestruj się w SMSFly
1. Przejdź na: https://sms-fly.pl
2. Załóż konto firmowe
3. Doładuj konto (min. 50 PLN)

### 1.2. Pobierz klucz API
1. Zaloguj się do panelu SMSFly
2. Przejdź do: **Ustawienia** → **API**
3. Skopiuj **Klucz API** (API Key)

### 1.3. Dodaj klucz do .env
```bash
# Edytuj plik
nano /root/CascadeProjects/rezerwacja24-saas/backend/.env

# Dodaj:
FLYSMS_API_KEY=twoj_klucz_api_tutaj
FLYSMS_SENDER=Rezerwacja24
```

---

## Krok 2: Restart Aplikacji

### 2.1. Restart backendu
```bash
cd /root/CascadeProjects/rezerwacja24-saas
pm2 restart rezerwacja24-backend
```

### 2.2. Sprawdź logi
```bash
pm2 logs rezerwacja24-backend --lines 50
```

Szukaj linii:
```
✅ FlySMS API key configured
```

---

## Krok 3: Weryfikacja Konfiguracji

### 3.1. Sprawdź status API
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

### 3.2. Test wysyłki SMS
```bash
curl -X POST http://localhost:3001/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+48TWOJ_NUMER",
    "message": "Test SMS z Rezerwacja24"
  }'
```

**Oczekiwany wynik**:
```json
{
  "success": true,
  "messageId": "msg_xxxxx",
  "message": "SMS sent successfully"
}
```

---

## Krok 4: Konfiguracja w Panelu Admin

### 4.1. Zaloguj się do panelu
1. Otwórz: https://app.rezerwacja24.pl
2. Zaloguj się jako admin
3. Przejdź do: **Ustawienia** → **Powiadomienia**

### 4.2. Włącz SMS
1. Przełącz toggle "Włącz powiadomienia SMS" na ON
2. Zaznacz typy powiadomień:
   - ✅ Potwierdzenie rezerwacji
   - ✅ Przypomnienie o rezerwacji
   - ✅ Przesunięcie rezerwacji
   - ✅ Anulowanie rezerwacji
3. Kliknij "Zapisz ustawienia"

### 4.3. Sprawdź licznik SMS
Powinieneś zobaczyć:
```
0/500 SMS
```

---

## Krok 5: Test Funkcjonalności

### 5.1. Utwórz testową rezerwację
1. Przejdź do: **Rezerwacje** → **Nowa rezerwacja**
2. Wybierz klienta z numerem telefonu
3. Wybierz usługę i termin
4. Kliknij "Zarezerwuj"

### 5.2. Sprawdź wysyłkę SMS
1. Klient powinien otrzymać SMS:
   ```
   Witaj [Imię]! Potwierdzamy rezerwację: [Usługa] w dniu [Data] o godzinie [Godzina]. Rezerwacja24
   ```

2. Sprawdź licznik w panelu:
   ```
   1/500 SMS
   ```

### 5.3. Test przesunięcia rezerwacji
1. Edytuj rezerwację i zmień termin
2. Klient powinien otrzymać SMS o przesunięciu

### 5.4. Test anulowania
1. Anuluj rezerwację
2. Klient powinien otrzymać SMS o anulowaniu

---

## Krok 6: Konfiguracja Cron Job (Reset licznika)

### 6.1. Utwórz endpoint do resetowania
Dodaj do `backend/src/notifications/sms.controller.ts`:
```typescript
@Post('reset-counters')
async resetCounters() {
  const count = await this.flySMSService.resetMonthlySMSCounters();
  return {
    success: true,
    message: `Reset SMS counters for ${count} tenants`,
  };
}
```

### 6.2. Dodaj do crontab
```bash
# Edytuj crontab
crontab -e

# Dodaj linię (reset pierwszego dnia miesiąca o 00:00)
0 0 1 * * curl -X POST http://localhost:3001/api/sms/reset-counters >> /var/log/sms-reset.log 2>&1
```

### 6.3. Sprawdź cron
```bash
# Lista zadań cron
crontab -l

# Sprawdź logi (po pierwszym dniu miesiąca)
cat /var/log/sms-reset.log
```

---

## Krok 7: Monitoring

### 7.1. Sprawdź logi SMS
```bash
# Logi backendu
pm2 logs rezerwacja24-backend | grep SMS

# Logi wysyłek
pm2 logs rezerwacja24-backend | grep "SMS sent"

# Logi błędów
pm2 logs rezerwacja24-backend | grep "Failed to send SMS"
```

### 7.2. Sprawdź bazę danych
```sql
-- Liczba wysłanych SMS dla tenanta
SELECT id, name, smsSent, smsBalance FROM tenants WHERE id = 'tenant_id';

-- Historia wysyłek
SELECT * FROM notification_logs WHERE type = 'SMS' ORDER BY createdAt DESC LIMIT 20;

-- Statystyki
SELECT 
  status,
  COUNT(*) as count
FROM notification_logs 
WHERE type = 'SMS' 
GROUP BY status;
```

---

## Krok 8: Wykup Dodatkowych SMS (Opcjonalnie)

### 8.1. W panelu admin
1. Przejdź do: **Ustawienia** → **Powiadomienia**
2. Kliknij "Dokup SMS"
3. Wybierz pakiet (100/500/1000/5000)
4. Kliknij "Wykup X SMS"

### 8.2. Weryfikacja
```bash
# Sprawdź saldo
curl -X GET http://localhost:3001/api/sms/settings/{tenantId} \
  -H "Authorization: Bearer {token}"
```

Powinieneś zobaczyć zwiększony `smsBalance`.

---

## ⚠️ Troubleshooting

### Problem 1: "FlySMS API key not configured"
**Rozwiązanie**:
```bash
# Sprawdź .env
cat /root/CascadeProjects/rezerwacja24-saas/backend/.env | grep FLYSMS

# Dodaj klucz jeśli brakuje
echo "FLYSMS_API_KEY=twoj_klucz" >> backend/.env

# Restart
pm2 restart rezerwacja24-backend
```

### Problem 2: SMS nie są wysyłane
**Sprawdź**:
1. Czy SMS są włączone w panelu?
   ```sql
   SELECT smsEnabled FROM tenants WHERE id = 'tenant_id';
   ```

2. Czy subskrypcja jest aktywna?
   ```sql
   SELECT status FROM subscriptions WHERE tenantId = 'tenant_id';
   ```

3. Czy nie przekroczono limitu?
   ```sql
   SELECT smsSent, smsBalance FROM tenants WHERE id = 'tenant_id';
   ```

4. Sprawdź logi:
   ```bash
   pm2 logs rezerwacja24-backend | grep "SMS"
   ```

### Problem 3: "Wykorzystano limit SMS"
**Rozwiązanie**:
1. Wykup dodatkowe SMS w panelu
2. LUB poczekaj do pierwszego dnia miesiąca (reset licznika)
3. LUB ręcznie zresetuj:
   ```bash
   curl -X POST http://localhost:3001/api/sms/reset-counters
   ```

### Problem 4: "Konto nieaktywne"
**Rozwiązanie**:
1. Sprawdź status subskrypcji:
   ```sql
   SELECT status, trialEnd FROM subscriptions WHERE tenantId = 'tenant_id';
   ```

2. Jeśli TRIALING i trialEnd minął, klient musi wykupić subskrypcję
3. Jeśli CANCELLED, klient musi odnowić subskrypcję

---

## 📊 Metryki do Monitorowania

### Dzienne
- Liczba wysłanych SMS
- Liczba błędów wysyłki
- Średni czas wysyłki

### Tygodniowe
- Wykorzystanie limitu SMS
- Najpopularniejsze typy SMS
- Tenanci z największym wykorzystaniem

### Miesięczne
- Całkowita liczba SMS
- Liczba wykupionych pakietów
- ROI z SMS (konwersje)

---

## ✅ Checklist Wdrożenia

- [ ] Konto SMSFly założone i doładowane
- [ ] Klucz API dodany do `.env`
- [ ] Backend zrestartowany
- [ ] Status API sprawdzony (`configured: true`)
- [ ] Test SMS wysłany i otrzymany
- [ ] SMS włączone w panelu admin
- [ ] Testowa rezerwacja utworzona
- [ ] SMS potwierdzenia otrzymany
- [ ] Licznik SMS działa poprawnie
- [ ] Cron job skonfigurowany
- [ ] Monitoring ustawiony
- [ ] Dokumentacja przeczytana przez zespół

---

## 🎉 Gotowe!

System SMS jest teraz w pełni funkcjonalny na produkcji!

**Wsparcie**:
- Dokumentacja: `/SMS_SYSTEM_COMPLETE.md`
- Logi: `pm2 logs rezerwacja24-backend`
- API SMSFly: https://sms-fly.pl/docs

**Kontakt w razie problemów**:
- SMSFly Support: support@sms-fly.pl
- System: Sprawdź logi i dokumentację
