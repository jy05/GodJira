import { ApiProperty } from '@nestjs/swagger';

export class SprintVelocityDto {
  @ApiProperty({ description: 'Sprint ID' })
  sprintId: string;

  @ApiProperty({ description: 'Sprint name' })
  sprintName: string;

  @ApiProperty({ description: 'Sprint start date' })
  startDate: Date;

  @ApiProperty({ description: 'Sprint end date' })
  endDate: Date;

  @ApiProperty({ description: 'Committed story points' })
  committedPoints: number;

  @ApiProperty({ description: 'Completed story points' })
  completedPoints: number;

  @ApiProperty({ description: 'Number of issues completed' })
  completedIssues: number;

  @ApiProperty({ description: 'Sprint duration in days' })
  durationDays: number;

  @ApiProperty({ description: 'Velocity (points per day)' })
  velocity: number;

  @ApiProperty({ description: 'Commitment accuracy percentage' })
  commitmentAccuracy: number;
}

export class VelocityReportDto {
  @ApiProperty({ description: 'Project ID' })
  projectId: string;

  @ApiProperty({ description: 'Project name' })
  projectName: string;

  @ApiProperty({ description: 'Team ID (if filtered)' })
  teamId?: string;

  @ApiProperty({ description: 'Team name (if filtered)' })
  teamName?: string;

  @ApiProperty({ description: 'Velocity data per sprint', type: [SprintVelocityDto] })
  sprints: SprintVelocityDto[];

  @ApiProperty({ description: 'Average velocity across sprints' })
  averageVelocity: number;

  @ApiProperty({ description: 'Average completed points per sprint' })
  averageCompletedPoints: number;

  @ApiProperty({ description: 'Average commitment accuracy' })
  averageCommitmentAccuracy: number;

  @ApiProperty({ description: 'Trend direction (increasing, stable, decreasing)' })
  trend: 'increasing' | 'stable' | 'decreasing';

  @ApiProperty({ description: 'Total sprints analyzed' })
  totalSprints: number;
}
