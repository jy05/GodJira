import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IssueStatus, SprintStatus } from '@prisma/client';
import {
  AnalyticsFilterDto,
  TimeRangeType,
} from './dto/analytics-filter.dto';
import { BurndownChartDto, BurndownDataPointDto } from './dto/burndown-chart.dto';
import { VelocityReportDto, SprintVelocityDto } from './dto/velocity-report.dto';
import { IssueAgingReportDto, AgingIssueDto } from './dto/issue-aging.dto';
import { TeamCapacityReportDto, UserCapacityDto } from './dto/team-capacity.dto';
import {
  SprintReportDto,
  SprintSummaryDto,
  IssueBreakdownDto,
} from './dto/sprint-report.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate burndown chart for a sprint
   */
  async getBurndownChart(sprintId: string): Promise<BurndownChartDto> {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: true,
        issues: {
          include: {
            auditLogs: {
              where: {
                action: {
                  in: ['UPDATE', 'CREATE'],
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${sprintId} not found`);
    }

    if (!sprint.startDate) {
      throw new NotFoundException('Sprint has not started yet');
    }

    const startDate = new Date(sprint.startDate);
    const endDate = sprint.endDate ? new Date(sprint.endDate) : new Date();
    const today = new Date();
    const actualEndDate = endDate > today ? today : endDate;

    // Calculate totals
    const totalStoryPoints = sprint.issues.reduce(
      (sum, issue) => sum + (issue.storyPoints || 0),
      0,
    );
    const completedStoryPoints = sprint.issues
      .filter((issue) => issue.status === IssueStatus.DONE)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    const remainingStoryPoints = totalStoryPoints - completedStoryPoints;

    const totalIssues = sprint.issues.length;
    const completedIssues = sprint.issues.filter(
      (issue) => issue.status === IssueStatus.DONE,
    ).length;
    const remainingIssues = totalIssues - completedIssues;

    // Generate daily data points
    const dataPoints: BurndownDataPointDto[] = [];
    const daysDiff = Math.ceil(
      (actualEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    for (let day = 0; day <= daysDiff; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      currentDate.setHours(23, 59, 59, 999);

      // Calculate ideal remaining (linear burndown)
      const idealRemaining =
        totalStoryPoints - (totalStoryPoints / totalDays) * day;

      // Calculate actual remaining at this point in time
      const completedAtDate = sprint.issues.filter((issue) => {
        if (issue.status !== IssueStatus.DONE) return false;
        const completedLog = issue.auditLogs.find((log) => {
          try {
            const changes = JSON.parse(log.changes);
            return (
              changes &&
              typeof changes === 'object' &&
              'status' in changes &&
              changes.status === IssueStatus.DONE &&
              new Date(log.createdAt) <= currentDate
            );
          } catch {
            return false;
          }
        });
        return !!completedLog;
      });

      const completedPointsAtDate = completedAtDate.reduce(
        (sum, issue) => sum + (issue.storyPoints || 0),
        0,
      );
      const actualRemaining = totalStoryPoints - completedPointsAtDate;

      // Count issues added/removed during sprint
      const addedIssues = sprint.issues.filter(
        (issue) => new Date(issue.createdAt) > startDate,
      ).length;
      const removedIssues = 0; // Would need to track removed issues separately

      dataPoints.push({
        date: new Date(currentDate),
        idealRemaining: Math.max(0, idealRemaining),
        actualRemaining: Math.max(0, actualRemaining),
        completedIssues: completedAtDate.length,
        addedIssues,
        removedIssues,
      });
    }

    // Calculate metrics
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const completionPercentage =
      totalStoryPoints > 0
        ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
        : 0;
    const velocity =
      daysDiff > 0 ? parseFloat((completedStoryPoints / daysDiff).toFixed(2)) : 0;

    // Determine if on track (comparing actual vs ideal)
    const latestDataPoint = dataPoints[dataPoints.length - 1];
    const onTrack =
      latestDataPoint.actualRemaining <= latestDataPoint.idealRemaining * 1.1; // 10% tolerance

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      startDate: sprint.startDate,
      endDate: endDate,
      totalStoryPoints,
      completedStoryPoints,
      remainingStoryPoints,
      totalIssues,
      completedIssues,
      remainingIssues,
      dataPoints,
      onTrack,
      completionPercentage,
      daysRemaining,
      velocity,
    };
  }

  /**
   * Generate velocity report for a project or team
   */
  async getVelocityReport(
    filters: AnalyticsFilterDto,
  ): Promise<VelocityReportDto> {
    if (!filters.projectId) {
      throw new NotFoundException('Project ID is required for velocity report');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: filters.projectId },
      include: {
        sprints: {
          where: {
            status: {
              in: [SprintStatus.COMPLETED, SprintStatus.ACTIVE],
            },
            startDate: { not: null },
          },
          include: {
            issues: true,
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get team if filtered
    let team: any = null;
    if (filters.teamId) {
      team = await this.prisma.team.findUnique({
        where: { id: filters.teamId },
      });
    }

    const sprintVelocities: SprintVelocityDto[] = project.sprints.map(
      (sprint) => {
        const committedPoints = sprint.issues.reduce(
          (sum, issue) => sum + (issue.storyPoints || 0),
          0,
        );
        const completedPoints = sprint.issues
          .filter((issue) => issue.status === IssueStatus.DONE)
          .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
        const completedIssues = sprint.issues.filter(
          (issue) => issue.status === IssueStatus.DONE,
        ).length;

        const startDate = new Date(sprint.startDate!);
        const endDate = sprint.endDate
          ? new Date(sprint.endDate)
          : new Date();
        const durationDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        const velocity =
          durationDays > 0
            ? parseFloat((completedPoints / durationDays).toFixed(2))
            : 0;
        const commitmentAccuracy =
          committedPoints > 0
            ? Math.round((completedPoints / committedPoints) * 100)
            : 0;

        return {
          sprintId: sprint.id,
          sprintName: sprint.name,
          startDate: sprint.startDate!,
          endDate: endDate,
          committedPoints,
          completedPoints,
          completedIssues,
          durationDays,
          velocity,
          commitmentAccuracy,
        };
      },
    );

    // Calculate averages
    const totalSprints = sprintVelocities.length;
    const averageVelocity =
      totalSprints > 0
        ? parseFloat(
            (
              sprintVelocities.reduce((sum, s) => sum + s.velocity, 0) /
              totalSprints
            ).toFixed(2),
          )
        : 0;
    const averageCompletedPoints =
      totalSprints > 0
        ? Math.round(
            sprintVelocities.reduce((sum, s) => sum + s.completedPoints, 0) /
              totalSprints,
          )
        : 0;
    const averageCommitmentAccuracy =
      totalSprints > 0
        ? Math.round(
            sprintVelocities.reduce((sum, s) => sum + s.commitmentAccuracy, 0) /
              totalSprints,
          )
        : 0;

    // Determine trend (last 3 sprints)
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (totalSprints >= 3) {
      const recent = sprintVelocities.slice(-3);
      const firstVelocity = recent[0].velocity;
      const lastVelocity = recent[2].velocity;
      const diff = lastVelocity - firstVelocity;
      const threshold = firstVelocity * 0.1; // 10% change threshold

      if (diff > threshold) trend = 'increasing';
      else if (diff < -threshold) trend = 'decreasing';
    }

    return {
      projectId: project.id,
      projectName: project.name,
      teamId: team?.id,
      teamName: team?.name,
      sprints: sprintVelocities,
      averageVelocity,
      averageCompletedPoints,
      averageCommitmentAccuracy,
      trend,
      totalSprints,
    };
  }

  /**
   * Generate issue aging report
   */
  async getIssueAgingReport(
    filters: AnalyticsFilterDto,
  ): Promise<IssueAgingReportDto> {
    if (!filters.projectId) {
      throw new NotFoundException('Project ID is required for aging report');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: filters.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const issues = await this.prisma.issue.findMany({
      where: {
        projectId: filters.projectId,
        status: {
          not: IssueStatus.DONE,
        },
      },
      include: {
        assignee: true,
        _count: {
          select: { comments: true },
        },
      },
    });

    const now = new Date();

    const agingIssues: AgingIssueDto[] = issues.map((issue) => {
      const ageDays = Math.floor(
        (now.getTime() - new Date(issue.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(issue.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        id: issue.id,
        key: issue.key,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        createdAt: issue.createdAt,
        ageDays,
        assigneeName: issue.assignee?.name,
        storyPoints: issue.storyPoints ?? undefined,
        commentCount: issue._count.comments,
        updatedAt: issue.updatedAt,
        daysSinceUpdate,
      };
    });

    // Group by age ranges
    const aged0to7Days = agingIssues.filter((i) => i.ageDays <= 7);
    const aged8to14Days = agingIssues.filter(
      (i) => i.ageDays > 7 && i.ageDays <= 14,
    );
    const aged15to30Days = agingIssues.filter(
      (i) => i.ageDays > 14 && i.ageDays <= 30,
    );
    const aged30PlusDays = agingIssues.filter((i) => i.ageDays > 30);

    // Calculate statistics
    const ages = agingIssues.map((i) => i.ageDays).sort((a, b) => a - b);
    const averageAgeDays =
      ages.length > 0
        ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
        : 0;
    const medianAgeDays =
      ages.length > 0 ? ages[Math.floor(ages.length / 2)] : 0;
    const staleIssuesCount = agingIssues.filter(
      (i) => i.daysSinceUpdate >= 30,
    ).length;

    return {
      projectId: project.id,
      projectName: project.name,
      aged0to7Days,
      aged8to14Days,
      aged15to30Days,
      aged30PlusDays,
      averageAgeDays,
      medianAgeDays,
      totalIssues: agingIssues.length,
      staleIssuesCount,
    };
  }

  /**
   * Generate team capacity report
   */
  async getTeamCapacityReport(
    filters: AnalyticsFilterDto,
  ): Promise<TeamCapacityReportDto> {
    if (!filters.teamId) {
      throw new NotFoundException('Team ID is required for capacity report');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: filters.teamId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Determine date range
    let startDate: Date;
    let endDate: Date = new Date();
    let sprint: any = null;

    if (filters.sprintId) {
      sprint = await this.prisma.sprint.findUnique({
        where: { id: filters.sprintId },
      });
      if (sprint && sprint.startDate) {
        startDate = new Date(sprint.startDate);
        endDate = sprint.endDate ? new Date(sprint.endDate) : new Date();
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 14); // Default 2 weeks
      }
    } else {
      startDate = this.getDateFromTimeRange(filters.timeRange || TimeRangeType.LAST_30_DAYS);
    }

    // Get capacity data for each team member
    const memberCapacities: UserCapacityDto[] = await Promise.all(
      team.members.map(async (member) => {
        const assignedIssues = await this.prisma.issue.findMany({
          where: {
            assigneeId: member.userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            workLogs: true,
          },
        });

        const assignedPoints = assignedIssues.reduce(
          (sum, issue) => sum + (issue.storyPoints || 0),
          0,
        );
        const completedIssues = assignedIssues.filter(
          (issue) => issue.status === IssueStatus.DONE,
        );
        const completedPoints = completedIssues.reduce(
          (sum, issue) => sum + (issue.storyPoints || 0),
          0,
        );
        const inProgressIssues = assignedIssues.filter(
          (issue) => issue.status === IssueStatus.IN_PROGRESS,
        );
        const inProgressPoints = inProgressIssues.reduce(
          (sum, issue) => sum + (issue.storyPoints || 0),
          0,
        );

        const timeLoggedMinutes = assignedIssues.reduce(
          (sum, issue) =>
            sum +
            issue.workLogs.reduce((logSum, log) => logSum + log.timeSpent, 0),
          0,
        );

        const utilizationPercentage =
          assignedPoints > 0
            ? Math.round((completedPoints / assignedPoints) * 100)
            : 0;

        // Calculate average completion time
        const completionTimes = completedIssues
          .filter((issue) => issue.status === IssueStatus.DONE)
          .map((issue) => {
            const created = new Date(issue.createdAt).getTime();
            const updated = new Date(issue.updatedAt).getTime();
            return (updated - created) / (1000 * 60 * 60 * 24);
          });
        const averageCompletionTimeDays =
          completionTimes.length > 0
            ? parseFloat(
                (
                  completionTimes.reduce((sum, time) => sum + time, 0) /
                  completionTimes.length
                ).toFixed(1),
              )
            : 0;

        return {
          userId: member.userId,
          userName: member.user.name,
          userEmail: member.user.email,
          assignedPoints,
          completedPoints,
          inProgressPoints,
          assignedIssues: assignedIssues.length,
          completedIssues: completedIssues.length,
          inProgressIssues: inProgressIssues.length,
          timeLoggedMinutes,
          utilizationPercentage,
          averageCompletionTimeDays,
        };
      }),
    );

    // Calculate team totals
    const totalTeamCapacity = memberCapacities.reduce(
      (sum, m) => sum + m.assignedPoints,
      0,
    );
    const totalCommittedPoints = totalTeamCapacity; // Same as capacity in this context
    const totalCompletedPoints = memberCapacities.reduce(
      (sum, m) => sum + m.completedPoints,
      0,
    );
    const teamUtilization =
      totalTeamCapacity > 0
        ? Math.round((totalCompletedPoints / totalTeamCapacity) * 100)
        : 0;
    const teamSize = memberCapacities.length;
    const averagePointsPerMember =
      teamSize > 0 ? Math.round(totalCompletedPoints / teamSize) : 0;
    const totalTimeLoggedMinutes = memberCapacities.reduce(
      (sum, m) => sum + m.timeLoggedMinutes,
      0,
    );

    return {
      teamId: team.id,
      teamName: team.name,
      sprintId: sprint?.id,
      sprintName: sprint?.name,
      startDate,
      endDate,
      members: memberCapacities,
      totalTeamCapacity,
      totalCommittedPoints,
      totalCompletedPoints,
      teamUtilization,
      teamSize,
      averagePointsPerMember,
      totalTimeLoggedMinutes,
    };
  }

  /**
   * Generate comprehensive sprint report
   */
  async getSprintReport(sprintId: string): Promise<SprintReportDto> {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: true,
        issues: {
          include: {
            assignee: true,
            workLogs: true,
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    const startDate = sprint.startDate ? new Date(sprint.startDate) : null;
    const endDate = sprint.endDate ? new Date(sprint.endDate) : new Date();
    const now = new Date();

    // Calculate summary
    const totalIssues = sprint.issues.length;
    const completedIssues = sprint.issues.filter(
      (i) => i.status === IssueStatus.DONE,
    ).length;
    const inProgressIssues = sprint.issues.filter(
      (i) => i.status === IssueStatus.IN_PROGRESS,
    ).length;
    const notStartedIssues = sprint.issues.filter(
      (i) => i.status === IssueStatus.TODO,
    ).length;

    const totalStoryPoints = sprint.issues.reduce(
      (sum, i) => sum + (i.storyPoints || 0),
      0,
    );
    const completedStoryPoints = sprint.issues
      .filter((i) => i.status === IssueStatus.DONE)
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const completionPercentage =
      totalStoryPoints > 0
        ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
        : 0;

    const addedDuringSprint = startDate
      ? sprint.issues.filter((i) => new Date(i.createdAt) > startDate).length
      : 0;
    const removedDuringSprint = 0; // Would need separate tracking

    const totalTimeLoggedMinutes = sprint.issues.reduce(
      (sum, i) =>
        sum + i.workLogs.reduce((logSum, log) => logSum + log.timeSpent, 0),
      0,
    );

    const summary: SprintSummaryDto = {
      totalIssues,
      completedIssues,
      inProgressIssues,
      notStartedIssues,
      totalStoryPoints,
      completedStoryPoints,
      completionPercentage,
      addedDuringSprint,
      removedDuringSprint,
      totalTimeLoggedMinutes,
    };

    // Issues by status
    const issuesByStatus: IssueBreakdownDto[] = Object.values(IssueStatus).map(
      (status) => {
        const issuesWithStatus = sprint.issues.filter(
          (i) => i.status === status,
        );
        return {
          category: status,
          count: issuesWithStatus.length,
          percentage:
            totalIssues > 0
              ? Math.round((issuesWithStatus.length / totalIssues) * 100)
              : 0,
          storyPoints: issuesWithStatus.reduce(
            (sum, i) => sum + (i.storyPoints || 0),
            0,
          ),
        };
      },
    );

    // Issues by type
    const typeGroups = sprint.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByType: IssueBreakdownDto[] = Object.entries(typeGroups).map(
      ([type, count]) => {
        const issuesWithType = sprint.issues.filter((i) => i.type === type);
        return {
          category: type,
          count,
          percentage:
            totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0,
          storyPoints: issuesWithType.reduce(
            (sum, i) => sum + (i.storyPoints || 0),
            0,
          ),
        };
      },
    );

    // Issues by priority
    const priorityGroups = sprint.issues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByPriority: IssueBreakdownDto[] = Object.entries(
      priorityGroups,
    ).map(([priority, count]) => {
      const issuesWithPriority = sprint.issues.filter(
        (i) => i.priority === priority,
      );
      return {
        category: priority,
        count,
        percentage:
          totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0,
        storyPoints: issuesWithPriority.reduce(
          (sum, i) => sum + (i.storyPoints || 0),
          0,
        ),
      };
    });

    // Top contributors
    const contributorMap = new Map<
      string,
      { userName: string; completedIssues: number; completedPoints: number }
    >();

    sprint.issues
      .filter((i) => i.status === IssueStatus.DONE && i.assignee)
      .forEach((issue) => {
        const existing = contributorMap.get(issue.assigneeId!);
        if (existing) {
          existing.completedIssues++;
          existing.completedPoints += issue.storyPoints || 0;
        } else {
          contributorMap.set(issue.assigneeId!, {
            userName: issue.assignee!.name,
            completedIssues: 1,
            completedPoints: issue.storyPoints || 0,
          });
        }
      });

    const topContributors = Array.from(contributorMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.completedPoints - a.completedPoints)
      .slice(0, 5);

    // Calculate velocity and days
    const daysElapsed = startDate
      ? Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const velocity =
      daysElapsed > 0
        ? parseFloat((completedStoryPoints / daysElapsed).toFixed(2))
        : 0;

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      goal: sprint.goal ?? undefined,
      startDate: sprint.startDate || new Date(),
      endDate: endDate,
      status: sprint.status,
      projectId: sprint.projectId,
      projectName: sprint.project.name,
      summary,
      issuesByStatus,
      issuesByType,
      issuesByPriority,
      topContributors,
      velocity,
      daysElapsed,
      daysRemaining,
    };
  }

  /**
   * Helper to get date from time range
   */
  private getDateFromTimeRange(timeRange: TimeRangeType): Date {
    const now = new Date();
    switch (timeRange) {
      case TimeRangeType.LAST_7_DAYS:
        return new Date(now.setDate(now.getDate() - 7));
      case TimeRangeType.LAST_30_DAYS:
        return new Date(now.setDate(now.getDate() - 30));
      case TimeRangeType.LAST_90_DAYS:
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }
}
