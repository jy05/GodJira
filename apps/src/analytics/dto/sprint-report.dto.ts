import { ApiProperty } from '@nestjs/swagger';
import { IssueStatus, IssueType, IssuePriority } from '@prisma/client';

export class IssueBreakdownDto {
  @ApiProperty({ description: 'Category (status, type, priority)' })
  category: string;

  @ApiProperty({ description: 'Count of issues' })
  count: number;

  @ApiProperty({ description: 'Percentage of total' })
  percentage: number;

  @ApiProperty({ description: 'Total story points' })
  storyPoints: number;
}

export class SprintSummaryDto {
  @ApiProperty({ description: 'Total issues in sprint' })
  totalIssues: number;

  @ApiProperty({ description: 'Completed issues' })
  completedIssues: number;

  @ApiProperty({ description: 'In-progress issues' })
  inProgressIssues: number;

  @ApiProperty({ description: 'Not started issues' })
  notStartedIssues: number;

  @ApiProperty({ description: 'Total story points' })
  totalStoryPoints: number;

  @ApiProperty({ description: 'Completed story points' })
  completedStoryPoints: number;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;

  @ApiProperty({ description: 'Issues added during sprint' })
  addedDuringSprint: number;

  @ApiProperty({ description: 'Issues removed during sprint' })
  removedDuringSprint: number;

  @ApiProperty({ description: 'Total work logs (minutes)' })
  totalTimeLoggedMinutes: number;
}

export class SprintReportDto {
  @ApiProperty({ description: 'Sprint ID' })
  sprintId: string;

  @ApiProperty({ description: 'Sprint name' })
  sprintName: string;

  @ApiProperty({ description: 'Sprint goal' })
  goal?: string;

  @ApiProperty({ description: 'Sprint start date' })
  startDate: Date;

  @ApiProperty({ description: 'Sprint end date' })
  endDate: Date;

  @ApiProperty({ description: 'Sprint status' })
  status: string;

  @ApiProperty({ description: 'Project ID' })
  projectId: string;

  @ApiProperty({ description: 'Project name' })
  projectName: string;

  @ApiProperty({ description: 'Sprint summary', type: SprintSummaryDto })
  summary: SprintSummaryDto;

  @ApiProperty({ description: 'Issues by status', type: [IssueBreakdownDto] })
  issuesByStatus: IssueBreakdownDto[];

  @ApiProperty({ description: 'Issues by type', type: [IssueBreakdownDto] })
  issuesByType: IssueBreakdownDto[];

  @ApiProperty({ description: 'Issues by priority', type: [IssueBreakdownDto] })
  issuesByPriority: IssueBreakdownDto[];

  @ApiProperty({ description: 'Top contributors (by completed issues)' })
  topContributors: Array<{
    userId: string;
    userName: string;
    completedIssues: number;
    completedPoints: number;
  }>;

  @ApiProperty({ description: 'Sprint velocity (points per day)' })
  velocity: number;

  @ApiProperty({ description: 'Days elapsed' })
  daysElapsed: number;

  @ApiProperty({ description: 'Days remaining' })
  daysRemaining: number;
}
