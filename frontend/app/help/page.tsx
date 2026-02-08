'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  Bell, 
  CreditCard, 
  Globe, 
  Code, 
  Gift, 
  Lock, 
  BarChart3,
  ChevronDown,
  ChevronRight,
  Search,
  BookOpen,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Settings,
  UserPlus,
  Clock,
  FileText,
  Shield,
  Smartphone,
  Layout,
  ArrowLeft
} from 'lucide-react'

interface HelpSection {
  id: string
  icon: any
  title: string
  description: string
  articles: HelpArticle[]
}

interface HelpArticle {
  id: string
  title: string
  content: string
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    icon: BookOpen,
    title: 'Pierwsze kroki',
    description: 'Jak rozpocząć pracę z Rezerwacja24',
    articles: [
      {
        id: 'registration',
        title: 'Rejestracja konta',
        content: `
## Jak założyć konto w Rezerwacja24

### Krok 1: Przejdź do strony rejestracji
Wejdź na stronę [app.rezerwacja24.pl/register](https://app.rezerwacja24.pl/register) lub kliknij przycisk "Rozpocznij za darmo" na stronie głównej.

### Krok 2: Wypełnij formularz rejestracji
Podaj następujące dane:
- **Adres e-mail** - będzie służył jako login
- **Hasło** - minimum 8 znaków, zawierające wielką literę i cyfrę
- **Imię i nazwisko** - dane właściciela konta
- **Nazwa firmy** - nazwa Twojej działalności
- **Numer telefonu** - do kontaktu i powiadomień

### Krok 3: Potwierdź adres e-mail
Na podany adres e-mail otrzymasz link aktywacyjny. Kliknij go, aby aktywować konto.

### Krok 4: Skonfiguruj firmę
Po aktywacji zostaniesz przekierowany do kreatora konfiguracji, gdzie:
- Wybierzesz kategorię działalności
- Ustawisz godziny pracy
- Dodasz pierwszą usługę
- Skonfigurujesz subdomenę

### Okres próbny
Każde nowe konto otrzymuje **7 dni bezpłatnego okresu próbnego** z pełnym dostępem do wszystkich funkcji.
        `
      },
      {
        id: 'first-login',
        title: 'Pierwsze logowanie i konfiguracja',
        content: `
## Pierwsze logowanie do systemu

### Logowanie
1. Wejdź na [app.rezerwacja24.pl/login](https://app.rezerwacja24.pl/login)
2. Podaj swój adres e-mail i hasło
3. Jeśli masz włączone 2FA, wprowadź kod z aplikacji

### Panel główny (Dashboard)
Po zalogowaniu zobaczysz panel główny zawierający:
- **Statystyki dnia** - liczba rezerwacji, przychody
- **Nadchodzące rezerwacje** - lista najbliższych wizyt
- **Szybkie akcje** - dodawanie rezerwacji, usług, pracowników
- **Powiadomienia** - ważne informacje o systemie

### Podstawowa konfiguracja
W menu bocznym przejdź do **Ustawienia** i skonfiguruj:

1. **Dane firmy** - nazwa, adres, NIP, logo
2. **Godziny pracy** - dla każdego dnia tygodnia
3. **Usługi** - dodaj swoje usługi z cenami i czasem trwania
4. **Pracownicy** - dodaj osoby wykonujące usługi
5. **Powiadomienia** - skonfiguruj SMS i e-mail

### Subdomena
Twoja strona rezerwacji będzie dostępna pod adresem:
\`twoja-firma.rezerwacja24.pl\`

Możesz zmienić nazwę subdomeny w Ustawieniach → Subdomena.
        `
      },
      {
        id: 'dashboard-overview',
        title: 'Przegląd panelu głównego',
        content: `
## Panel główny (Dashboard)

### Widżety statystyk
Na górze panelu znajdziesz 4 główne widżety:

1. **Rezerwacje dziś** - liczba zaplanowanych wizyt na dziś
2. **Przychód dziś** - suma wartości dzisiejszych rezerwacji
3. **Nowi klienci** - liczba nowych klientów w tym miesiącu
4. **Wskaźnik anulacji** - procent anulowanych rezerwacji

### Lista rezerwacji
Poniżej widżetów znajduje się lista nadchodzących rezerwacji z informacjami:
- Godzina wizyty
- Imię i nazwisko klienta
- Nazwa usługi
- Przypisany pracownik
- Status rezerwacji

### Szybkie akcje
W prawym górnym rogu dostępne są przyciski:
- **+ Nowa rezerwacja** - szybkie dodanie rezerwacji
- **+ Nowy klient** - dodanie klienta do bazy

### Menu boczne
Nawigacja po systemie:
- **Dashboard** - panel główny
- **Kalendarz** - widok kalendarza
- **Rezerwacje** - lista wszystkich rezerwacji
- **Klienci** - baza klientów (CRM)
- **Usługi** - zarządzanie usługami
- **Pracownicy** - zarządzanie zespołem
- **Promocje** - kody rabatowe
- **Analityka** - raporty i statystyki
- **Ustawienia** - konfiguracja systemu
        `
      }
    ]
  },
  {
    id: 'calendar',
    icon: Calendar,
    title: 'Kalendarz i rezerwacje',
    description: 'Zarządzanie kalendarzem i rezerwacjami',
    articles: [
      {
        id: 'calendar-views',
        title: 'Widoki kalendarza',
        content: `
## Widoki kalendarza

### Widok dzienny
Pokazuje wszystkie rezerwacje dla wybranego dnia w formie osi czasu. Każdy pracownik ma osobną kolumnę.

**Jak używać:**
- Kliknij na pustą komórkę, aby dodać rezerwację
- Przeciągnij rezerwację, aby zmienić godzinę
- Kliknij na rezerwację, aby zobaczyć szczegóły

### Widok tygodniowy
Pokazuje cały tydzień z podziałem na dni. Idealny do planowania.

### Widok miesięczny
Przegląd całego miesiąca z liczbą rezerwacji na każdy dzień.

### Filtrowanie
Możesz filtrować kalendarz według:
- **Pracownika** - pokaż tylko rezerwacje wybranej osoby
- **Usługi** - pokaż tylko wybraną usługę
- **Statusu** - potwierdzone, oczekujące, anulowane

### Nawigacja
- Strzałki **< >** - przejście do poprzedniego/następnego okresu
- Przycisk **Dziś** - powrót do bieżącego dnia
- Kliknięcie na datę w mini-kalendarzu - szybki skok
        `
      },
      {
        id: 'add-booking',
        title: 'Dodawanie rezerwacji',
        content: `
## Jak dodać nową rezerwację

### Metoda 1: Z kalendarza
1. Przejdź do **Kalendarz**
2. Kliknij na wybraną godzinę i pracownika
3. Wypełnij formularz rezerwacji

### Metoda 2: Z listy rezerwacji
1. Przejdź do **Rezerwacje**
2. Kliknij przycisk **+ Nowa rezerwacja**
3. Wypełnij formularz

### Formularz rezerwacji
Wypełnij następujące pola:

**Dane klienta:**
- Wybierz istniejącego klienta z listy LUB
- Dodaj nowego klienta (imię, telefon, e-mail)

**Szczegóły wizyty:**
- **Usługa** - wybierz z listy dostępnych usług
- **Pracownik** - kto wykona usługę
- **Data** - wybierz datę z kalendarza
- **Godzina** - system pokaże dostępne terminy
- **Notatka** - opcjonalne uwagi do rezerwacji

### Automatyczne powiadomienia
Po zapisaniu rezerwacji system automatycznie:
- Wyśle potwierdzenie SMS do klienta
- Wyśle potwierdzenie e-mail
- Doda wydarzenie do kalendarza pracownika

### Rezerwacje cykliczne
Dla stałych klientów możesz ustawić rezerwacje cykliczne:
1. Zaznacz opcję "Rezerwacja cykliczna"
2. Wybierz częstotliwość (co tydzień, co 2 tygodnie, co miesiąc)
3. Ustaw datę końcową lub liczbę powtórzeń
        `
      },
      {
        id: 'manage-bookings',
        title: 'Zarządzanie rezerwacjami',
        content: `
## Zarządzanie rezerwacjami

### Statusy rezerwacji
- **Oczekująca** - nowa rezerwacja, wymaga potwierdzenia
- **Potwierdzona** - rezerwacja zatwierdzona
- **W trakcie** - klient jest na wizycie
- **Zakończona** - wizyta odbyła się
- **Anulowana** - rezerwacja odwołana
- **Nieobecność** - klient nie pojawił się

### Edycja rezerwacji
1. Kliknij na rezerwację w kalendarzu lub liście
2. Kliknij **Edytuj**
3. Zmień potrzebne dane
4. Zapisz zmiany

System automatycznie powiadomi klienta o zmianach.

### Anulowanie rezerwacji
1. Otwórz szczegóły rezerwacji
2. Kliknij **Anuluj rezerwację**
3. Wybierz powód anulacji
4. Potwierdź

Klient otrzyma powiadomienie o anulowaniu.

### Przesunięcie terminu
1. W kalendarzu przeciągnij rezerwację na nowy termin LUB
2. Otwórz rezerwację i kliknij **Zmień termin**
3. Wybierz nową datę i godzinę

### Historia zmian
Każda rezerwacja ma historię zmian dostępną w zakładce **Historia**. Zobaczysz kto i kiedy wprowadził zmiany.
        `
      },
      {
        id: 'online-booking',
        title: 'Rezerwacje online przez klientów',
        content: `
## Rezerwacje online

### Strona rezerwacji
Twoi klienci mogą rezerwować wizyty online pod adresem:
\`twoja-firma.rezerwacja24.pl\`

### Proces rezerwacji dla klienta
1. Klient wchodzi na Twoją stronę rezerwacji
2. Wybiera usługę z listy
3. Wybiera preferowanego pracownika (lub "dowolny")
4. Wybiera datę z kalendarza
5. Wybiera dostępną godzinę
6. Podaje swoje dane (imię, telefon, e-mail)
7. Potwierdza rezerwację

### Dostępność terminów
System automatycznie pokazuje tylko dostępne terminy na podstawie:
- Godzin pracy firmy
- Grafiku pracowników
- Istniejących rezerwacji
- Czasu trwania usługi
- Buforów między wizytami

### Potwierdzenie rezerwacji
Po dokonaniu rezerwacji klient otrzymuje:
- SMS z potwierdzeniem
- E-mail z szczegółami wizyty
- Link do anulowania/zmiany terminu

### Ustawienia rezerwacji online
W **Ustawienia → Rezerwacje online** możesz skonfigurować:
- Minimalny czas wyprzedzenia (np. 2 godziny przed)
- Maksymalny czas wyprzedzenia (np. 30 dni)
- Wymagane pola (telefon, e-mail)
- Automatyczne potwierdzanie lub ręczna akceptacja
        `
      }
    ]
  },
  {
    id: 'services',
    icon: FileText,
    title: 'Usługi',
    description: 'Zarządzanie usługami i cennikiem',
    articles: [
      {
        id: 'add-service',
        title: 'Dodawanie usług',
        content: `
## Jak dodać nową usługę

### Przejdź do listy usług
1. W menu bocznym kliknij **Usługi**
2. Kliknij przycisk **+ Nowa usługa**

### Wypełnij formularz

**Podstawowe informacje:**
- **Nazwa usługi** - np. "Strzyżenie damskie"
- **Opis** - szczegółowy opis usługi
- **Kategoria** - przypisz do kategorii

**Czas i cena:**
- **Czas trwania** - w minutach (np. 60)
- **Cena** - kwota w PLN (np. 150.00)
- **Bufor przed** - przerwa przed usługą (opcjonalne)
- **Bufor po** - przerwa po usłudze (opcjonalne)

**Dostępność:**
- **Pracownicy** - kto może wykonywać tę usługę
- **Dostępna online** - czy widoczna w rezerwacjach online
- **Aktywna** - czy usługa jest aktywna

### Kategorie usług
Grupuj usługi w kategorie dla lepszej organizacji:
- Przejdź do **Usługi → Kategorie**
- Dodaj kategorie (np. "Fryzjerstwo", "Kosmetyka")
- Przypisz usługi do kategorii

### Warianty usług
Dla usług z wariantami (np. różne długości włosów):
1. Otwórz usługę do edycji
2. Kliknij **Dodaj wariant**
3. Podaj nazwę wariantu, czas i cenę
        `
      },
      {
        id: 'pricing',
        title: 'Cennik i promocje',
        content: `
## Zarządzanie cennikiem

### Zmiana cen
1. Przejdź do **Usługi**
2. Kliknij na usługę do edycji
3. Zmień cenę w polu **Cena**
4. Zapisz zmiany

### Ceny dla różnych pracowników
Możesz ustawić różne ceny dla różnych pracowników:
1. Otwórz usługę do edycji
2. W sekcji **Pracownicy** kliknij **Ustaw indywidualną cenę**
3. Podaj cenę dla wybranego pracownika

### Promocje i rabaty
Przejdź do **Promocje** aby utworzyć:

**Kod rabatowy:**
- Kod do wpisania (np. LATO20)
- Rabat procentowy lub kwotowy
- Data ważności
- Limit użyć

**Promocja automatyczna:**
- Rabat na pierwszą wizytę
- Rabat urodzinowy
- Happy hours (np. -20% w poniedziałki)

### Pakiety usług
Twórz pakiety łączące kilka usług:
1. Przejdź do **Usługi → Pakiety**
2. Kliknij **+ Nowy pakiet**
3. Wybierz usługi wchodzące w skład pakietu
4. Ustaw cenę pakietu (niższą niż suma)
        `
      }
    ]
  },
  {
    id: 'employees',
    icon: Users,
    title: 'Pracownicy',
    description: 'Zarządzanie zespołem i grafikiem',
    articles: [
      {
        id: 'add-employee',
        title: 'Dodawanie pracowników',
        content: `
## Jak dodać pracownika

### Przejdź do listy pracowników
1. W menu bocznym kliknij **Pracownicy**
2. Kliknij przycisk **+ Nowy pracownik**

### Wypełnij formularz

**Dane osobowe:**
- **Imię i nazwisko**
- **E-mail** - do logowania i powiadomień
- **Telefon** - do kontaktu
- **Zdjęcie** - wyświetlane w systemie rezerwacji

**Uprawnienia:**
- **Rola** - Pracownik, Manager, Administrator
- **Dostęp do panelu** - czy może się logować
- **Widoczny online** - czy klienci mogą go wybierać

**Usługi:**
- Zaznacz usługi, które pracownik może wykonywać
- Możesz ustawić indywidualne ceny

### Role i uprawnienia

**Pracownik:**
- Widzi tylko swoje rezerwacje
- Może edytować swój grafik
- Nie ma dostępu do ustawień

**Manager:**
- Widzi wszystkie rezerwacje
- Może zarządzać pracownikami
- Dostęp do raportów

**Administrator:**
- Pełny dostęp do systemu
- Zarządzanie ustawieniami
- Dostęp do płatności
        `
      },
      {
        id: 'schedule',
        title: 'Grafik pracy',
        content: `
## Zarządzanie grafikiem pracy

### Ustawienie godzin pracy
1. Przejdź do **Pracownicy**
2. Kliknij na pracownika
3. Przejdź do zakładki **Grafik**

### Standardowy grafik tygodniowy
Dla każdego dnia tygodnia ustaw:
- **Godzina rozpoczęcia** - np. 9:00
- **Godzina zakończenia** - np. 17:00
- **Przerwa** - np. 12:00-12:30

Dni wolne pozostaw puste lub odznacz.

### Wyjątki od grafiku
Dla konkretnych dat możesz ustawić:
- **Dzień wolny** - urlop, choroba
- **Zmienione godziny** - np. krócej w piątek
- **Dodatkowy dzień pracy** - np. sobota

### Urlopy i nieobecności
1. Przejdź do profilu pracownika
2. Kliknij **Dodaj nieobecność**
3. Wybierz daty od-do
4. Podaj powód (opcjonalnie)

System automatycznie:
- Zablokuje rezerwacje w tym czasie
- Powiadomi o konfliktach z istniejącymi rezerwacjami

### Widok grafiku zespołu
W **Pracownicy → Grafik zespołu** zobaczysz:
- Grafik wszystkich pracowników na jednym widoku
- Konflikty i nakładające się zmiany
- Statystyki godzin pracy
        `
      }
    ]
  },
  {
    id: 'customers',
    icon: Users,
    title: 'Klienci (CRM)',
    description: 'Baza klientów i zarządzanie relacjami',
    articles: [
      {
        id: 'customer-database',
        title: 'Baza klientów',
        content: `
## Baza klientów (CRM)

### Przegląd bazy
W menu **Klienci** znajdziesz listę wszystkich klientów z informacjami:
- Imię i nazwisko
- Telefon i e-mail
- Liczba wizyt
- Łączna wartość wizyt
- Data ostatniej wizyty

### Wyszukiwanie i filtrowanie
- **Wyszukiwarka** - szukaj po imieniu, telefonie, e-mailu
- **Filtry** - aktywni, nieaktywni, VIP
- **Sortowanie** - alfabetycznie, po dacie, po wartości

### Profil klienta
Kliknij na klienta, aby zobaczyć:
- **Dane kontaktowe** - telefon, e-mail, adres
- **Historia wizyt** - wszystkie rezerwacje
- **Notatki** - Twoje uwagi o kliencie
- **Zgody RODO** - status zgód marketingowych
- **Statystyki** - wartość klienta, częstotliwość wizyt

### Dodawanie klienta ręcznie
1. Kliknij **+ Nowy klient**
2. Wypełnij dane: imię, telefon, e-mail
3. Dodaj notatki (opcjonalnie)
4. Zapisz

### Automatyczne dodawanie
Klienci są automatycznie dodawani do bazy gdy:
- Dokonają rezerwacji online
- Zostaną dodani przy tworzeniu rezerwacji
        `
      },
      {
        id: 'customer-history',
        title: 'Historia i notatki klientów',
        content: `
## Historia wizyt i notatki

### Historia wizyt
W profilu klienta zakładka **Historia** pokazuje:
- Wszystkie przeszłe wizyty
- Datę i godzinę
- Wykonaną usługę
- Pracownika
- Wartość wizyty
- Status (zakończona, anulowana, nieobecność)

### Notatki o kliencie
Dodawaj ważne informacje o kliencie:
1. Otwórz profil klienta
2. Przejdź do zakładki **Notatki**
3. Kliknij **+ Dodaj notatkę**
4. Wpisz treść i zapisz

**Przykłady notatek:**
- "Preferuje kawę z mlekiem"
- "Alergia na niektóre produkty"
- "Lubi rozmawiać o podróżach"
- "Zawsze spóźnia się 10 minut"

### Tagi klientów
Oznaczaj klientów tagami dla łatwiejszej segmentacji:
- **VIP** - najważniejsi klienci
- **Nowy** - nowi klienci
- **Nieaktywny** - dawno nie było
- Własne tagi

### Przypomnienia
Ustaw przypomnienia związane z klientem:
- "Zadzwonić za tydzień"
- "Zaproponować nową usługę"
- "Sprawdzić zadowolenie"
        `
      }
    ]
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Powiadomienia',
    description: 'SMS, e-mail i przypomnienia',
    articles: [
      {
        id: 'sms-notifications',
        title: 'Powiadomienia SMS',
        content: `
## Powiadomienia SMS

### Automatyczne SMS-y
System wysyła automatycznie:

**Potwierdzenie rezerwacji:**
- Wysyłane natychmiast po dokonaniu rezerwacji
- Zawiera: datę, godzinę, usługę, adres

**Przypomnienie 24h przed:**
- Wysyłane dzień przed wizytą
- Zawiera link do potwierdzenia/anulowania

**Przypomnienie 2h przed:**
- Wysyłane 2 godziny przed wizytą
- Krótkie przypomnienie

**Powiadomienie o zmianie:**
- Gdy zmienisz termin rezerwacji
- Informacja o nowym terminie

**Powiadomienie o anulowaniu:**
- Gdy rezerwacja zostanie anulowana
- Informacja z przeprosinami

### Konfiguracja SMS
W **Ustawienia → Powiadomienia → SMS**:
- Włącz/wyłącz poszczególne typy SMS
- Edytuj treść wiadomości
- Ustaw godziny wysyłki przypomnień

### Limit SMS
W planie Premium masz **500 SMS miesięcznie**. Sprawdź zużycie w **Ustawienia → Powiadomienia → Statystyki**.

### Własne SMS-y
Możesz wysłać własny SMS do klienta:
1. Otwórz profil klienta
2. Kliknij **Wyślij SMS**
3. Wpisz treść i wyślij
        `
      },
      {
        id: 'email-notifications',
        title: 'Powiadomienia e-mail',
        content: `
## Powiadomienia e-mail

### Automatyczne e-maile
System wysyła automatycznie:

**Potwierdzenie rezerwacji:**
- Szczegóły wizyty
- Przycisk do dodania do kalendarza
- Link do zarządzania rezerwacją

**Przypomnienie przed wizytą:**
- Wysyłane 24h przed
- Przypomnienie o wizycie

**Podziękowanie po wizycie:**
- Wysyłane po zakończonej wizycie
- Prośba o opinię (opcjonalnie)

**Powiadomienia o zmianach:**
- Zmiana terminu
- Anulowanie rezerwacji

### Personalizacja e-maili
W **Ustawienia → Powiadomienia → E-mail**:
- Dodaj logo firmy
- Zmień kolory brandingu
- Edytuj treść wiadomości
- Dodaj stopkę z danymi firmy

### Zmienne w szablonach
Używaj zmiennych do personalizacji:
- \`{imie}\` - imię klienta
- \`{data}\` - data wizyty
- \`{godzina}\` - godzina wizyty
- \`{usluga}\` - nazwa usługi
- \`{pracownik}\` - imię pracownika
- \`{firma}\` - nazwa Twojej firmy
        `
      }
    ]
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: 'Płatności',
    description: 'Płatności online i rozliczenia',
    articles: [
      {
        id: 'payment-setup',
        title: 'Konfiguracja płatności',
        content: `
## Konfiguracja płatności online

### Dostępne metody płatności
Rezerwacja24 obsługuje:
- **Stripe** - karty płatnicze, BLIK, przelewy
- **Przelewy24** - wszystkie polskie banki
- **PayU** - płatności online

### Podłączenie Stripe
1. Przejdź do **Ustawienia → Płatności**
2. Kliknij **Połącz ze Stripe**
3. Zaloguj się do Stripe lub utwórz konto
4. Autoryzuj połączenie

### Konfiguracja płatności
Po podłączeniu ustaw:

**Depozyty:**
- Wymagaj depozytu przy rezerwacji online
- Ustaw kwotę lub procent (np. 50 zł lub 30%)
- Depozyt jest odliczany od końcowej ceny

**Pełna płatność:**
- Wymagaj pełnej płatności z góry
- Dla wybranych usług lub wszystkich

**Płatność na miejscu:**
- Klient płaci po wizycie
- Bez płatności online

### Polityka anulacji
Ustaw zasady zwrotów:
- Anulacja do 24h przed - pełny zwrot
- Anulacja do 2h przed - zwrot 50%
- Późniejsza anulacja - brak zwrotu
        `
      },
      {
        id: 'invoices',
        title: 'Faktury',
        content: `
## Faktury

### Automatyczne faktury
System może automatycznie generować faktury:
1. Przejdź do **Ustawienia → Faktury**
2. Włącz **Automatyczne faktury**
3. Uzupełnij dane firmy (NIP, adres)

### Dane na fakturze
Skonfiguruj:
- Nazwa firmy
- Adres
- NIP
- Numer konta bankowego
- Logo firmy

### Numeracja faktur
Ustaw format numeracji:
- FV/001/2024
- 2024/01/001
- Własny format

### Wysyłanie faktur
Faktury są wysyłane automatycznie:
- Po zakończeniu wizyty
- Po otrzymaniu płatności online
- Na żądanie klienta

### Historia faktur
W **Ustawienia → Faktury → Historia** znajdziesz:
- Wszystkie wystawione faktury
- Status (wysłana, opłacona)
- Możliwość pobrania PDF
- Możliwość ponownego wysłania
        `
      }
    ]
  },
  {
    id: 'integrations',
    icon: Globe,
    title: 'Integracje',
    description: 'Kalendarze, widget i API',
    articles: [
      {
        id: 'google-calendar',
        title: 'Integracja z Google Calendar',
        content: `
## Google Calendar

### Połączenie z Google Calendar
1. Przejdź do **Ustawienia → Integracje**
2. Kliknij **Połącz z Google Calendar**
3. Zaloguj się na konto Google
4. Zezwól na dostęp do kalendarza

### Synchronizacja
Po połączeniu:
- Rezerwacje z Rezerwacja24 pojawiają się w Google Calendar
- Możesz wybrać kierunek synchronizacji:
  - Tylko do Google (jednokierunkowa)
  - Dwukierunkowa (zmiany w Google blokują terminy)

### Ustawienia synchronizacji
- **Który kalendarz** - wybierz kalendarz Google
- **Co synchronizować** - wszystkie rezerwacje lub tylko potwierdzone
- **Szczegóły wydarzenia** - jakie informacje pokazywać

### Dla pracowników
Każdy pracownik może połączyć swój kalendarz:
1. Pracownik loguje się do systemu
2. Przechodzi do **Mój profil → Integracje**
3. Łączy swoje konto Google
        `
      },
      {
        id: 'website-widget',
        title: 'Widget na stronę WWW',
        content: `
## Widget rezerwacji na Twoją stronę

### Pobierz kod widgetu
1. Przejdź do **Ustawienia → Widget WWW**
2. Skopiuj kod JavaScript

### Wklej na swoją stronę
Wklej kod przed zamknięciem tagu \`</body>\`:

\`\`\`html
<script src="https://rezerwacja24.pl/embed.js" 
        data-company="twoja-firma">
</script>
\`\`\`

### Przycisk rezerwacji
Dodaj przycisk otwierający widget:

\`\`\`html
<button onclick="Rezerwacja24.open()">
  Zarezerwuj wizytę
</button>
\`\`\`

### Personalizacja widgetu
W ustawieniach możesz zmienić:
- **Kolor główny** - dopasuj do swojej strony
- **Pozycja przycisku** - prawy/lewy róg
- **Tekst przycisku** - "Zarezerwuj", "Umów wizytę" itp.
- **Język** - polski, angielski

### Tryby widgetu
- **Popup** - otwiera się w okienku
- **Inline** - osadzony na stronie
- **Pełna strona** - przekierowanie na subdomenę
        `
      },
      {
        id: 'api-access',
        title: 'Dostęp do API',
        content: `
## API REST

### Klucze API
1. Przejdź do **Ustawienia → API**
2. Kliknij **Wygeneruj klucz API**
3. Skopiuj klucz (pokazywany tylko raz!)

### Autoryzacja
Dodaj klucz w nagłówku:
\`\`\`
Authorization: Bearer TWOJ_KLUCZ_API
\`\`\`

### Dostępne endpointy

**Rezerwacje:**
- \`GET /api/bookings\` - lista rezerwacji
- \`POST /api/bookings\` - nowa rezerwacja
- \`PUT /api/bookings/:id\` - edycja
- \`DELETE /api/bookings/:id\` - anulowanie

**Klienci:**
- \`GET /api/customers\` - lista klientów
- \`POST /api/customers\` - nowy klient
- \`GET /api/customers/:id\` - szczegóły

**Usługi:**
- \`GET /api/services\` - lista usług
- \`GET /api/services/:id/availability\` - dostępność

**Pracownicy:**
- \`GET /api/employees\` - lista pracowników

### Dokumentacja
Pełna dokumentacja API dostępna pod:
\`https://api.rezerwacja24.pl/docs\`

### Limity
- 1000 zapytań na godzinę
- Odpowiedzi w formacie JSON
        `
      }
    ]
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Bezpieczeństwo',
    description: '2FA, hasła i ochrona danych',
    articles: [
      {
        id: 'two-factor',
        title: 'Uwierzytelnianie dwuskładnikowe (2FA)',
        content: `
## Uwierzytelnianie dwuskładnikowe

### Co to jest 2FA?
Dwuskładnikowe uwierzytelnianie dodaje dodatkową warstwę bezpieczeństwa. Oprócz hasła potrzebujesz kodu z aplikacji.

### Włączenie 2FA
1. Przejdź do **Ustawienia → Bezpieczeństwo**
2. Kliknij **Włącz 2FA**
3. Zeskanuj kod QR aplikacją (Google Authenticator, Authy)
4. Wpisz kod weryfikacyjny
5. Zapisz kody zapasowe!

### Aplikacje 2FA
Zalecane aplikacje:
- **Google Authenticator** (Android, iOS)
- **Authy** (Android, iOS, Desktop)
- **Microsoft Authenticator** (Android, iOS)

### Logowanie z 2FA
1. Wpisz e-mail i hasło
2. Otwórz aplikację 2FA
3. Wpisz 6-cyfrowy kod
4. Kod zmienia się co 30 sekund

### Kody zapasowe
Przy włączeniu 2FA otrzymasz 10 kodów zapasowych:
- Zapisz je w bezpiecznym miejscu
- Każdy kod można użyć tylko raz
- Służą gdy nie masz dostępu do aplikacji

### Wyłączenie 2FA
1. Przejdź do **Ustawienia → Bezpieczeństwo**
2. Kliknij **Wyłącz 2FA**
3. Potwierdź kodem z aplikacji
        `
      },
      {
        id: 'password-security',
        title: 'Bezpieczeństwo hasła',
        content: `
## Bezpieczeństwo hasła

### Wymagania hasła
Twoje hasło musi zawierać:
- Minimum 8 znaków
- Wielką literę (A-Z)
- Małą literę (a-z)
- Cyfrę (0-9)
- Zalecany znak specjalny (!@#$%^&*)

### Zmiana hasła
1. Przejdź do **Ustawienia → Bezpieczeństwo**
2. Kliknij **Zmień hasło**
3. Wpisz obecne hasło
4. Wpisz nowe hasło dwukrotnie
5. Zapisz

### Resetowanie hasła
Jeśli zapomniałeś hasła:
1. Na stronie logowania kliknij **Zapomniałem hasła**
2. Wpisz swój adres e-mail
3. Sprawdź skrzynkę e-mail
4. Kliknij link resetujący
5. Ustaw nowe hasło

### Sesje i urządzenia
W **Ustawienia → Bezpieczeństwo → Sesje** zobaczysz:
- Aktywne sesje logowania
- Urządzenia i przeglądarki
- Lokalizacje logowań

Możesz wylogować się ze wszystkich urządzeń.
        `
      }
    ]
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analityka i raporty',
    description: 'Statystyki i raporty biznesowe',
    articles: [
      {
        id: 'dashboard-analytics',
        title: 'Panel analityczny',
        content: `
## Panel analityczny

### Przegląd
W menu **Analityka** znajdziesz kompleksowe statystyki Twojego biznesu.

### Kluczowe wskaźniki (KPI)
- **Przychód** - dzienny, tygodniowy, miesięczny
- **Liczba rezerwacji** - w wybranym okresie
- **Średnia wartość wizyty** - przychód / liczba wizyt
- **Wskaźnik anulacji** - % anulowanych rezerwacji
- **Wskaźnik nieobecności** - % no-show
- **Nowi klienci** - liczba nowych klientów

### Wykresy
- **Przychód w czasie** - wykres liniowy
- **Rezerwacje wg dnia tygodnia** - słupkowy
- **Popularne usługi** - kołowy
- **Obłożenie pracowników** - porównanie

### Heatmapa rezerwacji
Wizualizacja pokazująca:
- Najpopularniejsze godziny
- Najpopularniejsze dni
- Okresy niskiego obłożenia

### Filtry
Analizuj dane według:
- **Okres** - dziś, tydzień, miesiąc, rok, własny
- **Pracownik** - statystyki dla wybranej osoby
- **Usługa** - statystyki dla wybranej usługi
- **Źródło** - online vs. ręczne
        `
      },
      {
        id: 'reports',
        title: 'Raporty',
        content: `
## Raporty

### Dostępne raporty

**Raport przychodów:**
- Przychód dzienny/tygodniowy/miesięczny
- Podział na usługi
- Podział na pracowników
- Porównanie z poprzednim okresem

**Raport rezerwacji:**
- Liczba rezerwacji
- Statusy (zakończone, anulowane, no-show)
- Źródła rezerwacji
- Średni czas wyprzedzenia

**Raport klientów:**
- Nowi vs. powracający
- Najcenniejsi klienci (top 10)
- Częstotliwość wizyt
- Wartość życiowa klienta (LTV)

**Raport pracowników:**
- Obłożenie każdego pracownika
- Przychód na pracownika
- Liczba obsłużonych klientów
- Średnia ocena (jeśli włączone)

### Eksport raportów
Każdy raport możesz wyeksportować:
- **PDF** - do druku lub wysłania
- **Excel** - do dalszej analizy
- **CSV** - do importu w innych systemach

### Automatyczne raporty
Ustaw wysyłkę raportów e-mailem:
1. Przejdź do **Analityka → Automatyczne raporty**
2. Wybierz typ raportu
3. Ustaw częstotliwość (dziennie, tygodniowo, miesięcznie)
4. Podaj adresy e-mail odbiorców
        `
      }
    ]
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Ustawienia',
    description: 'Konfiguracja systemu',
    articles: [
      {
        id: 'company-settings',
        title: 'Ustawienia firmy',
        content: `
## Ustawienia firmy

### Dane podstawowe
W **Ustawienia → Firma** skonfiguruj:
- **Nazwa firmy** - wyświetlana klientom
- **Opis** - krótki opis działalności
- **Logo** - przesyłane w formacie PNG/JPG
- **Kategoria** - branża działalności

### Dane kontaktowe
- **Adres** - ulica, miasto, kod pocztowy
- **Telefon** - numer kontaktowy
- **E-mail** - adres do korespondencji
- **Strona WWW** - link do Twojej strony

### Dane do faktur
- **NIP** - numer identyfikacji podatkowej
- **REGON** - numer REGON
- **Nazwa pełna** - pełna nazwa firmy
- **Adres siedziby** - jeśli inny niż kontaktowy

### Godziny pracy
Ustaw dla każdego dnia tygodnia:
- Godzina otwarcia
- Godzina zamknięcia
- Przerwy (np. obiadowa)
- Dni wolne

### Subdomena
Zmień adres swojej strony rezerwacji:
- Obecny: twoja-firma.rezerwacja24.pl
- Nowy: nowa-nazwa.rezerwacja24.pl

Uwaga: Zmiana subdomeny może wpłynąć na istniejące linki.
        `
      },
      {
        id: 'subscription',
        title: 'Subskrypcja i płatności',
        content: `
## Subskrypcja

### Aktualny plan
W **Ustawienia → Subskrypcja** zobaczysz:
- Nazwa planu (Premium)
- Data następnej płatności
- Metoda płatności
- Historia płatności

### Okres próbny
Nowe konta otrzymują 7 dni za darmo:
- Pełny dostęp do wszystkich funkcji
- Brak wymaganej karty płatniczej
- Przypomnienie przed końcem okresu

### Płatność za subskrypcję
Po okresie próbnym:
1. Przejdź do **Ustawienia → Subskrypcja**
2. Kliknij **Dodaj metodę płatności**
3. Podaj dane karty lub wybierz BLIK/przelew
4. Potwierdź płatność

### Zmiana metody płatności
1. Przejdź do **Ustawienia → Subskrypcja**
2. Kliknij **Zmień metodę płatności**
3. Dodaj nową kartę
4. Usuń starą (opcjonalnie)

### Anulowanie subskrypcji
1. Przejdź do **Ustawienia → Subskrypcja**
2. Kliknij **Anuluj subskrypcję**
3. Podaj powód (opcjonalnie)
4. Potwierdź

Po anulowaniu:
- Dostęp do końca opłaconego okresu
- Dane przechowywane przez 30 dni
- Możliwość reaktywacji
        `
      }
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started')
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  const filteredSections = helpSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.articles.length > 0 || section.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-carbon-black/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-neutral-gray hover:text-accent-neon transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Powrót</span>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-accent-neon" />
                <span className="text-xl font-bold text-white">Centrum Pomocy</span>
              </div>
            </div>
            <Link href="/contact" className="text-sm text-neutral-gray hover:text-accent-neon transition-colors">
              Kontakt z supportem
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-dark/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Jak możemy Ci pomóc?
          </h1>
          <p className="text-neutral-gray/70 mb-8">
            Znajdź odpowiedzi na pytania dotyczące Rezerwacja24
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray/50" />
            <input
              type="text"
              placeholder="Szukaj w centrum pomocy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2 sticky top-24">
              {filteredSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setExpandedSection(expandedSection === section.id ? null : section.id)
                      setSelectedArticle(null)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      expandedSection === section.id
                        ? 'bg-accent-neon/10 text-accent-neon'
                        : 'text-neutral-gray hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedSection === section.id ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-8 py-2 space-y-1">
                          {section.articles.map((article) => (
                            <button
                              key={article.id}
                              onClick={() => setSelectedArticle(article)}
                              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                selectedArticle?.id === article.id
                                  ? 'text-accent-neon bg-accent-neon/5'
                                  : 'text-neutral-gray/70 hover:text-white'
                              }`}
                            >
                              {article.title}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {selectedArticle ? (
              <motion.article
                key={selectedArticle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">{selectedArticle.title}</h2>
                <div 
                  className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-gray/80 prose-li:text-neutral-gray/80 prose-strong:text-white prose-code:text-accent-neon prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedArticle.content
                      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-4">$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([^`]+)`/g, '<code>$1</code>')
                      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                      .replace(/^- (.*$)/gm, '<li>$1</li>')
                      .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-6 space-y-1 my-4">$&</ul>')
                      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
                      .replace(/\n\n/g, '</p><p class="my-3">')
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent-neon hover:underline">$1</a>')
                  }}
                />
              </motion.article>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredSections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => {
                      setExpandedSection(section.id)
                      if (section.articles.length > 0) {
                        setSelectedArticle(section.articles[0])
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card p-6 text-left hover:border-accent-neon/30 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent-neon/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <section.icon className="w-6 h-6 text-accent-neon" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{section.title}</h3>
                        <p className="text-sm text-neutral-gray/70">{section.description}</p>
                        <p className="text-xs text-accent-neon mt-2">{section.articles.length} artykułów</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Section */}
      <section className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Nie znalazłeś odpowiedzi?</h2>
          <p className="text-neutral-gray/70 mb-8">Skontaktuj się z naszym zespołem wsparcia</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="mailto:kontakt@rezerwacja24.pl" className="glass-card p-6 hover:border-accent-neon/30 transition-colors">
              <Mail className="w-8 h-8 text-accent-neon mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">E-mail</h3>
              <p className="text-sm text-neutral-gray/70">kontakt@rezerwacja24.pl</p>
            </a>
            
            <a href="tel:+48506785959" className="glass-card p-6 hover:border-accent-neon/30 transition-colors">
              <Phone className="w-8 h-8 text-accent-neon mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">Telefon</h3>
              <p className="text-sm text-neutral-gray/70">+48 506 785 959</p>
            </a>
            
            <Link href="/contact" className="glass-card p-6 hover:border-accent-neon/30 transition-colors">
              <MessageSquare className="w-8 h-8 text-accent-neon mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">Formularz</h3>
              <p className="text-sm text-neutral-gray/70">Napisz do nas</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-neutral-gray/60">
          <p>© 2024 Rezerwacja24. Wszystkie prawa zastrzeżone.</p>
          <div className="mt-4 space-x-4">
            <Link href="/privacy" className="hover:text-accent-neon transition-colors">Polityka prywatności</Link>
            <Link href="/terms" className="hover:text-accent-neon transition-colors">Regulamin</Link>
            <Link href="/contact" className="hover:text-accent-neon transition-colors">Kontakt</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
