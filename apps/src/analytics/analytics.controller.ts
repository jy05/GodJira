import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { BurndownChartDto } from './dto/burndown-chart.dto';
import { VelocityReportDto } from './dto/velocity-report.dto';
import { IssueAgingReportDto } from './dto/issue-aging.dto';
import { TeamCapacityReportDto } from './dto/team-capacity.dto';
import { SprintReportDto } from './dto/sprint-report.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('burndown/:sprintId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get burndown chart for a sprint',
    description:
      'Generate burndown chart showing ideal vs actual progress for a sprint with daily data points',
  })
  @ApiResponse({
    status: 200,
    description: 'Burndown chart data retrieved successfully',
    type: BurndownChartDto,
  })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  async getBurndownChart(
    @Param('sprintId') sprintId: string,
  ): Promise<BurndownChartDto> {
    return this.analyticsService.getBurndownChart(sprintId);
  }

  @Get('velocity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get velocity report',
    description:
      'Generate velocity report showing team performance across sprints with trend analysis',
  })
  @ApiQuery({
    name: 'projectId',
    required: true,
    description: 'Project ID to generate report for',
  })
  @ApiQuery({
    name: 'teamId',
    required: false,
    description: 'Optional team ID to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'Velocity report retrieved successfully',
    type: VelocityReportDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getVelocityReport(
    @Query() filters: AnalyticsFilterDto,
  ): Promise<VelocityReportDto> {
    return this.analyticsService.getVelocityReport(filters);
  }

  @Get('issue-aging')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get issue aging report',
    description:
      'Analyze issue age distribution and identify stale issues that need attention',
  })
  @ApiQuery({
    name: 'projectId',
    required: true,
    description: 'Project ID to analyze',
  })
  @ApiResponse({
    status: 200,
    description: 'Issue aging report retrieved successfully',
    type: IssueAgingReportDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getIssueAgingReport(
    @Query() filters: AnalyticsFilterDto,
  ): Promise<IssueAgingReportDto> {
    return this.analyticsService.getIssueAgingReport(filters);
  }

  @Get('team-capacity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get team capacity report',
    description:
      'Analyze team and individual member capacity, utilization, and workload distribution',
  })
  @ApiQuery({
    name: 'teamId',
    required: true,
    description: 'Team ID to analyze',
  })
  @ApiQuery({
    name: 'sprintId',
    required: false,
    description: 'Optional sprint ID to filter by',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range (if sprint not specified)',
  })
  @ApiResponse({
    status: 200,
    description: 'Team capacity report retrieved successfully',
    type: TeamCapacityReportDto,
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async getTeamCapacityReport(
    @Query() filters: AnalyticsFilterDto,
  ): Promise<TeamCapacityReportDto> {
    return this.analyticsService.getTeamCapacityReport(filters);
  }

  @Get('sprint-report/:sprintId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get comprehensive sprint report',
    description:
      'Generate detailed sprint report with summary, breakdowns, and top contributors',
  })
  @ApiResponse({
    status: 200,
    description: 'Sprint report retrieved successfully',
    type: SprintReportDto,
  })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  async getSprintReport(
    @Param('sprintId') sprintId: string,
  ): Promise<SprintReportDto> {
    return this.analyticsService.getSprintReport(sprintId);
  }

  @Get('project-summary/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get project summary statistics',
    description:
      'Get quick overview statistics for a project including total issues, completion rates, and recent activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Project summary retrieved successfully',
  })
  async getProjectSummary(@Param('projectId') projectId: string) {
    // This could call multiple analytics methods or a dedicated summary method
    const [velocityReport, agingReport] = await Promise.all([
      this.analyticsService.getVelocityReport({ projectId }),
      this.analyticsService.getIssueAgingReport({ projectId }),
    ]);

    return {
      projectId,
      velocity: {
        average: velocityReport.averageVelocity,
        trend: velocityReport.trend,
        totalSprints: velocityReport.totalSprints,
      },
      issues: {
        totalOpen: agingReport.totalIssues,
        averageAge: agingReport.averageAgeDays,
        staleCount: agingReport.staleIssuesCount,
      },
      completionRate: velocityReport.averageCommitmentAccuracy,
    };
  }
}
