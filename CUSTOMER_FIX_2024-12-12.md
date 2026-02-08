# Poprawka: Problem z dodawaniem klientów w kalendarzu

**Data:** 2024-12-12  
**Status:** ✅ Wdrożone na produkcję

## Problem

Podczas dodawania nowej rezerwacji w kalendarzu, po utworzeniu nowego klienta, system wyświetlał błąd:
```
Nie znaleziono wybranych danych. Odśwież stronę i spróbuj ponownie.
```

Rezerwacja nie mogła zostać zapisana, ponieważ nowo utworzony klient nie był widoczny na liście klientów.

## Przyczyna

W pliku `/backend/src/customers/customers.service.ts` metoda `findAll()` zwracała tylko klientów, którzy mieli już przypisane rezerwacje:

```typescript
const customers = await this.prisma.customers.findMany({
  where: {
    bookings: {
      some: {
        employeeId: { in: employeeIds },
      },
    },
  },
  // ...
});
```

Nowo utworzeni klienci (bez rezerwacji) nie spełniali tego warunku i nie byli zwracani przez API.

## Rozwiązanie

Zmodyfikowano metodę `findAll()` aby zwracała również klientów bez rezerwacji:

```typescript
const customers = await this.prisma.customers.findMany({
  where: {
    OR: [
      {
        // Customers którzy mają rezerwacje z employees z tego tenanta
        bookings: {
          some: {
            employeeId: { in: employeeIds },
          },
        },
      },
      {
        // Customers którzy nie mają jeszcze żadnych rezerwacji
        // (nowo utworzeni klienci)
        bookings: {
          none: {},
        },
      },
    ],
  },
  // ...
});
```

## Zmienione pliki

- `/backend/src/customers/customers.service.ts` - linie 31-82

## Wdrożenie

1. Zbudowano backend: `npm run build`
2. Zrestartowano backend przez PM2: `pm2 restart rezerwacja24-backend`
3. Zweryfikowano działanie: API `/api/customers` zwraca wszystkich klientów
4. Status: Backend i Frontend działają stabilnie

## Weryfikacja

```bash
# Sprawdzenie statusu
pm2 status

# Sprawdzenie health check
curl http://localhost:3001/api/health

# Sprawdzenie klientów
curl -H "x-tenant-id: default" http://localhost:3001/api/customers
```

## Rezultat

✅ Nowi klienci są teraz widoczni natychmiast po utworzeniu  
✅ Rezerwacje można zapisywać dla nowo utworzonych klientów  
✅ System działa stabilnie na produkcji
