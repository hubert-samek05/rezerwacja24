# 🔄 INSTRUKCJA: JAK WYCZYŚCIĆ CACHE PRZEGLĄDARKI

## Problem
Strona ustawień nadal ładuje się długo, mimo że kod został naprawiony.

## Przyczyna
**Cache przeglądarki** - przeglądarka używa starej wersji JavaScript z cache.

---

## ✅ ROZWIĄZANIE: Hard Refresh

### Windows / Linux:
1. **Chrome / Edge / Firefox:**
   - Naciśnij: `Ctrl + Shift + R`
   - LUB: `Ctrl + F5`
   - LUB: `Shift + F5`

2. **Alternatywnie:**
   - Naciśnij `F12` (otwórz DevTools)
   - Kliknij prawym na przycisk odświeżania
   - Wybierz "Wyczyść pamięć podręczną i wymuś odświeżenie"

### Mac:
1. **Chrome / Edge:**
   - Naciśnij: `Cmd + Shift + R`

2. **Safari:**
   - Naciśnij: `Cmd + Option + E` (wyczyść cache)
   - Potem: `Cmd + R` (odśwież)

3. **Firefox:**
   - Naciśnij: `Cmd + Shift + R`

---

## 🔍 Jak Sprawdzić Czy Działa?

### 1. Otwórz DevTools (F12)
### 2. Przejdź do zakładki "Network" (Sieć)
### 3. Odśwież stronę (Ctrl+Shift+R)
### 4. Sprawdź requesty:

**Powinny być:**
- ✅ `https://api.rezerwacja24.pl/api/tenants/...` (szybki, ~0.3s)
- ✅ `https://api.rezerwacja24.pl/api/payments/settings` (szybki, ~0.1s)

**NIE powinno być:**
- ❌ `undefined/api/tenants/...`
- ❌ Długie timeouty (>5s)
- ❌ Błędy CORS

---

## 🎯 Weryfikacja

### Jeśli po Hard Refresh nadal wolno:

1. **Sprawdź Console (F12 → Console):**
   ```
   Szukaj błędów:
   - "Failed to fetch"
   - "NetworkError"
   - "CORS"
   ```

2. **Sprawdź Network (F12 → Network):**
   ```
   Szukaj wolnych requestów:
   - Które requesty trwają >1s?
   - Które mają status "failed" lub "pending"?
   ```

3. **Sprawdź czy używasz HTTPS:**
   ```
   URL powinien być: https://app.rezerwacja24.pl/dashboard/settings
   NIE: http://app.rezerwacja24.pl/dashboard/settings
   ```

---

## 📊 Oczekiwany Czas Ładowania

Po hard refresh:
- ⏱️ **1-2 sekundy** - normalne ładowanie
- ⏱️ **3-5 sekund** - wolne połączenie internetowe
- ⏱️ **>10 sekund** - problem (zgłoś)

---

## 🆘 Jeśli Nadal Nie Działa

### Wyczyść całą pamięć cache:

**Chrome / Edge:**
1. Naciśnij `Ctrl + Shift + Delete`
2. Wybierz "Cały czas"
3. Zaznacz "Obrazy i pliki w pamięci podręcznej"
4. Kliknij "Wyczyść dane"

**Firefox:**
1. Naciśnij `Ctrl + Shift + Delete`
2. Wybierz "Wszystko"
3. Zaznacz "Pamięć podręczna"
4. Kliknij "Wyczyść teraz"

**Safari:**
1. Safari → Preferencje → Zaawansowane
2. Zaznacz "Pokaż menu Rozwijanie w pasku menu"
3. Rozwijanie → Wyczyść pamięć podręczną

---

## 🔧 Dla Programistów

### Wyłącz cache w DevTools:
1. Otwórz DevTools (F12)
2. Przejdź do Settings (⚙️)
3. Zaznacz "Disable cache (while DevTools is open)"
4. Trzymaj DevTools otwarte podczas testowania

### Sprawdź czy nowy kod jest załadowany:
```javascript
// W Console (F12 → Console) wpisz:
console.log(window.location.href)
// Powinno być: https://app.rezerwacja24.pl/dashboard/settings

// Sprawdź załadowane skrypty:
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('settings'))
  .forEach(r => console.log(r.name, r.duration + 'ms'))
```

---

## ✅ Podsumowanie

1. **Naciśnij `Ctrl + Shift + R`** (Windows/Linux)
2. **LUB `Cmd + Shift + R`** (Mac)
3. **Sprawdź czy ładuje się szybko (1-2s)**
4. **Jeśli nie - wyczyść całą cache przeglądarki**

---

**Data:** 9 Grudnia 2024, 20:48 CET  
**Problem:** Cache przeglądarki  
**Rozwiązanie:** Hard Refresh
