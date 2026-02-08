import { Global, Module } from '@nestjs/common';
import { ActivityTrackerService } from './activity-tracker.service';

@Global()
@Module({
  providers: [ActivityTrackerService],
  exports: [ActivityTrackerService],
})
export class ActivityTrackerModule {}
