import { PartialType } from '@nestjs/swagger';
import { CreateWorkLogDto } from './create-worklog.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class UpdateWorkLogDto extends PartialType(CreateWorkLogDto) {
  @ApiProperty({
    description: 'Description of the work performed',
    example: 'Updated user authentication feature',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Time spent in minutes',
    example: 90,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeSpent?: number;

  @ApiProperty({
    description: 'Date when work was performed',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  logDate?: string;
}
