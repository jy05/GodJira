import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkLogDto, UpdateWorkLogDto } from './dto';

@Injectable()
export class WorkLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkLogDto: CreateWorkLogDto, userId: string) {
    // Verify issue exists
    const issue = await this.prisma.issue.findUnique({
      where: { id: createWorkLogDto.issueId },
    });

    if (!issue) {
      throw new NotFoundException(
        `Issue with ID ${createWorkLogDto.issueId} not found`,
      );
    }

    const logDate = createWorkLogDto.logDate
      ? new Date(createWorkLogDto.logDate)
      : new Date();

    return this.prisma.workLog.create({
      data: {
        description: createWorkLogDto.description,
        timeSpent: createWorkLogDto.timeSpent,
        logDate,
        issue: {
          connect: { id: createWorkLogDto.issueId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        issue: {
          select: {
            id: true,
            key: true,
            title: true,
          },
        },
      },
    });
  }

  async findByIssue(issueId: string) {
    // Verify issue exists
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${issueId} not found`);
    }

    return this.prisma.workLog.findMany({
      where: { issueId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        logDate: 'desc',
      },
    });
  }

  async findByUser(userId: string, issueId?: string) {
    const where: any = { userId };

    if (issueId) {
      where.issueId = issueId;
    }

    return this.prisma.workLog.findMany({
      where,
      include: {
        issue: {
          select: {
            id: true,
            key: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
                key: true,
              },
            },
          },
        },
      },
      orderBy: {
        logDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        issue: {
          select: {
            id: true,
            key: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
                key: true,
              },
            },
          },
        },
      },
    });

    if (!workLog) {
      throw new NotFoundException(`Work log with ID ${id} not found`);
    }

    return workLog;
  }

  async update(
    id: string,
    updateWorkLogDto: UpdateWorkLogDto,
    userId: string,
  ) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
    });

    if (!workLog) {
      throw new NotFoundException(`Work log with ID ${id} not found`);
    }

    // Only the user who created the work log can update it
    if (workLog.userId !== userId) {
      throw new ForbiddenException('You can only edit your own work logs');
    }

    const updateData: any = {};

    if (updateWorkLogDto.description !== undefined) {
      updateData.description = updateWorkLogDto.description;
    }

    if (updateWorkLogDto.timeSpent !== undefined) {
      updateData.timeSpent = updateWorkLogDto.timeSpent;
    }

    if (updateWorkLogDto.logDate !== undefined) {
      updateData.logDate = new Date(updateWorkLogDto.logDate);
    }

    return this.prisma.workLog.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        issue: {
          select: {
            id: true,
            key: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
    });

    if (!workLog) {
      throw new NotFoundException(`Work log with ID ${id} not found`);
    }

    // Only the user who created the work log can delete it
    if (workLog.userId !== userId) {
      throw new ForbiddenException('You can only delete your own work logs');
    }

    await this.prisma.workLog.delete({
      where: { id },
    });

    return {
      message: 'Work log deleted successfully',
      id,
    };
  }

  async calculateTotalTime(issueId: string): Promise<{
    totalMinutes: number;
    totalHours: number;
    totalDays: number;
  }> {
    const workLogs = await this.prisma.workLog.findMany({
      where: { issueId },
      select: {
        timeSpent: true,
      },
    });

    const totalMinutes = workLogs.reduce(
      (sum, log) => sum + log.timeSpent,
      0,
    );

    return {
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100, // Round to 2 decimal places
      totalDays: Math.round((totalMinutes / (60 * 8)) * 100) / 100, // 8-hour workday
    };
  }

  async getUserTimeStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.logDate = {};
      if (startDate) {
        where.logDate.gte = startDate;
      }
      if (endDate) {
        where.logDate.lte = endDate;
      }
    }

    const workLogs = await this.prisma.workLog.findMany({
      where,
      select: {
        timeSpent: true,
        issue: {
          select: {
            id: true,
            key: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const totalMinutes = workLogs.reduce(
      (sum, log) => sum + log.timeSpent,
      0,
    );

    // Group by project
    const projectStats = workLogs.reduce((acc, log) => {
      const projectId = log.issue.project.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          projectName: log.issue.project.name,
          totalMinutes: 0,
          issueCount: new Set(),
        };
      }
      acc[projectId].totalMinutes += log.timeSpent;
      acc[projectId].issueCount.add(log.issue.id);
      return acc;
    }, {} as Record<string, any>);

    const projectSummary = Object.values(projectStats).map((stats: any) => ({
      projectId: stats.projectId,
      projectName: stats.projectName,
      totalMinutes: stats.totalMinutes,
      totalHours: Math.round((stats.totalMinutes / 60) * 100) / 100,
      issueCount: stats.issueCount.size,
    }));

    return {
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      totalDays: Math.round((totalMinutes / (60 * 8)) * 100) / 100,
      workLogCount: workLogs.length,
      projects: projectSummary,
    };
  }
}
