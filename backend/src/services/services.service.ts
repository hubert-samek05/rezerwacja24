import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createServiceDto: CreateServiceDto) {
    const { employeeIds, ...serviceData } = createServiceDto;

    // Validate category if provided
    if (serviceData.categoryId) {
      const category = await this.prisma.service_categories.findUnique({
        where: { id: serviceData.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Kategoria nie została znaleziona');
      }
    }

    // Validate employees if provided - MUSZĄ należeć do tego tenanta!
    // Używamy tenantId bezpośrednio (spójne z findAll)
    if (employeeIds && employeeIds.length > 0) {
      const employees = await this.prisma.employees.findMany({
        where: { 
          id: { in: employeeIds },
          tenantId, // Tylko pracownicy tego tenanta - używamy tenantId bezpośrednio
        },
      });
      if (employees.length !== employeeIds.length) {
        throw new BadRequestException('Niektórzy pracownicy nie zostali znalezieni lub nie należą do tej firmy');
      }
    }

    // Create service with employee relations
    const { categoryId, ...restServiceData } = serviceData;
    const service = await this.prisma.services.create({
      data: {
        id: `srv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...restServiceData,
        tenants: { connect: { id: tenantId } },
        updatedAt: new Date(),
        ...(categoryId && { service_categories: { connect: { id: categoryId } } }),
        service_employees: employeeIds?.length
          ? {
              create: employeeIds.map((employeeId) => ({
                id: `se-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                employeeId: employeeId,
              })),
            }
          : undefined,
      },
      include: {
        service_categories: true,
        service_employees: {
          include: {
            employees: true,
          },
        },
      },
    });

    return service;
  }

  async findAll(tenantId: string, filters?: { categoryId?: string; isActive?: boolean }) {
    // Pobierz employees dla tego tenanta (dla starych usług bez tenantId)
    const employees = await this.prisma.employees.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const employeeIds = employees.map(e => e.id);

    // Filtruj usługi: przez tenantId LUB przez powiązanie z pracownikami (dla starych usług)
    const where: any = {
      OR: [
        { tenantId },
        ...(employeeIds.length > 0 ? [{
          service_employees: {
            some: {
              employeeId: { in: employeeIds },
            },
          },
        }] : []),
      ],
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const services = await this.prisma.services.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        categoryId: true,
        tenantId: true,
        basePrice: true,
        currency: true,
        duration: true,
        bufferBefore: true,
        bufferAfter: true,
        maxCapacity: true,
        image: true,
        requiresDeposit: true,
        depositAmount: true,
        allowOnlineBooking: true,
        requiresApproval: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        bookingType: true,
        flexibleDuration: true,
        minDuration: true,
        maxDuration: true,
        durationStep: true,
        allowMultiDay: true,
        pricePerHour: true,
        pricePerDay: true,
        service_categories: true,
        service_employees: {
          include: {
            employees: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                // NIE zwracaj avatar w liście
              },
            },
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

    return services;
  }

  async findOne(tenantId: string, id: string) {
    // Pobierz employeeIds dla tego tenanta (używamy tenantId bezpośrednio)
    const tenantEmployees = await this.prisma.employees.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const employeeIds = tenantEmployees.map(e => e.id);

    // Szukaj przez tenantId LUB service_employees (dla starych usług)
    const service = await this.prisma.services.findFirst({
      where: { 
        id,
        OR: [
          { tenantId },
          ...(employeeIds.length > 0 ? [{
            service_employees: {
              some: {
                employeeId: { in: employeeIds },
              },
            },
          }] : []),
        ],
      },
      include: {
        service_categories: true,
        service_employees: {
          include: {
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

    if (!service) {
      throw new NotFoundException('Usługa nie została znaleziona');
    }

    return service;
  }

  async update(tenantId: string, id: string, updateServiceDto: UpdateServiceDto) {
    const { employeeIds, ...serviceData } = updateServiceDto;

    // Pobierz employeeIds dla tego tenanta (używamy tenantId bezpośrednio)
    const tenantEmployees = await this.prisma.employees.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const tenantEmployeeIds = tenantEmployees.map(e => e.id);

    // Check if service exists AND belongs to this tenant (przez tenantId LUB service_employees)
    const existingService = await this.prisma.services.findFirst({
      where: { 
        id,
        OR: [
          { tenantId },
          ...(tenantEmployeeIds.length > 0 ? [{
            service_employees: {
              some: {
                employeeId: { in: tenantEmployeeIds },
              },
            },
          }] : []),
        ],
      },
    });

    if (!existingService) {
      throw new NotFoundException('Usługa nie została znaleziona');
    }

    // Validate category if provided
    if (serviceData.categoryId) {
      const category = await this.prisma.service_categories.findUnique({
        where: { id: serviceData.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Kategoria nie została znaleziona');
      }
    }

    // Update service
    const updateData: any = {
      ...serviceData,
      updatedAt: new Date(),
    };

    // Handle employee relations if provided
    if (employeeIds !== undefined) {
      // Validate employees - MUSZĄ należeć do tego tenanta (używamy tenantId bezpośrednio)
      if (employeeIds.length > 0) {
        const employees = await this.prisma.employees.findMany({
          where: { 
            id: { in: employeeIds },
            tenantId,
          },
        });
        if (employees.length !== employeeIds.length) {
          throw new BadRequestException('Niektórzy pracownicy nie zostali znalezieni lub nie należą do tej firmy');
        }
      }

      // Delete existing relations and create new ones
      updateData.service_employees = {
        deleteMany: {},
        create: employeeIds.map((employeeId) => ({
          id: `se-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          employeeId: employeeId,
        })),
      };
    }

    const service = await this.prisma.services.update({
      where: { id },
      data: updateData,
      include: {
        service_categories: true,
        service_employees: {
          include: {
            employees: true,
          },
        },
      },
    });

    return service;
  }

  async remove(tenantId: string, id: string) {
    // Pobierz employeeIds dla tego tenanta (używamy tenantId bezpośrednio)
    const tenantEmployees = await this.prisma.employees.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const tenantEmployeeIds = tenantEmployees.map(e => e.id);

    // Check if service exists AND belongs to this tenant (przez tenantId LUB service_employees)
    const service = await this.prisma.services.findFirst({
      where: { 
        id,
        OR: [
          { tenantId },
          ...(tenantEmployeeIds.length > 0 ? [{
            service_employees: {
              some: {
                employeeId: { in: tenantEmployeeIds },
              },
            },
          }] : []),
        ],
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Usługa nie została znaleziona');
    }

    // Check if service has bookings
    if (service._count.bookings > 0) {
      throw new BadRequestException(
        'Nie można usunąć usługi, która ma przypisane rezerwacje. Dezaktywuj ją zamiast tego.',
      );
    }

    await this.prisma.services.delete({
      where: { id },
    });

    return { message: 'Usługa została usunięta' };
  }

  async getStats(tenantId: string, id: string) {
    const service = await this.prisma.services.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            totalPrice: true,
            createdAt: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Usługa nie została znaleziona');
    }

    const totalRevenue = service.bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0,
    );

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const bookingsThisMonth = service.bookings.filter(
      (booking) => booking.createdAt >= thisMonth,
    ).length;

    return {
      totalBookings: service.bookings.length,
      bookingsThisMonth,
      totalRevenue,
    };
  }
}
