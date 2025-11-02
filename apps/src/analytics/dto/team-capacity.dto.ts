import { ApiProperty } from '@nestjs/swagger';

export class UserCapacityDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User name' })
  userName: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

  @ApiProperty({ description: 'Total assigned story points' })
  assignedPoints: number;

  @ApiProperty({ description: 'Completed story points' })
  completedPoints: number;

  @ApiProperty({ description: 'In-progress story points' })
  inProgressPoints: number;

  @ApiProperty({ description: 'Number of assigned issues' })
  assignedIssues: number;

  @ApiProperty({ description: 'Number of completed issues' })
  completedIssues: number;

  @ApiProperty({ description: 'Number of in-progress issues' })
  inProgressIssues: number;

  @ApiProperty({ description: 'Total time logged (minutes)' })
  timeLoggedMinutes: number;

  @ApiProperty({ description: 'Capacity utilization percentage' })
  utilizationPercentage: number;

  @ApiProperty({ description: 'Average completion time per issue (days)' })
  averageCompletionTimeDays: number;
}

export class TeamCapacityReportDto {
  @ApiProperty({ description: 'Team ID' })
  teamId: string;

  @ApiProperty({ description: 'Team name' })
  teamName: string;

  @ApiProperty({ description: 'Sprint ID (if filtered)' })
  sprintId?: string;

  @ApiProperty({ description: 'Sprint name (if filtered)' })
  sprintName?: string;

  @ApiProperty({ description: 'Report period start date' })
  startDate: Date;

  @ApiProperty({ description: 'Report period end date' })
  endDate: Date;

  @ApiProperty({ description: 'Capacity data per user', type: [UserCapacityDto] })
  members: UserCapacityDto[];

  @ApiProperty({ description: 'Total team capacity (story points)' })
  totalTeamCapacity: number;

  @ApiProperty({ description: 'Total committed story points' })
  totalCommittedPoints: number;

  @ApiProperty({ description: 'Total completed story points' })
  totalCompletedPoints: number;

  @ApiProperty({ description: 'Team utilization percentage' })
  teamUtilization: number;

  @ApiProperty({ description: 'Total team members' })
  teamSize: number;

  @ApiProperty({ description: 'Average points per member' })
  averagePointsPerMember: number;

  @ApiProperty({ description: 'Total time logged by team (minutes)' })
  totalTimeLoggedMinutes: number;
}
