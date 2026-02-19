import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { PublicBookingController } from './public-booking.controller';
import { BookingRedirectController } from './booking-redirect.controller';
import { BookingsService } from './bookings.service';
import { UnpaidBookingScheduler } from './unpaid-booking.scheduler';
import { PrismaModule } from '../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { LimitsService } from '../limits/limits.service';
import { PassesModule } from '../passes/passes.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, NotificationsModule, IntegrationsModule, PassesModule, LoyaltyModule, EmailModule],
  controllers: [BookingsController, PublicBookingController, BookingRedirectController],
  providers: [BookingsService, LimitsService, UnpaidBookingScheduler],
  exports: [BookingsService],
})
export class BookingsModule {}
