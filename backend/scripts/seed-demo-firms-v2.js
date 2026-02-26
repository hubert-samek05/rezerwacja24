const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Przykładowe firmy z różnych kategorii
const DEMO_FIRMS = [
  {
    name: 'Studio Urody Bella',
    subdomain: 'bella-studio',
    category: 'beauty',
    subcategory: 'hair',
    city: 'Warszawa',
    address: 'ul. Marszałkowska 45',
    description: 'Profesjonalny salon fryzjerski i kosmetyczny w centrum Warszawy.',
    banner: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
    services: [
      { name: 'Strzyżenie damskie', basePrice: 80, duration: 60 },
      { name: 'Strzyżenie męskie', basePrice: 50, duration: 30 },
      { name: 'Koloryzacja', basePrice: 150, duration: 120 },
    ],
    employee: { firstName: 'Anna', lastName: 'Kowalska', title: 'Stylistka' }
  },
  {
    name: 'Fizjoterapia ProHealth',
    subdomain: 'prohealth-fizjo',
    category: 'health',
    subcategory: 'physiotherapy',
    city: 'Kraków',
    address: 'ul. Długa 12',
    description: 'Gabinet fizjoterapii specjalizujący się w rehabilitacji.',
    banner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
    services: [
      { name: 'Konsultacja fizjoterapeutyczna', basePrice: 150, duration: 60 },
      { name: 'Masaż leczniczy', basePrice: 120, duration: 45 },
    ],
    employee: { firstName: 'Tomasz', lastName: 'Nowak', title: 'Fizjoterapeuta' }
  },
  {
    name: 'FitZone Gym',
    subdomain: 'fitzone-gym',
    category: 'fitness',
    subcategory: 'personal',
    city: 'Wrocław',
    address: 'ul. Sportowa 8',
    description: 'Nowoczesna siłownia z profesjonalnymi trenerami.',
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    services: [
      { name: 'Trening personalny', basePrice: 150, duration: 60 },
      { name: 'Konsultacja dietetyczna', basePrice: 200, duration: 90 },
    ],
    employee: { firstName: 'Michał', lastName: 'Wiśniewski', title: 'Trener' }
  },
  {
    name: 'AutoSerwis Premium',
    subdomain: 'autoserwis-premium',
    category: 'automotive',
    subcategory: 'service',
    city: 'Poznań',
    address: 'ul. Mechaników 22',
    description: 'Profesjonalny serwis samochodowy.',
    banner: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80',
    services: [
      { name: 'Przegląd techniczny', basePrice: 150, duration: 60 },
      { name: 'Wymiana oleju', basePrice: 120, duration: 30 },
    ],
    employee: { firstName: 'Piotr', lastName: 'Mazur', title: 'Mechanik' }
  },
  {
    name: 'LinguaPro Szkoła Języków',
    subdomain: 'linguapro',
    category: 'education',
    subcategory: 'languages',
    city: 'Gdańsk',
    address: 'ul. Edukacyjna 5',
    description: 'Kursy językowe dla dzieci i dorosłych.',
    banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
    services: [
      { name: 'Lekcja angielskiego', basePrice: 100, duration: 60 },
      { name: 'Konwersacje', basePrice: 80, duration: 45 },
    ],
    employee: { firstName: 'Katarzyna', lastName: 'Lewandowska', title: 'Lektor' }
  },
  {
    name: 'PsiRaj Grooming',
    subdomain: 'psiraj-groomer',
    category: 'pets',
    subcategory: 'grooming',
    city: 'Łódź',
    address: 'ul. Zwierzęca 15',
    description: 'Profesjonalna pielęgnacja psów i kotów.',
    banner: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
    services: [
      { name: 'Strzyżenie psa', basePrice: 100, duration: 90 },
      { name: 'Kąpiel i suszenie', basePrice: 60, duration: 45 },
    ],
    employee: { firstName: 'Ewa', lastName: 'Zielińska', title: 'Groomer' }
  },
  {
    name: 'InkMaster Tattoo',
    subdomain: 'inkmaster-tattoo',
    category: 'tattoo',
    subcategory: 'tattoo',
    city: 'Katowice',
    address: 'ul. Artystyczna 33',
    description: 'Profesjonalne studio tatuażu.',
    banner: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1200&q=80',
    services: [
      { name: 'Konsultacja', basePrice: 0, duration: 30 },
      { name: 'Mały tatuaż', basePrice: 300, duration: 60 },
    ],
    employee: { firstName: 'Jakub', lastName: 'Kamiński', title: 'Tatuażysta' }
  },
  {
    name: 'MagicMoments Fotografia',
    subdomain: 'magicmoments-foto',
    category: 'photo',
    subcategory: 'wedding',
    city: 'Lublin',
    address: 'ul. Fotograficzna 7',
    description: 'Profesjonalna fotografia ślubna.',
    banner: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80',
    services: [
      { name: 'Sesja portretowa', basePrice: 300, duration: 60 },
      { name: 'Sesja rodzinna', basePrice: 400, duration: 90 },
    ],
    employee: { firstName: 'Marta', lastName: 'Dąbrowska', title: 'Fotograf' }
  },
  {
    name: 'Oaza SPA & Wellness',
    subdomain: 'oaza-spa',
    category: 'beauty',
    subcategory: 'spa',
    city: 'Sopot',
    address: 'ul. Nadmorska 20',
    description: 'Luksusowe SPA nad morzem.',
    banner: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80',
    services: [
      { name: 'Masaż relaksacyjny', basePrice: 180, duration: 60 },
      { name: 'Rytuał SPA', basePrice: 350, duration: 120 },
    ],
    employee: { firstName: 'Natalia', lastName: 'Wójcik', title: 'Masażystka' }
  },
  {
    name: 'DentSmile Stomatologia',
    subdomain: 'dentsmile',
    category: 'health',
    subcategory: 'dental',
    city: 'Bydgoszcz',
    address: 'ul. Medyczna 10',
    description: 'Nowoczesny gabinet stomatologiczny.',
    banner: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
    services: [
      { name: 'Przegląd stomatologiczny', basePrice: 100, duration: 30 },
      { name: 'Higienizacja', basePrice: 200, duration: 45 },
    ],
    employee: { firstName: 'Robert', lastName: 'Jankowski', title: 'Stomatolog' }
  },
];

