import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSprintDto, UpdateSprintDto } from './dto';

@Injectable()
export class SprintsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new sprint
   */
  async create(createSprintDto: CreateSprintDto) {
    const { projectId, startDate, endDate, ...rest } = createSprintDto;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Validate dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const sprint = await this.prisma.sprint.create({
      data: {
        ...rest,
        projectId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    return sprint;
  }

  /**
   * Get all sprints
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    projectId?: string;
    status?: string;
  }) {
    const { skip = 0, take = 50, projectId, status } = params || {};

    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    const [sprints, total] = await Promise.all([
      this.prisma.sprint.findMany({
        where,
        skip,
        take,
        include: {
          project: {
            select: {
              id: true,
              key: true,
              name: true,
            },
          },
          _count: {
            select: {
              issues: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.sprint.count({ where }),
    ]);

    return {
      data: sprints,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Get sprint by ID
   */
  async findOne(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        issues: {
          select: {
            id: true,
            key: true,
            title: true,
            status: true,
            priority: true,
            type: true,
            storyPoints: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    return sprint;
  }

  /**
   * Update sprint
   */
  async update(id: string, updateSprintDto: UpdateSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    // Check if sprint is already completed or cancelled
    if (sprint.status === 'COMPLETED' || sprint.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot update a ${sprint.status.toLowerCase()} sprint`);
    }

    // Validate dates
    const { startDate, endDate, ...rest } = updateSprintDto;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : sprint.startDate;
      const end = endDate ? new Date(endDate) : sprint.endDate;

      if (start && end && end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updatedSprint = await this.prisma.sprint.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    return updatedSprint;
  }

  /**
   * Start sprint
   */
  async start(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    if (sprint.status !== 'PLANNED') {
      throw new BadRequestException('Only planned sprints can be started');
    }

    // Check if there's already an active sprint in this project
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        status: 'ACTIVE',
      },
    });

    if (activeSprint) {
      throw new BadRequestException('Project already has an active sprint');
    }

    const updatedSprint = await this.prisma.sprint.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startDate: sprint.startDate || new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    return updatedSprint;
  }

  /**
   * Complete sprint
   */
  async complete(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    if (sprint.status !== 'ACTIVE') {
      throw new BadRequestException('Only active sprints can be completed');
    }

    const updatedSprint = await this.prisma.sprint.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    return updatedSprint;
  }

  /**
   * Cancel sprint
   */
  async cancel(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    if (sprint.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed sprint');
    }

    const updatedSprint = await this.prisma.sprint.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    return updatedSprint;
  }

  /**
   * Delete sprint
   */
  async remove(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    // Don't allow deletion of active sprints
    if (sprint.status === 'ACTIVE') {
      throw new BadRequestException('Cannot delete an active sprint');
    }

    await this.prisma.sprint.delete({
      where: { id },
    });

    return { message: 'Sprint deleted successfully' };
  }

  /**
   * Get sprint statistics
   */
  async getStatistics(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        issues: true,
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    // Calculate statistics
    const totalIssues = sprint.issues.length;
    const completedIssues = sprint.issues.filter((i) => i.status === 'DONE' || i.status === 'CLOSED').length;
    const inProgressIssues = sprint.issues.filter((i) => i.status === 'IN_PROGRESS').length;
    const todoIssues = sprint.issues.filter((i) => i.status === 'TODO' || i.status === 'BACKLOG').length;

    const totalStoryPoints = sprint.issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const completedStoryPoints = sprint.issues
      .filter((i) => i.status === 'DONE' || i.status === 'CLOSED')
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);

    // Group by status, priority, and type
    const issuesByStatus = sprint.issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByPriority = sprint.issues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByType = sprint.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
      summary: {
        totalIssues,
        completedIssues,
        inProgressIssues,
        todoIssues,
        completionRate: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
      },
      storyPoints: {
        total: totalStoryPoints,
        completed: completedStoryPoints,
        remaining: totalStoryPoints - completedStoryPoints,
        completionRate: totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0,
      },
      breakdown: {
        byStatus: issuesByStatus,
        byPriority: issuesByPriority,
        byType: issuesByType,
      },
    };
  }
}
