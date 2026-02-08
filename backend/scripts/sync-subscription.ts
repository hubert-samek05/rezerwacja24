import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function syncSubscription(email: string) {
  console.log(`🔄 Synchronizacja subskrypcji dla: ${email}`);

  // Znajdź tenant po email
  const tenant = await prisma.tenants.findFirst({
    where: { email },
  });

  if (!tenant) {
    console.error(`❌ Nie znaleziono tenanta: ${email}`);
    return;
  }

  console.log(`✅ Znaleziono tenant: ${tenant.id}, nazwa: ${tenant.name}`);

  // Znajdź klienta w Stripe
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length === 0) {
    console.error(`❌ Brak klienta w Stripe dla: ${email}`);
    return;
  }

  const customer = customers.data[0];
  console.log(`✅ Znaleziono klienta Stripe: ${customer.id}`);

  // Pobierz subskrypcje
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: 'all',
    limit: 5,
  });

  console.log(`📋 Znaleziono ${subscriptions.data.length} subskrypcji w Stripe`);

  if (subscriptions.data.length === 0) {
    console.error(`❌ Brak subskrypcji w Stripe`);
    return;
  }

  // Weź najnowszą aktywną subskrypcję
  const activeSubscription = subscriptions.data.find(s => 
    s.status === 'active' || s.status === 'trialing'
  ) || subscriptions.data[0];

  console.log(`📌 Używam subskrypcji: ${activeSubscription.id}, status: ${activeSubscription.status}`);

  const planId = activeSubscription.metadata?.planId || 'professional';

  // Sprawdź czy plan istnieje
  let plan = await prisma.subscription_plans.findFirst({
    where: { id: planId },
  });

  if (!plan) {
    plan = await prisma.subscription_plans.findFirst({
      where: { isActive: true },
    });
  }

  if (!plan) {
    console.error(`❌ Brak aktywnego planu w bazie`);
    return;
  }

  console.log(`📋 Plan: ${plan.id} - ${plan.name}`);

  const trialEnd = activeSubscription.trial_end
    ? new Date(activeSubscription.trial_end * 1000)
    : null;

  const trialStart = activeSubscription.trial_start
    ? new Date(activeSubscription.trial_start * 1000)
    : null;

  let status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'INCOMPLETE' = 'ACTIVE';
  switch (activeSubscription.status) {
    case 'active': status = 'ACTIVE'; break;
    case 'trialing': status = 'TRIALING'; break;
    case 'past_due': status = 'PAST_DUE'; break;
    case 'canceled': status = 'CANCELLED'; break;
    case 'incomplete': status = 'INCOMPLETE'; break;
  }

  // Upsert subskrypcji
  const subscription = await prisma.subscriptions.upsert({
    where: { tenantId: tenant.id },
    create: {
      id: `sub_${Date.now()}`,
      tenantId: tenant.id,
      planId: plan.id,
      status,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: activeSubscription.id,
      stripePaymentMethodId: activeSubscription.default_payment_method as string,
      currentPeriodStart: new Date(activeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
      trialStart,
      trialEnd,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      planId: plan.id,
      status,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: activeSubscription.id,
      stripePaymentMethodId: activeSubscription.default_payment_method as string,
      currentPeriodStart: new Date(activeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
      trialStart,
      trialEnd,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Zsynchronizowano subskrypcję:`);
  console.log(`   ID: ${subscription.id}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Stripe Sub ID: ${subscription.stripeSubscriptionId}`);
  console.log(`   Okres: ${subscription.currentPeriodStart?.toISOString()} - ${subscription.currentPeriodEnd?.toISOString()}`);

  // Odblokuj tenant jeśli był zablokowany
  if (tenant.isSuspended) {
    await prisma.tenants.update({
      where: { id: tenant.id },
      data: {
        isSuspended: false,
        suspendedReason: null,
      },
    });
    console.log(`✅ Odblokowano konto tenanta`);
  }

  console.log(`\n🎉 Synchronizacja zakończona pomyślnie!`);
}

const email = process.argv[2] || 'hubert.mateusz2000@gmail.com';
syncSubscription(email)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
