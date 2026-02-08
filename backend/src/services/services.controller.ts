import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Utwórz nową usługę' })
  @ApiResponse({ status: 201, description: 'Usługa została utworzona' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane' })
  create(@Body() createServiceDto: CreateServiceDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.servicesService.create(tenantId, createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz wszystkie usługi' })
  @ApiResponse({ status: 200, description: 'Lista usług' })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    const filters: any = {};
    
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    return this.servicesService.findAll(tenantId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły usługi' })
  @ApiResponse({ status: 200, description: 'Szczegóły usługi' })
  @ApiResponse({ status: 404, description: 'Usługa nie znaleziona' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.servicesService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Pobierz statystyki usługi' })
  @ApiResponse({ status: 200, description: 'Statystyki usługi' })
  @ApiResponse({ status: 404, description: 'Usługa nie znaleziona' })
  getStats(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.servicesService.getStats(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj usługę' })
  @ApiResponse({ status: 200, description: 'Usługa została zaktualizowana' })
  @ApiResponse({ status: 404, description: 'Usługa nie znaleziona' })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.servicesService.update(tenantId, id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń usługę' })
  @ApiResponse({ status: 200, description: 'Usługa została usunięta' })
  @ApiResponse({ status: 404, description: 'Usługa nie znaleziona' })
  @ApiResponse({ status: 400, description: 'Nie można usunąć usługi z rezerwacjami' })
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.servicesService.remove(tenantId, id);
  }
}
