import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Core Modules
import { PrismaModule } from './common/prisma/prisma.module';
import { ActivityTrackerModule } from './common/services/activity-tracker.module';
import { AuditLogModule } from './common/services/audit-log.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ServicesModule } from './services/services.module';
import { EmployeesModule } from './employees/employees.module';
import { BookingsModule } from './bookings/bookings.module';
import { CrmModule } from './crm/crm.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AutomationsModule } from './automations/automations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CustomersModule } from './customers/customers.module';
import { TimeOffModule } from './time-off/time-off.module';
import { PaymentsModule } from './payments/payments.module';
import { HealthModule } from './health/health.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { UploadModule } from './upload/upload.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './email/email.module';
import { PromotionsModule } from './promotions/promotions.module';
import { LimitsModule } from './limits/limits.module';
import { SupportModule } from './support/support.module';
import { PackagesModule } from './packages/packages.module';
import { PassesModule } from './passes/passes.module';
import { GroupBookingsModule } from './group-bookings/group-bookings.module';
import { PartnersModule } from './partners/partners.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { EmployeeAccountsModule } from './employee-accounts/employee-accounts.module';
import { appProviders } from './app.providers';
import { TrialNotificationsService } from './subscription/trial-notifications.service';
import { MaintenanceModule } from './maintenance/maintenance.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Bull Queue
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),

    // Core Modules
    PrismaModule,
    ActivityTrackerModule,
    AuditLogModule,
    AuthModule,
    TenantsModule,
    ServicesModule,
    EmployeesModule,
    BookingsModule,
    CrmModule,
    BillingModule,
    NotificationsModule,
    AutomationsModule,
    AnalyticsModule,
    CustomersModule,
    TimeOffModule,
    PaymentsModule,
    HealthModule,
    SubscriptionsModule,
    ApiKeysModule,
    IntegrationsModule,
    UploadModule,
    UploadsModule,
    AdminModule,
    EmailModule,
    PromotionsModule,
    LimitsModule,
    SupportModule,
    PackagesModule,
    PassesModule,
    GroupBookingsModule,
    PartnersModule,
    MaintenanceModule,
    LoyaltyModule,
    EmployeeAccountsModule,
  ],
  providers: [...appProviders, TrialNotificationsService],
})
export class AppModule {}
