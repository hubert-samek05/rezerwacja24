const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Szukaj po różnych wariantach
  const searches = ['katarzyna', 'szczypkowska', 'szczypkowsk', 'katarzyma'];
  
  for (const term of searches) {
    console.log(`\n=== Szukam: "${term}" ===`);
    
    // tenants
    const tenants = await prisma.tenants.findMany({
      where: { email: { contains: term, mode: 'insensitive' } }
    });
    if (tenants.length) console.log('TENANTS:', tenants.map(t => ({ id: t.id, email: t.email, businessName: t.businessName })));
    
    // users
    const users = await prisma.users.findMany({
      where: { email: { contains: term, mode: 'insensitive' } }
    });
    if (users.length) console.log('USERS:', users.map(u => ({ id: u.id, email: u.email })));
    
    // customers
    const customers = await prisma.customers.findMany({
      where: { 
        OR: [
          { email: { contains: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } }
        ]
      }
    });
    if (customers.length) console.log('CUSTOMERS:', customers.map(c => ({ id: c.id, email: c.email, name: c.name })));
    
    // partners
    const partners = await prisma.partners.findMany({
      where: { email: { contains: term, mode: 'insensitive' } }
    });
    if (partners.length) console.log('PARTNERS:', partners.map(p => ({ id: p.id, email: p.email })));
  }
  
  // Pokaż też ostatnich 10 tenantów
  console.log('\n=== Ostatnich 10 zarejestrowanych kont (tenants) ===');
  const recent = await prisma.tenants.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, email: true, businessName: true, createdAt: true }
  });
  console.log(recent);
}

main().catch(console.error).finally(() => prisma.$disconnect());
