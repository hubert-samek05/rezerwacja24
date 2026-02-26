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
    description: 'Profesjonalny salon fryzjerski i kosmetyczny w centrum Warszawy. Oferujemy pełen zakres usług fryzjerskich i kosmetycznych.',
    banner: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
    services: [
      { name: 'Strzyżenie damskie', basePrice: 80, duration: 60 },
      { name: 'Strzyżenie męskie', basePrice: 50, duration: 30 },
      { name: 'Koloryzacja', basePrice: 150, duration: 120 },
      { name: 'Modelowanie', basePrice: 40, duration: 30 },
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
    description: 'Gabinet fizjoterapii specjalizujący się w rehabilitacji pourazowej i leczeniu bólu kręgosłupa.',
    banner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
    services: [
      { name: 'Konsultacja fizjoterapeutyczna', basePrice: 150, duration: 60 },
      { name: 'Masaż leczniczy', basePrice: 120, duration: 45 },
      { name: 'Terapia manualna', basePrice: 180, duration: 60 },
      { name: 'Kinesiotaping', basePrice: 80, duration: 30 },
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
    description: 'Nowoczesna siłownia z profesjonalnymi trenerami personalnymi. Treningi indywidualne i grupowe.',
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    services: [
      { name: 'Trening personalny', basePrice: 150, duration: 60 },
      { name: 'Konsultacja dietetyczna', basePrice: 200, duration: 90 },
      { name: 'Trening wprowadzający', basePrice: 100, duration: 45 },
      { name: 'Stretching', basePrice: 80, duration: 45 },
    ],
    employee: { firstName: 'Michał', lastName: 'Wiśniewski', title: 'Trener personalny' }
  },
  {
    name: 'AutoSerwis Premium',
    subdomain: 'autoserwis-premium',
    category: 'automotive',
    subcategory: 'service',
    city: 'Poznań',
    address: 'ul. Mechaników 22',
    description: 'Profesjonalny serwis samochodowy. Naprawy, przeglądy, wymiana opon i oleju.',
    banner: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80',
    services: [
      { name: 'Przegląd techniczny', basePrice: 150, duration: 60 },
      { name: 'Wymiana oleju', basePrice: 120, duration: 30 },
      { name: 'Wymiana opon', basePrice: 80, duration: 45 },
      { name: 'Diagnostyka komputerowa', basePrice: 100, duration: 30 },
    ],
    employee: { firstName: 'Piotr', lastName: 'Mazur', title: 'Mechanik' }
  },
  {
    name: 'Szkoła Języków Obcych LinguaPro',
    subdomain: 'linguapro',
    category: 'education',
    subcategory: 'languages',
    city: 'Gdańsk',
    address: 'ul. Edukacyjna 5',
    description: 'Kursy językowe dla dzieci i dorosłych. Angielski, niemiecki, hiszpański. Przygotowanie do egzaminów.',
    banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
    services: [
      { name: 'Lekcja indywidualna - angielski', basePrice: 100, duration: 60 },
      { name: 'Lekcja indywidualna - niemiecki', basePrice: 100, duration: 60 },
      { name: 'Konwersacje', basePrice: 80, duration: 45 },
      { name: 'Przygotowanie do egzaminu', basePrice: 120, duration: 90 },
    ],
    employee: { firstName: 'Katarzyna', lastName: 'Lewandowska', title: 'Lektor' }
  },
  {
    name: 'Salon Groomerski PsiRaj',
    subdomain: 'psiraj-groomer',
    category: 'pets',
    subcategory: 'grooming',
    city: 'Łódź',
    address: 'ul. Zwierzęca 15',
    description: 'Profesjonalna pielęgnacja psów i kotów. Strzyżenie, kąpiel, trymowanie.',
    banner: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
    services: [
      { name: 'Strzyżenie psa małego', basePrice: 80, duration: 60 },
      { name: 'Strzyżenie psa dużego', basePrice: 150, duration: 120 },
      { name: 'Kąpiel i suszenie', basePrice: 60, duration: 45 },
      { name: 'Obcinanie pazurków', basePrice: 30, duration: 15 },
    ],
    employee: { firstName: 'Ewa', lastName: 'Zielińska', title: 'Groomer' }
  },
  {
    name: 'Studio Tatuażu InkMaster',
    subdomain: 'inkmaster-tattoo',
    category: 'tattoo',
    subcategory: 'tattoo',
    city: 'Katowice',
    address: 'ul. Artystyczna 33',
    description: 'Profesjonalne studio tatuażu. Wszystkie style - realistyczne, geometryczne, tradycyjne.',
    banner: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1200&q=80',
    services: [
      { name: 'Konsultacja', basePrice: 0, duration: 30 },
      { name: 'Mały tatuaż (do 5cm)', basePrice: 300, duration: 60 },
      { name: 'Średni tatuaż (5-15cm)', basePrice: 600, duration: 180 },
      { name: 'Cover-up', basePrice: 500, duration: 120 },
    ],
    employee: { firstName: 'Jakub', lastName: 'Kamiński', title: 'Tatuażysta' }
  },
  {
    name: 'Fotografia Ślubna MagicMoments',
    subdomain: 'magicmoments-foto',
    category: 'photo',
    subcategory: 'wedding',
    city: 'Lublin',
    address: 'ul. Fotograficzna 7',
    description: 'Profesjonalna fotografia ślubna i okolicznościowa. Sesje plenerowe, reportaże.',
    banner: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80',
    services: [
      { name: 'Sesja portretowa', basePrice: 300, duration: 60 },
      { name: 'Sesja rodzinna', basePrice: 400, duration: 90 },
      { name: 'Konsultacja ślubna', basePrice: 0, duration: 60 },
      { name: 'Mini sesja', basePrice: 200, duration: 30 },
    ],
    employee: { firstName: 'Marta', lastName: 'Dąbrowska', title: 'Fotograf' }
  },
  {
    name: 'SPA & Wellness Oaza',
    subdomain: 'oaza-spa',
    category: 'beauty',
    subcategory: 'spa',
    city: 'Sopot',
    address: 'ul. Nadmorska 20',
    description: 'Luksusowe SPA nad morzem. Masaże, zabiegi na twarz i ciało, sauna.',
    banner: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80',
    services: [
      { name: 'Masaż relaksacyjny', basePrice: 180, duration: 60 },
      { name: 'Masaż gorącymi kamieniami', basePrice: 220, duration: 75 },
      { name: 'Zabieg na twarz', basePrice: 150, duration: 60 },
      { name: 'Rytuał SPA', basePrice: 350, duration: 120 },
    ],
    employee: { firstName: 'Natalia', lastName: 'Wójcik', title: 'Masażystka' }
  },
  {
    name: 'Gabinet Stomatologiczny DentSmile',
    subdomain: 'dentsmile',
    category: 'health',
    subcategory: 'dental',
    city: 'Bydgoszcz',
    address: 'ul. Medyczna 10',
    description: 'Nowoczesny gabinet stomatologiczny. Leczenie, profilaktyka, wybielanie zębów.',
    banner: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
    services: [
      { name: 'Przegląd stomatologiczny', basePrice: 100, duration: 30 },
      { name: 'Leczenie kanałowe', basePrice: 500, duration: 90 },
      { name: 'Wybielanie zębów', basePrice: 800, duration: 60 },
      { name: 'Higienizacja', basePrice: 200, duration: 45 },
    ],
    employee: { firstName: 'Robert', lastName: 'Jankowski', title: 'Stomatolog' }
  },
];

