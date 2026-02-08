import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 🔒 BEZPIECZNY SKRYPT - Dodaje nowe plany BEZ usuwania istniejących
 * 
 * Plany:
 * - Starter (12.99 PLN) - 100 rezerwacji, 0 SMS, 1 pracownik
 * - Standard (29.99 PLN) - unlimited rezerwacji, 100 SMS, 5 pracowników  
 * - Pro (79.99 PLN) - unlimited, 500 SMS, unlimited pracowników [WYRÓŻNIONY]
 */

async function main() {
  console.log('🌱 Dodawanie nowych planów subskrypcji (BEZPIECZNIE)...');
  console.log('');

  // 1. Sprawdź istniejące plany
  const existingPlans = await prisma.subscription_plans.findMany();
  console.log(`📋 Znaleziono ${existingPlans.length} istniejących planów:`);
  existingPlans.forEach(p => console.log(`   - ${p.name} (${p.slug}): ${p.priceMonthly} PLN`));
  console.log('');

  // 2. Sprawdź ilu użytkowników ma subskrypcje
  const subscriptions = await prisma.subscriptions.findMany({
    include: { subscription_plans: true }
  });
  console.log(`👥 Aktywnych subskrypcji: ${subscriptions.length}`);
  subscriptions.forEach(s => {
    console.log(`   - Tenant ${s.tenantId}: ${s.subscription_plans?.name} (${s.status})`);
  });
  console.log('');

  // 3. Definicje nowych planów
  const newPlans = [
    {
      id: 'plan_starter_1299',
      name: 'Starter',
      slug: 'starter',
      priceMonthly: 12.99,
      currency: 'PLN',
      stripePriceId: 'price_1SlqFAG1gOZznL0iVnnbRVXC',
      stripeProductId: 'prod_TjIq33XAQHqbeb',
      trialDays: 7,
      requiresPaymentMethod: true,
      features: {
        // Limity
        bookings: 100,       // 100 rezerwacji/miesiąc
        employees: 1,        // 1 pracownik
        sms: 0,              // brak SMS
        // Funkcje
        googleCalendar: false,
        iosCalendar: false,
        analytics: false,
        automations: false,
        whiteLabel: false,
        subdomain: true,     // subdomena tak
        apiAccess: false,
        prioritySupportChat: false,
        mobileApp: false,
        // Metadata
        tier: 1,
        displayOrder: 1,
        isHighlighted: false,
      },
      isActive: true,
    },
    {
      id: 'plan_standard_2999',
      name: 'Standard',
      slug: 'standard',
      priceMonthly: 29.99,
      currency: 'PLN',
      stripePriceId: 'price_1SlqFUG1gOZznL0iPfmhXZAM',
      stripeProductId: 'prod_TjIr04HwmcQDXE',
      trialDays: 7,
      requiresPaymentMethod: true,
      features: {
        // Limity
        bookings: 200,       // 200 rezerwacji/miesiąc
        employees: 5,        // 5 pracowników
        sms: 100,            // 100 SMS/miesiąc
        // Funkcje
        googleCalendar: true,
        iosCalendar: true,
        analytics: true,     // podstawowa analityka
        automations: false,
        whiteLabel: false,
        subdomain: true,
        apiAccess: false,
        prioritySupportChat: false,
        mobileApp: false,
        // Metadata
        tier: 2,
        displayOrder: 2,
        isHighlighted: false,
      },
      isActive: true,
    },
  ];

  // 4. Dodaj nowe plany (upsert - nie usunie istniejących)
  for (const plan of newPlans) {
    const existing = await prisma.subscription_plans.findUnique({
      where: { id: plan.id }
    });

    if (existing) {
      console.log(`⚠️  Plan ${plan.name} już istnieje - aktualizuję...`);
      await prisma.subscription_plans.update({
        where: { id: plan.id },
        data: {
          ...plan,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Zaktualizowano: ${plan.name}`);
    } else {
      console.log(`➕ Dodaję nowy plan: ${plan.name}...`);
      await prisma.subscription_plans.create({
        data: {
          ...plan,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Utworzono: ${plan.name}`);
    }
  }

  // 5. Zaktualizuj plan Pro - dodaj metadata (tier, displayOrder, isHighlighted)
  const proPlan = await prisma.subscription_plans.findFirst({
    where: { slug: 'pro' }
  });

  if (proPlan) {
    console.log('');
    console.log(`🔄 Aktualizuję plan Pro (dodaję metadata wyróżnienia)...`);
    
    const currentFeatures = proPlan.features as any;
    const updatedFeatures = {
      ...currentFeatures,
      tier: 3,
      displayOrder: 3,
      isHighlighted: true,  // WYRÓŻNIONY PLAN
    };

    await prisma.subscription_plans.update({
      where: { id: proPlan.id },
      data: {
        features: updatedFeatures,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Plan Pro zaktualizowany jako WYRÓŻNIONY`);
  }

  // 6. Podsumowanie
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ GOTOWE! Nowe plany zostały dodane.');
  console.log('');
  
  const allPlans = await prisma.subscription_plans.findMany({
    orderBy: { priceMonthly: 'asc' }
  });
  
  console.log('📋 Wszystkie plany:');
  allPlans.forEach(p => {
    const features = p.features as any;
    const highlighted = features.isHighlighted ? ' ⭐ WYRÓŻNIONY' : '';
    console.log(`   ${p.name} - ${p.priceMonthly} PLN/mies${highlighted}`);
    console.log(`      Rezerwacje: ${features.bookings === -1 ? '∞' : features.bookings}/mies`);
    console.log(`      Pracownicy: ${features.employees === -1 ? '∞' : features.employees}`);
    console.log(`      SMS: ${features.sms}/mies`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('⚠️  WAŻNE: Istniejący użytkownicy NIE zostali zmienieni!');
  console.log('   Ich subskrypcje pozostają na planie Pro.');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Błąd:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
