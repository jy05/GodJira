import { ApiProperty } from '@nestjs/swagger';

export class BurndownDataPointDto {
  @ApiProperty({ description: 'Date of the data point' })
  date: Date;

  @ApiProperty({ description: 'Ideal remaining work' })
  idealRemaining: number;

  @ApiProperty({ description: 'Actual remaining work' })
  actualRemaining: number;

  @ApiProperty({ description: 'Number of issues completed' })
  completedIssues: number;

  @ApiProperty({ description: 'Number of issues added during sprint' })
  addedIssues: number;

  @ApiProperty({ description: 'Number of issues removed during sprint' })
  removedIssues: number;
}

export class BurndownChartDto {
  @ApiProperty({ description: 'Sprint ID' })
  sprintId: string;

  @ApiProperty({ description: 'Sprint name' })
  sprintName: string;

  @ApiProperty({ description: 'Sprint start date' })
  startDate: Date;

  @ApiProperty({ description: 'Sprint end date' })
  endDate: Date;

  @ApiProperty({ description: 'Total initial story points' })
  totalStoryPoints: number;

  @ApiProperty({ description: 'Completed story points' })
  completedStoryPoints: number;

  @ApiProperty({ description: 'Remaining story points' })
  remainingStoryPoints: number;

  @ApiProperty({ description: 'Total initial issue count' })
  totalIssues: number;

  @ApiProperty({ description: 'Completed issue count' })
  completedIssues: number;

  @ApiProperty({ description: 'Remaining issue count' })
  remainingIssues: number;

  @ApiProperty({ description: 'Burndown data points', type: [BurndownDataPointDto] })
  dataPoints: BurndownDataPointDto[];

  @ApiProperty({ description: 'Whether sprint is on track' })
  onTrack: boolean;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;

  @ApiProperty({ description: 'Days remaining' })
  daysRemaining: number;

  @ApiProperty({ description: 'Velocity (points per day)' })
  velocity: number;
}
