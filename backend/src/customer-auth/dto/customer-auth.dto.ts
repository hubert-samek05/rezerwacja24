import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'jan.kowalski@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Kowalski' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+48123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}

export class LoginCustomerDto {
  @ApiProperty({ example: 'jan.kowalski@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'jan.kowalski@email.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class SocialLoginDto {
  @ApiProperty({ enum: ['google', 'facebook', 'apple'] })
  @IsString()
  provider: 'google' | 'facebook' | 'apple';

  @ApiProperty({ description: 'Token from OAuth provider' })
  @IsString()
  token: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ example: 'Jan' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Kowalski' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+48123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'pl' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}
