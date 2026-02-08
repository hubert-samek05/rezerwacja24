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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TimeOffService } from './time-off.service';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UpdateTimeOffDto } from './dto/update-time-off.dto';

@ApiTags('time-off')
@Controller('time-off')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Post()
  @ApiOperation({ summary: 'Dodaj urlop/blokadę czasu dla pracownika' })
  @ApiResponse({ status: 201, description: 'Urlop został dodany' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane' })
  create(@Body() createTimeOffDto: CreateTimeOffDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.timeOffService.create(tenantId, createTimeOffDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz wszystkie urlopy' })
  @ApiResponse({ status: 200, description: 'Lista urlopów' })
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.timeOffService.findAll(tenantId, { employeeId, startDate, endDate });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły urlopu' })
  @ApiResponse({ status: 200, description: 'Szczegóły urlopu' })
  @ApiResponse({ status: 404, description: 'Urlop nie znaleziony' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.timeOffService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj urlop' })
  @ApiResponse({ status: 200, description: 'Urlop został zaktualizowany' })
  @ApiResponse({ status: 404, description: 'Urlop nie znaleziony' })
  update(
    @Param('id') id: string,
    @Body() updateTimeOffDto: UpdateTimeOffDto,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.timeOffService.update(tenantId, id, updateTimeOffDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń urlop' })
  @ApiResponse({ status: 200, description: 'Urlop został usunięty' })
  @ApiResponse({ status: 404, description: 'Urlop nie znaleziony' })
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.timeOffService.remove(tenantId, id);
  }

  @Get('employee/:employeeId/check')
  @ApiOperation({ summary: 'Sprawdź czy pracownik jest dostępny w danym czasie' })
  @ApiResponse({ status: 200, description: 'Status dostępności' })
  checkAvailability(
    @Param('employeeId') employeeId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.timeOffService.checkAvailability(tenantId, employeeId, startTime, endTime);
  }
}
