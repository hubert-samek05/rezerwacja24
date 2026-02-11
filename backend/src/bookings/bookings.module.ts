import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { PublicBookingController } from './public-booking.controller';
import { BookingsService } from './bookings.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { LimitsService } from '../limits/limits.service';
import { PassesModule } from '../passes/passes.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [PrismaModule, NotificationsModule, IntegrationsModule, PassesModule, LoyaltyModule],
  controllers: [BookingsController, PublicBookingController],
  providers: [BookingsService, LimitsService],
  exports: [BookingsService],
})
export class BookingsModule {}
