import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // Pobierz tenantId z JWT tokena (req.user)
    const tenantId = request.user?.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID not found in JWT token');
    }
    
    return tenantId;
  },
);
