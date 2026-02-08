import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Logger,
} from '@nestjs/common';
import { GroupBookingsService } from './group-bookings.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('group-bookings')
export class GroupBookingsController {
  private readonly logger = new Logger(GroupBookingsController.name);

  constructor(private readonly groupBookingsService: GroupBookingsService) {}

  // ==================== TYPY ZAJĘĆ GRUPOWYCH ====================

  /**
   * Pobiera wszystkie typy zajęć grupowych
   */
  @Get('types')
  async findAllTypes(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.findAllTypes(tenantId);
  }

  /**
   * Tworzy nowy typ zajęć grupowych
   */
  @Post('types')
  async createType(
    @Body() body: {
      name: string;
      description?: string;
      maxParticipants: number;
      minParticipants?: number;
      pricePerPerson: number;
      duration: number;
      serviceId?: string;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.log(`Tworzenie typu zajęć grupowych "${body.name}"`);
    return this.groupBookingsService.createType(tenantId, body);
  }

  /**
   * Aktualizuje typ zajęć grupowych
   */
  @Put('types/:id')
  async updateType(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      maxParticipants?: number;
      minParticipants?: number;
      pricePerPerson?: number;
      duration?: number;
      isActive?: boolean;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.updateType(id, tenantId, body);
  }

  /**
   * Usuwa typ zajęć grupowych
   */
  @Delete('types/:id')
  async deleteType(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.deleteType(id, tenantId);
  }

  // ==================== REZERWACJE GRUPOWE ====================

  /**
   * Pobiera wszystkie rezerwacje grupowe
   */
  @Get()
  async findAll(
    @Query('status') status: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.findAll(tenantId, {
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  /**
   * Pobiera publiczne zajęcia grupowe (dla strony rezerwacji)
   */
  @Public()
  @Get('public/:tenantId')
  async findPublicBookings(@Param('tenantId') tenantId: string) {
    return this.groupBookingsService.findPublicBookings(tenantId);
  }

  /**
   * Pobiera pojedynczą rezerwację grupową
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.findOne(id, tenantId);
  }

  /**
   * Tworzy nową rezerwację grupową
   */
  @Post()
  async create(
    @Body() body: {
      typeId: string;
      title: string;
      description?: string;
      startTime: string;
      employeeId?: string;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.log(`Tworzenie rezerwacji grupowej "${body.title}"`);
    return this.groupBookingsService.create(tenantId, {
      ...body,
      startTime: new Date(body.startTime),
    });
  }

  /**
   * Dodaje uczestnika do rezerwacji grupowej
   */
  @Post(':id/participants')
  async addParticipant(
    @Param('id') id: string,
    @Body() body: {
      customerId?: string;
      name: string;
      email?: string;
      phone?: string;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.addParticipant(id, tenantId, body);
  }

  /**
   * Usuwa uczestnika z rezerwacji grupowej
   */
  @Delete(':id/participants/:participantId')
  async removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.removeParticipant(id, participantId, tenantId);
  }

  /**
   * Anuluje rezerwację grupową
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.cancel(id, tenantId);
  }

  /**
   * Oznacza rezerwację jako zakończoną
   */
  @Post(':id/complete')
  async complete(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.complete(id, tenantId);
  }

  /**
   * Aktualizuje rezerwację grupową
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      title?: string;
      description?: string;
      startTime?: string;
      employeeId?: string;
      maxParticipants?: number;
      isPublic?: boolean;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.update(id, tenantId, {
      ...body,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
    });
  }

  /**
   * Przełącza widoczność zajęć (publiczne/prywatne)
   */
  @Post(':id/toggle-visibility')
  async toggleVisibility(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const booking = await this.groupBookingsService.findOne(id, tenantId);
    return this.groupBookingsService.update(id, tenantId, {
      isPublic: !booking.isPublic,
    });
  }

  // ==================== ZAPIS WIELU OSÓB ====================

  /**
   * Dodaje wielu uczestników naraz (publiczny endpoint)
   */
  @Public()
  @Post(':id/participants/bulk')
  async addMultipleParticipants(
    @Param('id') id: string,
    @Body() body: {
      tenantId: string;
      participants: Array<{
        name: string;
        email?: string;
        phone?: string;
      }>;
      rodoConsent?: boolean;
      rodoConsentText?: string;
      marketingConsent?: boolean;
      marketingConsentText?: string;
      couponCode?: string;
    },
  ) {
    this.logger.log(`Dodawanie ${body.participants.length} uczestników do rezerwacji ${id}`);
    return this.groupBookingsService.addMultipleParticipants(id, body.tenantId, body);
  }

  // ==================== CYKLICZNE ZAJĘCIA ====================

  /**
   * Tworzy cykliczne zajęcia grupowe
   */
  @Post('recurring')
  async createRecurring(
    @Body() body: {
      typeId: string;
      title: string;
      description?: string;
      startTime: string;
      employeeId?: string;
      recurrence: 'daily' | 'weekly' | 'biweekly' | 'monthly';
      occurrences: number;
    },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    this.logger.log(`Tworzenie ${body.occurrences} cyklicznych zajęć "${body.title}"`);
    return this.groupBookingsService.createRecurring(tenantId, {
      ...body,
      startTime: new Date(body.startTime),
    });
  }

  // ==================== WAITLISTA ====================

  /**
   * Pobiera listę oczekujących
   */
  @Get(':id/waitlist')
  async getWaitlist(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.getWaitlist(id, tenantId);
  }

  /**
   * Przenosi osobę z waitlisty na listę uczestników
   */
  @Post(':id/waitlist/promote')
  async promoteFromWaitlist(
    @Param('id') id: string,
    @Body() body: { waitlistId?: string },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.promoteFromWaitlist(id, tenantId, body.waitlistId);
  }

  /**
   * Usuwa osobę z listy oczekujących
   */
  @Delete(':id/waitlist/:waitlistId')
  async removeFromWaitlist(
    @Param('id') id: string,
    @Param('waitlistId') waitlistId: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.removeFromWaitlist(id, waitlistId, tenantId);
  }

  // ==================== CHECK-IN ====================

  /**
   * Check-in uczestnika
   */
  @Post(':id/participants/:participantId/check-in')
  async checkInParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.checkInParticipant(id, participantId, tenantId);
  }

  /**
   * Oznacza uczestnika jako nieobecnego
   */
  @Post(':id/participants/:participantId/no-show')
  async markNoShow(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.markNoShow(id, participantId, tenantId);
  }

  /**
   * Masowy check-in wszystkich uczestników
   */
  @Post(':id/check-in-all')
  async checkInAll(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.checkInAll(id, tenantId);
  }

  // ==================== PŁATNOŚCI ====================

  /**
   * Oznacza uczestników jako opłaconych
   */
  @Post(':id/mark-paid')
  async markAsPaid(
    @Param('id') id: string,
    @Body() body: { participantIds: string[] },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.markAsPaid(id, body.participantIds, tenantId);
  }

  // ==================== STATYSTYKI ====================

  /**
   * Pobiera statystyki zajęć grupowych
   */
  @Get('stats/summary')
  async getStatistics(
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.getStatistics(
      tenantId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  // ==================== PRZYPOMNIENIA ====================

  /**
   * Wysyła przypomnienia o nadchodzących zajęciach
   */
  @Post('reminders/send')
  async sendReminders(
    @Body() body: { hoursBeforeStart?: number },
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.groupBookingsService.sendReminders(tenantId, body.hoursBeforeStart);
  }
}
