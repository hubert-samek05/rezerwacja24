import { Module } from '@nestjs/common';
import { PassesService } from './passes.service';
import { PassesController } from './passes.controller';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  controllers: [PassesController],
  providers: [PassesService, PrismaService],
  exports: [PassesService],
})
export class PassesModule {}
