import { Injectable, BadRequestException, NotFoundException, Logger, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getRegionFromRequest, Region, getApiUrlForRegion } from '../common/utils/region.util';
import * as crypto from 'crypto';
import Stripe from 'stripe';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    @Inject(REQUEST) private request: Request,
  ) {}
  
  /**
   * Pobierz region z aktualnego żądania
   */
  private getRegion(): Region {
    return getRegionFromRequest(this.request);
  }
  
  /**
   * Generuj URL przekierowania po płatności na podstawie regionu
   */
  private getReturnUrl(subdomain: string, bookingId: string): string {
    const region = this.getRegion();
    const domain = region === 'eu' ? 'bookings24.eu' : 'rezerwacja24.pl';
    return `https://${subdomain}.${domain}/payment/success?bookingId=${bookingId}`;
  }
  
  /**
   * Generuj URL przekierowania po błędzie płatności
   */
  private getErrorUrl(subdomain: string, bookingId: string, error?: string): string {
    const region = this.getRegion();
    const domain = region === 'eu' ? 'bookings24.eu' : 'rezerwacja24.pl';
    const errorParam = error ? `&error=${encodeURIComponent(error)}` : '';
    return `https://${subdomain}.${domain}/payment/error?bookingId=${bookingId}${errorParam}`;
  }
  
  /**
   * Generuj URL webhooka na podstawie regionu
   */
  private getWebhookUrl(provider: string): string {
    const region = this.getRegion();
    const apiUrl = getApiUrlForRegion(region);
    return `${apiUrl}/api/payments/${provider}/webhook`;
  }

  /**
   * Pobierz ustawienia płatności dla użytkownika/firmy
   */
  async getPaymentSettings(tenantId: string) {
    const tenant: any = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Firma nie znaleziona');
    }

    return {
      paymentEnabled: tenant.paymentEnabled,
      acceptCashPayment: tenant.acceptCashPayment,
      acceptOnlinePayment: tenant.acceptOnlinePayment,
      paymentProvider: tenant.paymentProvider,
      przelewy24Enabled: tenant.przelewy24Enabled,
      przelewy24MerchantId: tenant.przelewy24MerchantId || '',
      przelewy24PosId: tenant.przelewy24PosId || '',
      przelewy24CrcKey: tenant.przelewy24CrcKey ? '••••••••' : '', // Maskuj klucz
      przelewy24ApiKey: tenant.przelewy24ApiKey ? '••••••••' : '', // Maskuj klucz
      stripeEnabled: tenant.stripeEnabled,
      payuEnabled: tenant.payuEnabled,
    };
  }

  /**
   * Zaktualizuj ustawienia płatności
   */
  async updatePaymentSettings(tenantId: string, settings: any) {
    const updateData: any = {};

    // Podstawowe ustawienia
    if (settings.paymentEnabled !== undefined) {
      updateData.paymentEnabled = settings.paymentEnabled;
    }
    if (settings.acceptCashPayment !== undefined) {
      updateData.acceptCashPayment = settings.acceptCashPayment;
    }
    if (settings.acceptOnlinePayment !== undefined) {
      updateData.acceptOnlinePayment = settings.acceptOnlinePayment;
    }
    if (settings.paymentProvider) {
      updateData.paymentProvider = settings.paymentProvider;
    }

    // Przelewy24
    if (settings.przelewy24) {
      if (settings.przelewy24.merchantId) updateData.przelewy24MerchantId = settings.przelewy24.merchantId;
      if (settings.przelewy24.posId) updateData.przelewy24PosId = settings.przelewy24.posId;
      if (settings.przelewy24.crcKey) updateData.przelewy24CrcKey = settings.przelewy24.crcKey;
      if (settings.przelewy24.apiKey) updateData.przelewy24ApiKey = settings.przelewy24.apiKey;
      if (settings.przelewy24.enabled !== undefined) updateData.przelewy24Enabled = settings.przelewy24.enabled;
    }

    // Stripe
    if (settings.stripe) {
      if (settings.stripe.publicKey) updateData.stripePublishableKey = settings.stripe.publicKey;
      if (settings.stripe.secretKey) updateData.stripeSecretKey = settings.stripe.secretKey;
      if (settings.stripe.webhookSecret) updateData.stripeWebhookSecret = settings.stripe.webhookSecret;
      if (settings.stripe.enabled !== undefined) updateData.stripeEnabled = settings.stripe.enabled;
    }

    // PayU
    if (settings.payu) {
      if (settings.payu.posId) updateData.payuPosId = settings.payu.posId;
      if (settings.payu.secondKey) updateData.payuSecondKey = settings.payu.secondKey;
      if (settings.payu.clientId) updateData.payuOAuthClientId = settings.payu.clientId;
      if (settings.payu.clientSecret) updateData.payuOAuthClientSecret = settings.payu.clientSecret;
      if (settings.payu.enabled !== undefined) updateData.payuEnabled = settings.payu.enabled;
    }

    // Gotówka
    if (settings.cash?.enabled !== undefined) {
      updateData.acceptCashPayment = settings.cash.enabled;
    }

    // Ogólne ustawienia płatności
    if (settings.paymentEnabled !== undefined) {
      updateData.paymentEnabled = settings.paymentEnabled;
    }

    if (settings.acceptOnlinePayment !== undefined) {
      updateData.acceptOnlinePayment = settings.acceptOnlinePayment;
    }

    // Automatyczne zatwierdzanie rezerwacji
    if (settings.autoConfirmBookings !== undefined) {
      updateData.autoConfirmBookings = settings.autoConfirmBookings;
    }

    updateData.updatedAt = new Date();

    const updated: any = await this.prisma.tenants.update({
      where: { id: tenantId },
      data: updateData,
    });

    return {
      paymentEnabled: updated.paymentEnabled,
      acceptCashPayment: updated.acceptCashPayment,
      acceptOnlinePayment: updated.acceptOnlinePayment,
      paymentProvider: updated.paymentProvider,
      przelewy24Enabled: updated.przelewy24Enabled,
      stripeEnabled: updated.stripeEnabled,
      payuEnabled: updated.payuEnabled,
    };
  }

  /**
   * Pobierz rezerwację z danymi klienta (do ponowienia płatności)
   */
  async getBookingWithCustomer(bookingId: string) {
    return this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { customers: true },
    });
  }

  /**
   * Utwórz płatność Przelewy24
   */
  async createPrzelewy24Payment(userId: string, bookingId: string, amount: number, customerEmail: string, customerName: string) {
    // Walidacja danych wejściowych
    if (!userId || !bookingId || !amount || !customerEmail || !customerName) {
      throw new BadRequestException('Brakujące wymagane dane');
    }

    if (amount <= 0 || amount > 1000000) {
      throw new BadRequestException('Nieprawidłowa kwota płatności');
    }

    if (!customerEmail.includes('@')) {
      throw new BadRequestException('Nieprawidłowy adres email');
    }
    const tenant: any = await this.prisma.tenants.findUnique({
      where: { id: userId },
    });

    if (!tenant || !tenant.przelewy24Enabled) {
      throw new BadRequestException('Przelewy24 nie jest włączone');
    }

    if (!tenant.przelewy24MerchantId || !tenant.przelewy24PosId || !tenant.przelewy24CrcKey || !tenant.przelewy24ApiKey) {
      throw new BadRequestException('Przelewy24 nie jest poprawnie skonfigurowane. Uzupełnij dane w ustawieniach.');
    }

    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { services: true },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Generuj session ID
    const sessionId = `P24_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Przygotuj dane do podpisu
    // WAŻNE: Przelewy24 wymaga konkatenacji wartości, NIE JSON!
    // Format: {"sessionId":"{sessionId}","merchantId":{merchantId},"amount":{amount},"currency":"{currency}","crc":"{crc}"}
    const amountInGrosze = Math.round(amount * 100);
    const merchantId = parseInt(tenant.przelewy24MerchantId);
    
    // Buduj string do podpisu zgodnie z dokumentacją P24
    const signString = `{"sessionId":"${sessionId}","merchantId":${merchantId},"amount":${amountInGrosze},"currency":"PLN","crc":"${tenant.przelewy24CrcKey}"}`;
    
    // NIE loguj pełnego signString - zawiera CRC Key!
    this.logger.log(`Przelewy24 creating signature for sessionId: ${sessionId}`);
    
    const sign = crypto
      .createHash('sha384')
      .update(signString)
      .digest('hex');
    
    this.logger.log(`Przelewy24 signature generated successfully`);

    // Przygotuj dane transakcji
    const transactionData = {
      merchantId: merchantId,
      posId: parseInt(tenant.przelewy24PosId),
      sessionId,
      amount: amountInGrosze,
      currency: 'PLN',
      description: `Rezerwacja: ${booking.services.name}`,
      email: customerEmail,
      client: customerName,
      country: 'PL',
      language: 'pl',
      urlReturn: this.getReturnUrl(tenant.subdomain, bookingId),
      urlStatus: this.getWebhookUrl('przelewy24'),
      sign,
    };

    try {
      // Wywołaj API Przelewy24 aby utworzyć transakcję
      this.logger.log(`Creating Przelewy24 payment for booking ${bookingId}`);
      // NIE loguj pełnych danych - zawierają wrażliwe informacje
      this.logger.log(`Transaction: sessionId=${sessionId}, amount=${amountInGrosze}, merchantId=${merchantId}`);
      
      const apiUrl = process.env.PRZELEWY24_SANDBOX === 'true' 
        ? 'https://sandbox.przelewy24.pl/api/v1/transaction/register'
        : 'https://secure.przelewy24.pl/api/v1/transaction/register';
      
      const response = await axios.post(apiUrl, transactionData, {
        auth: {
          username: String(tenant.przelewy24PosId),
          password: tenant.przelewy24ApiKey,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 sekund timeout
      });

      this.logger.log(`Przelewy24 API response: ${JSON.stringify(response.data)}`);

      if (response.data && response.data.data && response.data.data.token) {
        const token = response.data.data.token;
        const paymentUrl = process.env.PRZELEWY24_SANDBOX === 'true'
          ? `https://sandbox.przelewy24.pl/trnRequest/${token}`
          : `https://secure.przelewy24.pl/trnRequest/${token}`;

        // Zaktualizuj rezerwację - zapisz sessionId żeby webhook mógł znaleźć rezerwację
        await this.prisma.bookings.update({
          where: { id: bookingId },
          data: {
            paymentMethod: 'przelewy24',
            stripePaymentIntentId: sessionId, // Używamy tego pola dla sessionId P24
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Przelewy24 payment created successfully: ${token}`);

        return {
          sessionId,
          token,
          paymentUrl,
        };
      } else {
        this.logger.error(`Invalid Przelewy24 response structure: ${JSON.stringify(response.data)}`);
        throw new Error('Invalid response from Przelewy24');
      }
    } catch (error) {
      this.logger.error(`Przelewy24 payment creation failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`Przelewy24 API error response: ${JSON.stringify(error.response.data)}`);
      }
      if (error.response?.status) {
        this.logger.error(`Przelewy24 API status: ${error.response.status}`);
      }
      
      // Zaktualizuj rezerwację ze statusem failed
      await this.prisma.bookings.update({
        where: { id: bookingId },
        data: {
          updatedAt: new Date(),
        },
      });

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new BadRequestException(
        `Nie udało się utworzyć płatności Przelewy24: ${errorMessage}`
      );
    }
  }

  /**
   * Utwórz płatność Stripe
   */
  async createStripePayment(userId: string, bookingId: string, amount: number, customerEmail: string) {
    const tenant: any = await this.prisma.tenants.findUnique({
      where: { id: userId },
    });

    if (!tenant || !tenant.stripeEnabled || !tenant.stripeSecretKey) {
      throw new BadRequestException('Stripe nie jest włączone');
    }

    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { services: true },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    try {
      this.logger.log(`Creating Stripe payment for booking ${bookingId}`);
      
      const stripe = new Stripe(tenant.stripeSecretKey, {
        apiVersion: '2023-10-16',
      });

      // Utwórz Payment Intent z tenantId w metadata (dla optymalizacji webhook)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // w groszach
        currency: 'pln',
        description: `Rezerwacja: ${booking.services.name}`,
        receipt_email: customerEmail,
        metadata: {
          bookingId,
          tenantId: userId, // Dodane dla optymalizacji webhook
          userId, // Zachowane dla kompatybilności wstecznej
        },
      });

      // Zaktualizuj rezerwację
      await this.prisma.bookings.update({
        where: { id: bookingId },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          paymentMethod: 'stripe',
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Stripe payment created successfully: ${paymentIntent.id}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Stripe payment creation failed: ${error.message}`, error.stack);
      
      // Zaktualizuj rezerwację ze statusem failed
      await this.prisma.bookings.update({
        where: { id: bookingId },
        data: {
          updatedAt: new Date(),
        },
      });

      throw new BadRequestException(
        `Nie udało się utworzyć płatności Stripe: ${error.message}`
      );
    }
  }

  /**
   * Utwórz płatność PayU
   */
  async createPayUPayment(userId: string, bookingId: string, amount: number, customerEmail: string, customerName: string) {
    const tenant: any = await this.prisma.tenants.findUnique({
      where: { id: userId },
    });

    if (!tenant || !tenant.payuEnabled) {
      throw new BadRequestException('PayU nie jest włączone');
    }

    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { services: true },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Generuj order ID
    const orderId = `PAYU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Przygotuj dane zamówienia
    const orderData = {
      merchantPosId: tenant.payuPosId,
      description: `Rezerwacja: ${booking.services.name}`,
      currencyCode: 'PLN',
      totalAmount: Math.round(amount * 100).toString(), // w groszach jako string
      buyer: {
        email: customerEmail,
        firstName: customerName.split(' ')[0],
        lastName: customerName.split(' ').slice(1).join(' ') || customerName,
      },
      products: [
        {
          name: booking.services.name,
          unitPrice: Math.round(amount * 100).toString(),
          quantity: '1',
        },
      ],
      notifyUrl: this.getWebhookUrl('payu'),
      continueUrl: this.getReturnUrl(tenant.subdomain, bookingId),
    };

    try {
      // Wywołaj API PayU aby utworzyć zamówienie
      this.logger.log(`Creating PayU payment for booking ${bookingId}`);
      
      const apiUrl = process.env.PAYU_SANDBOX === 'true'
        ? 'https://secure.snd.payu.com/api/v2_1/orders'
        : 'https://secure.payu.com/api/v2_1/orders';

      // Najpierw pobierz OAuth token
      const tokenResponse = await axios.post(
        process.env.PAYU_SANDBOX === 'true'
          ? 'https://secure.snd.payu.com/pl/standard/user/oauth/authorize'
          : 'https://secure.payu.com/pl/standard/user/oauth/authorize',
        `grant_type=client_credentials&client_id=${tenant.payuOAuthClientId}&client_secret=${tenant.payuOAuthClientSecret}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Utwórz zamówienie
      const response = await axios.post(apiUrl, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });

      if (response.data && response.data.orderId && response.data.redirectUri) {
        const payuOrderId = response.data.orderId;
        const paymentUrl = response.data.redirectUri;

        // Zaktualizuj rezerwację
        await this.prisma.bookings.update({
          where: { id: bookingId },
          data: {
            paymentMethod: 'payu',
            updatedAt: new Date(),
          },
        });

        this.logger.log(`PayU payment created successfully: ${payuOrderId}`);

        return {
          orderId: payuOrderId,
          paymentUrl,
        };
      } else {
        throw new Error('Invalid response from PayU');
      }
    } catch (error) {
      this.logger.error(`PayU payment creation failed: ${error.message}`, error.stack);
      
      // Zaktualizuj rezerwację ze statusem failed
      await this.prisma.bookings.update({
        where: { id: bookingId },
        data: {
          updatedAt: new Date(),
        },
      });

      throw new BadRequestException(
        `Nie udało się utworzyć płatności PayU: ${error.response?.data?.error || error.message}`
      );
    }
  }

  /**
   * Webhook Przelewy24
   */
  async handlePrzelewy24Webhook(data: any) {
    this.logger.log(`Przelewy24 webhook received: ${JSON.stringify(data)}`);

    const sessionId = data.sessionId;
    if (!sessionId) {
      this.logger.error('Przelewy24 webhook: missing sessionId');
      throw new BadRequestException('Missing sessionId');
    }

    // TODO: Dodać kolumnę przelewy24SessionId do schema.prisma
    // Tymczasowo szukamy po stripePaymentIntentId (jako fallback)
    const booking = await this.prisma.bookings.findFirst({
      where: { stripePaymentIntentId: sessionId },
    });

    if (!booking) {
      this.logger.error(`Przelewy24 webhook: booking not found for sessionId ${sessionId}`);
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Pobierz dane tenanta dla weryfikacji podpisu
    // WAŻNE: booking nie ma bezpośredniego pola tenantId, musimy go znaleźć przez employee
    const employee = await this.prisma.employees.findUnique({
      where: { id: booking.employeeId },
    });

    if (!employee) {
      this.logger.error('Przelewy24 webhook: employee not found');
      throw new NotFoundException('Pracownik nie znaleziony');
    }

    // employee.userId to faktycznie tenantId (owner firmy)
    const tenant: any = await this.prisma.tenants.findUnique({
      where: { id: employee.userId },
    });

    if (!tenant) {
      this.logger.error('Przelewy24 webhook: tenant not found');
      throw new NotFoundException('Tenant nie znaleziony');
    }

    // Weryfikuj podpis CRC
    // Format: {"sessionId":"{sessionId}","orderId":{orderId},"amount":{amount},"currency":"{currency}","crc":"{crc}"}
    const merchantId = parseInt(tenant.przelewy24MerchantId);
    const orderId = data.orderId;
    const amount = data.amount;
    const currency = data.currency || 'PLN';
    const receivedSign = data.sign;

    const signString = `{"sessionId":"${sessionId}","orderId":${orderId},"amount":${amount},"currency":"${currency}","crc":"${tenant.przelewy24CrcKey}"}`;
    const expectedSign = crypto
      .createHash('sha384')
      .update(signString)
      .digest('hex');

    // NIE loguj pełnych podpisów - to dane wrażliwe
    const signaturesMatch = receivedSign === expectedSign;
    this.logger.log(`Przelewy24 webhook signature verification: ${signaturesMatch ? 'VALID' : 'INVALID'}`);

    if (!signaturesMatch) {
      this.logger.error(`Przelewy24 webhook: invalid signature for sessionId ${sessionId}`);
      throw new BadRequestException('Invalid signature');
    }

    // Weryfikuj kwotę płatności
    const expectedAmount = Math.round(Number(booking.totalPrice) * 100);
    if (amount !== expectedAmount) {
      this.logger.error(`Przelewy24 webhook: amount mismatch. Expected ${expectedAmount}, got ${amount}`);
      throw new BadRequestException('Amount mismatch');
    }

    // Sprawdź czy płatność już nie została przetworzona (idempotencja)
    if (booking.isPaid) {
      this.logger.warn(`Przelewy24 webhook: booking ${booking.id} already marked as paid`);
      return { success: true, message: 'Already processed' };
    }

    // Zaktualizuj status płatności i potwierdź rezerwację
    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: {
        isPaid: true,
        paidAmount: booking.totalPrice,
        paidAt: new Date(),
        status: 'CONFIRMED', // Potwierdź rezerwację po udanej płatności
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Przelewy24 webhook: booking ${booking.id} marked as paid`);

    // 🔔 Utwórz powiadomienie o płatności
    await this.createPaymentNotification(
      tenant.id,
      'Płatność otrzymana',
      `Otrzymano płatność ${(amount / 100).toFixed(2)} PLN za rezerwację (Przelewy24)`,
      booking.id
    );

    return { success: true };
  }

  /**
   * Webhook Stripe dla płatności za rezerwacje
   * UWAGA: Ten webhook jest dla płatności za REZERWACJE, nie subskrypcje!
   * Subskrypcje używają /api/billing/webhook
   * 
   * OPTYMALIZACJA: Najpierw próbujemy znaleźć tenanta po tenantId z metadata,
   * co eliminuje konieczność iteracji po wszystkich tenantach.
   */
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    this.logger.debug('Otrzymano webhook Stripe dla płatności za rezerwacje');

    let event: Stripe.Event | null = null;
    let matchedTenant: any = null;

    // Próba 1: Sparsuj payload bez weryfikacji aby uzyskać tenantId z metadata
    try {
      const rawPayload = JSON.parse(rawBody.toString());
      const tenantIdFromMetadata = rawPayload?.data?.object?.metadata?.tenantId;
      
      if (tenantIdFromMetadata) {
        // Znajdź tenanta bezpośrednio po ID
        const tenant = await this.prisma.tenants.findUnique({
          where: { id: tenantIdFromMetadata },
        });

        if (tenant?.stripeEnabled && tenant?.stripeWebhookSecret && tenant?.stripeSecretKey) {
          try {
            const stripe = new Stripe(tenant.stripeSecretKey, {
              apiVersion: '2023-10-16',
            });

            event = stripe.webhooks.constructEvent(
              rawBody,
              signature,
              tenant.stripeWebhookSecret
            );

            matchedTenant = tenant;
            this.logger.debug(`Webhook zweryfikowany dla tenant ${tenant.id} (optymalizacja metadata)`);
          } catch (err) {
            this.logger.debug(`Weryfikacja dla tenanta z metadata nie powiodła się: ${err.message}`);
          }
        }
      }
    } catch (parseErr) {
      this.logger.debug('Nie udało się sparsować payload dla optymalizacji');
    }

    // Próba 2: Fallback - iteracja po wszystkich tenantach (dla starszych płatności bez tenantId w metadata)
    if (!event || !matchedTenant) {
      const tenants = await this.prisma.tenants.findMany({
        where: {
          stripeEnabled: true,
          stripeWebhookSecret: { not: null },
        },
      });

      for (const tenant of tenants) {
        try {
          const stripe = new Stripe(tenant.stripeSecretKey, {
            apiVersion: '2023-10-16',
          });

          event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            tenant.stripeWebhookSecret
          );

          matchedTenant = tenant;
          this.logger.debug(`Webhook zweryfikowany dla tenant ${tenant.id} (fallback)`);
          break;
        } catch (err) {
          continue;
        }
      }
    }

    if (!event || !matchedTenant) {
      this.logger.error('Nie udało się zweryfikować podpisu webhooka dla żadnego tenanta');
      throw new BadRequestException('Webhook signature verification failed');
    }

    this.logger.debug(`Przetwarzanie eventu: ${event.type}`);

    // Obsłuż różne typy eventów
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (!bookingId) {
          this.logger.warn('Brak bookingId w metadata payment intent');
          break;
        }

        await this.prisma.bookings.update({
          where: { id: bookingId },
          data: {
            isPaid: true,
            paidAmount: paymentIntent.amount / 100,
            paidAt: new Date(),
            status: 'CONFIRMED',
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Płatność za rezerwację ${bookingId} potwierdzona`);

        // 🔔 Utwórz powiadomienie o płatności
        await this.createPaymentNotification(
          matchedTenant.id,
          'Płatność otrzymana',
          `Otrzymano płatność ${(paymentIntent.amount / 100).toFixed(2)} PLN za rezerwację (Stripe)`,
          bookingId
        );
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        const failedBookingId = failedIntent.metadata?.bookingId;

        if (failedBookingId) {
          this.logger.error(`Płatność za rezerwację ${failedBookingId} nieudana`);
        }
        break;

      default:
        this.logger.log(`Nieobsługiwany typ eventu: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Webhook PayU
   */
  async handlePayUWebhook(data: any) {
    // TODO: Zweryfikuj podpis
    // TODO: Zaktualizuj status płatności
    // TODO: Dodać kolumny payuOrderId, paymentStatus, payuStatus do schema.prisma

    // Tymczasowo wyłączone - brakuje kolumn w bazie
    this.logger.warn('PayU webhook not implemented - missing database columns');
    return { success: false, message: 'Not implemented' };

    /* 
    const orderId = data.order.orderId;
    const booking = await this.prisma.bookings.findFirst({
      where: { payuOrderId: orderId },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: {
        isPaid: data.order.status === 'COMPLETED',
        paidAmount: booking.totalPrice,
        paidAt: data.order.status === 'COMPLETED' ? new Date() : null,
        paymentStatus: data.order.status === 'COMPLETED' ? 'completed' : 'pending',
        payuStatus: data.order.status,
        updatedAt: new Date(),
      },
    });

    return { success: true };
    */
  }

  /**
   * Tworzy powiadomienie o płatności dla właściciela firmy
   */
  private async createPaymentNotification(
    tenantId: string,
    title: string,
    message: string,
    bookingId?: string
  ) {
    try {
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        select: { ownerId: true },
      });

      if (!tenant?.ownerId) {
        this.logger.warn(`Nie znaleziono właściciela dla tenant ${tenantId}`);
        return;
      }

      await this.notificationsService.create({
        tenantId,
        userId: tenant.ownerId,
        type: 'PAYMENT',
        title,
        message,
        actionUrl: bookingId ? `/dashboard/bookings?id=${bookingId}` : undefined,
        metadata: bookingId ? { bookingId } : undefined,
      });

      this.logger.log(`🔔 Utworzono powiadomienie: ${title}`);
    } catch (error) {
      this.logger.error(`Błąd tworzenia powiadomienia: ${error}`);
    }
  }
}
