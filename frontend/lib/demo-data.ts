// Dane demonstracyjne dla nowych użytkowników

export const initializeDemoData = () => {
  // Sprawdź czy już istnieją użytkownicy
  const existingUsers = localStorage.getItem('rezerwacja24_users')
  
  if (!existingUsers || JSON.parse(existingUsers).length === 0) {
    // Utwórz demo użytkownika
    const demoUser = {
      id: '1701364800000',
      firstName: 'Hubert',
      lastName: 'Samek',
      email: 'hubert1.samek@gmail.com',
      businessName: 'Salon Piękności "Elegancja"',
      password: 'demo123',
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('rezerwacja24_users', JSON.stringify([demoUser]))
    
    // Dodaj demo dane dla tego użytkownika
    const userId = demoUser.id
    
    // USŁUGI
    const services = [
      {
        id: '1701364801000',
        name: 'Strzyżenie damskie',
        description: 'Profesjonalne strzyżenie włosów damskich',
        category: 'Fryzjerstwo',
        price: 80,
        duration: 60,
        employees: ['1701364810000', '1701364810001'],
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364802000',
        name: 'Strzyżenie męskie',
        description: 'Strzyżenie męskie z modelowaniem',
        category: 'Fryzjerstwo',
        price: 50,
        duration: 45,
        employees: ['1701364810000'],
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364803000',
        name: 'Koloryzacja',
        description: 'Koloryzacja włosów z pielęgnacją',
        category: 'Fryzjerstwo',
        price: 200,
        duration: 120,
        employees: ['1701364810001'],
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364804000',
        name: 'Manicure hybrydowy',
        description: 'Manicure hybrydowy z malowaniem',
        category: 'Paznokcie',
        price: 100,
        duration: 90,
        employees: ['1701364810002'],
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364805000',
        name: 'Pedicure',
        description: 'Pedicure klasyczny z pielęgnacją',
        category: 'Paznokcie',
        price: 120,
        duration: 75,
        employees: ['1701364810002'],
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(`services_${userId}`, JSON.stringify(services))
    
    // PRACOWNICY
    const employees = [
      {
        id: '1701364810000',
        firstName: 'Anna',
        lastName: 'Kowalska',
        email: 'anna.kowalska@salon.pl',
        phone: '+48 123 456 789',
        role: 'Fryzjer',
        services: ['1701364801000', '1701364802000'],
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364810001',
        firstName: 'Maria',
        lastName: 'Nowak',
        email: 'maria.nowak@salon.pl',
        phone: '+48 123 456 790',
        role: 'Kolorystka',
        services: ['1701364801000', '1701364803000'],
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364810002',
        firstName: 'Katarzyna',
        lastName: 'Wiśniewska',
        email: 'katarzyna.wisniewska@salon.pl',
        phone: '+48 123 456 791',
        role: 'Stylistka paznokci',
        services: ['1701364804000', '1701364805000'],
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(`employees_${userId}`, JSON.stringify(employees))
    
    // KLIENCI - totalVisits i totalSpent będą obliczone automatycznie
    const customers = [
      {
        id: '1701364820000',
        firstName: 'Joanna',
        lastName: 'Kowalczyk',
        email: 'joanna.kowalczyk@example.com',
        phone: '+48 500 100 200',
        totalVisits: 0,
        totalSpent: 0,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '1701364820001',
        firstName: 'Piotr',
        lastName: 'Zieliński',
        email: 'piotr.zielinski@example.com',
        phone: '+48 500 100 201',
        totalVisits: 0,
        totalSpent: 0,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '1701364820002',
        firstName: 'Magdalena',
        lastName: 'Lewandowska',
        email: 'magdalena.lewandowska@example.com',
        phone: '+48 500 100 202',
        totalVisits: 0,
        totalSpent: 0,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '1701364820003',
        firstName: 'Tomasz',
        lastName: 'Wójcik',
        email: 'tomasz.wojcik@example.com',
        phone: '+48 500 100 203',
        totalVisits: 0,
        totalSpent: 0,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '1701364820004',
        firstName: 'Agnieszka',
        lastName: 'Kamińska',
        email: 'agnieszka.kaminska@example.com',
        phone: '+48 500 100 204',
        totalVisits: 0,
        totalSpent: 0,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    localStorage.setItem(`customers_${userId}`, JSON.stringify(customers))
    
    // REZERWACJE
    const today = new Date()
    const bookings = [
      {
        id: '1701364830000',
        customerId: '1701364820000',
        customerName: 'Joanna Kowalczyk',
        serviceId: '1701364801000',
        serviceName: 'Strzyżenie damskie',
        employeeId: '1701364810000',
        employeeName: 'Anna Kowalska',
        date: today.toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        price: 80,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        notes: 'Klientka preferuje krótsze włosy',
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364830001',
        customerId: '1701364820001',
        customerName: 'Piotr Zieliński',
        serviceId: '1701364802000',
        serviceName: 'Strzyżenie męskie',
        employeeId: '1701364810000',
        employeeName: 'Anna Kowalska',
        date: today.toISOString().split('T')[0],
        time: '12:00',
        duration: 45,
        price: 50,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364830002',
        customerId: '1701364820002',
        customerName: 'Magdalena Lewandowska',
        serviceId: '1701364804000',
        serviceName: 'Manicure hybrydowy',
        employeeId: '1701364810002',
        employeeName: 'Katarzyna Wiśniewska',
        date: today.toISOString().split('T')[0],
        time: '14:00',
        duration: 90,
        price: 100,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364830003',
        customerId: '1701364820003',
        customerName: 'Tomasz Wójcik',
        serviceId: '1701364803000',
        serviceName: 'Koloryzacja',
        employeeId: '1701364810001',
        employeeName: 'Maria Nowak',
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00',
        duration: 120,
        price: 200,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364830004',
        customerId: '1701364820004',
        customerName: 'Agnieszka Kamińska',
        serviceId: '1701364805000',
        serviceName: 'Pedicure',
        employeeId: '1701364810002',
        employeeName: 'Katarzyna Wiśniewska',
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:30',
        duration: 75,
        price: 120,
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: '1701364830005',
        customerId: '1701364820000',
        customerName: 'Joanna Kowalczyk',
        serviceId: '1701364804000',
        serviceName: 'Manicure hybrydowy',
        employeeId: '1701364810002',
        employeeName: 'Katarzyna Wiśniewska',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        duration: 90,
        price: 100,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(`bookings_${userId}`, JSON.stringify(bookings))
    
    console.log('✅ Demo dane zostały zainicjalizowane!')
    console.log('📧 Email: hubert1.samek@gmail.com')
    console.log('🔑 Hasło: demo123')
  }
}

export const getDemoCredentials = () => {
  return {
    email: 'hubert1.samek@gmail.com',
    password: 'demo123'
  }
}
