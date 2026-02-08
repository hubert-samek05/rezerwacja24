# 🔒 Raport Bezpieczeństwa Płatności

## ✅ NAPRAWIONE - Krytyczne problemy bezpieczeństwa

### 1. ✅ Weryfikacja podpisu webhook
**Problem:** Webhook mógł być wywołany przez każdego
**Rozwiązanie:** 
- Weryfikacja podpisu SHA-384 dla każdego webhook
- Porównanie z oczekiwanym podpisem
- Odrzucenie nieprawidłowych żądań

### 2. ✅ Poprawne pobieranie tenanta
**Problem:** Błędne pobieranie danych tenanta (przez customerId zamiast przez employee)
**Rozwiązanie:**
- Pobieranie tenanta przez `employee.tenantId`
- Dodatkowa weryfikacja istnienia service i employee

### 3. ✅ Walidacja kwoty płatności
**Problem:** Brak weryfikacji czy kwota w webhook zgadza się z rezerwacją
**Rozwiązanie:**
- Porównanie kwoty z webhook z `booking.totalPrice`
- Odrzucenie jeśli kwoty się nie zgadzają
- Zapobiega oszustwom (np. płatność 1 zł za usługę 100 zł)

### 4. ✅ Idempotencja webhook
**Problem:** Wielokrotne wywołanie webhook mogło powodować problemy
**Rozwiązanie:**
- Sprawdzanie czy płatność już została przetworzona
- Zwracanie sukcesu bez ponownej aktualizacji
- Zapobiega duplikacji płatności

### 5. ✅ Walidacja danych wejściowych
**Problem:** Brak walidacji w endpointach
**Rozwiązanie:**
- Walidacja wszystkich wymaganych pól
- Sprawdzanie typów danych
- Limity kwot (0 < amount <= 1,000,000 PLN)
- Walidacja formatu email

### 6. ✅ Bezpieczne logowanie
**Problem:** Klucze API i CRC Key w logach
**Rozwiązanie:**
- Usunięcie wrażliwych danych z logów
- Logowanie tylko niezbędnych informacji
- Maskowanie kluczy prywatnych

## ⚠️ DO WDROŻENIA - Dodatkowe zabezpieczenia

### 1. Rate Limiting ⏱️
**Dlaczego:** Ochrona przed atakami DDoS
**Jak wdrożyć:**
```typescript
// W main.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // max 100 requestów
  message: 'Zbyt wiele żądań z tego IP'
});

app.use('/api/payments/', limiter);
```

