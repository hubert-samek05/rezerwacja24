import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FlySMSService } from '../notifications/flysms.service';
import { SMSTemplatesService } from '../notifications/sms-templates.service';
import { GoogleCalendarService } from '../integrations/google-calendar.service';
import { LimitsService } from '../limits/limits.service';
import { PassesService } from '../passes/passes.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { getRegionFromRequest, Region } from '../common/utils/region.util';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private flySMSService: FlySMSService,
    private smsTemplatesService: SMSTemplatesService,
    private googleCalendarService: GoogleCalendarService,
    private limitsService: LimitsService,
    private passesService: PassesService,
    private loyaltyService: LoyaltyService,
    private auditLogService: AuditLogService,
    private emailService: EmailService,
    @Inject(REQUEST) private request: Request,
  ) {}
  
  /**
   * Pobierz region z aktualnego żądania
   */
  private getRegion(): Region {
    return getRegionFromRequest(this.request);
  }
  
  /**
   * Formatuj datę w zależności od regionu
   */
  private formatDate(date: Date, region: Region): string {
    const locale = region === 'eu' ? 'en-GB' : 'pl-PL';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  /**
   * Formatuj godzinę w zależności od regionu
   */
  private formatTime(date: Date, region: Region): string {
    const locale = region === 'eu' ? 'en-GB' : 'pl-PL';
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }

  async create(tenantId: string, createBookingDto: any) {
    // 🔒 SPRAWDŹ LIMIT REZERWACJI
    const bookingLimit = await this.limitsService.checkBookingLimit(tenantId);
    if (!bookingLimit.canProceed) {
      this.logger.warn(`Booking limit exceeded for tenant ${tenantId}: ${bookingLimit.current}/${bookingLimit.limit}`);
      throw new ForbiddenException(bookingLimit.message || 'Osiągnięto limit rezerwacji w tym miesiącu. Ulepsz plan aby kontynuować.');
    }
    
    // Ostrzeżenie jeśli blisko limitu
    if (bookingLimit.message && bookingLimit.remaining && bookingLimit.remaining <= 10) {
      this.logger.warn(`Tenant ${tenantId} approaching booking limit: ${bookingLimit.remaining} remaining`);
    }

    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);
    
    this.logger.log(`📅 Creating booking: employee=${createBookingDto.employeeId}, service=${createBookingDto.serviceId}, start=${startTime.toISOString()}, end=${endTime.toISOString()}`);

    // Pobierz usługę z przypisanymi pracownikami
    const service = await this.prisma.services.findUnique({
      where: { id: createBookingDto.serviceId },
      include: { service_employees: true },
    });

    // Sprawdź czy usługa ma przypisanych pracowników
    const assignedEmployeeIds = service?.service_employees?.map(es => es.employeeId) || [];
    const hasAssignedEmployees = assignedEmployeeIds.length > 0;
    
    let conflict;
    
    if (!hasAssignedEmployees) {
      // PRZYPADEK 1: Usługa BEZ pracowników - sprawdź konflikt po USŁUDZE
      this.logger.log(`Service has NO employees - checking service conflicts only`);
      conflict = await this.checkServiceTimeConflict(
        createBookingDto.serviceId,
        startTime,
        endTime
      );
      
      if (conflict) {
        throw new BadRequestException(
          `Ta usługa jest już zarezerwowana w tym terminie: ${conflict.startTime.toLocaleString('pl-PL')} - ${conflict.endTime.toLocaleString('pl-PL')}`
        );
      }
    } else if (createBookingDto.employeeId && createBookingDto.employeeId !== 'any') {
      // PRZYPADEK 2: Usługa Z pracownikami + konkretny pracownik - sprawdź konflikt po PRACOWNIKU
      this.logger.log(`Service has employees, checking employee ${createBookingDto.employeeId} conflicts`);
      conflict = await this.checkTimeConflict(
        createBookingDto.employeeId,
        startTime,
        endTime
      );

      if (conflict) {
        const conflictType = conflict.isTimeOff ? 'urlopem/blokadą' : (conflict.isGroupBooking ? 'zajęciami grupowymi' : 'rezerwacją');
        const reason = conflict.reason ? ` (${conflict.reason})` : '';
        throw new BadRequestException(
          `Pracownik jest niedostępny w tym czasie. Konflikt z ${conflictType}: ${conflict.startTime.toLocaleString('pl-PL')} - ${conflict.endTime.toLocaleString('pl-PL')}${reason}`
        );
      }
    }
    // PRZYPADEK 3: Usługa Z pracownikami + "any" - employeeId zostanie przypisany w createPublicBooking

    // Oblicz cenę z rabatem jeśli jest kupon
    const basePrice = createBookingDto.totalPrice || 0;
    const discountAmount = createBookingDto.discountAmount || 0;
    const finalPrice = Math.max(0, basePrice - discountAmount);

    // Przygotuj dane rezerwacji
    const bookingData: any = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customers: { connect: { id: createBookingDto.customerId } },
      services: { connect: { id: createBookingDto.serviceId } },
      startTime,
      endTime,
      status: createBookingDto.status || 'PENDING',
      customerNotes: createBookingDto.notes,
      basePrice: basePrice,
      totalPrice: finalPrice,
      couponCode: createBookingDto.couponCode || null,
      discountAmount: discountAmount > 0 ? discountAmount : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Tracking who created the booking
      createdById: createBookingDto.createdById || null,
      createdByType: createBookingDto.createdByType || 'owner',
      createdByName: createBookingDto.createdByName || null,
    };
    
    // Dla usług elastycznych employeeId może być opcjonalny
    if (createBookingDto.employeeId && createBookingDto.employeeId !== 'any') {
      bookingData.employees = { connect: { id: createBookingDto.employeeId } };
    }
    
    const booking = await this.prisma.bookings.create({
      data: bookingData,
      include: {
        customers: true,
        services: true,
        employees: true,
      },
    });

    // 📝 Audit log - zapisz kto utworzył rezerwację
    await this.auditLogService.log({
      tenantId,
      userId: createBookingDto.createdById,
      userType: createBookingDto.createdByType || 'owner',
      userName: createBookingDto.createdByName,
      action: 'create',
      entityType: 'booking',
      entityId: booking.id,
      entityName: `${booking.services?.name} - ${booking.customers?.firstName} ${booking.customers?.lastName}`,
      metadata: {
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        employeeId: booking.employeeId,
      },
    });

    // 📦 Jeśli to rezerwacja pakietu, utwórz powiązanie w package_bookings
    if (createBookingDto.packageId) {
      try {
        await this.prisma.package_bookings.create({
          data: {
            packageId: createBookingDto.packageId,
            bookingId: booking.id,
          },
        });
        this.logger.log(`📦 Powiązano rezerwację ${booking.id} z pakietem ${createBookingDto.packageId}`);
      } catch (err) {
        this.logger.error(`Błąd tworzenia powiązania z pakietem: ${err.message}`);
      }
    }

    // 📱 Wyślij SMS z potwierdzeniem TYLKO jeśli status to CONFIRMED (płatność gotówką lub już opłacone)
    // Dla płatności online SMS zostanie wysłany po potwierdzeniu płatności (w webhook lub update)
    if (booking.customers?.phone && booking.status === 'CONFIRMED') {
      // Pobierz nazwę firmy, subdomenę i ustawienia SMS
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        select: { name: true, subdomain: true, sms_settings: true },
      });
      const businessName = tenant?.name || 'Firma';
      const subdomain = tenant?.subdomain;
      const smsSettings = (tenant?.sms_settings as any) || {};
      
      // Pobierz custom szablony SMS
      const customTemplates = await this.flySMSService.getSMSTemplates(tenantId);
      
      // Wykryj region i formatuj datę/godzinę
      const region = this.getRegion();
      const bookingDate = new Date(booking.startTime);
      const dateStr = this.formatDate(bookingDate, region);
      const timeStr = this.formatTime(bookingDate, region);
      
      // Generuj linki do odwołania i płatności (tylko jeśli includeCancelLink jest włączone lub nie ustawione)
      const includeCancelLink = smsSettings.includeCancelLink !== false; // domyślnie true
      // Użyj krótszego formatu linku: https://subdomain.rezerwacja24.pl/cancel/ID
      const cancelUrl = (includeCancelLink && subdomain) ? `https://${subdomain}.rezerwacja24.pl/cancel/${booking.id}` : undefined;
      
      // Link do płatności tylko gdy:
      // 1. Status PENDING (nieopłacone) LUB
      // 2. Metoda płatności to online (nie gotówka) i nie jest opłacone LUB
      // 3. Jest wymagana zaliczka i nie jest opłacona
      const paymentMethod = (booking as any).paymentMethod || 'cash';
      const isPaid = (booking as any).paymentStatus === 'paid';
      const depositRequired = (booking as any).depositAmount > 0;
      const depositPaid = (booking as any).depositPaid;
      
      const needsPaymentLink = subdomain && !isPaid && (
        !booking.isPaid || 
        (paymentMethod !== 'cash') ||
        (depositRequired && !depositPaid)
      );
      // Użyj krótszego formatu linku: https://subdomain.rezerwacja24.pl/pay/ID
      const paymentUrl = needsPaymentLink ? `https://${subdomain}.rezerwacja24.pl/pay/${booking.id}` : undefined;
      
      // Użyj szablonu SMS dla odpowiedniego regionu z custom szablonami
      const message = this.smsTemplatesService.getConfirmedTemplate({
        serviceName: booking.services?.name,
        businessName,
        date: dateStr,
        time: timeStr,
        cancelUrl,
        paymentUrl,
        bookingId: booking.id,
        subdomain,
      }, region, customTemplates);
      
      this.logger.log(`📱 SMS message to send: "${message}" (length: ${message.length}, cancelUrl: ${cancelUrl || 'none'})`);
      
      this.flySMSService.sendSMS(tenantId, booking.customers.phone, message, 'confirmed').catch(err => {
        this.logger.error('SMS sending failed:', err);
      });
    } else {
      this.logger.log(`📱 SMS not sent - booking status is ${booking.status}, waiting for payment confirmation`);
    }

    // 🔔 Utwórz powiadomienie dla właściciela firmy
    await this.createBookingNotification(
      tenantId,
      'BOOKING',
      'Nowa rezerwacja',
      `${booking.customers?.firstName} ${booking.customers?.lastName} zarezerwował/a ${booking.services?.name} na ${new Date(booking.startTime).toLocaleString('pl-PL')}`,
      booking.id
    );

    // 📅 Synchronizuj z Google Calendar (asynchronicznie, nie blokuj)
    this.syncBookingToGoogleCalendar(tenantId, booking).catch(err => {
      this.logger.error('Google Calendar sync failed:', err);
    });

    // 🎫 Karnet będzie wykorzystany dopiero przy opłaceniu wizyty (w metodzie update)
    // passId jest przekazywany przez frontend i zapisywany w internalNotes tymczasowo
    if (createBookingDto.passId) {
      await this.prisma.bookings.update({
        where: { id: booking.id },
        data: { 
          internalNotes: JSON.stringify({ 
            ...(booking.internalNotes ? JSON.parse(booking.internalNotes) : {}),
            pendingPassId: createBookingDto.passId 
          })
        },
      });
      this.logger.log(`Przypisano karnet ${createBookingDto.passId} do rezerwacji ${booking.id} (oczekuje na opłacenie)`);
    }

    return booking;
  }

  /**
   * Synchronizuje rezerwację z Google Calendar
   */
  private async syncBookingToGoogleCalendar(tenantId: string, booking: any): Promise<void> {
    try {
      // Sprawdź czy tenant ma połączenie z Google Calendar
      const isConnected = await this.googleCalendarService.isConnected(tenantId);
      if (!isConnected) {
        return;
      }

      // Utwórz event w Google Calendar
      const eventId = await this.googleCalendarService.createBookingEvent(tenantId, {
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        customerName: `${booking.customers?.firstName || ''} ${booking.customers?.lastName || ''}`.trim(),
        customerPhone: booking.customers?.phone,
        customerEmail: booking.customers?.email,
        serviceName: booking.services?.name || 'Rezerwacja',
        employeeName: `${booking.employees?.firstName || ''} ${booking.employees?.lastName || ''}`.trim(),
        notes: booking.customerNotes,
        totalPrice: Number(booking.totalPrice),
      });

      // Zapisz ID eventu w rezerwacji
      if (eventId) {
        await this.prisma.bookings.update({
          where: { id: booking.id },
          data: { google_calendar_event_id: eventId },
        });
        this.logger.log(`Booking ${booking.id} synced to Google Calendar: ${eventId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync booking ${booking.id} to Google Calendar:`, error);
    }
  }

  async findAll(tenantId: string, filters?: { startDate?: string; endDate?: string; employeeId?: string }) {
    const where: any = {
      customers: {
        tenantId: tenantId,
      },
    };

    // Filter by employee if provided (for onlyOwnCalendar)
    // Also include bookings without assigned employee (elastic bookings)
    if (filters?.employeeId) {
      where.OR = [
        { employeeId: filters.employeeId },
        { employeeId: null }, // Elastic bookings - visible to all employees
      ];
    }

    // Filter by date range if provided
    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.startTime.lte = endDate;
      }
    }

    return this.prisma.bookings.findMany({
      where,
      include: {
        customers: true,
        services: true,
        employees: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // Pobierz rezerwację i sprawdź czy klient należy do tenanta
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        customers: true,
        services: true,
        employees: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Sprawdź czy rezerwacja należy do tego tenanta (przez klienta)
    if (booking.customers?.tenantId !== tenantId) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    return booking;
  }

  /**
   * Pobierz status rezerwacji (publiczny endpoint dla strony płatności)
   */
  async getBookingStatus(id: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        isPaid: true,
        paidAt: true,
        paymentMethod: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    return {
      id: booking.id,
      status: booking.status,
      isPaid: booking.isPaid || false,
      paidAt: booking.paidAt,
      paymentMethod: booking.paymentMethod,
    };
  }

  /**
   * Pobierz pełne dane rezerwacji (publiczny endpoint dla ponowienia płatności)
   */
  async getBookingFull(id: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        customers: true,
        services: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    return {
      id: booking.id,
      status: booking.status,
      isPaid: booking.isPaid || false,
      totalPrice: booking.totalPrice ? Number(booking.totalPrice) : 0,
      basePrice: booking.basePrice ? Number(booking.basePrice) : 0,
      paymentMethod: booking.paymentMethod,
      customers: booking.customers ? {
        firstName: booking.customers.firstName,
        lastName: booking.customers.lastName,
        email: booking.customers.email,
        tenantId: booking.customers.tenantId,
      } : null,
      services: booking.services ? {
        name: booking.services.name,
      } : null,
    };
  }

  async update(tenantId: string, id: string, updateBookingDto: any) {
    // Pobierz starą rezerwację żeby sprawdzić co się zmieniło
    const oldBooking = await this.prisma.bookings.findUnique({
      where: { id },
      include: { customers: true, services: true, employees: true },
    });

    if (!oldBooking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Sprawdź czy rezerwacja należy do tego tenanta (przez klienta)
    if (oldBooking.customers?.tenantId !== tenantId) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // Przygotuj dane do update
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Jeśli zmienia się czas - sprawdź konflikty
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const newStartTime = updateBookingDto.startTime ? new Date(updateBookingDto.startTime) : oldBooking.startTime;
      const newEndTime = updateBookingDto.endTime ? new Date(updateBookingDto.endTime) : oldBooking.endTime;
      const employeeId = updateBookingDto.employeeId || oldBooking.employeeId;

      // Sprawdź czy pracownik jest dostępny w nowym terminie
      const conflict = await this.checkTimeConflict(
        employeeId,
        newStartTime,
        newEndTime,
        id // Wyklucz obecną rezerwację
      );

      if (conflict) {
        const conflictType = conflict.isTimeOff ? 'urlopem/blokadą' : (conflict.isGroupBooking ? 'zajęciami grupowymi' : 'rezerwacją');
        const reason = conflict.reason ? ` (${conflict.reason})` : '';
        throw new BadRequestException(
          `Pracownik jest niedostępny w tym czasie. Konflikt z ${conflictType}: ${conflict.startTime.toLocaleString('pl-PL')} - ${conflict.endTime.toLocaleString('pl-PL')}${reason}`
        );
      }

      updateData.startTime = newStartTime;
      updateData.endTime = newEndTime;
    }

    // Dodaj pozostałe pola
    if (updateBookingDto.customerId) updateData.customerId = updateBookingDto.customerId;
    if (updateBookingDto.serviceId) updateData.serviceId = updateBookingDto.serviceId;
    if (updateBookingDto.employeeId) updateData.employeeId = updateBookingDto.employeeId;
    if (updateBookingDto.status) updateData.status = updateBookingDto.status;
    if (updateBookingDto.customerNotes !== undefined) updateData.customerNotes = updateBookingDto.customerNotes;
    if (updateBookingDto.totalPrice !== undefined) updateData.totalPrice = updateBookingDto.totalPrice;

    // Pola płatności
    if (updateBookingDto.isPaid !== undefined) updateData.isPaid = updateBookingDto.isPaid;
    if (updateBookingDto.paidAmount !== undefined) updateData.paidAmount = updateBookingDto.paidAmount;
    if (updateBookingDto.paymentMethod !== undefined) updateData.paymentMethod = updateBookingDto.paymentMethod;
    if (updateBookingDto.paidAt !== undefined) updateData.paidAt = updateBookingDto.paidAt ? new Date(updateBookingDto.paidAt) : null;

    const updatedBooking = await this.prisma.bookings.update({
      where: { id },
      data: updateData,
      include: {
        customers: true,
        services: true,
        employees: true,
      },
    });

    // Pobierz nazwę firmy, subdomenę i ustawienia SMS
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { name: true, subdomain: true, sms_settings: true },
    });
    const businessName = tenant?.name || 'Firma';

    // Pobierz custom szablony SMS
    const customTemplates = await this.flySMSService.getSMSTemplates(tenantId);

    // Wykryj region dla SMS
    const region = this.getRegion();

    // 📱 Wyślij SMS jeśli status zmienił się na CANCELLED
    if (updatedBooking.status === 'CANCELLED' && oldBooking.status !== 'CANCELLED') {
      if (updatedBooking.customers?.phone) {
        const bookingDate = new Date(updatedBooking.startTime);
        const dateStr = this.formatDate(bookingDate, region);
        const timeStr = this.formatTime(bookingDate, region);
        
        const message = this.smsTemplatesService.getCancelledTemplate({
          serviceName: updatedBooking.services?.name,
          businessName,
          date: dateStr,
          time: timeStr,
        }, region, customTemplates);
        
        this.flySMSService.sendSMS(tenantId, updatedBooking.customers.phone, message, 'cancelled').catch(err => {
          this.logger.error('SMS sending failed:', err);
        });
      }
    }

    // 🚫 Zwiększ noShowCount klienta jeśli status zmienił się na NO_SHOW
    if (updatedBooking.status === 'NO_SHOW' && oldBooking.status !== 'NO_SHOW') {
      if (updatedBooking.customerId) {
        await this.prisma.customers.update({
          where: { id: updatedBooking.customerId },
          data: { noShowCount: { increment: 1 } },
        });
        this.logger.log(`Increased noShowCount for customer ${updatedBooking.customerId}`);
      }
    }

    // 🔄 Zmniejsz noShowCount jeśli status zmienił się Z NO_SHOW na inny
    if (oldBooking.status === 'NO_SHOW' && updatedBooking.status !== 'NO_SHOW') {
      if (updatedBooking.customerId) {
        const customer = await this.prisma.customers.findUnique({ where: { id: updatedBooking.customerId } });
        if (customer && customer.noShowCount > 0) {
          await this.prisma.customers.update({
            where: { id: updatedBooking.customerId },
            data: { noShowCount: { decrement: 1 } },
          });
          this.logger.log(`Decreased noShowCount for customer ${updatedBooking.customerId}`);
        }
      }
    }

    // 📱 Wyślij SMS jeśli data się zmieniła (przesunięcie)
    if (updateBookingDto.startTime && oldBooking.startTime.getTime() !== new Date(updateBookingDto.startTime).getTime()) {
      if (updatedBooking.customers?.phone) {
        const bookingDate = new Date(updatedBooking.startTime);
        const dateStr = this.formatDate(bookingDate, region);
        const timeStr = this.formatTime(bookingDate, region);
        
        const message = this.smsTemplatesService.getRescheduledTemplate({
          serviceName: updatedBooking.services?.name,
          businessName,
          date: dateStr,
          time: timeStr,
        }, region, customTemplates);
        
        this.flySMSService.sendSMS(tenantId, updatedBooking.customers.phone, message, 'rescheduled').catch(err => {
          this.logger.error('SMS sending failed:', err);
        });
      }

      // 🔔 Powiadomienie o przesunięciu
      await this.createBookingNotification(
        tenantId,
        'REMINDER',
        'Rezerwacja przesunięta',
        `Rezerwacja ${updatedBooking.customers?.firstName} ${updatedBooking.customers?.lastName} została przesunięta na ${new Date(updatedBooking.startTime).toLocaleString('pl-PL')}`,
        updatedBooking.id
      );
    }

    // 🔔 Powiadomienie o anulowaniu
    if (updatedBooking.status === 'CANCELLED' && oldBooking.status !== 'CANCELLED') {
      await this.createBookingNotification(
        tenantId,
        'ALERT',
        'Rezerwacja anulowana',
        `Rezerwacja ${updatedBooking.customers?.firstName} ${updatedBooking.customers?.lastName} (${updatedBooking.services?.name}) została anulowana`,
        updatedBooking.id
      );

      // 🎫 Zwrot wizyty na karnet przy anulowaniu
      try {
        const refundedPass = await this.passesService.refundPassUsage(id);
        if (refundedPass) {
          this.logger.log(`Zwrócono wizytę na karnet dla anulowanej rezerwacji ${id}`);
        }
      } catch (err) {
        this.logger.error(`Błąd zwrotu karnetu: ${err.message}`);
      }
    }

    // 🎫 Wykorzystanie karnetu przy opłaceniu (isPaid zmienia się na true)
    if (updateBookingDto.isPaid === true && !oldBooking.isPaid) {
      // Sprawdź czy jest przypisany karnet w internalNotes
      let pendingPassId = null;
      try {
        if (oldBooking.internalNotes) {
          const notes = JSON.parse(oldBooking.internalNotes);
          pendingPassId = notes.pendingPassId;
        }
      } catch (e) {}

      // Lub sprawdź czy przekazano passId w updateBookingDto
      const passIdToUse = updateBookingDto.passId || pendingPassId;

      if (passIdToUse) {
        try {
          await this.passesService.usePass(passIdToUse, id);
          this.logger.log(`Wykorzystano karnet ${passIdToUse} dla opłaconej rezerwacji ${id}`);
          
          // Usuń pendingPassId z internalNotes
          if (pendingPassId) {
            try {
              const notes = JSON.parse(oldBooking.internalNotes || '{}');
              delete notes.pendingPassId;
              await this.prisma.bookings.update({
                where: { id },
                data: { internalNotes: Object.keys(notes).length > 0 ? JSON.stringify(notes) : null },
              });
            } catch (e) {}
          }
        } catch (err) {
          this.logger.error(`Błąd wykorzystania karnetu: ${err.message}`);
        }
      }
    }

    // 🔔 Powiadomienie o potwierdzeniu + SMS
    if (updatedBooking.status === 'CONFIRMED' && oldBooking.status !== 'CONFIRMED') {
      await this.createBookingNotification(
        tenantId,
        'SUCCESS',
        'Rezerwacja potwierdzona',
        `Rezerwacja ${updatedBooking.customers?.firstName} ${updatedBooking.customers?.lastName} (${updatedBooking.services?.name}) została potwierdzona`,
        updatedBooking.id
      );
      
      // 📱 Wyślij SMS z potwierdzeniem (płatność przeszła!)
      if (updatedBooking.customers?.phone) {
        const region = this.getRegion();
        const bookingDate = new Date(updatedBooking.startTime);
        const dateStr = this.formatDate(bookingDate, region);
        const timeStr = this.formatTime(bookingDate, region);
        
        // Pobierz ustawienia SMS i wygeneruj link do anulowania
        const smsSettings = (tenant?.sms_settings as any) || {};
        const includeCancelLink = smsSettings.includeCancelLink !== false;
        const cancelUrl = (includeCancelLink && tenant?.subdomain) 
          ? `https://${tenant.subdomain}.rezerwacja24.pl/cancel/${updatedBooking.id}` 
          : undefined;
        
        const message = this.smsTemplatesService.getConfirmedTemplate({
          serviceName: updatedBooking.services?.name,
          businessName,
          date: dateStr,
          time: timeStr,
          cancelUrl,
        }, region, customTemplates);
        
        this.logger.log(`📱 SMS message: "${message}" (cancelUrl: ${cancelUrl || 'none'})`);
        
        this.flySMSService.sendSMS(tenantId, updatedBooking.customers.phone, message, 'confirmed').catch(err => {
          this.logger.error('SMS sending failed:', err);
        });
        this.logger.log(`📱 SMS sent after payment confirmation for booking ${updatedBooking.id}`);
      }
    }

    // 🔔 Powiadomienie o zakończeniu + naliczenie punktów lojalnościowych
    if (updatedBooking.status === 'COMPLETED' && oldBooking.status !== 'COMPLETED') {
      await this.createBookingNotification(
        tenantId,
        'SUCCESS',
        'Wizyta zakończona',
        `Wizyta ${updatedBooking.customers?.firstName} ${updatedBooking.customers?.lastName} (${updatedBooking.services?.name}) została zakończona`,
        updatedBooking.id
      );

      // 🎁 Nalicz punkty lojalnościowe
      if (updatedBooking.customerId && updatedBooking.totalPrice) {
        try {
          const loyaltyResult = await this.loyaltyService.earnPoints(
            tenantId,
            updatedBooking.customerId,
            Number(updatedBooking.totalPrice),
            updatedBooking.id
          );
          if (loyaltyResult) {
            this.logger.log(`🎁 Naliczono ${loyaltyResult.pointsEarned} punktów lojalnościowych dla klienta ${updatedBooking.customerId}`);
          }
        } catch (err) {
          this.logger.error(`Błąd naliczania punktów lojalnościowych: ${err.message}`);
        }
      }
    }

    // 📅 Synchronizuj zmiany z Google Calendar (asynchronicznie)
    this.updateGoogleCalendarEvent(tenantId, oldBooking, updatedBooking).catch(err => {
      this.logger.error('Google Calendar update failed:', err);
    });

    // 📝 Audit log - zapisz kto zaktualizował rezerwację
    const changes: any = { before: {}, after: {} };
    if (updateBookingDto.status && oldBooking.status !== updateBookingDto.status) {
      changes.before.status = oldBooking.status;
      changes.after.status = updateBookingDto.status;
    }
    if (updateBookingDto.startTime) {
      changes.before.startTime = oldBooking.startTime;
      changes.after.startTime = updatedBooking.startTime;
    }
    if (updateBookingDto.isPaid !== undefined && oldBooking.isPaid !== updateBookingDto.isPaid) {
      changes.before.isPaid = oldBooking.isPaid;
      changes.after.isPaid = updateBookingDto.isPaid;
    }

    await this.auditLogService.log({
      tenantId,
      userId: updateBookingDto.updatedById,
      userType: updateBookingDto.updatedByType || 'owner',
      userName: updateBookingDto.updatedByName,
      action: updateBookingDto.status === 'CANCELLED' ? 'cancel' : 'update',
      entityType: 'booking',
      entityId: updatedBooking.id,
      entityName: `${updatedBooking.services?.name} - ${updatedBooking.customers?.firstName} ${updatedBooking.customers?.lastName}`,
      changes: Object.keys(changes.before).length > 0 ? changes : undefined,
    });

    return updatedBooking;
  }

  /**
   * Aktualizuje lub usuwa event w Google Calendar przy zmianie rezerwacji
   */
  private async updateGoogleCalendarEvent(
    tenantId: string,
    oldBooking: any,
    updatedBooking: any,
  ): Promise<void> {
    try {
      // Sprawdź czy tenant ma połączenie z Google Calendar
      const isConnected = await this.googleCalendarService.isConnected(tenantId);
      if (!isConnected) {
        return;
      }

      const eventId = oldBooking.google_calendar_event_id;

      // Jeśli rezerwacja została anulowana - usuń event
      if (updatedBooking.status === 'CANCELLED' && eventId) {
        await this.googleCalendarService.deleteEvent(tenantId, eventId);
        await this.prisma.bookings.update({
          where: { id: updatedBooking.id },
          data: { google_calendar_event_id: null },
        });
        this.logger.log(`Deleted Google Calendar event for cancelled booking: ${updatedBooking.id}`);
        return;
      }

      // Jeśli zmienił się czas lub inne dane - aktualizuj event
      if (eventId) {
        // Mapowanie statusu na kolor Google Calendar
        // 11 = Tomato (czerwony) dla NO_SHOW
        // 10 = Basil (ciemny zielony) dla COMPLETED
        // 2 = Sage (zielony) dla CONFIRMED
        // 5 = Banana (żółty) dla PENDING
        const statusColorMap: Record<string, string> = {
          'NO_SHOW': '11',    // Czerwony
          'COMPLETED': '10',  // Ciemny zielony
          'CONFIRMED': '2',   // Zielony
          'PENDING': '5',     // Żółty
        };
        const colorId = statusColorMap[updatedBooking.status] || undefined;
        
        await this.googleCalendarService.updateEvent(tenantId, eventId, {
          summary: `${updatedBooking.status === 'NO_SHOW' ? '❌ ' : ''}${updatedBooking.services?.name || 'Rezerwacja'} - ${updatedBooking.customers?.firstName || ''} ${updatedBooking.customers?.lastName || ''}`.trim(),
          description: [
            `👤 Klient: ${updatedBooking.customers?.firstName || ''} ${updatedBooking.customers?.lastName || ''}`,
            updatedBooking.customers?.phone ? `📱 Tel: ${updatedBooking.customers.phone}` : '',
            `💇 Usługa: ${updatedBooking.services?.name || 'Rezerwacja'}`,
            `👨‍💼 Pracownik: ${updatedBooking.employees?.firstName || ''} ${updatedBooking.employees?.lastName || ''}`,
            `💰 Cena: ${updatedBooking.totalPrice} PLN`,
            `📊 Status: ${updatedBooking.status}${updatedBooking.status === 'NO_SHOW' ? ' (Nie przyszedł)' : ''}`,
          ].filter(Boolean).join('\n'),
          startTime: new Date(updatedBooking.startTime),
          endTime: new Date(updatedBooking.endTime),
          colorId,
        });
        this.logger.log(`Updated Google Calendar event for booking: ${updatedBooking.id} with color: ${colorId}`);
      } else {
        // Jeśli nie ma eventu, a rezerwacja nie jest anulowana - utwórz nowy
        if (updatedBooking.status !== 'CANCELLED') {
          await this.syncBookingToGoogleCalendar(tenantId, updatedBooking);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update Google Calendar for booking ${updatedBooking.id}:`, error);
    }
  }

  /**
   * Sprawdź czy pracownik jest zajęty w danym czasie
   */
  private async checkTimeConflict(
    employeeId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<any> {
    this.logger.log(`🔍 Checking time conflict for employee ${employeeId}: ${startTime.toISOString()} - ${endTime.toISOString()}`);
    
    // 1. Sprawdź konflikty z istniejącymi rezerwacjami
    // Dwa przedziały [A, B) i [C, D) kolidują gdy: A < D AND B > C
    // Używamy < i > (nie <= i >=) żeby rezerwacje "stykające się" (np. 9:00-9:20 i 9:20-9:40) NIE kolidowały
    const bookingConflicts = await this.prisma.bookings.findMany({
      where: {
        employeeId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { not: 'CANCELLED' },
        // Istniejąca rezerwacja koliduje jeśli: existing.start < new.end AND existing.end > new.start
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (bookingConflicts.length > 0) {
      this.logger.log(`❌ Found booking conflict: ${JSON.stringify(bookingConflicts[0])}`);
      return bookingConflicts[0];
    }
    this.logger.log(`✅ No booking conflicts found`);

    // 2. Sprawdź konflikty z urlopami/blokadami (time_blocks)
    const timeOffConflicts = await this.prisma.time_blocks.findMany({
      where: {
        employeeId,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (timeOffConflicts.length > 0) {
      // Zwróć jako konflikt z informacją o urlopie
      const timeOff = timeOffConflicts[0];
      this.logger.log(`❌ Found time-off conflict: ${JSON.stringify(timeOff)}`);
      return {
        startTime: timeOff.startTime,
        endTime: timeOff.endTime,
        isTimeOff: true,
        reason: timeOff.reason || 'Urlop/blokada',
      };
    }
    this.logger.log(`✅ No time-off conflicts found`);

    // 3. Sprawdź konflikty z zajęciami grupowymi (group_bookings)
    const groupBookingConflicts = await this.prisma.group_bookings.findMany({
      where: {
        employeeId,
        status: { in: ['OPEN', 'FULL'] },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      },
      include: { type: true }
    });

    if (groupBookingConflicts.length > 0) {
      const groupBooking = groupBookingConflicts[0];
      this.logger.log(`❌ Found group booking conflict: ${JSON.stringify(groupBooking)}`);
      return {
        startTime: groupBooking.startTime,
        endTime: groupBooking.endTime,
        isGroupBooking: true,
        reason: `Zajęcia grupowe: ${groupBooking.title}`,
      };
    }
    this.logger.log(`✅ No group booking conflicts found`);

    this.logger.log(`✅ No conflicts found - time slot is available`);
    return null;
  }

  /**
   * Sprawdza konflikt czasowy dla USŁUGI (nie pracownika) - dla elastycznych usług jak sale/miejsca
   * Używane gdy usługa ma flexibleDuration lub allowMultiDay
   */
  private async checkServiceTimeConflict(
    serviceId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<any> {
    this.logger.log(`🔍 Checking SERVICE time conflict for service ${serviceId}: ${startTime.toISOString()} - ${endTime.toISOString()}`);
    
    // Sprawdź konflikty z istniejącymi rezerwacjami tej samej usługi
    const bookingConflicts = await this.prisma.bookings.findMany({
      where: {
        serviceId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (bookingConflicts.length > 0) {
      this.logger.log(`❌ Found SERVICE booking conflict: ${JSON.stringify(bookingConflicts[0])}`);
      return {
        ...bookingConflicts[0],
        isServiceConflict: true,
      };
    }
    
    this.logger.log(`✅ No SERVICE conflicts found - time slot is available`);
    return null;
  }

  async remove(tenantId: string, id: string) {
    // Sprawdź czy rezerwacja istnieje i należy do tenanta
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: { customers: true },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    if (booking.customers?.tenantId !== tenantId) {
      throw new NotFoundException('Rezerwacja nie znaleziona');
    }

    // 🎫 Zwrot wizyty na karnet przed usunięciem rezerwacji
    try {
      const refundedPass = await this.passesService.refundPassUsage(id);
      if (refundedPass) {
        this.logger.log(`Zwrócono wizytę na karnet dla usuniętej rezerwacji ${id}`);
      }
    } catch (err) {
      this.logger.error(`Błąd zwrotu karnetu: ${err.message}`);
    }

    await this.prisma.bookings.delete({ where: { id } });
    return { message: 'Rezerwacja została usunięta' };
  }

  /**
   * Pobierz rezerwacje dla danej usługi (do sprawdzania dostępności na frontendzie)
   * Zwraca aktualne i przyszłe rezerwacje dla elastycznych usług
   */
  async getBookingsForService(tenantId: string, serviceId: string) {
    this.logger.log(`Getting bookings for service: ${serviceId}, tenant: ${tenantId}`);
    
    const now = new Date();
    // Pobierz rezerwacje które jeszcze trwają lub są w przyszłości (do 3 miesięcy)
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    // Pobierz usługę żeby sprawdzić czy to usługa całodniowa (allowMultiDay)
    const service = await this.prisma.services.findUnique({
      where: { id: serviceId },
      select: { allowMultiDay: true },
    });
    const isFullDayService = service?.allowMultiDay === true;
    
    const bookings = await this.prisma.bookings.findMany({
      where: {
        serviceId,
        status: { not: 'CANCELLED' },
        // Rezerwacja jest aktualna jeśli: endTime > now (jeszcze trwa lub w przyszłości)
        endTime: { gt: now },
        // I startTime < 3 miesiące w przód
        startTime: { lt: threeMonthsLater },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
      orderBy: { startTime: 'asc' },
    });
    
    this.logger.log(`Found ${bookings.length} bookings for service ${serviceId} (isFullDayService=${isFullDayService}): ${JSON.stringify(bookings.map(b => ({ start: b.startTime, end: b.endTime })))}`);
    
    return {
      bookings: bookings.map(b => {
        // Sprawdź czy rezerwacja jest całodniowa na podstawie czasu trwania
        // Rezerwacja jest całodniowa jeśli trwa >= 8 godzin (480 minut)
        const durationMs = b.endTime.getTime() - b.startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const isFullDay = durationHours >= 8;
        
        return {
          startTime: b.startTime.toISOString(),
          endTime: b.endTime.toISOString(),
          // Oznacz jako całodniową tylko jeśli rezerwacja trwa >= 8 godzin
          isFullDay,
        };
      }),
      isFullDayService,
    };
  }

  async checkAvailability(tenantId: string, serviceId: string, employeeId: string, date: string, customDuration?: number) {
    this.logger.log(`Checking availability for tenant: ${tenantId}, service: ${serviceId}, employee: ${employeeId}, date: ${date}, customDuration: ${customDuration}`);
    
    // 📅 Sprawdź limit wyprzedzenia rezerwacji
    const tenantForAdvance = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { pageSettings: true },
    });
    
    const pageSettings = (tenantForAdvance?.pageSettings as any) || {};
    const bookingAdvanceDays = pageSettings.bookingAdvanceDays || 0; // 0 = bez limitu
    
    if (bookingAdvanceDays > 0) {
      const requestedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + bookingAdvanceDays);
      maxDate.setHours(23, 59, 59, 999);
      
      if (requestedDate > maxDate) {
        const maxDateStr = maxDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
        return { 
          available: false, 
          availableSlots: [], 
          message: `Rezerwacja możliwa tylko do ${bookingAdvanceDays} dni w przód (do ${maxDateStr})`,
          bookingAdvanceDays,
          maxBookingDate: maxDate.toISOString().split('T')[0],
        };
      }
    }
    
    // Pobierz usługę
    const service = await this.prisma.services.findUnique({
      where: { id: serviceId },
      include: { service_employees: true }, // Pobierz przypisanych pracowników
    });
    
    if (!service) {
      this.logger.warn(`Service not found: ${serviceId}`);
      return { available: false, availableSlots: [], message: 'Usługa nie znaleziona' };
    }
    
    const serviceDuration = customDuration || service.duration || 60;
    const bookingDate = new Date(date);
    const dayOfWeek = this.getDayOfWeek(bookingDate);
    
    // Pobierz bufor z usługi (tylko jeśli skonfigurowany > 0)
    const bufferBefore = service.bufferBefore || 0;
    const bufferAfter = service.bufferAfter || 0;
    this.logger.log(`Service buffer: before=${bufferBefore}min, after=${bufferAfter}min`);
    
    // Pobierz pracowników przypisanych do tej usługi
    const assignedEmployeeIds = service.service_employees?.map(es => es.employeeId) || [];
    this.logger.log(`Service ${serviceId} has ${assignedEmployeeIds.length} assigned employees: ${assignedEmployeeIds.join(', ')}`);
    
    // ========================================
    // PRZYPADEK 1: Usługa BEZ przypisanych pracowników
    // → Używamy godzin pracy firmy, konflikty po usłudze
    // ========================================
    if (assignedEmployeeIds.length === 0) {
      this.logger.log(`Service has NO employees - using company hours, checking service conflicts`);
      return this.checkServiceOnlyAvailability(tenantId, serviceId, date, serviceDuration, bookingDate, dayOfWeek, bufferBefore, bufferAfter);
    }
    
    // ========================================
    // PRZYPADEK 2: Usługa Z pracownikami + wybrano "any" (dowolny)
    // → Sprawdź WSZYSTKICH pracowników, pokaż slot jeśli KTÓRYKOLWIEK jest wolny
    // ========================================
    if (!employeeId || employeeId === 'any' || employeeId === '') {
      this.logger.log(`Employee "any" selected - checking ALL assigned employees`);
      return this.checkAnyEmployeeAvailability(tenantId, serviceId, assignedEmployeeIds, date, serviceDuration, bookingDate, dayOfWeek, bufferBefore, bufferAfter);
    }
    
    // ========================================
    // PRZYPADEK 3: Usługa Z pracownikami + wybrano KONKRETNEGO pracownika
    // → Sprawdź tylko tego pracownika
    // ========================================
    this.logger.log(`Specific employee ${employeeId} selected - checking only this employee`);
    return this.checkSingleEmployeeAvailability(tenantId, employeeId, date, serviceDuration, bookingDate, dayOfWeek, bufferBefore, bufferAfter);
  }

  /**
   * PRZYPADEK 1: Usługa BEZ pracowników
   * Używa godzin pracy firmy, sprawdza konflikty po usłudze
   */
  private async checkServiceOnlyAvailability(
    tenantId: string,
    serviceId: string,
    date: string,
    serviceDuration: number,
    bookingDate: Date,
    dayOfWeek: string,
    bufferBefore: number = 0,
    bufferAfter: number = 0
  ) {
    // Pobierz godziny pracy firmy
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { openingHours: true },
    });
    
    let openingHours: any = tenant?.openingHours;
    if (typeof openingHours === 'string') {
      try { openingHours = JSON.parse(openingHours); } catch (e) { openingHours = null; }
    }
    
    const dayKey = dayOfWeek.toLowerCase();
    const dayConfig = openingHours?.[dayKey] || openingHours?.[dayOfWeek] || { open: '09:00', close: '17:00', closed: false };
    
    if (dayConfig.closed) {
      return { available: false, availableSlots: [], message: 'Zamknięte w tym dniu' };
    }
    
    const openTime = dayConfig.open || '09:00';
    const closeTime = dayConfig.close || '17:00';
    
    // Pobierz istniejące rezerwacje dla tej USŁUGI w tym dniu
    const startOfDay = new Date(bookingDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate); endOfDay.setHours(23, 59, 59, 999);
    
    const existingBookings = await this.prisma.bookings.findMany({
      where: {
        serviceId, // Sprawdzamy po USŁUDZE
        status: { not: 'CANCELLED' },
        AND: [{ startTime: { lte: endOfDay } }, { endTime: { gte: startOfDay } }],
      },
      select: { startTime: true, endTime: true },
    });
    
    // Pobierz wydarzenia z zewnętrznego kalendarza (Google Calendar iCal)
    const externalEvents = await this.prisma.external_calendar_events.findMany({
      where: {
        tenantId,
        OR: [
          { startTime: { gte: startOfDay, lte: endOfDay } },
          { endTime: { gte: startOfDay, lte: endOfDay } },
          { startTime: { lte: startOfDay }, endTime: { gte: endOfDay } },
        ],
      },
      select: { startTime: true, endTime: true },
    });
    
    this.logger.log(`Service-only ${serviceId} for ${date}: ${existingBookings.length} bookings, ${externalEvents.length} external events`);
    if (externalEvents.length > 0) {
      this.logger.log(`External events for ${date}: ${JSON.stringify(externalEvents.map(e => ({ start: e.startTime, end: e.endTime })))}`);
    }
    
    return this.generateSlots(bookingDate, openTime, closeTime, serviceDuration, existingBookings, [], [], 'service', bufferBefore, bufferAfter, externalEvents);
  }

  /**
   * PRZYPADEK 2: Usługa Z pracownikami + "any" (dowolny)
   * Sprawdza WSZYSTKICH pracowników, slot dostępny jeśli KTÓRYKOLWIEK jest wolny
   */
  private async checkAnyEmployeeAvailability(
    tenantId: string,
    serviceId: string,
    employeeIds: string[],
    date: string,
    serviceDuration: number,
    bookingDate: Date,
    dayOfWeek: string,
    bufferBefore: number = 0,
    bufferAfter: number = 0
  ) {
    const allSlots: Map<string, { time: string; available: boolean; employeeId: string; employees: { employeeId: string; name: string }[] }> = new Map();
    
    // Sprawdź każdego pracownika
    for (const empId of employeeIds) {
      const empResult = await this.checkSingleEmployeeAvailability(tenantId, empId, date, serviceDuration, bookingDate, dayOfWeek, bufferBefore, bufferAfter);
      
      // Pobierz dane pracownika
      const employee = await this.prisma.employees.findUnique({
        where: { id: empId },
        select: { firstName: true, lastName: true },
      });
      const empName = employee ? `${employee.firstName} ${employee.lastName}` : empId;
      
      for (const slot of empResult.availableSlots) {
        if (allSlots.has(slot.time)) {
          // Slot już istnieje - dodaj tego pracownika do listy
          const existing = allSlots.get(slot.time)!;
          existing.employees.push({ employeeId: empId, name: empName });
        } else {
          // Nowy slot
          allSlots.set(slot.time, {
            time: slot.time,
            available: true,
            employeeId: empId, // Pierwszy dostępny pracownik
            employees: [{ employeeId: empId, name: empName }],
          });
        }
      }
    }
    
    // Konwertuj mapę na tablicę i posortuj
    const availableSlots = Array.from(allSlots.values()).sort((a, b) => a.time.localeCompare(b.time));
    
    this.logger.log(`Any-employee: Generated ${availableSlots.length} slots from ${employeeIds.length} employees`);
    
    return {
      available: availableSlots.length > 0,
      availableSlots,
      serviceDuration,
    };
  }

  /**
   * PRZYPADEK 3: Konkretny pracownik
   * Sprawdza tylko tego pracownika - obsługuje wielokrotne przedziały godzin pracy
   */
  private async checkSingleEmployeeAvailability(
    tenantId: string,
    employeeId: string,
    date: string,
    serviceDuration: number,
    bookingDate: Date,
    dayOfWeek: string,
    bufferBefore: number = 0,
    bufferAfter: number = 0
  ) {
    const dayOfWeekEnum = dayOfWeek.toUpperCase() as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    
    // Pobierz WSZYSTKIE przedziały dostępności pracownika w tym dniu (wielokrotne przedziały)
    const employeeAvailabilities = await this.prisma.availability.findMany({
      where: {
        employeeId,
        dayOfWeek: dayOfWeekEnum,
        specificDate: null,
        isActive: true,
      },
      orderBy: { startTime: 'asc' },
    });
    
    // Sprawdź czy pracownik ma JAKĄKOLWIEK zdefiniowaną dostępność
    const anyAvailability = await this.prisma.availability.findFirst({
      where: { employeeId, specificDate: null, isActive: true },
    });
    
    // Tablica przedziałów godzin pracy
    let workingTimeSlots: { openTime: string; closeTime: string }[] = [];
    
    if (anyAvailability) {
      // Pracownik ma zdefiniowaną dostępność
      if (employeeAvailabilities.length === 0) {
        // Nie pracuje w tym dniu
        return { available: false, availableSlots: [], message: `Pracownik nie pracuje w ${this.getDayNamePL(dayOfWeek)}` };
      }
      // Użyj wszystkich przedziałów z bazy
      workingTimeSlots = employeeAvailabilities.map(a => ({
        openTime: a.startTime,
        closeTime: a.endTime,
      }));
    } else {
      // Brak zdefiniowanej dostępności - użyj godzin firmy
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        select: { openingHours: true },
      });
      
      let openingHours: any = tenant?.openingHours;
      if (typeof openingHours === 'string') {
        try { openingHours = JSON.parse(openingHours); } catch (e) { openingHours = null; }
      }
      
      const dayKey = dayOfWeek.toLowerCase();
      const dayConfig = openingHours?.[dayKey] || openingHours?.[dayOfWeek] || { open: '09:00', close: '17:00', closed: false };
      
      if (dayConfig.closed) {
        return { available: false, availableSlots: [], message: 'Zamknięte w tym dniu' };
      }
      
      workingTimeSlots = [{ openTime: dayConfig.open || '09:00', closeTime: dayConfig.close || '17:00' }];
    }
    
    const startOfDay = new Date(bookingDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate); endOfDay.setHours(23, 59, 59, 999);
    
    // Pobierz rezerwacje pracownika
    const existingBookings = await this.prisma.bookings.findMany({
      where: {
        employeeId,
        status: { not: 'CANCELLED' },
        AND: [{ startTime: { lte: endOfDay } }, { endTime: { gte: startOfDay } }],
      },
      select: { startTime: true, endTime: true },
    });
    
    // Pobierz urlopy/blokady
    const timeBlocks = await this.prisma.time_blocks.findMany({
      where: {
        employeeId,
        AND: [{ startTime: { lte: endOfDay } }, { endTime: { gte: startOfDay } }],
      },
      select: { startTime: true, endTime: true },
    });
    
    // Pobierz zajęcia grupowe
    const groupBookings = await this.prisma.group_bookings.findMany({
      where: {
        employeeId,
        status: { in: ['OPEN', 'FULL'] },
        AND: [{ startTime: { lte: endOfDay } }, { endTime: { gte: startOfDay } }],
      },
      select: { startTime: true, endTime: true },
    });
    
    // Pobierz wydarzenia z zewnętrznego kalendarza (Google Calendar iCal)
    const externalEvents = await this.prisma.external_calendar_events.findMany({
      where: {
        tenantId,
        OR: [
          { startTime: { gte: startOfDay, lte: endOfDay } },
          { endTime: { gte: startOfDay, lte: endOfDay } },
          { startTime: { lte: startOfDay }, endTime: { gte: endOfDay } },
        ],
      },
      select: { startTime: true, endTime: true },
    });
    
    this.logger.log(`Single-employee ${employeeId} for ${date}: ${existingBookings.length} bookings, ${timeBlocks.length} blocks, ${groupBookings.length} group bookings, ${externalEvents.length} external events, ${workingTimeSlots.length} time slots`);
    
    // Generuj sloty dla każdego przedziału godzin pracy i połącz wyniki
    const allSlots: { time: string; available: boolean; employeeId: string }[] = [];
    
    for (const slot of workingTimeSlots) {
      const result = this.generateSlots(
        bookingDate, 
        slot.openTime, 
        slot.closeTime, 
        serviceDuration, 
        existingBookings, 
        timeBlocks, 
        groupBookings, 
        employeeId, 
        bufferBefore, 
        bufferAfter, 
        externalEvents
      );
      allSlots.push(...result.availableSlots);
    }
    
    // Usuń duplikaty i posortuj
    const uniqueSlots = allSlots.filter((slot, index, self) => 
      index === self.findIndex(s => s.time === slot.time)
    ).sort((a, b) => a.time.localeCompare(b.time));
    
    return {
      available: uniqueSlots.length > 0,
      availableSlots: uniqueSlots,
      serviceDuration,
      workingTimeSlots, // Dodaj info o przedziałach pracy
    };
  }

  /**
   * Generuje sloty czasowe i sprawdza konflikty
   * @param bufferBefore - bufor przed rezerwacją (w minutach) - tylko jeśli skonfigurowany
   * @param bufferAfter - bufor po rezerwacji (w minutach) - tylko jeśli skonfigurowany
   * @param externalEvents - wydarzenia z zewnętrznego kalendarza (Google Calendar iCal)
   */
  private generateSlots(
    bookingDate: Date,
    openTime: string,
    closeTime: string,
    serviceDuration: number,
    bookings: { startTime: Date; endTime: Date }[],
    timeBlocks: { startTime: Date; endTime: Date }[],
    groupBookings: { startTime: Date; endTime: Date }[],
    employeeId: string,
    bufferBefore: number = 0,
    bufferAfter: number = 0,
    externalEvents: { startTime: Date; endTime: Date }[] = []
  ) {
    const availableSlots: { time: string; available: boolean; employeeId: string }[] = [];
    
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    // Interwał slotów - używamy czasu trwania usługi, nie sztywnych 15 minut
    // Dla usług krótszych niż 30 min - sloty co czas trwania usługi
    // Dla dłuższych - sloty co 30 minut
    const slotInterval = serviceDuration <= 30 ? serviceDuration : 30;
    
    let currentHour = openHour;
    let currentMin = openMin;
    const now = new Date();
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const slotStart = new Date(bookingDate);
      slotStart.setHours(currentHour, currentMin, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);
      
      const closeDateTime = new Date(bookingDate);
      closeDateTime.setHours(closeHour, closeMin, 0, 0);
      
      if (slotEnd > closeDateTime) break;
      
      // Sprawdź konflikty z uwzględnieniem bufora (tylko jeśli skonfigurowany)
      const hasBookingConflict = bookings.some(b => {
        const bookingStart = new Date(b.startTime);
        const bookingEnd = new Date(b.endTime);
        
        // Dodaj bufor do istniejących rezerwacji (jeśli skonfigurowany)
        const bufferedStart = new Date(bookingStart.getTime() - bufferBefore * 60 * 1000);
        const bufferedEnd = new Date(bookingEnd.getTime() + bufferAfter * 60 * 1000);
        
        return slotStart < bufferedEnd && slotEnd > bufferedStart;
      });
      
      const hasTimeOffConflict = timeBlocks.some(b => slotStart < new Date(b.endTime) && slotEnd > new Date(b.startTime));
      const hasGroupConflict = groupBookings.some(b => slotStart < new Date(b.endTime) && slotEnd > new Date(b.startTime));
      const hasExternalConflict = externalEvents.some(b => slotStart < new Date(b.endTime) && slotEnd > new Date(b.startTime));
      const isPast = slotStart < now;
      
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      if (!hasBookingConflict && !hasTimeOffConflict && !hasGroupConflict && !hasExternalConflict && !isPast) {
        availableSlots.push({ time: timeString, available: true, employeeId });
      }
      
      currentMin += slotInterval;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    
    return {
      available: availableSlots.length > 0,
      availableSlots,
      serviceDuration,
      openTime,
      closeTime,
    };
  }

  async createPublicBooking(data: any) {
    this.logger.log(`Creating public booking with data: ${JSON.stringify({
      tenantId: data.tenantId,
      serviceId: data.serviceId,
      employeeId: data.employeeId,
      date: data.date,
      time: data.time,
      customerName: data.customerName,
    })}`);
    
    const tenantId = data.tenantId;
    
    // 📅 Sprawdź limit wyprzedzenia rezerwacji
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { pageSettings: true },
    });
    
    const pageSettings = (tenant?.pageSettings as any) || {};
    const bookingAdvanceDays = pageSettings.bookingAdvanceDays || 0; // 0 = bez limitu
    
    if (bookingAdvanceDays > 0) {
      const bookingDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + bookingAdvanceDays);
      maxDate.setHours(23, 59, 59, 999);
      
      if (bookingDate > maxDate) {
        const maxDateStr = maxDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
        throw new BadRequestException(
          `Rezerwacja możliwa tylko do ${bookingAdvanceDays} dni w przód (maksymalnie do ${maxDateStr})`
        );
      }
      this.logger.log(`📅 Booking advance check passed: ${bookingDate.toISOString()} <= ${maxDate.toISOString()}`);
    }
    
    // Pobierz usługę z przypisanymi pracownikami
    const serviceForCheck = await this.prisma.services.findUnique({
      where: { id: data.serviceId },
      include: { service_employees: true },
    });
    
    const assignedEmployeeIds = serviceForCheck?.service_employees?.map(es => es.employeeId) || [];
    const hasAssignedEmployees = assignedEmployeeIds.length > 0;
    
    // Walidacja employeeId
    if (!data.employeeId || data.employeeId === 'any' || data.employeeId === '') {
      if (!hasAssignedEmployees) {
        // Usługa BEZ pracowników - nie wymagamy pracownika
        data.employeeId = 'any';
        this.logger.log(`Service has NO employees - no employee required`);
      } else {
        // Usługa Z pracownikami + "any" - znajdź pierwszego wolnego z przypisanych
        // Na razie użyj pierwszego przypisanego (slot już był sprawdzony w checkAvailability)
        data.employeeId = assignedEmployeeIds[0];
        this.logger.log(`Service has employees, auto-assigned first: ${data.employeeId}`);
      }
    }
    
    // Rozdziel imię i nazwisko
    const nameParts = (data.customerName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Znajdź lub utwórz klienta
    let customer = await this.prisma.customers.findFirst({
      where: {
        tenantId,
        phone: data.customerPhone,
      },
    });
    
    if (!customer) {
      // Utwórz nowego klienta ze zgodami
      customer = await this.prisma.customers.create({
        data: {
          id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          firstName,
          lastName,
          phone: data.customerPhone,
          email: data.customerEmail || null,
          // Zgody RODO i marketingowe
          rodo_consent: data.rodoConsent || false,
          rodo_consent_date: data.rodoConsent ? new Date() : null,
          marketing_consent: data.marketingConsent || false,
          marketing_consent_date: data.marketingConsent ? new Date() : null,
          marketing_consent_text: data.marketingConsentText || null,
          updatedAt: new Date(),
        },
      });
      this.logger.log(`Created new customer: ${customer.id} with consents`);
    } else {
      // Zaktualizuj zgody istniejącego klienta (jeśli wyraził nowe)
      const updateData: any = { updatedAt: new Date() };
      
      if (data.rodoConsent && !customer.rodo_consent) {
        updateData.rodo_consent = true;
        updateData.rodo_consent_date = new Date();
      }
      if (data.marketingConsent && !customer.marketing_consent) {
        updateData.marketing_consent = true;
        updateData.marketing_consent_date = new Date();
        updateData.marketing_consent_text = data.marketingConsentText;
      }
      
      if (Object.keys(updateData).length > 1) {
        customer = await this.prisma.customers.update({
          where: { id: customer.id },
          data: updateData,
        });
        this.logger.log(`Updated customer consents: ${customer.id}`);
      }
    }
    
    // Pobierz usługę żeby obliczyć czas końcowy
    const service = await this.prisma.services.findUnique({
      where: { id: data.serviceId },
    });
    
    if (!service) {
      throw new BadRequestException('Usługa nie znaleziona');
    }
    
    // Oblicz czas rozpoczęcia i zakończenia
    const [hours, minutes] = data.time.split(':').map(Number);
    const startTime = new Date(data.date);
    startTime.setHours(hours, minutes, 0, 0);
    
    let endTime: Date;
    let basePrice = Number(service.basePrice) || 0;
    
    // Dla rezerwacji całodniowych (allowMultiDay) - użyj endDate i godzin zamknięcia firmy
    if (data.endDate && service.allowMultiDay) {
      // Pobierz godziny pracy firmy żeby ustawić prawidłowy czas końcowy
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        select: { openingHours: true },
      });
      
      let closeTime = '22:00'; // Domyślna godzina zamknięcia
      if (tenant?.openingHours) {
        let openingHours: any = tenant.openingHours;
        if (typeof openingHours === 'string') {
          try { openingHours = JSON.parse(openingHours); } catch (e) { /* ignore */ }
        }
        // Pobierz godzinę zamknięcia dla dnia końcowego
        const endDate = new Date(data.endDate);
        const dayOfWeek = this.getDayOfWeek(endDate).toLowerCase();
        const dayConfig = openingHours?.[dayOfWeek];
        if (dayConfig && !dayConfig.closed && dayConfig.close) {
          closeTime = dayConfig.close;
        }
      }
      
      // Ustaw czas końcowy na godzinę zamknięcia firmy
      const [closeHour, closeMin] = closeTime.split(':').map(Number);
      endTime = new Date(data.endDate);
      endTime.setHours(closeHour, closeMin, 0, 0);
      
      this.logger.log(`Multi-day booking: endDate=${data.endDate}, closeTime=${closeTime}, endTime=${endTime.toISOString()}`);
      
      // Oblicz cenę za dni
      if (service.pricePerDay) {
        const start = new Date(data.date);
        const end = new Date(data.endDate);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        basePrice = days * Number(service.pricePerDay);
        this.logger.log(`Multi-day booking: ${days} days × ${service.pricePerDay} = ${basePrice}`);
      }
    } else {
      // Dla rezerwacji godzinowych - użyj duration
      const bookingDuration = data.duration || service.duration || 60;
      endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + bookingDuration);
      
      // Oblicz cenę - dla elastycznych usług użyj pricePerHour
      if (service.flexibleDuration && service.pricePerHour && data.duration) {
        basePrice = (data.duration / 60) * Number(service.pricePerHour);
      }
    }
    const discountAmount = data.discountAmount ? Number(data.discountAmount) : 0;
    
    this.logger.log(`Creating booking with coupon: ${data.couponCode}, discount: ${discountAmount}, basePrice: ${basePrice}`);
    
    // Utwórz rezerwację
    const booking = await this.create(tenantId, {
      customerId: customer.id,
      serviceId: data.serviceId,
      employeeId: data.employeeId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalPrice: basePrice,
      couponCode: data.couponCode || null,
      discountAmount: discountAmount,
      notes: data.customerNotes || data.notes || null, // Uwagi od klienta
      packageId: data.packageId || null, // Przekaż packageId jeśli to rezerwacja pakietu
      // Tracking who created the booking - for public bookings it's the customer
      createdById: customer.id,
      createdByType: 'customer',
      createdByName: `${firstName} ${lastName}`.trim() || 'Klient',
    });
    
    // Jeśli wymagana jest zaliczka, zaktualizuj rezerwację
    if (data.depositRequired && data.depositAmount > 0) {
      await this.prisma.$executeRaw`
        UPDATE bookings 
        SET deposit_required = true,
            deposit_amount = ${data.depositAmount},
            deposit_status = 'pending'
        WHERE id = ${booking.id}
      `;
      this.logger.log(`Deposit required for booking ${booking.id}: ${data.depositAmount} PLN`);
    }
    
    // 📧 Wyślij email potwierdzający rezerwację do klienta
    if (data.customerEmail) {
      try {
        // Pobierz dane firmy
        const tenant = await this.prisma.tenants.findUnique({
          where: { id: tenantId },
          select: { name: true, address: true, phone: true, subdomain: true },
        });
        
        // Pobierz dane pracownika
        let employeeName = 'Dowolny specjalista';
        if (data.employeeId && data.employeeId !== 'any') {
          const employee = await this.prisma.employees.findUnique({
            where: { id: data.employeeId },
            select: { firstName: true, lastName: true },
          });
          if (employee) employeeName = `${employee.firstName} ${employee.lastName || ''}`.trim();
        }
        
        const region = this.getRegion();
        const dateFormatted = this.formatDate(startTime, region);
        const timeFormatted = this.formatTime(startTime, region);
        
        await this.emailService.sendBookingConfirmation({
          to: data.customerEmail,
          customerName: data.customerName,
          serviceName: service.name,
          employeeName,
          date: dateFormatted,
          time: timeFormatted,
          duration: data.duration || service.duration || 60,
          price: basePrice.toFixed(2),
          businessName: tenant?.name || 'Firma',
          businessAddress: tenant?.address || undefined,
          businessPhone: tenant?.phone || undefined,
          bookingId: booking.id,
          cancelUrl: tenant?.subdomain ? `https://${tenant.subdomain}.rezerwacja24.pl/cancel?id=${booking.id}` : undefined,
        });
        
        this.logger.log(`📧 Email potwierdzający wysłany do: ${data.customerEmail}`);
      } catch (emailError) {
        this.logger.error(`❌ Błąd wysyłania emaila potwierdzającego: ${emailError}`);
        // Nie przerywamy - rezerwacja została utworzona
      }
    }
    
    return booking;
  }

  private getDayOfWeek(date: Date): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  }

  private getDayNamePL(dayOfWeek: string): string {
    const daysMap: Record<string, string> = {
      'SUNDAY': 'niedzielę',
      'MONDAY': 'poniedziałek',
      'TUESDAY': 'wtorek',
      'WEDNESDAY': 'środę',
      'THURSDAY': 'czwartek',
      'FRIDAY': 'piątek',
      'SATURDAY': 'sobotę',
    };
    return daysMap[dayOfWeek.toUpperCase()] || dayOfWeek;
  }

  /**
   * Tworzy powiadomienie dla właściciela firmy
   */
  private async createBookingNotification(
    tenantId: string,
    type: 'BOOKING' | 'REMINDER' | 'CUSTOMER' | 'PAYMENT' | 'ALERT' | 'SUCCESS' | 'INFO',
    title: string,
    message: string,
    bookingId?: string
  ) {
    try {
      // Pobierz właściciela firmy (ownerId)
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        select: { ownerId: true },
      });

      if (!tenant?.ownerId) {
        this.logger.warn(`Nie znaleziono właściciela dla tenant ${tenantId}`);
        return;
      }

      await this.notificationsService.create({
        tenantId,
        userId: tenant.ownerId,
        type,
        title,
        message,
        actionUrl: bookingId ? `/dashboard/bookings?id=${bookingId}` : undefined,
        metadata: bookingId ? { bookingId } : undefined,
      });

      this.logger.log(`🔔 Utworzono powiadomienie: ${title}`);
    } catch (error) {
      this.logger.error(`Błąd tworzenia powiadomienia: ${error}`);
    }
  }
}
