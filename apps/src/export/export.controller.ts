import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { ExportQueryDto, ExportFormat } from './dto';

@ApiTags('export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('issues')
  @ApiOperation({ summary: 'Export issues to CSV or Excel' })
  @ApiQuery({ name: 'format', enum: ExportFormat, required: true })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'sprintId', required: false })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async exportIssues(
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const { format, projectId, sprintId, startDate, endDate } = query;

    const buffer = await this.exportService.exportIssues(format, {
      projectId,
      sprintId,
      startDate,
      endDate,
    });

    const filename = `issues-${new Date().toISOString().split('T')[0]}`;
    const extension = format === ExportFormat.CSV ? 'csv' : 'xlsx';
    const mimeType =
      format === ExportFormat.CSV
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('sprints/:id')
  @ApiOperation({ summary: 'Export sprint report to CSV or Excel' })
  @ApiQuery({ name: 'format', enum: ExportFormat, required: true })
  async exportSprintReport(
    @Param('id') sprintId: string,
    @Query('format') format: ExportFormat,
    @Res() res: Response,
  ): Promise<void> {
    if (!format) {
      throw new BadRequestException('Format parameter is required');
    }

    const buffer = await this.exportService.exportSprintReport(
      sprintId,
      format,
    );

    const filename = `sprint-report-${sprintId}-${new Date().toISOString().split('T')[0]}`;
    const extension = format === ExportFormat.CSV ? 'csv' : 'xlsx';
    const mimeType =
      format === ExportFormat.CSV
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('work-logs')
  @ApiOperation({ summary: 'Export work logs to CSV or Excel' })
  @ApiQuery({ name: 'format', enum: ExportFormat, required: true })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async exportWorkLogs(
    @Query('format') format: ExportFormat,
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res: Response = undefined as any,
  ): Promise<void> {
    if (!format) {
      throw new BadRequestException('Format parameter is required');
    }

    const buffer = await this.exportService.exportWorkLogs(format, {
      projectId,
      userId,
      startDate,
      endDate,
    });

    const filename = `work-logs-${new Date().toISOString().split('T')[0]}`;
    const extension = format === ExportFormat.CSV ? 'csv' : 'xlsx';
    const mimeType =
      format === ExportFormat.CSV
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('user-activity/:userId')
  @ApiOperation({ summary: 'Export user activity report to CSV or Excel' })
  @ApiQuery({ name: 'format', enum: ExportFormat, required: true })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async exportUserActivity(
    @Param('userId') userId: string,
    @Query('format') format: ExportFormat,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res: Response = undefined as any,
  ): Promise<void> {
    if (!format) {
      throw new BadRequestException('Format parameter is required');
    }

    const buffer = await this.exportService.exportUserActivity(userId, format, {
      startDate,
      endDate,
    });

    const filename = `user-activity-${userId}-${new Date().toISOString().split('T')[0]}`;
    const extension = format === ExportFormat.CSV ? 'csv' : 'xlsx';
    const mimeType =
      format === ExportFormat.CSV
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
