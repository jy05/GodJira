import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
}

export class ExportQueryDto {
  @ApiProperty({
    enum: ExportFormat,
    description: 'Export format',
    example: 'excel',
  })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({
    required: false,
    description: 'Project ID filter',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    required: false,
    description: 'Sprint ID filter',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiProperty({
    required: false,
    description: 'Start date (ISO format)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'End date (ISO format)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
