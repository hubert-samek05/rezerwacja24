import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);

  onModuleInit() {
    try {
      const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.logger.log('✅ Firebase Admin SDK initialized');
      }
    } catch (error) {
      this.logger.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    }
  }

  /**
   * Wyślij powiadomienie push do pojedynczego urządzenia
   */
  async sendToDevice(token: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Push notification sent: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send push notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Wyślij powiadomienie push do wielu urządzeń
   */
  async sendToMultipleDevices(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<number> {
    if (!tokens.length) return 0;

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`✅ Push notifications sent: ${response.successCount}/${tokens.length} successful`);
      return response.successCount;
    } catch (error) {
      this.logger.error(`❌ Failed to send push notifications: ${error.message}`);
      return 0;
    }
  }

  /**
   * Wyślij przypomnienie o rezerwacji
   */
  async sendBookingReminder(token: string, customerName: string, serviceName: string, dateTime: string): Promise<boolean> {
    return this.sendToDevice(
      token,
      'Przypomnienie o wizycie',
      `${customerName}, przypominamy o wizycie: ${serviceName} - ${dateTime}`,
      { type: 'booking_reminder' }
    );
  }

  /**
   * Wyślij powiadomienie o nowej rezerwacji (dla właściciela)
   */
  async sendNewBookingNotification(token: string, customerName: string, serviceName: string, dateTime: string): Promise<boolean> {
    return this.sendToDevice(
      token,
      'Nowa rezerwacja!',
      `${customerName} zarezerwował: ${serviceName} na ${dateTime}`,
      { type: 'new_booking' }
    );
  }

  /**
   * Wyślij powiadomienie o anulowaniu rezerwacji
   */
  async sendBookingCancellation(token: string, serviceName: string, dateTime: string): Promise<boolean> {
    return this.sendToDevice(
      token,
      'Rezerwacja anulowana',
      `Rezerwacja ${serviceName} na ${dateTime} została anulowana`,
      { type: 'booking_cancelled' }
    );
  }
}
