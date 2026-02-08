# 🧪 Jak Przetestować SMS - Szybki Przewodnik

## ✅ Krok 1: Włącz SMS dla Twojej Firmy

### Opcja A: Przez Dashboard (Zalecane)

1. Zaloguj się do dashboardu
2. Przejdź do **Ustawienia → Powiadomienia**
3. Włącz przełącznik **"Włącz powiadomienia SMS"**
4. Kliknij **"Zapisz ustawienia"**
5. **Odśwież stronę** - przełącznik powinien pozostać włączony ✅

### Opcja B: Przez SQL (Szybkie)

```bash
# Znajdź swoje tenant ID
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c \
"SELECT id, name FROM tenants ORDER BY \"createdAt\" DESC LIMIT 5;"

# Włącz SMS dla swojej firmy (zamień TENANT_ID)
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c \
"UPDATE tenants SET \"smsEnabled\" = true WHERE id = 'TENANT_ID';"

# Sprawdź czy włączone
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c \
"SELECT name, \"smsEnabled\", \"smsSent\" FROM tenants WHERE id = 'TENANT_ID';"
```

---

## ✅ Krok 2: Utwórz Rezerwację

### Przez Dashboard:

1. Przejdź do **Dashboard → Kalendarz**
2. Kliknij na wolny slot
3. Wypełnij formularz:
   - **Klient**: Wybierz lub dodaj (WAŻNE: podaj numer telefonu!)
   - **Usługa**: Wybierz dowolną
   - **Pracownik**: Wybierz
   - **Status**: **CONFIRMED** (to ważne!)
4. Zapisz rezerwację

### Co się stanie:

```
✅ Rezerwacja zostanie utworzona
✅ System sprawdzi czy smsEnabled = true
✅ System sprawdzi czy smsNotifyOnConfirm = true
✅ SMS zostanie wysłany do klienta
✅ Licznik smsSent zwiększy się o 1
✅ Log zostanie zapisany w notification_logs
```

---

## ✅ Krok 3: Sprawdź Czy SMS Został Wysłany

### Sprawdź Logi Backendu:

```bash
pm2 logs rezerwacja24-backend --lines 50 | grep -i sms
```

**Szukaj**:
- `SMS sent and logged for tenant` - SMS wysłany ✅
- `SMS disabled for tenant` - SMS wyłączone ❌

### Sprawdź Licznik w Bazie:

```bash
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c \
"SELECT name, \"smsEnabled\", \"smsSent\" FROM tenants WHERE \"smsEnabled\" = true;"
```

**Oczekiwany wynik**:
```
      name      | smsEnabled | smsSent 
----------------+------------+---------
 KLUB SAMEK     | t          |       1
```

Licznik `smsSent` powinien się zwiększyć! ✅

### Sprawdź Logi SMS:

```bash
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c \
"SELECT type, recipient, status, \"sentAt\", message FROM notification_logs WHERE type = 'SMS' ORDER BY \"createdAt\" DESC LIMIT 3;"
```

**Oczekiwany wynik**:
```
 type |   recipient   | status |         sentAt          |           message            
------+---------------+--------+-------------------------+------------------------------
 SMS  | +48123456789  | sent   | 2024-12-14 16:30:00     | Witaj Jan! Potwierdzamy...
```

### Sprawdź w Dashboard:

1. Przejdź do **Ustawienia → Powiadomienia**
2. Sprawdź licznik: **"1 / 500 SMS"**
3. Licznik powinien się zwiększyć po każdym wysłanym SMS

---

## 🔍 Rozwiązywanie Problemów

### Problem: SMS nie został wysłany

**Sprawdź**:

1. **Czy SMS są włączone?**
   ```sql
   SELECT "smsEnabled" FROM tenants WHERE id = 'TENANT_ID';
   ```
   Powinno być: `t` (true)

