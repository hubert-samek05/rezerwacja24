import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceMiddleware } from '../middleware/maintenance.middleware';

@Module({
  controllers: [MaintenanceController],
})
export class MaintenanceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MaintenanceMiddleware)
      .exclude('maintenance', 'assets/(.*)')
      .forRoutes('*');
  }
}
