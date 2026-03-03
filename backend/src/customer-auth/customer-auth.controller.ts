import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Headers,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerAuthService } from './customer-auth.service';
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  RefreshTokenDto,
  UpdateCustomerProfileDto,
} from './dto/customer-auth.dto';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Customer Auth')
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Rejestracja konta klienta' })
  @ApiResponse({ status: 201, description: 'Konto utworzone' })
  @ApiResponse({ status: 409, description: 'Email już istnieje' })
  async register(@Body() dto: RegisterCustomerDto) {
    return this.customerAuthService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logowanie klienta' })
  @ApiResponse({ status: 200, description: 'Zalogowano' })
  @ApiResponse({ status: 401, description: 'Nieprawidłowe dane' })
  async login(@Body() dto: LoginCustomerDto) {
    return this.customerAuthService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Odśwież tokeny' })
  @ApiResponse({ status: 200, description: 'Tokeny odświeżone' })
  @ApiResponse({ status: 401, description: 'Nieprawidłowy refresh token' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.customerAuthService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Wylogowanie' })
  @ApiResponse({ status: 200, description: 'Wylogowano' })
  async logout(@Req() req: any) {
    return this.customerAuthService.logout(req.customerAccountId);
  }

  @Get('me')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pobierz profil zalogowanego klienta' })
  @ApiResponse({ status: 200, description: 'Profil klienta' })
  async getProfile(@Req() req: any) {
    return this.customerAuthService.getProfile(req.customerAccountId);
  }

  @Patch('me')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktualizuj profil klienta' })
  @ApiResponse({ status: 200, description: 'Profil zaktualizowany' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateCustomerProfileDto) {
    return this.customerAuthService.updateProfile(req.customerAccountId, dto);
  }

  @Get('bookings')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pobierz wszystkie rezerwacje klienta' })
  @ApiResponse({ status: 200, description: 'Lista rezerwacji' })
  async getMyBookings(@Req() req: any) {
    return this.customerAuthService.getMyBookings(req.customerAccountId);
  }

  @Get('loyalty')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pobierz punkty lojalnościowe klienta per firma' })
  @ApiResponse({ status: 200, description: 'Lista punktów per firma' })
  async getMyLoyaltyPoints(@Req() req: any) {
    return this.customerAuthService.getMyLoyaltyPoints(req.customerAccountId);
  }

  @Get('passes')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pobierz karnety klienta' })
  @ApiResponse({ status: 200, description: 'Lista karnetów (aktywne i wygasłe)' })
  async getMyPasses(@Req() req: any) {
    return this.customerAuthService.getMyPasses(req.customerAccountId);
  }

  @Get('bookings/:id')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pobierz szczegóły rezerwacji z ustawieniami firmy' })
  @ApiResponse({ status: 200, description: 'Szczegóły rezerwacji' })
  async getBookingDetails(@Req() req: any, @Param('id') bookingId: string) {
    return this.customerAuthService.getBookingDetails(req.customerAccountId, bookingId);
  }

  @Post('bookings/:id/cancel')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anuluj rezerwację' })
  @ApiResponse({ status: 200, description: 'Rezerwacja anulowana' })
  async cancelBooking(@Req() req: any, @Param('id') bookingId: string, @Body('reason') reason?: string) {
    return this.customerAuthService.cancelBooking(req.customerAccountId, bookingId, reason);
  }

  @Post('bookings/:id/reschedule')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generuj link do przesunięcia rezerwacji' })
  @ApiResponse({ status: 200, description: 'Link do przesunięcia' })
  async getRescheduleLink(@Req() req: any, @Param('id') bookingId: string) {
    return this.customerAuthService.getRescheduleLink(req.customerAccountId, bookingId);
  }

  // ==================== OAUTH ====================
  
  @Get('oauth/google')
  @ApiOperation({ summary: 'Przekierowanie do Google OAuth (dla klientów)' })
  async googleAuth(@Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('FRONTEND_URL') + '/oauth/google/callback';
    const scope = 'email profile';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=customer`;
    
    return res.redirect(googleAuthUrl);
  }

  @Get('oauth/apple')
  @ApiOperation({ summary: 'Przekierowanie do Apple Sign In (dla klientów)' })
  async appleAuth(@Res() res: Response) {
    const clientId = this.configService.get<string>('APPLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('FRONTEND_URL') + '/oauth/apple/callback';
    
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=name%20email&response_mode=form_post&state=customer`;
    
    return res.redirect(appleAuthUrl);
  }
}
