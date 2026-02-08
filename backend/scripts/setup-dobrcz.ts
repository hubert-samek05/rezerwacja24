/**
 * Skrypt do konfiguracji firmy Gmina Dobrcz
 * - Aktualizacja nazwy firmy i subdomeny
 * - Ustawienie godzin otwarcia
 * - Dodanie usług: Świetlica 1, Świetlica 2
 * 
 * Uruchom: npx ts-node scripts/setup-dobrcz.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'tenant-1768806149751-jvmty8n4w';
  
  console.log('\n🔧 Konfiguracja firmy Gmina Dobrcz\n');

  // 1. Sprawdź czy tenant istnieje
  const tenant = await prisma.tenants.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    console.error('❌ Tenant nie istnieje!');
    return;
  }

  console.log(`✅ Znaleziono tenant: ${tenant.name} (${tenant.subdomain})`);

  // 2. Aktualizuj dane firmy
  const openingHours = {
    monday: { open: '07:30', close: '15:30', closed: false },
    tuesday: { open: '07:30', close: '17:00', closed: false },
    wednesday: { open: '07:30', close: '15:30', closed: false },
    thursday: { open: '07:30', close: '15:30', closed: false },
    friday: { open: '07:30', close: '14:00', closed: false },
    saturday: { closed: true },
    sunday: { closed: true }
  };

  const updatedTenant = await prisma.tenants.update({
    where: { id: tenantId },
    data: {
      name: 'Gmina Dobrcz',
      subdomain: 'gminadobrcz',
      openingHours: openingHours,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Zaktualizowano firmę:`);
  console.log(`   Nazwa: ${updatedTenant.name}`);
  console.log(`   Subdomena: ${updatedTenant.subdomain}`);
  console.log(`   URL: https://${updatedTenant.subdomain}.rezerwacja24.pl`);

  // 3. Dodaj usługi - Świetlica 1 i Świetlica 2
  const services = [
    {
      id: `service-swietlica1-${Date.now()}`,
      name: 'Świetlica 1',
      description: 'Rezerwacja świetlicy nr 1. Możliwość rezerwacji na godziny lub całe dni.',
      tenantId: tenantId,
      basePrice: 0,
      duration: 60, // domyślnie 1h
      bookingType: 'FLEXIBLE',
      flexibleDuration: true,
      minDuration: 60, // min 1h
      maxDuration: 1440, // max 24h (1 dzień)
      durationStep: 60, // krok 1h
      allowMultiDay: true,
      pricePerHour: 0,
      pricePerDay: 0,
      isActive: true,
      allowOnlineBooking: true,
      requiresApproval: false,
      maxCapacity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `service-swietlica2-${Date.now() + 1}`,
      name: 'Świetlica 2',
      description: 'Rezerwacja świetlicy nr 2. Możliwość rezerwacji na godziny lub całe dni.',
      tenantId: tenantId,
      basePrice: 0,
      duration: 60, // domyślnie 1h
      bookingType: 'FLEXIBLE',
      flexibleDuration: true,
      minDuration: 60, // min 1h
      maxDuration: 1440, // max 24h (1 dzień)
      durationStep: 60, // krok 1h
      allowMultiDay: true,
      pricePerHour: 0,
      pricePerDay: 0,
      isActive: true,
      allowOnlineBooking: true,
      requiresApproval: false,
      maxCapacity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const service of services) {
    const created = await prisma.services.create({
      data: service,
    });
    console.log(`✅ Utworzono usługę: ${created.name} (ID: ${created.id})`);
  }

  console.log('\n✅ Konfiguracja zakończona pomyślnie!\n');
  console.log('📌 Podsumowanie:');
  console.log(`   Firma: Gmina Dobrcz`);
  console.log(`   URL: https://gminadobrcz.rezerwacja24.pl`);
  console.log(`   Godziny otwarcia:`);
  console.log(`     Poniedziałek: 7:30 - 15:30`);
  console.log(`     Wtorek: 7:30 - 17:00`);
  console.log(`     Środa: 7:30 - 15:30`);
  console.log(`     Czwartek: 7:30 - 15:30`);
  console.log(`     Piątek: 7:30 - 14:00`);
  console.log(`     Sobota: Zamknięte`);
  console.log(`     Niedziela: Zamknięte`);
  console.log(`   Usługi:`);
  console.log(`     - Świetlica 1 (0 zł, elastyczne godziny/dni)`);
  console.log(`     - Świetlica 2 (0 zł, elastyczne godziny/dni)`);
}

main()
  .catch((e) => {
    console.error('❌ Błąd:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
