import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new team' })
  async create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get('my-teams')
  @ApiOperation({ summary: 'Get teams for current user' })
  async getMyTeams(@Request() req) {
    return this.teamsService.getUserTeams(req.user.userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get teams assigned to a project' })
  @ApiParam({ name: 'projectId', type: 'string' })
  async getProjectTeams(@Param('projectId') projectId: string) {
    return this.teamsService.getProjectTeams(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update a team' })
  @ApiParam({ name: 'id', type: 'string' })
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a team' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  // Team Member Management

  @Post(':teamId/members')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Add a member to a team' })
  @ApiParam({ name: 'teamId', type: 'string' })
  async addMember(
    @Param('teamId') teamId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.teamsService.addMember(teamId, addMemberDto);
  }

  @Delete(':teamId/members/:userId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Remove a member from a team' })
  @ApiParam({ name: 'teamId', type: 'string' })
  @ApiParam({ name: 'userId', type: 'string' })
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.removeMember(teamId, userId);
  }

  @Patch(':teamId/members/:userId/role')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update member role in a team' })
  @ApiParam({ name: 'teamId', type: 'string' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['LEAD', 'MEMBER'],
          example: 'LEAD',
        },
      },
    },
  })
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
  ) {
    return this.teamsService.updateMemberRole(teamId, userId, role);
  }

  // Project Assignment Management

  @Post(':teamId/projects')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Assign a project to a team' })
  @ApiParam({ name: 'teamId', type: 'string' })
  async assignProject(
    @Param('teamId') teamId: string,
    @Body() assignProjectDto: AssignProjectDto,
  ) {
    return this.teamsService.assignProject(teamId, assignProjectDto);
  }

  @Delete(':teamId/projects/:projectId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Remove a project from a team' })
  @ApiParam({ name: 'teamId', type: 'string' })
  @ApiParam({ name: 'projectId', type: 'string' })
  async removeProject(
    @Param('teamId') teamId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.teamsService.removeProject(teamId, projectId);
  }
}
