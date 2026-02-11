import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface DepositSettings {
  deposit_enabled: boolean;
  deposit_mode: string; // 'always' | 'first_time_only' | 'until_visits' | 'until_spent' | 'per_service' | 'never'
  deposit_type: string; // 'percentage' | 'fixed'
  deposit_value: number;
  deposit_min_amount: number | null;
  deposit_max_amount: number | null;
  deposit_exempt_after_visits: number | null;
  deposit_exempt_after_spent: number | null;
  deposit_refund_policy: string; // 'refundable_full' | 'refundable_partial' | 'non_refundable'
  deposit_refund_hours_before: number;
  deposit_payment_deadline_hours: number;
}

export interface DepositCheckResult {
  required: boolean;
  amount: number;
  reason: string;
  deadline?: Date;
  customerStatus?: {
    isNewCustomer: boolean;
    totalBookings: number;
    totalSpent: number;
    isExempt: boolean;
    exemptReason?: string;
  };
}

@Injectable()
export class DepositsService {
  private readonly logger = new Logger(DepositsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Pobierz ustawienia zaliczek dla firmy
   */
  async getDepositSettings(tenantId: string): Promise<DepositSettings> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        deposit_enabled,
        deposit_mode,
        deposit_type,
        deposit_value,
        deposit_min_amount,
        deposit_max_amount,
        deposit_exempt_after_visits,
        deposit_exempt_after_spent,
        deposit_refund_policy,
        deposit_refund_hours_before,
        deposit_payment_deadline_hours
      FROM tenants 
      WHERE id = ${tenantId}
    `;

    if (!result || result.length === 0) {
      throw new NotFoundException('Firma nie znaleziona');
    }

    const tenant = result[0];

    return {
      deposit_enabled: tenant.deposit_enabled ?? false,
      deposit_mode: tenant.deposit_mode ?? 'always',
      deposit_type: tenant.deposit_type ?? 'percentage',
      deposit_value: parseFloat(tenant.deposit_value) || 30,
      deposit_min_amount: tenant.deposit_min_amount ? parseFloat(tenant.deposit_min_amount) : null,
      deposit_max_amount: tenant.deposit_max_amount ? parseFloat(tenant.deposit_max_amount) : null,
      deposit_exempt_after_visits: tenant.deposit_exempt_after_visits,
      deposit_exempt_after_spent: tenant.deposit_exempt_after_spent ? parseFloat(tenant.deposit_exempt_after_spent) : null,
      deposit_refund_policy: tenant.deposit_refund_policy ?? 'non_refundable',
      deposit_refund_hours_before: tenant.deposit_refund_hours_before ?? 24,
      deposit_payment_deadline_hours: tenant.deposit_payment_deadline_hours ?? 24,
    };
  }

  /**
   * Zapisz ustawienia zaliczek dla firmy
   */
  async updateDepositSettings(tenantId: string, settings: Partial<DepositSettings>): Promise<DepositSettings> {
    // Sprawdź czy firma istnieje
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Firma nie znaleziona');
    }

    // Aktualizuj ustawienia
    await this.prisma.$executeRaw`
      UPDATE tenants SET
        deposit_enabled = COALESCE(${settings.deposit_enabled}, deposit_enabled),
        deposit_mode = COALESCE(${settings.deposit_mode}, deposit_mode),
        deposit_type = COALESCE(${settings.deposit_type}, deposit_type),
        deposit_value = COALESCE(${settings.deposit_value}, deposit_value),
        deposit_min_amount = ${settings.deposit_min_amount ?? null},
        deposit_max_amount = ${settings.deposit_max_amount ?? null},
        deposit_exempt_after_visits = ${settings.deposit_exempt_after_visits ?? null},
        deposit_exempt_after_spent = ${settings.deposit_exempt_after_spent ?? null},
        deposit_refund_policy = COALESCE(${settings.deposit_refund_policy}, deposit_refund_policy),
        deposit_refund_hours_before = COALESCE(${settings.deposit_refund_hours_before}, deposit_refund_hours_before),
        deposit_payment_deadline_hours = COALESCE(${settings.deposit_payment_deadline_hours}, deposit_payment_deadline_hours),
        "updatedAt" = NOW()
      WHERE id = ${tenantId}
    `;

    this.logger.log(`Zaktualizowano ustawienia zaliczek dla tenant ${tenantId}`);

    return this.getDepositSettings(tenantId);
  }

  /**
   * Sprawdź status klienta (nowy/powracający, ile wizyt, ile wydał)
   */
  async getCustomerDepositStatus(tenantId: string, customerPhone: string): Promise<{
    isNewCustomer: boolean;
    totalBookings: number;
    totalSpent: number;
    isExempt: boolean;
    exemptReason?: string;
  }> {
    // Znajdź klienta po telefonie
    const customer = await this.prisma.customers.findFirst({
      where: {
        tenantId,
        phone: customerPhone,
      },
    });

    if (!customer) {
      return {
        isNewCustomer: true,
        totalBookings: 0,
        totalSpent: 0,
        isExempt: false,
      };
    }

    // Policz zrealizowane rezerwacje
    const completedBookings = await this.prisma.bookings.count({
      where: {
        customerId: customer.id,
        status: 'COMPLETED',
      },
    });

    // Policz sumę wydatków
    const spentResult = await this.prisma.bookings.aggregate({
      where: {
        customerId: customer.id,
        status: 'COMPLETED',
        isPaid: true,
      },
      _sum: {
        paidAmount: true,
      },
    });

    const totalSpent = parseFloat(spentResult._sum.paidAmount?.toString() || '0');

    // Pobierz ustawienia zaliczek
    const settings = await this.getDepositSettings(tenantId);

    // Sprawdź czy klient jest zwolniony
    let isExempt = false;
    let exemptReason: string | undefined;

    if (settings.deposit_mode === 'first_time_only' && completedBookings > 0) {
      isExempt = true;
      exemptReason = 'Powracający klient';
    } else if (settings.deposit_mode === 'until_visits' && settings.deposit_exempt_after_visits) {
      if (completedBookings >= settings.deposit_exempt_after_visits) {
        isExempt = true;
        exemptReason = `Ponad ${settings.deposit_exempt_after_visits} wizyt`;
      }
    } else if (settings.deposit_mode === 'until_spent' && settings.deposit_exempt_after_spent) {
      if (totalSpent >= settings.deposit_exempt_after_spent) {
        isExempt = true;
        exemptReason = `Wydano ponad ${settings.deposit_exempt_after_spent} PLN`;
      }
    }

    return {
      isNewCustomer: completedBookings === 0,
      totalBookings: completedBookings,
      totalSpent,
      isExempt,
      exemptReason,
    };
  }

  /**
   * Oblicz kwotę zaliczki
   */
  calculateDepositAmount(settings: DepositSettings, totalPrice: number): number {
    let amount: number;

    if (settings.deposit_type === 'fixed') {
      amount = settings.deposit_value;
    } else {
      // percentage
      amount = (totalPrice * settings.deposit_value) / 100;
    }

    // Zastosuj min/max
    if (settings.deposit_min_amount && amount < settings.deposit_min_amount) {
      amount = settings.deposit_min_amount;
    }
    if (settings.deposit_max_amount && amount > settings.deposit_max_amount) {
      amount = settings.deposit_max_amount;
    }

    // Zaokrąglij do 2 miejsc po przecinku
    return Math.round(amount * 100) / 100;
  }

  /**
   * Sprawdź czy zaliczka jest wymagana dla danej rezerwacji
   */
  async checkDepositRequired(
    tenantId: string,
    serviceId: string,
    totalPrice: number,
    customerPhone?: string,
  ): Promise<DepositCheckResult> {
    const settings = await this.getDepositSettings(tenantId);

    // Jeśli zaliczki wyłączone
    if (!settings.deposit_enabled) {
      return {
        required: false,
        amount: 0,
        reason: 'Zaliczki wyłączone',
      };
    }

    // Jeśli tryb 'never'
    if (settings.deposit_mode === 'never') {
      return {
        required: false,
        amount: 0,
        reason: 'Zaliczki wyłączone (tryb: nigdy)',
      };
    }

    // Sprawdź ustawienia usługi (per_service mode)
    if (settings.deposit_mode === 'per_service') {
      const service = await this.prisma.services.findUnique({
        where: { id: serviceId },
      });

      if (!service || !service.requiresDeposit) {
        return {
          required: false,
          amount: 0,
          reason: 'Usługa nie wymaga zaliczki',
        };
      }

      // Użyj kwoty z usługi jeśli ustawiona
      const depositAmount = parseFloat(service.depositAmount?.toString() || '0');
      if (depositAmount > 0) {
        return {
          required: true,
          amount: depositAmount,
          reason: 'Zaliczka wymagana dla tej usługi',
          deadline: this.calculateDeadline(settings.deposit_payment_deadline_hours),
        };
      }
    }

    // Sprawdź status klienta
    let customerStatus;
    if (customerPhone) {
      customerStatus = await this.getCustomerDepositStatus(tenantId, customerPhone);

      if (customerStatus.isExempt) {
        return {
          required: false,
          amount: 0,
          reason: customerStatus.exemptReason || 'Klient zwolniony z zaliczki',
          customerStatus,
        };
      }
    }

    // Oblicz kwotę zaliczki
    const amount = this.calculateDepositAmount(settings, totalPrice);

    return {
      required: true,
      amount,
      reason: this.getDepositReason(settings),
      deadline: this.calculateDeadline(settings.deposit_payment_deadline_hours),
      customerStatus,
    };
  }

  /**
   * Pobierz status zaliczki dla rezerwacji
   */
  async getBookingDepositStatus(bookingId: string): Promise<{
    deposit_required: boolean;
    deposit_amount: number | null;
    deposit_status: string;
    deposit_paid_at: Date | null;
    deposit_payment_method: string | null;
    deposit_deadline: Date | null;
  }> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        deposit_required,
        deposit_amount,
        deposit_status,
        deposit_paid_at,
        deposit_payment_method,
        deposit_deadline
      FROM bookings 
      WHERE id = ${bookingId}
    `;

    if (!result || result.length === 0) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    const booking = result[0];

    return {
      deposit_required: booking.deposit_required ?? false,
      deposit_amount: booking.deposit_amount ? parseFloat(booking.deposit_amount) : null,
      deposit_status: booking.deposit_status ?? 'not_required',
      deposit_paid_at: booking.deposit_paid_at,
      deposit_payment_method: booking.deposit_payment_method,
      deposit_deadline: booking.deposit_deadline,
    };
  }

