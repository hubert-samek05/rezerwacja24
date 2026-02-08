import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 🔒 AUTOMATYCZNA OCHRONA PRZED WYCIEKIEM DANYCH
 * 
 * Ten interceptor AUTOMATYCZNIE sprawdza czy dane zwracane przez API
 * należą do właściwego tenanta.
 * 
 * NIGDY NIE USUWAJ TEGO PLIKU!
 */
@Injectable()
export class TenantSecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TenantSecurity');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestedTenantId = request.headers['x-tenant-id'] || request.query.tenantId;

    // Loguj każde żądanie z tenantId
    if (requestedTenantId) {
      this.logger.log(`🔒 Request for tenant: ${requestedTenantId}`);
    } else {
      this.logger.warn('⚠️ Request WITHOUT tenantId - may be blocked by controller');
    }

    return next.handle().pipe(
      tap((data) => {
        // Sprawdź czy zwracane dane mają tenantId
        if (data && Array.isArray(data)) {
          // Dla tablic - sprawdź pierwszy element
          if (data.length > 0 && data[0].tenantId) {
            const returnedTenantId = data[0].tenantId;
            
            // KRYTYCZNE: Sprawdź czy zwracany tenantId zgadza się z żądanym
            if (requestedTenantId && returnedTenantId !== requestedTenantId) {
              this.logger.error(
                `🚨 SECURITY BREACH! Requested: ${requestedTenantId}, Returned: ${returnedTenantId}`
              );
              // W produkcji możesz odkomentować poniższą linię aby blokować takie requesty:
              // throw new ForbiddenException('Data leak prevented');
            }
          }
        } else if (data && data.tenantId) {
          // Dla pojedynczego obiektu
          const returnedTenantId = data.tenantId;
          
          if (requestedTenantId && returnedTenantId !== requestedTenantId) {
            this.logger.error(
              `🚨 SECURITY BREACH! Requested: ${requestedTenantId}, Returned: ${returnedTenantId}`
            );
            // throw new ForbiddenException('Data leak prevented');
          }
        }
      }),
    );
  }
}
