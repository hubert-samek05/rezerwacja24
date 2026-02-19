import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailReminderScheduler } from './email-reminder.scheduler';
import { PrismaModule } from '../common/prisma/prisma.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [EmailController],
  providers: [EmailService, EmailReminderScheduler],
  exports: [EmailService],
})
export class EmailModule {}
