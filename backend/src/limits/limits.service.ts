import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface LimitCheckResult {
  canProceed: boolean;
  current: number;
  limit: number | null; // null = unlimited
  remaining: number | null;
  percentUsed: number;
  message?: string;
}

export interface PlanLimits {
  bookings: number | null;
  employees: number | null;
  sms: number | null;
}

@Injectable()
export class LimitsService {
  private readonly logger = new Logger(LimitsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Pobiera limity z planu subskrypcji dla tenanta
   * WAŻNE: Jeśli jest zaplanowany downgrade (previousPlanId), używa limitów z poprzedniego planu
   * do końca aktualnego okresu rozliczeniowego
   */
  async getPlanLimits(tenantId: string): Promise<PlanLimits> {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
      include: { subscription_plans: true },
    });

    if (!subscription || !subscription.subscription_plans) {
      // Brak subskrypcji - zwróć minimalne limity (jak Starter)
      this.logger.warn(`No subscription found for tenant ${tenantId}, using minimal limits`);
      return {
        bookings: 100,
        employees: 1,
        sms: 0,
      };
    }

    let features: any;

    // Sprawdź czy jest zaplanowany downgrade (previousPlanId ustawiony)
    if (subscription.previousPlanId && subscription.currentPeriodEnd) {
      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);
      
