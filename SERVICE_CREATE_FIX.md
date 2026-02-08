# Naprawa Błędu 500 przy Tworzeniu Usługi - Rezerwacja24

## Data naprawy: 2 grudnia 2025, 20:40

## Problem

Przy próbie utworzenia nowej usługi przez frontend występował błąd 500:

```
POST https://api.rezerwacja24.pl/api/services
[HTTP/2 500 218ms]

Błąd tworzenia usługi: 
AxiosError: Request failed with status code 500
```

### Błąd w Logach Backendu

```
PrismaClientValidationError: 
Invalid `prisma.service.create()` invocation:

Unknown argument `categoryId`. Did you mean `category`? 
Available options are marked with ?.
```

## Przyczyna

Prisma Client w kontenerze Docker nie został zaktualizowany po zmianach w schema.prisma. 

**Sekwencja problemów:**
1. Schema Prisma zawierała pole `categoryId` w modelu `Service`
2. Tabela w bazie danych miała kolumnę `categoryId`
3. DTO (CreateServiceDto) zawierało pole `categoryId`
4. **ALE** Prisma Client w kontenerze był wygenerowany ze starej wersji schema
5. Stary Prisma Client nie rozpoznawał pola `categoryId`

## Weryfikacja Problemu

### 1. Sprawdzenie Schema Prisma
```prisma
model Service {
  id            String   @id @default(cuid())
  name          String
  category      ServiceCategory? @relation(fields: [categoryId], references: [id])
  categoryId    String?  // ✅ Pole istnieje w schema
  // ...
}
```

### 2. Sprawdzenie Tabeli w Bazie Danych
```bash
docker exec rezerwacja24-postgres psql -U postgres -d rezerwacja24 -c "\d services"
```

Wynik: Kolumna `categoryId` istnieje w tabeli ✅

### 3. Problem: Prisma Client w Kontenerze
Prisma Client w działającym kontenerze był wygenerowany z poprzedniej wersji schema i nie zawierał definicji pola `categoryId`.

## Rozwiązanie

### Kroki Naprawy

1. **Regeneracja Prisma Client lokalnie**
```bash
cd backend
npx prisma generate
```

2. **Rebuild aplikacji**
```bash
npm run build
```

3. **Rebuild kontenera Docker**
```bash
docker compose build backend
```

4. **Restart kontenera z wymuszeniem użycia nowego obrazu**
```bash
docker compose stop backend
docker compose rm -f backend
docker compose up -d backend
```

### Dlaczego Trzeba Było Usunąć Kontener?

`docker compose up -d backend` samo w sobie nie wymusza użycia nowego obrazu, jeśli kontener już istnieje. Dlatego konieczne było:
- `stop` - zatrzymanie kontenera
- `rm -f` - usunięcie kontenera
- `up -d` - utworzenie nowego kontenera z nowego obrazu

## Weryfikacja Naprawy

### Test 1: Utworzenie Usługi przez API
```bash
curl -X POST "https://api.rezerwacja24.pl/api/services" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: default" \
  -d '{
    "name": "Test Service",
    "description": "Test description",
    "categoryId": "cmiozauap000168l1t9d7y4x0",
    "basePrice": 100,
    "duration": 60
  }'
```

**Wynik:** ✅ HTTP 201 Created
```json
{
  "id": "cmiozh9kk0001oks2slhul8ym",
  "name": "Test Service",
  "description": "Test description",
  "categoryId": "cmiozauap000168l1t9d7y4x0",
  "basePrice": "100",
  "duration": 60,
  "category": {
    "id": "cmiozauap000168l1t9d7y4x0",
    "name": "Fryzjerstwo"
  }
}
```

### Test 2: Sprawdzenie Logów
```bash
docker logs rezerwacja24-backend --tail 20 | grep -i "error"
```

**Wynik:** ✅ Brak błędów

