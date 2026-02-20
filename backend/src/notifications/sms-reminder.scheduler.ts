import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { FlySMSService } from './flysms.service';
import { SMSTemplatesService } from './sms-templates.service';

@Injectable()
export class SMSReminderScheduler implements OnModuleInit {
  private readonly logger = new Logger(SMSReminderScheduler.name);

  constructor(
    private prisma: PrismaService,
    private flySMSService: FlySMSService,
    private smsTemplatesService: SMSTemplatesService,
  ) {}

  onModuleInit() {
    this.logger.log('📅 SMS Reminder Scheduler initialized');
  }

  /**
   * Wysyłaj przypomnienia SMS co godzinę
   * Sprawdza rezerwacje na następne 24-48h i wysyła przypomnienia
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendSMSReminders() {
    this.logger.log('🔔 Running SMS reminder check...');

    try {
      // Pobierz wszystkich tenantów z włączonymi przypomnieniami
      const tenants = await this.prisma.tenants.findMany({
        where: {
          sms_settings: {
            path: ['reminderEnabled'],
            equals: true,
          },
        },
        select: {
          id: true,
          name: true,
          subdomain: true,
          sms_settings: true,
          sms_templates: true,
        },
      });

      this.logger.log(`Found ${tenants.length} tenants with SMS reminders enabled`);

      for (const tenant of tenants) {
        await this.processReminderForTenant(tenant);
      }

      this.logger.log('✅ SMS reminder check completed');
    } catch (error) {
      this.logger.error('❌ Error in SMS reminder scheduler:', error);
    }
  }

  /**
   * Przetwórz przypomnienia dla jednego tenanta
   */
  private async processReminderForTenant(tenant: any) {
    const settings = tenant.sms_settings || {};
    const templates = tenant.sms_templates || {};
    
    const now = new Date();
    
    // Przypomnienie 24h przed
    if (settings.reminder24hEnabled !== false) {
      const reminder24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23h od teraz
      const reminder24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25h od teraz
      
      await this.sendRemindersForTimeRange(
        tenant,
        reminder24hStart,
        reminder24hEnd,
        'reminder_24h',
        templates
      );
    }

    // Drugie przypomnienie (konfigurowalne - domyślnie 2h przed wizytą)
    if (settings.reminder2hEnabled === true) {
      const hoursBefore = settings.reminder2hHoursBefore || 2;
      const reminder2hStart = new Date(now.getTime() + (hoursBefore - 0.5) * 60 * 60 * 1000);
      const reminder2hEnd = new Date(now.getTime() + (hoursBefore + 0.5) * 60 * 60 * 1000);
      
      await this.sendRemindersForTimeRange(
        tenant,
        reminder2hStart,
        reminder2hEnd,
        'reminder_2h',
        templates
      );
    }
  }

  /**
   * Wyślij przypomnienia dla rezerwacji w danym zakresie czasowym
   */
  private async sendRemindersForTimeRange(
    tenant: any,
    startTime: Date,
    endTime: Date,
    reminderType: 'reminder_24h' | 'reminder_2h',
    templates: any
  ) {
    // Pobierz rezerwacje w danym zakresie czasowym
    const bookings = await this.prisma.bookings.findMany({
      where: {
        customers: {
          tenantId: tenant.id,
        },
        startTime: {
          gte: startTime,
          lte: endTime,
        },
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
        // Sprawdź czy przypomnienie nie zostało już wysłane
        OR: [
          { internalNotes: null },
          { internalNotes: { not: { contains: reminderType } } },
        ],
      },
      include: {
        customers: true,
        services: true,
        employees: true,
      },
    });

    this.logger.log(`Found ${bookings.length} bookings for ${reminderType} reminders (tenant: ${tenant.name})`);

    for (const booking of bookings) {
      try {
        if (!booking.customers?.phone) {
          this.logger.warn(`Booking ${booking.id} has no customer phone`);
          continue;
        }

        // Przygotuj dane do szablonu
        const bookingDate = new Date(booking.startTime);
        const dateStr = bookingDate.toLocaleDateString('pl-PL', { 
          day: 'numeric', 
          month: 'long' 
        });
        const timeStr = bookingDate.toLocaleTimeString('pl-PL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        // Generuj link do odwołania
        const frontendUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';
        const cancelUrl = tenant.subdomain 
          ? `${frontendUrl}/${tenant.subdomain}/cancel/${booking.id}` 
          : undefined;

        // Użyj szablonu przypomnienia
        const message = this.smsTemplatesService.getReminderTemplate({
          serviceName: booking.services?.name || 'Wizyta',
          businessName: tenant.name || 'Firma',
          date: dateStr,
          time: timeStr,
          cancelUrl,
          bookingId: booking.id,
          subdomain: tenant.subdomain,
        }, 'pl', templates);

        // Wyślij SMS
        const result = await this.flySMSService.sendSMS(
          tenant.id,
          booking.customers.phone,
          message,
          'reminder'
        );

        if (result.success) {
          // Oznacz że przypomnienie zostało wysłane
          const existingNotes = booking.internalNotes 
            ? JSON.parse(booking.internalNotes) 
            : {};
          
          await this.prisma.bookings.update({
            where: { id: booking.id },
            data: {
              internalNotes: JSON.stringify({
                ...existingNotes,
                [reminderType]: new Date().toISOString(),
              }),
            },
          });

          this.logger.log(`✅ Sent ${reminderType} SMS for booking ${booking.id}`);
        } else {
          this.logger.warn(`❌ Failed to send ${reminderType} SMS for booking ${booking.id}: ${result.message}`);
        }
      } catch (error) {
        this.logger.error(`Error sending reminder for booking ${booking.id}:`, error);
      }
    }
  }

  /**
   * Ręczne uruchomienie sprawdzania przypomnień (do testów)
   */
  async triggerManualCheck() {
    this.logger.log('🔧 Manual SMS reminder check triggered');
    await this.sendSMSReminders();
    return { success: true, message: 'SMS reminder check completed' };
  }
}
