import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DepositsService, DepositSettings } from './deposits.service';
import { TenantAccessGuard } from '../common/guards/tenant-access.guard';

@ApiTags('Deposits')
@Controller('deposits')
export class DepositsController {
  private readonly logger = new Logger(DepositsController.name);

  constructor(private readonly depositsService: DepositsService) {}

  /**
   * Pobierz ustawienia zaliczek dla firmy
   */
  @UseGuards(TenantAccessGuard)
  @Get('settings/:tenantId')
  @ApiOperation({ summary: 'Pobierz ustawienia zaliczek' })
  async getDepositSettings(@Param('tenantId') tenantId: string) {
    this.logger.log(`Pobieranie ustawień zaliczek dla tenant: ${tenantId}`);
    return this.depositsService.getDepositSettings(tenantId);
  }

  /**
   * Zapisz ustawienia zaliczek dla firmy
   */
  @UseGuards(TenantAccessGuard)
  @Put('settings/:tenantId')
  @ApiOperation({ summary: 'Zapisz ustawienia zaliczek' })
  async updateDepositSettings(
    @Param('tenantId') tenantId: string,
    @Body() settings: Partial<DepositSettings>,
  ) {
    this.logger.log(`Aktualizacja ustawień zaliczek dla tenant: ${tenantId}`);
    return this.depositsService.updateDepositSettings(tenantId, settings);
  }

  /**
   * Sprawdź czy zaliczka jest wymagana
   * Używane przez frontend przed utworzeniem rezerwacji
   */
  @Post('check')
  @ApiOperation({ summary: 'Sprawdź czy zaliczka jest wymagana' })
  async checkDepositRequired(
    @Body() body: {
      tenantId: string;
      serviceId: string;
      totalPrice: number;
      customerPhone?: string;
    },
  ) {
    this.logger.log(`Sprawdzanie zaliczki dla tenant: ${body.tenantId}, service: ${body.serviceId}`);
    return this.depositsService.checkDepositRequired(
      body.tenantId,
      body.serviceId,
      body.totalPrice,
      body.customerPhone,
    );
  }

  /**
   * Pobierz status klienta (ile wizyt, ile wydał, czy zwolniony z zaliczki)
   */
  @Get('customer-status')
  @ApiOperation({ summary: 'Pobierz status klienta dla zaliczek' })
  async getCustomerStatus(
    @Query('tenantId') tenantId: string,
    @Query('customerPhone') customerPhone: string,
  ) {
    this.logger.log(`Pobieranie statusu klienta: ${customerPhone} dla tenant: ${tenantId}`);
    return this.depositsService.getCustomerDepositStatus(tenantId, customerPhone);
  }

  /**
   * Pobierz status zaliczki dla rezerwacji
   */
  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Pobierz status zaliczki dla rezerwacji' })
  async getBookingDepositStatus(@Param('bookingId') bookingId: string) {
    this.logger.log(`Pobieranie statusu zaliczki dla rezerwacji: ${bookingId}`);
    return this.depositsService.getBookingDepositStatus(bookingId);
  }

  /**
   * Oznacz zaliczkę jako opłaconą (używane przez webhook płatności lub ręcznie)
   */
  @UseGuards(TenantAccessGuard)
  @Post('mark-paid/:bookingId')
  @ApiOperation({ summary: 'Oznacz zaliczkę jako opłaconą' })
  async markDepositPaid(
    @Param('bookingId') bookingId: string,
    @Body() body: {
      paymentId: string;
      paymentMethod: string;
    },
  ) {
    this.logger.log(`Oznaczanie zaliczki jako opłaconej dla rezerwacji: ${bookingId}`);
    await this.depositsService.markDepositPaid(
      bookingId,
      body.paymentId,
      body.paymentMethod,
    );
    return { success: true, message: 'Zaliczka oznaczona jako opłacona' };
  }

  /**
   * Zwrot zaliczki
   */
  @UseGuards(TenantAccessGuard)
  @Post('refund/:bookingId')
  @ApiOperation({ summary: 'Zwrot zaliczki' })
  async refundDeposit(
    @Param('bookingId') bookingId: string,
    @Body() body: {
      refundAmount: number;
    },
  ) {
    this.logger.log(`Zwrot zaliczki dla rezerwacji: ${bookingId}, kwota: ${body.refundAmount}`);
    await this.depositsService.refundDeposit(bookingId, body.refundAmount);
    return { success: true, message: 'Zaliczka zwrócona' };
  }
}
