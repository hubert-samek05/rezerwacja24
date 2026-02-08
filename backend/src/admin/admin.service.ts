import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ActivityTrackerService } from '../common/services/activity-tracker.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private activityTracker: ActivityTrackerService,
  ) {}

  /**
   * Sprawdza czy użytkownik jest SUPER_ADMIN
   */
  async checkAdminAccess(userId: string): Promise<boolean> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === 'SUPER_ADMIN';
  }

  /**
   * Pobiera statystyki platformy
   */
  async getPlatformStats() {
    this.logger.log('Pobieranie statystyk platformy');

    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      activeSubscriptions,
      trialSubscriptions,
      pastDueSubscriptions,
      invoices,
    ] = await Promise.all([
      this.prisma.tenants.count(),
      this.prisma.tenants.count({ where: { isSuspended: false } }),
      this.prisma.tenants.count({ where: { isSuspended: true } }),
      this.prisma.users.count(),
      this.prisma.subscriptions.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscriptions.count({ where: { status: 'TRIALING' } }),
      this.prisma.subscriptions.count({ where: { status: 'PAST_DUE' } }),
      this.prisma.invoices.findMany({
        where: { status: 'paid' },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    
    // Oblicz MRR (Monthly Recurring Revenue)
    const monthlyRevenue = activeSubscriptions * 79.99; // Cena planu Pro

    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      activeSubscriptions,
      trialSubscriptions,
      pastDueSubscriptions,
      monthlyRevenue,
      totalRevenue,
    };
  }

  /**
   * Pobiera listę wszystkich firm (tenants)
   */
  async getAllTenants(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      this.prisma.tenants.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            select: {
              status: true,
              trialEnd: true,
              currentPeriodEnd: true,
            },
          },
          tenant_users: {
            include: {
              users: {
                select: {
                  id: true,
                  lastLoginAt: true,
                },
              },
            },
          },
          _count: {
            select: {
              tenant_users: true,
              customers: true,
              employees: true,
            },
          },
        },
      }),
      this.prisma.tenants.count(),
    ]);

    // Pobierz dodatkowe statystyki dla każdego tenanta (rezerwacje)
    const tenantIds = tenants.map(t => t.id);
    
    // Pobierz liczbę rezerwacji dla każdego tenanta
    const bookingsCounts = await this.prisma.$queryRaw<{ tenantId: string; count: bigint }[]>`
      SELECT e."tenantId", COUNT(b.id) as count
      FROM bookings b
      JOIN employees e ON b."employeeId" = e.id
      WHERE e."tenantId" = ANY(${tenantIds})
      GROUP BY e."tenantId"
    `;
    
    const bookingsMap = new Map(bookingsCounts.map(b => [b.tenantId, Number(b.count)]));

    // Dodaj informację o statusie online używając ActivityTrackerService (in-memory cache)
    const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minut
    
    const tenantsWithOnlineStatus = tenants.map((tenant: any) => {
      // Pobierz ID wszystkich użytkowników tego tenanta
      const userIds = tenant.tenant_users
        ?.map((tu: any) => tu.users?.id)
        .filter(Boolean) || [];
      
      // Sprawdź status online z cache aktywności
      const { isOnline: trackedOnline, lastActivity: trackedActivity } = this.activityTracker.getOnlineStatusForUsers(userIds);
      
      // Fallback do lastLoginAt jeśli nie ma danych w cache
      const lastLoginActivity = tenant.tenant_users
        ?.map((tu: any) => tu.users?.lastLoginAt)
        .filter(Boolean)
        .sort((a: Date, b: Date) => new Date(b).getTime() - new Date(a).getTime())[0];
      
      // Użyj tracked activity jeśli dostępne, w przeciwnym razie lastLoginAt
      const lastActivity = trackedActivity || lastLoginActivity || null;
      
      // Sprawdź czy użytkownik jest online:
      // 1. Z cache aktywności (trackedOnline)
      // 2. LUB jeśli lastActivity (z dowolnego źródła) jest < 5 minut temu
      let isOnline = trackedOnline;
      if (!isOnline && lastActivity) {
        const activityTime = new Date(lastActivity).getTime();
        isOnline = (Date.now() - activityTime) < ONLINE_THRESHOLD_MS;
      }
      
      // Usuń szczegóły tenant_users z odpowiedzi (zostawiamy tylko _count)
      const { tenant_users, ...tenantWithoutUsers } = tenant;
      
      // Dodaj dodatkowe statystyki
      const bookingsCount = bookingsMap.get(tenant.id) || 0;
      
      // SMS - pobierz z sms_usage.used (JSON) lub smsSent jako fallback
      const smsUsage = tenant.sms_usage as { used?: number; limit?: number } | null;
      const smsUsed = smsUsage?.used || tenant.smsSent || 0;
      const smsLimit = smsUsage?.limit || 500;
      const smsBalance = tenant.smsBalance || 0;
      
      return {
        ...tenantWithoutUsers,
        isOnline,
        lastActivity,
        _count: {
          ...tenant._count,
          bookings: bookingsCount,
        },
        smsUsed,
        smsLimit,
        smsBalance,
      };
    });

    return {
      data: tenantsWithOnlineStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pobiera listę wszystkich użytkowników
   */
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          tenant_users: {
            select: {
              tenants: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.users.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pobiera listę wszystkich subskrypcji
   */
  async getAllSubscriptions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscriptions.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          tenantId: true,
          planId: true,
          status: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          stripePaymentMethodId: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          trialEnd: true,
          trialStart: true,
          lastPaymentStatus: true,
          lastPaymentError: true,
          createdAt: true,
          updatedAt: true,
          tenants: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subscription_plans: {
            select: {
              name: true,
              priceMonthly: true,
            },
          },
        },
      }),
      this.prisma.subscriptions.count(),
    ]);

    return {
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pobiera listę wszystkich faktur
   */
  async getAllInvoices(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoices.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoices.count(),
    ]);

    // Pobierz dane tenantów osobno
    const tenantIds = [...new Set(invoices.map(i => i.tenantId))];
    const tenants = await this.prisma.tenants.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true, email: true },
    });
    const tenantMap = new Map(tenants.map(t => [t.id, t]));

    const invoicesWithTenants = invoices.map(invoice => {
      const tenant = tenantMap.get(invoice.tenantId);
      return {
        ...invoice,
        tenant_name: tenant?.name || null,
        tenant_email: tenant?.email || null,
        tenants: tenant || null,
      };
    });

    return {
      data: invoicesWithTenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Zawiesza firmę (tenant)
   */
  async suspendTenant(tenantId: string, reason: string) {
    this.logger.warn(`Zawieszanie firmy ${tenantId}: ${reason}`);

    const tenant = await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        isSuspended: true,
        suspendedReason: reason,
      },
    });

    return tenant;
  }

  /**
   * Odblokowuje firmę (tenant)
   */
  async unsuspendTenant(tenantId: string) {
    this.logger.log(`Odblokowywanie firmy ${tenantId}`);

    const tenant = await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        isSuspended: false,
        suspendedReason: null,
      },
    });

    return tenant;
  }

  /**
   * Pobiera szczegóły firmy
   */
  async getTenantDetails(tenantId: string) {
    // Pobierz podstawowe dane tenanta z nowymi polami billing
    const tenantData = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, email, phone, subdomain, nip, 
             billing_type, billing_company_name, billing_first_name, billing_last_name,
             billing_address, billing_postal_code, billing_city, billing_email,
             "createdAt", "updatedAt"
      FROM tenants WHERE id = ${tenantId}
    `;

    if (!tenantData || tenantData.length === 0) {
      return null;
    }

    const tenant = tenantData[0];

    // Pobierz subskrypcję
    const subscription = await this.prisma.subscriptions.findFirst({
      where: { tenantId },
      include: { subscription_plans: true },
    });

    // Pobierz liczbę klientów i użytkowników
    const [customersCount, usersCount] = await Promise.all([
      this.prisma.customers.count({ where: { tenantId } }),
      this.prisma.tenant_users.count({ where: { tenantId } }),
    ]);

    return {
      ...tenant,
      subscription,
      _count: {
        customers: customersCount,
        tenant_users: usersCount,
      },
    };
  }
}
