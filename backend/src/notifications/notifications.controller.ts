import { Controller, Get, Post, Patch, Delete, Param, Query, Req, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { PrismaService } from '../common/prisma/prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Pobiera powiadomienia dla zalogowanego użytkownika
   */
  @Get()
  async findAll(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!tenantId || !userId) {
      throw new Error('Brak tenant ID lub user ID');
    }

    return this.notificationsService.findAll(
      tenantId,
      userId,
      unreadOnly === 'true',
    );
  }

  /**
   * Pobiera liczbę nieprzeczytanych powiadomień
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!tenantId || !userId) {
      throw new Error('Brak tenant ID lub user ID');
    }

    const count = await this.notificationsService.getUnreadCount(tenantId, userId);
    return { count };
  }

  /**
   * Oznacza powiadomienie jako przeczytane
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!tenantId || !userId) {
      throw new Error('Brak tenant ID lub user ID');
    }

    return this.notificationsService.markAsRead(id, tenantId, userId);
  }

  /**
   * Oznacza wszystkie powiadomienia jako przeczytane
   */
  @Post('mark-all-read')
  async markAllAsRead(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!tenantId || !userId) {
      throw new Error('Brak tenant ID lub user ID');
    }

    return this.notificationsService.markAllAsRead(tenantId, userId);
  }

  /**
   * Usuwa powiadomienie
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!tenantId || !userId) {
      throw new Error('Brak tenant ID lub user ID');
    }

    return this.notificationsService.remove(id, tenantId, userId);
  }

  /**
   * Usuwa wszystkie powiadomienia
   */
  @Delete()
  async clearAll(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!tenantId || !userId) {
      throw new Error('Brak tenant ID lub user ID');
    }

    return this.notificationsService.clearAll(tenantId, userId);
  }

  /**
   * Rejestruje token urządzenia dla push notifications
   */
  @Post('register-device')
  async registerDevice(@Req() req: any, @Body() body: { token: string; platform?: string }) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!tenantId || !userId) {
      throw new Error('Brak tenant ID lub user ID');
    }

    if (!body.token) {
      throw new Error('Brak tokenu urządzenia');
    }

    // Zapisz lub zaktualizuj token urządzenia
    const device = await this.prisma.push_devices.upsert({
      where: {
        token: body.token,
      },
      update: {
        userId,
        tenantId,
        platform: body.platform || 'android',
        updatedAt: new Date(),
      },
      create: {
        token: body.token,
        userId,
        tenantId,
        platform: body.platform || 'android',
      },
    });

    return { success: true, deviceId: device.id };
  }

  /**
   * Wyrejestruj token urządzenia
   */
  @Delete('unregister-device')
  async unregisterDevice(@Req() req: any, @Body() body: { token: string }) {
    if (!body.token) {
      throw new Error('Brak tokenu urządzenia');
    }

    await this.prisma.push_devices.deleteMany({
      where: { token: body.token },
    });

    return { success: true };
  }

  /**
   * Wyślij testowe powiadomienie push
   */
  @Post('test-push')
  async testPush(@Req() req: any, @Body() body: { token?: string }) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id || req.headers['x-user-id'];

    let token = body.token;

    // Jeśli nie podano tokenu, pobierz z bazy
    if (!token) {
      const device = await this.prisma.push_devices.findFirst({
        where: { userId, tenantId },
        orderBy: { updatedAt: 'desc' },
      });
      token = device?.token;
    }

    if (!token) {
      throw new Error('Brak tokenu urządzenia');
    }

    const success = await this.pushNotificationService.sendToDevice(
      token,
      'Test powiadomienia',
      'To jest testowe powiadomienie push z Rezerwacja24!',
      { type: 'test' }
    );

    return { success };
  }
}
