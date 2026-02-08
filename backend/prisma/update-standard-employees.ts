import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 🔒 BEZPIECZNY SKRYPT - Aktualizuje limit pracowników w planie Standard z 3 na 5
 */

async function main() {
  console.log('🔄 Aktualizacja limitu pracowników w planie Standard...');
  console.log('');

  // 1. Znajdź plan Standard
  const standardPlan = await prisma.subscription_plans.findFirst({
    where: { slug: 'standard' }
  });

  if (!standardPlan) {
    console.log('⚠️  Plan Standard nie istnieje w bazie danych.');
    return;
  }

  console.log(`📋 Znaleziono plan: ${standardPlan.name} (ID: ${standardPlan.id})`);
  
  const currentFeatures = standardPlan.features as any;
  console.log(`   Aktualny limit pracowników: ${currentFeatures.employees}`);

  // 2. Sprawdź czy już jest 5
  if (currentFeatures.employees === 5) {
    console.log('✅ Limit już wynosi 5 - nic do zmiany.');
    return;
  }

  // 3. Zaktualizuj limit
  const updatedFeatures = {
    ...currentFeatures,
    employees: 5,  // Zmiana z 3 na 5
  };

  await prisma.subscription_plans.update({
    where: { id: standardPlan.id },
    data: {
      features: updatedFeatures,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Zaktualizowano limit pracowników: ${currentFeatures.employees} → 5`);
  console.log('');

  // 4. Sprawdź użytkowników na planie Standard
  const standardSubscriptions = await prisma.subscriptions.findMany({
    where: { planId: standardPlan.id },
    include: { tenants: true }
  });

  console.log(`👥 Użytkowników na planie Standard: ${standardSubscriptions.length}`);
  if (standardSubscriptions.length > 0) {
    console.log('   Ich nowy limit pracowników to teraz 5.');
  }

  console.log('');
  console.log('✅ GOTOWE!');
}

main()
  .catch((e) => {
    console.error('❌ Błąd:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
