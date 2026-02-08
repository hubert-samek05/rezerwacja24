import { IsEmail, IsString, IsOptional, MinLength, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO do rejestracji partnera
export class RegisterPartnerDto {
  @ApiProperty({ description: 'Nazwa firmy partnera' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Imię i nazwisko osoby kontaktowej' })
  @IsString()
  contactName: string;

  @ApiProperty({ description: 'Email partnera' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Telefon kontaktowy' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Hasło do panelu partnera', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ description: 'NIP firmy' })
  @IsOptional()
  @IsString()
  taxId?: string;
}

// DTO do logowania partnera
export class LoginPartnerDto {
  @ApiProperty({ description: 'Email partnera' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Hasło' })
  @IsString()
  password: string;
}

// DTO do aktualizacji danych partnera
export class UpdatePartnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Numer konta bankowego do wypłat' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ description: 'Nazwa banku' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'NIP' })
  @IsOptional()
  @IsString()
  taxId?: string;
}

// DTO do żądania wypłaty
export class RequestPayoutDto {
  @ApiProperty({ description: 'Kwota do wypłaty', minimum: 100 })
  @IsNumber()
  @Min(100, { message: 'Minimalna kwota wypłaty to 100 zł' })
  amount: number;

  @ApiProperty({ description: 'Numer konta bankowego' })
  @IsString()
  bankAccount: string;

  @ApiPropertyOptional({ description: 'Nazwa banku' })
  @IsOptional()
  @IsString()
  bankName?: string;
}

// DTO do śledzenia kliknięcia w link partnerski
export class TrackClickDto {
  @ApiProperty({ description: 'Kod polecający partnera' })
  @IsString()
  referralCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landingPage?: string;
}

// DTO do zatwierdzania partnera (admin)
export class ApprovePartnerDto {
  @ApiPropertyOptional({ description: 'Jednorazowa prowizja (domyślnie 50 zł)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oneTimeCommission?: number;

  @ApiPropertyOptional({ description: 'Prowizja recurring w % (domyślnie 10%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  recurringCommission?: number;

  @ApiPropertyOptional({ description: 'Rabat dla poleconych w % (domyślnie 20%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  referralDiscount?: number;
}

// Response DTOs
export class PartnerStatsDto {
  totalClicks: number;
  totalRegistrations: number;
  totalPaidCustomers: number;
  totalEarnings: number;
  pendingPayout: number;
  conversionRate: number;
  referralLink: string;
}

export class PartnerConversionDto {
  id: string;
  tenantName: string;
  status: string;
  registeredAt: Date;
  firstPaymentAt: Date | null;
  oneTimeAmount: number | null;
  totalRecurringPaid: number;
}

export class PartnerCommissionDto {
  id: string;
  type: string;
  amount: number;
  month: number | null;
  status: string;
  createdAt: Date;
  tenantName?: string;
}

export class PartnerPayoutDto {
  id: string;
  amount: number;
  status: string;
  requestedAt: Date;
  processedAt: Date | null;
  bankAccount: string;
}
