import { Controller, Get, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LimitsService } from './limits.service';

@ApiTags('limits')
@Controller('limits')
export class LimitsController {
  private readonly logger = new Logger(LimitsController.name);

  constructor(private readonly limitsService: LimitsService) {}

  /**
   * Pobiera wszystkie limity i ich wykorzystanie dla tenanta
   */
  @Get()
  @ApiOperation({ summary: 'Pobierz limity i wykorzystanie dla tenanta' })
  async getLimits(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      return {
        bookings: { canProceed: true, current: 0, limit: null, remaining: null, percentUsed: 0 },
        employees: { canProceed: true, current: 0, limit: null, remaining: null, percentUsed: 0 },
        sms: { canProceed: true, current: 0, limit: null, remaining: null, percentUsed: 0 },
        planName: 'Brak',
        planSlug: 'none',
      };
    }

    return this.limitsService.getAllLimitsUsage(tenantId);
  }

  /**
   * Sprawdza limit rezerwacji
   */
  @Get('bookings')
  @ApiOperation({ summary: 'Sprawdź limit rezerwacji' })
  async checkBookingLimit(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      return { canProceed: true, current: 0, limit: null, remaining: null, percentUsed: 0 };
    }

    return this.limitsService.checkBookingLimit(tenantId);
  }

  /**
   * Sprawdza limit pracowników
   */
  @Get('employees')
  @ApiOperation({ summary: 'Sprawdź limit pracowników' })
  async checkEmployeeLimit(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      return { canProceed: true, current: 0, limit: null, remaining: null, percentUsed: 0 };
    }

    return this.limitsService.checkEmployeeLimit(tenantId);
  }

  /**
   * Sprawdza limit SMS
   */
  @Get('sms')
  @ApiOperation({ summary: 'Sprawdź limit SMS' })
  async checkSmsLimit(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      return { canProceed: true, current: 0, limit: null, remaining: null, percentUsed: 0 };
    }

    return this.limitsService.checkSmsLimit(tenantId);
  }
}
