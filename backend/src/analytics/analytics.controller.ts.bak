import {
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Pobierz ogólne statystyki' })
  @ApiResponse({ status: 200, description: 'Ogólne statystyki biznesowe' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getOverview(tenantId, startDate, endDate);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Analiza przychodów' })
  @ApiResponse({ status: 200, description: 'Szczegółowe dane o przychodach' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  async getRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getRevenue(tenantId, startDate, endDate, groupBy);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Analiza rezerwacji' })
  @ApiResponse({ status: 200, description: 'Statystyki rezerwacji' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getBookingsAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getBookingsAnalytics(tenantId, startDate, endDate);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Analiza klientów' })
  @ApiResponse({ status: 200, description: 'Statystyki klientów' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getCustomersAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getCustomersAnalytics(tenantId, startDate, endDate);
  }

  @Get('employees')
  @ApiOperation({ summary: 'Analiza wydajności pracowników' })
  @ApiResponse({ status: 200, description: 'Statystyki pracowników' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getEmployeesAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getEmployeesAnalytics(tenantId, startDate, endDate);
  }

  @Get('services')
  @ApiOperation({ summary: 'Analiza popularności usług' })
  @ApiResponse({ status: 200, description: 'Statystyki usług' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getServicesAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getServicesAnalytics(tenantId, startDate, endDate);
  }

  @Get('peak-hours')
  @ApiOperation({ summary: 'Analiza godzin szczytu' })
  @ApiResponse({ status: 200, description: 'Godziny szczytu' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getPeakHours(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getPeakHours(tenantId, startDate, endDate);
  }

  @Get('retention')
  @ApiOperation({ summary: 'Analiza retention rate' })
  @ApiResponse({ status: 200, description: 'Wskaźniki retention' })
  async getRetention(@Req() req?: any) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getRetention(tenantId);
  }

  @Get('conversion')
  @ApiOperation({ summary: 'Analiza konwersji' })
  @ApiResponse({ status: 200, description: 'Wskaźniki konwersji' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getConversion(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getConversion(tenantId, startDate, endDate);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Prognoza przychodów' })
  @ApiResponse({ status: 200, description: 'Prognoza na podstawie danych historycznych' })
  async getForecast(@Req() req?: any) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.analyticsService.getForecast(tenantId);
  }
}
