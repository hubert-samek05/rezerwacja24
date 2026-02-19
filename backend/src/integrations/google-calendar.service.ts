import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

interface CalendarEvent {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  colorId?: string; // Google Calendar color ID (1-11)
}

// Google Calendar Color IDs:
// 1 = Lavender (fioletowy)
// 2 = Sage (zielony)
// 3 = Grape (ciemny fiolet)
// 4 = Flamingo (różowy)
// 5 = Banana (żółty)
// 6 = Tangerine (pomarańczowy)
// 7 = Peacock (turkusowy)
// 8 = Graphite (szary)
// 9 = Blueberry (niebieski)
// 10 = Basil (ciemny zielony)
// 11 = Tomato (czerwony) - używamy dla NO_SHOW

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Sprawdza czy tenant ma połączenie z Google Calendar
   */
  async isConnected(tenantId: string): Promise<boolean> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { google_calendar_access_token: true },
    });
    return !!tenant?.google_calendar_access_token;
  }

  /**
   * Pobiera tokeny Google Calendar dla tenanta
   */
  async getTokens(tenantId: string): Promise<GoogleTokens | null> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: {
        google_calendar_access_token: true,
        google_calendar_refresh_token: true,
      },
    });

    if (!tenant?.google_calendar_access_token) {
      return null;
    }

    return {
      access_token: tenant.google_calendar_access_token,
      refresh_token: tenant.google_calendar_refresh_token || '',
    };
  }

  /**
   * Odświeża access token jeśli wygasł
   */
  async refreshAccessToken(tenantId: string, refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        this.logger.error(`Failed to refresh token: ${await response.text()}`);
        return null;
      }

      const data = await response.json();
      
      // Zapisz nowy access token
      await this.prisma.tenants.update({
        where: { id: tenantId },
        data: { google_calendar_access_token: data.access_token },
      });

      return data.access_token;
    } catch (error) {
      this.logger.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Wykonuje request do Google Calendar API z automatycznym odświeżaniem tokena
   */
  private async googleCalendarRequest(
    tenantId: string,
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<any> {
    const tokens = await this.getTokens(tenantId);
    if (!tokens) {
      this.logger.warn(`No Google Calendar tokens for tenant ${tenantId}`);
      return null;
    }

    let accessToken = tokens.access_token;

    // Pierwsza próba
    let response = await fetch(
      `https://www.googleapis.com/calendar/v3${endpoint}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    );

    // Jeśli token wygasł, odśwież i spróbuj ponownie
    if (response.status === 401 && tokens.refresh_token) {
      this.logger.log('Access token expired, refreshing...');
      const newToken = await this.refreshAccessToken(tenantId, tokens.refresh_token);
      
      if (newToken) {
        accessToken = newToken;
        response = await fetch(
          `https://www.googleapis.com/calendar/v3${endpoint}`,
          {
            method,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
          },
        );
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Google Calendar API error: ${response.status} - ${errorText}`);
      return null;
    }

    // DELETE zwraca 204 bez body
    if (response.status === 204) {
      return { success: true };
    }

    return response.json();
  }

  /**
   * Tworzy event w Google Calendar
   * Zwraca ID eventu lub null jeśli nie udało się
   */
  async createEvent(tenantId: string, event: CalendarEvent): Promise<string | null> {
    try {
      const googleEvent = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'Europe/Warsaw',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'Europe/Warsaw',
        },
        location: event.location,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      };

      const result = await this.googleCalendarRequest(
        tenantId,
        'POST',
        '/calendars/primary/events',
        googleEvent,
      );

      if (result?.id) {
        this.logger.log(`Created Google Calendar event: ${result.id}`);
        return result.id;
      }

      return null;
    } catch (error) {
      this.logger.error('Error creating Google Calendar event:', error);
      return null;
    }
  }

  /**
   * Aktualizuje event w Google Calendar
   */
  async updateEvent(
    tenantId: string,
    eventId: string,
    event: CalendarEvent,
  ): Promise<boolean> {
    try {
      const googleEvent: any = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'Europe/Warsaw',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'Europe/Warsaw',
        },
        location: event.location,
      };
      
      // Dodaj kolor jeśli podany
      if (event.colorId) {
        googleEvent.colorId = event.colorId;
      }

      const result = await this.googleCalendarRequest(
        tenantId,
        'PATCH',
        `/calendars/primary/events/${eventId}`,
        googleEvent,
      );

      if (result) {
        this.logger.log(`Updated Google Calendar event: ${eventId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error updating Google Calendar event:', error);
      return false;
    }
  }

  /**
   * Usuwa event z Google Calendar
   */
  async deleteEvent(tenantId: string, eventId: string): Promise<boolean> {
    try {
      const result = await this.googleCalendarRequest(
        tenantId,
        'DELETE',
        `/calendars/primary/events/${eventId}`,
      );

      if (result) {
        this.logger.log(`Deleted Google Calendar event: ${eventId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error deleting Google Calendar event:', error);
      return false;
    }
  }

  /**
   * Tworzy event dla rezerwacji
   */
  async createBookingEvent(
    tenantId: string,
    booking: {
      id: string;
      startTime: Date;
      endTime: Date;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      serviceName: string;
      employeeName: string;
      notes?: string;
      totalPrice?: number;
    },
  ): Promise<string | null> {
    const description = [
      `👤 Klient: ${booking.customerName}`,
      booking.customerPhone ? `📱 Tel: ${booking.customerPhone}` : '',
      booking.customerEmail ? `📧 Email: ${booking.customerEmail}` : '',
      `💇 Usługa: ${booking.serviceName}`,
      `👨‍💼 Pracownik: ${booking.employeeName}`,
      booking.totalPrice ? `💰 Cena: ${booking.totalPrice} PLN` : '',
      booking.notes ? `📝 Notatki: ${booking.notes}` : '',
      '',
      `🔗 ID rezerwacji: ${booking.id}`,
    ]
      .filter(Boolean)
      .join('\n');

    return this.createEvent(tenantId, {
      summary: `${booking.serviceName} - ${booking.customerName}`,
      description,
      startTime: new Date(booking.startTime),
      endTime: new Date(booking.endTime),
    });
  }
}
