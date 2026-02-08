import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty({ description: 'Nazwa usługi' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Opis usługi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Typ usługi', enum: ServiceType })
  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;

  @ApiPropertyOptional({ description: 'ID kategorii' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Cena bazowa' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ description: 'Waluta', default: 'PLN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Czas trwania w minutach' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ description: 'Bufor przed wizytą (minuty)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferBefore?: number;

  @ApiPropertyOptional({ description: 'Bufor po wizycie (minuty)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferAfter?: number;

  @ApiPropertyOptional({ description: 'Maksymalna pojemność', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxCapacity?: number;

  @ApiPropertyOptional({ description: 'URL obrazka' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Galeria zdjęć', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional({ description: 'Czy wymaga depozytu', default: false })
  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;

  @ApiPropertyOptional({ description: 'Kwota depozytu', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({ description: 'Czy dozwolona rezerwacja online', default: true })
  @IsOptional()
  @IsBoolean()
  allowOnlineBooking?: boolean;

  @ApiPropertyOptional({ description: 'Czy wymaga zatwierdzenia', default: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Czy aktywna', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'IDs pracowników przypisanych do usługi', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[];

  // Rezerwacje elastyczne (wielogodzinne/wielodniowe)
  @ApiPropertyOptional({ description: 'Typ rezerwacji: FIXED (stały czas) lub FLEXIBLE (klient wybiera)', default: 'FIXED' })
  @IsOptional()
  @IsString()
  bookingType?: string;

  @ApiPropertyOptional({ description: 'Czy klient może wybierać czas trwania', default: false })
  @IsOptional()
  @IsBoolean()
  flexibleDuration?: boolean;

  @ApiPropertyOptional({ description: 'Minimalny czas rezerwacji (minuty)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minDuration?: number;

  @ApiPropertyOptional({ description: 'Maksymalny czas rezerwacji (minuty)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Krok czasowy (minuty)', default: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationStep?: number;

  @ApiPropertyOptional({ description: 'Czy pozwolić na rezerwacje wielodniowe', default: false })
  @IsOptional()
  @IsBoolean()
  allowMultiDay?: boolean;

  @ApiPropertyOptional({ description: 'Cena za godzinę (dla elastycznych)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerHour?: number;

  @ApiPropertyOptional({ description: 'Cena za dzień (dla wielodniowych)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerDay?: number;
}
