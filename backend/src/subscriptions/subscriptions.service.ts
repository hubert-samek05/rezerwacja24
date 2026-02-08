import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Pobiera subskrypcję dla danego tenanta
   */
  async getSubscriptionByTenantId(tenantId: string) {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
      include: {
        subscription_plans: true,
        tenants: {
          select: {
            name: true,
            subdomain: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  /**
   * Sprawdza status subskrypcji i oblicza pozostałe dni trialu
   */
  async getSubscriptionStatus(tenantId: string) {
    // Sprawdź czy subskrypcja istnieje
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { tenantId },
      include: {
        subscription_plans: true,
      },
    });

    // Jeśli brak subskrypcji, zwróć informację o braku
    if (!subscription) {
      return {
        hasSubscription: false,
        hasPaymentMethod: false,
        status: null,
        isTrialActive: false,
        remainingTrialDays: 0,
        requiresPayment: true,
      };
    }
    
    const now = new Date();
    let remainingTrialDays = 0;
    let isTrialActive = false;

    if (subscription.trialEnd) {
      const trialEndDate = new Date(subscription.trialEnd);
      const diffTime = trialEndDate.getTime() - now.getTime();
      remainingTrialDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isTrialActive = remainingTrialDays > 0 && subscription.status === 'TRIALING';
    }

    // Sprawdź czy karta jest podana
    const hasPaymentMethod = !!subscription.stripePaymentMethodId;

    return {
      hasSubscription: true,
      hasPaymentMethod,
      status: subscription.status,
      isTrialActive,
      remainingTrialDays: remainingTrialDays > 0 ? remainingTrialDays : 0,
      trialEnd: subscription.trialEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
      planName: subscription.subscription_plans.name,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      requiresPayment: !hasPaymentMethod, // Wymaga płatności jeśli brak karty
    };
  }

  /**
   * Pobiera wszystkie subskrypcje (admin)
   */
  async getAllSubscriptions() {
    return this.prisma.subscriptions.findMany({
      include: {
        subscription_plans: true,
        tenants: {
          select: {
            name: true,
            subdomain: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Anuluje subskrypcję (ustawi cancelAtPeriodEnd na true)
   */
  async cancelSubscription(tenantId: string) {
    const subscription = await this.getSubscriptionByTenantId(tenantId);

    return this.prisma.subscriptions.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Wznawia anulowaną subskrypcję
   */
  async resumeSubscription(tenantId: string) {
    const subscription = await this.getSubscriptionByTenantId(tenantId);

    return this.prisma.subscriptions.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Aktualizuje status subskrypcji
   */
  async updateSubscriptionStatus(
    tenantId: string,
    status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED' | 'INCOMPLETE',
  ) {
    const subscription = await this.getSubscriptionByTenantId(tenantId);

    return this.prisma.subscriptions.update({
      where: { id: subscription.id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
}
