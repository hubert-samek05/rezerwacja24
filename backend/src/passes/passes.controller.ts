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
import { PassesService } from './passes.service';

@Controller('passes')
export class PassesController {
  private readonly logger = new Logger(PassesController.name);

  constructor(private readonly passesService: PassesService) {}

  // ==================== TYPY KARNETÓW ====================

  /**
   * Pobiera wszystkie typy karnetów
   */
  @Get('types')
  async findAllTypes(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.passesService.findAllTypes(tenantId);
  }

  /**
   * Tworzy nowy typ karnetu
   */
  @Post('types')
  async createType(
    @Body() body: {
      name: string;
      description?: string;
      passKind: 'VISITS' | 'TIME';
      visitsCount?: number;
      validityDays: number;
      price: number;
      serviceIds?: string[];
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.log(`Tworzenie typu karnetu "${body.name}" dla tenant ${tenantId}`);
    return this.passesService.createType(tenantId, body);
  }

  /**
   * Aktualizuje typ karnetu
   */
  @Put('types/:id')
  async updateType(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      visitsCount?: number;
      validityDays?: number;
      price?: number;
      serviceIds?: string[];
      isActive?: boolean;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.passesService.updateType(id, tenantId, body);
  }

  /**
   * Usuwa typ karnetu
   */
  @Delete('types/:id')
  async removeType(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.passesService.removeType(id, tenantId);
  }

  // ==================== KARNETY KLIENTÓW ====================

  /**
   * Pobiera karnety klienta
   */
  @Get('customer/:customerId')
  async findCustomerPasses(@Param('customerId') customerId: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.passesService.findCustomerPasses(customerId, tenantId);
  }

  /**
   * Pobiera aktywne karnety klienta
   */
  @Get('customer/:customerId/active')
  async findActiveCustomerPasses(@Param('customerId') customerId: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.passesService.findActiveCustomerPasses(customerId, tenantId);
  }

  /**
   * Sprzedaje karnet klientowi
   */
  @Post('sell')
  async sellPass(
    @Body() body: {
      passTypeId: string;
      customerId: string;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.log(`Sprzedaż karnetu dla klienta ${body.customerId}`);
    return this.passesService.sellPass(tenantId, body);
  }

  /**
   * Wykorzystuje karnet
   */
  @Post(':id/use')
  async usePass(
    @Param('id') id: string,
    @Body() body: { bookingId?: string },
  ) {
    return this.passesService.usePass(id, body.bookingId);
  }

  /**
   * Anuluje karnet
   */
  @Post(':id/cancel')
  async cancelPass(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.passesService.cancelPass(id, tenantId);
  }

  /**
   * Pobiera statystyki karnetów
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.passesService.getStats(tenantId);
  }

  /**
   * Pobiera wszystkie sprzedane karnety
   */
  @Get('sold')
  async findAllSoldPasses(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const status = req.query?.status;
    return this.passesService.findAllSoldPasses(tenantId, status);
  }
}
