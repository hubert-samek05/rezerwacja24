import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  private readonly maintenanceFilePath = path.join(process.cwd(), 'maintenance.flag');

  use(req: Request, res: Response, next: NextFunction) {
    // Always allow access to maintenance page and static assets
    if (req.path === '/maintenance' || 
        req.path.startsWith('/assets/') || 
        req.path.startsWith('/api/health')) {
      return next();
    }

    // Check if maintenance mode is enabled
    if (fs.existsSync(this.maintenanceFilePath)) {
      // For API requests, return 503
      if (req.path.startsWith('/api/')) {
        return res.status(503).json({
          statusCode: 503,
          message: 'Service Unavailable - Maintenance in progress',
          retryAfter: 300, // 5 minutes
        });
      }
      
      // For web requests, redirect to maintenance page
      return res.redirect('/maintenance');
    }

    next();
  }
}
