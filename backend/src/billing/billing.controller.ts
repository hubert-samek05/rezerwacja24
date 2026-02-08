import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Headers,
  RawBodyRequest,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { Public } from '../common/decorators/public.decorator';
import { RequiresSubscription } from '../common/decorators/requires-subscription.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('billing')
// @UseGuards(JwtAuthGuard) - WYŁĄCZONY, bo blokował panel
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private billingService: BillingService,
    private stripeService: StripeService,
  ) {}

  /**
   * Pobiera aktywny plan subskrypcji (domyślnie Pro)
   * Nie wymaga subskrypcji - potrzebne do wyświetlenia cen
   */
  @RequiresSubscription(false)
  @Get('plan')
  async getActivePlan() {
    return this.billingService.getActivePlan();
  }

  /**
   * Pobiera wszystkie dostępne plany subskrypcji
   * Nie wymaga subskrypcji - potrzebne do wyświetlenia cen
   */
  @Public()
  @RequiresSubscription(false)
  @Get('plans')
  async getAllPlans() {
    return this.billingService.getAllPlans();
  }

  /**
   * Pobiera subskrypcję dla zalogowanego użytkownika
   * Nie wymaga subskrypcji - potrzebne do sprawdzenia statusu
   */
  @RequiresSubscription(false)
  @Get('subscription')
  async getSubscription(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const subscription = await this.billingService.getSubscription(tenantId);
    
    // ZAWSZE zwracaj spójny format
    if (!subscription) {
      return { subscription: null, hasSubscription: false };
    }
    
    // Zwróć subskrypcję z flagą hasSubscription
    return { ...subscription, hasSubscription: true };
  }

  /**
   * Pobiera szczegóły subskrypcji
   */
  @Get('subscription/details')
  async getSubscriptionDetails(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.billingService.getSubscriptionDetails(tenantId);
  }

  /**
   * Sprawdza status subskrypcji
   * Nie wymaga subskrypcji - potrzebne do sprawdzenia statusu
   * PUBLICZNY - używany przez middleware do sprawdzania dostępu
   */
  @Public()
  @RequiresSubscription(false)
  @Get('subscription/status')
  async getSubscriptionStatus(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    this.logger.debug(`📊 Subscription status check - tenantId from header: ${req.headers['x-tenant-id']}, from user: ${req.user?.tenantId}, final: ${tenantId}`);
    
    // Jeśli brak tenantId, zwróć że nie ma subskrypcji (nie pokazuj błędu)
    if (!tenantId) {
      this.logger.warn(`⚠️ No tenantId found for subscription status check`);
      return {
        hasActiveSubscription: false,
        isInTrial: false,
        remainingTrialDays: 0,
        trialEndDate: null,
        currentPeriodEnd: null,
      };
    }
    
    const [hasActive, isInTrial, remainingDays, subscription] = await Promise.all([
      this.billingService.hasActiveSubscription(tenantId),
      this.billingService.isInTrial(tenantId),
      this.billingService.getRemainingTrialDays(tenantId),
      this.billingService.getSubscription(tenantId),
    ]);

    // Oblicz dni do zablokowania konta (grace period = 3 dni po wygaśnięciu trialu/płatności)
    let daysUntilBlock = 0;
    const GRACE_PERIOD_DAYS = 3;
    let shouldSuspend = false;
    
    if (subscription) {
      const isPastDue = subscription.status === 'PAST_DUE';
      
      // Trial wygasł TYLKO jeśli data trialEnd jest w przeszłości
      const now = new Date();
      const trialEndDate = subscription.trialEnd ? new Date(subscription.trialEnd) : null;
      const isTrialExpired = subscription.status === 'TRIALING' && trialEndDate && trialEndDate < now;
      
      
      if (isPastDue || isTrialExpired) {
        // Oblicz dni od wygaśnięcia
        const expiredDate = subscription.trialEnd || subscription.currentPeriodEnd;
        if (expiredDate) {
          const expired = new Date(expiredDate);
          const daysSinceExpired = Math.floor((now.getTime() - expired.getTime()) / (1000 * 60 * 60 * 24));
          daysUntilBlock = Math.max(0, GRACE_PERIOD_DAYS - daysSinceExpired);
          
          // Automatycznie zablokuj konto jeśli minęło grace period (3 dni po wygaśnięciu)
          if (daysSinceExpired >= GRACE_PERIOD_DAYS) {
            shouldSuspend = true;
          }
        }
      }
    }
    
    // Automatyczna blokada konta po grace period - TYLKO jeśli trial naprawdę wygasł
    if (shouldSuspend && tenantId) {
      this.logger.warn(`🚫 Blokowanie konta ${tenantId} - grace period minął`);
      await this.billingService.suspendTenantIfNeeded(tenantId, 'Okres próbny wygasł - brak aktywnej subskrypcji');
    }

    return {
      hasActiveSubscription: hasActive,
      isInTrial,
      isTrialActive: isInTrial && remainingDays > 0, // Dla TrialBanner
      remainingTrialDays: remainingDays,
      trialEnd: subscription?.trialEnd || null, // Dla TrialBanner
      trialEndDate: subscription?.trialEnd || null,
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      planName: subscription?.subscription_plans?.name || 'Starter',
      // Dodatkowe informacje o statusie subskrypcji
      status: subscription?.status || null,
      isPastDue: subscription?.status === 'PAST_DUE',
      isCancelled: subscription?.status === 'CANCELLED',
      lastPaymentStatus: subscription?.lastPaymentStatus || null,
      lastPaymentError: subscription?.lastPaymentError || null,
      // Dni do zablokowania konta
      daysUntilBlock,
      gracePeriodDays: GRACE_PERIOD_DAYS,
    };
  }

  /**
   * Tworzy checkout session dla nowej subskrypcji
   * Nie wymaga subskrypcji - to endpoint do zakupu subskrypcji
   * @param planId - opcjonalny ID planu (domyślnie Pro)
   */
  @RequiresSubscription(false)
  @Post('checkout-session')
  async createCheckoutSession(@Req() req: any, @Body() body: { email: string; planId?: string }) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.debug(`Checkout session request - tenantId: ${tenantId}, planId: ${body.planId}`);
    
    if (!tenantId) {
      throw new Error('Brak tenant ID');
    }
    
    try {
      const result = await this.billingService.createCheckoutSession(tenantId, body.email, body.planId);
      this.logger.log(`Checkout session created for tenant ${tenantId}, plan: ${body.planId || 'default'}`);
      return result;
    } catch (error) {
      this.logger.error(`Checkout session error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tworzy billing portal session
   * Nie wymaga subskrypcji - potrzebne do zarządzania
   */
  @RequiresSubscription(false)
  @Post('portal-session')
  async createBillingPortalSession(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.billingService.createBillingPortalSession(tenantId);
  }

  /**
   * Anuluje subskrypcję
   * Nie wymaga subskrypcji - potrzebne do anulowania
   */
  @RequiresSubscription(false)
  @Delete('subscription')
  async cancelSubscription(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.billingService.cancelSubscription(tenantId);
  }

  /**
   * Wznawia subskrypcję
   * Nie wymaga subskrypcji - potrzebne do wznawiania
   */
  @RequiresSubscription(false)
  @Post('subscription/resume')
  async resumeSubscription(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.billingService.resumeSubscription(tenantId);
  }

  /**
   * Pobiera faktury
   * Nie wymaga subskrypcji - potrzebne do wyświetlenia historii
   */
  @RequiresSubscription(false)
  @Get('invoices')
  async getInvoices(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.billingService.getInvoices(tenantId);
  }

  /**
   * Synchronizuje subskrypcję ze Stripe (ręcznie)
   * Nie wymaga subskrypcji - potrzebne do synchronizacji
   */
  @RequiresSubscription(false)
  @Post('subscription/sync')
  async syncSubscription(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.billingService.syncSubscriptionFromStripe(tenantId);
  }

  /**
   * Pobiera statystyki subskrypcji (tylko dla adminów)
   */
  @Get('stats')
  async getSubscriptionStats() {
    return this.billingService.getSubscriptionStats();
  }

  /**
   * Sprawdza czy można zmienić plan
   */
  @RequiresSubscription(false)
  @Post('plan/can-change')
  async canChangePlan(@Req() req: any, @Body() body: { planId: string }) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.billingService.canChangePlan(tenantId, body.planId);
  }

  /**
   * Zmienia plan subskrypcji (upgrade/downgrade)
   */
  @RequiresSubscription(false)
  @Post('plan/change')
  async changePlan(@Req() req: any, @Body() body: { planId: string }) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.log(`Plan change request - tenantId: ${tenantId}, newPlanId: ${body.planId}`);
    return this.billingService.changePlan(tenantId, body.planId);
  }

  /**
   * Tworzy SetupIntent do dodania karty
   */
  @RequiresSubscription(false)
  @Post('setup-intent')
  async createSetupIntent(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stripeService.createSetupIntent(tenantId);
  }

  /**
   * Pobiera metodę płatności
   */
  @RequiresSubscription(false)
  @Get('payment-method')
  async getPaymentMethod(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stripeService.getPaymentMethod(tenantId);
  }

  /**
   * Aktualizuje domyślną metodę płatności
   */
  @RequiresSubscription(false)
  @Post('payment-method/update')
  async updatePaymentMethod(@Req() req: any, @Body() body: { paymentMethodId: string }) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stripeService.updateDefaultPaymentMethod(tenantId, body.paymentMethodId);
  }

  /**
   * Pobierz wykorzystanie limitu planu
   * Nie wymaga subskrypcji - potrzebne do wyświetlenia limitu
   */
  @RequiresSubscription(false)
  @Get('usage')
  async getUsage(@Req() req: any) {
    try {
      const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
      
      if (!tenantId) {
        this.logger.warn('Brak tenant ID w żądaniu getUsage');
        return { 
          success: false, 
          message: 'Brak identyfikatora dzierżawy',
          usage: {
            current: 0,
            limit: 0,
            percentage: 0,
            isOverLimit: false
          }
        };
      }
      
      return await this.billingService.getUsage(tenantId);
    } catch (error) {
      this.logger.error(`Błąd podczas pobierania użycia: ${error.message}`, error.stack);
      return { 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania informacji o wykorzystaniu',
        error: error.message,
        usage: {
          current: 0,
          limit: 0,
          percentage: 0,
          isOverLimit: false
        }
      };
    }
  }

  /**
   * Ponowna próba pobrania zaległej płatności
   */
  @RequiresSubscription(false)
  @Post('retry-payment')
  async retryPayment(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      throw new BadRequestException('Brak tenant ID');
    }
    
    return this.stripeService.retryFailedPayment(tenantId);
  }

  /**
   * Webhook od Stripe
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.stripeService.handleWebhook(signature, req.rawBody);
  }
}
