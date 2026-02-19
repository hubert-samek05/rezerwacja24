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
      // Przelewy24
      przelewy24Enabled: tenant.przelewy24Enabled,
      przelewy24MerchantId: tenant.przelewy24MerchantId || '',
      przelewy24PosId: tenant.przelewy24PosId || '',
      przelewy24CrcKey: tenant.przelewy24CrcKey ? '••••••••' : '',
      przelewy24ApiKey: tenant.przelewy24ApiKey ? '••••••••' : '',
      // Stripe
      stripeEnabled: tenant.stripeEnabled,
      stripePublishableKey: tenant.stripePublishableKey ? '••••••••' : '',
      stripeSecretKey: tenant.stripeSecretKey ? '••••••••' : '',
      // PayU
      payuEnabled: tenant.payuEnabled,
      payuPosId: tenant.payuPosId || '',
      payuSecondKey: tenant.payuSecondKey ? '••••••••' : '',
      payuOAuthClientId: tenant.payuOAuthClientId || '',
      payuOAuthClientSecret: tenant.payuOAuthClientSecret ? '••••••••' : '',
      // Tpay
      tpayEnabled: tenant.tpayEnabled,
      tpayClientId: tenant.tpayClientId || '',
      tpayClientSecret: tenant.tpayClientSecret ? '••••••••' : '',
      tpayMerchantId: tenant.tpayMerchantId || '',
      tpaySecurityCode: tenant.tpaySecurityCode ? '••••••••' : '',
      // Autopay
      autopayEnabled: tenant.autopayEnabled,
      autopayServiceId: tenant.autopayServiceId || '',
      autopaySharedKey: tenant.autopaySharedKey ? '••••••••' : '',
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

    // Tpay
    if (settings.tpay) {
      if (settings.tpay.clientId) updateData.tpayClientId = settings.tpay.clientId;
      if (settings.tpay.clientSecret) updateData.tpayClientSecret = settings.tpay.clientSecret;
      if (settings.tpay.merchantId) updateData.tpayMerchantId = settings.tpay.merchantId;
      if (settings.tpay.securityCode) updateData.tpaySecurityCode = settings.tpay.securityCode;
      if (settings.tpay.enabled !== undefined) updateData.tpayEnabled = settings.tpay.enabled;
    }

    // Autopay (Blue Media)
    if (settings.autopay) {
      if (settings.autopay.serviceId) updateData.autopayServiceId = settings.autopay.serviceId;
      if (settings.autopay.sharedKey) updateData.autopaySharedKey = settings.autopay.sharedKey;
      if (settings.autopay.enabled !== undefined) updateData.autopayEnabled = settings.autopay.enabled;
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
      tpayEnabled: updated.tpayEnabled,
      autopayEnabled: updated.autopayEnabled,
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
      this.logger.log(`Creating Stripe Checkout Session for booking ${bookingId}, amount: ${amount} PLN`);
      
      const stripe = new Stripe(tenant.stripeSecretKey, {
        apiVersion: '2023-10-16',
      });

      // Użyj Stripe Checkout Session - przekierowanie do strony płatności Stripe
      const baseUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';
      const subdomain = tenant.subdomain;
      const successUrl = `https://${subdomain}.rezerwacja24.pl?payment=success&bookingId=${bookingId}`;
      const cancelUrl = `https://${subdomain}.rezerwacja24.pl?payment=cancelled&bookingId=${bookingId}`;

      // Użyj automatycznego wyboru metod płatności (Stripe sam wybierze dostępne dla konta)
      // Nie podajemy payment_method_types - Stripe automatycznie pokaże wszystkie włączone metody
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: booking.services.name,
                description: `Rezerwacja usługi: ${booking.services.name}`,
              },
              unit_amount: Math.round(amount * 100), // w groszach
            },
            quantity: 1,
          },
        ],
        metadata: {
          bookingId,
          tenantId: userId,
          userId,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Zaktualizuj rezerwację
      await this.prisma.bookings.update({
        where: { id: bookingId },
        data: {
          stripePaymentIntentId: session.payment_intent as string || session.id,
          paymentMethod: 'stripe',
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Stripe Checkout Session created successfully: ${session.id}, URL: ${session.url}`);

      // Zwróć URL do przekierowania (tak jak inne bramki płatności)
      return {
        paymentUrl: session.url,
        sessionId: session.id,
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
   * Weryfikuj płatność Stripe po powrocie klienta (bez webhooka)
   * Sprawdza status płatności bezpośrednio w Stripe API
   */
  async verifyStripePaymentByBooking(bookingId: string) {
    this.logger.log(`Verifying Stripe payment for booking ${bookingId}`);

    // Pobierz rezerwację z danymi usługi
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { 
        services: { 
          select: { tenantId: true } 
        } 
      },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Jeśli już opłacona - zwróć sukces
    if (booking.isPaid) {
      return { success: true, status: 'paid', message: 'Płatność już potwierdzona' };
    }

    // Pobierz tenanta
    const tenantId = booking.services?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Nie można znaleźć tenanta');
    }

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.stripeEnabled || !tenant?.stripeSecretKey) {
      throw new BadRequestException('Stripe nie jest skonfigurowane');
    }

    // Sprawdź czy mamy ID płatności Stripe
    const stripePaymentId = booking.stripePaymentIntentId;
    if (!stripePaymentId) {
      return { success: false, status: 'no_payment', message: 'Brak płatności Stripe' };
    }

    try {
      const stripe = new Stripe(tenant.stripeSecretKey, {
        apiVersion: '2023-10-16',
      });

      // Sprawdź czy to Checkout Session czy Payment Intent
      let isPaid = false;
      let amountPaid = 0;

      if (stripePaymentId.startsWith('cs_')) {
        // To jest Checkout Session
        const session = await stripe.checkout.sessions.retrieve(stripePaymentId);
        isPaid = session.payment_status === 'paid';
        amountPaid = (session.amount_total || 0) / 100;
      } else if (stripePaymentId.startsWith('pi_')) {
        // To jest Payment Intent
        const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);
        isPaid = paymentIntent.status === 'succeeded';
        amountPaid = paymentIntent.amount / 100;
      } else {
        // Spróbuj jako Checkout Session (może być bez prefiksu)
        try {
          const session = await stripe.checkout.sessions.retrieve(stripePaymentId);
          isPaid = session.payment_status === 'paid';
          amountPaid = (session.amount_total || 0) / 100;
        } catch {
          return { success: false, status: 'unknown', message: 'Nieznany format ID płatności' };
        }
      }

      if (isPaid) {
        // Zaktualizuj rezerwację jako opłaconą
        await this.prisma.bookings.update({
          where: { id: bookingId },
          data: {
            isPaid: true,
            paidAmount: amountPaid,
            paidAt: new Date(),
            status: 'CONFIRMED',
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Stripe payment verified and confirmed for booking ${bookingId}`);

        // Utwórz powiadomienie
        await this.createPaymentNotification(
          tenantId,
          'Płatność otrzymana',
          `Otrzymano płatność ${amountPaid.toFixed(2)} PLN za rezerwację (Stripe)`,
          bookingId
        );

        return { success: true, status: 'paid', message: 'Płatność potwierdzona' };
      } else {
        return { success: false, status: 'pending', message: 'Płatność w trakcie przetwarzania' };
      }
    } catch (error) {
      this.logger.error(`Stripe payment verification failed: ${error.message}`);
      return { success: false, status: 'error', message: error.message };
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

        // Zaktualizuj rezerwację z payuOrderId
        await this.prisma.bookings.update({
          where: { id: bookingId },
          data: {
            paymentMethod: 'payu',
            payuOrderId: payuOrderId,
            paymentStatus: 'pending',
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
   * Utwórz płatność Tpay
   */
  async createTpayPayment(userId: string, bookingId: string, amount: number, customerEmail: string, customerName: string) {
    const tenant: any = await this.prisma.tenants.findUnique({
      where: { id: userId },
    });

    if (!tenant || !tenant.tpayEnabled) {
      throw new BadRequestException('Tpay nie jest włączone');
    }

    if (!tenant.tpayClientId || !tenant.tpayClientSecret || !tenant.tpayMerchantId) {
      throw new BadRequestException('Tpay nie jest poprawnie skonfigurowane. Uzupełnij dane w ustawieniach.');
    }

    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { services: true },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Generuj unikalny crc (transaction id)
    const crc = `TPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      this.logger.log(`Creating Tpay payment for booking ${bookingId}`);
      
      // Tpay API - najpierw pobierz token OAuth
      const tokenUrl = process.env.TPAY_SANDBOX === 'true'
        ? 'https://openapi.sandbox.tpay.com/oauth/auth'
        : 'https://openapi.tpay.com/oauth/auth';

      const tokenResponse = await axios.post(tokenUrl, {
        client_id: tenant.tpayClientId,
        client_secret: tenant.tpayClientSecret,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      const accessToken = tokenResponse.data.access_token;

      // Utwórz transakcję
      const apiUrl = process.env.TPAY_SANDBOX === 'true'
        ? 'https://openapi.sandbox.tpay.com/transactions'
        : 'https://openapi.tpay.com/transactions';

      const transactionData = {
        amount: amount,
        description: `Rezerwacja: ${booking.services.name}`,
        crc: crc,
        payer: {
          email: customerEmail,
          name: customerName,
        },
        callbacks: {
          payerUrls: {
            success: this.getReturnUrl(tenant.subdomain, bookingId),
            error: this.getErrorUrl(tenant.subdomain, bookingId, 'payment_failed'),
          },
          notification: {
            url: this.getWebhookUrl('tpay'),
          },
        },
      };

      const response = await axios.post(apiUrl, transactionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });

      if (response.data && response.data.transactionId && response.data.transactionPaymentUrl) {
        const transactionId = response.data.transactionId;
        const paymentUrl = response.data.transactionPaymentUrl;

        // Zaktualizuj rezerwację
        await this.prisma.bookings.update({
          where: { id: bookingId },
          data: {
            paymentMethod: 'tpay',
            tpayTransactionId: transactionId,
            paymentStatus: 'pending',
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Tpay payment created successfully: ${transactionId}`);

        return {
          transactionId,
          paymentUrl,
        };
      } else {
        throw new Error('Invalid response from Tpay');
      }
    } catch (error) {
      this.logger.error(`Tpay payment creation failed: ${error.message}`, error.stack);
      
      await this.prisma.bookings.update({
        where: { id: bookingId },
        data: { updatedAt: new Date() },
      });

      throw new BadRequestException(
        `Nie udało się utworzyć płatności Tpay: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Utwórz płatność Autopay (Blue Media)
   * Dokumentacja: https://github.com/bluepayment-plugin/bm-sdk
   */
  async createAutopayPayment(userId: string, bookingId: string, amount: number, customerEmail: string, customerName: string) {
    const tenant: any = await this.prisma.tenants.findUnique({
      where: { id: userId },
    });

    if (!tenant || !tenant.autopayEnabled) {
      throw new BadRequestException('Autopay nie jest włączone');
    }

    if (!tenant.autopayServiceId || !tenant.autopaySharedKey) {
      throw new BadRequestException('Autopay nie jest poprawnie skonfigurowane. Uzupełnij dane w ustawieniach.');
    }

    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { services: true },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Generuj unikalny orderId (max 32 znaki dla Autopay)
    const orderId = `AP${Date.now()}`;

    try {
      this.logger.log(`Creating Autopay payment for booking ${bookingId}, orderId: ${orderId}`);
      
      // Autopay (Blue Media) API - używamy formularza przekierowania
      const gatewayUrl = process.env.AUTOPAY_SANDBOX === 'true'
        ? 'https://testpay.autopay.eu'
        : 'https://pay.autopay.eu';

      const serviceId = tenant.autopayServiceId;
      const sharedKey = tenant.autopaySharedKey;
      const amountStr = amount.toFixed(2);
      const description = `Rezerwacja: ${booking.services?.name || 'Usługa'}`.substring(0, 100);
      const returnUrl = this.getReturnUrl(tenant.subdomain, bookingId);
      
      // Hash zgodnie z SDK Autopay - kolejność pól jest kluczowa!
      // Wszystkie pola które wysyłamy muszą być w hash, w tej samej kolejności jak w params
      const hashData = [
        serviceId,
        orderId,
        amountStr,
        description,
        'PLN',
        customerEmail,
        returnUrl,
      ];
      const hashString = hashData.join('|') + '|' + sharedKey;
      const hash = crypto.createHash('sha256').update(hashString).digest('hex');

      this.logger.log(`Autopay hash generated for order ${orderId}, returnUrl: ${returnUrl}`);
      
      // Budujemy URL do przekierowania (metoda GET/POST form)
      const params = new URLSearchParams({
        ServiceID: serviceId,
        OrderID: orderId,
        Amount: amountStr,
        Description: description,
        Currency: 'PLN',
        CustomerEmail: customerEmail,
        ReturnURL: returnUrl,
        Hash: hash,
      });

      // Autopay wymaga przekierowania użytkownika na bramkę z parametrami
      const paymentUrl = `${gatewayUrl}/payment?${params.toString()}`;

      // Zaktualizuj rezerwację
      await this.prisma.bookings.update({
        where: { id: bookingId },
        data: {
          paymentMethod: 'autopay',
          autopayOrderId: orderId,
          paymentStatus: 'pending',
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Autopay payment URL created: ${paymentUrl.substring(0, 100)}...`);

      return {
        orderId,
        paymentUrl,
      };
    } catch (error) {
      this.logger.error(`Autopay payment creation failed: ${error.message}`, error.stack);
      
      throw new BadRequestException(
        `Nie udało się utworzyć płatności Autopay: ${error.message}`
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
      case 'checkout.session.completed':
        // Stripe Checkout Session zakończona sukcesem
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionBookingId = session.metadata?.bookingId;

        if (!sessionBookingId) {
          this.logger.warn('Brak bookingId w metadata checkout session');
          break;
        }

        const amountTotal = session.amount_total || 0;
        
        await this.prisma.bookings.update({
          where: { id: sessionBookingId },
          data: {
            isPaid: true,
            paidAmount: amountTotal / 100,
            paidAt: new Date(),
            status: 'CONFIRMED',
            stripePaymentIntentId: session.payment_intent as string || session.id,
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Płatność Stripe Checkout za rezerwację ${sessionBookingId} potwierdzona (${amountTotal / 100} PLN)`);

        // 🔔 Utwórz powiadomienie o płatności
        await this.createPaymentNotification(
          matchedTenant.id,
          'Płatność otrzymana',
          `Otrzymano płatność ${(amountTotal / 100).toFixed(2)} PLN za rezerwację (Stripe)`,
          sessionBookingId
        );
        break;

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
    this.logger.log(`PayU webhook received: ${JSON.stringify(data)}`);

    // PayU wysyła dane w formacie { order: { orderId, status, ... } }
    const order = data.order;
    if (!order || !order.orderId) {
      this.logger.error('PayU webhook: missing order data');
      throw new BadRequestException('Missing order data');
    }

    const orderId = order.orderId;
    const status = order.status;

    // Znajdź rezerwację po payuOrderId
    const booking = await this.prisma.bookings.findFirst({
      where: { payuOrderId: orderId },
    });

    if (!booking) {
      this.logger.error(`PayU webhook: booking not found for orderId ${orderId}`);
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Sprawdź czy płatność już nie została przetworzona (idempotencja)
    if (booking.isPaid && status === 'COMPLETED') {
      this.logger.warn(`PayU webhook: booking ${booking.id} already marked as paid`);
      return { success: true, message: 'Already processed' };
    }

    // Mapuj status PayU na nasz status
    let paymentStatus = 'pending';
    let isPaid = false;
    let paidAt: Date | null = null;

    switch (status) {
      case 'COMPLETED':
        paymentStatus = 'completed';
        isPaid = true;
        paidAt = new Date();
        break;
      case 'CANCELED':
      case 'REJECTED':
        paymentStatus = 'failed';
        break;
      case 'PENDING':
      case 'WAITING_FOR_CONFIRMATION':
        paymentStatus = 'pending';
        break;
      default:
        paymentStatus = 'pending';
    }

    // Zaktualizuj rezerwację
    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: {
        isPaid,
        paidAmount: isPaid ? booking.totalPrice : null,
        paidAt,
        paymentStatus,
        status: isPaid ? 'CONFIRMED' : booking.status,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`PayU webhook: booking ${booking.id} updated with status ${paymentStatus}`);

    // Pobierz tenantId dla powiadomienia
    if (isPaid) {
      const employee = await this.prisma.employees.findUnique({
        where: { id: booking.employeeId || '' },
      });

      if (employee) {
        await this.createPaymentNotification(
          employee.userId,
          'Płatność otrzymana',
          `Otrzymano płatność ${Number(booking.totalPrice).toFixed(2)} PLN za rezerwację (PayU)`,
          booking.id
        );
      }
    }

    return { success: true };
  }

  /**
   * Webhook Tpay
   */
  async handleTpayWebhook(data: any) {
    this.logger.log(`Tpay webhook received: ${JSON.stringify(data)}`);

    // Tpay wysyła dane w formacie { tr_id, tr_status, tr_crc, ... }
    const transactionId = data.tr_id;
    const status = data.tr_status;

    if (!transactionId) {
      this.logger.error('Tpay webhook: missing transaction ID');
      throw new BadRequestException('Missing transaction ID');
    }

    // Znajdź rezerwację po tpayTransactionId
    const booking = await this.prisma.bookings.findFirst({
      where: { tpayTransactionId: transactionId },
    });

    if (!booking) {
      this.logger.error(`Tpay webhook: booking not found for transactionId ${transactionId}`);
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Sprawdź czy płatność już nie została przetworzona
    if (booking.isPaid && status === 'TRUE') {
      this.logger.warn(`Tpay webhook: booking ${booking.id} already marked as paid`);
      return { success: true, message: 'Already processed' };
    }

    // Mapuj status Tpay
    let paymentStatus = 'pending';
    let isPaid = false;
    let paidAt: Date | null = null;

    if (status === 'TRUE' || status === 'PAID') {
      paymentStatus = 'completed';
      isPaid = true;
      paidAt = new Date();
    } else if (status === 'FALSE' || status === 'CHARGEBACK') {
      paymentStatus = 'failed';
    }

    // Zaktualizuj rezerwację
    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: {
        isPaid,
        paidAmount: isPaid ? booking.totalPrice : null,
        paidAt,
        paymentStatus,
        status: isPaid ? 'CONFIRMED' : booking.status,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Tpay webhook: booking ${booking.id} updated with status ${paymentStatus}`);

    // Powiadomienie
    if (isPaid) {
      const employee = await this.prisma.employees.findUnique({
        where: { id: booking.employeeId || '' },
      });

      if (employee) {
        await this.createPaymentNotification(
          employee.userId,
          'Płatność otrzymana',
          `Otrzymano płatność ${Number(booking.totalPrice).toFixed(2)} PLN za rezerwację (Tpay)`,
          booking.id
        );
      }
    }

    // Tpay wymaga odpowiedzi TRUE
    return 'TRUE';
  }

  /**
   * Webhook Autopay (Blue Media)
   */
  async handleAutopayWebhook(data: any) {
    this.logger.log(`Autopay webhook received: ${JSON.stringify(data)}`);

    // Autopay wysyła ITN jako XML zakodowany w base64 w polu 'transactions'
    let orderId: string | undefined;
    let status: string | undefined;
    
    // Sprawdź czy to ITN w formacie base64
    if (data.transactions) {
      try {
        const xmlData = Buffer.from(data.transactions, 'base64').toString('utf-8');
        this.logger.log(`Autopay ITN XML: ${xmlData}`);
        
        // Parsuj XML - szukamy orderID i paymentStatus
        const orderIdMatch = xmlData.match(/<orderID>([^<]+)<\/orderID>/);
        const statusMatch = xmlData.match(/<paymentStatus>([^<]+)<\/paymentStatus>/);
        
        orderId = orderIdMatch ? orderIdMatch[1] : undefined;
        status = statusMatch ? statusMatch[1] : undefined;
      } catch (e) {
        this.logger.error(`Autopay ITN decode error: ${e.message}`);
      }
    }
    
    // Fallback - może być też w formacie JSON
    if (!orderId) {
      orderId = data.OrderID || data.orderID;
      status = data.PaymentStatus || data.paymentStatus;
    }

    if (!orderId) {
      this.logger.error('Autopay webhook: missing OrderID');
      throw new BadRequestException('Missing OrderID');
    }

    // Znajdź rezerwację po autopayOrderId
    const booking = await this.prisma.bookings.findFirst({
      where: { autopayOrderId: orderId },
    });

    if (!booking) {
      this.logger.error(`Autopay webhook: booking not found for orderId ${orderId}`);
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Sprawdź czy płatność już nie została przetworzona
    if (booking.isPaid && status === 'SUCCESS') {
      this.logger.warn(`Autopay webhook: booking ${booking.id} already marked as paid`);
      return { success: true, message: 'Already processed' };
    }

    // Mapuj status Autopay
    let paymentStatus = 'pending';
    let isPaid = false;
    let paidAt: Date | null = null;

    switch (status) {
      case 'SUCCESS':
      case 'CONFIRMED':
        paymentStatus = 'completed';
        isPaid = true;
        paidAt = new Date();
        break;
      case 'FAILURE':
      case 'CANCELLED':
        paymentStatus = 'failed';
        break;
      case 'PENDING':
        paymentStatus = 'pending';
        break;
      default:
        paymentStatus = 'pending';
    }

    // Zaktualizuj rezerwację
    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: {
        isPaid,
        paidAmount: isPaid ? booking.totalPrice : null,
        paidAt,
        paymentStatus,
        status: isPaid ? 'CONFIRMED' : booking.status,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Autopay webhook: booking ${booking.id} updated with status ${paymentStatus}`);

    // Powiadomienie
    if (isPaid) {
      const employee = await this.prisma.employees.findUnique({
        where: { id: booking.employeeId || '' },
      });

      if (employee) {
        await this.createPaymentNotification(
          employee.userId,
          'Płatność otrzymana',
          `Otrzymano płatność ${Number(booking.totalPrice).toFixed(2)} PLN za rezerwację (Autopay)`,
          booking.id
        );
      }
    }

    return { success: true };
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

  /**
   * Potwierdź płatność po powrocie z bramki (Autopay, PayU, etc.)
   * Użytkownik wraca z bramki z parametrami - jeśli wrócił z OrderID i Hash, płatność się powiodła
   */
  async confirmPaymentReturn(data: { orderId: string; serviceId?: string; hash?: string }) {
    const { orderId, serviceId, hash } = data;
    
    this.logger.log(`Payment return confirmation for orderId: ${orderId}`);

    if (!orderId) {
      return { success: false, message: 'Brak identyfikatora zamówienia' };
    }

    // Znajdź rezerwację po orderId (Autopay)
    let booking = await this.prisma.bookings.findFirst({
      where: { autopayOrderId: orderId },
      include: { employees: true },
    });

    // Fallback - szukaj po innych polach
    if (!booking) {
      booking = await this.prisma.bookings.findFirst({
        where: { payuOrderId: orderId },
        include: { employees: true },
      });
    }
    if (!booking) {
      booking = await this.prisma.bookings.findFirst({
        where: { tpayTransactionId: orderId },
        include: { employees: true },
      });
    }

    if (!booking) {
      this.logger.error(`Payment return: booking not found for orderId ${orderId}`);
      return { success: false, message: 'Nie znaleziono rezerwacji' };
    }

    // Jeśli już opłacone - zwróć sukces
    if (booking.isPaid) {
      return { success: true, message: 'Płatność już została potwierdzona', bookingId: booking.id };
    }

    // Weryfikacja hash dla Autopay (opcjonalna, ale zalecana)
    if (serviceId && hash && booking.autopayOrderId) {
      const tenant = await this.prisma.tenants.findFirst({
        where: { employees: { some: { id: booking.employeeId || '' } } },
      });
      
      if (tenant?.autopaySharedKey) {
        const expectedHash = crypto
          .createHash('sha256')
          .update(`${serviceId}|${orderId}|${tenant.autopaySharedKey}`)
          .digest('hex');
        
        if (hash !== expectedHash) {
          this.logger.error(`Payment return: invalid hash for orderId ${orderId}`);
          return { success: false, message: 'Nieprawidłowa suma kontrolna' };
        }
      }
    }

    // Oznacz jako opłacone
    const isDeposit = booking.deposit_required && booking.deposit_status === 'pending';
    
    if (isDeposit) {
      // Opłata zaliczki
      await this.prisma.bookings.update({
        where: { id: booking.id },
        data: {
          deposit_status: 'paid',
          deposit_paid_at: new Date(),
          deposit_payment_method: booking.paymentMethod || 'autopay',
          paymentStatus: 'completed',
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
      });
      this.logger.log(`Payment return: deposit paid for booking ${booking.id}`);
    } else {
      // Pełna płatność
      await this.prisma.bookings.update({
        where: { id: booking.id },
        data: {
          isPaid: true,
          paidAmount: booking.totalPrice,
          paidAt: new Date(),
          paymentStatus: 'completed',
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
      });
      this.logger.log(`Payment return: full payment confirmed for booking ${booking.id}`);
    }

    // Powiadomienie
    if (booking.employees?.userId) {
      const amount = isDeposit ? Number(booking.deposit_amount) : Number(booking.totalPrice);
      await this.createPaymentNotification(
        booking.employees.userId,
        'Płatność otrzymana',
        `Otrzymano płatność ${amount.toFixed(2)} PLN za rezerwację`,
        booking.id
      );
    }

    return { success: true, message: 'Płatność potwierdzona', bookingId: booking.id };
  }
}
