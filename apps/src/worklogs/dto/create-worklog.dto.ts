import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateWorkLogDto {
  @ApiProperty({
    description: 'Description of the work performed',
    example: 'Implemented user authentication feature',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Time spent in minutes',
    example: 120,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  timeSpent: number;

  @ApiProperty({
    description: 'Issue ID for which work was logged',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  issueId: string;

  @ApiProperty({
    description: 'Date when work was performed (defaults to current date)',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  logDate?: string;
}
