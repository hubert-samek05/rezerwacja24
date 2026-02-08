import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { LimitsService } from '../limits/limits.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ConfigModule, EmailModule],
  controllers: [BillingController],
  providers: [BillingService, StripeService, PrismaService, LimitsService],
  exports: [BillingService, StripeService],
})
export class BillingModule {}
