# 🚀 Quick Start - Panel Biznesowy Rezerwacja24

## Szybki przegląd systemu

System jest już uruchomiony na **http://localhost:3001**

---

## 📍 Dostępne strony

### 1. **Strona główna** (Landing Page)
```
http://localhost:3001/
```
- Nowy copy: "System Rezerwacji Dla Twojej Firmy"
- Opis dla każdej branży (kosmetyczka, fryzjer, motoryzacja, biznes online)

### 2. **Panel biznesowy** (Dashboard)

#### Główny Dashboard
```
http://localhost:3001/dashboard
```
- Statystyki (rezerwacje, przychód, klienci, wskaźnik realizacji)
- Nadchodzące rezerwacje
- Szybkie akcje
- Podsumowanie dnia

#### Kalendarz rezerwacji
```
http://localhost:3001/dashboard/calendar
```
- Widok tygodniowy z siatką godzinową
- Filtrowanie po pracownikach
- Statusy rezerwacji (potwierdzona/oczekująca)

#### Zarządzanie usługami
```
http://localhost:3001/dashboard/services
```
- Lista usług z cenami i czasem trwania
- Kategorie usług
- Statystyki rezerwacji per usługa

#### Baza klientów
```
http://localhost:3001/dashboard/customers
```
- Tabela wszystkich klientów
- Statystyki: wszyscy, nowi, aktywni, średnia wartość
- Historia wizyt i wydatków
- Statusy: VIP, Aktywny, Nieaktywny

#### Ustawienia firmy ⭐
```
http://localhost:3001/dashboard/settings
```

**Zakładki:**
- **Dane firmy** - nazwa, kontakt, adres, NIP, REGON
- **Subdomena** ⭐ - konfiguracja `nazwa.rezerwacja24.pl` + podgląd profilu
- **Branding** - logo, kolory (wymaga Premium)
- **Zespół, Powiadomienia, Płatności, Bezpieczeństwo** (w budowie)

### 3. **Profil publiczny firmy** ⭐
```
http://localhost:3001/moja-firma
```
(Symulacja subdomeny: `moja-firma.rezerwacja24.pl`)

**Sekcje:**
- Hero z logo i opisem firmy
- Info bar (adres, telefon, godziny, email)
- Lista usług z cenami
- Zespół pracowników
- **Formularz rezerwacji online** ⭐
- Opinie klientów
- Footer z social media

---

## 🎯 Kluczowe funkcje

### ✅ Zaimplementowane

1. **Pełny panel biznesowy**
   - Dashboard z live stats
   - Kalendarz tygodniowy
   - Zarządzanie usługami
   - Baza klientów
   - Ustawienia firmy

2. **System subdomen** ⭐
   - Middleware wykrywa subdomenę
   - Routing dla firm: `firma.rezerwacja24.pl`
   - Konfiguracja w ustawieniach
   - Podgląd profilu publicznego

3. **Profil publiczny** ⭐
   - Strona firmowa na subdomenie
   - Formularz rezerwacji online
   - Prezentacja usług i zespołu
   - Opinie klientów

4. **UI/UX Premium**
   - Dark Metallic Green theme
   - Glassmorphism effects
   - Animacje Framer Motion
   - Responsywny design

---

## 🔧 Testowanie subdomen lokalnie

### Opcja 1: Edycja /etc/hosts
```bash
sudo nano /etc/hosts
```

Dodaj:
```
127.0.0.1 rezerwacja24.local
127.0.0.1 app.rezerwacja24.local
127.0.0.1 moja-firma.rezerwacja24.local
127.0.0.1 salon-anna.rezerwacja24.local
```

Następnie otwórz:
- http://rezerwacja24.local:3001 → Landing
- http://app.rezerwacja24.local:3001 → Dashboard
- http://moja-firma.rezerwacja24.local:3001 → Profil firmy

### Opcja 2: Użyj ścieżki (bez subdomen)
- http://localhost:3001/ → Landing
- http://localhost:3001/dashboard → Dashboard
- http://localhost:3001/moja-firma → Profil firmy (symulacja)

---

## 📊 Przykładowe dane (Mock)

### Rezerwacje
- Anna Kowalska - Strzyżenie damskie - Dzisiaj 10:00
- Jan Nowak - Koloryzacja - Dzisiaj 11:30
- Maria Wiśniewska - Pielęgnacja włosów - Dzisiaj 14:00

### Usługi
- Strzyżenie damskie - 120 zł - 60 min
- Koloryzacja - 250 zł - 120 min
- Manicure hybrydowy - 80 zł - 45 min
- Masaż relaksacyjny - 180 zł - 90 min

### Klienci
- 1,245 klientów
- 87 nowych w tym miesiącu
- 892 aktywnych
- $340 średnia wartość

---

## 🎨 Customizacja

### Zmiana subdomeny
1. Przejdź do `/dashboard/settings`
2. Kliknij zakładkę "Subdomena"
3. Wpisz nazwę (np. `salon-anna`)
4. Zobacz podgląd: `salon-anna.rezerwacja24.pl`
5. Kliknij "Zapisz subdomenę"

### Zmiana brandingu
1. Przejdź do `/dashboard/settings`
2. Kliknij zakładkę "Branding"
3. Prześlij logo
4. Wybierz kolory
5. (Wymaga planu Premium)

---

## 🚀 Wdrożenie na produkcję

### 1. DNS Configuration
```
A     rezerwacja24.pl           → IP_SERWERA
A     *.rezerwacja24.pl         → IP_SERWERA
```

### 2. SSL Wildcard
```bash
certbot certonly --dns-cloudflare \
  -d rezerwacja24.pl \
  -d *.rezerwacja24.pl
```

### 3. Build & Deploy
```bash
npm run build
npm run start
```

Lub Docker:
```bash
docker-compose up -d
```

---

## 📱 Responsywność

System jest w pełni responsywny:
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

---

## 🎯 Flow użytkownika

### Właściciel firmy:
1. Rejestracja → `/register`
2. Konfiguracja firmy → `/dashboard/settings`
3. Dodanie usług → `/dashboard/services`
4. Dodanie pracowników → `/dashboard/settings` (Zespół)
5. Konfiguracja subdomeny → `/dashboard/settings` (Subdomena)
6. Udostępnienie linku klientom: `firma.rezerwacja24.pl`

### Klient końcowy:
1. Wchodzi na `firma.rezerwacja24.pl`
2. Przegląda usługi i zespół
3. Wypełnia formularz rezerwacji
4. Otrzymuje potwierdzenie (email/SMS)

---

## 📞 Wsparcie

Dokumentacja:
- `WDROZENIE_PANELU.md` - Pełna dokumentacja wdrożenia
- `ARCHITECTURE.md` - Architektura systemu
- `README.md` - Główna dokumentacja

---

**Status:** ✅ Gotowe do użycia  
**Port:** 3001  
**URL:** http://localhost:3001
