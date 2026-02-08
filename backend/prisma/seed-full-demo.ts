import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seedowanie pełnych danych demo...');

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
  console.log('✅ Konto demo:', demoUser.email, 'TenantId:', tenantId);

  // === KATEGORIE ===
  const categories = [
    {
      id: 'cat-fitness',
      name: 'Fitness & Trening',
      description: 'Zajęcia fitness i treningi personalne',
      icon: 'Dumbbell',
      color: '#0F6048',
      order: 0,
    },
    {
      id: 'cat-wellness',
      name: 'Wellness & SPA',
      description: 'Masaże i zabiegi relaksacyjne',
      icon: 'Sparkles',
      color: '#8B5CF6',
      order: 1,
    },
    {
      id: 'cat-beauty',
      name: 'Beauty & Uroda',
      description: 'Zabiegi kosmetyczne i fryzjerskie',
      icon: 'Scissors',
      color: '#EC4899',
      order: 2,
    },
  ];

  for (const cat of categories) {
    await prisma.service_categories.create({
      data: {
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  console.log('✅ Utworzono kategorie:', categories.length);

  // === PRACOWNICY ===
  const employees = [
    {
      id: 'emp-anna',
      firstName: 'Anna',
      lastName: 'Kowalska',
      email: 'anna.kowalska@educraft.pl',
      phone: '+48 123 456 789',
      title: 'Trener Personalny',
      bio: 'Certyfikowany trener z 5-letnim doświadczeniem w treningach siłowych i cardio',
      specialties: ['Trening siłowy', 'Odchudzanie', 'Rehabilitacja'],
      color: '#0F6048',
    },
    {
      id: 'emp-piotr',
      firstName: 'Piotr',
      lastName: 'Nowak',
      email: 'piotr.nowak@educraft.pl',
      phone: '+48 987 654 321',
      title: 'Instruktor Jogi',
      bio: 'Instruktor jogi z certyfikatem międzynarodowym, specjalista od jogi terapeutycznej',
      specialties: ['Hatha Yoga', 'Vinyasa', 'Medytacja'],
      color: '#8B5CF6',
    },
    {
      id: 'emp-maria',
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      email: 'maria.wisniewska@educraft.pl',
      phone: '+48 555 123 456',
      title: 'Masażystka',
      bio: 'Certyfikowana masażystka z 8-letnim doświadczeniem w masażach relaksacyjnych i leczniczych',
      specialties: ['Masaż klasyczny', 'Masaż sportowy', 'Masaż tajski'],
      color: '#EC4899',
    },
    {
      id: 'emp-tomasz',
      firstName: 'Tomasz',
      lastName: 'Lewandowski',
      email: 'tomasz.lewandowski@educraft.pl',
      phone: '+48 666 789 012',
      title: 'Fizjoterapeuta',
      bio: 'Fizjoterapeuta specjalizujący się w rehabilitacji sportowej',
      specialties: ['Rehabilitacja', 'Terapia manualna', 'Kinesiotaping'],
      color: '#F59E0B',
    },
  ];

  for (const emp of employees) {
    await prisma.employees.create({
      data: {
        ...emp,
        userId: demoUser.id,
        tenantId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  console.log('✅ Utworzono pracowników:', employees.length);

  // === USŁUGI ===
  const services = [
    {
      id: 'srv-trening-personal',
      name: 'Trening Personalny',
      description: 'Indywidualny trening dostosowany do Twoich celów i możliwości',
      type: 'SERVICE',
      categoryId: 'cat-fitness',
      basePrice: 150.00,
      duration: 60,
      employeeIds: ['emp-anna'],
    },
    {
      id: 'srv-joga',
      name: 'Joga dla Początkujących',
      description: 'Zajęcia jogi dla osób początkujących w małych grupach',
      type: 'EVENT',
      categoryId: 'cat-fitness',
      basePrice: 80.00,
      duration: 90,
      maxCapacity: 10,
      employeeIds: ['emp-piotr'],
    },
    {
      id: 'srv-masaz-klasyczny',
      name: 'Masaż Klasyczny',
      description: 'Relaksujący masaż całego ciała',
      type: 'SERVICE',
      categoryId: 'cat-wellness',
      basePrice: 120.00,
      duration: 60,
      employeeIds: ['emp-maria'],
    },
    {
      id: 'srv-masaz-sportowy',
      name: 'Masaż Sportowy',
      description: 'Masaż regeneracyjny dla sportowców',
      type: 'SERVICE',
      categoryId: 'cat-wellness',
      basePrice: 140.00,
      duration: 60,
      employeeIds: ['emp-maria'],
    },
    {
      id: 'srv-rehabilitacja',
      name: 'Rehabilitacja Pourazowa',
      description: 'Indywidualna sesja rehabilitacyjna',
      type: 'SERVICE',
      categoryId: 'cat-wellness',
      basePrice: 180.00,
      duration: 60,
      employeeIds: ['emp-tomasz'],
    },
    {
      id: 'srv-trening-grupowy',
      name: 'Trening Grupowy',
      description: 'Intensywny trening w grupie do 8 osób',
      type: 'EVENT',
      categoryId: 'cat-fitness',
      basePrice: 60.00,
      duration: 60,
      maxCapacity: 8,
      employeeIds: ['emp-anna'],
    },
  ];

  for (const srv of services) {
    const { employeeIds, ...serviceData } = srv;
    
    const service = await prisma.services.create({
      data: {
        id: serviceData.id,
        name: serviceData.name,
        description: serviceData.description,
        type: serviceData.type as any,
        categoryId: serviceData.categoryId,
        basePrice: serviceData.basePrice,
        duration: serviceData.duration,
        maxCapacity: serviceData.maxCapacity,
        currency: 'PLN',
        bufferBefore: 10,
        bufferAfter: 10,
        allowOnlineBooking: true,
        requiresApproval: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Przypisz employees
    for (const empId of employeeIds) {
      await prisma.service_employees.create({
        data: {
          id: `se-${service.id}-${empId}`,
          serviceId: service.id,
          employeeId: empId,
          createdAt: new Date(),
        },
      });
    }
  }
  console.log('✅ Utworzono usługi:', services.length);

  // === KLIENCI ===
  const customers = [
    {
      id: 'cust-jan',
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 111 222 333',
    },
    {
      id: 'cust-maria',
      firstName: 'Maria',
      lastName: 'Nowak',
      email: 'maria.nowak@example.com',
      phone: '+48 444 555 666',
    },
    {
      id: 'cust-piotr',
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      email: 'piotr.wisniewski@example.com',
      phone: '+48 777 888 999',
    },
    {
      id: 'cust-anna',
      firstName: 'Anna',
      lastName: 'Wójcik',
      email: 'anna.wojcik@example.com',
      phone: '+48 222 333 444',
    },
    {
      id: 'cust-tomasz',
      firstName: 'Tomasz',
      lastName: 'Kamiński',
      email: 'tomasz.kaminski@example.com',
      phone: '+48 555 666 777',
    },
    {
      id: 'cust-katarzyna',
      firstName: 'Katarzyna',
      lastName: 'Lewandowska',
      email: 'katarzyna.lewandowska@example.com',
      phone: '+48 888 999 000',
    },
  ];

  for (const cust of customers) {
    await prisma.customers.create({
      data: {
        ...cust,
        tenantId,
        totalBookings: 0,
        totalSpent: 0,
        noShowCount: 0,
        customerScore: 100,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  console.log('✅ Utworzono klientów:', customers.length);

  // === REZERWACJE ===
  const now = new Date();
  const bookings = [
    // Dzisiaj
    {
      customerId: 'cust-jan',
      serviceId: 'srv-trening-personal',
      employeeId: 'emp-anna',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      duration: 60,
      price: 150,
      status: 'CONFIRMED',
      isPaid: true,
    },
    {
      customerId: 'cust-maria',
      serviceId: 'srv-masaz-klasyczny',
      employeeId: 'emp-maria',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
      duration: 60,
      price: 120,
      status: 'CONFIRMED',
      isPaid: false,
    },
    // Jutro
    {
      customerId: 'cust-piotr',
      serviceId: 'srv-joga',
      employeeId: 'emp-piotr',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0),
      duration: 90,
      price: 80,
      status: 'CONFIRMED',
      isPaid: true,
    },
    {
      customerId: 'cust-anna',
      serviceId: 'srv-rehabilitacja',
      employeeId: 'emp-tomasz',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0),
      duration: 60,
      price: 180,
      status: 'PENDING',
      isPaid: false,
    },
    // Za 2 dni
    {
      customerId: 'cust-tomasz',
      serviceId: 'srv-trening-grupowy',
      employeeId: 'emp-anna',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 18, 0),
      duration: 60,
      price: 60,
      status: 'CONFIRMED',
      isPaid: true,
    },
    {
      customerId: 'cust-katarzyna',
      serviceId: 'srv-masaz-sportowy',
      employeeId: 'emp-maria',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0),
      duration: 60,
      price: 140,
      status: 'CONFIRMED',
      isPaid: false,
    },
    // Wczoraj (completed)
    {
      customerId: 'cust-jan',
      serviceId: 'srv-trening-personal',
      employeeId: 'emp-anna',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 0),
      duration: 60,
      price: 150,
      status: 'COMPLETED',
      isPaid: true,
    },
    {
      customerId: 'cust-maria',
      serviceId: 'srv-joga',
      employeeId: 'emp-piotr',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0),
      duration: 90,
      price: 80,
      status: 'COMPLETED',
      isPaid: true,
    },
  ];

  for (const booking of bookings) {
    const endTime = new Date(booking.startTime);
    endTime.setMinutes(endTime.getMinutes() + booking.duration);

    await prisma.bookings.create({
      data: {
        id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        employeeId: booking.employeeId,
        startTime: booking.startTime,
        endTime: endTime,
        basePrice: booking.price,
        addonsPrice: 0,
        totalPrice: booking.price,
        isPaid: booking.isPaid,
        status: booking.status as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  console.log('✅ Utworzono rezerwacje:', bookings.length);

  console.log('🎉 Seedowanie zakończone!');
  console.log('📊 Podsumowanie:');
  console.log('  - Kategorie:', categories.length);
  console.log('  - Pracownicy:', employees.length);
  console.log('  - Usługi:', services.length);
  console.log('  - Klienci:', customers.length);
  console.log('  - Rezerwacje:', bookings.length);
}

main()
  .catch((e) => {
    console.error('❌ Błąd podczas seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
