import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { AssignProjectDto } from './dto/assign-project.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new team
   */
  async create(createTeamDto: CreateTeamDto) {
    // Check if team name already exists
    const existing = await this.prisma.team.findUnique({
      where: { name: createTeamDto.name },
    });

    if (existing) {
      throw new ConflictException('Team with this name already exists');
    }

    const team = await this.prisma.team.create({
      data: createTeamDto,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                jobTitle: true,
                department: true,
              },
            },
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                key: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  /**
   * Get all teams
   */
  async findAll() {
    const teams = await this.prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                jobTitle: true,
                department: true,
              },
            },
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                key: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return teams;
  }

  /**
   * Get a single team by ID
   */
  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                jobTitle: true,
                department: true,
                role: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                key: true,
                name: true,
                description: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  /**
   * Update a team
   */
  async update(id: string, updateTeamDto: UpdateTeamDto) {
    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if new name conflicts with existing team
    if (updateTeamDto.name && updateTeamDto.name !== team.name) {
      const existing = await this.prisma.team.findUnique({
        where: { name: updateTeamDto.name },
      });

      if (existing) {
        throw new ConflictException('Team with this name already exists');
      }
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
      include: {
        members: {
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
        },
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    return updatedTeam;
  }

  /**
   * Delete a team
   */
  async remove(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.prisma.team.delete({
      where: { id },
    });

    return { message: 'Team deleted successfully' };
  }

  /**
   * Add a member to a team
   */
  async addMember(teamId: string, addMemberDto: AddMemberDto) {
    // Verify team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: addMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existing = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: addMemberDto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this team');
    }

    const member = await this.prisma.teamMember.create({
      data: {
        teamId,
        userId: addMemberDto.userId,
        role: addMemberDto.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            jobTitle: true,
            department: true,
          },
        },
      },
    });

    return member;
  }

  /**
   * Remove a member from a team
   */
  async removeMember(teamId: string, userId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    await this.prisma.teamMember.delete({
      where: {
        id: member.id,
      },
    });

    return { message: 'Member removed successfully' };
  }

  /**
   * Update member role
   */
  async updateMemberRole(teamId: string, userId: string, role: string) {
    if (!['LEAD', 'MEMBER'].includes(role)) {
      throw new BadRequestException('Invalid role. Must be LEAD or MEMBER');
    }

    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    const updatedMember = await this.prisma.teamMember.update({
      where: {
        id: member.id,
      },
      data: {
        role,
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
      },
    });

    return updatedMember;
  }

  /**
   * Assign a project to a team
   */
  async assignProject(teamId: string, assignProjectDto: AssignProjectDto) {
    // Verify team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: assignProjectDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if project is already assigned
    const existing = await this.prisma.teamProject.findUnique({
      where: {
        teamId_projectId: {
          teamId,
          projectId: assignProjectDto.projectId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Project is already assigned to this team');
    }

    const teamProject = await this.prisma.teamProject.create({
      data: {
        teamId,
        projectId: assignProjectDto.projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return teamProject;
  }

  /**
   * Remove a project from a team
   */
  async removeProject(teamId: string, projectId: string) {
    const teamProject = await this.prisma.teamProject.findUnique({
      where: {
        teamId_projectId: {
          teamId,
          projectId,
        },
      },
    });

    if (!teamProject) {
      throw new NotFoundException('Project assignment not found');
    }

    await this.prisma.teamProject.delete({
      where: {
        id: teamProject.id,
      },
    });

    return { message: 'Project removed from team successfully' };
  }

  /**
   * Get teams for a user
   */
  async getUserTeams(userId: string) {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.team,
      memberRole: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Get teams for a project
   */
  async getProjectTeams(projectId: string) {
    const assignments = await this.prisma.teamProject.findMany({
      where: { projectId },
      include: {
        team: {
          include: {
            members: {
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
            },
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return assignments.map((a) => ({
      ...a.team,
      assignedAt: a.assignedAt,
    }));
  }
}
