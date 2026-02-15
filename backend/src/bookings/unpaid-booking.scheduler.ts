import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UnpaidBookingScheduler implements OnModuleInit {
  private readonly logger = new Logger(UnpaidBookingScheduler.name);

  // Domyślny czas na opłacenie rezerwacji (w minutach)
  private readonly DEFAULT_PAYMENT_TIMEOUT_MINUTES = 30;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.logger.log('💳 Unpaid Booking Scheduler initialized');
  }

  /**
   * Sprawdzaj nieopłacone rezerwacje co 5 minut
   * Anuluje rezerwacje które przekroczyły limit czasu na płatność
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUnpaidBookings() {
    this.logger.log('🔍 Checking for unpaid bookings...');

    try {
      const now = new Date();

      // Pobierz wszystkie rezerwacje które:
      // 1. Mają status PENDING (oczekujące)
      // 2. Wymagają płatności online (paymentMethod != 'cash')
      // 3. Nie są opłacone (paymentStatus != 'paid')
      // 4. Zostały utworzone więcej niż X minut temu
      const unpaidBookings = await this.prisma.bookings.findMany({
        where: {
          status: 'PENDING',
          paymentMethod: {
            not: 'cash',
          },
          paymentStatus: {
            not: 'paid',
          },
          // Rezerwacja musi być starsza niż timeout
          createdAt: {
            lt: new Date(now.getTime() - this.DEFAULT_PAYMENT_TIMEOUT_MINUTES * 60 * 1000),
          },
          // Nie anuluj rezerwacji które już się odbyły lub odbędą się w ciągu godziny
          startTime: {
            gt: new Date(now.getTime() + 60 * 60 * 1000), // min 1h w przyszłości
          },
        },
        include: {
          customers: true,
          services: true,
          employees: true,
        },
      });

      this.logger.log(`Found ${unpaidBookings.length} unpaid bookings to process`);

      for (const booking of unpaidBookings) {
        await this.processUnpaidBooking(booking);
      }

      this.logger.log('✅ Unpaid bookings check completed');
    } catch (error) {
      this.logger.error('❌ Error in unpaid booking scheduler:', error);
    }
  }

  /**
   * Przetwórz pojedynczą nieopłaconą rezerwację
   */
  private async processUnpaidBooking(booking: any) {
    try {
      const tenantId = booking.customers?.tenantId;
      if (!tenantId) {
        this.logger.warn(`Booking ${booking.id} has no tenant`);
        return;
      }

      // Pobierz ustawienia tenanta (może mieć własny timeout)
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          ownerId: true,
          paymentTimeoutMinutes: true,
        },
      });

      if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} not found`);
        return;
      }

      // Użyj timeout z ustawień tenanta lub domyślny
      const timeoutMinutes = (tenant as any).paymentTimeoutMinutes || this.DEFAULT_PAYMENT_TIMEOUT_MINUTES;
      const bookingAge = (Date.now() - new Date(booking.createdAt).getTime()) / (60 * 1000);

      // Sprawdź czy rezerwacja przekroczyła timeout
      if (bookingAge < timeoutMinutes) {
        return; // Jeszcze nie minął czas
      }

      this.logger.log(`⏰ Booking ${booking.id} exceeded payment timeout (${Math.round(bookingAge)} min > ${timeoutMinutes} min)`);

      // Anuluj rezerwację
      await this.prisma.bookings.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'expired',
          internalNotes: JSON.stringify({
            ...(booking.internalNotes ? JSON.parse(booking.internalNotes) : {}),
            cancelledReason: 'payment_timeout',
            cancelledAt: new Date().toISOString(),
            cancelledBy: 'system',
          }),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`🚫 Cancelled unpaid booking ${booking.id}`);

      // Usuń event z Google Calendar jeśli istnieje
      if (booking.google_calendar_event_id) {
        // TODO: Wywołaj GoogleCalendarService.deleteEvent
        this.logger.log(`📅 Should delete Google Calendar event: ${booking.google_calendar_event_id}`);
      }

      // Wyślij powiadomienie do właściciela firmy
      if (tenant.ownerId) {
        const customerName = `${booking.customers?.firstName || ''} ${booking.customers?.lastName || ''}`.trim() || 'Klient';
        const serviceName = booking.services?.name || 'Usługa';
        const bookingDate = new Date(booking.startTime).toLocaleString('pl-PL', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });

        await this.notificationsService.create({
          tenantId,
          userId: tenant.ownerId,
          type: 'ALERT',
          title: 'Rezerwacja anulowana - brak płatności',
          message: `Rezerwacja ${customerName} na ${serviceName} (${bookingDate}) została automatycznie anulowana z powodu braku płatności w ciągu ${timeoutMinutes} minut.`,
          actionUrl: `/dashboard/bookings?id=${booking.id}`,
          metadata: { bookingId: booking.id, reason: 'payment_timeout' },
        });

        this.logger.log(`🔔 Sent notification to owner about cancelled booking ${booking.id}`);
      }

    } catch (error) {
      this.logger.error(`Error processing unpaid booking ${booking.id}:`, error);
    }
  }

  /**
   * Wysyłaj ostrzeżenia o zbliżającym się timeout płatności
   * Uruchamiane co 10 minut
   */
  @Cron('*/10 * * * *')
  async sendPaymentReminders() {
    try {
      const now = new Date();

      // Znajdź rezerwacje które:
      // 1. Są nieopłacone
      // 2. Zostały utworzone 20-25 minut temu (5-10 min do timeout)
      // 3. Nie wysłano jeszcze przypomnienia o płatności
      const bookingsNearTimeout = await this.prisma.bookings.findMany({
        where: {
          status: 'PENDING',
          paymentMethod: {
            not: 'cash',
          },
          paymentStatus: {
            not: 'paid',
          },
          createdAt: {
            gte: new Date(now.getTime() - 25 * 60 * 1000), // max 25 min temu
            lte: new Date(now.getTime() - 20 * 60 * 1000), // min 20 min temu
          },
          NOT: {
            internalNotes: {
              contains: 'payment_reminder_sent',
            },
          },
        },
        include: {
          customers: true,
          services: true,
        },
      });

      for (const booking of bookingsNearTimeout) {
        // Oznacz że wysłano przypomnienie (żeby nie wysyłać wielokrotnie)
        const existingNotes = booking.internalNotes 
          ? JSON.parse(booking.internalNotes) 
          : {};
        
        await this.prisma.bookings.update({
          where: { id: booking.id },
          data: {
            internalNotes: JSON.stringify({
              ...existingNotes,
              payment_reminder_sent: new Date().toISOString(),
            }),
          },
        });

        // TODO: Można tu dodać wysyłanie SMS/email z przypomnieniem o płatności
        this.logger.log(`⚠️ Payment reminder marked for booking ${booking.id}`);
      }
    } catch (error) {
      this.logger.error('Error sending payment reminders:', error);
    }
  }

  /**
   * Ręczne uruchomienie sprawdzania (do testów)
   */
  async triggerManualCheck() {
    this.logger.log('🔧 Manual unpaid booking check triggered');
    await this.checkUnpaidBookings();
    return { success: true, message: 'Unpaid booking check completed' };
  }
}
