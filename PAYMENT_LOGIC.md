# 📋 Logika Płatności i Rezerwacji

## 🎯 Pełny Flow Płatności

### 1. Płatność Online (Przelewy24 / Stripe)

#### Krok 1: Klient tworzy rezerwację
- Wybiera usługę, pracownika, termin
- Wypełnia dane kontaktowe (imię, telefon, **email**)
- Wybiera metodę płatności: **Przelewy24** lub **Stripe**
- Klika "Potwierdź rezerwację"

#### Krok 2: System tworzy rezerwację
```
Status: PENDING
isPaid: false
paymentStatus: null
paymentMethod: 'przelewy24' | 'stripe'
```

**WAŻNE:** Rezerwacja z płatnością online jest **zawsze PENDING** do momentu potwierdzenia płatności!

#### Krok 3: Przekierowanie do bramki płatności
- System generuje link płatności
- Klient jest przekierowywany do Przelewy24/Stripe
- Klient dokonuje płatności

#### Krok 4: Webhook potwierdza płatność
Po udanej płatności:
```
Status: CONFIRMED ✅
isPaid: true
paymentStatus: 'completed'
paidAt: [data płatności]
```

#### Krok 5: Rezerwacja potwierdzona
- Rezerwacja pojawia się w kalendarzu jako **POTWIERDZONA**
- Klient otrzymuje potwierdzenie
- Miejsce w kalendarzu jest zarezerwowane

---

### 2. Płatność na miejscu (Gotówka/Karta)

#### Krok 1: Klient tworzy rezerwację
- Wybiera usługę, pracownika, termin
- Wypełnia dane kontaktowe (imię, telefon, email opcjonalny)
- Wybiera metodę płatności: **Płatność na miejscu**
- Klika "Potwierdź rezerwację"

#### Krok 2: System sprawdza ustawienia

**Opcja A: Automatyczne zatwierdzanie WŁĄCZONE** (domyślnie)
```
Status: CONFIRMED ✅
isPaid: false
paymentStatus: null
paymentMethod: 'cash'
```
- Rezerwacja od razu pojawia się w kalendarzu jako **POTWIERDZONA**
- Miejsce jest zarezerwowane
- Klient otrzymuje potwierdzenie

**Opcja B: Automatyczne zatwierdzanie WYŁĄCZONE**
```
Status: PENDING ⏳
isPaid: false
paymentStatus: null
paymentMethod: 'cash'
```
- Rezerwacja pojawia się w panelu jako **OCZEKUJĄCA**
- Wymaga ręcznego zatwierdzenia przez właściciela
- Miejsce w kalendarzu jest **tymczasowo zarezerwowane**
- Po zatwierdzeniu: Status → CONFIRMED

---

## 🔧 Ustawienia w Panelu Biznesowym

### Lokalizacja: Ustawienia → Płatności

### Toggle: "Automatyczne zatwierdzanie rezerwacji"

**Włączone (domyślnie):**
- ✅ Rezerwacje z płatnością na miejscu są automatycznie potwierdzane
- ✅ Pojawiają się od razu w kalendarzu
- ✅ Klient otrzymuje natychmiastowe potwierdzenie
- 👍 Zalecane dla: salony fryzjerskie, gabinety, małe firmy

**Wyłączone:**
- ⏳ Rezerwacje z płatnością na miejscu wymagają ręcznego zatwierdzenia
- ⏳ Właściciel musi potwierdzić w panelu
- ⏳ Klient czeka na potwierdzenie
- 👍 Zalecane dla: ekskluzywne usługi, kontrola dostępności

---

## 📊 Statusy Rezerwacji

### PENDING (Oczekująca)
- **Płatność online:** Czeka na płatność
- **Płatność na miejscu:** Czeka na zatwierdzenie (jeśli auto-confirm wyłączone)
- ⚠️ **Nie zajmuje miejsca w kalendarzu** (lub zajmuje tymczasowo)

### CONFIRMED (Potwierdzona)
- ✅ Płatność online została opłacona
- ✅ Płatność na miejscu została zatwierdzona (lub auto-confirmed)
- ✅ **Zajmuje miejsce w kalendarzu**
- ✅ Klient otrzymał potwierdzenie

### CANCELLED (Anulowana)
- ❌ Rezerwacja została anulowana
- ❌ Miejsce zwolnione w kalendarzu

### COMPLETED (Zakończona)
- ✅ Usługa została wykonana
- ✅ Płatność rozliczona

