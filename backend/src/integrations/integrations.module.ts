import { Module } from '@nestjs/common';
import { IntegrationsController, CalendarController } from './integrations.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { ExternalCalendarService } from './external-calendar.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationsController, CalendarController],
  providers: [GoogleCalendarService, ExternalCalendarService],
  exports: [GoogleCalendarService, ExternalCalendarService],
})
export class IntegrationsModule {}
