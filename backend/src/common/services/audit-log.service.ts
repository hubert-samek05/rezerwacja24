import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  tenantId: string;
  userId?: string;
  userType: 'owner' | 'employee' | 'customer' | 'system';
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Zapisuje wpis do logu audytu
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.audit_logs.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId,
          userType: entry.userType,
          userName: entry.userName,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          entityName: entry.entityName,
          changes: entry.changes || null,
          metadata: entry.metadata || null,
        },
      });
    } catch (error) {
      // Nie rzucamy błędu - audit log nie powinien blokować głównej operacji
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Pobiera historię dla konkretnej encji
   */
  async getEntityHistory(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.audit_logs.findMany({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Pobiera historię działań użytkownika
   */
  async getUserHistory(tenantId: string, userId: string, limit = 50) {
    return this.prisma.audit_logs.findMany({
      where: {
        tenantId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Pobiera ostatnie działania w firmie
   */
  async getRecentActivity(tenantId: string, limit = 50) {
    return this.prisma.audit_logs.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Pobiera historię rezerwacji
   */
  async getBookingHistory(tenantId: string, bookingId: string) {
    return this.prisma.audit_logs.findMany({
      where: {
        tenantId,
        entityType: 'booking',
        entityId: bookingId,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Pobiera statystyki działań pracownika
   */
  async getEmployeeStats(tenantId: string, employeeId: string, fromDate?: Date, toDate?: Date) {
    const where: any = {
      tenantId,
      userId: employeeId,
      userType: 'employee',
    };

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    const logs = await this.prisma.audit_logs.findMany({
      where,
      select: {
        action: true,
        entityType: true,
      },
    });

    // Grupuj po akcji i typie encji
    const stats: Record<string, number> = {};
    for (const log of logs) {
      const key = `${log.action}_${log.entityType}`;
      stats[key] = (stats[key] || 0) + 1;
    }

    return {
      totalActions: logs.length,
      breakdown: stats,
    };
  }
}
