import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class TrialNotificationsService {
  private readonly logger = new Logger(TrialNotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Codziennie o 9:00 rano - sprawdź trialy i wyślij powiadomienia
   */
  @Cron('0 9 * * *') // Codziennie o 9:00
  async sendTrialNotifications() {
    this.logger.log('🔔 Starting trial notifications check...');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Znajdź wszystkie subskrypcje w statusie TRIALING
    const trialSubscriptions = await this.prisma.subscriptions.findMany({
      where: {
        status: 'TRIALING',
        trialEnd: { not: null },
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

    this.logger.log(`Found ${trialSubscriptions.length} active trials`);

    for (const subscription of trialSubscriptions) {
      const trialEnd = new Date(subscription.trialEnd!);
      const trialEndDate = new Date(trialEnd.getFullYear(), trialEnd.getMonth(), trialEnd.getDate());
      
      // Oblicz różnicę dni
      const diffTime = trialEndDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const owner = subscription.tenants?.tenant_users?.[0]?.users;
      if (!owner?.email) {
        this.logger.warn(`No owner email found for tenant ${subscription.tenantId}`);
        continue;
      }

      const userName = owner.firstName || owner.email.split('@')[0];
      const planName = subscription.subscription_plans?.name || 'Starter';

      try {
        if (diffDays === 0) {
          // Trial kończy się DZISIAJ
          this.logger.log(`📧 Sending trial-ends-today email to ${owner.email}`);
          await this.emailService.sendTrialEndedTodayEmail(owner.email, {
            name: userName,
            planName: planName,
          });
        } else if (diffDays === 3) {
          // Trial kończy się za 3 dni
          this.logger.log(`📧 Sending trial-ending (3 days) email to ${owner.email}`);
          await this.emailService.sendTrialEndingEmail(owner.email, {
            name: userName,
            daysLeft: 3,
            trialEndDate: trialEnd.toLocaleDateString('pl-PL'),
          });
        } else if (diffDays === 1) {
          // Trial kończy się jutro
          this.logger.log(`📧 Sending trial-ending (1 day) email to ${owner.email}`);
          await this.emailService.sendTrialEndingEmail(owner.email, {
            name: userName,
            daysLeft: 1,
            trialEndDate: trialEnd.toLocaleDateString('pl-PL'),
          });
        }
      } catch (error) {
        this.logger.error(`Failed to send trial notification to ${owner.email}:`, error);
      }
    }

    this.logger.log('✅ Trial notifications check completed');
  }

  /**
   * Ręczne wywołanie - do testów
   */
  async sendTrialNotificationsManual() {
    return this.sendTrialNotifications();
  }
}
