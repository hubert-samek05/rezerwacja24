import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly maintenanceFilePath = path.join(process.cwd(), 'maintenance.flag');

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  check(@Res() res: Response) {
    const isMaintenance = fs.existsSync(this.maintenanceFilePath);
    
    if (isMaintenance) {
      return res.status(503).json({
        status: 'maintenance',
        message: 'Service is currently under maintenance',
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  }
}
