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
  Put,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Utwórz nowego pracownika' })
  @ApiResponse({ status: 201, description: 'Pracownik został utworzony' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane' })
  create(@Body() createEmployeeDto: CreateEmployeeDto, @Query("tenantId") tenantId: string, @Req() req: any) {
    const finalTenantId = tenantId || req?.headers['x-tenant-id'];
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    this.logger.log(`Creating employee - tenantId: ${finalTenantId}`);
    return this.employeesService.create(finalTenantId, createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz wszystkich pracowników' })
  @ApiResponse({ status: 200, description: 'Lista pracowników' })
  findAll(@Query("tenantId") tenantId?: string, @Query('isActive') isActive?: string, @Req() req?: any) {
    const finalTenantId = tenantId || req?.headers['x-tenant-id'];
    if (!finalTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const filters: any = {};
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    return this.employeesService.findAll(finalTenantId, filters);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Pobierz dostępność pracownika' })
  @ApiResponse({ status: 200, description: 'Dostępność pracownika' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  getAvailability(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.employeesService.getAvailability(tenantId, id);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Pobierz usługi pracownika' })
  @ApiResponse({ status: 200, description: 'Lista usług pracownika' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  getServices(@Param('id') id: string) {
    return this.employeesService.getServices(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Pobierz statystyki pracownika' })
  @ApiResponse({ status: 200, description: 'Statystyki pracownika' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  getStats(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.employeesService.getStats(tenantId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły pracownika' })
  @ApiResponse({ status: 200, description: 'Szczegóły pracownika' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.employeesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj pracownika' })
  @ApiResponse({ status: 200, description: 'Pracownik został zaktualizowany' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.employeesService.update(tenantId, id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń pracownika' })
  @ApiResponse({ status: 200, description: 'Pracownik został usunięty' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  @ApiResponse({ status: 400, description: 'Nie można usunąć pracownika z rezerwacjami' })
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.employeesService.remove(tenantId, id);
  }

  @Put(':id/availability')
  @ApiOperation({ summary: 'Zaktualizuj dostępność pracownika' })
  @ApiResponse({ status: 200, description: 'Dostępność została zaktualizowana' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  updateAvailability(
    @Param('id') id: string,
    @Body() availabilityData: any,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    this.logger.debug(`updateAvailability - tenantId: ${tenantId}, employeeId: ${id}`);
    return this.employeesService.updateAvailability(tenantId, id, availabilityData);
  }

  @Post(':id/time-off')
  @ApiOperation({ summary: 'Dodaj urlop pracownika' })
  @ApiResponse({ status: 201, description: 'Urlop został dodany' })
  @ApiResponse({ status: 404, description: 'Pracownik nie znaleziony' })
  addTimeOff(
    @Param('id') id: string,
    @Body() timeOffData: any,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.employeesService.addTimeOff(tenantId, id, timeOffData);
  }

  @Delete(':id/time-off/:timeOffId')
  @ApiOperation({ summary: 'Usuń urlop pracownika' })
  @ApiResponse({ status: 200, description: 'Urlop został usunięty' })
  @ApiResponse({ status: 404, description: 'Urlop nie znaleziony' })
  removeTimeOff(
    @Param('id') id: string,
    @Param('timeOffId') timeOffId: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.employeesService.removeTimeOff(tenantId, id, timeOffId);
  }
}
