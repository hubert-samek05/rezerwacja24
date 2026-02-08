const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function checkSubscriptions() {
  try {
    console.log('🔍 Sprawdzam subskrypcje...\n');
    
    const subscriptions = await prisma.subscriptions.findMany({
      include: {
        tenants: {
          select: {
            name: true,
            subdomain: true
          }
        },
        subscription_plans: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });
    
    console.log(`📊 Znaleziono ${subscriptions.length} subskrypcji\n`);
    
    for (const sub of subscriptions) {
      const now = new Date();
      const trialDaysLeft = sub.trialEnd ? Math.ceil((sub.trialEnd - now) / (1000 * 60 * 60 * 24)) : 0;
      
      console.log(`\n📦 ${sub.tenants.name} (${sub.tenants.subdomain})`);
      console.log(`   Plan: ${sub.subscription_plans.name}`);
      console.log(`   Status: ${sub.status}`);
      
      if (sub.trialStart && sub.trialEnd) {
        console.log(`   Trial: ${sub.trialStart.toISOString().split('T')[0]} → ${sub.trialEnd.toISOString().split('T')[0]}`);
        console.log(`   Dni pozostałe: ${trialDaysLeft > 0 ? trialDaysLeft : 'Zakończony'}`);
      }
      
      console.log(`   Okres: ${sub.currentPeriodStart.toISOString().split('T')[0]} → ${sub.currentPeriodEnd.toISOString().split('T')[0]}`);
      console.log(`   Stripe Customer: ${sub.stripeCustomerId}`);
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptions();
