import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSprintDto {
  @ApiProperty({
    example: 'Sprint 1',
    description: 'Sprint name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Complete user authentication and project management',
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

  @ApiProperty({
    example: 'project-uuid-here',
    description: 'Project ID this sprint belongs to',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;
}
