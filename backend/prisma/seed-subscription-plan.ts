import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seedowanie planu subskrypcji...');

  // Usuń istniejące plany
  await prisma.subscription_plans.deleteMany({});

  // Utwórz plan Pro za 79.99 PLN/miesiąc
  const plan = await prisma.subscription_plans.create({
    data: {
      id: 'plan_pro_7999',
      name: 'Plan Pro',
      slug: 'pro',
      priceMonthly: 79.99,
      currency: 'PLN',
      stripePriceId: process.env.STRIPE_PRICE_ID || 'price_PLACEHOLDER',
      stripeProductId: process.env.STRIPE_PRODUCT_ID || 'prod_PLACEHOLDER',
      trialDays: 7,
      requiresPaymentMethod: true,
      features: {
        bookings: -1, // unlimited
        employees: -1, // unlimited
        sms: 500,
        googleCalendar: true,
        iosCalendar: true,
        analytics: true,
        automations: true,
        whiteLabel: true,
        subdomain: true,
        apiAccess: true,
        prioritySupportChat: true,
        mobileApp: 'coming_soon',
      },
      isActive: true,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Plan subskrypcji utworzony:', plan);
  console.log('');
  console.log('📝 Następne kroki:');
  console.log('1. Zaloguj się do Stripe Dashboard');
  console.log('2. Utwórz produkt "Rezerwacja24 Pro"');
  console.log('3. Dodaj cenę: 79.99 PLN/miesiąc z 7-dniowym okresem próbnym');
  console.log('4. Skopiuj Price ID i Product ID');
  console.log('5. Zaktualizuj zmienne środowiskowe:');
  console.log('   STRIPE_PRICE_ID=price_xxx');
  console.log('   STRIPE_PRODUCT_ID=prod_xxx');
  console.log('6. Uruchom ponownie seed: npm run prisma:seed');
}

main()
  .catch((e) => {
    console.error('❌ Błąd podczas seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
