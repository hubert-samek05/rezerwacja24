import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(tenantId: string, createCustomerDto: CreateCustomerDto) {
    // Sprawdź czy klient z tym telefonem już istnieje w tym tenancie
    const existing = await this.prisma.customers.findFirst({
      where: {
        tenantId,
        phone: createCustomerDto.phone,
      },
    });

    if (existing) {
      throw new BadRequestException('Klient z tym numerem telefonu już istnieje w Twoim koncie');
    }

    const customer = await this.prisma.customers.create({
      data: {
        id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        ...createCustomerDto,
        updatedAt: new Date(),
      },
    });

    // 🔔 Utwórz powiadomienie o nowym kliencie
    await this.createCustomerNotification(
      tenantId,
      'CUSTOMER',
      'Nowy klient',
      `Dodano nowego klienta: ${customer.firstName} ${customer.lastName}`,
      customer.id
    );

    return customer;
  }

  async findAll(tenantId: string) {
    // Pobierz wszystkich klientów tego tenanta z ich rezerwacjami
    const customers = await this.prisma.customers.findMany({
      where: {
        tenantId,
      },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            totalPrice: true,
            isPaid: true,
            paidAmount: true,
            startTime: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Oblicz statystyki dla każdego klienta
    return customers.map(customer => {
      // Wizyty = COMPLETED + CONFIRMED (przeszłe)
      const now = new Date();
      const pastBookings = customer.bookings.filter(b => 
        (b.status === 'COMPLETED' || b.status === 'CONFIRMED') && 
        new Date(b.startTime) < now
      );
      const completedBookings = customer.bookings.filter(b => b.status === 'COMPLETED');
      const totalSpent = pastBookings
        .filter(b => b.isPaid)
        .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
      
      const debt = customer.bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => {
          if (b.isPaid) return sum;
          const totalPrice = Number(b.totalPrice || 0);
          const paidAmount = Number(b.paidAmount || 0);
          return sum + Math.max(0, totalPrice - paidAmount);
        }, 0);

      const lastVisit = completedBookings.length > 0
        ? completedBookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]?.startTime
        : null;

      // Usuń bookings z odpowiedzi (za dużo danych)
      const { bookings, ...customerData } = customer;

      return {
        ...customerData,
        totalBookings: customer._count.bookings,
        totalVisits: pastBookings.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        debt: Math.round(debt * 100) / 100,
        lastVisit,
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    // Sprawdź czy klient należy do tego tenanta
    const customer = await this.prisma.customers.findFirst({
      where: { 
        id,
        tenantId, // Tylko klienci tego tenanta
      },
      include: {
        bookings: {
          orderBy: {
            startTime: 'desc',
          },
          include: {
            services: true,
            employees: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Klient nie został znaleziony');
    }

    // Oblicz statystyki
    const now = new Date();
    const pastBookings = customer.bookings.filter(b => 
      (b.status === 'COMPLETED' || b.status === 'CONFIRMED') && 
      new Date(b.startTime) < now
    );
    const totalSpent = pastBookings
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
    
    const debt = customer.bookings
      .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => {
        if (b.isPaid) return sum;
        const totalPrice = Number(b.totalPrice || 0);
        const paidAmount = Number(b.paidAmount || 0);
        return sum + Math.max(0, totalPrice - paidAmount);
      }, 0);

    const lastVisit = pastBookings.length > 0
      ? pastBookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]?.startTime
      : null;

    return {
      ...customer,
      totalBookings: customer._count.bookings,
      totalVisits: pastBookings.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      debt: Math.round(debt * 100) / 100,
      lastVisit,
    };
  }

  async update(tenantId: string, id: string, updateCustomerDto: UpdateCustomerDto) {
    // Check if customer exists AND belongs to this tenant
    const existing = await this.prisma.customers.findFirst({
      where: { 
        id,
        tenantId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Klient nie został znaleziony');
    }

    // Check if phone is being changed and if it's already taken IN THIS TENANT
    if (updateCustomerDto.phone && updateCustomerDto.phone !== existing.phone) {
      const phoneTaken = await this.prisma.customers.findFirst({
        where: {
          tenantId,
          phone: updateCustomerDto.phone,
          id: { not: id },
        },
      });

      if (phoneTaken) {
        throw new BadRequestException('Ten numer telefonu jest już używany w Twoim koncie');
      }
    }

    const customer = await this.prisma.customers.update({
      where: { id },
      data: updateCustomerDto,
    });

    return customer;
  }

  async remove(tenantId: string, id: string) {
    // Check if customer exists AND belongs to this tenant
    const customer = await this.prisma.customers.findFirst({
      where: { 
        id,
        tenantId,
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Klient nie został znaleziony');
    }

    // Check if customer has bookings
    if (customer._count.bookings > 0) {
      throw new BadRequestException(
        'Nie można usunąć klienta, który ma przypisane rezerwacje.',
      );
    }

    await this.prisma.customers.delete({
      where: { id },
    });

    return { message: 'Klient został usunięty' };
  }

  /**
   * Tworzy powiadomienie dla właściciela firmy
   */
  private async createCustomerNotification(
    tenantId: string,
    type: 'BOOKING' | 'REMINDER' | 'CUSTOMER' | 'PAYMENT' | 'ALERT' | 'SUCCESS' | 'INFO',
    title: string,
    message: string,
    customerId?: string
  ) {
    try {
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        select: { ownerId: true },
      });

      if (!tenant?.ownerId) {
        this.logger.warn(`Nie znaleziono właściciela dla tenant ${tenantId}`);
        return;
      }

      await this.notificationsService.create({
        tenantId,
        userId: tenant.ownerId,
        type,
        title,
        message,
        actionUrl: customerId ? `/dashboard/customers?id=${customerId}` : undefined,
        metadata: customerId ? { customerId } : undefined,
      });

      this.logger.log(`🔔 Utworzono powiadomienie: ${title}`);
    } catch (error) {
      this.logger.error(`Błąd tworzenia powiadomienia: ${error}`);
    }
  }
}
