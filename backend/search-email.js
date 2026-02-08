const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = 'katarzynaszczypkowska64@gmail.com';

async function main() {
  console.log(`Szukam: ${email}\n`);
  
  // Sprawdź tenants
  const tenant = await prisma.tenants.findFirst({
    where: { email: { contains: 'katarzyna', mode: 'insensitive' } }
  });
  if (tenant) console.log('TENANTS:', JSON.stringify(tenant, null, 2));
  
  // Sprawdź users
  const user = await prisma.users.findFirst({
    where: { email: { contains: 'katarzyna', mode: 'insensitive' } }
  });
  if (user) console.log('USERS:', JSON.stringify(user, null, 2));
  
  // Sprawdź customers
  const customer = await prisma.customers.findFirst({
    where: { email: { contains: 'katarzyna', mode: 'insensitive' } }
  });
  if (customer) console.log('CUSTOMERS:', JSON.stringify(customer, null, 2));
  
  // Lista wszystkich tabel
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  console.log('\nWszystkie tabele w bazie:', tables.map(t => t.table_name).join(', '));
}

main().catch(console.error).finally(() => prisma.$disconnect());