  /**
   * Oznacz zaliczkę jako opłaconą
   */
  async markDepositPaid(
    bookingId: string,
    paymentId: string,
    paymentMethod: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE bookings SET
        deposit_status = 'paid',
        deposit_paid_at = NOW(),
        deposit_payment_id = ${paymentId},
        deposit_payment_method = ${paymentMethod},
        "updatedAt" = NOW()
      WHERE id = ${bookingId}
    `;

    this.logger.log(`Zaliczka opłacona dla rezerwacji ${bookingId}`);
  }

  /**
   * Zwrot zaliczki
   */
  async refundDeposit(
    bookingId: string,
    refundAmount: number,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE bookings SET
        deposit_status = 'refunded',
        deposit_refunded_at = NOW(),
        deposit_refund_amount = ${refundAmount},
        "updatedAt" = NOW()
      WHERE id = ${bookingId}
    `;

    this.logger.log(`Zaliczka zwrócona dla rezerwacji ${bookingId}: ${refundAmount} PLN`);
  }

  // ============ HELPERS ============

  private calculateDeadline(hoursFromNow: number): Date {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hoursFromNow);
    return deadline;
  }

  private getDepositReason(settings: DepositSettings): string {
    switch (settings.deposit_mode) {
      case 'always':
        return 'Zaliczka wymagana dla wszystkich rezerwacji';
      case 'first_time_only':
        return 'Zaliczka wymagana dla nowych klientów';
      case 'until_visits':
        return `Zaliczka wymagana do ${settings.deposit_exempt_after_visits} wizyt`;
      case 'until_spent':
        return `Zaliczka wymagana do wydania ${settings.deposit_exempt_after_spent} PLN`;
      default:
        return 'Zaliczka wymagana';
    }
  }
}
