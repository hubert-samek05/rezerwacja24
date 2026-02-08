import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seedowanie danych demo...');

  // Znajdź konto demo
  const demoUser = await prisma.users.findFirst({
    where: { email: 'hubert1.samek@gmail.com' },
    include: { tenant_users: true },
  });

  if (!demoUser) {
    console.log('❌ Nie znaleziono konta demo');
    return;
  }

  const tenantId = demoUser.tenant_users[0]?.tenantId;
  if (!tenantId) {
    console.log('❌ Nie znaleziono tenantId dla konta demo');
    return;
  }

  console.log('✅ Znaleziono konto demo:', demoUser.email);
  console.log('✅ TenantId:', tenantId);

  // Sprawdź czy są już employees
  const existingEmployees = await prisma.employees.findMany({
    where: { userId: demoUser.id },
  });

  if (existingEmployees.length > 0) {
    console.log('✅ Employees już istnieją:', existingEmployees.length);
    return;
  }

  // Utwórz employees
  const employee1 = await prisma.employees.create({
    data: {
      id: `emp-demo-1`,
      userId: demoUser.id,
      tenantId,
      firstName: 'Anna',
      lastName: 'Kowalska',
      email: 'anna.kowalska@educraft.pl',
      phone: '+48 123 456 789',
      title: 'Trener Personalny',
      bio: 'Certyfikowany trener z 5-letnim doświadczeniem',
      specialties: ['Trening siłowy', 'Odchudzanie', 'Rehabilitacja'],
      color: '#0F6048',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const employee2 = await prisma.employees.create({
    data: {
      id: `emp-demo-2`,
      userId: demoUser.id,
      tenantId,
      firstName: 'Piotr',
      lastName: 'Nowak',
      email: 'piotr.nowak@educraft.pl',
      phone: '+48 987 654 321',
      title: 'Instruktor Jogi',
      bio: 'Instruktor jogi z certyfikatem międzynarodowym',
      specialties: ['Hatha Yoga', 'Vinyasa', 'Medytacja'],
      color: '#8B5CF6',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Utworzono employees:', employee1.firstName, employee2.firstName);

  // Utwórz kategorię
  const category = await prisma.service_categories.create({
    data: {
      id: `cat-demo-1`,
      name: 'Fitness & Wellness',
      description: 'Zajęcia fitness i wellness',
      icon: 'Dumbbell',
      color: '#0F6048',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Utworzono kategorię:', category.name);

  // Utwórz usługi
  const service1 = await prisma.services.create({
    data: {
      id: `srv-demo-1`,
      name: 'Trening Personalny',
      description: 'Indywidualny trening dostosowany do Twoich potrzeb',
      type: 'SERVICE',
      categoryId: category.id,
      basePrice: 150.00,
      currency: 'PLN',
      duration: 60,
      bufferBefore: 10,
      bufferAfter: 10,
      maxCapacity: 1,
      allowOnlineBooking: true,
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const service2 = await prisma.services.create({
    data: {
      id: `srv-demo-2`,
      name: 'Joga dla Początkujących',
      description: 'Zajęcia jogi dla osób początkujących',
      type: 'EVENT',
      categoryId: category.id,
      basePrice: 80.00,
      currency: 'PLN',
      duration: 90,
      bufferBefore: 5,
      bufferAfter: 5,
      maxCapacity: 10,
      allowOnlineBooking: true,
      requiresApproval: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Utworzono usługi:', service1.name, service2.name);

  // Przypisz employees do usług
  await prisma.service_employees.create({
    data: {
      id: `se-demo-1`,
      serviceId: service1.id,
      employeeId: employee1.id,
      createdAt: new Date(),
    },
  });

  await prisma.service_employees.create({
    data: {
      id: `se-demo-2`,
      serviceId: service2.id,
      employeeId: employee2.id,
      createdAt: new Date(),
    },
  });

  console.log('✅ Przypisano employees do usług');

  // Utwórz przykładowych klientów
  const customer1 = await prisma.customers.create({
    data: {
      id: `cust-demo-1`,
      tenantId,
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 111 222 333',
      totalBookings: 0,
      totalSpent: 0,
      noShowCount: 0,
      customerScore: 100,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const customer2 = await prisma.customers.create({
    data: {
      id: `cust-demo-2`,
      tenantId,
      firstName: 'Maria',
      lastName: 'Nowak',
      email: 'maria.nowak@example.com',
      phone: '+48 444 555 666',
      totalBookings: 0,
      totalSpent: 0,
      noShowCount: 0,
      customerScore: 100,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Utworzono klientów:', customer1.firstName, customer2.firstName);

  // Utwórz przykładowe rezerwacje
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const booking1 = await prisma.bookings.create({
    data: {
      id: `book-demo-1`,
      customerId: customer1.id,
      serviceId: service1.id,
      employeeId: employee1.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      basePrice: 150.00,
      addonsPrice: 0,
      totalPrice: 150.00,
      isPaid: false,
      status: 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Utworzono rezerwację:', booking1.id);

  console.log('🎉 Seedowanie zakończone!');
}

main()
  .catch((e) => {
    console.error('❌ Błąd podczas seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
