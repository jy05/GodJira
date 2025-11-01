import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new project
   */
  async create(createProjectDto: CreateProjectDto, ownerId: string) {
    // Check if project key already exists
    const existingProject = await this.prisma.project.findUnique({
      where: { key: createProjectDto.key },
    });

    if (existingProject) {
      throw new ConflictException(`Project with key '${createProjectDto.key}' already exists`);
    }

    // Verify owner exists
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            sprints: true,
            issues: true,
            tasks: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Get all projects
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    ownerId?: string;
  }) {
    const { skip = 0, take = 50, search, ownerId } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              sprints: true,
              issues: true,
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Get project by ID
   */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        sprints: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            sprints: true,
            issues: true,
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Get project by key
   */
  async findByKey(key: string) {
    const project = await this.prisma.project.findUnique({
      where: { key: key.toUpperCase() },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            sprints: true,
            issues: true,
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with key '${key}' not found`);
    }

    return project;
  }

  /**
   * Update project
   */
  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user is the owner (or admin - implement role check)
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can update the project');
    }

    // If changing owner, verify new owner exists
    if (updateProjectDto.ownerId) {
      const newOwner = await this.prisma.user.findUnique({
        where: { id: updateProjectDto.ownerId },
      });

      if (!newOwner) {
        throw new NotFoundException('New owner not found');
      }
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            sprints: true,
            issues: true,
            tasks: true,
          },
        },
      },
    });

    return updatedProject;
  }

  /**
   * Delete project
   */
  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user is the owner (or admin)
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can delete the project');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  /**
   * Get project statistics
   */
  async getStatistics(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sprints: true,
            issues: true,
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Get issue statistics
    const issues = await this.prisma.issue.groupBy({
      by: ['status', 'priority', 'type'],
      where: { projectId: id },
      _count: true,
    });

    // Get sprint statistics
    const sprints = await this.prisma.sprint.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: true,
    });

    return {
      project: {
        id: project.id,
        key: project.key,
        name: project.name,
      },
      counts: project._count,
      issuesByStatus: issues.filter((i) => i.status).map((i) => ({
        status: i.status,
        count: i._count,
      })),
      issuesByPriority: issues.filter((i) => i.priority).map((i) => ({
        priority: i.priority,
        count: i._count,
      })),
      issuesByType: issues.filter((i) => i.type).map((i) => ({
        type: i.type,
        count: i._count,
      })),
      sprintsByStatus: sprints.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  }
}
