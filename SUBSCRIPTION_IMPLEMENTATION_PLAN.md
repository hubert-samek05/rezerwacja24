# 🎯 Plan Implementacji Systemu Subskrypcji

**Data**: 2024-12-17 20:58  
**Status**: 🔄 W TRAKCIE

---

## 📋 Wymagania

1. ✅ Webhook Stripe działa (`/api/billing/webhook`)
2. ✅ Webhook secret zaktualizowany
3. ✅ Panel biznesowy pokazuje dane
4. ⏳ Blokada dostępu bez subskrypcji - DO ZROBIENIA

---

## 🎯 Strategia (Bezpieczna)

### Opcja 1: Middleware Frontend (REKOMENDOWANA)
**Zalety**:
- ✅ Nie psuje backendu
- ✅ Łatwe do przetestowania
- ✅ Można szybko wyłączyć
- ✅ Nie wymaga zmian w każdym kontrolerze

**Wady**:
- ❌ Można ominąć przez bezpośrednie wywołanie API

### Opcja 2: Sprawdzanie przy logowaniu
**Zalety**:
- ✅ Proste
- ✅ Nie psuje istniejących funkcji

**Wady**:
- ❌ Sprawdza tylko raz przy logowaniu

### Opcja 3: Global Guard (NIE POLECAM)
**Zalety**:
- ✅ Najbezpieczniejsze

**Wady**:
- ❌ Wymaga oznaczenia WSZYSTKICH endpointów
- ❌ Łatwo coś zepsuć
- ❌ Już próbowaliśmy - nie działa

---

## 🚀 Plan Działania - Opcja 1 (Frontend Middleware)

### Krok 1: Utworzenie Middleware
```typescript
// frontend/middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Jeśli brak tokena, przekieruj do logowania
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Sprawdź subskrypcję
  const response = await fetch(`${API_URL}/api/billing/subscription/status`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();

  // Jeśli brak subskrypcji, przekieruj do checkout
  if (!data.hasActiveSubscription) {
    const url = request.nextUrl.clone();
    
    // Wyjątki - strony dostępne bez subskrypcji
    if (
      url.pathname.startsWith('/subscription') ||
      url.pathname.startsWith('/billing') ||
      url.pathname === '/settings/subscription'
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/subscription/checkout', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/bookings/:path*', '/customers/:path*'],
};
```

### Krok 2: Testowanie
1. Zaloguj się jako użytkownik BEZ subskrypcji
2. Spróbuj wejść na `/dashboard`
3. Powinno przekierować do `/subscription/checkout`

### Krok 3: Weryfikacja
1. Sprawdź czy użytkownik Z subskrypcją ma dostęp
2. Sprawdź czy strony billing są dostępne
3. Sprawdź czy nie ma błędów w konsoli

---

## 🧪 Testy Przed Wdrożeniem

### Test 1: Użytkownik BEZ subskrypcji
- [ ] Nie może wejść na `/dashboard`
- [ ] Nie może wejść na `/bookings`
- [ ] Nie może wejść na `/customers`
- [ ] MOŻE wejść na `/subscription/checkout`
- [ ] MOŻE wejść na `/billing`

### Test 2: Użytkownik Z subskrypcją
- [ ] Może wejść na `/dashboard`
- [ ] Może wejść na `/bookings`
- [ ] Może wejść na `/customers`
- [ ] Wszystkie dane się wyświetlają

### Test 3: Użytkownik w TRIAL
- [ ] Może wejść na wszystkie strony
- [ ] Widzi banner z pozostałymi dniami
- [ ] Po zakończeniu trial - blokada

---

## 🔧 Implementacja Krok po Kroku

### KROK 1: Sprawdzenie czy endpoint status działa
```bash
curl https://api.rezerwacja24.pl/api/billing/subscription/status \
  -H "x-tenant-id: 1701364800000"
```

### KROK 2: Utworzenie middleware
- Plik: `/frontend/middleware.ts`
- Kod: (jak wyżej)

### KROK 3: Restart frontendu
```bash
pm2 restart rezerwacja24-frontend
```

### KROK 4: Test
- Otwórz przeglądarkę
- Sprawdź czy działa
- Sprawdź logi: `pm2 logs rezerwacja24-frontend`

---

## ⚠️ Plan Awaryjny

Jeśli coś się zepsuje:

### Szybkie Wyłączenie
1. Usuń plik `middleware.ts`
2. Restart frontendu: `pm2 restart rezerwacja24-frontend`
3. System wraca do normalnego działania

### Rollback
```bash
cd /root/CascadeProjects/rezerwacja24-saas/frontend
rm middleware.ts
pm2 restart rezerwacja24-frontend
```

---

## 📊 Monitoring

### Co Sprawdzać
1. Logi frontendu: `pm2 logs rezerwacja24-frontend`
2. Logi backendu: `pm2 logs rezerwacja24-backend`
3. Konsola przeglądarki (F12)
4. Network tab - czy są błędy 401/403

---

## ✅ Checklist Przed Startem

- [ ] Backend działa
- [ ] Frontend działa
- [ ] Panel biznesowy pokazuje dane
- [ ] Endpoint `/api/billing/subscription/status` działa
- [ ] Mam plan awaryjny
- [ ] Wiem jak szybko wyłączyć

---

**Status**: Gotowy do implementacji  
**Czas**: ~10 minut  
**Ryzyko**: NISKIE (łatwy rollback)
