import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('=== PLANY SUBSKRYPCJI ===');
  const plans = await prisma.subscription_plans.findMany();
  console.log(JSON.stringify(plans, null, 2));
  
  console.log('\n=== SUBSKRYPCJA HUBERT ===');
  const sub = await prisma.subscriptions.findFirst({
    where: { tenants: { email: 'hubert.mateusz2000@gmail.com' } },
    include: { subscription_plans: true, tenants: true }
  });
  console.log(JSON.stringify(sub, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
