import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Guard sprawdzający czy użytkownik ma dostęp do danego tenanta
 * Używany w endpointach /api/tenants/:id/*
 * 
 * Sprawdza:
 * 1. Czy token JWT jest prawidłowy
 * 2. Czy tenantId z tokena === id z URL (lub user jest SUPER_ADMIN)
 */
@Injectable()
export class TenantAccessGuard implements CanActivate {
  private readonly logger = new Logger(TenantAccessGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantIdFromUrl = request.params?.id;

    // Pobierz token z headera
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('TenantAccessGuard: Brak tokena autoryzacji');
      throw new ForbiddenException('Brak autoryzacji');
    }

    const token = authHeader.substring(7);

    try {
      // Weryfikuj token
      const payload = this.jwtService.verify(token);
      
      // Zapisz użytkownika w request
      request.user = {
        userId: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        role: payload.role,
      };

      // SUPER_ADMIN ma dostęp do wszystkiego
      if (payload.role === 'SUPER_ADMIN') {
        return true;
      }

      // Sprawdź czy tenantId z tokena === id z URL (porównuj jako stringi)
      const tokenTenantId = String(payload.tenantId);
      const urlTenantId = String(tenantIdFromUrl);
      
      if (tokenTenantId !== urlTenantId) {
        this.logger.warn(
          `TenantAccessGuard: Odmowa dostępu. Token tenantId: ${tokenTenantId}, URL id: ${urlTenantId}`,
        );
        throw new ForbiddenException('Brak dostępu do tego zasobu');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.warn(`TenantAccessGuard: Nieprawidłowy token - ${error.message}`);
      throw new ForbiddenException('Nieprawidłowy token autoryzacji');
    }
  }
}
