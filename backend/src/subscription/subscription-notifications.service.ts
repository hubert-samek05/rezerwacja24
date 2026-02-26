import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';

/**
 * Serwis powiadomień o abonamencie (dla płacących klientów - nie trial)
 * Wysyła e-maile gdy:
 * - Abonament kończy się za 3 dni
 * - Abonament kończy się za 1 dzień
 * - Abonament wygasł (dzisiaj)
 */
@Injectable()
export class SubscriptionNotificationsService {
  private readonly logger = new Logger(SubscriptionNotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Codziennie o 9:00 rano - sprawdź subskrypcje i wyślij powiadomienia
   */
  @Cron('0 9 * * *') // Codziennie o 9:00
  async sendSubscriptionNotifications() {
    this.logger.log('🔔 Starting subscription notifications check...');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Znajdź wszystkie subskrypcje ze statusem ACTIVE, które mają ustawione cancelAtPeriodEnd
    // (czyli użytkownik anulował subskrypcję i kończy się ona z końcem okresu rozliczeniowego)
    const endingSubscriptions = await this.prisma.subscriptions.findMany({
      where: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: { not: null },
      },
      include: {
        tenants: {
          include: {
            tenant_users: {
              where: { role: 'TENANT_OWNER' },
              include: { users: true },
            },
          },
        },
        subscription_plans: true,
      },
    });

    this.logger.log(`Found ${endingSubscriptions.length} subscriptions ending soon`);

    for (const subscription of endingSubscriptions) {
      const periodEnd = new Date(subscription.currentPeriodEnd!);
      const periodEndDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
      
      // Oblicz różnicę dni
      const diffTime = periodEndDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const owner = subscription.tenants?.tenant_users?.[0]?.users;
      if (!owner?.email) {
        this.logger.warn(`No owner email found for tenant ${subscription.tenantId}`);
        continue;
      }

      const userName = owner.firstName || owner.email.split('@')[0];
      const planName = subscription.subscription_plans?.name || 'Pro';

      try {
        if (diffDays === 0) {
          // Abonament kończy się DZISIAJ - wyślij email o wygaśnięciu
          this.logger.log(`📧 Sending subscription-expired email to ${owner.email}`);
          await this.emailService.sendSubscriptionExpiredEmail(owner.email, {
            name: userName,
            planName: planName,
            daysUntilSuspension: 3, // Grace period
          });
        } else if (diffDays === 3) {
          // Abonament kończy się za 3 dni
          this.logger.log(`📧 Sending subscription-ending (3 days) email to ${owner.email}`);
          await this.emailService.sendSubscriptionEndingEmail(owner.email, {
            name: userName,
            daysLeft: 3,
            subscriptionEndDate: periodEnd.toLocaleDateString('pl-PL'),
            planName: planName,
          });
        } else if (diffDays === 1) {
          // Abonament kończy się jutro
          this.logger.log(`📧 Sending subscription-ending (1 day) email to ${owner.email}`);
          await this.emailService.sendSubscriptionEndingEmail(owner.email, {
            name: userName,
            daysLeft: 1,
            subscriptionEndDate: periodEnd.toLocaleDateString('pl-PL'),
            planName: planName,
          });
        }
      } catch (error) {
        this.logger.error(`Failed to send subscription notification to ${owner.email}:`, error);
      }
    }

    // Sprawdź również subskrypcje CANCELLED (wygasłe) - wyślij przypomnienie
    await this.sendExpiredSubscriptionReminders();

    this.logger.log('✅ Subscription notifications check completed');
  }

  /**
   * Wysyła przypomnienia dla wygasłych subskrypcji (w grace period)
   */
  private async sendExpiredSubscriptionReminders() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const GRACE_PERIOD_DAYS = 3;

    // Znajdź subskrypcje CANCELLED, które wygasły w ciągu ostatnich 3 dni
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - GRACE_PERIOD_DAYS);

    const expiredSubscriptions = await this.prisma.subscriptions.findMany({
      where: {
        status: 'CANCELLED',
        currentPeriodEnd: {
          gte: threeDaysAgo,
          lt: today,
        },
      },
      include: {
        tenants: {
          include: {
            tenant_users: {
              where: { role: 'TENANT_OWNER' },
              include: { users: true },
            },
          },
        },
        subscription_plans: true,
      },
    });

    this.logger.log(`Found ${expiredSubscriptions.length} expired subscriptions in grace period`);

    for (const subscription of expiredSubscriptions) {
      const periodEnd = new Date(subscription.currentPeriodEnd!);
      
      // Oblicz dni od wygaśnięcia
      const daysSinceExpired = Math.floor((today.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilSuspension = Math.max(0, GRACE_PERIOD_DAYS - daysSinceExpired);

      // Wyślij przypomnienie tylko w dniu 1 i 2 po wygaśnięciu
      if (daysSinceExpired !== 1 && daysSinceExpired !== 2) {
        continue;
      }

      const owner = subscription.tenants?.tenant_users?.[0]?.users;
      if (!owner?.email) {
        continue;
      }

      const userName = owner.firstName || owner.email.split('@')[0];
      const planName = subscription.subscription_plans?.name || 'Pro';

      try {
        this.logger.log(`📧 Sending subscription-expired reminder (day ${daysSinceExpired}) to ${owner.email}`);
        await this.emailService.sendSubscriptionExpiredEmail(owner.email, {
          name: userName,
          planName: planName,
          daysUntilSuspension: daysUntilSuspension,
        });
      } catch (error) {
        this.logger.error(`Failed to send expired subscription reminder to ${owner.email}:`, error);
      }
    }
  }

  /**
   * Ręczne wywołanie - do testów
   */
  async sendSubscriptionNotificationsManual() {
    return this.sendSubscriptionNotifications();
  }
}
