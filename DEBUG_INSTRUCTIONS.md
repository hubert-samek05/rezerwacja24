# 🔍 Instrukcje Debugowania - Popup Subskrypcji

**Data**: 2024-12-17 21:19  
**Problem**: Popup nadal się pokazuje mimo subskrypcji

---

## 🧪 Co Zrobić Teraz

### KROK 1: Wyczyść Cache Przeglądarki

1. Otwórz przeglądarkę
2. Naciśnij **F12** (otwórz DevTools)
3. Kliknij prawym na przycisk odświeżania
4. Wybierz **"Wyczyść pamięć podręczną i wymuszone ponowne załadowanie"**

LUB:

1. Otwórz **Application** tab w DevTools
2. **Local Storage** → `https://app.rezerwacja24.pl`
3. Usuń klucz: `rezerwacja24_subscription_onboarding_shown`
4. Odśwież stronę (Ctrl+F5)

---

### KROK 2: Sprawdź Logi w Konsoli

Po odświeżeniu strony, w konsoli (F12 → Console) powinieneś zobaczyć:

**Jeśli DZIAŁA**:
```
🔍 [Onboarding] wasShown: null
🔍 [Onboarding] Subscription data: {hasActiveSubscription: true, isInTrial: true, ...}
🔍 [Onboarding] hasAnySubscription: true
✅ [Onboarding] Ma subskrypcję - NIE pokazuję modalu
```

**Jeśli NIE DZIAŁA**:
```
🔍 [Onboarding] Subscription data: {error: "Tenant ID is required"}
❌ [Onboarding] Brak subskrypcji - pokazuję modal
```

---

### KROK 3: Jeśli Nadal Nie Działa

Wyślij mi **WSZYSTKIE** linie z konsoli które zawierają:
- `[Onboarding]`
- `[Frontend API]`
- `Subscription`

---

## 🔧 Co Naprawiłem

### 1. Hook Wysyła Token
```typescript
const token = localStorage.getItem('token');
const response = await fetch('/api/billing/subscription/status', {
  headers: token ? {
    'Authorization': `Bearer ${token}`
  } : {}
});
```

### 2. Sprawdzanie Trial
```typescript
const hasAnySubscription = data.hasActiveSubscription || data.isInTrial;
```

### 3. Automatyczne Oznaczanie
```typescript
if (hasAnySubscription) {
  localStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
}
```

### 4. Szczegółowe Logowanie
- Frontend API route loguje dekodowany token
- Hook loguje dane subskrypcji
- Backend loguje tenantId

---

## 🐛 Możliwe Problemy

### Problem 1: Token Nie Ma tenantId
**Objaw**: `error: "Tenant ID is required"`  
**Rozwiązanie**: Wyloguj się i zaloguj ponownie

### Problem 2: Cache Przeglądarki
**Objaw**: Stary kod się wykonuje  
**Rozwiązanie**: Ctrl+Shift+Delete → Wyczyść cache

### Problem 3: LocalStorage
**Objaw**: Modal pokazuje się mimo subskrypcji  
**Rozwiązanie**: Usuń klucz `rezerwacja24_subscription_onboarding_shown`

---

## 📊 Jak Sprawdzić Token

W konsoli przeglądarki wpisz:
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

// Dekoduj token (base64)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Payload:', payload);
console.log('tenantId:', payload.tenantId);
```

**Powinno zwrócić**:
```
tenantId: "1701364800000"
```

---

## ✅ Checklist

- [ ] Wyczyszczono cache przeglądarki
- [ ] Usunięto klucz z localStorage
- [ ] Odświeżono stronę (Ctrl+F5)
- [ ] Sprawdzono logi w konsoli
- [ ] Token ma tenantId
- [ ] Modal się NIE pokazuje

---

## 📞 Jeśli Nadal Nie Działa

Wyślij mi:

1. **Logi z konsoli przeglądarki** (wszystkie linie z `[Onboarding]`)
2. **Wartość tokena** (pierwszych 50 znaków)
3. **Czy widzisz popup?** (TAK/NIE)

---

**Spróbuj teraz wyczyścić cache i sprawdź!**