### 2. HTTPS w produkcji 🔐
**Dlaczego:** Szyfrowanie komunikacji
**Jak wdrożyć:**
- Użyj certyfikatu SSL (Let's Encrypt)
- Wymuszaj HTTPS w nginx/Apache
- Ustaw `secure: true` w cookies

### 3. Whitelist IP dla webhook 🌐
**Dlaczego:** Tylko Przelewy24 może wysyłać webhook
**Jak wdrożyć:**
```typescript
// W payments.controller.ts
@Post('przelewy24/webhook')
@UseGuards(IpWhitelistGuard) // Dodaj guard
handlePrzelewy24Webhook(@Body() data: any) {
  // ...
}
```

IP Przelewy24:
- Sandbox: `91.216.191.181`, `91.216.191.182`
- Production: `91.216.191.181`, `91.216.191.182`, `91.216.191.183`

### 4. Helmet.js 🪖
**Dlaczego:** Dodatkowe nagłówki bezpieczeństwa
**Jak wdrożyć:**
```bash
npm install helmet
```
```typescript
// W main.ts
import helmet from 'helmet';
app.use(helmet());
```

### 5. CORS ograniczony 🚫
**Dlaczego:** Tylko zaufane domeny mogą wywoływać API
**Sprawdź:**
```typescript
// W main.ts - upewnij się że jest:
app.enableCors({
  origin: [
    'https://rezerwacja24.pl',
    'https://*.rezerwacja24.pl',
    /\.rezerwacja24\.pl$/
  ],
  credentials: true
});
```

### 6. Monitoring i alerty 📊
**Dlaczego:** Szybka reakcja na problemy
**Narzędzia:**
- Sentry - błędy aplikacji
- Datadog - monitoring wydajności
- CloudWatch - logi AWS

### 7. Backup bazy danych 💾
**Dlaczego:** Ochrona przed utratą danych
**Jak:**
- Automatyczne backupy co 24h
- Przechowywanie przez 30 dni
- Test odzyskiwania co miesiąc

### 8. Szyfrowanie kluczy API 🔑
**Dlaczego:** Ochrona w bazie danych
**Jak wdrożyć:**
```typescript
import * as crypto from 'crypto';

// Szyfrowanie
const encrypt = (text: string) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
};

// Deszyfrowanie
const decrypt = (encrypted: string) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};
```

## 🛡️ Checklist przed produkcją

- [x] Weryfikacja podpisu webhook
- [x] Walidacja kwot płatności
- [x] Idempotencja webhook
- [x] Bezpieczne logowanie
- [x] Walidacja danych wejściowych
- [ ] Rate limiting
- [ ] HTTPS wymuszony
- [ ] Whitelist IP dla webhook
- [ ] Helmet.js zainstalowany
- [ ] CORS ograniczony
- [ ] Monitoring skonfigurowany
- [ ] Backup bazy danych
- [ ] Szyfrowanie kluczy API
- [ ] Testy penetracyjne
- [ ] Audyt bezpieczeństwa

## 🔍 Testy bezpieczeństwa

### Test 1: Fałszywy webhook
```bash
# Próba wysłania fałszywego webhook
curl -X POST http://localhost:4000/api/payments/przelewy24/webhook \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"fake","orderId":123,"amount":10000,"sign":"fake"}'

# Oczekiwany wynik: 400 Bad Request - Invalid signature
```

### Test 2: Nieprawidłowa kwota
```bash
# Webhook z nieprawidłową kwotą
curl -X POST http://localhost:4000/api/payments/przelewy24/webhook \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"valid","orderId":123,"amount":1,"sign":"valid"}'

# Oczekiwany wynik: 400 Bad Request - Amount mismatch
```

### Test 3: Duplikat webhook
```bash
# Wysłanie tego samego webhook dwa razy
# Pierwszy raz: 200 OK - płatność przetworzona
# Drugi raz: 200 OK - Already processed (bez zmian)
```

## 📞 W razie incydentu bezpieczeństwa

1. **Natychmiast:**
   - Zatrzymaj serwer: `pm2 stop all`
   - Zmień wszystkie klucze API
   - Sprawdź logi: `tail -f /var/log/app.log`

2. **Analiza:**
   - Sprawdź bazę danych pod kątem nieautoryzowanych zmian
   - Przejrzyj logi za ostatnie 24h
   - Zidentyfikuj źródło ataku

3. **Naprawa:**
   - Załataj lukę
   - Przywróć backup jeśli potrzeba
   - Powiadom użytkowników jeśli dane wyciekły

4. **Prewencja:**
   - Wdróż dodatkowe zabezpieczenia
   - Zaktualizuj dokumentację
   - Przeprowadź audyt

## 🎯 Najlepsze praktyki

1. **Nigdy nie commituj:**
   - `.env` plików
   - Kluczy API
   - Haseł do bazy danych
   - Certyfikatów SSL

2. **Zawsze używaj:**
   - HTTPS w produkcji
   - Silnych haseł (min. 16 znaków)
   - 2FA dla kont administracyjnych
   - Najnowszych wersji bibliotek

3. **Regularnie:**
   - Aktualizuj zależności: `npm audit fix`
   - Rotuj klucze API (co 90 dni)
   - Przeglądaj logi
   - Testuj backupy

4. **Monitoruj:**
   - Nieudane próby logowania
   - Nietypowy ruch sieciowy
   - Błędy aplikacji
   - Wydajność bazy danych

## 📚 Zasoby

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Przelewy24 Security](https://docs.przelewy24.pl/)
- [NestJS Security](https://docs.nestjs.com/security/encryption-and-hashing)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Ostatnia aktualizacja:** 8 grudnia 2024
**Status:** ✅ Krytyczne problemy naprawione, dodatkowe zabezpieczenia do wdrożenia
