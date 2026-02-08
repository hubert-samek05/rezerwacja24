import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { PushNotificationService } from './push-notification.service';
import { getBaseTemplate } from '../email/templates/base.template';

export interface CreateNotificationDto {
  tenantId: string;
  userId: string;
  type: 'BOOKING' | 'REMINDER' | 'CUSTOMER' | 'PAYMENT' | 'ALERT' | 'SUCCESS' | 'INFO';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  sendPush?: boolean; // Czy wysłać push notification
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private pushNotificationService: PushNotificationService,
  ) {}

  /**
   * Tworzy nowe powiadomienie (z izolacją per tenant)
   * Automatycznie wysyła push notification jeśli użytkownik ma zarejestrowane urządzenie
   */
  async create(data: CreateNotificationDto) {
    const notification = await this.prisma.notifications.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        read: false,
        createdAt: new Date(),
      },
    });

    this.logger.log(`✅ Utworzono powiadomienie ${notification.id} dla tenant ${data.tenantId}`);

    // Wyślij push notification jeśli włączone (domyślnie true)
    if (data.sendPush !== false) {
      await this.sendPushToUser(data.tenantId, data.userId, data.title, data.message, {
        type: data.type,
        notificationId: notification.id,
        actionUrl: data.actionUrl || '',
      });
    }

    return notification;
  }

  /**
   * Wysyła push notification do wszystkich urządzeń użytkownika
   */
  async sendPushToUser(tenantId: string, userId: string, title: string, body: string, data?: Record<string, string>) {
    try {
      // Pobierz wszystkie urządzenia użytkownika
      const devices = await this.prisma.push_devices.findMany({
        where: { userId, tenantId },
      });

      if (devices.length === 0) {
        this.logger.debug(`Brak zarejestrowanych urządzeń dla użytkownika ${userId}`);
        return 0;
      }

      const tokens = devices.map(d => d.token);
      const successCount = await this.pushNotificationService.sendToMultipleDevices(tokens, title, body, data);
      
      this.logger.log(`📱 Wysłano push do ${successCount}/${tokens.length} urządzeń użytkownika ${userId}`);
      return successCount;
    } catch (error) {
      this.logger.error(`Błąd wysyłania push do użytkownika ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Pobiera powiadomienia dla użytkownika (tylko z jego tenanta)
   */
  async findAll(tenantId: string, userId: string, unreadOnly = false) {
    const where: any = {
      tenantId,
      userId,
    };

    if (unreadOnly) {
      where.read = false;
    }

    return this.prisma.notifications.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit 100 najnowszych
    });
  }

  /**
   * Oznacza powiadomienie jako przeczytane (tylko jeśli należy do tego tenanta)
   */
  async markAsRead(id: string, tenantId: string, userId: string) {
    // Sprawdź czy powiadomienie należy do tego użytkownika i tenanta
    const notification = await this.prisma.notifications.findFirst({
      where: { id, tenantId, userId },
    });

    if (!notification) {
      throw new Error('Powiadomienie nie znalezione lub brak dostępu');
    }

    return this.prisma.notifications.update({
      where: { id },
      data: { read: true },
    });
  }

  /**
   * Oznacza wszystkie powiadomienia jako przeczytane
   */
  async markAllAsRead(tenantId: string, userId: string) {
    return this.prisma.notifications.updateMany({
      where: {
        tenantId,
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  /**
   * Usuwa powiadomienie (tylko jeśli należy do tego tenanta)
   */
  async remove(id: string, tenantId: string, userId: string) {
    // Sprawdź czy powiadomienie należy do tego użytkownika i tenanta
    const notification = await this.prisma.notifications.findFirst({
      where: { id, tenantId, userId },
    });

    if (!notification) {
      throw new Error('Powiadomienie nie znalezione lub brak dostępu');
    }

    return this.prisma.notifications.delete({
      where: { id },
    });
  }

  /**
   * Pobiera liczbę nieprzeczytanych powiadomień
   */
  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return this.prisma.notifications.count({
      where: {
        tenantId,
        userId,
        read: false,
      },
    });
  }

  /**
   * Usuwa wszystkie powiadomienia użytkownika
   */
  async clearAll(tenantId: string, userId: string) {
    return this.prisma.notifications.deleteMany({
      where: {
        tenantId,
        userId,
      },
    });
  }

  // ==================== POWIADOMIENIA EMAIL DLA ZAJĘĆ GRUPOWYCH ====================

  /**
   * Wysyła potwierdzenie zapisu na zajęcia grupowe
   */
  async sendGroupBookingConfirmation(
    email: string,
    participantName: string,
    eventTitle: string,
    eventDate: Date,
    pricePerPerson: number,
    businessName: string,
    couponDiscount?: { type: string; value: number } | null,
  ): Promise<boolean> {
    const formattedDate = eventDate.toLocaleString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let priceInfo = `<strong>${pricePerPerson.toFixed(2)} zł</strong>`;
    if (couponDiscount) {
      const discountText = couponDiscount.type === 'percentage' 
        ? `${couponDiscount.value}%` 
        : `${couponDiscount.value} zł`;
      priceInfo += ` <span style="color: #10b981;">(rabat: ${discountText})</span>`;
    }

    const html = getBaseTemplate(
      'Potwierdzenie zapisu na zajęcia grupowe',
      `
        <h2 style="color: #8b5cf6; margin-bottom: 20px;">👥 Zapisano na zajęcia grupowe!</h2>
        <p>Cześć <strong>${participantName}</strong>,</p>
        <p>Zostałeś/aś zapisany/a na zajęcia grupowe w <strong>${businessName}</strong>.</p>
        
        <div style="background: #f5f3ff; border: 1px solid #8b5cf6; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #7c3aed; margin: 0 0 12px 0;">${eventTitle}</h3>
          <p style="margin: 8px 0;">📅 <strong>Data:</strong> ${formattedDate}</p>
          <p style="margin: 8px 0;">💰 <strong>Cena:</strong> ${priceInfo}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Jeśli masz pytania lub chcesz anulować rezerwację, skontaktuj się bezpośrednio z ${businessName}.
        </p>
        
        <p style="margin-top: 24px;">Do zobaczenia na zajęciach! 🎉</p>
      `
    );

    return this.emailService.sendEmail({
      to: email,
      subject: `✅ Zapisano na zajęcia: ${eventTitle} - ${businessName}`,
      html,
    });
  }

  /**
   * Wysyła powiadomienie o zmianie terminu zajęć grupowych
   */
  async sendGroupBookingReschedule(
    email: string,
    participantName: string,
    eventTitle: string,
    oldDate: Date,
    newDate: Date,
  ): Promise<boolean> {
    const formatDate = (date: Date) => date.toLocaleString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = getBaseTemplate(
      'Zmiana terminu zajęć grupowych',
      `
        <h2 style="color: #f59e0b; margin-bottom: 20px;">📅 Zmiana terminu zajęć</h2>
        <p>Cześć <strong>${participantName}</strong>,</p>
        <p>Termin zajęć grupowych <strong>${eventTitle}</strong> został zmieniony.</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 8px 0; text-decoration: line-through; color: #9ca3af;">
            Stary termin: ${formatDate(oldDate)}
          </p>
          <p style="margin: 8px 0; font-weight: bold; color: #d97706;">
            ✨ Nowy termin: ${formatDate(newDate)}
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Jeśli nowy termin Ci nie odpowiada, skontaktuj się z nami w celu anulowania rezerwacji.
        </p>
      `
    );

    return this.emailService.sendEmail({
      to: email,
      subject: `📅 Zmiana terminu: ${eventTitle}`,
      html,
    });
  }

  /**
   * Wysyła powiadomienie o przeniesieniu z listy oczekujących
   */
  async sendWaitlistPromotion(
    email: string,
    participantName: string,
    eventTitle: string,
    eventDate: Date,
    businessName: string,
  ): Promise<boolean> {
    const formattedDate = eventDate.toLocaleString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = getBaseTemplate(
      'Miejsce na zajęciach się zwolniło!',
      `
        <h2 style="color: #10b981; margin-bottom: 20px;">🎉 Świetna wiadomość!</h2>
        <p>Cześć <strong>${participantName}</strong>,</p>
        <p>Zwolniło się miejsce na zajęciach grupowych i zostałeś/aś przeniesiony/a z listy oczekujących!</p>
        
        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #059669; margin: 0 0 12px 0;">${eventTitle}</h3>
          <p style="margin: 8px 0;">📅 <strong>Data:</strong> ${formattedDate}</p>
          <p style="margin: 8px 0;">📍 <strong>Miejsce:</strong> ${businessName}</p>
        </div>
        
        <p style="font-weight: bold; color: #059669;">
          ✅ Twoje miejsce jest już zarezerwowane!
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Do zobaczenia na zajęciach!
        </p>
      `
    );

    return this.emailService.sendEmail({
      to: email,
      subject: `🎉 Masz miejsce na zajęciach: ${eventTitle}`,
      html,
    });
  }

  /**
   * Wysyła przypomnienie o nadchodzących zajęciach grupowych
   */
  async sendGroupBookingReminder(
    email: string,
    participantName: string,
    eventTitle: string,
    eventDate: Date,
    businessName: string,
  ): Promise<boolean> {
    const formattedDate = eventDate.toLocaleString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = getBaseTemplate(
      'Przypomnienie o zajęciach grupowych',
      `
        <h2 style="color: #8b5cf6; margin-bottom: 20px;">⏰ Przypomnienie o zajęciach</h2>
        <p>Cześć <strong>${participantName}</strong>,</p>
        <p>Przypominamy o nadchodzących zajęciach grupowych!</p>
        
        <div style="background: #f5f3ff; border: 1px solid #8b5cf6; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #7c3aed; margin: 0 0 12px 0;">${eventTitle}</h3>
          <p style="margin: 8px 0;">📅 <strong>Kiedy:</strong> ${formattedDate}</p>
          <p style="margin: 8px 0;">📍 <strong>Gdzie:</strong> ${businessName}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Jeśli nie możesz wziąć udziału, prosimy o wcześniejszą informację.
        </p>
        
        <p style="margin-top: 24px;">Do zobaczenia! 👋</p>
      `
    );

    return this.emailService.sendEmail({
      to: email,
      subject: `⏰ Przypomnienie: ${eventTitle} - jutro!`,
      html,
    });
  }

  /**
   * Wysyła powiadomienie o anulowaniu zajęć grupowych
   */
  async sendGroupBookingCancellation(
    email: string,
    participantName: string,
    eventTitle: string,
    eventDate: Date,
    businessName: string,
    reason?: string,
  ): Promise<boolean> {
    const formattedDate = eventDate.toLocaleString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = getBaseTemplate(
      'Zajęcia grupowe zostały anulowane',
      `
        <h2 style="color: #ef4444; margin-bottom: 20px;">❌ Zajęcia anulowane</h2>
        <p>Cześć <strong>${participantName}</strong>,</p>
        <p>Z przykrością informujemy, że zajęcia grupowe zostały anulowane.</p>
        
        <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0;">${eventTitle}</h3>
          <p style="margin: 8px 0;">📅 <strong>Planowany termin:</strong> ${formattedDate}</p>
          ${reason ? `<p style="margin: 8px 0;">📝 <strong>Powód:</strong> ${reason}</p>` : ''}
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Przepraszamy za niedogodności. Jeśli dokonałeś/aś płatności, zostanie ona zwrócona.
        </p>
        
        <p style="margin-top: 24px;">
          W razie pytań skontaktuj się z ${businessName}.
        </p>
      `
    );

    return this.emailService.sendEmail({
      to: email,
      subject: `❌ Anulowano zajęcia: ${eventTitle}`,
      html,
    });
  }
}
