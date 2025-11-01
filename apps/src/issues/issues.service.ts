import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique issue key (PROJECT-123)
   */
  private async generateIssueKey(projectId: string): Promise<string> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get the count of issues for this project
    const issueCount = await this.prisma.issue.count({
      where: { projectId },
    });

    // Generate key: PROJECT-1, PROJECT-2, etc.
    const issueNumber = issueCount + 1;
    return `${project.key}-${issueNumber}`;
  }

  /**
   * Create a new issue
   */
  async create(createIssueDto: CreateIssueDto, creatorId: string) {
    const { projectId, sprintId, assigneeId, ...rest } = createIssueDto;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Verify sprint exists if provided
    if (sprintId) {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: sprintId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      if (sprint.projectId !== projectId) {
        throw new BadRequestException('Sprint does not belong to this project');
      }
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    // Generate unique issue key
    const key = await this.generateIssueKey(projectId);

    const issue = await this.prisma.issue.create({
      data: {
        ...rest,
        key,
        projectId,
        sprintId,
        creatorId,
        assigneeId,
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            workLogs: true,
          },
        },
      },
    });

    return issue;
  }

  /**
   * Get all issues with advanced filtering
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    projectId?: string;
    sprintId?: string;
    status?: string;
    priority?: string;
    type?: string;
    assigneeId?: string;
    creatorId?: string;
    search?: string;
    labels?: string[];
  }) {
    const {
      skip = 0,
      take = 50,
      projectId,
      sprintId,
      status,
      priority,
      type,
      assigneeId,
      creatorId,
      search,
      labels,
    } = params || {};

    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId;
    if (creatorId) where.creatorId = creatorId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { key: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (labels && labels.length > 0) {
      where.labels = {
        hasSome: labels,
      };
    }

    const [issues, total] = await Promise.all([
      this.prisma.issue.findMany({
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
          sprint: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              workLogs: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.issue.count({ where }),
    ]);

    return {
      data: issues,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Get issue by ID
   */
  async findOne(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
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
        workLogs: {
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
        },
        _count: {
          select: {
            comments: true,
            workLogs: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    return issue;
  }

  /**
   * Get issue by key (PROJECT-123)
   */
  async findByKey(key: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { key: key.toUpperCase() },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
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
        workLogs: {
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
        },
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with key '${key}' not found`);
    }

    return issue;
  }

  /**
   * Update issue
   */
  async update(id: string, updateIssueDto: UpdateIssueDto) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    const { sprintId, assigneeId, ...rest } = updateIssueDto;

    // Verify sprint if provided
    if (sprintId) {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: sprintId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      if (sprint.projectId !== issue.projectId) {
        throw new BadRequestException('Sprint does not belong to this project');
      }
    }

    // Verify assignee if provided
    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    const updatedIssue = await this.prisma.issue.update({
      where: { id },
      data: {
        ...rest,
        sprintId,
        assigneeId,
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            workLogs: true,
          },
        },
      },
    });

    return updatedIssue;
  }

  /**
   * Delete issue
   */
  async remove(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    await this.prisma.issue.delete({
      where: { id },
    });

    return { message: 'Issue deleted successfully' };
  }

  /**
   * Assign issue to user
   */
  async assign(id: string, assigneeId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }

    const updatedIssue = await this.prisma.issue.update({
      where: { id },
      data: { assigneeId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return updatedIssue;
  }

  /**
   * Change issue status
   */
  async changeStatus(id: string, status: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedIssue = await this.prisma.issue.update({
      where: { id },
      data: { status: status as any },
    });

    return updatedIssue;
  }

  /**
   * Move issue to sprint
   */
  async moveToSprint(id: string, sprintId: string | null) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    if (sprintId) {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: sprintId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      if (sprint.projectId !== issue.projectId) {
        throw new BadRequestException('Sprint does not belong to this project');
      }
    }

    const updatedIssue = await this.prisma.issue.update({
      where: { id },
      data: { sprintId },
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return updatedIssue;
  }
}
