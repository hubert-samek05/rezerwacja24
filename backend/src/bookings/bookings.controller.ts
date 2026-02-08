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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Public()
  @Post('public')
  @ApiOperation({ summary: 'Utwórz rezerwację publiczną (z landing page)' })
  createPublic(@Body() createBookingDto: any) {
    return this.bookingsService.createPublicBooking(createBookingDto);
  }

  @Post()
  @ApiOperation({ summary: 'Utwórz rezerwację' })
  create(@Body() createBookingDto: any, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.bookingsService.create(tenantId, createBookingDto);
  }

  @Public()
  @Get('availability')
  @ApiOperation({ summary: 'Sprawdź dostępność dla rezerwacji publicznej' })
  checkAvailability(
    @Query('tenantId') tenantId: string,
    @Query('serviceId') serviceId: string,
    @Query('employeeId') employeeId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string, // Opcjonalny czas trwania dla elastycznych usług
  ) {
    const durationMinutes = duration ? parseInt(duration) : undefined;
    return this.bookingsService.checkAvailability(tenantId, serviceId, employeeId, date, durationMinutes);
  }

  @Public()
  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Pobierz rezerwacje dla usługi (do sprawdzania dostępności)' })
  getBookingsForService(
    @Param('serviceId') serviceId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.bookingsService.getBookingsForService(tenantId, serviceId);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz rezerwacje' })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeId?: string,
    @Req() req?: any,
  ) {
    const tenantId = req?.headers['x-tenant-id'] || 'default';
    return this.bookingsService.findAll(tenantId, { startDate, endDate, employeeId });
  }

  @Public()
  @Get(':id/status')
  @ApiOperation({ summary: 'Sprawdź status rezerwacji (publiczny)' })
  async getBookingStatus(@Param('id') id: string) {
    return this.bookingsService.getBookingStatus(id);
  }

  @Public()
  @Get(':id/full')
  @ApiOperation({ summary: 'Pobierz pełne dane rezerwacji (publiczny - do ponowienia płatności)' })
  async getBookingFull(@Param('id') id: string) {
    return this.bookingsService.getBookingFull(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz rezerwację' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.bookingsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj rezerwację' })
  update(@Param('id') id: string, @Body() updateBookingDto: any, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.bookingsService.update(tenantId, id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń rezerwację' })
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.bookingsService.remove(tenantId, id);
  }
}
