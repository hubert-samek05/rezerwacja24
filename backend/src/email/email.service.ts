import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getBaseTemplate } from './templates/base.template';
import { getWelcomeTemplate } from './templates/welcome.template';
import { getTrialStartedTemplate } from './templates/trial-started.template';
import { getTrialEndingTemplate } from './templates/trial-ending.template';
import { getTrialEndedTodayTemplate } from './templates/trial-ended.template';
import { getSubscriptionActiveTemplate } from './templates/subscription-active.template';
import { getPasswordResetTemplate } from './templates/password-reset.template';
import { getInvoiceTemplate } from './templates/invoice.template';
import { getBookingConfirmationTemplate } from './templates/booking-confirmation.template';
import { getBookingReminderTemplate } from './templates/booking-reminder.template';
import { getBookingCancelledTemplate } from './templates/booking-cancelled.template';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('❌ SMTP connection error:', error);
      } else {
        this.logger.log('✅ SMTP server is ready to send emails');
      }
    });
  }

  /**
   * Wysyła email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const fromName = this.configService.get('SMTP_FROM_NAME', 'Rezerwacja24');
      const fromEmail = this.configService.get('SMTP_FROM_EMAIL');

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`📧 Email wysłany do: ${options.to} | Temat: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Błąd wysyłania emaila do ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Email powitalny po rejestracji
   */
  async sendWelcomeEmail(to: string, data: { name: string; companyName: string; subdomain: string }): Promise<boolean> {
    const html = getBaseTemplate(
      'Witamy w Rezerwacja24! 🎉',
      getWelcomeTemplate(data)
    );

    return this.sendEmail({
      to,
      subject: '🎉 Witamy w Rezerwacja24 - Twoje konto jest gotowe!',
      html,
    });
  }

  /**
   * Email o rozpoczęciu trialu
   */
  async sendTrialStartedEmail(to: string, data: { name: string; trialDays: number; trialEndDate: string }): Promise<boolean> {
    const html = getBaseTemplate(
      'Twój okres próbny się rozpoczął!',
      getTrialStartedTemplate(data)
    );

    return this.sendEmail({
      to,
      subject: '🚀 Twój 7-dniowy okres próbny właśnie się rozpoczął!',
      html,
    });
  }

  /**
   * Email o kończącym się trialu (3 dni przed)
   */
  async sendTrialEndingEmail(to: string, data: { name: string; daysLeft: number; trialEndDate: string }): Promise<boolean> {
    const html = getBaseTemplate(
      'Twój okres próbny kończy się za ' + data.daysLeft + ' dni',
      getTrialEndingTemplate(data)
    );

    return this.sendEmail({
      to,
      subject: `⏰ Twój okres próbny kończy się za ${data.daysLeft} dni`,
      html,
    });
  }

  /**
   * Email o trialu kończącym się DZISIAJ
   */
  async sendTrialEndedTodayEmail(to: string, data: { name: string; planName: string }): Promise<boolean> {
    const html = getBaseTemplate(
      'Twój okres próbny kończy się dzisiaj',
      getTrialEndedTodayTemplate(data)
    );

    return this.sendEmail({
      to,
      subject: 'Twój okres próbny kończy się dzisiaj',
      html,
    });
  }

  /**
   * Email o aktywnej subskrypcji
   */
  async sendSubscriptionActiveEmail(to: string, data: { name: string; planName: string; nextBillingDate: string }): Promise<boolean> {
    const html = getBaseTemplate(
      'Subskrypcja aktywowana!',
      getSubscriptionActiveTemplate(data)
    );

    return this.sendEmail({
      to,
      subject: '✅ Twoja subskrypcja Rezerwacja24 jest aktywna!',
      html,
    });
  }

  /**
   * Email do resetu hasła
   */
  async sendPasswordResetEmail(to: string, data: { name: string; resetLink: string; expiresIn: string }): Promise<boolean> {
    const html = getBaseTemplate(
      'Reset hasła',
      getPasswordResetTemplate(data)
    );

    return this.sendEmail({
      to,
      subject: '🔐 Reset hasła - Rezerwacja24',
      html,
    });
  }

  /**
   * Email z fakturą (wysyłany ręcznie przez admina)
   */
  async sendInvoiceEmail(to: string, data: { 
    name: string; 
    invoiceNumber: string; 
    amount: string; 
    invoiceDate: string;
    downloadLink?: string;
  }): Promise<boolean> {
    const html = getBaseTemplate(
      'Faktura ' + data.invoiceNumber,
      getInvoiceTemplate(data)
    );

    return this.sendEmail({
      to,
      subject: `📄 Faktura ${data.invoiceNumber} - Rezerwacja24`,
      html,
    });
  }

  /**
   * Email z fakturą PDF jako załącznik
   */
  async sendInvoiceWithAttachment(to: string, data: { 
    name: string; 
    invoiceNumber: string; 
    amount: string; 
    invoiceDate: string;
    pdfBuffer: Buffer;
    pdfFilename: string;
  }): Promise<boolean> {
    try {
      const fromName = this.configService.get('SMTP_FROM_NAME', 'Rezerwacja24');
      const fromEmail = this.configService.get('SMTP_FROM_EMAIL');

      const html = getBaseTemplate(
        'Faktura ' + data.invoiceNumber,
        getInvoiceTemplate({
          name: data.name,
          invoiceNumber: data.invoiceNumber,
          amount: data.amount,
          invoiceDate: data.invoiceDate,
        })
      );

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: `📄 Faktura ${data.invoiceNumber} - Rezerwacja24`,
        html,
        attachments: [
          {
            filename: data.pdfFilename,
            content: data.pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`📧 Faktura ${data.invoiceNumber} wysłana do: ${to} (z załącznikiem PDF)`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Błąd wysyłania faktury z załącznikiem do ${to}:`, error);
      return false;
    }
  }

  /**
   * Email o nieudanej płatności
   */
  async sendPaymentFailedEmail(to: string, data: { 
    name: string; 
    attemptNumber: number;
    updatePaymentLink: string;
  }): Promise<boolean> {
    const isLastAttempt = data.attemptNumber >= 3;
    
    const html = getBaseTemplate(
      'Problem z płatnością',
      `
        <h2 style="color: #ef4444; margin-bottom: 20px;">⚠️ Problem z płatnością</h2>
        <p>Cześć <strong>${data.name}</strong>,</p>
        <p>Niestety nie udało się pobrać płatności za Twoją subskrypcję Rezerwacja24.</p>
        <p><strong>Próba ${data.attemptNumber} z 3</strong></p>
        ${isLastAttempt ? `
          <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #dc2626; margin: 0; font-weight: bold;">
              ⛔ To była ostatnia próba. Twoje konto zostało tymczasowo zawieszone.
            </p>
            <p style="color: #dc2626; margin: 10px 0 0 0;">
              Zaktualizuj metodę płatności, aby przywrócić dostęp do konta.
            </p>
          </div>
        ` : `
          <p>Spróbujemy ponownie za 24 godziny. Aby uniknąć problemów, zaktualizuj swoją metodę płatności.</p>
        `}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.updatePaymentLink}" 
             style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); 
                    color: #000; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    display: inline-block;">
            💳 Zaktualizuj metodę płatności
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Jeśli masz pytania, odpowiedz na tego maila lub skontaktuj się z nami.
        </p>
      `
    );

    return this.sendEmail({
      to,
      subject: isLastAttempt 
        ? '⛔ Konto zawieszone - zaktualizuj płatność' 
        : '⚠️ Problem z płatnością - Rezerwacja24',
      html,
    });
  }

  /**
   * Email o przywróceniu konta po udanej płatności
   */
  async sendAccountReactivatedEmail(to: string, data: { 
    name: string; 
    nextBillingDate: string;
  }): Promise<boolean> {
    const html = getBaseTemplate(
      'Konto przywrócone',
      `
        <h2 style="color: #10b981; margin-bottom: 20px;">✅ Konto przywrócone!</h2>
        <p>Cześć <strong>${data.name}</strong>,</p>
        <p>Świetna wiadomość! Płatność została zrealizowana pomyślnie i Twoje konto jest ponownie aktywne.</p>
        <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;">
            📅 Następna płatność: <strong>${data.nextBillingDate}</strong>
          </p>
        </div>
        <p>Dziękujemy za korzystanie z Rezerwacja24!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://rezerwacja24.pl/dashboard" 
             style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); 
                    color: #000; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    display: inline-block;">
            🚀 Przejdź do panelu
          </a>
        </div>
      `
    );

    return this.sendEmail({
      to,
      subject: '✅ Konto przywrócone - Rezerwacja24',
      html,
    });
  }

  /**
   * Powiadomienie dla admina o nowej rejestracji
   */
  async sendAdminNewUserNotification(data: {
    userEmail: string;
    userName: string;
    businessName: string;
    subdomain: string;
    registeredAt: Date;
  }): Promise<boolean> {
    const adminEmail = 'biuro.rezerwacja24@gmail.com';
    
    const html = getBaseTemplate(
      '🎉 Nowa rejestracja!',
      `
        <h2 style="color: #10b981; margin-bottom: 20px;">🎉 Nowy użytkownik zarejestrował się!</h2>
        
        <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Nazwa firmy:</td>
              <td style="padding: 8px 0; font-weight: bold;">${data.businessName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Imię i nazwisko:</td>
              <td style="padding: 8px 0; font-weight: bold;">${data.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${data.userEmail}" style="color: #10b981;">${data.userEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Subdomena:</td>
              <td style="padding: 8px 0;"><a href="https://${data.subdomain}.rezerwacja24.pl" style="color: #10b981;">${data.subdomain}.rezerwacja24.pl</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Data rejestracji:</td>
              <td style="padding: 8px 0;">${data.registeredAt.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Użytkownik rozpoczął 7-dniowy okres próbny na planie Starter.
        </p>
      `
    );

    return this.sendEmail({
      to: adminEmail,
      subject: `🎉 Nowa rejestracja: ${data.businessName}`,
      html,
    });
  }

  /**
   * Wysyła testowy email do sprawdzenia wyglądu szablonu
   */
  async sendTestEmail(to: string): Promise<boolean> {
    const html = getBaseTemplate(
      'Testowy email',
      `
        <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
          Testowy email
        </h2>
        
        <p style="margin: 0 0 24px 0;">
          Cześć,
        </p>
        
        <p style="margin: 0 0 24px 0;">
          To jest testowy email z systemu Rezerwacja24. Wysyłamy go, żeby sprawdzić czy wszystko działa poprawnie i czy wiadomości wyświetlają się tak jak powinny w Twojej skrzynce odbiorczej.
        </p>
        
        <p style="margin: 0 0 24px 0;">
          Jeśli widzisz tę wiadomość i wszystko wygląda dobrze, oznacza to, że konfiguracja systemu emailowego jest prawidłowa i możesz być pewien/pewna, że Twoi klienci będą otrzymywać powiadomienia bez problemów.
        </p>
        
        <p style="margin: 0 0 24px 0;">
          <strong>Szczegóły testu:</strong><br>
          Data: ${new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
          Godzina: ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
        </p>
        
        <p style="margin: 0 0 28px 0;">
          Ten email nie wymaga żadnej odpowiedzi ani akcji z Twojej strony. Został wysłany wyłącznie w celach testowych.
        </p>
        
        <p style="margin: 0 0 32px 0;">
          <a href="https://rezerwacja24.pl/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Przejdź do panelu
          </a>
        </p>
        
        <p style="margin: 0; color: #666666;">
          Pozdrawiamy,<br>
          Zespół Rezerwacja24
        </p>
      `
    );

    return this.sendEmail({
      to,
      subject: 'Testowy email - Rezerwacja24',
      html,
    });
  }

  /**
   * Email z danymi logowania dla pracownika
   */
  async sendEmployeeAccountCreated(data: {
    to: string;
    employeeName: string;
    businessName: string;
    tempPassword: string;
    loginUrl: string;
  }): Promise<boolean> {
    const html = getBaseTemplate(
      'Twoje konto pracownika zostało utworzone',
      `
        <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
          Witaj ${data.employeeName}! 👋
        </h2>
        
        <p style="margin: 0 0 24px 0;">
          Twój pracodawca <strong>${data.businessName}</strong> utworzył dla Ciebie konto w systemie Rezerwacja24.
        </p>
        
        <p style="margin: 0 0 24px 0;">
          Dzięki temu kontu możesz zarządzać swoim kalendarzem i rezerwacjami bezpośrednio z panelu pracownika.
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
          <p style="margin: 0 0 12px 0; font-weight: 600;">Twoje dane logowania:</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${data.to}</p>
          <p style="margin: 0;"><strong>Hasło tymczasowe:</strong> <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${data.tempPassword}</code></p>
        </div>
        
        <p style="margin: 0 0 24px 0; color: #ef4444;">
          ⚠️ Ze względów bezpieczeństwa zalecamy zmianę hasła po pierwszym logowaniu.
        </p>
        
        <p style="margin: 0 0 32px 0;">
          <a href="${data.loginUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Zaloguj się do panelu
          </a>
        </p>
        
        <p style="margin: 0; color: #666666;">
          Pozdrawiamy,<br>
          Zespół ${data.businessName}
        </p>
      `
    );

    return this.sendEmail({
      to: data.to,
      subject: `🔑 Twoje konto pracownika w ${data.businessName}`,
      html,
    });
  }

  /**
   * Email z nowym hasłem dla pracownika
   */
  async sendEmployeePasswordReset(data: {
    to: string;
    employeeName: string;
    businessName: string;
    tempPassword: string;
    loginUrl: string;
  }): Promise<boolean> {
    const html = getBaseTemplate(
      'Twoje hasło zostało zresetowane',
      `
        <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
          Cześć ${data.employeeName}! 🔐
        </h2>
        
        <p style="margin: 0 0 24px 0;">
          Administrator firmy <strong>${data.businessName}</strong> zresetował Twoje hasło do panelu pracownika.
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
          <p style="margin: 0 0 12px 0; font-weight: 600;">Twoje nowe dane logowania:</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${data.to}</p>
          <p style="margin: 0;"><strong>Nowe hasło:</strong> <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${data.tempPassword}</code></p>
        </div>
        
        <p style="margin: 0 0 24px 0; color: #ef4444;">
          ⚠️ Ze względów bezpieczeństwa zalecamy zmianę hasła po zalogowaniu.
        </p>
        
        <p style="margin: 0 0 32px 0;">
          <a href="${data.loginUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Zaloguj się
          </a>
        </p>
        
        <p style="margin: 0; color: #666666;">
          Pozdrawiamy,<br>
          Zespół ${data.businessName}
        </p>
      `
    );

    return this.sendEmail({
      to: data.to,
      subject: `🔑 Nowe hasło do konta pracownika - ${data.businessName}`,
      html,
    });
  }

  // ============================================
  // POWIADOMIENIA DLA KLIENTÓW O REZERWACJACH
  // ============================================

  /**
   * Email potwierdzający rezerwację dla klienta
   */
  async sendBookingConfirmation(data: {
    to: string;
    customerName: string;
    serviceName: string;
    employeeName: string;
    date: string;
    time: string;
    duration: number;
    price: string;
    businessName: string;
    businessAddress?: string;
    businessPhone?: string;
    bookingId: string;
    cancelUrl?: string;
  }): Promise<boolean> {
    const html = getBaseTemplate(
      `Potwierdzenie rezerwacji - ${data.businessName}`,
      getBookingConfirmationTemplate(data)
    );

    return this.sendEmail({
      to: data.to,
      subject: `✅ Potwierdzenie rezerwacji - ${data.businessName}`,
      html,
    });
  }

  /**
   * Email przypominający o wizycie dla klienta
   */
  async sendBookingReminder(data: {
    to: string;
    customerName: string;
    serviceName: string;
    employeeName: string;
    date: string;
    time: string;
    duration: number;
    businessName: string;
    businessAddress?: string;
    businessPhone?: string;
    hoursUntil: number;
    cancelUrl?: string;
  }): Promise<boolean> {
    const html = getBaseTemplate(
      `Przypomnienie o wizycie - ${data.businessName}`,
      getBookingReminderTemplate(data)
    );

    const subjectPrefix = data.hoursUntil <= 24 ? '⏰ Jutro masz wizytę' : '📅 Przypomnienie o wizycie';

    return this.sendEmail({
      to: data.to,
      subject: `${subjectPrefix} - ${data.businessName}`,
      html,
    });
  }

  /**
   * Email o anulowaniu rezerwacji dla klienta
   */
  async sendBookingCancelled(data: {
    to: string;
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    businessName: string;
    reason?: string;
    rebookUrl?: string;
  }): Promise<boolean> {
    const html = getBaseTemplate(
      `Rezerwacja anulowana - ${data.businessName}`,
      getBookingCancelledTemplate(data)
    );

    return this.sendEmail({
      to: data.to,
      subject: `❌ Rezerwacja anulowana - ${data.businessName}`,
      html,
    });
  }
}
