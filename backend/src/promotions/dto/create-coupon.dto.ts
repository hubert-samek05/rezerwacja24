import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateCouponDto {
  @ApiProperty({ description: 'Kod rabatowy', example: 'LATO2024' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Opis kodu rabatowego' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Typ rabatu', enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Wartość rabatu', example: 10 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Minimalna wartość zamówienia' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiPropertyOptional({ description: 'Maksymalny rabat (dla procentowych)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Limit użyć' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ description: 'Data rozpoczęcia ważności' })
  @IsDateString()
  validFrom: string;

  @ApiPropertyOptional({ description: 'Data zakończenia ważności' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Czy kod jest aktywny', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
