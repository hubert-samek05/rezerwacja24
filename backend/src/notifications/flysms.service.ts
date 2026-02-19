import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import axios from 'axios';

export interface SMSResponse {
  success: boolean;
  message?: string;
  balance?: number;
}

@Injectable()
export class FlySMSService {
  private readonly logger = new Logger(FlySMSService.name);
  private readonly apiKey: string;
  private readonly sender: string;
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('FLYSMS_API_KEY');
    this.sender = this.configService.get<string>('FLYSMS_SENDER') || 'InfoSMS';
    this.apiUrl = this.configService.get<string>('FLYSMS_API_URL') || 'https://sms-fly.pl/api/v2/api.php';
  }

  /**
   * 🔒 BEZPIECZEŃSTWO: Sprawdź limit SMS dla tenanta
   */
  async checkSMSLimit(tenantId: string): Promise<{ canSend: boolean; remaining: number }> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_usage: true },
    });

    if (!tenant || !tenant.sms_usage) {
      // Inicjalizuj domyślne wartości
      await this.initializeSMSUsage(tenantId);
      return { canSend: true, remaining: 500 };
    }

    const usage = tenant.sms_usage as any;
    const used = usage.used || 0;
    const limit = usage.limit || 500;
    const remaining = limit - used;

    return {
      canSend: remaining > 0,
      remaining,
    };
  }

  /**
   * Inicjalizuj licznik SMS dla nowego tenanta
   */
  private async initializeSMSUsage(tenantId: string) {
    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        sms_usage: {
          used: 0,
          limit: 500,
          lastReset: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * 🔒 BEZPIECZEŃSTWO: Sprawdź ustawienia SMS dla tenanta
   */
  async getSMSSettings(tenantId: string): Promise<any> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_settings: true },
    });

    if (!tenant || !tenant.sms_settings) {
      // Domyślne ustawienia - wszystko włączone
      return {
        confirmedEnabled: true,
        rescheduledEnabled: true,
        reminderEnabled: true,
        cancelledEnabled: true,
      };
    }

    return tenant.sms_settings;
  }

  /**
   * Normalizuj numer telefonu do formatu międzynarodowego
   */
  private normalizePhone(phone: string): string {
    // Usuń wszystkie znaki oprócz cyfr
    let normalized = phone.replace(/\D/g, '');

    // Jeśli zaczyna się od 48, zostaw
    if (normalized.startsWith('48')) {
      return normalized;
    }

    // Jeśli zaczyna się od 0, zamień na 48
    if (normalized.startsWith('0')) {
      return '48' + normalized.substring(1);
    }

    // Jeśli ma 9 cyfr, dodaj 48
    if (normalized.length === 9) {
      return '48' + normalized;
    }

    return normalized;
  }

  /**
   * 📱 WYSYŁANIE SMS - główna funkcja
   */
  async sendSMS(
    tenantId: string,
    phone: string,
    message: string,
    type: 'confirmed' | 'rescheduled' | 'reminder' | 'cancelled',
  ): Promise<SMSResponse> {
    try {
      // 1. Sprawdź ustawienia - czy ten typ SMS jest włączony
      const settings = await this.getSMSSettings(tenantId);
      const typeKey = `${type}Enabled`;
      
      if (!settings[typeKey]) {
        this.logger.log(`SMS type '${type}' is disabled for tenant ${tenantId}`);
        return { success: false, message: 'SMS type disabled' };
      }

      // 2. Sprawdź limit SMS
      const { canSend, remaining } = await this.checkSMSLimit(tenantId);
      
      if (!canSend) {
        this.logger.warn(`SMS limit exceeded for tenant ${tenantId}`);
        return { success: false, message: 'SMS limit exceeded' };
      }

      // 3. Ostrzeżenie jeśli mało SMS
      if (remaining <= 50) {
        this.logger.warn(`⚠️ Low SMS balance for tenant ${tenantId}: ${remaining} remaining`);
      }

      // 4. Normalizuj numer telefonu
      const normalizedPhone = this.normalizePhone(phone);

      // 5. Wyślij SMS przez SMSFly API
      const response = await axios.post(
        this.apiUrl,
        {
          auth: {
            key: this.apiKey,
          },
          action: 'SENDMESSAGE',
          data: {
            recipient: normalizedPhone,
            channels: ['sms'],
            sms: {
              source: this.sender,
              text: message,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 sekund timeout
        },
      );

      // 6. Sprawdź odpowiedź
      this.logger.log(`📡 SMSFly Response: ${JSON.stringify(response.data)}`);
      
      if (response.data && response.data.success) {
        // 7. Zwiększ licznik użytych SMS
        await this.incrementSMSUsage(tenantId);

        this.logger.log(`✅ SMS sent to ${normalizedPhone} for tenant ${tenantId} (type: ${type})`);
        return { success: true, message: 'SMS sent successfully' };
      } else {
        this.logger.error(`❌ SMS sending failed: ${JSON.stringify(response.data)}`);
        return { success: false, message: 'SMS sending failed' };
      }
    } catch (error) {
      this.logger.error(`❌ Error sending SMS: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Response status: ${error.response.status}`);
      }
      return { success: false, message: error.message };
    }
  }

  /**
   * Zwiększ licznik użytych SMS
   */
  private async incrementSMSUsage(tenantId: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_usage: true },
    });

    const usage = (tenant.sms_usage as any) || { used: 0, limit: 500 };
    usage.used = (usage.used || 0) + 1;

    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: { sms_usage: usage },
    });
  }

  /**
   * Pobierz status SMS dla tenanta
   */
  async getSMSStatus(tenantId: string): Promise<{ used: number; limit: number; remaining: number }> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_usage: true },
    });

    if (!tenant || !tenant.sms_usage) {
      await this.initializeSMSUsage(tenantId);
      return { used: 0, limit: 500, remaining: 500 };
    }

    const usage = tenant.sms_usage as any;
    const used = usage.used || 0;
    const limit = usage.limit || 500;

    return {
      used,
      limit,
      remaining: limit - used,
    };
  }

  /**
   * Zakup dodatkowych SMS (100 SMS = 1 pakiet)
   */
  async purchaseSMS(tenantId: string, packages: number): Promise<{ success: boolean; newLimit: number }> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { sms_usage: true },
    });

    const usage = (tenant.sms_usage as any) || { used: 0, limit: 500 };
    usage.limit = (usage.limit || 500) + (packages * 100);

    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: { sms_usage: usage },
    });

    this.logger.log(`📦 Purchased ${packages} SMS packages for tenant ${tenantId}. New limit: ${usage.limit}`);

    return { success: true, newLimit: usage.limit };
  }

  /**
   * Aktualizuj ustawienia SMS
   */
  async updateSMSSettings(tenantId: string, settings: any): Promise<{ success: boolean }> {
    // Mapuj ustawienia z frontendu na format bazy danych
    const smsSettings = {
      reminderEnabled: settings.reminderEnabled,
      reminder24hEnabled: settings.reminderEnabled, // Główne przypomnienie
      reminder2hEnabled: settings.reminder2hEnabled, // Drugie przypomnienie
      reminder2hHoursBefore: settings.reminder2hHoursBefore || 2, // Ile godzin przed dla drugiego przypomnienia
      confirmedEnabled: settings.confirmedEnabled,
      cancelledEnabled: settings.cancelledEnabled,
      rescheduledEnabled: settings.rescheduledEnabled,
      reminderHoursBefore: settings.reminderHoursBefore,
      includeCancelLink: settings.includeCancelLink,
    };
    
    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: { sms_settings: smsSettings },
    });

    this.logger.log(`⚙️ Updated SMS settings for tenant ${tenantId}: ${JSON.stringify(smsSettings)}`);
    return { success: true };
  }

  /**
   * 📝 Pobierz szablony SMS dla tenanta
   */
  async getSMSTemplates(tenantId: string): Promise<any> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT sms_templates FROM tenants WHERE id = ${tenantId}
    `;

    this.logger.log(`📝 getSMSTemplates for ${tenantId}: raw result = ${JSON.stringify(result)}`);

    if (!result || result.length === 0) {
      this.logger.log(`📝 No templates found, using defaults`);
      return {
        confirmed: 'Rezerwacja potwierdzona! {usługa} w {firma} - {data}, godz. {godzina}. Dziękujemy!',
        cancelled: 'Rezerwacja odwołana: {usługa} w {firma} - {data}, godz. {godzina}.',
        rescheduled: 'Rezerwacja przesunięta: {usługa} w {firma} - nowy termin: {data}, godz. {godzina}.',
        reminder: 'Przypomnienie: {usługa} w {firma} jutro o godz. {godzina}. Do zobaczenia!',
      };
    }

    const templates = result[0].sms_templates || {};
    this.logger.log(`📝 Templates from DB: ${JSON.stringify(templates)}`);
    
    // Zwróć szablony z domyślnymi wartościami
    const finalTemplates = {
      confirmed: templates.confirmed || 'Rezerwacja potwierdzona! {usługa} w {firma} - {data}, godz. {godzina}. Dziękujemy!',
      cancelled: templates.cancelled || 'Rezerwacja odwołana: {usługa} w {firma} - {data}, godz. {godzina}.',
      rescheduled: templates.rescheduled || 'Rezerwacja przesunięta: {usługa} w {firma} - nowy termin: {data}, godz. {godzina}.',
      reminder: templates.reminder || 'Przypomnienie: {usługa} w {firma} jutro o godz. {godzina}. Do zobaczenia!',
    };
    this.logger.log(`📝 Final templates: ${JSON.stringify(finalTemplates)}`);
    return finalTemplates;
  }

  /**
   * 📝 Zapisz szablony SMS dla tenanta
   */
  async updateSMSTemplates(tenantId: string, templates: any): Promise<{ success: boolean }> {
    await this.prisma.$executeRaw`
      UPDATE tenants 
      SET sms_templates = ${JSON.stringify(templates)}::jsonb
      WHERE id = ${tenantId}
    `;

    this.logger.log(`📝 Updated SMS templates for tenant ${tenantId}`);
    return { success: true };
  }
}
