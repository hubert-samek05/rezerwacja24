import { Module } from '@nestjs/common';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';
import { AutomationEngine } from './automation.engine';

@Module({
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationEngine],
  exports: [AutomationsService],
})
export class AutomationsModule {}
