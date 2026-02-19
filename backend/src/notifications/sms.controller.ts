import { Controller, Get, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FlySMSService } from './flysms.service';

@ApiTags('sms')
@Controller('sms')
export class SMSController {
  constructor(private readonly flySMSService: FlySMSService) {}

  /**
   * 🔒 BEZPIECZEŃSTWO: Pobierz status SMS dla tenanta
   */
  @Get('status')
  @ApiOperation({ summary: 'Pobierz status SMS (użyte/limit/pozostałe)' })
  async getStatus(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.flySMSService.getSMSStatus(tenantId);
  }

  /**
   * 🔒 BEZPIECZEŃSTWO: Pobierz ustawienia SMS dla tenanta
   */
  @Get('settings')
  @ApiOperation({ summary: 'Pobierz ustawienia SMS' })
  async getSettings(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.flySMSService.getSMSSettings(tenantId);
  }

  /**
   * 🔒 BEZPIECZEŃSTWO: Aktualizuj ustawienia SMS dla tenanta
   */
  @Post('settings')
  @ApiOperation({ summary: 'Aktualizuj ustawienia SMS' })
  async updateSettings(
    @Body() settings: {
      confirmedEnabled?: boolean;
      rescheduledEnabled?: boolean;
      reminderEnabled?: boolean;
      reminder2hEnabled?: boolean;
      cancelledEnabled?: boolean;
      reminderHoursBefore?: number;
      includeCancelLink?: boolean;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.flySMSService.updateSMSSettings(tenantId, settings);
  }

  /**
   * 🔒 BEZPIECZEŃSTWO: Zakup dodatkowych SMS
   */
  @Post('purchase')
  @ApiOperation({ summary: 'Zakup dodatkowych SMS (1 pakiet = 100 SMS)' })
  async purchaseSMS(
    @Body() body: { packages: number },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    if (!body.packages || body.packages < 1) {
      throw new BadRequestException('Packages must be at least 1');
    }

    return this.flySMSService.purchaseSMS(tenantId, body.packages);
  }

  /**
   * 🧪 TEST: Wyślij testowy SMS (tylko dla testów)
   */
  @Post('test')
  @ApiOperation({ summary: 'Wyślij testowy SMS' })
  async sendTestSMS(
    @Body() body: { phone: string; message: string },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.flySMSService.sendSMS(tenantId, body.phone, body.message, 'confirmed');
  }

  /**
   * 📝 Pobierz szablony SMS
   */
  @Get('templates')
  @ApiOperation({ summary: 'Pobierz szablony SMS' })
  async getTemplates(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.flySMSService.getSMSTemplates(tenantId);
  }

  /**
   * 📝 Zapisz szablony SMS
   */
  @Post('templates')
  @ApiOperation({ summary: 'Zapisz szablony SMS' })
  async updateTemplates(
    @Body() templates: {
      confirmed?: string;
      cancelled?: string;
      rescheduled?: string;
      reminder?: string;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.flySMSService.updateSMSTemplates(tenantId, templates);
  }
}
