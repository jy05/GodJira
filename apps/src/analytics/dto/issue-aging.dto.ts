import { ApiProperty } from '@nestjs/swagger';
import { IssueStatus, IssuePriority } from '@prisma/client';

export class AgingIssueDto {
  @ApiProperty({ description: 'Issue ID' })
  id: string;

  @ApiProperty({ description: 'Issue key' })
  key: string;

  @ApiProperty({ description: 'Issue title' })
  title: string;

  @ApiProperty({ enum: IssueStatus, description: 'Issue status' })
  status: IssueStatus;

  @ApiProperty({ enum: IssuePriority, description: 'Issue priority' })
  priority: IssuePriority;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Age in days' })
  ageDays: number;

  @ApiProperty({ description: 'Assignee name' })
  assigneeName?: string;

  @ApiProperty({ description: 'Story points' })
  storyPoints?: number;

  @ApiProperty({ description: 'Number of comments' })
  commentCount: number;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Days since last update' })
  daysSinceUpdate: number;
}

export class IssueAgingReportDto {
  @ApiProperty({ description: 'Project ID' })
  projectId: string;

  @ApiProperty({ description: 'Project name' })
  projectName: string;

  @ApiProperty({ description: 'Issues aged 0-7 days', type: [AgingIssueDto] })
  aged0to7Days: AgingIssueDto[];

  @ApiProperty({ description: 'Issues aged 8-14 days', type: [AgingIssueDto] })
  aged8to14Days: AgingIssueDto[];

  @ApiProperty({ description: 'Issues aged 15-30 days', type: [AgingIssueDto] })
  aged15to30Days: AgingIssueDto[];

  @ApiProperty({ description: 'Issues aged 30+ days', type: [AgingIssueDto] })
  aged30PlusDays: AgingIssueDto[];

  @ApiProperty({ description: 'Average age in days' })
  averageAgeDays: number;

  @ApiProperty({ description: 'Median age in days' })
  medianAgeDays: number;

  @ApiProperty({ description: 'Total issues analyzed' })
  totalIssues: number;

  @ApiProperty({ description: 'Issues stale (30+ days no update)' })
  staleIssuesCount: number;
}
