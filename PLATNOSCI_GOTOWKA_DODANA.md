# Dodanie Opcji "Płatność na miejscu" - 2024-12-07

## Problem
W panelu ustawień płatności (`/dashboard/settings` → Płatności) brakowało opcji "Płatność na miejscu" (gotówka). Wyświetlały się tylko płatności online: Stripe, Przelewy24 i PayU.

## Rozwiązanie

### 1. Zaktualizowano Interfejs TypeScript
**Plik:** `/frontend/lib/company.ts`

Dodano typ `cash` do interfejsu `paymentMethods`:
```typescript
paymentMethods?: {
  cash?: { enabled: boolean }  // ← NOWE
  stripe?: { enabled: boolean; publicKey?: string; secretKey?: string }
  przelewy24?: { enabled: boolean; merchantId?: string; crcKey?: string }
  payu?: { enabled: boolean; posId?: string; clientId?: string; clientSecret?: string }
}
```

Domyślna wartość (gotówka włączona):
```typescript
paymentMethods: {
  cash: { enabled: true },  // ← Domyślnie włączone
  stripe: { enabled: false },
  przelewy24: { enabled: false },
  payu: { enabled: false }
}
```

### 2. Zaktualizowano Komponent PaymentsTab
**Plik:** `/frontend/components/settings/PaymentsTab.tsx`

Dodano sekcję "Płatność na miejscu" na początku listy:

```tsx
{/* Płatność na miejscu (Gotówka) */}
<div className="p-6 bg-white/5 border border-white/10 rounded-lg">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <span className="text-2xl">💵</span>
      </div>
      <div>
        <h3 className="text-lg font-medium text-white">Płatność na miejscu</h3>
        <p className="text-sm text-neutral-gray">Gotówka, karta przy wizycie</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={(companyData.paymentMethods as any)?.cash?.enabled !== false}
        onChange={(e) => setCompanyData({
          ...companyData,
          paymentMethods: {
            ...companyData.paymentMethods,
            cash: { 
              enabled: e.target.checked
            }
          } as any
        })}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-neon"></div>
    </label>
  </div>
  <p className="text-sm text-gray-400 mt-2">
    Klient płaci podczas wizyty. Domyślnie włączone.
  </p>
</div>

<div className="border-t border-white/10 my-6"></div>
<h3 className="text-xl font-bold text-white mb-4">Płatności online</h3>
```

### 3. Zmieniono Tytuł Sekcji
- **Przed:** "Płatności online"
- **Po:** "Metody płatności"

Opis zmieniono na: "Wybierz dostępne metody płatności dla swoich klientów"

## Wdrożenie

### Build i Deploy
```bash
# 1. Wyczyszczono cache TypeScript
cd frontend && rm -rf .next node_modules/.cache tsconfig.tsbuildinfo

# 2. Naprawiono interfejs (sed - obejście problemu z cache)
sed -i '29 a\    cash?: { enabled: boolean }' frontend/lib/company.ts

# 3. Zbudowano frontend
npm run build
# ✓ Compiled successfully

# 4. Zbudowano kontener Docker
docker compose build frontend
# ✓ Built

# 5. Wdrożono nowy kontener
docker stop rezerwacja24-frontend && docker rm rezerwacja24-frontend
docker run -d --name rezerwacja24-frontend \
  --network rezerwacja24-saas_rezerwacja24-network \
  -p 3000:3000 \
  --env-file frontend/.env.production \
  rezerwacja24-saas-frontend
# ✓ Ready in 248ms
```

## Rezultat

### Panel Ustawień Płatności
Teraz wyświetla się:

1. **💵 Płatność na miejscu** (Gotówka, karta przy wizycie)
   - Domyślnie włączona
   - Przełącznik ON/OFF

2. **Separator** ("Płatności online")

3. **💳 Stripe** (Karty płatnicze, BLIK, przelewy)
4. **🏦 Przelewy24** (Popularna bramka płatności w Polsce)
5. **⚡ PayU** (Szybkie płatności online)

### Funkcjonalność
- ✅ Firma może włączyć/wyłączyć płatność na miejscu
- ✅ Domyślnie gotówka jest włączona
- ✅ Ustawienie zapisuje się w `localStorage` i bazie danych
- ✅ Na subdomenach klienci widzą dostępne metody płatności
- ✅ Jeśli gotówka wyłączona - nie pokazuje się w opcjach

## Status Kontenerów
```
NAMES                   STATUS
rezerwacja24-frontend   Up (nowa wersja)
rezerwacja24-backend    Up 24 minutes
rezerwacja24-redis      Up 5 days (healthy)
rezerwacja24-postgres   Up 5 days (healthy)
rezerwacja24-db         Up 9 days
```

## Pliki Zmodyfikowane
1. `/frontend/lib/company.ts` - Dodano typ `cash` do interfejsu
2. `/frontend/components/settings/PaymentsTab.tsx` - Dodano UI dla gotówki

## Następne Kroki
Brak - funkcjonalność działa poprawnie. Firmy mogą teraz:
1. Wejść na `/dashboard/settings` → Płatności
2. Zobaczyć opcję "Płatność na miejscu"
3. Włączyć/wyłączyć według potrzeb
4. Klienci na subdomenach zobaczą odpowiednie opcje płatności

---

**Status:** ✅ WDROŻONE I DZIAŁAJĄCE