async function seedDemoFirms() {
  console.log('🌱 Rozpoczynam tworzenie przykładowych firm...\n');

  for (const firm of DEMO_FIRMS) {
    try {
      // Sprawdź czy tenant już istnieje
      const existingTenant = await prisma.tenants.findUnique({
        where: { subdomain: firm.subdomain }
      });

      let tenantId;
      let userId;

      if (existingTenant) {
        tenantId = existingTenant.id;
        
        // Sprawdź czy ma już marketplace listing
        const existingListing = await prisma.marketplace_listings.findUnique({
          where: { tenantId }
        });
        
        if (existingListing && existingListing.isPublished) {
          console.log(`⏭️  ${firm.name} - kompletna, pomijam`);
          continue;
        }
        
        // Pobierz userId z ownerId
        userId = existingTenant.ownerId;
        console.log(`🔄 ${firm.name} - uzupełniam brakujące dane...`);
      } else {
        // Tworzenie nowego tenanta
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        tenantId = `tenant-demo-${timestamp}-${randomSuffix}`;
        userId = `user-demo-${timestamp}-${randomSuffix}`;

        // Utwórz użytkownika
        await prisma.users.create({
          data: {
            id: userId,
            email: `demo-${firm.subdomain}-${randomSuffix}@rezerwacja24.pl`,
            passwordHash: '$2b$10$demopasswordhashplaceholder1234567890',
            role: 'TENANT_OWNER',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Utwórz tenanta
        await prisma.tenants.create({
          data: {
            id: tenantId,
            name: firm.name,
            subdomain: firm.subdomain,
            email: `kontakt@${firm.subdomain}.pl`,
            city: firm.city,
            address: firm.address,
            description: firm.description,
            banner: firm.banner,
            isActive: true,
            isSuspended: false,
            ownerId: userId,
            acceptCashPayment: true,
            acceptOnlinePayment: false,
            autoConfirmBookings: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Sprawdź czy ma pracownika
      const existingEmployee = await prisma.employees.findFirst({
        where: { tenantId }
      });

      let employeeId;
      if (!existingEmployee) {
        employeeId = uuidv4();
        await prisma.employees.create({
          data: {
            id: employeeId,
            userId: userId,
            firstName: firm.employee.firstName,
            lastName: firm.employee.lastName,
            title: firm.employee.title,
            email: `${firm.employee.firstName.toLowerCase()}@${firm.subdomain}.pl`,
            tenantId: tenantId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } else {
        employeeId = existingEmployee.id;
      }

      // Sprawdź czy ma usługi
      const existingServices = await prisma.services.count({
        where: { tenantId }
      });

      if (existingServices === 0) {
        for (const service of firm.services) {
          const serviceId = uuidv4();
          await prisma.services.create({
            data: {
              id: serviceId,
              name: service.name,
              basePrice: service.basePrice.toString(),
              duration: service.duration,
              tenantId: tenantId,
              isActive: true,
              allowOnlineBooking: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          await prisma.service_employees.create({
            data: {
              id: uuidv4(),
              serviceId: serviceId,
              employeeId: employeeId,
            },
          });
        }
      }

      // Sprawdź czy ma marketplace listing
      const existingListing = await prisma.marketplace_listings.findUnique({
        where: { tenantId }
      });

      if (!existingListing) {
        await prisma.marketplace_listings.create({
          data: {
            id: uuidv4(),
            tenantId: tenantId,
            title: firm.name,
            slug: firm.subdomain,
            description: firm.description,
            shortDesc: firm.description.substring(0, 80) + '...',
            category: firm.category,
            subcategory: firm.subcategory,
            tags: [firm.category, firm.subcategory, firm.city.toLowerCase()],
            isPublished: true,
            publishedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } else if (!existingListing.isPublished) {
        await prisma.marketplace_listings.update({
          where: { tenantId },
          data: { isPublished: true, publishedAt: new Date() }
        });
      }

      console.log(`✅ ${firm.name} (${firm.city}) - gotowe`);
    } catch (error) {
      console.error(`❌ Błąd przy ${firm.name}:`, error.message);
    }
  }

  console.log('\n🎉 Zakończono!');
  
  // Podsumowanie
  const count = await prisma.marketplace_listings.count({ where: { isPublished: true } });
  console.log(`📊 Opublikowanych firm w marketplace: ${count}`);
}

seedDemoFirms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
