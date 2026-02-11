# Weryfikacja Google OAuth dla rezerwacja24.pl

## Problem
Użytkownicy widzą komunikat: "Dostęp zablokowany: aplikacja rezerwacja24.pl nie przeszła weryfikacji przez Google."

## Przyczyna
Google wymaga weryfikacji aplikacji, które używają wrażliwych zakresów OAuth (scopes) lub mają więcej niż 100 użytkowników.

## Rozwiązanie

### Krok 1: Przygotowanie do weryfikacji

1. **Zaloguj się do Google Cloud Console**: https://console.cloud.google.com/
2. **Wybierz projekt**: rezerwacja24
3. **Przejdź do**: APIs & Services → OAuth consent screen

### Krok 2: Uzupełnij wymagane informacje

#### Informacje o aplikacji:
- **App name**: rezerwacja24.pl
- **User support email**: support@rezerwacja24.pl
- **App logo**: Logo firmy (min. 120x120px)
- **Application home page**: https://rezerwacja24.pl
- **Application privacy policy link**: https://rezerwacja24.pl/privacy
- **Application terms of service link**: https://rezerwacja24.pl/terms

#### Zakresy (Scopes):
Aplikacja używa następujących zakresów:
- `email` - Adres email użytkownika
- `profile` - Podstawowe informacje o profilu
- `https://www.googleapis.com/auth/calendar` - Dostęp do Google Calendar (wrażliwy scope)

### Krok 3: Przygotuj dokumentację dla Google

Google wymaga:
1. **Demonstracja aplikacji** - Nagranie wideo pokazujące jak aplikacja używa danych Google
2. **Polityka prywatności** - Musi jasno opisywać jak dane są używane
3. **Strona główna** - Musi być publicznie dostępna

### Krok 4: Złóż wniosek o weryfikację

1. W OAuth consent screen kliknij "Prepare for verification"
2. Wypełnij wszystkie wymagane pola
3. Prześlij dokumentację
4. Czekaj na odpowiedź Google (może potrwać kilka tygodni)

## Tymczasowe rozwiązanie (przed weryfikacją)

### Dla deweloperów:
Dodaj użytkowników testowych w Google Cloud Console:
1. APIs & Services → OAuth consent screen
2. Test users → Add users
3. Dodaj adresy email użytkowników testowych

### Dla użytkowników:
Użytkownicy mogą kliknąć "Zaawansowane" → "Przejdź do rezerwacja24.pl (niebezpieczne)" aby kontynuować.

## Ważne linki

- Google Cloud Console: https://console.cloud.google.com/
- Dokumentacja weryfikacji: https://support.google.com/cloud/answer/9110914
- Wymagania dotyczące weryfikacji: https://support.google.com/cloud/answer/13463073

## Status weryfikacji

- [ ] Przygotowano politykę prywatności
- [ ] Przygotowano regulamin
- [ ] Nagrano demonstrację aplikacji
- [ ] Złożono wniosek o weryfikację
- [ ] Weryfikacja zakończona

## Kontakt

W razie pytań dotyczących weryfikacji Google OAuth, skontaktuj się z zespołem deweloperskim.
