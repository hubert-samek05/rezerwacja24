import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';

interface CalendarEvent {
  externalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

@Injectable()
export class ExternalCalendarService {
  private readonly logger = new Logger(ExternalCalendarService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Synchronizuj kalendarze co 5 minut
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncAllCalendars() {
    this.logger.log('🔄 Starting external calendar sync...');

    try {
      // Pobierz wszystkich tenantów z włączoną synchronizacją iCal
      const tenants = await this.prisma.tenants.findMany({
        where: {
          google_calendar_ical_enabled: true,
          google_calendar_ical_url: { not: null },
        },
        select: {
          id: true,
          name: true,
          google_calendar_ical_url: true,
        },
      });

      this.logger.log(`Found ${tenants.length} tenants with iCal sync enabled`);

      for (const tenant of tenants) {
        try {
          await this.syncTenantCalendar(tenant.id, tenant.google_calendar_ical_url!);
        } catch (error) {
          this.logger.error(`Error syncing calendar for tenant ${tenant.id}:`, error);
        }
      }

      this.logger.log('✅ External calendar sync completed');
    } catch (error) {
      this.logger.error('❌ Error in external calendar sync:', error);
    }
  }

  /**
   * Synchronizuj kalendarz dla konkretnego tenanta
   */
  async syncTenantCalendar(tenantId: string, icalUrl: string): Promise<{ success: boolean; eventsCount: number; error?: string }> {
    this.logger.log(`Syncing calendar for tenant ${tenantId}`);

    try {
      // Pobierz dane iCal
      const response = await fetch(icalUrl, {
        headers: {
          'User-Agent': 'Rezerwacja24/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch iCal: ${response.status} ${response.statusText}`);
      }

      const icalData = await response.text();
      const events = this.parseICalData(icalData);

      this.logger.log(`Parsed ${events.length} events from iCal`);

      // Usuń stare wydarzenia i dodaj nowe (w transakcji)
      await this.prisma.$transaction(async (tx) => {
        // Usuń wydarzenia starsze niż 30 dni wstecz
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await tx.external_calendar_events.deleteMany({
          where: {
            tenantId,
            endTime: { lt: thirtyDaysAgo },
          },
        });

        // Upsert wydarzeń (tylko przyszłe i do 90 dni w przód)
        const now = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

        for (const event of events) {
          // Filtruj tylko wydarzenia w zakresie czasowym
          if (event.endTime < thirtyDaysAgo || event.startTime > ninetyDaysFromNow) {
            continue;
          }

          await tx.external_calendar_events.upsert({
            where: {
              tenantId_externalId: {
                tenantId,
                externalId: event.externalId,
              },
            },
            create: {
              tenantId,
              externalId: event.externalId,
              title: event.title,
              startTime: event.startTime,
              endTime: event.endTime,
              allDay: event.allDay,
              source: 'google_ical',
            },
            update: {
              title: event.title,
              startTime: event.startTime,
              endTime: event.endTime,
              allDay: event.allDay,
            },
          });
        }
      });

      // Zaktualizuj datę ostatniej synchronizacji
      await this.prisma.tenants.update({
        where: { id: tenantId },
        data: { google_calendar_ical_last_sync: new Date() },
      });

      return { success: true, eventsCount: events.length };
    } catch (error) {
      this.logger.error(`Error syncing calendar for tenant ${tenantId}:`, error);
      return { success: false, eventsCount: 0, error: error.message };
    }
  }

  /**
   * Parsuj dane iCal i zwróć listę wydarzeń (prosty parser regex)
   */
  private parseICalData(icalData: string): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    try {
      // Podziel na wydarzenia
      const eventBlocks = icalData.split('BEGIN:VEVENT');
      
      for (let i = 1; i < eventBlocks.length; i++) {
        const block = eventBlocks[i].split('END:VEVENT')[0];
        
        try {
          // Wyciągnij pola
          const uid = this.extractICalField(block, 'UID');
          const summary = this.extractICalField(block, 'SUMMARY');
          const dtstart = this.extractICalField(block, 'DTSTART');
          const dtend = this.extractICalField(block, 'DTEND');
          
          if (!dtstart) continue;
          
          const startDate = this.parseICalDate(dtstart);
          const endDate = dtend ? this.parseICalDate(dtend) : new Date(startDate.getTime() + 60 * 60 * 1000);
          
          if (!startDate || isNaN(startDate.getTime())) continue;
          
          // Sprawdź czy to wydarzenie całodniowe (format YYYYMMDD bez czasu)
          const allDay = dtstart.length === 8 || dtstart.includes('VALUE=DATE');

          events.push({
            externalId: uid || `${startDate.getTime()}-${summary || 'event'}`,
            title: summary || 'Zajęty',
            startTime: startDate,
            endTime: endDate,
            allDay,
          });
        } catch (eventError) {
          this.logger.warn('Error parsing single event:', eventError);
        }
      }
    } catch (error) {
      this.logger.error('Error parsing iCal data:', error);
    }

    return events;
  }

  /**
   * Wyciągnij pole z bloku iCal
   */
  private extractICalField(block: string, fieldName: string): string {
    // Obsłuż różne formaty: DTSTART:20250101T120000Z, DTSTART;VALUE=DATE:20250101
    const regex = new RegExp(`${fieldName}[;:]([^\\r\\n]+)`, 'i');
    const match = block.match(regex);
    if (!match) return '';
    
    // Usuń parametry (np. VALUE=DATE:)
    let value = match[1];
    if (value.includes(':')) {
      value = value.split(':').pop() || value;
    }
    return value.trim();
  }

  /**
   * Parsuj datę z formatu iCal
   */
  private parseICalDate(dateStr: string): Date {
    // Format: 20250101T120000Z lub 20250101
    const cleanDate = dateStr.replace(/[^0-9TZ]/g, '');
    
    if (cleanDate.length === 8) {
      // Tylko data: YYYYMMDD
      const year = parseInt(cleanDate.substring(0, 4));
      const month = parseInt(cleanDate.substring(4, 6)) - 1;
      const day = parseInt(cleanDate.substring(6, 8));
      return new Date(year, month, day);
    } else if (cleanDate.length >= 15) {
      // Data i czas: YYYYMMDDTHHMMSS lub YYYYMMDDTHHMMSSZ
      const year = parseInt(cleanDate.substring(0, 4));
      const month = parseInt(cleanDate.substring(4, 6)) - 1;
      const day = parseInt(cleanDate.substring(6, 8));
      const hour = parseInt(cleanDate.substring(9, 11));
      const minute = parseInt(cleanDate.substring(11, 13));
      const second = parseInt(cleanDate.substring(13, 15));
      
      if (cleanDate.endsWith('Z')) {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }
      return new Date(year, month, day, hour, minute, second);
    }
    
    return new Date(dateStr);
  }

  /**
   * Pobierz wydarzenia z zewnętrznego kalendarza dla danego tenanta i zakresu dat
   */
  async getExternalEvents(tenantId: string, startDate: Date, endDate: Date) {
    return this.prisma.external_calendar_events.findMany({
      where: {
        tenantId,
        OR: [
          // Wydarzenia które zaczynają się w zakresie
          {
            startTime: { gte: startDate, lte: endDate },
          },
          // Wydarzenia które kończą się w zakresie
          {
            endTime: { gte: startDate, lte: endDate },
          },
          // Wydarzenia które obejmują cały zakres
          {
            startTime: { lte: startDate },
            endTime: { gte: endDate },
          },
        ],
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Sprawdź czy dany slot czasowy koliduje z wydarzeniem z zewnętrznego kalendarza
   */
  async isSlotBlocked(tenantId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const conflictingEvent = await this.prisma.external_calendar_events.findFirst({
      where: {
        tenantId,
        OR: [
          // Wydarzenie zaczyna się w trakcie slotu
          {
            startTime: { gte: startTime, lt: endTime },
          },
          // Wydarzenie kończy się w trakcie slotu
          {
            endTime: { gt: startTime, lte: endTime },
          },
          // Wydarzenie obejmuje cały slot
          {
            startTime: { lte: startTime },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    return !!conflictingEvent;
  }

  /**
   * Włącz synchronizację kalendarza dla tenanta
   */
  async enableSync(tenantId: string, icalUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Waliduj URL
      if (!icalUrl.includes('calendar.google.com') && !icalUrl.includes('.ics')) {
        return { success: false, error: 'Nieprawidłowy link do kalendarza. Użyj linku iCal z Google Calendar.' };
      }

      // Spróbuj pobrać kalendarz żeby sprawdzić czy URL jest poprawny
      const response = await fetch(icalUrl, {
        headers: { 'User-Agent': 'Rezerwacja24/1.0' },
      });

      if (!response.ok) {
        return { success: false, error: `Nie można pobrać kalendarza: ${response.status}` };
      }

      const icalData = await response.text();
      if (!icalData.includes('BEGIN:VCALENDAR')) {
        return { success: false, error: 'Podany link nie zawiera danych kalendarza iCal.' };
      }

      // Zapisz URL i włącz synchronizację
      await this.prisma.tenants.update({
        where: { id: tenantId },
        data: {
          google_calendar_ical_url: icalUrl,
          google_calendar_ical_enabled: true,
        },
      });

      // Wykonaj pierwszą synchronizację
      const syncResult = await this.syncTenantCalendar(tenantId, icalUrl);

      return { success: true, ...syncResult };
    } catch (error) {
      this.logger.error(`Error enabling sync for tenant ${tenantId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Wyłącz synchronizację kalendarza dla tenanta
   */
  async disableSync(tenantId: string): Promise<void> {
    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        google_calendar_ical_enabled: false,
      },
    });

    // Usuń wszystkie wydarzenia z zewnętrznego kalendarza
    await this.prisma.external_calendar_events.deleteMany({
      where: { tenantId },
    });
  }

  /**
   * Pobierz status synchronizacji dla tenanta
   */
  async getSyncStatus(tenantId: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: {
        google_calendar_ical_url: true,
        google_calendar_ical_enabled: true,
        google_calendar_ical_last_sync: true,
      },
    });

    const eventsCount = await this.prisma.external_calendar_events.count({
      where: { tenantId },
    });

    return {
      enabled: tenant?.google_calendar_ical_enabled || false,
      url: tenant?.google_calendar_ical_url || null,
      lastSync: tenant?.google_calendar_ical_last_sync || null,
      eventsCount,
    };
  }
}
