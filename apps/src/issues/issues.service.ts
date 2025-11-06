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

    // Get the highest issue number for this project
    const lastIssue = await this.prisma.issue.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: { key: true },
    });

    let issueNumber = 1;
    if (lastIssue) {
      // Extract number from key (e.g., "PROJ-123" -> 123)
      const match = lastIssue.key.match(/-(\d+)$/);
      if (match) {
        issueNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Try to create unique key, retry with incremented number if collision
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const key = `${project.key}-${issueNumber}`;
      
      // Check if key already exists
      const existing = await this.prisma.issue.findUnique({
        where: { key },
      });
      
      if (!existing) {
        return key;
      }
      
      issueNumber++;
      attempts++;
    }

    throw new BadRequestException('Failed to generate unique issue key');
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
        key,
        projectId,
        sprintId: sprintId || null,
        creatorId,
        assigneeId: assigneeId || null,
        title: rest.title,
        description: rest.description,
        type: rest.type as any,
        status: rest.status as any,
        priority: rest.priority as any,
        storyPoints: rest.storyPoints,
        labels: rest.labels || [],
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

    const { sprintId, assigneeId, key, ...rest } = updateIssueDto;

    // Verify custom key uniqueness if provided
    if (key && key !== issue.key) {
      const existingIssue = await this.prisma.issue.findUnique({
        where: { key },
      });

      if (existingIssue) {
        throw new BadRequestException(`Issue key '${key}' is already in use`);
      }
    }

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
        ...(key && { key }),
        ...(sprintId !== undefined && { sprintId }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(rest.title && { title: rest.title }),
        ...(rest.description !== undefined && { description: rest.description }),
        ...(rest.type && { type: rest.type as any }),
        ...(rest.status && { status: rest.status as any }),
        ...(rest.priority && { priority: rest.priority as any }),
        ...(rest.storyPoints !== undefined && { storyPoints: rest.storyPoints }),
        ...(rest.labels && { labels: rest.labels }),
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

  /**
   * Bulk update multiple issues
   */
  async bulkUpdate(
    bulkUpdateDto: {
      issueIds: string[];
      assigneeId?: string;
      status?: string;
      sprintId?: string;
      priority?: string;
      addLabels?: string[];
      removeLabels?: string[];
    },
    userId: string,
  ) {
    const { issueIds, assigneeId, status, sprintId, priority, addLabels, removeLabels } = bulkUpdateDto;

    // Validate all issues exist
    const issues = await this.prisma.issue.findMany({
      where: { id: { in: issueIds } },
      include: { project: true },
    });

    if (issues.length !== issueIds.length) {
      throw new BadRequestException('One or more issues not found');
    }

    // Validate assignee if provided
    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    // Validate sprint if provided
    if (sprintId) {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: sprintId },
        include: { project: true },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      // Verify all issues belong to same project as sprint
      const invalidIssues = issues.filter((issue) => issue.projectId !== sprint.projectId);
      if (invalidIssues.length > 0) {
        throw new BadRequestException('All issues must belong to the same project as the sprint');
      }
    }

    // Build update data
    const updateData: any = {};
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (status) updateData.status = status;
    if (sprintId !== undefined) updateData.sprintId = sprintId;
    if (priority) updateData.priority = priority;

    // Update all issues
    const updatePromises = issues.map(async (issue) => {
      const data = { ...updateData };

      // Handle label operations
      if (addLabels || removeLabels) {
        let newLabels = [...issue.labels];

        if (addLabels) {
          newLabels = [...new Set([...newLabels, ...addLabels])];
        }

        if (removeLabels) {
          newLabels = newLabels.filter((label) => !removeLabels.includes(label));
        }

        data.labels = newLabels;
      }

      return this.prisma.issue.update({
        where: { id: issue.id },
        data,
      });
    });

    const updatedIssues = await Promise.all(updatePromises);

    return {
      message: `Successfully updated ${updatedIssues.length} issue(s)`,
      updatedCount: updatedIssues.length,
      issues: updatedIssues,
    };
  }

  /**
   * Create a sub-task for an issue
   */
  async createSubTask(
    parentIssueId: string,
    subTaskData: {
      title: string;
      description?: string;
      assigneeId?: string;
    },
    creatorId: string,
  ) {
    // Validate parent issue exists
    const parentIssue = await this.prisma.issue.findUnique({
      where: { id: parentIssueId },
      include: { project: true },
    });

    if (!parentIssue) {
      throw new NotFoundException('Parent issue not found');
    }

    // Validate assignee if provided
    if (subTaskData.assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: subTaskData.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    // Generate unique issue key for sub-task
    const key = await this.generateIssueKey(parentIssue.projectId);

    // Create sub-task
    const subTask = await this.prisma.issue.create({
      data: {
        title: subTaskData.title,
        description: subTaskData.description,
        key,
        type: 'TASK', // Sub-tasks are always type TASK
        status: 'TODO',
        priority: parentIssue.priority,
        projectId: parentIssue.projectId,
        parentIssueId: parentIssueId,
        creatorId,
        assigneeId: subTaskData.assigneeId,
      },
      include: {
        parentIssue: {
          select: {
            id: true,
            key: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return subTask;
  }

  /**
   * Get all sub-tasks for an issue
   */
  async getSubTasks(issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const subTasks = await this.prisma.issue.findMany({
      where: { parentIssueId: issueId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return subTasks;
  }

  /**
   * Convert issue to sub-task
   */
  async convertToSubTask(issueId: string, parentIssueId: string) {
    // Validate both issues exist
    const [issue, parentIssue] = await Promise.all([
      this.prisma.issue.findUnique({ where: { id: issueId } }),
      this.prisma.issue.findUnique({ where: { id: parentIssueId } }),
    ]);

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    if (!parentIssue) {
      throw new NotFoundException('Parent issue not found');
    }

    // Cannot convert to itself
    if (issueId === parentIssueId) {
      throw new BadRequestException('Cannot convert issue to sub-task of itself');
    }

    // Cannot convert if issue already has sub-tasks
    const existingSubTasks = await this.prisma.issue.count({
      where: { parentIssueId: issueId },
    });

    if (existingSubTasks > 0) {
      throw new BadRequestException('Cannot convert issue with existing sub-tasks');
    }

    // Must be in same project
    if (issue.projectId !== parentIssue.projectId) {
      throw new BadRequestException('Issues must be in the same project');
    }

    // Update issue to become a sub-task
    const updatedIssue = await this.prisma.issue.update({
      where: { id: issueId },
      data: {
        parentIssueId,
        type: 'TASK',
      },
      include: {
        parentIssue: {
          select: {
            id: true,
            key: true,
            title: true,
          },
        },
      },
    });

    return updatedIssue;
  }

  /**
   * Promote sub-task to regular issue
   */
  async promoteToIssue(subTaskId: string) {
    const subTask = await this.prisma.issue.findUnique({
      where: { id: subTaskId },
    });

    if (!subTask) {
      throw new NotFoundException('Sub-task not found');
    }

    if (!subTask.parentIssueId) {
      throw new BadRequestException('Issue is not a sub-task');
    }

    // Remove parent relationship
    const promotedIssue = await this.prisma.issue.update({
      where: { id: subTaskId },
      data: {
        parentIssueId: null,
      },
    });

    return promotedIssue;
  }
}
