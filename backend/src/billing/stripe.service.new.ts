import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  // ... (inne metody pozostają bez zmian)

  /**
   * Zmienia plan subskrypcji (upgrade/downgrade)
   */
  async changePlan(tenantId: string, newPlanId: string) {
    try {
      this.logger.log(`Próba zmiany planu dla tenant ${tenantId} na plan ${newPlanId}`);
      
      // Pobierz nowy plan
      const newPlan = await this.prisma.subscription_plans.findUnique({
        where: { id: newPlanId },
      });

      if (!newPlan || !newPlan.isActive) {
        throw new BadRequestException('Wybrany plan nie istnieje lub jest nieaktywny');
      }

      // Pobierz obecną subskrypcję
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
        include: { subscription_plans: true },
      });

      if (!subscription) {
        throw new BadRequestException('Brak aktywnej subskrypcji');
      }

      // Sprawdź czy użytkownik próbuje zmienić na ten sam plan
      if (subscription.planId === newPlanId) {
        return {
          success: true,
          message: 'Posiadasz już wybrany plan',
          newPlan: newPlan.name,
        };
      }

      // Sprawdź czy użytkownik ma podłączoną kartę
      if (!subscription.stripePaymentMethodId) {
        throw new BadRequestException('Aby zmienić plan, najpierw dodaj kartę płatniczą');
      }

      // Pobierz klienta Stripe
      const customer = await this.stripe.customers.retrieve(subscription.stripeCustomerId);
      if (!customer || customer.deleted) {
        throw new BadRequestException('Błąd podczas weryfikacji danych płatności');
      }

      // Pobierz cenę z planu
      const priceId = newPlan.stripePriceId;
      if (!priceId) {
        throw new Error('Brak ceny dla wybranego planu');
      }

      // Znajdź subscription item ID
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );
      
      if (!stripeSubscription.items.data || stripeSubscription.items.data.length === 0) {
        throw new Error('Nie znaleziono elementów subskrypcji w Stripe');
      }
      
      const subscriptionItemId = stripeSubscription.items.data[0].id;

      // Zaktualizuj subskrypcję w Stripe
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{
            id: subscriptionItemId,
            price: priceId,
          }],
          proration_behavior: 'create_prorations',
          metadata: {
            tenantId,
            planId: newPlanId,
          }
        }
      );

      // Zaktualizuj w bazie danych
      await this.prisma.subscriptions.update({
        where: { tenantId },
        data: {
          planId: newPlanId,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`✅ Zmieniono plan dla tenant ${tenantId} na ${newPlan.name}`);

      // Zaktualizuj limit SMS dla nowego planu
      const newFeatures = newPlan.features as any;
      const newSmsLimit = newFeatures.sms === -1 ? 999999 : newFeatures.sms;
      
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
            limit: newSmsLimit,
            lastReset: currentUsage.lastReset || new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        newPlan: newPlan.name,
        message: `Plan zmieniony na ${newPlan.name}`,
      };
    } catch (error) {
      this.logger.error('Błąd podczas zmiany planu', error);
      
      // Bardziej szczegółowe komunikaty błędów
      if (error.code === 'resource_missing') {
        throw new BadRequestException('Nie znaleziono subskrypcji w systemie płatności');
      } else if (error.code === 'card_declined') {
        throw new BadRequestException('Karta została odrzucona. Sprawdź dane karty lub skontaktuj się z bankiem.');
      } else if (error.code === 'authentication_required') {
        throw new BadRequestException('Wymagane jest uwierzytelnienie płatności. Spróbuj ponownie.');
      } else if (error.type === 'StripeCardError') {
        // Błąd karty
        throw new BadRequestException(`Błąd karty: ${error.message}`);
      } else if (error.type === 'StripeInvalidRequestError') {
        // Nieprawidłowe żądanie do Stripe
        this.logger.error(`Błąd żądania do Stripe: ${error.message}`, error);
        throw new BadRequestException('Wystąpił błąd podczas przetwarzania płatności. Prosimy spróbować później.');
      }
      
      throw error;
    }
  }

  // ... (pozostałe metody)
}
