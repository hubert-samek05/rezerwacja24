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
  cancelUrl?: string;
  paymentUrl?: string;
  bookingId?: string;
  subdomain?: string;
}

export interface CustomSMSTemplates {
  confirmed?: string;
  cancelled?: string;
  rescheduled?: string;
  reminder?: string;
}

// Domyślne szablony - z opcjonalnymi linkami do odwołania i płatności
const DEFAULT_TEMPLATES = {
  pl: {
    confirmed: 'Rezerwacja potwierdzona! {usługa} w {firma} - {data}, godz. {godzina}.{link_odwolania}{link_platnosci} Dziękujemy!',
    cancelled: 'Rezerwacja odwołana: {usługa} w {firma} - {data}, godz. {godzina}.',
    rescheduled: 'Rezerwacja przesunięta: {usługa} w {firma} - nowy termin: {data}, godz. {godzina}.{link_odwolania}',
    reminder: 'Przypomnienie: {usługa} w {firma} {data} o godz. {godzina}.{link_odwolania} Do zobaczenia!',
    reminder_hours: 'Przypomnienie: {usługa} w {firma} dziś o godz. {godzina}.{link_odwolania} Do zobaczenia!',
  },
  eu: {
    confirmed: 'Booking confirmed! {usługa} at {firma} - {data}, {godzina}.{link_odwolania}{link_platnosci} Thank you!',
    cancelled: 'Booking cancelled: {usługa} at {firma} - {data}, {godzina}.',
    rescheduled: 'Booking rescheduled: {usługa} at {firma} - new date: {data}, {godzina}.{link_odwolania}',
    reminder: 'Reminder: {usługa} at {firma} {data} at {godzina}.{link_odwolania} See you!',
    reminder_hours: 'Reminder: {usługa} at {firma} today at {godzina}.{link_odwolania} See you!',
  },
};

@Injectable()
export class SMSTemplatesService {
  
  /**
   * Zamień placeholdery na rzeczywiste wartości
   */
  private replacePlaceholders(template: string, data: SMSTemplateData): string {
    // Przygotuj linki (jeśli są dostępne)
    const cancelLink = data.cancelUrl ? ` Odwołaj: ${data.cancelUrl}` : '';
    const paymentLink = data.paymentUrl ? ` Zapłać: ${data.paymentUrl}` : '';
    
    return template
      .replace(/{usługa}/g, data.serviceName || '')
      .replace(/{firma}/g, data.businessName || '')
      .replace(/{data}/g, data.date || '')
      .replace(/{godzina}/g, data.time || '')
      .replace(/{klient}/g, data.customerName || '')
      .replace(/{pracownik}/g, data.employeeName || '')
      .replace(/{link_odwolania}/g, cancelLink)
      .replace(/{link_platnosci}/g, paymentLink);
  }

  /**
   * Pobierz domyślny szablon
   */
  getDefaultTemplate(type: 'confirmed' | 'cancelled' | 'rescheduled' | 'reminder', region: Region = 'pl'): string {
    const templates = region === 'eu' ? DEFAULT_TEMPLATES.eu : DEFAULT_TEMPLATES.pl;
    return templates[type];
  }

  /**
   * Szablon SMS dla potwierdzonej rezerwacji
   */
  getConfirmedTemplate(data: SMSTemplateData, region: Region = 'pl', customTemplates?: CustomSMSTemplates): string {
    const template = customTemplates?.confirmed || this.getDefaultTemplate('confirmed', region);
    return this.replacePlaceholders(template, data);
  }

  /**
   * Szablon SMS dla odwołanej rezerwacji
   */
  getCancelledTemplate(data: SMSTemplateData, region: Region = 'pl', customTemplates?: CustomSMSTemplates): string {
    const template = customTemplates?.cancelled || this.getDefaultTemplate('cancelled', region);
    return this.replacePlaceholders(template, data);
  }

  /**
   * Szablon SMS dla przesuniętej rezerwacji
   */
  getRescheduledTemplate(data: SMSTemplateData, region: Region = 'pl', customTemplates?: CustomSMSTemplates): string {
    const template = customTemplates?.rescheduled || this.getDefaultTemplate('rescheduled', region);
    return this.replacePlaceholders(template, data);
  }

  /**
   * Szablon SMS przypomnienia
   */
  getReminderTemplate(data: SMSTemplateData, region: Region = 'pl', customTemplates?: CustomSMSTemplates): string {
    const template = customTemplates?.reminder || this.getDefaultTemplate('reminder', region);
    return this.replacePlaceholders(template, data);
  }

  /**
   * Uniwersalna metoda do pobierania szablonu
   */
  getTemplate(
    type: 'confirmed' | 'cancelled' | 'rescheduled' | 'reminder',
    data: SMSTemplateData,
    region: Region = 'pl',
    customTemplates?: CustomSMSTemplates
  ): string {
    switch (type) {
      case 'confirmed':
        return this.getConfirmedTemplate(data, region, customTemplates);
      case 'cancelled':
        return this.getCancelledTemplate(data, region, customTemplates);
      case 'rescheduled':
        return this.getRescheduledTemplate(data, region, customTemplates);
      case 'reminder':
        return this.getReminderTemplate(data, region, customTemplates);
      default:
        return this.getConfirmedTemplate(data, region, customTemplates);
    }
  }
}
