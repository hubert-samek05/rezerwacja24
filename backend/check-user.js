const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Szukaj w tenants po email
  const tenant = await prisma.tenants.findFirst({
    where: { email: 'joannajatczaak1991@icloud.com' },
    include: {
      subscriptions: {
        include: {
          subscription_plans: true
        }
      }
    }
  });
  
  if (tenant) {
    console.log(JSON.stringify({
      email: tenant.email,
      businessName: tenant.businessName,
      subscription: tenant.subscriptions ? {
        status: tenant.subscriptions.status,
        trialEnd: tenant.subscriptions.trialEnd,
        currentPeriodEnd: tenant.subscriptions.currentPeriodEnd,
        planName: tenant.subscriptions.subscription_plans?.name
      } : null
    }, null, 2));
  } else {
    console.log('Tenant not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
