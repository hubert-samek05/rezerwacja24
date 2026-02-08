import { Module, Global } from '@nestjs/common';
import { LimitsService } from './limits.service';
import { LimitsController } from './limits.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Global() // Globalny moduł - dostępny wszędzie bez importu
@Module({
  imports: [PrismaModule],
  providers: [LimitsService],
  controllers: [LimitsController],
  exports: [LimitsService],
})
export class LimitsModule {}
