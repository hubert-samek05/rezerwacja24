const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

const defaultOpeningHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { closed: true }
};

async function updateOpeningHours() {
  try {
    console.log('🔍 Szukam firm bez godzin otwarcia...');
    
    // Znajdź wszystkie firmy
    const tenants = await prisma.tenants.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        openingHours: true
      }
    });
    
    // Filtruj te bez openingHours
    const tenantsWithoutHours = tenants.filter(t => !t.openingHours || Object.keys(t.openingHours).length === 0);
    
    console.log(`📊 Znaleziono ${tenantsWithoutHours.length} firm bez godzin otwarcia`);
    
    if (tenantsWithoutHours.length === 0) {
      console.log('✅ Wszystkie firmy mają już godziny otwarcia!');
      return;
    }
    
    // Zaktualizuj każdą firmę
    for (const tenant of tenantsWithoutHours) {
      console.log(`\n📝 Aktualizuję: ${tenant.name} (${tenant.subdomain})`);
      
      await prisma.tenants.update({
        where: { id: tenant.id },
        data: {
          openingHours: defaultOpeningHours,
          updatedAt: new Date()
        }
      });
      
      console.log(`   ✅ Zaktualizowano!`);
    }
    
    console.log(`\n🎉 Zaktualizowano ${tenantsWithoutHours.length} firm!`);
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOpeningHours();
