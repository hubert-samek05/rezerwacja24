import { Injectable } from '@nestjs/common';
import { Region } from '../common/utils/region.util';

export interface SMSTemplateData {
  serviceName: string;
  businessName: string;
  date: string;
  time: string;
  customerName?: string;
  employeeName?: string;
  reason?: string;
}

@Injectable()
export class SMSTemplatesService {
  
  /**
   * Szablon SMS dla potwierdzonej rezerwacji
   */
  getConfirmedTemplate(data: SMSTemplateData, region: Region = 'pl'): string {
    if (region === 'eu') {
      return `Booking confirmed! ${data.serviceName} at ${data.businessName} - ${data.date}, ${data.time}. Thank you!`;
    }
    return `Rezerwacja potwierdzona! ${data.serviceName} w ${data.businessName} - ${data.date}, godz. ${data.time}. Dziękujemy!`;
  }

  /**
   * Szablon SMS dla odwołanej rezerwacji
   */
  getCancelledTemplate(data: SMSTemplateData, region: Region = 'pl'): string {
    if (region === 'eu') {
      return `Booking cancelled: ${data.serviceName} at ${data.businessName} - ${data.date}, ${data.time}.`;
    }
    return `Rezerwacja odwołana: ${data.serviceName} w ${data.businessName} - ${data.date}, godz. ${data.time}.`;
  }

  /**
   * Szablon SMS dla przesuniętej rezerwacji
   */
  getRescheduledTemplate(data: SMSTemplateData, region: Region = 'pl'): string {
    if (region === 'eu') {
      return `Booking rescheduled: ${data.serviceName} at ${data.businessName} - new date: ${data.date}, ${data.time}.`;
    }
    return `Rezerwacja przesunięta: ${data.serviceName} w ${data.businessName} - nowy termin: ${data.date}, godz. ${data.time}.`;
  }

  /**
   * Szablon SMS przypomnienia
   */
  getReminderTemplate(data: SMSTemplateData, region: Region = 'pl'): string {
    if (region === 'eu') {
      return `Reminder: ${data.serviceName} at ${data.businessName} tomorrow at ${data.time}. See you!`;
    }
    return `Przypomnienie: ${data.serviceName} w ${data.businessName} jutro o godz. ${data.time}. Do zobaczenia!`;
  }

  /**
   * Uniwersalna metoda do pobierania szablonu
   */
  getTemplate(
    type: 'confirmed' | 'cancelled' | 'rescheduled' | 'reminder',
    data: SMSTemplateData,
    region: Region = 'pl'
  ): string {
    switch (type) {
      case 'confirmed':
        return this.getConfirmedTemplate(data, region);
      case 'cancelled':
        return this.getCancelledTemplate(data, region);
      case 'rescheduled':
        return this.getRescheduledTemplate(data, region);
      case 'reminder':
        return this.getReminderTemplate(data, region);
      default:
        return this.getConfirmedTemplate(data, region);
    }
  }
}
