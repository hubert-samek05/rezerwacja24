# 🛡️ JAK BEZPIECZNIE ROBIĆ ZMIANY - PROSTY PRZEWODNIK

## ✅ PRZED KAŻDĄ ZMIANĄ (5 minut):

### 1. Zrób backup (1 minuta)
```bash
cd /root/CascadeProjects/rezerwacja24-saas
tar -czf BACKUP-$(date +%Y%m%d-%H%M%S).tar.gz backend/src frontend/
```

### 2. Uruchom test bezpieczeństwa (2 minuty)
```bash
./test-security.sh
```

**Jeśli widzisz:**
- ✅ `🎉 WSZYSTKIE TESTY PRZESZŁY` = **MOŻESZ ROBIĆ ZMIANY**
- ❌ `❌ FAIL` = **NIE RÓB ZMIAN! SYSTEM NIEBEZPIECZNY!**

---

## 🔒 ZŁOTE ZASADY (ZAWSZE PAMIĘTAJ):

### 1️⃣ Każdy nowy endpoint MUSI mieć tenantId

**❌ ŹLE:**
```typescript
@Get()
findAll() {
  return this.service.findAll();  // ← BRAK tenantId!
}
```

**✅ DOBRZE:**
```typescript
@Get()
findAll(@Req() req: any) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    throw new BadRequestException('Tenant ID is required');
  }
  return this.service.findAll(tenantId);  // ← Jest tenantId!
}
```

### 2️⃣ Każdy serwis MUSI filtrować po tenantId

**❌ ŹLE:**
```typescript
async findAll() {
  return this.prisma.customers.findMany();  // ← ZWRACA WSZYSTKIE DANE!
}
```

**✅ DOBRZE:**
```typescript
async findAll(tenantId: string) {
  return this.prisma.customers.findMany({
    where: { tenantId }  // ← TYLKO DANE TEGO TENANTA!
  });
}
```

### 3️⃣ Dla bookings - filtruj przez relację

**❌ ŹLE:**
```typescript
async findAll(tenantId: string) {
  return this.prisma.bookings.findMany({
    where: { tenantId }  // ← NIE DZIAŁA! Bookings nie ma tenantId!
  });
}
```

**✅ DOBRZE:**
```typescript
async findAll(tenantId: string) {
  return this.prisma.bookings.findMany({
    where: {
      customers: {
        tenantId: tenantId  // ← FILTRUJ PRZEZ RELACJĘ!
      }
    }
  });
}
```

---

## 🧪 PO KAŻDEJ ZMIANIE (3 minuty):

### 1. Zbuduj backend
```bash
cd backend
npm run build
```

### 2. Restart
```bash
pm2 restart rezerwacja24-backend
```

### 3. URUCHOM TEST BEZPIECZEŃSTWA
```bash
cd /root/CascadeProjects/rezerwacja24-saas
./test-security.sh
```

**Jeśli test NIE PRZESZEDŁ:**
```bash
# NATYCHMIAST przywróć backup!
tar -xzf BACKUP-*.tar.gz
pm2 restart all
```

---

## 📋 CHECKLIST PRZED DEPLOYEM

Zaznacz każdy punkt:

- [ ] Backup utworzony
- [ ] Zmiany przetestowane lokalnie
- [ ] `./test-security.sh` przeszedł ✅
- [ ] Zalogowałem się na 2 różne konta i sprawdziłem że widzą różne dane
- [ ] Backend działa bez błędów (`pm2 logs`)
- [ ] Frontend działa bez błędów (Console w przeglądarce)

**Jeśli wszystko ✅ = MOŻESZ WDROŻYĆ!**

---

## 🆘 CO ROBIĆ GDY COŚ PÓJDZIE ŹLE?

### Scenariusz 1: Test bezpieczeństwa NIE PRZESZEDŁ
```bash
# 1. STOP wszystko
pm2 stop all

# 2. Przywróć ostatni backup
cd /root/CascadeProjects/rezerwacja24-saas
tar -xzf BACKUP-*.tar.gz

# 3. Restart
pm2 restart all

# 4. Sprawdź czy działa
./test-security.sh
```

### Scenariusz 2: Klienci widzą cudze dane
```bash
# 1. NATYCHMIAST zatrzymaj system
pm2 stop all

# 2. Przywróć backup
tar -xzf BACKUP-*.tar.gz

# 3. Restart
pm2 restart all

# 4. Powiadom klientów (jeśli był wyciek)
```

### Scenariusz 3: Backend nie startuje
```bash
# Sprawdź logi
pm2 logs rezerwacja24-backend --lines 50

# Jeśli błąd kompilacji:
cd backend
npm run build

# Jeśli błąd bazy danych:
# Sprawdź czy PostgreSQL działa na porcie 5434
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d rezerwacja24 -c "SELECT 1;"
```

---

## 🎯 NAJCZĘSTSZE BŁĘDY I JAK ICH UNIKAĆ

### ❌ Błąd 1: Zapomniałem o tenantId
**Objaw:** Wszyscy widzą te same dane

**Rozwiązanie:**
1. Sprawdź czy kontroler przekazuje `tenantId` do serwisu
2. Sprawdź czy serwis filtruje po `tenantId`
3. Uruchom `./test-security.sh`

### ❌ Błąd 2: Bookings zwraca wszystkie dane
**Objaw:** Widzę rezerwacje z innych firm

**Rozwiązanie:**
```typescript
// Zmień z:
where: { tenantId }

// Na:
where: {
  customers: {
    tenantId: tenantId
  }
}
```

### ❌ Błąd 3: Frontend pokazuje stare dane
**Objaw:** Po zalogowaniu widzę dane poprzedniego użytkownika

**Rozwiązanie:**
1. Sprawdź czy `login/page.tsx` czyści `localStorage.clear()`
2. Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
3. Restart frontendu: `pm2 restart rezerwacja24-frontend`

---

## 📞 KONTAKT W RAZIE PROBLEMU

**Jeśli coś nie działa:**
1. Sprawdź logi: `pm2 logs`
2. Uruchom test: `./test-security.sh`
3. Przywróć backup jeśli trzeba

**W razie poważnego problemu (wyciek danych):**
1. STOP system: `pm2 stop all`
2. Przywróć backup
3. Powiadom klientów
4. Zgłoś do UODO (72h)

---

## ✅ PODSUMOWANIE

**3 PROSTE KROKI przed każdą zmianą:**
1. **Backup** (1 min)
2. **Zmiana** (ile potrzebujesz)
3. **Test** (2 min) - `./test-security.sh`

**Jeśli test przeszedł ✅ = BEZPIECZNE!**
**Jeśli test NIE przeszedł ❌ = PRZYWRÓĆ BACKUP!**

---

**PAMIĘTAJ:** Lepiej stracić 5 minut na test niż miliony na pozew! 🔒
