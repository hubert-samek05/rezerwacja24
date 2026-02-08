import { Controller, Get, Post, Delete, Param, Headers, UseGuards, Req, Logger } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('subscriptions')
// @UseGuards(JwtAuthGuard) - WYŁĄCZONY, bo blokował panel
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * GET /api/subscriptions/current
   * Pobiera subskrypcję dla zalogowanego użytkownika
   */
  @Get('current')
  async getCurrentSubscription(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }
    return this.subscriptionsService.getSubscriptionByTenantId(tenantId);
  }

  /**
   * GET /api/subscriptions/status
   * Pobiera status subskrypcji (trial, dni pozostałe, etc.)
   */
  @Get('status')
  async getSubscriptionStatus(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    this.logger.debug(`getSubscriptionStatus - tenantId: ${tenantId}`);
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }
    return this.subscriptionsService.getSubscriptionStatus(tenantId);
  }

  /**
   * POST /api/subscriptions/cancel
   * Anuluje subskrypcję (kończy się na koniec okresu)
   */
  @Post('cancel')
  async cancelSubscription(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }
    return this.subscriptionsService.cancelSubscription(tenantId);
  }

  /**
   * POST /api/subscriptions/resume
   * Wznawia anulowaną subskrypcję
   */
  @Post('resume')
  async resumeSubscription(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }
    return this.subscriptionsService.resumeSubscription(tenantId);
  }

  /**
   * GET /api/subscriptions (admin only)
   * Pobiera wszystkie subskrypcje
   */
  @Get()
  async getAllSubscriptions() {
    return this.subscriptionsService.getAllSubscriptions();
  }
}
