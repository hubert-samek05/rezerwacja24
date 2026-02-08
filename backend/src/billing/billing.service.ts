import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { LimitsService } from '../limits/limits.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private limitsService: LimitsService,
  ) {}

  /**
   * Pobiera aktywny plan subskrypcji (domyślnie Pro - dla kompatybilności wstecznej)
   */
  async getActivePlan() {
    const plan = await this.prisma.subscription_plans.findFirst({
      where: { isActive: true, slug: 'pro' },
    });

    if (!plan) {
      throw new NotFoundException('Brak aktywnego planu subskrypcji');
    }

    return plan;
  }

  /**
   * Pobiera wszystkie aktywne plany subskrypcji
   */
  async getAllPlans() {
    const plans = await this.prisma.subscription_plans.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    // Dodaj informacje o wyróżnieniu i sortowaniu
    return plans.map(plan => {
      const features = plan.features as any;
      return {
        ...plan,
        tier: features.tier || 1,
        displayOrder: features.displayOrder || 1,
        isHighlighted: features.isHighlighted || false,
        limits: {
          bookings: features.bookings === -1 ? null : features.bookings,
          employees: features.employees === -1 ? null : features.employees,
          sms: features.sms === -1 ? null : features.sms,
        },
      };
    });
  }

  /**
   * Pobiera plan po ID
   */
  async getPlanById(planId: string) {
    const plan = await this.prisma.subscription_plans.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan nie istnieje');
    }

    return plan;
  }

  /**
   * Pobiera plan po slug
   */
  async getPlanBySlug(slug: string) {
    const plan = await this.prisma.subscription_plans.findFirst({
      where: { slug, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Plan nie istnieje');
    }

    return plan;
  }

  /**
   * Pobiera subskrypcję dla danego tenanta
   */
  async getSubscription(tenantId: string) {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
      include: {
        subscription_plans: true,
        tenants: true,
      },
    });

    return subscription;
  }

  /**
   * Sprawdza czy tenant ma aktywną subskrypcję
   * WYMAGA podanej karty płatniczej (stripePaymentMethodId)
   */
  async hasActiveSubscription(tenantId: string): Promise<boolean> {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      return false;
    }

    // Aktywna subskrypcja wymaga:
    // 1. Statusu ACTIVE lub TRIALING
    // 2. Podanej karty płatniczej (stripePaymentMethodId)
    const hasValidStatus = ['ACTIVE', 'TRIALING'].includes(subscription.status);
    const hasPaymentMethod = !!subscription.stripePaymentMethodId;

    return hasValidStatus && hasPaymentMethod;
  }

  /**
   * Sprawdza czy tenant jest w okresie próbnym
   */
  async isInTrial(tenantId: string): Promise<boolean> {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      return false;
    }

    return subscription.status === 'TRIALING';
  }

  /**
   * Pobiera pozostałe dni okresu próbnego
   */
  async getRemainingTrialDays(tenantId: string): Promise<number> {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
    });

    if (!subscription || !subscription.trialEnd) {
      return 0;
    }

    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Tworzy checkout session dla nowej subskrypcji
   * @param planId - opcjonalny ID planu (domyślnie Pro)
   */
  async createCheckoutSession(tenantId: string, email: string, planId?: string) {
    let plan;
    
    if (planId) {
      plan = await this.getPlanById(planId);
    } else {
      plan = await this.getActivePlan();
    }
    
    const baseUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';

    return this.stripeService.createCheckoutSession({
      tenantId,
      planId: plan.id,
      email,
      successUrl: `${baseUrl}/payment/success`,
      cancelUrl: `${baseUrl}/subscription/setup?canceled=true`,
    });
  }

  /**
   * Tworzy billing portal session
   */
  async createBillingPortalSession(tenantId: string) {
    const baseUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';
    return this.stripeService.createBillingPortalSession(
      tenantId,
      `${baseUrl}/dashboard/settings/subscription`,
    );
  }

  /**
   * Anuluje subskrypcję
   */
  async cancelSubscription(tenantId: string) {
    return this.stripeService.cancelSubscription(tenantId);
  }

  /**
   * Wznawia subskrypcję
   */
  async resumeSubscription(tenantId: string) {
    return this.stripeService.resumeSubscription(tenantId);
  }

  /**
   * Pobiera szczegóły subskrypcji
   */
  async getSubscriptionDetails(tenantId: string) {
    return this.stripeService.getSubscriptionDetails(tenantId);
  }

  /**
   * Synchronizuje subskrypcję ze Stripe (ręcznie)
   */
  async syncSubscriptionFromStripe(tenantId: string) {
    // Deleguj do StripeService który ma pełną logikę synchronizacji
    return this.stripeService.syncSubscriptionFromStripe(tenantId);
  }

  /**
   * Pobiera statystyki subskrypcji
   */
  async getSubscriptionStats() {
    const [total, active, trialing, pastDue, cancelled] = await Promise.all([
      this.prisma.subscriptions.count(),
      this.prisma.subscriptions.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscriptions.count({ where: { status: 'TRIALING' } }),
      this.prisma.subscriptions.count({ where: { status: 'PAST_DUE' } }),
      this.prisma.subscriptions.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      total,
      active,
      trialing,
      pastDue,
      cancelled,
    };
  }

  /**
   * Pobiera historię płatności ze Stripe + faktury z lokalnej bazy (dodane przez admina)
   */
  async getInvoices(tenantId: string) {
    // Pobierz subskrypcję aby uzyskać stripeCustomerId
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
    });

    if (!subscription?.stripeCustomerId) {
      return [];
    }

    try {
      // Pobierz płatności (invoices) ze Stripe
      const stripeInvoices = await this.stripeService.getStripeInvoices(subscription.stripeCustomerId);
      
      // Pobierz faktury dodane przez admina z lokalnej bazy
      const localInvoices = await this.prisma.invoices.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      // Połącz dane - dla każdej płatności ze Stripe sprawdź czy jest faktura w bazie
      return stripeInvoices.map(stripeInv => {
        // Szukaj faktury w lokalnej bazie po stripeInvoiceId lub dacie
        const localInvoice = localInvoices.find(
          li => li.stripeInvoiceId === stripeInv.id
        );

        return {
          id: stripeInv.id,
          amount: stripeInv.amount,
          currency: stripeInv.currency,
          status: stripeInv.status,
          invoiceUrl: localInvoice?.invoiceUrl || null, // Faktura tylko jeśli admin dodał
          invoicePdf: localInvoice?.invoicePdf || null, // PDF tylko jeśli admin dodał
          paidAt: stripeInv.paidAt,
          createdAt: stripeInv.createdAt,
        };
      });
    } catch (error) {
      this.logger.error('Błąd podczas pobierania historii płatności:', error);
      return [];
    }
  }

  /**
   * Sprawdza czy można zmienić plan (downgrade)
   */
  async canChangePlan(tenantId: string, newPlanId: string) {
    return this.limitsService.canDowngradeToPlan(tenantId, newPlanId);
  }

  /**
   * Zmienia plan subskrypcji (upgrade/downgrade)
   */
  async changePlan(tenantId: string, newPlanId: string) {
    const currentSubscription = await this.getSubscription(tenantId);
    
    if (!currentSubscription) {
      throw new BadRequestException('Brak aktywnej subskrypcji');
    }

    const newPlan = await this.getPlanById(newPlanId);
    const currentPlan = currentSubscription.subscription_plans;
    
    if (!currentPlan) {
      throw new BadRequestException('Brak obecnego planu');
    }

    // Sprawdź czy to downgrade
    const currentFeatures = currentPlan.features as any;
    const newFeatures = newPlan.features as any;
    const isDowngrade = (newFeatures.tier || 1) < (currentFeatures.tier || 3);

    if (isDowngrade) {
      // Sprawdź czy downgrade jest możliwy
      const canDowngrade = await this.canChangePlan(tenantId, newPlanId);
      if (!canDowngrade.canDowngrade) {
        throw new BadRequestException(
          `Nie można zmienić planu: ${canDowngrade.issues.join(', ')}`
        );
      }
    }

    // Zmień plan w Stripe
    return this.stripeService.changePlan(tenantId, newPlanId);
  }

  async suspendTenantIfNeeded(tenantId: string, reason: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { isSuspended: true },
    });

    // Jeśli już zablokowane, nie rób nic
    if (tenant?.isSuspended) {
      return;
    }

    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        isSuspended: true,
        suspendedReason: reason,
      },
    });

    this.logger.warn(`🚫 Zablokowano konto ${tenantId}: ${reason}`);
  }

  async getUsage(tenantId: string) {
    // Pobierz aktualną subskrypcję z limitami
    const subscription = await this.prisma.subscriptions.findFirst({
      where: { tenantId },
      include: { subscription_plans: true },
    });

    // Jeśli jest zmiana planu zaplanowana (downgrade), użyj limitów z poprzedniego (wyższego) planu
    // do końca aktualnego okresu rozliczeniowego
    let features: any = {};
    
    if (subscription?.previousPlanId && subscription.currentPeriodEnd) {
      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);
      
      // Jeśli jesteśmy przed końcem okresu, użyj poprzedniego planu
      if (now < periodEnd) {
        const previousPlan = await this.prisma.subscription_plans.findUnique({
          where: { id: subscription.previousPlanId },
        });
        if (previousPlan) {
          features = previousPlan.features as any || {};
        }
      }
    }
    
    // Jeśli nie ma poprzedniego planu lub okres się skończył, użyj aktualnego
    if (Object.keys(features).length === 0) {
      const plan = subscription?.subscription_plans;
      features = plan?.features as any || {};
    }

    // Pobierz tenant z użyciem SMS
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_usage: true },
    });

    const smsUsage = (tenant?.sms_usage as any) || { used: 0 };
    
    // Policz pracowników dla tego tenanta
    const employeesCount = await this.prisma.employees.count({
      where: { tenantId },
    });

    // Policz rezerwacje w tym miesiącu (przez relację z employees)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const bookingsCount = await this.prisma.bookings.count({
      where: {
        employees: { is: { tenantId } },
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      bookings: {
        used: bookingsCount,
        limit: features.bookings ?? -1,
      },
      employees: {
        used: employeesCount,
        limit: features.employees ?? -1,
      },
      sms: {
        used: smsUsage.used || 0,
        limit: features.sms ?? 0,
      },
    };
  }
}
