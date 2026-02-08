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
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  private readonly logger = new Logger(PackagesController.name);

  constructor(private readonly packagesService: PackagesService) {}

  /**
   * Pobiera wszystkie pakiety usług
   */
  @Get()
  async findAll(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.packagesService.findAll(tenantId);
  }

  /**
   * Pobiera pojedynczy pakiet
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.packagesService.findOne(id, tenantId);
  }

  /**
   * Tworzy nowy pakiet
   */
  @Post()
  async create(
    @Body() body: {
      name: string;
      description?: string;
      price: number;
      serviceIds: string[];
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.log(`Tworzenie pakietu "${body.name}" dla tenant ${tenantId}`);
    return this.packagesService.create(tenantId, body);
  }

  /**
   * Aktualizuje pakiet
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      price?: number;
      serviceIds?: string[];
      isActive?: boolean;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.packagesService.update(id, tenantId, body);
  }

  /**
   * Usuwa pakiet
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.packagesService.remove(id, tenantId);
  }
}
