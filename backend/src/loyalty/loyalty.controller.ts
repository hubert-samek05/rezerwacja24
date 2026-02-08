import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';

@ApiTags('loyalty')
@Controller('loyalty')
export class LoyaltyController {
  private readonly logger = new Logger(LoyaltyController.name);

  constructor(private readonly loyaltyService: LoyaltyService) {}

  /**
   * Pobiera ustawienia programu lojalnościowego
   */
  @Get('settings')
  @ApiOperation({ summary: 'Pobierz ustawienia programu lojalnościowego' })
  async getSettings(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.getSettings(tenantId);
  }

  /**
   * Aktualizuje ustawienia programu
   */
  @Put('settings')
  @ApiOperation({ summary: 'Aktualizuj ustawienia programu' })
  async updateSettings(
    @Body() body: {
      name?: string;
      pointsPerCurrency?: number;
      pointsPerBooking?: number;
      isActive?: boolean;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.updateSettings(tenantId, body);
  }

  /**
   * Dodaje poziom lojalnościowy
   */
  @Post('levels')
  @ApiOperation({ summary: 'Dodaj poziom lojalnościowy' })
  async addLevel(
    @Body() body: {
      name: string;
      minPoints: number;
      multiplier?: number;
      color?: string;
      benefits?: any;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.addLevel(tenantId, body);
  }

  /**
   * Dodaje nagrodę
   */
  @Post('rewards')
  @ApiOperation({ summary: 'Dodaj nagrodę do wymiany' })
  async addReward(
    @Body() body: {
      name: string;
      description?: string;
      pointsCost: number;
      rewardType: string; // DISCOUNT_PERCENT, DISCOUNT_AMOUNT, FREE_SERVICE
      rewardValue: number;
      serviceId?: string;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.addReward(tenantId, body);
  }

  /**
   * Usuwa nagrodę
   */
  @Delete('rewards/:id')
  @ApiOperation({ summary: 'Usuń nagrodę' })
  async removeReward(@Param('id') id: string) {
    return this.loyaltyService.removeReward(id);
  }

  /**
   * Pobiera punkty klienta
   */
  @Get('customers/:customerId')
  @ApiOperation({ summary: 'Pobierz punkty klienta' })
  async getCustomerPoints(
    @Param('customerId') customerId: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.getCustomerPoints(tenantId, customerId);
  }

  /**
   * Wymienia punkty na nagrodę
   */
  @Post('redeem')
  @ApiOperation({ summary: 'Wymień punkty na nagrodę' })
  async redeemReward(
    @Body() body: { customerId: string; rewardId: string },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.redeemReward(tenantId, body.customerId, body.rewardId);
  }

  /**
   * Pobiera punkty wszystkich klientów
   */
  @Get('all-points')
  @ApiOperation({ summary: 'Pobierz punkty wszystkich klientów' })
  async getAllCustomerPoints(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.getAllCustomerPoints(tenantId);
  }

  /**
   * Pobiera ranking klientów
   */
  @Get('leaderboard')
  @ApiOperation({ summary: 'Pobierz ranking klientów' })
  async getLeaderboard(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.getLeaderboard(tenantId);
  }

  /**
   * Pobiera statystyki programu
   */
  @Get('stats')
  @ApiOperation({ summary: 'Pobierz statystyki programu' })
  async getStats(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.loyaltyService.getStats(tenantId);
  }
}
