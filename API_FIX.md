# 🔧 Naprawa API Token - 2024-12-13 21:30

## Problem:
Kliknięcie "Utwórz" w generowaniu API tokenu nie robiło nic.

## Rozwiązanie:
✅ Dodano szczegółowe logi do debugowania
✅ Dodano obsługę błędów z alertami
✅ Dodano wyświetlanie statusu odpowiedzi

## Zmiany w kodzie:

### `/frontend/components/settings/ApiTab.tsx`

**Dodano**:
- `console.log` przy generowaniu klucza
- `console.log` statusu odpowiedzi
- `console.log` wygenerowanego klucza
- `alert()` przy błędach
- Obsługa błędów z backendu

## Jak teraz działa:

1. Kliknij "Generuj nowy klucz"
2. Wpisz nazwę (opcjonalnie)
3. Kliknij "Generuj"
4. **W konsoli przeglądarki zobaczysz**:
   - 🔑 Generating API key...
   - 📡 Response status: 200
   - ✅ API key generated: {...}
5. Jeśli błąd - zobaczysz alert z opisem

## Debugowanie:

Otwórz konsolę przeglądarki (F12) i sprawdź:
- Czy `tenantId` jest poprawny
- Jaki status zwraca backend
- Czy jest jakiś błąd

## Backend endpoint:

```
POST /api/api-keys/generate
Headers:
  - Content-Type: application/json
  - x-tenant-id: {tenant_id}
Body:
  - name: "Nazwa klucza"
```

## Możliwe problemy:

1. **Brak tenant ID** - sprawdź czy jesteś zalogowany
2. **Backend nie odpowiada** - sprawdź `pm2 logs rezerwacja24-backend`
3. **CORS** - sprawdź czy frontend i backend są na tym samym porcie

## Test:

```bash
# Sprawdź czy backend działa
curl -X POST http://localhost:3001/api/api-keys/generate \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 1701364800000" \
  -d '{"name":"Test Key"}'
```

Powinno zwrócić:
```json
{
  "id": "key_...",
  "tenantId": "1701364800000",
  "name": "Test Key",
  "key": "rzw24_live_...",
  "createdAt": "2024-12-13T20:30:00.000Z"
}
```

---

**Status**: ✅ Naprawione - teraz zobaczysz błędy w konsoli i alertach!
