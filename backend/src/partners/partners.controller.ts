import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  Req, 
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PartnersService } from './partners.service';
import { 
  RegisterPartnerDto, 
  LoginPartnerDto, 
  UpdatePartnerDto, 
  RequestPayoutDto,
  ApprovePartnerDto,
  TrackClickDto,
} from './dto/partner.dto';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // ==========================================
  // PUBLICZNE ENDPOINTY
  // ==========================================

  @Post('register')
  @ApiOperation({ summary: 'Rejestracja nowego partnera' })
  @ApiResponse({ status: 201, description: 'Partner zarejestrowany' })
  async register(@Body() dto: RegisterPartnerDto) {
    return this.partnersService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Logowanie partnera' })
  @ApiResponse({ status: 200, description: 'Zalogowano pomyślnie' })
  async login(@Body() dto: LoginPartnerDto, @Res() res: Response) {
    const partner = await this.partnersService.login(dto);
    
    // Ustaw cookie z ID partnera (w produkcji użyj JWT)
    res.cookie('partner_id', partner.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
      sameSite: 'lax',
    });

    return res.status(HttpStatus.OK).json(partner);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Wylogowanie partnera' })
  async logout(@Res() res: Response) {
    res.clearCookie('partner_id');
    return res.status(HttpStatus.OK).json({ message: 'Wylogowano' });
  }

  // Śledzenie kliknięcia w link partnerski
  @Get('track/:referralCode')
  @ApiOperation({ summary: 'Śledź kliknięcie w link partnerski' })
  async trackClick(
    @Param('referralCode') referralCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('redirect') redirect?: string,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];
    const referer = req.headers['referer'] as string;

    const result = await this.partnersService.trackClick(
      referralCode,
      ipAddress,
      userAgent,
      referer,
      redirect,
    );

    if (result) {
      // Ustaw cookie z kodem partnerskim (ważne 30 dni)
      res.cookie('referral_code', referralCode, {
        httpOnly: false, // Frontend musi mieć dostęp
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dni
        sameSite: 'lax',
      });
    }

    // Przekieruj na stronę rejestracji
    const frontendUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';
    const redirectUrl = redirect || `${frontendUrl}/rejestracja?ref=${referralCode}`;
    
    return res.redirect(redirectUrl);
  }

  // Pobierz info o partnerze po kodzie (dla strony rejestracji)
  @Get('info/:referralCode')
  @ApiOperation({ summary: 'Pobierz informacje o partnerze po kodzie' })
  async getPartnerInfo(@Param('referralCode') referralCode: string) {
    const partner = await this.partnersService.getPartnerByReferralCode(referralCode);
    
    if (!partner || partner.status !== 'ACTIVE') {
      return { valid: false };
    }

    return {
      valid: true,
      companyName: partner.companyName,
      discount: Number(partner.referralDiscount),
      discountMonths: partner.discountMonths,
    };
  }

  // ==========================================
  // PANEL PARTNERA (wymaga zalogowania)
  // ==========================================

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard partnera' })
  async getDashboard(@Req() req: Request) {
    const partnerId = req.cookies?.partner_id;
    if (!partnerId) {
      return { error: 'Nie zalogowano', statusCode: 401 };
    }
    return this.partnersService.getPartnerDashboard(partnerId);
  }

  @Get('conversions')
  @ApiOperation({ summary: 'Lista konwersji partnera' })
  async getConversions(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const partnerId = req.cookies?.partner_id;
    if (!partnerId) {
      return { error: 'Nie zalogowano', statusCode: 401 };
    }
    return this.partnersService.getPartnerConversions(partnerId, parseInt(page), parseInt(limit));
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Lista prowizji partnera' })
  async getCommissions(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const partnerId = req.cookies?.partner_id;
    if (!partnerId) {
      return { error: 'Nie zalogowano', statusCode: 401 };
    }
    return this.partnersService.getPartnerCommissions(partnerId, parseInt(page), parseInt(limit));
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Historia wypłat partnera' })
  async getPayouts(@Req() req: Request) {
    const partnerId = req.cookies?.partner_id;
    if (!partnerId) {
      return { error: 'Nie zalogowano', statusCode: 401 };
    }
    return this.partnersService.getPartnerPayouts(partnerId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Aktualizuj profil partnera' })
  async updateProfile(@Req() req: Request, @Body() dto: UpdatePartnerDto) {
    const partnerId = req.cookies?.partner_id;
    if (!partnerId) {
      return { error: 'Nie zalogowano', statusCode: 401 };
    }
    return this.partnersService.updatePartner(partnerId, dto);
  }

  @Post('payout/request')
  @ApiOperation({ summary: 'Złóż wniosek o wypłatę' })
  async requestPayout(@Req() req: Request, @Body() dto: RequestPayoutDto) {
    const partnerId = req.cookies?.partner_id;
    if (!partnerId) {
      return { error: 'Nie zalogowano', statusCode: 401 };
    }
    return this.partnersService.requestPayout(partnerId, dto);
  }

  // ==========================================
  // ENDPOINTY ADMINISTRACYJNE
  // ==========================================

  @Get('admin/list')
  @ApiOperation({ summary: '[Admin] Lista wszystkich partnerów' })
  async adminListPartners(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    // TODO: Dodać guard dla admina
    return this.partnersService.getAllPartners(status, parseInt(page), parseInt(limit));
  }

  @Post('admin/:partnerId/approve')
  @ApiOperation({ summary: '[Admin] Zatwierdź partnera' })
  async adminApprovePartner(
    @Param('partnerId') partnerId: string,
    @Body() dto: ApprovePartnerDto,
    @Req() req: Request,
  ) {
    // TODO: Pobierz adminId z tokenu
    const adminId = 'admin';
    return this.partnersService.approvePartner(partnerId, adminId, dto);
  }

  @Post('admin/:partnerId/reject')
  @ApiOperation({ summary: '[Admin] Odrzuć partnera' })
  async adminRejectPartner(
    @Param('partnerId') partnerId: string,
    @Body() body: { reason?: string },
    @Req() req: Request,
  ) {
    const adminId = 'admin';
    return this.partnersService.rejectPartner(partnerId, adminId, body.reason);
  }

  @Post('admin/:partnerId/suspend')
  @ApiOperation({ summary: '[Admin] Zawieś partnera' })
  async adminSuspendPartner(
    @Param('partnerId') partnerId: string,
    @Body() body: { reason?: string },
    @Req() req: Request,
  ) {
    const adminId = 'admin';
    return this.partnersService.suspendPartner(partnerId, adminId, body.reason);
  }

  @Get('admin/payouts/pending')
  @ApiOperation({ summary: '[Admin] Lista oczekujących wypłat' })
  async adminPendingPayouts() {
    return this.partnersService.getPendingPayouts();
  }

  @Post('admin/payouts/:payoutId/process')
  @ApiOperation({ summary: '[Admin] Zrealizuj wypłatę' })
  async adminProcessPayout(
    @Param('payoutId') payoutId: string,
    @Body() body: { transferId?: string; notes?: string },
    @Req() req: Request,
  ) {
    const adminId = 'admin';
    return this.partnersService.processPayoutAdmin(payoutId, adminId, body.transferId, body.notes);
  }
}
