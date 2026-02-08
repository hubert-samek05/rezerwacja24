import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from '../../billing/billing.service';

/**
 * Guard sprawdzający czy tenant ma aktywną subskrypcję
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private reflector: Reflector,
    private billingService: BillingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Sprawdź czy endpoint wymaga subskrypcji
    const requiresSubscription = this.reflector.get<boolean>(
      'requiresSubscription',
      context.getHandler(),
    );

    // Jeśli nie wymaga, przepuść
    if (requiresSubscription === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.logger.warn('Brak tenantId w request');
      return true; // Przepuść, auth guard powinien to wyłapać
    }

    // Sprawdź czy tenant ma aktywną subskrypcję
    const hasActiveSubscription = await this.billingService.hasActiveSubscription(tenantId);

    if (!hasActiveSubscription) {
      throw new ForbiddenException(
        'Brak aktywnej subskrypcji. Proszę aktywować subskrypcję aby kontynuować.',
      );
    }

    // Dodaj informacje o subskrypcji do request
    const subscription = await this.billingService.getSubscription(tenantId);
    request.subscription = subscription;

    return true;
  }
}
