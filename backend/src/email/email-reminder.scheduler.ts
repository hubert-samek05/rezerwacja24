import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailReminderScheduler implements OnModuleInit {
  private readonly logger = new Logger(EmailReminderScheduler.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log('📧 Email Reminder Scheduler initialized');
  }

  /**
   * Wysyłaj przypomnienia email co godzinę
   * Sprawdza rezerwacje na następne 24h i wysyła przypomnienia
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendEmailReminders() {
    this.logger.log('📧 Running email reminder check...');

    try {
      const now = new Date();
      
      // Przypomnienie 24h przed wizytą
      const reminder24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23h od teraz
      const reminder24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25h od teraz

      // Pobierz rezerwacje do przypomnienia
      const bookings = await this.prisma.bookings.findMany({
        where: {
          startTime: {
            gte: reminder24hStart,
            lte: reminder24hEnd,
          },
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
          // Sprawdź czy przypomnienie email nie zostało już wysłane
          NOT: {
            internalNotes: {
              contains: 'email_reminder_24h',
            },
          },
        },
        include: {
          customers: true,
          services: true,
          employees: true,
        },
      });

      this.logger.log(`Found ${bookings.length} bookings for email reminders`);

      for (const booking of bookings) {
        await this.sendReminderEmail(booking);
      }

      this.logger.log('✅ Email reminder check completed');
    } catch (error) {
      this.logger.error('❌ Error in email reminder scheduler:', error);
    }
  }

  /**
   * Wyślij email przypominający o wizycie
   */
  private async sendReminderEmail(booking: any) {
    try {
      // Sprawdź czy klient ma email
      if (!booking.customers?.email) {
        this.logger.debug(`Booking ${booking.id} has no customer email`);
        return;
      }

      // Pobierz dane firmy
      const tenant = await this.prisma.tenants.findFirst({
        where: {
          employees: {
            some: { id: booking.employeeId || '' },
          },
        },
        select: { 
          id: true,
          name: true, 
          address: true, 
          phone: true, 
          subdomain: true,
        },
      });

      // Fallback - pobierz przez customera
      let tenantData = tenant;
      if (!tenantData && booking.customers?.tenantId) {
        tenantData = await this.prisma.tenants.findUnique({
          where: { id: booking.customers.tenantId },
          select: { 
            id: true,
            name: true, 
            address: true, 
            phone: true, 
            subdomain: true,
          },
        });
      }

      if (!tenantData) {
        this.logger.warn(`Could not find tenant for booking ${booking.id}`);
        return;
      }

      // Przygotuj dane
      const bookingDate = new Date(booking.startTime);
      const dateStr = bookingDate.toLocaleDateString('pl-PL', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric',
      });
      const timeStr = bookingDate.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const hoursUntil = Math.round((bookingDate.getTime() - Date.now()) / (1000 * 60 * 60));

      const customerName = booking.customers.firstName 
        ? `${booking.customers.firstName} ${booking.customers.lastName || ''}`.trim()
        : 'Kliencie';

      // Wyślij email
      const success = await this.emailService.sendBookingReminder({
        to: booking.customers.email,
        customerName,
        serviceName: booking.services?.name || 'Wizyta',
        employeeName: booking.employees ? `${booking.employees.firstName} ${booking.employees.lastName || ''}`.trim() : 'Specjalista',
        date: dateStr,
        time: timeStr,
        duration: booking.services?.duration || 60,
        businessName: tenantData.name || 'Firma',
        businessAddress: tenantData.address || undefined,
        businessPhone: tenantData.phone || undefined,
        hoursUntil,
        cancelUrl: tenantData.subdomain 
          ? `https://${tenantData.subdomain}.rezerwacja24.pl/cancel?id=${booking.id}` 
          : undefined,
      });

      if (success) {
        // Oznacz że przypomnienie zostało wysłane
        let existingNotes: any = {};
        try {
          if (booking.internalNotes) {
            existingNotes = JSON.parse(booking.internalNotes);
          }
        } catch (e) {
          existingNotes = { raw: booking.internalNotes };
        }
        
        await this.prisma.bookings.update({
          where: { id: booking.id },
          data: {
            internalNotes: JSON.stringify({
              ...existingNotes,
              email_reminder_24h: new Date().toISOString(),
            }),
          },
        });

        this.logger.log(`✅ Sent email reminder for booking ${booking.id} to ${booking.customers.email}`);
      } else {
        this.logger.warn(`❌ Failed to send email reminder for booking ${booking.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending email reminder for booking ${booking.id}:`, error);
    }
  }

  /**
   * Ręczne uruchomienie sprawdzania przypomnień (do testów)
   */
  async triggerManualCheck() {
    this.logger.log('🔧 Manual email reminder check triggered');
    await this.sendEmailReminders();
    return { success: true, message: 'Email reminder check completed' };
  }
}
