import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { EmployeeAccountsService } from './employee-accounts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('employee-accounts')
export class EmployeeAccountsController {
  constructor(private readonly employeeAccountsService: EmployeeAccountsService) {}

  private getTenantId(req: any): string {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return tenantId;
  }

  /**
   * Pobierz wszystkie konta pracowników
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.findAll(tenantId);
  }

  /**
   * Pobierz konto pracownika po ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req: any, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.findOne(tenantId, id);
  }

  /**
   * Utwórz konto dla pracownika
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: {
    employeeId: string;
    email: string;
    permissions?: {
      canViewCalendar?: boolean;
      canManageBookings?: boolean;
      canViewCustomers?: boolean;
      canManageCustomers?: boolean;
      canViewServices?: boolean;
      canManageServices?: boolean;
      canViewEmployees?: boolean;
      canManageEmployees?: boolean;
      canViewAnalytics?: boolean;
      canViewSettings?: boolean;
      canManageSettings?: boolean;
      canViewPayments?: boolean;
      canManagePayments?: boolean;
      onlyOwnBookings?: boolean;
      onlyOwnCalendar?: boolean;
    };
  }) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.create(tenantId, body);
  }

  /**
   * Aktualizuj uprawnienia konta
   */
  @Patch(':id/permissions')
  @UseGuards(JwtAuthGuard)
  async updatePermissions(@Req() req: any, @Param('id') id: string, @Body() permissions: {
    canViewCalendar?: boolean;
    canManageBookings?: boolean;
    canViewCustomers?: boolean;
    canManageCustomers?: boolean;
    canViewServices?: boolean;
    canManageServices?: boolean;
    canViewEmployees?: boolean;
    canManageEmployees?: boolean;
    canViewAnalytics?: boolean;
    canViewSettings?: boolean;
    canManageSettings?: boolean;
    canViewPayments?: boolean;
    canManagePayments?: boolean;
    onlyOwnBookings?: boolean;
    onlyOwnCalendar?: boolean;
  }) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.updatePermissions(tenantId, id, permissions);
  }

  /**
   * Aktywuj/dezaktywuj konto
   */
  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Req() req: any, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.toggleActive(tenantId, id);
  }

  /**
   * Zresetuj hasło
   */
  @Post(':id/reset-password')
  @UseGuards(JwtAuthGuard)
  async resetPassword(@Req() req: any, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.resetPassword(tenantId, id);
  }

  /**
   * Usuń konto pracownika
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: any, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.remove(tenantId, id);
  }

  /**
   * Utwórz samodzielne konto użytkownika (bez pracownika)
   * Dla menadżerów, księgowych, recepcji itp.
   */
  @Post('create-standalone')
  @UseGuards(JwtAuthGuard)
  async createStandalone(@Req() req: any, @Body() body: {
    firstName: string;
    lastName: string;
    email: string;
    accountType: string;
    permissions?: {
      canViewCalendar?: boolean;
      canManageBookings?: boolean;
      canViewCustomers?: boolean;
      canManageCustomers?: boolean;
      canViewServices?: boolean;
      canManageServices?: boolean;
      canViewEmployees?: boolean;
      canManageEmployees?: boolean;
      canViewAnalytics?: boolean;
      canViewSettings?: boolean;
      canManageSettings?: boolean;
      canViewPayments?: boolean;
      canManagePayments?: boolean;
      onlyOwnBookings?: boolean;
      onlyOwnCalendar?: boolean;
    };
  }) {
    const tenantId = this.getTenantId(req);
    return this.employeeAccountsService.createStandalone(tenantId, body);
  }

  /**
   * Logowanie pracownika (publiczne)
   */
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.employeeAccountsService.login(body.email, body.password);
  }

  /**
   * Zmiana hasła przez pracownika
   */
  @Post('change-password')
  async changePassword(@Body() body: { accountId: string; oldPassword: string; newPassword: string }) {
    return this.employeeAccountsService.changePassword(body.accountId, body.oldPassword, body.newPassword);
  }
}