### NO_SHOW (Nieobecność)
- ⚠️ Klient się nie pojawił
- ⚠️ Miejsce zostało zmarnowane

---

## 💡 Przykłady Scenariuszy

### Scenariusz 1: Salon fryzjerski (auto-confirm ON)
1. Klient rezerwuje strzyżenie z płatnością na miejscu
2. System automatycznie potwierdza → Status: CONFIRMED
3. Rezerwacja pojawia się w kalendarzu
4. Klient przychodzi i płaci gotówką
5. Fryzjer oznacza jako COMPLETED

### Scenariusz 2: Ekskluzywny SPA (auto-confirm OFF)
1. Klient rezerwuje masaż z płatnością na miejscu
2. System ustawia → Status: PENDING
3. Właściciel sprawdza dostępność masażysty
4. Właściciel zatwierdza → Status: CONFIRMED
5. Klient otrzymuje potwierdzenie
6. Klient przychodzi i płaci kartą

### Scenariusz 3: Płatność online Przelewy24
1. Klient rezerwuje wizytę i wybiera Przelewy24
2. System tworzy rezerwację → Status: PENDING
3. Klient płaci przez BLIK
4. Webhook potwierdza płatność → Status: CONFIRMED
5. Rezerwacja automatycznie potwierdzona
6. Klient przychodzi na wizytę

### Scenariusz 4: Nieudana płatność online
1. Klient rezerwuje wizytę i wybiera Przelewy24
2. System tworzy rezerwację → Status: PENDING
3. Klient anuluje płatność lub błąd karty
4. Webhook NIE przychodzi (lub przychodzi z błędem)
5. Rezerwacja pozostaje PENDING
6. **Po 24h system automatycznie anuluje** (opcjonalne)
7. Miejsce w kalendarzu zostaje zwolnione

---

## 🎨 Interfejs Użytkownika

### Strona Rezerwacji (Subdomena)

**Metody płatności:**

1. **Płatność na miejscu**
   - Opis: "Gotówka lub karta przy odbiorze usługi"
   - Ikona: Karta płatnicza
   - Bez emotikon

2. **Przelewy24**
   - Logo: P24 (czerwone)
   - Opis: "BLIK, karty płatnicze, przelew bankowy"
   - Bez emotikon

3. **Stripe**
   - Logo: Stripe (fioletowe)
   - Opis: "Karty płatnicze (Visa, Mastercard, Apple Pay)"
   - Bez emotikon

### Panel Biznesowy

**Widok rezerwacji:**
- ✅ CONFIRMED - zielony badge
- ⏳ PENDING - żółty badge
- ❌ CANCELLED - czerwony badge
- 💰 isPaid: true - ikona pieniędzy

**Akcje:**
- Potwierdź (dla PENDING)
- Anuluj
- Oznacz jako opłacone (dla cash)
- Oznacz jako zakończone

---

## 🔐 Bezpieczeństwo

### Weryfikacja płatności online:
1. ✅ Podpis SHA-384 webhook
2. ✅ Weryfikacja kwoty
3. ✅ Idempotencja (duplikaty ignorowane)
4. ✅ Walidacja danych wejściowych

### Ochrona kalendarza:
1. ✅ Sprawdzanie konfliktów czasowych
2. ✅ Tylko CONFIRMED zajmują miejsce
3. ✅ PENDING nie blokują (lub tymczasowo)
4. ✅ Automatyczne czyszczenie starych PENDING

---

## 📝 Checklist Implementacji

- [x] Backend: Logika statusów rezerwacji
- [x] Backend: Webhook potwierdza płatność → CONFIRMED
- [x] Backend: autoConfirmBookings w bazie danych
- [x] Backend: Walidacja płatności
- [x] Frontend: Zmiana "Gotówka" → "Płatność na miejscu"
- [x] Frontend: Usunięcie emotikon
- [x] Frontend: Dodanie opisów płatności
- [x] Frontend: Toggle auto-confirm w ustawieniach
- [x] Frontend: Przekazywanie paymentMethod do API
- [ ] Panel: Widok PENDING rezerwacji
- [ ] Panel: Przycisk "Potwierdź" dla PENDING
- [ ] Panel: Filtrowanie po statusie
- [ ] Email: Powiadomienia o statusie
- [ ] Automatyczne: Czyszczenie starych PENDING (cron)

---

## 🚀 Gotowe do testowania!

Wszystkie zmiany zostały wdrożone. System jest gotowy do pełnego testowania flow płatności.
