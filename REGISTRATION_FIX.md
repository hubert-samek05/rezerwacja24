# ✅ Naprawa Rejestracji - Prawdziwe Konta

**Data**: 2024-12-10 22:35  
**Problem**: Rejestracja tworzyła konta w localStorage zamiast prawdziwej bazie danych

---

## 🐛 Problem

### Przed:
```typescript
// Frontend używał localStorage
const users = JSON.parse(localStorage.getItem('rezerwacja24_users') || '[]')
users.push(newUser)
localStorage.setItem('rezerwacja24_users', JSON.stringify(users))
```

**Skutek**:
- ❌ Konta tylko w przeglądarce (nie w bazie)
- ❌ Brak prawdziwego tenanta
- ❌ Brak subskrypcji trial
- ❌ Przekierowanie do konta demo

---

## ✅ Rozwiązanie

### 1. Backend - Endpoint `/auth/register`

**Plik**: `backend/src/auth/auth.service.ts`

```typescript
async register(data: {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  password: string;
}) {
  // 1. Sprawdź czy email istnieje
  const existingUser = await this.prisma.users.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictException('Użytkownik już istnieje');
  }

  // 2. Hashuj hasło
  const passwordHash = await bcrypt.hash(data.password, 10);

  // 3. Utwórz subdomenę
  const subdomain = data.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

  // 4. Transakcja: User + Tenant + TenantUser + Subscription
  const result = await this.prisma.$transaction(async (prisma) => {
    // Utwórz użytkownika
    const user = await prisma.users.create({...});

    // Utwórz tenant (firmę)
    const tenant = await prisma.tenants.create({...});

    // Połącz user <-> tenant
    await prisma.tenant_users.create({...});

    // Utwórz subskrypcję TRIAL (7 dni)
    await prisma.subscriptions.create({
      status: 'TRIALING',
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ...
    });

    return { user, tenant };
  });

  // 5. Zwróć JWT token
  return {
    access_token: this.jwtService.sign({...}),
    user: {...},
  };
}
```

### 2. Frontend - Użycie API

**Plik**: `frontend/app/register/page.tsx`

```typescript
// Przed (localStorage):
const newUser = { id: Date.now(), ... }
users.push(newUser)
localStorage.setItem('rezerwacja24_users', JSON.stringify(users))

// Po (prawdziwe API):
const response = await authApi.register({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  businessName: formData.businessName,
  password: formData.password,
})

// Zapisz token
localStorage.setItem('token', response.access_token)
localStorage.setItem('user', JSON.stringify(response.user))

// Redirect do dashboardu
router.push('/dashboard')
```

---

## 📊 Co Się Dzieje Przy Rejestracji

### Krok po Kroku:

```
1. Użytkownik wypełnia formularz
   ↓
2. Frontend → POST /api/auth/register
   ↓
3. Backend sprawdza czy email istnieje
   ↓
4. Backend hashuje hasło (bcrypt)
   ↓
5. Backend tworzy subdomenę z nazwy firmy
   ↓
6. Backend uruchamia transakcję:
   ├─ Tworzy rekord w `users`
   ├─ Tworzy rekord w `tenants`
   ├─ Tworzy rekord w `tenant_users`
   └─ Tworzy rekord w `subscriptions` (TRIAL 7 dni)
   ↓
7. Backend generuje JWT token
   ↓
8. Frontend zapisuje token w localStorage
   ↓
9. Redirect do /dashboard
   ↓
10. ✅ Użytkownik ma prawdziwe konto z 7-dniowym trial!
```

---

## 🎯 Rezultat

### Teraz przy rejestracji:

✅ **Prawdziwy użytkownik** w bazie `users`  
✅ **Prawdziwy tenant** w bazie `tenants`  
✅ **Subskrypcja TRIAL** (7 dni) w bazie `subscriptions`  
✅ **Subdomena** generowana z nazwy firmy  
✅ **JWT token** do autoryzacji  
✅ **Hasło zahashowane** (bcrypt)  

### Dane w bazie:

```sql
-- users
id: user-1733865600000-abc123
email: jan@example.com
passwordHash: $2b$10$...
firstName: Jan
lastName: Kowalski
role: TENANT_OWNER

-- tenants
id: tenant-1733865600000-xyz789
name: Moja Firma
subdomain: moja-firma-1733865600
email: jan@example.com
ownerId: user-1733865600000-abc123
isSuspended: false

-- subscriptions
id: sub-1733865600000-def456
tenantId: tenant-1733865600000-xyz789
status: TRIALING
trialStart: 2024-12-10 22:00:00
trialEnd: 2024-12-17 22:00:00  ← 7 dni!
```

---

## 🧪 Jak Przetestować

### Test 1: Nowa Rejestracja
```
1. Idź na https://rezerwacja24.pl/register
2. Wypełnij formularz:
   - Imię: Jan
   - Nazwisko: Kowalski
   - Email: test@example.com
   - Firma: Test Firma
   - Hasło: test1234
3. Kliknij "Utwórz konto"
4. ✅ Powinien pojawić się toast: "Konto utworzone! Witamy w Rezerwacja24! 🎉"
5. ✅ Redirect do /dashboard
6. ✅ W bazie powinny być nowe rekordy
```

### Test 2: Duplikat Email
```
1. Spróbuj zarejestrować się z tym samym emailem
2. ❌ Powinien pojawić się błąd: "Użytkownik z tym adresem email już istnieje"
```

### Test 3: Sprawdź Bazę
```sql
SELECT 
  u.email,
  u.firstName,
  u.lastName,
  t.name as businessName,
  t.subdomain,
  s.status,
  s.trialEnd
FROM users u
JOIN tenant_users tu ON tu.userId = u.id
JOIN tenants t ON t.id = tu.tenantId
LEFT JOIN subscriptions s ON s.tenantId = t.id
WHERE u.email = 'test@example.com';
```

---

## 📝 Zmienione Pliki

### Backend:
- ✅ `src/auth/auth.service.ts` - dodano metodę `register()`
- ✅ `src/auth/auth.controller.ts` - dodano endpoint `POST /auth/register`

### Frontend:
- ✅ `lib/api/auth.ts` - NOWY plik z API client
- ✅ `app/register/page.tsx` - zmiana z localStorage na API

---

## 🚀 Następne Kroki

Teraz gdy mamy prawdziwą rejestrację, możemy:

1. ✅ Dodać Trial Countdown (odliczanie 7 dni)
2. ✅ Dodać Stripe Checkout (płatność po trial)
3. ✅ Dodać blokadę dostępu po wygaśnięciu
4. ✅ Dodać email powitalny
5. ✅ Dodać weryfikację email

---

**Status**: ✅ NAPRAWIONE  
**Data**: 2024-12-10 22:35
