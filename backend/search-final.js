const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Szukaj we wszystkich tabelach z kolumną email
  const result = await prisma.$queryRaw`
    SELECT 'tenants' as tabela, id::text, email FROM tenants WHERE LOWER(email) LIKE '%szczypkowska%' OR LOWER(email) LIKE '%katarzyna%'
    UNION ALL
    SELECT 'users' as tabela, id::text, email FROM users WHERE LOWER(email) LIKE '%szczypkowska%' OR LOWER(email) LIKE '%katarzyna%'
    UNION ALL
    SELECT 'customers' as tabela, id::text, email FROM customers WHERE LOWER(email) LIKE '%szczypkowska%' OR LOWER(email) LIKE '%katarzyna%'
    UNION ALL
    SELECT 'partners' as tabela, id::text, email FROM partners WHERE LOWER(email) LIKE '%szczypkowska%' OR LOWER(email) LIKE '%katarzyna%'
    UNION ALL
    SELECT 'employee_accounts' as tabela, id::text, email FROM employee_accounts WHERE LOWER(email) LIKE '%szczypkowska%' OR LOWER(email) LIKE '%katarzyna%'
  `;
  
  if (result.length > 0) {
    console.log('=== ZNALEZIONO ===');
    console.log(result);
  } else {
    console.log('=== NIE ZNALEZIONO ===');
    console.log('Email zawierający "katarzyna" lub "szczypkowska" nie istnieje w żadnej tabeli.');
  }
  
  // Pokaż ostatnie 15 kont
  console.log('\n=== Ostatnich 15 zarejestrowanych kont (tenants) ===');
  const recent = await prisma.$queryRaw`
    SELECT id, email, name, "createdAt" FROM tenants ORDER BY "createdAt" DESC LIMIT 15
  `;
  recent.forEach(t => console.log(`${t.createdAt?.toISOString().slice(0,10) || 'N/A'} | ${t.email} | ${t.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