2. **Czy klient ma numer telefonu?**
   ```sql
   SELECT firstName, lastName, phone FROM customers WHERE id = 'CUSTOMER_ID';
   ```
   Pole `phone` nie może być NULL

3. **Czy status rezerwacji to CONFIRMED?**
   ```sql
   SELECT status FROM bookings WHERE id = 'BOOKING_ID';
   ```
   Powinno być: `CONFIRMED`

4. **Sprawdź logi błędów:**
   ```bash
   pm2 logs rezerwacja24-backend --err --lines 50
   ```

### Problem: Ustawienia nie zapisują się

1. **Sprawdź czy backend działa:**
   ```bash
   curl http://localhost:3001/api/sms/status
   ```
   Powinno zwrócić: `{"configured":true,"provider":"FlySMS"}`

2. **Sprawdź logi frontendu:**
   ```bash
   pm2 logs rezerwacja24-frontend --lines 50
   ```

3. **Sprawdź w konsoli przeglądarki** (F12):
   - Zakładka Network
   - Szukaj requestu: `PATCH /api/tenants/:id`
   - Status powinien być: 200 OK

### Problem: Licznik nie zwiększa się

1. **Sprawdź czy SMS faktycznie został wysłany:**
   ```bash
   pm2 logs rezerwacja24-backend | grep "SMS sent and logged"
   ```

2. **Sprawdź tabelę notification_logs:**
   ```sql
   SELECT COUNT(*) FROM notification_logs WHERE type = 'SMS' AND status = 'sent';
   ```

3. **Odśwież stronę ustawień** - licznik aktualizuje się przy załadowaniu

---

## 📝 Przykładowe Testy

### Test 1: Potwierdzenie Rezerwacji

```
1. Włącz SMS
2. Utwórz rezerwację (status = CONFIRMED)
3. Sprawdź logi: "SMS sent and logged"
4. Sprawdź licznik: smsSent = 1
5. Klient otrzymuje SMS: "Witaj Jan! Potwierdzamy rezerwację..."
```

### Test 2: Anulowanie Rezerwacji

```
1. Włącz SMS
2. Utwórz rezerwację (status = CONFIRMED)
3. Zmień status na CANCELLED
4. Sprawdź logi: "SMS sent and logged"
5. Sprawdź licznik: smsSent = 2
6. Klient otrzymuje SMS: "Rezerwacja została anulowana..."
```

### Test 3: Przesunięcie Rezerwacji

```
1. Włącz SMS
2. Utwórz rezerwację
3. Zmień datę/godzinę rezerwacji
4. Sprawdź logi: "SMS sent and logged"
5. Sprawdź licznik: smsSent = 3
6. Klient otrzymuje SMS: "Twoja rezerwacja została przesunięta..."
```

### Test 4: SMS Wyłączone

```
1. Wyłącz SMS (smsEnabled = false)
2. Utwórz rezerwację
3. Sprawdź logi: "SMS disabled for tenant"
4. Licznik nie zwiększa się
5. SMS nie jest wysyłany ✅
```

---

## 🎯 Szybki Checklist

- [ ] SMS włączone w ustawieniach (`smsEnabled = true`)
- [ ] Klient ma numer telefonu
- [ ] Status rezerwacji = CONFIRMED
- [ ] Backend działa (`pm2 list`)
- [ ] API key Fly SMS skonfigurowany w `.env`
- [ ] Logi pokazują "SMS sent and logged"
- [ ] Licznik `smsSent` zwiększa się
- [ ] Frontend pokazuje poprawny licznik

---

## 🚀 Wszystko Działa?

Jeśli wszystkie testy przeszły pomyślnie:

✅ **System SMS działa w 100%!**

Możesz teraz:
- Tworzyć rezerwacje - SMS wysyłane automatycznie
- Monitorować licznik SMS w dashboard
- Włączać/wyłączać SMS w ustawieniach
- Sprawdzać statystyki w bazie danych

**Gotowe do produkcji!** 🎊