async function seedDemoFirms() {
  console.log('🌱 Rozpoczynam tworzenie przykładowych firm...\n');

  for (const firm of DEMO_FIRMS) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const tenantId = `tenant-demo-${timestamp}-${randomSuffix}`;
    const userId = `user-demo-${timestamp}-${randomSuffix}`;
    const employeeId = `emp-demo-${timestamp}-${randomSuffix}`;

    try {
      // 1. Utwórz użytkownika (właściciela)
      const user = await prisma.users.upsert({
        where: { email: `demo-${firm.subdomain}@rezerwacja24.pl` },
        update: {},
        create: {
          id: userId,
          email: `demo-${firm.subdomain}@rezerwacja24.pl`,
          passwordHash: '$2b$10$demopasswordhashplaceholder1234567890', // placeholder
          role: 'TENANT_OWNER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 2. Sprawdź czy tenant już istnieje
      let existingTenant = await prisma.tenants.findUnique({
        where: { subdomain: firm.subdomain }
      });
      
      let actualTenantId = tenantId;
      
      if (existingTenant) {
        actualTenantId = existingTenant.id;
        console.log(`⏭️  ${firm.name} - tenant istnieje, sprawdzam resztę...`);
      } else {

      // 3. Utwórz tenanta
      const tenant = await prisma.tenants.create({
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
          ownerId: user.id,
          acceptCashPayment: true,
          acceptOnlinePayment: false,
          autoConfirmBookings: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 4. Utwórz pracownika
      const employee = await prisma.employees.create({
        data: {
          id: employeeId,
          userId: user.id,
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

      // 4. Utwórz usługi i przypisz do pracownika
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

        // Przypisz usługę do pracownika
        await prisma.service_employees.create({
          data: {
            id: uuidv4(),
            serviceId: serviceId,
            employeeId: employeeId,
          },
        });
      }

      // 5. Utwórz profil marketplace
      const slug = firm.subdomain;
      await prisma.marketplace_listings.create({
        data: {
          id: uuidv4(),
          tenantId: tenantId,
          title: firm.name,
          slug: slug,
          description: firm.description,
          shortDesc: firm.description.substring(0, 100) + '...',
          category: firm.category,
          subcategory: firm.subcategory,
          tags: [firm.category, firm.subcategory, firm.city.toLowerCase()],
          isPublished: true,
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`✅ ${firm.name} (${firm.city}) - utworzono`);
    } catch (error) {
      console.error(`❌ Błąd przy tworzeniu ${firm.name}:`, error.message);
    }
  }

  console.log('\n🎉 Zakończono tworzenie przykładowych firm!');
}

seedDemoFirms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
