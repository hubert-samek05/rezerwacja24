import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Brak tokenu autoryzacji');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'customer') {
        throw new UnauthorizedException('Nieprawidłowy typ tokenu');
      }

      // Dodaj ID konta klienta do requestu
      request.customerAccountId = payload.sub;
      request.customerEmail = payload.email;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token');
    }
  }
}
