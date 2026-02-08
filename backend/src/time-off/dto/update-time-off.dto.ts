import { PartialType } from '@nestjs/swagger';
import { CreateTimeOffDto } from './create-time-off.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateTimeOffDto extends PartialType(
  OmitType(CreateTimeOffDto, ['employeeId'] as const),
) {}
