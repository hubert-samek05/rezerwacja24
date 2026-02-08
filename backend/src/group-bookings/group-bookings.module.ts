import { Module } from '@nestjs/common';
import { GroupBookingsService } from './group-bookings.service';
import { GroupBookingsController } from './group-bookings.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [GroupBookingsController],
  providers: [GroupBookingsService, PrismaService],
  exports: [GroupBookingsService],
})
export class GroupBookingsModule {}
