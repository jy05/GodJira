import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum TimeRangeType {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  CURRENT_SPRINT = 'CURRENT_SPRINT',
  CUSTOM = 'CUSTOM',
}

export class AnalyticsFilterDto {
  @ApiPropertyOptional({ description: 'Project ID to filter by' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Sprint ID to filter by' })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({ description: 'Team ID to filter by' })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({ description: 'User ID to filter by' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    enum: TimeRangeType,
    description: 'Time range type',
    default: TimeRangeType.LAST_30_DAYS,
  })
  @IsOptional()
  @IsEnum(TimeRangeType)
  timeRange?: TimeRangeType = TimeRangeType.LAST_30_DAYS;

  @ApiPropertyOptional({ description: 'Start date for custom range' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom range' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
