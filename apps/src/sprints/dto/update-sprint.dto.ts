import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSprintDto {
  @ApiProperty({
    example: 'Sprint 1 - Updated',
    description: 'Sprint name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Updated sprint goal',
    description: 'Sprint goal',
    required: false,
  })
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiProperty({
    example: '2025-11-01T00:00:00Z',
    description: 'Sprint start date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2025-11-15T23:59:59Z',
    description: 'Sprint end date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
