import { Controller, Post, Body, Get, UseGuards, Req, Res, Logger, Query } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  twoFactorCode?: string;

  @IsOptional()
  @IsString()
  profileType?: 'owner' | 'employee';
}

class TwoFactorCodeDto {
  @IsString()
  code: string;
}

class TwoFactorVerifyLoginDto {
  @IsString()
  tempToken: string;

  @IsString()
  code: string;
}

class RegisterDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  businessName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  plan?: string; // starter, standard, pro
}

class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('test')
  async test() {
    return { message: 'Test endpoint works!' };
  }

  /**
   * Login endpoint z ograniczeniem rate limiting
   * Maksymalnie 5 prób logowania na minutę z jednego IP
   */
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`Login attempt for: ${loginDto.email}, profileType: ${loginDto.profileType || 'auto'}`);
    
    const loginResult = await this.authService.login(
      loginDto.email, 
      loginDto.password,
      loginDto.twoFactorCode,
      loginDto.profileType
    );
    
    return loginResult;
  }

  /**
   * Weryfikacja kodu 2FA podczas logowania
   */
  @Public()
  @Post('2fa/verify-login')
  async verifyTwoFactorLogin(@Body() dto: TwoFactorVerifyLoginDto) {
    return this.authService.verifyTwoFactorLogin(dto.tempToken, dto.code);
  }

  /**
   * Włącz 2FA (kod będzie wysyłany na email przy logowaniu)
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enableTwoFactor(@Req() req: Request) {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return this.twoFactorService.enableTwoFactor(userId);
  }

  /**
   * Wyłącz 2FA
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disableTwoFactor(@Req() req: Request) {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return this.twoFactorService.disableTwoFactor(userId);
  }

  /**
   * Sprawdź status 2FA
   */
  @UseGuards(JwtAuthGuard)
  @Get('2fa/status')
  async getTwoFactorStatus(@Req() req: Request) {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new Error('Unauthorized');
    }
    const enabled = await this.twoFactorService.isTwoFactorEnabled(userId);
    return { enabled };
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response, @Query('state') state?: string) {
    // Ręcznie budujemy URL do Google OAuth z opcjonalnym state
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    const scope = encodeURIComponent('email profile');
    
    let googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    // Dodaj state jeśli przekazany (dla mobile app)
    if (state) {
      googleAuthUrl += `&state=${encodeURIComponent(state)}`;
    }
    
    res.redirect(googleAuthUrl);
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response, @Query('state') state?: string) {
    // Obsługa callback z Google
    const googleUser = req.user as any;
    const result = await this.authService.googleLogin(googleUser);
    
    // Sprawdź czy to request z aplikacji mobilnej (state może zawierać redirect_uri)
    let redirectUrl: string;
    
    // Dekoduj state jeśli istnieje (może zawierać redirect_uri dla mobile)
    // State może być w query lub w user object
    const stateParam = state || googleUser?.state;
    if (stateParam) {
      try {
        const stateData = JSON.parse(Buffer.from(stateParam, 'base64').toString());
        if (stateData.redirect_uri) {
          redirectUrl = `${stateData.redirect_uri}?token=${result.access_token}`;
          this.logger.log(`📱 Mobile OAuth redirect to: ${stateData.redirect_uri}`);
        }
      } catch (e) {
        // State nie jest JSON, użyj domyślnego
        this.logger.debug('State is not valid JSON, using default redirect');
      }
    }
    
    // Domyślne przekierowanie do frontendu
    if (!redirectUrl) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
    }
    
    res.redirect(redirectUrl);
  }

  // ==================== APPLE SIGN IN ====================
  
  @Public()
  @Get('apple')
  async appleAuth(@Req() req: Request, @Res() res: Response, @Query('state') state?: string) {
    // Ręcznie budujemy URL do Apple OAuth
    const clientId = process.env.APPLE_CLIENT_ID;
    const callbackUrl = process.env.APPLE_CALLBACK_URL;
    const scope = 'name email';
    
    let appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code id_token&scope=${encodeURIComponent(scope)}&response_mode=form_post`;
    
    // Dodaj state jeśli przekazany (dla mobile app)
    if (state) {
      appleAuthUrl += `&state=${encodeURIComponent(state)}`;
    }
    
    res.redirect(appleAuthUrl);
  }

  @Public()
  @Post('apple/callback')
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Apple wysyła dane jako POST form-data
    const { code, id_token, state, user } = req.body as any;
    
    this.logger.log(`🍎 Apple OAuth callback received`);
    
    try {
      // Dekoduj id_token (JWT) żeby wyciągnąć dane użytkownika
      const tokenParts = id_token.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      // Parsuj dane użytkownika (Apple wysyła je tylko przy pierwszej autoryzacji)
      let firstName = 'Apple';
      let lastName = 'User';
      
      if (user) {
        try {
          const userData = typeof user === 'string' ? JSON.parse(user) : user;
          firstName = userData.name?.firstName || firstName;
          lastName = userData.name?.lastName || lastName;
        } catch (e) {
          this.logger.warn('Could not parse Apple user data');
        }
      }
      
      const appleUser = {
        appleId: payload.sub,
        email: payload.email,
        firstName,
        lastName,
        state,
      };
      
      const result = await this.authService.appleLogin(appleUser);
      
      // Sprawdź czy to request z aplikacji mobilnej
      let redirectUrl: string;
      
      if (state) {
        try {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
          if (stateData.redirect_uri) {
            redirectUrl = `${stateData.redirect_uri}?token=${result.access_token}`;
            this.logger.log(`📱 Mobile Apple OAuth redirect to: ${stateData.redirect_uri}`);
          }
        } catch (e) {
          this.logger.debug('State is not valid JSON, using default redirect');
        }
      }
      
      // Domyślne przekierowanie do frontendu
      if (!redirectUrl) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
      }
      
      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Apple OAuth error: ${error.message}`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=apple_auth_failed`);
    }
  }

  @Public()
  @Post('apple/native')
  async appleNativeAuth(@Body() body: any) {
    // Endpoint dla natywnego Sign in with Apple z iOS
    this.logger.log(`🍎 Native Apple Sign In received`);
    
    try {
      const { identityToken, authorizationCode, user, email, givenName, familyName } = body;
      
      if (!identityToken) {
        throw new Error('Missing identity token');
      }
      
      // Dekoduj identity token (JWT) żeby wyciągnąć dane użytkownika
      const tokenParts = identityToken.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      const appleUser = {
        appleId: payload.sub,
        email: email || payload.email,
        firstName: givenName || 'Apple',
        lastName: familyName || 'User',
      };
      
      this.logger.log(`🍎 Native Apple user: ${appleUser.email || appleUser.appleId}`);
      
      const result = await this.authService.appleLogin(appleUser);
      
      return result;
    } catch (error) {
      this.logger.error(`Native Apple Sign In error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }
}
