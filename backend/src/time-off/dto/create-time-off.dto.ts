import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeOffDto {
  @ApiProperty({ description: 'ID pracownika' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Data i godzina rozpoczęcia (ISO 8601)' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Data i godzina zakończenia (ISO 8601)' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Powód (urlop, choroba, itp.)' })
  @IsOptional()
  @IsString()
  reason?: string;
}
