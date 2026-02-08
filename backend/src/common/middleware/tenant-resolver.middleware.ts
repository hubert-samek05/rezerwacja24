import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host') || '';
    const subdomain = this.extractSubdomain(host);

    if (subdomain && subdomain !== 'app' && subdomain !== 'api') {
      // Resolve tenant from subdomain
      const tenant = await this.prisma.tenants.findUnique({
        where: { subdomain },
        // include: { subscription: true },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      if (tenant.isSuspended) {
        throw new NotFoundException('Tenant suspended');
      }

      // Attach tenant to request
      (req as any).tenant = tenant;
    }

    next();
  }

  private extractSubdomain(host: string): string | null {
    const parts = host.split('.');
    
    // localhost or IP
    if (parts.length < 3) {
      return null;
    }

    // subdomain.rezerwacja24.pl
    return parts[0];
  }
}
