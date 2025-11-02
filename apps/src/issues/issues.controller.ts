import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('issues')
@Controller('issues')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new issue' })
  @ApiResponse({
    status: 201,
    description: 'Issue created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project, sprint, or assignee not found',
  })
  create(
    @Body() createIssueDto: CreateIssueDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.issuesService.create(createIssueDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all issues with filtering' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'sprintId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'assigneeId', required: false, type: String })
  @ApiQuery({ name: 'creatorId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Issues retrieved successfully',
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('projectId') projectId?: string,
    @Query('sprintId') sprintId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('type') type?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('creatorId') creatorId?: string,
    @Query('search') search?: string,
  ) {
    return this.issuesService.findAll({
      skip,
      take,
      projectId,
      sprintId,
      status,
      priority,
      type,
      assigneeId,
      creatorId,
      search,
    });
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get issue by key (e.g., WEB-123)' })
  @ApiResponse({
    status: 200,
    description: 'Issue found',
  })
  @ApiResponse({
    status: 404,
    description: 'Issue not found',
  })
  findByKey(@Param('key') key: string) {
    return this.issuesService.findByKey(key);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue by ID' })
  @ApiResponse({
    status: 200,
    description: 'Issue found',
  })
  @ApiResponse({
    status: 404,
    description: 'Issue not found',
  })
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update issue' })
  @ApiResponse({
    status: 200,
    description: 'Issue updated successfully',
  })
  update(@Param('id') id: string, @Body() updateIssueDto: UpdateIssueDto) {
    return this.issuesService.update(id, updateIssueDto);
  }

  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign issue to user' })
  @ApiResponse({
    status: 200,
    description: 'Issue assigned successfully',
  })
  assign(@Param('id') id: string, @Body('assigneeId') assigneeId: string) {
    return this.issuesService.assign(id, assigneeId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change issue status' })
  @ApiResponse({
    status: 200,
    description: 'Status changed successfully',
  })
  changeStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.issuesService.changeStatus(id, status);
  }

  @Patch(':id/sprint')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move issue to sprint' })
  @ApiResponse({
    status: 200,
    description: 'Issue moved to sprint successfully',
  })
  moveToSprint(@Param('id') id: string, @Body('sprintId') sprintId: string | null) {
    return this.issuesService.moveToSprint(id, sprintId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete issue' })
  @ApiResponse({
    status: 200,
    description: 'Issue deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.issuesService.remove(id);
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update multiple issues' })
  @ApiResponse({
    status: 200,
    description: 'Issues updated successfully',
  })
  bulkUpdate(
    @Body() bulkUpdateDto: any, // Would import BulkUpdateIssuesDto
    @CurrentUser('userId') userId: string,
  ) {
    return this.issuesService.bulkUpdate(bulkUpdateDto, userId);
  }

  @Post(':parentIssueId/sub-tasks')
  @ApiOperation({ summary: 'Create a sub-task for an issue' })
  @ApiResponse({
    status: 201,
    description: 'Sub-task created successfully',
  })
  createSubTask(
    @Param('parentIssueId') parentIssueId: string,
    @Body() subTaskData: any,
    @CurrentUser('userId') userId: string,
  ) {
    return this.issuesService.createSubTask(parentIssueId, subTaskData, userId);
  }

  @Get(':issueId/sub-tasks')
  @ApiOperation({ summary: 'Get all sub-tasks for an issue' })
  @ApiResponse({
    status: 200,
    description: 'Sub-tasks retrieved successfully',
  })
  getSubTasks(@Param('issueId') issueId: string) {
    return this.issuesService.getSubTasks(issueId);
  }

  @Patch(':issueId/convert-to-subtask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert issue to sub-task' })
  @ApiResponse({
    status: 200,
    description: 'Issue converted to sub-task successfully',
  })
  convertToSubTask(
    @Param('issueId') issueId: string,
    @Body('parentIssueId') parentIssueId: string,
  ) {
    return this.issuesService.convertToSubTask(issueId, parentIssueId);
  }

  @Patch(':subTaskId/promote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promote sub-task to regular issue' })
  @ApiResponse({
    status: 200,
    description: 'Sub-task promoted successfully',
  })
  promoteToIssue(@Param('subTaskId') subTaskId: string) {
    return this.issuesService.promoteToIssue(subTaskId);
  }
}
