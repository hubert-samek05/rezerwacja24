import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  UpdateCustomerProfileDto,
} from './dto/customer-auth.dto';

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Generowanie ID
  private generateId(): string {
    return `ca-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  // Hashowanie hasła
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Weryfikacja hasła
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generowanie tokenów
  private generateTokens(customerAccountId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: customerAccountId, email, type: 'customer' },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: customerAccountId, type: 'customer_refresh' },
      { expiresIn: '30d' },
    );

    return { accessToken, refreshToken };
  }

  // Generowanie tokenu weryfikacyjnego
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ==================== REJESTRACJA ====================
  async register(dto: RegisterCustomerDto) {
    this.logger.log(`Registering customer: ${dto.email}`);

    // Sprawdź czy email już istnieje
    const existingAccount = await this.prisma.customer_accounts.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingAccount) {
      throw new ConflictException('Konto z tym adresem email już istnieje');
    }

    // Hashuj hasło
    const passwordHash = await this.hashPassword(dto.password);

    // Utwórz konto
    const customerAccount = await this.prisma.customer_accounts.create({
      data: {
        id: this.generateId(),
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        marketingConsent: dto.marketingConsent || false,
        emailVerified: false, // Wymaga weryfikacji
        authProvider: 'email',
      },
    });

    // TODO: Wyślij email weryfikacyjny
    // const verificationToken = this.generateVerificationToken();
    // await this.sendVerificationEmail(customerAccount.email, verificationToken);

    // Na razie automatycznie weryfikujemy (do zmiany po dodaniu wysyłki emaili)
    await this.prisma.customer_accounts.update({
      where: { id: customerAccount.id },
      data: { emailVerified: true },
    });

    // Generuj tokeny
    const tokens = this.generateTokens(customerAccount.id, customerAccount.email);

    // Zapisz refresh token (zahashowany)
    const hashedRefreshToken = await this.hashPassword(tokens.refreshToken);
    await this.prisma.customer_accounts.update({
      where: { id: customerAccount.id },
      data: { refreshToken: hashedRefreshToken },
    });

    this.logger.log(`Customer registered: ${customerAccount.id}`);

    return {
      message: 'Konto zostało utworzone',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      customer: {
        id: customerAccount.id,
        email: customerAccount.email,
        firstName: customerAccount.firstName,
        lastName: customerAccount.lastName,
        emailVerified: true, // Na razie true
      },
    };
  }

  // ==================== LOGOWANIE ====================
  async login(dto: LoginCustomerDto) {
    this.logger.log(`Login attempt: ${dto.email}`);

    const customerAccount = await this.prisma.customer_accounts.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!customerAccount) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    if (!customerAccount.passwordHash) {
      throw new UnauthorizedException(
        'To konto używa logowania przez social media. Użyj Google, Facebook lub Apple.',
      );
    }

    const isPasswordValid = await this.verifyPassword(
      dto.password,
      customerAccount.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Generuj tokeny
    const tokens = this.generateTokens(customerAccount.id, customerAccount.email);

    // Zapisz refresh token i ostatnie logowanie
    const hashedRefreshToken = await this.hashPassword(tokens.refreshToken);
    await this.prisma.customer_accounts.update({
      where: { id: customerAccount.id },
      data: {
        refreshToken: hashedRefreshToken,
        lastLoginAt: new Date(),
      },
    });

    this.logger.log(`Customer logged in: ${customerAccount.id}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      customer: {
        id: customerAccount.id,
        email: customerAccount.email,
        firstName: customerAccount.firstName,
        lastName: customerAccount.lastName,
        avatar: customerAccount.avatar,
        emailVerified: customerAccount.emailVerified,
      },
    };
  }

  // ==================== REFRESH TOKEN ====================
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'customer_refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const customerAccount = await this.prisma.customer_accounts.findUnique({
        where: { id: payload.sub },
      });

      if (!customerAccount || !customerAccount.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Weryfikuj refresh token
      const isValid = await this.verifyPassword(
        refreshToken,
        customerAccount.refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generuj nowe tokeny
      const tokens = this.generateTokens(customerAccount.id, customerAccount.email);

      // Zapisz nowy refresh token
      const hashedRefreshToken = await this.hashPassword(tokens.refreshToken);
      await this.prisma.customer_accounts.update({
        where: { id: customerAccount.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ==================== WYLOGOWANIE ====================
  async logout(customerAccountId: string) {
    await this.prisma.customer_accounts.update({
      where: { id: customerAccountId },
      data: { refreshToken: null },
    });

    return { message: 'Wylogowano pomyślnie' };
  }

  // ==================== PROFIL ====================
  async getProfile(customerAccountId: string) {
    const customerAccount = await this.prisma.customer_accounts.findUnique({
      where: { id: customerAccountId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        preferredLanguage: true,
        marketingConsent: true,
        emailVerified: true,
        phoneVerified: true,
        authProvider: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!customerAccount) {
      throw new UnauthorizedException('Konto nie istnieje');
    }

    return customerAccount;
  }

  async updateProfile(customerAccountId: string, dto: UpdateCustomerProfileDto) {
    const customerAccount = await this.prisma.customer_accounts.update({
      where: { id: customerAccountId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        preferredLanguage: dto.preferredLanguage,
        marketingConsent: dto.marketingConsent,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        preferredLanguage: true,
        marketingConsent: true,
      },
    });

    return customerAccount;
  }

  // ==================== REZERWACJE KLIENTA ====================
  async getMyBookings(customerAccountId: string) {
    // Znajdź wszystkie profile klienta (customers) powiązane z tym kontem
    const customers = await this.prisma.customers.findMany({
      where: { customerAccountId },
      select: { id: true },
    });

    const customerIds = customers.map((c) => c.id);

    if (customerIds.length === 0) {
      return { upcoming: [], past: [], cancelled: [] };
    }

    const now = new Date();

    // Pobierz wszystkie rezerwacje
    const bookings = await this.prisma.bookings.findMany({
      where: {
        customerId: { in: customerIds },
      },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            duration: true,
            basePrice: true,
          },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        customers: {
          select: {
            tenantId: true,
            tenants: {
              select: {
                id: true,
                name: true,
                subdomain: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // Podziel na kategorie
    const upcoming = bookings.filter(
      (b) => b.startTime > now && b.status !== 'CANCELLED',
    );
    const past = bookings.filter(
      (b) => b.startTime <= now && b.status !== 'CANCELLED',
    );
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

    return {
      upcoming: upcoming.map(this.formatBooking),
      past: past.map(this.formatBooking),
      cancelled: cancelled.map(this.formatBooking),
    };
  }

  private formatBooking(booking: any) {
    return {
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      totalPrice: booking.totalPrice,
      service: booking.services,
      employee: booking.employees,
      business: booking.customers?.tenants
        ? {
            id: booking.customers.tenants.id,
            name: booking.customers.tenants.name,
            subdomain: booking.customers.tenants.subdomain,
            logo: booking.customers.tenants.logo,
          }
        : null,
    };
  }

  // ==================== PUNKTY LOJALNOŚCIOWE ====================
  async getMyLoyaltyPoints(customerAccountId: string) {
    // Znajdź wszystkie profile klienta powiązane z tym kontem
    const customers = await this.prisma.customers.findMany({
      where: { customerAccountId },
      select: { id: true, tenantId: true },
    });

    if (customers.length === 0) {
      return [];
    }

    const customerIds = customers.map((c) => c.id);

    // Pobierz punkty lojalnościowe dla każdej firmy
    const loyaltyPoints = await this.prisma.loyalty_points.findMany({
      where: { customerId: { in: customerIds } },
      include: {
        customers: {
          select: {
            tenantId: true,
            tenants: {
              select: {
                id: true,
                name: true,
                subdomain: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    // Grupuj punkty per firma
    const pointsByBusiness: Record<string, { business: any; points: number; history: any[] }> = {};
    
    for (const lp of loyaltyPoints) {
      const tenantId = lp.customers?.tenantId;
      if (!tenantId) continue;
      
      if (!pointsByBusiness[tenantId]) {
        pointsByBusiness[tenantId] = {
          business: lp.customers?.tenants || null,
          points: 0,
          history: [],
        };
      }
      pointsByBusiness[tenantId].points += Number(lp.points);
      pointsByBusiness[tenantId].history.push({
        id: lp.id,
        points: lp.points,
        reason: lp.reason,
        createdAt: lp.createdAt,
      });
    }

    return Object.values(pointsByBusiness);
  }

  // ==================== KARNETY KLIENTA ====================
  async getMyPasses(customerAccountId: string) {
    // Znajdź wszystkie profile klienta powiązane z tym kontem
    const customers = await this.prisma.customers.findMany({
      where: { customerAccountId },
      select: { id: true },
    });

    if (customers.length === 0) {
      return { active: [], expired: [] };
    }

    const customerIds = customers.map((c) => c.id);
    const now = new Date();

    // Pobierz karnety klienta
    const passes = await this.prisma.customer_passes.findMany({
      where: { customerId: { in: customerIds } },
      include: {
        passType: {
          select: {
            id: true,
            name: true,
            passKind: true,
            visitsCount: true,
            validityDays: true,
            price: true,
            tenantId: true,
          },
        },
        customer: {
          select: {
            tenantId: true,
            tenants: {
              select: {
                id: true,
                name: true,
                subdomain: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    const active = passes.filter((p) => {
      if (p.status !== 'ACTIVE') return false;
      if (p.expiresAt && p.expiresAt < now) return false;
      if (p.passType?.passKind === 'VISITS' && p.visitsTotal !== null && p.visitsUsed >= p.visitsTotal) return false;
      return true;
    });

    const expired = passes.filter((p) => {
      if (p.status === 'EXPIRED' || p.status === 'CANCELLED') return true;
      if (p.expiresAt && p.expiresAt < now) return true;
      if (p.passType?.passKind === 'VISITS' && p.visitsTotal !== null && p.visitsUsed >= p.visitsTotal) return true;
      return false;
    });

    const formatPass = (pass: any) => ({
      id: pass.id,
      name: pass.passType?.name,
      type: pass.passType?.passKind,
      totalUses: pass.visitsTotal,
      usesRemaining: pass.visitsTotal ? pass.visitsTotal - pass.visitsUsed : null,
      expiresAt: pass.expiresAt,
      purchasedAt: pass.purchaseDate,
      status: pass.status,
      business: pass.customer?.tenants || null,
    });

    return {
      active: active.map(formatPass),
      expired: expired.map(formatPass),
    };
  }

  // ==================== WERYFIKACJA TOKENU ====================
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'customer') {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  // ==================== SZCZEGÓŁY REZERWACJI ====================
  async getBookingDetails(customerAccountId: string, bookingId: string) {
    const customers = await this.prisma.customers.findMany({
      where: { customerAccountId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const booking = await this.prisma.bookings.findFirst({
      where: { 
        id: bookingId,
        customerId: { in: customerIds },
      },
      include: {
        services: true,
        employees: true,
        customers: {
          include: { tenants: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie została znaleziona');
    }

    const tenant = booking.customers?.tenants;
    const pageSettings = (tenant as any)?.pageSettings || {};
    
    const cancelDeadlineHours = pageSettings.minCancellationHours ?? 0;
    const allowReschedule = pageSettings.allowReschedule !== false;
    const rescheduleDeadlineHours = pageSettings.minRescheduleHours ?? cancelDeadlineHours;
    
    const bookingTime = new Date(booking.startTime).getTime();
    const now = Date.now();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    
    const hasDeposit = (booking as any).depositAmount > 0;
    const isPast = bookingTime < now;
    const isCancelled = booking.status === 'CANCELLED';
    const isCompleted = booking.status === 'COMPLETED';
    
    const canCancel = !isPast && !isCancelled && !isCompleted && 
      (hasDeposit || hoursUntilBooking >= cancelDeadlineHours);
    
    const canReschedule = !isPast && !isCancelled && !isCompleted && 
      allowReschedule && hoursUntilBooking >= rescheduleDeadlineHours;

    return {
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      totalPrice: booking.totalPrice,
      notes: (booking as any).customerNotes || null,
      service: booking.services ? {
        id: booking.services.id,
        name: booking.services.name,
        duration: booking.services.duration,
        price: booking.services.basePrice,
      } : null,
      employee: booking.employees ? {
        id: booking.employees.id,
        firstName: booking.employees.firstName,
        lastName: booking.employees.lastName,
        avatar: booking.employees.avatar,
      } : null,
      business: tenant ? {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        logo: tenant.logo,
        phone: (tenant as any).phone,
        email: (tenant as any).email,
        address: (tenant as any).address,
      } : null,
      canCancel,
      canReschedule,
      cancelDeadlineHours,
      rescheduleDeadlineHours,
      hasDeposit,
      depositAmount: (booking as any).depositAmount || 0,
      hoursUntilBooking: Math.max(0, Math.floor(hoursUntilBooking)),
    };
  }

  async cancelBooking(customerAccountId: string, bookingId: string, reason?: string) {
    const details = await this.getBookingDetails(customerAccountId, bookingId);
    
    if (!details.canCancel) {
      if (details.status === 'CANCELLED') {
        throw new BadRequestException('Ta rezerwacja została już anulowana');
      }
      if (details.hoursUntilBooking < details.cancelDeadlineHours) {
        throw new BadRequestException(
          `Anulowanie jest możliwe do ${details.cancelDeadlineHours} godzin przed wizytą`
        );
      }
      throw new BadRequestException('Nie można anulować tej rezerwacji');
    }

    await this.prisma.bookings.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'customer',
        cancellationReason: reason || 'Anulowano przez klienta',
      },
    });

    return { 
      success: true, 
      message: details.hasDeposit ? 'Rezerwacja anulowana. Zaliczka nie podlega zwrotowi.' : 'Rezerwacja anulowana',
      depositLost: details.hasDeposit ? details.depositAmount : 0,
    };
  }

  async getRescheduleLink(customerAccountId: string, bookingId: string) {
    const details = await this.getBookingDetails(customerAccountId, bookingId);
    
    if (!details.canReschedule) {
      if (details.hoursUntilBooking < details.rescheduleDeadlineHours) {
        throw new BadRequestException(
          `Przesunięcie możliwe do ${details.rescheduleDeadlineHours}h przed wizytą`
        );
      }
      throw new BadRequestException('Nie można przesunąć tej rezerwacji');
    }

    const subdomain = details.business?.subdomain;
    if (!subdomain) {
      throw new BadRequestException('Nie można wygenerować linku');
    }

    return {
      success: true,
      rescheduleUrl: `https://${subdomain}.rezerwacja24.pl/reschedule/${bookingId}`,
      currentBooking: {
        startTime: details.startTime,
        serviceName: details.service?.name,
        employeeName: details.employee ? `${details.employee.firstName} ${details.employee.lastName}` : null,
      },
    };
  }
}
