const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenants.findFirst({
    where: { email: 'katarzynaszczypkowska64@gmail.com' },
    include: {
      subscriptions: {
        include: {
          subscription_plans: true
        }
      }
    }
  });
  
  if (tenant) {
    console.log('=== ZNALEZIONO KONTO ===');
    console.log(JSON.stringify({
      id: tenant.id,
      email: tenant.email,
      businessName: tenant.businessName,
      subdomain: tenant.subdomain,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      subscription: tenant.subscriptions ? {
        status: tenant.subscriptions.status,
        trialEnd: tenant.subscriptions.trialEnd,
        currentPeriodEnd: tenant.subscriptions.currentPeriodEnd,
        planName: tenant.subscriptions.subscription_plans?.name
      } : null
    }, null, 2));
  } else {
    console.log('=== KONTO NIE ZNALEZIONE ===');
    console.log('Email katarzynaszczypkowska64@gmail.com nie istnieje w bazie danych.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
