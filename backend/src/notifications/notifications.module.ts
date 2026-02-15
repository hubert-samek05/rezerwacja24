import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FlySMSService } from './flysms.service';
import { SMSTemplatesService } from './sms-templates.service';
import { SMSController } from './sms.controller';
import { SMSReminderScheduler } from './sms-reminder.scheduler';
import { PushNotificationService } from './push-notification.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController, SMSController],
  providers: [NotificationsService, FlySMSService, SMSTemplatesService, PushNotificationService, SMSReminderScheduler, PrismaService],
  exports: [NotificationsService, FlySMSService, SMSTemplatesService, PushNotificationService],
})
export class NotificationsModule {}
