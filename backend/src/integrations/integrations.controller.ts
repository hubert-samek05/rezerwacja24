import { Controller, Get, Post, Param, Query, Res, Header, Req, Delete, Body } from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';
import { ExternalCalendarService } from './external-calendar.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private prisma: PrismaService,
    private externalCalendarService: ExternalCalendarService,
  ) {}

  private getRedirectUri() {
    return `${process.env.API_URL || 'https://api.rezerwacja24.pl'}/api/integrations/google-calendar/callback`;
  }

  /**
   * GET /api/integrations/google-calendar/auth
   * Zwraca URL do OAuth Google Calendar
   */
  @Get('google-calendar/auth')
  getGoogleCalendarAuthUrl(@Req() req: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const redirectUri = this.getRedirectUri();
    const scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';
    
    // Przekaż tenantId w state
    const tenantId = req.headers['x-tenant-id'] as string || '';
    const state = Buffer.from(JSON.stringify({ tenantId })).toString('base64');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;
    
    return { authUrl };
  }

  /**
   * GET /api/integrations/google-calendar/callback
   * Callback po autoryzacji Google
   */
  @Get('google-calendar/callback')
  async googleCalendarCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';
    
    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=${error}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=no_code`);
    }

    try {
      // Dekoduj state żeby uzyskać tenantId
      let tenantId = '';
      if (state) {
        try {
          const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
          tenantId = decoded.tenantId;
        } catch (e) {
          console.error('Error decoding state:', e);
        }
      }

      // Wymień code na tokeny
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: this.getRedirectUri(),
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token exchange error:', errorData);
        return res.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=token_exchange_failed`);
      }

      const tokens = await tokenResponse.json();
      
      // Pobierz email użytkownika
      let userEmail = '';
      if (tokens.access_token) {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          userEmail = userInfo.email || '';
        }
      }

      // Zapisz tokeny w bazie
      if (tenantId) {
        await this.prisma.tenants.update({
          where: { id: tenantId },
          data: {
            google_calendar_access_token: tokens.access_token,
            google_calendar_refresh_token: tokens.refresh_token,
            google_calendar_email: userEmail,
            google_calendar_connected_at: new Date(),
          },
        });
      }

      return res.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&success=google_calendar`);
    } catch (err) {
      console.error('Google Calendar callback error:', err);
      return res.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=callback_failed`);
    }
  }

  /**
   * GET /api/integrations/google-calendar/status
   * Sprawdza status połączenia z Google Calendar
   */
  @Get('google-calendar/status')
  async getGoogleCalendarStatus(@Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return { connected: false, email: null };
    }

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: {
        google_calendar_access_token: true,
        google_calendar_email: true,
        google_calendar_connected_at: true,
      },
    });

    return {
      connected: !!tenant?.google_calendar_access_token,
      email: tenant?.google_calendar_email || null,
      connectedAt: tenant?.google_calendar_connected_at || null,
    };
  }

  /**
   * DELETE /api/integrations/google-calendar/disconnect
   * Rozłącza integrację z Google Calendar
   */
  @Delete('google-calendar/disconnect')
  async disconnectGoogleCalendar(@Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return { success: false, error: 'No tenant ID' };
    }

    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        google_calendar_access_token: null,
        google_calendar_refresh_token: null,
        google_calendar_email: null,
        google_calendar_connected_at: null,
      },
    });

    return { success: true };
  }

  // ============================================
  // Google Calendar iCal Link Integration
  // ============================================

  /**
   * GET /api/integrations/google-calendar-ical/status
   * Pobiera status integracji przez link iCal
   */
  @Get('google-calendar-ical/status')
  async getICalStatus(@Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return { enabled: false, url: null, lastSync: null, eventsCount: 0 };
    }

    return this.externalCalendarService.getSyncStatus(tenantId);
  }

  /**
   * POST /api/integrations/google-calendar-ical/enable
   * Włącza synchronizację przez link iCal
   */
  @Post('google-calendar-ical/enable')
  async enableICalSync(@Req() req: Request, @Body() body: { url: string }) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return { success: false, error: 'No tenant ID' };
    }

    if (!body.url) {
      return { success: false, error: 'URL is required' };
    }

    return this.externalCalendarService.enableSync(tenantId, body.url);
  }

  /**
   * DELETE /api/integrations/google-calendar-ical/disable
   * Wyłącza synchronizację przez link iCal
   */
  @Delete('google-calendar-ical/disable')
  async disableICalSync(@Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return { success: false, error: 'No tenant ID' };
    }

    await this.externalCalendarService.disableSync(tenantId);
    return { success: true };
  }

  /**
   * POST /api/integrations/google-calendar-ical/sync
   * Ręczna synchronizacja kalendarza
   */
  @Post('google-calendar-ical/sync')
  async manualSync(@Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return { success: false, error: 'No tenant ID' };
    }

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { google_calendar_ical_url: true, google_calendar_ical_enabled: true },
    });

    if (!tenant?.google_calendar_ical_enabled || !tenant?.google_calendar_ical_url) {
      return { success: false, error: 'iCal sync not enabled' };
    }

    return this.externalCalendarService.syncTenantCalendar(tenantId, tenant.google_calendar_ical_url);
  }
}

