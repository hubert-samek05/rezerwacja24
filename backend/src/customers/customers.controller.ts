import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Utwórz nowego klienta' })
  @ApiResponse({ status: 201, description: 'Klient został utworzony' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Query("tenantId") tenantId: string, @Req() req: any) {
    const finalTenantId = tenantId || req?.headers['x-tenant-id'];
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.customersService.create(finalTenantId, createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz wszystkich klientów' })
  @ApiResponse({ status: 200, description: 'Lista klientów' })
  findAll(@Query("tenantId") tenantId?: string, @Req() req?: any) {
    const finalTenantId = tenantId || req?.headers['x-tenant-id'];
    this.logger.debug(`findAll - tenantId: ${finalTenantId}`);
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.customersService.findAll(finalTenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły klienta' })
  @ApiResponse({ status: 200, description: 'Szczegóły klienta' })
  @ApiResponse({ status: 404, description: 'Klient nie znaleziony' })
  findOne(@Param('id') id: string, @Query("tenantId") tenantId: string, @Req() req: any) {
    const finalTenantId = tenantId || req?.headers['x-tenant-id'];
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.customersService.findOne(finalTenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj klienta' })
  @ApiResponse({ status: 200, description: 'Klient został zaktualizowany' })
  @ApiResponse({ status: 404, description: 'Klient nie znaleziony' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Query("tenantId") tenantId?: string,
    @Req() req?: any,
  ) {
    const finalTenantId = tenantId || req?.headers['x-tenant-id'];
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.customersService.update(finalTenantId, id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń klienta' })
  @ApiResponse({ status: 200, description: 'Klient został usunięty' })
  @ApiResponse({ status: 404, description: 'Klient nie znaleziony' })
  remove(@Param('id') id: string, @Query("tenantId") tenantId: string, @Req() req: any) {
    const finalTenantId = tenantId || req?.headers['x-tenant-id'];
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.customersService.remove(finalTenantId, id);
  }
}
