# Instrukcja konfiguracji Przelewy24

## Zmiany wprowadzone

### Backend (`/backend/src/payments/payments.service.ts`)

1. **Naprawiono format podpisu CRC**
   - Zmieniono z JSON.stringify na konkatenację zgodną z dokumentacją P24
   - Format: `{"sessionId":"{sessionId}","merchantId":{merchantId},"amount":{amount},"currency":"PLN","crc":"{crc}"}`
   - Zmieniono hash z MD5 na SHA-384 (zgodnie z dokumentacją P24)

2. **Dodano weryfikację konfiguracji**
   - Sprawdzanie czy wszystkie wymagane pola są wypełnione przed utworzeniem płatności
   - Lepsze komunikaty błędów

3. **Poprawiono webhook**
   - Dodano weryfikację podpisu CRC dla webhook
   - Dodano szczegółowe logowanie dla debugowania
   - Poprawiono obsługę błędów

4. **Ulepszono logowanie**
   - Dodano logi dla każdego kroku procesu płatności
   - Logowanie odpowiedzi API Przelewy24
   - Logowanie błędów z pełnymi szczegółami

### Frontend

1. **Ukryto PayU** (`/frontend/components/settings/PaymentsTab.tsx`)
   - PayU jest teraz nieaktywny z komunikatem "Wkrótce dostępne"
   - Zachowano UI ale zablokowano funkcjonalność

2. **Wymaganie email dla płatności online** (`/frontend/app/[subdomain]/page.tsx`)
   - Email jest teraz wymagany przy wyborze płatności online
   - Dodano walidację przed wysłaniem formularza
   - Dodano wizualną informację o wymaganiu email

3. **Ukryto PayU z formularza rezerwacji**
   - Usunięto opcję PayU z wyboru metod płatności

## Jak przetestować

### 1. Konfiguracja środowiska

W pliku `/backend/.env` dodaj:
```env
PRZELEWY24_SANDBOX=true
```

### 2. Konfiguracja konta Przelewy24

1. Załóż konto testowe na: https://sandbox.przelewy24.pl/
2. Zaloguj się do panelu
3. Przejdź do: Ustawienia → Sklepy i punkty płatności
4. Skopiuj dane:
   - **Merchant ID** (ID sprzedawcy)
   - **POS ID** (ID punktu płatności)
   - **CRC Key** (Klucz CRC)
   - **API Key** (Klucz API - znajdziesz w zakładce "Klucze dostępu")

### 3. Konfiguracja w panelu biznesowym

1. Zaloguj się do panelu biznesowego rezerwacja24.pl
2. Przejdź do: **Ustawienia → Płatności**
3. Włącz **Przelewy24**
4. Wypełnij pola:
   - **Merchant ID**: wklej z panelu P24
   - **POS ID**: wklej z panelu P24
   - **CRC Key**: wklej z panelu P24
   - **API Key**: wklej z panelu P24
5. Kliknij **Zapisz zmiany**

### 4. Test flow płatności

#### Krok 1: Klient dokonuje rezerwacji
1. Przejdź na stronę publiczną firmy: `https://{subdomena}.rezerwacja24.pl`
2. Wybierz usługę i kliknij "Zarezerwuj"
3. Wybierz pracownika i termin
4. Wypełnij dane kontaktowe:
   - Imię i nazwisko
   - Telefon
   - **Email** (wymagany dla płatności online!)
5. Wybierz metodę płatności: **Przelewy24**
6. Kliknij "Potwierdź rezerwację"

#### Krok 2: Przekierowanie do Przelewy24
- Powinieneś zostać przekierowany do strony płatności Przelewy24
- W trybie sandbox możesz użyć testowych danych karty

#### Krok 3: Weryfikacja płatności
Po udanej płatności:
1. Sprawdź logi backendu - powinny zawierać:
   ```
   Przelewy24 payment created successfully: {token}
   ```
2. Sprawdź bazę danych - rezerwacja powinna mieć:
   - `paymentStatus: 'pending'` (przed webhookiem)
   - `paymentStatus: 'completed'` (po webhookiem)
   - `isPaid: true` (po webhookiem)

### 5. Testowanie webhook

Webhook URL: `https://api.rezerwacja24.pl/api/payments/przelewy24/webhook`

W panelu Przelewy24:
1. Przejdź do: Ustawienia → Powiadomienia
2. Ustaw URL webhook na powyższy adres
3. Włącz powiadomienia o statusie płatności

## Dane testowe Przelewy24 (Sandbox)

### Testowe karty kredytowe:
- **Visa**: 4444 3333 2222 1111
- **Mastercard**: 5555 5555 5555 4444
- **CVV**: dowolny 3-cyfrowy kod
- **Data ważności**: dowolna przyszła data

### Testowe przelewy:
- Użyj dowolnego numeru konta
- Potwierdzenie nastąpi automatycznie

## Troubleshooting

### Problem: "Przelewy24 nie jest poprawnie skonfigurowane"
**Rozwiązanie**: Sprawdź czy wszystkie 4 pola są wypełnione w ustawieniach płatności

### Problem: "Invalid response from Przelewy24"
**Rozwiązanie**: 
1. Sprawdź logi backendu - znajdziesz szczegóły błędu
2. Zweryfikuj czy dane dostępowe są poprawne
3. Sprawdź czy `PRZELEWY24_SANDBOX=true` w .env

### Problem: Płatność nie zmienia statusu na "completed"
**Rozwiązanie**:
1. Sprawdź czy webhook jest poprawnie skonfigurowany w panelu P24
2. Sprawdź logi backendu - webhook powinien być logowany
3. Zweryfikuj czy URL webhook jest dostępny publicznie

### Problem: "Invalid signature" w webhook
**Rozwiązanie**:
1. Sprawdź czy CRC Key jest poprawny
2. Zweryfikuj czy używasz tego samego CRC Key co w panelu P24

## Różnice między Sandbox a Production

### Sandbox (testowe):
- URL API: `https://sandbox.przelewy24.pl/api/v1/transaction/register`
- URL płatności: `https://sandbox.przelewy24.pl/trnRequest/{token}`
- Dane testowe działają
- Brak prawdziwych transakcji

### Production (produkcyjne):
- URL API: `https://secure.przelewy24.pl/api/v1/transaction/register`
- URL płatności: `https://secure.przelewy24.pl/trnRequest/{token}`
- Wymagane prawdziwe dane
- Prawdziwe transakcje finansowe

**Aby przełączyć na produkcję:**
1. Zmień w `.env`: `PRZELEWY24_SANDBOX=false`
2. Użyj danych produkcyjnych z https://secure.przelewy24.pl/
3. Przetestuj dokładnie przed uruchomieniem!

## Bezpieczeństwo

⚠️ **WAŻNE:**
- Nigdy nie commituj pliku `.env` do repozytorium
- CRC Key i API Key trzymaj w tajemnicy
- W produkcji używaj HTTPS dla webhook
- Regularnie rotuj klucze API

## Wsparcie

W razie problemów:
1. Sprawdź logi backendu
2. Sprawdź dokumentację P24: https://docs.przelewy24.pl/
3. Skontaktuj się z supportem Przelewy24
