import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class EmployeeAccountsService {
  private readonly logger = new Logger(EmployeeAccountsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Pobierz wszystkie konta pracowników dla tenanta
   */
  async findAll(tenantId: string) {
    return this.prisma.employee_accounts.findMany({
      where: { tenantId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            title: true,
            isActive: true,
          },
        },
        permissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Pobierz konto pracownika po ID
   */
  async findOne(tenantId: string, id: string) {
    const account = await this.prisma.employee_accounts.findFirst({
      where: { id, tenantId },
      include: {
        employee: true,
        permissions: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Konto pracownika nie znalezione');
    }

    return account;
  }

  /**
   * Pobierz konto pracownika po email (do logowania)
   */
  async findByEmail(email: string) {
    return this.prisma.employee_accounts.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        employee: true,
        permissions: true,
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
          },
        },
      },
    });
  }

  /**
   * Utwórz konto dla pracownika
   */
  async create(tenantId: string, data: {
    employeeId: string;
    email: string;
    permissions?: {
      canViewCalendar?: boolean;
      canManageBookings?: boolean;
      canViewCustomers?: boolean;
      canManageCustomers?: boolean;
      canViewServices?: boolean;
      canManageServices?: boolean;
      canViewEmployees?: boolean;
      canManageEmployees?: boolean;
      canViewAnalytics?: boolean;
      canViewSettings?: boolean;
      canManageSettings?: boolean;
      canViewPayments?: boolean;
      canManagePayments?: boolean;
      onlyOwnBookings?: boolean;
      onlyOwnCalendar?: boolean;
    };
  }) {
    // Sprawdź czy pracownik istnieje i należy do tenanta
    const employee = await this.prisma.employees.findFirst({
      where: { id: data.employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Pracownik nie znaleziony');
    }

    // Sprawdź czy pracownik już ma konto
    const existingAccount = await this.prisma.employee_accounts.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (existingAccount) {
      throw new BadRequestException('Pracownik już ma konto');
    }

    // Sprawdź czy email jest już używany w tym tenancie
    const existingEmail = await this.prisma.employee_accounts.findFirst({
      where: { tenantId, email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new BadRequestException('Ten email jest już używany');
    }

    // Wygeneruj tymczasowe hasło i token aktywacji
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');

    // Utwórz konto
    const account = await this.prisma.employee_accounts.create({
      data: {
        employeeId: data.employeeId,
        tenantId,
        email: data.email.toLowerCase(),
        passwordHash,
        activationToken,
        permissions: {
          create: {
            canViewCalendar: data.permissions?.canViewCalendar ?? true,
            canManageBookings: data.permissions?.canManageBookings ?? false,
            canViewCustomers: data.permissions?.canViewCustomers ?? false,
            canManageCustomers: data.permissions?.canManageCustomers ?? false,
            canViewServices: data.permissions?.canViewServices ?? false,
            canManageServices: data.permissions?.canManageServices ?? false,
            canViewEmployees: data.permissions?.canViewEmployees ?? false,
            canManageEmployees: data.permissions?.canManageEmployees ?? false,
            canViewAnalytics: data.permissions?.canViewAnalytics ?? false,
            canViewSettings: data.permissions?.canViewSettings ?? false,
            canManageSettings: data.permissions?.canManageSettings ?? false,
            canViewPayments: data.permissions?.canViewPayments ?? false,
            canManagePayments: data.permissions?.canManagePayments ?? false,
            onlyOwnBookings: data.permissions?.onlyOwnBookings ?? true,
            onlyOwnCalendar: data.permissions?.onlyOwnCalendar ?? true,
          },
        },
      },
      include: {
        employee: true,
        permissions: true,
      },
    });

    // Pobierz dane firmy
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { name: true, subdomain: true },
    });

    // Wyślij email z danymi logowania
    try {
      await this.emailService.sendEmployeeAccountCreated({
        to: data.email,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        businessName: tenant?.name || 'Firma',
        tempPassword,
        loginUrl: `https://${tenant?.subdomain}.rezerwacja24.pl/employee-login`,
      });
      this.logger.log(`Email z danymi logowania wysłany do ${data.email}`);
    } catch (error) {
      this.logger.error(`Błąd wysyłania emaila: ${error.message}`);
    }

    return {
      ...account,
      tempPassword, // Zwróć tymczasowe hasło (do wyświetlenia adminowi)
    };
  }

  /**
   * Utwórz samodzielne konto użytkownika (bez istniejącego pracownika)
   * Dla menadżerów, księgowych, recepcji itp.
   */
  async createStandalone(tenantId: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    accountType: string;
    permissions?: {
      canViewCalendar?: boolean;
      canManageBookings?: boolean;
      canViewCustomers?: boolean;
      canManageCustomers?: boolean;
      canViewServices?: boolean;
      canManageServices?: boolean;
      canViewEmployees?: boolean;
      canManageEmployees?: boolean;
      canViewAnalytics?: boolean;
      canViewSettings?: boolean;
      canManageSettings?: boolean;
      canViewPayments?: boolean;
      canManagePayments?: boolean;
      onlyOwnBookings?: boolean;
      onlyOwnCalendar?: boolean;
    };
  }) {
    // Sprawdź czy email jest już używany
    const existingEmail = await this.prisma.employee_accounts.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new BadRequestException('Ten email jest już używany');
    }

    // Pobierz userId właściciela tenanta
    const tenantOwner = await this.prisma.tenant_users.findFirst({
      where: { 
        tenantId,
        users: { role: 'TENANT_OWNER' }
      },
      select: { userId: true },
    });

    if (!tenantOwner) {
      throw new BadRequestException('Nie znaleziono właściciela tenanta');
    }

    // Utwórz pracownika jako placeholder (dla kont typu menadżer, recepcja itp.)
    const employee = await this.prisma.employees.create({
      data: {
        id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: '',
        title: data.accountType === 'manager' ? 'Menadżer' : 
               data.accountType === 'receptionist' ? 'Recepcja' :
               data.accountType === 'secretary' ? 'Sekretariat' :
               data.accountType === 'accountant' ? 'Księgowość' :
               data.accountType === 'assistant' ? 'Asystent' : 'Użytkownik',
        userId: tenantOwner.userId,
        tenantId,
        isActive: true,
        specialties: [],
        updatedAt: new Date(),
      },
    });

    // Wygeneruj tymczasowe hasło
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');

    // Utwórz konto
    const account = await this.prisma.employee_accounts.create({
      data: {
        employeeId: employee.id,
        tenantId,
        email: data.email.toLowerCase(),
        passwordHash,
        activationToken,
        permissions: {
          create: {
            canViewCalendar: data.permissions?.canViewCalendar ?? true,
            canManageBookings: data.permissions?.canManageBookings ?? true,
            canViewCustomers: data.permissions?.canViewCustomers ?? false,
            canManageCustomers: data.permissions?.canManageCustomers ?? false,
            canViewServices: data.permissions?.canViewServices ?? false,
            canManageServices: data.permissions?.canManageServices ?? false,
            canViewEmployees: data.permissions?.canViewEmployees ?? false,
            canManageEmployees: data.permissions?.canManageEmployees ?? false,
            canViewAnalytics: data.permissions?.canViewAnalytics ?? false,
            canViewSettings: data.permissions?.canViewSettings ?? false,
            canManageSettings: data.permissions?.canManageSettings ?? false,
            canViewPayments: data.permissions?.canViewPayments ?? false,
            canManagePayments: data.permissions?.canManagePayments ?? false,
            onlyOwnBookings: data.permissions?.onlyOwnBookings ?? true,
            onlyOwnCalendar: data.permissions?.onlyOwnCalendar ?? true,
          },
        },
      },
      include: {
        employee: true,
        permissions: true,
      },
    });

    // Pobierz dane firmy
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { name: true, subdomain: true },
    });

    // Wyślij email z danymi logowania
    try {
      await this.emailService.sendEmployeeAccountCreated({
        to: data.email,
        employeeName: `${data.firstName} ${data.lastName}`,
        businessName: tenant?.name || 'Firma',
        tempPassword,
        loginUrl: `https://app.rezerwacja24.pl/login`,
      });
      this.logger.log(`Email z danymi logowania wysłany do ${data.email}`);
    } catch (error) {
      this.logger.error(`Błąd wysyłania emaila: ${error.message}`);
    }

    return {
      ...account,
      tempPassword,
    };
  }

  /**
   * Aktualizuj uprawnienia konta
   */
  async updatePermissions(tenantId: string, accountId: string, permissions: {
    canViewCalendar?: boolean;
    canManageBookings?: boolean;
    canViewCustomers?: boolean;
    canManageCustomers?: boolean;
    canViewServices?: boolean;
    canManageServices?: boolean;
    canViewEmployees?: boolean;
    canManageEmployees?: boolean;
    canViewAnalytics?: boolean;
    canViewSettings?: boolean;
    canManageSettings?: boolean;
    canViewPayments?: boolean;
    canManagePayments?: boolean;
    onlyOwnBookings?: boolean;
    onlyOwnCalendar?: boolean;
  }) {
    const account = await this.findOne(tenantId, accountId);

    await this.prisma.employee_permissions.update({
      where: { employeeAccountId: account.id },
      data: permissions,
    });

    return this.findOne(tenantId, accountId);
  }

  /**
   * Dezaktywuj/aktywuj konto
   */
  async toggleActive(tenantId: string, accountId: string) {
    const account = await this.findOne(tenantId, accountId);

    return this.prisma.employee_accounts.update({
      where: { id: accountId },
      data: { isActive: !account.isActive },
      include: {
        employee: true,
        permissions: true,
      },
    });
  }

  /**
   * Usuń konto pracownika
   */
  async remove(tenantId: string, accountId: string) {
    const account = await this.findOne(tenantId, accountId);

    await this.prisma.employee_accounts.delete({
      where: { id: accountId },
    });

    return { message: 'Konto pracownika zostało usunięte' };
  }

  /**
   * Zresetuj hasło i wyślij nowe na email
   */
  async resetPassword(tenantId: string, accountId: string) {
    const account = await this.findOne(tenantId, accountId);

    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await this.prisma.employee_accounts.update({
      where: { id: accountId },
      data: { passwordHash },
    });

    // Pobierz dane firmy
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { name: true, subdomain: true },
    });

    // Wyślij email z nowym hasłem
    try {
      await this.emailService.sendEmployeePasswordReset({
        to: account.email,
        employeeName: `${account.employee.firstName} ${account.employee.lastName}`,
        businessName: tenant?.name || 'Firma',
        tempPassword,
        loginUrl: `https://${tenant?.subdomain}.rezerwacja24.pl/employee-login`,
      });
      this.logger.log(`Email z nowym hasłem wysłany do ${account.email}`);
    } catch (error) {
      this.logger.error(`Błąd wysyłania emaila: ${error.message}`);
    }

    return { 
      message: 'Hasło zostało zresetowane i wysłane na email',
      tempPassword, // Zwróć też adminowi
    };
  }

  /**
   * Logowanie pracownika
   */
  async login(email: string, password: string) {
    const account = await this.findByEmail(email);

    if (!account) {
      throw new BadRequestException('Nieprawidłowy email lub hasło');
    }

    if (!account.isActive) {
      throw new BadRequestException('Konto jest nieaktywne');
    }

    const isPasswordValid = await bcrypt.compare(password, account.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Nieprawidłowy email lub hasło');
    }

    // Zaktualizuj ostatnie logowanie
    await this.prisma.employee_accounts.update({
      where: { id: account.id },
      data: { 
        lastLoginAt: new Date(),
        activatedAt: account.activatedAt || new Date(),
      },
    });

    return {
      id: account.id,
      employeeId: account.employeeId,
      tenantId: account.tenantId,
      email: account.email,
      employee: account.employee,
      permissions: account.permissions[0],
      tenant: account.tenant,
    };
  }

  /**
   * Zmień hasło (przez pracownika)
   */
  async changePassword(accountId: string, oldPassword: string, newPassword: string) {
    const account = await this.prisma.employee_accounts.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Konto nie znalezione');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, account.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Nieprawidłowe obecne hasło');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.employee_accounts.update({
      where: { id: accountId },
      data: { passwordHash },
    });

    return { message: 'Hasło zostało zmienione' };
  }

  /**
   * Generuj tymczasowe hasło
   */
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