### Test 3: Sprawdzenie Endpointów
```bash
# GET Services
curl "https://api.rezerwacja24.pl/api/services" -H "X-Tenant-ID: default"
# Status: 200 ✅

# GET Service Categories
curl "https://api.rezerwacja24.pl/api/service-categories" -H "X-Tenant-ID: default"
# Status: 200 ✅
```

## Status Produkcji

### Przed Naprawą:
- ❌ POST /api/services → 500 Internal Server Error
- ❌ Prisma Client validation error
- ❌ Niemożliwość tworzenia usług przez frontend

### Po Naprawie:
- ✅ POST /api/services → 201 Created
- ✅ Prisma Client rozpoznaje pole categoryId
- ✅ Tworzenie usług działa poprawnie
- ✅ Wszystkie endpointy działają (200)
- ✅ Brak błędów w logach

## Wnioski i Najlepsze Praktyki

### 1. Prisma Client Musi Być Zawsze Aktualny
Po każdej zmianie w `schema.prisma`:
```bash
npx prisma generate  # Regeneruj client
npm run build        # Przebuduj aplikację
```

### 2. Docker Build Zawiera Prisma Generate
W Dockerfile backend jest krok:
```dockerfile
RUN npx prisma generate
```
Ale wymaga to rebuildu kontenera, nie tylko restartu.

### 3. Wymuszenie Użycia Nowego Obrazu
```bash
# NIE wystarczy:
docker compose restart backend

# TRZEBA:
docker compose stop backend
docker compose rm -f backend
docker compose up -d backend
```

### 4. Weryfikacja Po Wdrożeniu
Zawsze testuj kluczowe endpointy po wdrożeniu:
```bash
# Test tworzenia
curl -X POST [endpoint] -d [data]

# Sprawdź logi
docker logs [container] --tail 50

# Sprawdź status
docker ps
```

## Struktura Plików

### Backend
```
backend/
├── prisma/
│   └── schema.prisma          # Definicja modeli
├── src/
│   └── services/
│       ├── services.service.ts    # Logika biznesowa
│       ├── services.controller.ts # Endpointy
│       └── dto/
│           └── create-service.dto.ts  # Walidacja danych
└── node_modules/
    └── @prisma/client/        # Wygenerowany client
```

## Powiązane Pliki

- `/backend/prisma/schema.prisma` - Definicja modelu Service
- `/backend/src/services/services.service.ts` - Serwis używający Prisma Client
- `/backend/src/services/dto/create-service.dto.ts` - DTO z polem categoryId
- `/backend/Dockerfile` - Zawiera `RUN npx prisma generate`

## Komenda Szybkiej Naprawy

W przyszłości, jeśli wystąpi podobny problem:

```bash
# 1. Regeneruj Prisma Client i zbuduj
cd backend
npx prisma generate
npm run build

# 2. Przebuduj i zrestartuj kontener
cd ..
docker compose build backend
docker compose stop backend
docker compose rm -f backend
docker compose up -d backend

# 3. Sprawdź logi
docker logs rezerwacja24-backend --tail 30

# 4. Przetestuj endpoint
curl -X POST "https://api.rezerwacja24.pl/api/services" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: default" \
  -d '{"name":"Test","basePrice":100,"duration":60}'
```

## Podsumowanie

Problem z błędem 500 przy tworzeniu usługi został całkowicie rozwiązany poprzez:
1. ✅ Regenerację Prisma Client z aktualnej schema
2. ✅ Rebuild aplikacji backend
3. ✅ Rebuild i restart kontenera Docker
4. ✅ Weryfikację działania przez testy API

Tworzenie usług przez frontend działa teraz poprawnie! 🎉

## Status

✅ **NAPRAWIONE I WDROŻONE NA PRODUKCJĘ**

- Backend: https://api.rezerwacja24.pl
- Endpoint: POST /api/services
- Status: 201 Created ✅
- Data naprawy: 2 grudnia 2025, 20:40 UTC+01:00
