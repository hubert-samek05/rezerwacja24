import { Controller, Get, Post, Body, Param, Query, Headers, Patch } from '@nestjs/common';
import { SupportService, CreateTicketDto } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  // Tworzenie zgłoszenia
  @Post('tickets')
  async createTicket(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-email') userEmail: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(tenantId, userId, userEmail, dto);
  }

  // Pobieranie zgłoszeń użytkownika
  @Get('tickets')
  async getUserTickets(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.supportService.getUserTickets(tenantId, userId);
  }

  // Pobieranie pojedynczego zgłoszenia
  @Get('tickets/:id')
  async getTicket(@Param('id') id: string) {
    return this.supportService.getTicket(id);
  }

  // === ADMIN ENDPOINTS ===

  // Pobieranie wszystkich zgłoszeń (admin)
  @Get('admin/tickets')
  async getAllTickets(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.supportService.getAllTickets({ status, type });
  }

  // Statystyki zgłoszeń (admin)
  @Get('admin/stats')
  async getTicketStats() {
    return this.supportService.getTicketStats();
  }

  // Odpowiedź na zgłoszenie (admin)
  @Post('admin/tickets/:id/respond')
  async respondToTicket(
    @Param('id') ticketId: string,
    @Body() body: { adminId: string; message: string },
  ) {
    return this.supportService.respondToTicket(ticketId, body.adminId, body.message);
  }

  // Zamknięcie zgłoszenia (admin)
  @Patch('admin/tickets/:id/close')
  async closeTicket(@Param('id') ticketId: string) {
    return this.supportService.closeTicket(ticketId);
  }
}
