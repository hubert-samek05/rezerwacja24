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

  /**
   * Tworzy checkout session dla nowej subskrypcji z 7-dniowym okresem próbnym
   */
  async createCheckoutSession({
    tenantId,
    planId,
    email,
    successUrl,
    cancelUrl,
  }: {
    tenantId: string;
    planId: string;
    email: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    try {
      const plan = await this.prisma.subscription_plans.findUnique({
        where: { id: planId },
      });

      if (!plan || !plan.isActive) {
        throw new BadRequestException('Plan nie istnieje lub jest nieaktywny');
      }

      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new BadRequestException('Firma nie istnieje');
      }

      // Sprawdź czy tenant już ma subskrypcję
      const existingSubscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      // Pozwól na checkout jeśli:
      // 1. Nie ma subskrypcji ALBO
      // 2. Ma lokalny trial (TRIALING bez stripeSubscriptionId) - może dodać kartę ALBO
      // 3. Subskrypcja jest CANCELLED - użytkownik może założyć nową
      // Dla PAST_DUE - użytkownik powinien użyć billing portal do aktualizacji karty
      if (existingSubscription && existingSubscription.stripeSubscriptionId) {
        // PAST_DUE - subskrypcja nadal istnieje w Stripe, użytkownik musi zaktualizować kartę przez portal
        if (existingSubscription.status === 'PAST_DUE') {
          throw new BadRequestException(
            'Twoja subskrypcja wymaga aktualizacji metody płatności. Użyj przycisku "Zaktualizuj metodę płatności" aby przejść do portalu płatności.'
          );
        }
        
        // CANCELLED lub INCOMPLETE - można utworzyć nową subskrypcję
        const allowedStatuses = ['CANCELLED', 'INCOMPLETE'];
        if (!allowedStatuses.includes(existingSubscription.status)) {
          throw new BadRequestException('Firma już posiada aktywną subskrypcję');
        }
        
        this.logger.log(`Subskrypcja ${existingSubscription.status} - pozwalam na nowy checkout`);
      }

      // Utwórz lub pobierz Stripe Customer
      let customer: Stripe.Customer;
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        // Zaktualizuj istniejącego klienta - ustaw nazwę firmy jeśli brakuje
        // Jest to wymagane dla tax_id_collection w Stripe Checkout
        if (!customer.name || customer.name !== tenant.name) {
          customer = await this.stripe.customers.update(customer.id, {
            name: tenant.name,
            metadata: {
              tenantId,
              tenantName: tenant.name,
            },
          });
          this.logger.log(`Zaktualizowano nazwę klienta Stripe ${customer.id} na "${tenant.name}"`);
        }
      } else {
        customer = await this.stripe.customers.create({
          email,
          name: tenant.name, // Dodaj nazwę przy tworzeniu
          metadata: {
            tenantId,
            tenantName: tenant.name,
          },
        });
      }

      // Utwórz checkout session z okresem próbnym
      // Używamy payment_method_collection: 'always' aby wymagać karty podczas trial
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card', 'link'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: plan.trialDays,
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel', // Anuluj jeśli brak karty po trial
            },
          },
          metadata: {
            tenantId,
            planId,
          },
        },
        payment_method_collection: 'always', // ZAWSZE wymagaj karty
        // Umożliw aktualizację danych firmy/nazwy wymaganych przy NIP
        customer_update: {
          name: 'auto',
          address: 'auto',
        },
        // Zbieranie NIP (Tax ID) - opcjonalne dla klienta, ale dostępne od razu
        tax_id_collection: { enabled: true },
        // Zbieranie adresu rozliczeniowego
        billing_address_collection: 'required',
        // Automatyczne naliczanie podatku (opcjonalne)
        // automatic_tax: { enabled: true },
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          tenantId,
          planId,
        },
      });

      this.logger.log(`Utworzono checkout session dla tenant ${tenantId}: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      this.logger.error('Błąd podczas tworzenia checkout session', error);
      throw error;
    }
  }

  /**
   * Tworzy portal zarządzania subskrypcją
   */
  async createBillingPortalSession(tenantId: string, returnUrl: string) {
    try {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      if (!subscription) {
        throw new BadRequestException('Brak aktywnej subskrypcji');
      }

      // Sprawdź czy to prawdziwy Stripe Customer ID
      if (!subscription.stripeCustomerId || !subscription.stripeCustomerId.startsWith('cus_')) {
        // Jeśli jest w trakcie trialu lokalnego, nie pozwól na portal
        if (subscription.status === 'TRIALING' && !subscription.stripeSubscriptionId) {
          throw new BadRequestException('Najpierw dodaj kartę płatniczą aby zarządzać subskrypcją.');
        }
        // Jeśli checkout był niedawno, webhook może jeszcze nie dotrzeć
        const checkoutTime = subscription.updatedAt;
        const now = new Date();
        const timeDiff = now.getTime() - checkoutTime.getTime();
        if (timeDiff < 60000) { // Mniej niż 1 minuta
          throw new BadRequestException('Przetwarzamy Twoją płatność. Spróbuj ponownie za chwilę (30-60 sekund).');
        }
        throw new BadRequestException('Subskrypcja nie jest połączona ze Stripe. Skontaktuj się z supportem.');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error('Błąd podczas tworzenia billing portal session', error);
      throw error;
    }
  }

  /**
   * Anuluje subskrypcję na koniec okresu rozliczeniowego
   */
  async cancelSubscription(tenantId: string) {
    try {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new BadRequestException('Brak aktywnej subskrypcji');
      }

      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await this.prisma.subscriptions.update({
        where: { tenantId },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
      });

      this.logger.log(`Anulowano subskrypcję dla tenant ${tenantId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Błąd podczas anulowania subskrypcji', error);
      throw error;
    }
  }

  /**
   * Wznawia anulowaną subskrypcję
   */
  async resumeSubscription(tenantId: string) {
    try {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new BadRequestException('Brak aktywnej subskrypcji');
      }

      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      await this.prisma.subscriptions.update({
        where: { tenantId },
        data: {
          cancelAtPeriodEnd: false,
          resumedAt: new Date(),
        },
      });

      this.logger.log(`Wznowiono subskrypcję dla tenant ${tenantId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Błąd podczas wznawiania subskrypcji', error);
      throw error;
    }
  }

  /**
   * Pobiera szczegóły subskrypcji ze Stripe
   */
  async getSubscriptionDetails(tenantId: string) {
    try {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
        include: {
          subscription_plans: true,
        },
      });

      if (!subscription) {
        return null;
      }

      let stripeSubscription: Stripe.Subscription | null = null;
      if (subscription.stripeSubscriptionId) {
        stripeSubscription = await this.stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId,
        );
      }

      return {
        ...subscription,
        stripeDetails: stripeSubscription,
      };
    } catch (error) {
      this.logger.error('Błąd podczas pobierania szczegółów subskrypcji', error);
      throw error;
    }
  }

  /**
   * Ponowna próba pobrania zaległej płatności
   */
  async retryFailedPayment(tenantId: string) {
    try {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      if (!subscription) {
        throw new BadRequestException('Nie znaleziono subskrypcji');
      }

      if (subscription.status !== 'PAST_DUE') {
        return { success: true, message: 'Subskrypcja jest aktywna, brak zaległych płatności' };
      }

      if (!subscription.stripeSubscriptionId) {
        throw new BadRequestException('Brak ID subskrypcji Stripe');
      }

      // Pobierz subskrypcję ze Stripe
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Znajdź ostatnią nieopłaconą fakturę
      const invoices = await this.stripe.invoices.list({
        subscription: subscription.stripeSubscriptionId,
        status: 'open',
        limit: 1,
      });

      if (invoices.data.length === 0) {
        // Brak otwartych faktur - sprawdź czy subskrypcja jest aktywna w Stripe
        if (stripeSubscription.status === 'active') {
          // Synchronizuj status z bazą
          await this.prisma.subscriptions.update({
            where: { tenantId },
            data: {
              status: 'ACTIVE',
              lastPaymentStatus: 'paid',
              lastPaymentError: null,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              updatedAt: new Date(),
            },
          });
          return { success: true, message: 'Subskrypcja jest już aktywna' };
        }
        return { success: false, message: 'Brak otwartych faktur do opłacenia' };
      }

      const invoice = invoices.data[0];

      // Spróbuj opłacić fakturę
      try {
        const paidInvoice = await this.stripe.invoices.pay(invoice.id);
        
        if (paidInvoice.status === 'paid') {
          // Sukces! Zaktualizuj bazę
          await this.prisma.subscriptions.update({
            where: { tenantId },
            data: {
              status: 'ACTIVE',
              lastPaymentStatus: 'paid',
              lastPaymentError: null,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              updatedAt: new Date(),
            },
          });

          this.logger.log(`✅ Płatność pobrana pomyślnie dla tenant ${tenantId}`);
          return { success: true, message: 'Płatność pobrana pomyślnie' };
        } else {
          return { success: false, message: 'Płatność nie została zrealizowana' };
        }
      } catch (paymentError: any) {
        this.logger.error(`Błąd płatności dla tenant ${tenantId}:`, paymentError.message);
        
        // Zaktualizuj błąd w bazie
        await this.prisma.subscriptions.update({
          where: { tenantId },
          data: {
            lastPaymentError: paymentError.message || 'Płatność nieudana',
            updatedAt: new Date(),
          },
        });

        // Zwróć czytelny komunikat
        if (paymentError.code === 'card_declined') {
          return { success: false, message: 'Karta została odrzucona. Sprawdź dane karty lub użyj innej.' };
        } else if (paymentError.code === 'insufficient_funds') {
          return { success: false, message: 'Niewystarczające środki na karcie.' };
        } else if (paymentError.code === 'expired_card') {
          return { success: false, message: 'Karta wygasła. Dodaj nową kartę.' };
        } else {
          return { success: false, message: paymentError.message || 'Płatność nieudana. Spróbuj ponownie.' };
        }
      }
    } catch (error: any) {
      this.logger.error('Błąd podczas ponownej próby płatności:', error);
      throw new BadRequestException(error.message || 'Wystąpił błąd podczas przetwarzania płatności');
    }
  }

  /**
   * Obsługa webhook od Stripe
   */
  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      this.logger.log(`Otrzymano webhook Stripe: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
          break;

        default:
          this.logger.log(`Nieobsługiwany typ eventu: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Błąd podczas obsługi webhooka Stripe', error);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const tenantId = session.metadata?.tenantId;
    const planId = session.metadata?.planId;

    if (!tenantId || !planId) {
      this.logger.error('Brak tenantId lub planId w metadata checkout session');
      return;
    }

    this.logger.log(`Checkout session zakończony dla tenant ${tenantId}`);

    // Pobierz subskrypcję ze Stripe jeśli została utworzona
    if (session.subscription) {
      try {
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const trialEnd = stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null;

        const trialStart = stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : null;

        // Utwórz lub zaktualizuj subskrypcję w bazie
        await this.prisma.subscriptions.upsert({
          where: { tenantId },
          create: {
            id: `sub_${Date.now()}`,
            status: stripeSubscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            stripePaymentMethodId: stripeSubscription.default_payment_method as string,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            trialStart,
            trialEnd,
            updatedAt: new Date(),
            tenants: {
              connect: { id: tenantId },
            },
            subscription_plans: {
              connect: { id: planId },
            },
          },
          update: {
            status: stripeSubscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            stripePaymentMethodId: stripeSubscription.default_payment_method as string,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            trialStart,
            trialEnd,
            updatedAt: new Date(),
          },
        });

        this.logger.log(`✅ Utworzono/zaktualizowano subskrypcję dla tenant ${tenantId} z checkout session`);

        // Wyślij email o rozpoczęciu trialu
        if (stripeSubscription.status === 'trialing' && trialEnd) {
          const tenant = await this.prisma.tenants.findUnique({
            where: { id: tenantId },
          });

          if (tenant) {
            this.emailService.sendTrialStartedEmail(tenant.email, {
              name: tenant.name,
              trialDays: 7,
              trialEndDate: trialEnd.toLocaleDateString('pl-PL'),
            }).catch(err => {
              this.logger.error(`Failed to send trial started email:`, err);
            });
          }
        }
      } catch (error) {
        this.logger.error(`Błąd podczas tworzenia subskrypcji z checkout session: ${error.message}`);
      }
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const tenantId = subscription.metadata?.tenantId;
    const planId = subscription.metadata?.planId;

    if (!tenantId || !planId) {
      this.logger.error('Brak tenantId lub planId w metadata subskrypcji');
      return;
    }

    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    const trialStart = subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null;

    // Utwórz lub zaktualizuj subskrypcję w bazie
    await this.prisma.subscriptions.upsert({
      where: { tenantId },
      create: {
        id: `sub_${Date.now()}`,
        status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePaymentMethodId: subscription.default_payment_method as string,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart,
        trialEnd,
        updatedAt: new Date(),
        tenants: {
          connect: { id: tenantId },
        },
        subscription_plans: {
          connect: { id: planId },
        },
      },
      update: {
        status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripePaymentMethodId: subscription.default_payment_method as string,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart,
        trialEnd,
      },
    });

    this.logger.log(`Utworzono subskrypcję dla tenant ${tenantId}`);

    // 📧 Wyślij email o rozpoczęciu trialu
    if (subscription.status === 'trialing' && trialEnd) {
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        include: { users: true },
      });

      if (tenant) {
        this.emailService.sendTrialStartedEmail(tenant.email, {
          name: tenant.name,
          trialDays: 7,
          trialEndDate: trialEnd.toLocaleDateString('pl-PL'),
        }).catch(err => {
          this.logger.error(`Failed to send trial started email:`, err);
        });
      }
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Najpierw szukaj po stripeSubscriptionId
    let existingSubscription = await this.prisma.subscriptions.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    // Jeśli nie znaleziono, szukaj po stripeCustomerId (może być nowa subskrypcja dla tego samego klienta)
    if (!existingSubscription) {
      existingSubscription = await this.prisma.subscriptions.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });
      
      if (existingSubscription) {
        this.logger.log(`Znaleziono subskrypcję po customerId, aktualizuję stripeSubscriptionId`);
      }
    }

    // Jeśli nadal nie znaleziono, szukaj po tenantId z metadata
    if (!existingSubscription && subscription.metadata?.tenantId) {
      existingSubscription = await this.prisma.subscriptions.findFirst({
        where: { tenantId: subscription.metadata.tenantId },
      });
      
      if (existingSubscription) {
        this.logger.log(`Znaleziono subskrypcję po tenantId z metadata`);
      }
    }

    if (!existingSubscription) {
      this.logger.error(`Nie znaleziono subskrypcji dla Stripe ID: ${subscription.id}, customerId: ${subscription.customer}, tenantId: ${subscription.metadata?.tenantId}`);
      return;
    }

    let status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'INCOMPLETE' = 'ACTIVE';

    switch (subscription.status) {
      case 'active':
        status = 'ACTIVE';
        break;
      case 'trialing':
        status = 'TRIALING';
        break;
      case 'past_due':
        status = 'PAST_DUE';
        break;
      case 'canceled':
        status = 'CANCELLED';
        break;
      case 'incomplete':
        status = 'INCOMPLETE';
        break;
    }

    // Sprawdź czy zmienił się plan (porównaj price ID z Stripe z naszym planem)
    const currentPriceId = subscription.items?.data?.[0]?.price?.id;
    let newPlanId: string | null = null;
    
    if (currentPriceId) {
      const matchingPlan = await this.prisma.subscription_plans.findFirst({
        where: { stripePriceId: currentPriceId },
      });
      
      if (matchingPlan && matchingPlan.id !== existingSubscription.planId) {
        newPlanId = matchingPlan.id;
        this.logger.log(`Wykryto zmianę planu przez webhook: ${existingSubscription.planId} -> ${newPlanId}`);
        
        // Zaktualizuj limity SMS dla nowego planu
        await this.updateSmsLimits(existingSubscription.tenantId, matchingPlan);
      }
    }

    await this.prisma.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        status,
        stripeSubscriptionId: subscription.id, // Zawsze aktualizuj ID subskrypcji
        stripePaymentMethodId: subscription.default_payment_method as string,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
        ...(newPlanId && { planId: newPlanId, previousPlanId: existingSubscription.planId }),
      },
    });

    this.logger.log(`Zaktualizowano subskrypcję ${subscription.id} do statusu ${status}, okres: ${new Date(subscription.current_period_start * 1000).toISOString()} - ${new Date(subscription.current_period_end * 1000).toISOString()}${newPlanId ? `, nowy plan: ${newPlanId}` : ''}`);

    // 📧 Wyślij email o aktywnej subskrypcji (gdy trial się skończył i subskrypcja jest aktywna)
    if (status === 'ACTIVE' && existingSubscription.status === 'TRIALING') {
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: existingSubscription.tenantId },
      });

      if (tenant) {
        const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL');
        
        this.emailService.sendSubscriptionActiveEmail(tenant.email, {
          name: tenant.name,
          planName: 'Professional',
          nextBillingDate,
        }).catch(err => {
          this.logger.error(`Failed to send subscription active email:`, err);
        });
      }
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const existingSubscription = await this.prisma.subscriptions.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      return;
    }

    await this.prisma.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        status: 'CANCELLED',
        canceledAt: new Date(),
      },
    });

    // Zawieś konto tenant
    await this.prisma.tenants.update({
      where: { id: existingSubscription.tenantId },
      data: {
        isSuspended: true,
        suspendedReason: 'Subskrypcja została anulowana',
      },
    });

    this.logger.log(`Usunięto subskrypcję ${subscription.id}`);
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    const existingSubscription = await this.prisma.subscriptions.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { tenants: true },
    });

    if (!existingSubscription) {
      return;
    }

    this.logger.log(
      `Okres próbny kończy się za 3 dni dla tenant ${existingSubscription.tenantId}`,
    );

    // 📧 Wyślij email o kończącym się trialu
    if (existingSubscription.tenants) {
      const trialEndDate = subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toLocaleDateString('pl-PL')
        : 'wkrótce';

      this.emailService.sendTrialEndingEmail(existingSubscription.tenants.email, {
        name: existingSubscription.tenants.name,
        daysLeft: 3,
        trialEndDate,
      }).catch(err => {
        this.logger.error(`Failed to send trial ending email:`, err);
      });
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log(`Faktura opłacona: ${invoice.id}, subscription: ${invoice.subscription}, customer: ${invoice.customer}`);
    
    // Szukaj subskrypcji po różnych kryteriach - najpierw po customerId (zawsze dostępny)
    let existingSubscription = await this.prisma.subscriptions.findFirst({
      where: { stripeCustomerId: invoice.customer as string },
    });

    // Jeśli nie znaleziono po customer, szukaj po subscription ID
    if (!existingSubscription && invoice.subscription) {
      existingSubscription = await this.prisma.subscriptions.findFirst({
        where: { stripeSubscriptionId: invoice.subscription as string },
      });
    }

    if (!existingSubscription) {
      this.logger.warn(`Nie znaleziono subskrypcji dla faktury ${invoice.id} - może to być jednorazowa płatność`);
      return;
    }

    // Pobierz aktualny stan subskrypcji ze Stripe (użyj ID z bazy jeśli nie ma w invoice)
    const subscriptionId = invoice.subscription as string || existingSubscription.stripeSubscriptionId;
    if (!subscriptionId) {
      this.logger.warn(`Brak subscription ID dla faktury ${invoice.id}`);
      return;
    }
    
    const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    // Zaktualizuj subskrypcję w bazie - ustaw ACTIVE po opłaceniu
    await this.prisma.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        status: stripeSubscription.status === 'active' ? 'ACTIVE' : existingSubscription.status,
        stripeSubscriptionId: invoice.subscription as string,
        lastPaymentStatus: 'paid',
        lastPaymentError: null,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Zaktualizowano subskrypcję po opłaceniu faktury: status=${stripeSubscription.status}, okres do ${new Date(stripeSubscription.current_period_end * 1000).toISOString()}`);

    // Odblokuj konto jeśli było zablokowane z powodu płatności
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: existingSubscription.tenantId },
    });

    if (tenant?.isSuspended) {
      await this.prisma.tenants.update({
        where: { id: existingSubscription.tenantId },
        data: {
          isSuspended: false,
          suspendedReason: null,
        },
      });

      this.logger.log(`✅ Odblokowano konto ${existingSubscription.tenantId} po udanej płatności`);

      // Wyślij email o przywróceniu konta
      const nextBillingDate = new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString('pl-PL');
      await this.emailService.sendAccountReactivatedEmail(tenant.email, {
        name: tenant.name,
        nextBillingDate,
      }).catch(err => {
        this.logger.error(`Błąd wysyłania emaila o przywróceniu konta:`, err);
      });
    }

    // Resetuj licznik SMS przy odnowieniu subskrypcji (nowy okres rozliczeniowy)
    // Sprawdź czy to odnowienie (nie pierwsza płatność) - porównaj daty
    const previousPeriodEnd = existingSubscription.currentPeriodEnd;
    const newPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    
    // Jeśli nowy okres zaczyna się po poprzednim końcu - to odnowienie, resetuj SMS
    if (previousPeriodEnd && newPeriodStart >= previousPeriodEnd) {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { id: existingSubscription.id },
        include: { subscription_plans: true },
      });
      
      if (subscription?.subscription_plans) {
        const features = subscription.subscription_plans.features as any;
        const smsLimit = features?.sms === -1 ? 999999 : (features?.sms || 500);
        
        await this.prisma.tenants.update({
          where: { id: existingSubscription.tenantId },
          data: {
            sms_usage: {
              used: 0, // Reset licznika!
              limit: smsLimit,
              lastReset: new Date().toISOString(),
            },
          },
        });
        
        this.logger.log(`🔄 Zresetowano licznik SMS dla tenant ${existingSubscription.tenantId} (nowy okres rozliczeniowy)`);
      }
    }

    // Zapisz fakturę
    await this.prisma.invoices.create({
      data: {
        id: `inv_${Date.now()}`,
        tenantId: existingSubscription.tenantId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'paid',
        invoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      },
    });

    this.logger.log(`✅ Faktura opłacona dla subskrypcji ${invoice.subscription}`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) {
      return;
    }

    const existingSubscription = await this.prisma.subscriptions.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (!existingSubscription) {
      return;
    }

    // Zapisz informację o nieudanej płatności
    await this.prisma.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        status: 'PAST_DUE',
        lastPaymentStatus: 'failed',
        lastPaymentError: invoice.last_finalization_error?.message || 'Płatność nieudana',
      },
    });

    const attemptCount = invoice.attempt_count || 1;
    
    this.logger.error(
      `⚠️ Płatność nieudana dla ${existingSubscription.tenantId} - próba ${attemptCount}`,
    );

    // Zablokuj konto TYLKO po 3 nieudanych próbach (około 3 dni)
    if (attemptCount >= 3) {
      await this.prisma.tenants.update({
        where: { id: existingSubscription.tenantId },
        data: {
          isSuspended: true,
          suspendedReason: 'Płatność nieudana po 3 próbach - odnów subskrypcję',
        },
      });

      this.logger.error(
        `🚫 Zablokowano konto ${existingSubscription.tenantId} po 3 nieudanych próbach płatności`,
      );
    }

    // Wyślij email z informacją o nieudanej płatności
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: existingSubscription.tenantId },
    });

    if (tenant) {
      // Utwórz link do portalu klienta Stripe
      try {
        const portalSession = await this.stripe.billingPortal.sessions.create({
          customer: existingSubscription.stripeCustomerId,
          return_url: 'https://rezerwacja24.pl/dashboard/settings/subscription',
        });

        await this.emailService.sendPaymentFailedEmail(tenant.email, {
          name: tenant.name,
          attemptNumber: attemptCount,
          updatePaymentLink: portalSession.url,
        });

        this.logger.log(`📧 Wysłano email o nieudanej płatności do ${tenant.email}`);
      } catch (emailError) {
        this.logger.error(`Błąd wysyłania emaila o nieudanej płatności:`, emailError);
      }
    }
  }

  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
    if (!paymentMethod.customer) {
      return;
    }

    const existingSubscription = await this.prisma.subscriptions.findFirst({
      where: { stripeCustomerId: paymentMethod.customer as string },
    });

    if (!existingSubscription) {
      return;
    }

    await this.prisma.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        stripePaymentMethodId: paymentMethod.id,
      },
    });

    this.logger.log(`Dodano metodę płatności dla klienta ${paymentMethod.customer}`);
  }

  /**
   * Synchronizuje subskrypcję ze Stripe (ręcznie)
   */
  async syncSubscriptionFromStripe(tenantId: string) {
    try {
      this.logger.log(`🔄 Synchronizacja subskrypcji dla tenant ${tenantId}`);

      // Pobierz tenant
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new BadRequestException('Firma nie istnieje');
      }

      // Znajdź klienta Stripe po email
      const customers = await this.stripe.customers.list({
        email: tenant.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        this.logger.warn(`Brak klienta Stripe dla tenant ${tenantId}`);
        return { synced: false, message: 'Brak klienta w Stripe' };
      }

      const customer = customers.data[0];

      // Pobierz subskrypcje klienta
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
        status: 'all',
      });

      if (subscriptions.data.length === 0) {
        this.logger.warn(`Brak subskrypcji Stripe dla tenant ${tenantId}`);
        return { synced: false, message: 'Brak subskrypcji w Stripe' };
      }

      const stripeSubscription = subscriptions.data[0];

      // Pobierz plan z metadata lub z price
      const planId = stripeSubscription.metadata?.planId;
      
      if (!planId) {
        this.logger.error('Brak planId w metadata subskrypcji');
        return { synced: false, message: 'Brak planId w subskrypcji' };
      }

      const trialEnd = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null;

      const trialStart = stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null;

      // Utwórz lub zaktualizuj subskrypcję w bazie
      const subscription = await this.prisma.subscriptions.upsert({
        where: { tenantId },
        create: {
          id: `sub_${Date.now()}`,
          tenantId,
          planId,
          status: stripeSubscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
          stripeCustomerId: customer.id,
          stripeSubscriptionId: stripeSubscription.id,
          stripePaymentMethodId: stripeSubscription.default_payment_method as string,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          trialStart,
          trialEnd,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          status: stripeSubscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
          stripeCustomerId: customer.id,
          stripeSubscriptionId: stripeSubscription.id,
          stripePaymentMethodId: stripeSubscription.default_payment_method as string,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          trialStart,
          trialEnd,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`✅ Zsynchronizowano subskrypcję dla tenant ${tenantId}`);

      return { 
        synced: true, 
        subscription,
        message: 'Subskrypcja zsynchronizowana pomyślnie' 
      };
    } catch (error) {
      this.logger.error('Błąd podczas synchronizacji subskrypcji', error);
      throw error;
    }
  }

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
        throw new BadRequestException('Aby zmienić plan, najpierw dodaj kartę płatniczą w sekcji "Metoda płatności"');
      }

      // Sprawdź czy mamy subskrypcję w Stripe
      if (!subscription.stripeSubscriptionId || subscription.stripeSubscriptionId.startsWith('pending-')) {
        // Użytkownik jest w okresie próbnym bez aktywnej subskrypcji Stripe
        // Musimy utworzyć nową subskrypcję z wybranym planem
        this.logger.log(`Tenant ${tenantId} jest w okresie próbnym - tworzenie nowej subskrypcji Stripe`);
        
        // Sprawdź czy mamy klienta Stripe
        if (!subscription.stripeCustomerId || subscription.stripeCustomerId.startsWith('pending-')) {
          throw new BadRequestException('Aby zmienić plan, najpierw dodaj kartę płatniczą w sekcji "Metoda płatności"');
        }

        // Pobierz cenę z planu
        const priceId = newPlan.stripePriceId;
        if (!priceId) {
          throw new BadRequestException('Wybrany plan nie ma skonfigurowanej ceny');
        }

        // Utwórz nową subskrypcję w Stripe
        const stripeSubscription = await this.stripe.subscriptions.create({
          customer: subscription.stripeCustomerId,
          items: [{ price: priceId }],
          default_payment_method: subscription.stripePaymentMethodId,
          metadata: {
            tenantId,
            planId: newPlanId,
          },
        });

        // Zaktualizuj w bazie danych
        await this.prisma.subscriptions.update({
          where: { tenantId },
          data: {
            planId: newPlanId,
            stripeSubscriptionId: stripeSubscription.id,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });

        this.logger.log(`✅ Utworzono nową subskrypcję Stripe dla tenant ${tenantId} z planem ${newPlan.name}`);

        // Zaktualizuj limit SMS dla nowego planu
        await this.updateSmsLimits(tenantId, newPlan);

        return {
          success: true,
          newPlan: newPlan.name,
          message: `Plan zmieniony na ${newPlan.name}`,
        };
      }

      // Pobierz klienta Stripe
      const customer = await this.stripe.customers.retrieve(subscription.stripeCustomerId);
      if (!customer || customer.deleted) {
        throw new BadRequestException('Błąd podczas weryfikacji danych płatności');
      }

      // Pobierz cenę z planu
      const priceId = newPlan.stripePriceId;
      if (!priceId) {
        throw new BadRequestException('Wybrany plan nie ma skonfigurowanej ceny');
      }

      // Znajdź subscription item ID
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );
      
      if (!stripeSubscription.items.data || stripeSubscription.items.data.length === 0) {
        throw new BadRequestException('Nie znaleziono elementów subskrypcji w Stripe');
      }
      
      const subscriptionItemId = stripeSubscription.items.data[0].id;

      const currentPlanData = subscription.subscription_plans;

      // WSZYSTKIE ZMIANY PLANU: Wchodzą od następnego okresu rozliczeniowego
      // Klient korzysta z opłaconego planu do końca okresu, nowy plan zaczyna się od kolejnej płatności
      this.logger.log(`Scheduling plan change at period end for tenant ${tenantId}: ${currentPlanData?.name} -> ${newPlan.name}`);
      
      // Zmień plan w Stripe BEZ proporcjonalnego rozliczenia
      // proration_behavior: 'none' = brak kredytów/dopłat
      // Nowa cena zacznie obowiązywać od następnego okresu rozliczeniowego
      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{
            id: subscriptionItemId,
            price: priceId,
          }],
          proration_behavior: 'none', // BEZ proporcjonalnego rozliczenia - brak kredytów!
          metadata: {
            tenantId,
            planId: newPlanId,
          }
        }
      );

      // Zapisz informację o zmianie planu
      // previousPlanId przechowuje stary plan do celów informacyjnych
      await this.prisma.subscriptions.update({
        where: { tenantId },
        data: {
          previousPlanId: subscription.planId,
          planId: newPlanId,
          updatedAt: new Date(),
        },
      });

      const periodEnd = new Date(stripeSubscription.current_period_end * 1000);
      this.logger.log(`✅ Zmieniono plan dla tenant ${tenantId} na ${newPlan.name}. Nowa cena od ${periodEnd.toISOString()}`);

      // Zaktualizuj limit SMS dla nowego planu
      await this.updateSmsLimits(tenantId, newPlan);

      return {
        success: true,
        newPlan: newPlan.name,
        message: `Plan zmieniony na ${newPlan.name}. Nowa cena (${newPlan.priceMonthly} zł/mies.) zacznie obowiązywać od ${periodEnd.toLocaleDateString('pl-PL')}.`,
      };
    } catch (error) {
      this.logger.error('Błąd podczas zmiany planu', error);
      
      // Jeśli to już BadRequestException, przekaż dalej
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Bardziej szczegółowe komunikaty błędów
      if (error.code === 'resource_missing') {
        throw new BadRequestException('Nie znaleziono subskrypcji w systemie płatności');
      } else if (error.code === 'card_declined') {
        throw new BadRequestException('Karta została odrzucona. Sprawdź dane karty lub skontaktuj się z bankiem.');
      } else if (error.code === 'authentication_required') {
        throw new BadRequestException('Wymagane jest uwierzytelnienie płatności. Spróbuj ponownie.');
      } else if (error.type === 'StripeCardError') {
        throw new BadRequestException(`Błąd karty: ${error.message}`);
      } else if (error.type === 'StripeInvalidRequestError') {
        this.logger.error(`Błąd żądania do Stripe: ${error.message}`, error);
        throw new BadRequestException('Wystąpił błąd podczas przetwarzania płatności. Prosimy spróbować później.');
      }
      
      throw new BadRequestException('Wystąpił błąd podczas zmiany planu. Prosimy spróbować później.');
    }
  }

  /**
   * Aktualizuje limity SMS dla nowego planu
   */
  private async updateSmsLimits(tenantId: string, newPlan: any) {
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
  }

  /**
   * Tworzy SetupIntent do bezpiecznego dodania karty
   */
  async createSetupIntent(tenantId: string) {
    try {
      // Pobierz tenant
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new BadRequestException('Firma nie istnieje');
      }

      // Pobierz właściciela tenanta przez tenant_users
      const tenantUserWithOwner = await this.prisma.tenant_users.findFirst({
        where: { tenantId, role: 'TENANT_OWNER' },
      });
      
      let ownerEmail: string | null = null;
      if (tenantUserWithOwner) {
        const ownerUser = await this.prisma.users.findUnique({
          where: { id: tenantUserWithOwner.userId },
        });
        ownerEmail = ownerUser?.email || null;
      }

      // Sprawdź czy jest subskrypcja z klientem Stripe
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      let stripeCustomerId: string;

      if (subscription?.stripeCustomerId && !subscription.stripeCustomerId.startsWith('pending-')) {
        // Użyj istniejącego klienta (ale nie pending)
        stripeCustomerId = subscription.stripeCustomerId;
      } else {
        // Utwórz nowego klienta Stripe
        const email = ownerEmail || tenant.email || `${tenantId}@rezerwacja24.pl`;
        
        // Sprawdź czy klient już istnieje w Stripe
        const existingCustomers = await this.stripe.customers.list({
          email,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          stripeCustomerId = existingCustomers.data[0].id;
        } else {
          // Utwórz nowego klienta
          const customer = await this.stripe.customers.create({
            email,
            name: tenant.name,
            metadata: {
              tenantId,
              tenantName: tenant.name,
            },
          });
          stripeCustomerId = customer.id;
        }

        // Zaktualizuj subskrypcję jeśli istnieje
        if (subscription) {
          await this.prisma.subscriptions.update({
            where: { tenantId },
            data: { stripeCustomerId },
          });
        }
      }

      const setupIntent = await this.stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        metadata: {
          tenantId,
        },
      });

      this.logger.log(`Utworzono SetupIntent dla tenant ${tenantId}, customer ${stripeCustomerId}`);

      return {
        clientSecret: setupIntent.client_secret,
      };
    } catch (error) {
      this.logger.error('Błąd podczas tworzenia SetupIntent', error);
      throw error;
    }
  }

  /**
   * Pobiera metodę płatności dla klienta
   */
  async getPaymentMethod(tenantId: string) {
    try {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      if (!subscription) {
        return { paymentMethod: null };
      }

      if (!subscription.stripePaymentMethodId) {
        // Spróbuj pobrać domyślną metodę płatności z Stripe
        const customer = await this.stripe.customers.retrieve(
          subscription.stripeCustomerId,
          { expand: ['invoice_settings.default_payment_method'] }
        ) as Stripe.Customer;

        const defaultPm = customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod | null;
        
        if (defaultPm && defaultPm.card) {
          return {
            paymentMethod: {
              id: defaultPm.id,
              brand: defaultPm.card.brand,
              last4: defaultPm.card.last4,
              expMonth: defaultPm.card.exp_month,
              expYear: defaultPm.card.exp_year,
            },
          };
        }

        return { paymentMethod: null };
      }

      const paymentMethod = await this.stripe.paymentMethods.retrieve(
        subscription.stripePaymentMethodId
      );

      // Obsługa karty
      if (paymentMethod.card) {
        return {
          paymentMethod: {
            id: paymentMethod.id,
            type: 'card',
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
          },
        };
      }

      // Obsługa Stripe Link
      if (paymentMethod.type === 'link') {
        return {
          paymentMethod: {
            id: paymentMethod.id,
            type: 'link',
            brand: 'link',
            last4: paymentMethod.link?.email?.slice(-4) || '****',
            email: paymentMethod.link?.email || paymentMethod.billing_details?.email,
            expMonth: 12,
            expYear: 2099,
          },
        };
      }

      // Inne typy metod płatności
      return {
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          brand: paymentMethod.type,
          last4: '****',
          expMonth: 12,
          expYear: 2099,
        },
      };
    } catch (error) {
      this.logger.error('Błąd podczas pobierania metody płatności', error);
      return { paymentMethod: null };
    }
  }

  /**
   * Aktualizuje domyślną metodę płatności po SetupIntent
   */
  async updateDefaultPaymentMethod(tenantId: string, paymentMethodId: string) {
    try {
      const subscription = await this.prisma.subscriptions.findUnique({
        where: { tenantId },
      });

      if (!subscription) {
        throw new BadRequestException('Brak subskrypcji');
      }

      // Ustaw jako domyślną metodę płatności dla klienta
      await this.stripe.customers.update(subscription.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Jeśli jest aktywna subskrypcja, zaktualizuj też jej metodę płatności
      if (subscription.stripeSubscriptionId) {
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          default_payment_method: paymentMethodId,
        });
      }

      // Zaktualizuj w bazie
      await this.prisma.subscriptions.update({
        where: { tenantId },
        data: {
          stripePaymentMethodId: paymentMethodId,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Zaktualizowano metodę płatności dla tenant ${tenantId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Błąd podczas aktualizacji metody płatności', error);
      throw error;
    }
  }

  /**
   * Pobiera historię płatności (invoices) ze Stripe
   */
  async getStripeInvoices(stripeCustomerId: string) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: stripeCustomerId,
        limit: 50,
      });

      return invoices.data
        .filter(inv => inv.amount_paid > 0) // Tylko opłacone (nie trialne 0 zł)
        .map(inv => ({
          id: inv.id,
          amount: inv.amount_paid / 100,
          currency: inv.currency.toUpperCase(),
          status: inv.status === 'paid' ? 'paid' : 'pending',
          paidAt: inv.status_transitions?.paid_at 
            ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
            : null,
          createdAt: new Date(inv.created * 1000).toISOString(),
        }));
    } catch (error) {
      this.logger.error('Błąd podczas pobierania faktur ze Stripe:', error);
      return [];
    }
  }
}
