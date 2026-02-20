import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * POST /api/email/send-custom
   * Endpoint do wysyłania customowych maili z własnymi danymi
   */
  @Post('send-custom')
  @HttpCode(HttpStatus.OK)
  async sendCustomEmail(@Body() body: { to: string; type: string; data: any }) {
    const { to, type, data } = body;

    if (!to || !type || !data) {
      return { success: false, error: 'to, type and data are required' };
    }

    let result = false;

    switch (type) {
      case 'booking-confirmation':
        result = await this.emailService.sendBookingConfirmation({
          to,
          ...data,
        });
        break;
      case 'booking-reminder':
        result = await this.emailService.sendBookingReminder({
          to,
          ...data,
        });
        break;
      case 'booking-cancelled':
        result = await this.emailService.sendBookingCancelled({
          to,
          ...data,
        });
        break;
      case 'booking-paid':
        result = await this.emailService.sendBookingPaid({
          to,
          ...data,
        });
        break;
      case 'payment-failed':
        result = await this.emailService.sendPaymentFailed({
          to,
          ...data,
        });
        break;
      case 'booking-rescheduled':
        result = await this.emailService.sendBookingRescheduled({
          to,
          ...data,
        });
        break;
      default:
        return { success: false, error: `Unknown email type: ${type}` };
    }

    return { success: result, type, to };
  }

  /**
   * POST /api/email/test
   * Endpoint do testowania wysyłania maili (tylko dla admina)
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestEmail(@Body() body: { to: string; type?: string }) {
    const { to, type = 'welcome' } = body;

    if (!to) {
      return { success: false, error: 'Email address is required' };
    }

    let result = false;

    switch (type) {
      case 'welcome':
        result = await this.emailService.sendWelcomeEmail(to, {
          name: 'Test User',
          companyName: 'Test Company',
          subdomain: 'test-company',
        });
        break;

      case 'trial-started':
        result = await this.emailService.sendTrialStartedEmail(to, {
          name: 'Test User',
          trialDays: 7,
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL'),
        });
        break;

      case 'trial-ending':
        result = await this.emailService.sendTrialEndingEmail(to, {
          name: 'Test User',
          daysLeft: 3,
          trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL'),
        });
        break;

      case 'trial-ended-today':
        result = await this.emailService.sendTrialEndedTodayEmail(to, {
          name: 'Test User',
          planName: 'Starter',
        });
        break;

      case 'subscription-active':
        result = await this.emailService.sendSubscriptionActiveEmail(to, {
          name: 'Test User',
          planName: 'Professional',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL'),
        });
        break;

      case 'password-reset':
        result = await this.emailService.sendPasswordResetEmail(to, {
          name: 'Test User',
          resetLink: 'https://rezerwacja24.pl/reset-password?token=test123',
          expiresIn: '1 godzinę',
        });
        break;

      case 'invoice':
        result = await this.emailService.sendInvoiceEmail(to, {
          name: 'Test User',
          invoiceNumber: 'FV/2025/12/001',
          amount: '79,99 zł',
          invoiceDate: new Date().toLocaleDateString('pl-PL'),
        });
        break;

      case 'test':
        result = await this.emailService.sendTestEmail(to);
        break;

      case 'booking-confirmation':
        result = await this.emailService.sendBookingConfirmation({
          to,
          customerName: 'Jan Kowalski',
          serviceName: 'Strzyżenie męskie',
          employeeName: 'Anna Nowak',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: '14:30',
          duration: 45,
          price: '50.00',
          businessName: 'Salon Fryzjerski Test',
          businessAddress: 'ul. Testowa 123, 00-001 Warszawa',
          businessPhone: '+48 123 456 789',
          bookingId: 'test-booking-123',
        });
        break;

      case 'booking-reminder':
        result = await this.emailService.sendBookingReminder({
          to,
          customerName: 'Jan Kowalski',
          serviceName: 'Strzyżenie męskie',
          employeeName: 'Anna Nowak',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: '14:30',
          duration: 45,
          businessName: 'Salon Fryzjerski Test',
          businessAddress: 'ul. Testowa 123, 00-001 Warszawa',
          businessPhone: '+48 123 456 789',
          hoursUntil: 24,
        });
        break;

      case 'booking-cancelled':
        result = await this.emailService.sendBookingCancelled({
          to,
          customerName: 'Jan Kowalski',
          serviceName: 'Strzyżenie męskie',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: '14:30',
          businessName: 'Salon Fryzjerski Test',
          reason: 'Na prośbę klienta',
          rebookUrl: 'https://test.rezerwacja24.pl',
        });
        break;

      case 'booking-paid':
        result = await this.emailService.sendBookingPaid({
          to,
          customerName: 'Jan Kowalski',
          serviceName: 'Strzyżenie męskie',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: '14:30',
          amount: '50.00',
          businessName: 'Salon Fryzjerski Test',
          paymentMethod: 'Karta płatnicza',
          bookingId: 'test-booking-123',
        });
        break;

      case 'payment-failed':
        result = await this.emailService.sendPaymentFailed({
          to,
          customerName: 'Jan Kowalski',
          serviceName: 'Strzyżenie męskie',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: '14:30',
          amount: '50.00',
          businessName: 'Salon Fryzjerski Test',
          retryUrl: 'https://test.rezerwacja24.pl/pay/test-booking-123',
          bookingId: 'test-booking-123',
        });
        break;

      case 'booking-rescheduled':
        result = await this.emailService.sendBookingRescheduled({
          to,
          customerName: 'Jan Kowalski',
          serviceName: 'Strzyżenie męskie',
          oldDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          oldTime: '14:30',
          newDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          newTime: '16:00',
          employeeName: 'Anna Nowak',
          businessName: 'Salon Fryzjerski Test',
          businessAddress: 'ul. Testowa 123, 00-001 Warszawa',
          businessPhone: '+48 123 456 789',
          bookingId: 'test-booking-123',
        });
        break;

      default:
        return { success: false, error: `Unknown email type: ${type}` };
    }

    return { success: result, type, to };
  }
}