/**
 * Kontroler dla kalendarza iCal (Apple Calendar, Outlook, etc.)
 */
@Controller('calendar')
export class CalendarController {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /api/calendar/external-events
   * Pobiera wydarzenia z zewnętrznego kalendarza (Google Calendar iCal) dla panelu
   */
  @Get('external-events')
  async getExternalEvents(@Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return [];
    }

    // Pobierz wydarzenia z ostatnich 30 dni i 90 dni w przód
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const events = await this.prisma.external_calendar_events.findMany({
      where: {
        tenantId,
        startTime: { gte: thirtyDaysAgo, lte: ninetyDaysFromNow },
      },
      orderBy: { startTime: 'asc' },
    });

    return events;
  }

  /**
   * GET /api/calendar/ical/:tenantId
   * Zwraca kalendarz w formacie iCal dla danego tenanta
   */
  @Get('ical/:tenantId')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="rezerwacja24.ics"')
  async getICalFeed(@Param('tenantId') tenantId: string, @Res() res: Response) {
    try {
      // Pobierz tenant
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).send('Tenant not found');
      }

      // Pobierz rezerwacje dla tego tenanta (ostatnie 30 dni + przyszłe)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const bookings = await this.prisma.bookings.findMany({
        where: {
          startTime: { gte: thirtyDaysAgo },
          status: { in: ['CONFIRMED', 'PENDING', 'COMPLETED'] },
          customers: {
            tenantId: tenantId,
          },
        },
        include: {
          customers: true,
          services: true,
          employees: true,
        },
        orderBy: { startTime: 'asc' },
      });

      // Generuj iCal
      const icalContent = this.generateICal(tenant.name, bookings);
      
      res.set('Content-Type', 'text/calendar; charset=utf-8');
      res.send(icalContent);
    } catch (error) {
      console.error('iCal error:', error);
      res.status(500).send('Error generating calendar');
    }
  }

  private generateICal(calendarName: string, bookings: any[]): string {
    const now = new Date();
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rezerwacja24//Calendar//PL
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${calendarName} - Rezerwacje
X-WR-TIMEZONE:Europe/Warsaw
`;

    for (const booking of bookings) {
      const uid = `${booking.id}@rezerwacja24.pl`;
      const summary = `${booking.services?.name || 'Rezerwacja'} - ${booking.customers?.firstName || ''} ${booking.customers?.lastName || ''}`;
      const description = [
        `Klient: ${booking.customers?.firstName || ''} ${booking.customers?.lastName || ''}`,
        `Telefon: ${booking.customers?.phone || 'brak'}`,
        `Email: ${booking.customers?.email || 'brak'}`,
        `Usługa: ${booking.services?.name || 'brak'}`,
        `Pracownik: ${booking.employees?.firstName || ''} ${booking.employees?.lastName || ''}`,
        `Cena: ${booking.totalPrice} PLN`,
        booking.customerNotes ? `Notatki: ${booking.customerNotes}` : '',
      ].filter(Boolean).join('\\n');

      ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(new Date(booking.startTime))}
DTEND:${formatDate(new Date(booking.endTime))}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:${booking.status === 'CONFIRMED' ? 'CONFIRMED' : booking.status === 'CANCELLED' ? 'CANCELLED' : 'TENTATIVE'}
END:VEVENT
`;
    }

    ical += 'END:VCALENDAR';
    return ical;
  }
}
