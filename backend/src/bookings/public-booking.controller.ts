import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public-booking')
@Controller('public/booking')
export class PublicBookingController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły rezerwacji (publiczne)' })
  async getBookingDetails(
    @Param('id') id: string,
    @Query('subdomain') subdomain: string,
  ) {
    const tenant = await this.prisma.tenants.findFirst({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Firma nie została znaleziona');
    }

    const booking = await this.prisma.bookings.findFirst({
      where: { id },
      include: {
        services: true,
        employees: true,
        customers: true,
      },
    });

    // Sprawdź czy rezerwacja istnieje i należy do tego tenanta (przez customera)
    if (!booking || booking.customers?.tenantId !== tenant.id) {
      throw new NotFoundException('Rezerwacja nie została znaleziona');
    }

    // Pobierz minCancellationHours z pageSettings (nowe) lub cancel_deadline_hours (stare)
    const pageSettings = (tenant as any).pageSettings || {};
    const cancelDeadlineHours = pageSettings.minCancellationHours ?? (tenant as any).cancel_deadline_hours ?? 0;
    
    const bookingTime = new Date(booking.startTime).getTime();
    const now = Date.now();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    
    // Jeśli firma ma włączone zaliczki i rezerwacja ma zaliczkę - klient może anulować zawsze
    const hasDeposit = (booking as any).depositAmount > 0;
    const canCancel = (hasDeposit || hoursUntilBooking >= cancelDeadlineHours) && booking.status !== 'CANCELLED';

    return {
      id: booking.id,
      startTime: booking.startTime,
      status: booking.status,
      serviceName: (booking as any).services?.name || 'Usługa',
      employeeName: (booking as any).employees 
        ? ((booking as any).employees.firstName + ' ' + (booking as any).employees.lastName) 
        : 'Pracownik',
      customerName: (booking as any).customers 
        ? ((booking as any).customers.firstName + ' ' + (booking as any).customers.lastName) 
        : 'Klient',
      businessName: tenant.name,
      canCancel,
      cancelDeadlineHours,
      hasDeposit,
    };
  }

  @Public()
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Anuluj rezerwację (publiczne)' })
  async cancelBooking(
    @Param('id') id: string,
    @Body('subdomain') subdomain: string,
  ) {
    const tenant = await this.prisma.tenants.findFirst({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Firma nie została znaleziona');
    }

    const booking = await this.prisma.bookings.findFirst({
      where: { id },
      include: { customers: true },
    });

    // Sprawdź czy rezerwacja istnieje i należy do tego tenanta (przez customera)
    if (!booking || booking.customers?.tenantId !== tenant.id) {
      throw new NotFoundException('Rezerwacja nie została znaleziona');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Ta rezerwacja została już anulowana');
    }

    // Pobierz minCancellationHours z pageSettings (nowe) lub cancel_deadline_hours (stare)
    const pageSettings = (tenant as any).pageSettings || {};
    const cancelDeadlineHours = pageSettings.minCancellationHours ?? (tenant as any).cancel_deadline_hours ?? 0;
    
    const bookingTime = new Date(booking.startTime).getTime();
    const now = Date.now();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    
    // Jeśli rezerwacja ma zaliczkę - klient może anulować zawsze (traci zaliczkę)
    const hasDeposit = (booking as any).depositAmount > 0;

    if (!hasDeposit && cancelDeadlineHours > 0 && hoursUntilBooking < cancelDeadlineHours) {
      throw new BadRequestException(
        `Anulowanie jest możliwe do ${cancelDeadlineHours} godzin przed wizytą`,
      );
    }

    await this.prisma.bookings.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'customer',
        cancellationReason: 'Anulowano przez klienta',
      },
    });

    const message = hasDeposit 
      ? 'Rezerwacja została anulowana. Zaliczka nie podlega zwrotowi.'
      : 'Rezerwacja została anulowana';

    return { success: true, message };
  }

  @Public()
  @Get(':id/payment')
  @ApiOperation({ summary: 'Pobierz szczegóły płatności (publiczne)' })
  async getPaymentDetails(
    @Param('id') id: string,
    @Query('subdomain') subdomain: string,
  ) {
    const tenant = await this.prisma.tenants.findFirst({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Firma nie została znaleziona');
    }

    const booking = await this.prisma.bookings.findFirst({
      where: { id },
      include: {
        services: true,
        employees: true,
        customers: true,
      },
    });

    if (!booking || (booking as any).tenantId !== tenant.id) {
      throw new NotFoundException('Rezerwacja nie została znaleziona');
    }

    const paymentSettings = (tenant as any).paymentSettings || {};
    const availableProviders: string[] = [];
    
    if (paymentSettings.przelewy24Enabled) availableProviders.push('przelewy24');
    if (paymentSettings.stripeEnabled) availableProviders.push('stripe');
    if (paymentSettings.payuEnabled) availableProviders.push('payu');
    if (paymentSettings.tpayEnabled) availableProviders.push('tpay');

    const paymentMethod = booking.paymentMethod || 'cash';
    const depositAmount = (booking as any).depositAmount || 0;
    const depositPaid = (booking as any).depositPaid || false;
    
    const canPayOnline = 
      availableProviders.length > 0 && 
      booking.status !== 'CANCELLED' &&
      !booking.isPaid &&
      (paymentMethod !== 'cash' || depositAmount > 0);

    if (!canPayOnline) {
      throw new BadRequestException('Ta rezerwacja nie wymaga płatności online');
    }

    const totalPrice = booking.totalPrice ? Number(booking.totalPrice) : 0;
    const servicePrice = (booking as any).services?.price ? Number((booking as any).services.price) : 0;

    return {
      id: booking.id,
      startTime: booking.startTime,
      status: booking.status,
      paymentStatus: booking.isPaid ? 'paid' : 'unpaid',
      paymentMethod,
      serviceName: (booking as any).services?.name || 'Usługa',
      employeeName: (booking as any).employees 
        ? ((booking as any).employees.firstName + ' ' + (booking as any).employees.lastName) 
        : 'Pracownik',
      customerName: (booking as any).customers 
        ? ((booking as any).customers.firstName + ' ' + (booking as any).customers.lastName) 
        : 'Klient',
      customerEmail: (booking as any).customers?.email || '',
      businessName: tenant.name,
      totalPrice: totalPrice || servicePrice,
      depositAmount,
      depositPaid,
      canPayOnline,
      availableProviders,
    };
  }

  @Public()
  @Post(':id/pay')
  @ApiOperation({ summary: 'Utwórz płatność (publiczne)' })
  async createPayment(
    @Param('id') id: string,
    @Body() body: { subdomain: string; provider: string; email: string },
  ) {
    const { subdomain, provider, email } = body;

    const tenant = await this.prisma.tenants.findFirst({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Firma nie została znaleziona');
    }

    const booking = await this.prisma.bookings.findFirst({
      where: { id },
      include: {
        services: true,
        customers: true,
      },
    });

    if (!booking || (booking as any).tenantId !== tenant.id) {
      throw new NotFoundException('Rezerwacja nie została znaleziona');
    }

    const depositAmount = (booking as any).depositAmount || 0;
    const depositPaid = (booking as any).depositPaid || false;
    const totalPrice = booking.totalPrice ? Number(booking.totalPrice) : 0;
    const servicePrice = (booking as any).services?.price ? Number((booking as any).services.price) : 0;
    
    const amount = depositAmount && !depositPaid 
      ? depositAmount 
      : (totalPrice || servicePrice);

    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const paymentResponse = await fetch(apiUrl + '/api/payments/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenant.id,
      },
      body: JSON.stringify({
        bookingId: id,
        amount,
        provider,
        customerEmail: email,
        customerName: (booking as any).customers 
          ? ((booking as any).customers.firstName + ' ' + (booking as any).customers.lastName) 
          : 'Klient',
        userId: (tenant as any).userId,
        isDeposit: depositAmount > 0 && !depositPaid,
      }),
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new BadRequestException(error.message || 'Nie udało się utworzyć płatności');
    }

    return await paymentResponse.json();
  }
}
