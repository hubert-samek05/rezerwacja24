import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  Headers,
  RawBodyRequest,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Pobierz ustawienia płatności' })
  getPaymentSettings(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.paymentsService.getPaymentSettings(tenantId);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Zaktualizuj ustawienia płatności' })
  updatePaymentSettings(@Body() settings: any, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.paymentsService.updatePaymentSettings(tenantId, settings);
  }

  @Post('create')
  @ApiOperation({ summary: 'Utwórz płatność dla rezerwacji' })
  async createPayment(@Body() data: any, @Req() req: any) {
    let {
      bookingId,
      amount,
      provider,
      customerEmail,
      customerName,
    } = data;

    this.logger.debug(`Payment request - provider: ${provider}, bookingId: ${bookingId}`);

    // Walidacja podstawowych pól
    if (!bookingId || !provider) {
      throw new Error('Brakujące wymagane pola (bookingId, provider)');
    }

    // Jeśli brak email/name - pobierz z rezerwacji (dla ponowienia płatności)
    if (!customerEmail || !customerName) {
      const booking = await this.paymentsService.getBookingWithCustomer(bookingId);
      if (booking?.customers) {
        customerEmail = customerEmail || booking.customers.email || booking.customers.phone + '@placeholder.local';
        customerName = customerName || `${booking.customers.firstName || ''} ${booking.customers.lastName || ''}`.trim() || 'Klient';
      }
    }

    if (!customerEmail || !customerName) {
      throw new Error('Brakujące dane klienta');
    }

    // Konwertuj amount na number jeśli jest stringiem
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (!numericAmount || typeof numericAmount !== 'number' || isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error(`Nieprawidłowa kwota: ${amount} (type: ${typeof amount}, parsed: ${numericAmount})`);
    }

    if (!['przelewy24', 'stripe', 'payu'].includes(provider)) {
      throw new Error('Nieprawidłowy provider płatności');
    }

    const userId = req.headers['x-user-id'] || data.userId;

    if (!userId) {
      throw new Error('Brak identyfikatora użytkownika');
    }

    switch (provider) {
      case 'przelewy24':
        return this.paymentsService.createPrzelewy24Payment(
          userId,
          bookingId,
          numericAmount,
          customerEmail,
          customerName
        );
      case 'stripe':
        return this.paymentsService.createStripePayment(
          userId,
          bookingId,
          numericAmount,
          customerEmail
        );
      case 'payu':
        return this.paymentsService.createPayUPayment(
          userId,
          bookingId,
          numericAmount,
          customerEmail,
          customerName
        );
      default:
        throw new Error('Nieobsługiwany provider płatności');
    }
  }

  @Public()
  @Post('przelewy24/webhook')
  @ApiOperation({ summary: 'Webhook Przelewy24' })
  handlePrzelewy24Webhook(@Body() data: any) {
    return this.paymentsService.handlePrzelewy24Webhook(data);
  }

  @Public()
  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Webhook Stripe dla płatności za rezerwacje' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<any>
  ) {
    // Ten webhook jest dla płatności za REZERWACJE, nie subskrypcje
    // Subskrypcje używają /api/billing/webhook
    return this.paymentsService.handleStripeWebhook(signature, req.rawBody);
  }

  @Public()
  @Post('payu/webhook')
  @ApiOperation({ summary: 'Webhook PayU' })
  handlePayUWebhook(@Body() data: any) {
    return this.paymentsService.handlePayUWebhook(data);
  }
}
