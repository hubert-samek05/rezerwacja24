import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmployeeAccountsService } from './employee-accounts.service';
import { EmployeeAccountsController } from './employee-accounts.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule, 
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmployeeAccountsController],
  providers: [EmployeeAccountsService],
  exports: [EmployeeAccountsService],
})
export class EmployeeAccountsModule {}
