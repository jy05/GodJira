import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiQuery({ name: 'entityType', required: false, example: 'Issue' })
  @ApiQuery({ name: 'entityId', required: false, example: 'uuid-123' })
  @ApiQuery({ name: 'issueId', required: false, example: 'uuid-456' })
  @ApiQuery({ name: 'userId', required: false, example: 'uuid-789' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('issueId') issueId?: string,
    @Query('userId') userId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.auditService.getAuditLogs({
      entityType,
      entityId,
      issueId,
      userId,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('activity-feed')
  @ApiOperation({ summary: 'Get recent activity feed' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, example: 'uuid-123' })
  @ApiResponse({
    status: 200,
    description: 'Activity feed retrieved successfully',
  })
  getActivityFeed(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('projectId') projectId?: string,
  ) {
    return this.auditService.getActivityFeed({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      projectId,
    });
  }
}
