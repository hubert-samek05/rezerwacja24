import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { LimitsService } from '../limits/limits.service';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private prisma: PrismaService,
    private limitsService: LimitsService,
  ) {}

  async create(tenantId: string, createEmployeeDto: CreateEmployeeDto) {
    this.logger.log(`Creating employee for tenant: ${tenantId}, email: ${createEmployeeDto.email}`);
    
    // 🔒 SPRAWDŹ LIMIT PRACOWNIKÓW
    const employeeLimit = await this.limitsService.checkEmployeeLimit(tenantId);
    if (!employeeLimit.canProceed) {
      this.logger.warn(`Employee limit exceeded for tenant ${tenantId}: ${employeeLimit.current}/${employeeLimit.limit}`);
      throw new ForbiddenException(employeeLimit.message || 'Osiągnięto limit pracowników. Ulepsz plan aby dodać więcej.');
    }
    
    // Pobierz userIds dla tego tenanta
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    const userIds = tenantUsers.map(tu => tu.userId);
    this.logger.log(`Found ${userIds.length} users for tenant: ${userIds.join(', ')}`);

    // Check if email already exists WITHIN THIS TENANT only
    const existing = await this.prisma.employees.findFirst({
      where: { 
        email: createEmployeeDto.email,
        userId: { in: userIds },
      },
    });
    this.logger.log(`Existing employee check result: ${existing ? existing.id : 'none'}`);

    if (existing) {
      this.logger.warn(`Employee with email ${createEmployeeDto.email} already exists in tenant ${tenantId}`);
      throw new BadRequestException('Pracownik z tym adresem email już istnieje w tej firmie');
    }

    // Pobierz userId właściciela tenanta (TENANT_OWNER)
    const tenantOwner = await this.prisma.tenant_users.findFirst({
      where: { 
        tenantId,
        users: {
          role: 'TENANT_OWNER'
        }
      },
      select: { userId: true },
    });

    if (!tenantOwner) {
      throw new BadRequestException('Nie znaleziono właściciela tenanta');
    }

    const employee = await this.prisma.employees.create({
      data: {
        id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...createEmployeeDto,
        userId: tenantOwner.userId,  // ← Użyj userId właściciela tenanta!
        tenantId,
        specialties: createEmployeeDto.specialties || [],
        updatedAt: new Date(),
      },
    });

    return employee;
  }

  async findAll(tenantId: string, filters?: { isActive?: boolean }) {
    const where: any = { tenantId };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const employees = await this.prisma.employees.findMany({
      where,
      include: {
        service_employees: {
          include: {
            services: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            service_employees: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return employees;
  }

  async findOne(tenantId: string, id: string) {
    // Pobierz userIds dla tego tenanta
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    const userIds = tenantUsers.map(tu => tu.userId);

    const employee = await this.prisma.employees.findFirst({
      where: { 
        id,
        userId: { in: userIds }, // Tylko pracownicy tego tenanta
      },
      include: {
        service_employees: {
          include: {
            services: true,
          },
        },
        availability: true,
        bookings: {
          take: 10,
          orderBy: {
            startTime: 'desc',
          },
          include: {
            customers: true,
            services: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            service_employees: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Pracownik nie został znaleziony');
    }

    return employee;
  }

  async update(tenantId: string, id: string, updateEmployeeDto: UpdateEmployeeDto) {
    // Pobierz userIds dla tego tenanta
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    const userIds = tenantUsers.map(tu => tu.userId);

    // Check if employee exists AND belongs to this tenant
    const existing = await this.prisma.employees.findFirst({
      where: { 
        id,
        userId: { in: userIds },
      },
    });

    if (!existing) {
      throw new NotFoundException('Pracownik nie został znaleziony');
    }

    // Check if email is being changed and if it's already taken WITHIN THIS TENANT
    if (updateEmployeeDto.email && updateEmployeeDto.email !== existing.email) {

      const emailTaken = await this.prisma.employees.findFirst({
        where: {
          email: updateEmployeeDto.email,
          id: { not: id },
          userId: { in: userIds },
        },
      });

      if (emailTaken) {
        throw new BadRequestException('Ten adres email jest już używany w tej firmie');
      }
    }

    const employee = await this.prisma.employees.update({
      where: { id },
      data: updateEmployeeDto,
      include: {
        service_employees: {
          include: {
            services: true,
          },
        },
      },
    });

    return employee;
  }

  async remove(tenantId: string, id: string) {
    // Pobierz userIds dla tego tenanta
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    const userIds = tenantUsers.map(tu => tu.userId);

    // Check if employee exists AND belongs to this tenant
    const employee = await this.prisma.employees.findFirst({
      where: { 
        id,
        userId: { in: userIds },
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Pracownik nie został znaleziony');
    }

    // Check if employee has bookings
    if (employee._count.bookings > 0) {
      throw new BadRequestException(
        'Nie można usunąć pracownika, który ma przypisane rezerwacje. Dezaktywuj go zamiast tego.',
      );
    }

    await this.prisma.employees.delete({
      where: { id },
    });

    return { message: 'Pracownik został usunięty' };
  }

  async getStats(tenantId: string, id: string) {
    const employee = await this.prisma.employees.findUnique({
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

    if (!employee) {
      throw new NotFoundException('Pracownik nie został znaleziony');
    }

    const totalRevenue = employee.bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0,
    );

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const bookingsThisMonth = employee.bookings.filter(
      (booking) => booking.createdAt >= thisMonth,
    ).length;

    return {
      totalBookings: employee.bookings.length,
      bookingsThisMonth,
      totalRevenue,
    };
  }

  async getServices(employeeId: string) {
    const serviceEmployees = await this.prisma.service_employees.findMany({
      where: {
        employeeId: employeeId,
      },
      select: {
        serviceId: true,
      },
    });

    return serviceEmployees.map(se => ({ serviceId: se.serviceId }));
  }

  async getAvailability(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employees.findUnique({
      where: { id: employeeId },
      include: {
        availability: {
          where: {
            specificDate: null, // Tylko regularne godziny pracy
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Pracownik nie znaleziony');
    }

    // Mapuj dostępność z bazy na format frontendu
    const daysMap = {
      MONDAY: 'monday',
      TUESDAY: 'tuesday',
      WEDNESDAY: 'wednesday',
      THURSDAY: 'thursday',
      FRIDAY: 'friday',
      SATURDAY: 'saturday',
      SUNDAY: 'sunday',
    };

    const defaultHours = [
      { day: 'monday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'friday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
      { day: 'sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
    ];

    // Jeśli nie ma zapisanej dostępności, zwróć domyślne
    if (employee.availability.length === 0) {
      return { 
        workingHours: defaultHours,
        timeOff: []
      };
    }

    // Mapuj zapisaną dostępność
    // Jeśli są jakiekolwiek zapisane dni, to znaczy że użytkownik już edytował dostępność
    // więc dni które nie są zapisane powinny być wyłączone (enabled: false)
    const workingHours = defaultHours.map(defaultDay => {
      const saved = employee.availability.find(
        a => daysMap[a.dayOfWeek] === defaultDay.day && a.isActive
      );
      
      if (saved) {
        return {
          day: defaultDay.day,
          enabled: true,
          startTime: saved.startTime,
          endTime: saved.endTime,
        };
      }
      
      // Jeśli dzień nie jest zapisany, oznacz jako wyłączony
      return {
        ...defaultDay,
        enabled: false,
      };
    });

    // Pobierz urlopy (specificDate nie null)
    const timeOff = await this.prisma.availability.findMany({
      where: {
        employeeId,
        specificDate: { not: null },
        isActive: true,
      },
      orderBy: {
        specificDate: 'asc',
      },
    });

    return {
      workingHours,
      timeOff: timeOff.map(t => ({
        id: t.id,
        date: t.specificDate,
        reason: 'Urlop', // Możesz dodać pole reason do schema
      })),
    };
  }

  async updateAvailability(tenantId: string, employeeId: string, availabilityData: any) {
    this.logger.debug(`updateAvailability called for employee: ${employeeId}`);
    
    const employee = await this.prisma.employees.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Pracownik nie znaleziony');
    }

    const { workingHours, timeOff } = availabilityData;

    // Usuń starą dostępność (tylko regularne godziny)
    await this.prisma.availability.deleteMany({
      where: {
        employeeId,
        specificDate: null,
      },
    });

    // Mapuj dni na enum
    const daysMap: Record<string, any> = {
      monday: 'MONDAY',
      tuesday: 'TUESDAY',
      wednesday: 'WEDNESDAY',
      thursday: 'THURSDAY',
      friday: 'FRIDAY',
      saturday: 'SATURDAY',
      sunday: 'SUNDAY',
    };

    // Zapisz nowe godziny pracy
    if (workingHours && Array.isArray(workingHours)) {
      const enabledDays = workingHours.filter(d => d.enabled).length;
      this.logger.debug(`Saving ${enabledDays} working days`);
      
      for (const day of workingHours) {
        if (day.enabled) {
          const dayOfWeekEnum = daysMap[day.day];
          if (!dayOfWeekEnum) {
            this.logger.warn(`Invalid day: ${day.day}`);
            continue;
          }
          
          const record = {
            id: `avail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            employeeId,
            dayOfWeek: dayOfWeekEnum,
            startTime: day.startTime,
            endTime: day.endTime,
            isActive: true,
            updatedAt: new Date(),
          };
          
          try {
            await this.prisma.availability.create({ data: record });
          } catch (error) {
            this.logger.error(`Error creating availability: ${error.message}`);
            throw error;
          }
          
          // Małe opóźnienie aby uniknąć duplikatów ID
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      this.logger.debug('Working hours saved successfully');
    }

    // Zapisz urlopy jeśli są
    if (timeOff && Array.isArray(timeOff)) {
      for (const vacation of timeOff) {
        if (vacation.date && !vacation.id) {
          // Nowy urlop
          await this.prisma.availability.create({
            data: {
              id: `timeoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              employeeId,
              dayOfWeek: 'MONDAY', // Wymagane przez schema, ale nie używane dla urlopów
              startTime: '00:00',
              endTime: '23:59',
              specificDate: new Date(vacation.date),
              isActive: true,
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      message: 'Dostępność została zaktualizowana',
    };
  }

  async addTimeOff(tenantId: string, employeeId: string, timeOffData: { date: string; reason?: string }) {
    const employee = await this.prisma.employees.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Pracownik nie znaleziony');
    }

    const timeOff = await this.prisma.availability.create({
      data: {
        id: `timeoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        dayOfWeek: 'MONDAY', // Wymagane, ale nie używane
        startTime: '00:00',
        endTime: '23:59',
        specificDate: new Date(timeOffData.date),
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return timeOff;
  }

  async removeTimeOff(tenantId: string, employeeId: string, timeOffId: string) {
    await this.prisma.availability.delete({
      where: { id: timeOffId },
    });

    return { message: 'Urlop został usunięty' };
  }
}