      // Jeśli jesteśmy przed końcem okresu, użyj poprzedniego (wyższego) planu
      if (now < periodEnd) {
        const previousPlan = await this.prisma.subscription_plans.findUnique({
          where: { id: subscription.previousPlanId },
        });
        
        if (previousPlan) {
          this.logger.debug(`Using previous plan ${previousPlan.name} limits for tenant ${tenantId} until ${periodEnd}`);
          features = previousPlan.features as any;
        }
      }
    }

    // Jeśli nie ma poprzedniego planu lub okres się skończył, użyj aktualnego
    if (!features) {
      features = subscription.subscription_plans.features as any;
    }
    
    return {
      bookings: features.bookings === -1 ? null : features.bookings,
      employees: features.employees === -1 ? null : features.employees,
      sms: features.sms === -1 ? null : features.sms,
    };
  }

  /**
   * Sprawdza limit rezerwacji dla tenanta
   */
  async checkBookingLimit(tenantId: string): Promise<LimitCheckResult> {
    const limits = await this.getPlanLimits(tenantId);
    
    // Unlimited
    if (limits.bookings === null) {
      return {
        canProceed: true,
        current: 0,
        limit: null,
        remaining: null,
        percentUsed: 0,
      };
    }

    // Policz rezerwacje z bieżącego miesiąca
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const bookingsCount = await this.prisma.bookings.count({
      where: {
        customers: { tenantId },
        createdAt: { gte: startOfMonth },
        status: { not: 'CANCELLED' },
      },
    });

    const remaining = limits.bookings - bookingsCount;
    const percentUsed = Math.round((bookingsCount / limits.bookings) * 100);

    return {
      canProceed: remaining > 0,
      current: bookingsCount,
      limit: limits.bookings,
      remaining: Math.max(0, remaining),
      percentUsed: Math.min(100, percentUsed),
      message: remaining <= 0 
        ? `Osiągnięto limit ${limits.bookings} rezerwacji w tym miesiącu. Ulepsz plan aby kontynuować.`
        : remaining <= 10 
          ? `Pozostało tylko ${remaining} rezerwacji w tym miesiącu.`
          : undefined,
    };
  }

  /**
   * Sprawdza limit pracowników dla tenanta
   */
  async checkEmployeeLimit(tenantId: string): Promise<LimitCheckResult> {
    const limits = await this.getPlanLimits(tenantId);
    
    // Unlimited
    if (limits.employees === null) {
      return {
        canProceed: true,
        current: 0,
        limit: null,
        remaining: null,
        percentUsed: 0,
      };
    }

    // Policz aktywnych pracowników
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    const userIds = tenantUsers.map(tu => tu.userId);

    const employeesCount = await this.prisma.employees.count({
      where: {
        userId: { in: userIds },
        isActive: true,
      },
    });

    const remaining = limits.employees - employeesCount;
    const percentUsed = Math.round((employeesCount / limits.employees) * 100);

    return {
      canProceed: remaining > 0,
      current: employeesCount,
      limit: limits.employees,
      remaining: Math.max(0, remaining),
      percentUsed: Math.min(100, percentUsed),
      message: remaining <= 0 
        ? `Osiągnięto limit ${limits.employees} pracowników. Ulepsz plan aby dodać więcej.`
        : undefined,
    };
  }

  /**
   * Sprawdza limit SMS dla tenanta (używa istniejącego sms_usage)
   */
  async checkSmsLimit(tenantId: string): Promise<LimitCheckResult> {
    const limits = await this.getPlanLimits(tenantId);
    
    // Pobierz aktualne użycie SMS z tenanta
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_usage: true },
    });

    const smsUsage = (tenant?.sms_usage as any) || { used: 0, limit: limits.sms || 0 };
    const used = smsUsage.used || 0;
    
    // Użyj limitu z planu (nadpisuje stary limit w sms_usage)
    const limit = limits.sms;
    
    if (limit === null) {
      return {
        canProceed: true,
        current: used,
        limit: null,
        remaining: null,
        percentUsed: 0,
      };
    }

    const remaining = limit - used;
    const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return {
      canProceed: remaining > 0,
      current: used,
      limit,
      remaining: Math.max(0, remaining),
      percentUsed: Math.min(100, percentUsed),
      message: remaining <= 0 
        ? `Wykorzystano limit ${limit} SMS w tym miesiącu. Ulepsz plan aby wysyłać więcej.`
        : remaining <= 20 
          ? `Pozostało tylko ${remaining} SMS w tym miesiącu.`
          : undefined,
    };
  }

  /**
   * Pobiera wszystkie limity i ich wykorzystanie dla tenanta
   */
  async getAllLimitsUsage(tenantId: string): Promise<{
    bookings: LimitCheckResult;
    employees: LimitCheckResult;
    sms: LimitCheckResult;
    planName: string;
    planSlug: string;
    nextPlanName?: string;
    periodEnd?: string;
  }> {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
      include: { subscription_plans: true },
    });

    const [bookings, employees, sms] = await Promise.all([
      this.checkBookingLimit(tenantId),
      this.checkEmployeeLimit(tenantId),
      this.checkSmsLimit(tenantId),
    ]);

    // Sprawdź czy jest zaplanowany downgrade
    let activePlanName = subscription?.subscription_plans?.name || 'Brak planu';
    let activePlanSlug = subscription?.subscription_plans?.slug || 'none';
    let nextPlanName: string | undefined;
    let periodEnd: string | undefined;

    if (subscription?.previousPlanId && subscription.currentPeriodEnd) {
      const now = new Date();
      const periodEndDate = new Date(subscription.currentPeriodEnd);
      
      if (now < periodEndDate) {
        // Użytkownik ma zaplanowany downgrade - pokaż poprzedni plan jako aktywny
        const previousPlan = await this.prisma.subscription_plans.findUnique({
          where: { id: subscription.previousPlanId },
        });
        
        if (previousPlan) {
          activePlanName = previousPlan.name;
          activePlanSlug = previousPlan.slug || previousPlan.id;
          nextPlanName = subscription.subscription_plans?.name;
          periodEnd = subscription.currentPeriodEnd.toISOString();
        }
      }
    }

    return {
      bookings,
      employees,
      sms,
      planName: activePlanName,
      planSlug: activePlanSlug,
      nextPlanName,
      periodEnd,
    };
  }

  /**
   * Sprawdza czy tenant może wykonać downgrade do niższego planu
   * Zwraca listę problemów jeśli downgrade nie jest możliwy
   */
  async canDowngradeToPlan(tenantId: string, newPlanId: string): Promise<{
    canDowngrade: boolean;
    issues: string[];
  }> {
    const newPlan = await this.prisma.subscription_plans.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      return { canDowngrade: false, issues: ['Plan nie istnieje'] };
    }

    const newFeatures = newPlan.features as any;
    const issues: string[] = [];

    // Sprawdź pracowników
    if (newFeatures.employees !== -1) {
      const employeeCheck = await this.checkEmployeeLimit(tenantId);
      if (employeeCheck.current > newFeatures.employees) {
        issues.push(
          `Masz ${employeeCheck.current} pracowników, a plan ${newPlan.name} pozwala na maksymalnie ${newFeatures.employees}. ` +
          `Dezaktywuj ${employeeCheck.current - newFeatures.employees} pracowników przed zmianą planu.`
        );
      }
    }

    // Sprawdź rezerwacje (tylko ostrzeżenie, nie blokujemy)
    if (newFeatures.bookings !== -1) {
      const bookingCheck = await this.checkBookingLimit(tenantId);
      if (bookingCheck.current > newFeatures.bookings) {
        // To tylko ostrzeżenie - rezerwacje z tego miesiąca pozostaną
        this.logger.warn(
          `Tenant ${tenantId} has ${bookingCheck.current} bookings this month, ` +
          `new plan ${newPlan.name} allows ${newFeatures.bookings}. ` +
          `Existing bookings will remain, but new ones may be blocked.`
        );
      }
    }

    return {
      canDowngrade: issues.length === 0,
      issues,
    };
  }

  /**
   * Aktualizuje limit SMS w tenants.sms_usage na podstawie nowego planu
   */
  async updateSmsLimitForPlan(tenantId: string, planId: string): Promise<void> {
    const plan = await this.prisma.subscription_plans.findUnique({
      where: { id: planId },
    });

    if (!plan) return;

    const features = plan.features as any;
    const newLimit = features.sms === -1 ? 999999 : features.sms;

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_usage: true },
    });

    const currentUsage = (tenant?.sms_usage as any) || { used: 0 };

    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        sms_usage: {
          used: currentUsage.used,
          limit: newLimit,
          lastReset: currentUsage.lastReset || new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Updated SMS limit for tenant ${tenantId} to ${newLimit}`);
  }

  /**
   * Wymusza sprawdzenie limitu i rzuca wyjątek jeśli przekroczony
   */
  async enforceBookingLimit(tenantId: string): Promise<void> {
    const check = await this.checkBookingLimit(tenantId);
    if (!check.canProceed) {
      throw new ForbiddenException(check.message);
    }
  }

  /**
   * Wymusza sprawdzenie limitu pracowników i rzuca wyjątek jeśli przekroczony
   */
  async enforceEmployeeLimit(tenantId: string): Promise<void> {
    const check = await this.checkEmployeeLimit(tenantId);
    if (!check.canProceed) {
      throw new ForbiddenException(check.message);
    }
  }
}
