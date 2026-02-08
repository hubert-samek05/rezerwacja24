import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seedowanie planów subskrypcji:
 * - Starter: 12.99 PLN
 * - Pro: 29.99 PLN
 * - Premium: 79.99 PLN
 */

async function main() {
  console.log('🌱 Seedowanie planów subskrypcji...\n');

  // Definicje planów zgodnie z wymaganiami
  const plans = [
    {
      id: 'plan_starter',
      name: 'Starter',
      slug: 'starter',
      priceMonthly: 12.99,
      currency: 'PLN',
      stripePriceId: 'price_starter_1299',
      stripeProductId: 'prod_starter',
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
        subdomain: true,
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
      id: 'plan_pro',
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 29.99,
      currency: 'PLN',
      stripePriceId: 'price_pro_2999',
      stripeProductId: 'prod_pro',
      trialDays: 7,
      requiresPaymentMethod: true,
      features: {
        // Limity
        bookings: -1,        // bez limitu
        employees: 5,        // 5 pracowników
        sms: 100,            // 100 SMS/miesiąc
        // Funkcje
        googleCalendar: true,
        iosCalendar: true,
        analytics: true,
        automations: false,
        whiteLabel: false,
        subdomain: true,
        apiAccess: false,
        prioritySupportChat: false,
        mobileApp: false,
        // Metadata
        tier: 2,
        displayOrder: 2,
        isHighlighted: true,  // WYRÓŻNIONY - najpopularniejszy
      },
      isActive: true,
    },
    {
      id: 'plan_premium',
      name: 'Premium',
      slug: 'premium',
      priceMonthly: 79.99,
      currency: 'PLN',
      stripePriceId: 'price_1ScucgG1gOZznL0iT9QfumRR', // Istniejący Stripe Price ID
      stripeProductId: 'prod_Ta4mMEWepkV5Us',          // Istniejący Stripe Product ID
      trialDays: 7,
      requiresPaymentMethod: true,
      features: {
        // Limity
        bookings: -1,        // bez limitu
        employees: -1,       // bez limitu
        sms: 500,            // 500 SMS/miesiąc
        // Funkcje
        googleCalendar: true,
        iosCalendar: true,
        analytics: true,
        automations: true,
        whiteLabel: true,
        subdomain: true,
        apiAccess: true,
        prioritySupportChat: true,
        mobileApp: 'coming_soon',
        // Metadata
        tier: 3,
        displayOrder: 3,
        isHighlighted: false,
      },
      isActive: true,
    },
  ];

  // Usuń stare plany (opcjonalnie - zachowaj jeśli mają subskrypcje)
  console.log('📋 Sprawdzam istniejące plany...');
  const existingPlans = await prisma.subscription_plans.findMany();
  console.log(`   Znaleziono ${existingPlans.length} istniejących planów`);

  // Sprawdź czy są aktywne subskrypcje
  const activeSubscriptions = await prisma.subscriptions.findMany({
    include: { subscription_plans: true }
  });
  console.log(`   Aktywnych subskrypcji: ${activeSubscriptions.length}`);

  // Upsert planów
  for (const plan of plans) {
    console.log(`\n➕ Przetwarzam plan: ${plan.name} (${plan.priceMonthly} PLN)...`);
    
    try {
      await prisma.subscription_plans.upsert({
        where: { id: plan.id },
        update: {
          name: plan.name,
          slug: plan.slug,
          priceMonthly: plan.priceMonthly,
          currency: plan.currency,
          stripePriceId: plan.stripePriceId,
          stripeProductId: plan.stripeProductId,
          trialDays: plan.trialDays,
          requiresPaymentMethod: plan.requiresPaymentMethod,
          features: plan.features,
          isActive: plan.isActive,
          updatedAt: new Date(),
        },
        create: {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          priceMonthly: plan.priceMonthly,
          currency: plan.currency,
          stripePriceId: plan.stripePriceId,
          stripeProductId: plan.stripeProductId,
          trialDays: plan.trialDays,
          requiresPaymentMethod: plan.requiresPaymentMethod,
          features: plan.features,
          isActive: plan.isActive,
          updatedAt: new Date(),
        },
      });
      console.log(`   ✅ ${plan.name} - OK`);
    } catch (error: any) {
      // Jeśli błąd unique constraint, spróbuj zaktualizować po slug
      if (error.code === 'P2002') {
        console.log(`   ⚠️  Konflikt - aktualizuję istniejący plan...`);
        await prisma.subscription_plans.updateMany({
          where: { slug: plan.slug },
          data: {
            name: plan.name,
            priceMonthly: plan.priceMonthly,
            currency: plan.currency,
            features: plan.features,
            isActive: plan.isActive,
            updatedAt: new Date(),
          },
        });
        console.log(`   ✅ ${plan.name} - zaktualizowano`);
      } else {
        throw error;
      }
    }
  }

  // Dezaktywuj stary plan "Plan Pro" jeśli istnieje
  const oldPlan = await prisma.subscription_plans.findFirst({
    where: { id: 'plan_pro_7999' }
  });
  
  if (oldPlan) {
    console.log('\n🔄 Migruję subskrypcje ze starego planu "Plan Pro" na nowy "Premium"...');
    
    // Znajdź nowy plan Premium
    const premiumPlan = await prisma.subscription_plans.findFirst({
      where: { slug: 'premium' }
    });
    
    if (premiumPlan) {
      // Przenieś subskrypcje na nowy plan Premium
      const updated = await prisma.subscriptions.updateMany({
        where: { planId: 'plan_pro_7999' },
        data: { planId: premiumPlan.id }
      });
      console.log(`   ✅ Przeniesiono ${updated.count} subskrypcji na plan Premium`);
      
      // Dezaktywuj stary plan
      await prisma.subscription_plans.update({
        where: { id: 'plan_pro_7999' },
        data: { isActive: false }
      });
      console.log('   ✅ Stary plan "Plan Pro" został dezaktywowany');
    }
  }

  // Podsumowanie
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ GOTOWE! Plany zostały skonfigurowane.\n');
  
  const allPlans = await prisma.subscription_plans.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' }
  });
  
  console.log('📋 Aktywne plany:');
  allPlans.forEach(p => {
    const features = p.features as any;
    const highlighted = features.isHighlighted ? ' ⭐ NAJPOPULARNIEJSZY' : '';
    console.log(`   ${p.name} - ${p.priceMonthly} PLN/mies.${highlighted}`);
    console.log(`      Rezerwacje: ${features.bookings === -1 ? '∞' : features.bookings}/mies`);
    console.log(`      Pracownicy: ${features.employees === -1 ? '∞' : features.employees}`);
    console.log(`      SMS: ${features.sms}/mies`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Błąd:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
