import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkLogsService } from './worklogs.service';
import { CreateWorkLogDto, UpdateWorkLogDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('work-logs')
@Controller('work-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkLogsController {
  constructor(private readonly workLogsService: WorkLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new work log entry' })
  @ApiResponse({
    status: 201,
    description: 'Work log created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Issue not found',
  })
  create(
    @Body() createWorkLogDto: CreateWorkLogDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.workLogsService.create(createWorkLogDto, userId);
  }

  @Get('issue/:issueId')
  @ApiOperation({ summary: 'Get all work logs for an issue' })
  @ApiResponse({
    status: 200,
    description: 'Work logs retrieved successfully',
  })
  findByIssue(@Param('issueId') issueId: string) {
    return this.workLogsService.findByIssue(issueId);
  }

  @Get('issue/:issueId/total-time')
  @ApiOperation({ summary: 'Calculate total time logged for an issue' })
  @ApiResponse({
    status: 200,
    description: 'Total time calculated successfully',
  })
  calculateTotalTime(@Param('issueId') issueId: string) {
    return this.workLogsService.calculateTotalTime(issueId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all work logs for a user' })
  @ApiQuery({
    name: 'issueId',
    required: false,
    description: 'Filter by issue ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Work logs retrieved successfully',
  })
  findByUser(
    @Param('userId') userId: string,
    @Query('issueId') issueId?: string,
  ) {
    return this.workLogsService.findByUser(userId, issueId);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get time statistics for a user' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (ISO 8601 format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (ISO 8601 format)',
  })
  @ApiResponse({
    status: 200,
    description: 'User time statistics retrieved successfully',
  })
  getUserTimeStats(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.workLogsService.getUserTimeStats(userId, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work log by ID' })
  @ApiResponse({
    status: 200,
    description: 'Work log found',
  })
  @ApiResponse({
    status: 404,
    description: 'Work log not found',
  })
  findOne(@Param('id') id: string) {
    return this.workLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update work log' })
  @ApiResponse({
    status: 200,
    description: 'Work log updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only edit your own work logs',
  })
  update(
    @Param('id') id: string,
    @Body() updateWorkLogDto: UpdateWorkLogDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.workLogsService.update(id, updateWorkLogDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete work log' })
  @ApiResponse({
    status: 200,
    description: 'Work log deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own work logs',
  })
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.workLogsService.remove(id, userId);
  }
}
