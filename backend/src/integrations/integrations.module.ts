import { Module } from '@nestjs/common';
import { IntegrationsController, CalendarController } from './integrations.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationsController, CalendarController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class IntegrationsModule {}
