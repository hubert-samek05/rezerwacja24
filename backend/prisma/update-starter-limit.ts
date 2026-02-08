import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 🔒 BEZPIECZNY SKRYPT - Aktualizuje limit rezerwacji w planie Starter z 50 na 100
 * 
 * Ten skrypt:
 * - NIE usuwa żadnych danych
 * - NIE zmienia subskrypcji użytkowników
 * - Tylko aktualizuje features.bookings w planie Starter
 */

async function main() {
  console.log('🔄 Aktualizacja limitu rezerwacji w planie Starter...');
  console.log('');

  // 1. Znajdź plan Starter
  const starterPlan = await prisma.subscription_plans.findFirst({
    where: { slug: 'starter' }
  });

  if (!starterPlan) {
    console.log('⚠️  Plan Starter nie istnieje w bazie danych.');
    console.log('   Uruchom najpierw: npx ts-node prisma/add-new-plans.ts');
    return;
  }

  console.log(`📋 Znaleziono plan: ${starterPlan.name} (ID: ${starterPlan.id})`);
  
  const currentFeatures = starterPlan.features as any;
  console.log(`   Aktualny limit rezerwacji: ${currentFeatures.bookings}`);

  // 2. Sprawdź czy już jest 100
  if (currentFeatures.bookings === 100) {
    console.log('✅ Limit już wynosi 100 - nic do zmiany.');
    return;
  }

  // 3. Zaktualizuj limit
  const updatedFeatures = {
    ...currentFeatures,
    bookings: 100,  // Zmiana z 50 na 100
  };

  await prisma.subscription_plans.update({
    where: { id: starterPlan.id },
    data: {
      features: updatedFeatures,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Zaktualizowano limit rezerwacji: 50 → 100`);
  console.log('');

  // 4. Sprawdź użytkowników na planie Starter
  const starterSubscriptions = await prisma.subscriptions.findMany({
    where: { planId: starterPlan.id },
    include: { tenants: true }
  });

  console.log(`👥 Użytkowników na planie Starter: ${starterSubscriptions.length}`);
  if (starterSubscriptions.length > 0) {
    console.log('   Ich nowy limit rezerwacji to teraz 100/miesiąc.');
    starterSubscriptions.forEach(s => {
      console.log(`   - Tenant: ${s.tenants?.name || s.tenantId} (${s.status})`);
    });
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ GOTOWE! Limit rezerwacji w planie Starter zmieniony na 100.');
  console.log('');
  console.log('⚠️  WAŻNE: Istniejący użytkownicy automatycznie mają nowy limit.');
  console.log('   Ich dotychczasowe rezerwacje NIE zostały zmienione.');
  console.log('═══════════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Błąd:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
