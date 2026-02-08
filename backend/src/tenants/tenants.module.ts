import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { SubdomainSetupService } from '../common/services/subdomain-setup.service';
import { TenantAccessGuard } from '../common/guards/tenant-access.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TenantsController],
  providers: [TenantsService, SubdomainSetupService, TenantAccessGuard],
  exports: [TenantsService],
})
export class TenantsModule {}
