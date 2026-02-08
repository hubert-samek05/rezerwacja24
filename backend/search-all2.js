const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const searches = ['katarzyna', 'szczypkowska', 'szczypkowsk'];
  
  for (const term of searches) {
    console.log(`\n=== Szukam: "${term}" ===`);
    
    const tenants = await prisma.tenants.findMany({
      where: { email: { contains: term, mode: 'insensitive' } }
    });
    if (tenants.length) console.log('TENANTS:', tenants.map(t => ({ id: t.id, email: t.email, businessName: t.businessName })));
    
    const users = await prisma.users.findMany({
      where: { email: { contains: term, mode: 'insensitive' } }
    });
    if (users.length) console.log('USERS:', users.map(u => ({ id: u.id, email: u.email })));
    
    const customers = await prisma.customers.findMany({
      where: { email: { contains: term, mode: 'insensitive' } }
    });
    if (customers.length) console.log('CUSTOMERS:', customers.map(c => ({ id: c.id, email: c.email })));
    
    const partners = await prisma.partners.findMany({
      where: { email: { contains: term, mode: 'insensitive' } }
    });
    if (partners.length) console.log('PARTNERS:', partners.map(p => ({ id: p.id, email: p.email })));
  }
  
  // Szukaj dokładnie tego emaila
  console.log('\n=== Szukam dokładnie: katarzynaszczypkowska64@gmail.com ===');
  const exact = await prisma.$queryRaw`
    SELECT 'tenants' as tbl, id, email FROM tenants WHERE LOWER(email) LIKE '%katarzyna%'
    UNION ALL
    SELECT 'users' as tbl, id, email FROM users WHERE LOWER(email) LIKE '%katarzyna%'
    UNION ALL
    SELECT 'customers' as tbl, id::text, email FROM customers WHERE LOWER(email) LIKE '%katarzyna%'
    UNION ALL
    SELECT 'partners' as tbl, id, email FROM partners WHERE LOWER(email) LIKE '%katarzyna%'
  `;
  console.log('Wyniki SQL:', exact);
  
  // Ostatnie 10 tenantów
  console.log('\n=== Ostatnich 10 zarejestrowanych kont ===');
  const recent = await prisma.tenants.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, email: true, businessName: true, createdAt: true }
  });
  recent.forEach(t => console.log(`${t.createdAt.toISOString().slice(0,10)} | ${t.email} | ${t.businessName}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
